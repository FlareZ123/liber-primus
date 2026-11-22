'use strict';

/**
 * Original-LP2 first-word-autokey continuation gate.
 *
 * Sources are repository-pinned original LP2 transcriptions and GP29 corpus.
 * Historical motivation: the p36 first printed section word admits the
 * bounded local MEANING readout under [1,3,3,1]. This test freezes that
 * four-digit seed and checks the two standard Vigenere autokey continuations
 * against all five printed numbered units, without fitting plaintext.
 *
 * Run with Node.js 22 from any working directory:
 * node sims/lp2_p36_38_numbered_source_autokey_continuation_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const transcript = fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const index = new Map([...corpus.runes].map((ch, i) => [ch, i]));
const pages = transcript.split('%').map(s => s.replace(/\$/g, '')).filter(s => s.trim());
assert.equal(pages.length, 57, 'Expected 57 rune-bearing original LP2 pages');

/** @param {string} section Original unaltered transcription between authored 1–5 labels. */
function originalWords(section) {
  return section.replace(/[\/\r\n]/g, '').split(/[-.]/).filter(Boolean).map(token =>
    [...token].filter(ch => index.has(ch)).map(ch => index.get(ch))
  ).filter(word => word.length);
}

const rawSections = [
  pages[36].split('1-')[1],
  pages[37].split('2-')[1].split('3-')[0],
  pages[37].split('3-')[1].split('4-')[0],
  pages[37].split('4-')[1] + pages[38].split('5-')[0],
  pages[38].split('5-')[1].split('&')[0]
];
const sections = rawSections.map(originalWords);
assert.deepEqual(sections.map(words => words.length), [30, 20, 25, 19, 28]);
assert.deepEqual(sections.map(words => words.flat().length), [139, 91, 98, 96, 129]);

/** @param {number} n */
function mod29(n) { return ((n % 29) + 29) % 29; }

/**
 * Standard ciphertext- or plaintext-autokey with a visible four-place seed.
 * @param {number[]} cipher
 * @param {number[]} seed
 * @param {'plaintext'|'ciphertext'} mode
 * @param {-1|1} sign Sign +1 means P=C+K; -1 means P=C-K.
 * @returns {number[]}
 */
function decode(cipher, seed, mode, sign) {
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    const k = i < seed.length ? seed[i] :
      mode === 'plaintext' ? out[i - seed.length] : cipher[i - seed.length];
    out.push(mod29(cipher[i] + sign * k));
  }
  return out;
}

/** @param {number[]} clear @param {number[]} seed @param {'plaintext'|'ciphertext'} mode @param {-1|1} sign */
function encode(clear, seed, mode, sign) {
  const cipher = [];
  for (let i = 0; i < clear.length; i++) {
    const k = i < seed.length ? seed[i] :
      mode === 'plaintext' ? clear[i - seed.length] : cipher[i - seed.length];
    cipher.push(mod29(clear[i] - sign * k));
  }
  return cipher;
}

/** @param {number[]} runes */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}

/** @param {number[]} indices */
function gp(indices) { return indices.map(i => corpus.translit[i]).join('-'); }

/** @param {number[][]} words @param {number[]} values */
function originalWordText(words, values) {
  let offset = 0;
  return words.map(word => {
    const text = gp(values.slice(offset, offset + word.length));
    offset += word.length;
    return text;
  });
}

const positive = corpus.pages[57].indices;
assert.equal(positive.length, 95, 'Solved p57 native-GP positive control');
let experiments = 0;

console.log('Original 2014 p36–38 numbered 1..5, including physical page carry in item 4');
console.log('Source-visible 10-dot column inner value 3; frozen seed [section,3,3,section]');
for (let unit = 0; unit < sections.length; unit++) {
  const words = sections[unit];
  const cipher = words.flat();
  const seed = [unit + 1, 3, 3, unit + 1];
  console.log(`\nUNIT ${unit + 1}: ${cipher.length} GP29 runes, ${words.length} complete words`);
  for (const mode of ['plaintext', 'ciphertext']) {
    for (const sign of [-1, 1]) {
      const plain = decode(cipher, seed, mode, sign);
      assert.deepEqual(encode(plain, seed, mode, sign), cipher, 'Original GP29 replay');
      const planted = encode(positive, seed, mode, sign);
      assert.deepEqual(decode(planted, seed, mode, sign), positive, 'Full native p57 plant');
      experiments++;
      console.log(
        `  ${mode.padEnd(10)} sign ${String(sign).padStart(2)} ` +
        `IoC ${ioc(plain).toFixed(9)}  ` +
        `first words: ${originalWordText(words, plain).slice(0, 9).join(' / ')}`
      );
      if (unit === 0 && sign === -1) {
        assert.deepEqual(plain.slice(0, 4), [19, 28, 9, 21],
          'Only the independently reported four-rune MEANING local hit');
        assert.equal(originalWordText(words, plain)[0], 'M-EA-N-NG');
      }
    }
  }
}
assert.equal(experiments, 20);
console.log('\nPASS: 20 frozen source first-opcode tests; 20/20 exact original replay and native-GP positive plants.');
console.log('No original numbered passage has a coherent whole-text plaintext under either four-back autokey.');
