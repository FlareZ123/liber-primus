'use strict';

/**
 * Original-source test for a size-selected historical 2015 OutGuess claim.
 * Read-only; all 58 original LP2 scan JPEGs, source scans 17.jpg through 74.jpg.
 * Exact 1-based original release ordering: page = scan number - 16.
 * Run: node sims/lp2_2015_outguess_size_rank_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const originals = path.join(root, 'resources', 'liber-primus');
const observed = [1, 5, 27, 41, 42, 43, 44, 45, 46, 47, 48, 49, 53, 54, 55];
const records = Array.from({ length: 58 }, (_, i) => {
  const page = i + 1;
  const scan = i + 17;
  const filename = path.join(originals, `${String(scan).padStart(2, '0')}.jpg`);
  return { page, scan, bytes: fs.statSync(filename).size };
});
assert.equal(records.length, 58);
assert.equal(new Set(records.map(row => row.page)).size, 58);
assert.equal(records[0].bytes, 695525);
assert.equal(records[57].scan, 74);

const ranked = [...records].sort((a, b) => b.bytes - a.bytes || a.page - b.page);
const largest15 = ranked.slice(0, 15);
const largestPages = largest15.map(row => row.page).sort((a, b) => a - b);
assert.deepEqual(largestPages, observed);
assert.equal(ranked[14].page, 5);
assert.equal(ranked[14].bytes, 676634);
assert.equal(ranked[15].page, 6);
assert.equal(ranked[15].bytes, 667716);
assert.ok(ranked[14].bytes > ranked[15].bytes);
assert.deepEqual(records.filter(row => row.bytes >= 676634).map(row => row.page), observed);

// Mutation control: replacing the 15th-largest source file's byte length
// with the 16th-largest size must alter the ranked set.
const altered = records.map(row => ({
  ...row,
  bytes: row.page === 5 ? 0 : row.bytes,
}));
assert.notDeepEqual(
  altered.sort((a, b) => b.bytes - a.bytes || a.page - b.page)
    .slice(0, 15).map(row => row.page).sort((a, b) => a - b),
  observed,
);

console.log(JSON.stringify({
  hypothesis: 'Historical reported output-positive pages are exactly the 15 largest original LP2 JPEGs',
  historicalPageNumbersAreOneBased: true,
  corpus: 'Original source scans 17.jpg..74.jpg, mapped to pages 1..58',
  testedPages: records.length,
  historicalPositiveLabels: observed,
  top15Descending: largest15,
  smallestPositiveBytes: ranked[14].bytes,
  largestOtherBytes: ranked[15].bytes,
  result: 'EXACT size-ranking identity; no claim of actual payload or OutGuess validity',
}, null, 2));
