'use strict';

/**
 * Key-independent original-cipher test for the GP29 differential
 * multiplicative family:
 *
 *   C_i = C_(i-1) + k_i (P_i - P_(i-1)) (mod 29), k_i in {1,...,28}.
 *
 * A page-first cipher symbol may have any value, and k_i may be a different
 * secret nonzero value at every subsequent position. Any fixed output
 * alphabet permutation also preserves the equality indicator. Within a page,
 * C_i === C_(i-1) if and only if P_i === P_(i-1).
 *
 * Reproduce from the repository root with Node 22:
 *   node sims/lp2_differential_multiplicative_equality_gate_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./affine_echo_literary_control.cjs');

const ROOT = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const unsolvedPages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length);

/**
 * Preserve each printed word, its actual physical page for every rune, and
 * line-continuation conventions of sims/lp2_word_pages.cjs.
 * @returns {Array<Array<{value:number,page:number}>>}
 */
function parseOriginalWords() {
  const segments = read('resources/lp2-transcription.txt').split('%').slice(0, 55);
  assert.equal(segments.length, 55);
  assert.equal(unsolvedPages.length, 55);
  const words = [];
  let current = [];
  let pageIndex = 0;
  const finish = () => {
    if (current.length) words.push(current);
    current = [];
  };
  for (const ch of segments.join('%')) {
    if (runeIndex.has(ch)) {
      current.push({value: runeIndex.get(ch), page: pageIndex});
    } else if (ch === '%') {
      pageIndex++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Physical line breaks do not split source-printed words.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(pageIndex, 54);
  for (let p = 0; p < 55; p++) {
    const indices = [...segments[p]].filter(x => runeIndex.has(x))
      .map(x => runeIndex.get(x));
    assert.deepEqual(indices, unsolvedPages[p].indices);
  }
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((s, w) => s + w.length, 0), 12956);
  return words;
}

/** @param {Array<{value:number,page:number}>} word */
function eligibleMask(word) {
  return word.slice(1).map((x, j) => x.page === word[j].page ? '1' : '0').join('');
}

/** @param {number[]} word @param {string} mask */
function equalCount(word, mask) {
  let n = 0;
  for (let j = 1; j < word.length; j++) {
    if (mask[j - 1] === '1' && word[j] === word[j - 1]) n++;
  }
  return n;
}

/**
 * A rigorous lower-tail upper bound under independent, length-matched
 * resampling of whole English control words (with replacement).
 * For X = sum of eligible equal-adjacent counts, any s > 0 gives
 *
 *   Pr[X <= a] <= exp(s*a) product_g E[exp(-s*X_g)] ^ n_g .
 *
 * Optimize s with the monotone tilted-mean equation, keeping every exact
 * source word frequency in each stratum. The bound applies to the explicit
 * resampling null only; its values are not manuscript-generation p-values.
 * @param {Array<{n:number,h:Array<[number,number]>,size:number}>} strata
 * @param {number} observed
 */
function chernoffBound(strata, observed) {
  /** @param {number} s */
  function evaluate(s) {
    let logBound = s * observed;
    let derivative = observed;
    for (const {n, h, size} of strata) {
      let z = 0;
      let numerator = 0;
      for (const [count, frequency] of h) {
        const weight = frequency * Math.exp(-s * count);
        z += weight;
        numerator += count * weight;
      }
      logBound += n * Math.log(z / size);
      derivative -= n * numerator / z;
    }
    return {logBound, derivative};
  }
  let lower = 0;
  let upper = 8;
  assert(evaluate(lower).derivative < 0);
  assert(evaluate(upper).derivative > 0);
  for (let iteration = 0; iteration < 80; iteration++) {
    const midpoint = (lower + upper) / 2;
    if (evaluate(midpoint).derivative < 0) lower = midpoint;
    else upper = midpoint;
  }
  const s = (lower + upper) / 2;
  return {log10UpperBound: evaluate(s).logBound / Math.LN10, s};
}

/** @param {number} n */
const mod29 = n => (n % 29 + 29) % 29;

/** @param {number} a */
function inverse29(a) {
  assert(a >= 1 && a <= 28);
  for (let x = 1; x <= 28; x++) if (a * x % 29 === 1) return x;
  throw Error('Expected nonzero residue inverse');
}

/**
 * Reversible planted source-English control under a varying nonzero secret
 * multiplier at every rune, plus a fixed secret 29-symbol output relabeling.
 * @param {Array<Array<{value:number,page:number}>>} layout
 * @param {Map<number,number[][]>} referenceByLength
 */
function plant(layout, referenceByLength) {
  const plain = [];
  const pages = [];
  for (let j = 0; j < layout.length; j++) {
    const word = layout[j], pool = referenceByLength.get(word.length);
    const chosen = pool[(j * 1337 + 11) % pool.length];
    for (let k = 0; k < word.length; k++) {
      plain.push(chosen[k]);
      pages.push(word[k].page);
    }
  }
  const key = plain.map((_, i) => 1 + (17 * i + 9) % 28);
  const hidden = [];
  const cipher = [];
  const recovered = [];
  for (let i = 0; i < plain.length; i++) {
    if (i === 0 || pages[i] !== pages[i - 1]) {
      hidden[i] = mod29(plain[i] + 7);
    } else {
      hidden[i] = mod29(hidden[i - 1] + key[i] *
        mod29(plain[i] - plain[i - 1]));
    }
    // Fixed output permutation sigma(x) = 11x+3 mod29.
    cipher[i] = mod29(11 * hidden[i] + 3);
    const z = mod29((cipher[i] - 3) * inverse29(11));
    if (i === 0 || pages[i] !== pages[i - 1]) {
      recovered[i] = mod29(z - 7);
    } else {
      const before = mod29((cipher[i - 1] - 3) * inverse29(11));
      recovered[i] = mod29(recovered[i - 1] +
        inverse29(key[i]) * mod29(z - before));
    }
    if (i && pages[i] === pages[i - 1]) {
      assert.equal(cipher[i] === cipher[i - 1], plain[i] === plain[i - 1]);
    }
  }
  assert.deepEqual(recovered, plain);
  return {runes: plain.length, pageStarts: 55,
    exactDecoderRoundtrip: true, arbitraryNonzeroPositionKeys: true,
    fixedSecretOutputPermutation: true,
    equalityMaskPreservedAtAllWithinPagePositions: true};
}

/** @returns {object} */
function run() {
  const words = parseOriginalWords();
  const all = words.flat();
  let originalAllDoublets = 0;
  let originalWithinWords = 0;
  let validWithinWordPairs = 0;
  for (let i = 1; i < all.length; i++) {
    if (all[i].page === all[i - 1].page &&
        all[i].value === all[i - 1].value) originalAllDoublets++;
  }
  const groups = new Map();
  for (const word of words) {
    const mask = eligibleMask(word);
    const gp = word.map(x => x.value);
    originalWithinWords += equalCount(gp, mask);
    validWithinWordPairs += mask.split('').filter(x => x === '1').length;
    const signature = word.length + '|' + mask;
    const prior = groups.get(signature);
    if (prior) prior.n++;
    else groups.set(signature, {length: word.length, mask, n: 1});
  }
  assert.equal(originalAllDoublets, 86);
  assert.equal(originalWithinWords, 63);
  assert.equal(originalAllDoublets - originalWithinWords, 23);
  assert.equal(validWithinWordPairs, 10028);
  assert.equal(groups.size, 34);

  const referenceFiles = [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
    ['Emerson', 'resources/control/emerson_essays_2944.txt']
  ];
  const results = [];
  let positivePlant = null;
  for (const [name, file] of referenceFiles) {
    const source = read(file);
    const wordsEnglish = (source.match(/[A-Za-z]+/g) || []).map(encode);
    const byLength = new Map();
    for (const word of wordsEnglish) {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(word);
    }
    let mean = 0;
    let variance = 0;
    let unmatchedSourceMaskWords = 0;
    const strata = [];
    for (const {length, mask, n} of groups.values()) {
      const pool = byLength.get(length);
      assert(pool && pool.length > 0);
      const counts = pool.map(word => equalCount(word, mask));
      const histogram = new Map();
      for (const c of counts) histogram.set(c, (histogram.get(c) || 0) + 1);
      const average = counts.reduce((a, b) => a + b, 0) / pool.length;
      const secondMoment = counts.reduce((a, b) => a + b * b, 0) / pool.length;
      mean += n * average;
      variance += n * (secondMoment - average ** 2);
      strata.push({n, h: [...histogram], size: pool.length});
    }
    // Diagnostic lexical support for exact within-word equality masks. This
    // is a corpus-coverage check, never a universal dictionary exclusion.
    const maskSets = new Map();
    for (const [length, pool] of byLength) {
      maskSets.set(length, new Set(pool.map(w => w.slice(1)
        .map((x, j) => x === w[j] ? '1' : '0').join(''))));
    }
    for (const word of words) {
      const nativeExactMask = word.slice(1)
        .map((x, j) => x.value === word[j].value ? '1' : '0').join('');
      if (!maskSets.get(word.length).has(nativeExactMask))
        unmatchedSourceMaskWords++;
    }
    const bound = chernoffBound(strata, originalWithinWords);
    results.push({name, sourceWords: wordsEnglish.length,
      lengthAndPageBreakMatchedExpectedWithinWordDoublets: mean,
      standardDeviation: Math.sqrt(variance),
      observed: originalWithinWords,
      standardScore: (originalWithinWords - mean) / Math.sqrt(variance),
      rigorousResamplingLog10ProbabilityUpperBound: bound.log10UpperBound,
      sourceWordMaskUnmatchedCount: unmatchedSourceMaskWords});
    if (name === 'Shakespeare') positivePlant = plant(words, byLength);
  }
  const expected = [
    [55407, 330.01725380976706, -75.50417089829011, 8],
    [15733, 309.09742081934724, -67.74844272263695, 9],
    [77932, 296.2592885466663, -63.452710962887764, 7]
  ];
  for (let i = 0; i < results.length; i++) {
    const item = results[i], target = expected[i];
    assert.equal(item.sourceWords, target[0]);
    assert(Math.abs(item.lengthAndPageBreakMatchedExpectedWithinWordDoublets -
      target[1]) < 1e-7);
    assert(Math.abs(item.rigorousResamplingLog10ProbabilityUpperBound -
      target[2]) < 1e-7);
    assert.equal(item.sourceWordMaskUnmatchedCount, target[3]);
  }
  return {
    hypothesis: 'C[i]=C[i-1]+k[i]*(P[i]-P[i-1]) mod29, every k[i] nonzero',
    original: {unsolvedRunes: 12956, pagesWithRunes: 55,
      exactPrintedWords: words.length,
      withinPageEligibleAdjacentPositions: 12901,
      withinPageDoublets: originalAllDoublets,
      withinWordEligibleAdjacentPositions: validWithinWordPairs,
      withinWordDoublets: originalWithinWords,
      crossWordDoublets: originalAllDoublets - originalWithinWords,
      originalWordMaskGroups: groups.size},
    references: results, positivePlant,
    conclusion: 'Key-independent equality-preserving family strongly mismatches three independent native-GP English word-length controls. No unknown-page plaintext, authenticated key, or source-selected algorithm recovered.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, chernoffBound, plant};
