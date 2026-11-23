'use strict';

/**
 * Original 2014 3301-sum magic-square GP29 spectral projection against
 * signed 2013 BASE29(3301)=3QO. Exact original LP2 source, no fitted keys.
 * Read-only single-file test for Windows Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const squarePath = 'resources/cicada2014-openpuff-magic-squares.txt';
const corpusPath = 'resources/liber-primus/lp2-corpus.json';
const signedPath = 'resources/external/2013-tcp-server-signed-source.md';
const signed = read(signedPath);
const source = JSON.parse(read(corpusPath));
const squares = read(squarePath).trim().split(/\r?\n\s*\r?\n/u)
  .map(block => block.trim().split(/\r?\n/u).map(line =>
    line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(squares.map(m => [m.length, m[0].length]), [[5, 5], [7, 7], [5, 5]]);
assert.ok(signed.includes('BASE29 3301') && signed.includes('3QO'));
assert.equal(source.pages.filter(p => p.page < 56).reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(source.pages[50].indices.length, 0);

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function inverse(n) {
  assert.notEqual(mod(n), 0);
  let a = 1;
  while (mod(a * n) !== 1) a++;
  return a;
}
/** @param {number} n @returns {number[][]} */
const eye = n => Array.from({length: n}, (_, i) =>
  Array.from({length: n}, (_, j) => Number(i === j)));
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function mul(a, b) {
  return a.map(row => b[0].map((_, j) =>
    mod(row.reduce((s, x, k) => s + x * b[k][j], 0))));
}
/** @param {number[][]} m @returns {number[]} */
function charpoly(m) {
  const n = m.length;
  let p = eye(n);
  const traces = [];
  for (let k = 1; k <= n; k++) {
    p = mul(p, m);
    traces.push(mod(p.reduce((s, row, i) => s + row[i], 0)));
  }
  const coeff = [1];
  for (let k = 1; k <= n; k++) {
    let sum = 0;
    for (let j = 1; j <= k; j++) sum += coeff[k-j] * traces[j-1];
    coeff.push(mod(-sum * inverse(k)));
  }
  return coeff;
}
/** @param {number[][]} m @returns {number[][]} */
function invert(m) {
  const n = m.length;
  const aug = m.map((row, i) => [...row.map(mod), ...eye(n)[i]]);
  for (let j = 0; j < n; j++) {
    const pivot = aug.findIndex((r, i) => i >= j && r[j] !== 0);
    assert.ok(pivot >= j, 'GF29 matrix must be nonsingular');
    [aug[j], aug[pivot]] = [aug[pivot], aug[j]];
    const factor = inverse(aug[j][j]);
    aug[j] = aug[j].map(x => mod(x * factor));
    for (let i = 0; i < n; i++) {
      if (i === j) continue;
      const f = aug[i][j];
      aug[i] = aug[i].map((x, k) => mod(x - f * aug[j][k]));
    }
  }
  return aug.map(row => row.slice(n));
}
/** @param {number[][]} m @param {number} lambda @returns {number[]} */
function leftEigen(m, lambda) {
  const n = m.length;
  const rows = Array.from({length: n}, (_, i) =>
    Array.from({length: n}, (_, j) => mod(m[j][i] - (i === j ? lambda : 0))));
  const pivots = [];
  let rank = 0;
  for (let j = 0; j < n; j++) {
    const pivot = rows.findIndex((r, i) => i >= rank && r[j] !== 0);
    if (pivot < 0) continue;
    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    const factor = inverse(rows[rank][j]);
    rows[rank] = rows[rank].map(x => mod(x * factor));
    for (let i = 0; i < n; i++) {
      if (i === rank) continue;
      const f = rows[i][j];
      rows[i] = rows[i].map((x, k) => mod(x - f * rows[rank][k]));
    }
    pivots.push(j);
    rank++;
  }
  const free = Array.from({length: n}, (_, j) => j).filter(j => !pivots.includes(j));
  assert.equal(free.length, 1, 'source eigenvalue must have one-dimensional eigenspace');
  const v = Array(n).fill(0);
  v[free[0]] = 1;
  for (let i = 0; i < rank; i++) v[pivots[i]] = mod(-rows[i][free[0]]);
  const norm = inverse(v.find(x => x !== 0));
  return v.map(x => mod(x * norm));
}
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
const transform = (m, v) => m.map(row =>
  mod(row.reduce((s, x, i) => s + x * v[i], 0)));
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const x of values) bins[x]++;
  return bins.reduce((s, v) => s + v * (v - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} seq @param {number[][]} m @returns {number[]} */
function extract(seq, m) {
  const out = [];
  for (let i = 0; i + 5 <= seq.length; i += 5) {
    out.push(...transform(m, seq.slice(i, i + 5)));
  }
  return out;
}
/** @param {number[]} indices @returns {number[]} */
const fullBlockInverse = indices => transform(mInv, indices);

const A = squares[0].map(row => row.map(mod));
const B = squares[2].map(row => row.map(mod));
assert.deepEqual(squares.map(m => m.reduce((s, r) => s + r[0], 0)), [3301, 1033, 1033]);
for (const [matrix, sum] of [[squares[0], 3301], [squares[2], 1033]]) {
  for (const row of matrix) assert.equal(row.reduce((s, v) => s + v, 0), sum);
}
assert.deepEqual(charpoly(A), [1, 5, 17, 27, 27, 19]);
assert.deepEqual(charpoly(B), [1, 11, 27, 7, 5, 26]);
const H = [3, 26, 24]; // Signed 2013 BASE29(3301) digits 3,Q,O.
const W = H.map(eigenvalue => leftEigen(A, eigenvalue));
assert.deepEqual(W, [
  [1, 14, 0, 15, 28],
  [1, 12, 0, 17, 28],
  [1, 1, 1, 1, 1],
]);
for (let k = 0; k < H.length; k++) {
  for (let j = 0; j < 5; j++) {
    assert.equal(mod(W[k].reduce((s, v, i) => s + v * A[i][j], 0)),
      mod(H[k] * W[k][j]));
  }
}
// Preserve both complementary original coordinates to obtain a lossless 5→(3+2) map.
const M = [...W, [1, 0, 0, 0, 0], [0, 1, 0, 0, 0]];
const mInv = invert(M);
assert.deepEqual(mul(M, mInv), eye(5));

// The same signed BASE29 digits also form an exact *coefficient* factor of
// the original p49-51 numeric table, unlike the eigenvalue-root polynomial.
/** @param {number[]} factors @param {number[]} other @returns {number[]} */
function polyMul(factors, other) {
  const out = Array(factors.length + other.length - 1).fill(0);
  for (let i = 0; i < factors.length; i++) {
    for (let j = 0; j < other.length; j++) out[i+j] = mod(out[i+j] + factors[i]*other[j]);
  }
  return out;
}
/** @param {number[]} polynomial @param {number[]} divisor @returns {number[]} */
function polyRemainder(polynomial, divisor) {
  const out = polynomial.map(mod);
  for (let i = out.length - divisor.length; i >= 0; i--) {
    const lead = mod(out[i + divisor.length - 1] * inverse(divisor[divisor.length-1]));
    for (let j = 0; j < divisor.length; j++) out[i+j] = mod(out[i+j] - lead*divisor[j]);
  }
  return out.slice(0, divisor.length-1);
}
const rawGrid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
assert.equal(rawGrid.bytes.length, 256);
const red39 = source.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red39, [27,5,15]);
const factorHG = polyMul(H, red39);
assert.deepEqual(factorHG, [23,21,11,17,12]);
const tableCoefficients = rawGrid.bytes.slice().reverse();
assert.deepEqual(polyRemainder(tableCoefficients, H), [0,0]);
assert.deepEqual(polyRemainder(tableCoefficients, red39), [0,0]);
assert.deepEqual(polyRemainder(tableCoefficients, factorHG), [0,0,0,0]);
const eigenRootPolynomial = polyMul(polyMul([-3,1],[-26,1]),[-24,1]);
assert.deepEqual(eigenRootPolynomial, [13,20,5,1]);
assert.deepEqual(polyRemainder(tableCoefficients, eigenRootPolynomial), [18,12,4]);
console.log('SIGNED_2013_TO_2014_MATRIX_AND_P50_TRIANGLE', JSON.stringify({
  signedBase29Digits: H, firstSquareGP29RationalEigenvalues: H,
  p39OriginalRedTriad: red39,
  originalGridHFactorRemainder: polyRemainder(tableCoefficients, H),
  originalGridHGFactorRemainder: polyRemainder(tableCoefficients, factorHG),
  originalGridSpectralRootPolynomialRemainder:
    polyRemainder(tableCoefficients, eigenRootPolynomial),
  evidence: 'Three exact source objects; coefficients versus roots are distinct; no plaintext'
}));

