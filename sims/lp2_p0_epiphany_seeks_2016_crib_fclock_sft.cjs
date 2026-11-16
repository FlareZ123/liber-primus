'use strict';

/**
 * Exact original-cipher test of one source-authored 2016 p0 heading crib.
 *
 * The authenticated 2016 line "epiphany seeks the devoted" begins with
 * words whose GP29 source-normalized lengths 8+5 match LP2 p0's original
 * first two red heading words (8+5). This alone does not establish the crib.
 *
 * Hypothesis under test:
 *   P[0..12] = EPIPHANY SEEKS, K[0..12] fixed by original C[0..12],
 *   repeat K with period 13 from zero and apply the actual solved-LP1
 *   plaintext-F transparent Vigenere rule to the remainder.
 *
 * Every ciphertext-F may be a keyed non-F or a transparent plaintext-F.
 * Enumerate every such path. No language/wordscore or guessed skip used.
 *
 * Run: node sims/lp2_p0_epiphany_seeks_2016_crib_fclock_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.ok(signed.toLowerCase().includes('epiphany seeks the devoted'));
const firstWords = (source.split('%')[0].match(/[\u16A0-\u16FF]+/gu) || [])
  .slice(0, 2).map((s) => [...s].length);
assert.deepEqual(firstWords, [8, 5]);
const C = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
assert.equal(C.length, 729);
const labels = corpus.translit;
assert.equal(labels.length, 29);
const nativeWord = 'EPIPHANYSEECS'; // authentic GP K -> C normalization
const crib = [...nativeWord].map((c) => {
  const v = labels.indexOf(c);
  assert.ok(v >= 0, c);
  return v;
});
assert.equal(crib.length, 13);
assert.ok(crib.every((c) => c !== 0)); // each heading rune consumes one key
const mod = (n) => ((n % 29) + 29) % 29;
const key = crib.map((p, i) => mod(C[i] - p));
assert.deepEqual(C.slice(0, 13),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(key,
  [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);

/**
 * All-secret F ambiguity, fixed 13-symbol key and phase zero at start.
 * For any cipher rune:
 *   C!=F implies keyed plaintext P=C-K!=F, consuming one key step;
 *   C==F permits keyed non-F, OR literal plaintext F consuming no step.
 * @param {number[]} ciphertext
 * @param {number[]} key13
 * @param {number} sourceOffset Original index for report
 * @returns {{firstFailure:number|null, steps:number, finalPhases:number[], phaseBeforeFailure:number[]}}
 */
function traceEveryFPath(ciphertext, key13, sourceOffset) {
  let states = new Set([0]);
  let lastPhases = [0];
  for (let j = 0; j < ciphertext.length; j++) {
    const next = new Set();
    const c = ciphertext[j];
    for (const phase of states) {
      const p = mod(c - key13[phase]);
      if (p !== 0) next.add((phase + 1) % 13);
      if (c === 0) next.add(phase);
    }
    if (next.size === 0) {
      return {
        firstFailure: j + sourceOffset,
        steps: j,
        finalPhases: [],
        phaseBeforeFailure: [...states].sort((a, b) => a - b)
      };
    }
    lastPhases = [...next];
    states = next;
  }
  return {
    firstFailure: null,
    steps: ciphertext.length,
    finalPhases: lastPhases.sort((a, b) => a - b),
    phaseBeforeFailure: []
  };
}

/**
 * @param {number[]} plaintext Real native-GP rune symbols
 * @param {number[]} key13
 * @returns {number[]} Exact positive plant under solved F transparent rule
 */
function encryptNativeF(plaintext, key13) {
  let phase = 0;
  return plaintext.map((p) => {
    if (p === 0) return 0;
    const c = mod(p + key13[phase]);
    phase = (phase + 1) % 13;
    return c;
  });
}
const plantedHeading = encryptNativeF(crib, key);
assert.deepEqual(plantedHeading, C.slice(0, 13));
const nativeControl = corpus.pages[57].indices; // independently clear PARABLE
assert.equal(nativeControl.length, 95);
const plantedFollowing = encryptNativeF(nativeControl, key);
const positive = traceEveryFPath(plantedFollowing, key, 13);
assert.equal(positive.firstFailure, null);
assert.equal(positive.steps, 95);
const original = traceEveryFPath(C.slice(13), key, 13);
assert.equal(original.firstFailure, 57);
assert.deepEqual(original.phaseBeforeFailure, [4]);
assert.equal(C[original.firstFailure], key[4]);
assert.equal(C[original.firstFailure], 27); // IA, not a literal F
assert.notEqual(C[original.firstFailure], 0);
console.log(JSON.stringify({
  originalWords: firstWords,
  sourcePhrase: 'EPIPHANY SEEKS',
  originalHeadingGP: C.slice(0, 13).map((v) => labels[v]),
  keyGP: key.map((v) => labels[v]),
  originalFirstFailure: original.firstFailure,
  originalFailingCipher: labels[C[original.firstFailure]],
  phaseBeforeFailure: original.phaseBeforeFailure,
  forcedPlainAtFailure: labels[mod(C[original.firstFailure] - key[4])],
  solvedNativeFPlantRecoveredLength: positive.steps,
  solvedNativeFPlantAccepted: positive.firstFailure === null
}, null, 2));
console.log('DECISION: source-authored 8+5 heading crib + period13');
console.log('solved-LP1 F-transparent cipher has no legal inverse past rune56.');
