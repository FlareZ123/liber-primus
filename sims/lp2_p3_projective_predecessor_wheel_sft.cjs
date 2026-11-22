'use strict';

/**
 * Source-fixed p3-quadratic GF29 projective predecessor-wheel test.
 * This is a single runnable test file (SFT), with no packages or key search.
 * Invoke on Windows 11: node sims/lp2_p3_projective_predecessor_wheel_sft.cjs
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const corpus = JSON.parse(readFileSync(join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));

const MOD = 29;
/** @param {number} value @returns {number} */
const mod = (value) => ((value % MOD) + MOD) % MOD;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let k = 1; k < MOD; k++) if (mod(k * x) === 1) return k;
  throw Error('GF29 inverse unavailable for zero');
}

/**
 * The original p3 red triad [13,23,2] gives u^2=3u+8.
 * Multiplication by u on basis (a,b) is [[0,8],[1,3]].
 * In the repo's original chart x=a/b (null is infinity),
 * the induced projective map is x -> 8/(x+3).
 *
 * @param {number|null} x
 * @returns {number|null}
 */
function project(x) {
  if (x === null) return 0;
  const denominator = mod(x + 3);
  return denominator === 0 ? null : mod(8 * inverse(denominator));
}

const orbit = [];
let x = 24; // p54's visually enlarged GP A, a source-visible index 24.
while (!orbit.includes(x) && orbit.length < 31) {
  orbit.push(x);
  x = project(x);
}
assert.equal(x, 24);
assert.equal(orbit.length, 30);
assert.equal(new Set(orbit).size, 30);
assert.equal(orbit.filter((v) => v === null).length, 1);
assert.deepEqual(orbit, [
  24, 25, 21, 10, 14, 9, 20, 18, 28, 4, 26, null, 0, 22, 27,
  8, 6, 17, 12, 16, 5, 1, 2, 19, 3, 11, 13, 15, 23, 7
]);
const position = Array(MOD).fill(-1);
for (let i = 0; i < orbit.length; i++) {
  if (orbit[i] !== null) position[orbit[i]] = i;
}
assert.ok(position.every((v) => v >= 0));

/**
 * Read the projective wheel from the previous ciphertext rune and omit the
 * physically unprinted infinity. This yields an EXACT bijection of the 29 GP
 * symbols for every previous source rune, including repeated runes.
 *
 * @param {number} previousCipher
 * @param {number} direction +1 for u, -1 for u^-1.
 * @returns {number[]}
 */
function wheel(previousCipher, direction) {
  const entries = [];
  const start = position[previousCipher];
  for (let i = 0; i < 30; i++) {
    const candidate = orbit[mod30(start + direction * i)];
    if (candidate !== null) entries.push(candidate);
  }
  assert.equal(entries.length, MOD);
  return entries;
}

/** @param {number} value @returns {number} */
const mod30 = (value) => ((value % 30) + 30) % 30;

/** @param {number[]} cipher @param {number} direction @returns {number[]} */
function decode(cipher, direction) {
  if (!cipher.length) return [];
  const result = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    const rank = wheel(cipher[i - 1], direction).indexOf(cipher[i]);
    assert.ok(rank >= 0);
    result.push(rank);
  }
  return result;
}

/** @param {number[]} plain @param {number} direction @returns {number[]} */
function encode(plain, direction) {
  if (!plain.length) return [];
  const result = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    result.push(wheel(result[i - 1], direction)[plain[i]]);
  }
  return result;
}

/** @param {number[]} values @returns {{ioc:number,max:number,top12:number,counts:number[]}} */
function profile(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < MOD);
    counts[value]++;
  }
  return {
    ioc: counts.reduce((sum, n) => sum + n * (n - 1), 0) /
      (values.length * (values.length - 1)),
    max: Math.max(...counts),
    top12: counts.slice().sort((a, b) => b - a)
      .slice(0, 12).reduce((sum, n) => sum + n, 0) / values.length,
    counts
  };
}

const unknown = corpus.pages.filter((page) => page.page <= 55);
assert.equal(unknown.length, 56);
assert.equal(unknown.reduce((n, page) => n + page.indices.length, 0), 12956);
const raw = unknown.flatMap((page) => page.indices);
const solved = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(solved.length, 95);
const native = profile(solved);
assert.ok(Math.abs(native.ioc - 0.06270996640537514) < 1e-12);
assert.ok(native.top12 > 0.8);

console.log('p3 exact projective 30-cycle:', JSON.stringify(orbit));
console.log('Solved p57 GP-native control:', JSON.stringify(native));
console.log('Original GP29 ciphertext:', JSON.stringify({
  total: raw.length, ioc: profile(raw).ioc, top12: profile(raw).top12
}));
for (const direction of [1, -1]) {
  const decoded = unknown.flatMap((page) => decode(page.indices, direction));
  const reconstructed = unknown.flatMap((page) =>
    encode(decode(page.indices, direction), direction));
  assert.deepEqual(reconstructed, raw);

  // Any single stationary secret 29-way substitution preserves top12 mass.
  const observed = profile(decoded);
  const expected = direction === 1
    ? { ioc: 0.03524784595881271, top12: 0.44033652361840075, max: 490 }
    : { ioc: 0.03524791745335488, top12: 0.4402593393022538, max: 489 };
  assert.ok(Math.abs(observed.ioc - expected.ioc) < 1e-12);
  assert.ok(Math.abs(observed.top12 - expected.top12) < 1e-12);
  assert.equal(observed.max, expected.max);
  assert.equal(observed.counts[0], 88); // 86 same-page doublets + two copied starts.

  let origin = 0;
  const plant = [];
  const artificial = [];
  for (const page of unknown) {
    if (!page.indices.length) continue;
    const nativePage = Array.from({ length: page.indices.length },
      (_, i) => solved[(origin + i) % solved.length]);
    nativePage[0] = page.indices[0]; // The source starts are always copied.
    origin += page.indices.length;
    const encoded = encode(nativePage, direction);
    artificial.push(...encoded);
    plant.push(...decode(encoded, direction));
    assert.deepEqual(decode(encoded, direction), nativePage);
  }
  assert.equal(plant.length, raw.length);
  assert.ok(artificial.some((symbol, i) => symbol !== plant[i]));

  const wrongDecoder = -direction;
  const wrong = unknown.flatMap((page, idx) =>
    decode(page.indices.length ?
      encode(Array.from({ length: page.indices.length },
        (_, i) => i === 0 ? page.indices[0] : solved[i % 95]), direction) :
      [], wrongDecoder));
  assert.notDeepEqual(wrong, unknown.flatMap((page) =>
    page.indices.map((value, i) => i === 0 ? value : solved[i % 95])));

  console.log(JSON.stringify({
    fieldElement: direction === 1 ? 'u' : 'u-inverse',
    originalRuneCount: decoded.length,
    decoded: { ioc: observed.ioc, top12: observed.top12,
      largestRuneCount: observed.max, repeatedStep0Count: observed.counts[0] },
    preview: decoded.slice(0, 95).map((v) => corpus.translit[v]).join(' '),
    nativePlantRecovered: plant.length,
    wrongOrientationPlantFails: true
  }, null, 2));
}
console.log('PASS: p3 source group and full original/solved positive-control inverses.');
