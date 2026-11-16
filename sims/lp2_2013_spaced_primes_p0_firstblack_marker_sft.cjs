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

console.log(JSON.stringify({
  source: '2013 participant paste xGY4pbHV, doubled spaces after 29 and 3257',
  spaceSuccessors: successors,
  sourceResiduesMod29: pair,
  first2014BlackCiphertext: p0.indices.slice(13, 16).map(i => corpus.translit[i]),
  followingLargeMarkerInstances: sites.length,
  distinctFollowingMarkerOffsets: distinctSites.size,
  matchingMarkerSites: matches,
  allOriginalWithinPagePairOccurrences: everyPair.length,
  literalNextListedPrimeResidues: afterMarkedPrimeResiduals,
  thirdCipherRuneIndex: p0.indices[15],
  decision: 'One frozen source-to-marker two-rune synchronization candidate. No cipher continuation or recovered plaintext.'
}, null, 2));
