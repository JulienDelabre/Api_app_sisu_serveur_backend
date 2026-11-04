// Routes partenaires et admin : partenaires, commissions, virements, statistiques globales.
// Chargé depuis index.js : require('./partner-routes')(app, { ... })
//
// Règles d'accès :
//  - routes /api/partner/* : compte connecté, e-mail vérifié ET relié à un partenaire actif ;
//    le partenaire ne voit que SES lignes et jamais l'identité des utilisateurs parrainés.
//  - routes /api/admin/*   : rôle admin lu en base. Les admins voient les comptes, les partenaires,
//    l'argent et des statistiques agrégées, mais PAS le détail des données de santé ni les photos.
const crypto = require('crypto');

const STORES = ['apple', 'google', 'web', 'other'];
const EVENTS = ['purchase', 'renewal', 'refund'];
const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'cancelled'];
const PARTNER_STATUSES = ['active', 'suspended'];
const PAGE_SIZE = 50;
const DEFAULT_CURRENCY = 'EUR';

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra || {};
  }
}

module.exports = function registerPartnerRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, requireRole, limiter } = deps;
  const authed = [requireAuth, requireVerified];
  const adminOnly = [requireAuth, requireVerified, requireRole('admin')];

  // ---------- Outils ----------
  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return res.status(e.status).json({ error: e.message, ...e.extra });
      next(e);
    }
  };

  const num = (v) => (v === null || v === undefined ? null : Number(v));
  const isNum = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
  const cleanText = (s, max) =>
    typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
  const isoLocal = (s) => (s ? String(s).replace(' ', 'T') : null);
  const dupMessage = (e) => (e && e.code === 'ER_DUP_ENTRY' ? String(e.sqlMessage || e.message) : null);

  const isDateStr = (s) =>
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;

  // Accepte AAAA-MM-JJ ou AAAA-MM-JJTHH:mm[:ss] (heure locale, sans fuseau).
  function parseWhen(s) {
    if (typeof s !== 'string') return null;
    let full;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) full = s + 'T00:00:00';
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) full = s.length === 16 ? s + ':00' : s;
    else return null;
    const d = new Date(full + 'Z');
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 19) !== full) return null;
    return { ms: d.getTime(), sql: full.replace('T', ' ') };
  }

  function parseRange(req, defDays, maxDays) {
    let { from, to } = req.query;
    if ((to !== undefined && !isDateStr(to)) || (from !== undefined && !isDateStr(from))) {
      throw new HttpError(400, 'Dates invalides (format AAAA-MM-JJ)');
    }
    if (!to) to = new Date().toISOString().slice(0, 10);
    if (!from) from = new Date(Date.parse(to + 'T00:00:00Z') - (defDays - 1) * 86400000).toISOString().slice(0, 10);
    const days = (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000;
    if (days < 0 || days > maxDays) throw new HttpError(400, `Période invalide (${maxDays} jours maximum)`);
    return { from, to };
  }

  // Argent : calculs en centimes entiers, jamais en nombres à virgule.
  const toCents = (x) => Math.round(x * 100);
  const fromCents = (c) => (c / 100).toFixed(2);

  async function audit(adminId, action, targetType, targetId, details) {
    try {
      await pool.execute(
        'INSERT INTO admin_audit_log (id, admin_user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), adminId, action, targetType, targetId || null, details ? JSON.stringify(details).slice(0, 2000) : null]
      );
    } catch (e) {
      console.error("Journal d'audit impossible :", e.message);
    }
  }

  async function requirePartner(req, res, next) {
    try {
      const [rows] = await pool.execute("SELECT * FROM partners WHERE user_id = ? AND status = 'active'", [req.user.id]);
      if (!rows[0]) return res.status(403).json({ error: 'Accès refusé' });
      req.partner = rows[0];
      next();
    } catch (e) {
      next(e);
    }
  }

  // ---------- Totaux ----------
  // Gagné = en attente + validées + payées (les remboursements sont des lignes négatives).
  // En attente de virement = validées pas encore payées, qu'elles soient ou non dans un virement programmé.
  const TOTALS_COLUMNS = `
    COALESCE(SUM(CASE WHEN status IN ('pending','approved','paid') THEN commission_amount END), 0) AS earned,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount END), 0) AS paid,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN commission_amount END), 0) AS awaiting,
    COALESCE(SUM(CASE WHEN status = 'approved' AND payout_id IS NOT NULL THEN commission_amount END), 0) AS scheduled,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount END), 0) AS pending_review,
    COALESCE(SUM(CASE WHEN event_type = 'refund' AND status <> 'cancelled' THEN -commission_amount END), 0) AS refunded,
    COALESCE(SUM(CASE WHEN event_type IN ('purchase','renewal') AND status <> 'cancelled' THEN 1 END), 0) AS sales_count`;

  const mapTotals = (r) => ({
    earned: num(r.earned),
    paid: num(r.paid),
    awaitingPayout: num(r.awaiting),
    scheduledPayout: num(r.scheduled),
    pendingReview: num(r.pending_review),
    refunded: num(r.refunded),
    salesCount: Number(r.sales_count),
  });

  const EMPTY_TOTALS = { earned: 0, paid: 0, awaitingPayout: 0, scheduledPayout: 0, pendingReview: 0, refunded: 0, salesCount: 0 };

  // ---------- Mappers ----------
  const mapPartner = (r) => ({
    id: r.id,
    name: r.name,
    promoCode: r.promo_code,
    commissionRate: num(r.commission_rate),
    currency: r.currency,
    status: r.status,
  });
  const mapCommission = (r) => ({
    id: r.id,
    occurredAt: isoLocal(r.occurred_at),
    event: r.event_type,
    store: r.store,
    netAmount: num(r.net_amount),
    commissionRate: num(r.commission_rate),
    commissionAmount: num(r.commission_amount),
    currency: r.currency,
    status: r.status,
  });
  const mapPayout = (r) => ({
    id: r.id,
    amount: num(r.amount),
    currency: r.currency,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    status: r.status,
    paidAt: isoLocal(r.paid_at),
    reference: r.reference,
  });

  // =====================================================================
  // ESPACE PARTENAIRE
  // =====================================================================
  app.get('/api/partner/me', ...authed, requirePartner, wrap(async (req, res) => {
    res.json({ partner: mapPartner(req.partner) });
  }));

  app.get('/api/partner/stats', ...authed, requirePartner, wrap(async (req, res) => {
    const { from, to } = parseRange(req, 365, 1100);
    const [tot] = await pool.execute(`SELECT ${TOTALS_COLUMNS} FROM partner_commissions WHERE partner_id = ?`, [req.partner.id]);
    const [monthly] = await pool.execute(
      `SELECT DATE_FORMAT(occurred_at, '%Y-%m') AS month,
         COALESCE(SUM(CASE WHEN status IN ('pending','approved','paid') THEN commission_amount END), 0) AS earned,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount END), 0) AS paid,
         COALESCE(SUM(CASE WHEN event_type IN ('purchase','renewal') AND status <> 'cancelled' THEN 1 END), 0) AS sales
       FROM partner_commissions
       WHERE partner_id = ? AND occurred_at >= ? AND occurred_at < DATE_ADD(?, INTERVAL 1 DAY)
       GROUP BY DATE_FORMAT(occurred_at, '%Y-%m') ORDER BY month ASC`,
      [req.partner.id, from, to]
    );
    res.json({
      currency: req.partner.currency,
      totals: mapTotals(tot[0]), // cumulés depuis le début
      monthly: monthly.map((m) => ({ month: m.month, earned: num(m.earned), paid: num(m.paid), salesCount: Number(m.sales) })), // sur la période demandée
    });
  }));

  app.get('/api/partner/commissions', ...authed, requirePartner, wrap(async (req, res) => {
    const page = req.query.page === undefined ? 1 : parseInt(req.query.page, 10);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new HttpError(400, 'Page invalide');
    const { status, from, to } = req.query;
    if (status !== undefined && !COMMISSION_STATUSES.includes(status)) throw new HttpError(400, 'Statut invalide');
    if ((from !== undefined && !isDateStr(from)) || (to !== undefined && !isDateStr(to))) {
      throw new HttpError(400, 'Dates invalides (format AAAA-MM-JJ)');
    }
    const where = ['partner_id = ?'];
    const params = [req.partner.id];
    if (status) { where.push('status = ?'); params.push(status); }
    if (from) { where.push('occurred_at >= ?'); params.push(from); }
    if (to) { where.push('occurred_at < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(to); }
    const offset = (page - 1) * PAGE_SIZE;
    const [rows] = await pool.execute(
      `SELECT id, occurred_at, event_type, store, net_amount, commission_rate, commission_amount, currency, status
       FROM partner_commissions WHERE ${where.join(' AND ')}
       ORDER BY occurred_at DESC, id DESC LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}`,
      params
    );
    res.json({ items: rows.slice(0, PAGE_SIZE).map(mapCommission), page, hasMore: rows.length > PAGE_SIZE });
  }));

  app.get('/api/partner/payouts', ...authed, requirePartner, wrap(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT id, amount, currency, period_start, period_end, status, paid_at, reference FROM partner_payouts WHERE partner_id = ? ORDER BY created_at DESC LIMIT 200',
      [req.partner.id]
    );
    res.json({ payouts: rows.map(mapPayout) });
  }));

  // =====================================================================
  // ADMIN : partenaires
  // =====================================================================
  app.get('/api/admin/partners', ...adminOnly, wrap(async (req, res) => {
    const [partners] = await pool.execute(
      `SELECT p.id, p.name, p.promo_code, p.commission_rate, p.currency, p.status, p.created_at, u.email AS user_email
       FROM partners p LEFT JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 200`
    );
    const [tots] = await pool.execute(`SELECT partner_id, ${TOTALS_COLUMNS} FROM partner_commissions GROUP BY partner_id`);
    const byPartner = new Map(tots.map((t) => [t.partner_id, mapTotals(t)]));
    res.json({
      partners: partners.map((p) => ({
        ...mapPartner(p),
        userEmail: p.user_email || null,
        createdAt: isoLocal(p.created_at),
        totals: byPartner.get(p.id) || EMPTY_TOTALS,
      })),
    });
  }));

  app.post('/api/admin/partners', ...adminOnly, wrap(async (req, res) => {
    const b = req.body || {};
    const name = cleanText(b.name, 120);
    if (!name) throw new HttpError(400, 'Nom requis');
    const promoCode = String(b.promoCode || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,40}$/.test(promoCode)) {
      throw new HttpError(400, 'Code promo invalide (3 à 40 caractères : lettres, chiffres, tiret, souligné)');
    }
    if (!isNum(b.commissionRate, 0, 100)) throw new HttpError(400, 'Taux de commission invalide (0 à 100)');
    const rate = Math.round(b.commissionRate * 100) / 100;
    const currency = b.currency === undefined ? DEFAULT_CURRENCY : String(b.currency).toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new HttpError(400, 'Devise invalide');

    let userId = null;
    if (typeof b.userEmail === 'string' && b.userEmail.trim()) {
      const [u] = await pool.execute('SELECT id FROM users WHERE email = ?', [b.userEmail.trim().toLowerCase()]);
      if (!u[0]) throw new HttpError(404, 'Aucun compte avec cet e-mail');
      userId = u[0].id;
    }
    const id = crypto.randomUUID();
    try {
      await pool.execute(
        'INSERT INTO partners (id, user_id, name, promo_code, commission_rate, currency) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, name, promoCode, rate, currency]
      );
    } catch (e) {
      const d = dupMessage(e);
      if (d) {
        throw new HttpError(409, d.includes('promo_code') ? 'Code promo déjà utilisé' : 'Ce compte est déjà relié à un partenaire');
      }
      throw e;
    }
    await audit(req.user.id, 'partner.create', 'partner', id, { promoCode, rate, linked: !!userId });
    const [rows] = await pool.execute('SELECT * FROM partners WHERE id = ?', [id]);
    res.status(201).json({ partner: mapPartner(rows[0]) });
  }));

  app.patch('/api/admin/partners/:id', ...adminOnly, wrap(async (req, res) => {
    const b = req.body || {};
    const sets = [];
    const vals = [];
    const changes = {};
    if (b.name !== undefined) {
      const name = cleanText(b.name, 120);
      if (!name) throw new HttpError(400, 'Nom invalide');
      sets.push('name = ?'); vals.push(name); changes.name = true;
    }
    if (b.promoCode !== undefined) {
      const code = String(b.promoCode).trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new HttpError(400, 'Code promo invalide');
      sets.push('promo_code = ?'); vals.push(code); changes.promoCode = code;
    }
    if (b.commissionRate !== undefined) {
      if (!isNum(b.commissionRate, 0, 100)) throw new HttpError(400, 'Taux de commission invalide (0 à 100)');
      const rate = Math.round(b.commissionRate * 100) / 100;
      sets.push('commission_rate = ?'); vals.push(rate); changes.commissionRate = rate;
    }
    if (b.status !== undefined) {
      if (!PARTNER_STATUSES.includes(b.status)) throw new HttpError(400, 'Statut invalide');
      sets.push('status = ?'); vals.push(b.status); changes.status = b.status;
    }
    if (!sets.length) throw new HttpError(400, 'Rien à modifier');
    vals.push(req.params.id);
    let r;
    try {
      [r] = await pool.execute(`UPDATE partners SET ${sets.join(', ')} WHERE id = ?`, vals);
    } catch (e) {
      if (dupMessage(e)) throw new HttpError(409, 'Code promo déjà utilisé');
      throw e;
    }
    if (!r.affectedRows) throw new HttpError(404, 'Partenaire introuvable');
    await audit(req.user.id, 'partner.update', 'partner', req.params.id, changes);
    const [rows] = await pool.execute('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    res.json({ partner: mapPartner(rows[0]) }); // un changement de taux ne touche que les futures commissions
  }));

  // =====================================================================
  // ADMIN : commissions
  // =====================================================================
  app.post('/api/admin/partners/:id/commissions', ...adminOnly, wrap(async (req, res) => {
    const b = req.body || {};
    const [prow] = await pool.execute('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    const partner = prow[0];
    if (!partner) throw new HttpError(404, 'Partenaire introuvable');
    if (partner.status !== 'active') throw new HttpError(409, 'Partenaire suspendu');
    if (!STORES.includes(b.store)) throw new HttpError(400, 'Boutique invalide');
    if (!EVENTS.includes(b.event)) throw new HttpError(400, 'Type d’événement invalide');
    if (!isNum(b.netAmount, 0.01, 1000000)) throw new HttpError(400, 'Montant net invalide (positif, même pour un remboursement)');
    const when = parseWhen(b.occurredAt);
    if (!when) throw new HttpError(400, 'Date invalide (AAAA-MM-JJ ou AAAA-MM-JJTHH:mm)');
    if (when.ms > Date.now() + 15 * 3600 * 1000) throw new HttpError(400, 'Date dans le futur');
    let txId = null;
    if (b.storeTransactionId !== undefined && b.storeTransactionId !== null && b.storeTransactionId !== '') {
      if (typeof b.storeTransactionId !== 'string' || !/^[\w.:\-]{1,100}$/.test(b.storeTransactionId)) {
        throw new HttpError(400, 'Identifiant de transaction invalide');
      }
      txId = b.storeTransactionId;
    }
    const sign = b.event === 'refund' ? -1 : 1;
    const netCents = toCents(b.netAmount);
    const rateH = Math.round(Number(partner.commission_rate) * 100); // centièmes de pour cent
    const commCents = Math.round((netCents * rateH) / 10000);
    const id = crypto.randomUUID();
    try {
      await pool.execute(
        `INSERT INTO partner_commissions (id, partner_id, store, store_transaction_id, event_type, net_amount, commission_rate, commission_amount, currency, status, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [id, partner.id, b.store, txId, b.event, fromCents(sign * netCents), partner.commission_rate, fromCents(sign * commCents), partner.currency, when.sql]
      );
    } catch (e) {
      if (dupMessage(e)) throw new HttpError(409, 'Transaction déjà enregistrée');
      throw e;
    }
    await audit(req.user.id, 'commission.create', 'commission', id, { partnerId: partner.id, event: b.event, store: b.store, amount: fromCents(sign * commCents) });
    const [rows] = await pool.execute('SELECT * FROM partner_commissions WHERE id = ?', [id]);
    res.status(201).json({ commission: mapCommission(rows[0]) });
  }));

  app.patch('/api/admin/commissions/:id', ...adminOnly, wrap(async (req, res) => {
    const status = req.body && req.body.status;
    if (!['approved', 'cancelled'].includes(status)) throw new HttpError(400, 'Statut invalide (approved ou cancelled)');
    const [r] = await pool.execute(
      "UPDATE partner_commissions SET status = ? WHERE id = ? AND payout_id IS NULL AND status IN ('pending','approved')",
      [status, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM partner_commissions WHERE id = ?', [req.params.id]);
    if (!rows[0]) throw new HttpError(404, 'Commission introuvable');
    if (!r.affectedRows) throw new HttpError(409, 'Cette commission ne peut plus être modifiée (déjà dans un virement ou payée)');
    await audit(req.user.id, 'commission.status', 'commission', req.params.id, { status });
    res.json({ commission: mapCommission(rows[0]) });
  }));

  // =====================================================================
  // ADMIN : virements
  // =====================================================================
  app.post('/api/admin/partners/:id/payouts', ...adminOnly, wrap(async (req, res) => {
    const conn = await pool.getConnection();
    let payoutId;
    try {
      await conn.beginTransaction();
      // Le verrou sur le partenaire empêche deux virements simultanés sur les mêmes commissions.
      const [prow] = await conn.execute('SELECT id, currency FROM partners WHERE id = ? FOR UPDATE', [req.params.id]);
      if (!prow[0]) throw new HttpError(404, 'Partenaire introuvable');
      const [rows] = await conn.execute(
        "SELECT commission_amount, occurred_at, currency FROM partner_commissions WHERE partner_id = ? AND status = 'approved' AND payout_id IS NULL FOR UPDATE",
        [req.params.id]
      );
      if (!rows.length) throw new HttpError(409, 'Aucune commission validée à verser');
      if (rows.some((r) => r.currency !== prow[0].currency)) throw new HttpError(409, 'Devises mélangées : virement impossible');
      let cents = 0;
      for (const r of rows) cents += toCents(Number(r.commission_amount));
      if (cents <= 0) throw new HttpError(409, 'Le montant à verser est nul ou négatif');
      const days = rows.map((r) => String(r.occurred_at).slice(0, 10)).sort();
      payoutId = crypto.randomUUID();
      await conn.execute(
        'INSERT INTO partner_payouts (id, partner_id, amount, currency, period_start, period_end) VALUES (?, ?, ?, ?, ?, ?)',
        [payoutId, req.params.id, fromCents(cents), prow[0].currency, days[0], days[days.length - 1]]
      );
      await conn.execute(
        "UPDATE partner_commissions SET payout_id = ? WHERE partner_id = ? AND status = 'approved' AND payout_id IS NULL",
        [payoutId, req.params.id]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    await audit(req.user.id, 'payout.create', 'payout', payoutId, { partnerId: req.params.id });
    const [rows] = await pool.execute('SELECT * FROM partner_payouts WHERE id = ?', [payoutId]);
    res.status(201).json({ payout: mapPayout(rows[0]) });
  }));

  app.patch('/api/admin/payouts/:id', ...adminOnly, wrap(async (req, res) => {
    const b = req.body || {};
    if (!['paid', 'failed'].includes(b.status)) throw new HttpError(400, 'Statut invalide (paid ou failed)');
    let reference = null;
    if (b.reference !== undefined && b.reference !== null) {
      reference = cleanText(b.reference, 100);
      if (!reference) throw new HttpError(400, 'Référence invalide');
    }
    let paidAt = null;
    if (b.paidAt !== undefined && b.paidAt !== null) {
      const w = parseWhen(b.paidAt);
      if (!w || w.ms > Date.now() + 15 * 3600 * 1000) throw new HttpError(400, 'Date de paiement invalide');
      paidAt = w.sql;
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [found] = await conn.execute('SELECT id FROM partner_payouts WHERE id = ? FOR UPDATE', [req.params.id]);
      if (!found[0]) throw new HttpError(404, 'Virement introuvable');
      const [r] = await conn.execute(
        `UPDATE partner_payouts
         SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(?, NOW()) ELSE NULL END, reference = COALESCE(?, reference)
         WHERE id = ? AND status = 'scheduled'`,
        [b.status, b.status, paidAt, reference, req.params.id]
      );
      if (!r.affectedRows) throw new HttpError(409, 'Ce virement n’est plus modifiable');
      if (b.status === 'paid') {
        await conn.execute("UPDATE partner_commissions SET status = 'paid' WHERE payout_id = ?", [req.params.id]);
      } else {
        // Virement échoué : les commissions redeviennent disponibles pour un nouveau virement.
        await conn.execute('UPDATE partner_commissions SET payout_id = NULL WHERE payout_id = ?', [req.params.id]);
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    await audit(req.user.id, 'payout.update', 'payout', req.params.id, { status: b.status });
    const [rows] = await pool.execute('SELECT * FROM partner_payouts WHERE id = ?', [req.params.id]);
    res.json({ payout: mapPayout(rows[0]) });
  }));

  // =====================================================================
  // ADMIN : statistiques globales (agrégées, aucune donnée de santé)
  // =====================================================================
  app.get('/api/admin/stats', ...adminOnly, wrap(async (req, res) => {
    const [u] = await pool.execute(
      `SELECT COUNT(*) AS total, COALESCE(SUM(role = 'free'), 0) AS free_count, COALESCE(SUM(role = 'subscriber'), 0) AS subscriber_count,
              COALESCE(SUM(role = 'admin'), 0) AS admin_count, COALESCE(SUM(status = 'blocked'), 0) AS blocked,
              COALESCE(SUM(email_verified_at IS NOT NULL), 0) AS verified FROM users`
    );
    const [p] = await pool.execute("SELECT COUNT(*) AS total, COALESCE(SUM(status = 'active'), 0) AS active FROM partners");
    const [c] = await pool.execute(`SELECT ${TOTALS_COLUMNS} FROM partner_commissions`);
    const [pay] = await pool.execute(
      `SELECT COALESCE(SUM(CASE WHEN status = 'scheduled' THEN amount END), 0) AS scheduled_amount,
              COALESCE(SUM(CASE WHEN status = 'scheduled' THEN 1 END), 0) AS scheduled_count,
              COALESCE(SUM(CASE WHEN status = 'paid' THEN amount END), 0) AS paid_amount FROM partner_payouts`
    );
    const [ai] = await pool.execute('SELECT COALESCE(SUM(calls), 0) AS calls FROM ai_usage WHERE usage_date = CURDATE()');
    res.json({
      users: {
        total: Number(u[0].total),
        free: Number(u[0].free_count),
        subscriber: Number(u[0].subscriber_count),
        admin: Number(u[0].admin_count),
        blocked: Number(u[0].blocked),
        emailVerified: Number(u[0].verified),
      },
      partners: { total: Number(p[0].total), active: Number(p[0].active) },
      commissions: mapTotals(c[0]), // en devise par défaut (EUR)
      payouts: {
        scheduledCount: Number(pay[0].scheduled_count),
        scheduledAmount: num(pay[0].scheduled_amount),
        paidAmount: num(pay[0].paid_amount),
      },
      aiCallsToday: Number(ai[0].calls),
    });
  }));
};
