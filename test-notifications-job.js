// Test du rappel du soir avec une base simulée (aucune base ni connexion réseau nécessaire).
//   node test-notifications-job.js
const { runEveningReminders } = require('./notifications-job');
let fails = 0;
const check = (n, ok, d) => { console.log(ok ? 'OK    ' : 'ÉCHEC ', n, d || ''); if (!ok) fails++; };

const state = { settings: [], consents: new Set(), sessions: [], meals: [], devices: [], log: [] };
const addUser = (id, o = {}) => {
  state.settings.push({ user_id: id, timezone: o.tz || 'Europe/Paris', coaching: o.coaching !== false, active: o.active !== false, verified: o.verified !== false });
  if (o.consent !== false) state.consents.add(id);
  if (o.device !== false) state.devices.push({ user_id: id, token: 'tok-' + id, platform: 'ios' });
  if (o.session) state.sessions.push({ user_id: id, done_on: o.session });
  if (o.meal) state.meals.push({ user_id: id, eaten_on: o.meal });
};
const pool = {
  async execute(sql, p = []) {
    const q = sql.replace(/\s+/g, ' ').trim();
    if (q.includes('FROM notification_settings n JOIN users u')) return [state.settings.filter((s) => s.coaching && s.active && s.verified).map((s) => ({ user_id: s.user_id, timezone: s.timezone }))];
    if (q.startsWith('SELECT 1 FROM notification_log')) return [state.log.filter((l) => l.user_id === p[0] && l.type === p[1] && l.local_date === p[2]).map(() => ({ 1: 1 }))];
    if (q.includes('FROM user_consents')) return [state.consents.has(p[0]) ? [{ 1: 1 }] : []];
    if (q.includes('FROM workout_sessions')) return [state.sessions.filter((s) => s.user_id === p[0] && s.done_on === p[1]).map(() => ({ 1: 1 }))];
    if (q.includes('FROM meal_logs')) return [state.meals.filter((m) => m.user_id === p[0] && m.eaten_on === p[1]).map(() => ({ 1: 1 }))];
    if (q.startsWith('SELECT token FROM push_devices')) return [state.devices.filter((d) => d.user_id === p[0] && d.platform === 'ios').map((d) => ({ token: d.token }))];
    if (q.startsWith('INSERT INTO notification_log')) {
      const [id, user_id, type, local_date] = p;
      if (state.log.some((l) => l.user_id === user_id && l.type === type && l.local_date === local_date)) { const e = new Error('dup'); e.code = 'ER_DUP_ENTRY'; throw e; }
      state.log.push({ id, user_id, type, local_date, status: 'pending' }); return [{}];
    }
    if (q.startsWith('UPDATE notification_log SET status')) { const l = state.log.find((x) => x.id === p[1]); l.status = 'sent'; l.detail = p[0]; return [{}]; }
    if (q.startsWith('DELETE FROM notification_log WHERE id')) { state.log = state.log.filter((l) => l.id !== p[0]); return [{}]; }
    if (q.startsWith('DELETE FROM notification_log WHERE created_at')) return [{}];
    if (q.startsWith('DELETE FROM push_devices')) { state.devices = state.devices.filter((d) => !(d.token === p[0] && d.user_id === p[1])); return [{}]; }
    throw new Error('requête non prévue : ' + q);
  },
};
const sentTo = []; let apnsMode = 'ok';
const apns = { configured: true, async send(token, payload) {
  sentTo.push({ token, payload });
  if (apnsMode === 'ok') return { ok: true, status: 200 };
  if (apnsMode === 'gone') return { ok: false, status: 410, reason: 'Unregistered', unregister: true };
  return { ok: false, status: 503, reason: 'ServiceUnavailable', unregister: false };
} };

const DAY = '2026-11-04';
const at = (iso) => new Date(iso);
const T1905 = at('2026-11-04T18:05:00Z'); // 19:05 à Paris (heure d'hiver)

