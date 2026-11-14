'use strict';
/**
 * A source-derived, all-changing-key GP30 Fibonacci projective cipher gate.
 * The 2014 LP2 p15 Fibonacci spiral plus infinity selects T(x)=1+1/x,
 * whose two GF29 fixed points are 6 (G) and 24 (A=3301 mod29).
 * Test every possible secret per-rune choice of T^k via the exact fixed-A
 * count invariant, with original unknown LP2 and two native-GP controls.
 * Run: node sims/lp2_p15_projective_fibonacci_allstate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
/** @param {number} value */
const mod = value => ((value % 29) + 29) % 29;
/** @param {number} value */
function inv(value) {
  assert.notEqual(value, 0);
  for (let k = 1; k < 29; k++) if (value * k % 29 === 1) return k;
  throw Error('Nonzero GP field has no inverse');
}
/** @param {number} value GP finite rune or infinity as 29. */
function T(value) {
  return value === 29 ? 1 : value === 0 ? 29 : mod(1 + inv(value));
}
/** @param {number} value @param {number} power */
function apply(value, power) {
  for (let i = 0; i < power; i++) value = T(value);
  return value;
}
assert.equal(3301 % 29, 24);
assert.equal(mod(24 * 24 - 24 - 1), 0);
assert.equal(mod(6 * 6 - 6 - 1), 0);
const fixed = [];
for (let x = 0; x <= 29; x++) if (T(x) === x) fixed.push(x);
assert.deepEqual(fixed, [6, 24]);
for (let x = 0; x <= 29; x++) {
  assert.equal(apply(x, 14), x);
  for (let k = 0; k < 14; k++) {
    assert.equal(apply(apply(x, k), (14 - k) % 14), x);
  }
}
const orbitOf = start => {
  const orbit = [];
  let x = start;
  do {
    orbit.push(x);
    x = T(x);
  } while (x !== start);
  return orbit;
};
const orbitInfinity = orbitOf(29);
const orbitOther = orbitOf(4);
assert.equal(orbitInfinity.length, 14);
assert.equal(orbitOther.length, 14);
assert.equal(new Set([...orbitInfinity, ...orbitOther, ...fixed]).size, 30);

// Source-specific independent connection: p39 red triad, not p3, has
// a double zero at one Fibonacci fixed point. This does not authenticate
// the use of the projective cipher or any following page transition.
/** @param {number[]} coefficients @param {number} x */
const evalQ = (coefficients, x) =>
  mod(coefficients[0] + coefficients[1] * x +
  coefficients[2] * x * x);
const q39 = [27, 5, 15], q3 = [13, 23, 2];
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), q39);
assert.deepEqual(corpus.pages[3].indices.slice(119, 122), q3);
assert.equal(evalQ(q39, 24), 0);
assert.equal(mod(q39[1] + 2 * q39[2] * 24), 0);
assert.notEqual(evalQ(q39, 6), 0);
assert.notEqual(evalQ(q3, 24), 0);

const original = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const originalA = original.filter(x => x === 24).length;
const originalG = original.filter(x => x === 6).length;
assert.equal(originalA, 482);
assert.equal(originalG, 438);

// All 14 secret states fix A and G separately. The plaintext GP-A count
// is necessarily exactly originalA, for *every possible per-symbol
// key schedule*, including a state chosen adversarially from plaintext.
for (let k = 0; k < 14; k++) {
  assert.equal(apply(24, k), 24);
  assert.equal(apply(6, k), 6);
  for (let x = 0; x <= 29; x++) {
    assert.equal(apply(x, k) === 24, x === 24);
    assert.equal(apply(x, k) === 6, x === 6);
  }
}

// Native GP29 orthographic register taken from repository controls:
// TH, NG, EO, OE, AE, IA, EA; ING represented as one NG rune;
// K->C, V->U, Z->S, QU->CW. A counts do not depend on IO/IA style.
/** @param {string} text */
function toGP(text) {
  const source = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/[^A-Z]/g, '');
  const tokens = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < source.length;) {
    const matched = tokens.find(item => source.startsWith(item.token, i));
    if (!matched) {
      i++;
      continue;
    }
    out.push(matched.index);
    i += matched.token.length;
  }
  return out;
}
/** @param {number[]} gp */
function nativeWindows(gp) {
  const n = original.length;
  assert(gp.length >= n);
  let count = 0, lowest = Infinity, highest = -Infinity, below = 0;
  let gCount = 0, minG = Infinity, maxG = -Infinity, atOrAboveOriginalG = 0;
  for (let i = 0; i < n; i++) {
    count += Number(gp[i] === 24);
    gCount += Number(gp[i] === 6);
  }
  for (let i = 0; i <= gp.length - n; i++) {
    lowest = Math.min(lowest, count);
    highest = Math.max(highest, count);
    below += Number(count <= originalA);
    minG = Math.min(minG, gCount);
    maxG = Math.max(maxG, gCount);
    atOrAboveOriginalG += Number(gCount >= originalG);
    if (i + n < gp.length) {
      count += Number(gp[i + n] === 24) - Number(gp[i] === 24);
      gCount += Number(gp[i + n] === 6) - Number(gp[i] === 6);
    }
  }
  return {runes: gp.length, windows: gp.length - n + 1,
    minA: lowest, maxA: highest, atOrBelowOriginal: below,
    minG, maxG, atOrAboveOriginalG};
}
const controls = {
  shakespeare: nativeWindows(toGP(read('resources/control/shakespeare_first300k.txt'))),
  gibran: nativeWindows(toGP(read('resources/control/gibran_prophet_58585.txt')))
};
assert.deepEqual(controls.shakespeare,
  {runes:215718, windows:202763, minA:707, maxA:919, atOrBelowOriginal:0,
    minG:105, maxG:224, atOrAboveOriginalG:0});
assert.deepEqual(controls.gibran,
  {runes:62132, windows:49177, minA:729, maxA:922, atOrBelowOriginal:0,
    minG:136, maxG:300, atOrAboveOriginalG:0});

// Real LP2 p57 plaintext positive: every publicly selected p15 spiral
// key correctly recovers all original solved GP runes. Importantly,
// the inverse never has to guess plaintext or source word boundaries.
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const keyAt = index => spiral[index % spiral.length] % 14;
const planted = p57.map((v, i) => apply(v, keyAt(i)));
const recovered = planted.map((v, i) => apply(v, (14-keyAt(i)) % 14));
assert.deepEqual(recovered, p57);
assert.deepEqual(
  original.map((v, i) => apply(apply(v, keyAt(i)), (14-keyAt(i)) % 14)),
  original
);

console.log(JSON.stringify({
  source: { p15: 'Fibonacci with infinity',
    p39RedPolynomial: q39, p3RedControl: q3 },
  projective: {
    map: 'T(x)=1+1/x over P1(F29)',
    order: 14, fixedGP: [corpus.translit[6],corpus.translit[24]],
    fixedIndices: fixed, infinityOrbit: orbitInfinity, otherOrbit: orbitOther
  },
  original: {
    runeCount:original.length, A:originalA, G:originalG,
    fixedAUnderEverySecretSchedule: true,
    matchedEnglishWindows:controls
  },
  positive: { originalP57Runes:95, recovered:95, sourceOriginalRoundtrips:12956 },
  conclusion:'No secret per-position sequence of Fibonacci projective powers can change the original 482 GP-A and 438 GP-G runes into the native GP-English ranges A=707..922, G=105..300 across 251940 contiguous source windows; no unknown plaintext or historical key recovered.'
}, null, 2));
