'use strict';

/**
 * Original p6/p7 22-by-14 DH23 row state and red14 terminal register.
 * Source-locked direct row-multiplier and ciphertext-feedback inverses.
 * Node 22: node sims/lp2_p6_p7_dh23_22x14_terminal_row_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (filename) => fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', filename), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const transcription = read('lp2-transcription.txt').split(/\n%\s*\n/);
const reference = read('lp1-plaintext-reference.txt');
const page = (index) => corpus.pages.find((p) => p.page === index).indices;
const p6 = page(6), p7 = page(7), original = p6.slice(82).concat(p7.slice(0, 194));
const terminal = p7.slice(194);
const mod29 = (x) => ((x % 29) + 29) % 29;
assert.equal(p6.length, 14 * 14);
assert.equal(original.length, 22 * 14);
assert.equal(terminal.length, 14);
assert.equal(terminal.reduce((a, b) => a + b), 209);
assert.equal(p6.slice(76, 80).reduce((a, b) => a * b % 29, 1), 14);
assert.equal(p7.slice(205).reduce((a, b) => a * b % 29, 1), 2);

const states = Array.from({ length: 22 }, (_, i) => {
  let s = 1;
  for (let j = 0; j < i; j++) s = s * 5 % 23;
  return s;
});
assert.equal(new Set(states).size, 22);
assert.equal(states[0], 1);
assert.equal(states[21] * 5 % 23, 1);
const inverses = Array.from({ length: 29 }, (_, x) => x ?
  Array.from({ length: 28 }, (_, j) => j + 1).find((n) => n * x % 29 === 1) : 0);
assert.ok(inverses.slice(1).every((x) => Number.isInteger(x)));

function factor(row, multiplier) {
  const state = states[21 - row]; // p7 red14 is the immediately following terminal row
  return [1, 2, state, mod29(2 * state)][multiplier];
}

/** @param {number[]} values @param {number} model @returns {number[]} */
function directDecode(values, model) {
  return values.map((cipher, i) => {
    const row = Math.floor(i / 14), col = i % 14;
    const s = states[21 - row], k = terminal[col];
    if (model === 0) return mod29(inverses[s] * (cipher - k));
    if (model === 1) return mod29(cipher - s * k);
    return mod29(cipher * inverses[mod29(s * k)]);
  });
}

/** @param {number[]} values @param {number} model @returns {number[]} */
function directEncode(values, model) {
  return values.map((plain, i) => {
    const row = Math.floor(i / 14), col = i % 14;
    const s = states[21 - row], k = terminal[col];
    if (model === 0) return mod29(s * plain + k);
    if (model === 1) return mod29(plain + s * k);
    return mod29(s * k * plain);
  });
}

/** @param {number[]} values @param {number} model @returns {number[]} */
function feedbackDecode(values, model) {
  return values.map((cipher, i) => {
    const row = Math.floor(i / 14), col = i % 14;
    const next = row === 21 ? terminal[col] : values[(row + 1) * 14 + col];
    return mod29(cipher - factor(row, model) * next);
  });
}

/** @param {number[]} plaintext @param {number} model @returns {number[]} */
function feedbackEncode(plaintext, model) {
  const values = Array(308).fill(0);
  for (let row = 21; row >= 0; row--) {
    for (let col = 0; col < 14; col++) {
      const i = row * 14 + col;
      const next = row === 21 ? terminal[col] : values[(row + 1) * 14 + col];
      values[i] = mod29(plaintext[i] + factor(row, model) * next);
    }
  }
  return values;
}

/** @param {string} text @returns {number[]} */
function encodeLatin(text) {
  const alphabet = corpus.translit;
  const letters = text.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < letters.length;) {
    let index = -1;
    for (let j = 0; j < alphabet.length; j++)
      if (letters.startsWith(alphabet[j], i) && (index < 0 || alphabet[j].length > alphabet[index].length))
        index = j;
    if (index < 0) i++;
    else { out.push(index); i += alphabet[index].length; }
  }
  return out;
}

function printedWords(text) {
  const out = [];
  let word = [], pos = 0;
  for (const ch of text) {
    const rune = corpus.runes.indexOf(ch);
    if (rune >= 0) { word.push(rune); pos++; }
    else if ('-.$&'.includes(ch)) {
      if (word.length) out.push({ start: pos - word.length, end: pos, word });
      word = [];
    }
  }
  if (word.length) out.push({ start: pos - word.length, end: pos, word });
  return out;
}

const native = encodeLatin(reference);
const vocabulary = new Set((reference.match(/[A-Za-z]{4,}/g) || []).map((w) => encodeLatin(w).join(',')));
const longWords = printedWords(transcription[6] + transcription[7])
  .filter(({ start, end, word }) => start >= 82 && end <= 390 && word.length >= 4)
  .map(({ start, end }) => ({ start: start - 82, end: end - 82 }));
assert.equal(longWords.length, 40);
const counts = new Uint32Array(29 ** 3), totals = new Uint32Array(29 ** 2);
for (let i = 2; i < native.length; i++) {
  const h = native[i - 2] * 29 + native[i - 1];
  counts[h * 29 + native[i]]++; totals[h]++;
}
function score(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i++) {
    const h = values[i - 2] * 29 + values[i - 1];
    sum += Math.log((counts[h * 29 + values[i]] + 0.2) / (totals[h] + 5.8));
  }
  return sum / (values.length - 2);
}
function wordHits(values) {
  return longWords.filter(({ start, end }) => vocabulary.has(values.slice(start, end).join(','))).length;
}
const preview = (values) => values.slice(0, 80).map((i) => corpus.translit[i]).join('');
const plant = Array.from({ length: 308 }, (_, i) => page(57)[i % page(57).length]);
assert.equal(page(57).length, 95);
assert.ok(score(page(57)) > -2.2);
console.log(JSON.stringify({
  source: 'original LP2 p6/p7 red13-dot-delimited gap',
  p6FullRopeLength: p6.length, originalRunes: original.length,
  receiverRows: 22, receiverColumns: 14,
  terminal14: terminal, dh23GeneratorStates: states,
  redLastProduct: 2, baseline: score(original), solvedP57: score(page(57))
}));
for (let type = 0; type < 2; type++) {
  const count = type === 0 ? 3 : 4;
  for (let model = 0; model < count; model++) {
    const decode = type === 0 ? directDecode : feedbackDecode;
    const encode = type === 0 ? directEncode : feedbackEncode;
    const values = decode(original, model);
    assert.deepEqual(encode(values, model), original, 'original-cipher reencryption');
    assert.deepEqual(decode(encode(plant, model), model), plant, 'native solved positive plant');
    const matchedWords = wordHits(values);
    assert.equal(matchedWords, 0);
    console.log(JSON.stringify({
      family: type ? 'red14-backwards-ciphertext-feedback' : 'red14-DH23-direct-row',
      model,
      trigram: score(values),
      longWordHits: matchedWords,
      longWords: longWords.length,
      preview80: preview(values)
    }));
  }
}
console.log('PASS: 7 DH23 22x14 original-runic decoders are nonlinguistic; all reencryption and plants exact');
