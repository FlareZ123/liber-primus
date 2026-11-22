'use strict';

/**
 * Original LP2 p0-p2 27-square / p49-p51 page-sized ring consumer.
 * Single-file test: node sims/lp2_p0_square_p50_page_ring_256_sft.cjs
 * Hypothesis only. No source instruction selects this particular pairing.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));

const first = corpus.pages.slice(0, 3);
assert.deepEqual(first.map(p => [p.page, p.runic_count]), [[0, 262], [1, 266], [2, 201]]);
const cipher = first.flatMap(p => p.indices);
assert.equal(cipher.length, 729);
assert.deepEqual(grid.pages.map(p => [p.page, p.bytes.length]), [[49, 80], [50, 104], [51, 72]]);
const chunks = grid.pages.map(p => p.bytes);
const key = chunks.flat();
assert.equal(key.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(key)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * Return source offsets from a clockwise top-left corner walk of a single ring.
 * @param {number} depth Inward depth from the edge of a 27x27 row-major grid.
 * @returns {number[]}
 */
function ringIndices(depth) {
  const lo = depth;
  const hi = 26 - depth;
  const offsets = [];
  for (let c = lo; c <= hi; c++) offsets.push(27 * lo + c);
  for (let r = lo + 1; r <= hi; r++) offsets.push(27 * r + hi);
  for (let c = hi - 1; c >= lo; c--) offsets.push(27 * hi + c);
  for (let r = hi - 1; r > lo; r--) offsets.push(27 * r + lo);
  return offsets;
}

/**
 * Read ring from a chosen corner in either direction.
 * Choices 0,2,4,6: clockwise; 1,3,5,7: counterclockwise.
 * @param {number[]} offsets Ring offsets, clockwise from its top-left.
 * @param {number} choice Corner/direction index, 0 through 7.
 * @returns {number[]}
 */
function readRing(offsets, choice) {
  const L = offsets.length;
  const start = Math.floor(choice / 2) * (L / 4);
  const direction = choice % 2 === 0 ? 1 : -1;
  return Array.from({ length: L }, (_, i) => cipher[offsets[(start + direction * i + L) % L]]);
}

/**
 * GP29 index of coincidence.
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((total, n) => total + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/**
 * Apply the literal byte-mod29 additive candidate key with fixed sign.
 * @param {number[]} text Cipher or plaintext rune indices.
 * @param {number} sign Either -1 or 1.
 * @returns {number[]}
 */
function shift(text, sign) {
  return text.map((v, i) => (v + sign * (key[i] % 29) + 58) % 29);
}

const depths = [3, 0, 4];
const rings = depths.map(ringIndices);
assert.deepEqual(rings.map(r => r.length), [80, 104, 72]);
assert.equal(new Set(rings.flat()).size, 256);
const alternatives = rings.map(ring => Array.from({ length: 8 }, (_, choice) => readRing(ring, choice)));
const defaultReading = alternatives.map(options => options[0]).flat();
assert.equal(ioc(defaultReading), 0.03327205882352941);
assert.equal(ioc(shift(defaultReading, -1)), 0.036427696078431375);
assert.equal(ioc(shift(defaultReading, +1)), 0.036458333333333336);

const scores = [];
for (let a = 0; a < 8; a++) {
  for (let b = 0; b < 8; b++) {
    for (let c = 0; c < 8; c++) {
      const input = alternatives[0][a].concat(alternatives[1][b], alternatives[2][c]);
      for (const sign of [-1, 1]) {
        scores.push({ a, b, c, sign, coincidence: ioc(shift(input, sign)) });
      }
    }
  }
}
assert.equal(scores.length, 1024);
scores.sort((x, y) => y.coincidence - x.coincidence);
assert.deepEqual(scores.slice(0, 2).map(s => [s.a, s.b, s.c, s.sign]), [[7, 4, 2, 1], [2, 4, 5, 1]]);
assert.equal(scores[0].coincidence, 0.03786764705882353);
assert.equal(scores[scores.length - 1].coincidence, 0.031924019607843135);
assert.equal(scores.filter(s => s.coincidence >= 0.04).length, 0);

// Independent known-clear GP source positive: encrypt 256 planted p57 symbols with
// this identical byte schedule, then invert. This is not a claim about LP2.
const p57 = corpus.pages.find(p => p.page === 57);
assert.equal(p57.runic_count, 95);
const planted = Array.from({ length: 256 }, (_, i) => p57.indices[i % p57.indices.length]);
for (const sign of [-1, 1]) {
  const encrypted = shift(planted, -sign);
  assert.deepEqual(shift(encrypted, sign), planted);
}

