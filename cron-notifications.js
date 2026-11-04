// Lance le rappel du soir depuis le terminal ou depuis le planificateur de tâches.
//
//   node cron-notifications.js                  mode défini par NOTIFY_MODE (simulation si la variable est absente)
//   node cron-notifications.js --dry-run        force la simulation : rien n'est envoyé ni enregistré
//   node cron-notifications.js --dry-run --at=2026-11-04T18:05:00Z
//                                               simule un instant précis (en UTC) pour tester les fuseaux :
//                                               18:05 UTC correspond à 19:05 à Paris en hiver
//
// Le détail par utilisateur n'affiche que les 8 premiers caractères de l'identifiant.
require('dotenv').config();
const mysql = require('mysql2/promise');
const { runEveningReminders } = require('./notifications-job');
const { createApnsClient } = require('./apns');

(async () => {
  const args = process.argv.slice(2);
  const forceDry = args.includes('--dry-run');
  const atArg = args.find((a) => a.startsWith('--at='));
  const now = atArg ? new Date(atArg.slice(5)) : new Date();
  if (Number.isNaN(now.getTime())) {
    console.error('Valeur --at invalide (exemple : --at=2026-11-04T18:05:00Z)');
    process.exit(2);
  }
  const mode = forceDry || process.env.NOTIFY_MODE !== 'live' ? 'dry_run' : 'live';

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 2,
    charset: 'utf8mb4',
    dateStrings: true,
  });
  const apns = createApnsClient();
  try {
    console.log(`Rappel du soir, mode ${mode}, instant ${now.toISOString()}`);
    const stats = await runEveningReminders({ pool, mode, apns, now, logger: console.log, verbose: true });
    console.log('Résultat :', JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error('Erreur :', e.message);
    process.exitCode = 1;
  } finally {
    apns.close();
    await pool.end();
  }
})();