const decodePages = (start, end) => source.pages
  .filter(p => p.page >= start && p.page <= end)
  .flatMap(p => extract(p.indices, W));
const original = decodePages(0, 55);
const train = decodePages(16, 21);
const holdout = decodePages(40, 53);
const terminal = decodePages(55, 55);
assert.equal(original.length, 7704);
assert.equal(train.length, 960);
assert.equal(holdout.length, 1788);
assert.equal(terminal.length, 45);
assert.ok(Math.abs(ioc(original) - 0.03449998375570522) < 1e-12);
assert.ok(Math.abs(ioc(train) - 0.03474973931178311) < 1e-12);
assert.ok(Math.abs(ioc(holdout) - 0.034534777018712076) < 1e-12);
for (const p of source.pages.filter(p => p.page < 56)) {
  for (let j = 0; j + 5 <= p.indices.length; j += 5) {
    const c = p.indices.slice(j, j + 5);
    assert.deepEqual(fullBlockInverse(transform(M, c)), c);
  }
}
// Native solved p57 is clear GP29. Plant 57 genuine source runes into the
// selected three slots of an original-length 95-rune cipher, with two auxiliary
// coordinates per block, then recover the native plaintext and entire cipher.
const native = source.pages.find(p => p.page === 57).indices.slice(0, 57);
assert.equal(native.length, 57);
const synthetic = [];
for (let j = 0; j < 19; j++) {
  const v = [...native.slice(j * 3, j * 3 + 3),
    mod(j * 11 + 7), mod(j * 13 + 2)];
  synthetic.push(...transform(mInv, v));
}
assert.equal(synthetic.length, 95);
assert.deepEqual(extract(synthetic, W), native);
for (let j = 0; j < 19; j++) {
  const b = synthetic.slice(j * 5, j * 5 + 5);
  assert.deepEqual(transform(mInv, transform(M, b)), b);
}

