'use strict';

/**
 * Original LP2 terminal-doublet gate for zero-step GP29 feedback.
 *
 * A reversible difference cipher C[w,j] = C[w,j-1] + f[w,j](P[w,j]) mod29
 * with arbitrary, independently secret bijections f[w,j] that satisfy
 * f[w,j](anchor) = 0 has a key-free invariant:
 * C[w,j] === C[w,j-1] iff P[w,j] === anchor.
 *
 * The source-numeric anchors are GP0 F=0 and one-based GP1 EA=29=0 mod29.
 * Exact original printed-word and physical-page boundaries are honored.
 * Conditional native-English controls are sampled by each original length.
 * No unknown plaintext or author's cipher is identified.
 *
 * Windows Node22, CommonJS, no dependencies:
 * node sims/lp2_zero_step_reserved_rune_terminal_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const pageAt = new Uint8Array(original.length);
let offset = 0;
for (const p of pages) {
  pageAt.fill(p.page, offset, offset + p.indices.length);
  offset += p.indices.length;
}
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

const glyph = new Map(gp.runes.map((s, i) => [s, i]));
const runic = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const printed = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('')
  .replace(/\/\r?\n/g, '').replace(/[\r\n]/g, '');
const words = (printed.match(runic) || [])
  .map(w => [...w].map(r => glyph.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

/** @type {Map<number, number>} */
const terminalEligibleByLength = new Map();
const terminalDoublets = [];
const multis = [];
let internalEligible = 0;
let internalRepeat = 0;
offset = 0;
for (let wi = 0; wi < words.length; wi++) {
  const w = words[wi];
  const events = [];
  for (let j = 1; j < w.length; j++) {
    if (pageAt[offset + j] !== pageAt[offset + j - 1]) continue;
    internalEligible++;
    if (w[j] === w[j - 1]) {
      internalRepeat++;
      events.push(j);
      if (j === w.length - 1) {
        terminalDoublets.push({
          word: wi, page: pageAt[offset + j], global: offset + j,
          length: w.length, withinWord: j
        });
      }
    }
  }
  if (w.length > 1 &&
      pageAt[offset + w.length - 1] === pageAt[offset + w.length - 2]) {
    const n = terminalEligibleByLength.get(w.length) || 0;
    terminalEligibleByLength.set(w.length, n + 1);
  }
  if (events.length > 1) multis.push({word: wi, start: offset, events});
  offset += w.length;
}
assert.equal(offset, 12956);
assert.equal(internalEligible, 10028);
assert.equal(internalRepeat, 63);
assert.equal(terminalDoublets.length, 19);
assert.equal([...terminalEligibleByLength.values()].reduce((s, x) => s + x, 0), 2804);
assert.deepEqual(multis, [{word: 1476, start: 6606, events: [5, 11]}]);
assert.deepEqual(terminalDoublets.find(t => t.word === 1476), {
  word: 1476, page: 27, global: 6617, length: 12, withinWord: 11
});

const controlNames = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
/**
 * The distribution is a Poisson-binomial conditional on matching each
 * original word's rune length. Independent source tokens are sampled with
 * replacement. Native prose cannot be inferred from ciphertext alone.
 *
 * @param {Map<number, number>} counts
 * @param {Map<number, number[][]>} pools
 * @param {number} anchor
 * @param {'atMost'|'atLeast'} mode
 * @returns {{expected: number, probability: number}}
 */
function terminalTail(counts, pools, anchor, mode) {
  const threshold = 19;
  const dp = new Float64Array(threshold + 1);
  dp[0] = 1;
  let expected = 0;
  for (const [length, n] of counts) {
    const source = pools.get(length);
    assert(source && source.length, 'missing GP-length control ' + length);
    const success = source.filter(w => w.at(-1) === anchor).length;
    const p = success / source.length;
    expected += n * p;
    for (let i = 0; i < n; i++) {
      if (mode === 'atLeast') dp[threshold] += dp[threshold - 1] * p;
      for (let j = threshold - Number(mode === 'atLeast'); j > 0; j--) {
        dp[j] = dp[j] * (1 - p) + dp[j - 1] * p;
      }
      dp[0] *= 1 - p;
    }
  }
  const probability = mode === 'atLeast'
    ? dp[threshold] : dp.reduce((sum, p) => sum + p, 0);
  return {expected, probability};
}

