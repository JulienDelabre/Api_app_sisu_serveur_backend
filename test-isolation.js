// Test d'isolation des comptes. À lancer avec des COMPTES DE TEST uniquement (Node 18 ou plus).
//
// Variables à fournir :
//   A_EMAIL, A_PASSWORD           compte utilisateur normal, e-mail vérifié (obligatoire)
//   B_EMAIL, B_PASSWORD           second compte utilisateur normal, e-mail vérifié (facultatif)
//   ADMIN_EMAIL, ADMIN_PASSWORD   compte administrateur (facultatif)
//   API                           adresse de l'API (défaut : https://api.appsisu.com)
//
// Le test écrit puis supprime une mesure de poids à la date du 2001-01-01 sur chaque compte.
// Aucun jeton ni mot de passe n'est affiché.

const API = (process.env.API || 'https://api.appsisu.com').replace(/\/$/, '');
const TEST_DATE = '2001-01-01';
const UUID = '00000000-0000-4000-8000-000000000000';

const accounts = {
  A: { email: process.env.A_EMAIL, password: process.env.A_PASSWORD },
  B: { email: process.env.B_EMAIL, password: process.env.B_PASSWORD },
  ADMIN: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
};

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'OK    ' : 'ÉCHEC '} ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) failures++;
}
const skip = (name, why) => console.log(`SAUTÉ  ${name}  (${why})`);

async function call(method, path, opts = {}) {
  const headers = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  let body;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  const res = await fetch(API + path, { method, headers, body });
  let json = null;
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    json = await res.json().catch(() => null);
  }
  return { status: res.status, json };
}

