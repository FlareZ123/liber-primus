'use strict';

/**
 * Source-original adversarial test of two published LP2 repeating-key
 * plaintext claims. Read-only SFT: node sims/lp2_claimed_primus_keys_original_sft.cjs
 *
 * Keys are transcribed exactly from Wulfic/Cicada3301-Liber_Primus,
 * MASTER_TRACKER.md (2026-10-12), physical LP2 pp18 and 19.
 * The test never uses guessed plaintext to optimize the keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const claims = [
  {
    page: 18,
    sign: -1,
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    initial: 'BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY',
    expected: { length: 260, period: 53, extinctAt: 5, fullIoC: 0.038164538164538166, suffixIoC: 0.03653674780732611 }
  },
  {
    page: 19,
    sign: 1,
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    initial: 'REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEORHEER',
    expected: { length: 271, period: 47, extinctAt: 114, fullIoC: 0.034249009156758235, suffixIoC: 0.03451313260730301 }
  }
];

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number[]} indices @returns {string} */
function transliterate(indices) {
  return indices.map(index => corpus.translit[index]).join('');
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function periodicInverse(ciphertext, key, sign) {
  return ciphertext.map((value, i) => mod29(value + sign * key[i % key.length]));
}

/**
 * Every possibility allowed by the solved-p56 plaintext-F bypass:
 * plaintext F=0 emits C=0 and DOES NOT advance key; any non-F plaintext
 * consumes one key symbol. A ciphertext F may alternatively encrypt a
 * non-F plaintext and consume key. The DP tracks ALL possible key clocks;
 * merging equivalent clocks is exact because plaintext history does not
 * enter this particular cipher.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {{firstImpossibleOffset:number, liveClocks:number[]}}
 */
function transparentFReachability(ciphertext, key, sign) {
  let clocks = new Set([0]);
  for (let pos = 0; pos < ciphertext.length; pos++) {
    const next = new Set();
    const c = ciphertext[pos];
    for (const clock of clocks) {
      const decoded = mod29(c + sign * key[clock % key.length]);
      if (c === 0) next.add(clock); // literal plaintext F: output F, no key
      if (decoded !== 0) next.add(clock + 1); // encrypted non-F
    }
    if (next.size === 0) return { firstImpossibleOffset: pos, liveClocks: [] };
    clocks = next;
  }
  return { firstImpossibleOffset: -1, liveClocks: [...clocks] };
}

assert.equal(corpus.pages.filter(p => p.page <= 55).reduce(
  (sum, p) => sum + p.indices.length, 0
), 12956);
const clearP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
assert.ok(ioc(clearP57) > 0.06);

for (const claim of claims) {
  const c = corpus.pages.find(p => p.page === claim.page).indices;
  const k = claim.key;
  assert.equal(c.length, claim.expected.length);
  assert.equal(k.length, claim.expected.period);
  const p = periodicInverse(c, k, claim.sign);
  assert.equal(transliterate(p.slice(0, k.length)), claim.initial);
  assert.ok(Math.abs(ioc(p) - claim.expected.fullIoC) < 1e-12);
  assert.ok(Math.abs(ioc(p.slice(k.length)) - claim.expected.suffixIoC) < 1e-12);

  // Full 95-rune source-native positive plant under the EXACT proposed key.
  const synthetic = clearP57.map((v, i) => mod29(v - claim.sign * k[i % k.length]));
  assert.deepEqual(periodicInverse(synthetic, k, claim.sign), clearP57);

  const reachable = transparentFReachability(c, k, claim.sign);
  assert.equal(reachable.firstImpossibleOffset, claim.expected.extinctAt);
  assert.equal(reachable.liveClocks.length, 0);
  console.log(JSON.stringify({
    page: claim.page,
    originalRunes: c.length,
    givenKeyPeriod: k.length,
    firstCycle: claim.initial,
    nextCycle: transliterate(p.slice(k.length, 2 * k.length)),
    originalFullPageIoC: ioc(c),
    decodedFullPageIoC: ioc(p),
    decodedHeldoutSuffixIoC: ioc(p.slice(k.length)),
    sourceClearP57IoC: ioc(clearP57),
    fTransparentFirstImpossibleOffset: reachable.firstImpossibleOffset,
    nativePlantRecovered: clearP57.length
  }));
}
console.log('PASS original LP2 keys, heldout suffixes, all-secret F-mask feasibility, and plants');
