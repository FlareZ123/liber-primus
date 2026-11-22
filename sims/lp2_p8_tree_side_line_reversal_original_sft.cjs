#!/usr/bin/env node
'use strict';

/**
 * Source-frozen tree-side spatial reading on original LP2 p8/p9.
 * Run: node sims/lp2_p8_tree_side_line_reversal_original_sft.cjs
 * Files are read relative to the repository, including on Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const master = fs.readFileSync(path.join(root, 'resources', 'transcriptions', 'liber_primus_master.txt'), 'utf8');

const gpIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @param {string} input @returns {number[]} */
function runes(input) {
  return [...input].filter(symbol => gpIndex.has(symbol)).map(symbol => gpIndex.get(symbol));
}
/** @param {string} input @returns {string[]} */
function pages(input) {
  return input.split(/(?:^|\r?\n)%[ \t]*(?:\r?\n|$)/);
}
/** @param {string} input @returns {number[][]} */
function lines(input) {
  return input.split(/\r?\n/).map(runes).filter(line => line.length > 0);
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  assert(input.length > 1);
  const frequency = Array(29).fill(0);
  for (const rune of input) frequency[rune]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) / (input.length * (input.length - 1));
}
/** @param {number[][]} inputs @returns {number[]} */
function concat(inputs) {
  return inputs.flat();
}
/** @param {number[]} input @param {number} width @returns {{count:number,min:number,max:number}} */
function controlWindows(input, width) {
  const values = [];
  for (let start = 0; start + width <= input.length; start++) {
    values.push(ioc(input.slice(start, start + width)));
  }
  assert(values.length > 0, 'Control must have real full-length windows');
  return {count: values.length, min: Math.min(...values), max: Math.max(...values)};
}
/** @param {number[]} input @returns {string} */
function translit(input) {
  return input.map(index => corpus.translit[index]).join(' ');
}

const lp2 = pages(transcription);
const lp1 = pages(master);
const p8 = corpus.pages.find(page => page.page === 8).indices;
const p9 = corpus.pages.find(page => page.page === 9).indices;
const p8Lines = lines(lp2[8]);
const p9Lines = lines(lp2[9]);
assert.deepEqual(concat(p8Lines), p8, 'LP2 p8 transcription must match canonical runes');
assert.deepEqual(concat(p9Lines), p9, 'LP2 p9 transcription must match canonical runes');
assert.equal(p8.length, 255);
assert.equal(p9.length, 268);
assert.deepEqual(p8Lines.map(line => line.length), [17,16,17,22,22,23,21,23,22,24,24,24]);
assert.deepEqual(p9Lines.map(line => line.length), [21,21,23,21,22,21,22,24,22,25,23,23]);

const p8Black = p8.slice(12);
assert.equal(p8Black.length, 243, 'Remove the twelve original red heading runes');
assert.equal(p8Lines[0].length - 12, 5, 'The black text starts with 5 runes on first printed line');

const last8 = lp2[8].trim().split(/\r?\n/).at(-1).replace(/\/$/, '').split('-').at(-1);
const first9 = lp2[9].split(/\r?\n/)[0].split('-')[0];
assert.equal(last8, 'ᛇ');
assert.equal(first9, 'ᚣᚹᚫᚷᛄ');
const carriedWord = last8 + first9;
assert.equal(runes(carriedWord).length, 6);

// Original images 25.jpg–30.jpg put the same botanical illustration
// at left on p8, right on p9, left on p10, etc.
// Frozen visual candidate: read rune rows from the tree side.
// This example leaves p8 LTR and reverses each p9 rune row.
const p9TreeRight = concat(p9Lines.map(line => [...line].reverse()));
assert.equal(p9TreeRight.length, 268);
assert.equal(ioc(p9TreeRight), ioc(p9));
const treeReadingPair = [...p8Black, ...p9TreeRight];
const originalPair = [...p8Black, ...p9];
assert.equal(ioc(treeReadingPair), ioc(originalPair));

// Pages LP1 p10 and p11 are consecutive, visibly unencrypted GP runes
// in the original master ("MOST THINGS ARE NOT WORTH..." and its continuation).
const positive = [...runes(lp1[10]), ...runes(lp1[11])];
assert.equal(positive.length, 361);
const c243 = controlWindows(positive, 243);
const c268 = controlWindows(positive, 268);

console.log('[SOURCE] LP2 p8 first twelve are red; black=243; total=255; p9=268');
console.log('[SOURCE] p8 line lengths:', p8Lines.map(line => line.length).join(','));
console.log('[SOURCE] p9 line lengths:', p9Lines.map(line => line.length).join(','));
console.log('[SEAM] p8 last rune + p9 first word runes:', carriedWord);
console.log('[TEST] p8 black GP29 IoC:', ioc(p8Black).toFixed(9));
console.log('[TEST] p9 original GP29 IoC:', ioc(p9).toFixed(9));
console.log('[TEST] p9 tree-directed reversal IoC:', ioc(p9TreeRight).toFixed(9));
console.log('[TEST] joined p8 black+p9 IoC:', ioc(originalPair).toFixed(9));
console.log('[TEST] joined tree-directed IoC:', ioc(treeReadingPair).toFixed(9));
console.log('[CONTROL] original clear LP1 p10+p11 runes:', positive.length);
console.log('[CONTROL] 243-runic consecutive windows:', JSON.stringify(c243));
console.log('[CONTROL] 268-runic consecutive windows:', JSON.stringify(c268));
assert(ioc(p8Black) < c243.min);
assert(ioc(p9) < c268.min);
console.log('[DECISION] Every position-only permutation of either original p8 black or p9 retains its original low GP29 IoC.');
console.log('[DECISION] Any additionally fixed symbol bijection also retains IoC. A source-supplied VALUE-changing, stateful rule or non-native plaintext alphabet is missing.');
console.log('[REPRODUCTION] PASS. No recovered plaintext or author-selected key.');
