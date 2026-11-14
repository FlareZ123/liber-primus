'use strict';

/**
 * Historical original-2014 LP2 p55 13/6/4-rune conjectures as *conditional*
 * cribs. Test an all-phase prime-totient obstruction independent of any
 * arbitrary starting prime key/word segmentation.
 *
 * Node22 CommonJS: node sims/lp2_2014_p55_13rune_eyewitness_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const c = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const index = new Map(c.runes.map((glyph, position) => [glyph, position]));

/** @param {string} text @returns {number[][]} */
function sourceWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    if (index.has(ch)) word.push(index.get(ch));
    else if ('-.&$§'.includes(ch)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {string} text @returns {number[]} */
function toGP(text) {
  const result = [];
  const letters = text.toUpperCase().replace(/ /g, '');
  for (let i = 0; i < letters.length;) {
    const digraph = c.translit.indexOf(letters.slice(i, i + 2));
    if (digraph >= 0) {
      result.push(digraph);
      i += 2;
    } else {
      const monograph = c.translit.indexOf(letters[i]);
      assert.ok(monograph >= 0, 'No GP spelling for ' + letters.slice(i));
      result.push(monograph);
      i++;
    }
  }
  return result;
}
const words = sourceWords(transcript.split('%')[54]);
assert.deepEqual(words.flat(), c.pages.find((p) => p.page === 55).indices);
assert.deepEqual(words.map((w) => w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

const cipher = words.slice(7, 10).flat();
assert.equal(cipher.length, 23);
const wordLengths = words.slice(7, 10).map((w) => w.length);
assert.deepEqual(wordLengths, [13,6,4]);
const fPositions = cipher.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(fPositions, [2, 18]);

const mod = (v) => (v % 29 + 29) % 29;
const options = [
  ['ENLIGHTENMENT', 'AWAITS', 'THOSE'],
  ['MULTIBRANCHED', 'AWAITS', 'THOSE']
];
const out = [];
for (const phrase of options) {
  const plainWords = phrase.map(toGP);
  assert.deepEqual(plainWords.map((p) => p.length), [13,6,4]);
  const plaintext = plainWords.flat();
  assert.ok(plaintext.every((p) => p !== 0));
  const requiredKey = cipher.map((r, i) => mod(r - plaintext[i]));
  const required28 = requiredKey.flatMap((v, i) => v === 28 ? [i] : []);
  assert.ok(required28.some((i) => i >= 10));

  // For a prime p, phi(p)=p-1. phi(p)%29==28 iff p%29==0.
  // As p is prime, p==29, the tenth prime, zero-based index9.
  // The i-th prime in ANY nonnegative-indexed consecutive stream has
  // absolute zero-based ordinal >= i, hence it cannot be p29 at i>=10.
  assert.equal(29 % 29, 0);
  const primes = [];
  for (let n = 2; primes.length < 30; n++) {
    let prime = true;
    for (let j = 2; j*j <= n; j++) {
      if (n % j === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  assert.equal(primes.indexOf(29), 9);
  out.push({
    historicalConjecture: phrase.join(' '),
    originalRuneLengths: wordLengths,
    requiredTotient28Positions: required28,
    contradiction: 'At least one demanded residue28 occurs at runic position >=10, but prime29 occurs only at global prime ordinal9. Every nonnegative forward starting phase fails.',
    keyResidues: requiredKey
  });
}
assert.deepEqual(out.map((o) => o.requiredTotient28Positions),
  [[0,15],[15]]);
console.log(JSON.stringify({
  evidenceClass: '2014 human suggestions as unverified cribs; all-phase cipher-family exclusion conditional on exact words',
  historicalDates: {
    'ENLIGHTENMENT AWAITS THOSE': 'May 21 18:09 #cicadasolvers <amone>',
    'MULTIBRANCHED': 'May 20 21:19 and 22:29 #cicadasolvers <silence_>'
  },
  exactOriginal: {
    page: 55, wordIndices: [7,8,9], length: 23,
    ciphertextFRunes: fPositions, ciphertext: cipher.map((i) => c.translit[i]).join('')
  },
  options: out,
  conclusion: 'Neither hypothesized 23-rune plaintext is compatible with a forward consecutive-prime totient cipher at any nonnegative starting offset using the historically authentic plaintext-F bypass. No plaintext is authenticated.'
}, null, 2));
