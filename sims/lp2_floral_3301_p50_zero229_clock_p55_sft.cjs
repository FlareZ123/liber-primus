'use strict';

/**
 * Source-fixed floral-frame / 256-byte-table clock check on original LP2.
 * Read-only Windows-compatible Node.js 22 SFT: no fitted key, guessed plaintext,
 * pointer offset, randomized stream phase, or modified source glyphs.
 *
 * Historical mechanism under test is conjectural. The printed geometry selects
 * the p40..p55 within-page transition clock and the p50 byte table supplies
 * the literal cyclic entries. Native GP29 arithmetic is an independently known
 * Cicada operation. The inverse candidates here are finite and explicit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function resource(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
    'liber-primus', name), 'utf8'));
}

const corpus = resource('lp2-corpus.json');
const grid = resource('lp2-grid-256.json');
/** @type {number[]} */
const table = grid.bytes;
assert.equal(table.length, 256);
assert.deepEqual(table.flatMap((value, index) => value === 0 ? [index] : []),
  [192, 229]);
const unknownPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(unknownPages.length, 55);
assert.equal(unknownPages.reduce((n, p) => n + p.indices.length, 0), 12956);

const floral = unknownPages.filter(p => p.page >= 40 && p.page <= 55);
assert.equal(floral.length, 15);
const steps = floral.map(p => ({ page: p.page, transitions: p.indices.length - 1 }));
assert.equal(steps.reduce((n, p) => n + p.transitions, 0), 3301);
assert.equal(steps[0].page, 40);
assert.equal(steps[0].transitions, 230);
assert.equal(table[steps[0].transitions - 1], 0);
assert.equal(3301 % 256, 229);
assert.equal(table[3301 % 256], 0);

/** @type {number[]} */
const ciphertext = floral.at(-1).indices;
assert.equal(ciphertext.length, 76);
const p55Start = steps.slice(0, -1).reduce((n, p) => n + p.transitions, 0);
assert.equal(p55Start, 3226);
assert.equal((p55Start + 38) % 256, 192);
assert.equal((p55Start + 74) % 256, 228);

const transcription = fs.readFileSync(path.join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-transcription.txt'), 'utf8');
const p55Print = transcription.split('%')[54];
assert.equal((p55Print.match(/[\u16a0-\u16ff]/gu) || []).length, 76);
let runeOffset = 0;
const printedWords = [];
for (const word of p55Print.replace(/\/\r?\n/g, '').match(/[\u16a0-\u16ff]+/gu)) {
  printedWords.push({ start: runeOffset, end: runeOffset + word.length - 1, word });
  runeOffset += word.length;
}
assert.equal(runeOffset, 76);
const zeroWord = printedWords.find(w => w.start <= 39 && 39 <= w.end);
assert.equal(zeroWord.start, 36);
assert.equal(zeroWord.end, 41);
assert.equal(zeroWord.word, 'ᛗᛋᛞᛡᛈᚠ');

/** @param {number[]} letters @returns {number} */
function repeatedPairs(letters) {
  const frequency = new Int16Array(29);
  for (const letter of letters) frequency[letter]++;
  return [...frequency].reduce((n, count) => n + count * (count - 1), 0);
}

/**
 * @param {number[]} bytes
 * @param {'symbol'|'step'} mode
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(bytes, mode, sign) {
  const result = [ciphertext[0]];
  for (let i = 1; i < ciphertext.length; i++) {
    const k = bytes[(p55Start + i - 1) % 256] % 29;
    const source = mode === 'symbol'
      ? ciphertext[i] : (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
    result.push((source + sign * k + 29) % 29);
  }
  return result;
}
const variants = /** @type {const} */ ([
  ['symbol', -1], ['symbol', 1], ['step', -1], ['step', 1]
]);
const originalScores = variants.map(([mode, sign]) =>
  repeatedPairs(decode(table, mode, sign)));
assert.deepEqual(originalScores, [210, 164, 198, 210]);
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(repeatedPairs(p57.slice(0, 76)), 340);
assert.equal(repeatedPairs(ciphertext), 216);

// Under solved p56's literal-F convention, an ordinary non-F ciphertext
// cannot decode to plaintext F (GP index zero). Both literal-table signs
// are source-fixed impossible at the following original p55 rune offsets.
const firstFViolation = sign => {
  for (let i = 1; i < ciphertext.length; i++) {
    const key = table[(p55Start + i - 1) % 256] % 29;
    if (ciphertext[i] !== 0 && (ciphertext[i] + sign * key + 29) % 29 === 0) {
      return i;
    }
  }
  return -1;
};
assert.equal(firstFViolation(-1), 20);
assert.equal(firstFViolation(1), 70);

// Discovery-sensitive control: hold *both* source-written zero addresses
// fixed while randomly permuting the other 254 actual printed bytes.
// Re-score all four original recipient classes for every shuffle.
let state = 0x33013301;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const free = Array.from({ length: 256 }, (_, i) => i)
  .filter(i => i !== 192 && i !== 229);
const bestOriginal = Math.max(...originalScores);
let atLeast = 0;
const shuffles = 8192;
for (let sample = 0; sample < shuffles; sample++) {
  const values = free.map(index => table[index]);
  for (let j = values.length - 1; j > 0; j--) {
    const k = random32() % (j + 1);
    [values[j], values[k]] = [values[k], values[j]];
  }
  const shuffled = table.slice();
  for (let j = 0; j < free.length; j++) shuffled[free[j]] = values[j];
  const bestNull = Math.max(...variants.map(([mode, sign]) =>
    repeatedPairs(decode(shuffled, mode, sign))));
  if (bestNull >= bestOriginal) atLeast++;
}
assert.equal(atLeast, 5331);
console.log(JSON.stringify({
  result: 'PASS', originalUnknownRunes: 12956,
  floralRunes: floral.reduce((n, p) => n + p.indices.length, 0),
  floralTransitions: 3301, firstFloralPageTransitions: 230,
  tableZeroPositions: [192, 229], p55ClockStart: p55Start,
  finalClockAfterText: 229, p55AtFirstZeroRune0: 39,
  p55FirstZeroIsInsideWord: zeroWord.word,
  originalKeyVariantPairCounts: originalScores,
  denominator: 76 * 75, nativeClearP57First76PairCount: 340,
  tableShuffleAtLeast: atLeast, tableShuffles: shuffles,
  matchedNullUpperTail: (atLeast + 1) / (shuffles + 1),
  literalFContradictionOffsets: [20, 70],
  recoveredUnknownPlaintext: false
}, null, 2));
