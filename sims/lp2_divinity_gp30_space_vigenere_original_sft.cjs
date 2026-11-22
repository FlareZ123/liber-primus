'use strict';

/**
 * SFT: a historically motivated, invertible GP30 SPACE-changing decoder.
 *
 * The real LP1 Vigenere key DIVINITY is a primary-source-visible operand.
 * The original 2013 GP chart has 29 runes and a blank slot. This experiment
 * explicitly tests one speculative extension: treat each source word mark
 * ('-' or '.') as ciphertext SPACE=29; run DIVINITY Vigenere modulo 30,
 * beginning with the first LP2 token and advancing on every token.
 *
 * This test never tunes a key, phase, reset, space placement, or ciphertext
 * word dictionary. It is a conditional test, not a recovered LP2 cipher.
 *
 * Windows 11 / Node 22: node sims/lp2_divinity_gp30_space_vigenere_original_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const segments = transcript.split('$');
const cipherSource = segments.slice(0, 8).join('$');
const runeValue = new Map(corpus.runes.map((rune, i) => [rune, i]));
const divinity = [23, 10, 1, 10, 9, 10, 16, 26];
assert.equal(segments.length, 10);
assert.deepEqual(divinity.map((n) => corpus.translit[n]).join(''), 'DIUINITY');

/**
 * @typedef {{digit:number, offset:number, page:number, kind:string}} Token
 *
 * Decode only source rune glyphs and two printed marks as GP30 ciphertext.
 * All other source typography remains an exact immutable sidecar.
 * @param {string} source
 * @param {number[]} physicalPageOwners
 * @returns {{tokens:Token[], runes:number[]}}
 */
function tokenize(source, physicalPageOwners) {
  /** @type {Token[]} */
  const tokens = [];
  const runes = [];
  let currentPage = physicalPageOwners.length ? physicalPageOwners[0] : 57;
  for (let offset = 0; offset < source.length; offset++) {
    const char = source[offset];
    const n = runeValue.get(char);
    if (n !== undefined) {
      if (physicalPageOwners.length) {
        currentPage = physicalPageOwners[runes.length];
        assert.ok(Number.isInteger(currentPage));
      }
      runes.push(n);
      tokens.push({digit:n, offset, page:currentPage, kind:'rune'});
    } else if (char === '-' || char === '.') {
      tokens.push({digit:29, offset, page:currentPage, kind:char});
    }
  }
  assert.equal(runes.length, physicalPageOwners.length || runes.length);
  return {tokens, runes};
}

/** @param {number[]} digits @returns {number[]} */
function decipher(digits) {
  return digits.map((c, i) => (c - divinity[i % divinity.length] + 30) % 30);
}

/** @param {number[]} digits @returns {number[]} */
function encipher(digits) {
  return digits.map((p, i) => (p + divinity[i % divinity.length]) % 30);
}

/** @param {number[]} digits */
function stats(digits) {
  const freq = Array(30).fill(0);
  for (const n of digits) {
    assert.ok(Number.isInteger(n) && n >= 0 && n < 30);
    freq[n]++;
  }
  const nonspace = digits.length - freq[29];
  const collisions = freq.slice(0, 29).reduce((total, n) => total + n * (n - 1), 0);
  return {
    tokens:digits.length,
    spaces:freq[29],
    spaceRate:freq[29] / digits.length,
    runeIoC:collisions / (nonspace * (nonspace - 1))
  };
}

/** @param {number[]} digits @param {number} length */
function romanize(digits, length) {
  return digits.slice(0, length).map((digit) =>
    digit === 29 ? ' ' : corpus.translit[digit]).join('');
}

const pages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const pageOwners = pages.flatMap((p) => p.indices.map(() => p.page));
const originalRunes = pages.flatMap((p) => p.indices);
const source = tokenize(cipherSource, pageOwners);
const digits = source.tokens.map((t) => t.digit);
const plain = decipher(digits);
const reciphered = encipher(plain);

assert.equal(source.runes.length, 12956);
assert.deepEqual(source.runes, originalRunes);
assert.equal(source.tokens.length, 15858);
assert.equal(digits.filter((n) => n === 29).length, 2902);
assert.deepEqual(reciphered, digits);

// Exact byte-for-byte source replay, with the original period-versus-gap
// distinction, Unicode glyphs, line-wraps, chapter marks and page carries.
const replay = Array.from(cipherSource);
for (let i = 0; i < source.tokens.length; i++) {
  const token = source.tokens[i];
  const symbol = reciphered[i];
  if (token.kind === 'rune') {
    assert.ok(symbol < 29);
    replay[token.offset] = corpus.runes[symbol];
  } else {
    assert.equal(symbol, 29);
    assert.ok(token.kind === '-' || token.kind === '.');
    replay[token.offset] = token.kind;
  }
}
assert.equal(replay.join(''), cipherSource);

function interval(firstPage, lastPage) {
  /** @type {number[]} */
  const sampled = [];
  let sourceRuneCount = 0;
  for (let i = 0; i < source.tokens.length; i++) {
    const token = source.tokens[i];
    if (token.page >= firstPage && token.page <= lastPage) {
      sampled.push(plain[i]);
      if (token.kind === 'rune') sourceRuneCount++;
    }
  }
  return {sampled, sourceRuneCount};
}

const dev = interval(16, 21);
const hold = interval(40, 53);
assert.equal(dev.sourceRuneCount, 1613);
assert.equal(hold.sourceRuneCount, 3008);
const allStats = stats(plain);
const devStats = stats(dev.sampled);
const holdStats = stats(hold.sampled);
assert.equal(allStats.spaces, 444);
assert.equal(devStats.spaces, 59);
assert.equal(holdStats.spaces, 106);

// Independent native-GP positive control: p57 is actually printed in clear
// GP with authentic word marks, and the same full GP30 bijection must
// reencrypt/decrypt every original token. Ciphertext symbols can be SPACE.
const solvedP57 = tokenize(segments[9], []);
const nativeDigits = solvedP57.tokens.map((t) => t.digit);
assert.equal(solvedP57.runes.length, 95);
assert.equal(nativeDigits.length, 115);
assert.equal(nativeDigits.filter((n) => n === 29).length, 20);
const plantedCipher = encipher(nativeDigits);
assert.deepEqual(decipher(plantedCipher), nativeDigits);
assert.ok(plantedCipher.some((d) => d === 29));
assert.ok(nativeDigits.some((d) => d === 29));

console.log('DIVINITY GP30 source-fixed original SFT: PASS');
console.log('Source: 12956 runes, 2902 literal separator tokens; 15858 total');
console.log('Model: source key DIVINITY, GP30 SPACE29, continuous zero phase, no F-skips');
console.log('Full original:', JSON.stringify(allStats));
console.log('p16–21 original:', JSON.stringify(devStats), 'cipher runes', dev.sourceRuneCount);
console.log('p40–53 holdout:', JSON.stringify(holdStats), 'cipher runes', hold.sourceRuneCount);
console.log('Authentic native p57:', JSON.stringify(stats(nativeDigits)));
console.log('Original development preview:', romanize(dev.sampled, 160));
console.log('Original holdout preview:', romanize(hold.sampled, 160));
console.log('Roundtrip: full 15858 symbols, source typography, native GP p57 plant exact');
console.log('Decision: no native GP plaintext; low-space GP30 model rejected for ordinary prose.');
