'use strict';

// Test the newly identified 2014 5/7/5 magic-square ↔ p55/p57 count
// structure. This is a bounded gate, not a claim that the squares are an
// authenticated LP2 key. The script preserves the source order and tests
// only direct, motivated interpretations; it does not search phases or
// arbitrary permutations. A separate bounded rank-transposition gate tests
// the 43-core / 43-interior correspondence with source-order and spiral ties.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const annotations = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'
));
const squareText = fs.readFileSync(
  path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'),
  'utf8'
);

const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).map(Number)
  )
);
assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);
for (const square of squares) {
  assert(square.every((row) => row.length === square.length), 'square shape');
}

const p55Words = transcription.split('%')[54]
  .replace(/\/\s*/g, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths = p55Words.map((word) => [...word].length);
assert.deepEqual(wordLengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const p55Runes = p55Words.flatMap((word) => [...word]);
const p55InnerRunes = p55Words.flatMap((word) => [...word].slice(1, -1));
const cipher = p55InnerRunes.map((rune) => corpus.runes.indexOf(rune));
const innerWordLengths = wordLengths.map((length) => Math.max(0, length - 2));
assert.equal(p55Runes.length, 76);
assert.equal(p55InnerRunes.length, 43);
assert.equal(innerWordLengths.reduce((a, b) => a + b, 0), 43);

const p55Annotation = annotations.pages.find((page) => page.page === 55);
const p57Annotation = annotations.pages.find((page) => page.page === 57);
const p55DotCount = p55Annotation.large_punctuation.find((entry) => entry[1] === 13)?.[1];
const p57InitialDotCount = p57Annotation.large_punctuation.find((entry) => entry[1] === 13)?.[1];
const p57DotCount = p57Annotation.large_punctuation.find((entry) => entry[1] === 23)?.[1];
const allRedDotCount = p55DotCount + p57InitialDotCount + p57DotCount;
assert.equal(p55DotCount, 13);
assert.equal(p57InitialDotCount, 13);
assert.equal(p57DotCount, 23);
assert.equal(allRedDotCount, 49);

const totalCells = squares.reduce((sum, square) => sum + square.length ** 2, 0);
const totalRows = squares.reduce((sum, square) => sum + square.length, 0);
const perimeterCells = squares.reduce((sum, square) => sum + 4 * square.length - 4, 0);
const innerMatrices = squares.map((square) =>
  square.slice(1, -1).map((row) => row.slice(1, -1))
);
const innerValues = innerMatrices.flatMap((matrix) => matrix.flat());
const innerCells = innerMatrices.reduce((sum, matrix) => sum + matrix.length ** 2, 0);
const centers = innerMatrices.map((matrix) => matrix[(matrix.length - 1) / 2][(matrix.length - 1) / 2]);
const p55Boundary = p55Runes.length - p55InnerRunes.length;

assert.equal(totalCells, 99);
assert.equal(totalRows, 17);
assert.equal(perimeterCells, 56);
assert.equal(innerCells, 43);
assert.equal(innerValues.length, 43);
assert.equal(p55Boundary, 33);
assert.equal(p55Runes.length + p57DotCount, 99);
assert.equal(p55Boundary + p57DotCount, 56);
assert.equal(p55InnerRunes.length, innerCells);
assert.equal(wordLengths.length, totalRows);

const maxValue = Math.max(...squares.flatMap((square) => square.flat()));
const isPrime = new Uint8Array(maxValue + 1);
isPrime.fill(1);
isPrime[0] = 0;
isPrime[1] = 0;
for (let p = 2; p * p <= maxValue; p++) {
  if (isPrime[p]) {
    for (let n = p * p; n <= maxValue; n += p) isPrime[n] = 0;
  }
}
const primeCount = new Uint16Array(maxValue + 1);
for (let n = 1; n <= maxValue; n++) {
  primeCount[n] = primeCount[n - 1] + isPrime[n];
}
const centerPrimeCounts = centers.map((value) => primeCount[value]);
const centerPrimeCountDeltas = [
  centerPrimeCounts[0] - centerPrimeCounts[1],
  centerPrimeCounts[1] - centerPrimeCounts[2],
];
assert.deepEqual(centers, [809, 331, 91]);
assert.deepEqual(centerPrimeCounts, [140, 67, 24]);
assert.deepEqual(centerPrimeCountDeltas, [73, 43]);

function spiralCW(matrix) {
  const out = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let x = left; x <= right; x++) out.push(matrix[top][x]);
    top++;
    for (let y = top; y <= bottom; y++) out.push(matrix[y][right]);
    right--;
    if (top <= bottom) {
      for (let x = right; x >= left; x--) out.push(matrix[bottom][x]);
      bottom--;
    }
    if (left <= right) {
      for (let y = bottom; y >= top; y--) out.push(matrix[y][left]);
      left++;
    }
  }
  return out;
}

