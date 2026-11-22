'use strict';

/**
 * Source-native whole-word alphabet-pattern obstruction on original LP2.
 *
 * Under any independently secret 29-rune bijection for every printed word,
 * equality of two rune positions is invariant. This original-input SFT
 * compares that invariant with a fixed historical-English word lexicon,
 * using exact manuscript GP orthography (ING and IO as single runes).
 *
 * Run: node sims/lp2_perword_alphabet_pattern_sft.cjs
 * Node.js 20+ CommonJS. No network or external packages.
 *
 * This is a finite-lexicon exclusion. It does not recover plaintext or
 * rule out other languages, word-internal state or symbol-changing layers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphMap = new Map(gp.runes.map((r, i) => [r, i]));
const runeRx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');

/** @param {string} source @returns {number[][]} */
function originalWords(source) {
  // Source omits the runeless physical page 50. First 55 records are p0..55.
  const unsolved = source.split('%').slice(0, 55).join('%')
    .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
  return (unsolved.match(runeRx) || []).map(w =>
    [...w].map(r => {
      const i = glyphMap.get(r);
      assert(i !== undefined);
      return i;
    }));
}

/**
 * The canonical unrestricted codebook of a word under arbitrary 29-rune
 * alphabet relabeling. Symbols are numbered by first occurrence.
 * @param {number[]} word @returns {string}
 */
function signature(word) {
  const observed = new Map();
  return word.map(x => {
    if (!observed.has(x)) observed.set(x, observed.size);
    return observed.get(x).toString(36);
  }).join('');
}

/** @param {number[]} w @returns {string} */
const patternKey = w => w.length + ':' + signature(w);

/** @param {number[][]} words @param {Set<string>} patterns */
function lengthTable(words, patterns) {
  const result = new Map();
  for (const word of words) {
    let bin = result.get(word.length);
    if (!bin) {
      bin = {n: 0, misses: 0};
      result.set(word.length, bin);
    }
    bin.n++;
    if (!patterns.has(patternKey(word))) bin.misses++;
  }
  return result;
}

/**
 * Find the minimum of zero, one, two or at least three symbol replacements
 * required for a ciphertext word to match any lexicon equality pattern.
 * An arbitrary secret permutation after these edits is still permitted.
 * Two previously unused rune identities suffice for a two-edit witness.
 *
 * @param {number[]} word @param {Set<string>} dictionary
 * @returns {0|1|2|3}
 */
function editBudget(word, dictionary) {
  if (dictionary.has(patternKey(word))) return 0;
  const existing = [...new Set(word)];
  const fresh = [];
  for (let x = 0; x < 29 && fresh.length < 2; x++)
    if (!existing.includes(x)) fresh.push(x);
  const options = [...existing, ...fresh];
  for (let i = 0; i < word.length; i++) {
    const old = word[i];
    for (const value of options) {
      if (value === old) continue;
      word[i] = value;
      const good = dictionary.has(patternKey(word));
      word[i] = old;
      if (good) return 1;
    }
  }
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      const a = word[i], b = word[j];
      for (const ai of options) {
        if (ai === a) continue;
        word[i] = ai;
        for (const bj of options) {
          if (bj === b) continue;
          word[j] = bj;
          const good = dictionary.has(patternKey(word));
          word[j] = b;
          if (good) {
            word[i] = a;
            return 2;
          }
        }
        word[j] = b;
      }
      word[i] = a;
    }
  }
  return 3;
}

/**
 * P(X=k) for X ~ Hypergeom(population, failures, draw), calculated
 * with a stable finite recurrence from the exact P(X=0) product.
 * @param {number} population @param {number} failures @param {number} draws
 * @returns {Float64Array}
 */
function hypergeometric(population, failures, draws) {
  assert(population >= draws && failures >= 0 && failures <= population);
  const p = new Float64Array(draws + 1);
  let p0 = 1;
  for (let i = 0; i < draws; i++)
    p0 *= (population - failures - i) / (population - i);
  p[0] = p0;
  for (let k = 0; k < Math.min(draws, failures); k++)
    p[k + 1] = p[k] * (failures - k) / (k + 1) *
      (draws - k) / (population - failures - draws + k + 1);
  return p;
}

/**
 * Stratified finite-population sampling tail, conditional on original word
 * lengths and the three source-native control corpora' observed frequencies.
 * This is a descriptive reference statistic, not an author-key probability.
 *
 * @param {Map<number, {n:number, misses:number}>} original
 * @param {Map<number, {n:number, misses:number}>} control
 * @param {number[]} lengths
 */
function stratifiedTail(original, control, lengths) {
  let pmf = new Float64Array([1]);
  let observed = 0, expected = 0;
  for (const l of lengths) {
    const target = original.get(l), base = control.get(l);
    assert(target && base && base.n >= target.n);
    observed += target.misses;
    expected += target.n * base.misses / base.n;
    const h = hypergeometric(base.n, base.misses, target.n);
    const next = new Float64Array(pmf.length + h.length - 1);
    for (let i = 0; i < pmf.length; i++)
      for (let j = 0; j < h.length; j++)
        next[i + j] += pmf[i] * h[j];
    pmf = next;
  }
  let p = 0;
  for (let i = observed; i < pmf.length; i++) p += pmf[i];
  return {observed, expected, p};
}

