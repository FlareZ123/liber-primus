'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const page = (n) => corpus.pages.find((item) => item.page === n);
const runeSet = new Set(corpus.runes);
const p6 = page(6);
const p32 = page(32);
assert.equal(p6.indices.length, 196);
assert.equal(p32.indices.length, 121);

for (const [imageName, expected] of [
  ['23.jpg', '4c7dce370242c67a7b785828d75547c042717b221d9d565d7dd097834c7b25d7'],
  ['32.jpg', '5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5'],
  ['74.jpg', '1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b'],
]) {
  const bytes = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', imageName));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), expected, imageName);
}

const sourcePages = transcription.split(/^%\s*$/m);
const p6Lines = sourcePages[6].split(/\r?\n/).map((line) =>
  [...line].filter((rune) => runeSet.has(rune)).length
).filter((n) => n > 0);
assert.deepEqual(p6Lines, [20, 24, 24, 3, 18, 19, 20, 24, 22, 22]);
assert.equal(p6Lines.reduce((a, b) => a + b, 0), p6.indices.length);
assert.equal(p6Lines.slice(0, 4).reduce((a, b) => a + b, 0), 71);

const p6Ink = ink.pages.find((item) => item.page === 6);
assert.deepEqual(p6Ink.large_punctuation, [[71, 13, 'red'], [82, 13, 'red']]);
assert.equal(p6Ink.red_spans[0].start, 71);
assert.equal(p6Ink.red_spans[0].length, 11);
assert.deepEqual(p6.indices.slice(71, 82).map((i) => corpus.runes[i]),
  [...p6Ink.red_spans[0].runes]);

/** @param {number} side @param {number} peels @returns {number[]} */
function centerOffsets(side, peels) {
  assert.ok(Number.isInteger(side) && Number.isInteger(peels) && side >= 2 * peels + 1);
  const positions = [];
  for (let row = peels; row < side - peels; row++) {
    for (let col = peels; col < side - peels; col++) {
      positions.push(row * side + col);
    }
  }
  return positions;
}

const center = centerOffsets(14, 5);
assert.deepEqual(center, [75, 76, 77, 78, 89, 90, 91, 92, 103, 104, 105, 106, 117, 118, 119, 120]);
assert.equal(center.filter((offset) => offset >= 71 && offset < 82).length, 4);
assert.equal(center.filter((offset) => offset >= 82).length, 12);
const readable = center.map((offset) => corpus.translit[p6.indices[offset]]);
assert.deepEqual(readable, ['M', 'G', 'IA', 'S', 'X', 'E', 'T', 'O', 'OE', 'O', 'H', 'R', 'N', 'R', 'EO', 'AE']);
assert.deepEqual(centerOffsets(11, 5), [60]);
assert.equal(corpus.translit[p32.indices[60]], 'W');
assert.equal(corpus.prime[p32.indices[60]], 19);

const labelled = Array.from({ length: 196 }, (_, i) => i);
const extracted = center.map((offset) => labelled[offset]);
const reconstructed = Array(196).fill(null);
center.forEach((offset, i) => { reconstructed[offset] = extracted[i]; });
assert.deepEqual(center.map((offset) => reconstructed[offset]), extracted);
console.log('PASS original p6 lines:', p6Lines.join(','));
console.log('PASS p6 section sizes: preceding text=71, red heading=11, subsequent text=114');
console.log('PASS inferred 14x14 five-peel center GP:', readable.join(' '));
console.log('PASS center contains four red title glyphs and twelve black body glyphs');
console.log('PASS p32 conditional 11x11 center W/19; all three source JPEG hashes match');
console.log('DECISION source selects neither 14x14 cross-chapter reflow nor p15→p6 state/clock; no plaintext claimed');
