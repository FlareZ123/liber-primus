'use strict';

/**
 * Read-only original-source SFT for the provisional PARABLE 666 ->
 * Agrippa Mercury 8x8 idea. It detects no recovered unknown plaintext.
 *
 * Run: node sims/lp2_agrippa_mercury64_parable_original_sft.cjs
 * Author: Agent 38, 13 November 2026.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pageText = read('resources/liber-primus/lp2-transcription.txt').split('%');
pageText.splice(50, 0, '');
assert.equal(pageText.length, 58);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} s @returns {number[]} */
function runes(s) {
  return [...s].flatMap(c => runeIndex.has(c) ? [runeIndex.get(c)] : []);
}
/** @param {number} p @returns {number[][]} */
function lines(p) {
  return pageText[p].split('/').map(runes).filter(s => s.length);
}
/** @param {number[]} r @returns {number} */
function primeSum(r) {
  return r.reduce((n, x) => n + corpus.prime[x], 0);
}
/** @param {number[]} r @returns {number} */
function ioc(r) {
  const f = Array(29).fill(0);
  for (const x of r) f[x]++;
  return f.reduce((n, x) => n + x * (x - 1), 0) / (r.length * (r.length - 1));
}
/** @param {number} n @returns {number} */
function primeOrdinal(n) {
  let count = 0;
  for (let k = 2; k <= n; k++) {
    let prime = true;
    for (let d = 2; d * d <= k; d++) {
      if (k % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return count;
}

const clauses = pageText[57].split('.').slice(0, 4).map(s => primeSum(runes(s)));
assert.deepEqual(clauses, [449, 1259, 1031, 1229]);
const ordinals = clauses.map(primeOrdinal);
assert.deepEqual(ordinals, [87, 205, 173, 201]);
assert.equal(ordinals.reduce((a, b) => a + b, 0), 666);

const source64 = [...lines(36)[0], ...lines(13)[2], ...lines(33)[0]];
assert.deepEqual([lines(36)[0].length, lines(13)[2].length, lines(33)[0].length], [23, 23, 18]);
assert.deepEqual([primeSum(lines(36)[0]), primeSum(lines(13)[2]), primeSum(lines(33)[0])], [1020, 1229, 920]);
assert.equal(source64.length, 64);
assert.equal(primeSum(source64), 3169);

const mercury = [
   8, 58, 59,  5,  4, 62, 63,  1,
  49, 15, 14, 52, 53, 11, 10, 56,
  41, 23, 22, 44, 45, 19, 18, 48,
  32, 34, 35, 29, 28, 38, 39, 25,
  40, 26, 27, 37, 36, 30, 31, 33,
  17, 47, 46, 20, 21, 43, 42, 24,
   9, 55, 54, 12, 13, 51, 50, 16,
  64,  2,  3, 61, 60,  6,  7, 57,
].map(x => x - 1);
assert.deepEqual([...mercury].sort((a, b) => a - b), Array.from({ length: 64 }, (_, i) => i));
for (let y = 0; y < 8; y++) {
  assert.equal(mercury.slice(8 * y, 8 * y + 8).reduce((a, b) => a + b + 1, 0), 260);
}
for (let x = 0; x < 8; x++) {
  assert.equal(Array.from({length: 8}, (_, y) => mercury[8 * y + x]).reduce((a, b) => a + b + 1, 0), 260);
}
assert.equal(mercury.reduce((a, b) => a + b + 1, 0), 2080);

assert.equal(grid.bytes.length, 256);
const gridBlockDistinct = Array.from({length: 4}, (_, block) => {
  const originalBlock = grid.bytes.slice(block * 64, (block + 1) * 64);
  return new Set(originalBlock.map(b => b % 64)).size;
});
assert.deepEqual(gridBlockDistinct, [36, 40, 40, 40]);

const unknown = corpus.pages[55].indices;
const control = corpus.pages[57].indices;
assert.equal(unknown.length, 76);
assert.equal(control.length, 95);
const unique = new Set();
const candidates = [];
for (let flip = 0; flip < 2; flip++) {
  for (let rotation = 0; rotation < 4; rotation++) {
    const numbers = Array(64);
    for (let i = 0; i < 64; i++) {
      let y = Math.floor(i / 8);
      let x = i % 8;
      if (flip) x = 7 - x;
      for (let turn = 0; turn < rotation; turn++) {
        const nx = 7 - y;
        y = x;
        x = nx;
      }
      numbers[y * 8 + x] = mercury[i];
    }
    for (let inverse = 0; inverse < 2; inverse++) {
      const key = inverse
        ? Array.from({ length: 64 }, (_, i) => source64[numbers.indexOf(i)])
        : numbers.map(i => source64[i]);
      if (unique.has(key.join(','))) continue;
      unique.add(key.join(','));
      for (const sign of [-1, 1]) {
        const plain = unknown.map((c, i) => (c + sign * key[i % 64] + 29) % 29);
        assert.deepEqual(plain.map((p, i) => (p - sign * key[i % 64] + 29) % 29), unknown);
        const plant = control.map((p, i) => (p - sign * key[i % 64] + 29) % 29);
        assert.deepEqual(plant.map((c, i) => (c + sign * key[i % 64] + 29) % 29), control);
        candidates.push({
          flip, rotation, inverse, sign, ioc: ioc(plain),
          gp: plain.map(i => corpus.translit[i]).join(''),
        });
      }
    }
  }
}
assert.equal(unique.size, 8);
assert.equal(candidates.length, 16);
candidates.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(candidates[0].ioc - 0.037894736842105266) < 1e-12);
assert.ok(Math.abs(candidates.at(-1).ioc - 0.029473684210526315) < 1e-12);

// Source-p57 666 also names Sol, whose 6x6 square contains 36 positions.
// The source-selected three lines contain 18 complete printed words.
// Initial+final Notariqon gives 36 endpoint slots (counting a singleton twice).
const selectedWords = [[36, 0], [13, 2], [33, 0]].flatMap(([p, line]) =>
  pageText[p].split('/').filter(t => runes(t).length)[line]
    .split(/[-.&$]/).map(runes).filter(w => w.length),
);
assert.equal(selectedWords.length, 18);
assert.deepEqual(selectedWords.map(w => w.length), [
  2, 4, 3, 2, 3, 3, 5, 1, 3, 4, 6, 2, 5, 3, 2, 8, 2, 6,
]);
const edges36 = selectedWords.flatMap(w => [w[0], w.at(-1)]);
assert.equal(edges36.length, 36);
assert.equal(primeSum(edges36), 1579);
const sun = [
   6, 32,  3, 34, 35,  1,
   7, 11, 27, 28,  8, 30,
  19, 14, 16, 15, 23, 24,
  18, 20, 22, 21, 17, 13,
  25, 29, 10,  9, 26, 12,
  36,  5, 33,  4,  2, 31,
].map(n => n - 1);
assert.deepEqual([...sun].sort((a, b) => a - b), Array.from({length: 36}, (_, i) => i));
for (let y = 0; y < 6; y++) {
  assert.equal(sun.slice(y * 6, (y + 1) * 6).reduce((s, n) => s + n + 1, 0), 111);
}
const sunKeyOrders = new Set();
const sunCandidates = [];
for (let flip = 0; flip < 2; flip++) {
  for (let rotation = 0; rotation < 4; rotation++) {
    const order = Array(36);
    for (let i = 0; i < 36; i++) {
      let y = Math.floor(i / 6);
      let x = i % 6;
      if (flip) x = 5 - x;
      for (let turn = 0; turn < rotation; turn++) {
        const nx = 5 - y;
        y = x;
        x = nx;
      }
      order[y * 6 + x] = sun[i];
    }
    for (let inverse = 0; inverse < 2; inverse++) {
      const key = (inverse
        ? Array.from({length: 36}, (_, i) => order.indexOf(i))
        : order).map(i => edges36[i]);
      if (sunKeyOrders.has(key.join(','))) continue;
      sunKeyOrders.add(key.join(','));
      for (const sign of [-1, 1]) {
        const plain = unknown.map((c, i) => (c + 29 + sign * key[i % 36]) % 29);
        assert.deepEqual(plain.map((p, i) => (p + 29 - sign * key[i % 36]) % 29), unknown);
        sunCandidates.push({flip, rotation, inverse, sign, ioc: ioc(plain),
          gp: plain.map(i => corpus.translit[i]).join('')});
      }
    }
  }
}
assert.equal(sunKeyOrders.size, 14);
assert.equal(sunCandidates.length, 28);
sunCandidates.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(sunCandidates[0].ioc - 0.047719298245614036) < 1e-12);
assert.ok(Math.abs(sunCandidates.at(-1).ioc - 0.030175438596491227) < 1e-12);


// Separate historical source-word transfer: 666 -> SOL -> SORATH.
// Modern English vowel-restored SORATH is a *candidate*, because the
// Crowley source prints consonantal SVRTh and there is no authenticated
// spelling/consumer rule. The p39 red prime sum173 is the 40th prime,
// making physical p40 the frozen original-cipher target (no page scan).
const sorathTokens = ['S', 'O', 'R', 'A', 'TH'];
const gpIndexByToken = new Map(corpus.translit.map((token, i) => [token, i]));
const sorathKey = sorathTokens.map(s => gpIndexByToken.get(s));
assert.deepEqual(sorathKey, [15, 3, 4, 24, 2]);
assert.equal(primeSum(sorathKey), 173);
assert.equal(primeSum(['S', 'O', 'L'].map(s => gpIndexByToken.get(s))), 133);
const pointedOriginal = corpus.pages[40].indices;
assert.equal(pointedOriginal.length, 231);
const sorathOriginalDecoders = [];
for (const sign of [-1, 1]) for (const literalF of [false, true]) {
  let clock = 0;
  const decoded = pointedOriginal.map(c => {
    if (literalF && c === 0) return 0;
    const p = (c + 29 + sign * sorathKey[clock % sorathKey.length]) % 29;
    clock++;
    return p;
  });
  // Exact ciphertext re-encryption, including p56's source-supported
  // literal-F bypass rule as an optional *bounded* alternate model.
  let reverseClock = 0;
  const reEncrypted = decoded.map((p, i) => {
    if (literalF && pointedOriginal[i] === 0) return 0;
    const c = (p + 29 - sign * sorathKey[reverseClock % sorathKey.length]) % 29;
    reverseClock++;
    return c;
  });
  assert.deepEqual(reEncrypted, pointedOriginal);
  sorathOriginalDecoders.push({sign, literalF, ioc: ioc(decoded),
    gpPrefix: decoded.slice(0, 60).map(i => corpus.translit[i]).join('')});
}
assert.equal(sorathOriginalDecoders.length, 4);
assert.deepEqual(sorathOriginalDecoders.map(x => +x.ioc.toFixed(12)),
  [0.033879164313, 0.037417654809, 0.033992094862, 0.039073969509]);

console.log(JSON.stringify({
  source: 'Agrippa Mercury 8x8, source-p57 666, source64 original physical lines',
  p57Ordinals: ordinals,
  originalSource64PrimeSum: primeSum(source64),
  gridMod64DistinctPerEightByEight: gridBlockDistinct,
  rawP55IoC: ioc(unknown),
  sorathSource: {solGpPrimeSum: 133, sorathGpPrimeSum: 173,
    pointedPage40Length: pointedOriginal.length, variants: sorathOriginalDecoders,
    recoveredOriginalPlaintext: false},
  solarWordEndpoints: {words: selectedWords.length, edgeSlots: edges36.length, primeSum: primeSum(edges36), sourceSingletons: selectedWords.filter(w => w.length === 1).length},
  solarCandidateKeys: sunKeyOrders.size, solarOriginalP55Candidates: sunCandidates.length,
  solarBest: sunCandidates[0], solarWorstIoC: sunCandidates.at(-1).ioc,
  keyVariants: candidates.length,
  best: candidates[0],
  worstIoC: candidates.at(-1).ioc,
  syntheticSolvedP57Recovery: '16/16 variants recover 95/95 by construction',
  authenticUnknownPlaintextRecovered: false,
}, null, 2));