const ciphertextWords = originalWords(read('resources/liber-primus/lp2-transcription.txt'));
assert.equal(ciphertextWords.length, 2896);
assert.equal(ciphertextWords.flat().length, 12956);
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => ({plain: line.split(' ')[0],
    code: encodeSourceNativeGP(line.split(' ')[0])}));
assert.equal(dictionary.length, 29157);
const patterns = new Set(dictionary.map(w => patternKey(w.code)));
// The % page-break sensitivity: 32 adjacent rune fragments join when
// physical page breaks are ignored. Alternatively break at EVERY page end,
// retaining all original runes and the printed line-continuation convention.
const pageLocalWords = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).flatMap(page =>
    (page.replace(/\/\r?\n/g, '').match(runeRx) || []).map(w =>
      [...w].map(glyph => glyphMap.get(glyph))));
assert.equal(pageLocalWords.length, 2928);
assert.equal(pageLocalWords.flat().length, 12956);
const pageLocalLong = pageLocalWords.filter(w => w.length >= 10 && w.length <= 12);
assert.equal(pageLocalLong.length, 97);
const pageLocalLongMisses = pageLocalLong.filter(w =>
  !patterns.has(patternKey(w))).length;
assert.equal(pageLocalLongMisses, 37);

const original = lengthTable(ciphertextWords, patterns);
const registered = [[10,52,13],[11,32,10],[12,18,16]];
for (const [length, n, misses] of registered)
  assert.deepEqual(original.get(length), {n, misses});
const longWords = ciphertextWords.filter(w => w.length >= 10 && w.length <= 12);
assert.equal(longWords.length, 102);
const edits = [0,0,0,0];
for (const word of longWords) edits[editBudget(word.slice(), patterns)]++;
assert.deepEqual(edits, [63,35,4,0]);
const minChanged = edits[1] + 2 * edits[2] + 3 * edits[3];
assert.equal(minChanged, 43);

// Authenticate source handling on actual solved-LP1 plain rune words.
const knownSource = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const begin = knownSource.indexOf('ᚦᛖ-ᛚᚩᛋᛋ');
const end = knownSource.indexOf('\n$\n%\n', begin);
assert(begin >= 0 && end > begin);
const lp1 = (knownSource.slice(begin, end)
  .replace(/\/\n%\n/g, '').replace(/\/\n/g, '').replace(/\n/g, '')
  .match(runeRx) || []).map(w => [...w].map(x => glyphMap.get(x)));
assert.equal(lp1.length, 181);
assert.equal(lp1.filter(w => !patterns.has(patternKey(w))).length, 0);

// A different arbitrary affine permutation per word preserves its signature.
const sourceByLength = new Map();
for (const word of dictionary) {
  if (word.code.length < 10 || word.code.length > 12) continue;
  if (!sourceByLength.has(word.code.length)) sourceByLength.set(word.code.length, []);
  sourceByLength.get(word.code.length).push(word.code);
}
for (let i = 0; i < longWords.length; i++) {
  const pool = sourceByLength.get(longWords[i].length);
  assert(pool && pool.length);
  const native = pool[i % pool.length];
  const a = 1 + i % 28, b = (7 * i + 11) % 29;
  const encrypted = native.map(x => (a * x + b) % 29);
  assert.equal(signature(encrypted), signature(native));
  assert(patterns.has(patternKey(encrypted)));
}

/**
 * An independent countercheck: allowing a second completely arbitrary
 * within-word permutation removes positional equality constraints.
 * Only the multiplicity partition (sorted symbol frequency histogram)
 * survives secret substitution plus transposition.
 * @param {number[]} word @returns {string}
 */
function multiplicityKey(word) {
  const counts = new Map();
  for (const rune of word) counts.set(rune, (counts.get(rune) || 0) + 1);
  return word.length + ':' + [...counts.values()].sort((a,b) => b - a).join(',');
}
const loosePatterns = new Set(dictionary.map(w => multiplicityKey(w.code)));
const longHistogramMisses = longWords.filter(w =>
  !loosePatterns.has(multiplicityKey(w))).length;
assert.equal(longHistogramMisses, 0, 'all long words are compatible after per-word transposition');
const all9 = ciphertextWords.filter(w => w.length >= 6 && w.length <= 14);
assert.equal(all9.filter(w => !loosePatterns.has(multiplicityKey(w))).length, 0);

/**
 * Stronger all-secret family: within each printed word, allow a different
 * unrestricted GP29 substitution alphabet in each clock phase. Only
 * equalities separated by a multiple of p positions are invariant.
 * The alphabets may vary freely between words, so any missing pattern
 * excludes all more restrictive fixed page/global phase codebooks too.
 * @param {number[]} word @param {number} period @returns {string}
 */
