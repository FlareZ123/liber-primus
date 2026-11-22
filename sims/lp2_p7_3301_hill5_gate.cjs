"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

const pages = corpus.pages.filter(page => page.page >= 8 && page.page <= 14);
assert.deepEqual(pages.map(page => page.indices.length), [255, 268, 263, 273, 261, 272, 137]);
const block = pages.flatMap(page => page.indices);
assert.equal(block.length, 1729);

// The original p10 inline Arabic 7 occurs at zero-based offset 692
// in the concatenated 1729-rune block. Treat it as GP value 7.
const source = block.slice();
source.splice(692, 0, 7);
assert.equal(source.length, 1730);
assert.equal(source[692], 7);
assert.equal(source.length % 5, 0);

const DOT_ORDER = [2, 4, 0, 3, 1];
const COLUMN_HEIGHT = 346;
const columns = Array.from({ length: 5 }, (_, column) =>
  source.slice(column * COLUMN_HEIGHT, (column + 1) * COLUMN_HEIGHT)
);
const interleaveColumns = order => {
  const out = [];
  for (let row = 0; row < COLUMN_HEIGHT; row++) {
    for (const column of order) out.push(columns[column][row]);
  }
  return out;
};
const selectedInput = interleaveColumns(DOT_ORDER);
assert.equal(selectedInput.length, 1730);
assert.equal(selectedInput[0], 7, "the source-selected dot order must move the inline 7 to the first symbol");

const mod = value => ((value % 29) + 29) % 29;
function inverseMod29(value) {
  let a = mod(value), b = 29, x = 1, y = 0;
  while (b !== 0) {
    const q = Math.floor(a / b);
    [a, b] = [b, a - q * b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1, "matrix pivot must be invertible modulo 29");
  return mod(x);
}
function determinantMod29(matrix) {
  const a = matrix.map(row => row.map(mod));
  let determinant = 1;
  for (let column = 0; column < 5; column++) {
    let pivot = column;
    while (pivot < 5 && a[pivot][column] === 0) pivot++;
    if (pivot === 5) return 0;
    if (pivot !== column) {
      [a[pivot], a[column]] = [a[column], a[pivot]];
      determinant = mod(-determinant);
    }
    const pivotValue = a[column][column];
    determinant = mod(determinant * pivotValue);
    const inversePivot = inverseMod29(pivotValue);
    for (let row = column + 1; row < 5; row++) {
      const factor = mod(a[row][column] * inversePivot);
      for (let j = column; j < 5; j++) {
        a[row][j] = mod(a[row][j] - factor * a[column][j]);
      }
    }
  }
  return determinant;
}
function inverseMatrixMod29(matrix) {
  const augmented = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: 5 }, (_, j) => Number(i === j)))
  );
  for (let column = 0; column < 5; column++) {
    let pivot = column;
    while (pivot < 5 && augmented[pivot][column] === 0) pivot++;
    assert.notEqual(pivot, 5, "Hill matrix must be invertible modulo 29");
    [augmented[pivot], augmented[column]] = [augmented[column], augmented[pivot]];
    const scale = inverseMod29(augmented[column][column]);
    augmented[column] = augmented[column].map(value => mod(value * scale));
    for (let row = 0; row < 5; row++) {
      if (row === column) continue;
      const factor = augmented[row][column];
      if (factor === 0) continue;
      augmented[row] = augmented[row].map((value, j) =>
        mod(value - factor * augmented[column][j])
      );
    }
  }
  return augmented.map(row => row.slice(5));
}
function hillTransform(matrix, input) {
  assert.equal(input.length % 5, 0);
  const output = [];
  for (let offset = 0; offset < input.length; offset += 5) {
    const vector = input.slice(offset, offset + 5);
    for (let row = 0; row < 5; row++) {
      output.push(mod(matrix[row].reduce((sum, value, column) =>
        sum + value * vector[column], 0
      )));
    }
  }
  return output;
}
function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, index) =>
    permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest])
  );
}

