'use strict';

/**
 * LP2 PARABLE 55-interior-rune/page prime-clock hypothesis, original-source SFT.
 *
 * Original p57 visibly says to shed word circumferences. Removing the first
 * and final GP29 rune from each of its 20 complete printed words gives exactly
 * 55 interior runes, one for each unresolved rune-bearing physical page.
 * Candidate: use one interior rune per page to select the starting ordinal of
 * the genuine p56 successive-prime-totient cipher, preserving its exact
 * plaintext-F bypass and the printed physical-page resets.
 *
 * Three preregistered source-native scalar maps: rune index, GP prime value,
 * and GP prime totient. The only cipher sign is the authentic p56 sign.
 *
 * Run from repository root:
 *   node sims/lp2_parable55_page_prime_start_ftransparent_sft.cjs
 *
 * Classification: a bounded negative, not a decryption. No English scoring.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcript = fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const segments = transcript.split(/^%$/m);
const glyphToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = x => ((x % 29) + 29) % 29;
assert.equal(segments.length, 57); // physical p50 has no rune paragraph
assert.equal(corpus.runes.length, 29);

/** @param {string} source @returns {number[]} */
function indices(source) {
  return [...source].flatMap(r => glyphToIndex.has(r) ? [glyphToIndex.get(r)] : []);
}
/** @param {number} physicalPage @returns {number[]} */
function sourcePage(physicalPage) {
  return indices(segments[physicalPage < 50 ? physicalPage : physicalPage - 1]);
}

for (const page of corpus.pages) {
  if (page.page === 50) assert.equal(page.indices.length, 0);
  else assert.deepEqual(sourcePage(page.page), page.indices,
    'Corpus and rune transcription disagree on physical page ' + page.page);
}

const parableWords = segments[56].replace(/[\/\r\n]/g, '')
  .split(/[-.&$§]/)
  .map(indices).filter(w => w.length);
const clearParable = parableWords.flat();
const interior = parableWords.flatMap(word => word.slice(1, -1));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(parableWords.length, 20);
assert.equal(clearParable.length, 95);
assert.deepEqual(clearParable, corpus.pages[57].indices);
assert.equal(interior.length, 55);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

/** @param {number} count @returns {number[]} */
function primeTotientClock(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++)
      if (n % d === 0) { prime = false; break; }
    if (prime) result.push((n - 1) % 29);
  }
  return result;
}
const CLOCK = primeTotientClock(3000);

/**
 * Exhaust all plaintext-F bypass paths on exact ciphertext.
 * An F plaintext emits F ciphertext without consuming the prime.
 * An encrypted non-F consumes exactly one prime; encrypted F is forbidden.
 *
 * @param {number[]} ciphertext
 * @param {number} firstPrimeIndex zero-based
 * @returns {{reachable:boolean,firstImpossibleAt:number|null,
 *   possibleEndClocks:number,maxStates:number}}
 */
function reach(ciphertext, firstPrimeIndex) {
  let states = new Set([firstPrimeIndex]);
  let maxStates = states.size;
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const keyIndex of states) {
      if (ciphertext[i] === 0) next.add(keyIndex);
      if (mod(ciphertext[i] - CLOCK[keyIndex]) !== 0)
        next.add(keyIndex + 1);
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    if (!states.size) return {
      reachable: false, firstImpossibleAt: i,
      possibleEndClocks: 0, maxStates
    };
  }
  return {
    reachable: true, firstImpossibleAt: null,
    possibleEndClocks: states.size, maxStates
  };
}

/** @param {number[]} plaintext @param {number} firstPrimeIndex */
function encode(plaintext, firstPrimeIndex) {
  let cursor = firstPrimeIndex;
  return plaintext.map(p => p === 0 ? 0 : mod(p + CLOCK[cursor++]));
}

/** Exact known p56: 85 source GP runes, one transparent plaintext-F at 56. */
const gpSymbols = corpus.translit.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);
const expected56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56plain = [];
for (const sourceWord of expected56.split(' ')) {
  let unparsed = sourceWord;
  while (unparsed) {
    const matched = gpSymbols.find(item => unparsed.startsWith(item.name));
    assert(matched, 'Unparseable known p56 source word ' + sourceWord);
    p56plain.push(matched.index);
    unparsed = unparsed.slice(matched.name.length);
  }
}
assert.equal(p56plain.length, 85);
assert.deepEqual(p56plain.flatMap((n, i) => n === 0 ? [i] : []), [56]);
assert.deepEqual(encode(p56plain, 0), corpus.pages[56].indices);
assert.equal(reach(corpus.pages[56].indices, 0).reachable, true);

// Independent positive plants: the exact original p57 GP words encoded under
// separately selected page key clocks. Both have multiple plaintext F events.
for (const pageIndex of [0, 54]) {
  const firstPrimeIndex = interior[pageIndex];
  const plantCipher = encode(clearParable, firstPrimeIndex);
  assert.equal(reach(plantCipher, firstPrimeIndex).reachable, true);
  assert.equal(plantCipher.length, 95);
}

const modes = [
  ['rune-index', r => r],
  ['GP-prime', r => corpus.prime[r]],
  ['GP-prime-totient', r => corpus.prime[r] - 1]
];
const results = {};
for (const [name, primeIndex] of modes) {
  const tests = pages.map((page, i) => ({
    page: page.page,
    start: primeIndex(interior[i]),
    ...reach(page.indices, primeIndex(interior[i]))
  }));
  results[name] = {
    survivingPages: tests.filter(t => t.reachable).map(t => t.page),
    firstPage: tests[0],
    lastPage: tests.at(-1),
    firstTenFailures: tests.filter(t => !t.reachable).slice(0, 10),
    originalPagesTested: tests.length
  };
}
assert.deepEqual(results['rune-index'].survivingPages, [43]);
assert.deepEqual(results['GP-prime'].survivingPages, [49]);
assert.deepEqual(results['GP-prime-totient'].survivingPages, [49, 55]);
assert.deepEqual([
  results['rune-index'].firstPage.firstImpossibleAt,
  results['GP-prime'].firstPage.firstImpossibleAt,
  results['GP-prime-totient'].firstPage.firstImpossibleAt
], [49, 2, 0]);

console.log(JSON.stringify({
  source: 'Original LP2 p0-p57 GP29 corpus and original transcription',
  plaintextP56Positive: '85/85 exact, one F bypass at plaintext offset 56',
  p57: { words: 20, runes: 95, interiors: interior.length },
  unknownRuneBearingPhysicalPages: pages.length,
  unknownRunes: 12956,
  sourceMappedStarts: 'one p57 word-interior rune per ascending original page, skipping p50',
  results,
  syntheticP57Positive: '2/2 exact 95-rune encodings reachable',
  classification: 'No full original-book path under any of three source-native page starts'
}, null, 2));
