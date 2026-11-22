'use strict';

/**
 * Source-selected p40 floral body / p50 H×G quotient / root24 clock test.
 * SFT: node sims/lp2_p40_hg_q252_root24_clock_sft.cjs
 * Reads original GP29 and table sources, with no edited ciphertext or fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sourceRoot = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'lp2-grid-256.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'lp2-ink-annotations.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const H = [3, 26, 24];
const G = [27, 5, 15];
const divisor = [23, 21, 11, 17, 12];

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = mod(out[i + j] + x * y); }));
  return out;
}

/**
 * Polynomial long division, constant coefficient first, over GF29.
 * @param {number[]} input @param {number[]} factor
 * @returns {{ quotient:number[], remainder:number[] }}
 */
function divide(input, factor) {
  const rest = input.slice();
  const result = Array(input.length - factor.length + 1).fill(0);
  const inverse = Array.from({ length: 29 }, (_, k) => k).find((k) => mod(k * factor.at(-1)) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = rest.length - 1; i >= factor.length - 1; i--) {
    const start = i - factor.length + 1;
    const step = mod(rest[i] * inverse);
    result[start] = step;
    factor.forEach((coef, j) => { rest[start + j] = mod(rest[start + j] - step * coef); });
  }
  return { quotient: result, remainder: rest.slice(0, factor.length - 1) };
}

/** @param {number[]} data @returns {number} */
function coincidence(data) {
  const counts = Array(29).fill(0);
  data.forEach((v) => { counts[v]++; });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
}

/**
 * Enumerates every legal key clock when plaintext F transmits as F with no
 * key consumption. A ciphertext F may alternatively encrypt a non-F rune.
 * @param {number[]} cipher @param {number[]} key @param {number} sign
 * @returns {{ firstImpossible:number|null, endStates:number }}
 */
function nativeFClock(cipher, key, sign) {
  let states = new Uint8Array(cipher.length + 1);
  let next = new Uint8Array(cipher.length + 1);
  states[0] = 1;
  for (let i = 0; i < cipher.length; i++) {
    next.fill(0);
    let available = 0;
    for (let consumed = 0; consumed <= i; consumed++) {
      if (!states[consumed]) continue;
      if (cipher[i] === 0) next[consumed] = 1; // Literal plaintext F bypass.
      const shift = key[(24 + consumed) % key.length];
      const plain = mod(cipher[i] + sign * shift);
      if (plain !== 0) next[consumed + 1] = 1;
    }
    for (let j = 0; j <= i + 1; j++) available += next[j];
    if (!available) return { firstImpossible: i, endStates: 0 };
    [states, next] = [next, states];
  }
  return { firstImpossible: null, endStates: states.reduce((sum, v) => sum + v, 0) };
}

/**
 * Plant actual solved GP29 plaintext with the historical F-bypass rule.
 * @param {number[]} plain @param {number[]} key @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, key, sign) {
  let consumed = 0;
  return plain.map((value) => {
    if (value === 0) return 0;
    const cipher = mod(value - sign * key[(24 + consumed) % key.length]);
    consumed++;
    return cipher;
  });
}

assert.equal(table.bytes.length, 256);
assert.deepEqual(multiply(H, G), divisor);
assert.deepEqual(ink.pages.find((p) => p.page === 39).red_spans.find((s) => s.start === 119).runes
  .split('').map((r) => corpus.runes.indexOf(r)), G);
const p40 = corpus.pages.find((p) => p.page === 40).indices;
const title = ink.pages.find((p) => p.page === 40).red_spans.find((s) => s.start === 0);
assert.equal(title.length, 8);
assert.deepEqual(title.runes.split('').map((r) => corpus.runes.indexOf(r)), p40.slice(0, 8));
const input = table.bytes.slice().reverse().map((v) => v % 29);
const divided = divide(input, divisor);
assert.deepEqual(divided.remainder, [0, 0, 0, 0]);
const key = divided.quotient.reverse();
assert.equal(key.length, 252);
assert.deepEqual(key.slice(0, 20), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);
const body = Array.from({ length: 14 }, (_, i) => corpus.pages.find((p) => p.page === i + 40).indices).flat().slice(8);
assert.equal(body.length, 3000);
assert.equal(body.length + 24, 12 * key.length);

/* Complete direct inverses and exhaustive transparent-F state paths. */
const outcomes = [-1, 1].map((sign) => ({
  sign,
  directIoC: coincidence(body.map((c, i) => mod(c + sign * key[(i + 24) % key.length]))),
  nativeF: nativeFClock(body, key, sign),
}));
assert.ok(Math.abs(outcomes[0].directIoC - 0.03435434033566744) < 1e-12);
assert.ok(Math.abs(outcomes[1].directIoC - 0.034649105257307994) < 1e-12);
assert.deepEqual(outcomes.map((s) => s.nativeF.firstImpossible), [63, 11]);

/* A real source-native 95-rune plaintext plant must survive both exact solvers. */
const solvedP57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solvedP57.length, 95);
for (const sign of [-1, 1]) {
  const plantedCipher = encrypt(solvedP57, key, sign);
  assert.equal(nativeFClock(plantedCipher, key, sign).firstImpossible, null);
}
console.log(JSON.stringify({ polynomialRemainder: divided.remainder, keyLength: key.length, bodyLength: body.length,
  rootClockOffset: 24, titleLength: title.length, original: outcomes, planted: 95 }, null, 2));
