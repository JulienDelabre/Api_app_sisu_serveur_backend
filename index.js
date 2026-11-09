// API : comptes (free / subscriber / admin), vérification d'e-mail, mot de passe oublié,
// sessions, quotas IA, relais vers le LLM, données de l'utilisateur (data-routes.js),
// compte et réglages (account-routes.js), activité (activity-routes.js), sport, progression et
// calendrier (sport-routes.js), partenaires et admin (partner-routes.js).
// La base MariaDB n'est joignable que depuis le serveur : l'app ne la contacte jamais directement.
require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');

const REQUIRED = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'LLM_API_KEY', 'LLM_MODEL',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM',
];
for (const k of REQUIRED) {
  if (!process.env[k]) {
    console.error('Variable manquante :', k);
    process.exit(1);
  }
}

// ---- Réglages à ajuster ----
const APP_NAME = process.env.APP_NAME || 'Mon application';
const ACCESS_TTL = '15m'; // durée de vie du jeton d'accès
const REFRESH_DAYS = 30; // durée de vie de la session
const DAILY_LIMITS = { free: 3, subscriber: 50, admin: 200 }; // appels IA par jour
const ROLES = ['free', 'subscriber', 'admin'];
const STATUSES = ['active', 'blocked'];
const CODE_TTL_MIN = { verify: 15, reset: 30, email_change: 15 }; // validité des codes e-mail, en minutes
const MAX_ATTEMPTS = 5; // essais maximum par code
const MAX_CODES_PER_HOUR = 6; // codes envoyés par compte, par type et par heure
const CODE_RESEND_COOLDOWN_SEC = 60; // délai minimum entre deux envois de code (un par minute)

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
  dateStrings: true, // les dates sortent en texte (AAAA-MM-JJ) : pas de décalage de fuseau
});

const smtpPort = Number(process.env.SMTP_PORT);
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // 465 = SSL direct ; 587 = STARTTLS
  requireTLS: smtpPort !== 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', 12);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

// Journal de diagnostic pour l'authentification : aucun corps de requête,
// mot de passe, code de vérification, jeton ou adresse IP n'est enregistré.
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/auth/')) return next();
  const startedAt = Date.now();
  const origin = String(req.headers.origin || '-').replace(/[\\r\\n]/g, '').slice(0, 200);
  const path = req.path.replace(/[\\r\\n]/g, '').slice(0, 160);

  res.once('finish', () => {
    console.info(
      `[AUTH HTTP] ${req.method} ${path} origin=${origin} status=${res.statusCode} durationMs=${Date.now() - startedAt}`
    );
  });
  next();
});

// Autoriser les origines de l'application SISU et conserver les origines
// supplémentaires configurées par l'exploitant dans ALLOWED_ORIGINS.
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowed = [
  'https://appsisu.com',
  'https://www.appsisu.com',
  'https://appsisu-tmp.ai.studio',
  'capacitor://localhost', // iOS WebView
  'https://localhost', // Android WebView (androidScheme: https)
  ...configuredOrigins,
];
app.use(cors({ origin: [...new Set(allowed)] }));

// Les photos et l'état de l'app passent en JSON : corps plus gros uniquement pour ces routes.
app.use('/api/app-state', express.json({ limit: '9mb' }));
app.use('/api/progress/photos', express.json({ limit: '4mb' }));
app.use('/api/llm', express.json({ limit: '10mb' }));
app.use(['/api/meals/analyze', '/api/goal/photo', '/api/body/photo'], express.json({ limit: '5mb' }));
app.use(express.json({ limit: '50kb' }));

// ---- Outils ----
const limiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de requêtes, réessayez plus tard' },
  });

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const normEmail = (e) => (typeof e === 'string' ? e.trim().toLowerCase() : '');
const validEmail = (e) => e.length > 0 && e.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validPassword = (p) => typeof p === 'string' && p.length >= 10 && p.length <= 200;
const PASSWORD_MSG = 'E-mail invalide ou mot de passe trop court (10 caractères minimum)';

const signAccess = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL, algorithm: 'HS256' });

async function issueRefresh(userId) {
  const raw = crypto.randomBytes(32).toString('hex'); // 64 caractères
  await pool.execute(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [crypto.randomUUID(), userId, sha256(raw), REFRESH_DAYS]
  );
  return raw;
}