(async () => {
  addUser('u-rien');
  addUser('u-seance', { session: DAY });
  addUser('u-repas', { meal: DAY });
  addUser('u-sans-device', { device: false });
  addUser('u-sans-consent', { consent: false });
  addUser('u-coaching-off', { coaching: false });
  addUser('u-non-verifie', { verified: false });
  addUser('u-bloque', { active: false });
  addUser('u-newyork', { tz: 'America/New_York' });
  addUser('u-tokyo', { tz: 'Asia/Tokyo' });
  addUser('u-hier', { session: '2026-11-03' });
  addUser('u-tz-invalide', { tz: 'Mars/Phobos' });

  let s = await runEveningReminders({ pool, mode: 'dry_run', apns, now: T1905 });
  check('simulation : 2 utilisateurs seraient notifiés (u-rien, u-hier)', s.wouldSend === 2, JSON.stringify(s));
  check('simulation : aucun envoi, aucun enregistrement', sentTo.length === 0 && s.sent === 0 && state.log.length === 0);

  s = await runEveningReminders({ pool, mode: 'live', apns, now: T1905 });
  check('réel : 2 notifications envoyées', s.sent === 2 && sentTo.length === 2, JSON.stringify(s));
  check('réel : u-rien et u-hier ciblés', sentTo.map((x) => x.token).sort().join() === 'tok-u-hier,tok-u-rien');
  check('réel : texte neutre et type du rappel', sentTo[0].payload.type === 'evening_reminder' && /séance|repas|suivi/i.test(sentTo[0].payload.aps.alert.body));
  check('réel : 2 lignes dans le journal', state.log.length === 2 && state.log.every((l) => l.status === 'sent'));
  check('raisons d’exclusion comptées', s.skipped['séance déjà faite aujourd’hui'] === 1 && s.skipped['repas déjà enregistré aujourd’hui'] === 1 && s.skipped['aucun iPhone enregistré'] === 1 && s.skipped['consentement santé absent'] === 1, JSON.stringify(s.skipped));
  check('New York (13h05) et Tokyo (3h05) hors horaire : 6 utilisateurs dans la fenêtre', s.inWindow === 6, 'inWindow=' + s.inWindow);
  check('utilisateurs sans coaching, non vérifiés ou bloqués jamais candidats', s.candidates === 9, 'candidats=' + s.candidates);
  check('fuseau invalide ignoré sans planter', s.skipped['fuseau invalide'] === 1);

  s = await runEveningReminders({ pool, mode: 'live', apns, now: at('2026-11-04T18:20:00Z') });
  check('15 min plus tard : aucun doublon', s.sent === 0 && sentTo.length === 2, JSON.stringify(s.skipped));

  state.log = []; sentTo.length = 0;
  await Promise.all([runEveningReminders({ pool, mode: 'live', apns, now: T1905 }), runEveningReminders({ pool, mode: 'live', apns, now: T1905 })]);
  check('deux passages simultanés : un seul rappel par utilisateur', sentTo.length === 2, `${sentTo.length} envois`);

  state.log = []; sentTo.length = 0;
  s = await runEveningReminders({ pool, mode: 'live', apns, now: at('2026-11-04T19:30:00Z') });
  check('20h30 à Paris : rattrapage d’un passage manqué', s.sent === 2);
  state.log = []; sentTo.length = 0;
  s = await runEveningReminders({ pool, mode: 'live', apns, now: at('2026-11-04T20:05:00Z') });
  check('21h05 à Paris : plus rien n’est envoyé', s.sent === 0 && sentTo.length === 0);

  state.log = []; sentTo.length = 0;
  await runEveningReminders({ pool, mode: 'live', apns, now: T1905 });
  const before = sentTo.length; // 2
  await runEveningReminders({ pool, mode: 'live', apns, now: at('2026-11-05T18:05:00Z') });
  // Le 5 novembre, u-rien, u-hier, u-seance et u-repas (activité seulement le 4) n'ont rien fait : 4 rappels
  check('le lendemain : nouveau rappel pour ceux qui n’ont rien fait ce jour-là', sentTo.length - before === 4, `${sentTo.length - before} envois`);

  state.log = []; sentTo.length = 0; apnsMode = 'gone';
  s = await runEveningReminders({ pool, mode: 'live', apns, now: T1905 });
  check('Apple répond 410 : jetons supprimés', s.removedDevices === 2 && !state.devices.some((d) => d.user_id === 'u-rien'));
  check('Apple répond 410 : créneau libéré, rien marqué envoyé', state.log.length === 0 && s.sent === 0);

  state.devices.push({ user_id: 'u-rien', token: 'tok-u-rien', platform: 'ios' }, { user_id: 'u-hier', token: 'tok-u-hier', platform: 'ios' });
  state.log = []; sentTo.length = 0; apnsMode = 'down';
  s = await runEveningReminders({ pool, mode: 'live', apns, now: T1905 });
  check('Apple répond 503 : jetons conservés', s.removedDevices === 0 && state.devices.some((d) => d.user_id === 'u-rien'));
  check('Apple répond 503 : créneau libéré pour réessayer', state.log.length === 0 && s.sent === 0);
  apnsMode = 'ok';
  s = await runEveningReminders({ pool, mode: 'live', apns, now: at('2026-11-04T18:20:00Z') });
  check('retour à la normale : envoyé au passage suivant', s.sent === 2);

  let threw = false;
  try { await runEveningReminders({ pool, mode: 'live', apns: { configured: false }, now: T1905 }); } catch (e) { threw = /APNs/.test(e.message); }
  check('mode réel sans APNs configuré : refus explicite', threw);
  console.log(fails ? `\n${fails} ÉCHEC(S)` : '\nTous les tests passent.');
  process.exit(fails ? 1 : 0);
})();
