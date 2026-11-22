'use strict';

/**
 * Frozen original-cipher test of two publicly asserted LP2 page keys.
 * Historic, now retracted claims: Wulfic/Cicada3301-Liber_Primus
 * reference/archive/MASTER_TRACKER_pre-2026-09-29.md,
 * "Page 18 — Vigenère SUB, Key Length 53" and
 * "Page 19 — Vigenère ADD, Key Length 47". The current tracker
 * explicitly retracts pre-2026-09-29 wrongly mapped-page claims.
 * Scan 18.jpg is true physical LP2 p1; scan 19.jpg is physical p2.
 * No repository or network writes. Run: node sims/lp2_external_p18_p19_keys_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const alpha = corpus.translit;
const map = new Map(alpha.map((s, i) => [s, i]));

/** @param {string} message English words; preserve word boundaries for GP digraphs. @returns {number[]} */
function gp(message) {
  const out = [];
  for (let word of message.toUpperCase().split(/[^A-Z]+/).filter(Boolean)) {
    word = word.replace(/K/g, 'C').replace(/V/g, 'U').replace(/Q/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      const sym = map.has(pair) ? pair : word[i];
      assert(map.has(sym), 'Unsupported GP symbol: ' + sym);
      out.push(map.get(sym));
      i += sym.length;
    }
  }
  return out;
}

/** @param {number[]} seq @param {number[]} key @param {number} sign @param {number} phase @returns {number[]} */
function transform(seq, key, sign, phase = 0) {
  return seq.map((x, i) => (x + sign * key[(i + phase) % key.length] + 29) % 29);
}

/** Longest exact substring shared by two rune streams. Returns positions for the maximum. */
function longestShared(a, b) {
  let best = { length: 0, originalOffset: -1, claimedOffset: -1 };
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0;
      while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
      if (k > best.length) best = { length: k, originalOffset: i, claimedOffset: j };
    }
  }
  return best;
}

const cases = [
  {
    scan: '18.jpg', physicalPage: 1, length: 53, sign: -1,
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    claimed: 'BEING OF ALL I WILL ASK THE OATH IS SWORN TO THE ONE WITHIN THE ABOVE THE WAY'
  },
  {
    scan: '19.jpg', physicalPage: 2, length: 47, sign: 1,
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    claimed: 'REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR'
  }
];

for (const test of cases) {
  assert.equal(test.key.length, test.length);
  const original = corpus.pages[test.physicalPage].indices;
  const target = gp(test.claimed);
  const decoded = transform(original, test.key, test.sign);
  assert.deepEqual(transform(decoded, test.key, -test.sign), original, 'Original exact forward replay');
  let best = { length: -1 };
  let exactCount = 0;
  for (let phase = 0; phase < test.length; phase++) {
    const candidate = transform(original, test.key, test.sign, phase);
    const shared = longestShared(candidate, target);
    if (shared.length > best.length) best = { ...shared, phase };
    for (let i = 0; i + target.length <= candidate.length; i++) {
      if (candidate.slice(i, i + target.length).every((x, j) => x === target[j])) exactCount++;
    }
  }
  // Positive: an actual source-language string encrypted with the same claimed
  // period and arithmetic sign must decode 100% under the implementation.
  const synthetic = Array.from({ length: original.length }, (_, i) => target[i % target.length]);
  const plantedCipher = transform(synthetic, test.key, -test.sign);
  assert.deepEqual(transform(plantedCipher, test.key, test.sign), synthetic, 'Native message plant');
  assert.equal(longestShared(transform(plantedCipher, test.key, test.sign), target).length, target.length);
  assert.equal(exactCount, 0, 'Public full-phrase claim unexpectedly matched untouched original');
  const firstCycle = decoded.slice(0, test.length).map(x => alpha[x]).join('');
  const secondCycle = decoded.slice(test.length, test.length * 2).map(x => alpha[x]).join('');
  console.log(JSON.stringify({
    externalScan: test.scan, physicalLP2: test.physicalPage, originalRunes: original.length,
    claimedKeyPeriod: test.length, claimedGPTextRunes: target.length, originalForwardReplay: true,
    allCyclicPhasesSearched: test.length, exactClaimedPhraseHits: exactCount,
    bestSharedContiguousRunes: best, firstCycle, secondCycle, nativePlantRecovered: original.length
  }));
}
console.log('PASS external claimed-p18/p19 original-cipher gate: both full phrases absent even over all stated-key phases.');
