// Données d'interface SISU non encore couvertes par les tables métier dédiées.
module.exports = function registerAppStateRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, limiter } = deps;
  const allowedKeys = new Set([
    'profile_preferences',
    'weight_mood',
    'progress_photos',
    'workout_progress',
    'workout_meta',
    'community_posts',
    'challenge_memberships',
    'food_logs',
    'skincare_routines',
    'skincare_history',
    'skincare_dates',
    'skincare_notes',
    'skincare_types',
    'mind_actions',
    'mind_journal',
    'mind_dates',
    'mind_notes',
    'mind_types',
    'tracked_sessions',
    'recommendations',
    'recommendation_offsets'
  ]);

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

  app.get('/api/public/stats', limiter(60 * 1000, 60), wrap(async (_req, res) => {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users WHERE status = 'active' AND email_verified_at IS NOT NULL`
    );
    res.json({ registeredUsersCount: Number(rows[0]?.total || 0) });
  }));

  app.get('/api/app-state', requireAuth, requireVerified, wrap(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT state_key, state_value FROM user_app_state WHERE user_id = ?',
      [req.user.id]
    );
    const state = {};
    for (const row of rows) {
      try {
        state[row.state_key] = typeof row.state_value === 'string' ? JSON.parse(row.state_value) : row.state_value;
      } catch {
        state[row.state_key] = null;
      }
    }
    res.json({ state });
  }));

  app.put('/api/app-state/:key', requireAuth, requireVerified, limiter(60 * 1000, 120), wrap(async (req, res) => {
    const key = req.params.key;
    if (!allowedKeys.has(key)) return res.status(404).json({ error: 'Donnée inconnue' });
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'value')) {
      return res.status(400).json({ error: 'value est requis' });
    }
    let encoded;
    try {
      encoded = JSON.stringify(req.body.value);
    } catch {
      return res.status(400).json({ error: 'Donnée invalide' });
    }
    if (typeof encoded !== 'string' || encoded.length > 8 * 1024 * 1024) {
      return res.status(413).json({ error: 'Donnée trop volumineuse' });
    }
    await pool.execute(
      `INSERT INTO user_app_state (user_id, state_key, state_value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE state_value = VALUES(state_value), updated_at = NOW()`,
      [req.user.id, key, encoded]
    );
    res.json({ ok: true, key, updatedAt: new Date().toISOString() });
  }));

  app.delete('/api/app-state/:key', requireAuth, requireVerified, limiter(60 * 1000, 120), wrap(async (req, res) => {
    const key = req.params.key;
    if (!allowedKeys.has(key)) return res.status(404).json({ error: 'Donnée inconnue' });
    await pool.execute('DELETE FROM user_app_state WHERE user_id = ? AND state_key = ?', [req.user.id, key]);
    res.json({ ok: true });
  }));
};
