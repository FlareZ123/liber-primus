'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;

/** @param {number} x */
function inv(x) {
  for (let y = 1; y < Q; y += 1) {
    if (mod(x * y) === 1) return y;
  }
  throw new Error('noninvertible');
}

/** @param {number[][]} input */
function nullspace29(input) {
  const rows = input.map((row) => row.map(mod));
  const m = rows.length;
  const n = rows[0].length;
  const pivots = [];
  let r = 0;

  for (let c = 0; c < n && r < m; c += 1) {
    let pivot = r;
    while (pivot < m && rows[pivot][c] === 0) pivot += 1;
    if (pivot === m) continue;
    [rows[pivot], rows[r]] = [rows[r], rows[pivot]];
    const scale = inv(rows[r][c]);
    rows[r] = rows[r].map((x) => mod(x * scale));

    for (let i = 0; i < m; i += 1) {
      if (i === r || rows[i][c] === 0) continue;
      const factor = rows[i][c];
      rows[i] = rows[i].map((x, j) => mod(x - factor * rows[r][j]));
    }
    pivots.push(c);
    r += 1;
  }

  const free = [];
  for (let c = 0; c < n; c += 1) {
    if (!pivots.includes(c)) free.push(c);
  }

  return free.map((f) => {
    const x = Array(n).fill(0);
    x[f] = 1;
    for (let i = 0; i < pivots.length; i += 1) {
      x[pivots[i]] = mod(-rows[i][f]);
    }
    return x;
  });
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((z, n) => z + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const transcription = fs
  .readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .replace(/\r/g, '');
const nativeSource = JSON.parse(
  fs.readFileSync(
    path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'),
    'utf8'
  )
);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

/** @param {number} page */
function pageFragments(page) {
  const source = corpus.pages.find((x) => x.page === page).indices;
  const segment = parts[page >= 51 ? page - 1 : page];
  const fragments = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    fragments.push({ start, end: offset, values: current.slice() });
    current = [];
  };

  for (const ch of segment) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      assert.equal(source[offset], value, `transcription mismatch p${page}@${offset}`);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, `transcription length p${page}`);
  return fragments;
}

const p8Fragments = pageFragments(8);
assert.deepEqual(p8Fragments.slice(0, 2).map((x) => x.values.length), [4, 8]);
const blackFragments = p8Fragments.slice(2);
assert.equal(blackFragments.length, 49);

const lengths = blackFragments.map((x) => x.values.length);
const matrix = Array.from({ length: 7 }, (_, r) => lengths.slice(7 * r, 7 * r + 7));
assert.deepEqual(matrix, [
  [3,2,3,9,4,3,4],
  [2,2,6,3,7,3,4],
  [3,8,4,3,4,5,5],
  [2,3,4,4,7,5,10],
  [6,12,4,5,3,2,6],
  [10,4,9,6,5,6,8],
  [8,3,2,9,6,6,1],
]);

// Artwork contract: the literal rooted-tree cue selects a characteristic root.
// The already-established factorization has exactly one root in native GF29:
// x + g with g=5, hence lambda=-g=24.
const lambda = 24;
const shifted = matrix.map((row, i) =>
  row.map((x, j) => mod(x - (i === j ? lambda : 0)))
);
const rightBasis = nullspace29(shifted);
const transposedShifted = shifted[0].map((_, c) => shifted.map((row) => row[c]));
const leftBasis = nullspace29(transposedShifted);
assert.equal(rightBasis.length, 1);
assert.equal(leftBasis.length, 1);
assert.deepEqual(rightBasis[0], [18,9,9,8,28,0,1]);
assert.deepEqual(leftBasis[0], [18,6,18,12,27,6,1]);

/** @param {number[]} vector @param {number} coordinate */
function anchor14(vector, coordinate) {
  const scale = mod(14 * inv(vector[coordinate]));
  return vector.map((x) => mod(scale * x));
}

const bases = {
  R_top: anchor14(rightBasis[0], 0),
  L_top: anchor14(leftBasis[0], 0),
  R_bottom: anchor14(rightBasis[0], 6),
  L_bottom: anchor14(leftBasis[0], 6),
};
assert.deepEqual(bases, {
  R_top: [14,7,7,3,25,0,4],
  L_top: [14,24,14,19,21,24,4],
  R_bottom: [20,10,10,25,15,0,14],
  L_bottom: [20,26,20,23,1,26,14],
});

// Complete 479-window matched census. The raw root-24 condition is not unique,
// but the unlabeled repeated-coordinate/zero shape of the source-normalized
// right eigenvector is unique to p8 start fragment2 / rune offset12.
let windows49 = 0;
let root24Windows = 0;
let oneDimensionalRoot24 = 0;
const shapeHits = [];
const exactHits = [];

