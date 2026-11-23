'use strict';

/**
 * Single-file source-input test of a frozen p51 cube-hop word-edge transducer.
 *
 * Run with Node.js 22. Read-only, uses only checked-in primary inputs.
 *
 * Candidate mechanism (not claimed to be author-prescribed):
 *   IV = first printed ciphertext rune of each p51 word;
 *   key = cube^((next printed p51 table byte) mod 6)(previous ciphertext);
 *   plaintext = cube^(-1)(ciphertext - key) in GF(29);
 *   previous ciphertext = current ciphertext until next word-IV reset.
 *
 * Every original input rune is used. The 20 transmitted IVs are preserved
 * separately from the 72 decoded information runes. The panel has 72 bytes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[51].runic_count, 92);
assert.equal(corpus.pages[57].runic_count, 95);
const pageParts = transcription.split('%');
assert.equal(pageParts.length, 57); // p50 has zero runes and no transcription block.
const raw = pageParts[50]; // zero-based transcription page 50 = physical p51
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const wordStrings = raw.replace(/[\/\r\n\s&$]/g, '').split(/[-.]/g).filter(Boolean);
const words = wordStrings.map(word => [...word].map(ch => {
  assert.ok(byRune.has(ch), 'Unexpected source rune: ' + ch);
  return byRune.get(ch);
}));
const source = words.flat();
const bytePanel = grid.pages.find(p => p.page === 51).bytes;

assert.equal(words.length, 20);
assert.equal(source.length, 92);
assert.deepEqual(source, corpus.pages[51].indices);
assert.equal(bytePanel.length, 72);
assert.deepEqual(words.map(w => w.length), [3, 6, 5, 5, 3, 4, 3, 3, 8, 3, 8, 1, 3, 7, 4, 8, 3, 8, 4, 3]);
assert.equal(words.reduce((n, w) => n + w.length - 1, 0), 72);

/** @param {number} x @param {number} exponent @returns {number} */
function power(x, exponent) {
  let result = 1;
  for (let i = 0; i < exponent; ++i) result = (result * x) % 29;
  return result;
}
/** @param {number} state @param {number} byte @returns {number} */
function cubeHops(state, byte) {
  for (let k = 0; k < byte % 6; ++k) state = power(state, 3);
  return state;
}
/**
 * @param {number[][]} cipherWords
 * @param {number[]} panel
 * @returns {number[][]}
 */
function decode(cipherWords, panel) {
  let cursor = 0;
  const decoded = cipherWords.map(word => {
    let previousCipher = word[0];
    const out = [];
    for (let i = 1; i < word.length; ++i) {
      const key = cubeHops(previousCipher, panel[cursor++]);
      out.push(power((word[i] - key + 29) % 29, 19));
      previousCipher = word[i];
    }
    return out;
  });
  assert.equal(cursor, panel.length);
  return decoded;
}
/**
 * @param {number[][]} plainWords
 * @param {number[]} edges
 * @param {number[]} panel
 * @returns {number[][]}
 */
function encode(plainWords, edges, panel) {
  assert.equal(plainWords.length, edges.length);
  let cursor = 0;
  const encoded = plainWords.map((word, index) => {
    let previousCipher = edges[index];
    const out = [previousCipher];
    for (const p of word) {
      const key = cubeHops(previousCipher, panel[cursor++]);
      const currentCipher = (power(p, 3) + key) % 29;
      out.push(currentCipher);
      previousCipher = currentCipher;
    }
    return out;
  });
  assert.equal(cursor, panel.length);
  return encoded;
}
function indexOfCoincidence(numbers) {
  const counts = Array(29).fill(0);
  for (const n of numbers) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (numbers.length * (numbers.length - 1));
}
/** @param {number[]} nums @returns {string} */
const translit = nums => nums.map(i => corpus.translit[i]).join('');

for (let n = 0; n < 29; ++n) {
  assert.equal(power(power(n, 3), 19), n);
  assert.equal(cubeHops(n, 6), n);
}
const originalDecoded = decode(words, bytePanel);
const recovered = originalDecoded.flat();
assert.equal(recovered.length, 72);
assert.deepEqual(encode(originalDecoded, words.map(w => w[0]), bytePanel), words);
assert.equal(indexOfCoincidence(recovered), 170 / (72 * 71));
const expectedDecoded = [
  23,4,3,4,24,18,27,6,8,28,11,0,4,0,23,19,19,7,18,8,12,25,12,2,
  16,2,8,8,6,20,23,4,6,27,1,2,15,2,27,22,10,9,11,20,15,10,13,7,
  8,9,3,1,18,14,0,20,3,23,24,5,11,3,19,16,12,9,11,27,28,4,15,4
];
assert.deepEqual(recovered, expectedDecoded);

// Known Cicada plaintext plant: first 72 unencrypted p57 GP rune values.
// Rechunk its real GP29 runes to match the actual p51 20 source word shapes.
const native = corpus.pages[57].indices.slice(0, 72);
const lengths = words.map(w => w.length - 1);
let position = 0;
const nativeWords = lengths.map(length => {
  const segment = native.slice(position, position + length);
  position += length;
  return segment;
});
assert.equal(position, 72);
const sourceEdges = words.map(w => w[0]);
const plantedCipher = encode(nativeWords, sourceEdges, bytePanel);
assert.equal(plantedCipher.flat().length, 92);
assert.deepEqual(decode(plantedCipher, bytePanel), nativeWords);
assert.equal(indexOfCoincidence(native), 296 / (72 * 71));

console.log(JSON.stringify({
  scope: 'original p51 physical scan68, 72-cell table + 92 GP runes / 20 words',
  construction: 'first-edge IV; cube^(byte mod6) on previous ciphertext; inverse cube of residual',
  originalCipherRunes: source.length,
  originalPanelBytes: bytePanel.length,
  retainedIVs: sourceEdges.length,
  inverseOutputRunes: recovered.length,
  originalInverseIoC: indexOfCoincidence(recovered),
  nativePositiveIoC: indexOfCoincidence(native),
  outputWords: originalDecoded.map(translit),
  exactOriginalForwardReplay: true,
  exactNativePlantedRoundtrip: true,
  originalPlaintextRecovered: false
}, null, 2));
