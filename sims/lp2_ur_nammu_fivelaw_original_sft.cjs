'use strict';

/**
 * SFT: historical five Ur-Nammu-law hypothesis against the original five
 * numbered Liber Primus cuneiform passages, without fitting ciphertext.
 *
 * Source, public as of March 2014:
 * https://comparativelawspring2014.wordpress.com/wp-content/uploads/2014/03/history-of-legal-codes-ur-nammu.pdf
 * The five law lines are embedded below only as GP29 index bytes and
 * GP-normalized source-word-length fingerprints, not redistributed prose.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_ur_nammu_fivelaw_original_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));

/** @param {number} p */
const page = (p) => {
  const found = corpus.pages.find((x) => x.page === p);
  assert(found, 'physical source page missing: ' + p);
  return found.indices;
};
const items = [
  page(36).slice(99, 238),
  page(37).slice(0, 91),
  page(37).slice(91, 189),
  page(37).slice(189, 228).concat(page(38).slice(0, 57)),
  page(38).slice(57, 186)
];
assert.deepEqual(items.map((a) => a.length), [139, 91, 98, 96, 129]);

// Direct standard 2014 GP29 Vigenere is the sole cipher operation tested.
// Complete March-2014 English laws were normalized with QU->CW, V->U,
// K->C, Z->S, Q->CW; the seven multiletter GP glyphs are parsed longest
// inside each printed source word, and numerical tokens are excluded.
const sourceLawHex = [
  '0a0018131809050313130a100f1813010417120402181013180913010f101112050a14141217',
  '0a0018131809050313130a100f180403111112041a0812070a14141112050a14141217',
  '0a0018131809050313130a100f18050a1709180d0d0a1508120a0f100311120a130d040a0f030912171809170d181a0f08120512140f03000f0a14011204',
  '0a00180f14180112131804040a120f180f141801121809170218100f141801120a0f0f121000041212081217160f090310141c011202120803010f1208031417',
  '0a00180f14180112131804040a120f180918100a01120a12000412120d12040f030908120f08120a0f1003081809170212000a040f10110304090f0309030112041003080a0f0307091204'
];
const keys = sourceLawHex.map((hex) => Array.from(Buffer.from(hex, 'hex')));
assert.deepEqual(keys.map((k) => k.length), [38, 35, 62, 64, 75]);
keys.forEach((k) => k.forEach((v) => assert(v < 29)));

// Law source fingerprints use printed whitespace words, retaining i.e.
// and he/she each as a single word and dropping the numeral 15.
const lawWords = [
  [2, 1, 3, 7, 1, 6, 3, 3, 4, 2, 6],
  [2, 1, 3, 7, 1, 7, 2, 4, 2, 6],
  [2, 1, 3, 7, 1, 9, 2, 2, 2, 2, 10, 3, 3, 7, 2, 6],
  [2, 1, 5, 7, 1, 5, 3, 3, 5, 2, 3, 4, 2, 3, 3, 4, 2, 9],
  [2, 1, 5, 7, 1, 6, 2, 4, 6, 5, 2, 2, 4, 2, 9, 3, 4, 2, 3, 5]
];
assert.deepEqual(lawWords.map((a) => a.reduce((s, x) => s + x, 0)),
  keys.map((k) => k.length));

