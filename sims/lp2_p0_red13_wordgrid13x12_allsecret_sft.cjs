'use strict';
/**
 * Source-anchored 156-word rectangular grid gate, both 13x12 and 12x13.
 *
 * The original red title has 13 runes and the 13-dot mark follows it;
 * the untouched chapter has 156 further words, permitting 13x12 or 12x13.
 * Test one original red-title symbol per ROW (13x12) or per COLUMN
 * (12x13), allowing an ARBITRARY unknown bijection on either selected axis.
 * Reordering words inside the corresponding row or column preserves the
 * exact equal-rune statistic; no keys are needed to test either family. No English or key score is fitted to the source.
 *
 * SFT (Windows Node 22): node sims/lp2_p0_red13_wordgrid13x12_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceText = read('resources/liber-primus/lp2-transcription.txt');
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const index = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const firstChapter = sourceText.split('&')[0].split('%').slice(0, 3)
  .join('').replace(/[/\r\n]/g, '');
const parsedWords = firstChapter.split(/[-.]/).filter(Boolean)
  .map((word) => Array.from(word, (glyph) => {
    assert.ok(index.has(glyph), 'unrecognized original rune');
    return index.get(glyph);
  }));
assert.equal(parsedWords.length, 158);
assert.deepEqual(parsedWords.slice(0, 2).map((w) => w.length), [8, 5]);

const red = parsedWords.slice(0, 2).flat();
const words = parsedWords.slice(2);
assert.equal(red.length, 13);
assert.equal(words.length, 156);
const originalTape = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
assert.equal(originalTape.length, 729);
assert.deepEqual(parsedWords.flat(), originalTape);
const rows = Array.from({length: 13}, (_, row) =>
  words.slice(row * 12, row * 12 + 12).flat());
assert.equal(rows.flat().length, 716);
const rowLengths = rows.map((row) => row.length);
assert.deepEqual(rowLengths, [60, 44, 56, 48, 66, 47, 42, 64, 46, 45, 63, 68, 67]);

/**
 * Sum ordered within-row equal-symbol pairs. Any independent row-by-row
 * permutation of all 29 symbols preserves this exactly, regardless of key.
 * @param {number[][]} bands
 * @returns {{pairs:number, equalPairs:number, ioc:number}}
 */
function collisionProfile(bands) {
  let pairs = 0;
  let equalPairs = 0;
  for (const band of bands) {
    const freq = Array(29).fill(0);
    for (const symbol of band) freq[symbol]++;
    pairs += band.length * (band.length - 1);
    equalPairs += freq.reduce((sum, count) => sum + count * (count - 1), 0);
  }
  return {pairs, equalPairs, ioc: equalPairs / pairs};
}
const source = collisionProfile(rows);
assert.equal(source.pairs, 39908);
assert.equal(source.equalPairs, 1428);
assert.ok(Math.abs(source.ioc - 0.03578229928836323) < 1e-14);

const wordLengths = words.map((word) => word.length);
const asColumns = (wordArray) => Array.from({length: 13}, (_, col) =>
  wordArray.filter((_, index) => index % 13 === col).flat());
const columns = asColumns(words);
const columnSource = collisionProfile(columns);
assert.equal(columns.length, 13);
assert.deepEqual(columns.map((column) => column.length),
  [56, 52, 55, 60, 53, 68, 55, 48, 58, 46, 58, 43, 64]);
assert.equal(columnSource.pairs, 39300);
assert.equal(columnSource.equalPairs, 1322);
assert.ok(Math.abs(columnSource.ioc - 0.033638676844783715) < 1e-14);

// Exact native-GP solved Cicada reference, preserving the same 13 row lengths.
const native = solved.sections.flatMap((s) =>
  Array.from(s.source_text).filter((r) => index.has(r)).map((r) => index.get(r)));
assert.equal(native.length, 2979);
const windowLength = rows.flat().length;
const controls = [];
for (let start = 0; start + windowLength <= native.length; start++) {
  let offset = start;
  const bands = rowLengths.map((length) => {
    const slice = native.slice(offset, offset + length);
    offset += length;
    return slice;
  });
  assert.equal(offset - start, 716);
  controls.push(collisionProfile(bands).ioc);
}
assert.equal(controls.length, 2264);
const sorted = controls.slice().sort((a, b) => a - b);
assert.ok(Math.abs(sorted[0] - 0.053021950486118075) < 1e-14);
assert.ok(source.ioc < sorted[0]);
assert.equal(controls.filter((ioc) => ioc <= source.ioc).length, 0);

// Fair 12x13 orientation control: preserve ALL 156 original word lengths,
// then take each thirteenth word to form one vertically aligned column.
const columnControls = [];
for (let start = 0; start + windowLength <= native.length; start++) {
  let offset = start;
  const controlWords = wordLengths.map((n) => {
    const output = native.slice(offset, offset + n);
    offset += n;
    return output;
  });
  assert.equal(offset - start, 716);
  const profile = collisionProfile(asColumns(controlWords));
  assert.equal(profile.pairs, columnSource.pairs);
  columnControls.push(profile.ioc);
}
assert.equal(columnControls.length, 2264);
const columnSorted = columnControls.slice().sort((a, b) => a - b);
assert.ok(Math.abs(columnSorted[0] - 0.05333333333333334) < 1e-14);
assert.equal(columnControls.filter((ioc) => ioc <= columnSource.ioc).length, 0);

