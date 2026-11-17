'use strict';

/**
 * Original LP2 six-back R4 collision ambiguity and one-rune checksum inverse.
 * Run on Windows 11: node sims/lp2_phase57_word_checksum_inverse_sft.cjs
 *
 * Classification: conditional lossless construction and bounded original-source
 * edge-channel rejection. A synthetic parity check is NOT a recovered LP2 key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const mod = x => ((x % 29) + 29) % 29;
const words = [];
let values = [];
let pages = [];
for (const [chunk, source] of text.split('%').slice(0, 55).entries()) {
  for (const rune of source.replace(/[\/\s]/g, '')) {
    if (alphabet.has(rune)) {
      values.push(alphabet.get(rune));
      pages.push(chunk < 50 ? chunk : chunk + 1);
    } else if (values.length > 0) {
      words.push({ values, pages });
      values = [];
      pages = [];
    }
  }
}
if (values.length > 0) words.push({ values, pages });
const real = words.flatMap(word => word.values);
const canonical = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
assert.equal(words.length, 2896);
assert.equal(real.length, 12956);
assert.deepEqual(real, canonical);
assert.equal(words.filter(w => w.pages[0] !== w.pages.at(-1)).length, 32);

/**
 * Enumerate nondegenerate R4 ambiguities on a word's transmitted symbols.
 * At a T6 relation c[j]=24-2*c[j-6], two distinct nominal symbols
 * (c[j] or c[j-1]) may produce the identical published c[j].
 *
 * @param {number[]} published
 * @returns {{position:number, delta:number}[]}
 */
function ambiguities(published) {
  const hits = [];
  for (let j = 6; j < published.length; j++) {
    const replacement = mod(24 - 2 * published[j - 6]);
    const before = published[j - 1];
    if (published[j] === replacement && before !== replacement) {
      hits.push({ position: j, delta: mod(before - published[j]) });
    }
  }
  return hits;
}

/**
 * Restore the full nominal pre-overwrite tape from a repair-mask value.
 * @param {number[]} published
 * @param {{position:number, delta:number}[]} hits
 * @param {number} mask
 * @returns {number[]}
 */
function restore(published, hits, mask) {
  const nominal = published.slice();
  for (let i = 0; i < hits.length; i++) {
    if ((mask & (1 << i)) !== 0) {
      const j = hits[i].position;
      nominal[j] = published[j - 1];
    }
  }
  return nominal;
}

/**
 * GP29 additive word checksum over pre-repair nominal values.
 * This is a hypothetical side channel, never assumed available on the page.
 * @param {number[]} nominal
 * @returns {number}
 */
function checksum(nominal) {
  return mod(nominal.reduce((sum, value) => sum + value, 0));
}

/**
 * Invert the ambiguity-bearing part of a word when supplied an EXTERNAL
 * authenticated checksum symbol. Error if zero or multiple branches agree.
 * @param {number[]} published
 * @param {number} check
 * @returns {number[]}
 */
function invertWithCheck(published, check) {
  const hits = ambiguities(published);
  const matches = [];
  for (let mask = 0; mask < (1 << hits.length); mask++) {
    const candidate = restore(published, hits, mask);
    if (checksum(candidate) === check) matches.push(candidate);
  }
  assert.equal(matches.length, 1);
  return matches[0];
}

let eligible = 0;
let affectedWords = 0;
let ambiguityCount = 0;
const multiplicities = new Map();
const trueNominal = [];
const externallySuppliedChecks = [];
let examples = [];
for (const [wordIndex, word] of words.entries()) {
  const published = word.values;
  eligible += Math.max(0, published.length - 6);
  const hits = ambiguities(published);
  ambiguityCount += hits.length;
  multiplicities.set(hits.length, (multiplicities.get(hits.length) || 0) + 1);
  if (hits.length === 0) {
    trueNominal.push(...published);
    continue;
  }
  affectedWords++;
  assert.ok(hits.length <= 2, 'unexpected original ambiguity multiplicity');
  // Every possible repair-branch checksum must be distinct inside this word.
  const sums = new Set();
  for (let mask = 0; mask < (1 << hits.length); mask++) {
    const candidate = restore(published, hits, mask);
    const parity = checksum(candidate);
    assert.ok(!sums.has(parity), 'source word has colliding branch checksums');
    sums.add(parity);
    // The forward R4 overwrite, with the supplied branch flags, returns
    // the original ciphertext symbol for every position of the word.
    for (let j = 0; j < published.length; j++) {
      const flagged = hits.some((site, k) =>
        site.position === j && (mask & (1 << k)) !== 0);
      const emitted = flagged ? mod(24 - 2 * published[j - 6]) : candidate[j];
      assert.equal(emitted, published[j]);
    }
  }
  // An arbitrary fixture chooses an actual repair mask for each affected word.
  const fixtureMask = (wordIndex * 7 + 1) % (1 << hits.length);
  const nominal = restore(published, hits, fixtureMask);
  const parity = checksum(nominal);
  assert.deepEqual(invertWithCheck(published, parity), nominal);
  trueNominal.push(...nominal);
  externallySuppliedChecks.push({ wordIndex, parity, positions: hits.map(h => h.position) });
  if (hits.length === 2) examples.push({ wordIndex, page: word.pages[0], positions: hits.map(h => h.position),
    checksums: Array.from(sums).sort((a, b) => a - b) });
}
assert.equal(eligible, 1290);
assert.equal(affectedWords, 74);
assert.equal(ambiguityCount, 79);
assert.deepEqual(Object.fromEntries(multiplicities), { '0': 2822, '1': 69, '2': 5 });
assert.equal(trueNominal.length, 12956);
assert.equal(externallySuppliedChecks.length, 74);
assert.equal(examples.length, 5);

