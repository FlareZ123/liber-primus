/**
 * Original-source red225 nested-square geometry, SFT.
 *
 * Run from the repository root: node sims/lp2_red225_concentric_p32_sft.cjs
 *
 * A 15x15 source-order array of all 225 visibly red LP2 runes has 56
 * outer-border, 48 second-border and 121 central entries. This test
 * explicitly rejects a direct GP29 additive bridge to the original p32
 * 11x11 rune page while preserving the source geometry as a hypothesis.
 *
 * No external packages, network calls or invented cipher parameters.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const rune of a) counts[rune] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (a.length * (a.length - 1));
}

/**
 * @param {number[][]} square
 * @param {number} lo
 * @param {number} hi
 * @returns {number[]}
 */
function border(square, lo, hi) {
  const out = [];
  for (let col = lo; col <= hi; col += 1) out.push(square[lo][col]);
  for (let row = lo + 1; row <= hi; row += 1) out.push(square[row][hi]);
  for (let col = hi - 1; col >= lo; col -= 1) out.push(square[hi][col]);
  for (let row = hi - 1; row > lo; row -= 1) out.push(square[row][lo]);
  return out;
}

const sourceRed = [];
const redPageLengths = [];
let unsolvedRed = 0;
for (const page of corpus.pages) {
  const marked = new Set();
  const record = ink.pages.find((item) => item.page === page.page);
  const redOnPage = (record?.red_spans || []).reduce((sum, span) => sum + span.length, 0);
  if (redOnPage > 0) redPageLengths.push({ page: page.page, length: redOnPage });
  for (const span of record?.red_spans || []) {
    const glyphs = Array.from(span.runes);
    assert.equal(glyphs.length, span.length);
    for (let i = 0; i < span.length; i += 1) {
      const position = span.start + i;
      assert.ok(position < page.indices.length);
      assert.equal(marked.has(position), false);
      assert.equal(corpus.runes[page.indices[position]], glyphs[i]);
      marked.add(position);
      sourceRed.push(page.indices[position]);
      if (page.page < 56) unsolvedRed += 1;
    }
  }
}
assert.equal(corpus.pages.length, 58);
assert.equal(sourceRed.length, 225);
assert.equal(redPageLengths.length, 15);
assert.equal(Math.max(...redPageLengths.map((item) => item.length)), 51);
assert.equal(unsolvedRed, 213);
assert.equal(sourceRed.length - unsolvedRed, 12);

const square = Array.from({ length: 15 }, (_, i) => sourceRed.slice(15 * i, 15 * (i + 1)));
const outer = border(square, 0, 14);
const second = border(square, 1, 13);
const central = square.slice(2, 13).flatMap((row) => row.slice(2, 13));
const restored = new Map();
for (let r = 0; r < 15; r += 1) {
  for (let col = 0; col < 15; col += 1) restored.set(r * 15 + col, square[r][col]);
}
assert.equal(restored.size, 225);
assert.deepEqual(Array.from(restored.values()), sourceRed);
assert.deepEqual([outer.length, second.length, central.length], [56, 48, 121]);
assert.equal(outer.length + second.length + central.length, 225);

const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);
const subtract = central.map((v, i) => mod(v - p32[i]));
const add = central.map((v, i) => mod(v + p32[i]));
const control = p32.map((p, i) => mod(p + central[i]));
assert.deepEqual(control.map((v, i) => mod(v - central[i])), p32, '121-symbol native additive positive control');
assert.deepEqual(control.map((v, i) => mod(v - p32[i])), central, '121-symbol source-red positive control');

// A proposed outer-border to physical-page initial mapping has no
// rune-only meaning on p50, which contains a numerical table but zero runes.
const runelessUnknownPages = corpus.pages.filter((page) => page.page < 56 && page.indices.length === 0).map((page) => page.page);
assert.deepEqual(runelessUnknownPages, [50]);
const starts = corpus.pages.filter((page) => page.page < 56 && page.indices.length !== 0).map((page) => page.indices[0]);
assert.equal(starts.length, 55);

console.log(JSON.stringify({
  source: {
    redTotal: sourceRed.length,
    unsolvedRed,
    solvedRed: sourceRed.length - unsolvedRed,
    sourcePages: corpus.pages.length,
    pagesWithRedRunes: redPageLengths.length,
    sourceRedPerPage: redPageLengths,
    unknownPhysicalPages: 56,
    unknownRuneBearingPages: starts.length,
    unknownRunelessPhysicalPages: runelessUnknownPages
  },
  ringGeometry: { square: [15, 15], outer: outer.length, second: second.length, central: central.length, page32Runes: p32.length },
  hypothesisInputIoc: { fullRed: ioc(sourceRed), outer: ioc(outer), central: ioc(central) },
  directP32Bridge: {
    plusIoc: ioc(add),
    minusIoc: ioc(subtract),
    first20Minus: subtract.slice(0, 20).map((v) => corpus.translit[v]).join('-'),
    first20Plus: add.slice(0, 20).map((v) => corpus.translit[v]).join('-'),
    nativePositiveControlRecovered: 121,
    interpretation: 'No GP-native plaintext recovered; ring-number coincidences do not select a cipher.'
  }
}, null, 2));