// Exact source-derived red-title additive row-key hypothesis, both signs.
// Re-encryption checks algorithmic correctness; it cannot establish a key.
const mod29 = (x) => ((x % 29) + 29) % 29;
for (const sign of [-1, +1]) {
  const decoded = words.map((word, w) =>
    word.map((c) => mod29(c + sign * red[Math.floor(w / 12)])));
  const encrypted = decoded.map((word, w) =>
    word.map((p) => mod29(p - sign * red[Math.floor(w / 12)])));
  assert.deepEqual(encrypted, words);
  assert.equal(decoded.flat().length, 716);
  const observed = collisionProfile(Array.from({length: 13}, (_, r) =>
    decoded.slice(r * 12, r * 12 + 12).flat()));
  assert.equal(observed.equalPairs, source.equalPairs);
  assert.equal(observed.pairs, source.pairs);
  const first = decoded.slice(0, 8).map((w) =>
    w.map((x) => corpus.translit[x]).join(''));
  assert.deepEqual(first.slice(0, 2), sign < 0
    ? ['TAELI', 'XAEW'] : ['BYNGJ', 'SYH']);

  const columnDecoded = words.map((word, w) =>
    word.map((c) => mod29(c + sign * red[w % 13])));
  const columnEncrypted = columnDecoded.map((word, w) =>
    word.map((p) => mod29(p - sign * red[w % 13])));
  assert.deepEqual(columnEncrypted, words);
  assert.deepEqual(collisionProfile(asColumns(columnDecoded)), columnSource);
}

// Independent 716-rune true-native positive under 13 arbitrary secret
// row alphabets, ensuring the invariant detects exactly that architecture.
let seed = 0x27a1b72c;
const next = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
};
const permutation = () => {
  const perm = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = next() % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
};
const keys = Array.from({length: 13}, permutation);
let offset = 0;
const clearRows = rowLengths.map((n) => {
  const out = native.slice(offset, offset + n);
  offset += n;
  return out;
});
const cipherRows = clearRows.map((row, i) => row.map((x) => keys[i][x]));
const restored = cipherRows.map((row, i) =>
  row.map((x) => keys[i].indexOf(x)));
assert.deepEqual(restored, clearRows);
assert.deepEqual(collisionProfile(cipherRows), collisionProfile(clearRows));
assert.ok(collisionProfile(clearRows).ioc >= sorted[0]);

// Second planted positive for the competing orientation: independent
// arbitrary 29-symbol alphabet at each of 13 columns of twelve words.
let clearOffset = 0;
const clearWords = wordLengths.map((length) => {
  const out = native.slice(clearOffset, clearOffset + length);
  clearOffset += length;
  return out;
});
assert.equal(clearOffset, 716);
const columnKeys = Array.from({length: 13}, permutation);
const plantedColumns = clearWords.map((word, wi) =>
  word.map((x) => columnKeys[wi % 13][x]));
const recoveredColumns = plantedColumns.map((word, wi) =>
  word.map((x) => columnKeys[wi % 13].indexOf(x)));
assert.deepEqual(recoveredColumns, clearWords);
assert.deepEqual(collisionProfile(asColumns(plantedColumns)),
  collisionProfile(asColumns(clearWords)));
assert.ok(collisionProfile(asColumns(clearWords)).ioc >= columnSorted[0]);

console.log(JSON.stringify({
  source: 'Original LP2 p0-p2: red 13, black 156 words, 716 runes',
  sourceRows: 13, wordsPerRow: 12, redKey: red.map((v) => corpus.translit[v]).join(' '),
  rowLengths, original: source,
  competingColumns: {
    orientation: '12 rows x 13 red-key columns',
    columnRuneLengths: columns.map((column) => column.length),
    original: columnSource,
    solvedNative: {
      matchedExactWordLengthWindows: columnControls.length,
      min: columnSorted[0],
      median: columnSorted[Math.floor(columnSorted.length / 2)],
      max: columnSorted.at(-1),
      asLowAsOriginal: 0
    },
    secretAlphabetPlantRecoveredRunes: recoveredColumns.flat().length
  },
  solvedNative: {
    originalRuneLength: native.length,
    matched716RuneWindows: controls.length,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted.at(-1),
    asLowAsOriginal: 0
  },
  nativeRowAlphabetPlant: {
    recoveredRunes: restored.flat().length,
    exactRoundtrip: true,
    identicalCollisionProfile: true
  },
  verdict: 'Neither rectangular orientation has ordinary native-GP collision structure under 13 static, arbitrary hidden axis bijections.',
  scope: 'Cannot exclude changing state within word-axis bands, crossing bands, another plaintext register, or a non-bijective length-changing decoder.'
}, null, 2));
