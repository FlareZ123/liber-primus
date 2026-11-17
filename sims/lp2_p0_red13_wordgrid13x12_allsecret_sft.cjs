'use strict';
/**
 * Source-anchored 13x12 WORD-grid gate for LP2 physical p0-p2.
 *
 * The original red title has 13 runes and the 13-dot mark follows it;
 * the untouched chapter has 156 further words, exactly 13 rows x 12.
 * Test the simplest operational use: one original red-title symbol selects
 * a fixed row alphabet, allowing an ARBITRARY unknown bijection per row.
 * A row-preserving word shuffle is allowed because the same equality
 * invariant survives it. No English or key score is fitted to the source.
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

console.log(JSON.stringify({
  source: 'Original LP2 p0-p2: red 13, black 156 words, 716 runes',
  sourceRows: 13, wordsPerRow: 12, redKey: red.map((v) => corpus.translit[v]).join(' '),
  rowLengths, original: source,
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
  verdict: 'No direct ordinary native-GP English under any 13 static row bijections; row-preserving word rearrangements cannot rescue it.',
  scope: 'Does not exclude changing state inside a row, cross-row transposition, another plaintext register or a non-bijective length-changing decoder.'
}, null, 2));
