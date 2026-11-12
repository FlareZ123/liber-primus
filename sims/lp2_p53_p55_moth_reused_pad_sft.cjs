'use strict';

/**
 * Test exactly the source-observed p53/p55 duplicated-moth pages for the
 * simplest repeated additive GP29 page-initial keystream. No phase sweep.
 * Train the difference-unigram null on the solved LP1 reference only.
 *
 * Run: node sims/lp2_p53_p55_moth_reused_pad_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const solved = fs.readFileSync(path.join(root, 'lp1-plaintext-reference.txt'), 'utf8');
const alphabet = corpus.translit.map((r, i) => [r, i])
  .sort((a, b) => b[0].length - a[0].length);

/** @returns {number[]} */
function sourceNativeGP() {
  const input = solved.replace(/^\[.*\]$/gm, '')
    .replace(/^#.*$/gm, '')
    .replace(/\d+/g, ' ');
  const output = [];
  for (const word of input.toUpperCase().matchAll(/[A-Z]+/g)) {
    let remaining = word[0].replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    const token = [];
    while (remaining.length) {
      const hit = alphabet.find(([r]) => remaining.startsWith(r));
      if (!hit) {
        token.length = 0;
        break;
      }
      token.push(hit[1]);
      remaining = remaining.slice(hit[0].length);
    }
    output.push(...token);
  }
  return output;
}

const native = sourceNativeGP();
assert.equal(native.length, 3287);
const f = Array(29).fill(0);
native.forEach(x => f[x]++);
const prob = f.map(x => (x + 0.5) / (native.length + 14.5));
// Under an identical additive pad, C_a-C_b = P_a-P_b mod29.
const diffProb = Array.from({ length: 29 }, (_, d) =>
  prob.reduce((sum, p, i) => sum + p * prob[(i - d + 29) % 29], 0)
);

/**
 * Log-likelihood ratio for a 75-rune difference tape under two
 * independently sampled native-GP plaintext streams versus a uniform tape.
 * @param {number[]} aa @param {number[]} bb
 * @returns {number}
 */
function score(aa, bb) {
  assert.equal(aa.length, 75);
  assert.equal(bb.length, 75);
  let total = 0;
  for (let i = 0; i < 75; i++) {
    const difference = (aa[i] - bb[i] + 29) % 29;
    total += Math.log(29 * diffProb[difference]);
  }
  return total;
}

const p53 = corpus.pages.find(p => p.page === 53)?.indices;
const p55 = corpus.pages.find(p => p.page === 55)?.indices;
assert(p53 && p55 && p53.length === 179 && p55.length === 76);
const tests = [
  { label: 'full-page local-start 0/0', a: p53.slice(0, 75), b: p55.slice(0, 75) },
  { label: 'page53-start / page55-post-carry', a: p53.slice(0, 75), b: p55.slice(1, 76) }
];
const originals = tests.map(t => ({
  label: t.label,
  score: score(t.a, t.b),
  equalPositionCount: t.a.reduce((count, value, i) =>
    count + Number(value === t.b[i]), 0)
}));
assert.deepEqual(originals.map(x => x.equalPositionCount), [1, 5]);
assert(Math.abs(originals[0].score + 3.85288467054467) < 1e-9);
assert(Math.abs(originals[1].score + 1.2559169047347514) < 1e-9);

// Synthetic exactly shared pad: the score must be independent of the pad.
let seed = 0x20135529;
/** @returns {number} */
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const textA = native.slice(170, 245);
const textB = native.slice(1020, 1095);
const pad = Array.from({ length: 75 }, () => rand32() % 29);
const encA = textA.map((v, i) => (v + pad[i]) % 29);
const encB = textB.map((v, i) => (v + pad[i]) % 29);
assert(Math.abs(score(textA, textB) - score(encA, encB)) < 1e-12);

// New deterministic PRNG starts here for a reproducible native/null ranking.
seed = 0x20135529;
const nSample = 50000;
let englishBelow = [0, 0], uniformBelow = [0, 0];
let englishSum = 0, uniformSum = 0;
for (let k = 0; k < nSample; k++) {
  const j = rand32() % (native.length - 75);
  const l = rand32() % (native.length - 75);
  const natural = score(native.slice(j, j + 75), native.slice(l, l + 75));
  const uniformA = Array.from({ length: 75 }, () => rand32() % 29);
  const uniformB = Array.from({ length: 75 }, () => rand32() % 29);
  const uniform = score(uniformA, uniformB);
  englishSum += natural;
  uniformSum += uniform;
  for (let i = 0; i < 2; i++) {
    if (natural <= originals[i].score) englishBelow[i]++;
    if (uniform <= originals[i].score) uniformBelow[i]++;
  }
}
assert.deepEqual(englishBelow, [61, 2533]);
assert.deepEqual(uniformBelow, [8159, 32196]);

console.log(JSON.stringify({
  source: 'original LP2 p53/p55 duplicate-moth art; two frozen page-start alignments',
  nativeControlGP29Runes: native.length,
  nativeControlMean: englishSum / nSample,
  independentUniformMean: uniformSum / nSample,
  originalCases: originals.map((item, i) => ({
    ...item,
    nativeEnglishPairLowerTail: englishBelow[i] / nSample,
    independentUniformLowerTail: uniformBelow[i] / nSample
  })),
  syntheticSharedPadDifferenceInvariant: true,
  caveat: 'excludes only these 0-phase, identical additive-pad starting alignments, not shifted/stateful keys'
}, null, 2));
