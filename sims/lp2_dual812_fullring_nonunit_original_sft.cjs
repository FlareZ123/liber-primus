/**
 * Source-constrained complete GF(29)[epsilon] pair/exception transport test.
 * Exact original LP2 unknown p0..p55, including all 86 within-page
 * repeated glyphs. This does not assert a Cicada-authored cipher.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8',
));
const P = 29;
/** @param {number} x @returns {number} */
const mod = (x) => ((x % P) + P) % P;
/** @param {number} a @returns {number} */
const inverse = (a) => {
  assert(a > 0 && a < P);
  for (let i = 1; i < P; i += 1) if (a * i % P === 1) return i;
  throw Error('not invertible');
};

/** @typedef {{a:number,b:number}} Dual */
/** @param {Dual} x @param {Dual} y @returns {Dual} */
const multiply = (x, y) => ({
  a: mod(x.a * y.a),
  b: mod(x.a * y.b + x.b * y.a),
});

const generator = {a: 19, b: 13};
const powers = [];
const log = new Map();
let state = {a: 1, b: 0};
for (let k = 0; k < 812; k += 1) {
  const id = state.a + ',' + state.b;
  assert(!log.has(id));
  log.set(id, k);
  powers.push(state);
  state = multiply(state, generator);
}
assert.deepEqual(state, {a: 1, b: 0});
assert.equal(log.size, 812);
assert([...log.keys()].every((id) => Number(id.split(',')[0]) !== 0));

/**
 * Complete bijection from two GP29 runes to two GP29 register symbols.
 * r=28 denotes a nonunit (a repeated rune); other r are k mod 28.
 * @param {number} x Previous source rune.
 * @param {number} y Next source rune.
 * @returns {{q:number,r:number}}
 */
function encodePair(x, y) {
  assert(Number.isInteger(x) && x >= 0 && x < P);
  assert(Number.isInteger(y) && y >= 0 && y < P);
  const a = mod(y - x);
  if (a === 0) return {q: x, r: 28};
  const k = log.get(a + ',' + x);
  assert.notEqual(k, undefined);
  return {q: Math.floor(k / 28), r: k % 28};
}

/**
 * Exact reverse mapping, including all 29 zero-divisor elements.
 * @param {number} q
 * @param {number} r
 * @returns {[number,number]}
 */
function decodePair(q, r) {
  assert(Number.isInteger(q) && q >= 0 && q < 29);
  assert(Number.isInteger(r) && r >= 0 && r < 29);
  if (r === 28) return [q, q];
  const {a, b} = powers[28 * q + r];
  return [b, mod(a + b)];
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const h = Array(29).fill(0);
  for (const s of symbols) {
    assert(Number.isInteger(s) && s >= 0 && s < 29);
    h[s] += 1;
  }
  const n = symbols.length;
  return h.reduce((v, c) => v + c * (c - 1), 0) / (n * (n - 1));
}

/** @param {number[]} source @returns {{first:number, q:number[], r:number[]}} */
function encodeSequence(source) {
  assert(source.length > 0);
  const q = [], r = [];
  for (let i = 1; i < source.length; i += 1) {
    const pair = encodePair(source[i - 1], source[i]);
    q.push(pair.q);
    r.push(pair.r);
  }
  return {first: source[0], q, r};
}

/**
 * Checks overlapping-pair consistency, so arbitrary ring state streams
 * do not masquerade as a valid original rune sequence.
 * @param {{first:number,q:number[],r:number[]}} encoded
 * @returns {number[]}
 */
function decodeSequence(encoded) {
  assert.equal(encoded.q.length, encoded.r.length);
  const result = [encoded.first];
  for (let i = 0; i < encoded.q.length; i += 1) {
    const [x, y] = decodePair(encoded.q[i], encoded.r[i]);
    assert.equal(x, result[result.length - 1]);
    result.push(y);
  }
  return result;
}

// Every one of 29^2 ordered pairs has exactly one complete register pair.
const allCodes = new Set();
for (let x = 0; x < 29; x += 1) {
  for (let y = 0; y < 29; y += 1) {
    const {q, r} = encodePair(x, y);
    allCodes.add(q + ',' + r);
    assert.deepEqual(decodePair(q, r), [x, y]);
    if (x === y) {
      assert.equal(r, 28);
      assert.equal(q, x);
    } else {
      assert(r < 28);
      const a = mod(y - x);
      const exactMod29 = mod(26 * x * inverse(a));
      assert.equal(mod(28 * q + r), exactMod29);
      // Since 28q+r = -q+r (mod 29), q is fixed by x and r:
      assert.equal(q, mod(r - exactMod29));
    }
  }
}
assert.equal(allCodes.size, 29 * 29);

