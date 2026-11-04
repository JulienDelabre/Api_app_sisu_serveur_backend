// Route appelée par le planificateur de tâches d'Infomaniak toutes les 15 minutes :
//   GET /internal/cron/evening-reminders?key=VOTRE_CRON_SECRET
//
// Elle n'existe que si CRON_SECRET est défini dans le .env (sinon : 404). La clé est comparée sans fuite
// d'information, la route est limitée en débit, et un seul passage peut tourner à la fois.
// Elle ne renvoie que des compteurs, jamais d'identifiant d'utilisateur.
const crypto = require('crypto');
const { runEveningReminders } = require('./notifications-job');
const { createApnsClient } = require('./apns');

module.exports = function registerCronRoutes(app, { pool, limiter }) {
  let running = false;

  const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

  app.get('/internal/cron/evening-reminders', limiter(60 * 1000, 10), async (req, res, next) => {
    try {
      const secret = process.env.CRON_SECRET;
      if (!secret) return res.status(404).json({ error: 'Introuvable' });
      const given = typeof req.query.key === 'string' ? req.query.key : '';
      if (!crypto.timingSafeEqual(sha(given), sha(secret))) return res.status(401).json({ error: 'Non autorisé' });
      if (running) return res.status(409).json({ error: 'Un passage est déjà en cours' });

      running = true;
      const apns = createApnsClient();
      try {
        const mode = process.env.NOTIFY_MODE === 'live' ? 'live' : 'dry_run';
        const stats = await runEveningReminders({ pool, mode, apns });
        res.json({ ok: true, ...stats });
      } finally {
        apns.close();
        running = false;
      }
    } catch (e) {
      console.error('Rappel du soir en erreur :', e.message);
      next(e);
    }
  });
};