for (const pageObj of corpus.pages.filter((x) => x.page <= 55 && x.page !== 50)) {
  const fragments = pageFragments(pageObj.page);
  const lens = fragments.map((x) => x.values.length);
  for (let start = 0; start + 49 <= lens.length; start += 1) {
    windows49 += 1;
    const candidate = Array.from({ length: 7 }, (_, r) =>
      lens.slice(start + 7 * r, start + 7 * r + 7).map(mod)
    );
    const candidateShifted = candidate.map((row, i) =>
      row.map((x, j) => mod(x - (i === j ? lambda : 0)))
    );
    const basis = nullspace29(candidateShifted);
    if (!basis.length) continue;
    root24Windows += 1;
    if (basis.length !== 1 || basis[0][0] === 0) continue;
    oneDimensionalRoot24 += 1;
    const normalized = anchor14(basis[0], 0);

    if (normalized[1] === normalized[2] && normalized[5] === 0) {
      shapeHits.push([pageObj.page, start, fragments[start].start, normalized]);
    }
    if (normalized.every((x, i) => x === bases.R_top[i])) {
      exactHits.push([pageObj.page, start, fragments[start].start]);
    }
  }
}
assert.equal(windows49, 479);
assert.equal(root24Windows, 24);
assert.equal(oneDimensionalRoot24, 24);
assert.deepEqual(shapeHits, [[8,2,12,[14,7,7,3,25,0,4]]]);
assert.deepEqual(exactHits, [[8,2,12]]);

// Pretarget receiver frozen in workplace/lp2-p8-tree-root-eigenvector-pretarget.md:
// p8 black body, phase-zero seven-rune repetition, 8 fixed keys (four anchors
// plus exact reversal), both +/- directions, no rotations or F exceptions.
const nativeSections = nativeSource.sections.map((section) =>
  [...section.source_text].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch))
);
const unigram = Array(Q).fill(0.5);
const bigram = Array.from({ length: Q }, () => Array(Q).fill(0));
for (const section of nativeSections) {
  for (let i = 0; i < section.length; i += 1) {
    unigram[section[i]] += 1;
    if (i) bigram[section[i - 1]][section[i]] += 1;
  }
}
const total = (array) => array.reduce((x, y) => x + y, 0);
const probabilities = unigram.map((x) => x / total(unigram));
const logUni = probabilities.map((x) => Math.log(Q * x));
const logBi = bigram.map((row) =>
  row.map((x, j) => Math.log(Q * (x + 12 * probabilities[j]) / (total(row) + 12)))
);
const score = (values) => values.reduce(
  (z, x, i) => z + (i ? logBi[values[i - 1]][x] : logUni[x]),
  0
) / values.length;
const nativeScores = nativeSections.map(score);
const nativeMin = Math.min(...nativeScores);

const keys = {};
for (const [name, key] of Object.entries(bases)) {
  keys[name] = key;
  keys[name + '_rev'] = key.slice().reverse();
}
assert.equal(Object.keys(keys).length, 8);

const p8Black = corpus.pages.find((x) => x.page === 8).indices.slice(12);
assert.equal(p8Black.length, 243);
const receiverResults = [];

for (const [name, key] of Object.entries(keys)) {
  for (const sign of [-1, 1]) {
    const decoded = p8Black.map((x, i) => mod(x + sign * key[i % key.length]));
    const replay = decoded.map((x, i) => mod(x - sign * key[i % key.length]));
    assert.deepEqual(replay, p8Black);
    receiverResults.push({
      name,
      sign,
      score: score(decoded),
      ioc: ioc(decoded),
    });
  }
}
assert.equal(receiverResults.length, 16);
assert.ok(receiverResults.every((x) => x.score < nativeMin));

const primary = receiverResults.filter((x) => x.name === 'R_top');
assert.equal(primary.length, 2);
assert.ok(primary.every((x) => x.score < nativeMin));

receiverResults.sort((a, b) => b.score - a.score);

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'unique p8 root-eigenvector state closure; frozen local periodic receiver rejected',
  root: {
    lambda,
    rightGenerator: rightBasis[0],
    leftGenerator: leftBasis[0],
    anchoredKeys: bases,
  },
  census: {
    windows49,
    root24Windows,
    oneDimensionalRoot24,
    shapeHits,
    exactHits,
  },
  receiver: {
    nativeScores,
    nativeMin,
    primary,
    bestCharged: receiverResults[0],
    all: receiverResults,
  },
}, null, 2));