console.log(JSON.stringify({
  input: 'original p0-p2 729 source runes and 256 original p49-p51 table bytes',
  sourcePageSplits: chunks.map(p => p.length),
  ringDepths: depths,
  ringLengths: rings.map(r => r.length),
  distinctCipherCells: new Set(rings.flat()).size,
  naturalCipherIoC: ioc(defaultReading),
  naturalMinusIoC: ioc(shift(defaultReading, -1)),
  naturalPlusIoC: ioc(shift(defaultReading, +1)),
  fullyEnumeratedModels: scores.length,
  best: scores[0],
  minimum: scores[scores.length - 1].coincidence,
  modelsIoCAtLeast004: 0,
  solvedP57PlantRecovered: '256/256 for both signs',
}, null, 2));


/**
 * Invert one GP28 nonzero-step consumer, with GP index0 as the literal-F
 * sentinel whenever delta=0. The source rune trail is traversed exactly once.
 * @param {number[]} input Source cipher values in ring-reading order.
 * @param {'rank'|'dlog'} kind Nonzero step rank or discrete log base15.
 * @param {-1|1} sign Key sign.
 * @returns {number[]}
 */
function decodeSteps(input, kind, sign) {
  let previous = 0;
  return input.map((value, i) => {
    const delta = (value - previous + 29) % 29;
    previous = value;
    if (delta === 0) return 0;
    const rank = kind === 'rank' ? delta - 1 : log15[delta];
    return 1 + (rank + sign * (key[i] % 28) + 56) % 28;
  });
}

/**
 * Forward reconstruction of all 256 original GP29 ciphertext values.
 * @param {number[]} plain Source-native GP29 plaintext indices.
 * @param {'rank'|'dlog'} kind
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encodeSteps(plain, kind, sign) {
  let previous = 0;
  return plain.map((value, i) => {
    const rank = (value - 1 - sign * (key[i] % 28) + 56) % 28;
    const delta = value === 0 ? 0 : kind === 'rank' ? rank + 1 : pow15[rank];
    previous = (previous + delta) % 29;
    return previous;
  });
}

const pow15 = Array.from({ length: 28 }, (_, i) => {
  let value = 1;
  for (let k = 0; k < i; k++) value = (value * 15) % 29;
  return value;
});
assert.equal(new Set(pow15).size, 28);
const log15 = Array(29).fill(-1);
pow15.forEach((value, i) => { log15[value] = i; });
const differentialScores = [];
for (let a = 0; a < 8; a++) {
  for (let b = 0; b < 8; b++) {
    for (let c = 0; c < 8; c++) {
      const input = alternatives[0][a].concat(alternatives[1][b], alternatives[2][c]);
      for (const kind of ['rank', 'dlog']) {
        for (const sign of [-1, 1]) {
          const plain = decodeSteps(input, kind, sign);
          assert.deepEqual(encodeSteps(plain, kind, sign), input);
          differentialScores.push({ a, b, c, kind, sign, coincidence: ioc(plain) });
        }
      }
    }
  }
}
assert.equal(differentialScores.length, 2048);
differentialScores.sort((a, b) => b.coincidence - a.coincidence);
assert.equal(differentialScores[0].coincidence, 0.03759191176470588);
assert.deepEqual(differentialScores.slice(0, 2).map(({ a, b, c, kind, sign }) => [a, b, c, kind, sign]), [
  [0, 4, 2, 'rank', -1],
  [4, 6, 6, 'rank', 1],
]);
assert.equal(differentialScores.filter(s => s.coincidence >= 0.04).length, 0);
assert.deepEqual(differentialScores.filter(s => s.a === 0 && s.b === 0 && s.c === 0).map(s => s.coincidence).sort((a, b) => b - a), [
  0.03655024509803922, 0.035355392156862744, 0.0352328431372549, 0.03480392156862745,
]);
for (const kind of ['rank', 'dlog']) {
  for (const sign of [-1, 1]) {
    const encrypted = encodeSteps(planted, kind, sign);
    assert.deepEqual(decodeSteps(encrypted, kind, sign), planted);
  }
}
console.log(JSON.stringify({
  differentialOriginalModels: differentialScores.length,
  differentialBest: differentialScores[0],
  differentialAtLeast004: differentialScores.filter(s => s.coincidence >= 0.04).length,
  differentialPlantedGPRecovery: '256/256 for rank and log15, both signs',
}, null, 2));
