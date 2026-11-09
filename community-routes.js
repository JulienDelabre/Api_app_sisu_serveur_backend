const crypto = require('crypto');

const CATEGORIES = new Set(['sport', 'food', 'skincare', 'mind']);
const REACTIONS = new Set(['heart', 'muscle', 'rocket']);

module.exports = function registerCommunityRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, limiter } = deps;
  const verified = [requireAuth, requireVerified];

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
  const cleanText = (value, max) =>
    typeof value === 'string'
      ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
      : '';

  async function listPosts(userId) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.user_id, u.username, p.category, p.content, p.compiled_data, p.created_at
       FROM community_posts p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC, p.id DESC LIMIT 100`
    );
    const ids = rows.map((row) => row.id);
    const reactions = new Map();
    if (ids.length) {
      const [counts] = await pool.execute(
        `SELECT post_id, reaction, COUNT(*) AS total,
                SUM(CASE WHEN user_id = ? THEN 1 ELSE 0 END) AS mine
         FROM community_post_reactions WHERE post_id IN (${ids.map(() => '?').join(',')})
         GROUP BY post_id, reaction`,
        [userId, ...ids]
      );
      for (const row of counts) {
        if (!reactions.has(row.post_id)) reactions.set(row.post_id, { heart: 0, muscle: 0, rocket: 0, userReacted: {} });
        const item = reactions.get(row.post_id);
        item[row.reaction] = Number(row.total);
        item.userReacted[row.reaction] = Number(row.mine) > 0;
      }
    }
    return rows.map((row) => {
      let compiledData = row.compiled_data;
      if (typeof compiledData === 'string') {
        try { compiledData = JSON.parse(compiledData); } catch { compiledData = {}; }
      }
      return {
        id: row.id,
        authorId: row.user_id,
        authorName: row.username || 'Membre SISU',
        authorAvatar: '',
        category: row.category,
        timeAgo: String(row.created_at),
        createdAt: String(row.created_at).replace(' ', 'T'),
        content: row.content || undefined,
        compiledData,
        reactions: reactions.get(row.id) || { heart: 0, muscle: 0, rocket: 0, userReacted: {} },
        badge: 'Performance partagée'
      };
    });
  }

  app.get('/api/community/posts', ...verified, wrap(async (req, res) => {
    res.json({ posts: await listPosts(req.user.id) });
  }));

  app.post('/api/community/posts', limiter(60 * 60 * 1000, 10), ...verified, wrap(async (req, res) => {
    const body = req.body || {};
    if (!CATEGORIES.has(body.category)) return res.status(400).json({ error: 'Rubrique invalide' });
    const compiled = body.compiledData;
    const allowedTypes = new Set(['workout', 'steps', 'weight', 'nutrition', 'skincare', 'mind']);
    if (!compiled || typeof compiled !== 'object' || !allowedTypes.has(compiled.type)) {
      return res.status(400).json({ error: 'Données partagées invalides' });
    }
    const content = cleanText(body.content, 1000);
    const [todayRows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM community_posts WHERE user_id = ? AND created_at >= CURDATE()',
      [req.user.id]
    );
    if (Number(todayRows[0].total) >= 2) return res.status(429).json({ error: 'Limite de deux publications par jour atteinte' });
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO community_posts (id, user_id, category, content, compiled_data) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, body.category, content, JSON.stringify(compiled)]
    );
    res.status(201).json({ posts: await listPosts(req.user.id), createdId: id });
  }));

  app.delete('/api/community/posts/:id', ...verified, wrap(async (req, res) => {
    const [result] = await pool.execute(
      'DELETE FROM community_posts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Publication introuvable' });
    res.json({ ok: true });
  }));

  app.put('/api/community/posts/:id/reactions', limiter(60 * 1000, 120), ...verified, wrap(async (req, res) => {
    const reaction = req.body && req.body.reaction;
    if (!REACTIONS.has(reaction)) return res.status(400).json({ error: 'Réaction invalide' });
    const [post] = await pool.execute('SELECT id FROM community_posts WHERE id = ?', [req.params.id]);
    if (!post[0]) return res.status(404).json({ error: 'Publication introuvable' });
    const [existing] = await pool.execute(
      'SELECT 1 FROM community_post_reactions WHERE post_id = ? AND user_id = ? AND reaction = ?',
      [req.params.id, req.user.id, reaction]
    );
    if (existing[0]) {
      await pool.execute(
        'DELETE FROM community_post_reactions WHERE post_id = ? AND user_id = ? AND reaction = ?',
        [req.params.id, req.user.id, reaction]
      );
    } else {
      await pool.execute(
        'INSERT INTO community_post_reactions (post_id, user_id, reaction) VALUES (?, ?, ?)',
        [req.params.id, req.user.id, reaction]
      );
    }
    res.json({ posts: await listPosts(req.user.id) });
  }));

  app.get('/api/community/challenges', ...verified, wrap(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT c.id, c.title, c.subtitle, c.category, c.duration_days, c.target_value, c.unit,
              (m.user_id IS NOT NULL) AS joined,
              (SELECT COUNT(*) FROM community_challenge_memberships x WHERE x.challenge_id = c.id) AS participants_count
       FROM community_challenges c
       LEFT JOIN community_challenge_memberships m ON m.challenge_id = c.id AND m.user_id = ?
       WHERE c.active = 1 ORDER BY FIELD(c.category, 'sport','food','skincare','mind'), c.id`,
      [req.user.id]
    );
    res.json({
      challenges: rows.map((row) => ({
        id: row.id, title: row.title, subtitle: row.subtitle, category: row.category,
        durationDays: Number(row.duration_days), targetValue: Number(row.target_value), unit: row.unit,
        joined: !!row.joined, participantsCount: Number(row.participants_count)
      }))
    });
  }));

  app.post('/api/community/challenges/:id/join', limiter(60 * 1000, 30), ...verified, wrap(async (req, res) => {
    const [rows] = await pool.execute('SELECT id FROM community_challenges WHERE id = ? AND active = 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Défi introuvable' });
    await pool.execute(
      'INSERT IGNORE INTO community_challenge_memberships (user_id, challenge_id) VALUES (?, ?)',
      [req.user.id, req.params.id]
    );
    res.json({ ok: true });
  }));

  app.delete('/api/community/challenges/:id/join', ...verified, wrap(async (req, res) => {
    await pool.execute(
      'DELETE FROM community_challenge_memberships WHERE user_id = ? AND challenge_id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ ok: true });
  }));
};
