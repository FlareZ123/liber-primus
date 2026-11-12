'use strict';

/**
 * Original-input SFT for Director #579.
 *
 * Frozen historical proposal: ignore the first eight bytes of the original
 * 3,368-byte CicadaOS wisdom/folly file. Read the next 3,360 bytes as
 * 1,680 big-endian u16 words, reduce each word modulo 29, then decode
 * LP2 physical pages 33 through 39 using C - K or C + K.
 *
 * Node.js CommonJS; no additional packages or file writes required.
 * Run from any directory with Node.js:
 * node sims/lp2_2013_wisdom_1680_u16_original_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');

/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

/** @param {number[]} letters */
function ioc(letters) {
  /** @type {number[]} */
  const f = Array(29).fill(0);
  for (const n of letters) f[n]++;
  return f.reduce((acc, n) => acc + n * (n - 1), 0) / (letters.length * (letters.length - 1));
}

/** @param {number[]} ciphertext @param {number[]} key @param {number} sign */
function operate(ciphertext, key, sign) {
  return ciphertext.map((symbol, i) => (symbol + 29 + sign * key[i]) % 29);
}

const bytes = Buffer.from(read('resources/historical/cicada-2013-os-wisdom-folly.bin.b64').replace(/\s/g, ''), 'base64');
assert.equal(bytes.length, 3368, 'Original source file must decode to exactly 3368 bytes');
const header = bytes.subarray(0, 8).toString('hex').toUpperCase();
assert.equal(header, 'BF53C0CC9F66938E', 'Unexpected original eight-byte prefix');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(33, 40);
assert.deepEqual(pages.map((p) => p.runic_count), [214, 261, 271, 238, 228, 228, 240]);
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 1680);
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const originalFragments = read('resources/liber-primus/lp2-transcription.txt').split('%').slice(33, 40);
assert.equal(originalFragments.length, 7);
const sourceRunes = originalFragments.flatMap((section) => Array.from(section).filter((r) => alphabet.has(r)).map((r) => alphabet.get(r)));
assert.deepEqual(sourceRunes, original, 'Printed source rune order and numeric corpus must agree');

const key = Array.from({length: 1680}, (_, i) => bytes.readUInt16BE(8 + 2 * i) % 29);
const minus = operate(original, key, -1);
const plus = operate(original, key, 1);
const wrong = operate(original, key.slice(1).concat(key[0]), -1);
assert.deepEqual(operate(minus, key, 1), original, 'C-K must reencrypt');
assert.deepEqual(operate(plus, key, -1), original, 'C+K must reencrypt');

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const plant = Array.from({length: 1680}, (_, i) => solved[i % solved.length]);
assert.deepEqual(operate(operate(plant, key, 1), key, -1), plant, 'Authentic solved-LP GP29 positive must decode exactly');

/** @param {number[]} decoded */
function renderPrinted(decoded) {
  let position = 0;
  const fragments = originalFragments.map((s) => s.replace(/[\u16A0-\u16FF]/gu, (r) => {
    assert.ok(alphabet.has(r));
    const output = corpus.runes[decoded[position++]];
    assert.ok(output);
    return output;
  }));
  assert.equal(position, 1680);
  assert.deepEqual(fragments.map((s) => Array.from(s).filter((r) => alphabet.has(r)).length), pages.map((p) => p.runic_count));
  return fragments.join('%');
}

console.log('Director #579: exact p33–p39 historical wisdom/folly u16 BE pad');
console.log('Source length:', bytes.length, 'SHA256:', crypto.createHash('sha256').update(bytes).digest('hex'));
console.log('Header8:', header, 'ASCII:', bytes.subarray(0,8).toString('ascii'));
console.log('Page counts:', pages.map((p) => p.runic_count).join(', '));
console.log('Key first16:', key.slice(0, 16).join(', '));
for (const [name, value] of [['raw', original], ['subtract', minus], ['add', plus], ['wrong shifted-source key', wrong], ['solved p57', solved], ['repeated solved p57 positive', plant]]) {
  console.log('GP29 IoC', name, ioc(value).toFixed(12));
}
console.log('Original ± re-encryption: 1680/1680 exact for each sign.');
console.log('Solved-GP planted decrypt/re-encrypt: 1680/1680 exact.');
console.log('\n===== C - K, complete original punctuation and page divisions =====\n');
console.log(renderPrinted(minus));
console.log('\n===== C + K, complete original punctuation and page divisions =====\n');
console.log(renderPrinted(plus));
