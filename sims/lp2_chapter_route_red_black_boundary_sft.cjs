'use strict';
/**
 * SFT: source-side red->black boundary controls for the chapter SUM/PRODUCT route.
 * Classification: post-discovery finite authentication of operand selection/statistics.
 * No unknown plaintext or body cipher is recovered here.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const parts = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const product = (a) => a.reduce((z, v) => (z * v) % Q, 1);
const descriptor = (a) => [a.length, mod(a.reduce((s, v) => s + v, 0)), product(a)];

function segmentForPage(page) {
  assert.notEqual(page, 50);
  return parts[page < 50 ? page : page - 1];
}

function pageWords(page) {
  const source = corpus.pages.find((p) => p.page === page).indices;
  const words = [];
  let offset = 0;
  let start = 0;
  let current = [];
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: start + current.length, values: current.slice(), descriptor: descriptor(current)});
    current = [];
  };
  for (const ch of segmentForPage(page)) {
    if (runeIndex.has(ch)) {
      if (!current.length) start = offset;
      assert.equal(source[offset], runeIndex.get(ch), 'transcription/corpus mismatch');
      current.push(runeIndex.get(ch));
      offset++;
    } else if ('-.&$§'.includes(ch)) {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, 'page rune count mismatch');
  return words;
}

const rows = [];
for (const ann of ink.pages.filter((p) => p.page <= 55 && p.page !== 50)) {
  const source = corpus.pages.find((p) => p.page === ann.page).indices;
  const words = pageWords(ann.page);
  const spans = (ann.red_spans || []).slice().sort((a, b) => a.start - b.start);
  for (const span of spans) {
    const end = span.start + span.length;
    if (spans.some((s) => s.start === end)) continue; // immediate continuation is still red
    const black = words.find((w) => w.start === end);
    if (!black) continue;
    const red = source.slice(span.start, end);
    const redWords = words.filter((w) => w.start >= span.start && w.end <= end);
    const lengths = redWords.map((w) => w.values.length);

    const p27Grammar = lengths.length >= 2 &&
      black.descriptor[0] === mod(lengths[0] + lengths[lengths.length - 1]) &&
      black.descriptor[2] === mod(red.length) &&
      black.descriptor[2] === red[0];

    const p54Grammar = red.length % 2 === 1 &&
      JSON.stringify(black.descriptor) === JSON.stringify([
        product(red),
        red[red.length - 1],
        red[(red.length - 1) / 2]
      ]);

    const p40Grammar = lengths.length === 2 &&
      JSON.stringify(black.descriptor) === JSON.stringify([
        lengths[1],
        mod(lengths[0] - lengths[1]),
        lengths[0]
      ]);

    rows.push({
      page: ann.page,
      start: span.start,
      redLength: red.length,
      redFirst: red[0],
      redLast: red[red.length - 1],
      redProduct: product(red),
      redWordLengths: lengths,
      blackStart: black.start,
      blackDescriptor: black.descriptor,
      p27Grammar,
      p54Grammar,
      p40Grammar
    });
  }
}

assert.equal(rows.length, 13);
assert.deepEqual(
  rows.filter((r) => r.p27Grammar).map((r) => [r.page, r.start, r.redWordLengths, r.blackDescriptor]),
  [[27, 0, [3,12,4], [7,2,19]]]
);
assert.deepEqual(
  rows.filter((r) => r.p54Grammar).map((r) => [r.page, r.start, r.redWordLengths, r.blackDescriptor]),
  [[54, 0, [1,8], [8,19,27]]]
);
assert.deepEqual(
  rows.filter((r) => r.p40Grammar).map((r) => [r.page, r.start, r.redWordLengths, r.blackDescriptor]),
  [[40, 0, [3,5], [5,27,3]]]
);

// Route-local meanings under the independently reconstructed DH23/q state.
const state = {q:4, e:3, g:5, a:6, A:8, b:15, B:19, K:2, p:23};
assert.deepEqual(rows.find((r) => r.page === 27 && r.start === 0).blackDescriptor, [state.g + state.K, state.K, state.B]);
assert.deepEqual(rows.find((r) => r.page === 54 && r.start === 0).blackDescriptor, [state.A, state.B, mod(-state.K)]);
assert.deepEqual(rows.find((r) => r.page === 40 && r.start === 0).blackDescriptor, [state.g, mod(-state.K), state.e]);

// P0 has only a partial local closure; preserve that negative boundary explicitly.
const p0 = rows.find((r) => r.page === 0 && r.start === 0);
assert.equal(p0.redFirst, p0.blackDescriptor[1]); // b -> SUM=b
assert.equal(p0.p27Grammar || p0.p54Grammar || p0.p40Grammar, false);

// P8's full red-H/DH closure is reproduced by the dedicated p8 SFT; keep only the exact operand here.
const p8 = rows.find((r) => r.page === 8 && r.start === 0);
assert.deepEqual(p8.blackDescriptor, [state.e, state.p, state.K]);

console.log(JSON.stringify({
  classification: 'finite original-source boundary authentication; no plaintext/body inverse',
  eligibleRedToBlackSpans: rows.length,
  p27: rows.find((r) => r.p27Grammar),
  p54: rows.find((r) => r.p54Grammar),
  p40: rows.find((r) => r.p40Grammar),
  p0Partial: {redFirst: p0.redFirst, blackDescriptor: p0.blackDescriptor},
  p8Operand: p8.blackDescriptor
}, null, 2));
