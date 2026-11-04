// Client des notifications Apple (APNs), sans bibliothèque externe : HTTP/2 + jeton JWT signé en ES256.
//
// Variables d'environnement (toutes obligatoires pour l'envoi réel) :
//   APNS_KEY_BASE64   contenu du fichier .p8 de la clé APNs, encodé en base64 (ou APNS_KEY_PATH = chemin du fichier .p8)
//   APNS_KEY_ID       identifiant de la clé (10 caractères)
//   APNS_TEAM_ID      identifiant de l'équipe Apple Developer (10 caractères)
//   APNS_BUNDLE_ID    identifiant de l'app (ex. fr.exemple.monapp)
//   APNS_ENV          production (défaut) ou sandbox
//                     Une app installée par TestFlight ou l'App Store utilise la production,
//                     une app lancée depuis Xcode utilise le sandbox.
//   APNS_HOST         (tests uniquement) adresse alternative du serveur Apple
const http2 = require('http2');
const crypto = require('crypto');
const fs = require('fs');

const JWT_MAX_AGE_MS = 40 * 60 * 1000; // Apple demande de réutiliser le jeton entre 20 et 60 minutes

function loadKey(env) {
  if (env.APNS_KEY_BASE64) return Buffer.from(env.APNS_KEY_BASE64, 'base64').toString('utf8');
  if (env.APNS_KEY_PATH) return fs.readFileSync(env.APNS_KEY_PATH, 'utf8');
  return null;
}

function createApnsClient(env = process.env) {
  let key = null;
  try {
    key = loadKey(env);
  } catch (e) {
    console.error('Clé APNs illisible :', e.message);
  }
  const configured = !!(key && env.APNS_KEY_ID && env.APNS_TEAM_ID && env.APNS_BUNDLE_ID);
  if (!configured) {
    return {
      configured: false,
      send: async () => {
        throw new Error('APNs non configuré');
      },
      close() {},
    };
  }

  const host =
    env.APNS_HOST ||
    (env.APNS_ENV === 'sandbox' ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com');
  let session = null;
  let jwt = null;
  let jwtAt = 0;

  function providerToken() {
    if (jwt && Date.now() - jwtAt < JWT_MAX_AGE_MS) return jwt;
    const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: env.APNS_KEY_ID })).toString('base64url');
    const claims = Buffer.from(JSON.stringify({ iss: env.APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
    const signature = crypto
      .sign('sha256', Buffer.from(`${header}.${claims}`), { key, dsaEncoding: 'ieee-p1363' })
      .toString('base64url');
    jwt = `${header}.${claims}.${signature}`;
    jwtAt = Date.now();
    return jwt;
  }

  function connect() {
    if (session && !session.closed && !session.destroyed) return session;
    session = http2.connect(host);
    session.on('error', () => {}); // les erreurs de connexion sont remontées par chaque requête
    return session;
  }

  // Retourne { ok, status, reason, unregister }.
  // unregister vaut true seulement quand Apple dit que le jeton n'existe plus (statut 410) :
  // on ne supprime jamais un jeton sur une simple erreur de configuration.
  function send(deviceToken, payload) {
    return new Promise((resolve) => {
      let settled = false;
      const done = (r) => {
        if (!settled) {
          settled = true;
          resolve(r);
        }
      };
      let req;
      try {
        req = connect().request({
          ':method': 'POST',
          ':path': `/3/device/${deviceToken}`,
          authorization: `bearer ${providerToken()}`,
          'apns-topic': env.APNS_BUNDLE_ID,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'content-type': 'application/json',
        });
      } catch (e) {
        return done({ ok: false, status: 0, reason: e.message, unregister: false });
      }
      let status = 0;
      let body = '';
      req.setEncoding('utf8');
      req.on('response', (h) => {
        status = Number(h[':status']);
      });
      req.on('data', (c) => {
        body += c;
      });
      req.on('end', () => {
        let reason = null;
        try {
          reason = JSON.parse(body).reason || null;
        } catch (e) {
          /* pas de corps */
        }
        done({ ok: status === 200, status, reason, unregister: status === 410 });
      });
      req.on('error', (e) => done({ ok: false, status: 0, reason: e.message, unregister: false }));
      req.setTimeout(15000, () => {
        req.close();
        done({ ok: false, status: 0, reason: 'délai dépassé', unregister: false });
      });
      req.end(JSON.stringify(payload));
    });
  }

  return {
    configured: true,
    send,
    close() {
      if (session && !session.closed) session.close();
    },
  };
}

module.exports = { createApnsClient };
