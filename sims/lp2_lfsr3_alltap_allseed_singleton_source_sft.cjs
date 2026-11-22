'use strict';

/**
 * Exhaustive original-LP2 GP29 additive LFSR(3) inverse, including all unknown
 * three-rune seeds and all 29^3 tap choices. A/I/O singleton necessary gate.
 * Read-only, no dependencies; Node.js 22/CommonJS on Windows 11.
 *
 * Model: K[i]=a*K[i-1]+b*K[i-2]+c*K[i-3] mod29 (i>=3);
 * C[i]=P[i]+K[i] mod29, with an uninterrupted 12,956-rune clock.
 *
 * Printed word boundaries are retained. This model does not include
 * transparent-F bypass, key slips, resets or other encryption stages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const AIO = [24, 10, 3];
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;

/** @returns {{cipher:number[], singles:Array<{offset:number,cipher:number}>, words:number}} */
function parseOriginal() {
  const cipher = [];
  const singles = [];
  let word = [];
  let words = 0;
  const finish = () => {
    if (!word.length) return;
    words++;
    if (word.length === 1) singles.push(word[0]);
    word = [];
  };
  for (const ch of source.split('%').slice(0, 55).join('%')) {
    if (runeMap.has(ch)) {
      const entry = {offset:cipher.length, cipher:runeMap.get(ch)};
      cipher.push(entry.cipher);
      word.push(entry);
    } else if (ch === '/' || ch === '%' || /\s/u.test(ch)) {
      // Physical line/page wraps can continue a printed word.
    } else {
      finish();
    }
  }
  finish();
  const independent = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.deepEqual(cipher, independent);
  assert.deepEqual([cipher.length, words, singles.length],
    [12956, 2896, 83]);
  assert.deepEqual(singles.slice(0, 5), [
    {offset:176, cipher:28},
    {offset:244, cipher:15},
    {offset:350, cipher:9},
    {offset:530, cipher:1},
    {offset:644, cipher:0}
  ]);
  return {cipher, singles, words};
}

const inv = new Uint8Array(29);
for (let a = 1; a < 29; a++)
  for (let b = 1; b < 29; b++)
    if (a * b % 29 === 1) inv[a] = b;

/** @param {number[][]} rows */
function rank(rows) {
  if (!rows.length) return 0;
  const d = rows[0].length;
  const mat = rows.map(x => x.slice());
  let r = 0;
  for (let col = 0; col < d && r < mat.length; col++) {
    let pivot = r;
    while (pivot < mat.length && mat[pivot][col] === 0) pivot++;
    if (pivot === mat.length) continue;
    [mat[pivot], mat[r]] = [mat[r], mat[pivot]];
    const scale = inv[mat[r][col]];
    for (let k = col; k < d; k++) mat[r][k] = mod(mat[r][k] * scale);
    for (let i = r + 1; i < mat.length; i++) {
      const factor = mat[i][col];
      for (let k = col; k < d; k++)
        mat[i][k] = mod(mat[i][k] - factor * mat[r][k]);
    }
    r++;
  }
  return r;
}

/** @param {number[][]} matrix */
function inverse(matrix) {
  const d = matrix.length;
  const a = matrix.map((row, i) =>
    row.concat(Array.from({length:d}, (_, j) => +(i === j))));
  for (let col = 0; col < d; col++) {
    let pivot = col;
    while (pivot < d && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < d, 'independent anchors yield invertible square matrix');
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const factor = inv[a[col][col]];
    for (let k = col; k < 2*d; k++) a[col][k] = mod(a[col][k] * factor);
    for (let i = 0; i < d; i++) {
      if (i === col) continue;
      const scalar = a[i][col];
      for (let k = col; k < 2*d; k++)
        a[i][k] = mod(a[i][k] - scalar * a[col][k]);
    }
  }
  return a.map(row => row.slice(d));
}

