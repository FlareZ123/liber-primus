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

// Second independent cardinality: all 3316 floral runes = 4 * 829.
// The 145th prime, 829, is independently selected by p15's Fibonacci144+1.
// The 90th prime, 463, is independently the prime rank of red 3299.
const floral = corpus.pages.slice(40, 56).flatMap((p) => p.indices);
assert.equal(floral.length, 3316);
assert.equal(primeList[fibonacciDistinct[11]], 829);
assert.equal(primeList[fibonacciDistinct[10]], 463);
assert.equal(primeList.filter((p) => p <= 3299).length, 463);
assert.equal(floral.length, 4 * 829);
const fourPrimeWindows = windows.filter((w) => w.full === 4 * 829);
assert.deepEqual(fourPrimeWindows.map((w) => w.first), [40]);

const rows = 829;
const cols = 4;
const colFirst = Array.from({ length: floral.length }, (_, i) =>
  floral[(i % rows) * cols + Math.floor(i / rows)]);
const rowFirst = Array.from({ length: floral.length }, (_, i) =>
  floral[(i % cols) * rows + Math.floor(i / cols)]);
const restoredColumns = Array(floral.length);
const restoredRows = Array(floral.length);
for (let i = 0; i < floral.length; i += 1) {
  restoredColumns[(i % rows) * cols + Math.floor(i / rows)] = colFirst[i];
  restoredRows[(i % cols) * rows + Math.floor(i / cols)] = rowFirst[i];
}
assert.deepEqual(restoredColumns, floral);
assert.deepEqual(restoredRows, floral);
const fourBy829 = {
  raw: adjacency(floral),
  colFirst: adjacency(colFirst),
  rowFirst: adjacency(rowFirst)
};
assert.equal(fourBy829.raw.doubles, 21);
assert.equal(fourBy829.colFirst.doubles, 121);
assert.equal(fourBy829.rowFirst.doubles, 119);


// One source-motivated identity-changing stage: the verified p56 decoder
// subtracts prime totients. The highlighted red3299 is the 463rd prime.
// Freeze the clock at that prime, with all 3316 floral symbols consumed.
// Both natural four-column inversions and two cipher-layer orders are checked.
const primeWindow = [];
for (let n = 2; primeWindow.length < 462 + floral.length; n += 1) {
  if (isPrime(n)) primeWindow.push(n);
}
assert.equal(primeWindow[462], 3299);
assert.equal(primeWindow[463], 3301);
const totients = primeWindow.slice(462, 462 + floral.length)
  .map((p) => (p - 1) % 29);
function transposeFour(x, dir) {
  if (dir === 0) return x.slice();
  return Array.from({ length: x.length }, (_, i) =>
    dir === 1 ? x[(i % rows) * cols + Math.floor(i / rows)] :
      x[(i % cols) * rows + Math.floor(i / cols)]);
}
function reverseTranspose(x, dir) {
  return transposeFour(x, dir === 1 ? 2 : dir === 2 ? 1 : 0);
}
function addPad(x, sign) {
  return x.map((v, i) => (v + sign * totients[i] + 29) % 29);
}
function decodeOriginal(x, sign, dir, layer) {
  return layer === 0 ? addPad(transposeFour(x, dir), sign) :
    transposeFour(addPad(x, sign), dir);
}
function encodePlant(x, sign, dir, layer) {
  return layer === 0 ? reverseTranspose(addPad(x, -sign), dir) :
    addPad(reverseTranspose(x, dir), -sign);
}
function indexCoincidence(x) {
  const bins = new Int32Array(29);
  for (const v of x) bins[v] += 1;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0) / (x.length * (x.length - 1));
}
const native = Array.from({ length: floral.length }, (_, i) =>
  corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
const compound = [];
for (const dir of [0, 1, 2]) {
  for (const layer of dir === 0 ? [0] : [0, 1]) {
    for (const sign of [-1, 1]) {
      const plaintext = decodeOriginal(floral, sign, dir, layer);
      assert.deepEqual(encodePlant(plaintext, sign, dir, layer), floral);
      assert.deepEqual(decodeOriginal(encodePlant(native, sign, dir, layer),
        sign, dir, layer), native);
      compound.push({ dir, layer, sign, ioc: indexCoincidence(plaintext) });
    }
  }
}
assert.equal(compound.length, 10);
const low = Math.min(...compound.map((r) => r.ioc));
const high = Math.max(...compound.map((r) => r.ioc));
assert.ok(Math.abs(low - 0.03436039350323037) < 1e-12);
assert.ok(Math.abs(high - 0.03459309677290235) < 1e-12);

console.log(JSON.stringify({
  source: 'LP2 physical p40-55; remove opening red8 at p40 and red9 at p54',
  titlelessLength: modulus,
  uniqueMatchingSixteenPageWindow: [40, 55],
  p15SpiralIndexedOffsets: printedSpiral.map((x) => x % modulus),
  indexedSixteenRunes: preview,
  prime463IsRed3299Rank: true,
  fourTimes829EqualsOriginalFloralLength: true,
  naturalFourBy829Readouts: fourBy829,
  p463PrimeTotientAndFourColumnInverses: compound,
  sourceP57SolvedIoC: indexCoincidence(corpus.pages[57].indices),
  primitiveRoot: 2,
  sourceOrder: raw,
  doubledOrder: doubled,
  nullTrials: trials,
  upperTailMi: (nullMiAtLeast + 1) / (trials + 1),
  upperTailDoublets: (nullDoublesAtLeast + 1) / (trials + 1),
  conclusion: 'No plaintext; selected direct index read nonlinguistic and 2-power order ordinary under inventory-matched null.'
}, null, 2));
