'use strict';

/**
 * Single-file original LP2 cyclic convolution gate.
 * Run from the repository root: node sims/lp2_cyclic_source_factor_sft.cjs
 * Zero external dependencies; all outputs derive from checked-in canonical data.
 *
 * C(x) = K(x) P(x) (mod x^N - 1), GP29 coefficients in printed order
 * from lowest to highest power. A distinct source-visible chapter or page is
 * treated as one complete ring; no fitted key, phase, or alphabet.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const MOD = 29;
const mod = x => (x % MOD + MOD) % MOD;
function inverse(x) {
  for (let i = 1; i < MOD; i++) {
    if (mod(i * x) === 1) return i;
  }
  throw Error('non-invertible GP29 coefficient: ' + x);
}
const keys = {
  H: [3, 26, 24], // authenticated 2013 BASE29 3301 -> 3QO, ascending
  G: [27, 5, 15], // original p39 red triad, ascending
  HG: [23, 21, 11, 17, 12],
  F16: [13, 20, 26, 12, 6, 2, 13, 26, 6, 26, 11, 7, 15, 11, 17, 25, 1]
};
const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const source = data.pages.slice(0, 56).flatMap(x => x.indices);
assert.equal(source.length, 12956);
assert.equal(chapters.reduce((s, n) => s + n, 0), source.length);
assert.equal(data.pages[57].indices.length, 95);

function makeChapters() {
  let at = 0;
  return chapters.map(n => {
    const answer = source.slice(at, at + n);
    at += n;
    return answer;
  });
}
const sections = {
  continuous: [source],
  chapters: makeChapters(),
  pages: data.pages.slice(0, 56).filter(p => p.indices.length).map(p => p.indices)
};
assert.equal(sections.pages.length, 55);

function evalAt24(seq) {
  let y = 0, power = 1;
  for (const c of seq) {
    y = mod(y + power * c);
    power = mod(power * 24);
  }
  return y;
}
function remainderH(seq) {
  // Root u of monic H(X)/24 = X^2 + 18X + 11;
  // u^2 = 18 + 11u, in the field with 29^2 elements.
  let a = 0, b = 0, pa = 1, pb = 0;
  for (const c of seq) {
    a = mod(a + c * pa);
    b = mod(b + c * pb);
    [pa, pb] = [mod(18 * pb), mod(pa + 11 * pb)];
  }
  return [a, b];
}
function ordinaryOrder(base, limit) {
  let y = 1;
  for (let i = 1; i <= limit; i++) {
    y = mod(y * base);
    if (y === 1) return i;
  }
  throw Error('expected multiplicative order');
}
function fieldOrder(limit) {
  let a = 1, b = 0;
  for (let i = 1; i <= limit; i++) {
    [a, b] = [mod(18 * b), mod(a + 11 * b)];
    if (a === 1 && b === 0) return i;
  }
  throw Error('expected field order');
}
assert.equal(ordinaryOrder(24, 28), 7);
assert.equal(fieldOrder(840), 840);

function encrypt(plain, key) {
  const n = plain.length;
  return plain.map((_, i) => mod(key.reduce(
    (sum, coeff, j) => sum + coeff * plain[(i - j + n) % n], 0
  )));
}
function simulate(cipher, key, seed) {
  const n = cipher.length, d = key.length - 1;
  const out = new Array(n), inv = inverse(key[0]);
  for (let i = 0; i < n; i++) {
    let v = cipher[i];
    for (let j = 1; j <= d; j++) {
      v -= key[j] * (i >= j ? out[i - j] : seed[d + i - j]);
    }
    out[i] = mod(inv * v);
  }
  return out;
}
function solve(A, rhs) {
  const n = rhs.length, matrix = A.map((r, i) => [...r, rhs[i]]);
  const pivots = [];
  for (let c = 0, row = 0; c < n && row < n; c++) {
    let p = row;
    while (p < n && matrix[p][c] === 0) p++;
    if (p === n) continue;
    [matrix[p], matrix[row]] = [matrix[row], matrix[p]];
    const inv = inverse(matrix[row][c]);
    for (let j = c; j <= n; j++) matrix[row][j] = mod(matrix[row][j] * inv);
    for (let i = 0; i < n; i++) {
      if (i === row || matrix[i][c] === 0) continue;
      const ratio = matrix[i][c];
      for (let j = c; j <= n; j++) {
        matrix[i][j] = mod(matrix[i][j] - ratio * matrix[row][j]);
      }
    }
    pivots.push(c);
    row++;
  }
  for (let i = pivots.length; i < n; i++) {
    if (matrix[i][n]) return { kind: 'impossible' };
  }
  if (pivots.length !== n) return { kind: 'nonunique' };
  const seed = new Array(n).fill(0);
  for (let row = 0; row < n; row++) seed[pivots[row]] = matrix[row][n];
  return { kind: 'unique', seed };
}
function decode(cipher, key) {
  const n = cipher.length, d = key.length - 1;
  assert.ok(n > d, 'source ring shorter than filter');
  const zeros = new Array(d).fill(0);
  const baseline = simulate(cipher, key, zeros);
  const empty = new Array(n).fill(0);
  const basis = Array.from({ length: d }, (_, j) =>
    simulate(empty, key, zeros.map((_, i) => Number(i === j)))
  );
  const A = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) =>
      mod(basis[j][n - d + i] - Number(i === j))
    )
  );
  const rhs = Array.from({ length: d }, (_, i) => mod(-baseline[n - d + i]));
  const answer = solve(A, rhs);
  if (answer.kind !== 'unique') return answer;
  const plaintext = simulate(cipher, key, answer.seed);
  assert.deepEqual(encrypt(plaintext, key), cipher);
  return { kind: 'unique', plaintext };
}
function ioc(seq) {
  const counts = Array(MOD).fill(0);
  for (const v of seq) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}

const originalIoc = ioc(source);
console.log('source runes', source.length, 'original IoC', originalIoc);
for (const [name, key] of Object.entries(keys)) {
  // Check the complete polynomial implementation on a genuine native rune sample.
  const native = data.pages[57].indices;
  const encrypted = encrypt(native, key), restored = decode(encrypted, key);
  assert.equal(restored.kind, 'unique', 'native positive plant singular');
  assert.deepEqual(restored.plaintext, native, 'native roundtrip');
  const status = {};
  for (const [clock, spans] of Object.entries(sections)) {
    const decoded = [], imps = [], nonunique = [];
    spans.forEach((cipher, i) => {
      const result = decode(cipher, key);
      if (result.kind === 'unique') decoded.push(...result.plaintext);
      else if (result.kind === 'impossible') imps.push(i);
      else nonunique.push(i);
    });
    status[clock] = {
      uniqueRunes: decoded.length, impossibleRings: imps,
      nonuniqueRings: nonunique,
      uniqueIoc: decoded.length > 1 ? ioc(decoded) : null
    };
  }
  console.log(name, JSON.stringify(status));
  assert.equal(status.continuous.uniqueRunes, 12956);

  if (name === 'H') {
    assert.deepEqual(status.chapters.impossibleRings, [6]);
    assert.deepEqual(remainderH(sections.chapters[6]), [0, 20]);
    assert.equal(status.pages.impossibleRings.length, 0);
  } else {
    assert.deepEqual(status.chapters.impossibleRings, [2, 6, 8]);
    assert.deepEqual(
      [2, 6, 8].map(i => evalAt24(sections.chapters[i])),
      [18, 2, 3]
    );
    assert.equal(status.pages.impossibleRings.length, 11);
  }
  assert.deepEqual(status.chapters.nonuniqueRings, []);
  assert.deepEqual(status.pages.nonuniqueRings, []);
}
console.log('PASS: original cyclic codeword exclusions and native-GP controls');
