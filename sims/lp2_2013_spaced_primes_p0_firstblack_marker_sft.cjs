'use strict';

/**
 * Original-source synchronization test: 2013 PRIMES paste's two doubled-space
 * successors versus the first two LP2 p0 ciphertext runes after its red13 mark.
 * Run: node sims/lp2_2013_spaced_primes_p0_firstblack_marker_sft.cjs
 *
 * The historical 2013 participant paste xGY4pbHV is frozen in
 * im-results/2013-first-onion-primes-xGY4pbHV-original-source.md (SHA256
 * 591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94).
 * The source has '29  31' and '3257  3259'. Neither its server-side
 * authorship nor its intended use as a key is established.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const doubleSpaceAfter = [29, 3257];
const successors = [31, 3259];
const nextListedPrimes = [37, 3271];
const m29 = n => ((n % 29) + 29) % 29;
const pair = successors.map(m29);

assert.deepEqual(doubleSpaceAfter.map(m29), [0, 9]);
assert.deepEqual(pair, [2, 11]);
assert.equal(pair[0] + pair[1], 13);
assert.deepEqual(pair.map(i => corpus.translit[i]), ['TH', 'J']);

const p0 = corpus.pages.find(p => p.page === 0);
const p0Ink = ink.pages.find(p => p.page === 0);
assert.ok(p0 && p0Ink);
assert.equal(p0.indices.length, 262);
assert.deepEqual(p0Ink.red_spans.map(s => [s.start, s.length]), [[0, 13]]);
assert.ok(p0Ink.large_punctuation.some(
  ([offset, dots, colour]) => offset === 13 && dots === 13 && colour === 'red'
));
assert.deepEqual(p0.indices.slice(13, 16), [2, 11, 6]);
assert.deepEqual(p0.indices.slice(13, 15), pair);

const sites = [];
for (const record of ink.pages) {
  if (record.page > 55) continue;
  const page = corpus.pages.find(p => p.page === record.page);
  assert.ok(page, 'Each annotated page has an indexed corpus entry');
  for (const [offset, dots, colour] of record.large_punctuation || []) {
    if (offset + 1 >= page.indices.length) continue;
    sites.push({
      page: record.page, offset, dots, colour,
      pair: page.indices.slice(offset, offset + 2)
    });
  }
}
const matches = sites.filter(s => s.pair[0] === pair[0] && s.pair[1] === pair[1]);
assert.equal(sites.length, 21);
assert.deepEqual(matches.map(({page, offset, dots, colour}) =>
  ({page, offset, dots, colour})), [
    {page: 0, offset: 13, dots: 13, colour: 'red'}
  ]);
const distinctSites = new Set(sites.map(s => `${s.page}:${s.offset}`));
assert.equal(distinctSites.size, 20);

const everyPair = [];
for (const page of corpus.pages) {
  if (page.page > 55) continue;
  for (let j = 0; j + 1 < page.indices.length; j += 1) {
    if (page.indices[j] === pair[0] && page.indices[j + 1] === pair[1])
      everyPair.push({page: page.page, offset: j});
  }
}
assert.equal(everyPair.length, 20);
assert.deepEqual(everyPair.filter(p => p.page === 0).map(p => p.offset),
  [13, 118]);

const afterMarkedPrimeResiduals = nextListedPrimes.map(m29);
assert.deepEqual(afterMarkedPrimeResiduals, [8, 23]);
assert.notEqual(p0.indices[15], afterMarkedPrimeResiduals[0]);
assert.notEqual(p0.indices[15], afterMarkedPrimeResiduals[1]);

// Positive/mismatch controls for the exact marker-pair predicate.
const isPair = a => a[0] === pair[0] && a[1] === pair[1];
assert.equal(isPair([2, 11]), true);
assert.equal(isPair([2, 12]), false);
assert.equal(isPair([3, 11]), false);


/**
 * Exploratory direct-key continuation: the only historically solved LP2 key
 * operation is prime p -> phi(p)=p-1, so let the two marked 2013 primes
 * initialize independent ordinary prime clocks. This is NOT source-selected;
 * the proposed synchronization is evaluated separately above.
 * @param {number} maximum
 * @returns {number[]}
 */
function primeSieve(maximum) {
  const marked = new Uint8Array(maximum + 1);
  const result = [];
  for (let p = 2; p <= maximum; p += 1) {
    if (marked[p]) continue;
    result.push(p);
    if (p * p <= maximum)
      for (let n = p * p; n <= maximum; n += p) marked[n] = 1;
  }
  return result;
}

