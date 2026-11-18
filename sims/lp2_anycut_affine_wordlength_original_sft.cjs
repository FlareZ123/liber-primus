'use strict';

/**
 * Original LP2 necessary-condition gate: any segmentation, any independently
 * chosen GF29 affine substitution per resulting word, with original rune order.
 *
 * Source-native GP English is a conditional reference register. This is an
 * exclusion of that declared model rather than a claim about actual plaintext.
 *
 * Windows 11 / Node.js 22: run this file directly from the repository root or
 * by its own path. The test is read-only and has no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const load = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const book = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const transcription = load('resources/liber-primus/lp2-transcription.txt');
const wordFrequency = load('resources/control/english_wordfreq_textblob.txt');
const runeSet = new Set(book.runes);
const sourceTape = book.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
/** @param {number} n @returns {number} */
const mod29 = (n) => (n % 29 + 29) % 29;
const inverse = Array.from({ length: 29 }, (_, x) => {
  for (let i = 1; i < 29; i += 1) if (mod29(x * i) === 1) return i;
  return 0;
});

/** @type {[string, number][]} */
const tokens = [
  ['ING', 21], ['NG', 21], ['IO', 27],
  ...book.translit.map((name, index) => /** @type {[string,number]} */ ([name, index]))
    .filter(([name]) => name !== 'IA'),
].sort((a, b) => b[0].length - a[0].length);

/**
 * Follow the already-established TextBlob GP reference orthography.
 * @param {string} spelling
 * @returns {number[] | null}
 */
function encodeEnglish(spelling) {
  const input = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  /** @type {number[]} */
  const word = [];
  for (let i = 0; i < input.length;) {
    const token = tokens.find(([part]) => input.startsWith(part, i));
    if (!token) return null;
    word.push(token[1]);
    i += token[0].length;
  }
  return word;
}

/**
 * A complete invariant under C_i = a * P_i + b (mod 29), a != 0.
 * The first nonzero difference fixes scale; the first symbol fixes origin.
 * @param {number[]} word
 * @returns {string}
 */
function affineSignature(word) {
  assert(word.length > 0);
  const first = word[0];
  const pivot = word.findIndex((x, i) => i > 0 && x !== first);
  if (pivot === -1) return 'constant:' + word.length;
  const scale = inverse[mod29(word[pivot] - first)];
  assert(scale > 0);
  return word.map((x) => mod29((x - first) * scale)).join(',');
}

/** @param {number[]} word @returns {string} */
function equalityPattern(word) {
  /** @type {Map<number, number>} */
  const values = new Map();
  let next = 0;
  return word.map((x) => {
    if (!values.has(x)) values.set(x, next++);
    return values.get(x);
  }).join(',');
}

const originalWords = transcription.replace(/[\/\n%&$§]/g, '').split(/[-.]/)
  .map((str) => Array.from(str).filter((rune) => runeSet.has(rune))
    .map((rune) => book.runes.indexOf(rune)))
  .filter((word) => word.length)
  .slice(0, 2896);
assert.equal(originalWords.length, 2896);
assert.equal(sourceTape.length, 12956);
assert.deepEqual(originalWords.flat(), sourceTape);

/** @type {Set<string>[]} */
const wordShape = Array.from({ length: 15 }, () => new Set());
/** @type {Set<string>[]} */
const arbitrarySubstitutionShape = Array.from({ length: 15 }, () => new Set());
/** @type {Map<number, number[][]>} */
const wordsByLength = new Map();
let dictionaryCount = 0;
for (const line of wordFrequency.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const word = encodeEnglish(match[1]);
  if (!word || word.length > 14) continue;
  dictionaryCount += 1;
  wordShape[word.length].add(affineSignature(word));
  arbitrarySubstitutionShape[word.length].add(equalityPattern(word));
  if (!wordsByLength.has(word.length)) wordsByLength.set(word.length, []);
  wordsByLength.get(word.length).push(word);
}
assert.equal(dictionaryCount, 29088);

const matches = [];
for (let length = 5; length <= 14; length += 1) {
  let affineMatches = 0;
  let arbitraryPermutationMatches = 0;
  for (let start = 0; start + length <= sourceTape.length; start += 1) {
    const window = sourceTape.slice(start, start + length);
    if (wordShape[length].has(affineSignature(window))) affineMatches++;
    if (arbitrarySubstitutionShape[length].has(equalityPattern(window))) {
      arbitraryPermutationMatches++;
    }
  }
  matches.push({
    length,
    referenceWords: wordsByLength.get(length).length,
    distinctAffineShapes: wordShape[length].size,
    originalWindowCount: sourceTape.length - length + 1,
    affineMatches,
    arbitraryPermutationMatches,
    manuscriptWordCount: originalWords.filter((word) => word.length === length).length,
  });
}
assert.deepEqual(matches.map((x) => x.affineMatches), [1649, 73, 4, 0, 0, 0, 0, 0, 0, 0]);
assert.equal(matches[3].manuscriptWordCount, 156);
assert.equal(matches[9].manuscriptWordCount, 3);
assert.equal(matches[9].arbitraryPermutationMatches, 32);