const original = data.pages.filter((entry) => entry.page < 56 && entry.indices.length);
assert.equal(original.length, 55);
let runeCount = 0, duplicateCount = 0;
const allQ = [], allR = [];
for (const page of original) {
  const x = page.indices;
  runeCount += x.length;
  const encoded = encodeSequence(x);
  allQ.push(...encoded.q);
  allR.push(...encoded.r);
  duplicateCount += encoded.r.filter((r) => r === 28).length;
  assert.deepEqual(decodeSequence(encoded), x);
}
assert.equal(runeCount, 12956);
assert.equal(allQ.length, 12901);
assert.equal(allR.length, 12901);
assert.equal(duplicateCount, 86);
assert.equal(allR.filter((r) => r === 28).length, 86);

// This is the exact redundant 812-unit encoding reduced to the GP29
// logarithm of the nonzero step, with 28 as its explicit repeat marker.
const realLog = Array(29).fill(-1);
const realPow = [];
let real = 1;
for (let r = 0; r < 28; r += 1) {
  assert.equal(realLog[real], -1);
  realLog[real] = r;
  realPow.push(real);
  real = mod(real * 19);
}
assert.equal(real, 1);
for (const page of original) {
  const {indices: x} = page, coded = encodeSequence(x);
  for (let i = 1; i < x.length; i += 1) {
    const delta = mod(x[i] - x[i - 1]);
    assert.equal(coded.r[i - 1], delta ? realLog[delta] : 28);
    assert.equal(x[i], mod(x[i - 1] + (coded.r[i - 1] === 28 ? 0 : realPow[coded.r[i - 1]])));
  }
}

// A genuine solved p57 native plaintext is encoded under the hypothesized
// log-difference cipher and recovered 95/95 including all three literal F.
// An appended EA,F,EA tests both nilpotent repeat events and native F.
const solved = data.pages.find((entry) => entry.page === 57);
assert(solved && solved.status === 'solved' && solved.indices.length === 95);
assert.equal(solved.indices.filter((v) => v === 0).length, 3);
/** @param {number[]} plaintext @returns {number[]} */
function plant(plaintext) {
  const c = [plaintext[0]];
  for (let i = 1; i < plaintext.length; i += 1) {
    const step = plaintext[i] === 28 ? 0 : realPow[plaintext[i]];
    c.push(mod(c[c.length - 1] + step));
  }
  return c;
}
/** @param {number[]} ciphertext @returns {number[]} */
function readDiff(ciphertext) {
  const out = [ciphertext[0]];
  for (let i = 1; i < ciphertext.length; i += 1) {
    const d = mod(ciphertext[i] - ciphertext[i - 1]);
    out.push(d === 0 ? 28 : realLog[d]);
  }
  return out;
}
const planted = plant(solved.indices);
assert.deepEqual(readDiff(planted), solved.indices);
assert.deepEqual(planted.slice(0, 95).every((r) => r < 29), true);
const extended = solved.indices.concat([28, 0, 28]);
assert.deepEqual(readDiff(plant(extended)), extended);
assert.equal(plant(extended).slice(1).filter((v, i) => v === plant(extended)[i]).length, 2);

console.log(JSON.stringify({
  gpStates: 29 * 29,
  unitStates: log.size,
  nilpotentStates: 29,
  originalPages: original.length,
  originalRunes: runeCount,
  firstRuneSeeds: original.length,
  originalTransitions: allR.length,
  completeRepeatMarkers: duplicateCount,
  qProjectionIoC: indexOfCoincidence(allQ),
  rProjectionIoC: indexOfCoincidence(allR),
  originalUntransformedIoC: indexOfCoincidence(original.flatMap((p) => p.indices)),
  originalSolvedP57IoC: indexOfCoincidence(solved.indices),
  plantedNativeGP57Recovered: solved.indices.length,
  plantedWithTwoRepeatMarksRecovered: extended.length,
  conclusion: 'exact full source lossless ring completion; no GP29 plaintext/key from fixed q/r projections',
}, null, 2));
