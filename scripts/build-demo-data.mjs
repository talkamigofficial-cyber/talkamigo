// Copies the prototype's demo content and lists into the app.
//
//   Run:  node scripts/build-demo-data.mjs
//
// Reads  scripts/prototype-data.json (dumped from docs/handoff/talkamigo-beta.html after "Try the demo")
// Writes src/data/generated/*.json   (never edit by hand)
//
// In slice 2 the demo people, rooms and chats are replaced by real data from the server;
// the lists (countries, languages, interests, dial codes) stay.

import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('scripts/prototype-data.json', 'utf8'));
const S = d.S;
const out = 'src/data/generated';
fs.mkdirSync(out, { recursive: true });
const write = (name, value) => fs.writeFileSync(`${out}/${name}.json`, JSON.stringify(value, null, 1));

// ---- lists used by sign-up and settings ----
write('lists', {
  countries: d.ALLC.map(([code, name]) => ({ code, name })), // every country, English names (translated at runtime)
  popularCountries: d.POPC,
  capitals: d.CAPN, // example city per country ("e.g. Paris")
  countryLanguage: d.CCLANG, // main language per country (pre-selects "I speak")
  languages: d.ALLLANGS,
  popularLanguages: d.POPL,
  interests: d.ALLINTS,
  popularInterests: d.POPINTS,
  dialCodes: d.DIAL,
  demoPhotos: d.PHOTOS, // [emoji, background]
  flagDrawings: d.FLAG, // 12 countries drawn as colour stripes in the prototype; others use the emoji flag
});

// ---- the demo account ("Try the demo") ----
write('demo', {
  people: d.P, // 26 demo people keyed by id
  me: S.me,
  wallet: { coins: S.coins, diamonds: S.diamonds, pending: S.pending },
  stats: { views: S.views, followersN: S.followersN, streak: S.streak, newFollowers: S.newF, newViews: S.newV, week: S.week, today: S.today },
  follows: S.follows,
  followsMe: S.followsMe,
  chats: S.chats,
  chatOrder: S.order,
  groups: S.groups,
  offUnread: S.offUnread,
  rooms: S.rooms,
  lives: S.lives,
  lessonsPlan: d.PLAN,
  paidRooms: d.TROOMS0,
  flicks: d.allFlicks,
  myFlicks: S.myMoments,
  roomAlerts: d.LALERTS,
  team: d.TEAM,
  requests: d.REQS,
  activity: d.ACT_SEED,
  prefs: S.prefs,
});

// ---- prices and product numbers (in the real app these come from app_config on the server) ----
write('config', {
  gifts: d.GIFTS,
  coinPacks: d.PACKS.map(([coins, usd, bonus]) => ({ coins, usd, bonus })),
  boosts: d.BOOSTS,
  frames: d.FRAMES,
  cashoutTiers: d.TIERS,
  plans: { plusWeek: 2.99, plusMonth: 9.99, plusYear: 79.99, infinity: 199.99, lesson: 0.99 },
  diamondRate: 0.25,
  giftDayLimit: 20000,
});

// ---- line icons (SVG inner markup, drawn with the text colour) ----
write('icons', d.I);

console.log('written:', fs.readdirSync(out).join(', '));
