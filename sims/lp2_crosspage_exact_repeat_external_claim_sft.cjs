'use strict';

/**
 * Original LP2 cross-page exact-substring census and external duplicate-claim gate.
 * Independent source claim: Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER.md
 * (April 2026), "P27 ciphertext = P44 first 234 runes".
 * Input: resources/liber-primus/lp2-corpus.json, physical LP2 pages 0..55.
 * Node 22, CommonJS, no dependencies. The runeless p50 is correctly omitted.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/**
 * @param {number[]} first
 * @param {number[]} second
 * @returns {{length:number, locations:number[][]}}
 */
function longestCommonSubstring(first, second) {
  let length = 0;
  /** @type {number[][]} */
  let locations = [];
  for (let i = 0; i < first.length; i++) {
    for (let j = 0; j < second.length; j++) {
      let n = 0;
      while (i + n < first.length && j + n < second.length
        && first[i + n] === second[j + n]) n++;
      if (n > length) {
        length = n;
        locations = [[i, j]];
      } else if (n === length && n > 0) locations.push([i, j]);
    }
  }
  return {length, locations};
}

/**
 * Enumerate every pair of occurrences of the same length-k substring that
 * belong to different physical pages. Page-local repeats do not count.
 * @param {{page:number,indices:number[]}[]} pages
 * @param {number} k
 * @returns {{length:number, p:number, off:number, q:number, qoff:number, runes:number[]}[]}
 */
function crossPageExact(pages, k) {
  /** @type {Map<string, {page:number,off:number}[]>} */
  const index = new Map();
  /** @type {{length:number,p:number,off:number,q:number,qoff:number,runes:number[]}[]} */
  const matches = [];
  for (const page of pages) {
    const a = page.indices;
    for (let off = 0; off <= a.length - k; off++) {
      const runes = a.slice(off, off + k);
      const key = runes.join(',');
      const earlier = index.get(key) || [];
      for (const location of earlier) {
        if (page.page !== location.page) matches.push({
          length:k, p:location.page, off:location.off,
          q:page.page, qoff:off, runes
        });
      }
      earlier.push({page:page.page, off});
      index.set(key, earlier);
    }
  }
  return matches;
}

const pages = corpus.pages.filter(p =>
  p.page >= 0 && p.page <= 55 && p.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
const get = n => pages.find(p => p.page === n).indices;
const original27 = get(27), original44 = get(44);
assert.deepEqual([original27.length, original44.length], [234, 273]);
assert.notEqual(original27[0], original44[0]);
const local = longestCommonSubstring(original27, original44);
assert.equal(local.length, 3);
assert.deepEqual(local.locations, [[90, 96], [215, 248]]);

const cross6 = crossPageExact(pages, 6);
const cross7 = crossPageExact(pages, 7);
assert.equal(cross6.length, 1);
assert.equal(cross7.length, 0);
assert.deepEqual(cross6[0], {
  length:6, p:27, off:28, q:55, qoff:70, runes:[23,11,1,17,18,10]
});

// Plant the asserted 234-rune exact prefix in a copy. Detector must catch it.
const planted = pages.map(p => ({page:p.page, indices:p.indices.slice()}));
const target = planted.find(p => p.page === 44);
target.indices.splice(0, 234, ...original27);
assert.equal(longestCommonSubstring(original27, target.indices).length, 234);
assert.ok(crossPageExact(planted, 7).some(
  hit => hit.p === 27 && hit.q === 44 && hit.off === 0 && hit.qoff === 0
));

const result = {
  source: 'resources/liber-primus/lp2-corpus.json',
  physicalUnsolvedPages: pages.length,
  originalRunes: 12956,
  externalP27EqualsP44Claim: false,
  page27Length: 234,
  page44Length: 273,
  matchingInitialRunes: 0,
  p27P44Longest: local,
  allPagesCrossPageSixRuneMatches: cross6,
  allPagesCrossPageSevenRuneMatches: cross7.length,
  longestExactCrossPageSubstring: 6,
  planted234PrefixDetected: true,
  scope: 'Exact identical ciphertext substrings only; no exclusion of repeated plaintext under differing keys.'
};
if (require.main === module)
  console.log(JSON.stringify(result, null, 2));

module.exports = {longestCommonSubstring, crossPageExact};
