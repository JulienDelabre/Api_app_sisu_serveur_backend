// Crée (ou promeut) un compte administrateur. À lancer en SSH, dans le dossier du site :
//   node create-admin.js adresse@exemple.fr
// Le mot de passe est demandé de façon masquée : il ne reste ni dans l'historique, ni dans un fichier.
require('dotenv').config();
const crypto = require('crypto');
const readline = require('readline');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      process.stdout.write(s.startsWith(question) ? s : '');
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage : node create-admin.js adresse@exemple.fr');
    process.exit(1);
  }
  const password = await askHidden('Mot de passe (10 caractères minimum) : ');
  if (password.length < 10 || password.length > 200) {
    console.error('Mot de passe invalide (10 à 200 caractères).');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const hash = await bcrypt.hash(password, 12);
  const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (rows[0]) {
    await conn.execute("UPDATE users SET role = 'admin', status = 'active', password_hash = ? WHERE id = ?", [
      hash,
      rows[0].id,
    ]);
    console.log('Compte existant promu administrateur (mot de passe mis à jour).');
  } else {
    await conn.execute(
      "INSERT INTO users (id, email, password_hash, role, email_verified_at) VALUES (?, ?, ?, 'admin', NOW())",
      [crypto.randomUUID(), email, hash]
    );
    console.log('Administrateur créé.');
  }
  await conn.end();
})().catch((e) => {
  console.error('Erreur :', e.message);
  process.exit(1);
});
