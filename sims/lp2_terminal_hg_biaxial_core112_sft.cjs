'use strict';
/**
 * Original-input SFT: source-linked H*G product code with 112 central data
 * symbols, 68 strictly held-out known GP symbols, and 76 unknown p55 outputs.
 *
 * Run: node sims/lp2_terminal_hg_biaxial_core112_sft.cjs
 * Node 22, built-in libraries only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = table.pages.flatMap(p => p.bytes);
const tokens = table.pages.flatMap(p => p.tokens);
assert.equal(bytes.length, 256);
assert.deepEqual(corpus.pages.slice(55, 58).map(p => p.indices.length), [76, 85, 95]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const m = n => (n % 29 + 29) % 29;
// Monic product of the 2013 BASE29 example polynomial and the p39 red-triad polynomial.
const HG = [14, 9, 13, 28, 1];
const inverses = Array.from({length: 29}, (_, n) => n === 0 ? 0 :
  Array.from({length: 28}, (_, j) => j + 1).find(j => m(n * j) === 1));
/** Return the four low coefficients after dividing a polynomial by HG over GF29. */
function rem(coeffs) {
  const a = coeffs.slice();
  for (let k = a.length - 1; k >= 4; k--) {
    const pivot = a[k];
    for (let j = 0; j <= 4; j++) a[k - 4 + j] = m(a[k - 4 + j] - pivot * HG[j]);
  }
  return a.slice(0, 4);
}
/** Exact full-rank solution of a square matrix over GF29. */
function solve(A, b) {
  const n = b.length;
  const v = A.map((row, i) => row.map(m).concat(m(b[i])));
  for (let j = 0; j < n; j++) {
    let p = j;
    while (p < n && v[p][j] === 0) p++;
    assert(p < n, 'A source-locked parity matrix must be invertible');
    [v[j], v[p]] = [v[p], v[j]];
    const inv = inverses[v[j][j]];
    for (let k = j; k <= n; k++) v[j][k] = m(v[j][k] * inv);
    for (let i = 0; i < n; i++) if (i !== j) {
      const factor = v[i][j];
      for (let k = j; k <= n; k++) v[i][k] = m(v[i][k] - factor * v[j][k]);
    }
  }
  return v.map(row => row[n]);
}
/** Fill the four unknown perimeter coefficients so the row/column is divisible by HG. */
function extend(a, missing) {
  const result = a.map(v => v === null ? 0 : v);
  const h = missing.map(k => rem(Array.from({length: a.length}, (_, j) => +(k === j))));
  const rhs = rem(result).map(v => m(-v));
  const x = solve(Array.from({length: 4}, (_, i) => h.map(col => col[i])), rhs);
  missing.forEach((k, i) => { result[k] = x[i]; });
  assert(rem(result).every(v => v === 0));
  return result;
}
const rings = Array.from({length: 4}, (_, d) => {
  const p = [];
  for (let x = d; x < 8 - d; x++) p.push(8 * d + x);
  for (let y = d + 1; y < 32 - d; y++) p.push(8 * y + 7 - d);
  for (let x = 6 - d; x >= d; x--) p.push(8 * (31 - d) + x);
  for (let y = 30 - d; y > d; y--) p.push(8 * y + d);
  return p;
});
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
const walk = rings.flat();
assert.equal(new Set(walk).size, 256);
/**
 * Decode the unique HG/HG systematic product code from the deepest
 * 28-by-4 rectangle, indexed as clockwise shell2 followed by shell3.
 */
function reconstruct(centre) {
  assert.equal(centre.length, 112);
  const M = Array.from({length: 32}, () => Array(8).fill(null));
  for (let i = 0; i < 112; i++) {
    const cell = walk[144 + i];
    M[Math.floor(cell / 8)][cell % 8] = centre[i];
  }
  for (let y = 2; y < 30; y++) M[y] = extend(M[y], [0, 1, 6, 7]);
  for (let x = 0; x < 8; x++) {
    const col = extend(Array.from({length: 32}, (_, y) => M[y][x]), [0, 1, 30, 31]);
    for (let y = 0; y < 32; y++) M[y][x] = col[y];
  }
  for (const row of M) assert(rem(row).every(v => v === 0));
  for (let x = 0; x < 8; x++)
    assert(rem(M.map(row => row[x])).every(v => v === 0));
  return walk.map(cell => M[Math.floor(cell / 8)][cell % 8]);
}
/** Generate the first n primes independently of the GP29 symbol prime array. */
function primes(n) {
  const p = [];
  for (let x = 2; p.length < n; x++)
    if (p.every(q => q * q > x || x % q !== 0)) p.push(x);
  return p;
}
const primeSequence = primes(100);
const c55 = corpus.pages[55].indices;
const c56 = corpus.pages[56].indices;
const c57 = corpus.pages[57].indices;
let primeClock = 0;
const p56 = c56.map((c, i) =>
  i === 56 ? 0 : m(c - (primeSequence[primeClock++] - 1)));
