'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(source, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(source, 'lp2-ink-annotations.json'), 'utf8'));
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const lengths = new Map(corpus.pages.map((page) => [page.page, page.indices.length]));
const marked = new Map(ink.pages.map((page) => [
  page.page, (page.red_spans || []).reduce((sum, span) => sum + span.length, 0),
]));
const leftPages = Array.from({ length: 8 }, (_, index) => 7 + index);
const rightPages = Array.from({ length: 8 }, (_, index) => 16 + index);
const left = leftPages.flatMap((page) => pages.get(page));
const right = rightPages.flatMap((page) => pages.get(page));
const center = pages.get(15);
const top = center.slice(0, 9);
const bottom = center.slice(9, 20);
assert.deepEqual((ink.pages.find((page) => page.page === 15).red_spans)
  .map((span) => [span.start, span.length]), [[0, 9], [9, 11]]);
assert.equal(left.length, 1937);
assert.equal(right.length, 1957);
assert.equal(marked.get(15), 20);
assert.equal(right.length - left.length, top.length + bottom.length);

/**
 * An exact, conditional length-allocation comparison. The 16 original page
 * lengths are held fixed; reassignments preserve eight pages on each side.
 * It is not a calibrated probability that the original author intended a fold.
 * @returns {{ total: number, sameDifference: number }}
 */
function allEightEightAllocations() {
  const values = [...leftPages, ...rightPages].map((page) => lengths.get(page));
  const target = left.length;
  let total = 0;
  let sameDifference = 0;
  for (let mask = 0; mask < 65536; mask += 1) {
    let selected = 0;
    let sum = 0;
    for (let index = 0; index < 16; index += 1) {
      if ((mask & (1 << index)) !== 0) {
        selected += 1;
        sum += values[index];
      }
    }
    if (selected === 8) {
      total += 1;
      sameDifference += Number(sum === target);
    }
  }
  return { total, sameDifference };
}
const allocation = allEightEightAllocations();
assert.deepEqual(allocation, { total: 12870, sameDifference: 91 });

const matchedCenters = [];
for (let centerPage = 8; centerPage <= 47; centerPage += 1) {
  let before = 0;
  let after = 0;
  for (let offset = 1; offset <= 8; offset += 1) {
    before += lengths.get(centerPage - offset);
    after += lengths.get(centerPage + offset);
  }
  if (Math.abs(after - before) === (marked.get(centerPage) || 0)) {
    matchedCenters.push(centerPage);
  }
}
assert.deepEqual(matchedCenters, [15]);

/** @param {number[]} symbols @param {number} size @returns {number} */
function coincidence(symbols, size) {
  const counts = new Int32Array(size);
  for (const value of symbols) counts[value] += 1;
  let numerator = 0;
  for (const value of counts) numerator += value * (value - 1);
  return numerator / (symbols.length * (symbols.length - 1));
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

// The explicit physical hypothesis treats p15's two red inscriptions as
// before/after caps around the eight earlier pages. Fold the subsequent eight
// pages by reversing the *whole* right-hand rune stream.
const foldLeft = [...top, ...left, ...bottom];
const foldRight = right.slice().reverse();
assert.equal(foldLeft.length, foldRight.length);
const outputs = [
  { label: 'red9 | earlier pages | red11, minus reversed later pages',
    symbols: foldLeft.map((symbol, index) => mod29(symbol - foldRight[index])), size: 29 },
  { label: 'red9 | earlier pages | red11, plus reversed later pages',
    symbols: foldLeft.map((symbol, index) => mod29(symbol + foldRight[index])), size: 29 },
  { label: 'red9 | earlier pages | red11, XOR reversed later pages',
    symbols: foldLeft.map((symbol, index) => symbol ^ foldRight[index]), size: 32 },
];
const expected = [0.03432385239708957, 0.03456680596004276, 0.03141102204555406];
for (let index = 0; index < outputs.length; index += 1) {
  const sample = outputs[index];
  const ioc = coincidence(sample.symbols, sample.size);
  assert.ok(Math.abs(ioc - expected[index]) < 1e-12);
  const reserved = sample.symbols.filter((symbol) => symbol >= 29).length;
  if (sample.size === 32) assert.equal(reserved, 180);
  console.log(JSON.stringify({
    label: sample.label, length: sample.symbols.length, ioc,
    reserved32Symbols: reserved, first32: sample.symbols.slice(0, 32),
  }));
}
const sampleOriginal = Array.from({ length: 208 }, (_, index) => (index * 7) % 29);
const sourcePad = Array.from({ length: 208 }, (_, index) => (index * 13) % 29);
const planted = sampleOriginal.map((symbol, index) => mod29(symbol + sourcePad[index]));
assert.deepEqual(planted.map((symbol, index) => mod29(symbol - sourcePad[index])), sampleOriginal);
console.log(JSON.stringify({
  sourceLengthBalance: {
    leftPages, leftRunes: left.length, center: 15, redLengths: [9, 11],
    rightPages, rightRunes: right.length, signedDifference: right.length - left.length,
  },
  fixedLengthAllocationNull: allocation,
  allEighthRadiusCentersWithExactRedLengthMatch: matchedCenters,
  result: 'No source-selected original GP29 plaintext or 5-bit text from direct fold',
}));
