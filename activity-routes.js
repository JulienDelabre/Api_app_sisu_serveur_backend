// Lot 2 (1/2) : activité quotidienne (pas, distance, calories actives).
// Chargé depuis index.js : require('./activity-routes')(app, { ... })
//
// Le serveur ne lit pas Apple Santé : l'app lit les totaux sur le téléphone et les envoie.
// Une ligne par compte et par jour ; la dernière valeur envoyée remplace la précédente.
const {
  addDays, parseYmd, toYmd, isDateStr, dayDiffFromToday, periodSql, defaultFrom, DAY,
} = require('./dates-util');

const SOURCES = ['apple_health', 'apple_watch', 'manual'];
const GRANULARITIES = ['week', 'month', 'year'];
const MAX_BATCH_DAYS = 31;
const MAX_BACKDATE_DAYS = 400;

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra || {};
  }
}

module.exports = function registerActivityRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, limiter } = deps;
  const verified = [requireAuth, requireVerified];

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return res.status(e.status).json({ error: e.message, ...e.extra });
      next(e);
    }
  };
  const num = (v) => (v === null || v === undefined ? null : Number(v));
  const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

  const needConsent = (type) => async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM user_consents WHERE user_id = ? AND consent_type = ? AND withdrawn_at IS NULL LIMIT 1',
        [req.user.id, type]
      );
      if (!rows[0]) return res.status(403).json({ error: 'Consentement requis', code: 'CONSENT_REQUIRED', consent: type });
      next();
    } catch (e) {
      next(e);
    }
  };

  // Valide un jour d'activité envoyé par l'app.
  function normDay(d, label) {
    const where = label ? ` (${label})` : '';
    if (typeof d !== 'object' || d === null) throw new HttpError(400, `Jour invalide${where}`);
    if (!isDateStr(d.date)) throw new HttpError(400, `Date invalide${where} (format AAAA-MM-JJ)`);
    const diff = dayDiffFromToday(d.date);
    if (diff > 1) throw new HttpError(400, `Date dans le futur${where}`);
    if (diff < -MAX_BACKDATE_DAYS) throw new HttpError(400, `Date trop ancienne${where}`);
    const out = { date: d.date, steps: null, distanceM: null, activeKcal: null, source: 'apple_health' };
    if (d.steps !== undefined && d.steps !== null) {
      if (!isInt(d.steps, 0, 200000)) throw new HttpError(400, `Nombre de pas invalide${where}`);
      out.steps = d.steps;
    }
    if (d.distanceM !== undefined && d.distanceM !== null) {
      if (!isInt(Math.round(d.distanceM), 0, 500000)) throw new HttpError(400, `Distance invalide${where}`);
      out.distanceM = Math.round(d.distanceM);
    }
    if (d.activeKcal !== undefined && d.activeKcal !== null) {
      if (!isInt(Math.round(d.activeKcal), 0, 20000)) throw new HttpError(400, `Calories invalides${where}`);
      out.activeKcal = Math.round(d.activeKcal);
    }
    if (d.source !== undefined) {
      if (!SOURCES.includes(d.source)) throw new HttpError(400, `Source invalide${where}`);
      out.source = d.source;
    }
    if (out.steps === null && out.distanceM === null && out.activeKcal === null) {
      throw new HttpError(400, `Indiquez au moins une valeur${where}`);
    }
    return out;
  }

  const UPSERT_SQL = `INSERT INTO daily_activity (user_id, activity_on, steps, distance_m, active_kcal, source)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE steps = COALESCE(VALUES(steps), steps), distance_m = COALESCE(VALUES(distance_m), distance_m),
      active_kcal = COALESCE(VALUES(active_kcal), active_kcal), source = VALUES(source)`;

  const mapActivity = (r) => ({
    date: r.activity_on,
    steps: num(r.steps),
    distanceM: num(r.distance_m),
    activeKcal: num(r.active_kcal),
    source: r.source,
  });

  // Marque la dernière synchronisation de la connexion Apple correspondante, si elle est activée.
  async function touchSync(executor, userId, sources) {
    for (const source of new Set(sources)) {
      if (source === 'manual') continue;
      await executor.execute(
        'UPDATE health_integrations SET last_sync_at = NOW() WHERE user_id = ? AND provider = ? AND enabled = 1',
        [userId, source]
      );
    }
  }

  // =====================================================================
  // Envoi de l'activité
  // =====================================================================
  app.put('/api/activity/daily', limiter(60 * 1000, 60), ...verified, needConsent('health_data'), wrap(async (req, res) => {
    const d = normDay(req.body);
    await pool.execute(UPSERT_SQL, [req.user.id, d.date, d.steps, d.distanceM, d.activeKcal, d.source]);
    await touchSync(pool, req.user.id, [d.source]);
    const [rows] = await pool.execute('SELECT * FROM daily_activity WHERE user_id = ? AND activity_on = ?', [req.user.id, d.date]);
    res.json({ activity: mapActivity(rows[0]) });
  }));

  app.put('/api/activity/daily/batch', limiter(60 * 1000, 20), ...verified, needConsent('health_data'), wrap(async (req, res) => {
    const days = req.body && req.body.days;
    if (!Array.isArray(days) || days.length === 0) throw new HttpError(400, 'days doit être une liste non vide');
    if (days.length > MAX_BATCH_DAYS) throw new HttpError(400, `${MAX_BATCH_DAYS} jours maximum par envoi`);
    const list = days.map((d, i) => normDay(d, `jour ${i + 1}`));
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const d of list) {
        await conn.execute(UPSERT_SQL, [req.user.id, d.date, d.steps, d.distanceM, d.activeKcal, d.source]);
      }
      await touchSync(conn, req.user.id, list.map((d) => d.source));
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    res.json({ saved: list.length });
  }));

  // =====================================================================
  // Pas du jour, historique et moyenne de la semaine
  // =====================================================================
  app.get('/api/activity/steps', ...verified, wrap(async (req, res) => {
    let { from, to } = req.query;
    if ((to !== undefined && !isDateStr(to)) || (from !== undefined && !isDateStr(from))) {
      throw new HttpError(400, 'Dates invalides (format AAAA-MM-JJ)');
    }
    if (!to) to = toYmd(Date.now());
    if (!from) from = addDays(to, -13); // 14 derniers jours par défaut
    const span = (parseYmd(to) - parseYmd(from)) / DAY;
    if (span < 0 || span > 365) throw new HttpError(400, 'Période invalide (366 jours maximum)');

    const [rows] = await pool.execute(
      'SELECT * FROM daily_activity WHERE user_id = ? AND activity_on BETWEEN ? AND ? ORDER BY activity_on ASC',
      [req.user.id, from, to]
    );
    const byDate = new Map(rows.map((r) => [r.activity_on, mapActivity(r)]));
    // Tous les jours de la période sont renvoyés, vides si aucune donnée : les graphiques n'ont pas de trou.
    const days = [];
    for (let i = 0; i <= span; i++) {
      const date = addDays(from, i);
      days.push(byDate.get(date) || { date, steps: null, distanceM: null, activeKcal: null, source: null });
    }

    // Moyenne des 7 jours qui se terminent à `to`, sur les jours qui ont des données.
    const [avg] = await pool.execute(
      `SELECT AVG(steps) AS steps, AVG(distance_m) AS distance_m, AVG(active_kcal) AS active_kcal, COUNT(*) AS days
       FROM daily_activity WHERE user_id = ? AND activity_on BETWEEN ? AND ?`,
      [req.user.id, addDays(to, -6), to]
    );
    const a = avg[0];
    const r0 = (v) => (v === null || v === undefined ? null : Math.round(Number(v)));

    const [prof] = await pool.execute('SELECT daily_steps_goal FROM user_profiles WHERE user_id = ?', [req.user.id]);
    res.json({
      goal: prof[0] ? num(prof[0].daily_steps_goal) : null,
      days,
      weekAverage: { steps: r0(a.steps), distanceM: r0(a.distance_m), activeKcal: r0(a.active_kcal), days: Number(a.days) },
    });
  }));

  // =====================================================================
  // Moyennes par semaine, mois ou année
  // =====================================================================
  app.get('/api/activity/averages', ...verified, wrap(async (req, res) => {
    const granularity = req.query.granularity;
    if (!GRANULARITIES.includes(granularity)) throw new HttpError(400, 'granularity doit valoir week, month ou year');
    let { from, to } = req.query;
    if ((to !== undefined && !isDateStr(to)) || (from !== undefined && !isDateStr(from))) {
      throw new HttpError(400, 'Dates invalides (format AAAA-MM-JJ)');
    }
    if (!to) to = toYmd(Date.now());
    if (!from) from = defaultFrom(to, granularity);
    const span = (parseYmd(to) - parseYmd(from)) / DAY;
    if (span < 0 || span > 1900) throw new HttpError(400, 'Période invalide');

    const key = periodSql(granularity, 'activity_on');
    const [rows] = await pool.execute(
      `SELECT ${key} AS period, AVG(steps) AS steps, AVG(distance_m) AS distance_m, AVG(active_kcal) AS active_kcal, COUNT(*) AS days
       FROM daily_activity WHERE user_id = ? AND activity_on BETWEEN ? AND ?
       GROUP BY ${key} ORDER BY period ASC`,
      [req.user.id, from, to]
    );
    const r0 = (v) => (v === null || v === undefined ? null : Math.round(Number(v)));
    res.json({
      granularity,
      periods: rows.map((r) => ({
        period: r.period,
        avgSteps: r0(r.steps),
        avgDistanceM: r0(r.distance_m),
        avgActiveKcal: r0(r.active_kcal),
        daysCount: Number(r.days),
      })),
    });
  }));
};