const runeIndices = new Map(corpus.runes.map((r, i) => [r, i]));
const srcPages = source.split('%');
/** @type {{start:number,end:number,values:number[],p:number,red:boolean}[]} */
const words = [];
/** @type {{value:number,p:number,offset:number,red:boolean}[]} */
let active = [];
let global = 0;
const starts = [];
for (let p = 0; p < 56; p++) {
  starts[p] = global;
  if (p === 50) continue; // Runeless numerical table (missing in text split)
  const redSpans = ink.pages.find((z) => z.page === p)?.red_spans || [];
  const redSet = new Set(redSpans.flatMap(
    (z) => Array.from({ length: z.length }, (_, i) => z.start + i)));
  let local = 0;
  for (const glyph of srcPages[p > 50 ? p - 1 : p]) {
    if (runeIndices.has(glyph)) {
      active.push({ value: runeIndices.get(glyph), p, offset: local,
        red: redSet.has(local) });
      local++;
      global++;
    } else if ((glyph === '-' || glyph === '.') && active.length) {
      const end = global;
      words.push({ start: end - active.length, end,
        values: active.map((z) => z.value), p: active[0].p,
        red: active.every((z) => z.red) });
      active = [];
    }
  }
  assert.equal(local, page(p).length, 'source and corpus differ at p' + p);
}
if (active.length) {
  words.push({ start: global - active.length, end: global,
    values: active.map((z) => z.value), p: active[0].p,
    red: active.every((z) => z.red) });
}
assert.equal(words.length, 2896);
assert.equal(global, 12956);

// Frozen original page/rune coordinates, with a genuine cross-page item4.
const spans = [
  [starts[36] + 99, starts[36] + 238],
  [starts[37], starts[37] + 91],
  [starts[37] + 91, starts[37] + 189],
  [starts[37] + 189, starts[38] + 57],
  [starts[38] + 57, starts[38] + 186]
];
const printedLengths = spans.map(([start, end]) =>
  words.filter((w) => w.start >= start && w.end <= end)
    .map((w) => w.end - w.start));
assert.deepEqual(printedLengths.map((a) => a.length), [30, 20, 25, 19, 28]);
assert.deepEqual(printedLengths.map((a) => a.reduce((s, x) => s + x, 0)),
  items.map((a) => a.length));
/** @param {number[]} x @param {number[]} y */
function longestRun(x, y) {
  let longest = 0;
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) {
      let n = 0;
      while (i + n < x.length && j + n < y.length && x[i + n] === y[j + n]) n++;
      if (n > longest) longest = n;
    }
  }
  return longest;
}
/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const value of values) freq[value]++;
  return freq.reduce((total, n) => total + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values */
const roman = (values) => values.map((v) => corpus.translit[v]).join('');
const rows = [];
for (let i = 0; i < 5; i++) {
  const cipher = items[i], key = keys[i];
  const outputs = [-1, +1].map((sign) => {
    const plain = cipher.map((c, pos) =>
      ((c + sign * key[pos % key.length]) % 29 + 29) % 29);
    assert.deepEqual(plain.map((p, pos) =>
      ((p - sign * key[pos % key.length]) % 29 + 29) % 29), cipher);
    return { sign, ioc: ioc(plain),
      prefix: roman(plain.slice(0, 45)) };
  });
  rows.push({ item: i + 1, printedWords: printedLengths[i].length,
    sourceWords: lawWords[i].length, keyLength: key.length,
    nativeCipherIoC: ioc(cipher),
    sameLawMaxLengthRun: longestRun(printedLengths[i], lawWords[i]),
    bestLawMaxLengthRun: Math.max(...lawWords.map(
      (law) => longestRun(printedLengths[i], law))),
    outputs });
}
const clear = page(57);
const clearIoC = ioc(clear);
assert(clearIoC > 0.05, 'authentic p57 native-language control');
for (const row of rows) {
  assert(row.outputs.every((out) => out.ioc < 0.04),
    'a potential native-GP signal needs independent inspection');
}
const redUr = words.filter((w) =>
  roman(w.values) === 'UR' && w.red && w.p === 53);
assert.equal(redUr.length, 1, 'original p53 red UR word');
const originalUrWords = words.filter((w) => roman(w.values) === 'UR');
assert.equal(originalUrWords.length, 1);
console.log(JSON.stringify({ source: 'March 2014 five-law excerpt',
  clearP57IoC: clearIoC,
  redUrOriginal: { count: originalUrWords.length, page: redUr[0].p },
  itemResults: rows }, null, 2));
