'use strict';
/**
 * The 2016 tree and original LP2 p32 121-rune square as a finite, source-led
 * cryptanalytic inverse. No fitted key, phase, or word order. Node.js 22 CJS.
 * Source tree JPEG: 49.jpg (LP2 p32); detailed counterpart: 72.jpg (p55).
 * Independent signed 2016 artifact: resources/historical/cicada2016-4gq25.jpg.
 * Documentation: im-results/lp2-tree121-signed2016-source-gate.md
 *
 * Run from repository root: node sims/lp2_tree121_signed2016_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const latin = load('resources/control/latin-vulgate-heldout-gp.json');
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length > 0);
const original = pages.flatMap((p) => p.indices);
const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p32Ink = ink.pages.find((p) => p.page === 32);
const mod = (x, n) => ((x % n) + n) % n;
assert.equal(original.length, 12956);
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.deepEqual(p32Ink.large_punctuation, [[121, 13, 'red']]);
assert.equal(corpus.translit[8], 'H');
assert.equal(corpus.translit[15], 'S');
assert.deepEqual([corpus.prime[8], corpus.prime[15]], [23, 53]);

/** @param {number} x @param {number} e @param {number} p */
function powMod(x, e, p) {
  let out = 1;
  for (let i = 0; i < e; i++) out = mod(out * x, p);
  return out;
}

const widths = [563, 569]; // independently preserved signed 2016 image
const offsets = widths.map((n) => n % p32.length);
assert.deepEqual(offsets, [79, 85]);
assert.deepEqual(offsets.map((n) => [Math.floor(n / 11), n % 11]),
  [[7, 2], [7, 8]]);
const primeMatrix = Array.from({length: 11}, (_, row) => p32.slice(11 * row, 11 * row + 11)
  .map((r) => corpus.prime[r]));
const firstRowSum = primeMatrix[0].reduce((s, x) => s + x, 0);
const firstColumnSum = primeMatrix.reduce((s, row) => s + row[0], 0);
// Exact source-independent 2016 image width/height check. No fitted phase.
assert.deepEqual([firstRowSum, firstColumnSum], widths);

const selected = offsets.map((n) => p32[n]);
assert.deepEqual(selected, [8, 15]);
const slope = powMod(selected[1], p32Ink.large_punctuation[0][1], 29);
const fixed = selected[0];
assert.equal(slope, 27);
const intercept = mod(fixed * (1 - slope), 29);
assert.equal(intercept, 24);
for (let x = 0; x < 29; x++)
  assert.equal(mod(fixed + slope * (x - fixed), 29), mod(24 - 2 * x, 29));
const circularMatches = Array.from({length: 121}, (_, i) => i)
  .filter((i) => p32[i] === selected[0] && p32[(i + 6) % 121] === selected[1]);
assert.deepEqual(circularMatches, [79]);

// This fixed 79-to-85 page-local prediction is an independent test of the
// location rule, not of the operator (which was already explored elsewhere).
const originalPairHits = pages.filter((p) => p.indices.length > 85
  && mod(24 - 2 * p.indices[79], 29) === p.indices[85])
  .map((p) => p.page);
assert.deepEqual(originalPairHits, [8, 33, 40]);

const walk = Array.from({length: 121}, (_, i) => (79 + 6 * i) % 121);
assert.equal(new Set(walk).size, 121);
const key = walk.map((i) => p32[i]);
const native = Array.from({length: original.length},
  (_, i) => latin.runes[i % latin.runes.length]);
assert.equal(latin.runes.length, 2400);

/**
 * Lossless GP29 additive or GP28 preceding-ciphertext exclusion.
 * First rune of every physical page is an unencrypted IV in GP28 mode.
 * @param {number[]} data
 * @param {{type:'gp29'|'ea28', projection:'index'|'prime', sign:-1|1,reset:'book'|'page'}} config
 * @param {boolean} encode
 * @returns {number[]}
 */
function transform(data, config, encode) {
  const result = [];
  let global = 0;
  for (const page of pages) {
    let previous = -1;
    for (let j = 0; j < page.indices.length; j++) {
      const x = data[global];
      const k0 = key[(config.reset === 'book' ? global : j) % 121];
      const k = config.projection === 'prime' ? corpus.prime[k0] : k0;
      const signed = mod(config.sign * k, config.type === 'ea28' ? 28 : 29);
      let y;
      if (config.type === 'gp29') y = mod(x + (encode ? signed : -signed), 29);
      else if (j === 0) y = x;
      else if (encode) y = x === 28 ? previous
        : mod(previous + 1 + mod(x + signed, 28), 29);
      else y = x === previous ? 28
        : mod(mod(x - previous - 1, 29) - signed, 28);
      previous = encode ? y : x;
      result.push(y);
      global++;
    }
  }
  assert.equal(global, data.length);
  return result;
}

/** @param {number[]} seq */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const n of seq) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
/** @param {number[][]} matrix */
function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map((row) => row[j]));
}

/**
 * All field arithmetic is in the 29-element prime field.
 * @param {number[][]} matrix
 * @returns {{inverse:number[][], determinant:number}}
 */