/** @param {number[]} digits @returns {Buffer} */
function digitsToBytes(digits) {
  let n = 0n;
  for (const d of digits) n = n * 29n + BigInt(d);
  const values = [];
  while (n > 0n) {
    values.push(Number(n & 255n));
    n >>= 8n;
  }
  return Buffer.from(values.reverse());
}
/** @param {Buffer} bytes @returns {number[]} */
function bytesToDigits(bytes) {
  let n = 0n;
  for (const value of bytes) n = n * 256n + BigInt(value);
  const digits = [];
  do {
    digits.push(Number(n % 29n));
    n /= 29n;
  } while (n > 0n);
  return digits.reverse();
}
/** @param {Buffer} b @returns {string[]} */
function typedHeaders(b) {
  const head = b.subarray(0, 8).toString('hex');
  const names = [];
  if (head.startsWith('1f8b08')) names.push('gzip');
  if (head.startsWith('504b0304')) names.push('zip');
  if (head.startsWith('89504e470d0a1a0a')) names.push('png');
  if (head.startsWith('255044462d')) names.push('pdf');
  if (b.length >= 2 && b[0] === 0x78 && ((b[0] * 256 + b[1]) % 31) === 0)
    names.push('zlib');
  return names;
}
const pageBytes = source.pages.filter(p => p.page < 56 && p.indices.length > 0).map(p => {
  const raw = digitsToBytes(extract(p.indices, W));
  return { page: p.page, bytes: raw, headers: typedHeaders(raw) };
});
assert.equal(pageBytes.length, 55);
assert.equal(pageBytes.reduce((s, p) => s + p.bytes.length, 0), 4699);
assert.deepEqual(pageBytes.flatMap(p => p.headers.map(name => [p.page, name])), []);
// Demonstrate a genuine historical compressed-source register can survive the
// same fixed 3/5 projection and exact base29 integer-to-byte serialization.
// The source payload is every unmodified GP29 native-clear rune on solved p57.
const zlib = require('node:zlib');
const solvedGPBytes = Buffer.from(source.pages[57].indices);
const genuineCompressed = zlib.gzipSync(solvedGPBytes);
const packedDigits = bytesToDigits(genuineCompressed);
while (packedDigits.length % 3 !== 0) packedDigits.unshift(0);
const compressedPlantCipher = [];
for (let i = 0; i < packedDigits.length; i += 3) {
  const v = [...packedDigits.slice(i, i + 3), mod(i * 3 + 1), mod(i * 7 + 2)];
  compressedPlantCipher.push(...transform(mInv, v));
}
const recoveredCompressed = digitsToBytes(extract(compressedPlantCipher, W));
assert.deepEqual(recoveredCompressed, genuineCompressed);
assert.deepEqual(zlib.gunzipSync(recoveredCompressed), solvedGPBytes);
console.log('ORIGINAL_LP2_NATIVE_BASE29_BYTE_PACKETS', JSON.stringify({
  originalPages: pageBytes.length,
  candidateBytes: pageBytes.reduce((s, p) => s + p.bytes.length, 0),
  typedHeaders: pageBytes.flatMap(p => p.headers),
  p0Prefix: pageBytes.find(p => p.page === 0).bytes.subarray(0, 8).toString('hex'),
  p55Prefix: pageBytes.find(p => p.page === 55).bytes.subarray(0, 8).toString('hex'),
  solvedGzipPlantRecovered: true, originalP57GPRunes: solvedGPBytes.length,
}));

