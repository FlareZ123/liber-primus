'use strict';

/**
 * One-file original-input gate for p15's red 3299 as a possible modulus
 * on the title-stripped 16-page floral-border register (physical pp40–55).
 * Run from any directory: node sims/lp2_p15_red3299_floral_register_sft.cjs
 * Pure, deterministic analysis; no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');

const redStart = new Array(58).fill(0);
for (const page of ink.pages) {
  const start = (page.red_spans || []).find((span) => span.start === 0);
  if (start) redStart[page.page] = start.length;
}
assert.equal(redStart[40], 8);
assert.equal(redStart[54], 9);
assert.equal(redStart.slice(40, 56).reduce((a, b) => a + b, 0), 17);
assert.equal(corpus.pages.slice(40, 56).reduce((a, p) => a + p.runic_count, 0), 3316);
assert.equal(corpus.pages[50].runic_count, 0);

// Source-visible opening rubrics removed. In particular p53 red51 is body.
const body = corpus.pages.slice(40, 56).flatMap((p) => p.indices.slice(redStart[p.page]));
assert.equal(body.length, 3299);
assert.equal(new Set(body).size, 29);

const windows = [];
for (let first = 0; first + 16 <= 56; first += 1) {
  const pages = corpus.pages.slice(first, first + 16);
  const full = pages.reduce((a, p) => a + p.runic_count, 0);
  const titles = redStart.slice(first, first + 16).reduce((a, x) => a + x, 0);
  windows.push({ first, last: first + 15, full, titles, body: full - titles });
}
assert.deepEqual(windows.filter((w) => w.body === 3299).map((w) => w.first), [40]);

const fibonacciDistinct = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const printedSpiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primeList = Array.from({ length: 7817 }, (_, i) => i + 1).filter(isPrime);
for (let i = 0; i < 16; i += 1) {
  assert.equal(printedSpiral[i], Math.abs(3301 - primeList[fibonacciDistinct[i]]));
}
const modulus = body.length;
assert.equal(printedSpiral[0], modulus);
assert.ok(isPrime(modulus));
assert.equal((modulus - 1), 2 * 17 * 97);
for (const q of [2, 17, 97]) {
  let a = 1;
  for (let i = 0; i < (modulus - 1) / q; i += 1) a = (a * 2) % modulus;
  assert.notEqual(a, 1, '2 must be a primitive root mod 3299');
}
const indexed = printedSpiral.map((x) => body[x % modulus]);
const preview = indexed.map((x) => corpus.translit[x]).join('-');
assert.equal(preview, 'A-I-B-J-EA-E-EO-Y-O-J-TH-X-U-F-TH-F');

// The 2^i read, with source position 0 explicitly retained, is reversible.
const order = [0];
let position = 1;
for (let i = 0; i < modulus - 1; i += 1) {
  order.push(position);
  position = (2 * position) % modulus;
}
assert.equal(new Set(order).size, modulus);
assert.equal(position, 1);
const permuted = order.map((i) => body[i]);
const restored = Array(modulus);
for (let i = 0; i < modulus; i += 1) restored[order[i]] = permuted[i];
assert.deepEqual(restored, body);

/** @param {number[]} x */
function adjacency(x) {
  const pair = new Int32Array(29 * 29);
  const from = new Int32Array(29);
  const to = new Int32Array(29);
  let doubles = 0;
  for (let i = 1; i < x.length; i += 1) {
    const a = x[i - 1];
    const b = x[i];
    pair[29 * a + b] += 1;
    from[a] += 1;
    to[b] += 1;
    if (a === b) doubles += 1;
  }
  const total = x.length - 1;
  let uniquePairs = 0;
  let mutualInformation = 0;
  for (let j = 0; j < pair.length; j += 1) {
    const count = pair[j];
    if (!count) continue;
    uniquePairs += 1;
    mutualInformation += (count / total) *
      Math.log((count * total) / (from[Math.floor(j / 29)] * to[j % 29]));
  }
  return { doubles, uniquePairs, mutualInformation };
}
const raw = adjacency(body);
const doubled = adjacency(permuted);
assert.equal(raw.doubles, 21);
assert.equal(doubled.doubles, 124);
assert.equal(raw.uniquePairs, 814);
assert.equal(doubled.uniquePairs, 824);

// Matched, fixed-inventory randomization. The inferential unit is the
// 3299-symbol *source* register. The 2^i permutation has one frozen key.
let state = 123456789;
function randomInt(bound) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return Math.floor(((state >>> 0) / 4294967296) * bound);
}
const shuffled = body.slice();
const trials = 3000;
let nullMiAtLeast = 0;
let nullDoublesAtLeast = 0;
for (let t = 0; t < trials; t += 1) {
  for (let j = shuffled.length - 1; j > 0; j -= 1) {
    const k = randomInt(j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const result = adjacency(shuffled);
  if (result.mutualInformation >= doubled.mutualInformation) nullMiAtLeast += 1;
  if (result.doubles >= doubled.doubles) nullDoublesAtLeast += 1;
}
console.log(JSON.stringify({
  source: 'LP2 physical p40-55; remove opening red8 at p40 and red9 at p54',
  titlelessLength: modulus,
  uniqueMatchingSixteenPageWindow: [40, 55],
  p15SpiralIndexedOffsets: printedSpiral.map((x) => x % modulus),
  indexedSixteenRunes: preview,
  primitiveRoot: 2,
  sourceOrder: raw,
  doubledOrder: doubled,
  nullTrials: trials,
  upperTailMi: (nullMiAtLeast + 1) / (trials + 1),
  upperTailDoublets: (nullDoublesAtLeast + 1) / (trials + 1),
  conclusion: 'No plaintext; selected direct index read nonlinguistic and 2-power order ordinary under inventory-matched null.'
}, null, 2));