function phaseKey(word, period) {
  const buckets = Array.from(
    {length: Math.min(period, word.length)}, () => []);
  for (let i = 0; i < word.length; i++) buckets[i % period].push(word[i]);
  return word.length + ':' + buckets.map(signature).join('|');
}
const phaseMisses = {};
for (const period of [1,2,3,4,5,6,7,8]) {
  const valid = new Set(dictionary.map(x => phaseKey(x.code, period)));
  phaseMisses[period] = ciphertextWords.filter(w =>
    !valid.has(phaseKey(w, period))).length;
}
assert.deepEqual(Object.values(phaseMisses),
  [51, 11, 1, 1, 0, 0, 0, 0]);
assert.equal(phaseMisses[1], 51);

// A clue-adjacent transposition countercheck: allow arbitrary cyclic rune
// shifts and/or reversal inside EACH printed word, followed by an entirely
// independent unknown secret GP29 alphabet bijection per word. The exact
// equality signature remains invariant up to the allowed dihedral orbit.
const reverseShapes = new Set();
const rotationShapes = new Set();
const dihedralShapes = new Set();
for (const {code:word} of dictionary) {
  reverseShapes.add(patternKey(word.slice().reverse()));
  for (let k = 0; k < word.length; k++) {
    const rotated = [...word.slice(k), ...word.slice(0, k)];
    const fwd = patternKey(rotated);
    rotationShapes.add(fwd);
    dihedralShapes.add(fwd);
    dihedralShapes.add(patternKey(rotated.reverse()));
  }
}
const orientations = {
  eitherDirection: ciphertextWords.filter(w =>
    !patterns.has(patternKey(w)) && !reverseShapes.has(patternKey(w))).length,
  anyCircularStart: ciphertextWords.filter(w =>
    !rotationShapes.has(patternKey(w))).length,
  anyCircularStartAndDirection: ciphertextWords.filter(w =>
    !dihedralShapes.has(patternKey(w))).length
};
assert.deepEqual(orientations,
  {eitherDirection: 40, anyCircularStart: 26,
    anyCircularStartAndDirection: 22});
const longDihedralMiss = longWords.filter(w =>
  !dihedralShapes.has(patternKey(w))).length;
assert.equal(longDihedralMiss, 17);

// Independent native-GP English comparison is length-stratified.
const control = new Map();
const controlFiles = [
  'shakespeare_first300k.txt',
  'gibran_prophet_58585.txt',
  'emerson_essays_2944.txt'
];
const individually = {};
for (const name of controlFiles) {
  const text = read('resources/control/' + name);
  const words = (text.match(/[A-Za-z]+/g) || []).map(encodeSourceNativeGP);
  const table = lengthTable(words, patterns);
  individually[name] = {};
  for (const l of [10,11,12]) {
    const bin = table.get(l);
    individually[name][l] = bin;
  }
  for (const [length, bin] of table) {
    let aggregate = control.get(length);
    if (!aggregate) {
      aggregate = {n:0,misses:0};
      control.set(length, aggregate);
    }
    aggregate.n += bin.n;
    aggregate.misses += bin.misses;
  }
}
assert.deepEqual([10,11,12].map(l => control.get(l)),
  [{n:2055,misses:140},{n:953,misses:137},{n:465,misses:120}]);
const longTail = stratifiedTail(original, control, [10,11,12]);
assert.equal(longTail.observed, 39);
assert(Math.abs(longTail.p - 4.074412351008969e-12) < 1e-17);
const allTail = stratifiedTail(original, control, [6,7,8,9,10,11,12,13,14]);
assert.equal(allTail.observed, 51);
assert(Math.abs(allTail.p - 9.770706202187205e-9) < 1e-13);

if (require.main === module) {
  console.log(JSON.stringify({
    finding: 'finite-word-lexicon all-secret bijection obstruction',
    unknownRunes: 12956,
    unknownWords: ciphertextWords.length,
    dictionaryWords: dictionary.length,
    pageBoundarySensitivity: {joinedWords: ciphertextWords.length,
      independentPageWords: pageLocalWords.length,
      independentPageWordsLength10to12: pageLocalLong.length,
      independentPageLongMisses: pageLocalLongMisses},
    wordLengths10to12: registered.map(([length,n,misses]) => ({length,n,misses})),
    lowerBoundSymbolChanges: minChanged,
    afterArbitraryWithinWordTranspositionHistogramMisses: longHistogramMisses,
    afterIndependentPerWordPerPhaseSubstitutionAlphabetMisses: phaseMisses,
    afterWordLocalOrientationsAndSecretBijectiveAlphabets: orientations,
    longWordDihedralMisses: longDihedralMiss,
    editDistribution: {zero:edits[0],one:edits[1],two:edits[2],threeOrMore:edits[3]},
    solvedLP1SourceWordsMatched: lp1.length,
    independentControlSamples: individually,
    threeCorpusStratifiedTail: longTail,
    lengths6to14Tail: allTail,
    status: 'no original plaintext or source-selected key recovered'
  }, null, 2));
}
