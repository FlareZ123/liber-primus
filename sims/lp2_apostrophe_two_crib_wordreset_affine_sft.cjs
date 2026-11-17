'use strict';

/**
 * Exact two-training-apostrophe gate for a shared word-reset affine GP29 cipher.
 * Run with Node.js 22: node sims/lp2_apostrophe_two_crib_wordreset_affine_sft.cjs
 * Reads only the existing original GP29 corpus and source-ink annotation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const marks = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-quote-punctuation-spans.json'), 'utf8'));
const original = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
assert.equal(original.length, 12956);
assert.deepEqual(marks.source_visible_apostrophes.map((record) => record.global_before_rune), [1110, 5138, 8515, 10089]);

const training = [
  { offset: 1107, expect: [19, 14, 10, 7], words: ['DONT', 'CANT', 'WONT', 'AINT', 'ISNT', 'LETS', 'GODS', 'ONES', 'MANS', 'MENS', 'SHED', 'YOUD', 'ALLS'] },
  { offset: 5136, expect: [25, 3, 26], words: ['ITS', 'HES', 'WED', 'HED', 'ITD', 'DOS'] }
];
for (const sample of training) {
  assert.deepEqual(original.slice(sample.offset, sample.offset + sample.expect.length), sample.expect);
}

const index = new Map(corpus.translit.map((glyph, i) => [glyph, i]));
/** @param {string} spelling */
function gp(spelling) {
  // All registered contractions use one rune per letter, with no digraph ambiguity.
  return Array.from(spelling, (letter) => {
    const symbol = index.get(letter);
    assert.notEqual(symbol, undefined);
    return symbol;
  });
}
/** @param {number} a @param {number} p @param {number} k */
const encrypt = (a, p, k) => (a * p + k) % 29;
/** @param {number} a @param {number} c @param {number} p */
const impliedKey = (a, c, p) => ((c - a * p) % 29 + 29) % 29;

/**
 * @param {number[]} cipher4
 * @param {number[]} cipher3
 * @returns {Array<{slope:number,word4:string,word3:string,firstFourKeys:number[]}>}
 */
function candidates(cipher4, cipher3) {
  const found = [];
  for (let slope = 1; slope <= 28; slope += 1) {
    for (const word4 of training[0].words) {
      const firstFourKeys = gp(word4).map((p, i) => impliedKey(slope, cipher4[i], p));
      for (const word3 of training[1].words) {
        const compatible = gp(word3).every((p, i) => impliedKey(slope, cipher3[i], p) === firstFourKeys[i]);
        if (compatible) found.push({ slope, word4, word3, firstFourKeys });
      }
    }
  }
  return found;
}

const actual = candidates(training[0].expect, training[1].expect);
assert.equal(actual.length, 0, 'No shared word-reset affine key can fit these two genuine training words');
// This witness confirms the enumerator can succeed on a genuine, fully reversible planted pair.
const plantedSlope = 11;
const plantedKey = Array.from({ length: 13 }, (_, i) => (5 * i + 3) % 29);
const planted4 = gp('DONT').map((p, i) => encrypt(plantedSlope, p, plantedKey[i]));
const planted3 = gp('ITS').map((p, i) => encrypt(plantedSlope, p, plantedKey[i]));
assert.ok(candidates(planted4, planted3).some((candidate) => candidate.slope === plantedSlope && candidate.word4 === 'DONT' && candidate.word3 === 'ITS'));
// Full 150-symbol source-native plaintext forward/inverse positive. Key repeats every 13 symbols.
// Its plaintext is obtained from the authentic solved 95-rune LP2 p57 PARABLE.
const clear = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(clear.length, 95);
const plant = Array.from({ length: 150 }, (_, i) => clear[i % clear.length]);
const cipher = plant.map((p, i) => encrypt(plantedSlope, p, plantedKey[i % 13]));
const inverseSlope = Array.from({ length: 29 }, (_, x) => x).find((x) => x * plantedSlope % 29 === 1);
assert.notEqual(inverseSlope, undefined);
const recovered = cipher.map((c, i) => (((c - plantedKey[i % 13]) * inverseSlope) % 29 + 29) % 29);
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  model: 'C = slope*P + K[word-local-j mod 13] (mod29); 13 independent key entries, slope 1..28',
  sourceOffsets: [1107, 5136],
  originalCipher: training.map((t) => t.expect),
  contractions: [training[0].words.length, training[1].words.length],
  enumeratedPairsAndSlopes: 13 * 6 * 28,
  matchingTrainingPairs: actual.length,
  possibleUnconstrainedKeyEntriesIfTrainingMatched: 9,
  sourceNativePositiveRecovered: recovered.length,
  decision: 'no compatible source-constrained training pair; blind heldouts must not be fitted'
}, null, 2));
