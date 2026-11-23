'use strict';

// Source-exact test of the p7 red-word GP-prime seed evolved by the original
// 1033-sum 5x5 Cicada 2014 square B. Run from repository root with Node 22:
//   node sims/lp2_1033_square_p7_primeword_state_stream_gate.cjs

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const annotations = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'
));
const squareText = fs.readFileSync(
  path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8'
);

function mod29(x) {
  return ((x % 29) + 29) % 29;
}

function identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => +(i === j))
  );
}

function matrixMultiply(A, B) {
  return A.map(row => B[0].map((_, j) =>
    mod29(row.reduce((sum, value, k) => sum + value * B[k][j], 0))
  ));
}

function matrixVector(A, v) {
  return A.map(row => mod29(row.reduce((sum, value, k) => sum + value * v[k], 0)));
}

function matrixPower(A, exponent) {
  let result = identity(A.length);
  let base = A.map(row => row.slice());
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = matrixMultiply(result, base);
    base = matrixMultiply(base, base);
    e >>= 1;
  }
  return result;
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function render(values) {
  return values.map(index => corpus.translit[index]).join('');
}

function transform(values, key, sign) {
  return values.map((value, i) => mod29(value + sign * key[i % key.length]));
}

function repeatToLength(values, length) {
  return Array.from({ length }, (_, i) => values[i % values.length]);
}

// The last 25 integers in the historical source file are the final 5x5,
// 1033-sum square B. Keep its original integer values as source evidence.
const sourceNumbers = squareText.match(/\d+/g).map(Number);
assert.strictEqual(sourceNumbers.length, 99);
const matrixRaw = sourceNumbers.slice(-25);
const matrix = Array.from({ length: 5 }, (_, row) =>
  matrixRaw.slice(row * 5, row * 5 + 5).map(mod29)
);
const rawRowSums = Array.from({ length: 5 }, (_, row) =>
  matrixRaw.slice(row * 5, row * 5 + 5).reduce((a, b) => a + b, 0)
);
assert.deepStrictEqual(rawRowSums, [1033, 1033, 1033, 1033, 1033]);

// The original p7 red span is 14 runes at page-local offsets [194,208).
// Original word segmentation is 2/4/3/2/3 runes; the 5 prime sums are the
// seed vector. This preserves the red words as printed, without decoding them.
const p7Annotation = annotations.pages.find(page => page.page === 7);
const redSpan = p7Annotation.red_spans.find(span => span.start === 194 && span.length === 14);
assert(redSpan, 'Original p7 red span [194,208) not found');
const p7Runes = corpus.pages.find(page => page.page === 7).indices;
const redIndices = p7Runes.slice(194, 208);
assert.strictEqual(redIndices.length, 14);
const redWordLengths = [2, 4, 3, 2, 3];
let offset = 0;
const seedWords = redWordLengths.map(length => {
  const word = redIndices.slice(offset, offset + length);
  offset += length;
  return word;
});
assert.strictEqual(offset, 14);
const seed = seedWords.map(word =>
  mod29(word.reduce((sum, index) => sum + corpus.prime[index], 0))
);
assert.deepStrictEqual(seed, [9, 16, 11, 11, 23]);

// Verify the source square's order-28 structure over GP29.
const B14 = matrixPower(matrix, 14);
const B28 = matrixPower(matrix, 28);
const minusAntiIdentity = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => (j === 4 - i ? 28 : 0))
);
assert.deepStrictEqual(B14, minusAntiIdentity);
assert.deepStrictEqual(B28, identity(5));
assert.notDeepStrictEqual(matrixPower(matrix, 4), identity(5));

// One state step emits five GP29 symbols. The 28 distinct states make a
// 5x28 key matrix, with 140 symbols in time-major order.
const states = [];
let state = seed.slice();
for (let t = 0; t < 28; t++) {
  states.push(state.slice());
  state = matrixVector(matrix, state);
}
assert.deepStrictEqual(state, seed, 'The 28-step state must return to its seed');
assert.strictEqual(new Set(states.map(v => v.join(','))).size, 28);
const keyRows = Array.from({ length: 5 }, (_, row) => states.map(v => v[row]));
const timeMajorKey = states.flat();
assert.strictEqual(timeMajorKey.length, 140);
const minimalKeyPeriod = Array.from({ length: 140 }, (_, i) => i + 1)
  .filter(period => 140 % period === 0 && timeMajorKey.every((x, i) => x === timeMajorKey[i % period]))
  .sort((a, b) => a - b)[0];
