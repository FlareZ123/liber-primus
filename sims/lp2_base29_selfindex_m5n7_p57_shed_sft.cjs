'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const BASE29 = '0123456789ABCDEFGHIJKLMNOPQRS';

const corpus = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'),
);
const originalIndex = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2014-onion7-original-index.html'),
  'utf8',
);
const tcpSource = fs.readFileSync(
  path.join(ROOT, 'resources/historical/2013-tcp-server-worked-examples-source.md'),
  'utf8',
);

function base29(n) {
  if (n === 0) return '0';
  let x = n;
  let out = '';
  while (x > 0) {
    out = BASE29[x % MOD] + out;
    x = Math.floor(x / MOD);
  }
  return out;
}

function translit(indices) {
  return indices.map((x) => corpus.translit[x]).join('');
}

const imageRefs = [...originalIndex.matchAll(/<img src="(\d+)\.jpg"/g)]
  .map((m) => Number(m[1]));
assert.deepEqual(imageRefs, Array.from({ length: 58 }, (_, i) => i));

assert.match(tcpSource, /C: BASE29 3301\s+S: 01 OK 3QO/);
assert.match(tcpSource, /C: DH 23\s+S: 01 OK 5 8\s+C: 19\s+S: 03 DATA 2/);

const pages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55)
  .sort((a, b) => a.page - b.page);

const selfIndexed = pages.filter(
  (p) => Math.floor(p.runic_count / MOD) === p.page,
);
assert.deepEqual(
  selfIndexed.map((p) => [p.page, p.runic_count, base29(p.runic_count)]),
  [
    [6, 196, '6M'],
    [7, 208, '75'],
    [8, 255, '8N'],
    [9, 268, '97'],
  ],
);

const token = selfIndexed
  .map((p) => base29(p.runic_count).slice(1))
  .join('');
assert.equal(token, 'M5N7');

const digits = [...token].map((ch) => BASE29.indexOf(ch));
assert.deepEqual(digits, [22, 5, 23, 7]);
assert.equal(digits.reduce((a, b) => a + b, 0), 57);

const windows = [];
for (let start = 0; start <= 52; start++) {
  const block = pages.slice(start, start + 4);
  const remainders = block.map((p) => p.runic_count % MOD);
  windows.push({
    start,
    remainders,
    sum: remainders.reduce((a, b) => a + b, 0),
    inner: remainders.slice(1, 3),
    selfIndex: block.every(
      (p, i) => Math.floor(p.runic_count / MOD) === start + i,
    ),
  });
}

assert.deepEqual(
  windows
    .filter((x) => x.sum === 57)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);
assert.deepEqual(
  windows
    .filter((x) => x.inner[0] === 5 && x.inner[1] === 23)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);
assert.deepEqual(
  windows
    .filter((x) => x.selfIndex)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);

const p57 = corpus.pages.find((p) => p.page === 57);
assert(p57);
const p57Text = translit(p57.indices);
assert.equal(
  p57Text,
  'PARABLELICETHEINSTARTUNNELNGTOTHESURFACEWEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE',
);
assert.match(
  p57Text,
  /WEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE/,
);

const shed = token.slice(1, -1);
assert.equal(shed, '5N');
const shedDigits = [...shed].map((ch) => BASE29.indexOf(ch));
assert.deepEqual(shedDigits, [5, 23]);

const state = { p: 23, g: 5, A: 8, B: 19, K: 2 };
assert.deepEqual(shedDigits, [state.g, state.p]);

const remainderH = [
  digits[0] - digits[3],
  digits[1] - digits[2],
  digits[1] + digits[2],
  digits[0] + digits[3],
].map((x) => ((x % MOD) + MOD) % MOD);
assert.deepEqual(remainderH, [15, 11, 28, 0]);

let compatible = 0;
const quotientBins = new Map();
for (const p of pages) {
  const q = Math.floor(p.runic_count / MOD);
  if (!quotientBins.has(q)) quotientBins.set(q, []);
  quotientBins.get(q).push(p.runic_count % MOD);
}
for (const a of quotientBins.get(6)) {
  for (const b of quotientBins.get(7)) {
    for (const c of quotientBins.get(8)) {
      for (const d of quotientBins.get(9)) {
        const h = [
          a - d,
          b - c,
          b + c,
          a + d,
        ].map((x) => ((x % MOD) + MOD) % MOD);
        if (h.join(',') === '15,11,28,0') compatible++;
      }
    }
  }
}
assert.equal(compatible, 1);

console.log(JSON.stringify({
  historicalZeroOrigin: {
    original2014ImageRefs: '0.jpg through 57.jpg',
    count: imageRefs.length,
  },
  authenticatedOperations: {
    base29: '3301 -> 3QO',
    dh: { p: 23, g: 5, A: 8, B: 19, K: 2 },
  },
  selfIndex: selfIndexed.map((p) => ({
    page: p.page,
    runes: p.runic_count,
    base29: base29(p.runic_count),
  })),
  token,
  tokenDigits: digits,
  tokenDigitSum: 57,
  solvedPage57Instruction:
    'WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIUINITY WITHIN AND EMERGE',
  shed,
  shedDigits,
  shedMatchesHistoricalDh: ['g', 'p'],
  remainderH,
  quotientBinCompatibleAssignments: 3 * 7 * 6 * 32,
  exactRemainderHAssignments: compatible,
  decision:
    'The source-visible zero-based BASE29 self-index block deterministically yields M5N7; its digit sum selects solved p57, whose literal circumference instruction reduces it to 5N=[g,p]=[5,23]. This is a structural/navigation route, not yet a body decryption.',
}, null, 2));
