'use strict';

/**
 * Original-source test of the proposed five 10-dot macroepochs.
 * Prints exact GP-rune boundaries and numbered-paragraph lengths.
 * Read-only and deterministic. Run: node sims/lp2_five_macroepoch_source_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relativePath */
function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/external/Liber Primus 57.txt');
const runeSet = new Set(corpus.runes);
const lengths = Array.from({ length: 58 }, (_, page) => {
  const entry = corpus.pages.find((item) => item.page === page);
  assert.ok(entry, 'Missing physical page ' + page);
  return entry.indices.length;
});
const offsets = [0];
for (const length of lengths) offsets.push(offsets[offsets.length - 1] + length);

/** @param {number} page @param {number} local */
function absolute(page, local) {
  return offsets[page] + local;
}

const marks = ink.pages.flatMap((page) =>
  (page.large_punctuation || [])
    .filter((mark) => mark[1] === 10)
    .map((mark) => ({ page: page.page, local: mark[0], global: absolute(page.page, mark[0]) }))
).sort((a, b) => a.global - b.global);

assert.deepEqual(marks.map(({ page, local }) => [page, local]), [
  [36, 99], [38, 186], [49, 66], [56, 45]
]);

const numberedStarts = [];
for (const page of [36, 37, 38]) {
  const startTag = '%' + page + '\n';
  const endTag = '%' + (page + 1) + '\n';
  const start = transcription.indexOf(startTag);
  const end = transcription.indexOf(endTag, start + startTag.length);
  assert.ok(start !== -1 && end !== -1);
  const block = transcription.slice(start + startTag.length, end);
  for (const marker of block.matchAll(/\[([1-5])\]/g)) {
    const local = Array.from(block.slice(0, marker.index)).filter((char) => runeSet.has(char)).length;
    numberedStarts.push({ number: Number(marker[1]), page, local, global: absolute(page, local) });
  }
}

assert.deepEqual(numberedStarts.map((p) => [p.number, p.page, p.local]), [
  [1, 36, 99], [2, 37, 0], [3, 37, 91], [4, 37, 189], [5, 38, 57]
]);

const paragraphEnd = absolute(38, 186);
const paragraphs = numberedStarts.map((entry, index) => ({
  ...entry,
  runes: (numberedStarts[index + 1]?.global ?? paragraphEnd) - entry.global
}));
assert.deepEqual(paragraphs.map((p) => p.runes), [139, 91, 98, 96, 129]);
assert.equal(paragraphs.reduce((sum, p) => sum + p.runes, 0), 553);

const boundary = [0, ...marks.map((m) => m.global), offsets[58]];
const unknownEnd = offsets[56];
const epochs = boundary.slice(0, -1).map((start, index) => {
  const end = boundary[index + 1];
  const unknownRunes = Math.max(0, Math.min(end, unknownEnd) - Math.min(start, unknownEnd));
  return { epoch: index + 1, start, end, runes: end - start,
    unknownRunes, solvedRunes: end - start - unknownRunes };
});
assert.deepEqual(epochs.map((p) => p.runes), [8805, 553, 2756, 887, 135]);
assert.deepEqual(epochs.map((p) => p.unknownRunes), [8805, 553, 2756, 842, 0]);
assert.equal(unknownEnd, 12956);
assert.equal(offsets[58], 13136);

console.log(JSON.stringify({ tenDotMarks: marks, numberedParagraphs: paragraphs,
  epochs, unknownEnd, fullRunes: offsets[58] }, null, 2));
