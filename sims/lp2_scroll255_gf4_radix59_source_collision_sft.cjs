'use strict';
/**
 * Original-source SFT: p7 five red products -> GF(4) 255-cycle -> p50
 * radix59 table -> three repeated p3-p7 word / p8 rune constraints.
 *
 * This is a candidate *word checksum channel*, not a recovered plaintext.
 * Run with Node.js 22 against the unchanged repository resources.
 * Read-only, Windows-compatible, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));
const parts = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8').split('%');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const target = corpus.pages.find(p => p.page === 8).indices;
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
const mod29 = n => (n % 29 + 29) % 29;
const product29 = word => word.reduce((n, value) => n * value % 29, 1);
const redProducts = redWords.map(product29);
assert.deepEqual(redProducts, [11, 26, 8, 15, 2]);
assert.deepEqual(corpus.pages.find(p => p.page === 7).indices.slice(194), redWords.flat());

/** Preserve printed word boundaries and page-crossing words. */
const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const char of parts[page]) {
    if (runeIndex.has(char)) {
      pending.push(runeIndex.get(char));
    } else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.equal(target.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), corpus.pages
  .filter(p => p.page >= 3 && p.page <= 7)
  .flatMap(p => p.indices));

const pairs = [[47, 240], [48, 231], [235, 236]];
for (const [i, j] of pairs) assert.deepEqual(words[i], words[j]);
assert.deepEqual(words[235], [23, 21]);
const observed = pairs.map(([i, j]) => mod29(target[i] - target[j]));
assert.deepEqual(observed, [8, 18, 14]);

