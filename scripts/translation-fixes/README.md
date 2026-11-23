One file per area (e.g. `empty-states.json`, `signup.json`), same shape as `../translation-fixes.json`:
`{ "strings": { "English text": { "fr": "…", "es": "…", "pt": "…", "de": "…", "it": "…", "ja": "…", "ar": "…" } }, "patternAdds": [ … ] }`.
French always uses "tu". Then run `node scripts/build-translations.mjs`.
