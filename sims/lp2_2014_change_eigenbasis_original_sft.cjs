'use strict';

/**
 * Source-native Windows/Node 22 SFT: test the CHANGE-spectrum eigenbasis of the
 * authentic 2014 5x5/1033 magic square as an LP2 cipher receiver.
 * No fitted keys, learned plaintext, inferred page boundaries or external deps.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const groups = source.trim().split(/\r?\n\s*\r?\n/).map(group =>
  group.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(groups.map(matrix => [matrix.length, matrix[0].length]), [[5, 5], [7, 7], [5, 5]]);
const prime = 29;
const mod = value => ((value % prime) + prime) % prime;
const inverse = value => {
  for (let n = 1; n < prime; n++) if (mod(n * value) === 1) return n;
  throw new Error('Nonunit modulo 29');
};
const B = groups[2].map(row => row.map(mod));
const eigenvalues = [5, 8, 24, 21, 18]; // CHANGE in source-native GP29

/** Return one canonical eigenvector: first nonzero coordinate normalized to 1. */
function eigenvector(matrix, eigenvalue) {
  const a = matrix.map((row, i) => row.map((v, j) => mod(v - (i === j ? eigenvalue : 0))));
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < 5; col++) {
    let pivot = rank;
    while (pivot < 5 && a[pivot][col] === 0) pivot++;
    if (pivot === 5) continue;
    [a[pivot], a[rank]] = [a[rank], a[pivot]];
    const scale = inverse(a[rank][col]);
    a[rank] = a[rank].map(x => mod(x * scale));
    for (let i = 0; i < 5; i++) {
      if (i === rank) continue;
      const factor = a[i][col];
      a[i] = a[i].map((x, j) => mod(x - factor * a[rank][j]));
    }
    pivots.push(col);
    rank++;
  }
  const free = [0, 1, 2, 3, 4].filter(col => !pivots.includes(col));
  assert.equal(free.length, 1);
  const vector = [0, 0, 0, 0, 0];
  vector[free[0]] = 1;
  for (let i = rank - 1; i >= 0; i--) {
    vector[pivots[i]] = mod(-a[i].reduce((s, v, j) => s + v * vector[j], 0));
  }
  const scale = inverse(vector.find(x => x !== 0));
  return vector.map(x => mod(x * scale));
}

/** Invert a 5x5 matrix with exact modular Gauss-Jordan elimination. */
function matrixInverse(matrix) {
  const a = matrix.map((row, i) => row.concat(Array.from({ length: 5 }, (_, j) => Number(i === j))));
  for (let col = 0; col < 5; col++) {
    let pivot = col;
    while (pivot < 5 && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < 5, 'Eigenbasis must be invertible');
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const scale = inverse(a[col][col]);
    a[col] = a[col].map(x => mod(x * scale));
    for (let i = 0; i < 5; i++) {
      if (i === col) continue;
      const factor = a[i][col];
      a[i] = a[i].map((x, j) => mod(x - factor * a[col][j]));
    }
  }
  return a.map(row => row.slice(5));
}

const multiply = (matrix, vector) =>
  matrix.map(row => mod(row.reduce((sum, value, j) => sum + value * vector[j], 0)));
const V = Array.from({ length: 5 }, () => Array(5));
eigenvalues.forEach((lambda, col) => {
  eigenvector(B, lambda).forEach((value, row) => { V[row][col] = value; });
});
const Vinverse = matrixInverse(V);
assert.deepEqual(V, [[1,1,1,1,1],[0,24,11,18,1],[0,8,0,20,1],[0,24,18,18,1],[28,1,28,1,1]]);
assert.deepEqual(Vinverse, [[15,25,0,4,14],[1,5,17,5,1],[0,4,0,25,0],[8,18,6,18,8],[6,6,6,6,6]]);
for (let col = 0; col < 5; col++) {
  const vector = V.map(row => row[col]);
  assert.deepEqual(multiply(B, vector), vector.map(x => mod(eigenvalues[col] * x)));
}

function apply(matrix, runes) {
  assert.equal(runes.length % 5, 0);
  const output = [];
  for (let i = 0; i < runes.length; i += 5) {
    output.push(...multiply(matrix, runes.slice(i, i + 5)));
  }
  return output;
}
function ioc(data) {
  const counts = Array(29).fill(0);
  data.forEach(n => counts[n]++);
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (data.length * (data.length - 1));
}
const unknown = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const chapter = corpus.pages.filter(page => page.page >= 33 && page.page <= 39).flatMap(page => page.indices);
const secondBookend = unknown.slice(6561);
assert.equal(unknown.length, 12956);
assert.equal(chapter.length, 1680);
assert.equal(secondBookend.length, 6395);
const samples = [
  ['p33-p39 complete numbered chapter', chapter, 0.03436002155478034, 0.03423026744944553, 0.034633001503162314],
  ['global post-6561 bookend', secondBookend, 0.034451571217445597, 0.03443699539467586, 0.03446404381746668]
];
for (const [name, input, expectedRaw, expectedInverse, expectedForward] of samples) {
  const original = ioc(input);
  const decoded = apply(Vinverse, input);
  const otherDirection = apply(V, input);
  assert.deepEqual(apply(V, decoded), input, name + ' inverse re-encryption');
  assert.deepEqual(apply(Vinverse, otherDirection), input, name + ' forward re-encryption');
  for (const [actual, expected] of [[original, expectedRaw], [ioc(decoded), expectedInverse], [ioc(otherDirection), expectedForward]]) {
    assert.ok(Math.abs(actual - expected) < 1e-12, name + ' unchanged-source statistic');
  }
  console.log(name, 'runes', input.length, 'original IoC', original,
    'basis^-1 IoC', ioc(decoded), 'basis IoC', ioc(otherDirection));
  console.log('first 40 basis^-1 runes:',
    decoded.slice(0, 40).map(n => corpus.translit[n]).join('.'));
}
const nativeP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(nativeP57.length, 95);
assert.deepEqual(apply(Vinverse, apply(V, nativeP57)), nativeP57);
console.log('PASS: exact 2014 matrix eigenbasis, two full original receivers, 95-rune solved-P57 plant and all reencryption checks.');
