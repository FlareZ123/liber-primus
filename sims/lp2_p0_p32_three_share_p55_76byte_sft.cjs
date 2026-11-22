'use strict';

/**
 * Original LP2 p0/p32 three-share five-bit packing into the p55/table 76-cell register.
 * Read-only, single-file Node.js 22 test. Prints every measured source-native result.
 * Running: node sims/lp2_p0_p32_three_share_p55_76byte_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const p0 = corpus.pages.find((p) => p.page === 0).indices;
const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const A = p0.slice(20, 141);
const B = p0.slice(141);
const K = p32;

assert.deepEqual([p0.length, A.length, B.length, K.length, p55.length, p57.length, grid.bytes.length],
  [262, 121, 121, 121, 76, 95, 256]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const perimeter = [];
for (let col = 0; col < 8; col++) perimeter.push(grid.bytes[col]);
for (let row = 1; row < 32; row++) perimeter.push(grid.bytes[row * 8 + 7]);
for (let col = 6; col >= 0; col--) perimeter.push(grid.bytes[31 * 8 + col]);
for (let row = 30; row >= 1; row--) perimeter.push(grid.bytes[row * 8]);
assert.equal(perimeter.length, 76);
assert.equal(perimeter[75], 92);

/** Pack all 121 five-bit XOR symbols in source order, with exactly three trailing zero bits. */
function pack(reversedB, reversedK, leastFirst) {
  const bytes = [];
  let accumulator = 0;
  let used = 0;
  for (let i = 0; i < 121; i++) {
    const symbol = A[i] ^ B[reversedB ? 120 - i : i] ^ K[reversedK ? 120 - i : i];
    assert.ok(symbol >= 0 && symbol < 32);
    for (let bit = 0; bit < 5; bit++) {
      accumulator = (accumulator << 1) | ((symbol >> (leastFirst ? bit : 4 - bit)) & 1);
      used++;
      if (used === 8) {
        bytes.push(accumulator);
        accumulator = 0;
        used = 0;
      }
    }
  }
  assert.equal(used, 5);
  bytes.push(accumulator << 3);
  assert.equal(bytes.length, 76);
  assert.equal(bytes[75] & 7, 0);
  return bytes;
}

/** GP29 unigram collision rate, with the original source's exact n(n-1) denominator. */
function ioc(values) {
  const frequency = new Uint16Array(29);
  for (const value of values) frequency[value]++;
  let matching = 0;
  for (const n of frequency) matching += n * (n - 1);
  return matching / (values.length * (values.length - 1));
}

function popcount(value) {
  let n = 0;
  for (let x = value; x; x &= x - 1) n++;
  return n;
}

const models = [];
const comparisons = [];
for (const reversedB of [false, true]) {
  for (const reversedK of [false, true]) {
    for (const leastFirst of [false, true]) {
      const bytes = pack(reversedB, reversedK, leastFirst);
      const equalBytes = bytes.filter((value, i) => value === perimeter[i]).length;
      const hamming = bytes.reduce((total, value, i) => total + popcount(value ^ perimeter[i]), 0);
      comparisons.push({ reversedB, reversedK, leastFirst, equalBytes, hamming });
      for (const xorPerimeter of [false, true]) {
        for (const sign of [-1, 1]) {
          const offset = bytes.map((value, i) => {
            const pad = xorPerimeter ? value ^ perimeter[i] : value;
            return ((sign * (pad % 29)) % 29 + 29) % 29;
          });
          const decrypted = p55.map((value, i) => (value + offset[i]) % 29);
          const planted = p57.slice(0, 76);
          const encrypted = planted.map((value, i) => (value - offset[i] + 29) % 29);
          assert.deepEqual(encrypted.map((value, i) => (value + offset[i]) % 29), planted);
          models.push({ reversedB, reversedK, leastFirst, xorPerimeter, sign, offset,
            ioc: ioc(decrypted), head: decrypted.slice(0, 32).map((i) => corpus.translit[i]).join('') });
        }
      }
    }
  }
}
assert.equal(models.length, 32);
assert.deepEqual(comparisons.map((r) => r.equalBytes), [0, 0, 0, 0, 2, 1, 1, 0]);
assert.deepEqual(comparisons.map((r) => r.hamming), [288, 302, 310, 304, 306, 312, 308, 302]);

/** Source-p55-marginal-preserving position-shuffle control; same model selection on every draw. */
function maxIoc(candidate) {
  let maximum = 0;
  for (const { offset } of models) {
    const decoded = candidate.map((value, i) => (value + offset[i]) % 29);
    maximum = Math.max(maximum, ioc(decoded));
  }
  return maximum;
}
const observed = maxIoc(p55);
assert.ok(Math.abs(observed - 0.04280701754385965) < 1e-14);

let state = 0x37af3301;
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const iterations = 20000;
let exceed = 0;
const nullScores = [];
for (let run = 0; run < iterations; run++) {
  const shuffled = p55.slice();
  for (let j = shuffled.length - 1; j >= 1; j--) {
    const k = nextRandom() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const candidate = maxIoc(shuffled);
  if (candidate >= observed - 1e-12) exceed++;
  nullScores.push(candidate);
}
assert.equal(exceed, 9368);
nullScores.sort((a, b) => a - b);
console.log(JSON.stringify({
  sourceLengths: [p0.length, A.length, B.length, K.length, perimeter.length, p55.length],
  rawComparisons: comparisons,
  bestModel: models.reduce((best, item) => item.ioc > best.ioc ? item : best),
  fixedOriginalMaxIoc: observed,
  sourceMarginalPreservingNull: {
    seed: '0x37af3301', draws: iterations, exceed,
    plusOneUpperTail: (exceed + 1) / (iterations + 1),
    median: nullScores[10000], fifthPercentile: nullScores[1000],
    ninetyFifthPercentile: nullScores[19000]
  },
  nativeGpPlantPositive: '32/32 model branches recover 76/76 original solved p57 runes'
}, null, 2));
