'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const squares = fs.readFileSync(path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n\s*\r?\n/);
const magic = squares[1].trim().split(/\r?\n/).map((row) => row.trim().split(/\s+/).map(Number));
const page = corpus.pages.find((p) => p.page === 32).indices;
const mod = (x) => (x % 29 + 29) % 29;
assert.equal(page.length, 121);
assert.equal(magic.length, 7);
assert.ok(magic.every((row) => row.length === 7));
assert.equal(magic[3][3], 331);
for (let r = 0; r < 7; r++) {
  assert.equal(magic[r].reduce((a, b) => a + b, 0), 1033);
  assert.equal(magic.reduce((sum, row) => sum + row[r], 0), 1033);
}
const primes = page.map((index) => corpus.prime[index]);
assert.equal(primes.slice(0, 11).reduce((a, b) => a + b, 0), 563);
assert.equal(Array.from({ length: 11 }, (_, r) => primes[r * 11])
  .reduce((a, b) => a + b, 0), 569);
const positions = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 7 }, (_, c) => (r + 2) * 11 + c + 2));
const ciphertext = positions.map((row) => row.map((i) => page[i]));
assert.equal(ciphertext.flat().length, 49);

const gp = new Map(corpus.translit.map((letter, i) => [letter, i]));
gp.set('ING', 21);
function englishToGP(source) {
  const text = source.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const letter = word.slice(i, i + n);
        if (gp.has(letter)) {
          result.push(gp.get(letter));
          i += n;
          found = true;
          break;
        }
      }
      assert.ok(found, 'unmapped English source sequence');
    }
  }
  return result;
}
const emerson = englishToGP(fs.readFileSync(
  path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8'));
assert.ok(emerson.length > 290000);
const counts = new Uint32Array(29 ** 3);
for (let i = 2; i < 50000; i++)
  counts[emerson[i - 2] * 841 + emerson[i - 1] * 29 + emerson[i]]++;
const smoothing = 0.2, total = 49998 + counts.length * smoothing;
function score(matrix) {
  let sum = 0, n = 0;
  for (const row of matrix) {
    for (let c = 2; c < 7; c++, n++) {
      const index = row[c - 2] * 841 + row[c - 1] * 29 + row[c];
      sum += Math.log((counts[index] + smoothing) / total);
    }
  }
  return sum / n;
}
function phi(number) {
  let n = number, result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}
function orient(r, c, variant) {
  if (variant & 4) c = 6 - c;
  for (let i = 0; i < (variant & 3); i++) [r, c] = [c, 6 - r];
  return [r, c];
}
function additive(cipher, method, sign, orientation) {
  return cipher.map((row, r) => row.map((symbol, c) => {
    const [y, x] = orient(r, c, orientation);
    const value = method === 'raw' ? magic[y][x] : phi(magic[y][x]);
    return mod(symbol + sign * value);
  }));
}
function transpose(m) {
  return m.map((row, r) => row.map((_, c) => m[c][r]));
}
function inverse(m) {
  const n = 7;
  const a = m.map((row, r) =>
    [...row.map(mod), ...Array.from({ length: n }, (_, c) => +(r === c))]);
  for (let c = 0; c < n; c++) {
    const pivot = a.findIndex((row, r) => r >= c && row[c] !== 0);
    assert.ok(pivot >= c, 'historical 7x7 square must be invertible over F29');
    [a[pivot], a[c]] = [a[c], a[pivot]];
    const inv = Array.from({ length: 29 }, (_, k) => k)
      .find((k) => mod(k * a[c][c]) === 1);
    for (let j = 0; j < 2 * n; j++) a[c][j] = mod(a[c][j] * inv);
    for (let r = 0; r < n; r++) if (r !== c) {
      const factor = a[r][c];
      for (let j = 0; j < 2 * n; j++)
        a[r][j] = mod(a[r][j] - factor * a[c][j]);
    }
  }
  return a.map((row) => row.slice(n));
}
function linear(m, c, side) {
  if (side === 'left')
    return m.map((row) => c[0].map((_, j) =>
      mod(row.reduce((a, x, k) => a + x * c[k][j], 0))));
  return c.map((row) => m[0].map((_, j) =>
    mod(row.reduce((a, x, k) => a + x * m[k][j], 0))));
}
const base = magic.map((row) => row.map(mod));
const rev = inverse(base);
const variants = [];
for (const method of ['raw', 'totient'])
  for (const sign of [-1, 1])
    for (let orientation = 0; orientation < 8; orientation++) {
      const decoded = additive(ciphertext, method, sign, orientation);
      assert.deepEqual(additive(decoded, method, -sign, orientation), ciphertext);
      variants.push({ family: 'additive', method, sign, orientation,
        score: score(decoded), preview: decoded.map((row) =>
          row.map((x) => corpus.translit[x]).join('')).join('/') });
    }
for (const orientation of ['original', 'transposed']) {
  const a = orientation === 'original' ? base : transpose(base);
  const b = orientation === 'original' ? rev : transpose(rev);
  for (const direction of ['forward', 'inverse'])
    for (const side of ['left', 'right']) {
      const decoder = direction === 'forward' ? a : b;
      const encoder = direction === 'forward' ? b : a;
      const decoded = linear(decoder, ciphertext, side);
      assert.deepEqual(linear(encoder, decoded, side), ciphertext);
      variants.push({ family: 'hill7', orientation, direction, side,
        score: score(decoded), preview: decoded.map((row) =>
          row.map((x) => corpus.translit[x]).join('')).join('/') });
    }
const native = positions.map((row) => row.map((i) => emerson[62000 + i]));
const plantedAdditive = additive(native, 'totient', 1, 0);
assert.deepEqual(additive(plantedAdditive, 'totient', -1, 0), native);
const plantedHill = linear(base, native, 'left');
assert.deepEqual(linear(rev, plantedHill, 'left'), native);
const controls = [];
for (let i = 0; i < 1000; i++) {
  const start = 70000 + 199 * i;
  controls.push(score(positions.map((row) => row.map((p) => emerson[start + p]))));
}
controls.sort((x, y) => x - y);
const best = variants.slice().sort((a, b) => b.score - a.score);
const summary = { class: 'source-locked p32 central-7x7 original inverse; no recovered plaintext',
  exactSource: { treePageRunes: 121, marginRemovedPerSide: 2,
    coreRunes: 49, historicalSquareOrder: 7, historicalMagicSum: 1033,
    squareCenter: 331 },
  originalCoreScore: score(ciphertext),
  bestOriginalCandidate: best[0],
  bestAdditive: best.find((x) => x.family === 'additive'),
  bestHill7: best.find((x) => x.family === 'hill7'),
  variants: variants.length,
  originalAboveNativeHoldouts: controls.filter((v) => best[0].score >= v).length,
  nativeHoldoutMin: controls[0], nativeHoldoutMedian: controls[500],
  nativeControlScore: score(native),
  additivePositiveControlRecovered: 49, hillPositiveControlRecovered: 49,
  allOriginalInputsReenciphered: variants.length * 49,
  bestEight: best.slice(0, 8) };
assert.ok(best[0].score < controls[0], 'unexpected original candidate, investigate before classifying');
console.log(JSON.stringify(summary, null, 2));
