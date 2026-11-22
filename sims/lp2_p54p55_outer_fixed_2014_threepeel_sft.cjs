'use strict';

/**
 * Source-led geometry and core-only original-cipher obstruction for LP2 p54/p55.
 * Windows 11, Node.js 22: run as a single-file test in the repository root.
 *
 * This is a necessary-condition test, not a claimed LP2 decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const solved = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'
);
const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const cipher = [...p54.slice(-10), ...p55];
const lengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(cipher.length, 86);
assert.equal(p55.length, 76);
assert.equal(lengths.reduce((a, b) => a + b, 0), 86);
assert.equal(grid.bytes.length, 256);
assert.match(solved, /THE CIRCUMFERENCE PRACTICES THREE BEHAVIORS/);
assert.match(solved, /WE MUST SHED OUR OWN CIRCUMFERENCES/);

const gp = (xs) => xs.map((n) => corpus.translit[n]).join('');
const shells = [];
const cores = [];
const twoRuneWords = [];
const wholeWords = [];
let offset = 0;
for (const [wi, length] of lengths.entries()) {
  const word = cipher.slice(offset, offset + length);
  wholeWords.push(gp(word));
  shells.push(offset, offset + length - 1);
  for (let i = 1; i < length - 1; i++) cores.push(offset + i);
  if (length === 2) twoRuneWords.push({index: wi, word: gp(word)});
  offset += length;
}
assert.equal(offset, 86);
assert.equal(shells.length, 34);
assert.equal(cores.length, 52);
assert.equal(new Set([...shells, ...cores]).size, 86);
assert.deepEqual(twoRuneWords.map((v) => v.word), ['SB', 'XM', 'WR', 'EOE', 'THOE']);
assert.deepEqual(wholeWords.slice(-2), ['DJU', 'BEI']);

const ringLengths = [];
const innerDimensions = [];
for (let layer = 0; layer <= 3; layer++) {
  const height = 32 - 2 * layer;
  const width = 8 - 2 * layer;
  ringLengths.push(2 * (height + width) - 4);
  innerDimensions.push([height, width]);
}
assert.deepEqual(ringLengths, [76, 68, 60, 52]);
assert.deepEqual(innerDimensions[3], [26, 2]);
assert.equal(26 * 2, 52);
assert.equal(256 - 52, 204);
assert.equal(204, 34 * 6);

// An arbitrary reversible change on *every* strict core rune cannot
// change the five two-rune words. An otherwise unrestricted decoder
// acting exclusively on cores has the same fixed-word invariant.
const testPlain = cipher.map((value, index) => cores.includes(index) ? (value + 1) % 29 : value);
const reencrypted = testPlain.map((value, index) => cores.includes(index) ? (value + 28) % 29 : value);
assert.deepEqual(reencrypted, cipher);
offset = 0;
const unchangedTwoRuneWords = [];
for (const [wi, length] of lengths.entries()) {
  if (length === 2) {
    assert.deepEqual(testPlain.slice(offset, offset + length), cipher.slice(offset, offset + length));
    unchangedTwoRuneWords.push(wi);
  }
  offset += length;
}
assert.equal(unchangedTwoRuneWords.length, 5);
assert.equal(p57.length, 95);

// One frozen complete 86-rune original-cipher test. The words THREE (4 GP),
// CONSUMPTION (10 GP), PRESERVATION (11 GP), ADHERENCE (9 GP) are authentic
// LP1 terminology. Their 34-rune concatenation is a candidate shell key.
// The named DIVINITY (8 GP) is an existing solved LP1 Vigenere keyword;
// this provisional *direct additive* GP29 reading does not implement its
// separate plaintext-F-bypass convention.
const keyNames = [
  ['TH', 'R', 'E', 'E'],
  ['C', 'O', 'N', 'S', 'U', 'M', 'P', 'T', 'IA', 'N'],
  ['P', 'R', 'E', 'S', 'E', 'R', 'U', 'A', 'T', 'IA', 'N'],
  ['A', 'D', 'H', 'E', 'R', 'E', 'N', 'C', 'E']
];
const shellKey = keyNames.flat().map((x) => corpus.translit.indexOf(x));
const coreKey = ['D', 'I', 'U', 'I', 'N', 'I', 'T', 'Y']
  .map((x) => corpus.translit.indexOf(x));
assert.equal(shellKey.length, 34);
assert.equal(coreKey.length, 8);
assert.ok(shellKey.every((n) => n >= 0) && coreKey.every((n) => n >= 0));
const shifts = Array(86).fill(null);
shells.forEach((position, i) => { shifts[position] = shellKey[i]; });
cores.forEach((position, i) => { shifts[position] = coreKey[i % 8]; });
assert.equal(shifts.filter((value) => value === null).length, 0);
const decode = (values) => values.map((value, i) => (value + 29 - shifts[i]) % 29);
const encode = (values) => values.map((value, i) => (value + shifts[i]) % 29);
const fullCandidate = decode(cipher);
assert.deepEqual(encode(fullCandidate), cipher);
assert.deepEqual(decode(encode(p57.slice(0, 86))), p57.slice(0, 86));
let current = 0;
const fullCandidateWords = lengths.map((length) => {
  const word = gp(fullCandidate.slice(current, current + length));
  current += length;
  return word;
});
assert.deepEqual(
  [2, 3, 6, 10, 13].map((index) => fullCandidateWords[index]),
  ['IX', 'CR', 'NA', 'JD', 'HX']
);
const candidateIoC = (() => {
  const counts = Array(29).fill(0);
  fullCandidate.forEach((value) => { counts[value]++; });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (86 * 85);
})();


// A second exact, all-secret original-word obstruction: the 13th whole
// terminal word is the seven-GP-rune pattern A B C D D A B. Any arbitrary
// per-word GP29 monoalphabetic bijection preserves this equality pattern.
// Test the existing pinned native-English TextBlob lexicon, allowing all
// legal GP multi-rune segmentations and both historical letter folds.
const anomalousWord = cipher.slice(65, 72);
assert.deepEqual(anomalousWord, [18, 15, 12, 2, 2, 18, 15]);
assert.equal(gp(anomalousWord), 'ESEOTHTHES');
/** @param {number[]} values @returns {number[]} */
function ranks(values) {
  const seen = new Map();
  return values.map((value) => {
    if (!seen.has(value)) seen.set(value, seen.size);
    return seen.get(value);
  });
}
const originalEqualityPattern = ranks(anomalousWord);
assert.deepEqual(originalEqualityPattern, [0, 1, 2, 3, 3, 0, 1]);
const compounds = ['ING', 'TH', 'NG', 'AE', 'OE', 'EA', 'EO', 'IA', 'IO'];
/** @param {string} spelling @param {number[]} wanted @param {boolean} folded @returns {boolean} */
function canMatchWord(spelling, wanted, folded) {
  const text = folded ? spelling.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S') : spelling;
  const cache = new Map();
  /**
   * @param {number} position
   * @param {number} count
   * @param {string[]} types
   * @returns {boolean}
   */
  function visit(position, count, types) {
    if (count > wanted.length || count + text.length - position < wanted.length) return false;
    if (count === wanted.length) return position === text.length;
    if (position === text.length) return false;
    const cacheKey = position + ':' + count + ':' + types.join(',');
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const options = [text[position], ...compounds.filter((v) => text.startsWith(v, position))];
    for (const token of options) {
      const oldRank = types.indexOf(token);
      const rank = oldRank < 0 ? types.length : oldRank;
      if (rank !== wanted[count]) continue;
      const newTypes = oldRank < 0 ? [...types, token] : types;
      if (visit(position + token.length, count + 1, newTypes)) {
        cache.set(cacheKey, true);
        return true;
      }
    }
    cache.set(cacheKey, false);
    return false;
  }
  return visit(0, 0, []);
}
const textblob = fs.readFileSync(
  path.join(__dirname, '../resources/control/english_wordfreq_textblob.txt'), 'utf8');