function invertMatrix(matrix) {
  const n = matrix.length;
  const augmented = Array.from({length: n}, (_, i) => [
    ...matrix[i].map((x) => mod(x, 29)),
    ...Array.from({length: n}, (_, j) => +(i === j))
  ]);
  let determinant = 1;
  for (let j = 0; j < n; j++) {
    let pivot = j;
    while (pivot < n && augmented[pivot][j] === 0) pivot++;
    assert.ok(pivot < n, 'A proposed Hill matrix must be invertible');
    if (pivot !== j) {
      [augmented[j], augmented[pivot]] = [augmented[pivot], augmented[j]];
      determinant = mod(-determinant, 29);
    }
    const value = augmented[j][j];
    determinant = mod(determinant * value, 29);
    let inversePivot = 1;
    while (mod(inversePivot * value, 29) !== 1) inversePivot++;
    for (let k = 0; k < 2 * n; k++)
      augmented[j][k] = mod(augmented[j][k] * inversePivot, 29);
    for (let i = 0; i < n; i++) if (i !== j) {
      const factor = augmented[i][j];
      for (let k = 0; k < 2 * n; k++)
        augmented[i][k] = mod(augmented[i][k] - factor * augmented[j][k], 29);
    }
  }
  return {inverse: augmented.map((row) => row.slice(n)), determinant};
}

/**
 * A complete 11-rune block uses the source matrix. A final incomplete
 * block is transported literally: this makes the whole stream reversible.
 * @param {number[]} data
 * @param {number[][]} matrix
 * @param {'book'|'page'} reset
 */
function hill(data, matrix, reset) {
  const groups = reset === 'book' ? [data] : [];
  if (reset === 'page') {
    let offset = 0;
    for (const page of pages) {
      groups.push(data.slice(offset, offset + page.indices.length));
      offset += page.indices.length;
    }
  }
  const out = [];
  for (const group of groups)
    for (let start = 0; start < group.length; start += 11) {
      const block = group.slice(start, start + 11);
      if (block.length < 11) {out.push(...block);continue;}
      for (const row of matrix)
        out.push(mod(row.reduce((sum, x, j) => sum + x * block[j], 0), 29));
    }
  assert.equal(out.length, data.length);
  return out;
}

function run() {
  const candidates = [];
  for (const type of ['gp29', 'ea28'])
    for (const projection of ['index', 'prime'])
      for (const sign of [-1, 1])
        for (const reset of ['book', 'page']) {
          const config = {type, projection, sign, reset};
          const decrypted = transform(original, config, false);
          assert.deepEqual(transform(decrypted, config, true), original);
          const encryptedPlant = transform(native, config, true);
          assert.deepEqual(transform(encryptedPlant, config, false), native);
          candidates.push({...config, ioc: ioc(decrypted),
            first48: decrypted.slice(0, 48).map((n) => corpus.translit[n]).join(' ')});
        }
  assert.equal(candidates.length, 16);
  candidates.sort((a, b) => b.ioc - a.ioc);
  assert.ok(candidates[0].ioc < 0.045);
  const hillCandidates = [];
  const hillDeterminants = {};
  const sourceMatrices = {
    index: Array.from({length: 11}, (_, i) => p32.slice(11 * i, 11 * i + 11)),
    prime: primeMatrix.map((row) => row.map((x) => mod(x, 29))),
  };
  for (const [source, base] of Object.entries(sourceMatrices)) {
    const checked = invertMatrix(base);
    hillDeterminants[source] = checked.determinant;
    for (const orientation of ['row', 'transpose']) {
      const matrix = orientation === 'row' ? base : transpose(base);
      const inverse = invertMatrix(matrix).inverse;
      for (const direction of ['inverse', 'forward'])
        for (const clock of ['book', 'page']) {
          const decryption = direction === 'inverse' ? inverse : matrix;
          const encryption = direction === 'inverse' ? matrix : inverse;
          const recovered = hill(original, decryption, clock);
          assert.deepEqual(hill(recovered, encryption, clock), original);
          const plant = hill(native, encryption, clock);
          assert.deepEqual(hill(plant, decryption, clock), native);
          hillCandidates.push({source, orientation, direction, clock,
            ioc: ioc(recovered),
            first48: recovered.slice(0, 48).map((n) => corpus.translit[n]).join(' ')});
        }
    }
  }
  assert.deepEqual(hillDeterminants, {index: 8, prime: 21});
  assert.equal(hillCandidates.length, 16);
  hillCandidates.sort((a, b) => b.ioc - a.ioc);
  assert.ok(hillCandidates[0].ioc < 0.045);
  return {
    treePage: 32, image: '49.jpg', detailedTreePage: 55,
    sourceDimensions: widths,
    sourceRuneCount: p32.length, sourceGridShape: [11, 11],
    firstRowPrimeValues: primeMatrix[0],
    firstColumnPrimeValues: primeMatrix.map((row) => row[0]),
    firstRowPrimeSum: firstRowSum, firstColumnPrimeSum: firstColumnSum,
    selectedOffsets: offsets, selectedGPIndices: selected,
    selectedGPPrimeWeights: selected.map((n) => corpus.prime[n]),
    redEndMarkDots: p32Ink.large_punctuation[0][1],
    affine: {slope, intercept, formula: 'x -> 24-2*x modulo29'},
    sourceLag6HSTraceLocations: circularMatches,
    originalPageLocal79to85Hits: originalPairHits,
    originalEligiblePages: pages.filter((p) => p.indices.length > 85).length,
    keyPositions: walk.length, keyFirst16: key.slice(0, 16),
    corpusRunes: original.length, originalIoc: ioc(original),
    nativeLatinIoc: ioc(native), candidates: candidates.length,
    testedModels: candidates,
    originalExactRoundtrips: candidates.length * original.length,
    nativeExactRecoveries: candidates.length * original.length,
    hillDeterminants,
    hillCandidates: hillCandidates.length,
    hillIocRange: [hillCandidates.at(-1).ioc, hillCandidates[0].ioc],
    hillBest: hillCandidates[0],
    hillOriginalExactRoundtrips: hillCandidates.length * original.length,
    hillNativeExactRecoveries: hillCandidates.length * original.length,
    conclusion: 'The first-row/first-column source-prime sums exactly match the signed JPEG dimensions; affine link is retrospective and direct key/Hill inverses are negative.',
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, transform, powMod};
