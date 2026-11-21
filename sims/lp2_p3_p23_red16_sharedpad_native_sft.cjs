'use strict';

/**
 * Source-only two-time-pad gate for the two original LP2 16-rune red headings.
 * Run: node sims/lp2_p3_p23_red16_sharedpad_native_sft.cjs
 * The only cipher conjecture is one fully consuming 16-position additive
 * GP29 pad reused at zero phase in both headings. Pad cancels:
 *   (C23-C3) mod29 = (P23-P3) mod29.
 * No keys or plaintext candidates are fit to the unknown original.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const Q = 29;
const SEG3 = [2, 11, 3], SEG23 = [2, 6, 3, 5];
const runes = new Set(c.runes);
assert.equal(c.runes.length, Q);
const pages = transcript.split(/\r?\n%\r?\n/);
assert(pages.length >= 56);

/** @param {number} p */
function titleLengths(p) {
  const title = pages[p].split('.')[0].replace(/[\r\n/]/g, '');
  return title.split('-').map(w => [...w].filter(ch => runes.has(ch)).length)
    .filter(Boolean);
}
assert.deepEqual(titleLengths(3), SEG3);
assert.deepEqual(titleLengths(23), SEG23);
assert.deepEqual([c.pages[3].indices.length, c.pages[23].indices.length],
  [217, 213]);
const C3 = c.pages[3].indices.slice(0, 16);
const C23 = c.pages[23].indices.slice(0, 16);
assert.equal(C3.length, 16);
assert.equal(C23.length, 16);

/** @type {{s:string,i:number}[]} */
const vocab = c.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} input */
function encode(input) {
  const norm = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const result = [];
  for (let i = 0; i < norm.length;) {
    const token = vocab.find(t => norm.startsWith(t.s, i));
    if (!token) return null;
    result.push(token.i);
    i += token.s.length;
  }
  return result;
}
const freq = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/)) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (m) freq.set(m[1], Number(m[2]));
}
for (const p of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
]) {
  for (const word of read(p).toLowerCase().match(/[a-z]{2,}/g) || []) {
    if (!freq.has(word)) freq.set(word, 1);
  }
}
const words = [...freq].map(([word, count]) =>
  ({word, count, indices: encode(word)})).filter(x => x.indices);
/** @type {Map<number, {word:string,count:number,indices:number[]}[]>} */
const byLen = new Map();
for (const w of words) {
  const n = w.indices.length;
  if (!byLen.has(n)) byLen.set(n, []);
  byLen.get(n).push(w);
}
for (const n of [2, 3, 5, 6, 11]) assert(byLen.get(n)?.length > 0);
/** @param {number[]} xs */
const id = xs => xs.join(',');
const lookup = new Map([2, 3, 5, 6, 11].map(n =>
  [n, new Set(byLen.get(n).map(w => id(w.indices)))]));
/** @param {number[]} a @param {number[]} b */
const difference = (a, b) => a.map((v, i) => (b[i] - v + Q) % Q);
/** @param {number[]} w @param {number[]} delta @param {number} offset */
const transfer = (w, delta, offset) =>
  w.map((x, i) => (x + delta[offset + i]) % Q);
/** @param {number[]} delta */
function screen(delta) {
  const first = byLen.get(2).filter(w =>
    lookup.get(2).has(id(transfer(w.indices, delta, 0)))).length;
  const surviving = [];
  for (const w of byLen.get(11)) {
    const transformed = transfer(w.indices, delta, 2);
    const valid6 = lookup.get(6).has(id(transformed.slice(0, 6)));
    const valid3 = lookup.get(3).has(id(transformed.slice(6, 9)));
    if (valid6 && valid3) surviving.push(w.word);
  }
  return {firstWordPairs: first, middleWordPairs: surviving};
}
const original = screen(difference(C3, C23));
assert.equal(words.length, 32190);
assert.equal(original.firstWordPairs, 50);
assert.deepEqual(original.middleWordPairs, []);

// Source-native positive: a real dictionary phrase under a shared secret pad
// must pass the exact same inverse. This confirms both segmentation and signs.
const choose = n => byLen.get(n)[0];
const plain3 = [choose(2), choose(11), choose(3)]
  .flatMap(w => w.indices);
const plain23 = [choose(2), choose(6), choose(3), choose(5)]
  .flatMap(w => w.indices);
assert.equal(plain3.length, 16);
assert.equal(plain23.length, 16);
const secret = Array.from({length:16}, (_, i) => (7 * i + 3) % Q);
const enc3 = plain3.map((p, i) => (p + secret[i]) % Q);
const enc23 = plain23.map((p, i) => (p + secret[i]) % Q);
const planted = screen(difference(enc3, enc23));
assert(planted.middleWordPairs.includes(choose(11).word));
assert(planted.firstWordPairs > 0);
for (let i = 0; i < 16; i++) {
  assert.equal((enc3[i] - plain3[i] + Q) % Q, secret[i]);
  assert.equal((enc23[i] - plain23[i] + Q) % Q, secret[i]);
}
process.stdout.write(JSON.stringify({
  originalPages: [3, 23],
  headingRuneLengths: [SEG3, SEG23],
  originalCiphertext3: C3,
  originalCiphertext23: C23,
  difference: difference(C3, C23),
  dictionaryWords: words.length,
  elevenRuneCandidates: byLen.get(11).length,
  originalFirstWordPairs: original.firstWordPairs,
  originalMiddleWordPairs: original.middleWordPairs.length,
  plantedMiddleWordRecovered: true,
  decision: 'No shared full-consuming additive pad on two red16 original headings yields both native-dictionary 11|6+3 middle words.'
}, null, 2) + '\n');