const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert(!tokens.some(token => token[1] === 'f'));
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const table59 = tokens.map(token =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert(table59.every(value => value >= 0 && value <= 251));
const tables = { radix59: table59, radix60: grid.bytes };

/** Standard GF4 multiplication with polynomial x^2+x+1. */
function gf4Multiply(a, b) {
  let result = 0;
  for (let bit = 0; bit < 2; bit++) {
    if ((b >>> bit) & 1) result ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return result;
}

/** One seed digit (position 0-3), four ordered GF4 tap values. */
function orbit(taps, seed, seedPosition) {
  const state = [0, 0, 0, 0];
  state[seedPosition] = seed;
  const addresses = [];
  for (let i = 0; i < 255; i++) {
    addresses.push(state.reduce((acc, digit) => acc * 4 + digit, 0));
    let feedback = 0;
    for (let j = 0; j < 4; j++)
      feedback ^= gf4Multiply(state[j], taps[j]);
    state.splice(0, 4, state[1], state[2], state[3], feedback);
  }
  return { addresses, state };
}
const registered = orbit(redProducts.slice(0, 4).map(x => x % 4),
  redProducts[4] % 4, 0);
assert.deepEqual(registered.state, [2, 0, 0, 0]);
assert.equal(new Set(registered.addresses).size, 255);
assert(!registered.addresses.includes(0));
assert.deepEqual(registered.addresses.slice(0, 8),
  [128, 1, 7, 30, 123, 236, 177, 199]);
assert.deepEqual(pairs.map(([i, j]) => [
  registered.addresses[i], registered.addresses[j]
]), [[8, 120], [32, 31], [43, 173]]);

const pad59 = registered.addresses.map(address => table59[address]);
const pad60 = registered.addresses.map(address => grid.bytes[address]);
assert.deepEqual(pairs.map(([i, j]) => [pad59[i], pad59[j]]),
  [[91, 41], [113, 131], [72, 115]]);
assert.deepEqual(pairs.map(([i, j]) => mod29(pad60[j] - pad60[i])),
  [8, 18, 15]);
assert.deepEqual(pairs.map(([i, j]) => mod29(pad59[j] - pad59[i])),
  observed);

/** Exact inverse of the source-defined additive-pad hypothesis. */
const wordValue = target.map((rune, i) => mod29(rune + pad59[i]));
for (const [i, j] of pairs) assert.equal(wordValue[i], wordValue[j]);
assert.deepEqual(pairs.map(([i]) => wordValue[i]), [20, 8, 2]);
const replay = wordValue.map((rune, i) => mod29(rune - pad59[i]));
assert.deepEqual(replay, target);

/** Enumerate nearby red-product rotations and field state conventions. */
const predicted = new Set();
const exact = [];
let fullCycles = 0;
let tested = 0;
for (let rotation = 0; rotation < 5; rotation++) {
  const products = redProducts.slice(rotation)
    .concat(redProducts.slice(0, rotation));
  for (const reverseTaps of [false, true]) {
    const taps = products.slice(0, 4).map(v => v % 4);
    if (reverseTaps) taps.reverse();
    for (let seedPosition = 0; seedPosition < 4; seedPosition++) {
      const addresses = orbit(taps, products[4] % 4, seedPosition).addresses;
      if (new Set(addresses).size !== 255) continue;
      fullCycles++;
      for (const [radix, table] of Object.entries(tables)) {
        for (const sign of [-1, 1]) {
          for (const reversedAddress of [false, true]) {
            tested++;
            const key = i => table[
              reversedAddress ? 255 - addresses[i] : addresses[i]];
            const signature = pairs.map(([i, j]) =>
              mod29(sign * (key(j) - key(i))));
            predicted.add(signature.join(','));
            if (signature.every((value, i) => value === observed[i])) {
              exact.push({ rotation, reverseTaps, seedPosition, radix,
                sign, reversedAddress });
            }
          }
        }
      }
    }
  }
}
assert.equal(fullCycles, 8);
assert.equal(tested, 64);
assert.equal(predicted.size, 62);
assert.deepEqual(exact, [{
  rotation: 0, reverseTaps: false, seedPosition: 0, radix: 'radix59',
  sign: 1, reversedAddress: false
}]);

const sameWordHashes = {
  GP0: words.map(w => mod29(w.reduce((s, x) => s + x, 0))),
  primeSum: words.map(w => mod29(w.reduce((s, x) => s + corpus.prime[x], 0))),
  product: words.map(w => product29(w))
};
for (const [name, sourceHash] of Object.entries(sameWordHashes)) {
  let best = 0;
  for (let a = 0; a < 29; a++)
    for (let b = 0; b < 29; b++) {
      let hits = 0;
      for (let i = 0; i < 255; i++)
        hits += Number(mod29(a * sourceHash[i] + b) === wordValue[i]);
      best = Math.max(best, hits);
    }
  assert.equal(best, { GP0: 20, primeSum: 20, product: 21 }[name]);
  console.log('ORIGINAL_FULL_255_AFFINE_WORD_HASH ' +
    JSON.stringify({ name, best, total: 255 }));
}
function ioc(values) {
  const freq = Array.from({ length: 29 }, () => 0);
  for (const value of values) freq[value]++;
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) /
    (values.length * (values.length - 1));
}
assert(Math.abs(ioc(wordValue) - 0.03727034120734908) < 1e-11);
assert(ioc(wordValue) < ioc(corpus.pages.find(p => p.page === 57).indices));

/** A deterministic histogram-preserving six-position permutation null. */
let rng = 0x3301a14c;
function rand() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const reps = 500000;
let familyHits = 0, fixedHits = 0;
for (let trial = 0; trial < reps; trial++) {
  const seen = new Set(), six = [];
  while (six.length < 6) {
    const position = rand() % 255;
    if (!seen.has(position)) {
      seen.add(position);
      six.push(target[position]);
    }
  }
  const signature = [
    mod29(six[0] - six[1]),
    mod29(six[2] - six[3]),
    mod29(six[4] - six[5])
  ].join(',');
  if (predicted.has(signature)) familyHits++;
  if (signature === observed.join(',')) fixedHits++;
}
assert.deepEqual([familyHits, fixedHits], [1342, 23]);

// Positive full-length source-word checksum model, not historical evidence.
const plantedMap = new Map(words.map(w => {
  const str = w.join(',');
  return [str, mod29(17 * w.reduce((s, x) => s + x, 0) + 9)];
}));
const plantedCipher = words.map((w, i) =>
  mod29(plantedMap.get(w.join(',')) - pad59[i]));
const plantedRecovered = plantedCipher.map((r, i) => mod29(r + pad59[i]));
assert.deepEqual(plantedRecovered, words.map(w => plantedMap.get(w.join(','))));
console.log('SOURCE_GF4_RADIX59_REGISTER '+JSON.stringify({
  p7Products: redProducts, cells: 256, GF4States: 255, omittedCell: 0,
  originalPairs: pairs, ciphertextDifferences: observed,
  base60Predictions: [8, 18, 15], base59Predictions: [8, 18, 14],
  exactConfigurations: exact, fullCycles, candidates: tested,
  distinctSignatures: predicted.size, correctedIoc: ioc(wordValue),
  solvedP57Ioc: ioc(corpus.pages.find(p => p.page === 57).indices),
  shuffledFamilywise: familyHits, shuffledTrials: reps,
  fixedSignatureHits: fixedHits, syntheticPositiveRecovered: 255
}));