// The 2014 5x5 / 3301 magic square used by the Jung-index experiment.
const magicSquare = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];
assert(magicSquare.every(row => row.reduce((sum, value) => sum + value, 0) === 3301));
assert.equal(parseInt("3301", 8), 1729); // a possible selector, not proof of intent
const hillKey = magicSquare.map(row => row.map(mod));
assert.equal(determinantMod29(hillKey), 10);
const hillInverse = inverseMatrixMod29(hillKey);

// p57's "divinity within" can also suggest Euler's phi. Test the natural
// source-constrained variant phi(each 2014 square entry) mod 29.
function eulerTotient(n) {
  let remaining = n;
  let result = n;
  for (let prime = 2; prime * prime <= remaining; prime++) {
    if (remaining % prime !== 0) continue;
    while (remaining % prime === 0) remaining /= prime;
    result -= result / prime;
  }
  if (remaining > 1) result -= result / remaining;
  return Math.round(result);
}
const totientHillKey = magicSquare.map(row => row.map(value => mod(eulerTotient(value))));
assert.equal(determinantMod29(totientHillKey), 23);
const totientHillInverse = inverseMatrixMod29(totientHillKey);

const inverseOutput = hillTransform(hillInverse, selectedInput);
const directOutput = hillTransform(hillKey, selectedInput);
const totientInverseOutput = hillTransform(totientHillInverse, selectedInput);
const totientDirectOutput = hillTransform(totientHillKey, selectedInput);
const noInterleaveInverseOutput = hillTransform(hillInverse, source);

// Alternative literal reading: the p7 dot order permutes the five columns
// of the 5x5 key matrix, while the 1730-symbol source remains in page order.
const columnPermutedKey = hillKey.map(row => DOT_ORDER.map(column => row[column]));
assert.equal(determinantMod29(columnPermutedKey), 10);
const columnPermutedKeyOutput = hillTransform(
  inverseMatrixMod29(columnPermutedKey), source
);

const permutationScores = permutations([0, 1, 2, 3, 4]).map(order => ({
  order,
  score: model.scoreStream(hillTransform(hillInverse, interleaveColumns(order))).mean
})).sort((a, b) => b.score - a.score);
const selectedRank = permutationScores.findIndex(item =>
  item.order.join(",") === DOT_ORDER.join(",")
) + 1;

const result = {
  status: "negative: no plaintext recovered",
  source: {
    pages: pages.map(page => ({ page: page.page, runes: page.indices.length })),
    runeCount: block.length,
    inlineSevenOffset: 692,
    totalWithSeven: source.length,
    fiveColumnsOf: COLUMN_HEIGHT,
    dotOrder: DOT_ORDER,
    firstSymbolAfterDotInterleave: selectedInput[0]
  },
  selectorObservation: "1729 = 3301 base 8; this is a mathematical coincidence/possible clue, not evidence of author intent",
  hillKey: {
    matrixMod29: hillKey,
    determinantMod29: determinantMod29(hillKey),
    inverseMod29: hillInverse,
    phiOfSquareEntriesMod29: totientHillKey,
    phiOfSquareEntriesDeterminantMod29: determinantMod29(totientHillKey)
  },
  sourceNativeGpTrigramScores: {
    lp1Training: model.trainingScore,
    solvedP57PositiveControl: model.p57Score,
    interleavedInput: model.scoreStream(selectedInput).mean,
    selectedDotOrderHillInverse: model.scoreStream(inverseOutput).mean,
    selectedDotOrderHillDirect: model.scoreStream(directOutput).mean,
    phiOfSquareEntriesHillInverse: model.scoreStream(totientInverseOutput).mean,
    phiOfSquareEntriesHillDirect: model.scoreStream(totientDirectOutput).mean,
    noInterleaveHillInverse: model.scoreStream(noInterleaveInverseOutput).mean,
    dotOrderAsKeyColumnPermutationHillInverse: model.scoreStream(columnPermutedKeyOutput).mean
  },
  selectedPermutation: {
    rankAmong120: selectedRank,
    bestFive: permutationScores.slice(0, 5),
    worstFive: permutationScores.slice(-5)
  },
  selectedOutputPrefix: model.spell(inverseOutput).slice(0, 240)
};
console.log(JSON.stringify(result, null, 2));
