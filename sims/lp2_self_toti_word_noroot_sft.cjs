'use strict';

/**
 * Original-source GP29 self-totient word-shift satisfiability test.
 *
 * Hypothesis: each printed word uses the single Caesar key
 * k = phi(sum(GPprime(P_word))) mod 29, and C_i = P_i + sign*k mod29.
 *
 * Unlike a ciphertext-derived sum, the key is implicit in the unknown
 * plaintext. Exhaustively test all 29 possible keys per word without
 * fitting language or choosing a candidate plaintext.
 *
 * Run as a standalone read-only Node.js CommonJS test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const wordData = parseSharedCorpus();
const words = wordData.words.map(word => [...word.runes].map(r => runeIndex.get(r)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
assert.deepEqual(words.flat(),
  gp.pages.filter(page => page.page <= 55).flatMap(page => page.indices));

/** @param {number} x */
function mod(x) { return (x % 29 + 29) % 29; }

/** @param {number} n Positive integer. */
function phi(n) {
  assert(Number.isSafeInteger(n) && n >= 1);
  let result = n;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) {
      while (n % divisor === 0) n /= divisor;
      result -= result / divisor;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}

/** @param {number[]} plaintext */
function keyOf(plaintext) {
  return phi(plaintext.reduce((sum, rune) => sum + gp.prime[rune], 0)) % 29;
}

/**
 * Every mathematically legal single-word key under the implicit plaintext
 * totient relation. Key recovery is exhaustive, not language optimized.
 * @param {number[]} ciphertext
 * @param {1|-1} sign
 * @returns {number[]}
 */
function candidateKeys(ciphertext, sign) {
  const candidates = [];
  for (let key = 0; key < 29; key++) {
    const plaintext = ciphertext.map(c => mod(c - sign * key));
    if (keyOf(plaintext) === key) candidates.push(key);
  }
  return candidates;
}

/** GP29 words on solved cleartext p57, preserving printed word boundaries. */
function clearControl() {
  const text = raw.split('%')[56];
  const result = [];
  let current = [];
  for (const ch of text) {
    if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
    else if (ch === '/' || /\s/u.test(ch)) continue;
    else if (current.length) { result.push(current); current = []; }
  }
  if (current.length) result.push(current);
  assert.equal(result.length, 20);
  assert.deepEqual(result.flat(), gp.pages.find(p => p.page === 57).indices);
  return result;
}

function run() {
  const controls = clearControl();
  const results = [];
  for (const sign of /** @type {Array<1|-1>} */ ([1, -1])) {
    // Known-plaintext positive: synthesize a valid ciphertext from all
    // 20 solved p57 words and verify the true key is in the root set.
    let positives = 0;
    for (const plaintext of controls) {
      const key = keyOf(plaintext);
      const ciphertext = plaintext.map(p => mod(p + sign * key));
      const roots = candidateKeys(ciphertext, sign);
      assert(roots.includes(key), 'Planted source-native key must survive');
      const recovered = ciphertext.map(c => mod(c - sign * key));
      assert.deepEqual(recovered, plaintext);
      positives++;
    }
    assert.equal(positives, 20);

    const rootsHistogram = Array(30).fill(0);
    let noRootNoCipherF = 0, firstNoRoot = null, firstNoRootNoF = null;
    for (let index = 0; index < words.length; index++) {
      const ciphertext = words[index];
      const roots = candidateKeys(ciphertext, sign);
      rootsHistogram[roots.length]++;
      if (!roots.length) {
        const item = {
          wordIndex: index,
          romanized: ciphertext.map(c => gp.translit[c]).join(''),
          runeLength: ciphertext.length
        };
        if (!firstNoRoot) firstNoRoot = item;
        if (!ciphertext.includes(0)) {
          noRootNoCipherF++;
          if (!firstNoRootNoF) firstNoRootNoF = item;
        }
      }
    }
    const impossible = rootsHistogram[0];
    results.push({
      sign, impossible, uniquelyKeyed: rootsHistogram[1],
      multiRoot: words.length - impossible - rootsHistogram[1],
      noRootNoCipherF, firstNoRoot, firstNoRootNoF,
      plantedSolvedP57WordsRecovered: positives,
      rootsHistogram
    });
  }
  assert.deepEqual(results.map(r => r.impossible), [1008, 1012]);
  assert.deepEqual(results.map(r => r.noRootNoCipherF), [839, 869]);
  return {model: 'k=phi(sum GPprime(plaintext word)) mod29, C=P +/- k',
    originalRunes: 12956, originalPrintedWords: words.length,
    solvedControlRunes: 95, results};
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, phi, keyOf, candidateKeys};
