'use strict';

/**
 * Source-original test of a 161 first-occurrence + 95 duplicate-cell
 * table lookup serving the 76+85 unknown/known terminal runes and p57.
 * Run: node sims/lp2_p50_distinct161_terminal95_duplicate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const bytes = grid.byte_rows.flat();
const page = (n) => corpus.pages.find((entry) => entry.page === n).indices;
const known = page(57);
assert.equal(bytes.length, 256);
assert.equal(page(55).length, 76);
assert.equal(page(56).length, 85);
assert.equal(known.length, 95);

const seen = new Map();
const first = [];
const duplicates = [];
for (let i = 0; i < bytes.length; i += 1) {
  const value = bytes[i];
  if (!seen.has(value)) {
    seen.set(value, first.length);
    first.push({byte:value, position:i});
  } else {
    duplicates.push({byte:value, position:i, firstIndex:seen.get(value)});
  }
}
assert.equal(first.length, 161);
assert.equal(duplicates.length, 95);

/**
 * A stationary byte-to-rune lookup requires identical outputs for every
 * repeated original byte. Return the number of direct contradictions.
 * @param {number[]} outputs
 * @returns {{contradictions:number, uniqueRepeated:number}}
 */
function conflicts(outputs) {
  const symbol = new Map();
  let contradictions = 0;
  for (let i = 0; i < duplicates.length; i += 1) {
    const token = duplicates[i].byte;
    if (symbol.has(token) && symbol.get(token) !== outputs[i]) {
      contradictions += 1;
    } else if (!symbol.has(token)) {
      symbol.set(token, outputs[i]);
    }
  }
  return {contradictions, uniqueRepeated:symbol.size};
}

const original = conflicts(known);
assert.deepEqual(original, {contradictions:23, uniqueRepeated:69});
const planted = duplicates.map(({byte}) => byte % 29);
assert.deepEqual(conflicts(planted), {contradictions:0, uniqueRepeated:69});

console.log('Original table: 161 first-occurrence values, 95 later duplicate cells.');
console.log('Terminal target: p55+p56=76+85=161; original clear p57=95.');
console.log('Direct stationary byte lookup contradictions on p57: 23 of 26 repeated-byte consistency constraints.');
console.log('Planted source-shape lookup: 0 contradictions for all 95 repeats.');
