'use strict';
/**
 * Fixed original LP1 p05 Wisdom 5x5 GF29 inverse on p55's 75 complete-word
 * runes. Preserve the incoming one-rune p54 fragment as the 76th original
 * symbol. Source-fixed test for Director #581.
 * Run: node sims/p55_wisdom5_hill75_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = 29;
const SOURCE_WISDOM_1033 = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const WRONG_SQUARE_3301 = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];
const WORD_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];

/** @param {number} x @returns {number} */
function mod(x) { return (x % P + P) % P; }
/** @param {number[][]} matrix @returns {number[][]} */
function invert(matrix) {
  assert.equal(matrix.length, 5);
  const a = matrix.map((row, i) => [
    ...row.map(mod), ...Array.from({ length: 5 }, (_, j) => Number(i === j))
  ]);
  for (let k = 0; k < 5; k++) {
    const j = a.findIndex((row, i) => i >= k && row[k] !== 0);
    assert.ok(j >= k, 'singular source square modulo29');
    [a[k], a[j]] = [a[j], a[k]];
    const scalar = Array.from({ length: 28 }, (_, i) => i + 1)
      .find(v => mod(v * a[k][k]) === 1);
    assert.ok(scalar !== undefined);
    a[k] = a[k].map(v => mod(v * scalar));
    for (let i = 0; i < 5; i++) if (i !== k) {
      const factor = a[i][k];
      a[i] = a[i].map((v, col) => mod(v - factor * a[k][col]));
    }
  }
  return a.map(row => row.slice(5));
}
/** @param {number[][]} matrix @returns {number[][]} */
function transpose(matrix) {
  return matrix[0].map((_, column) => matrix.map(row => row[column]));
}
/** @param {number[]} values */
function indexOfCoincidence(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  return Array.from(counts).reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {string} word @param {{label:string,index:number}[]} tokens */
function encodeSourceNativeWord(word, tokens) {
  const source = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < source.length;) {
    if (source.startsWith("ING", i)) {
      result.push(21); i += 3; // ᛝ = ING in the solved-source spelling
    } else if (source.startsWith("IO", i)) {
      result.push(27); i += 2; // ᛡ = IO in the solved-source spelling
    } else {
      const token = tokens.find(item => source.startsWith(item.label, i));
      assert.ok(token, "unmapped source-native spelling: " + word);
      result.push(token.index);
      i += token.label.length;
    }
  }
  return result;
}
/** @param {string} text @param {{label:string,index:number}[]} tokens */
function sourceNativeWords(text, tokens) {
  return (text.match(/[A-Za-z]+/g) || []).map(word =>
    encodeSourceNativeWord(word, tokens));
}
/** @param {number[][]} words */
function trainSourceNativeBigram(words) {
  const pairs = Array.from({ length: 29 }, () => new Uint32Array(29));
  const starts = new Uint32Array(29);
  for (const word of words) for (let i = 1; i < word.length; i++) {
    pairs[word[i - 1]][word[i]]++;
    starts[word[i - 1]]++;
  }
  return {
    logProbability: pairs.map((row, a) => Array.from(row, count =>
      Math.log((count + 0.25) / (starts[a] + 29 * 0.25))))
  };
}
/** @param {number[]} values @param {{logProbability:number[][]}} model */
function sourceNativeWordShapeScore(values, model) {
  let offset = 0, total = 0, pairs = 0;
  for (const length of WORD_LENGTHS) {
    for (let i = 1; i < length; i++) {
      total += model.logProbability[values[offset + i - 1]][values[offset + i]];
      pairs++;
    }
    offset += length;
  }
  assert.equal(offset, values.length);
  assert.equal(pairs, 59);
  return total / pairs;
}
/**
 * @param {string[]} sources
 * @param {{label:string,index:number}[]} tokens
 * @param {{logProbability:number[][]}} model
 * @param {number} columnScore
 * @param {number} rowScore
 */
