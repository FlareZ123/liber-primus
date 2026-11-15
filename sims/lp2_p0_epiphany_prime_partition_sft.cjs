'use strict';

/**
 * One-file original-source test of the signed-2016 EPIPHANY SEEKS
 * hypothesis as a prime-length GP29 block-shift key.
 *
 * Run on Windows 11 with Node.js 22 from repository root:
 * node sims/lp2_p0_epiphany_prime_partition_sft.cjs
 *
 * This reads source fixtures only and writes no files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const chapterPages = data.pages.filter((p) => p.page >= 0 && p.page <= 2);
assert.deepStrictEqual(chapterPages.map((p) => [p.page, p.indices.length]),
  [[0, 262], [1, 266], [2, 201]]);
const cipher = chapterPages.flatMap((p) => p.indices);
assert.equal(cipher.length, 729);

// GP-native runes for the *unproved* 2016 phrase EPIPHANY SEEKS.
// GP transliteration uses C for K in SEEKS.
const proposedPlainTitle = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const actualRedTitle = cipher.slice(0, proposedPlainTitle.length);
assert.deepStrictEqual(actualRedTitle,
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const key = actualRedTitle.map((c, i) => (c - proposedPlainTitle[i] + 29) % 29);
assert.deepStrictEqual(key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
const blockLengths = key.map((rune) => data.prime[rune]);
assert.deepStrictEqual(blockLengths,
  [103, 97, 23, 71, 107, 97, 67, 7, 2, 23, 2, 59, 71]);
assert.equal(blockLengths.reduce((total, n) => total + n, 0), cipher.length);

/**
 * Apply each key rune to precisely the number of following positions
 * given by its GP prime. The key and all boundaries are source-derived.
 *
 * @param {number[]} input - Exactly 729 GP29 indices.
 * @param {1|-1} direction - Plus encrypts; minus decrypts.
 * @returns {number[]} Transformed GP29 indices.
 */
function blocks(input, direction) {
  assert.equal(input.length, 729);
  const output = new Array(input.length);
  let pos = 0;
  for (let k = 0; k < key.length; k += 1) {
    const end = pos + blockLengths[k];
    for (; pos < end; pos += 1) {
      output[pos] = (input[pos] + direction * key[k] + 29) % 29;
    }
  }
  assert.equal(pos, input.length);
  return output;
}

/**
 * @param {number[]} xs - GP29 indices.
 * @returns {number} Empirical collision index.
 */
function ioc(xs) {
  const counts = new Array(29).fill(0);
  for (const x of xs) counts[x] += 1;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

const minus = blocks(cipher, -1);
const plus = blocks(cipher, 1);
assert.ok(Math.abs(ioc(cipher) - 0.034082515563997044) < 1e-13);
assert.ok(Math.abs(ioc(minus) - 0.034621414251043876) < 1e-13);
assert.ok(Math.abs(ioc(plus) - 0.03471939583050694) < 1e-13);
assert.deepStrictEqual(blocks(minus, 1), cipher);
assert.deepStrictEqual(blocks(plus, -1), cipher);
assert.notDeepStrictEqual(minus.slice(0, 13), proposedPlainTitle);

// The historical plaintext-F transparent / no-key-consumption rule
// cannot produce a non-F ciphertext symbol when C equals the shift.
let impossibleFPositions = 0;
let impossibleFOutsideTitle = 0;
let offset = 0;
for (let k = 0; k < key.length; k += 1) {
  for (let i = offset; i < offset + blockLengths[k]; i += 1) {
    if (cipher[i] === key[k] && cipher[i] !== 0) {
      impossibleFPositions += 1;
      if (i >= 13) impossibleFOutsideTitle += 1;
    }
  }
  offset += blockLengths[k];
}
assert.equal(impossibleFPositions, 21);
assert.equal(impossibleFOutsideTitle, 20);

// Positive: exact recovery of independently clear solved p57 native GP runes.
const solved = data.pages.find((p) => p.page === 57);
assert.equal(solved.indices.length, 95);
const nativePlant = Array.from({ length: 729 },
  (_, i) => solved.indices[i % solved.indices.length]);
assert.deepStrictEqual(blocks(blocks(nativePlant, 1), -1), nativePlant);

console.log('PASS: source p0-p2 262+266+201 = 729 original runes');
console.log('PASS: proposed title gives 13 fixed key symbols, prime total 729');
console.log('PASS: positive solved-p57 native GP plant, exact 729/729 recovery');
console.log('Original IoC: ' + ioc(cipher).toFixed(12));
console.log('Prime-block C-K IoC: ' + ioc(minus).toFixed(12));
console.log('Prime-block C+K IoC: ' + ioc(plus).toFixed(12));
console.log('Forbidden non-F C==K sites: ' + impossibleFPositions +
  ' (' + impossibleFOutsideTitle + ' after title)');
console.log('First 30 decoded GP runes: ' +
  minus.slice(0, 30).map((x) => data.translit[x]).join(' '));
console.log('NO AUTHENTIC UNKNOWN PLAINTEXT OR CIPHER KEY RECOVERED');
