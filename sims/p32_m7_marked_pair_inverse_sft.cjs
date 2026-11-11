'use strict';
/**
 * Source-bounded M7 2x2 linear-pair inverse on the original p33-p39 interval.
 *
 * The source-printed three-dot dividers bracket p33:91 through p39:119
 * (1,468 GP rune symbols, hence 734 consecutive ordered pairs).
 * Source p32's nested 5x5 inner ring, corner-exclusive side convention,
 * gives M7=[[14,25],[25,28]]. Its opposite inclusive-side lift is a
 * fixed wrong-source comparator. Do not infer either matrix's use from
 * the test result.
 *
 * Node.js 22, CommonJS: node sims/p32_m7_marked_pair_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const get = page => corpus.pages.find(x => x.page === page).indices;
const mod = x => (x % 29 + 29) % 29;
/** @param {number} n */
function inverseScalar(n) {
  for (let k = 1; k < 29; k++) if (mod(k * n) === 1) return k;
  throw Error('Singular input');
}
/** @param {number[]} a */
function inverse2(a) {
  const k = inverseScalar(mod(a[0] * a[3] - a[1] * a[2]));
  return [mod(k * a[3]), mod(-k * a[1]),
    mod(-k * a[2]), mod(k * a[0])];
}
/** @param {number[]} a @param {number[]} stream */
function act(a, stream) {
  assert.equal(stream.length % 2, 0);
  const result = [];
  for (let i = 0; i < stream.length; i += 2) {
    const x = stream[i], y = stream[i + 1];
    result.push(mod(a[0] * x + a[1] * y),
      mod(a[2] * x + a[3] * y));
  }
  return result;
}
/** @param {number[]} s */
function ioc(s) {
  const counts = new Array(29).fill(0);
  s.forEach(x => counts[x]++);
  return counts.reduce((t, n) => t + n * (n - 1), 0) /
    (s.length * (s.length - 1));
}
/** @param {number[]} s */
function topTwelve(s) {
  const counts = new Array(29).fill(0);
  s.forEach(x => counts[x]++);
  return counts.sort((a, b) => b - a).slice(0, 12)
    .reduce((a, b) => a + b, 0) / s.length;
}
/** @param {[number,number]} a @param {[number,number]} b */
function fieldMultiply(a, b) {
  // In GF(29^2) defined by original p3: u^2 = 3u + 8.
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}
/** @param {[number,number]} a @param {number} exponent */
function fieldPower(a, exponent) {
  /** @type {[number,number]} */
  let p = [1, 0];
  let b = a;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) p = fieldMultiply(p, b);
    b = fieldMultiply(b, b);
  }
  return p;
}
const M7 = [14, 25, 25, 28];
const inclusive = [14, 28, 25, 20];
const M7inverse = inverse2(M7);
assert.deepEqual(M7inverse, [1, 25, 25, 15]);
assert.equal(mod(M7[0] * M7[3] - M7[1] * M7[2]), 28);
assert.equal(mod(27 * inverseScalar(15)), 25);
assert.equal(mod(2 ** 16), 25);
assert.deepEqual(fieldPower([19, 13], 120), [25, 0]);
assert.deepEqual(fieldPower([19, 13], 840), [1, 0]);
// Multiplication by the ground-field scalar 25 fixes projective ratios,
// whereas M7 changes 0->4. The shared 25 does not prescribe a linear basis.
assert.equal(mod(M7[1] * inverseScalar(M7[3])), 4);

const observed = get(33).slice(91)
  .concat(...[34, 35, 36, 37, 38].map(get), get(39).slice(0, 119));
assert.equal(observed.length, 1468);
const controls = {
  raw: observed,
  sourceInverse: act(M7inverse, observed),
  wrongRingInverse: act(inverse2(inclusive), observed),
  wrongDirection: act(M7, observed)
};
assert.deepEqual(act(M7, controls.sourceInverse), observed);
const solved = Array.from({ length: observed.length },
  (_, i) => get(57)[i % get(57).length]);
const encryptedPlant = act(M7, solved);
assert.deepEqual(act(M7inverse, encryptedPlant), solved);
assert.notDeepEqual(act(inverse2(inclusive), encryptedPlant), solved);
const metrics = Object.fromEntries(Object.entries(controls).map(([name,s]) =>
  [name, {
    ioc: ioc(s),
    topTwelve: topTwelve(s),
    firstRuneTranslit: s.slice(0, 80).map(x => corpus.translit[x]).join('')
  }]));
assert(ioc(controls.sourceInverse) < 0.045);
assert(ioc(solved) > 0.06);
console.log(JSON.stringify({
  description: 'No original unknown LP2 plaintext recovered',
  markedInterval: 'p33:91..p39:119',
  runeCount: observed.length,
  pairCount: observed.length / 2,
  sourceMatrix: M7,
  sourceInverse: M7inverse,
  primitiveFieldElement: [19, 13],
  fieldPower120: fieldPower([19, 13], 120),
  metrics,
  solvedControlIoc: ioc(solved),
  syntheticPlantCorrectRunes: solved.length,
  roundTrip: true
}, null, 2));
