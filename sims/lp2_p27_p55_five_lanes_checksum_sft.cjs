'use strict';

/**
 * Original-source, frozen 5×43 parity test for Director #582.
 *
 * LP2 physical p27 has a 19-rune red title and 215 following runes.
 * Read its 215 body runes in printed order as five rows of 43.
 * Compare each of the 43 column sums modulo 29 against the strictly
 * interior runes of the 16 complete words on physical p55, with the
 * incoming one-rune p54 carry excluded. Also compare native GP prime
 * weight sums mod29. No searching, permutations, alternative phases or
 * partial keys. Complete SFT with original controls, Node.js CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const split = read('resources/liber-primus/lp2-transcription.txt').split('%');
const p27 = c.pages[27].indices;
const p55 = c.pages[55].indices;
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
const encode = new Map(c.runes.map((r, i) => [r, i]));

/** @param {number} physical */
function originalPrint(physical) {
  const piece = split[physical < 50 ? physical : physical - 1];
  const indices = [...piece].filter((ch) => encode.has(ch)).map((ch) => encode.get(ch));
  assert.deepEqual(indices, c.pages[physical].indices);
  return piece;
}

const title = p27.slice(0, 19);
assert.equal(title.length, 19);
originalPrint(27);
const p27body = p27.slice(19);
assert.equal(p27body.length, 215);

const p55raw = originalPrint(55);
const entireWords = p55raw
  .replace(/[^\u16A0-\u16FF.-]/gu, '')
  .split(/[-.]/g)
  .filter(Boolean);
assert.equal(entireWords.length, 17, 'One carry fragment followed by sixteen complete words');
assert.equal(entireWords[0], c.runes[p55[0]], 'The first rune continues the p54 word');
const words = entireWords.slice(1);
const wordLengths = words.map((word) => [...word].length);
assert.deepEqual(wordLengths, [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(words.flatMap((word) => [...word]).join(''), p55.slice(1).map((i) => c.runes[i]).join(''));

const interiorOffsets = [];
let at = 1;
for (const len of wordLengths) {
  for (let j = 1; j < len - 1; j++) interiorOffsets.push(at + j);
  at += len;
}
assert.equal(at, 76);
assert.equal(interiorOffsets.length, 43);
assert.equal(76 - interiorOffsets.length, 33);

const interiors = interiorOffsets.map((i) => p55[i]);
/**
 * Frozen source order, 5 contiguous rows × 43 columns.
 * @param {number[]} body
 * @param {number[]} values
 * @returns {number[]}
 */
function parity(body, values) {
  assert.equal(body.length, 215);
  return Array.from({length: 43}, (_, column) => {
    let sum = 0;
    for (let row = 0; row < 5; row++) sum += values[body[row * 43 + column]];
    return sum % 29;
  });
}

/** @param {number[]} target @param {number[]} calculated */
function residual(target, calculated) {
  return target.map((value, i) => (value - calculated[i] + 29) % 29);
}

const gpValue = c.runes.map((_, i) => i);
const primeValue = c.prime;
const expectedIndex = parity(p27body, gpValue);
const expectedPrime = parity(p27body, primeValue);
const differenceIndex = residual(interiors, expectedIndex);
const differencePrime = residual(interiors.map((i) => primeValue[i] % 29), expectedPrime);
const indexMatches = differenceIndex.flatMap((v, i) => v === 0 ? [i] : []);
const primeMatches = differencePrime.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(indexMatches, [30]);
assert.deepEqual(primeMatches, [16, 35]);

// A planted exact five-share parity receiver checks arithmetic and order.
const solvedSourceGP = c.pages[57].indices;
assert.equal(solvedSourceGP.length, 95);
const syntheticBody = Array.from({length: 215}, (_, i) => solvedSourceGP[i % solvedSourceGP.length]);
const syntheticTarget = parity(syntheticBody, gpValue);
assert.equal(residual(syntheticTarget, parity(syntheticBody, gpValue)).filter((x) => x === 0).length, 43);

// Independent actual-language negative control for accidental GP-index equality.
const englishControl = residual(solvedSourceGP.slice(0, 43), expectedIndex);
assert.equal(englishControl.filter((x) => x === 0).length, 4);

console.log(JSON.stringify({
  source: 'p27 original 215 post-title GP runes → five consecutive 43-rune rows; p55 43 strict interiors',
  titleIndices: title,
  p55CompleteWordLengths: wordLengths,
  p55InteriorOffsets: interiorOffsets,
  p55InteriorIndices: interiors,
  fiveRowGpIndexParity: expectedIndex,
  gpIndexResidualsMod29: differenceIndex,
  gpIndexMatchingColumnsZeroBased: indexMatches,
  fiveRowPrimeWeightParity: expectedPrime,
  primeWeightResidualsMod29: differencePrime,
  primeWeightMatchingColumnsZeroBased: primeMatches,
  expectedUniformMatches: 43 / 29,
  independentSolvedP57ReferenceMatches: 4,
  syntheticParityPlant: '43/43 exact',
  decision: 'No original 43-column checksum relation; frozen two source-native families fail'
}, null, 2));
