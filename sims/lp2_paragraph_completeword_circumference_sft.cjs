#!/usr/bin/env node
'use strict';

/**
 * Source-locked large-mark paragraph circumference test for LP2.
 * Run from repository root: node sims/lp2_paragraph_completeword_circumference_sft.cjs
 * Inputs are the canonical rune corpus, faithful transcription, and complete
 * physical 10/13/23-dot annotations. No fitted cipher or key.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const source = read('lp2-transcription.txt');
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = corpus.pages;
const base = [];
let total = 0;
for (const page of pages) {
  assert.equal(page.page, base.length);
  base.push(total);
  total += page.runic_count;
}
assert.equal(total, 13136);
assert.equal(base[56], 12956);

const words = [];
const sourceIndices = [];
let current = [];
let begin = -1;
let runeOffset = 0;
const flush = (charEnd) => {
  if (current.length === 0) return;
  words.push({
    runeBegin: runeOffset - current.length,
    runeEnd: runeOffset,
    charBegin: begin,
    charEnd,
    indices: current.slice(),
    printed: source.slice(begin, charEnd),
    gp: current.map((i) => corpus.translit[i]).join('')
  });
  current = [];
  begin = -1;
};
for (let index = 0; index < source.length; index += 1) {
  const rune = source[index];
  if (runeToIndex.has(rune)) {
    if (!current.length) begin = index;
    const value = runeToIndex.get(rune);
    current.push(value);
    sourceIndices.push(value);
    runeOffset += 1;
  } else if ('-.,&$'.includes(rune)) {
    flush(index);
  }
}
flush(source.length);
assert.equal(sourceIndices.length, total);
for (const page of pages) {
  assert.deepEqual(
    sourceIndices.slice(base[page.page], base[page.page] + page.runic_count),
    page.indices,
    'Exact unmodified rune content for physical page ' + page.page
  );
}
assert.equal(words.length, 2941);
assert.equal(words.filter((word) => word.runeBegin < base[56]).length, 2896);

const marks = [];
for (const page of ink.pages) {
  for (const [localOffset, count, color] of page.large_punctuation || []) {
    assert.ok([10, 13, 23].includes(count));
    marks.push({
      global: base[page.page] + localOffset,
      physicalPage: page.page,
      count,
      color
    });
  }
}
assert.equal(marks.length, 36);
assert.equal(marks.filter((mark) => mark.count === 13).length, 31);
assert.equal(marks.filter((mark) => mark.count === 10).length, 4);
assert.equal(marks.filter((mark) => mark.count === 23).length, 1);
for (const mark of marks) {
  assert.ok(!words.some((word) => word.runeBegin < mark.global &&
    mark.global < word.runeEnd), 'Large mark intersects a printed word');
}
const boundaries = Array.from(new Set([0, total, ...marks.map((mark) => mark.global)]))
  .sort((a, b) => a - b);
const blocks = [];
for (let i = 1; i < boundaries.length; i += 1) {
  const left = boundaries[i - 1];
  const right = boundaries[i];
  const sectionWords = words.filter((word) =>
    word.runeBegin >= left && word.runeEnd <= right);
  assert.ok(sectionWords.length > 0);
  const first = sectionWords[0];
  const last = sectionWords[sectionWords.length - 1];
  const interior = sectionWords.slice(1, -1);
  const shell = sectionWords.length === 1 ? [first] : [first, last];
  const restored = sectionWords.length === 1 ? [first] : [first, ...interior, last];
  assert.deepEqual(restored, sectionWords);
  blocks.push({
    left, right, words: sectionWords, shell, interior,
    interiorRunes: interior.reduce((sum, word) => sum + word.indices.length, 0)
  });
}
assert.equal(blocks.length, 34);
assert.equal(blocks.filter((block) => block.words.length === 1).length, 3);
assert.equal(blocks.filter((block) => block.words.length === 2).length, 6);
assert.equal(blocks.filter((block) => block.words.length >= 3).length, 25);
const assembled = blocks.flatMap((block) =>
  block.words.length === 1 ? block.shell :
  [block.shell[0], ...block.interior, block.shell[1]]);
assert.deepEqual(assembled, words);
let reconstructed = '';
let lastChar = 0;
for (const word of assembled) {
  reconstructed += source.slice(lastChar, word.charBegin) + word.printed;
  lastChar = word.charEnd;
}
reconstructed += source.slice(lastChar);
assert.equal(reconstructed, source, 'Exact entire transcription including ink-independent separators');

function indicesOf(inputWords) {
  return inputWords.flatMap((word) => word.indices);
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (indices.length * (indices.length - 1));
}
function checkInterval(label, firstPage, lastPageExclusive, expected, includeTitle = true) {
  const start = base[firstPage] + (includeTitle ? 0 : 7);
  const end = lastPageExclusive === pages.length ? total : base[lastPageExclusive];
  const full = sourceIndices.slice(start, end);
  const selected = blocks.filter((block) => block.left >= start && block.right <= end);
  const inside = indicesOf(selected.flatMap((block) => block.interior));
  const all = indicesOf(selected.flatMap((block) => block.words));
  assert.deepEqual(all, full);
  assert.equal(inside.length, expected);
  const shells = selected.map((block) => block.shell.map((word) => word.gp).join(' / '));
  console.log(label + ': ' + full.length + ' original runes, ' +
    inside.length + ' interior runes in ' + selected.length + ' blocks');
  console.log('  IoC original=' + ioc(full).toFixed(8) +
    '; peeled=' + ioc(inside).toFixed(8));
  console.log('  Original first/last words: ' + shells.join(' | '));
  if (label === 'p57 clear body') {
    console.log('  Source-GP interior: ' +
      selected.flatMap((block) => block.interior).map((word) => word.gp).join(' '));
  } else {
    console.log('  Source-GP interior starts: ' +
      selected.flatMap((block) => block.interior).slice(0, 24)
        .map((word) => word.gp).join(' '));
  }
}
console.log('SOURCE EXACT: ' + total + ' runes, ' + words.length +
  ' printed words, ' + marks.length + ' large marks, ' +
  blocks.length + ' nonempty segments.');
console.log('CUT RULE: all original 10/13/23-dot marks; ignore duplicate equal offsets; ' +
  'never treat small stops as section cuts.');
checkInterval('p0-2 original unknown', 0, 3, 703);
checkInterval('p40-53 original unknown', 40, 54, 2994);
checkInterval('p57 clear body', 57, 58, 78, false);
console.log('All original source-rune, source-page, word, punctuation, and ' +
  'lossless transcription reconstruction assertions passed. No original plaintext asserted.');