/** @param {number[]} a @returns {number} */
function coincidence(a) {
  const bins = new Array(29).fill(0);
  for (const rune of a) bins[rune] += 1;
  return bins.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const allPrimes = primeSieve(10000);
const omittedPrimes = allPrimes.filter(p => p >= 73 && p <= 1223);
assert.equal(omittedPrimes.length, 180);
assert.equal(omittedPrimes[0], 73);
assert.equal(omittedPrimes.at(-1), 1223);
const triple = [...pair, m29(omittedPrimes.length)];
assert.deepEqual(triple, [2, 11, 6]);
assert.deepEqual(p0.indices.slice(13, 16), triple);
assert.equal(m29(1229), 11); // gap successor independently shares J residue
const allTriples = [];
for (const page of corpus.pages) {
  if (page.page > 55) continue;
  for (let i = 0; i + 2 < page.indices.length; i += 1)
    if (triple.every((v, j) => page.indices[i + j] === v))
      allTriples.push({page: page.page, offset: i});
}
assert.deepEqual(allTriples, [
  {page: 0, offset: 13},
  {page: 16, offset: 127},
  {page: 48, offset: 3}
]);
assert.deepEqual(sites.filter(s => {
  const page = corpus.pages.find(p => p.page === s.page);
  return page.indices.slice(s.offset, s.offset + 3)
    .every((v, i) => v === triple[i]);
}).map(s => [s.page, s.offset]), [[0, 13]]);
const primeKeys = successors.map(seed => {
  const first = allPrimes.indexOf(seed);
  assert.ok(first >= 0);
  return allPrimes.slice(first, first + 729).map(p => m29(p - 1));
});
assert.ok(primeKeys.every(k => k.length === 729));
const keys = {
  from31: primeKeys[0],
  from3259: primeKeys[1],
  add: primeKeys[0].map((v, i) => m29(v + primeKeys[1][i])),
  subtract: primeKeys[0].map((v, i) => m29(v - primeKeys[1][i])),
  alternate: primeKeys[0].map((v, i) => i % 2 ? primeKeys[1][i] : v)
};
const firstChapter = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(firstChapter.length, 729);
const knownText = corpus.pages.find(p => p.page === 57).indices;
assert.equal(knownText.length, 95);
const direct = [];
for (const start of [0, 13, 15]) {
  const original = firstChapter.slice(start);
  for (const [keyName, key] of Object.entries(keys)) {
    for (const sign of [-1, 1]) {
      const decoded = original.map((c, i) => m29(c + sign * key[i]));
      const plant = Array.from({length: original.length},
        (_, i) => knownText[i % knownText.length]);
      const encrypted = plant.map((p, i) => m29(p - sign * key[i]));
      assert.deepEqual(
        encrypted.map((c, i) => m29(c + sign * key[i])),
        plant, 'Reversible planted solved-native GP text'
      );
      direct.push({
        start, key: keyName, sign,
        ioc: coincidence(decoded),
        opening: decoded.slice(0, 12).map(i => corpus.translit[i]).join(' ')
      });
    }
  }
}
assert.equal(direct.length, 30);
const bestDirectIoc = Math.max(...direct.map(r => r.ioc));
assert.ok(bestDirectIoc < 0.036);
const sortedDirect = direct.slice().sort((a, b) => b.ioc - a.ioc);

console.log(JSON.stringify({
  source: '2013 participant paste xGY4pbHV, doubled spaces after 29 and 3257',
  spaceSuccessors: successors,
  sourceResiduesMod29: pair,
  omittedHistoricalPrimeCount: omittedPrimes.length,
  omittedCountModulo29: m29(omittedPrimes.length),
  sourceTripleAfterRed13: triple,
  allOriginalThreeRuneOccurrences: allTriples,
  first2014BlackCiphertext: p0.indices.slice(13, 16).map(i => corpus.translit[i]),
  followingLargeMarkerInstances: sites.length,
  distinctFollowingMarkerOffsets: distinctSites.size,
  matchingMarkerSites: matches,
  allOriginalWithinPagePairOccurrences: everyPair.length,
  literalNextListedPrimeResidues: afterMarkedPrimeResiduals,
  thirdCipherRuneIndex: p0.indices[15],
  bestDirectPrimeClockIoc: bestDirectIoc,
  topDirectPrimeClockCandidates: sortedDirect.slice(0, 5),
  sourceNativePlantedReencryptions: direct.length,
  decision: 'One frozen source-to-marker two-rune synchronization candidate. No cipher continuation or recovered plaintext.'
}, null, 2));