/**
 * Each keystream symbol is an affine row in three completely unknown
 * initial key values. Build only the 13 source positions needed for exclusion.
 * @param {number[]} taps
 * @param {Array<{offset:number,cipher:number}>} sites
 * @returns {number[][]}
 */
function coefficients(taps, sites) {
  const [a, b, c] = taps;
  let oldest = [1,0,0], middle = [0,1,0], newest = [0,0,1];
  const result = [];
  let site = 0;
  for (let i = 0; i <= sites[sites.length-1].offset; i++) {
    let row;
    if (i === 0) row = oldest;
    else if (i === 1) row = middle;
    else if (i === 2) row = newest;
    else {
      const next = [
        (a*newest[0]+b*middle[0]+c*oldest[0])%29,
        (a*newest[1]+b*middle[1]+c*oldest[1])%29,
        (a*newest[2]+b*middle[2]+c*oldest[2])%29
      ];
      oldest = middle;
      middle = newest;
      newest = next;
      row = newest;
    }
    if (i === sites[site].offset) {
      result.push(row);
      site++;
      if (site === sites.length) break;
    }
  }
  assert.equal(result.length, sites.length);
  return result;
}

/**
 * Enumerate all secret states, using A/I/O equations on maximally independent
 * printed singleton rows and all unconstrained nullspace dimensions.
 * Covers rank-deficient recurrence families without dropping any key.
 * @param {number[][]} rows
 * @param {Array<{offset:number,cipher:number}>} sites
 */
function recover(rows, sites) {
  const anchors = [];
  for (let i = 0; i < rows.length; i++)
    if (rank(anchors.map(j => rows[j]).concat([rows[i]])) > anchors.length)
      anchors.push(i);
  const r = anchors.length;
  const pivot = [];
  for (let col = 0; col < 3 && pivot.length < r; col++) {
    const candidate = pivot.concat([col]);
    if (rank(anchors.map(i => candidate.map(k => rows[i][k])))
      === candidate.length) pivot.push(col);
  }
  assert.equal(pivot.length, r);
  const free = [0,1,2].filter(k => !pivot.includes(k));
  const matrixInv = inverse(anchors.map(i => pivot.map(k => rows[i][k])));
  const count = 3**r * 29**(3-r);
  const histogram = Array(sites.length + 1).fill(0);
  const full = [];
  let best = null;
  for (let ordinal = 0; ordinal < count; ordinal++) {
    let temp = ordinal;
    const possiblePlain = [];
    for (let j = 0; j < r; j++) {
      possiblePlain.push(AIO[temp % 3]);
      temp = Math.floor(temp / 3);
    }
    const seed = [0,0,0];
    for (const j of free) {
      seed[j] = temp % 29;
      temp = Math.floor(temp / 29);
    }
    const rhs = anchors.map((i, j) =>
      mod(sites[i].cipher - possiblePlain[j]
        - free.reduce((s,k) => s+rows[i][k]*seed[k], 0)));
    for (let j = 0; j < r; j++)
      seed[pivot[j]] = mod(matrixInv[j].reduce(
        (sum, v, k) => sum+v*rhs[k], 0));
    let prefix = 0;
    for (let j = 0; j < sites.length; j++) {
      const p = mod(sites[j].cipher
        - rows[j].reduce((sum, v, k) => sum+v*seed[k], 0));
      if (!AIO.includes(p)) break;
      prefix++;
    }
    histogram[prefix]++;
    if (!best || prefix > best.prefix) best = {prefix, seed};
    if (prefix === sites.length) full.push(seed);
  }
  assert.equal(histogram.reduce((a,b) => a+b, 0), count);
  return {r, count, histogram, best, full};
}

/** @param {number[]} taps @param {number[]} seed @param {number} n */
function stream(taps, seed, n) {
  const result = seed.slice();
  for (let i = 3; i < n; i++)
    result.push(mod(taps[0]*result[i-1] + taps[1]*result[i-2]
      + taps[2]*result[i-3]));
  return result.slice(0, n);
}

