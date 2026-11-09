const crypto = require('crypto');

const TYPES = new Set(['progress', 'current', 'inspiration']);
const MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PHOTO_BYTES = 1024 * 1024;
const MAX_TOTAL_BYTES = 5 * 1024 * 1024;

module.exports = function registerProgressPhotoRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, limiter } = deps;
  const verified = [requireAuth, requireVerified];

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
  const cleanLabel = (value) => typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
    : null;

  const mapPhoto = (row) => {
    const mimeType = row.mime_type;
    return {
      id: row.id,
      type: row.photo_type,
      label: row.label || undefined,
      createdAt: new Date(row.created_at).toISOString().slice(0, 10),
      dataUrl: `data:${mimeType};base64,${Buffer.from(row.image).toString('base64')}`,
    };
  };

  app.get('/api/progress/photos', ...verified, wrap(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT id, photo_type, label, mime_type, image, created_at FROM user_progress_photos WHERE user_id = ? ORDER BY created_at DESC, id DESC',
      [req.user.id]
    );
    res.set('Cache-Control', 'private, no-store');
    res.json({ photos: rows.map(mapPhoto) });
  }));

  app.post('/api/progress/photos', limiter(60 * 1000, 30), ...verified, wrap(async (req, res) => {
    const body = req.body || {};
    if (!TYPES.has(body.type)) return res.status(400).json({ error: 'Type de photo invalide' });
    const match = typeof body.dataUrl === 'string'
      ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(body.dataUrl)
      : null;
    if (!match || !MIME_TYPES.has(match[1])) return res.status(400).json({ error: 'Image invalide' });
    const image = Buffer.from(match[2], 'base64');
    if (!image.length || image.length > MAX_PHOTO_BYTES ||
        image.toString('base64').replace(/=+$/, '') !== match[2].replace(/=+$/, '')) {
      return res.status(413).json({ error: 'Photo trop volumineuse ou invalide (1 Mo maximum)' });
    }

    const [totals] = await pool.execute(
      'SELECT COUNT(*) AS photo_count, COALESCE(SUM(OCTET_LENGTH(image)), 0) AS total_bytes FROM user_progress_photos WHERE user_id = ?',
      [req.user.id]
    );
    if (Number(totals[0].photo_count) >= 50 || Number(totals[0].total_bytes) + image.length > MAX_TOTAL_BYTES) {
      return res.status(413).json({ error: 'Espace photo maximal atteint. Supprimez une photo avant d’en ajouter.' });
    }

    const id = crypto.randomUUID();
    const label = cleanLabel(body.label);
    await pool.execute(
      'INSERT INTO user_progress_photos (id, user_id, photo_type, label, mime_type, image) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, body.type, label || null, match[1], image]
    );
    const [rows] = await pool.execute(
      'SELECT id, photo_type, label, mime_type, image, created_at FROM user_progress_photos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.set('Cache-Control', 'private, no-store');
    res.status(201).json({ photo: mapPhoto(rows[0]) });
  }));

  app.delete('/api/progress/photos', ...verified, wrap(async (req, res) => {
    await pool.execute('DELETE FROM user_progress_photos WHERE user_id = ?', [req.user.id]);
    res.json({ ok: true });
  }));

  app.delete('/api/progress/photos/:id', ...verified, wrap(async (req, res) => {
    const [result] = await pool.execute(
      'DELETE FROM user_progress_photos WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Photo introuvable' });
    res.json({ ok: true });
  }));
};