async function usedToday(userId) {
  const [rows] = await pool.execute(
    'SELECT calls FROM ai_usage WHERE user_id = ? AND usage_date = CURDATE()',
    [userId]
  );
  return rows[0] ? rows[0].calls : 0;
}

const refund = (userId) =>
  pool.execute(
    'UPDATE ai_usage SET calls = GREATEST(calls - 1, 0) WHERE user_id = ? AND usage_date = CURDATE()',
    [userId]
  );

// ---- Codes envoyés par e-mail (vérification et mot de passe oublié) ----
const hashCode = (userId, type, code) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(`code:${userId}:${type}:${code}`).digest('hex');

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

async function sendCodeMail(to, type, code) {
  const subjects = {
    verify: `${APP_NAME} : votre code de vérification`,
    reset: `${APP_NAME} : réinitialisation du mot de passe`,
    email_change: `${APP_NAME} : confirmez votre nouvelle adresse e-mail`,
  };
  const intros = {
    verify: 'Voici votre code pour vérifier votre adresse e-mail :',
    reset: 'Voici votre code pour choisir un nouveau mot de passe :',
    email_change: 'Voici votre code pour confirmer votre nouvelle adresse e-mail :',
  };
  const text =
    `${intros[type]}\n\n${code}\n\n` +
    `Ce code est valable ${CODE_TTL_MIN[type]} minutes. ` +
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.";
  await mailer.sendMail({ from: process.env.MAIL_FROM, to, subject: subjects[type], text });
}

// Message d'information simple (sans code), par exemple après un changement de mot de passe.
async function sendInfoMail(to, subject, text) {
  await mailer.sendMail({ from: process.env.MAIL_FROM, to, subject: `${APP_NAME} : ${subject}`, text });
}

// Envoie un nouveau code. Le nouveau code REMPLACE l'ancien, mais seulement une fois l'e-mail bien parti :
// si l'envoi échoue, l'ancien code reste valable.
// Retourne { ok: true } ou { ok: false, reason: 'cooldown' | 'hourly', retryAfterSec }.
async function createAndSendCode(user, type) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS n FROM email_codes WHERE user_id = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [user.id, type]
  );
  if (Number(rows[0].n) >= MAX_CODES_PER_HOUR) return { ok: false, reason: 'hourly', retryAfterSec: 3600 };

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const id = crypto.randomUUID();
  // Un seul envoi par minute : le nouveau code n'est créé que si aucun code récent n'existe (opération atomique).
  const [ins] = await pool.execute(
    `INSERT INTO email_codes (id, user_id, type, code_hash, expires_at)
     SELECT ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE) FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM email_codes WHERE user_id = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND))`,
    [id, user.id, type, hashCode(user.id, type, code), CODE_TTL_MIN[type], user.id, type, CODE_RESEND_COOLDOWN_SEC]
  );
  if (!ins.affectedRows) {
    const [last] = await pool.execute(
      'SELECT TIMESTAMPDIFF(SECOND, MAX(created_at), NOW()) AS age FROM email_codes WHERE user_id = ? AND type = ?',
      [user.id, type]
    );
    const age = last[0].age === null ? 0 : Number(last[0].age);
    return { ok: false, reason: 'cooldown', retryAfterSec: Math.max(1, CODE_RESEND_COOLDOWN_SEC - age) };
  }
  try {
    await sendCodeMail(user.email, type, code); // le code n'est jamais écrit dans les journaux
  } catch (e) {
    await pool.execute('DELETE FROM email_codes WHERE id = ?', [id]).catch(() => {});
    throw e;
  }
  // L'e-mail est parti : les anciens codes ne fonctionnent plus.
  await pool.execute('UPDATE email_codes SET used_at = NOW() WHERE user_id = ? AND type = ? AND used_at IS NULL AND id <> ?', [
    user.id,
    type,
    id,
  ]);
  return { ok: true };
}

// Réponse 429 commune aux routes qui renvoient un code.
function sendCodeRefusal(res, r) {
  res.set('Retry-After', String(r.retryAfterSec));
  const cooldown = r.reason === 'cooldown';
  return res.status(429).json({
    error: cooldown
      ? `Un code vient d’être envoyé, patientez ${r.retryAfterSec} s avant d’en demander un autre`
      : 'Trop de demandes, réessayez dans une heure',
    code: cooldown ? 'RESEND_COOLDOWN' : 'RESEND_LIMIT',
    retryAfterSec: r.retryAfterSec,
  });
}

