'use strict';

/**
 * Source-original LP2 13-phase / previous-ciphertext, arbitrary 29-way
 * bijective-substitution decoder. Independent native-GP low-doublet plant.
 *
 * node sims/lp2_prev_c_state13_allsecret_english_holdout_sft.cjs
 * Read only, Node.js 22 / CommonJS, no third-party libraries.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length)
  .map((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);
const runeTokens = corpus.translit.map((rune, value) => ({rune, value}))
  .sort((a, b) => b.rune.length - a.rune.length);

/** @param {string} content @returns {number[]} */
function nativeGP(content) {
  const output = [];
  const normalized = content.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let pos = 0; pos < word.length;) {
      const token = runeTokens.find((r) => word.startsWith(r.rune, pos));
      assert.ok(token, 'original English rune encoding');
      output.push(token.value);
      pos += token.rune.length;
    }
  }
  return output;
}
const reference = nativeGP(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(reference.length, 63114);
const freq = Array(29).fill(5);
for (const x of reference) freq[x]++;
const totalFreq = freq.reduce((a, b) => a + b, 0);
const logProb = freq.map((v) => Math.log(v / totalFreq));
const plaintextRank = Array.from({length: 29}, (_, i) => i)
  .sort((a, b) => logProb[b] - logProb[a] || a - b);

let seed = 0x33011313;
/** @returns {number} Deterministic full-word xorshift32. */
function draw() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const phases = 13;
const stateCount = phases * 29;
const rareNG = corpus.translit.indexOf('NG');
const rarerJ = corpus.translit.indexOf('J');
assert.equal(rareNG, 21);
assert.equal(rarerJ, 11);
assert.ok(freq[rarerJ] < freq[rareNG]);

// Each of 377 secret states has its own wholly arbitrary *bijection*. One
// low-frequency native GP letter is mapped to the predecessor ciphertext
// rune itself. This makes C_i=C_(i-1) rare for ordinary prose, without
// removing plaintext options or adding a side channel.
//
// Source-fixed ratio 3/4 maps NG to the predecessor; 1/4 maps J. No table
// entry is selected to match an observed original ciphertext rune.
const maps = Array.from({length: stateCount}, (_, state) => {
  const previous = state % 29;
  const values = Array.from({length: 29}, (_, i) => i);
  for (let i = values.length - 1; i > 0; i--) {
    const selected = draw() % (i + 1);
    [values[i], values[selected]] = [values[selected], values[i]];
  }
  const rare = draw() % 4 === 0 ? rarerJ : rareNG;
  const from = values.indexOf(previous);
  [values[from], values[rare]] = [values[rare], values[from]];
  assert.equal(values[rare], previous);
  assert.deepEqual([...values].sort((a, b) => a - b),
    Array.from({length: 29}, (_, i) => i));
  return values;
});
const inverses = maps.map((map) => {
  const inv = new Uint8Array(29);
  for (let p = 0; p < 29; p++) inv[map[p]] = p;
  return inv;
});

let cursor = 1200;
const planted = [];
for (const original of pages) {
  const sourcePlain = reference.slice(cursor, cursor + original.length);
  cursor += original.length;
  assert.equal(sourcePlain.length, original.length);
  // First cipher rune is an arbitrary fixed published source IV. The
  // model has no data/operation for page-initial positions.
  const cipher = [original[0]];
  for (let i = 1; i < sourcePlain.length; i++) {
    const state = (i % phases) * 29 + cipher[i - 1];
    cipher.push(maps[state][sourcePlain[i]]);
  }
  for (let i = 1; i < cipher.length; i++) {
    const state = (i % phases) * 29 + cipher[i - 1];
    assert.equal(inverses[state][cipher[i]], sourcePlain[i]);
  }
  planted.push(cipher);
}
assert.equal(planted.flat().length, 12956);

/** @param {number[][]} body */
function repeatCount(body) {
  let repeats = 0;
  for (const page of body) for (let i = 1; i < page.length; i++)
    repeats += Number(page[i] === page[i - 1]);
  return repeats;
}
const originalRepeats = repeatCount(pages);
const plantedRepeats = repeatCount(planted);
assert.equal(originalRepeats, 86);
assert.equal(plantedRepeats, 78);

// Independent original-printed-word five-lag test: the counter is not
// optimized to this known anomaly, preserving future discriminability.
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
/** @param {number[][]} body */
function fiveBack(body) {
  const stream = body.flat();
  let start = 0, slots = 0, matches = 0;
  for (const word of words) {
    for (let delta = 5; delta < word.length; delta++) {
      slots++;
      matches += Number(stream[start + delta] === stream[start + delta - 5]);
    }
    start += word.length;
  }
  assert.equal(start, stream.length);
  assert.equal(slots, 2105);
  return {slots, matches};
}
const originalFiveBack = fiveBack(pages);
const plantedFiveBack = fiveBack(planted);
assert.equal(originalFiveBack.matches, 104);

/** @param {number[][]} body */
function gapCorrelation(body) {
  const sites = [];
  let start = 0;
  for (const page of body) {
    for (let i = 1; i < page.length; i++)
      if (page[i] === page[i - 1]) sites.push(start + i);
    start += page.length;
  }
  const gaps = sites.slice(1).map((x, i) => x - sites[i]);
  const left = gaps.slice(0, -1), right = gaps.slice(1);
  const avgL = left.reduce((a, b) => a + b, 0) / left.length;
  const avgR = right.reduce((a, b) => a + b, 0) / right.length;
  let numerator = 0, varianceL = 0, varianceR = 0;
  for (let i = 0; i < left.length; i++) {
    const a = left[i] - avgL, b = right[i] - avgR;
    numerator += a * b;
    varianceL += a * a;
    varianceR += b * b;
  }
  return {repeatSites: sites.length,
    adjacentGapPearson: numerator / Math.sqrt(varianceL * varianceR)};
}
const originalGaps = gapCorrelation(pages);
const plantedGaps = gapCorrelation(planted);

// The preceding positive uses genuine contiguous source GP English but places
// its original English word boundaries at unrelated printed LP2 word breaks.
// Evaluate the crucial original word-role evidence with ANOTHER genuine
// source-native plant, sampled from actual Gibran words of precisely the
// 2,896 original printed word lengths. Preserve rune count, word positions,
// page-carry positions and all state rules unchanged.
const normalizedWords = read('resources/control/gibran_prophet_58585.txt')
  .toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
  .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
const sourceWords = Array.from({length: 32}, () => []);
for (const word of normalizedWords) {
  const decoded = [];
  for (let i = 0; i < word.length;) {
    const token = runeTokens.find((x) => word.startsWith(x.rune, i));
    assert.ok(token);
    decoded.push(token.value);
    i += token.rune.length;
  }
  sourceWords[decoded.length].push(decoded);
}
let wordSeed = 0x33012113;
/** @returns {number} Independent native-word sample PRNG. */
function wordDraw() {
  wordSeed ^= wordSeed << 13;
  wordSeed ^= wordSeed >>> 17;
  wordSeed ^= wordSeed << 5;
  return wordSeed >>> 0;
}
const wordAlignedPlain = words.flatMap((word) => {
  const choices = sourceWords[word.length];
  assert.ok(choices.length, 'must have authentic English word for every original length');
  return choices[wordDraw() % choices.length];
});
assert.equal(wordAlignedPlain.length, 12956);
let usedNative = 0;
const shapeMatchedPlant = pages.map((original) => {
  const plain = wordAlignedPlain.slice(usedNative, usedNative + original.length);
  usedNative += original.length;
  const cipher = [original[0]];
  for (let i = 1; i < plain.length; i++)
    cipher.push(maps[(i % phases) * 29 + cipher[i - 1]][plain[i]]);
  for (let i = 1; i < plain.length; i++)
    assert.equal(inverses[(i % phases) * 29 + cipher[i - 1]][cipher[i]], plain[i]);
  return cipher;
});
assert.equal(usedNative, 12956);

const wordStarts = new Uint8Array(12956);
const wordEnds = new Uint8Array(12956);
let wordPosition = 0;
for (const word of words) {
  wordStarts[wordPosition] = 1;
  wordEnds[wordPosition + word.length - 1] = 1;
  wordPosition += word.length;
}
assert.equal(wordPosition, 12956);
/** @param {number[][]} body */
function repeatRoles(body) {
  const found = {all: 0, starts: 0, ends: 0, interior: 0};
  let cursor = 0;
  for (const page of body) {
    for (let i = 1; i < page.length; i++) {
      if (page[i] !== page[i - 1]) continue;
      const absolute = cursor + i;
      found.all++;
      found.starts += wordStarts[absolute];
      found.ends += wordEnds[absolute];
      found.interior += Number(!wordStarts[absolute] && !wordEnds[absolute]);
    }
    cursor += page.length;
  }
  return found;
}
const originalRoles = repeatRoles(pages);
const wordAlignedRoles = repeatRoles(shapeMatchedPlant);
assert.deepEqual(originalRoles, {all: 86, starts: 23, ends: 19, interior: 44});
assert.deepEqual(wordAlignedRoles, {all: 113, starts: 7, ends: 75, interior: 31});
const wordAlignedFiveBack = fiveBack(shapeMatchedPlant);
const wordAlignedGaps = gapCorrelation(shapeMatchedPlant);
assert.equal(wordAlignedFiveBack.matches, 82);

// A *key-independent* necessary condition for every repeat in the frozen
// rare-NG/J cipher is P[i] in {NG,J}. If word boundaries are transported
// literally, 23 original repeat sites at word starts require at least 23
// source-English words beginning with NG or J out of the original 2,896.
// No contiguous matching-length English controls in the 3 pinned corpora
// attain 23 such word starts, independent of the 377 secret tables.
/**
 * @param {string} prose
 * @returns {{words:number,windows:number,highest:number,total:number,atLeast23:number}}
 */
function scanRareWordStarts(prose) {
  const normalized = prose.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const symbols = (normalized.match(/[A-Z]+/g) || []).map((word) => {
    const rune = runeTokens.find((token) => word.startsWith(token.rune));
    assert.ok(rune);
    return Number(rune.value === rareNG || rune.value === rarerJ);
  });
  let total = symbols.reduce((a, b) => a + b, 0);
  const windowSize = words.length;
  let count = symbols.slice(0, windowSize).reduce((a, b) => a + b, 0);
  let highest = count, atLeast23 = Number(count >= 23);
  for (let i = 1; i + windowSize <= symbols.length; i++) {
    count += symbols[i + windowSize - 1] - symbols[i - 1];
    highest = Math.max(highest, count);
    atLeast23 += Number(count >= 23);
  }
  return {
    words: symbols.length, windows: symbols.length - windowSize + 1,
    highest, total, atLeast23
  };
}
const wordStartSources = {
  gibran: scanRareWordStarts(read('resources/control/gibran_prophet_58585.txt')),
  shakespeare: scanRareWordStarts(read('resources/control/shakespeare_first300k.txt')),
  emerson: scanRareWordStarts(read('resources/control/emerson_essays_2944.txt'))
};
assert.deepEqual([
  wordStartSources.gibran.highest, wordStartSources.shakespeare.highest,
  wordStartSources.emerson.highest], [22, 13, 18]);
assert.deepEqual([
  wordStartSources.gibran.windows, wordStartSources.shakespeare.windows,
  wordStartSources.emerson.windows], [12838, 52512, 75037]);
for (const control of Object.values(wordStartSources))
  assert.equal(control.atLeast23, 0);

// Exactly maximize the full per-state unigram likelihood over all 29!
// possible secret substitutions, WITHOUT enumerating 29! possibilities:
// the rearrangement inequality pairs ciphertext-frequency ranks with
// independently established plaintext-frequency ranks. Every one of the
// 377 secret mappings is estimated from training-page emissions only.
// Test pages are strictly heldout: no refitting, phase alignment or crib.
/**
 * @param {number[][]} body
 * @param {(j:number)=>boolean} trainPage
 */
function blindDecrypt(body, trainPage) {
  const tr = Array.from({length: stateCount}, () => new Int16Array(29));
  const te = Array.from({length: stateCount}, () => new Int16Array(29));
  let trainN = 0, holdN = 0, raw = 0;
  for (let page = 0; page < body.length; page++) {
    for (let i = 1; i < body[page].length; i++) {
      const state = (i % phases) * 29 + body[page][i - 1];
      const output = body[page][i];
      if (trainPage(page)) {
        tr[state][output]++;
        trainN++;
      } else {
        te[state][output]++;
        holdN++;
        raw += logProb[output];
      }
    }
  }
  let fit = 0, held = 0;
  for (let state = 0; state < stateCount; state++) {
    const ciphertextRank = Array.from({length: 29}, (_, i) => i)
      .sort((a, b) => tr[state][b] - tr[state][a] || a - b);
    for (let rank = 0; rank < 29; rank++) {
      const c = ciphertextRank[rank], p = plaintextRank[rank];
      fit += tr[state][c] * logProb[p];
      held += te[state][c] * logProb[p];
    }
  }
  assert.equal(trainN + holdN, 12901);
  return {
    training: trainN,
    heldout: holdN,
    fittedTrainNatsPerRune: fit / trainN,
    decodedHeldoutNatsPerRune: held / holdN,
    unchangedHeldoutNatsPerRune: raw / holdN,
    gainNatsPerRune: (held - raw) / holdN
  };
}
const splits = [
  ['even-pages-train', (j) => j % 2 === 0,
    6314, 6587, 0.011054295336685841, 0.6311132768452224],
  ['first28-pages-train', (j) => j < 28,
    6733, 6168, 0.0017945623859899295, 0.6456254037373609],
  ['odd-pages-train', (j) => j % 2 === 1,
    6587, 6314, NaN, NaN]
];
const readings = [];
for (const [name, train, ntr, nte, sourceGain, plantGain] of splits) {
  const original = blindDecrypt(pages, train);
  const genuineEnglishPlant = blindDecrypt(planted, train);
  assert.equal(original.training, ntr);
  assert.equal(original.heldout, nte);
  if (Number.isFinite(sourceGain))
    assert.ok(Math.abs(original.gainNatsPerRune - sourceGain) < 1e-10);
  if (Number.isFinite(plantGain))
    assert.ok(Math.abs(genuineEnglishPlant.gainNatsPerRune - plantGain) < 1e-10);
  assert.ok(genuineEnglishPlant.gainNatsPerRune > 0.55);
  assert.ok(original.gainNatsPerRune < 0.08);
  readings.push({name, original, genuineEnglishPlant});
}
console.log(JSON.stringify({
  originalRunes: 12956, originalSuccessors: 12901, keyedStates: 377,
  originalRepeats, plantedRepeats,
  originalFiveBack, plantedFiveBack, originalGaps, plantedGaps,
  originalRoles, wordAlignedRoles, wordAlignedFiveBack, wordAlignedGaps,
  keyIndependentWordStartRareSourceWindowControls: wordStartSources,
  sourceWordShapeMatchedNativePlantGain: blindDecrypt(shapeMatchedPlant, (j) => j % 2 === 0),
  construction: '377 independent state-conditioned GP29 bijections; 3/4 NG and 1/4 J -> previous ciphertext, all plaintext values remain representable',
  plantedInverseRecoveredRunes: 12901,
  model: 'C[i] = secretPermutation[(i%13), C[i-1]](P[i]), reset per physical page',
  blindOracle: 'exact maximum-likelihood independent 377-state unigram-permutation fit to unseen GP reference, no original plaintext crib',
  results: readings,
  conclusion: 'Source-original 13-phase all-secret Markov substitution yields no independently held-out GP English recovery; a fully bijective genuine-GP plant has similarly low adjacent repeats and a strong blind heldout language gain.'
}, null, 2));
console.log('PASS: all source original, 377 full bijections, English + rare-repeat plant, independent page holdouts');
