'use strict';
/**
 * Bounded original-source test: LP1 p05's hidden 1033 square transformed
 * elementwise by Euler phi or the Mobius function, reduced in GP29, then used
 * as either a 25-symbol additive key or a 5x5 Hill key. Tests natural
 * directions, row/column conventions, and global/page-reset alignment.
 *
 * Run from repository root:
 *   node sims/lp1_p05_totient_mobius_hill_original_sft.cjs
 *
 * This is not a generic matrix sweep. The source-derived candidate set is
 * exactly {phi(B) mod 29, mu(B) mod 29}, where B is the hidden LP1 p05 square.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const mod = x => ((x % 29) + 29) % 29;

const central = fs.readFileSync(
  path.join(ROOT, 'im-results', 'lp1-p05-central-block.txt'), 'utf8'
).replace(/\r\n/g, '\n');
assert(central.startsWith('\n\n'));
const hex = central.trim();
assert.equal(Buffer.byteLength('\n\n' + hex, 'ascii'), 360);
assert.match(hex, /^[0-9a-f]{358}$/);
const payload = Buffer.from(hex, 'hex');
assert.equal(payload.length, 179);

const swapNibble = v => ((v & 15) << 4) | (v >>> 4);
const readable = Buffer.from(payload.map(swapNibble)).toString('ascii');
const unmirrorDigits = text =>
  text.replace(/\d+/g, word => word.split('').reverse().join(''));
const revealed = unmirrorDigits(readable);
const parseMatrix = text =>
  text.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/));
const B = parseMatrix(revealed).map(row => row.map(Number));
assert.equal(B.length, 5);
assert(B.every(row => row.length === 5));

const historical = fs.readFileSync(
  path.join(ROOT, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8'
);
const historicalMatrices = historical.trim().split(/(?:\r?\n){2,}/).map(parseMatrix);
assert.equal(historicalMatrices.length, 3);
assert.deepEqual(B.map(row => row.map(String)), historicalMatrices[2]);
for (let r = 0; r < 5; r++) {
  assert.equal(B[r].reduce((a, b) => a + b, 0), 1033);
  assert.equal(B.reduce((a, row) => a + row[r], 0), 1033);
}
assert.equal(B.reduce((a, row, i) => a + row[i], 0), 1033);
assert.equal(B.reduce((a, row, i) => a + row[4 - i], 0), 1033);

function phi(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    while (remaining % p === 0) remaining /= p;
    result = Math.round(result * (p - 1) / p);
  }
  if (remaining > 1) result = Math.round(result * (remaining - 1) / remaining);
  return result;
}
function mobius(n) {
  let remaining = n;
  let sign = 1;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    remaining /= p;
    sign = -sign;
    if (remaining % p === 0) return 0;
    while (remaining % p === 0) remaining /= p;
  }
  if (remaining > 1) sign = -sign;
  return sign;
}
function inverseScalar(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible pivot: ' + a);
}
function invertMatrix(A) {
  const n = A.length;
  const M = A.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && M[pivot][col] === 0) pivot++;
    assert(pivot < n, 'candidate matrix is singular in GF(29)');
    if (pivot !== col) {
      [M[col], M[pivot]] = [M[pivot], M[col]];
      det = mod(-det);
    }
    const pivotValue = M[col][col];
    det = mod(det * pivotValue);
    const reciprocal = inverseScalar(pivotValue);
    M[col] = M[col].map(v => mod(v * reciprocal));
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const scale = M[r][col];
      M[r] = M[r].map((v, j) => mod(v - scale * M[col][j]));
    }
  }
  return { det, inverse: M.map(row => row.slice(n)) };
}
const transpose = A => A[0].map((_, j) => A.map(row => row[j]));
const multiply = (A, vector) => A.map(row =>
  mod(row.reduce((sum, value, j) => sum + value * vector[j], 0))
);
function transformSequence(sequence, A) {
  const output = sequence.slice();
  for (let start = 0; start + 5 <= sequence.length; start += 5) {
    const block = multiply(A, sequence.slice(start, start + 5));
    for (let j = 0; j < 5; j++) output[start + j] = block[j];
  }
  return { output, untouchedTail: sequence.length % 5 };
}
function transformPages(pages, A, pageReset) {
  if (!pageReset) {
    const sequence = pages.flat();
    return transformSequence(sequence, A);
  }
  const transformed = pages.map(page => transformSequence(page, A));
  return {
    output: transformed.flatMap(item => item.output),
    untouchedTail: transformed.reduce((sum, item) => sum + item.untouchedTail, 0)
  };
}
function coincidence(indices) {
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value]++;
  const n = indices.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const alphabet = corpus.translit;
assert.equal(alphabet.length, 29);
const unknownPages = corpus.pages.filter(page => page.page <= 55).map(page => page.indices);
const unknown = unknownPages.flat();
assert.equal(unknown.length, 12956);
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p55[0], 21);
assert.equal(p55[25], 0);
assert.equal(p57.length, 95);

const quadgrams = fs.readFileSync(
  path.join(ROOT, 'resources', 'control', 'duko_round27_english_quadgrams.txt'), 'utf8'
);
const qmap = new Map();
let qtotal = 0;
for (const line of quadgrams.trim().split(/\r?\n/)) {
  const match = line.match(/^([A-Z]{4})\s+(\d+)$/);
  if (!match) continue;
  const count = Number(match[2]);
  qmap.set(match[1], count);
  qtotal += count;
}
assert(qmap.size > 1000);
const smooth = 0.01;
const qdenominator = qtotal + smooth * (26 ** 4);
function languageScore(indices) {
  const text = indices.map(index => alphabet[index]).join('');
  let total = 0;
  let n = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    const count = qmap.get(text.slice(i, i + 4)) || smooth;
    total += Math.log10(count / qdenominator);
    n++;
  }
  return {
    average: total / n,
    quadgrams: n,
    ic: coincidence(indices),
    preview: text.slice(0, 220)
  };
}

const Kphi = B.map(row => row.map(value => phi(value) % 29));
const Kmu = B.map(row => row.map(value => mod(mobius(value))));
const phiInverse = invertMatrix(Kphi);
const muInverse = invertMatrix(Kmu);
assert.equal(phiInverse.det, 28);
assert.equal(muInverse.det, 24);

const rawUnknown = languageScore(unknown);
const p57Control = languageScore(p57);
const fullCandidates = [];
const p55Candidates = [];
for (const [keyName, key, inverse] of [
  ['phi', Kphi, phiInverse.inverse],
  ['mu', Kmu, muInverse.inverse]
]) {
  const variants = [
    ['Kinv', inverse],
    ['KinvT', transpose(inverse)],
    ['K', key],
    ['KT', transpose(key)]
  ];
  for (const [variant, matrix] of variants) {
    for (const pageReset of [true, false]) {
      const transformed = transformPages(unknownPages, matrix, pageReset);
      const score = languageScore(transformed.output);
      fullCandidates.push({
        key: keyName,
        variant,
        alignment: pageReset ? 'page-reset' : 'global',
        untouchedTail: transformed.untouchedTail,
        average: score.average,
        ic: score.ic,
        preview: score.preview
      });
    }
  }
  const p55Framings = [
    ['drop-first-NG', p55.slice(1)],
    ['remove-literal-F', p55.filter((_, index) => index !== 25)]
  ];
  for (const [framing, sequence] of p55Framings) {
    assert.equal(sequence.length, 75);
    for (const [variant, matrix] of variants) {
      const transformed = transformSequence(sequence, matrix);
      const score = languageScore(transformed.output);
      p55Candidates.push({
        key: keyName,
        variant,
        framing,
        untouchedTail: transformed.untouchedTail,
        average: score.average,
        ic: score.ic,
        preview: score.preview
      });
    }
  }
}
fullCandidates.sort((a, b) => b.average - a.average);
p55Candidates.sort((a, b) => b.average - a.average);

const additiveCandidates = [];
for (const [keyName, matrix] of [['phi', Kphi], ['mu', Kmu]]) {
  const key = matrix.flat();
  for (const sign of [-1, 1]) {
    for (const pageReset of [true, false]) {
      const output = pageReset
        ? unknownPages.flatMap(page => page.map((value, index) =>
            mod(value + sign * key[index % key.length])))
        : unknown.map((value, index) => mod(value + sign * key[index % key.length]));
      const score = languageScore(output);
      additiveCandidates.push({
        key: keyName,
        operation: sign === -1 ? 'C-K' : 'C+K',
        alignment: pageReset ? 'page-reset' : 'global',
        average: score.average,
        ic: score.ic,
        preview: score.preview
      });
    }
  }
}
additiveCandidates.sort((a, b) => b.average - a.average);

const rawP55 = {
  full: languageScore(p55),
  dropFirstNG: languageScore(p55.slice(1)),
  removeLiteralF: languageScore(p55.filter((_, index) => index !== 25))
};
assert(Math.abs(rawUnknown.average - (-7.440422303145423)) < 1e-10);
assert(Math.abs(p57Control.average - (-4.420906439449695)) < 1e-10);
assert.equal(fullCandidates.length, 16);
assert.equal(p55Candidates.length, 16);
assert.equal(additiveCandidates.length, 8);
assert(Math.abs(additiveCandidates[0].average - (-7.453372230171215)) < 1e-10);

console.log(JSON.stringify({
  source: {
    matrix1033: B,
    rowSums: B.map(row => row.reduce((a, b) => a + b, 0)),
    Kphi,
    detKphi: phiInverse.det,
    Kmu,
    detKmu: muInverse.det
  },
  controls: {
    rawUnknown: {
      averageQuadgram: rawUnknown.average,
      ic: rawUnknown.ic,
      runes: unknown.length
    },
    p57Plaintext: {
      averageQuadgram: p57Control.average,
      ic: p57Control.ic,
      runes: p57.length
    },
    rawP55: {
      full: rawP55.full.average,
      dropFirstNG: rawP55.dropFirstNG.average,
      removeLiteralF: rawP55.removeLiteralF.average
    }
  },
  fullBookBest: fullCandidates[0],
  fullBookWorst: fullCandidates[fullCandidates.length - 1],
  additiveBest: additiveCandidates[0],
  additiveWorst: additiveCandidates[additiveCandidates.length - 1],
  p55Best: p55Candidates[0],
  p55Worst: p55Candidates[p55Candidates.length - 1]
}, null, 2));
