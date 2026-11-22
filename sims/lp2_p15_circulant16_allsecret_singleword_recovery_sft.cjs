'use strict';

/**
 * Exhaustive GP-English small-word recovery against ANY secret stationary
 * 16-tap GF(29) inverse-circulant, pinned to the source p15 square and the
 * following original p16-22 chapter (1,744 unedited runes).
 *
 * The 16 independent original one-rune words constrain a 16-component secret
 * kernel to 3^16 = 43,046,721 possibilities, not 29^16. Test the 17th singleton
 * and complete two-rune word membership for all 69 original double words.
 * Word lexicon: the *entire* pinned English TextBlob word-frequency source,
 * all frequencies, converted with the existing source-calibrated GP encoder.
 *
 * Run: node sims/lp2_p15_circulant16_allsecret_singleword_recovery_sft.cjs
 * Windows Node22 CommonJS, read-only, deterministic and no external packages.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const wordList = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8'
);
const WIDTH = 16;
const Q = 29;
const oneRunes = [24, 10, 3]; // authentic GP labels A, I, O
const expectedSingles = [21, 119, 244, 380, 386, 414, 455, 471, 596,
  712, 871, 937, 989, 1032, 1491, 1557, 1574];
const printedP15 = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];

/** @param {number} x @returns {number} */
const mod = (x) => ((x % Q) + Q) % Q;

/**
 * @param {number[][]} rows An m×16 coefficient matrix
 * @returns {{rank:number,inverse:number[][] | null}} Inverse when square/full
 */
function invert(rows) {
  const n = rows.length;
  assert.equal(n, WIDTH);
  const a = rows.map((row, i) => [
    ...row,
    ...Array.from({length: WIDTH}, (_, j) => Number(i === j))
  ]);
  let rank = 0;
  for (let column = 0; column < WIDTH; column++) {
    const pivot = a.findIndex((row, i) => i >= rank && row[column]);
    if (pivot < 0) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const scalar = Array.from({length: Q - 1}, (_, i) => i + 1)
      .find((i) => mod(i * a[rank][column]) === 1);
    assert.ok(scalar);
    a[rank] = a[rank].map((x) => mod(x * scalar));
    for (let i = 0; i < WIDTH; i++) {
      if (i === rank || !a[i][column]) continue;
      const factor = a[i][column];
      a[i] = a[i].map((x, j) => mod(x - factor * a[rank][j]));
    }
    rank++;
  }
  return {rank, inverse: rank === WIDTH ? a.map((row) => row.slice(WIDTH)) : null};
}

/**
 * @param {number[]} glyphs Original source chapter or independent control
 * @param {number} site Original chapter-local, zero-based rune index
 * @returns {number[]} Sixteen observed positions in the cyclic equation
 */
function observation(glyphs, site) {
  const start = Math.floor(site / WIDTH) * WIDTH;
  const at = site % WIDTH;
  return Array.from({length: WIDTH}, (_, j) => glyphs[start + ((at + j) % WIDTH)]);
}

/**
 * @param {number[]} row
 * @param {number[][]} inverse
 * @returns {number[]}
 */
function project(row, inverse) {
  return Array.from({length: WIDTH}, (_, j) =>
    mod(row.reduce((sum, x, i) => sum + x * inverse[i][j], 0))
  );
}

/** @param {number[]} coeff @param {number[]} values @returns {number} */
function dot(coeff, values) {
  let sum = 0;
  for (let i = 0; i < WIDTH; i++) sum += coeff[i] * values[i];
  return mod(sum);
}

/**
 * @param {number[][]} matrix
 * @param {number[]} glyphs
 * @returns {number[]}
 */
function apply(matrix, glyphs) {
  assert.equal(glyphs.length % WIDTH, 0);
  const out = [];
  for (let b = 0; b < glyphs.length; b += WIDTH) {
    for (let i = 0; i < WIDTH; i++) {
      let sum = 0;
      for (let j = 0; j < WIDTH; j++) sum += matrix[i][j] * glyphs[b + j];
      out.push(mod(sum));
    }
  }
  return out;
}

/** @param {number[]} kernel @returns {number[][]} */
function circulant(kernel) {
  return Array.from({length: WIDTH}, (_, i) =>
    Array.from({length: WIDTH}, (_, j) =>
      mod(kernel[((j - i) % WIDTH + WIDTH) % WIDTH])
    )
  );
}

/**
 * Count a ternary Gray walk on n digits; each move changes exactly one digit.
 * @param {number} n
 * @returns {number}
 */
