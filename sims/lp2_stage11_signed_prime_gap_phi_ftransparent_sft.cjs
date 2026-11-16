'use strict';

/**
 * Read-only, deterministic single-file test of the original 2014 Stage11
 * signed-message whitespace prime sequence as an LP2 p56-family key.
 * Run under Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const signature = fs.readFileSync(path.join(root, 'resources/historical/cicada2014-stage11-message.asc'), 'utf8');
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(corpus.pages.slice(0, 56).reduce((a, p) => a + p.indices.length, 0), 12956);

const sourceLines = signature.split(/\r?\n/);
const signatureStart = sourceLines.findIndex(line => line.includes('-----BEGIN PGP SIGNATURE-----'));
const sourceHeader = sourceLines.findIndex(line => line.startsWith('Hash: SHA1'));
assert.ok(sourceHeader >= 0 && signatureStart > sourceHeader);
const whitespaceValues = [];
for (const line of sourceLines.slice(sourceHeader + 1, signatureStart)) {
  if (line.length === 0) continue;
  if (/^ +$/.test(line)) {
    whitespaceValues.push(line.length);
    continue;
  }
  const lead = line.match(/^ +/);
  const trail = line.match(/ +$/);
  if (lead) whitespaceValues.push(lead[0].length);
  if (trail) whitespaceValues.push(trail[0].length);
}
assert.deepEqual(whitespaceValues, [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]);

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
}

/** @param {number} n @returns {number} */
function popcount(n) {
  let count = 0;
  for (; n > 0; n = Math.floor(n / 2)) count += n % 2;
  return count;
}

/** @param {number} size @returns {number[]} */
function ordinaryPrimes(size) {
  const values = [];
  for (let p = 2; values.length < size; p++) if (isPrime(p)) values.push(p);
  return values;
}

/** @param {number} size @returns {number[]} */
function a194954(size) {
  const values = [2];
  let nextCandidate = 3;
  while (values.length < size) {
    const divisor = popcount(values.length);
    while (!isPrime(nextCandidate) || (nextCandidate - values[values.length - 1]) % divisor !== 0) nextCandidate += 2;
    values.push(nextCandidate);
    nextCandidate += 2;
  }
  return values;
}

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/**
 * Reencrypts with the authentic p56 F-bypass rule.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plaintext, key, sign) {
  let keyIndex = 0;
  return plaintext.map(value => value === 0 ? 0 : mod29(value + sign * (key[keyIndex++] - 1)));
}

/**
 * Exhaustively enumerate all legal F/non-F histories at an unchanged source
 * ciphertext, without a language model or arbitrary exception insertion.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {{possible:boolean,dead:number|null,states:number}}
 */
function reachable(ciphertext, key, sign) {
  let cursors = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const cursor of cursors) {
      if (ciphertext[i] === 0) next.add(cursor);
      const plaintextRune = mod29(ciphertext[i] - sign * (key[cursor] - 1));
      if (plaintextRune !== 0) next.add(cursor + 1);
    }
    if (next.size === 0) return { possible: false, dead: i, states: 0 };
    cursors = next;
  }
  return { possible: true, dead: null, states: cursors.size };
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number}
 */
function noSkipIoc(ciphertext, key, sign) {
  const freq = Array(29).fill(0);
  ciphertext.forEach((value, i) => { freq[mod29(value - sign * (key[i] - 1))]++; });
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) / (ciphertext.length * (ciphertext.length - 1));
}

const maxLen = 4000;
const standard = ordinaryPrimes(maxLen);
const continued = a194954(maxLen);
const cyclic = Array.from({ length: maxLen }, (_, i) => whitespaceValues[i % whitespaceValues.length]);
assert.deepEqual(continued.slice(0, 11), whitespaceValues);
assert.deepEqual(continued.slice(0, 16), [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37, 43, 47, 53, 59, 67]);

// Full authentic 85-rune LP2 p56 control: title, literal F, and ending all checked.
const p56PlaintextRunes = source.sections.find(section => section.name === 'p56_an_end').source_text;
const p56Plaintext = Array.from(p56PlaintextRunes).filter(rune => corpus.runes.includes(rune)).map(rune => corpus.runes.indexOf(rune));
assert.equal(p56Plaintext.length, 85);
assert.deepEqual(encrypt(p56Plaintext, standard, 1), corpus.pages[56].indices);
assert.equal(p56Plaintext.filter(value => value === 0).length, 1);
assert.equal(reachable(corpus.pages[56].indices, standard, 1).possible, true);

// Positive controls for the hypothetical alternative keys, including F skips.
const planted = Array.from({ length: 716 }, (_, i) => corpus.pages[57].indices[i % 95]);
for (const key of [cyclic, continued]) {
  for (const sign of [1, -1]) {
    const ciphertext = encrypt(planted, key, sign);
    assert.equal(reachable(ciphertext, key, sign).possible, true);
    assert.deepEqual(encrypt(planted, key, sign), ciphertext);
  }
}

const pageValues = (first, last) => corpus.pages.slice(first, last + 1).flatMap(page => page.indices);
const originalWindows = {
  'p0–2 complete red+black': pageValues(0, 2),
  'p0–2 black body after original red13': [...corpus.pages[0].indices.slice(13), ...pageValues(1, 2)],
  'p3–7 independent chapter': pageValues(3, 7),
  'p40–53 independent chapter': pageValues(40, 53)
};
assert.deepEqual(Object.values(originalWindows).map(x => x.length), [729, 716, 1145, 3008]);

const observed = {};
for (const [window, ciphertext] of Object.entries(originalWindows)) {
  for (const [model, key] of [['2014-whitespace-11 cyclic', cyclic], ['OEIS-A194954 continuation', continued]]) {
    for (const sign of [1, -1]) {
      const result = reachable(ciphertext, key, sign);
      const label = window + ' / ' + model + ' / sign ' + sign;
      observed[label] = { ...result, noSkipIoc: noSkipIoc(ciphertext, key, sign) };
      assert.equal(result.possible, false, label + ': an unaccounted viable original path appeared');
      console.log(JSON.stringify({ window, model, sign, length: ciphertext.length, ...observed[label] }));
    }
  }
}

// Original-source, frozen reference failure positions catch indexing and
// chapter-offset errors in subsequent independent reproductions.
assert.equal(observed['p0–2 black body after original red13 / 2014-whitespace-11 cyclic / sign 1'].dead, 20);
assert.equal(observed['p0–2 black body after original red13 / OEIS-A194954 continuation / sign 1'].dead, 22);
assert.equal(observed['p3–7 independent chapter / OEIS-A194954 continuation / sign 1'].dead, 83);
assert.equal(observed['p40–53 independent chapter / OEIS-A194954 continuation / sign 1'].dead, 88);
console.log('PASS: source whitespace, authentic p56 full cipher, synthetic original-length plants, 16 fixed original infeasibility gates.');
