'use strict';

/**
 * Read-only, original-LP2 source-gated test of the independent May-2014
 * invitation's ascending-prime whitespace omission and p8's XIX heading.
 * Usage: node sims/lp2_whitespace_prime19_xix_p7_blackclock_sft.cjs
 * Node 22/CommonJS, no external libraries or file writes.
 *
 * Whitespace transcript: https://github.com/krisyotam/cicada3301/blob/main/liber-primus/original-onion7/message.txt.asc
 * Archival independent note: https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
 * CAUTION: PGP cleartext canonicalization does not authenticate trailing
 * whitespace; stripped independent mirrors exist. This is a source hypothesis.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const primesUnder38 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
const historicalSpaceCounts = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37];
const predictedCounts = primesUnder38.filter((p) => p !== 19);
assert.deepEqual(historicalSpaceCounts, predictedCounts);

const red = ink.pages.find((p) => p.page === 8).red_spans[0];
assert.equal(red.start, 0);
assert.equal(red.length, 12);
const heading = [...red.runes].map((r) => {
  const index = corpus.runes.indexOf(r);
  assert.ok(index >= 0);
  return index;
});
const p8 = corpus.pages.find((p) => p.page === 8);
assert.deepEqual(heading, p8.indices.slice(0, 12));
assert.deepEqual(heading.slice(0, 3), [14, 10, 14]);
assert.equal(corpus.translit[7], 'W');
assert.equal(corpus.prime[7], 19);
assert.deepEqual(corpus.prime.slice(0, 12), primesUnder38);

const hits = [];
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let offset = 0; offset + 2 < page.indices.length; offset += 1) {
    if (page.indices[offset] === 14 && page.indices[offset + 1] === 10 && page.indices[offset + 2] === 14) {
      hits.push({ page: page.page, offset });
    }
  }
}
assert.deepEqual(hits, [{ page: 8, offset: 0 }]);

const coefficients = [11, 26, 8, 15, 2];
/**
 * Evaluate the printed whole-red-word product polynomial modulo 29.
 * @param {number} x An integer in [0, 28].
 * @returns {number} The GP29 polynomial image.
 */
function polynomial(x) {
  let result = 0;
  let power = 1;
  for (const coefficient of coefficients) {
    result = (result + coefficient * power) % 29;
    power = (power * x) % 29;
  }
  return result;
}
/**
 * Evaluate P composed n times, without a hidden origin or per-page reset.
 * @param {number} seed Initial GP29 state.
 * @param {number} n Number of polynomial iterations.
 * @returns {number} The final state.
 */
function iterate(seed, n) {
  let state = seed;
  for (let i = 0; i < n; i += 1) state = polynomial(state);
  return state;
}
assert.equal(polynomial(19), 12);
assert.equal(iterate(19, 680), 7);
assert.equal(iterate(19, 692), 10);
assert.equal(iterate(5, 692), 7);
const blackBefore7 = p8.indices.length - 12
  + corpus.pages.find((p) => p.page === 9).indices.length
  + 169; // source-printed p10 numeral7 follows 169 authentic p10 runes
const fullBefore7 = blackBefore7 + 12;
assert.equal(blackBefore7, 680);
assert.equal(fullBefore7, 692);
const seedsReaching7 = [];
for (let seed = 0; seed < 29; seed += 1) if (iterate(seed, blackBefore7) === 7) seedsReaching7.push(seed);
assert.deepEqual(seedsReaching7, [14, 16, 17, 19, 24]);

/**
 * Show the two simplest direct, source-supplied heading-key inversions without
 * fitting phase, alphabet or spelling. A reversible additive title test is
 * not an authenticated decipherment of the rest of LP2.
 * @param {number[]} key Twelve GP29 additive key digits.
 * @returns {{minus:string,plus:string}} Native GP transliterations.
 */
function directTitle(key) {
  const render = (sign) => heading.map((cipher, i) => corpus.translit[((cipher + sign * key[i]) % 29 + 29) % 29]).join(' ');
  return { minus: render(-1), plus: render(1) };
}
console.log(JSON.stringify({
  historicalSpaceCounts, missingPrime: 19, missingRune: 'W',
  completeGpPrimeValues: primesUnder38,
  originalP8Red: heading.map((x) => corpus.translit[x]).join(' '),
  literalXIXHits: hits,
  p19: polynomial(19),
  blackBodyRuneClock: { prefix: blackBefore7, state: iterate(19, blackBefore7) },
  redAndBlackRuneClock: { prefix: fullBefore7, state: iterate(19, fullBefore7) },
  competingFiveSeedWholeClock: iterate(5, fullBefore7),
  blackClockSeedMultiplicity: seedsReaching7,
  additiveOrdinals: directTitle([...Array(12).keys()]),
  additivePrimeValues: directTitle(primesUnder38),
  classification: 'source-linked prospective key/clock only; no plaintext or cipher operator'
}, null, 2));