// Vrai si le code est bon. Compte les essais ratés ; le code est mort après MAX_ATTEMPTS.
async function checkCode(userId, type, code) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false;
  const [rows] = await pool.execute(
    'SELECT id, code_hash, attempts FROM email_codes WHERE user_id = ? AND type = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [userId, type]
  );
  const row = rows[0];
  if (!row || row.attempts >= MAX_ATTEMPTS) return false;
  if (!safeEqual(row.code_hash, hashCode(userId, type, code))) {
    await pool.execute('UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?', [row.id]);
    return false;
  }
  await pool.execute('UPDATE email_codes SET used_at = NOW() WHERE id = ?', [row.id]);
  return true;
}

// ---- Authentification ----
// Vérifie le jeton ET relit le compte en base : un blocage ou un changement de rôle est immédiat.
async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const [rows] = await pool.execute(
      'SELECT id, email, role, status, email_verified_at FROM users WHERE id = ?',
      [payload.sub]
    );
    const u = rows[0];
    if (!u || u.status !== 'active') return res.status(401).json({ error: 'Non autorisé' });
    req.user = { id: u.id, email: u.email, role: u.role, emailVerified: !!u.email_verified_at };
    next();
  } catch (e) {
    res.status(401).json({ error: 'Non autorisé' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Accès refusé' });

const requireVerified = (req, res, next) =>
  req.user.emailVerified
    ? next()
    : res.status(403).json({ error: 'Adresse e-mail non vérifiée', code: 'EMAIL_NOT_VERIFIED' });

const publicUser = (u) => ({ id: u.id, email: u.email, role: u.role, emailVerified: !!u.emailVerified });

// ---- Santé ----
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: true });
  } catch (e) {
    res.status(500).json({ ok: false, db: false });
  }
});