function sourceNativeControlStats(sources, tokens, model, columnScore, rowScore) {
  let seed = 0x501113;
  const summaries = [];
  let positivePlant = null;
  for (const source of sources) {
    const words = sourceNativeWords(source, tokens);
    const buckets = Array.from({ length: 14 }, () => []);
    for (const word of words) if (word.length < buckets.length)
      buckets[word.length].push(word);
    for (const length of WORD_LENGTHS)
      assert.ok(buckets[length].length > 0, "missing native word-length bucket " + length);
    if (positivePlant === null)
      positivePlant = WORD_LENGTHS.flatMap(length => buckets[length][0]);
    const scores = [];
    let atOrBelowColumn = 0, atOrBelowRow = 0;
    for (let trial = 0; trial < 20000; trial++) {
      const sample = [];
      for (const length of WORD_LENGTHS) {
        seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
        const bucket = buckets[length];
        sample.push(...bucket[(seed >>> 0) % bucket.length]);
      }
      const value = sourceNativeWordShapeScore(sample, model);
      scores.push(value);
      if (value <= columnScore) atOrBelowColumn++;
      if (value <= rowScore) atOrBelowRow++;
    }
    scores.sort((a, b) => a - b);
    summaries.push({
      source: source === sources[0] ? "Shakespeare" :
        source === sources[1] ? "Gibran" : "Emerson",
      trials: scores.length,
      minimum: scores[0],
      firstPercentile: scores[199],
      median: scores[9999],
      ninetyNinthPercentile: scores[19799],
      maximum: scores[19999],
      atOrBelowColumn: atOrBelowColumn,
      atOrBelowRow: atOrBelowRow
    });
  }
  return { summaries, positivePlant };
}
/** @param {number[][]} matrix @param {number[]} input @returns {number[]} */
function apply(matrix, input) {
  assert.equal(input.length % 5, 0);
  const out = [];
  for (let start = 0; start < input.length; start += 5) {
    const block = input.slice(start, start + 5);
    for (const row of matrix) out.push(mod(row.reduce((s, value, i) =>
      s + value * block[i], 0)));
  }
  return out;
}
/** @param {number[]} values @param {string[]} translit @returns {string} */
function wordDisplay(values, translit) {
  let start = 0;
  return WORD_LENGTHS.map(size => {
    const result = values.slice(start, start + size).map(i => translit[i]).join('');
    start += size;
    return result;
  }).join(' / ');
}

