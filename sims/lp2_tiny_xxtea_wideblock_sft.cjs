#!/usr/bin/env node
'use strict';

/**
 * Source-locked original p50 wide-block XXTEA gate prompted by the provisional
 * signed-2016/2017 TINY rune-name acronym. Run from the repository root:
 * node sims/lp2_tiny_xxtea_wideblock_sft.cjs
 *
 * Scope: one 256-byte block (64 32-bit words); original token-defined base60
 * and missing-f base59 readings; predeclared source keys; BE/LE word reading.
 * No key/IV/round sweep, and no inferred original plaintext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
const DELTA = 0x9e3779b9;

/**
 * @param {string[]} flattenedTokens
 * @param {string} alphabet
 * @returns {number[]}
 */
function decodeTokens(flattenedTokens, alphabet) {
  return flattenedTokens.map((token) => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0, 'illegal original token ' + token);
    const value = hi * alphabet.length + lo;
    assert(value >= 0 && value <= 255, 'non-byte original token ' + token);
    return value;
  });
}

/**
 * @param {number[]} bytes
 * @param {boolean} little
 * @returns {number}
 */
function read32(bytes, little) {
  assert.equal(bytes.length, 4);
  return little
    ? (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
    : ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
}

/**
 * @param {number} value
 * @param {boolean} little
 * @returns {number[]}
 */
function write32(value, little) {
  return little
    ? [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, value >>> 24]
    : [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

/**
 * @param {number} z
 * @param {number} y
 * @param {number} sum
 * @param {number} p
 * @param {number} e
 * @param {number[]} key
 * @returns {number}
 */
function mx(z, y, sum, p, e, key) {
  return (((((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4)))
    ^ ((sum ^ y) + (key[(p & 3) ^ e] ^ z)))) >>> 0);
}

/**
 * Exact Wheeler-Needham corrected Block TEA on n >= 2 uint32 words.
 * @param {number[]} input
 * @param {number[]} key
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function xxtea(input, key, decrypt) {
  assert(input.length >= 2);
  assert.equal(key.length, 4);
  const v = input.slice();
  const n = v.length;
  const rounds = 6 + Math.floor(52 / n);
  if (!decrypt) {
    let sum = 0;
    let z = v[n - 1];
    for (let r = 0; r < rounds; r++) {
      sum = (sum + DELTA) >>> 0;
      const e = (sum >>> 2) & 3;
      for (let p = 0; p < n - 1; p++) {
        const y = v[p + 1];
        z = v[p] = (v[p] + mx(z, y, sum, p, e, key)) >>> 0;
      }
      const y = v[0];
      z = v[n - 1] = (v[n - 1] + mx(z, y, sum, n - 1, e, key)) >>> 0;
    }
  } else {
    let sum = Math.imul(rounds, DELTA) >>> 0;
    let y = v[0];
    for (let r = 0; r < rounds; r++) {
      const e = (sum >>> 2) & 3;
      for (let p = n - 1; p > 0; p--) {
        const z = v[p - 1];
        y = v[p] = (v[p] - mx(z, y, sum, p, e, key)) >>> 0;
      }
      const z = v[n - 1];
      y = v[0] = (v[0] - mx(z, y, sum, 0, e, key)) >>> 0;
      sum = (sum - DELTA) >>> 0;
    }
  }
  return v;
}

/**
 * @param {number[]} bytes
 * @returns {{ printable: number, entropy: number, first24: string, sha256: string }}
 */
function byteSummary(bytes) {
  const histogram = Array(256).fill(0);
  for (const b of bytes) histogram[b]++;
  return {
    printable: bytes.filter((b) => b >= 32 && b <= 126).length,
    entropy: Number((-histogram.reduce((s, n) => {
      const p = n / bytes.length;
      return n ? s + p * Math.log2(p) : s;
    }, 0)).toFixed(6)),
    first24: Buffer.from(bytes.slice(0, 24)).toString('hex'),
    sha256: crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  };
}

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const original60 = decodeTokens(tokens, alpha60);
const original59 = decodeTokens(tokens, alpha59);
assert.deepEqual(original60, grid.byte_rows.flat());
assert.equal(original60.filter((v, i) => v !== original59[i]).length, 220);

const spiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const printed = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838, 3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const primes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
const ranks = [1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988];

/** @type {{name: string, words: number[]}[]} */
const candidates = [
  { name: 'TINY GP-prime rune values', words: [59, 107, 29, 103] },
  { name: 'TINY GP-index rune values', words: [16, 27, 9, 26] },
  { name: 'signed GP sums raw', words: [2999, 2819, 2581, 2131] },
  { name: 'signed GP sums F-adjusted', words: [3001, 2819, 2579, 2131] },
  { name: 'prime ranks of signed GP sums', words: [431, 410, 376, 321] },
];
for (const [name, values] of [
  ['p15 spiral', spiral],
  ['p15 printed', printed],
  ['p15 Fibonacci primes', primes],
  ['p15 Fibonacci prime ranks', ranks],
]) {
  for (const little of [false, true]) {
    const bytes = values.map((value) => value & 255);
    candidates.push({
      name: name + (little ? ' key-LE' : ' key-BE'),
      words: Array.from({ length: 4 }, (_, i) => read32(bytes.slice(i * 4, i * 4 + 4), little)),
    });
  }
}
assert.equal(candidates.length, 13);

const records = [];
for (const [radix, byteInput] of [['60', original60], ['59', original59]]) {
  for (const candidate of candidates) {
    const key = candidate.words.map((v) => v >>> 0);
    for (const little of [false, true]) {
      const words = Array.from({ length: 64 }, (_, i) => read32(byteInput.slice(i * 4, i * 4 + 4), little));
      const decoded = xxtea(words, key, true);
      assert.deepEqual(xxtea(decoded, key, false), words, 'original exact roundtrip');
      const output = decoded.flatMap((v) => write32(v, little));
      records.push({
        radix: Number(radix),
        key: candidate.name,
        blockWordEndian: little ? 'LE' : 'BE',
        ...byteSummary(output),
      });
    }
  }
}
assert.equal(records.length, 52);
const nativeControl = Array.from({ length: 64 }, (_, i) => ((i * 0x1020304) ^ 0xdecafbad) >>> 0);
const controlKey = [59, 107, 29, 103];
assert.deepEqual(xxtea(xxtea(nativeControl, controlKey, false), controlKey, true), nativeControl);
const best = [...records].sort((a, b) => b.printable - a.printable);
console.log(JSON.stringify({
  kind: 'source-locked-LP2-p50-XXTEA-wide-block',
  sourceTokens: tokens.length,
  sameRadixByteValues: original60.filter((v, i) => v === original59[i]).length,
  candidateKeys: candidates.length,
  originalDecryptions: records.length,
  roundsPerBlock: 6,
  originalRoundtrips: '52/52 exact',
  syntheticControl: '64/64 uint32 words exact',
  printableRange: [best[best.length - 1].printable, best[0].printable],
  topByPrintable: best.slice(0, 10),
  records,
}, null, 2));