/**
 * Full unknown per-word 29! bijection gate in the source-defined pp23–26
 * page group. Equality patterns are exactly invariant under a fixed secret
 * permutation within each word. The complete scan permits arbitrary movement
 * of the word's start without changing source rune order or group boundary.
 */
const pageStarts = new Map();
let cumulativeRunes = 0;
for (const page of book.pages.filter((p) => p.page <= 55)) {
  pageStarts.set(page.page, cumulativeRunes);
  cumulativeRunes += page.indices.length;
}
assert.equal(cumulativeRunes, sourceTape.length);
const groupStart = pageStarts.get(23);
const groupEnd = pageStarts.get(27);
assert.equal(groupEnd - groupStart, 1021);
const groupFourteenWordStarts = [];
let printedOffset = 0;
for (const word of originalWords) {
  if (printedOffset >= groupStart && printedOffset + word.length <= groupEnd &&
      word.length === 14) groupFourteenWordStarts.push(printedOffset);
  printedOffset += word.length;
}
assert.deepEqual(groupFourteenWordStarts, [6035]);

let groupFourteenPossibleWindows = 0;
for (let offset = groupStart; offset + 14 <= groupEnd; offset += 1) {
  if (arbitrarySubstitutionShape[14].has(
    equalityPattern(sourceTape.slice(offset, offset + 14)))) {
    groupFourteenPossibleWindows += 1;
  }
}
assert.equal(groupFourteenPossibleWindows, 0);

// A genuine GP-native 14-rune word remains recognizable under a hidden,
// independently selected bijection with a nonaffine symbol swap.
const nativeFourteen = wordsByLength.get(14)[0];
const plantedSecretAlphabet = Array.from({ length: 29 },
  (_, index) => mod29(7 * index + 5));
[plantedSecretAlphabet[0], plantedSecretAlphabet[1]] =
  [plantedSecretAlphabet[1], plantedSecretAlphabet[0]];
assert.equal(new Set(plantedSecretAlphabet).size, 29);
const codedFourteen = nativeFourteen.map((index) => plantedSecretAlphabet[index]);
assert.equal(equalityPattern(codedFourteen), equalityPattern(nativeFourteen));
assert(arbitrarySubstitutionShape[14].has(equalityPattern(codedFourteen)));
const decodeAlphabet = Array.from({ length: 29 }, () => -1);
plantedSecretAlphabet.forEach((value, index) => { decodeAlphabet[value] = index; });
assert.deepEqual(codedFourteen.map((index) => decodeAlphabet[index]),
  nativeFourteen);

// Strong positive plant: every original word length occurs exactly once, but
// the printed length order is permuted; independently keyed affine ciphertext
// stays contiguous within words. Every word must pass the same signature oracle.
let recovered = 0;
let plaintextLength = 0;
const seenOriginalLengthIndices = new Set();
for (let i = 0; i < originalWords.length; i += 1) {
  const sourceWordIndex = (17 * i) % originalWords.length;
  seenOriginalLengthIndices.add(sourceWordIndex);
  const length = originalWords[sourceWordIndex].length;
  const pool = wordsByLength.get(length);
  assert(pool && pool.length);
  const plain = pool[(19 * i + 13) % pool.length];
  const a = 1 + (3 * i) % 28;
  const b = (7 * i + 11) % 29;
  const cipher = plain.map((x) => mod29(a * x + b));
  const decoded = cipher.map((x) => mod29(inverse[a] * (x - b)));
  assert.deepEqual(decoded, plain);
  assert(wordShape[length].has(affineSignature(cipher)));
  plaintextLength += plain.length;
  recovered += decoded.length;
}
assert.equal(seenOriginalLengthIndices.size, 2896);
assert.equal(plaintextLength, 12956);
assert.equal(recovered, 12956);

console.log(JSON.stringify({
  register: 'pinned native GP29 TextBlob English, 29,088 entries',
  scope: 'all original-rune-order contiguous windows, all 812 affine keys per word',
  sourceRunes: sourceTape.length,
  originalWords: originalWords.length,
  scanningIncludesOriginalPunctuationAndPageSeams: true,
  matches,
  arbitraryWordPermutationPageGroup: {
    pages: '23–26',
    runes: groupEnd - groupStart,
    retainedPrintedLength14WordStarts: groupFourteenWordStarts,
    everyPossibleLength14WindowCompatibleWithPinnedEnglish: groupFourteenPossibleWindows,
    secretAlphabetPlant: '29/29 exact arbitrary-bijection inverse'
  },
  positive: {
    keying: 'distinct per-word a and b; permuted original word-length sequence',
    exactCipherInverseRunes: recovered,
    exactLengthMultisetWords: seenOriginalLengthIndices.size
  },
  conclusion: 'Original length-8..14 windows exclude per-word affine source-native English under every cut. In physical pp23–26, even arbitrary secret per-word 29! bijections with freely moved cuts fail the pinned native-English 14-rune word requirement. Other language registers, changed group lengths and within-word rearrangements remain outside these gates.'
}, null, 2));
console.log('PASS: all-cut all-key GP29 affine-word structural exclusion and exact independent native-GP positive.');
