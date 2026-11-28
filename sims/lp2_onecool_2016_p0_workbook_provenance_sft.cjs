'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const MOD = 29;
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number[]} cipher @param {number[]} modifier @returns {number[]} */
function apply(cipher, modifier) {
  assert.equal(cipher.length, modifier.length);
  return cipher.map((value, index) => mod29(value + modifier[index]));
}

/** @param {number[]} cipher @param {number[]} plaintext @returns {number[]} */
function fittedModifier(cipher, plaintext) {
  assert.equal(cipher.length, plaintext.length);
  return plaintext.map((value, index) => mod29(value - cipher[index]));
}

/** @param {number} n @returns {number} */
function mobius(n) {
  if (n === 0) return 0;
  let x = n;
  let factors = 0;
  for (let prime = 2; prime * prime <= x; prime += 1) {
    if (x % prime !== 0) continue;
    x /= prime;
    factors += 1;
    if (x % prime === 0) return 0;
    while (x % prime === 0) x /= prime;
  }
  if (x > 1) factors += 1;
  return factors % 2 === 0 ? 1 : -1;
}

const p0First13 = p0.indices.slice(0, 13);
assert.deepEqual(p0First13, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const screenshot = {
  count: [0, 1, 2, 3, 4, 5, 6, 7],
  modifier: [8, 2, -3, 2, -3, 11, -9, 4],
  decoded: [23, 10, 15, 5, 3, 1, 18, 4],
  mobius: [0, 1, -1, -1, 0, -1, 1, -1],
  trials: {
    DISCOVER: [8, 2, -3, 2, -3, 11, -9, 4],
    DIRECTION: [8, 2, 15, 15, -1, 26, 0, 9],
    DIVINITY: [8, 2, 12, 7, 3, -9, -11, -3],
  },
};

const first8 = p0First13.slice(0, 8);
assert.deepEqual(first8, [15, 8, 18, 3, 6, 19, 27, 0]);
assert.deepEqual(apply(first8, screenshot.modifier), screenshot.decoded);
assert.deepEqual(screenshot.mobius, screenshot.count.map(mobius));

const expectedDecoded = {
  DISCOVER: [23, 10, 15, 5, 3, 1, 18, 4],
  DIRECTION: [23, 10, 4, 18, 5, 16, 27, 9],
  DIVINITY: [23, 10, 1, 10, 9, 10, 16, 26],
};

/** @type {Record<string, unknown>} */
const reconstructed = {};
for (const [label, signedModifier] of Object.entries(screenshot.trials)) {
  const decoded = apply(first8, signedModifier);
  assert.deepEqual(decoded, expectedDecoded[label]);
  assert.deepEqual(signedModifier.map(mod29), fittedModifier(first8, expectedDecoded[label]));
  const repeated = p0First13.map((value, index) => mod29(value + signedModifier[index % 8]));
  reconstructed[label] = {
    signedModifier,
    decoded,
    decodedTranslit: decoded.map((value) => corpus.translit[value]),
    repeatAcrossTitle13: repeated,
    repeatAcrossTitle13Translit: repeated.map((value) => corpus.translit[value]),
    untouchedSecondWordByRepeat: repeated.slice(8),
    untouchedSecondWordByRepeatTranslit: repeated.slice(8).map((value) => corpus.translit[value]),
  };
}

const mu13 = Array.from({ length: 13 }, (_, index) => mobius(index));
const muDecoded13 = apply(p0First13, mu13);
assert.deepEqual(mu13.slice(0, 8), screenshot.mobius);
assert.deepEqual(muDecoded13, [15, 9, 17, 2, 6, 18, 28, 28, 15, 26, 19, 20, 5]);

const sourceContinuations = {
  DISCOVER: ['TH', 'R', 'U', 'TH'],
  DIVINITY: ['W', 'I', 'TH', 'I', 'N'],
};
assert.notDeepEqual(reconstructed.DISCOVER.untouchedSecondWordByRepeatTranslit, sourceContinuations.DISCOVER);
assert.notDeepEqual(reconstructed.DIVINITY.untouchedSecondWordByRepeatTranslit, sourceContinuations.DIVINITY);

console.log(JSON.stringify({
  status: 'PASS',
  evidenceBoundary: [
    'Recovered onecool-2016 screenshot values and contemporaneous forum description.',
    'Canonical p0 ciphertext only for arithmetic replay.',
    'No candidate is assumed to be authentic plaintext.',
  ],
  workbookDependency: 'DECODED = CIPHER + MODIFIER (mod 29); English rows map GP29 values to glyph/letter labels.',
  screenshotState: {
    count: screenshot.count,
    liveModifier: screenshot.modifier,
    liveDecoded: screenshot.decoded,
    liveDecodedTranslit: screenshot.decoded.map((value) => corpus.translit[value]),
    mobius: screenshot.mobius,
    note: 'RHV0bYJ also shows a yellow DISCOVER duplicate, then a visible `maybe?` label above DIRECTION, then DIVINITY.',
  },
  candidateClassification: Object.fromEntries(Object.entries(reconstructed).map(([label, value]) => [label, {
    class: 'crib-conditioned plaintext hypothesis / trial key',
    ...value,
  }])),
  deterministicMobiusControl: {
    modifier13: mu13,
    decoded13: muDecoded13,
    decoded13Translit: muDecoded13.map((value) => corpus.translit[value]),
  },
  decision: 'MANUAL_CRIB_PROVENANCE; NO_INDEPENDENT_P0_KEY_OPERAND_RECOVERED',
}, null, 2));
