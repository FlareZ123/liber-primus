'use strict';

/**
 * Original LP2 p53/p54 red60 as a source-selected radix60 digit dictionary.
 * Tests a key from two genuine original red spans against solved p56's 84
 * independently known prime-totient key steps, then inspects the p55 rim.
 *
 * Node 22 CommonJS SFT. Source files are read-only. No invented p55 plaintext.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const mod = (n) => ((n % 29) + 29) % 29;
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes))
  .digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const red60 = corpus.pages[53].indices.slice(128)
  .concat(corpus.pages[54].indices.slice(0, 9));
assert.equal(corpus.pages[53].indices.length, 179);
assert.equal(red60.length, 60);
assert.equal(new Set(red60).size, 26);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
const digits = tokens.map((token) => {
  const high = grid.alphabet.indexOf(token[0]);
  const low = grid.alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return [high, low];
});
for (let i = 0; i < digits.length; i++) {
  assert.equal(60 * digits[i][0] + digits[i][1], grid.bytes[i]);
}

/**
 * Source rectangle clockwise ring, beginning at its top-left cell.
 * @param {number} depth - Border layer, zero through three.
 * @returns {number[]} Flattened source table positions.
 */
function ring(depth) {
  const list = [];
  const top = depth;
  const left = depth;
  const bottom = 31 - depth;
  const right = 7 - depth;
  for (let col = left; col <= right; col++) list.push(top * 8 + col);
  for (let row = top + 1; row <= bottom; row++)
    list.push(row * 8 + right);
  for (let col = right - 1; col >= left; col--)
    list.push(bottom * 8 + col);
  for (let row = bottom - 1; row > top; row--)
    list.push(row * 8 + left);
  return list;
}
assert.deepEqual([0, 1, 2, 3].map((d) => ring(d).length),
  [76, 68, 60, 52]);
const rowInterior = [];
for (let row = 1; row <= 30; row++) {
  for (let col = 1; col <= 6; col++) rowInterior.push(row * 8 + col);
}
const shellInterior = [1, 2, 3].flatMap(ring);
assert.equal(rowInterior.length, 180);
assert.equal(shellInterior.length, 180);

const modes = {
  low: ([high, low]) => red60[low],
  high: ([high, low]) => red60[high],
  sum: ([high, low]) => mod(red60[high] + red60[low]),
  highMinusLow: ([high, low]) => mod(red60[high] - red60[low]),
  lowMinusHigh: ([high, low]) => mod(red60[low] - red60[high])
};

/** @param {number} n - Number of prime-based key steps. */
function totientSteps(n) {
  const key = [];
  for (let v = 2; key.length < n; v++) {
    let isPrime = true;
    for (let d = 2; d * d <= v; d++) {
      if (v % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) key.push(mod(v - 1));
  }
  return key;
}
const knownKey = totientSteps(84);
const printed56 = corpus.pages[56].indices;
let clock = 0;
const solved56 = printed56.map((c, i) =>
  i === 56 ? (assert.equal(c, 0), 0) :
    mod(c - knownKey[clock++]));
assert.equal(clock, 84);
assert.equal(solved56.map((x) => corpus.translit[x]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

const known = [];
for (const [walk, positions] of [
  ['inner-row', rowInterior], ['inner-shell', shellInterior]]) {
  for (const [mode, read] of Object.entries(modes)) {
    const matches = [];
    let keyPos = 0;
    for (let i = 0; i < 85; i++) {
      if (i === 56) continue;
      const expected = mod(printed56[i] - solved56[i]);
      assert.equal(expected, knownKey[keyPos++]);
      if (read(digits[positions[i]]) === expected) matches.push(i);
    }
    assert.equal(keyPos, 84);
    known.push({walk, mode, hitsOf84: matches.length, positions: matches});
  }
}
assert.equal(known.length, 10);
assert.equal(Math.max(...known.map((r) => r.hitsOf84)), 7);
assert.deepEqual(known.find((r) =>
  r.walk === 'inner-shell' && r.mode === 'high').positions,
[5, 6, 11, 46, 57, 63, 81]);

// Original-rune p55 candidates are classified, never treated as plaintext.
const printed55 = corpus.pages[55].indices;
const outer = ring(0);
function coincidence(a) {
  const counts = Array(29).fill(0);
  for (const value of a) counts[value]++;
  return counts.reduce((sum, value) =>
    sum + value * (value - 1), 0) / (a.length * (a.length - 1));
}
const rim = [];
for (const [mode, read] of Object.entries(modes)) {
  for (const reversed of [false, true]) {
    const positions = reversed ? [...outer].reverse() : outer;
    for (const sign of [1, -1]) {
      const key = positions.map((idx) => read(digits[idx]));
      const candidate = printed55.map((c, i) => mod(c + sign * key[i]));
      assert.deepEqual(candidate.map((p, i) =>
        mod(p - sign * key[i])), printed55);
      rim.push({
        mode, reversed, sign, coincidence: coincidence(candidate),
        first36: candidate.slice(0, 36).map((x) => corpus.translit[x]).join('')
      });
    }
  }
}
assert.equal(rim.length, 20);
rim.sort((a, b) => b.coincidence - a.coincidence);
assert.equal(rim[0].mode, 'sum');
assert.equal(rim[0].reversed, false);
assert.equal(rim[0].sign, 1);
assert(Math.abs(rim[0].coincidence - 0.04105263157894737) < 1e-12);

// Native-length source-key positive controls verify inverse and clock skip.
for (const [walk, positions] of [
  ['inner-row', rowInterior], ['inner-shell', shellInterior]]) {
  for (const [mode, read] of Object.entries(modes)) {
    const artificial56 = solved56.map((p, i) =>
      i === 56 ? p : mod(p + read(digits[positions[i]])));
    const recovered = artificial56.map((c, i) =>
      i === 56 ? c : mod(c - read(digits[positions[i]])));
    assert.deepEqual(recovered, solved56);
  }
}
for (const [mode, read] of Object.entries(modes)) {
  const key = outer.map((p) => read(digits[p]));
  const plant = corpus.pages[57].indices.slice(0, 76);
  const ciphertext = plant.map((p, i) => mod(p + key[i]));
  assert.deepEqual(ciphertext.map((c, i) => mod(c - key[i])), plant);
}

console.log(JSON.stringify({
  redSpan: 'p53:128..178 (51), p54:0..8 (9)',
  testedKnownP56KeyConsumers: known.length,
  knownP56PrimeKeySteps: 84,
  knownP56Gate: known,
  originalP55RimConsumers: rim.length,
  originalP55UnchangedCoincidence: coincidence(printed55),
  strongestOriginalP55RimCandidate: rim[0],
  sourceNativePositivePlants: '10/10 p56 with F bypass; 5/5 p55 rim',
  verdict: 'No exact p56 84-step key identity and no readable p55 rim passage'
}, null, 2));
