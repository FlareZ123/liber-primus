'use strict';
/**
 * Original LP2 opening 729 = 3*243: all-key repeated-243 substitution gate.
 *
 * Any unknown GP29 permutation K_i independently chosen for each of 243
 * positions, reused at i, i+243, i+486, preserves equality of the three
 * underlying plaintext symbols. This includes every reused additive pad
 * and arbitrarily nonlinear secret position-specific substitution.
 *
 * No plaintext is guessed or secret permutation enumerated.
 * Windows 11 / Node.js 22 / CommonJS:
 * node sims/lp2_opening729_shared243_anybijection_keycancel_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = gp.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(gp.pages.slice(0, 3).map(p => p.indices.length),
  [262, 266, 201]);
assert.equal(original.length, 729);
const wordTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function toGp(text) {
  const out = [];
  const words = text.match(/\p{L}+/gu) || [];
  for (const word of words) {
    const z = word.toUpperCase().normalize('NFD')
      .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
      .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < z.length;) {
      if (z.startsWith('ING', i)) {
        out.push(21); i += 3;
      } else if (z.startsWith('IO', i)) {
        out.push(27); i += 2;
      } else {
        const token = wordTokens.find(x => z.startsWith(x.s, i));
        assert(token, word + ': ' + z.slice(i));
        out.push(token.i); i += token.s.length;
      }
    }
  }
  return out;
}
/**
 * Count equalities among the three GP symbols at each of 243 positions.
 * @param {number[]} source
 * @param {number} start
 * @returns {{pairs:number[],total:number,allDistinct:number,allEqual:number}}
 */
function overlap(source, start = 0) {
  assert(start >= 0 && start + 729 <= source.length);
  const pairs = [0, 0, 0];
  let allDistinct = 0, allEqual = 0;
  for (let i = 0; i < 243; i++) {
    const a = source[start + i];
    const b = source[start + i + 243];
    const c = source[start + i + 486];
    pairs[0] += Number(a === b);
    pairs[1] += Number(a === c);
    pairs[2] += Number(b === c);
    allDistinct += Number(a !== b && a !== c && b !== c);
    allEqual += Number(a === b && b === c);
  }
  return {pairs, total:pairs.reduce((s, n) => s + n, 0),
    allDistinct, allEqual};
}
const observed = overlap(original);
assert.deepEqual(observed, {
  pairs:[7, 8, 7], total:22, allDistinct:221, allEqual:0
});
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function inverse29(n) {
  for (let i = 1; i < 29; i++) if (n * i % 29 === 1) return i;
  throw Error('noninvertible affine key');
}
// Authentic solved-Cicada GP-native control: one continuous original LP1
// koan from the checked-in independent established plaintext reference.
const clearRef = read('resources/liber-primus/lp1-plaintext-reference.txt');
const page6 = clearRef.split(/^###\s+(\d+)\s*$/m);
const section = page6.findIndex(x => x === '6');
assert(section >= 0);
const koan = page6[section + 1].replace(/^.*?\n\n/, '')
  .replace(/\[[^\]]*\]/g, '').replace(/\(continued[^)]*\)/gi, '');
const native = toGp(koan);
assert.equal(native.length, 740);
const plain = native.slice(0, 729);
// All 243 secret affine per-position alphabets are distinct; every one
// is a valid permutation because 29 is prime and 1<=a_i<=28.
const cipher = plain.map((p, j) => {
  const i = j % 243;
  const a = 1 + 7 * i % 28;
  const b = mod29(11 * i * i + 5);
  return mod29(a * p + b);
});
const recovered = cipher.map((c, j) => {
  const i = j % 243;
  const a = 1 + 7 * i % 28;
  const b = mod29(11 * i * i + 5);
  return mod29(inverse29(a) * (c - b));
});
assert.deepEqual(recovered, plain);
assert.deepEqual(overlap(cipher), overlap(plain));
assert(overlap(native, 0).total > observed.total);
let seed = 0x331729;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/**
 * Source-contiguous 729-rune windows; full GP native translation is fixed
 * before any sample, and no original candidate controls its donor windows.
 * @param {string} name
 * @param {string} file
 * @returns {object}
 */
function nativeControl(name, file) {
  const text = toGp(read(file));
  const sampleCount = 20000;
  const counts = [];
  for (let i = 0; i < sampleCount; i++) {
    const start = random() % (text.length - 729);
    counts.push(overlap(text, start).total);
  }
  counts.sort((a, b) => a - b);
  const lower = counts.filter(x => x <= observed.total).length;
  return {
    name, sourceRunes:text.length, sampleCount,
    minimum:counts[0], percentile01:counts[199],
    percentile05:counts[999], median:counts[9999],
    mean:counts.reduce((a, b) => a + b, 0) / sampleCount,
    countAtOrBelowOriginal:lower,
    frequencyAtOrBelowOriginal:lower / sampleCount
  };
}
const sources = [
  nativeControl('Shakespeare', 'resources/control/shakespeare_first300k.txt'),
  nativeControl('Gibran', 'resources/control/gibran_prophet_58585.txt'),
  nativeControl('Emerson', 'resources/control/emerson_essays_2944.txt')
];
assert.deepEqual(sources.map(x => x.sourceRunes),
  [217106, 62492, 321327]);
assert.deepEqual(sources.map(x => x.countAtOrBelowOriginal),
  [0, 16, 2]);
const shuffleSeed = 0x1733299;
seed = shuffleSeed;
const blocks = Array.from({length:3}, (_, j) =>
  original.slice(j * 243, (j + 1) * 243));
let countShuffleLE = 0, sumShuffle = 0;
for (let trial = 0; trial < 10000; trial++) {
  const shuffled = blocks.map(block => {
    const a = block.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
  const count = overlap(shuffled.flat()).total;
  countShuffleLE += Number(count <= observed.total);
  sumShuffle += count;
}
const originalMarginalShuffle = {
  trials:10000, mean:sumShuffle / 10000,
  fractionAtOrBelowOriginal:countShuffleLE / 10000
};
assert(originalMarginalShuffle.mean > 22 &&
  originalMarginalShuffle.mean < 27);
console.log(JSON.stringify({
  hypothesis:'One arbitrary GP29 substitution/permutation per absolute position mod243, reused three times across original pp0-2',
  manuscript:'729 unchanged GP29 runes, exactly three contiguous 243-rune strips',
  original:observed,
  sourceNativeLP1Koan:{runes:native.length,
    originalPlainEqualityPairs:overlap(plain).total,
    encryptedEqualityPairs:overlap(cipher).total,
    recoveredPlaintextRunes:recovered.length},
  matchedNativeGpControls:sources,
  originalMarginalShuffle,
  exactInvariant:'All pointwise reused bijections preserve each of the three paired equality indicators at each of 243 sites.',
  scope:'Strong finite English-register rejection of reused 243-position substitution; no manuscript plaintext decrypted.'
}, null, 2));
console.log('PASS: 729 source runes, GP-native positive 729/729, 60,000 native donor windows, 10,000 original-marginal controls');