assert.equal(primeClock, 84);
assert.equal(p56.map(i => corpus.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const knownPlain = p56.concat(c57);
const knownCipher = c56.concat(c57);
const knownKey = knownCipher.map((c, i) => m(c - knownPlain[i]));
assert.equal(knownKey.length, 180);
assert.deepEqual(knownPlain.slice(128), c57.slice(43));
/** Invert the Vigenere-like table-plus-code mask without using p55 ciphertext to fit the key. */
function testCandidate(sourceBytes) {
  const centralKey = Array.from({length: 112}, (_, i) =>
    m(knownKey[68 + i] - sourceBytes[walk[144 + i]]));
  const code = reconstruct(centralKey);
  assert.deepEqual(code.slice(144), centralKey);
  const key = code.map((v, i) => m(v + sourceBytes[walk[i]]));
  const predictedP56 = c56.slice(0, 68).map((c, i) => m(c - key[76 + i]));
  const heldoutMatches = predictedP56.filter((v, i) => v === p56[i]).length;
  const p55 = c55.map((c, i) => m(c - key[i]));
  assert(p55.every((v, i) => m(v + key[i]) === c55[i]));
  return {heldoutMatches, predictedP56, p55, key};
}
const primary = testCandidate(bytes);
const alt = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');
assert.equal(alt.length, 59);
const bytes59 = tokens.map(s => 59 * alt.indexOf(s[0]) + alt.indexOf(s[1]));
assert(bytes59.every(v => v >= 0 && v <= 255));
const negativeSource = testCandidate(bytes59);
assert.equal(primary.heldoutMatches, 1);
assert.equal(primary.p55.length, 76);
const p55Translit = primary.p55.map(i => corpus.translit[i]).join('');
const frequencies = Array(29).fill(0);
primary.p55.forEach(v => { frequencies[v]++; });
const ioc = frequencies.reduce((s, n) => s + n * (n - 1), 0) / (76 * 75);
// Positive native-text plant: 112 independently chosen core values uniquely
// determine 144 parity cells, and the held-out 68 plus p55 recover exactly.
const plantCore = Array.from({length: 112}, (_, i) => m(7 * i * i + 11 * i + 3));
const plantCode = reconstruct(plantCore);
const plantPlain = c55.map((_, i) => c57[i]).concat(knownPlain);
const plantCipher = plantPlain.map((p, i) => m(p + bytes[walk[i]] + plantCode[i]));
const plantKnownKey = plantCipher.slice(76).map((c, i) => m(c - knownPlain[i]));
const plantRecovered = reconstruct(Array.from({length: 112}, (_, i) =>
  m(plantKnownKey[68 + i] - bytes[walk[144 + i]])));
assert.deepEqual(plantRecovered, plantCode);
const plantDecoded = plantCipher.map((c, i) => m(c - bytes[walk[i]] - plantRecovered[i]));
assert.deepEqual(plantDecoded, plantPlain);
assert(plantCipher.every((v, i) => m(plantDecoded[i] + bytes[walk[i]] + plantRecovered[i]) === v));
console.log('SOURCE: original 256 table bytes; p55/56/57 lengths 76/85/95; rings 76/68/60/52');
console.log('HG polynomial ascending', HG.join(','), 'central information rectangle 28x4 = 112');
console.log('TRAIN: 112/112 core key values reconstructed; p56 84 prime advances independently checked');
console.log('HELDOUT original 68 GP runes:', primary.heldoutMatches, '/ 68 correct (67 wrong)');
console.log('FIRST heldout original key / predicted:', knownKey[0], '/', primary.key[76]);
console.log('WRONG-SOURCE base59 heldout:', negativeSource.heldoutMatches, '/ 68');
console.log('p55 rejected-candidate native GP prefix:', p55Translit.slice(0, 95));
console.log('p55 rejected-candidate IoC:', ioc.toFixed(12));
console.log('POSITIVE: exact 256/256 planted GP text/key reconstruction and reencryption');
console.log('DECISION: source HG/HG 112-data 144-parity terminal cipher rejected on authentic known plaintext.');
