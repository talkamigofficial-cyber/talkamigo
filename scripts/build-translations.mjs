// Builds the app's translation files from the handoff pack.
//
//   Run:  node scripts/build-translations.mjs
//
// Reads:
//   docs/handoff/translations.csv           fixed texts (English + 7 languages)
//   docs/handoff/translations_patterns.csv  texts with changing parts ($1, $2…)
//   scripts/translation-fixes.json          our corrections on top of the handoff files
//   scripts/prototype-data.json             country / language lists from the prototype
// Writes (never edit these by hand, edit the inputs and re-run):
//   src/i18n/generated/strings.json   { "English text": ["fr","es","pt","de","it","ja","ar"] }
//   src/i18n/generated/patterns.json  [ { key, re, fr, es, … } ]  (order matters: first match wins)
//   src/i18n/generated/names.json     country and language names in all 8 languages

import fs from 'node:fs';

const LANGS = ['fr', 'es', 'pt', 'de', 'it', 'ja', 'ar'];
const ALL = ['en', ...LANGS];

// --- tiny CSV reader (handles quotes and commas inside quotes) ---
function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const fixes = JSON.parse(fs.readFileSync('scripts/translation-fixes.json', 'utf8'));

// ---------- fixed texts ----------
const strings = {};
for (const r of readCsv('docs/handoff/translations.csv').slice(1)) {
  if (!r[0]) continue;
  strings[r[0]] = r.slice(1, 8);
}
for (const [en, langs] of Object.entries(fixes.strings || {})) {
  if (en.startsWith('_')) continue;
  const row = strings[en] || ['', '', '', '', '', '', ''];
  for (const [l, v] of Object.entries(langs)) row[LANGS.indexOf(l)] = v;
  strings[en] = row;
}

// ---------- texts with changing parts ----------
let patterns = [];
for (const r of readCsv('docs/handoff/translations_patterns.csv').slice(1)) {
  if (!r[0]) continue;
  const p = { key: r[0], re: r[1] };
  LANGS.forEach((l, i) => (p[l] = r[2 + i]));
  patterns.push(p);
}
// corrections to existing patterns
for (const [key, change] of Object.entries(fixes.patternChanges || {})) {
  if (key.startsWith('_')) continue;
  const p = patterns.find((x) => x.key === key);
  if (!p) throw new Error('translation-fixes.json: unknown pattern ' + key);
  Object.assign(p, change);
}
// new patterns go BEFORE the pattern named in "before" so they win
for (const add of fixes.patternAdds || []) {
  const at = patterns.findIndex((x) => x.key === add.before);
  const { before, ...p } = add;
  patterns.splice(at < 0 ? patterns.length : at, 0, p);
}
// rows with an empty English pattern are only used by code (by key)
for (const p of patterns) new RegExp(p.re || '^$'); // throws if a pattern is broken

// ---------- country and language names ----------
const proto = JSON.parse(fs.readFileSync('scripts/prototype-data.json', 'utf8'));
const cap1 = (s) => (s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s);
const countries = {};
for (const [cc, enName] of proto.ALLC) {
  countries[cc] = { en: enName };
  for (const l of LANGS) {
    try { countries[cc][l] = new Intl.DisplayNames([l], { type: 'region' }).of(cc); } catch { countries[cc][l] = enName; }
  }
}
const languages = {};
for (const [enName, code] of Object.entries(proto.LCODE)) {
  languages[enName] = { en: enName };
  for (const l of LANGS) {
    try { languages[enName][l] = cap1(new Intl.DisplayNames([l], { type: 'language' }).of(code)); } catch { languages[enName][l] = enName; }
  }
}

fs.writeFileSync('src/i18n/generated/strings.json', JSON.stringify(strings));
fs.writeFileSync('src/i18n/generated/patterns.json', JSON.stringify(patterns, null, 0));
fs.writeFileSync('src/i18n/generated/names.json', JSON.stringify({ countries, languages }));
console.log(`strings: ${Object.keys(strings).length}  patterns: ${patterns.length}  countries: ${Object.keys(countries).length}  languages: ${Object.keys(languages).length}`);
void ALL;
