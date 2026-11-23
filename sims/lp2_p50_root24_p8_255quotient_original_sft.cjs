'use strict';

/** Exact original p50 polynomial quotient as p8 255-rune additive key.
 * Standalone read-only Node22/CommonJS SFT. The historical operation
 * P=(X-24)*Q is over GP29 (not integer or GF256 arithmetic).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {any} */
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const book = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const C = book.pages.find((p) => p.page === 8).indices;
const src60 = grid.pages.flatMap((p) => p.bytes);
const m29 = (n) => ((n % 29) + 29) % 29;
assert.equal(C.length, 255);
assert.equal(src60.length, 256);

/** @param {number[]} src @param {number} r
 * @returns {{quotient:number[],remainder:number,derivative:number}}
 */
function synthetic(src, r) {
  const quotient = [m29(src[0])];
  for (let i = 1; i < src.length - 1; i++) {
    quotient.push(m29(src[i] + r * quotient[i - 1]));
  }
  const remainder = m29(src[src.length - 1] + r * quotient[quotient.length - 1]);
  let evalP = 0;
  let evalDerivative = 0;
  for (const value of src) {
    evalDerivative = m29(evalDerivative * r + evalP);
    evalP = m29(evalP * r + value);
  }
  assert.equal(remainder, evalP);
  return { quotient, remainder, derivative: evalDerivative };
}
const key = synthetic(src60, 24);
assert.equal(key.quotient.length, 255);
assert.equal(key.remainder, 0);
assert.equal(key.derivative, 0);

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const hist = Array(29).fill(0);
  for (const i of x) hist[i]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}
const answers = [];
for (const sign of [-1, 1]) {
  const out = C.map((v, i) => m29(v + sign * key.quotient[i]));
  const recovered = out.map((v, i) => m29(v - sign * key.quotient[i]));
  assert.deepEqual(recovered, C);
  answers.push({ sign, ioc: ioc(out),
    first75Transliteration: out.slice(0, 75).map((v) => book.translit[v]).join(' ') });
}
assert.ok(Math.abs(answers[0].ioc - 0.03563378107148371) < 1e-14);
assert.ok(Math.abs(answers[1].ioc - 0.03412073490813648) < 1e-14);

// Independent genuinely solved GP-native p57 control: a full 255-symbol
// message from repeated clear p57, encrypted under exactly the frozen
// polynomial key and fully recovered for both conventional GP29 signs.
const native = book.pages.find((p) => p.page === 57).indices;
assert.equal(native.length, 95);
const clear = Array.from({ length: 255 }, (_, i) => native[i % native.length]);
for (const sign of [-1, 1]) {
  const encrypted = clear.map((v, i) => m29(v - sign * key.quotient[i]));
  const decoded = encrypted.map((v, i) => m29(v + sign * key.quotient[i]));
  assert.deepEqual(decoded, clear);
}

// Fixed negative alternatives: the p39 root24 tests are unique to the
// source-correct base60 forward GF29 polynomial convention.
const A59 = grid.alphabet.replace('f', '');
const src59 = grid.pages.flatMap((p) => p.tokens)
  .map((t) => 59 * A59.indexOf(t[0]) + A59.indexOf(t[1]));
const wrong59 = synthetic(src59, 24);
assert.equal(wrong59.remainder, 20);
assert.equal(synthetic(src60, 23).remainder, 24);
const hitCount = key.quotient.filter((v, i) => v === C[i]).length;
assert.equal(hitCount, 12);

// Independent P'(X) 256-to-255 typed GP29 symbol key under the original
// double-root24 polynomial condition. Source coefficients remain unchanged.
// Independent, key-free original p8 cross-artifact checksum: treat p8
// itself as a high-first GF29 polynomial. It does not have the p39 root24.
let p8EvalAt24 = 0;
let p8DerivativeAt24 = 0;
for (const glyph of C) {
  p8DerivativeAt24 = m29(p8DerivativeAt24 * 24 + p8EvalAt24);
  p8EvalAt24 = m29(p8EvalAt24 * 24 + glyph);
}
assert.equal(p8EvalAt24, 7);
assert.equal(p8DerivativeAt24, 24);

