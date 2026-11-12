'use strict';
/**
 * Original LP2 table-perimeter rank-transposition gate (CJS SFT).
 * Read the 32x8 printed grid and authentic p55 rune indices from pinned resources.
 * Enumerate all 76 starts x 2 directions x 2 ranks x 2 permutation senses
 * x 3 unshifted/additive choices x 2 operation orders.
 * A correct synthetic decoder must re-encrypt. A real plaintext also needs
 * independent key evidence and original-language consistency.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', p), 'utf8'));
const corpus = read('lp2-corpus.json');
const sourceGrid = read('base60-grid.json');
const sourceText = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const alphabet = sourceGrid.alphabet;
const table = sourceGrid.rows.flat().map(token => alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]));
const cipher = corpus.pages.find(page => page.page === 55).indices;
const control = corpus.pages.find(page => page.page === 57).indices.slice(0, 76);
assert.equal(table.length, 256);
assert.equal(cipher.length, 76);
assert.equal(control.length, 76);

const ring = [];
for (let x = 0; x < 8; x++) ring.push(x);
for (let y = 1; y < 32; y++) ring.push(8 * y + 7);
for (let x = 6; x >= 0; x--) ring.push(31 * 8 + x);
for (let y = 30; y > 0; y--) ring.push(y * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const names = corpus.translit;
const labels = new Map(names.map((name, i) => [name, i]));
const patterns = [...names].sort((a, b) => b.length - a.length);
const aliases = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
/** @param {string} s @returns {number[]} */
function encode(s) {
  const words = s.toUpperCase().replace(/#[^\n]*/g, ' ')
    .replace(/\[.*?\]/g, ' ').match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    let i = 0;
    while (i < word.length) {
      const pattern = patterns.find(p => word.startsWith(p, i));
      if (pattern) {
        out.push(labels.get(pattern));
        i += pattern.length;
      } else {
        const rune = labels.get(aliases[word[i]] || word[i]);
        if (rune !== undefined) out.push(rune);
        i++;
      }
    }
  }
  return out;
}

const native = encode(sourceText);
const triples = new Map();
const bigrams = new Map();
for (let i = 2; i < native.length; i++) {
  const context = 29 * native[i - 2] + native[i - 1];
  const triple = 29 * context + native[i];
  triples.set(triple, (triples.get(triple) || 0) + 1);
  bigrams.set(context, (bigrams.get(context) || 0) + 1);
}
/** @param {number[]} seq @returns {number} */
function score(seq) {
  let sum = 0;
  for (let i = 2; i < seq.length; i++) {
    const context = 29 * seq[i - 2] + seq[i - 1];
    sum += Math.log((triples.get(29 * context + seq[i]) || 0) + 0.2);
    sum -= Math.log((bigrams.get(context) || 0) + 29 * 0.2);
  }
  return sum / (seq.length - 2);
}
const windows = [];
for (let i = 0; i + 76 <= native.length; i++) windows.push(score(native.slice(i, i + 76)));
windows.sort((a, b) => a - b);

/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} rank @param {boolean} inverse @returns {number[]} */
function permute(a, rank, inverse) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    if (inverse) out[rank[i]] = a[i];
    else out[i] = a[rank[i]];
  }
  return out;
}
/** @param {number[]} a @param {number[]} rank @param {boolean} inverse @returns {number[]} */
function unpermute(a, rank, inverse) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    if (inverse) out[i] = a[rank[i]];
    else out[rank[i]] = a[i];
  }
  return out;
}
/** @param {number[]} data @param {number[]} key @param {number[]} rank @param {number} sign @param {boolean} inverse @param {boolean} before @returns {number[]} */
function decode(data, key, rank, sign, inverse, before) {
  const shifted = before ? data.map((v, i) => mod(v + sign * key[i])) : data;
  const out = permute(shifted, rank, inverse);
  return before ? out : out.map((v, i) => mod(v + sign * key[i]));
}
/** @param {number[]} data @param {number[]} key @param {number[]} rank @param {number} sign @param {boolean} inverse @param {boolean} before @returns {number[]} */
function encodeCipher(data, key, rank, sign, inverse, before) {
  const pre = before ? data : data.map((v, i) => mod(v - sign * key[i]));
  const out = unpermute(pre, rank, inverse);
  return before ? out.map((v, i) => mod(v - sign * key[i])) : out;
}
const candidates = [];
for (const direction of [1, -1]) {
  for (let start = 0; start < 76; start++) {
    const order = Array.from({ length: 76 }, (_, i) => ring[(start + direction * i + 76 * 100) % 76]);
    const key = order.map(pos => table[pos]);
    for (const asc of [true, false]) {
      const rank = Array.from({ length: 76 }, (_, i) => i)
        .sort((a, b) => (asc ? key[a] - key[b] : key[b] - key[a]) || a - b);
      for (const inverse of [false, true]) {
        for (const sign of [-1, 0, 1]) {
          for (const before of [true, false]) {
            const output = decode(cipher, key, rank, sign, inverse, before);
            assert.deepEqual(encodeCipher(output, key, rank, sign, inverse, before), cipher);
            assert.deepEqual(decode(encodeCipher(control, key, rank, sign, inverse, before), key, rank, sign, inverse, before), control);
            candidates.push({ direction, start, asc, inverse, sign, before, score: score(output), output });
          }
        }
      }
    }
  }
}
candidates.sort((a, b) => b.score - a.score);
assert.equal(candidates.length, 3648);
assert(Math.abs(candidates[0].score - (-3.3131541950496324)) < 1e-10);
assert(Math.abs(windows[0] - (-2.3000292222494285)) < 1e-10);
console.log(JSON.stringify({
  family: 'p50-p55 ring76 stable-value rank transposition plus direct mod29 byte shift',
  candidates: candidates.length,
  best: { ...candidates[0], output: candidates[0].output.map(i => names[i]).join('-') },
  bestPure: candidates.find(v => v.sign === 0).score,
  nativeWindows: { n: windows.length, min: windows[0], q01: windows[Math.floor(windows.length * 0.01)] },
  nativeSolvedPage57: score(control),
  tested: 'Each key starts at every ring cell in either direction; all synthetic-positive and exact original inverse round trips passed.'
}, null, 2));