/** @param {number[]} a @param {number[]} b */
function sumMod(a,b) {
  assert.equal(a.length,b.length);
  return a.map((x,i) => mod(x+b[i]));
}

/** @param {number[]} a @param {number[]} b */
function diffMod(a,b) {
  assert.equal(a.length,b.length);
  return a.map((x,i) => mod(x-b[i]));
}

const {cipher, singles} = parseOriginal();
const first = singles.slice(0, 13);
assert.deepEqual(first.map(s=>s.offset),
  [176,244,350,530,644,792,967,1025,1062,1250,1316,1545,1814]);

const ranks = [0,0,0,0];
const evaluated = [0,0,0,0];
const histogram = Array(14).fill(0);
let best = {prefix:-1};
let survivors = 0;
for (let a = 0; a < 29; a++)
  for (let b = 0; b < 29; b++)
    for (let c = 0; c < 29; c++) {
      const taps = [a,b,c];
      const solved = recover(coefficients(taps, first), first);
      ranks[solved.r]++;
      evaluated[solved.r] += solved.count;
      for (let k = 0; k < histogram.length; k++)
        histogram[k] += solved.histogram[k];
      if (solved.best.prefix > best.prefix)
        best = {taps, ...solved.best};
      survivors += solved.full.length;
    }
assert.deepEqual(ranks, [1,28,812,23548]);
assert.deepEqual(evaluated, [24389,70644,211932,635796]);
assert.equal(evaluated.reduce((a,b) => a+b,0), 942761);
assert.deepEqual(histogram,
  [24389,73902,214224,565630,58106,5662,721,120,7,0,0,0,0,0]);
assert.deepEqual(best, {taps:[4,4,1],prefix:8,seed:[25,13,0]});
assert.equal(survivors, 0);

// Two complete original-shape hidden-state plants prove genuine recovery;
// one has rank 3, and one has a rank-deficient recurrence.
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length,95);
const plain = Array.from({length:cipher.length}, (_,i) => native[i%95]);
singles.forEach((s,i) => {plain[s.offset] = AIO[i%3];});
for (const test of [
  {taps:[4,4,1],seed:[25,13,0]},
  {taps:[0,1,0],seed:[7,11,19]}
]) {
  const K = stream(test.taps, test.seed, plain.length);
  const planted = sumMod(plain,K);
  const sample = first.map(s => ({offset:s.offset,cipher:planted[s.offset]}));
  const solved = recover(coefficients(test.taps,sample),sample);
  assert.ok(solved.full.some(seed => seed.every((x,i) => x===test.seed[i])),
    'all-secret source-shaped planted seed must survive');
  const recovered = diffMod(planted,K);
  assert.deepEqual(recovered,plain);
  assert.deepEqual(sumMod(recovered,K),planted);
  assert.ok(singles.every(s => AIO.includes(recovered[s.offset])));
  console.log('Original-shaped positive',JSON.stringify({
    taps:test.taps, seed:test.seed, rank:solved.r,
    foundKeys:solved.full.length,
    plaintextRecovered:recovered.length, reencrypted:planted.length
  }));
}
console.log('Original exhaustive original-cipher singleton gate',JSON.stringify({
  runeCount:cipher.length, printedWords:2896, singletonTotal:singles.length,
  checkedOriginalSingletons:first.length,
  lastCheckedOriginalRuneOffset:first[first.length-1].offset,
  tapsTested:29**3, rankDistribution:ranks,
  exhaustiveSecretSeedAssignments:evaluated,
  aggregateSeedCandidates:evaluated.reduce((a,b)=>a+b,0),
  leadingMatchHistogram:histogram, longestMatchingPrefix:best,
  fullyCompatibleModels:survivors,
  conclusion:'No unknown LP2 plaintext; excludes only continuous additive GF29 LFSR order <=3 under preserved A/I/O singleton words'
},null,2));
