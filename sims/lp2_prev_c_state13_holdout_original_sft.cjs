'use strict';

/**
 * Original-LP2 direct plaintext attack, shared 13-phase previous-C additive key.
 * Hypothetical source lead: original 13-dot chapter marks and anti-repeat.
 * The original book does not specify this operation or any secret key.
 * Read-only single-file test: Node.js 22, from repository root.
 * node sims/lp2_prev_c_state13_holdout_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = source.pages.filter((p) => p.page <= 55 && p.indices.length)
  .map((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);

// Source-authenticated LP1/p57 GP English: ING and IO each one rune.
const tokens = [{s: 'ING', i: 21}, {s: 'IO', i: 27},
  ...source.translit.map((s, i) => ({s, i}))]
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} input @returns {number[]} Authentic GP29 inventory transliteration. */
function native(input) {
  const out = [];
  const normalized = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((item) => word.startsWith(item.s, i));
      assert.ok(token, 'GP29 encoder saw an unencodable token');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const control = native(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(control.length, 62492);
const counts = Array(29).fill(5);
for (const symbol of control) counts[symbol]++;
const sum = counts.reduce((a, b) => a + b, 0);
const logProbability = counts.map((f) => Math.log(f / sum));

let seed = 0x33011313;
/** @returns {number} Unsigned xorshift32 pseudorandom integer. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const periods = 13, alphabet = 29;
const secret = Array.from({length: periods * alphabet}, () => random() % alphabet);

// The true plant is an independent genuine-English source ciphertext.
// Encrypt under one *unknown-to-the-inference* fixed random set of 377 shifts.
// Its phase resets once at every physical-page boundary and conditions on
// the previous emitted ciphertext rune, exactly the model under test.
const positive = [];
let controlStart = 1200;
for (const original of pages) {
  const plain = control.slice(controlStart, controlStart + original.length);
  controlStart += original.length;
  assert.equal(plain.length, original.length);
  const cipher = [original[0]];
  for (let i = 1; i < original.length; i++) {
    const state = (i % periods) * alphabet + cipher[i - 1];
    cipher.push((plain[i] + secret[state]) % alphabet);
  }
  for (let i = 1; i < plain.length; i++) {
    const state = (i % periods) * alphabet + cipher[i - 1];
    assert.equal((cipher[i] - secret[state] + alphabet) % alphabet, plain[i]);
  }
  positive.push(cipher);
}
assert.equal(positive.flat().length, 12956);

/**
 * Estimate all 377 source-independent hidden phase/predecessor shifts by
 * maximizing authentic GP-English one-rune log likelihood on TRAIN PAGES.
 * Score independent HELDOUT PAGES without refitting any shift. This is
 * an actual decoder attack: candidate P_i = C_i - K[(i mod 13),C_(i-1)].
 *
 * @param {number[][]} blocks Full original runic pages or source-native plant.
 * @param {(pageIndex:number)=>boolean} trainPage Training selector, no state leaks.
 */
function attack(blocks, trainPage) {
  const training = Array.from({length: 377}, () => new Int16Array(29));
  const testing = Array.from({length: 377}, () => new Int16Array(29));
  let trainN = 0, testN = 0, baseline = 0;
  for (let page = 0; page < blocks.length; page++) {
    const block = blocks[page];
    for (let i = 1; i < block.length; i++) {
      const state = (i % periods) * alphabet + block[i - 1];
      const c = block[i];
      if (trainPage(page)) {
        training[state][c]++;
        trainN++;
      } else {
        testing[state][c]++;
        testN++;
        baseline += logProbability[c];
      }
    }
  }
  const inferred = new Int8Array(377);
  let fittedTraining = 0, decodedHeldout = 0;
  for (let state = 0; state < 377; state++) {
    let bestScore = -Infinity, keyShift = 0;
    for (let candidate = 0; candidate < alphabet; candidate++) {
      let score = 0;
      for (let c = 0; c < alphabet; c++) {
        score += training[state][c] *
          logProbability[(c - candidate + alphabet) % alphabet];
      }
      if (score > bestScore) {
        bestScore = score;
        keyShift = candidate;
      }
    }
    inferred[state] = keyShift;
    fittedTraining += bestScore;
    for (let c = 0; c < alphabet; c++) {
      decodedHeldout += testing[state][c] *
        logProbability[(c - keyShift + alphabet) % alphabet];
    }
  }
  assert.equal(trainN + testN, 12901);
  const gain = (decodedHeldout - baseline) / testN;
  return {
    trainingRunes: trainN,
    heldoutRunes: testN,
    fittedTrainingLogProbability: fittedTraining / trainN,
    heldoutDecodedLogProbability: decodedHeldout / testN,
    heldoutUndecodedLogProbability: baseline / testN,
    heldoutGainNatsPerRune: gain
  };
}
const splits = [
  ['alternating-pages', (j) => j % 2 === 0],
  ['first-half', (j) => j < 28],
  ['reverse-alternating-pages', (j) => j % 2 === 1]
];
const expected = [
  [-0.008279590245235056, 1.150034407935346, 6314, 6587],
  [0.04519704918433769, 1.11583431627775, 6733, 6168],
  [0.0015522243477472557, 1.1900167191352256, 6587, 6314]
];
const results = [];
for (let i = 0; i < splits.length; i++) {
  const [split, chooseTraining] = splits[i];
  const original = attack(pages, chooseTraining);
  const syntheticPositive = attack(positive, chooseTraining);
  const [sourceExpected, plantExpected, trainExpected, heldoutExpected] =
    expected[i];
  assert.equal(original.trainingRunes, trainExpected);
  assert.equal(original.heldoutRunes, heldoutExpected);
  assert.ok(Math.abs(original.heldoutGainNatsPerRune - sourceExpected) < 1e-10);
  assert.ok(Math.abs(syntheticPositive.heldoutGainNatsPerRune -
    plantExpected) < 1e-10);
  assert.ok(syntheticPositive.heldoutGainNatsPerRune > 1.11);
  assert.ok(original.heldoutGainNatsPerRune < 0.06);
  results.push({split, original, syntheticPositive});
}
console.log(JSON.stringify({
  premise: 'One shared hidden 13-phase by preceding ciphertext rune GP29 modular shift table',
  originalRunes: 12956,
  originalPredecessorTransitions: 12901,
  sourcePages: 55,
  nativePositiveRecoveredByKnownKey: 12901,
  sourceEnglishReferenceRunes: control.length,
  splits: results,
  decision: 'Source-original heldout scores cannot recover a reusable 13-state plaintext register. This is model-specific and remains unselected by original instructions.'
}, null, 2));
console.log('PASS: original source, three independent page holdouts and 377-secret-shift genuine-GP plants');
