'use strict';

/**
 * Frozen original-source check for the 91-rune p33 prologue.
 * Run: node sims/lp2_p33_original_five_line_stage05_sft.cjs
 * Reads authentic canonical files without modifying them.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const p33 = corpus.pages.find((p) => p.page === 33);
const p57 = corpus.pages.find((p) => p.page === 57);
const p33ink = ink.pages.find((p) => p.page === 33);
const GP = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.ok(p33 && p57 && p33ink);

const firstUnit = transcription.split('%')[33].split('&')[0].trim();
const lines = firstUnit.split(/\r?\n/);
const toIndex = (text) => Array.from(text).filter((r) => GP.has(r)).map((r) => GP.get(r));
const lineArrays = lines.map(toIndex);
const src = lineArrays.flat();
const original = p33.indices.slice(0, 91);
assert.deepStrictEqual(src, original, 'Text layout must match original canonical p33 exactly');
assert.deepStrictEqual(lineArrays.map((x) => x.length), [18, 16, 18, 23, 16]);
const joined = firstUnit.replace(/\/\s*\n/g, '');
const words = joined.split(/[.\-]/).map(toIndex).filter((x) => x.length);
assert.equal(words.length, 23);
assert.equal(words.flat().length, 91);
assert.ok(p33ink.red_spans.some((x) => x.start === 0 && x.length === 10));
assert.ok(p33ink.red_spans.some((x) => x.start === 91 && x.length === 8));
assert.ok(p33ink.large_punctuation.some(([offset, dots]) => offset === 91 && dots === 13));

// Exactly the historically attested Stage05 7-place inverse, no phase search.
const order = [0, 6, 2, 5, 1, 4, 3];
const undo = Array(7);
order.forEach((value, index) => { undo[value] = index; });
/** @param {number[]} tape @param {number[]} permutation @returns {number[]} */
function permute(tape, permutation) {
  assert.equal(tape.length % 7, 0);
  const out = [];
  for (let base = 0; base < tape.length; base += 7) {
    for (const k of permutation) out.push(tape[base + k]);
  }
  return out;
}
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const n = tape.length;
  const counts = Array(29).fill(0);
  tape.forEach((rune) => { counts[rune]++; });
  return counts.reduce((s, k) => s + k * (k - 1), 0) / (n * (n - 1));
}
const decoded = permute(original, order);
assert.deepStrictEqual(permute(decoded, undo), original);
const solved = p57.indices.slice(0, 91);
assert.deepStrictEqual(permute(permute(solved, undo), order), solved);
const text = decoded.map((i) => corpus.translit[i]).join(' ');
console.log(JSON.stringify({
  physicalPage: 33,
  originalRuneCount: original.length,
  printedLines: lineArrays.map((x) => x.length),
  printedWords: words.length,
  firstRedHeadingRunes: 10,
  secondRedHeadingStartsAt: 91,
  stage05Order: order,
  forwardReconstruction: '91/91',
  solvedP57PlantRecovery: '91/91',
  originalIoC: ioc(original),
  transformedIoC: ioc(decoded),
  solvedP57IoC: ioc(solved),
  transformedRuneLabels: text
}, null, 2));
