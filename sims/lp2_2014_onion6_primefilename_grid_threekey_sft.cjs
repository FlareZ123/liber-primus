'use strict';

/**
 * Pre-LP2 2014 Onion6 JPEG filenames as prime ranks and direct byte-table
 * selectors. One fully frozen, source-suggested GP29 inverse at the final
 * illustrated chapter. The table-to-cipher handoff is a hypothesis, never
 * authenticated by the surviving signed Cicada instructions.
 *
 * Run with Node.js 22, standard library only, at repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const source = read('resources/external/cicada2014-onion6-magic-form-and-response.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');

const response = source.files.find((file) =>
  file.archived_path.endsWith('/post2/index.html'));
assert(response);
const imageIds = [...response.raw_html.matchAll(/\/(\d+)\.jpg/g)]
  .map((match) => Number(match[1]));
assert.deepEqual(imageIds, [107, 167, 229]);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++)
    if (n % k === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; n <= Math.max(...imageIds); n++)
  if (isPrime(n)) primes.push(n);
const primeRanks = imageIds.map((id) => primes.indexOf(id) + 1);
assert.deepEqual(primeRanks, [28, 39, 50]);
assert.deepEqual(primeRanks.slice(1).map((id, i) => id - primeRanks[i]),
  [11, 11]);

assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.flatMap((p) => p.tokens).length, 256);
assert.deepEqual(grid.pages.map((p) => [p.page, p.rows, p.cols]),
  [[49, 10, 8], [50, 13, 8], [51, 9, 8]]);
const zeroBased = imageIds.map((id) => grid.bytes[id]);
const oneBased = imageIds.map((id) => grid.bytes[id - 1]);
assert.deepEqual(zeroBased, [218, 248, 0]);
assert.deepEqual(oneBased, [31, 250, 144]);
const runeKeys = [
  { label: 'zero-based', byteValues: zeroBased, shifts: zeroBased.map((v) => v % 29) },
  { label: 'one-based', byteValues: oneBased, shifts: oneBased.map((v) => v % 29) }
];
assert.deepEqual(runeKeys.map((x) => x.shifts), [[15, 16, 0], [2, 18, 28]]);

const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.deepEqual([p54.length, p55.length, p57.length], [232, 76, 95]);
const bodyLength = p54.length - 9;
const target = p54.slice(9).concat(p55);
assert.deepEqual([bodyLength, target.length], [223, 299]);

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign
 */
function direct(input, key, sign) {
  return input.map((c, i) => (c - sign * key[i % key.length] + 58) % 29);
}
/** @param {number[]} input */
function ioc(input) {
  const freq = Array(29).fill(0);
  input.forEach((v) => freq[v]++);
  return freq.reduce((n, v) => n + v * (v - 1), 0) /
    (input.length * (input.length - 1));
}
/**
 * Exact solved-p56 F rule: P=F emits C=F with no key advancement;
 * other plaintext runes consume the stream. Returns first index after
 * which no possible F-position history remains.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function firstImpossible(cipher, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const phase of states) {
      const c = cipher[i];
      if (c === 0) next.add(phase);
      const p = (c - sign * key[phase] + 58) % 29;
      if (p !== 0) next.add((phase + 1) % key.length);
    }
    states = next;
    if (states.size === 0) return i;
  }
  return null;
}
/**
 * Positive control: genuine solved LP2 p57 cleartext encrypted with
 * the exact same F-transparent rule.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 */
function encodeF(plain, key, sign) {
  let phase = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const c = (p + sign * key[phase] + 29) % 29;
    phase = (phase + 1) % key.length;
    return c;
  });
}

const results = [];
for (const model of runeKeys) {
  for (const sign of [-1, 1]) {
    const plain = direct(target, model.shifts, sign);
    const replay = plain.map((p, i) =>
      (p + sign * model.shifts[i % model.shifts.length] + 29) % 29);
    assert.deepEqual(replay, target);
    const impossible = firstImpossible(target, model.shifts, sign);
    assert.notEqual(impossible, null);
    assert.equal(firstImpossible(encodeF(p57, model.shifts, sign),
      model.shifts, sign), null);
    results.push({
      key_index: model.label,
      cipher_sign: sign,
      shifts: model.shifts,
      first_impossible_original_rune: impossible,
      p54_body_ioc: ioc(plain.slice(0, bodyLength)),
      p55_ioc: ioc(plain.slice(bodyLength)),
      first_40_gp_tokens: plain.slice(0, 40).map((v) => corpus.translit[v]).join('')
    });
  }
}
assert.deepEqual(results.map((x) => x.first_impossible_original_rune),
  [130, 15, 0, 12]);
assert(results.every((x) => x.p54_body_ioc < 0.036));
assert(results.every((x) => x.p55_ioc < 0.036));

// The source-prime ranks independently suggest zero-based page ordinals
// 28 and 39, the only two rune-bearing recipients before p50's table.
const rankDirectedPages = [28, 39];
const rankDirectedResults = [];
for (const page of rankDirectedPages) {
  const runes = corpus.pages.find((item) => item.page === page).indices;
  for (const model of runeKeys) {
    for (const sign of [-1, 1]) {
      const impossible = firstImpossible(runes, model.shifts, sign);
      assert.notEqual(impossible, null);
      rankDirectedResults.push({
        physical_page: page,
        page_runes: runes.length,
        key_index: model.label,
        cipher_sign: sign,
        first_impossible_rune: impossible,
        direct_ioc: ioc(direct(runes, model.shifts, sign))
      });
    }
  }
}
assert.deepEqual(rankDirectedResults.map((row) => row.first_impossible_rune),
  [21, 19, 94, 3, 37, 0, 17, 18]);
console.log(JSON.stringify({
  source_jpg_numbers: imageIds,
  prime_ranks_one_based: primeRanks,
  prime_rank_step: 11,
  physical_lp2_page_ranks_if_zero_based: primeRanks,
  source_table_byte_count: grid.bytes.length,
  original_p54_body_length: bodyLength,
  original_p55_heldout_length: p55.length,
  solved_p57_native_gp_ioc: ioc(p57),
  models: results,
  rank_directed_pages: rankDirectedResults,
  unknown_plaintext_recovered: false,
  conclusion: 'No direct 3-byte GP29 transfer; all authentic-F-skip variants impossible.'
}, null, 2));
