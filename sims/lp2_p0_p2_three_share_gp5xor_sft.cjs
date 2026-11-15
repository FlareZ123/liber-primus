/**
 * Original LP2 p0-p2 direct five-bit three-share XOR gate.
 * Purpose: test literal transfer of the solved 2014 three-share XOR operation
 * to the three original cross-framed LP2 pages in unchanged reading order.
 * No source author has selected this transfer as an LP2 cipher.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

/** @param {number[]} xs @returns {number[]} */
function histogram32(xs) {
  const counts = Array(32).fill(0);
  for (const x of xs) {
    assert(Number.isInteger(x) && x >= 0 && x < 32);
    counts[x] += 1;
  }
  return counts;
}

/**
 * Place the source-native clear 95-rune PARABLE inside a genuine three-share
 * five-bit XOR plant, choosing valid GP29 symbols for all three shares.
 * @param {number[]} plaintext
 * @returns {number[][]}
 */
function plantThreeShares(plaintext) {
  const out = [[], [], []];
  for (let i = 0; i < plaintext.length; i += 1) {
    const p = plaintext[i];
    assert(Number.isInteger(p) && p >= 0 && p < 29);
    const left = (17 * i + 3) % 29;
    let middle = (11 * i + 7) % 29;
    let right = p ^ left ^ middle;
    for (let tries = 0; right >= 29 && tries < 29; tries += 1) {
      middle = (middle + 1) % 29;
      right = p ^ left ^ middle;
    }
    assert(right < 29, 'a 29-symbol valid share always exists');
    out[0].push(left);
    out[1].push(middle);
    out[2].push(right);
  }
  return out;
}

assert(Array.isArray(corpus.pages) && corpus.pages.length === 58);
const originalPages = [0, 1, 2].map((page) => corpus.pages.find((entry) => entry.page === page));
assert(originalPages.every(Boolean));
assert.deepEqual(originalPages.map((entry) => entry.indices.length), [262, 266, 201]);
const length = 201;
const source = originalPages.map((entry) => entry.indices.slice(0, length));
const combined = Array.from({ length }, (_, i) => source[0][i] ^ source[1][i] ^ source[2][i]);
const frequency = histogram32(combined);
const escapes = combined.flatMap((digit, index) => digit < 29 ? [] : [{ index, digit }]);
const actualEscapeSites = [4, 17, 19, 20, 38, 58, 63, 106, 111, 113, 115, 116, 118, 124, 127, 132, 133, 144, 170, 172, 184, 186];

assert.deepEqual(frequency, [
  4, 6, 5, 5, 8, 6, 4, 6, 6, 4, 3, 1, 7, 7, 5, 8,
  9, 7, 7, 2, 5, 13, 10, 9, 8, 5, 4, 11, 4, 8, 10, 4,
]);
assert.deepEqual(escapes.map(({ index }) => index), actualEscapeSites);
assert.equal(escapes.length, 22);
assert(frequency.every((count) => count > 0), 'all 32 possible outputs occur');

// Every fixed 5-bit bijection, including a global XOR mask, preserves all
// 32 distinct output classes. It cannot serialize losslessly as only 29 GP
// rune identities without an explicitly supplied escape/framing channel.
for (let mask = 0; mask < 32; mask += 1) {
  const masked = combined.map((v) => v ^ mask);
  assert.equal(new Set(masked).size, 32);
  assert(masked.some((v) => v >= 29));
}

// Source-native positive: a deliberately planted 95-rune genuine GP29
// text is exactly recoverable from three VALID GP29 share streams.
const clear = corpus.pages.find((entry) => entry.page === 57);
assert(clear && clear.indices.length === 95 && clear.status === 'solved');
const shares = plantThreeShares(clear.indices);
assert(shares.every((page) => page.every((n) => n >= 0 && n < 29)));
const recovered = clear.indices.map((_, i) => shares[0][i] ^ shares[1][i] ^ shares[2][i]);
assert.deepEqual(recovered, clear.indices);

console.log(JSON.stringify({
  originalPageLengths: originalPages.map((page) => page.indices.length),
  alignedRunes: length,
  distinctFiveBitOutcomes: frequency.filter(Boolean).length,
  invalidGP29Outcomes: escapes.length,
  invalidOriginalOffsets: actualEscapeSites,
  nativeGP29PositiveRecovered: recovered.length,
  decision: 'NO direct GP29 full-window XOR with fixed five-bit relabeling; no unknown plaintext',
}, null, 2));
