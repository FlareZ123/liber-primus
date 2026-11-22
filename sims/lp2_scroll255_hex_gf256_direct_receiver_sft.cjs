'use strict';
/**
 * HEX as literal 2014 byte/hexarithmetical grammar:
 * source p7 red word products -> seed 0xBA; source p50 base60 bytes;
 * standard GF(256) Reed–Solomon primitive 0x11d, x=0x02, period255.
 * Tests full original p8 and disjoint p9+p13 receivers, no key fitting.
 * Windows 11 / Node.js 22 CommonJS read-only single runnable test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const scroll = gp.pages.slice(3, 8).flatMap((p) => p.indices);
const words = transcription.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '').split(/[-.]/)
  .map((s) => [...s].filter((r) => alphabet.has(r)).map((r) => alphabet.get(r)))
  .filter((w) => w.length > 0);
assert.deepEqual(words.flat(), scroll);
assert.equal(words.length, 255);
assert.equal(gp.pages[8].indices.length, 255);
const red = new Set();
let offset = 0;
for (let page = 3; page <= 7; page++) {
  const spans = ink.pages.find((p) => p.page === page)?.red_spans || [];
  for (const span of spans) for (let j = 0; j < span.length; j++)
    red.add(offset + span.start + j);
  offset += gp.pages[page].indices.length;
}
const reds = [];
let cursor = 0;
for (const word of words) {
  const marks = word.map((_, j) => red.has(cursor + j));
  assert(marks.every(Boolean) || marks.every((v) => !v));
  if (marks[0]) reds.push(word);
  cursor += word.length;
}
assert.equal(reds.length, 13);
const products = reds.slice(-5).map((word) =>
  word.reduce((v, x) => mod(v * x), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const seed = (products[0] % 16) * 16 + products[1] % 16;
assert.equal(seed, 0xBA);
assert.equal(grid.rows.length, 32);
const values = grid.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  const x = 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]);
  assert(x >= 0 && x <= 255);
  return x;
});
assert.equal(values.length, 256);

/**
 * Fixed standard GF256 multiplier (RS/QR arithmetic)
 * with irreducible degree-8 polynomial 0x11D.
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function gfMul(x, y) {
  let out = 0;
  while (y) {
    if (y & 1) out ^= x;
    y >>>= 1;
    x = ((x << 1) & 255) ^ ((x & 128) ? 0x1D : 0);
  }
  return out;
}
const states = [seed];
for (let i = 1; i < 255; i++) states.push(gfMul(states[i - 1], 2));
assert.equal(new Set(states).size, 255);
assert(!states.includes(0));
assert.equal(gfMul(states.at(-1), 2), seed);
const pads = states.map((address) => mod(values[address]));
const IoC = (seq) => {
  const n = Array(29).fill(0);
  for (const x of seq) n[x]++;
  return n.reduce((v, c) => v + c * (c - 1), 0) / (seq.length * (seq.length - 1));
};
const inverse = (seq, start = 0) =>
  seq.map((x, i) => mod(x - pads[(start + i) % 255]));
const encrypt = (seq, start = 0) =>
  seq.map((x, i) => mod(x + pads[(start + i) % 255]));

const C8 = gp.pages[8].indices;
const C9 = gp.pages.slice(9, 15).flatMap((p) => p.indices);
const offset13 = gp.pages.slice(9, 13).reduce((v, p) => v + p.indices.length, 0);
const witnesses = [
  ['source-p8-full-255', C8, 0],
  ['untouched-p9+first-300', C9.slice(0, 300), 0],
  ['untouched-p13-first-200', gp.pages[13].indices.slice(0, 200), offset13 % 255],
];
assert(C9.length >= 300);
assert(gp.pages[13].indices.length >= 200);
for (const [label, cipher, start] of witnesses) {
  const plain = inverse(cipher, start);
  assert.deepEqual(encrypt(plain, start), cipher);
  console.log(JSON.stringify({
    label, runes: cipher.length, cipherIoC: IoC(cipher), candidateIoC: IoC(plain),
    candidatePreview: plain.slice(0, 36).map((x) => gp.translit[x]).join(''),
    exactReencryption: true,
  }));
}
const pairs = [[47, 240], [48, 231], [235, 236]];
const required = [8, 18, 14]; // Original earlier−later p8 duplicate pair rune differences.
const predicted = pairs.map(([i, j]) => mod(values[states[j]] - values[states[i]]));
assert.deepEqual(predicted, [7, 6, 12]);
assert.notDeepEqual(predicted, required);
console.log('SOURCE KEYED SAME-WORD PREDICTION', JSON.stringify({required, predicted}));

// Actual solved GP from clear p57 supplies a native-register positive.
// Plant and decode a different cipher under exactly the same 255-state key.
const clear = gp.pages[57].indices;
assert.equal(clear.length, 95);
const plant = Array.from({ length: 500 }, (_, j) => clear[j % clear.length]);
for (const start of [0, 57, 251]) {
  const cipher = encrypt(plant, start);
  assert.deepEqual(inverse(cipher, start), plant);
}
console.log('PASS original p8/p9/p13 inverse + canonical255-state + three solved-GP plants');