function testGrayWalk(n) {
  const digits = new Uint8Array(n);
  const directions = new Int8Array(n).fill(1);
  const seen = new Set();
  let count = 0;
  while (true) {
    seen.add(Array.from(digits).join(''));
    count++;
    let i = 0;
    for (; i < n; i++) {
      const v = digits[i] + directions[i];
      if (v >= 0 && v <= 2) break;
    }
    if (i === n) break;
    digits[i] += directions[i];
    for (let j = 0; j < i; j++) directions[j] *= -1;
  }
  assert.equal(seen.size, 3 ** n);
  return count;
}

assert.equal(testGrayWalk(4), 81);
assert.equal(corpus.translit[24], 'A');
assert.equal(corpus.translit[10], 'I');
assert.equal(corpus.translit[3], 'O');
const pageLengths = Array.from({length: 7}, (_, i) =>
  corpus.pages.find((p) => p.page === i + 16).indices.length
);
assert.deepEqual(pageLengths, [267, 273, 260, 271, 269, 273, 131]);
const chapter = Array.from({length: 7}, (_, i) =>
  corpus.pages.find((p) => p.page === i + 16).indices).flat();
assert.equal(chapter.length, 1744);
const start = corpus.pages.filter((p) => p.page < 16)
  .reduce((n, p) => n + p.indices.length, 0);
const end = start + chapter.length;
let runeOffset = 0;
const targetWords = [];
for (const word of parseSharedCorpus().words) {
  if (runeOffset >= start && runeOffset < end) {
    targetWords.push({site:runeOffset - start, length:word.length});
  }
  runeOffset += word.length;
}
const singles = targetWords.filter((w) => w.length === 1).map((w) => w.site);
const doubles = targetWords.filter((w) => w.length === 2).map((w) => w.site);
assert.deepEqual(singles, expectedSingles);
assert.equal(doubles.length, 69);
assert.deepEqual(doubles.slice(0, 5), [32, 76, 78, 120, 150]);

const wordBuckets = new Map();
const allowedGP2 = new Uint8Array(Q * Q);
for (const line of wordList.split(/\r?\n/u)) {
  const match = line.match(/^([a-z]+)\s+(\d+)$/u);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!wordBuckets.has(encoded.length)) wordBuckets.set(encoded.length, []);
  wordBuckets.get(encoded.length).push({
    letters:match[1], runes:encoded, frequency:Number(match[2])
  });
  if (encoded.length === 2) allowedGP2[encoded[0] * Q + encoded[1]] = 1;
}
for (const candidates of wordBuckets.values())
  candidates.sort((a, b) => b.frequency - a.frequency);
const uniqueDoubleWords = allowedGP2.reduce((n, present) => n + present, 0);
assert.equal(uniqueDoubleWords, 189);

/** Build a source-length, original-word-shape GP dictionary plant. */
function nativePlant() {
  const output = [];
  let i = 0, singleId = 0;
  for (const word of targetWords) {
    let value;
    if (word.length === 1) {
      value = [oneRunes[singleId % 3]];
      singleId++;
    } else {
      const pool = wordBuckets.get(word.length);
      assert.ok(pool?.length, 'Reference word pool must contain every length');
      const choices = Math.min(20, pool.length);
      value = pool[(i * 7 + Math.floor(i / 5)) % choices].runes;
    }
    assert.equal(value.length, word.length);
    output.push(...value);
    i++;
  }
  assert.equal(output.length, chapter.length);
  assert.equal(singleId, singles.length);
  return output;
}

/**
 * Reconstruct secret inverse-circulant kernel from sixteen singleton readings.
 * Positive control uses an independently known, actual source-derived matrix.
 * @param {number[]} observed
 * @param {number[]} knownPlain
 */
function validatePlant(observed, knownPlain) {
  const rows = singles.slice(0, WIDTH).map((site) => observation(observed, site));
  const {rank, inverse} = invert(rows);
  assert.equal(rank, WIDTH, 'Plant singleton system must have full rank');
  const assignments = singles.slice(0, WIDTH).map((site) => knownPlain[site]);
  assert(assignments.every((x) => oneRunes.includes(x)));
  const kernel = inverse.map((row) => dot(row, assignments));
  const output = Array.from({length: knownPlain.length},
    (_, site) => dot(observation(observed, site), kernel));
  assert.deepEqual(output, knownPlain, 'Recovered entire planted 1744-rune plaintext');
  assert(oneRunes.includes(output[singles.at(-1)]));
  for (const site of doubles)
    assert(allowedGP2[output[site] * Q + output[site + 1]],
      'Plant two-rune word should be in native-GP dictionary');
  return {kernel, singletonRank:rank};
}

