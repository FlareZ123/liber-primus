'use strict';

/**
 * Exact LP2 16-state recurrence / unknown-secret-seed test.
 *
 * The physical p15 spiral and the p50 degree-16 polynomial factor are source
 * derived. Their use as a book-global additive keystream is a conditional
 * research hypothesis, never an attributed Cicada instruction.
 *
 * A/I singleton words provide an exhaustive finite GF29 key-recovery gate.
 * Runs on Windows Node.js 22 using checked-in original corpus only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const N = 12956;
const D = 16;
const mod = (x) => (x % 29 + 29) % 29;
const originalAnchorOffsets = [
  176, 244, 350, 530, 644, 792, 967, 1025, 1062, 1250,
  1316, 1545, 1814, 2148, 2375, 2428
];

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/** @returns {number[]} Monic degree-16 GF29 polynomial, descending. */
function factor16() {
  const factors = [
    [25, 10, 1], [11, 18, 1], [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
  ];
  const f = factors.reduce(multiply, [1]).reverse();
  assert.deepEqual(f, [1, 25, 17, 11, 15, 7, 11, 26, 6,
    26, 13, 2, 6, 12, 26, 20, 13]);
  return f;
}

/**
 * Recover all original printed singleton words across p0–55.
 * Percent/newline/slash are transparent; the runeless p50 is absent;
 * dash/dot/section-end are actual word ends; carried words remain intact.
 * @param {string} transcription
 * @param {string[]} runes
 * @returns {{offset:number,c:number}[]}
 */
function singlesFromOriginal(transcription, runes) {
  const runeMap = new Map(runes.map((r, i) => [r, i]));
  let record = 0;
  let offset = 0;
  let first = 0;
  let word = [];
  let words = 0;
  const singles = [];
  function flush() {
    if (!word.length) return;
    words++;
    if (word.length === 1) singles.push({ offset: first, c: word[0] });
    word = [];
  }
  for (const rune of transcription) {
    if (rune === '%') { record++; continue; }
    if (record >= 55) break;
    const v = runeMap.get(rune);
    if (v !== undefined) {
      if (!word.length) first = offset;
      word.push(v);
      offset++;
    } else if ('-.$&§1234567'.includes(rune)) flush();
  }
  flush();
  assert.equal(offset, N);
  assert.equal(words, 2896);
  assert.equal(singles.length, 83);
  assert.deepEqual(singles.slice(0, D).map((w) => w.offset), originalAnchorOffsets);
  return singles;
}

/**
 * Each t-th row expresses key[t] as a GF29 dot product of initial seed[0..15].
 * K_t=-(f1*K_(t-1)+...+f16*K_(t-16)) mod29 for t>=16.
 * @param {number[]} f
 * @returns {number[][]}
 */
function seedFunctionals(f) {
  const rows = [];
  for (let t = 0; t < N; t++) {
    const row = Array(D).fill(0);
    if (t < D) row[t] = 1;
    else for (let lag = 1; lag <= D; lag++) {
      const a = mod(-f[lag]);
      for (let k = 0; k < D; k++) row[k] = mod(row[k] + a * rows[t - lag][k]);
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Exact Gauss–Jordan GF29 inverse. Throws if original 16 constraints
 * cannot identify all 16 seed coordinates.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function invert16(matrix) {
  assert.equal(matrix.length, D);
  const a = matrix.map((row, i) => [
    ...row, ...Array.from({ length: D }, (_, j) => (i === j ? 1 : 0))
  ]);
  for (let pivot = 0; pivot < D; pivot++) {
    let q = pivot;
    while (q < D && a[q][pivot] === 0) q++;
    assert.ok(q < D, 'First 16 original singleton rows are dependent');
    [a[pivot], a[q]] = [a[q], a[pivot]];
    const inverse = Array.from({ length: 28 }, (_, j) => j + 1)
      .find((x) => mod(x * a[pivot][pivot]) === 1);
    assert.ok(inverse !== undefined);
    for (let j = 0; j < 2 * D; j++) a[pivot][j] = mod(a[pivot][j] * inverse);
    for (let i = 0; i < D; i++) {
      if (i === pivot) continue;
      const k = a[i][pivot];
      for (let j = 0; j < 2 * D; j++) a[i][j] = mod(a[i][j] - k * a[pivot][j]);
    }
  }
  return a.map((row) => row.slice(D));
}

/** @param {number[]} row @param {number[]} seed @returns {number} */
function dot(row, seed) {
  let total = 0;
  for (let i = 0; i < D; i++) total += row[i] * seed[i];
  return total % 29;
}

/**
 * Every one of the 2^16 assignments corresponds to exactly one initial state
 * consistent with 16 independent source-word constraints. The remaining 67
 * are never fitted.
 * @param {number[][]} options Two allowed keys per source singleton.
 * @param {number[][]} weights 67 held-out linear projections.
 * @returns {{valid:number,maxMatched:number,maxMask:number}}
 */
function enumerate(options, weights) {
  let valid = 0;
  let maxMatched = 0;
  let maxMask = -1;
  for (let mask = 0; mask < (1 << D); mask++) {
    const k = Array.from({ length: D }, (_, i) => options[i][(mask >>> i) & 1]);
    let matches = D;
    for (let j = 0; j < weights.length; j++) {
      const p = dot(weights[j], k);
      if (p === options[j + D][0] || p === options[j + D][1]) matches++;
    }
    if (matches > maxMatched) { maxMatched = matches; maxMask = mask; }
    if (matches === options.length) valid++;
  }
  return { valid, maxMatched, maxMask };
}

/**
 * @param {{offset:number,c:number}[]} singles
 * @param {number[]} f
 * @param {number[]} originalP57
 * @returns {object}
 */
function run(singles, f, originalP57) {
  assert.equal(singles.length, 83);
  assert.equal(originalP57.length, 95);
  const rows = seedFunctionals(f);
  const selectedRows = singles.map((s) => rows[s.offset]);
  const inverse = invert16(selectedRows.slice(0, D));
  const weights = selectedRows.slice(D).map((r) =>
    Array.from({ length: D }, (_, j) =>
      mod(r.reduce((sum, x, i) => sum + x * inverse[i][j], 0))));

  // Native GP alphabetical indexes: A = 24; I = 10.
  // Additive C=P+K; the opposite sign is equivalent under a free seed.
  const options = singles.map((s) => [mod(s.c - 24), mod(s.c - 10)]);
  const observed = enumerate(options, weights);
  assert.equal(observed.valid, 0);
  assert.equal(observed.maxMatched, 31);
  assert.equal(observed.maxMask, 7994);

  // Positive control: 12956 symbols of genuine solved-p57 GP text, repeated
  // and adjusted at the 83 complete printed one-rune word offsets to A/I.
  // The unknown 16-seed is planted from the original p15 4x4 row-major array.
  const trueSeed = [
    3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
    3288, 3294, 3296, 2472, 4516, 1206, 708, 1820
  ].map(mod);
  const originalP = Array.from({ length: N }, (_, i) => originalP57[i % 95]);
  singles.forEach((s, i) => { originalP[s.offset] = (i & 1) ? 10 : 24; });
  const syntheticC = originalP.map((p, i) => mod(p + dot(rows[i], trueSeed)));
  const syntheticOptions = singles.map((s) => [
    mod(syntheticC[s.offset] - 24), mod(syntheticC[s.offset] - 10)
  ]);
  const planted = enumerate(syntheticOptions, weights);
  assert.equal(planted.valid, 1);
  assert.equal(planted.maxMatched, 83);
  const correctAnchor = syntheticOptions.slice(0, D).map((pair, i) => pair[i & 1]);
  const recoveredSeed = inverse.map((r) => dot(r, correctAnchor));
  assert.deepEqual(recoveredSeed, trueSeed);
  const decrypted = syntheticC.map((c, i) => mod(c - dot(rows[i], recoveredSeed)));
  assert.deepEqual(decrypted, originalP);
  assert.deepEqual(decrypted.map((p, i) => mod(p + dot(rows[i], recoveredSeed))), syntheticC);
  const wrongSeed = recoveredSeed.slice();
  wrongSeed[0] = mod(wrongSeed[0] + 1);
  const wrongMatchCount = syntheticC.reduce((n, c, i) =>
    n + (mod(c - dot(rows[i], wrongSeed)) === originalP[i] ? 1 : 0), 0);
  assert.equal(wrongMatchCount, 416);

  return {
    originalRunaCount: N,
    originalWordCount: 2896,
    originalSingletonCount: singles.length,
    sourceF16: f,
    singletonRank: D,
    allSeedAnchorAssignments: 65536,
    heldOutSingletonConstraints: 67,
    observed,
    planted,
    plantedFullRuneRecovery: decrypted.length,
    plantedFullRuneForwardReconstruction: syntheticC.length,
    wrongSeedMatches: wrongMatchCount,
    recoveredUnknownPlaintext: false,
    conclusion: 'No global additive p50-F16 recurrence with any 16 GF29 initial symbols can produce English A/I at all 83 original singleton sites'
  };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const text = fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
  const grid = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  const f = factor16();
  const remainder = bytes.map(mod);
  for (let i = 0; i < 240; i++) {
    const q = remainder[i];
    for (let j = 0; j < f.length; j++) remainder[i + j] = mod(remainder[i + j] - q * f[j]);
  }
  assert.ok(remainder.every((x) => x === 0));

  const singles = singlesFromOriginal(text, corpus.runes);
  const p57 = corpus.pages.find((p) => p.page === 57).indices;
  const result = run(singles, f, p57);
  console.log(JSON.stringify({ status: 'PASS: exhaustive all-secret seed gate', ...result }, null, 2));
}

if (require.main === module) main();
module.exports = { factor16, singlesFromOriginal, run };
