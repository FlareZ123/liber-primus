'use strict';

/**
 * Original 255-word scroll / 255-rune next-page transfer gate.
 * Unlike whole-word-constant Vigenere, this test consumes exactly one
 * first/last original rune per printed word, plus the red5 quartic.
 * Node.js 22, CommonJS, read-only: node sims/lp2_scroll255_p8_acrostic_quartic_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const runeId = new Map(gp.runes.map((r, i) => [r, i]));
const mod = x => ((x % 29) + 29) % 29;
/** @param {string} s @returns {number[][]} */
function parseWords(s) {
  const out = [];
  let word = [];
  for (const ch of s) {
    if (runeId.has(ch)) word.push(runeId.get(ch));
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Line/page carries do not end a complete printed word.
    } else if (word.length) {
      out.push(word);
      word = [];
    }
  }
  if (word.length) out.push(word);
  return out;
}
const parts = transcript.split('%');
const scroll = parseWords(parts.slice(3, 8).join('%'));
const receiver = gp.pages[8].indices;
assert.equal(scroll.length, 255);
assert.equal(scroll.flat().length, 1145);
assert.equal(receiver.length, 255);
assert.deepEqual(scroll.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));

const p7 = gp.pages[7].indices;
let cursor = p7.length - 14;
const red = [2, 4, 3, 2, 3].map(size => {
  const word = p7.slice(cursor, cursor + size);
  cursor += size;
  return word;
});
assert.equal(cursor, p7.length);
const coeff = red.map(word => word.reduce((a, b) => mod(a * b), 1));
assert.deepEqual(coeff, [11, 26, 8, 15, 2]);
const poly = x => coeff.reduce((a, b) => mod(a * x + b), 0);
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
/**
 * One original-keyed 255-symbol reversible receiver.
 * @param {string} label @param {number[]} source @param {1|-1} sign
 */
function trial(label, source, sign) {
  assert.equal(source.length, 255);
  const decipher = cipher => cipher.map((x, i) => mod(x + sign * source[i]));
  const encipher = plain => plain.map((x, i) => mod(x - sign * source[i]));
  const plain = decipher(receiver);
  assert.deepEqual(encipher(plain), receiver);
  const plant = Array.from({length: 255}, (_, i) =>
    gp.pages[57].indices[i % gp.pages[57].indices.length]);
  assert.deepEqual(decipher(encipher(plant)), plant);
  return {label, sign, ioc: ioc(plain),
    originalFirst40: plain.slice(0, 40).map(x => gp.translit[x]).join(''),
    positiveRecovered: plant.length};
}
const acrostics = [
  ['first', scroll.map(w => w[0])],
  ['last', scroll.map(w => w.at(-1))]
];
const results = [];
for (const [side, source] of acrostics) {
  for (const [direction, key] of [
    ['printed', receiver], ['reverse', receiver.slice().reverse()]]) {
    for (const sign of [-1, 1]) {
      // Ciphertext = one source scroll-word edge, p8 is the key.
      const inverse = cipher => cipher.map((x, i) => mod(x + sign * key[i]));
      const forward = plain => plain.map((x, i) => mod(x - sign * key[i]));
      const original = inverse(source);
      assert.deepEqual(forward(original), source);
      const plant = Array.from({length: 255}, (_, i) =>
        gp.pages[57].indices[i % gp.pages[57].indices.length]);
      assert.deepEqual(inverse(forward(plant)), plant);
      results.push({label: 'acrostic ' + side + ' p8-' + direction,
        sign, ioc: ioc(original),
        originalFirst40: original.slice(0, 40)
          .map(x => gp.translit[x]).join(''),
        positiveRecovered: plant.length});
    }
  }
}
const summaries = [
  ['word-index-sum', scroll.map(w => w.reduce((s, x) => mod(s + x), 0))],
  ['word-index-product', scroll.map(w => w.reduce((s, x) => mod(s * x), 1))]
];
for (const [name, source] of summaries) {
  const key = source.map(poly);
  for (const sign of [-1, 1]) {
    results.push(trial('p7-red5-quartic(' + name + ')', key, sign));
  }
}
const max = Math.max(...results.map(x => x.ioc));
assert(results.every(x => x.positiveRecovered === 255));
assert(max < 0.036);
const clear = Array.from({length:255},(_,i) =>
  gp.pages[57].indices[i%gp.pages[57].indices.length]);
assert(ioc(clear) > 0.06);
console.log(JSON.stringify({
  original: {scrollWords:scroll.length,scrollRunes:1145,p8Runes:255},
  sourceRedProducts: coeff, candidateCount: results.length,
  maxOriginalIoC: max, nativeGPControlIoC: ioc(clear),
  originalDecodedAnyNativeGP: false,
  results
},null,2));
console.log('PASS 12 frozen original 255-position transfer inverses; zero authenticated plaintext');