function spiralCCW(matrix) {
  const out = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let y = top; y <= bottom; y++) out.push(matrix[y][left]);
    left++;
    for (let x = left; x <= right; x++) out.push(matrix[bottom][x]);
    bottom--;
    if (left <= right) {
      for (let y = bottom; y >= top; y--) out.push(matrix[y][right]);
      right--;
    }
    if (top <= bottom) {
      for (let x = right; x >= left; x--) out.push(matrix[top][x]);
      top++;
    }
  }
  return out;
}

const transliterate = (indices) => indices.map((index) => corpus.translit[index]).join('');
function groupByP55Word(indices) {
  let offset = 0;
  return innerWordLengths.map((length) => {
    const fragment = indices.slice(offset, offset + length);
    offset += length;
    return transliterate(fragment);
  }).join(' | ');
}
function applyKey(key, sign) {
  return cipher.map((value, index) => (value + sign * key[index] + 2900) % 29);
}
function matricesFromSequence(sequence) {
  let offset = 0;
  return [3, 5, 3].map((size) => {
    const matrix = [];
    for (let row = 0; row < size; row++) {
      matrix.push(sequence.slice(offset, offset + size));
      offset += size;
    }
    return matrix;
  });
}
function directionWalk(values, sign, readAfterStep) {
  let position = 0;
  const indices = [];
  for (const value of values) {
    if (readAfterStep) position = (position + sign * (value % 43) + 4300) % 43;
    indices.push(position);
    if (!readAfterStep) position = (position + sign * (value % 43) + 4300) % 43;
  }
  return {
    positions: indices,
    uniquePositions: new Set(indices).size,
    text: transliterate(indices.map((index) => cipher[index])),
  };
}

const directShiftTests = [];
for (const [name, key] of [
  ['raw-inner-value-mod29', innerValues.map((value) => value % 29)],
  ['prime-count-mod29', innerValues.map((value) => primeCount[value] % 29)],
  ['center-relative-prime-count-mod29', innerMatrices.flatMap((matrix, matrixIndex) => {
    const center = centers[matrixIndex];
    return matrix.flat().map((value) => (primeCount[value] - primeCount[center] + 2900) % 29);
  })],
]) {
  for (const sign of [-1, 1]) {
    const output = applyKey(key, sign);
    directShiftTests.push({
      name,
      sign,
      runes: output.map((index) => corpus.runes[index]).join(''),
      transliteration: transliterate(output),
      wordInteriorFragments: groupByP55Word(output),
    });
  }
}

const spiralTests = [];
for (const [order, fn] of [['clockwise', spiralCW], ['counterclockwise', spiralCCW]]) {
  const keyValues = innerMatrices.flatMap(fn);
  const key = keyValues.map((value) => value % 29);
  for (const sign of [-1, 1]) {
    const output = applyKey(key, sign);
    spiralTests.push({
      order,
      sign,
      transliteration: transliterate(output),
      wordInteriorFragments: groupByP55Word(output),
    });
  }
}

const cipherSpiralTests = [];
for (const [cipherOrder, fn] of [['clockwise', spiralCW], ['counterclockwise', spiralCCW]]) {
  const cipherSpiral = matricesFromSequence(cipher).flatMap(fn);
  for (const [keyOrder, keyValues] of [
    ['row-major', innerValues],
    ['same-spiral', innerMatrices.flatMap(fn)],
  ]) {
    for (const sign of [-1, 1]) {
      const output = cipherSpiral.map((value, index) =>
        (value + sign * (keyValues[index] % 29) + 2900) % 29
      );
      cipherSpiralTests.push({
        cipherOrder,
        keyOrder,
        sign,
        transliteration: transliterate(output),
      });
    }
  }
}

const chainTests = [];
for (const [order, fn] of [
  ['row-major', (matrix) => matrix.flat()],
  ['clockwise', spiralCW],
  ['counterclockwise', spiralCCW],
]) {
  const numbers = innerMatrices.flatMap(fn);
  const pi = numbers.map((value) => primeCount[value]);
  const keyDifferences = pi.slice(1).map((value, index) =>
    (value - pi[index] + 2900) % 29
  );
  const cipherDifferences = cipher.slice(1).map((value, index) =>
    (value - cipher[index] + 29) % 29
  );
  for (const sign of [-1, 1]) {
    for (let initial = 0; initial < 29; initial++) {
      const plaintext = [initial];
      for (let i = 0; i < cipherDifferences.length; i++) {
        plaintext.push((plaintext[plaintext.length - 1]
          + cipherDifferences[i] + sign * keyDifferences[i] + 2900) % 29);
      }
      chainTests.push({
        order,
        sign,
        initial,
        transliteration: transliterate(plaintext),
      });
    }
  }
}