const lexicon = [...new Set(textblob.split(/\r?\n/).filter((line) =>
  line && !line.startsWith(';')).map((line) => line.split(/\s+/)[0].toUpperCase())
  .filter((word) => /^[A-Z]+$/.test(word)))];
assert.equal(lexicon.length, 29157);
const plausible = lexicon.filter((word) => word.length >= 7 && word.length <= 28);
const allSecretsHits = plausible.filter((word) =>
  canMatchWord(word, originalEqualityPattern, false) ||
  canMatchWord(word, originalEqualityPattern, true));
assert.equal(allSecretsHits.length, 0);
// The solver is capable of accepting a real English word pattern: CRITTER
// contains seven single-GP symbols with two consecutive T glyphs.
const critterPattern = [0, 1, 2, 3, 3, 4, 1];
assert.ok(canMatchWord('CRITTER', critterPattern, false));
assert.ok(lexicon.includes('CRITTER'));

console.log(JSON.stringify({
  source: 'LP1 p10 THREE BEHAVIORS; LP2 p57 SHED; original p49-p51 32x8 table; p54-last10+p55',
  originalRunes: cipher.length,
  fullWordLengths: lengths,
  fullWords: wholeWords,
  wordInteriors: cores.length,
  wordExteriors: shells.length,
  twoRuneWords,
  nestedRingPerimeters: ringLengths,
  threePeelDimensions: innerDimensions[3],
  outerThreeLayers: 204,
  originalPage55Runes: p55.length,
  boundaryMismatch: 'p55 76-page tape is not the cross-page 86-complete-word tape',
  coreOnlyImmutableWords: unchangedTwoRuneWords.length,
  originalForwardReplay: '86/86',
  allSecretWord13Pattern: {sourceWord: 'ESEOTHTHES', sourceOffsets: [65, 71],
    equalityPattern: originalEqualityPattern,
    textblobEnglishWords: lexicon.length,
    possibleEnglishMatchesUnderAnyPerWordGP29Bijection: allSecretsHits.length,
    authenticEnglishPositive: 'CRITTER'},
  threeBehaviorsCandidate: {shellKeyRunes: shellKey.length, coreKeyPeriod: coreKey.length,
    provisionalDirectAdditive: true, plainWords: fullCandidateWords,
    decodedIoC: candidateIoC, originalForwardReplay: '86/86',
    nativeP57DonorRoundTrip: '86/86', status: 'nonlinguistic, rejected'},
  result: 'Any strict core-only value transform leaves five entire ciphertext words fixed. Full native-GP decoding requires changing their endpoints, a separate exterior decoder, or independently justified non-prose shell semantics.'
}, null, 2));