async function login(label) {
  const a = accounts[label];
  const r = await call('POST', '/api/auth/login', { body: { email: a.email, password: a.password } });
  if (r.status !== 200) throw new Error(`Connexion impossible pour ${label} (statut ${r.status})`);
  return r.json.accessToken;
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

// Toutes les routes qui doivent exiger une connexion.
const PROTECTED = [
  ['GET', '/api/me'],
  ['POST', '/api/me/delete'],
  ['POST', '/api/auth/send-verification'],
  ['POST', '/api/auth/verify-email'],
  ['GET', '/api/profile'],
  ['PUT', '/api/profile'],
  ['GET', '/api/consents'],
  ['POST', '/api/consents'],
  ['POST', '/api/consents/withdraw'],
  ['PUT', '/api/measurements'],
  ['GET', '/api/measurements'],
  ['DELETE', `/api/measurements/${TEST_DATE}`],
  ['POST', '/api/meals/analyze'],
  ['GET', '/api/meals'],
  ['GET', '/api/meals/summary'],
  ['PATCH', `/api/meals/${UUID}`],
  ['DELETE', `/api/meals/${UUID}`],
  ['PUT', '/api/body/photo'],
  ['GET', '/api/body'],
  ['GET', '/api/body/photo'],
  ['DELETE', '/api/body'],
  ['PUT', '/api/goal/photo'],
  ['GET', '/api/goal'],
  ['GET', '/api/goal/photo'],
  ['DELETE', '/api/goal'],
  ['POST', '/api/llm'],
  ['GET', '/api/admin/users'],
  ['PATCH', `/api/admin/users/${UUID}`],
  ['GET', '/api/partner/me'],
  ['GET', '/api/partner/stats'],
  ['GET', '/api/partner/commissions'],
  ['GET', '/api/partner/payouts'],
  ['GET', '/api/admin/partners'],
  ['POST', '/api/admin/partners'],
  ['PATCH', `/api/admin/partners/${UUID}`],
  ['POST', `/api/admin/partners/${UUID}/commissions`],
  ['PATCH', `/api/admin/commissions/${UUID}`],
  ['POST', `/api/admin/partners/${UUID}/payouts`],
  ['PATCH', `/api/admin/payouts/${UUID}`],
  ['GET', '/api/admin/stats'],
  ['GET', '/api/account'],
  ['PATCH', '/api/account'],
  ['POST', '/api/account/email'],
  ['POST', '/api/account/email/confirm'],
  ['POST', '/api/account/password'],
  ['GET', '/api/notifications/settings'],
  ['PUT', '/api/notifications/settings'],
  ['POST', '/api/devices'],
  ['POST', '/api/devices/unregister'],
  ['GET', '/api/integrations'],
  ['PUT', '/api/integrations/apple_health'],
  ['PUT', '/api/activity/daily'],
  ['PUT', '/api/activity/daily/batch'],
  ['GET', '/api/activity/steps'],
  ['GET', '/api/activity/averages'],
  ['GET', '/api/sport/week'],
  ['POST', '/api/sport/week/refresh'],
  ['POST', '/api/sport/sessions'],
  ['GET', '/api/sport/sessions'],
  ['GET', `/api/sport/sessions/${UUID}`],
  ['PATCH', `/api/sport/sessions/${UUID}`],
  ['DELETE', `/api/sport/sessions/${UUID}`],
  ['PATCH', `/api/sport/exercises/${UUID}`],
  ['GET', '/api/progress/sessions'],
  ['GET', '/api/calendar'],
  ['GET', '/api/calendar/day'],
];

async function main() {
  if (!accounts.A.email || !accounts.A.password) {
    console.error('Variables A_EMAIL et A_PASSWORD obligatoires (voir l’en-tête du fichier).');
    process.exit(2);
  }
  console.log(`Test sur ${API}\n`);

  // 1. Sans jeton : rien ne doit répondre
  console.log('--- 1. Sans jeton ---');
  for (const [method, path] of PROTECTED) {
    const hasBody = !['GET', 'DELETE'].includes(method);
    const r = await call(method, path, hasBody ? { body: {} } : {});
    check(`${method} ${path}`, r.status === 401, `statut ${r.status}`);
  }

  // 1b. La route de la tâche planifiée refuse tout appel sans la bonne clé (401, ou 404 si elle est désactivée)
  for (const p of ['/internal/cron/evening-reminders', '/internal/cron/evening-reminders?key=mauvaise-cle']) {
    const rc = await call('GET', p);
    check(`GET ${p}`, rc.status === 401 || rc.status === 404, `statut ${rc.status}`);
  }

  // 2. Jetons invalides
  console.log('\n--- 2. Jetons invalides ---');
  const tokenA = await login('A');
  let r = await call('GET', '/api/me', { token: 'abc' });
  check('Jeton absurde refusé', r.status === 401, `statut ${r.status}`);
  const none = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: UUID, exp: 4102444800 })}.`;
  r = await call('GET', '/api/me', { token: none });
  check('Jeton sans signature (alg none) refusé', r.status === 401, `statut ${r.status}`);
  const tampered = tokenA.slice(0, -2) + (tokenA.endsWith('AA') ? 'BB' : 'AA');
  r = await call('GET', '/api/me', { token: tampered });
  check('Jeton falsifié refusé', r.status === 401, `statut ${r.status}`);
  r = await call('GET', '/api/me', { token: tokenA });
  check('Le vrai jeton fonctionne', r.status === 200, `statut ${r.status}`);

  // 3. Isolation entre comptes
  console.log('\n--- 3. Isolation entre comptes ---');
  const others = ['B', 'ADMIN'].filter((k) => accounts[k].email && accounts[k].password);
  if (!others.length) skip('Isolation entre comptes', 'aucun second compte fourni (B ou ADMIN)');

  for (const label of others) {
    const tokenX = await login(label);
    const q = `?from=${TEST_DATE}&to=${TEST_DATE}`;
    await call('PUT', '/api/measurements', { token: tokenA, body: { date: TEST_DATE, weightKg: 71.23 } });
    await call('PUT', '/api/measurements', { token: tokenX, body: { date: TEST_DATE, weightKg: 82.34 } });

    const ra = await call('GET', `/api/measurements${q}`, { token: tokenA });
    const rx = await call('GET', `/api/measurements${q}`, { token: tokenX });
    const la = (ra.json && ra.json.measurements) || [];
    const lx = (rx.json && rx.json.measurements) || [];
    check(`A ne voit que sa mesure (face à ${label})`, la.length === 1 && la[0].weightKg === 71.23, `${la.length} ligne(s)`);
    check(`${label} ne voit que sa mesure`, lx.length === 1 && lx[0].weightKg === 82.34, `${lx.length} ligne(s)`);

    await call('DELETE', `/api/measurements/${TEST_DATE}`, { token: tokenX });
    const ra2 = await call('GET', `/api/measurements${q}`, { token: tokenA });
    const la2 = (ra2.json && ra2.json.measurements) || [];
    check(`La suppression par ${label} ne touche pas les données de A`, la2.length === 1 && la2[0].weightKg === 71.23);

    // Accès au repas d'un autre compte (seulement si A a déjà un repas)
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 92 * 86400000).toISOString().slice(0, 10);
    const rm = await call('GET', `/api/meals?from=${from}&to=${today}`, { token: tokenA });
    const meal = rm.json && rm.json.meals && rm.json.meals[0];
    if (meal) {
      const p = await call('PATCH', `/api/meals/${meal.id}`, { token: tokenX, body: { caloriesKcal: meal.caloriesKcal } });
      check(`${label} ne peut pas modifier un repas de A`, p.status === 404, `statut ${p.status}`);
      const d = await call('DELETE', `/api/meals/${meal.id}`, { token: tokenX });
      check(`${label} ne peut pas supprimer un repas de A`, d.status === 404, `statut ${d.status}`);
      const still = await call('GET', `/api/meals?from=${from}&to=${today}`, { token: tokenA });
      check('Le repas de A existe toujours', ((still.json && still.json.meals) || []).some((m) => m.id === meal.id));
    } else {
      skip(`Accès au repas de A par ${label}`, 'A n’a aucun repas dans les 90 derniers jours');
    }

    await call('DELETE', `/api/measurements/${TEST_DATE}`, { token: tokenX });
  }
  await call('DELETE', `/api/measurements/${TEST_DATE}`, { token: tokenA });

  // 4. Rôles
  console.log('\n--- 4. Rôles ---');
  r = await call('GET', '/api/admin/users', { token: tokenA });
  check('Un utilisateur normal ne peut pas lister les comptes', r.status === 403, `statut ${r.status}`);
  r = await call('PATCH', `/api/admin/users/${UUID}`, { token: tokenA, body: { role: 'admin' } });
  check('Un utilisateur normal ne peut pas changer un rôle', r.status === 403, `statut ${r.status}`);
  // Le compte A doit être un compte normal : ni partenaire, ni admin.
  for (const p of ['/api/partner/me', '/api/partner/stats', '/api/partner/commissions', '/api/partner/payouts', '/api/admin/partners', '/api/admin/stats']) {
    r = await call('GET', p, { token: tokenA });
    check(`Un compte non partenaire et non admin est refusé sur GET ${p}`, r.status === 403, `statut ${r.status}`);
  }
  if (accounts.ADMIN.email && accounts.ADMIN.password) {
    const tokenAdmin = await login('ADMIN');
    r = await call('GET', '/api/admin/users', { token: tokenAdmin });
    const users = (r.json && r.json.users) || [];
    check('Un administrateur peut lister les comptes', r.status === 200 && users.length > 0, `statut ${r.status}`);
    check(
      'La liste contient le compte A',
      users.some((u) => u.email === String(accounts.A.email).trim().toLowerCase())
    );
  } else {
    skip('Droits administrateur', 'ADMIN_EMAIL et ADMIN_PASSWORD non fournis');
  }

  console.log(failures ? `\n${failures} ÉCHEC(S) : ne pas ouvrir au public avant correction.` : '\nTous les tests réalisés sont passés.');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error('Erreur du test :', e.message);
  process.exit(2);
});
