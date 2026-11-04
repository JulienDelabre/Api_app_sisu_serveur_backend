// Rappel du soir : à 19h (heure locale de chaque utilisateur), une notification est envoyée à ceux qui
//   - ont activé le « coaching quotidien » dans leurs réglages de notifications,
//   - n'ont fait AUCUNE séance de sport aujourd'hui ET n'ont enregistré AUCUN repas aujourd'hui,
//   - ont donné leur consentement aux données de santé et ont au moins un iPhone enregistré.
// Un seul rappel par utilisateur et par jour (journal notification_log).
//
// La tâche est appelée toutes les 15 minutes. Un utilisateur est notifié dès le premier passage entre
// 19h00 et 20h59 (heure locale) : si un passage est manqué, le suivant rattrape, mais plus rien après 21h.
//
// Deux modes :
//   dry_run  (défaut) : rien n'est envoyé ni enregistré, on compte et on décrit seulement ce qui serait fait ;
//   live              : envoi réel via Apple (APNs), demande une configuration APNs complète.
const crypto = require('crypto');

const EVENING_HOUR = 19;
const WINDOW_MINUTES = 120;
const TYPE = 'evening_reminder';
const APP_NAME = process.env.APP_NAME || 'Mon application';

// Textes neutres : aucune donnée de santé ne doit apparaître sur l'écran verrouillé.
// Le texte du jour est choisi selon la date, pour varier d'un jour à l'autre.
const MESSAGES = [
  'Pas encore de séance ni de repas enregistré aujourd’hui. Un petit point avant la fin de journée ?',
  'Votre journée n’est pas terminée : une séance ou un repas à noter ?',
  'Un instant pour votre suivi du jour ? Séance, repas : cela prend une minute.',
];

const formatters = new Map();
function formatterFor(tz) {
  if (!formatters.has(tz)) {
    formatters.set(
      tz,
      new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      })
    );
  }
  return formatters.get(tz);
}

// Date et heure locales d'un fuseau à un instant donné.
function localParts(tz, date) {
  const p = Object.fromEntries(formatterFor(tz).formatToParts(date).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, minute: Number(p.minute) };
}

function inEveningWindow(parts) {
  const minutes = parts.hour * 60 + parts.minute;
  return minutes >= EVENING_HOUR * 60 && minutes < EVENING_HOUR * 60 + WINDOW_MINUTES;
}

const messageFor = (ymd) => MESSAGES[Number(ymd.replace(/-/g, '')) % MESSAGES.length];

async function runEveningReminders({ pool, mode = 'dry_run', apns, now = new Date(), logger = () => {}, verbose = false }) {
  if (mode === 'live' && !(apns && apns.configured)) {
    throw new Error('Envoi réel demandé mais APNs n’est pas configuré (voir les variables APNS_...)');
  }
  const stats = { mode, candidates: 0, inWindow: 0, sent: 0, wouldSend: 0, failedDevices: 0, removedDevices: 0, skipped: {} };
  const skip = (reason, tag) => {
    stats.skipped[reason] = (stats.skipped[reason] || 0) + 1;
    if (verbose) logger(`  ${tag}  ignoré : ${reason}`);
  };

  const [rows] = await pool.execute(
    `SELECT n.user_id, n.timezone
     FROM notification_settings n JOIN users u ON u.id = n.user_id
     WHERE n.daily_coaching_enabled = 1 AND u.status = 'active' AND u.email_verified_at IS NOT NULL`
  );
  stats.candidates = rows.length;

  for (const r of rows) {
    let parts;
    try {
      parts = localParts(r.timezone, now);
    } catch (e) {
      stats.skipped['fuseau invalide'] = (stats.skipped['fuseau invalide'] || 0) + 1;
      continue;
    }
    if (!inEveningWindow(parts)) continue; // pas l'heure pour cet utilisateur : rien à noter
    stats.inWindow++;
    const tag = String(r.user_id).slice(0, 8);
    const uid = r.user_id;
    const day = parts.ymd;

    const [already] = await pool.execute('SELECT 1 FROM notification_log WHERE user_id = ? AND type = ? AND local_date = ? LIMIT 1', [uid, TYPE, day]);
    if (already[0]) { skip('déjà notifié aujourd’hui', tag); continue; }

    const [consent] = await pool.execute(
      "SELECT 1 FROM user_consents WHERE user_id = ? AND consent_type = 'health_data' AND withdrawn_at IS NULL LIMIT 1", [uid]);
    if (!consent[0]) { skip('consentement santé absent', tag); continue; }

    const [sess] = await pool.execute("SELECT 1 FROM workout_sessions WHERE user_id = ? AND status = 'done' AND done_on = ? LIMIT 1", [uid, day]);
    if (sess[0]) { skip('séance déjà faite aujourd’hui', tag); continue; }

    const [meal] = await pool.execute('SELECT 1 FROM meal_logs WHERE user_id = ? AND eaten_on = ? LIMIT 1', [uid, day]);
    if (meal[0]) { skip('repas déjà enregistré aujourd’hui', tag); continue; }

    const [devices] = await pool.execute("SELECT token FROM push_devices WHERE user_id = ? AND platform = 'ios'", [uid]);
    if (!devices.length) { skip('aucun iPhone enregistré', tag); continue; }

    if (mode !== 'live') {
      stats.wouldSend++;
      if (verbose) logger(`  ${tag}  ENVERRAIT (heure locale ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}, ${devices.length} appareil(s)) : « ${messageFor(day)} »`);
      continue;
    }

    // Réservation atomique du rappel du jour : un seul passage peut envoyer.
    const claimId = crypto.randomUUID();
    try {
      await pool.execute("INSERT INTO notification_log (id, user_id, type, local_date, status) VALUES (?, ?, ?, ?, 'pending')", [claimId, uid, TYPE, day]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') { skip('déjà notifié aujourd’hui', tag); continue; }
      throw e;
    }
    const payload = { aps: { alert: { title: APP_NAME, body: messageFor(day) }, sound: 'default' }, type: TYPE };
    let accepted = 0;
    for (const d of devices) {
      const res = await apns.send(d.token, payload);
      if (res.ok) accepted++;
      else {
        stats.failedDevices++;
        if (verbose) logger(`  ${tag}  appareil refusé : statut ${res.status} ${res.reason || ''}`);
        if (res.unregister) {
          await pool.execute('DELETE FROM push_devices WHERE token = ? AND user_id = ?', [d.token, uid]);
          stats.removedDevices++;
        }
      }
    }
    if (accepted > 0) {
      await pool.execute("UPDATE notification_log SET status = 'sent', detail = ? WHERE id = ?", [`${accepted}/${devices.length} appareil(s)`, claimId]);
      stats.sent++;
    } else {
      // Aucun appareil n'a accepté : on libère le créneau pour que le passage suivant puisse réessayer.
      await pool.execute('DELETE FROM notification_log WHERE id = ?', [claimId]);
      skip('envoi échoué, nouvel essai au prochain passage', tag);
    }
  }

  // Le journal n'est conservé que 90 jours.
  if (mode === 'live') await pool.execute('DELETE FROM notification_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)');
  return stats;
}

module.exports = { runEveningReminders, localParts, inEveningWindow, messageFor, MESSAGES };
