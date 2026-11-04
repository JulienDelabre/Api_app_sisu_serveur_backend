// Outils de dates partagés par activity-routes.js et sport-routes.js.
// Toutes les dates sont des jours locaux de l'utilisateur au format AAAA-MM-JJ, fournis par l'app.
// La semaine va du lundi au dimanche.
const DAY = 86400000;

const toYmd = (ms) => new Date(ms).toISOString().slice(0, 10);
const parseYmd = (ymd) => Date.parse(ymd + 'T00:00:00Z');
const addDays = (ymd, n) => toYmd(parseYmd(ymd) + n * DAY);

const isDateStr = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(parseYmd(s)).toISOString().slice(0, 10) === s;

// Lundi de la semaine qui contient ymd.
function mondayOf(ymd) {
  const dow = (new Date(parseYmd(ymd)).getUTCDay() + 6) % 7; // lundi = 0
  return addDays(ymd, -dow);
}

// Écart en jours entre une date locale fournie par l'app et la date du serveur (UTC).
// Un utilisateur est au plus à un jour d'écart du serveur, quel que soit son fuseau.
const dayDiffFromToday = (ymd) => Math.round((parseYmd(ymd) - parseYmd(toYmd(Date.now()))) / DAY);

// Début de période (clé) d'une date, selon la granularité : week, month ou year.
function periodKey(ymd, gran) {
  if (gran === 'week') return mondayOf(ymd);
  if (gran === 'month') return ymd.slice(0, 7);
  return ymd.slice(0, 4);
}

// Toutes les périodes entre deux dates, y compris celles sans donnée (pour des graphiques sans trou).
function periodKeys(from, to, gran) {
  const keys = [];
  if (gran === 'week') {
    let cur = mondayOf(from);
    const end = mondayOf(to);
    while (cur <= end) {
      keys.push(cur);
      cur = addDays(cur, 7);
    }
  } else if (gran === 'month') {
    let [y, m] = from.slice(0, 7).split('-').map(Number);
    const [ey, em] = to.slice(0, 7).split('-').map(Number);
    while (y < ey || (y === ey && m <= em)) {
      keys.push(`${y}-${String(m).padStart(2, '0')}`);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  } else {
    for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) keys.push(String(y));
  }
  return keys;
}

// Début par défaut : 12 semaines, 12 mois ou 5 ans qui se terminent à `to`.
function defaultFrom(to, gran) {
  if (gran === 'week') return addDays(mondayOf(to), -77);
  if (gran === 'month') {
    let y = Number(to.slice(0, 4));
    let m = Number(to.slice(5, 7)) - 11;
    if (m < 1) {
      m += 12;
      y--;
    }
    return `${y}-${String(m).padStart(2, '0')}-01`;
  }
  return `${Number(to.slice(0, 4)) - 4}-01-01`;
}

// Expression SQL qui donne la clé de période d'une colonne de date. Colonne et granularité sont des
// valeurs fixes du code, jamais des données de la requête.
function periodSql(gran, column) {
  if (gran === 'week') return `DATE_FORMAT(DATE_SUB(${column}, INTERVAL WEEKDAY(${column}) DAY), '%Y-%m-%d')`;
  if (gran === 'month') return `DATE_FORMAT(${column}, '%Y-%m')`;
  return `DATE_FORMAT(${column}, '%Y')`;
}

module.exports = {
  DAY, toYmd, parseYmd, addDays, isDateStr, mondayOf, dayDiffFromToday, periodKey, periodKeys, defaultFrom, periodSql,
};
