#!/usr/bin/env node
'use strict';

// Fixed, source-motivated Hill-7 gate:
// 2014 Stage10 7x7 / 1033 square -> p33 first 91 GP29 runes (13 blocks of 7).
// Tests raw and Euler-phi square residues mod 29, K/K^-1, row/column convention.
// No padding, phase, key search, or chained cipher stages.

const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p33Page = corpus.pages.find(p => p.page === 33);
const p57Page = corpus.pages.find(p => p.page === 57);
if (!p33Page || !p57Page) throw new Error('Required source pages absent');

const input = p33Page.indices.slice(0, 91);
if (input.length !== 91) throw new Error('p33 source interval is not 91 runes');
const inputHash = sha256(Buffer.from(input));
const expectedInputHash = 'b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a';
if (inputHash !== expectedInputHash) throw new Error('p33 [0,91) source hash changed');

const squareRows = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim()
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => line.split(/\s+/).map(Number));
let square7 = null;
for (let i = 0; i + 7 <= squareRows.length; i++) {
  const block = squareRows.slice(i, i + 7);
  if (block.every(row => row.length === 7)) {
    square7 = block;
    break;
  }
}
if (!square7) throw new Error('Could not locate source 7x7 square');
const rowSums = square7.map(row => row.reduce((a, b) => a + b, 0));
const colSums = Array.from({ length: 7 }, (_, j) =>
  square7.reduce((sum, row) => sum + row[j], 0));
if (![...rowSums, ...colSums].every(x => x === 1033)) {
  throw new Error('Selected 7x7 block is not the 1033 square');
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
function inverseScalar(a) {
  let t = 0, nextT = 1, r = MOD, nextR = mod(a);
  while (nextR) {
    const q = Math.floor(r / nextR);
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  if (r !== 1) throw new Error('Non-invertible scalar');
  return mod(t);
}
function matrixInverse(matrix) {
  const n = matrix.length;
  const work = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0))
  );
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && work[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error('Singular matrix mod 29');
    [work[col], work[pivot]] = [work[pivot], work[col]];
    const scale = inverseScalar(work[col][col]);
    work[col] = work[col].map(x => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = work[row][col];
      if (factor) {
        work[row] = work[row].map((x, j) => mod(x - factor * work[col][j]));
      }
    }
  }
  return work.map(row => row.slice(n));
}
function determinantMod(matrix) {
  const n = matrix.length;
  const work = matrix.map(row => row.map(mod));
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && work[pivot][col] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== col) {
      [work[col], work[pivot]] = [work[pivot], work[col]];
      det = mod(-det);
    }
    const pivotValue = work[col][col];
    det = mod(det * pivotValue);
    const scale = inverseScalar(pivotValue);
    for (let row = col + 1; row < n; row++) {
      const factor = mod(work[row][col] * scale);
      for (let j = col; j < n; j++) {
        work[row][j] = mod(work[row][j] - factor * work[col][j]);
      }
    }
  }
  return det;
}
function phi(n) {
  let value = n, remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      value -= value / p;
    }
  }
  if (remaining > 1) value -= value / remaining;
  return Math.round(value);
}
function applyBlocks(indices, matrix, convention) {
  if (indices.length % 7 !== 0) throw new Error('Input is not block-aligned');
  const out = [];
  for (let offset = 0; offset < indices.length; offset += 7) {
    const v = indices.slice(offset, offset + 7);
    if (convention === 'column') {
      for (let i = 0; i < 7; i++) {
        let sum = 0;
        for (let j = 0; j < 7; j++) sum += matrix[i][j] * v[j];
        out.push(mod(sum));
      }
    } else {
      const y = Array(7).fill(0);
      for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 7; i++) y[j] += v[i] * matrix[i][j];
      }
      out.push(...y.map(mod));
    }
  }
  return out;
}