const derivativeKey = src60.slice(0, -1).map((v, i) => m29((255 - i) * v));
assert.equal(derivativeKey.length, C.length);
const derivativeAnswers = [];
for (const sign of [-1, 1]) {
  const decoded = C.map((v, i) => m29(v + sign * derivativeKey[i]));
  const reencryption = decoded.map((v, i) => m29(v - sign * derivativeKey[i]));
  assert.deepEqual(reencryption, C);
  const planted = clear.map((v, i) => m29(v - sign * derivativeKey[i]));
  assert.deepEqual(planted.map((v, i) => m29(v + sign * derivativeKey[i])), clear);
  derivativeAnswers.push({ sign, ioc: ioc(decoded),
    first75Transliteration: decoded.slice(0, 75).map((v) => book.translit[v]).join(' ') });
}
assert.ok(Math.abs(derivativeAnswers[0].ioc - 0.03365755751119345) < 1e-14);
assert.ok(Math.abs(derivativeAnswers[1].ioc - 0.032823838196696) < 1e-14);
const derivativeMatches = derivativeKey.filter((v, i) => v === C[i]).length;
assert.equal(derivativeMatches, 10);

// Prospective untouched chapter extension: same 255-key cycle, starting at
// physical p8's first rune, without choosing any extra key phase or reset.
// The original p9–p14 ciphertext is independent of the p8 length match.
const chapterOriginal = book.pages.filter((page) => page.page >= 8 && page.page <= 14)
  .flatMap((page) => page.indices);
assert.equal(chapterOriginal.length, 1729);
const chapterDecodes = [];
for (const [operation, K] of [['quotient', key.quotient], ['derivative', derivativeKey]]) {
  for (const sign of [-1, 1]) {
    const decoded = chapterOriginal.map((v, i) => m29(v + sign * K[i % K.length]));
    assert.deepEqual(decoded.map((v, i) => m29(v - sign * K[i % K.length])), chapterOriginal);
    chapterDecodes.push({ operation, sign, totalIoC: ioc(decoded),
      holdoutP9to14IoC: ioc(decoded.slice(255)),
      firstHoldout75: decoded.slice(255, 330).map((v) => book.translit[v]).join(' ') });
  }
}
assert.ok(Math.abs(chapterDecodes[0].totalIoC - 0.034727577490735385) < 1e-14);
assert.ok(Math.abs(chapterDecodes[1].totalIoC - 0.03449797035323351) < 1e-14);
assert.ok(Math.abs(chapterDecodes[2].totalIoC - 0.03471820577083735) < 1e-14);
assert.ok(Math.abs(chapterDecodes[3].totalIoC - 0.0344417400338453) < 1e-14);
console.log(JSON.stringify({ chapterOriginalRunes: chapterOriginal.length,
  untouchedP9to14AfterP8: chapterOriginal.length - 255, chapterDecodes }));

console.log(JSON.stringify({
  originalSource: 'p50 canonical base60 coefficients + p39 GP29 double root24',
  p8CipherLength: C.length,
  p50OriginalCells: src60.length,
  quotientLength: key.quotient.length,
  remainder: key.remainder, derivative: key.derivative,
  directQuotientRuneMatches: hitCount,
  p8PolynomialAtRoot24: p8EvalAt24,
  p8DerivativeAtRoot24: p8DerivativeAt24,
  rawCipherIoC: ioc(C),
  quotientIoC: ioc(key.quotient),
  decoded: answers,
  derivativeKey: { length: derivativeKey.length, ioc: ioc(derivativeKey),
    literalMatches: derivativeMatches, decoded: derivativeAnswers },
  solvedP57PositiveRecovered: '255/255 in both signs',
  competingRadix59Remainder: wrong59.remainder,
}));
console.log('PASS: exact original quotient and derivative, both original inverses and solved source positives');