const hashes = Object.fromEntries([squarePath, corpusPath, signedPath].map(p =>
  [p, crypto.createHash('sha256').update(read(p)).digest('hex')]));
console.log('INPUT_HASHES', JSON.stringify(hashes));
console.log('SOURCE_2014_SQUARE_SPECTRA', JSON.stringify({
  char3301: charpoly(A), char1033: charpoly(B),
  spectralDigits3301: H, eigencoordinates: W,
  spectrum3301: '24,3,-3 and irreducible x^2-3',
  spectrum1033: '5,8,24,21,18 = GP word CHANGE',
  one3301EigenvalueForcedByRowSum: true,
  evidenceClass: 'cross-artifact arithmetic coincidence, no authored LP2 decoder'
}));
console.log('ORIGINAL_LP2_CHANNEL', JSON.stringify({
  inputRunes: 12956, projectedRunes: original.length,
  originalIOC: ioc(original), p16to21IOC: ioc(train),
  p40to53IOC: ioc(holdout), p55IOC: ioc(terminal),
  sourceClearP57IOC: ioc(source.pages[57].indices),
  sourceNativePlant57IOC: ioc(native), sourceNativePlantRecovered: true,
  fullRankMatrixRoundTrip: true
}));
console.log('PASS: source-exact 2014 spectral crosslink, original 3/5 projection negative, native-GP positive');
