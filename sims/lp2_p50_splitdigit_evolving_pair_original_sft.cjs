'use strict';

/**
 * SFT: p50's printed high/low base60 glyph digits drive two distinct
 * nonlinear-mixing pair roles with previous-cipher-pair feedback.
 *
 * This is a frozen, conditional 2014-executable hypothesis, not a
 * source-authenticated Cicada cipher and not an inferred secret.
 *
 * node sims/lp2_p50_splitdigit_evolving_pair_original_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'base60-grid.json'
), 'utf8'));

assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.deepEqual(grid.rows.map(row => row.length), Array(32).fill(8));
const cells = grid.rows.flat();
assert.equal(cells.length, 256);
assert.deepEqual(cells.slice(0, 8), ['3N', '3p', '2l', '36', '1b', '3v', '26', '33']);
const high = cells.map(token => grid.alphabet.indexOf(token[0]));
const low = cells.map(token => grid.alphabet.indexOf(token[1]));
assert(high.every(v => v >= 0 && v <= 4));
assert(low.every(v => v >= 0 && v < 60));
assert.deepEqual(high.map((h, i) => h * 60 + low[i]), grid.byte_rows.flat());
assert.equal(high.length, 256);

/**
 * Return the canonical nonnegative representative in GF29.
 * @param {number} x
 * @returns {number}
 */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Each original two-rune ciphertext group C=(A,B) uses the corresponding
 * table-cell high digit h (0..4) and low digit l (0..59), row-major.
 *
 * Plain_b = B - l - prev_cipher_a                  (mod29)
 * Plain_a = A - h - Plain_b - prev_cipher_b        (mod29)
 *
 * Update previous ciphertext pair to (A,B). Start pair at (0,0).
 *
 * The 2nd source character sets B's shift, the 1st character sets A's shift.
 * A depends on recovered Plain_b, so the operation mixes both plaintext
 * coordinates; previous ciphertext pair evolves between table-cell visits.
 * All steps are invertible, even when table cell index wraps after 256 pairs.
 *
 * @param {number[]} cipher
 * @returns {number[]}
 */
function decrypt(cipher) {
  assert.equal(cipher.length % 2, 0);
  const plain = [];
  let prevA = 0, prevB = 0;
  for (let i = 0; i < cipher.length; i += 2) {
    const j = (i / 2) % cells.length;
    const a = cipher[i], b = cipher[i + 1];
    const pb = mod29(b - low[j] - prevA);
    const pa = mod29(a - high[j] - pb - prevB);
    plain.push(pa, pb);
    prevA = a;
    prevB = b;
  }
  return plain;
}

/**
 * @param {number[]} plain
 * @returns {number[]}
 */
function encrypt(plain) {
  assert.equal(plain.length % 2, 0);
  const cipher = [];
  let prevA = 0, prevB = 0;
  for (let i = 0; i < plain.length; i += 2) {
    const j = (i / 2) % cells.length;
    const pa = plain[i], pb = plain[i + 1];
    const a = mod29(pa + high[j] + pb + prevB);
    const b = mod29(pb + low[j] + prevA);
    cipher.push(a, b);
    prevA = a;
    prevB = b;
  }
  return cipher;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    counts[v] += 1;
  }
  const n = values.length;
  return counts.reduce((sum, k) => sum + k * (k - 1), 0) / (n * (n - 1));
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function topFiveShare(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  counts.sort((a, b) => b - a);
  return counts.slice(0, 5).reduce((a, b) => a + b, 0) / values.length;
}

function originalRange(first, last) {
  return corpus.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}

const originalPost = originalRange(51, 53);
const originalHold = originalRange(16, 22);
assert.deepEqual(corpus.pages.filter(p => p.page >= 51 && p.page <= 53)
  .map(p => p.indices.length), [92, 263, 179]);
assert.equal(originalPost.length, 534);
assert.equal(originalHold.length, 1744);
assert.deepEqual(originalPost.slice(0, 2), [7, 7]);

const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
assert(ioc(solved) > 0.055);
assert(topFiveShare(solved) > 0.45);

for (const [label, original, expectedIoC] of [
  ['p51-p53', originalPost, 0.03495864690712594],
  ['p16-p22 holdout', originalHold, 0.03428326674983025],
]) {
  const plaintextCandidate = decrypt(original);
  assert.deepEqual(encrypt(plaintextCandidate), original);
  assert(Math.abs(ioc(plaintextCandidate) - expectedIoC) < 1e-12);
  assert(ioc(plaintextCandidate) < 0.04);
  assert(topFiveShare(plaintextCandidate) < 0.25);

  // Full-length solved-author language positive, independent of the unknown
  // original source: 95 source-clear p57 symbols repeated to the required
  // target size, then encrypted and inverted under the identical state law.
  const native = Array.from({length: original.length}, (_, i) => solved[i % solved.length]);
  const nativeEncrypted = encrypt(native);
  assert.deepEqual(decrypt(nativeEncrypted), native);
  assert.deepEqual(encrypt(decrypt(nativeEncrypted)), nativeEncrypted);
  assert(ioc(native) > 0.055);
  assert(ioc(decrypt(nativeEncrypted)) > 0.055);

  // Wording must preserve multi-roman-letter Gematria-Primus symbols.
  const head = plaintextCandidate.slice(0, 48)
    .map(i => corpus.translit[i]).join(' ');
  console.log(label + ' source=' + original.length + ' runes; ' +
    'original IoC=' + ioc(original).toFixed(9) +
    ', pair-decoded IoC=' + ioc(plaintextCandidate).toFixed(9) +
    ', top5=' + topFiveShare(plaintextCandidate).toFixed(6) +
    ', 100% ciphertext replay, native GP plant=' + native.length + '/' + native.length);
  console.log('original recovered-GP48: ' + head);
}

console.log('PASS: all 256 original base60 tokens, both output coordinates, ' +
  'changing ciphertext feedback and exact source-native positive. ' +
  'No fluent unknown-page plaintext/key recovered under the one frozen equation.');
