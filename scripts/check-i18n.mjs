// Lists texts in the code that have NO translation yet (they would show in English in every language).
//
//   Run:  node scripts/check-i18n.mjs            (all of src/)
//         node scripts/check-i18n.mjs src/app/signup
//
// It looks at fixed texts written as <T>…</T>, t('…'), title="…", toast('…'), label="…".
// Texts with ${…} are checked with a sample value. Fix a miss by using the prototype's exact
// English wording, or add the translation to scripts/translation-fixes.json and re-run build-translations.

import fs from 'node:fs';
import path from 'node:path';

const strings = JSON.parse(fs.readFileSync('src/i18n/generated/strings.json', 'utf8'));
const patterns = JSON.parse(fs.readFileSync('src/i18n/generated/patterns.json', 'utf8')).filter((p) => p.re).map((p) => new RegExp(p.re, 'u'));
const names = JSON.parse(fs.readFileSync('src/i18n/generated/names.json', 'utf8'));
const known = (s) => {
  s = s.trim();
  if (!s || !/[A-Za-z]/.test(s)) return true;
  if (strings[s] || names.languages[s] || Object.values(names.countries).some((c) => c.en === s)) return true;
  const rest = s.replace(/^[^\p{L}+]+/u, '').trim();
  if (strings[rest]) return true;
  return patterns.some((re) => re.test(s));
};

const root = process.argv[2] || 'src';
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory() && e.name !== 'generated') walk(p);
  else if (/\.tsx?$/.test(e.name)) files.push(p);
});
walk(root);

const RX = [
  /<T(?:\s[^>]*)?>([^<{]+)<\/T>/g,
  /\bt\(\s*'((?:[^'\\]|\\.)+)'\s*\)/g,
  /\bt\(\s*"((?:[^"\\]|\\.)+)"\s*\)/g,
  /\bt\(\s*`([^`]+)`\s*\)/g,
  /\btoast\(\s*'((?:[^'\\]|\\.)+)'/g,
  /\b(?:title|label|placeholder|sub)=["']([^"']+)["']/g,
  /<T(?:\s[^>]*)?>\{`([^`]+)`\}<\/T>/g,
];
let misses = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (/\/\/ i18n-ignore-file/.test(src)) continue;
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (/i18n-ignore/.test(line) || /<T[^>]*\braw\b/.test(line)) return;
    for (const rx of RX) {
      rx.lastIndex = 0;
      let m;
      while ((m = rx.exec(line))) {
        const text = m[1].replace(/\\'/g, "'").replace(/\$\{[^}]+\}/g, 'Sam');
        if (!known(text)) { misses++; console.log(`${f}:${i + 1}  "${m[1]}"`); }
      }
    }
  });
}
console.log(misses ? `\n${misses} text(s) without translation` : 'All texts have translations ✓');
process.exit(misses ? 1 : 0);