/** @returns {object} */
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const original76 = corpus.pages.find(page => page.page === 55).indices;
  assert.equal(original76.length, 76);
  assert.equal(original76[0], 21, 'source p55 begins with inherited p54 rune NG');
  assert.equal(WORD_LENGTHS.reduce((sum, value) => sum + value, 0), 75);
  const original75 = original76.slice(1);
  const inverse = invert(SOURCE_WISDOM_1033);
  const inverseTranspose = transpose(inverse);
  const sourceTranspose = transpose(SOURCE_WISDOM_1033);
  const decoded75 = apply(inverse, original75); // column-vector P = K^-1 C
  const decoded75Row = apply(inverseTranspose, original75); // row-vector P = C K^-1
  assert.deepEqual(apply(SOURCE_WISDOM_1033, decoded75), original75);
  assert.deepEqual(apply(sourceTranspose, decoded75Row), original75);
  assert.deepEqual([original76[0], ...apply(SOURCE_WISDOM_1033, decoded75)], original76,
    'all 76 original symbols restored; inherited rune remains unchanged');
  const wrongDecoded = apply(invert(WRONG_SQUARE_3301), original75);

  const model = trainNativeGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  const nativeText = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8')
    .replace(/^#.*$/gm, '');
  const native = plaintextWords(nativeText).flat();
  const plant = native.slice(400, 475);
  assert.equal(plant.length, 75);
  assert.deepEqual(apply(inverse, apply(SOURCE_WISDOM_1033, plant)), plant);
  assert.deepEqual(apply(inverseTranspose, apply(sourceTranspose, plant)), plant);
  const nativeScores = [];
  for (let start = 0; start + 75 <= native.length; start += 23) {
    nativeScores.push(languageScore(native.slice(start, start + 75), model));
  }
  const originalScore = languageScore(original75, model);
  const decodedScore = languageScore(decoded75, model);
  const rowScore = languageScore(decoded75Row, model);
  assert.ok(decodedScore < Math.min(...nativeScores));
  assert.ok(rowScore < Math.min(...nativeScores));

  // Independently score both orientations with the solved-source ING/IO
  // spelling, within the 16 original printed word boundaries.
  const sourceTokens = corpus.translit.map((label, index) => ({ label, index }))
    .sort((a, b) => b.label.length - a.label.length);
  const sourceNativeFiles = [
    "resources/control/shakespeare_first300k.txt",
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/emerson_essays_2944.txt"
  ];
  const sourceShakespeareWords = sourceNativeWords(fs.readFileSync(
    path.join(ROOT, sourceNativeFiles[0]), "utf8"), sourceTokens);
  const sourceNativeModel = trainSourceNativeBigram(sourceShakespeareWords);
  const sourceNativeOriginalScore = sourceNativeWordShapeScore(original75, sourceNativeModel);
  const sourceNativeColumnScore = sourceNativeWordShapeScore(decoded75, sourceNativeModel);
  const sourceNativeRowScore = sourceNativeWordShapeScore(decoded75Row, sourceNativeModel);
  const sourceNativeControls = sourceNativeControlStats(
    sourceNativeFiles.map(file => fs.readFileSync(path.join(ROOT, file), "utf8")),
    sourceTokens, sourceNativeModel, sourceNativeColumnScore, sourceNativeRowScore);
  const minimumMatchedControl = Math.min(...sourceNativeControls.summaries.map(x => x.minimum));
  assert.ok(sourceNativeColumnScore < minimumMatchedControl);
  assert.ok(sourceNativeRowScore < minimumMatchedControl);
  assert.deepEqual(apply(inverse, apply(SOURCE_WISDOM_1033, sourceNativeControls.positivePlant)),
    sourceNativeControls.positivePlant);
  assert.deepEqual(apply(inverseTranspose,
    apply(sourceTranspose, sourceNativeControls.positivePlant)),
    sourceNativeControls.positivePlant);

  return {
    classification: 'Original p55 75-rune Wisdom 1033 5x5 Hill transfer: bounded negative',
    original76: original76.length,
    inheritedRuneIndex: original76[0],
    fullWords: WORD_LENGTHS.length,
    inverseGF29: inverse,
    inverseTransposeGF29: inverseTranspose,
    original75Roundtrip: true,
    sourceNative75Roundtrip: true,
    GibranModel: {
      rawScore: originalScore,
      columnVectorInverseScore: decodedScore,
      rowVectorInverseScore: rowScore,
      wrong3301SquareScore: languageScore(wrongDecoded, model),
      heldoutNativeWindows: nativeScores.length,
      nativeMinimum: Math.min(...nativeScores),
      nativeMedian: [...nativeScores].sort((a, b) => a - b)[Math.floor(nativeScores.length / 2)],
      nativeMaximum: Math.max(...nativeScores),
      positivePlantScore: languageScore(plant, model)
    },
    sourceCalibratedWithinWordBigram: {
      trainingSource: "Shakespeare first300k",
      spelling: "ING -> ᛝ and IO -> ᛡ, plus QU/CW, K/Q/C, V/U, Z/S normalization",
      rawScore: sourceNativeOriginalScore,
      columnVectorInverseScore: sourceNativeColumnScore,
      rowVectorInverseScore: sourceNativeRowScore,
      controls: sourceNativeControls.summaries,
      positivePlantRecoveredBothOrientations: true
    },
    original75Translit: original75.map(i => corpus.translit[i]).join(''),
    decoded75ColumnVectorInPrintedWords: wordDisplay(decoded75, corpus.translit),
    decoded75RowVectorInPrintedWords: wordDisplay(decoded75Row, corpus.translit),
    original75IoC: indexOfCoincidence(original75),
    columnVectorIoC: indexOfCoincidence(decoded75),
    rowVectorIoC: indexOfCoincidence(decoded75Row),
    wrong3301SquareTranslit: wrongDecoded.map(i => corpus.translit[i]).join(''),
    sourceLimitation: 'The moth also occurs on LP2 p53. Neither its artwork nor the 5x5 source establishes p55 selection, a cipher operation, the inherited rune decoder, or unknown-page plaintext.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, invert, apply };