const quadText = read('resources/control/duko_round27_english_quadgrams.txt');
const grams = new Map();
let gramTotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const [token, rawCount] = line.trim().split(/\s+/);
  if (!token || !rawCount) continue;
  const count = Number(rawCount);
  grams.set(token, count);
  gramTotal += count;
}
const spell = indices => indices.map(i => corpus.translit[i]).join('');
function score(indices) {
  const letters = spell(indices);
  let sum = 0;
  for (let i = 0; i + 3 < letters.length; i++) {
    sum += Math.log10((grams.get(letters.slice(i, i + 4)) || 0.01) / gramTotal);
  }
  return sum / (letters.length - 3);
}

const rawKey = square7.map(row => row.map(mod));
const phiKey = square7.map(row => row.map(n => mod(phi(n))));
const sourceVariants = [];
for (const [keyName, key] of [['raw', rawKey], ['totient', phiKey]]) {
  const keyInverse = matrixInverse(key);
  for (const [operator, matrix] of [['K', key], ['K^-1', keyInverse]]) {
    for (const convention of ['column', 'row']) {
      const output = applyBlocks(input, matrix, convention);
      sourceVariants.push({
        key: keyName,
        operator,
        convention,
        score: score(output),
        text: spell(output),
      });
    }
  }
}
sourceVariants.sort((a, b) => b.score - a.score);

const rawScore = score(input);
const p57Score = score(p57Page.indices);
if (Math.abs(rawScore - (-7.514260449025225)) > 1e-10) {
  throw new Error('Pinned raw p33 score changed');
}
if (Math.abs(p57Score - (-4.420633417052125)) > 1e-10) {
  throw new Error('Pinned p57 positive-control score changed');
}

// Seeded negative control: 500 random invertible 7x7 matrices, each tested
// as K and K^-1 under both row/column conventions (2,000 scores).
let seed = 0x3301;
function randomUnit() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const randomScores = [];
let accepted = 0, attempts = 0;
while (accepted < 500 && attempts < 10000) {
  attempts++;
  const candidate = Array.from({ length: 7 }, () =>
    Array.from({ length: 7 }, () => Math.floor(randomUnit() * MOD))
  );
  let candidateInverse;
  try {
    candidateInverse = matrixInverse(candidate);
  } catch {
    continue;
  }
  accepted++;
  for (const matrix of [candidate, candidateInverse]) {
    for (const convention of ['column', 'row']) {
      randomScores.push(score(applyBlocks(input, matrix, convention)));
    }
  }
}
if (accepted !== 500) throw new Error('Random control did not reach 500 matrices');
randomScores.sort((a, b) => a - b);
const quantile = p => randomScores[Math.floor((randomScores.length - 1) * p)];
const best = sourceVariants[0];
const sourcePercentile =
  randomScores.filter(value => value <= best.score).length / randomScores.length;

const output = {
  experiment: '2014 Stage10 7x7/1033 square as direct Hill-7 key on p33 [0,91)',
  source: {
    p33_interval: '[0,91)',
    p33_sha256: inputHash,
    p57_positive_control_length: p57Page.indices.length,
    square_row_sums: rowSums,
    square_column_sums: colSums,
    raw_matrix_det_mod29: determinantMod(rawKey),
    totient_matrix_det_mod29: determinantMod(phiKey),
    quadgram_sha256: sha256(quadText),
    quadgram_total: gramTotal,
    quadgram_entries: grams.size,
  },
  baseline_scores: { p33_raw: rawScore, p57_solved_control: p57Score },
  source_variants: sourceVariants,
  random_control: {
    seed: '0x3301',
    matrices: accepted,
    attempts,
    scores: randomScores.length,
    min: randomScores[0],
    q05: quantile(0.05),
    median: quantile(0.5),
    q95: quantile(0.95),
    q99: quantile(0.99),
    max: randomScores[randomScores.length - 1],
    source_best_percentile: sourcePercentile,
  },
  conclusion:
    'No direct Hill-7 plaintext. Best source-selected variant is not exceptional against random invertible 7x7 matrices; do not add a speculative Stage05/Hill layer.',
};
console.log(JSON.stringify(output, null, 2));
