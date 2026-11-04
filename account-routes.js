// Lot 1 : compte, notifications, appareils, connexions Apple Santé / Apple Watch.
// Chargé depuis index.js : require('./account-routes')(app, { ... })
//
// Toutes les routes lisent l'identifiant de l'utilisateur dans le jeton (req.user.id), jamais dans la requête.
// Les routes /api/account/... n'exigent pas un e-mail vérifié : un utilisateur qui s'est trompé
// d'adresse doit pouvoir la corriger.
const bcrypt = require('bcryptjs');

const RESERVED_USERNAMES = ['admin', 'administrateur', 'administrator', 'support', 'moderateur', 'moderator', 'root', 'sisu'];
const PROVIDERS = ['apple_health', 'apple_watch'];
const MAX_DEVICES_PER_USER = 10;

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra || {};
  }
}

module.exports = function registerAccountRoutes(app, deps) {
  const {
    pool, requireAuth, requireVerified, limiter, signAccess, issueRefresh,
    createAndSendCode, checkCode, sendInfoMail, normEmail, validEmail, validPassword, sendCodeRefusal,
  } = deps;
  const verified = [requireAuth, requireVerified];

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return res.status(e.status).json({ error: e.message, ...e.extra });
      next(e);
    }
  };
  const iso = (s) => (s ? String(s).replace(' ', 'T') : null);

  async function getAccount(userId) {
    const [rows] = await pool.execute(
      `SELECT u.email, u.username, u.phone, u.role, u.email_verified_at, u.created_at, p.new_email
       FROM users u LEFT JOIN pending_email_changes p ON p.user_id = u.id WHERE u.id = ?`,
      [userId]
    );
    const r = rows[0];
    if (!r) throw new HttpError(404, 'Compte introuvable');
    return {
      username: r.username,
      email: r.email,
      emailVerified: !!r.email_verified_at,
      phone: r.phone,
      pendingEmail: r.new_email || null,
      role: r.role,
      createdAt: iso(r.created_at),
    };
  }

  async function checkPassword(userId, password) {
    const pw = typeof password === 'string' ? password.slice(0, 200) : '';
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    return !!rows[0] && (await bcrypt.compare(pw, rows[0].password_hash));
  }

  async function hasConsent(userId, type) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM user_consents WHERE user_id = ? AND consent_type = ? AND withdrawn_at IS NULL LIMIT 1',
      [userId, type]
    );
    return !!rows[0];
  }

  // =====================================================================
  // MON COMPTE
  // =====================================================================
  app.get('/api/account', requireAuth, wrap(async (req, res) => {
    res.json({ account: await getAccount(req.user.id) });
  }));

  app.patch('/api/account', requireAuth, limiter(15 * 60 * 1000, 30), wrap(async (req, res) => {
    const b = req.body || {};
    const sets = [];
    const vals = [];

    if (b.username !== undefined) {
      if (b.username === null || b.username === '') {
        sets.push('username = NULL');
      } else {
        const u = typeof b.username === 'string' ? b.username.trim() : '';
        if (!/^[A-Za-z0-9._-]{3,30}$/.test(u)) {
          throw new HttpError(400, 'Pseudo invalide (3 à 30 caractères : lettres, chiffres, point, tiret, souligné)');
        }
        if (RESERVED_USERNAMES.includes(u.toLowerCase())) throw new HttpError(400, 'Ce pseudo est réservé');
        sets.push('username = ?');
        vals.push(u);
      }
    }
    if (b.phone !== undefined) {
      if (b.phone === null || b.phone === '') {
        sets.push('phone = NULL');
      } else {
        const p = typeof b.phone === 'string' ? b.phone.replace(/[\s.\-()]/g, '') : '';
        if (!/^\+[1-9]\d{6,14}$/.test(p)) {
          throw new HttpError(400, 'Téléphone invalide (format international, par exemple +33612345678)');
        }
        sets.push('phone = ?');
        vals.push(p);
      }
    }
    if (!sets.length) throw new HttpError(400, 'Rien à modifier');
    vals.push(req.user.id);
    try {
      await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Ce pseudo est déjà pris', { code: 'USERNAME_TAKEN' });
      throw e;
    }
    res.json({ account: await getAccount(req.user.id) });
  }));

  // --- Changement d'adresse e-mail : un code est envoyé à la NOUVELLE adresse ---
  app.post('/api/account/email', requireAuth, limiter(60 * 60 * 1000, 10), wrap(async (req, res) => {
    const newEmail = normEmail(req.body && req.body.newEmail);
    if (!validEmail(newEmail)) throw new HttpError(400, 'Adresse e-mail invalide');
    if (!(await checkPassword(req.user.id, req.body && req.body.currentPassword))) {
      throw new HttpError(401, 'Mot de passe incorrect');
    }
    if (newEmail === req.user.email) throw new HttpError(400, 'C’est déjà votre adresse actuelle');
    const [taken] = await pool.execute('SELECT 1 FROM users WHERE email = ?', [newEmail]);
    if (taken[0]) throw new HttpError(409, 'Cette adresse n’est pas disponible');

    // Le code part vers la NOUVELLE adresse. Le changement n'est enregistré qu'une fois le code bien envoyé :
    // une demande refusée (délai d'une minute) ne modifie donc pas l'adresse en attente.
    let r;
    try {
      r = await createAndSendCode({ id: req.user.id, email: newEmail }, 'email_change');
    } catch (e) {
      console.error('Envoi du code impossible :', e.message);
      throw new HttpError(502, 'Envoi du code impossible, réessayez dans un instant', { code: 'MAIL_FAILED' });
    }
    if (!r.ok) {
      res.set('Retry-After', String(r.retryAfterSec));
      const cooldown = r.reason === 'cooldown';
      throw new HttpError(
        429,
        cooldown
          ? `Un code vient d’être envoyé, patientez ${r.retryAfterSec} s avant d’en demander un autre`
          : 'Trop de demandes, réessayez dans une heure',
        { code: cooldown ? 'RESEND_COOLDOWN' : 'RESEND_LIMIT', retryAfterSec: r.retryAfterSec }
      );
    }
    await pool.execute(
      `INSERT INTO pending_email_changes (user_id, new_email) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE new_email = VALUES(new_email), requested_at = NOW()`,
      [req.user.id, newEmail]
    );
    res.json({ ok: true, pendingEmail: newEmail, cooldownSec: 60 });
  }));

  app.post('/api/account/email/confirm', requireAuth, limiter(15 * 60 * 1000, 20), wrap(async (req, res) => {
    const [pending] = await pool.execute('SELECT new_email FROM pending_email_changes WHERE user_id = ?', [req.user.id]);
    if (!pending[0]) throw new HttpError(400, 'Aucun changement d’adresse en attente');
    if (!(await checkCode(req.user.id, 'email_change', req.body && req.body.code))) {
      throw new HttpError(400, 'Code invalide ou expiré');
    }
    const newEmail = pending[0].new_email;
    const oldEmail = req.user.email;
    try {
      await pool.execute('UPDATE users SET email = ?, email_verified_at = NOW() WHERE id = ?', [newEmail, req.user.id]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Cette adresse n’est pas disponible');
      throw e;
    }
    await pool.execute('DELETE FROM pending_email_changes WHERE user_id = ?', [req.user.id]);
    // Prévient l'ancienne adresse : si ce n'est pas l'utilisateur qui a fait la demande, il le saura.
    sendInfoMail(
      oldEmail,
      'votre adresse e-mail a été modifiée',
      'L’adresse e-mail de votre compte vient d’être remplacée. ' +
        'Si vous n’êtes pas à l’origine de ce changement, contactez-nous immédiatement.'
    ).catch((e) => console.error('Mail d’information impossible :', e.message));
    res.json({ ok: true, email: newEmail });
  }));

  // --- Changement de mot de passe : actuel + deux fois le nouveau ---
  app.post('/api/account/password', requireAuth, limiter(15 * 60 * 1000, 10), wrap(async (req, res) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword !== newPasswordConfirm) {
      throw new HttpError(400, 'Les deux nouveaux mots de passe sont différents');
    }
    if (!validPassword(newPassword)) throw new HttpError(400, 'Mot de passe trop court (10 caractères minimum)');
    if (!(await checkPassword(req.user.id, currentPassword))) throw new HttpError(401, 'Mot de passe actuel incorrect');
    if (newPassword === currentPassword) throw new HttpError(400, 'Le nouveau mot de passe doit être différent de l’actuel');

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    // Toutes les sessions sont coupées ; l'appareil en cours reçoit une nouvelle paire de jetons.
    await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [req.user.id]);
    const refreshToken = await issueRefresh(req.user.id);
    sendInfoMail(
      req.user.email,
      'votre mot de passe a été modifié',
      'Le mot de passe de votre compte vient d’être modifié. ' +
        'Si vous n’êtes pas à l’origine de ce changement, réinitialisez-le immédiatement et contactez-nous.'
    ).catch((e) => console.error('Mail d’information impossible :', e.message));
    res.json({ accessToken: signAccess(req.user.id), refreshToken });
  }));

  // =====================================================================
  // NOTIFICATIONS (désactivées par défaut)
  // =====================================================================
  const DEFAULT_NOTIF = {
    timezone: 'Europe/Paris',
    weekly_review_enabled: 0,
    weekly_review_day: 7,
    daily_coaching_enabled: 0,
    daily_coaching_count: 2,
    community_enabled: 0,
  };
  const mapNotif = (r) => ({
    timezone: r.timezone,
    weeklyReview: { enabled: !!r.weekly_review_enabled, day: Number(r.weekly_review_day) },
    dailyCoaching: { enabled: !!r.daily_coaching_enabled, perDay: Number(r.daily_coaching_count) },
    community: { enabled: !!r.community_enabled },
  });
  async function loadNotif(userId) {
    const [rows] = await pool.execute('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);
    return rows[0] ? { ...rows[0] } : { ...DEFAULT_NOTIF };
  }
  const validTimezone = (tz) => {
    if (typeof tz !== 'string' || tz.length > 64 || !/^[A-Za-z0-9_+\-/]+$/.test(tz)) return false;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch (e) {
      return false;
    }
  };

  app.get('/api/notifications/settings', ...verified, wrap(async (req, res) => {
    res.json({ settings: mapNotif(await loadNotif(req.user.id)) });
  }));

  app.put('/api/notifications/settings', ...verified, wrap(async (req, res) => {
    const b = req.body || {};
    const n = await loadNotif(req.user.id);
    const group = (v, name) => {
      if (v === undefined) return null;
      if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new HttpError(400, `${name} invalide`);
      if (v.enabled !== undefined && typeof v.enabled !== 'boolean') throw new HttpError(400, `${name} : enabled doit être vrai ou faux`);
      return v;
    };

    if (b.timezone !== undefined) {
      if (!validTimezone(b.timezone)) throw new HttpError(400, 'Fuseau horaire invalide (exemple : Europe/Paris)');
      n.timezone = b.timezone;
    }
    const w = group(b.weeklyReview, 'weeklyReview');
    if (w) {
      if (w.enabled !== undefined) n.weekly_review_enabled = w.enabled ? 1 : 0;
      if (w.day !== undefined) {
        if (!Number.isInteger(w.day) || w.day < 1 || w.day > 7) throw new HttpError(400, 'Jour invalide (1 = lundi ... 7 = dimanche)');
        n.weekly_review_day = w.day;
      }
    }
    const d = group(b.dailyCoaching, 'dailyCoaching');
    if (d) {
      if (d.enabled !== undefined) n.daily_coaching_enabled = d.enabled ? 1 : 0;
      if (d.perDay !== undefined) {
        if (!Number.isInteger(d.perDay) || d.perDay < 2 || d.perDay > 3) throw new HttpError(400, 'perDay doit valoir 2 ou 3');
        n.daily_coaching_count = d.perDay;
      }
    }
    const c = group(b.community, 'community');
    if (c && c.enabled !== undefined) n.community_enabled = c.enabled ? 1 : 0;

    await pool.execute(
      `INSERT INTO notification_settings (user_id, timezone, weekly_review_enabled, weekly_review_day,
         daily_coaching_enabled, daily_coaching_count, community_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE timezone = VALUES(timezone), weekly_review_enabled = VALUES(weekly_review_enabled),
         weekly_review_day = VALUES(weekly_review_day), daily_coaching_enabled = VALUES(daily_coaching_enabled),
         daily_coaching_count = VALUES(daily_coaching_count), community_enabled = VALUES(community_enabled)`,
      [req.user.id, n.timezone, n.weekly_review_enabled, n.weekly_review_day, n.daily_coaching_enabled, n.daily_coaching_count, n.community_enabled]
    );
    res.json({ settings: mapNotif(n) });
  }));

  // --- Appareils qui reçoivent les notifications ---
  app.post('/api/devices', ...verified, limiter(60 * 1000, 20), wrap(async (req, res) => {
    const { token } = req.body || {};
    const platform = (req.body && req.body.platform) === undefined ? 'ios' : req.body.platform;
    if (typeof token !== 'string' || !/^[A-Za-z0-9:_\-.=]{20,255}$/.test(token)) throw new HttpError(400, 'Jeton d’appareil invalide');
    if (!['ios', 'android'].includes(platform)) throw new HttpError(400, 'Plateforme invalide');
    // Si l'appareil change de compte, le jeton est simplement rattaché au compte actuel.
    await pool.execute(
      `INSERT INTO push_devices (id, user_id, platform, token) VALUES (UUID(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), platform = VALUES(platform), last_seen_at = NOW()`,
      [req.user.id, platform, token]
    );
    // On ne garde que les appareils les plus récents.
    await pool.execute(
      `DELETE FROM push_devices WHERE user_id = ? AND id NOT IN (
         SELECT id FROM (SELECT id FROM push_devices WHERE user_id = ? ORDER BY last_seen_at DESC LIMIT ${MAX_DEVICES_PER_USER}) keep
       )`,
      [req.user.id, req.user.id]
    );
    res.json({ ok: true });
  }));

  app.post('/api/devices/unregister', ...verified, wrap(async (req, res) => {
    const token = req.body && req.body.token;
    if (typeof token !== 'string' || !token) throw new HttpError(400, 'Jeton d’appareil invalide');
    await pool.execute('DELETE FROM push_devices WHERE user_id = ? AND token = ?', [req.user.id, token]);
    res.json({ ok: true });
  }));

  // =====================================================================
  // APPLE SANTÉ / APPLE WATCH
  // =====================================================================
  const mapIntegration = (provider, r) => ({
    provider,
    enabled: r ? !!r.enabled : false,
    connectedAt: r ? iso(r.connected_at) : null,
    lastSyncAt: r ? iso(r.last_sync_at) : null,
  });

  app.get('/api/integrations', ...verified, wrap(async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM health_integrations WHERE user_id = ?', [req.user.id]);
    const byProvider = new Map(rows.map((r) => [r.provider, r]));
    res.json({ integrations: PROVIDERS.map((p) => mapIntegration(p, byProvider.get(p))) });
  }));

  app.put('/api/integrations/:provider', ...verified, wrap(async (req, res) => {
    const provider = req.params.provider;
    if (!PROVIDERS.includes(provider)) throw new HttpError(404, 'Connexion inconnue');
    const enabled = req.body && req.body.enabled;
    if (typeof enabled !== 'boolean') throw new HttpError(400, 'enabled doit être vrai ou faux');
    if (enabled) {
      if (!(await hasConsent(req.user.id, 'health_data'))) {
        throw new HttpError(403, 'Consentement requis', { code: 'CONSENT_REQUIRED', consent: 'health_data' });
      }
      await pool.execute(
        `INSERT INTO health_integrations (user_id, provider, enabled, connected_at) VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE enabled = 1, connected_at = NOW(), disconnected_at = NULL`,
        [req.user.id, provider]
      );
    } else {
      await pool.execute(
        `INSERT INTO health_integrations (user_id, provider, enabled, disconnected_at) VALUES (?, ?, 0, NOW())
         ON DUPLICATE KEY UPDATE enabled = 0, disconnected_at = NOW()`,
        [req.user.id, provider]
      );
    }
    const [rows] = await pool.execute('SELECT * FROM health_integrations WHERE user_id = ? AND provider = ?', [req.user.id, provider]);
    res.json({ integration: mapIntegration(provider, rows[0]) });
  }));
};
