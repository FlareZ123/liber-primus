'use strict';

/**
 * Conditional DH2-weighted pointer-graph original LP2 inverse.
 *
 * Native GP29 source: p7 last M19 + p8 exactly255 runes; original
 * 256-cell numeric table; independent 2013/p23 DH shared key K=2.
 *
 * A complete graph's cycle equations invert D[i]=P[i]+2P[f(i)]
 * exactly when 1-(-2)^cycleLength != 0 (mod29). All source cycles
 * (base60: 11+2; base59: 1) meet this requirement. This is a
 * bounded test of a conjectured operation, not an authored cipher.
 *
 * Single-file, read-only CommonJS, Windows Node.js22 compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative */
const load = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const gp = load('resources/liber-primus/lp2-corpus.json');
const table = load('resources/liber-primus/lp2-grid-256.json');
const cells = table.pages.flatMap(page => page.tokens);

assert.equal(cells.length, 256);
const p7 = gp.pages.find(page => page.page === 7).indices;
const p8 = gp.pages.find(page => page.page === 8).indices;
const p9 = gp.pages.find(page => page.page === 9).indices;
const p57 = gp.pages.find(page => page.page === 57).indices;
assert.equal(p7.at(-1), 19);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);

const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @param {number} n */
function pow(x, n) {
  let y = 1;
  for (; n > 0; n = Math.floor(n / 2), x = mod(x * x)) {
    if (n % 2) y = mod(y * x);
  }
  return y;
}
const inverse = x => {
  assert.notEqual(mod(x), 0);
  return pow(mod(x), 27);
};
assert.equal(mod(3 * 19), 28); // ring exponents multiply modulo28: 57 == 1
for (let x = 0; x < 29; x++) {
  assert.equal(pow(pow(x, 3), 19), x);
  assert.equal(pow(pow(x, 19), 3), x);
}

/** @param {number[]} next */
function graphCycles(next) {
  const seen = new Uint8Array(next.length);
  const cycles = [];
  for (let i = 0; i < next.length; i++) {
    if (seen[i]) continue;
    const visiting = new Map();
    const path = [];
    let j = i;
    while (!seen[j] && !visiting.has(j)) {
      visiting.set(j, path.length);
      path.push(j);
      j = next[j];
    }
    if (visiting.has(j)) cycles.push(path.slice(visiting.get(j)));
    for (const v of path) seen[v] = 1;
  }
  return cycles;
}

/** @param {number[]} next @param {number[]} D @param {number} weight */
function inverseWeighted(next, D, weight) {
  assert.equal(next.length, 256);
  assert.equal(D.length, 256);
  const result = Array(256).fill(null);
  const cycles = graphCycles(next);

  for (const c of cycles) {
    const length = c.length;
    const minusK = mod(-weight);
    const determinant = mod(1 - pow(minusK, length));
    assert.notEqual(determinant, 0, 'all source-graph cycles must be invertible');
    let numerator = 0;
    for (let j = 0; j < length; j++) {
      numerator = mod(numerator + pow(minusK, j) * D[c[j]]);
    }
    result[c[0]] = mod(numerator * inverse(determinant));
    for (let j = length - 1; j >= 1; j--) {
      result[c[j]] = mod(D[c[j]] - weight * result[next[c[j]]]);
    }
  }

  /** @param {number} i @returns {number} */
  function solve(i) {
    if (result[i] !== null) return result[i];
    result[i] = mod(D[i] - weight * solve(next[i]));
    return result[i];
  }
  for (let i = 0; i < 256; i++) solve(i);

  for (let i = 0; i < 256; i++) {
    assert.equal(mod(result[i] + weight * result[next[i]]), D[i]);
  }
  return { result, cycleLengths: cycles.map(c => c.length).sort((a, b) => a - b) };
}
/** @param {number[]} source @param {number[]} next @param {number} exp */
function encrypt(source, next, exp) {
  return source.map((x, i) => pow(mod(x + 2 * source[next[i]]), exp));
}
/** @param {number[]} input @param {number[]} next @param {number} exp */
function decrypt(input, next, exp) {
  const inverseExponent = exp === 3 ? 19 : exp === 19 ? 3 : 1;
  return inverseWeighted(next, input.map(x => pow(x, inverseExponent)), 2);
}
function ioc(values) {
  const counts = Array(29).fill(0);
  values.forEach(x => counts[x]++);
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const results = [];
for (const radix of [60, 59]) {
  const alphabet = radix === 60 ? table.alphabet : table.alphabet.replace('f', '');
  assert.equal(alphabet.length, radix);
  const next = cells.map(token => {
    assert.equal(token.length, 2);
    const value = radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
    assert.ok(value >= 0 && value < 256);
    return value;
  });
  assert.deepEqual(graphCycles(next).map(c => c.length).sort((a,b)=>a-b),
    radix === 60 ? [2, 11] : [1]);

  for (const [alignment, C] of [
    ['p7-final+p8', [p7.at(-1), ...p8]],
    ['p8+p9-first', [...p8, p9[0]]],
  ]) {
    for (const [model, exponent] of [
      ['linear', 1], ['cubed', 3], ['cube-rooted', 19],
    ]) {
      const got = decrypt(C, next, exponent);
      assert.deepEqual(encrypt(got.result, next, exponent), C,
        'full-register original-source exact re-encryption');

      const planted = Array.from({ length: 256 }, (_, i) => p57[i % p57.length]);
      const crypted = encrypt(planted, next, exponent);
      assert.deepEqual(decrypt(crypted, next, exponent).result, planted,
        'authentic solved-p57 native GP29 full-register positive control');

      const body = alignment === 'p7-final+p8'
        ? got.result.slice(13) : got.result.slice(12, 255);
      assert.equal(body.length, 243);
      const bodyIoc = ioc(body);
      assert.ok(bodyIoc < 0.041, 'original receiver is flat, no native GP language concentration');

      results.push({
        radix, alignment, model, cycles: got.cycleLengths,
        body_ioc: Number(bodyIoc.toFixed(9)),
        first32: got.result.slice(0, 32).map(v => gp.translit[v]).join(' '),
        complete_original_replay: true, authentic_gp_positive: true,
      });
    }
  }
}
assert.equal(results.length, 12);
console.log(JSON.stringify({
  finding: 'Original source DH2-weighted p50 graph inversion on physical p8 is native-GP-negative.',
  weights: 'K=2 (2013 DH23 shared result), cube=3/root=19 (physical p8 red)',
  original_source_covered: '12 original source configurations, 2 radices x 2 only natural alignments x 3 exponent models',
  recovered_unknown_plaintext: false,
  results,
}, null, 2));
