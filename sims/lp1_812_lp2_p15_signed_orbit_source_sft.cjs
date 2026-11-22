"use strict";
/**
 * Original-source cross-book 812 clock to LP2 signed p15 matrix inverse SFT.
 * Windows 11 / Node.js 22: node sims/lp1_812_lp2_p15_signed_orbit_source_sft.cjs
 *
 * LP1's printed 5x5 wisdom square contains 812 twice. Independently, restoring
 * two candidate signs in the printed LP2 p15 4x4 matrix produces an order-812
 * GF(29) map. Freeze the 2013 signed BASE29 3301 digits as a source seed.
 * A one-component orbit at one update per rune is a candidate additive pad;
 * no original LP2 instruction authenticates this mapping or seed alignment.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const lp1 = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const knownSquare = lp1.match(/### 16\s+([\s\S]*?)(?=### 56)/u);
assert(knownSquare, "Missing original LP1 p16 printed numerical square");
assert.equal((knownSquare[1].match(/\b812\b/gu) || []).length, 2);

const MOD = 29;
/** @param {number} x @returns {number} */
const mod = x => ((x % MOD) + MOD) % MOD;
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
/** @returns {number[][]} */
const identity = () => Array.from({length:4}, (_, i) =>
  Array.from({length:4}, (_, j) => Number(i === j)));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function multiply(A, B) {
  return A.map(row => Array.from({length:4}, (_, j) =>
    mod(row.reduce((sum, x, k) => sum + x * B[k][j], 0))));
}
/** @param {number[][]} M @param {number} exponent @returns {number[][]} */
function power(M, exponent) {
  let result = identity(), factor = M;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) result = multiply(result, factor);
    factor = multiply(factor, factor);
  }
  return result;
}
/** @param {number[][]} M @param {number[]} vector @returns {number[]} */
function apply(M, vector) {
  return M.map(row => mod(row.reduce((sum, coefficient, j) =>
    sum + coefficient * vector[j], 0)));
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(MOD).fill(0);
  values.forEach(v => hist[v]++);
  return hist.reduce((sum, n) => sum + n * (n-1), 0) /
    (values.length * (values.length-1));
}
/** @param {number[][]} matrix @param {number[]} seed @param {number} length */
function stream(matrix, seed, length) {
  const key = [];
  let state = seed.slice();
  for (let i = 0; i < length; i++) {
    key.push(state[0]);
    state = apply(matrix, state);
  }
  return key;
}
const signs = [];
for (const first of [1, -1]) for (const second of [1, -1]) {
  const signed = printed.map(row => row.slice());
  signed[3][0] *= first;
  signed[3][1] *= second;
  const M = signed.map(row => row.map(mod));
  signs.push({first, second, order812Identity:
    JSON.stringify(power(M, 812)) === JSON.stringify(identity())});
}
assert.deepEqual(signs, [
  {first:1, second:1, order812Identity:false},
  {first:1, second:-1, order812Identity:false},
  {first:-1, second:1, order812Identity:false},
  {first:-1, second:-1, order812Identity:true}
]);
const M = printed.map(row => row.slice());
M[3][0] *= -1;
M[3][1] *= -1;
const signedM = M.map(row => row.map(mod));
assert.deepEqual(power(signedM,812),identity());
for (const properDivisor of [406, 203, 116, 28, 7, 4, 2, 1])
  assert.notDeepEqual(power(signedM,properDivisor),identity());
const target = corpus.pages.slice(16, 23).flatMap(page => page.indices);
const authenticPlain = corpus.pages[57].indices;
assert.equal(target.length, 1744);
assert.equal(authenticPlain.length, 95);
const sourceSeed = [3, 26, 24, 0]; // 3301 -> [3,26,24] in signed 2013 BASE29.
const candidates = [];
for (let rotation = 0; rotation < 4; rotation++) {
  const seed = Array.from({length:4}, (_, i) =>
    sourceSeed[(i + rotation) % 4]);
  const pad = stream(signedM, seed, target.length);
  assert.deepEqual(pad.slice(812, 836),pad.slice(0,24));
  for (const sign of [-1, 1]) {
    const plain = target.map((c, i) => mod(c + sign * pad[i]));
    assert.deepEqual(plain.map((p, i) => mod(p - sign * pad[i])),target);
    candidates.push({
      rotation, sign, ioc: ioc(plain),
      prefix24: plain.slice(0,24).map(i=>corpus.translit[i]).join("")
    });
  }
}
const padPlant = stream(signedM,sourceSeed,authenticPlain.length);
const cipherPlant = authenticPlain.map((v,i) => mod(v+padPlant[i]));
assert.deepEqual(cipherPlant.map((v,i) => mod(v-padPlant[i])),
  authenticPlain);
assert.equal(candidates.length,8);
const maximum = Math.max(...candidates.map(c=>c.ioc));
assert(Math.abs(maximum - 0.03483396232373794) < 1e-12);
assert(Math.abs(ioc(target) - 0.034509598025128034) < 1e-12);
assert(Math.abs(ioc(authenticPlain) - 0.06270996640537514) < 1e-12);
assert(maximum < 0.04);
console.log(JSON.stringify({
  source:"LP1 original printed p16 square, LP2 printed p15 matrix, 2013 signed BASE29 3301",
  independentlyVisible812Occurrences:2,
  twoBottomSignsThatGiveM812Identity:signs.filter(v=>v.order812Identity),
  testedCiphertext:"LP2 p16..p22", runes:target.length,
  originalCiphertextIoC:ioc(target),
  solvedP57ControlIoC:ioc(authenticPlain),
  sourceSelectedSeed:sourceSeed,
  scalarOrbitPadCandidates:candidates,
  maximumDecodedIoC:maximum,
  authenticSolvedTextPlantRecovered:authenticPlain.length,
  conclusion:"The 812 link is a possible sign/clock clue, but these fixed 3301-orbit additive inverses recover no original plaintext. It does not rule out other uses of the signed matrix."
},null,2));
