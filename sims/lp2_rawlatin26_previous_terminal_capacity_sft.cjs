'use strict';
/** Read-only SFT of the exact LP2 one-previous-terminal raw-Latin26 capacity bound. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Set(corpus.runes);
/** @param {string} input @returns {string[]} */
function parseWords(input) {
  return Array.from(input, c => alphabet.has(c) ? c : c === '-' || c === '.' ? '|' : '').join('').split('|').filter(Boolean);
}
/** @param {number} n @returns {number} */
function mod29(n) { return ((n % 29) + 29) % 29; }
const words = parseWords(source);
assert.equal(words.length, 2941);
assert.equal(words.reduce((sum, word) => sum + Array.from(word).length, 0), 13136);
const unknown = words.slice(0, 2896);
assert.equal(unknown.reduce((sum, word) => sum + Array.from(word).length, 0), 12956);
const rows = new Map(corpus.runes.map(rune => [rune, new Set()]));
for (let i = 1; i < unknown.length; i++) {
  const state = Array.from(unknown[i - 1]).at(-1);
  const output = Array.from(unknown[i])[0];
  assert.ok(alphabet.has(state) && alphabet.has(output));
  rows.get(state).add(output);
}
const support = corpus.runes.map(rune => ({ rune, count: rows.get(rune).size }));
assert.equal(support.filter(row => row.count > 26).length, 24);
const complete = support.filter(row => row.count === 29).map(row => row.rune);
assert.deepEqual(new Set(complete), new Set(['ᚻ', 'ᛄ', 'ᚪ', 'ᛏ', 'ᛗ']));
// A real reversible synthetic 29-state first-output map has exactly 26 images per fixed state.
for (let state = 0; state < 29; state++) {
  const images = new Set();
  for (let latin = 0; latin < 26; latin++) {
    const cipher = mod29(7 * latin + state);
    assert.equal(mod29(25 * (cipher - state)), latin);
    images.add(cipher);
  }
  assert.equal(images.size, 26);
}
console.log('Original corpus: 2,896 unknown complete words; 12,956 rune slots');
for (const { rune, count } of support) console.log('Previous terminal', rune, ':', count, 'distinct next first glyphs');
console.log('PASS: 24/29 original states exceed the 26 raw-Latin first-letter capacity');
console.log('PASS: 5/29 original states contain all 29 GP first glyphs: ' + complete.join(' '));
console.log('PASS: all 29 synthetic prior states each have 26 reversible Latin26 first outputs');
console.log('NO original unknown plaintext, key or whole-page decoder recovered');
