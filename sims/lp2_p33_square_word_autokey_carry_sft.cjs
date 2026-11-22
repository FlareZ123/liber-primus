'use strict';

// Exact original-source gate: a historically printed 7x7 / 1033 magic
// square supplies 49 word seeds to an otherwise conventional GP29 autokey.
// Source p33's 49th black "word" continues with two runes on p34.
// Run: node sims/lp2_p33_square_word_autokey_carry_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const from = (name) => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(from('resources/liber-primus/lp2-corpus.json'));
const transcript = from('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
const squareText = from('resources/cicada2014-openpuff-magic-squares.txt');
const square = squareText.trim().split(/\n\s*\n/)[1].trim()
  .split('\n').flatMap((line) => line.trim().split(/\s+/).map(Number));
const indexOfRune = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (n) => (n % 29 + 29) % 29;
const runesOnly = (s) => s.replace(/[\s/]/g, '');
const wordTokens = (s) => s.split(/[-.]/).filter(Boolean);

assert.equal(square.length, 49);
for (let row = 0; row < 7; row++) {
  assert.equal(square.slice(row * 7, row * 7 + 7).reduce((a, b) => a + b, 0), 1033);
}
assert.equal(transcript.length >= 35, true);
const p33 = runesOnly(transcript[33]).split('&');
assert.equal(p33.length, 2);
const bodies = p33.map((part) => part.slice(part.indexOf('.') + 1));
const first = wordTokens(bodies[0]);
const second = wordTokens(bodies[1]);
assert.deepEqual([first.length, second.length], [21, 28]);

const p33Fragments = first.concat(second);
const p34Words = wordTokens(runesOnly(transcript[34]));
const carried = p34Words.shift();
assert.equal(p33Fragments[48], '\u16d2'); // final p33 rune B
assert.equal(carried, '\u16d7\u16d2'); // p34 begins MB, no delimiter before it
const fullWords = p33Fragments.slice(0, 48).concat(p33Fragments[48] + carried, p34Words);
const wordLengths = fullWords.map((w) => [...w].length);
const ciphertext = fullWords.flatMap((w) => [...w].map((rune) => {
  assert.equal(indexOfRune.has(rune), true);
  return indexOfRune.get(rune);
}));
const original = corpus.pages[33].indices.slice(10, 91)
  .concat(corpus.pages[33].indices.slice(99), corpus.pages[34].indices);
assert.deepEqual(ciphertext, original);
assert.equal(p33Fragments.join('').length, 196);
assert.equal(wordLengths.slice(0, 49).reduce((a, b) => a + b, 0), 198);
assert.equal(original.length, 457);
assert.equal(square[0], 7);
assert.equal(square[48], 7);

/**
 * @typedef {{sign: 1 | -1, feedback: 'plaintext' | 'ciphertext', keyEveryRune: boolean}} Model
 * @param {number[]} input
 * @param {number[]} magic
 * @param {Model} model
 * @param {'decode'|'encode'} direction
 * @returns {number[]}
 */
function transform(input, magic, model, direction) {
  /** @type {number[]} */
  const output = [];
  let offset = 0;
  for (let i = 0; i < wordLengths.length; i++) {
    const key = magic[i % 49] % 29;
    let previousPlain = 0;
    let previousCipher = 0;
    for (let j = 0; j < wordLengths[i]; j++) {
      const seed = (j === 0 || model.keyEveryRune) ? key : 0;
      const previous = j === 0 ? 0 : model.feedback === 'plaintext'
        ? previousPlain : previousCipher;
      const delta = model.sign * (seed + previous);
      const value = input[offset++];
      const plain = direction === 'decode' ? mod(value + delta) : value;
      const cipher = direction === 'decode' ? value : mod(value - delta);
      output.push(direction === 'decode' ? plain : cipher);
      previousPlain = plain;
      previousCipher = cipher;
    }
  }
  assert.equal(offset, input.length);
  return output;
}

/** @param {number[]} values */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values */
function show(values) {
  return values.map((v) => corpus.translit[v]).join('');
}

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const plant = Array.from({ length: original.length }, (_, i) => solved[i % solved.length]);
const rotated = Array.from({length: 49}, (_, i) => {
  const r = Math.floor(i / 7), c = i % 7;
  return square[(6 - c) * 7 + r];
});
assert.notDeepEqual(rotated, square);
console.log('p33 visible black: 21+28 fragments, 196 runes; word49 carries p34 first2: ' +
  p33Fragments[48] + '+' + carried + '=' + fullWords[48]);
console.log('Complete 49 black words: 198 runes; p34 holdout: next 200 runes after the carry.');
console.log('Source IoC p33-complete=' + ioc(original.slice(0,198)).toFixed(8) +
  ' holdout=' + ioc(original.slice(198,398)).toFixed(8) +
  ' solved-p57=' + ioc(solved).toFixed(8));
let tested = 0;
for (const keyEveryRune of [false, true]) {
  for (const feedback of ['plaintext', 'ciphertext']) {
    for (const sign of [-1, 1]) {
      /** @type {Model} */
      const model = {keyEveryRune, feedback, sign};
      const plaintext = transform(original, square, model, 'decode');
      assert.deepEqual(transform(plaintext, square, model, 'encode'), original);
      const encryptedPlant = transform(plant, square, model, 'encode');
      assert.deepEqual(transform(encryptedPlant, square, model, 'decode'), plant);
      const wrongRecovery = transform(encryptedPlant, rotated, model, 'decode');
      assert.notDeepEqual(wrongRecovery, plant);
      console.log(JSON.stringify({
        key: keyEveryRune ? 'each rune' : 'first rune',
        feedback,
        decryptionSign: sign,
        p33_198_ioc: ioc(plaintext.slice(0, 198)),
        p34_200_ioc: ioc(plaintext.slice(198, 398)),
        p33_prefix80: show(plaintext.slice(0, 80)),
        holdout_prefix60: show(plaintext.slice(198, 258)),
        original_reencrypted: true,
        p57_plant_roundtrip: true,
        wrong_square_rejected: true,
      }));
      tested++;
    }
  }
}
assert.equal(tested, 8);
console.log('PASS eight frozen autokey receivers, original-cipher inverse, p57 solved-GP plants, and wrong-square controls.');