/**
 * Reversible planted cipher with a new independent nonzero multiplier for
 * every within-word position. The first symbol has a known test-only IV.
 * @param {number[][]} plainWords
 * @param {number} anchor
 * @returns {{checked: number, checkedMarkers: number}}
 */
function plantedInverse(plainWords, anchor) {
  let checked = 0;
  let checkedMarkers = 0;
  for (let wi = 0; wi < plainWords.length; wi++) {
    const p = plainWords[wi];
    if (!p.length) continue;
    const initializer = 13 * wi % 29;
    const cipher = [(p[0] + initializer) % 29];
    const decoded = [(cipher[0] - initializer + 29) % 29];
    for (let j = 1; j < p.length; j++) {
      const k = 1 + (7 * wi + 11 * j) % 28;
      let inverse = 1;
      while (k * inverse % 29 !== 1) inverse++;
      const step = (p[j] - anchor + 29) % 29;
      const delta = k * step % 29;
      cipher.push((cipher[j - 1] + delta) % 29);
      const recoveredStep = ((cipher[j] - cipher[j - 1] + 29) * inverse) % 29;
      decoded.push((recoveredStep + anchor) % 29);
      assert.equal(cipher[j] === cipher[j - 1], p[j] === anchor);
      checkedMarkers++;
    }
    assert.deepEqual(decoded, p);
    checked += p.length;
  }
  return {checked, checkedMarkers};
}

const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const solvedP57 = reference.split('### 57\n')[1].trim();
const solvedNative = (solvedP57.match(/[A-Z]+/g) || []).map(encodeSourceNativeGP);
assert.deepEqual(solvedNative.flat(), gp.pages[57].indices);
assert.equal(solvedNative.length, 20);
assert.equal(plantedInverse(solvedNative, 0).checked, 95);
assert.equal(plantedInverse(solvedNative, 28).checked, 95);

const controls = [];
for (const sourceName of controlNames) {
  const latin = read(sourceName).toUpperCase().match(/[A-Z]+/g) || [];
  /** @type {Map<number, number[][]>} */
  const pools = new Map();
  for (const word of latin) {
    const w = encodeSourceNativeGP(word);
    if (!pools.has(w.length)) pools.set(w.length, []);
    pools.get(w.length).push(w);
  }
  const zeroF = terminalTail(terminalEligibleByLength, pools, 0, 'atMost');
  const zeroEA = terminalTail(terminalEligibleByLength, pools, 28, 'atLeast');
  const longWords = [...pools.values()].flat().filter(w => w.length >= 7);
  const longEndEA = longWords.filter(w => w.at(-1) === 28).length;
  const nativePlant = words.map((w, i) => {
    const p = pools.get(w.length);
    assert(p && p.length);
    return p[(37 * i + 11) % p.length];
  });
  assert.equal(plantedInverse(nativePlant, 0).checked, 12956);
  assert.equal(plantedInverse(nativePlant, 28).checked, 12956);
  assert(zeroF.probability < 1e-10);
  assert(zeroEA.probability < 2e-11);
  assert.equal(longEndEA, 0);
  controls.push({
    corpus: sourceName, nativeWords: latin.length,
    nativeLongWords: longWords.length, terminalEAAmongLong: longEndEA,
    F0: zeroF, EA28: zeroEA
  });
}
assert.deepEqual(controls.map(c => c.nativeWords), [55407, 15733, 77932]);

const output = {
  classification: 'conditional original-input exclusion; no unknown plaintext',
  model: 'C[w,j]=C[w,j-1]+f[w,j](P[w,j]) mod29; f any bijection with f(anchor)=0',
  original: {
    runeCount: original.length, words: words.length,
    eligibleInternalSites: internalEligible, internalRepeat,
    eligibleTerminalSites: 2804, terminalRepeat: terminalDoublets.length,
    anomalous12RuneWord: multis[0],
    terminalDoublets
  },
  fixedSourceAnchors: {'GP0_F':0,'GP1_EA':28},
  matchedNativeControls: controls,
  plantedFullNativeRoundTrips: 6,
  independentSolvedP57RoundTrips: 2
};
if (require.main === module) console.log(JSON.stringify(output, null, 2));
module.exports = {terminalTail, plantedInverse};