const directionTests = [];
for (const [order, values] of [
  ['row-major', innerValues],
  ['clockwise', innerMatrices.flatMap(spiralCW)],
  ['counterclockwise', innerMatrices.flatMap(spiralCCW)],
]) {
  for (const sign of [-1, 1]) {
    for (const readAfterStep of [false, true]) {
      directionTests.push({
        order,
        sign,
        readAfterStep,
        ...directionWalk(values, sign, readAfterStep),
      });
    }
  }
}


function spiralIndexOrder(size, clockwise) {
  const out = [];
  let top = 0, bottom = size - 1, left = 0, right = size - 1;
  while (top <= bottom && left <= right) {
    if (clockwise) {
      for (let x = left; x <= right; x++) out.push(top * size + x);
      top++;
      for (let y = top; y <= bottom; y++) out.push(y * size + right);
      right--;
      if (top <= bottom) {
        for (let x = right; x >= left; x--) out.push(bottom * size + x);
        bottom--;
      }
      if (left <= right) {
        for (let y = bottom; y >= top; y--) out.push(y * size + left);
        left++;
      }
    } else {
      for (let y = top; y <= bottom; y++) out.push(y * size + left);
      left++;
      for (let x = left; x <= right; x++) out.push(bottom * size + x);
      bottom--;
      if (left <= right) {
        for (let y = bottom; y >= top; y--) out.push(y * size + right);
        right--;
      }
      if (top <= bottom) {
        for (let x = right; x >= left; x--) out.push(top * size + x);
        top++;
      }
    }
  }
  return out;
}
function rankOrder(values, direction, tieOrder) {
  const tieRank = new Map(tieOrder.map((index, rank) => [index, rank]));
  return Array.from({ length: values.length }, (_, i) => i).sort((a, b) => {
    const primary = direction === "ascending" ? values[a] - values[b] : values[b] - values[a];
    return primary || tieRank.get(a) - tieRank.get(b);
  });
}
function applyRankPermutation(sequence, order, mode) {
  if (mode === "read-in-rank-order") return order.map((index) => sequence[index]);
  const out = Array(sequence.length);
  for (let i = 0; i < sequence.length; i++) out[order[i]] = sequence[i];
  return out;
}
const rankVariants = [];
for (const direction of ["ascending", "descending"]) {
  const order = rankOrder(innerValues, direction, Array.from({ length: 43 }, (_, i) => i));
  for (const mode of ["read-in-rank-order", "scatter-by-rank"]) {
    const output = applyRankPermutation(cipher, order, mode);
    rankVariants.push({
      scope: "global 43-value core",
      tie_break: "source row-major",
      direction,
      mode,
      transliteration: transliterate(output),
      gp4_log_probability_per_rune: null,
    });
  }
}
const blockOffsets = [0, 9, 34, 43];
for (const tieBreak of ["row-major", "clockwise-spiral", "counterclockwise-spiral"]) {
  for (const direction of ["ascending", "descending"]) {
    for (const mode of ["read-in-rank-order", "scatter-by-rank"]) {
      const output = [];
      for (let block = 0; block < 3; block++) {
        const matrix = innerMatrices[block];
        const values = matrix.flat();
        const part = cipher.slice(blockOffsets[block], blockOffsets[block + 1]);
        const tieOrder = tieBreak === "row-major"
          ? Array.from({ length: values.length }, (_, i) => i)
          : spiralIndexOrder(matrix.length, tieBreak === "clockwise-spiral");
        const order = rankOrder(values, direction, tieOrder);
        output.push(...applyRankPermutation(part, order, mode));
      }
      rankVariants.push({
        scope: "per-square 9/25/9 blocks",
        tie_break: tieBreak,
        direction,
        mode,
        transliteration: transliterate(output),
        gp4_log_probability_per_rune: null,
      });
    }
  }
}
const rankControlText = fs.readFileSync(
  path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"
);
assert.equal(rankControlText.length, 300000);
const rankTokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function encodeRankNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { out.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { out.push(27); i += 2; }
      else {
        const token = rankTokens.find((candidate) => word.startsWith(candidate.s, i));
        assert(token, "unmapped native GP token " + word.slice(i));
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}
const rankTrain = encodeRankNativeGP(rankControlText.slice(0, 150000));
const rankHeld = encodeRankNativeGP(rankControlText.slice(150000));
const rankGramCounts = new Map();
let rankGramTotal = 0;
for (let i = 0; i + 4 <= rankTrain.length; i++) {
  const key = (((rankTrain[i] * 29 + rankTrain[i + 1]) * 29 + rankTrain[i + 2]) * 29 + rankTrain[i + 3]);
  rankGramCounts.set(key, (rankGramCounts.get(key) || 0) + 1);
  rankGramTotal++;
}
const rankDenominator = rankGramTotal + 0.1 * Math.pow(29, 4);
const rankUnseenLogProbability = Math.log(0.1 / rankDenominator);
const rankLogProbability = new Map(
  [...rankGramCounts].map(([key, count]) => [key, Math.log((count + 0.1) / rankDenominator)])
);
function scoreRankGP4(sequence) {
  let score = 0;
  for (let i = 0; i + 4 <= sequence.length; i++) {
    const key = (((sequence[i] * 29 + sequence[i + 1]) * 29 + sequence[i + 2]) * 29 + sequence[i + 3]);
    score += rankLogProbability.get(key) ?? rankUnseenLogProbability;
  }
  return score / sequence.length;
}
for (const variant of rankVariants) {
  const glyphs = [...variant.transliteration];
  const indices = glyphs.map((glyph) => corpus.translit.indexOf(glyph));
  assert(indices.every((index) => index >= 0));
  variant.gp4_log_probability_per_rune = scoreRankGP4(indices);
}
const rankControlScores = [];
const rankControlStep = Math.floor((rankHeld.length - 43) / 499);
for (let j = 0; j < 500; j++) {
  rankControlScores.push(scoreRankGP4(rankHeld.slice(j * rankControlStep, j * rankControlStep + 43)));
}
rankControlScores.sort((a, b) => a - b);
const rankControlSummary = {
  windows: rankControlScores.length,
  min: rankControlScores[0],
  p01: rankControlScores[4],
  median: rankControlScores[249],
  p99: rankControlScores[494],
  max: rankControlScores[499]
};
const bestRankScore = Math.max(...rankVariants.map((variant) => variant.gp4_log_probability_per_rune));
assert.equal(new Set(innerValues).size, 23);
assert.equal(innerValues.length - new Set(innerValues).size, 20);
assert(rankControlSummary.min > bestRankScore + 1.5,
  "all fixed stable-rank variants should remain below held-out native controls");
const rankTranspositionTests = {
  selector: "43 p55 strict-word interiors ↔ 9+25+9 inner cells of the historical 5/7/5 squares; signed 2016 message says numbers are direction",
  core_value_count: innerValues.length,
  unique_core_values: new Set(innerValues).size,
  duplicate_core_cells: innerValues.length - new Set(innerValues).size,
  tested_variants: rankVariants.length,
  variants: rankVariants,
  control_model: "source-calibrated GP29 4-gram; first 150,000 Shakespeare characters train; last 150,000 held out",
  heldout_native_43_windows: rankControlSummary,
  best_candidate_margin_below_worst_native_window: rankControlSummary.min - bestRankScore,
  decision: "global/per-square stable numeric ranks and source-motivated spiral tie-breaks produce no plaintext; duplicate values leave other tie-breaks unselected"
};

console.log(JSON.stringify({
  classification: 'source-grounded structural selector candidate; no reversible square-to-p55 operation recovered',
  historicalSource: {
    repository: 'neuroretransmit/cicada',
    path: '2014/007-fifth-onion/magicsquares.txt',
    pinnedCommit: 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3',
    sourceBlob: '0cff0a94f16a8603443619b6338def411c9f7bd5',
    priorPuzzleAvailability: '2014 sixth-onion signed instructions explicitly request these three prior-puzzle squares; LP2 pages follow successful submission',
  },
  geometry: {
    squareOrders: squares.map((square) => square.length),
    squareRows: totalRows,
    squareCells: totalCells,
    squarePerimeterCells: perimeterCells,
    squareInnerOrders: innerMatrices.map((matrix) => matrix.length),
    squareInnerCells: innerCells,
    p55Words: p55Words.length,
    p55WordLengths: wordLengths,
    p55Runes: p55Runes.length,
    p55InnerRunes: p55InnerRunes.length,
    p55BoundaryRunes: p55Boundary,
    p55TerminalRedDots: p55DotCount,
    p57InitialRedDots: p57InitialDotCount,
    p57TerminalRedDots: p57DotCount,
    allThreeRedDotClusters: allRedDotCount,
    allThreeRedDotClustersEqual7Squared: allRedDotCount === 7 ** 2,
    p55RunesPlusP57TerminalDots: p55Runes.length + p57DotCount,
    p55BoundaryPlusP57Dots: p55Boundary + p57DotCount,
    squareCenters: centers,
    centerPrimeCounts,
    centerPrimeCountDeltas,
  },
  innerSquareValues: innerValues,
  innerSquareValuesMod29: innerValues.map((value) => value % 29),
  directShiftTests,
  spiralTests,
  cipherSpiralTests,
  chainTestCount: chainTests.length,
  chainTests,
  directionTests,
  rankTranspositionTests,
}, null, 2));
