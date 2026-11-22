#!/usr/bin/env node
'use strict';

// Source-motivated p55 self-circumference hypothesis:
// 33 outer runes (incoming p54 carry, then first/last of 16 complete p55
// words) form a repeating GP29 Vigenere key for the 43 strict interiors.
// Physical order, phase zero, historical subtraction, and no F skips.
// Run: node sims/p55_own_circumference_vigenere_sft.cjs

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt').split('%');
const quadgramText = read('resources/control/duko_round27_english_quadgrams.txt');
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const alphabet = corpus.translit;

const fragments = transcription[54].replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu) || [];
assert.deepEqual(fragments.map(word => [...word].length), [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(fragments.length, 17);
const completeWords = fragments.slice(1).map(word => [...word]);
assert.equal(completeWords.length, 16);
const carry = [...fragments[0]];
assert.equal(carry.length, 1);
const interiorWordLengths = completeWords.map(word => word.length - 2);
assert.deepEqual(interiorWordLengths, [2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1]);

const key = carry.concat(completeWords.flatMap(word => [word[0], word[word.length - 1]])).map(r => byRune.get(r));
const cipher = completeWords.flatMap(word => word.slice(1, -1)).map(r => byRune.get(r));
assert.equal(key.length, 33);
assert.equal(cipher.length, 43);
assert.equal(alphabet[key[0]], 'NG');
assert.deepEqual(cipher.map((r,i) => r === 0 ? i : null).filter(x => x !== null), [11]);
assert.deepEqual(fragments.join('').split('').map(r => byRune.get(r)), corpus.pages.find(p => p.page === 55).indices);

function decode(input, direction = -1) {
  return input.map((c, i) => (c + direction * key[i % key.length] + 29 * 100) % 29);
}
function encode(input) {
  return input.map((p, i) => (p + key[i % key.length] + 29 * 100) % 29);
}
function sha256(indices) {
  return crypto.createHash('sha256').update(Buffer.from(indices)).digest('hex');
}
function letters(indices) {
  return indices.map(i => alphabet[i]).join('').replace(/[^A-Z]/g, '');
}
const quadgrams = new Map();
let total = 0;
for (const line of quadgramText.trim().split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const count = Number(parts[1]);
  quadgrams.set(parts[0], count);
  total += count;
}
function score(indices) {
  const text = letters(indices);
  let sum = 0, count = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    sum += Math.log10((quadgrams.get(text.slice(i, i + 4)) || 0.01) / total);
    count++;
  }
  return { letters: text.length, quadgrams: count, mean_log10_per_quadgram: sum / count };
}

const subtract = decode(cipher, -1);
const add = decode(cipher, 1);
assert.deepEqual(decode(encode(cipher), -1), cipher, 'exact self-key roundtrip');
const solvedP57 = corpus.pages.find(p => p.page === 57).indices.slice(7, 50);
assert.equal(solvedP57.length, 43);
const planted = encode(solvedP57);
assert.deepEqual(decode(planted, -1), solvedP57, 'solved-p57 43-rune positive plant');

const rawScore = score(cipher);
const subtractScore = score(subtract);
const addScore = score(add);
const positiveScore = score(solvedP57);
assert.ok(Math.abs(rawScore.mean_log10_per_quadgram - (-7.194442365794233)) < 1e-9);
assert.ok(Math.abs(subtractScore.mean_log10_per_quadgram - (-7.958067927084408)) < 1e-9);
assert.ok(Math.abs(addScore.mean_log10_per_quadgram - (-7.919361456681503)) < 1e-9);
assert.ok(Math.abs(positiveScore.mean_log10_per_quadgram - (-4.368424836020276)) < 1e-9);

function splitWords(indices) {
  let offset = 0;
  return interiorWordLengths.map(length => {
    const word = letters(indices.slice(offset, offset + length));
    offset += length;
    return word;
  });
}
console.log(JSON.stringify({
  source: 'original LP2 physical p55; one-rune incoming p54 carry plus 16 complete p55 words',
  page_word_fragment_lengths: fragments.map(word => [...word].length),
  carry: alphabet[key[0]],
  complete_words: completeWords.length,
  outer_key_length: key.length,
  outer_key_physical_order: 'incoming carry, then first rune and last rune of each complete p55 word in printed order',
  outer_key_gp: key,
  outer_key_translit: key.map(i => alphabet[i]).join(' '),
  interior_cipher_length: cipher.length,
  interior_word_lengths: interiorWordLengths,
  interior_gp: cipher,
  interior_translit: cipher.map(i => alphabet[i]).join(' '),
  key_cycles: { complete: Math.floor(cipher.length / key.length), remainder: cipher.length % key.length },
  subtract_output: subtract.map(i => alphabet[i]).join(' '),
  subtract_output_word_fragments: splitWords(subtract),
  add_output: add.map(i => alphabet[i]).join(' '),
  raw_score: rawScore,
  subtract_score: subtractScore,
  add_score: addScore,
  solved_p57_positive_control_score: positiveScore,
  positive_plant_roundtrip: decode(planted, -1).every((v,i) => v === solvedP57[i]),
  input_sha256: sha256(cipher),
  key_sha256: sha256(key),
  status: 'NEGATIVE: p55 exterior-as-repeating-Vigenere-key model produces no readable plaintext'
}, null, 2));
