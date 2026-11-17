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
  construction: '377 independent state-conditioned GP29 bijections; 3/4 NG and 1/4 J -> previous ciphertext, all plaintext values remain representable',
  plantedInverseRecoveredRunes: 12901,
  model: 'C[i] = secretPermutation[(i%13), C[i-1]](P[i]), reset per physical page',
  blindOracle: 'exact maximum-likelihood independent 377-state unigram-permutation fit to unseen GP reference, no original plaintext crib',
  results: readings,
  conclusion: 'Source-original 13-phase all-secret Markov substitution yields no independently held-out GP English recovery; a fully bijective genuine-GP plant has similarly low adjacent repeats and a strong blind heldout language gain.'
}, null, 2));
console.log('PASS: all source original, 377 full bijections, English + rare-repeat plant, independent page holdouts');
