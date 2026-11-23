'use strict';

/**
 * Frozen author-signed 2016 8|5|16-word structural key receiver on original LP2.
 *
 * 8+5+16=29 exactly matches the GP29 alphabet, original p0 red
 * first two word lengths 8+5 and p15 numerical 4x4 board count16.
 * This is a hypothesis about author intent, not known plaintext.
 * Test four unfit word-to-GP key encodings with both additive signs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = require('../resources/liber-primus/lp2-corpus.json');

const signed = fs.readFileSync(
  path.join(__dirname, '../resources/historical/cicada2016-4gq25-outguess.asc'),
  'utf8'
);
const message = signed.split('Hello.')[1].split('Seek and')[0];
const sentences = message.split('.').filter((s) => s.trim()).map((s) =>
  s.match(/[A-Za-z]+/g).map((w) => w.toUpperCase())
);
assert.deepEqual(sentences.map((s) => s.length), [8, 5, 16]);
const words = sentences.flat();
assert.equal(words.length, 29);
assert.equal(words[0], 'THE');
assert.equal(words[28], 'DIRECTION');

// Actual source p0 opens with printed 8-rune and 5-rune red word header.
const transcription = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-transcription.txt'),
  'utf8'
);
const firstWords = transcription
  .replaceAll('/', '').replaceAll('\r', '').replaceAll('\n', '')
  .replaceAll('%', '').match(/[\u16a0-\u16ff]+/gu);
assert.deepEqual(firstWords.slice(0, 2).map((w) => [...w].length), [8, 5]);
const p0 = source.pages[0].indices;
const p16 = source.pages[16].indices;
const p57 = source.pages[57].indices;
assert.deepEqual(firstWords.slice(0, 2).flatMap((w) =>
  [...w].map((ch) => source.runes.indexOf(ch))), p0.slice(0, 13));

// Source-authentic p15 spiral: 16 printed numerals.
const p15Board = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
assert.equal(p15Board.flat().length, 16);
assert.equal(p15Board[1][1], 3299);

const alphabet = source.translit.map((letters, i) => ({ letters, i }))
  .sort((a, b) => b.letters.length - a.letters.length);
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {string} input @returns {number[]} */
function gp(input) {
  let w = input.replaceAll('V', 'U').replaceAll('K', 'C')
    .replaceAll('Q', 'C').replaceAll('Z', 'S');
  const out = [];
  while (w.length) {
    const match = alphabet.find((row) => w.startsWith(row.letters));
    assert.ok(match, 'unmapped author-signed Latin word');
    out.push(match.i);
    w = w.slice(match.letters.length);
  }
  return out;
}
const gpWords = words.map(gp);
const keyModes = [
  { label: 'raw-Latin first letters', key: words.map((w) => source.translit.indexOf(w[0])) },
  { label: 'native-GP first rune', key: gpWords.map((w) => w[0]) },
  { label: 'native-GP ordinal word sum', key: gpWords.map((w) => mod29(w.reduce((s, i) => s + i, 0))) },
  { label: 'native-GP prime word sum', key: gpWords.map((w) => mod29(w.reduce((s, i) => s + source.prime[i], 0))) },
];
for (const { key } of keyModes) {
  assert.equal(key.length, 29);
  for (const x of key) assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
}
const ioc = (a) => {
  const hist = new Array(29).fill(0);
  for (const x of a) hist[x] += 1;
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
// The original 2016 message also contains this previously hypothesized
// p0 heading, but source alone has never authenticated it as plaintext.
const optionalP0Crib = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const results = [];
for (const { label, key } of keyModes) {
  for (const sign of [1, -1]) {
    const decrypt = (cipher) => cipher.map((c, i) =>
      mod29(sign === 1 ? c - key[i % 29] : key[i % 29] - c)
    );
    const encrypt = (plain) => plain.map((p, i) =>
      mod29(sign === 1 ? p + key[i % 29] : key[i % 29] - p)
    );
    // Cipher-first exact original replay for every unknown page tested.
    const dec0 = decrypt(p0), dec16 = decrypt(p16);
    assert.deepEqual(encrypt(dec0), p0);
    assert.deepEqual(encrypt(dec16), p16);
    // Source-native plant under same exact cipher to demonstrate
    // that genuine unencrypted source text is recoverable in principle.
    assert.deepEqual(decrypt(encrypt(p57)), p57);
    const matches = optionalP0Crib.filter((p, i) => dec0[i] === p).length;
    results.push({
      key: label, sign, matchesToConditionalRed13: matches,
      p0IoC: ioc(dec0), p16IoC: ioc(dec16),
      p0Start: dec0.slice(0, 20).map((x) => source.translit[x]).join(' '),
    });
  }
}
assert.deepEqual(results.map((r) => r.matchesToConditionalRed13),
  [1, 0, 0, 0, 0, 0, 0, 0]);
assert.ok(results.every((r) => r.p0IoC < 0.038 && r.p16IoC < 0.038));
console.log(JSON.stringify({
  originalSource: 'signed 2016 Cicada text, p0 two red word lengths, p15 4x4 spiral',
  sourceSentenceWordLengths: sentences.map((a) => a.length),
  totalSourceWords: words.length, gpAlphabetSize: 29,
  modes: keyModes.map((m) => m.label),
  p57KnownProseIoC: ioc(p57),
  results,
  decision: 'No authenticated original unknown plaintext from any direct 29-token periodic additive register.',
}, null, 2));
