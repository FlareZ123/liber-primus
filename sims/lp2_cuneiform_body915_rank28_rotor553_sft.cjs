'use strict';

/**
 * Source-bound original cuneiform 915-bank rank28 rotor receiver, Issue #2243.
 * Read-only, self-contained Node 22 / Windows 11 SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const doc = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = new Map(doc.pages.map((row) => [row.page, row.indices]));
/** @param {number} index */
function page(index) {
  const values = pages.get(index);
  assert.ok(values, `Missing original LP2 page ${index}`);
  return values;
}

// The distinct p39 section break is before its local index119; the red3
// "UDP" triplet at [119,122) belongs to the NEXT section and is excluded.
const source = [
  ...page(33).slice(91),
  ...page(34), ...page(35), ...page(36), ...page(37), ...page(38),
  ...page(39).slice(0, 119),
];
const unitLengths = [139, 91, 98, 96, 129];
const starts = new Set([0, 139, 230, 328, 424]);
const cipher = source.slice(754, 1307);
const bank = source.slice(0, 754).concat(source.slice(1307));
const BANK = 915;
const MOD = 29;
assert.equal(source.length, 1468);
assert.equal(cipher.length, 553);
assert.equal(bank.length, BANK);
assert.equal(3301 % BANK, 556);
assert.deepEqual(page(39).slice(119, 122), [27, 5, 15]);
const items = [
  page(36).slice(99, 238), page(37).slice(0, 91),
  page(37).slice(91, 189),
  page(37).slice(189).concat(page(38).slice(0, 57)),
  page(38).slice(57, 186),
];
assert.deepEqual(items.map((x) => x.length), unitLengths);
assert.deepEqual(cipher, items.flat());

/** @param {number} n @param {number} modulus */
function mod(n, modulus) {
  return ((n % modulus) + modulus) % modulus;
}

/** @param {number[]} a */
function ioc(a) {
  const freq = new Array(MOD).fill(0);
  for (const n of a) freq[n]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * A complete bijective, one-cipher-predecessor, no-repeat rank28 rotor.
 *
 * For every nonzero cipher step d=(C_j-Cprev) mod29, the corresponding
 * plaintext rune is ((d-1)+sign*bank_rune mod28) mod28.
 * The 29th possible plaintext rune, EA (GP index28), is the exact
 * copied-cipher escape C_j=Cprev. No missing bits or invented sidecar.
 * A per-numbered-unit reset is either fixed zero or continuous state.
 *
 * @param {number[]} source
 * @param {number} phase
 * @param {number} stride
 * @param {number} sign
 * @param {boolean} reset
 * @returns {number[]}
 */
function decode(source, phase, stride, sign, reset) {
  return source.map((value, j) => {
    const previous = j === 0 || (reset && starts.has(j)) ? 0 : source[j - 1];
    const difference = mod(value - previous, MOD);
    return difference === 0 ? 28
      : mod(difference - 1 + sign * (bank[(phase + stride * j) % BANK] % 28), 28);
  });
}

/**
 * @param {number[]} plain
 * @param {number} phase
 * @param {number} stride
 * @param {number} sign
 * @param {boolean} reset
 * @returns {number[]}
 */
function encode(plain, phase, stride, sign, reset) {
  let previous = 0;
  return plain.map((value, j) => {
    if (reset && starts.has(j)) previous = 0;
    const key = bank[(phase + stride * j) % BANK] % 28;
    const difference = value === 28 ? 0 : 1 + mod(value - sign * key, 28);
    previous = (previous + difference) % MOD;
    return previous;
  });
}

const selectedStrides = [1, 556, 914];
const signs = [-1, 1];
const results = [];
for (const reset of [false, true]) {
  for (const stride of selectedStrides) {
    for (const sign of signs) {
      let bestPhase = -1;
      let bestIoC = -Infinity;
      let phase0 = null;
      let aboveThreshold = 0;
      for (let phase = 0; phase < BANK; phase++) {
        const plain = decode(cipher, phase, stride, sign, reset);
        assert.deepEqual(encode(plain, phase, stride, sign, reset), cipher);
        const current = ioc(plain);
        if (phase === 0) phase0 = current;
        if (current > bestIoC) {
          bestIoC = current;
          bestPhase = phase;
        }
        if (current >= 0.045) aboveThreshold++;
      }
      assert.equal(aboveThreshold, 0);
      results.push({reset, stride, sign, bestPhase,
        bestIoC: Number(bestIoC.toFixed(12)),
        phase0IoC: Number(phase0.toFixed(12)),
        aboveThreshold,
      });
    }
  }
}
const expected = [
  [false, 1, -1, 700, 0.037915716644],
  [false, 1, 1, 460, 0.037188458212],
  [false, 556, -1, 174, 0.037673297167],
  [false, 556, 1, 906, 0.037437429567],
  [false, 914, -1, 176, 0.037548811489],
  [false, 914, 1, 758, 0.038000891055],
  [true, 1, -1, 700, 0.037961579789],
  [true, 1, 1, 108, 0.037109835679],
  [true, 556, -1, 174, 0.037673297167],
  [true, 556, 1, 90, 0.037542259612],
  [true, 914, -1, 183, 0.037411222057],
  [true, 914, 1, 758, 0.037968131667],
];
assert.equal(results.length, expected.length);
for (let j = 0; j < expected.length; j++) {
  const a = results[j], b = expected[j];
  assert.equal(a.reset, b[0]);
  assert.equal(a.stride, b[1]);
  assert.equal(a.sign, b[2]);
  assert.equal(a.bestPhase, b[3]);
  assert.ok(Math.abs(a.bestIoC - b[4]) < 1e-11);
}

// A true native-Cicada GP passage is encrypted, then recovered exactly,
// with one explicit GP-EA replacement to exercise the real exception path.
const solvedP57 = page(57);
assert.equal(solvedP57.length, 95);
const native = Array.from({length: cipher.length}, (_, j) => solvedP57[j % solvedP57.length]);
native[230] = 28;
const planted = encode(native, 0, 556, 1, true);
const recovered = decode(planted, 0, 556, 1, true);
assert.deepEqual(recovered, native);
assert.deepEqual(encode(recovered, 0, 556, 1, true), planted);
assert.equal(planted.slice(1).filter((v, j) => v === planted[j]).length, 1);
const wrongPhase = ioc(decode(planted, 1, 556, 1, true));
let peakPhase = -1, peakScore = -Infinity;
for (let phase = 0; phase < BANK; phase++) {
  const score = ioc(decode(planted, phase, 556, 1, true));
  if (score > peakScore) { peakScore = score; peakPhase = phase; }
}
assert.equal(peakPhase, 0);
assert.ok(peakScore > 0.06);
assert.ok(wrongPhase < 0.045);

console.log('PASS: exact printed cuneiform body 1468 = numbered553 + unnumbered915, later p39 red3 excluded');
console.log(`Original GP numbered IoC ${ioc(cipher).toFixed(12)}; solved p57 GP IoC ${ioc(solvedP57).toFixed(12)}`);
for (const result of results) console.log(JSON.stringify(result));
console.log(`Planted native EA escape: ${recovered.length}/${native.length} exact, native IoC ${peakScore.toFixed(12)}, wrong phase ${wrongPhase.toFixed(12)}`);
console.log('All 10,980 complete phase/stride/sign/reset original inverses are below IoC 0.045; no plaintext.');
