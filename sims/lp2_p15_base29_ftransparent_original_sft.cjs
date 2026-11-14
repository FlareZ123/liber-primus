'use strict';
/**
 * Source-frozen p15 Fibonacci-prime BASE29 key under Cicada's historically
 * authenticated plaintext-F transparent GP29 Vigenere, original LP2 p15-22.
 * Reuses the independent 710/710 known-cipher lexical Viterbi positive control.
 * A candidate must produce intact natural language and strict forward replay;
 * round-trip alone is insufficient to authenticate it.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { base29Digits } = require('./p15_fibonacci_prime_base29_key_sft.cjs');
const { decode, encrypt, printedWords, concat, original, lexicon } =
  require('./lp2_ftransparent_original_lexical_viterbi_sft.cjs');

const primes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829,
  1481, 2593, 4507, 7817];
const key = primes.flatMap(base29Digits);
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const keyString = key.map(value => alphabet[value]).join('');
assert.equal(key.length, 30);
assert.equal(keyString, '2357DN1E2L5492FSSH1M232C5AC98G');

const transcript = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-transcription.txt'),
  'utf8');
const pages = transcript.split(/^\s*%\s*$/m);
const p15Parts = pages[15].split('$');
assert.ok(p15Parts.length > 1, 'Missing original p15 grid/body separator');
const afterGrid = p15Parts.slice(1).join('$');
const originalBody = original.pages.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap((p) => p.page === 15 ? p.indices.slice(9) : p.indices);
assert.equal(originalBody.length, 1883);
const sourceParts = [afterGrid, ...pages.slice(16, 23)];
const joined = sourceParts.map(part => part.replace(/[&$\s]+$/gu, '').trim())
  .join('/');
const words = printedWords(joined);
assert.deepEqual(concat(words), originalBody);
assert.ok(words.length > 300);

function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function nativeWords(values) {
  let index = 0, hits = 0, longHits = 0, longCount = 0;
  for (const word of words) {
    const value = values.slice(index, index + word.length);
    const present = lexicon.has(value.join(','));
    hits += Number(present);
    if (word.length >= 4) {
      longCount++;
      longHits += Number(present);
    }
    index += word.length;
  }
  assert.equal(index, values.length);
  return { hits, total: words.length, longHits, longCount };
}

const raw = nativeWords(originalBody);
const cases = [];
for (const sign of [1, -1]) {
  const shift = consumed => sign * key[consumed % key.length];
  const search = decode(words, shift);
  const winner = search.states[0];
  const ciphertext = encrypt(winner.plain, shift);
  assert.deepEqual(ciphertext, originalBody);
  cases.push({
    sign, sourceKey: keyString, originalRunes: originalBody.length,
    wordCount: words.length, originalRawLexiconMatches: raw,
    recoveredLexiconMatches: nativeWords(winner.plain),
    decodedIoC: ioc(winner.plain), originalIoC: ioc(originalBody),
    literalsSelected: winner.literals.length, consumedKeySymbols: winner.consumed,
    bestLexicalScore: winner.score, nextBestScore: search.states[1]?.score ?? null,
    finalStates: search.states.length,
    peakStateCount: Math.max(...search.stateCounts),
    first100: winner.plain.slice(0, 100).map(i => original.translit[i]).join('-'),
    heldoutAt500Len40: winner.plain.slice(500, 540).map(i => original.translit[i]).join('-'),
    strictForwardReconstruction: true,
    sourceLanguageLike: nativeWords(winner.plain).longHits >=
      Math.ceil(nativeWords(winner.plain).longCount * 0.70)
  });
}

console.log(JSON.stringify({
  keyDerivation: 'p15 printed Fibonacci-indexed primes -> 2013 signed BASE29 -> 30 numeric rune shifts',
  operation: 'Historical plaintext-F bypass and GP29 additive keystream, source-frozen start immediately after p15 grid',
  scope: 'Original physical pages p15-22, after exact p15 9-rune pre-grid heading',
  authenticIndependentKnownCipherControls: '710/710 verified by imported positive SFT',
  variants: cases,
  claimLimit: 'English dictionary is only a diagnostic; no authentic unknown plaintext unless legibility and independent source selection survive'
}, null, 2));
