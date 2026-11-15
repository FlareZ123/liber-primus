'use strict';

/**
 * A source-selected GP-prime-sum / 256-cell self-key test on actual LP2 words.
 * Run with: node sims/lp2_p57_wordsum_grid_selfkey_original_sft.cjs
 * No dependencies or writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/base60-grid.json');
const transcript = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * Read complete printed words across original page and line carries.
 * Source punctuation '-' and '.' closes a word; '/' and page '%' do not.
 * @param {string} source
 * @returns {number[][]}
 */
function parseWords(source) {
  let runes = '';
  for (const glyph of source) {
    if (runeMap.has(glyph)) runes += glyph;
    else if (glyph === '-' || glyph === '.') runes += '|';
  }
  return runes.split('|').filter(Boolean).map((word) => Array.from(word, (r) => runeMap.get(r)));
}

/** @param {number} x @param {number} modulus */
function mod(x, modulus) {
  return ((x % modulus) + modulus) % modulus;
}

/** @param {number[]} word */
function primeSum(word) {
  return word.reduce((sum, r) => sum + corpus.prime[r], 0);
}

const segments = transcript.split('%');
const words = parseWords(segments.slice(0, 55).join(''));
const solved = parseWords(segments.at(-1));
assert.equal(words.length, 2896);
assert.equal(words.flat().length, 12956);
assert.deepEqual(words.flat(), corpus.pages.slice(0, 56).flatMap((page) => page.indices));
assert.equal(solved.length, 20);
assert.deepEqual(solved.flat(), corpus.pages[57].indices);

const bytes = grid.byte_rows.flat();
const tokens = grid.rows.flat();
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
for (let i = 0; i < 256; i++) {
  const token = tokens[i];
  assert.equal(token.length, 2);
  assert.equal(grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]), bytes[i]);
}
assert.equal(new Set(tokens).size, 161);

/** Use p57's already documented one-based GP prime-sum address convention.
 * @param {number[]} word
 */
function tableKey(word) {
  return bytes[mod(primeSum(word) - 1, 256)] % 29;
}

/**
 * For the self-indexed model, the key is selected by the *plaintext* word.
 * A correct inverse must find a legal key independently for every source word.
 * @param {number[]} cipher
 * @param {number} sign  C = P + sign * k (mod 29)
 * @returns {number[]}
 */
function possibleKeys(cipher, sign) {
  const options = [];
  for (let k = 0; k < 29; k++) {
    const plain = cipher.map((r) => mod(r - sign * k, 29));
    if (tableKey(plain) === k) options.push(k);
  }
  return options;
}

function wordByTranslit(word) {
  return word.map((r) => corpus.translit[r]).join('');
}
const tunnel = solved.find((word) => wordByTranslit(word) === 'TUNNELNG');
const divinity = solved.find((word) => wordByTranslit(word) === 'DIUINITY');
assert.ok(tunnel);
assert.ok(divinity);
assert.equal(primeSum(tunnel), 339);
assert.equal(primeSum(divinity), 376);
assert.equal(bytes[mod(primeSum(tunnel) - 1, 256)], 201);
assert.equal(bytes[mod(primeSum(divinity) - 1, 256)], 184);
assert.equal(primeSum(tunnel.slice(1, -1)), 201);
assert.equal(primeSum(divinity.slice(1, -1)), 184);

const histograms = [];
for (const sign of [1, -1]) {
  const hist = Array(9).fill(0);
  for (const word of words) {
    const count = possibleKeys(word, sign).length;
    assert.ok(count < hist.length);
    hist[count]++;
  }
  histograms.push({ sign, histogram: hist, noPlaintextKey: hist[0] });
}
assert.deepEqual(histograms[0].histogram, [1068, 1096, 511, 166, 44, 10, 1, 0, 0]);
assert.deepEqual(histograms[1].histogram, [1106, 1010, 536, 185, 52, 6, 1, 0, 0]);

// Source-native planted controls use ALL 20 authentic p57 clear words.
for (const sign of [1, -1]) {
  for (const plain of solved) {
    const k = tableKey(plain);
    const cipher = plain.map((r) => mod(r + sign * k, 29));
    assert.ok(possibleKeys(cipher, sign).includes(k));
    assert.deepEqual(cipher.map((r) => mod(r - sign * k, 29)), plain);
  }
}

/** @param {number[]} source */
function ioc(source) {
  const frequency = Array(29).fill(0);
  source.forEach((r) => frequency[r]++);
  return frequency.reduce((s, n) => s + n * (n - 1), 0) / (source.length * (source.length - 1));
}
const raw = words.flat();
const direct = [];
for (const sign of [1, -1]) {
  const decoded = words.flatMap((word) => {
    const key = tableKey(word);
    return word.map((r) => mod(r - sign * key, 29));
  });
  direct.push({ sign, coincidence: ioc(decoded), opening: decoded.slice(0, 45).map((r) => corpus.translit[r]).join(' ') });
}
assert.ok(Math.abs(ioc(raw) - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(direct[0].coincidence - 0.03452053198135566) < 1e-12);
assert.ok(Math.abs(direct[1].coincidence - 0.03445942797931758) < 1e-12);
console.log(JSON.stringify({ source: { words: words.length, runes: raw.length, p57Words: solved.length }, histograms, direct }, null, 2));