const plantedPlain = nativePlant();
const plantedCipher = apply(circulant(printedP15), plantedPlain);
const plant = validatePlant(plantedCipher, plantedPlain);
assert.deepEqual(apply(circulant(printedP15), plantedPlain), plantedCipher);

// Original exact hidden-kernel attack: finite 3^16 singleton assignments.
const singletonRows = singles.slice(0, WIDTH).map((site) =>
  observation(chapter, site));
const {rank:originalRank, inverse:inverseSingleton} = invert(singletonRows);
assert.equal(originalRank, WIDTH);
const secondary = project(observation(chapter, singles.at(-1)), inverseSingleton);
const doubleRows = doubles.map((site) => [
  project(observation(chapter, site), inverseSingleton),
  project(observation(chapter, site + 1), inverseSingleton)
]);
const fast = [secondary, ...doubleRows[0], ...doubleRows[1]];
assert.equal(fast.length, 5);
const outputs = new Uint8Array(fast.map((row) => mod(
  row.reduce((sum, x) => sum + x * oneRunes[0], 0)
)));
const digits = new Uint8Array(WIDTH);
const directions = new Int8Array(WIDTH).fill(1);
const deltaTypes = [-14, -7, 7, 14];
const deltaAdd = deltaTypes.map((delta) =>
  Uint8Array.from({length: Q}, (_, coefficient) => mod(delta * coefficient))
);
const counts = new Uint32Array(doubles.length + 1);
let tried = 0, secondaryPass = 0, earlyPass = 0, completed = 0;
const surviving = [];
const assignments = new Uint8Array(WIDTH).fill(oneRunes[0]);
while (true) {
  tried++;
  if (oneRunes.includes(outputs[0])) {
    secondaryPass++;
    if (allowedGP2[outputs[1] * Q + outputs[2]] &&
        allowedGP2[outputs[3] * Q + outputs[4]]) {
      earlyPass++;
      counts[2]++;
      for (let word = 2; word < doubles.length; word++) {
        const [a, b] = doubleRows[word];
        if (!allowedGP2[dot(a, assignments) * Q + dot(b, assignments)]) break;
        counts[word + 1]++;
        if (word === doubles.length - 1) {
          completed++;
          if (surviving.length < 10) {
            const kernel = inverseSingleton.map((row) => dot(row, assignments));
            surviving.push({kernel, assignments:Array.from(assignments)});
          }
        }
      }
    }
  }
  let change = 0;
  for (; change < WIDTH; change++) {
    const next = digits[change] + directions[change];
    if (next >= 0 && next <= 2) break;
  }
  if (change === WIDTH) break;
  const old = digits[change];
  digits[change] += directions[change];
  for (let j = 0; j < change; j++) directions[j] *= -1;
  const next = digits[change];
  const delta = oneRunes[next] - oneRunes[old];
  const kind = deltaTypes.indexOf(delta);
  assert.notEqual(kind, -1);
  assignments[change] = oneRunes[next];
  for (let i = 0; i < fast.length; i++) {
    const v = outputs[i] + deltaAdd[kind][fast[i][change]];
    outputs[i] = v >= Q ? v - Q : v;
  }
}
assert.equal(tried, 3 ** WIDTH);
const lastPositive = Array.from({length: counts.length}, (_, i) =>
  counts[i] > 0 ? {twoWordCount:i, survivors:counts[i]} : null)
  .filter(Boolean);
console.log(JSON.stringify({
  source:'unaltered LP2 original pp16-22', originalRunes:chapter.length,
  frozenSingletonPositions:singles, frozenDoubleWords:doubles.length,
  sourceNativeLexiconGP2:uniqueDoubleWords,
  secretInverseKernelDimensions:WIDTH,
  singletonLinearRank:originalRank,
  exactlyEnumeratedKernels:tried, lastSingletonMatches:secondaryPass,
  firstTwoDoubleWordMatches:earlyPass, completeMatches:completed,
  filterSurvival:lastPositive,
  survivingExamples:surviving,
  sourceDerivedP15Plant:{exact:plantedPlain.length,
    sourceKernelRecovered:plant.kernel, singletonRank:plant.singletonRank}
}, null, 2));
