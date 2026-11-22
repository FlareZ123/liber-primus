'use strict';

/**
 * Source-bounded LP2 ChaCha20/256 original inverse:
 * eight printed grid columns as eight 32-byte keys, one per historical
 * eight text-source sections. This cipher/key relationship is hypothetical.
 *
 * Usage: node sims/lp2_grid8_chacha20_column_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const pages = source('resources/liber-primus/lp2-corpus.json').pages;
const C = pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const grid = source('resources/liber-primus/lp2-grid-256.json').bytes;
const ends = [729, 1874, 3612, 5506, 6527, 7960, 9640, 12956];
const starts = [0, ...ends.slice(0, -1)];
assert.equal(C.length, 12956);
assert.equal(grid.length, 256);
assert.equal(ends[7], C.length);
const keys = Array.from({length: 8}, (_, col) =>
  Buffer.from(Array.from({length: 32}, (_, row) => grid[row * 8 + col])));

/** @param {Buffer} key @param {number} n @returns {Buffer} */
function keystream(key, n) {
  return crypto.createCipheriv('chacha20', key, Buffer.alloc(16))
    .update(Buffer.alloc(n));
}

// OpenSSL's 256-bit ChaCha20 uses a 16-byte counter-plus-nonce IV.
// Test against the independent all-zero ChaCha20 known-answer vector.
const known = '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586';
assert.equal(keystream(Buffer.alloc(32), 64).toString('hex'), known);
const streams = Array.from({length: 8}, (_, col) =>
  ends.map((end, section) => keystream(keys[col], end - starts[section])));

const mod = value => ((value % 29) + 29) % 29;
/**
 * The "difference" variant enciphers the current ciphertext difference,
 * seeded at previous ciphertext 0 at each historical section.
 * @param {number[]} ciphertext @param {Buffer} pad
 * @param {'direct'|'difference'} kind @param {1|-1} sign
 */
function decode(ciphertext, pad, kind, sign) {
  let previous = 0;
  return ciphertext.map((c, i) => {
    const p = mod((kind === 'direct' ? c : c - previous) - sign * (pad[i] % 29));
    previous = c;
    return p;
  });
}
/**
 * @param {number[]} plaintext @param {Buffer} pad
 * @param {'direct'|'difference'} kind @param {1|-1} sign
 */
function encode(plaintext, pad, kind, sign) {
  let previous = 0;
  return plaintext.map((p, i) => {
    const c = mod(p + sign * (pad[i] % 29) +
      (kind === 'difference' ? previous : 0));
    previous = c;
    return c;
  });
}
/** @param {number[]} plain */
function matches(plain) {
  const hist = Array(29).fill(0);
  for (const rune of plain) hist[rune]++;
  return hist.reduce((n, count) => n + count * (count - 1), 0);
}
/** Exact maximum-weight injective assignment of 8 grid columns to 8 sections. */
function assignment(matrix) {
  const dp = Array.from({length: 256}, () => ({weight: -Infinity, cols: []}));
  dp[0] = {weight: 0, cols: []};
  for (let mask = 0; mask < 256; mask++) {
    if (dp[mask].weight === -Infinity) continue;
    const section = dp[mask].cols.length;
    if (section === 8) continue;
    for (let col = 0; col < 8; col++) {
      if (mask & (1 << col)) continue;
      const next = mask | (1 << col);
      const weight = dp[mask].weight + matrix[section][col].pairs;
      if (weight > dp[next].weight)
        dp[next] = {weight, cols: [...dp[mask].cols, col]};
    }
  }
  return dp[255];
}
function run() {
  const solved = pages.find(p => p.page === 57).indices;
  assert.ok(solved.length > 50);
  const controls = [];
  const rows = [];
  for (const kind of ['direct', 'difference']) for (const sign of [1, -1]) {
    const pad = keystream(keys[3], solved.length);
    const planted = encode(solved, pad, kind, sign);
    const got = decode(planted, pad, kind, sign);
    assert.deepEqual(got, solved, 'exact solved-LP2 planted decryption');
    controls.push({kind, sign, matchedRunes: got.length});
    const matrix = ends.map((end, section) =>
      keys.map((key, col) => {
        const plain = decode(C.slice(starts[section], end),
          streams[col][section], kind, sign);
        assert.deepEqual(encode(plain, streams[col][section], kind, sign),
          C.slice(starts[section], end), 'original ciphertext round trip');
        return {pairs: matches(plain), count: plain.length};
      }));
    const best = assignment(matrix);
    const winner = best.cols.map((col, s) => matrix[s][col]);
    const denom = winner.reduce((n, item) => n + item.count * (item.count - 1), 0);
    rows.push({
      kind, sign, columnsBySection: best.cols,
      pooledIoC: best.weight / denom,
      sectionIoC: winner.map(v => v.pairs / (v.count * (v.count - 1))),
      bestOneSectionIoC: Math.max(...matrix.flatMap(row =>
        row.map(v => v.pairs / (v.count * (v.count - 1)))))
    });
  }
  return {cipher: 'ChaCha20 256, zero 16-byte counter/nonce, fresh each section',
    sectionLengths: ends.map((end, i) => end - starts[i]),
    keys: '32 consecutive rows of each of the eight original grid columns',
    score: 'exact GP29 matched-pair IoC, globally optimal assignment by DP',
    controls, rows};
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, keystream, decode, encode, assignment};
