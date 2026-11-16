'use strict';

/**
 * Original-LP2 complete self-keyed GP29 Caesar word cipher feasibility gate.
 *
 * Historically first-party sources specify GP prime values, the arithmetic
 * of word sums, and interest in "words ... numbers". A simple but unproved
 * encryption hypothesis uses each native GP plaintext WORD's own GP-prime
 * sum modulo29 as that word's Caesar shift, with either arithmetic sign.
 *
 * For every printed original ciphertext word C and sign ±, test ALL 29
 * possible shift values k. Candidate P = C−sign*k (mod29) is legal iff
 * sum(GP-prime(P)) mod29 == k. If none exists, this source-motivated
 * complete encryption rule cannot have produced that word under ANY key.
 *
 * Reproduce on Node.js22:
 * node sims/lp2_word_selfprime_caesar_exact_original_sft.cjs
 * No file writes or network use.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gp = new Map(source.runes.map((r, i) => [r, i]));
const pat = new RegExp('[' + source.runes.join('') + ']+', 'gu');
const transcription = read('resources/lp2-transcription.txt');
const ciphertextWords = (transcription.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '')
  .match(pat) || []).map(w => [...w].map(r => gp.get(r)));
assert.equal(ciphertextWords.length, 2896);
assert.deepEqual(ciphertextWords.flat(),
  source.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const mod = n => ((n % 29) + 29) % 29;

/** @param {number[]} word @returns {number} */
function nativeWordPrimeSum(word) {
  return mod(word.reduce((sum, x) => sum + source.prime[x], 0));
}

/**
 * Complete inverse with no keys supplied. Returns all genuinely admissible
 * original plaintext words, not only one language-tuned candidate.
 * @param {number[]} cipher
 * @param {-1 | 1} sign
 * @returns {number[][]}
 */
function inverse(cipher, sign) {
  const answers = [];
  for (let k = 0; k < 29; k++) {
    const plain = cipher.map(c => mod(c - sign * k));
    if (nativeWordPrimeSum(plain) === k) answers.push(plain);
  }
  return answers;
}
const counts = [];
for (const sign of [-1, 1]) {
  const multiplicities = Array(30).fill(0);
  const firstUnsatisfied = [];
  let candidates = 0;
  for (let i = 0; i < ciphertextWords.length; i++) {
    const alternatives = inverse(ciphertextWords[i], sign);
    multiplicities[alternatives.length]++;
    candidates += alternatives.length;
    if (alternatives.length === 0 && firstUnsatisfied.length < 4) {
      firstUnsatisfied.push({ wordNumberZeroBased: i,
        cipher: ciphertextWords[i].map(x => source.translit[x]).join('-') });
    }
  }
  assert(multiplicities[0] > 1000);
  counts.push({ sign, words: ciphertextWords.length,
    unsatisfiable: multiplicities[0], unique: multiplicities[1],
    double: multiplicities[2],
    tripleOrMore: multiplicities.slice(3).reduce((a, b) => a + b, 0),
    totalPossiblePlaintextWords: candidates, firstUnsatisfied });
}
assert.equal(counts[0].unsatisfiable, 1050);
assert.equal(counts[1].unsatisfiable, 1049);

/*
 * Exact correct-key positive on every word in nine authentically solved
 * Cicada GP29 passages, including p56 and p57. A true self-keyed plaintext
 * necessarily survives the exhaustive 29-key inverse.
 */
const positive = [];
for (const sign of [-1, 1]) {
  let tested = 0, recovered = 0;
  for (const section of solved.sections) {
    for (const runeWord of section.source_text.match(pat) || []) {
      const plain = [...runeWord].map(r => gp.get(r));
      const shift = nativeWordPrimeSum(plain);
      const cipher = plain.map(c => mod(c + sign * shift));
      const possibilities = inverse(cipher, sign);
      tested++;
      if (possibilities.some(word => word.length === plain.length &&
        word.every((v, i) => v === plain[i]))) recovered++;
    }
  }
  assert.equal(tested, recovered);
  positive.push({ sign, nativeSolvedWordsCorrectlyRecovered: recovered });
}
console.log(JSON.stringify({
  candidate: 'For each printed GP word encrypt C_i=P_i ± ' +
    '(sum(GP-primes of that plaintext word) mod29) mod29',
  original: counts,
  authenticSolvedGP29PlantedControls: positive,
  conclusion: 'Both exact signs are mathematically impossible on over ' +
    '1,000 original complete ciphertext words; no native plaintext or key.',
  limit: 'Only same-word GP-prime-sum Caesar word shifts are excluded. ' +
    'A different key source, state rule, non-word-preserving cipher, ' +
    'or printable red title convention changes the model.'
}, null, 2));