// ---- Comptes ----
app.post('/api/auth/register', limiter(60 * 60 * 1000, 10), async (req, res, next) => {
  try {
    const email = normEmail(req.body && req.body.email);
    const password = req.body && req.body.password;
    if (!validEmail(email) || !validPassword(password)) {
      return res.status(400).json({ error: PASSWORD_MSG });
    }
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 12);
    try {
      await pool.execute('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, hash]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Impossible de créer ce compte' });
      throw e;
    }
    // Envoi du code de vérification sans bloquer l'inscription si le mail échoue.
    createAndSendCode({ id, email }, 'verify').catch((e) => console.error("Envoi du code impossible :", e.message));
    res.status(201).json({
      accessToken: signAccess(id),
      refreshToken: await issueRefresh(id),
      user: { id, email, role: 'free', emailVerified: false },
      cooldownSec: CODE_RESEND_COOLDOWN_SEC, // un code vient d'être envoyé : prochain envoi possible dans 60 s
    });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/login', limiter(15 * 60 * 1000, 20), async (req, res, next) => {
  try {
    const email = normEmail(req.body && req.body.email);
    const password = req.body && typeof req.body.password === 'string' ? req.body.password.slice(0, 200) : '';
    const [rows] = await pool.execute(
      'SELECT id, email, role, status, password_hash, email_verified_at FROM users WHERE email = ?',
      [email]
    );
    const u = rows[0];
    const ok = await bcrypt.compare(password, u ? u.password_hash : DUMMY_HASH);
    if (!u || !ok || u.status !== 'active') return res.status(401).json({ error: 'Identifiants incorrects' });
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [u.id]);
    res.json({
      accessToken: signAccess(u.id),
      refreshToken: await issueRefresh(u.id),
      user: { id: u.id, email: u.email, role: u.role, emailVerified: !!u.email_verified_at },
    });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/refresh', limiter(15 * 60 * 1000, 60), async (req, res, next) => {
  try {
    const raw = req.body && req.body.refreshToken;
    if (typeof raw !== 'string' || raw.length !== 64) return res.status(401).json({ error: 'Session expirée' });
    const [rows] = await pool.execute(
      'SELECT id, user_id, revoked_at, (expires_at > NOW()) AS valid FROM refresh_tokens WHERE token_hash = ?',
      [sha256(raw)]
    );
    const t = rows[0];
    if (!t) return res.status(401).json({ error: 'Session expirée' });
    if (t.revoked_at) {
      // Jeton déjà utilisé : possible vol, on coupe toutes les sessions de ce compte.
      await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [t.user_id]);
      return res.status(401).json({ error: 'Session expirée' });
    }
    if (!t.valid) return res.status(401).json({ error: 'Session expirée' });
    const [urows] = await pool.execute('SELECT status FROM users WHERE id = ?', [t.user_id]);
    if (!urows[0] || urows[0].status !== 'active') return res.status(401).json({ error: 'Session expirée' });
    await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [t.id]);
    res.json({ accessToken: signAccess(t.user_id), refreshToken: await issueRefresh(t.user_id) });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const raw = req.body && req.body.refreshToken;
    if (typeof raw === 'string') {
      await pool.execute(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
        [sha256(raw)]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Vérification de l'e-mail ----
app.post('/api/auth/send-verification', limiter(60 * 60 * 1000, 30), requireAuth, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.json({ ok: true, alreadyVerified: true });
    let r;
    try {
      r = await createAndSendCode(req.user, 'verify');
    } catch (e) {
      console.error('Envoi du code impossible :', e.message);
      return res.status(502).json({ error: 'Envoi du code impossible, réessayez dans un instant', code: 'MAIL_FAILED' });
    }
    if (!r.ok) return sendCodeRefusal(res, r);
    res.json({ ok: true, cooldownSec: CODE_RESEND_COOLDOWN_SEC });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/verify-email', limiter(15 * 60 * 1000, 20), requireAuth, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.json({ ok: true });
    const ok = await checkCode(req.user.id, 'verify', req.body && req.body.code);
    if (!ok) return res.status(400).json({ error: 'Code invalide ou expiré' });
    await pool.execute('UPDATE users SET email_verified_at = NOW() WHERE id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Mot de passe oublié ----
// Même réponse que le compte existe ou non, et sans attendre l'envoi du mail.
app.post('/api/auth/forgot-password', limiter(60 * 60 * 1000, 10), async (req, res, next) => {
  try {
    const email = normEmail(req.body && req.body.email);
    if (validEmail(email)) {
      const [rows] = await pool.execute('SELECT id, email, status FROM users WHERE email = ?', [email]);
      const u = rows[0];
      if (u && u.status === 'active') {
        createAndSendCode(u, 'reset').catch((e) => console.error('Envoi du code impossible :', e.message));
      }
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/reset-password', limiter(15 * 60 * 1000, 20), async (req, res, next) => {
  try {
    const email = normEmail(req.body && req.body.email);
    const code = req.body && req.body.code;
    const newPassword = req.body && req.body.newPassword;
    if (!validEmail(email) || !validPassword(newPassword)) {
      return res.status(400).json({ error: PASSWORD_MSG });
    }
    const [rows] = await pool.execute('SELECT id, status FROM users WHERE email = ?', [email]);
    const u = rows[0];
    const ok = u && u.status === 'active' && (await checkCode(u.id, 'reset', code));
    if (!ok) return res.status(400).json({ error: 'Code invalide ou expiré' });
    const hash = await bcrypt.hash(newPassword, 12);
    // Le code reçu par e-mail prouve aussi que l'adresse est bien celle de l'utilisateur.
    await pool.execute(
      'UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?',
      [hash, u.id]
    );
    // Toutes les sessions ouvertes sont coupées.
    await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [u.id]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Profil de connexion ----
app.get('/api/me', requireAuth, requireVerified, async (req, res, next) => {
  try {
    const used = await usedToday(req.user.id);
    res.json({
      user: publicUser(req.user),
      usage: { used, limit: DAILY_LIMITS[req.user.role] || 0 },
    });
  } catch (e) {
    next(e);
  }
});

// Suppression du compte (exigée par les stores). POST plutôt que DELETE : certains clients perdent le corps.
app.post('/api/me/delete', requireAuth, limiter(15 * 60 * 1000, 5), async (req, res, next) => {
  try {
    const password = req.body && typeof req.body.password === 'string' ? req.body.password.slice(0, 200) : '';
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]); // supprime tout en cascade
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- IA générique (compte vérifié obligatoire) ----
app.post('/api/llm', limiter(60 * 1000, 20), requireAuth, requireVerified, async (req, res, next) => {
  let counted = false;
  try {
    const { prompt, imageBase64, mimeType } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.length > 8000) {
      return res.status(400).json({ error: 'Le champ prompt est requis (8000 caractères maximum)' });
    }

    const limit = DAILY_LIMITS[req.user.role] || 0;
    await pool.execute(
      'INSERT INTO ai_usage (user_id, usage_date, calls) VALUES (?, CURDATE(), 1) ON DUPLICATE KEY UPDATE calls = calls + 1',
      [req.user.id]
    );
    counted = true;
    if ((await usedToday(req.user.id)) > limit) {
      await refund(req.user.id);
      counted = false;
      return res.status(429).json({ error: 'Limite quotidienne atteinte' });
    }

    const parts = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } });
    }

    // Exemple pour l'API Gemini. Adaptez l'URL et le format pour un autre LLM.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.LLM_MODEL}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.LLM_API_KEY },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Erreur LLM, statut', response.status, (data.error && data.error.message) || '');
      await refund(req.user.id);
      counted = false;
      return res.status(502).json({ error: 'Erreur du service IA' });
    }
    const text =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts.map((p) => p.text || '').join('')) ||
      '';
    res.json({ text });
  } catch (e) {
    if (counted) await refund(req.user.id).catch(() => {});
    next(e);
  }
});

// ---- Données de l'utilisateur : profil, consentements, mesures, repas, corps, objectif ----
require('./data-routes')(app, { pool, requireAuth, requireVerified, limiter, DAILY_LIMITS, usedToday, refund });

// ---- Compte, notifications, appareils, Apple Santé (lot 1) ----
require('./account-routes')(app, {
  pool, requireAuth, requireVerified, limiter, signAccess, issueRefresh,
  createAndSendCode, sendCodeRefusal, checkCode, sendInfoMail, normEmail, validEmail, validPassword,
});

// ---- Lot 2 : activité (pas), sport, progression, calendrier ----
require('./activity-routes')(app, { pool, requireAuth, requireVerified, limiter });
require('./sport-routes')(app, { pool, requireAuth, requireVerified, limiter, DAILY_LIMITS, usedToday, refund });
require('./app-state-routes')(app, { pool, requireAuth, requireVerified, limiter });
require('./community-routes')(app, { pool, requireAuth, requireVerified, limiter });
require('./progress-photo-routes')(app, { pool, requireAuth, requireVerified, limiter });

// ---- Partenaires et admin : chargés si le fichier est présent ----
if (fs.existsSync(`${__dirname}/partner-routes.js`)) {
  require('./partner-routes')(app, { pool, requireAuth, requireVerified, requireRole, limiter });
} else {
  console.warn('partner-routes.js absent : routes partenaires non chargées');
}

// ---- Tâche planifiée : rappel du soir (route protégée par CRON_SECRET, absente si la variable manque) ----
require('./cron-routes')(app, { pool, limiter });

// ---- Espace admin ----
const adminOnly = [requireAuth, requireRole('admin')];

app.get('/api/admin/users', ...adminOnly, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, role, status, (email_verified_at IS NOT NULL) AS email_verified, created_at, last_login_at FROM users ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ users: rows });
  } catch (e) {
    next(e);
  }
});

app.patch('/api/admin/users/:id', ...adminOnly, async (req, res, next) => {
  try {
    const { role, status } = req.body || {};
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre compte ici' });
    }
    const sets = [];
    const vals = [];
    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ error: 'Rôle invalide' });
      sets.push('role = ?');
      vals.push(role);
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
      sets.push('status = ?');
      vals.push(status);
    }
    if (!sets.length) return res.status(400).json({ error: 'Rien à modifier' });
    vals.push(req.params.id);
    const [r] = await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
    if (!r.affectedRows) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (status === 'blocked') {
      await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [
        req.params.id,
      ]);
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Erreurs ----
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.message);
  res.status(err.status && err.status < 500 ? err.status : 500).json({ error: 'Erreur serveur' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Application started on port ${port}`));