// Original-source channel gate: suppose each affected printed word is
// the R4 cipher BODY plus a LITERAL SUM MOD 29 CHECK RUNE at one end.
// Remove that proposed rune first and recompute ALL body-local T6 sites.
// Permit any subset of the R4 ambiguity branches inside the shortened body.
// Count whether the observed edge matches any possible body checksum.
// This is deliberately generous: matching a checksum is necessary, not
// sufficient to prove the word uses the hypothesized format.
function edgeGate(side) {
  let required = 0;
  let possible = 0;
  let impossible = 0;
  const byMultiplicity = {};
  for (const word of words) {
    if (ambiguities(word.values).length === 0) continue;
    const original = word.values;
    const body = side === 'end' ? original.slice(0, -1) : original.slice(1);
    const edge = side === 'end' ? original.at(-1) : original[0];
    const sites = ambiguities(body);
    if (sites.length === 0) continue;
    required++;
    const checks = new Set();
    for (let mask = 0; mask < (1 << sites.length); mask++) {
      checks.add(checksum(restore(body, sites, mask)));
    }
    const hit = checks.has(edge);
    if (hit) possible++; else impossible++;
    byMultiplicity[sites.length] ||= { required: 0, possible: 0 };
    byMultiplicity[sites.length].required++;
    byMultiplicity[sites.length].possible += Number(hit);
  }
  return { side, required, possible, impossible, byMultiplicity };
}
const start = edgeGate('start');
const end = edgeGate('end');
assert.deepEqual(start, { side: 'start', required: 43, possible: 4, impossible: 39,
  byMultiplicity: { '1': { required: 40, possible: 4 }, '2': { required: 3, possible: 0 } } });
assert.deepEqual(end, { side: 'end', required: 46, possible: 4, impossible: 42,
  byMultiplicity: { '1': { required: 44, possible: 4 }, '2': { required: 2, possible: 0 } } });

// Separate, stricter direct checksum identity on the complete original words.
// This intentionally does not move any T6 markers or consume hypothetical keys.
// A complete word has a literal end-check iff 2*last == sum(all) (mod 29).
const lastChecks = words.filter(word => word.values.length > 1 &&
  mod(2 * word.values.at(-1)) === checksum(word.values)).length;
assert.equal(lastChecks, 72);


/**
 * More permissive original-source test: a single visible checksum rune may
 * occupy ANY printed slot, not just an endpoint. Keep the original published
 * T6 history, including checksum glyphs, intact when calculating repair
 * ambiguity. A putative checksum is exempt from repair and omitted from the
 * body sum. Independently grant every 2^k original repair-flag assignment.
 *
 * These checks are literal, unencrypted checksums. A separate keyed encoding
 * of the check rune is outside this exact test.
 *
 * @param {'index'|'prime-index'|'prime-prime'} mode
 * @returns {{affected:number,compatible:number,incompatible:number,
 *            unique:number,multiple:number,candidatePairs:number}}
 */
function anywhereChecksumGate(mode) {
  let affected = 0;
  let compatible = 0;
  let incompatible = 0;
  let unique = 0;
  let multiple = 0;
  let candidatePairs = 0;
  for (const word of words) {
    const source = word.values;
    const sites = ambiguities(source);
    if (sites.length === 0) continue;
    affected++;
    let candidates = 0;
    for (let checkIndex = 0; checkIndex < source.length; checkIndex++) {
      const bodySites = sites.filter(site => site.position !== checkIndex);
      for (let mask = 0; mask < (1 << bodySites.length); mask++) {
        let sum = 0;
        for (let j = 0; j < source.length; j++) {
          if (j === checkIndex) continue;
          const branch = bodySites.findIndex(site => site.position === j);
          const nominal = branch >= 0 && (mask & (1 << branch)) !== 0 ?
            source[j - 1] : source[j];
          sum += mode === 'index' ? nominal : corpus.prime[nominal];
        }
        const expected = mode === 'prime-prime' ?
          mod(corpus.prime[source[checkIndex]]) : source[checkIndex];
        if (expected === mod(sum)) candidates++;
      }
    }
    candidatePairs += candidates;
    if (candidates > 0) {
      compatible++;
      if (candidates === 1) unique++; else multiple++;
    } else {
      incompatible++;
    }
  }
  return { affected, compatible, incompatible, unique, multiple, candidatePairs };
}

const anywhere = {
  index: anywhereChecksumGate('index'),
  primeIndex: anywhereChecksumGate('prime-index'),
  primePrime: anywhereChecksumGate('prime-prime')
};
assert.deepEqual(anywhere, {
  index: {affected: 74, compatible: 43, incompatible: 31,
    unique: 34, multiple: 9, candidatePairs: 54},
  primeIndex: {affected: 74, compatible: 35, incompatible: 39,
    unique: 20, multiple: 15, candidatePairs: 55},
  primePrime: {affected: 74, compatible: 34, incompatible: 40,
    unique: 23, multiple: 11, candidatePairs: 47}
});

console.log(JSON.stringify({
  originalPages: 56, runes: real.length, words: words.length, eligible,
  ambiguityCount, affectedWords, multiplicities: Object.fromEntries(multiplicities),
  syntheticChecksumInverseVerified: externallySuppliedChecks.length,
  originalLiteralStart: start, originalLiteralEnd: end,
  originalCompleteWordLastChecks: lastChecks, anywhereChecksumGate: anywhere,
  twoAmbiguityWords: examples
}, null, 2));
console.log('PASS: conditional inverse is exact; original direct edge-check gates fail.');
