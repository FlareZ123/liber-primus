'use strict';

/**
 * Exact source-fixed GF(257) Reed-Solomon [256,180] gate for Liber Primus.
 * No key search or language scoring: 180 terminal symbols determine a unique
 * degree-<180 polynomial on consecutive public coordinates 76..255.
 * Run with Node.js 22: node sims/lp2_terminal_gf257_rs180_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const q = 257;
const mod = (n) => ((n % q) + q) % q;
function inverse(x) {
  assert.notEqual(mod(x), 0);
  let a = mod(x);
  let power = q - 2;
  let result = 1;
  while (power > 0) {
    if (power & 1) result = mod(result * a);
    a = mod(a * a);
    power = Math.floor(power / 2);
  }
  return result;
}
const inverseDistances = Array.from({length: 180}, (_, k) => k === 0 ? 0 : inverse(k));
function interpolateLast180(known) {
  assert.equal(known.length, 180);
  const differences = known.slice();
  for (let k = 1; k < 180; k++) {
    for (let i = 179; i >= k; i--) {
      differences[i] = mod((differences[i] - differences[i - 1]) * inverseDistances[k]);
    }
  }
  return function evaluate(x) {
    let value = differences[179];
    for (let j = 178; j >= 0; j--) value = mod(value * (x - (76 + j)) + differences[j]);
    return value;
  };
}
function evaluatePolynomial(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) value = mod(value * x + coefficients[i]);
  return value;
}
// Independent positive: a genuine degree-179 polynomial is reconstructed
// on every coordinate, including the 76 fully hidden test positions.
const polynomial = Array.from({length: 180}, (_, i) => mod(i*i + 3*i + 3301));
const planted = Array.from({length: 256}, (_, i) => evaluatePolynomial(polynomial, i));
const positive = interpolateLast180(planted.slice(76));
assert.equal(Array.from({length: 256}, (_, i) => positive(i)).filter((n,i) => n === planted[i]).length, 256);
assert.notEqual(positive(0), planted[1]);

// Source alignment: p55 ciphertext=76; p56 known plaintext=85;
// p57 printed clear=95. GP glyphs are taken directly from source runes.
const glyphs = solved.runes;
const solvedIndices = (name) => Array.from(
  solved.sections.find((s) => s.name === name).source_text
).filter((ch) => glyphs.includes(ch)).map((ch) => glyphs.indexOf(ch));
const p56 = solvedIndices('p56_an_end');
const p57 = solvedIndices('p57_parable');
const original55 = corpus.pages.find((p) => p.page === 55).indices;
const original57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(original55.length, 76);
assert.deepEqual(p57, original57);
const terminal = p56.concat(p57);
const predictGP = interpolateLast180(terminal);
assert.equal(terminal.every((v,i) => predictGP(76 + i) === v), true);
const predictedPrefix = Array.from({length: 76}, (_, i) => predictGP(i));
const validGP = predictedPrefix.filter((v) => v < 29).length;
const exactCipher = predictedPrefix.filter((v,i) => v === original55[i]).length;
assert.equal(validGP, 5);
assert.equal(exactCipher, 0);

// The other independently source-visible 256-register is the 32x8 numeric
// panel itself. It is also not a native GF257 RS[256,180] codeword.
assert.equal(grid.bytes.length, 256);
const predictGrid = interpolateLast180(grid.bytes.slice(76));
assert.equal(grid.bytes.slice(76).every((v,i) => predictGrid(76 + i) === v), true);
const exactGrid = Array.from({length: 76}, (_, i) => predictGrid(i))
  .filter((v,i) => v === grid.bytes[i]).length;
assert.equal(exactGrid, 0);
console.log('PASS GF257 synthetic complete polynomial inverse 256/256');
console.log('PASS source p55=76, authentic p56=85 and p57=95, table=256');
console.log('PASS original terminal known 180/180');
console.log('Original terminal GF257 extrapolation: valid GP29 first76=' + validGP + '/76; p55 ciphertext equality=' + exactCipher + '/76');
console.log('Original table GF257 extrapolation: original first76 equality=' + exactGrid + '/76');
console.log('First 16 terminal extrapolated values: ' + predictedPrefix.slice(0,16).join(','));
