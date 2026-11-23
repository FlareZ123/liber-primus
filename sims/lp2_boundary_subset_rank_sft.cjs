/**
 * Original LP2 word-boundary subset-rank side-channel test.
 *
 * A lexicographic constant-weight bitstring rank is a lossless encoding of
 * the actual printed boundary positions, with no editorial word breaks.
 * This is deliberately distinct from ranking the multiset permutation of
 * complete word lengths (the closed historical #1472).
 *
 * Read-only, dependency-free Node.js 22/CommonJS SFT.
 * Run from the repository root: node sims/lp2_boundary_subset_rank_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const corpus = require(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'));
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const pages = source.trim().split(/\n%\s*\n/);
assert.equal(pages.length, 57, 'Only the numeric p50 has no transcription page');
pages.splice(50, 0, '');
assert.equal(pages.length, 58);

const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));

/**
 * Parse real punctuation while retaining cross-page words and every rune.
 * @returns {{ bits: number[], runeCount: number, marks: number, pages: number[] }}
 */
function originalBoundaries() {
  const bits = [];
  const allRunes = [];
  const counts = [];
  let markCount = 0;
  let pendingBreak = false;

  for (let p = 0; p <= 55; p++) {
    const pageRunes = [];
    for (const ch of pages[p]) {
      if (alphabet.has(ch)) {
        if (allRunes.length !== 0) bits.push(pendingBreak ? 1 : 0);
        pendingBreak = false;
        const index = alphabet.get(ch);
        pageRunes.push(index);
        allRunes.push(index);
      } else if (ch === '-' || ch === '.') {
        markCount++;
        pendingBreak = true;
      }
    }
    assert.deepEqual(
      pageRunes,
      corpus.pages[p].indices,
      'Original rune tape must exactly match the canonical physical page'
    );
    counts.push(pageRunes.length);
  }

  return { bits, runeCount: allRunes.length, marks: markCount, pages: counts };
}

/**
 * Exact binomial coefficient on nonnegative integers.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  assert(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const q = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= q; i++) {
    result = (result * BigInt(n - q + i)) / BigInt(i);
  }
  return result;
}

/**
 * Exact lexicographic rank of a fixed-weight boundary tape (0 < 1).
 * At each site an earlier zero branch contains C(left, remaining ones)
 * possible suffixes; selecting a one skips precisely that many.
 * @param {number[]} bits
 * @returns {bigint}
 */
function rankBits(bits) {
  const n = bits.length;
  let r = bits.reduce((total, bit) => total + bit, 0);
  let zeroBranch = choose(n - 1, r);
  let rank = 0n;

  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const bit = bits[i];
    assert(bit === 0 || bit === 1);
    if (bit === 1) {
      rank += zeroBranch;
      r--;
    }
    if (left > 0) {
      const top = bit === 1 ? r + 1 : left - r;
      zeroBranch = (zeroBranch * BigInt(top)) / BigInt(left);
    }
  }
  assert.equal(r, 0);
  return rank;
}

/**
 * Inverse lexicographic unranking for exactly k ones over n positions.
 * @param {bigint} rank
 * @param {number} n
 * @param {number} k
 * @returns {number[]}
 */
function unrankBits(rank, n, k) {
  assert(rank >= 0n && rank < choose(n, k));
  let r = k;
  let remaining = rank;
  let zeroBranch = choose(n - 1, k);
  const bits = [];

  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const bit = remaining >= zeroBranch ? 1 : 0;
    bits.push(bit);
    if (bit === 1) {
      remaining -= zeroBranch;
      r--;
    }
    if (left > 0) {
      const top = bit === 1 ? r + 1 : left - r;
      zeroBranch = (zeroBranch * BigInt(top)) / BigInt(left);
    }
  }
  assert.equal(r, 0);
  assert.equal(remaining, 0n);
  return bits;
}

/**
 * Convert a rank into its minimal unsigned, big-endian byte string.
 * @param {bigint} rank
 * @returns {Buffer}
 */
function rankBytes(rank) {
  let hex = rank.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/**
 * Ordinary empirical zero-order byte entropy, in bits per byte.
 * @param {Buffer} bytes
 * @returns {number}
 */
function entropy(bytes) {
  const counts = Array(256).fill(0);
  for (const b of bytes) counts[b]++;
  return counts.reduce((sum, n) => {
    if (!n) return sum;
    const p = n / bytes.length;
    return sum - p * Math.log2(p);
  }, 0);
}

const parsed = originalBoundaries();
const bits = parsed.bits;
const n = bits.length;
const k = bits.reduce((sum, bit) => sum + bit, 0);
assert.equal(parsed.runeCount, 12956);
assert.equal(n, 12955);
assert.equal(k, 2895);
assert.equal(parsed.runeCount, corpus.pages.slice(0, 56).reduce((sum, page) => sum + page.runic_count, 0));

const capacity = choose(n, k);
const rank = rankBits(bits);
const bytes = rankBytes(rank);
assert(rank < capacity);
assert.deepEqual(unrankBits(rank, n, k), bits);
assert.equal(rankBits(unrankBits(rank, n, k)), rank);
assert.equal(rank.toString(16).slice(0, 32), 'c4554765720fdc0c3893104b7abbf318');
assert.equal(bytes.length, 1240);
assert.equal(bytes.subarray(0, 8).toString('hex'), 'c4554765720fdc0c');
assert.notEqual(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

// Synthetic PNG-signature byte payload is recoverable through the same
// canonical full-corpus constant-weight boundary positions. This is a
// mechanical positive, not an original LP2 image or a valid PNG file.
const planted = Buffer.alloc(bytes.length, 0x55);
Buffer.from('89504e470d0a1a0a', 'hex').copy(planted);
const plantRank = BigInt('0x' + planted.toString('hex'));
assert(plantRank < capacity);
const plantedBits = unrankBits(plantRank, n, k);
const recovered = rankBytes(rankBits(plantedBits));
assert.deepEqual(recovered, planted);
assert.equal(recovered.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

// The original sidecar is high-entropy looking even without a second
// plaintext-rune cipher. These diagnostics have deliberately fixed scope.
const compressed = zlib.deflateSync(bytes);
const printable = [...bytes].filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)).length;
console.log(JSON.stringify({
  status: 'PASS',
  originalRunes: parsed.runeCount,
  originalBoundarySites: n,
  originalStops: k,
  originalWords: k + 1,
  theoreticalBitCapacity: capacity.toString(2).length - 1,
  originalRankBits: rank.toString(2).length,
  originalByteLength: bytes.length,
  originalSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  originalPrefixHex: bytes.subarray(0, 32).toString('hex'),
  originalSuffixHex: bytes.subarray(-32).toString('hex'),
  originalEntropyBitsPerByte: entropy(bytes),
  originalPrintableFraction: printable / bytes.length,
  originalDeflatedBytes: compressed.length,
  pngSignatureOnOriginal: false,
  plantedPngHeaderRoundTrip: true,
  fullOriginalBoundaryRoundTrip: true,
}, null, 2));
