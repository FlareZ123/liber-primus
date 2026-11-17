'use strict';

/**
 * Reproduce a source-original falsification of reported 234/1312-rune
 * two-time-pad ciphertext duplicates in external 2026 research.
 * Run: node sims/lp2_original_longrepeat_source_gate_sft.cjs
 * Inputs: only canonical original LP2 rune indices; no plaintext or keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const unknownPages = corpus.pages.filter(p => p.page <= 55);
const page27 = unknownPages.find(p => p.page === 27).indices;
const page44 = unknownPages.find(p => p.page === 44).indices;
const source = unknownPages.flatMap(p => p.indices);

assert.equal(source.length, 12956);
assert.equal(page27.length, 234);
assert.equal(page44.length, 273);
assert.equal(page27[0], 19);
assert.equal(page44[0], 28);

let commonPrefix = 0;
while (commonPrefix < Math.min(page27.length, page44.length)
  && page27[commonPrefix] === page44[commonPrefix]) commonPrefix++;
assert.equal(commonPrefix, 0);

/**
 * Find the earliest duplicate consecutive rune phrase of a given length.
 * @param {number} length
 * @returns {[number, number] | null}
 */
function firstDuplicate(length) {
  const seen = new Map();
  for (let i = 0; i <= source.length - length; i++) {
    const word = source.slice(i, i + length).join(',');
    const earlier = seen.get(word);
    if (earlier !== undefined) return [earlier, i];
    seen.set(word, i);
  }
  return null;
}
assert.deepEqual(firstDuplicate(6), [6555, 12950]);
assert.equal(firstDuplicate(7), null);
assert.equal(firstDuplicate(8), null);

console.log('PASS original unknown runes:', source.length);
console.log('PASS physical p27 length 234 and p44 length 273; prefix equality 0');
console.log('PASS longest repeated contiguous phrase: six runes, offsets 6555 and 12950');
console.log('PASS zero repeated seven-rune phrases anywhere in original p0–55 stream');