assert.strictEqual(minimalKeyPeriod, 140);

// Full original cuneiform chapter p33-p39.
const chapterPages = corpus.pages.filter(page => page.page >= 33 && page.page <= 39);
const chapterLengths = chapterPages.map(page => page.indices.length);
assert.deepStrictEqual(chapterLengths, [214, 261, 271, 238, 228, 228, 240]);
const chapter = chapterPages.flatMap(page => page.indices);
assert.strictEqual(chapter.length, 1680);
assert.strictEqual(chapter.length, 12 * 140);
assert.strictEqual(chapter.length, 60 * 28);

// The five original numbered passages, in printed order.
const p36 = corpus.pages.find(page => page.page === 36).indices;
const p37 = corpus.pages.find(page => page.page === 37).indices;
const p38 = corpus.pages.find(page => page.page === 38).indices;
const units = [
  p36.slice(99, 238),
  p37.slice(0, 91),
  p37.slice(91, 189),
  [...p37.slice(189, 228), ...p38.slice(0, 57)],
  p38.slice(57, 186)
];
const unitLengths = units.map(unit => unit.length);
assert.deepStrictEqual(unitLengths, [139, 91, 98, 96, 129]);
const fiveUnitCiphertext = units.flat();
assert.strictEqual(fiveUnitCiphertext.length, 553);

// Positive controls: the p57 solved page repeated to the target lengths is
// encrypted and decrypted under each frozen receiver with exact recovery.
const p57 = corpus.pages.find(page => page.page === 57).indices;
const nativePlantChapter = repeatToLength(p57, chapter.length);
const nativePlantUnits = units.map(unit => repeatToLength(p57, unit.length));

const fullVariants = [];
for (const sign of [-1, 1]) {
  const plaintext = transform(chapter, timeMajorKey, sign);
  const replay = transform(plaintext, timeMajorKey, -sign);
  assert.deepStrictEqual(replay, chapter);
  const plantedCipher = transform(nativePlantChapter, timeMajorKey, -sign);
  assert.deepStrictEqual(transform(plantedCipher, timeMajorKey, sign), nativePlantChapter);
  fullVariants.push({
    sign,
    ioc: ioc(plaintext),
    first140: render(plaintext.slice(0, 140)),
    replayRunes: replay.length,
    nativePlantIoC: ioc(nativePlantChapter)
  });
}

const unitVariants = [];
for (const sign of [-1, 1]) {
  const decodedUnits = units.map((unit, i) => transform(unit, keyRows[i], sign));
  const replayUnits = decodedUnits.map((unit, i) => transform(unit, keyRows[i], -sign));
  assert.deepStrictEqual(replayUnits, units);
  const plantedCipherUnits = nativePlantUnits.map((unit, i) => transform(unit, keyRows[i], -sign));
  assert.deepStrictEqual(
    plantedCipherUnits.map((unit, i) => transform(unit, keyRows[i], sign)),
    nativePlantUnits
  );
  unitVariants.push({
    sign,
    totalIoC: ioc(decodedUnits.flat()),
    perUnitIoC: decodedUnits.map(ioc),
    first80ByUnit: decodedUnits.map(unit => render(unit.slice(0, 80))),
    replayRunes: replayUnits.reduce((sum, unit) => sum + unit.length, 0),
    nativePlantIoC: ioc(nativePlantUnits.flat())
  });
}

console.log(JSON.stringify({
  matrix: { raw: matrixRaw, mod29: matrix, rowSums: rawRowSums, B14, B28 },
  seed: {
    p7RedSpan: { start: redSpan.start, length: redSpan.length, runes: redSpan.runes },
    wordLengths: redWordLengths,
    words: seedWords.map(word => render(word)),
    gpPrimeSumsMod29: seed
  },
  orbit: {
    distinctStates: states.length,
    keyRows,
    timeMajorKey,
    keyLength: timeMajorKey.length,
    minimalKeyPeriod,
    chapterPageLengths: chapterLengths,
    chapterLength: chapter.length,
    chapterIs12x140: chapter.length === 12 * 140,
    chapterIs60x28: chapter.length === 60 * 28,
    numberedUnitLengths: unitLengths
  },
  original: {
    chapterIoC: ioc(chapter),
    fiveUnitIoC: ioc(fiveUnitCiphertext),
    nativeP57PlantChapterIoC: ioc(nativePlantChapter),
    nativeP57PlantUnitsIoC: ioc(nativePlantUnits.flat())
  },
  fullChapterVariants: fullVariants,
  fiveUnitRowVariants: unitVariants
}, null, 2));
