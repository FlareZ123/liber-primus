'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeMap = new Map(original.runes.map((r, i) => [r, i]));
const mod29 = (n) => ((n % 29) + 29) % 29;
const printedWords = (segment) =>
  (segment.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((r) => runeMap.get(r)));

const page = original.pages.find((p) => p.page === 15);
assert.equal(page.indices.length, 159);
const segments = transcription.split(/^\s*%\s*$/m);
const matches = segments.map(printedWords)
  .filter((words) => JSON.stringify(words.flat()) === JSON.stringify(page.indices));
assert.equal(matches.length, 1);
const pageWords = matches[0];
assert.equal(pageWords.length, 37);
assert.deepEqual(pageWords.map((w) => w.length), [
  4,5,4,2,5,4,5,6,5,6,3,3,9,7,3,5,8,2,4,2,2,5,3,5,4,8,4,4,3,3,2,1,4,6,4,3,6
]);

let pageOffset = 0;
const bodyWords = [];
for (const word of pageWords) {
  if (pageOffset >= 9) bodyWords.push(word);
  else if (pageOffset + word.length > 9) throw new Error('red heading splits a word');
  pageOffset += word.length;
}
assert.equal(pageOffset, 159);
assert.equal(pageWords.slice(0, 2).flat().length, 9);
assert.equal(bodyWords.length, 35);
assert.equal(bodyWords.flat().length, 150);
assert.deepEqual(bodyWords.flat(), page.indices.slice(9));

const pageGlobalStart = original.pages.filter((p) => p.page < 15)
  .reduce((n, p) => n + p.runic_count, 0);
assert.equal(pageGlobalStart, 3603);
const bodyGlobalStart = pageGlobalStart + 9;
assert.equal(bodyGlobalStart, 3612);

/* BASE29 expansion of the 16 clockwise printed p15 spiral values. */
const values = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
];
function base29(n) {
  if (n === 0) return [0];
  const out = [];
  while (n) { out.push(n % 29); n = Math.floor(n / 29); }
  return out.reverse();
}
const key = values.flatMap(base29);
assert.equal(key.length, 47);
assert.deepEqual(key, [
  3,26,22,3,26,21,3,26,19,3,26,17,3,26,11,3,26,1,3,25,10,3,24,3,
  3,21,20,3,17,22,3,10,25,2,27,7,2,4,22,24,12,1,12,17,5,10,21
]);

/*
 * Enumerate all legal plaintext-F bypass choices. Ciphertext F may be literal
 * (no key consumption) or an encrypted non-F symbol. A non-F ciphertext
 * cannot decrypt to plaintext F under the authentic LP1 forward rule.
 */
function scan(words) {
  let states = new Set([0]); // absolute consumed-key counts
  let offset = 0;
  let ciphertextFsBeforeFailure = 0;
  for (const [wordIndex, word] of words.entries()) {
    const wordStart = offset;
    for (let j = 0; j < word.length; j++) {
      const ciphertext = word[j];
      const next = new Set();
      const attempts = [];
      for (const consumed of states) {
        if (ciphertext === 0) next.add(consumed);
        const keyIndex = consumed % key.length;
        const plaintext = mod29(ciphertext - key[keyIndex]);
        attempts.push({ consumed, keyIndex, keyValue: key[keyIndex], plaintextValue: plaintext });
        if (plaintext !== 0) next.add(consumed + 1);
      }
      if (!next.size) {
        return {
          valid: false,
          wordIndex,
          word: word.map((i) => original.translit[i]).join(''),
          wordStart,
          wordOffset: j,
          bodyRuneOffset: offset + j,
          originalGlobalRuneOffset: bodyGlobalStart + offset + j,
          ciphertext,
          ciphertextTranslit: original.translit[ciphertext],
          consumedStatesBefore: [...states].sort((a, b) => a - b),
          attempts,
          ciphertextFsBeforeFailure
        };
      }
      states = next;
      if (ciphertext === 0) ciphertextFsBeforeFailure++;
    }
    offset += word.length;
  }
  return { valid: true, finalConsumedStates: [...states], ciphertextFsBeforeFailure };
}
const gate = scan(bodyWords);
assert.equal(gate.valid, false);
assert.equal(gate.wordIndex, 7);
assert.equal(gate.word, 'OEXIATHHEA');
assert.equal(gate.wordStart, 31);
assert.equal(gate.wordOffset, 3);
assert.equal(gate.bodyRuneOffset, 34);
assert.equal(gate.originalGlobalRuneOffset, 3646);
assert.equal(gate.ciphertext, 2);
assert.equal(gate.ciphertextTranslit, 'TH');
assert.deepEqual(gate.consumedStatesBefore, [33]);
assert.deepEqual(gate.attempts, [{
  consumed: 33, keyIndex: 33, keyValue: 2, plaintextValue: 0
}]);
assert.equal(gate.ciphertextFsBeforeFailure, 2);

/* Synthetic positive plant with the exact p15 word shape and three inner Fs. */
const plantPlain = bodyWords.map((word, wi) =>
  word.map((_, j) => mod29(wi * 11 + j * 7 + 5)));
plantPlain[0][1] = 0;
plantPlain[5][3] = 0;
plantPlain[12][1] = 0;
const plantedFCount = plantPlain.reduce((n, w) =>
  n + w.filter((x) => x === 0).length, 0);
assert.equal(plantedFCount, 3);
let consumed = 0;
const plantCipher = plantPlain.map((word) => word.map((plain) => {
  if (plain === 0) return 0;
  const cipher = mod29(plain + key[consumed % key.length]);
  consumed++;
  return cipher;
}));
let recoveredConsumed = 0;
const plantRecovered = plantCipher.map((word, wi) => word.map((cipher, j) => {
  const expected = plantPlain[wi][j];
  if (expected === 0) { assert.equal(cipher, 0); return 0; }
  const recovered = mod29(cipher - key[recoveredConsumed % key.length]);
  recoveredConsumed++;
  assert.equal(recovered, expected);
  return recovered;
}));
assert.deepEqual(plantRecovered, plantPlain);
assert.equal(consumed, recoveredConsumed);

console.log(JSON.stringify({
  source: {
    p15_global_start: pageGlobalStart,
    page_runes: page.indices.length,
    red_heading_runes: 9,
    body_global_start: bodyGlobalStart,
    body_runes: 150,
    body_words: 35,
    body_word_lengths: bodyWords.map((w) => w.length)
  },
  key: {
    printed_values_clockwise: values,
    base29_digit_count: key.length,
    base29_digits: key,
    mapping_assumption: 'BASE29 digit values are interpreted as GP29 Vigenere shifts'
  },
  authentic_LP1_plaintext_F_gate: {
    phase_zero_at_first_body_rune: true,
    rule: 'plaintext F is literal and does not consume; ciphertext F also branches as encrypted non-F',
    result: gate
  },
  synthetic_positive_control: {
    exact_original_word_shape: true,
    planted_interior_F_count: plantedFCount,
    exact_round_trip: true
  },
  conclusion: 'No legal authentic plaintext-F-transparent inverse exists for this exact 47-digit key on p15 body at phase zero; first contradiction is body offset 34 / original global rune 3646.'
}, null, 2));
