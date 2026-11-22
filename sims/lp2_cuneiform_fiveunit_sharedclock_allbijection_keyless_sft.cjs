'use strict';
/**
 * LP2 pp36-38 five red-numbered units: a key-independent equality test for
 * every synchronized, position-dependent bijection of the 29-rune alphabet.
 *
 * The shared-clock hypothesis C_j[i] = pi_i(P_j[i]) leaves all same-position
 * cross-message symbol equalities unchanged for arbitrary secret pi_i.
 *
 * Original five lengths: 139 / 91 / 98 / 96 / 129; common prefix 91.
 * Word-length-matched Cicada and independent English donors are controls.
 * Frozen PRNG seeds and sample counts, no ciphertext-tuned parameters.
 *
 * Windows 11, Node 22, CommonJS; read-only, single-file runnable test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
/** @param {string} filename @returns {any} */
const json = filename => JSON.parse(read(filename));

const gp = json('resources/liber-primus/lp2-corpus.json');
const scans = read('resources/liber-primus/lp2-transcription.txt').split('%');
const solved = json('resources/external/relikd-solved-gp29-native-v1.json');
const rune = new Map(gp.runes.map((r, i) => [r, i]));
const english = new Map(gp.translit.map((s, i) => [s, i]));
assert.equal(rune.size, 29);
const W = 91;

/**
 * Read a closed-open rune offset from an original page while keeping ink
 * delimiters and physical newlines. A page break inside item 4 is a carry.
 * @param {number} page
 * @param {number} start
 * @param {number} end
 * @returns {string}
 */
function span(page, start, end) {
  let out = '', count = 0, active = false;
  for (const char of scans[page]) {
    if (rune.has(char) && count === start) active = true;
    if (rune.has(char) && count === end) break;
    if (active) out += char;
    if (rune.has(char)) count++;
  }
  assert.equal(count, end);
  return out;
}

/**
 * Parse rune words, retaining all symbol values. A physical line break
 * without word punctuation does not create a new word.
 * @param {string} source
 * @param {string} separators
 * @returns {number[][]}
 */
function runeWords(source, separators) {
  const words = [];
  let current = [];
  for (const char of source) {
    if (rune.has(char)) current.push(rune.get(char));
    else if (separators.includes(char) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const parts = [
  [[36, 99, 238]],
  [[37, 0, 91]],
  [[37, 91, 189]],
  [[37, 189, 228], [38, 0, 57]],
  [[38, 57, 186]]
];
const originals = parts.map(pieces => runeWords(
  pieces.map(p => span(...p)).join(''), '-.'
));
const lengths = originals.map(words => words.map(word => word.length));
const lanes = originals.map(words => words.flat().slice(0, W));
assert.deepEqual(originals.map(words => words.flat().length),
  [139, 91, 98, 96, 129]);
assert.deepEqual(originals.map(words => words.length),
  [30, 20, 25, 19, 28]);
assert.equal(lengths.flat().length, 122);
assert(lanes.every(lane => lane.length === W));

/**
 * All ten same-position lane comparisons, independent of rune names or keys.
 * @param {number[][]} input
 * @returns {number}
 */
function sameColumnPairs(input) {
  let matches = 0;
  for (let left = 0; left < 5; left++)
    for (let right = left + 1; right < 5; right++)
      for (let position = 0; position < W; position++)
        matches += Number(input[left][position] === input[right][position]);
  return matches;
}
/**
 * Another source-visible clock resets at every printed word boundary.
 * Each (word ordinal, within-word offset) may have its own 29-rune secret
 * permutation, reused across five units. Compare only extant positions.
 * @param {number[][][]} allWords
 * @returns {{matches:number,slots:number,byPair:number[]}}
 */
function sameWordOffsetPairs(allWords) {
  const commonWords = Math.min(...allWords.map(words => words.length));
  let matches = 0, slots = 0;
const byPair = [];
  for (let left = 0; left < 5; left++)
    for (let right = left + 1; right < 5; right++) {
      let count = 0;
      for (let word = 0; word < commonWords; word++) {
        const a = allWords[left][word], b = allWords[right][word];
        for (let pos = 0; pos < Math.min(a.length, b.length); pos++) {
          count += Number(a[pos] === b[pos]);
          slots++;
        }
      }
      matches += count;
      byPair.push(count);
    }
  return {matches, slots, byPair};
}
const originalWordClock = sameWordOffsetPairs(originals);
assert.deepEqual(originalWordClock,
  {matches: 15, slots: 636, byPair: [0, 4, 2, 1, 2, 3, 1, 1, 1, 0]});

/**
 * Historical p56 authentic keyed cipher permits plaintext F to emit F and
 * consume no key. A ciphertext F may instead be an ordinary encrypted
 * non-F. Enumerate BOTH choices for each original C=F, across all five
 * lanes and all first 19 words. We maximize the original same-key equality
 * score, deliberately granting the hypothesis the most favorable mask.
 */
const firstCommonWords = Math.min(...originals.map(words => words.length));
assert.equal(firstCommonWords, 19);
const originalFEvents = [];
for (let lane = 0; lane < 5; lane++)
  for (let word = 0; word < firstCommonWords; word++)
    for (let pos = 0; pos < originals[lane][word].length; pos++)
      if (originals[lane][word][pos] === 0)
        originalFEvents.push({lane, word, pos});
assert.deepEqual(originalFEvents,
  [{lane:0,word:7,pos:4},{lane:1,word:14,pos:0},
    {lane:2,word:4,pos:1},{lane:2,word:4,pos:4},
    {lane:3,word:9,pos:5},{lane:4,word:2,pos:3}]);
assert.equal(originalFEvents.length, 6);
let bestFWord = {matches: -1}, minFWordMatches = Infinity;
for (let mask = 0; mask < (1 << originalFEvents.length); mask++) {
  const selected = originalFEvents.filter((_, i) => (mask & (1 << i)) !== 0);
  const skipped = originals.map((words, lane) => words.map((runes, word) =>
    runes.filter((_, pos) => !selected.some(e =>
      e.lane === lane && e.word === word && e.pos === pos))));
  const outcome = sameWordOffsetPairs(skipped);
  minFWordMatches = Math.min(minFWordMatches, outcome.matches);
  if (outcome.matches > bestFWord.matches)
    bestFWord = {...outcome, mask, selected};
}
assert.equal(minFWordMatches, 15);
assert.equal(bestFWord.matches, 16);
assert.equal(bestFWord.slots, 633);
const byPair = [];
for (let left = 0; left < 5; left++)
  for (let right = left + 1; right < 5; right++) {
    let n = 0;
    for (let i = 0; i < W; i++)
      n += Number(lanes[left][i] === lanes[right][i]);
    byPair.push(n);
  }
assert.deepEqual(byPair, [2, 3, 1, 4, 3, 5, 1, 3, 1, 3]);
const originalMatches = sameColumnPairs(lanes);
assert.equal(originalMatches, 26);

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Reuse the existing GP29 lexical normalization for Shakespeare/Gibran/etc.
 * @param {string} token
 * @returns {number[]}
 */
function encodeWord(token) {
  const s = token.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Q/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let pos = 0; pos < s.length;) {
    if (s.slice(pos, pos + 3) === 'ING') {
      result.push(english.get('NG'));
      pos += 3;
      continue;
    }
    let symbol = english.get(s.slice(pos, pos + 2));
    if (symbol !== undefined) {
      result.push(symbol);
      pos += 2;
    } else {
      symbol = english.get(s[pos]);
      assert.notEqual(symbol, undefined);
      result.push(symbol);
      pos++;
    }
  }
  return result;
}

/** @param {number[][]} words @returns {Map<number, number[][]>} */
function poolOf(words) {
  const pool = new Map();
  for (const word of words) {
    const n = word.length;
    if (!pool.has(n)) pool.set(n, []);
    pool.get(n).push(word);
  }
  for (const n of lengths.flat()) assert(pool.has(n));
  return pool;
}

/**
 * Generate exactly the same five original complete-word length profiles,
 * crop each to its original first 91 runes and count shared-column matches.
 * Independently retain all complete words to compare the literal word-reset
 * clock, whose same-offset positions differ from continuous rune positions.
 * Sampling is independent across messages and words with replacement.
 *
 * @param {Map<number, number[][]>} pool
 * @param {number} seed
 * @param {number} draws
 * @returns {{draws:number,mean:number,min:number,max:number,atOrBelow:number,
 * pUpper:number,wordMean:number,wordMin:number,wordMax:number,
 * wordAtOrBelow:number,wordPUpper:number,sample:number[][],
 * sampleWords:number[][][]}}
 */
function calibrate(pool, seed, draws) {
  const next = xorshift32(seed);
  let min = Infinity, max = 0, sum = 0, atOrBelow = 0;
  let wordMin = Infinity, wordMax = 0, wordSum = 0, wordAtOrBelow = 0;
  let fWordMin = Infinity, fWordMax = 0, fWordSum = 0;
  let fWordAtOrBelow = 0;
  let sample = [], sampleWords = [];
  for (let t = 0; t < draws; t++) {
    const generatedWords = lengths.map(shape => shape.map(n => {
      const matching = pool.get(n);
      return matching[next() % matching.length];
    }));
    const parallel = generatedWords.map(words => words.flat().slice(0, W));
    const observed = sameColumnPairs(parallel);
    const observedWord = sameWordOffsetPairs(generatedWords).matches;
    const observedFWord = sameWordOffsetPairs(generatedWords.map(words =>
      words.map(word => word.filter(symbol => symbol !== 0)))).matches;
    if (t === 0) {
      sample = parallel;
      sampleWords = generatedWords;
    }
    min = Math.min(min, observed);
    max = Math.max(max, observed);
    sum += observed;
    if (observed <= originalMatches) atOrBelow++;
    wordMin = Math.min(wordMin, observedWord);
    wordMax = Math.max(wordMax, observedWord);
    wordSum += observedWord;
    if (observedWord <= originalWordClock.matches) wordAtOrBelow++;
    fWordMin = Math.min(fWordMin, observedFWord);
    fWordMax = Math.max(fWordMax, observedFWord);
    fWordSum += observedFWord;
    if (observedFWord <= bestFWord.matches) fWordAtOrBelow++;
  }
  return {
    draws, mean: sum / draws, min, max, atOrBelow,
    pUpper: (atOrBelow + 1) / (draws + 1), sample, sampleWords,
    wordMean: wordSum / draws, wordMin, wordMax, wordAtOrBelow,
    wordPUpper: (wordAtOrBelow + 1) / (draws + 1),
    fWordMean: fWordSum / draws, fWordMin, fWordMax, fWordAtOrBelow,
    fWordPUpper: (fWordAtOrBelow + 1) / (draws + 1)
  };
}

const solvedPool = poolOf(solved.sections.flatMap(section =>
  runeWords(section.source_text, '•⁚⁘⁜.,\u0027"!?;:\n')
));
const solvedControl = calibrate(solvedPool, 0x3301a19e, 30000);
assert.equal(solvedControl.atOrBelow, 0);
assert.equal(solvedControl.wordAtOrBelow, 0);
assert(solvedControl.fWordAtOrBelow <= 3);
assert(solvedControl.mean > 50 && solvedControl.mean < 60);
assert(solvedControl.wordMean > 45 && solvedControl.wordMean < 55);
assert(solvedControl.fWordMean > 45 && solvedControl.fWordMean < 55);

// Positive control: an arbitrary, secretly chosen 29-symbol permutation at
// EACH position, reused on ALL five lanes, must conserve every equality.
const secret = xorshift32(0x3301a19e);
const alphabetAtPosition = Array.from({length: W}, () => {
  const permutation = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = secret() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  return permutation;
});
const planted = solvedControl.sample.map(message =>
  message.map((symbol, i) => alphabetAtPosition[i][symbol])
);
assert.equal(sameColumnPairs(planted),
  sameColumnPairs(solvedControl.sample));

// A second secret-key positive permits each printed word ordinal × internal
// rune offset to have its own arbitrary alphabet, shared across five items.
// No equality invariant requires equal word lengths or a fixed word count.
const wordSecret = xorshift32(0x3301e1ab);
const maxWords = Math.min(...lengths.map(row => row.length));
const wordPermutations = Array.from({length: maxWords}, (_, w) =>
  Array.from({length: Math.max(...lengths.map(row => row[w]))}, () => {
    const permutation = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = wordSecret() % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    return permutation;
  }));
const plantedWordClock = solvedControl.sampleWords.map(words =>
  words.map((word, ordinal) => word.map((symbol, pos) =>
    ordinal < maxWords ? wordPermutations[ordinal][pos][symbol] : symbol))
);
assert.deepEqual(sameWordOffsetPairs(plantedWordClock),
  sameWordOffsetPairs(solvedControl.sampleWords));

// Source-authenticated F bypass, with a different secret permutation for
// each (word ordinal, key-consuming rune offset). F is emitted literally;
// non-F can independently encrypt to a ciphertext F. The known bypass mask
// recovers the exact original GP-native equality structure.
const plantedFTransparent = solvedControl.sampleWords.map(words =>
  words.map((word, ordinal) => {
    let keyOrdinal = 0;
    return word.map(symbol => {
      if (ordinal >= maxWords || symbol === 0) return symbol;
      return wordPermutations[ordinal][keyOrdinal++][symbol];
    });
  })
);
const trueFBypassInverse = plantedFTransparent.map((words, lane) =>
  words.map((word, ordinal) => word.filter((_, pos) =>
    ordinal >= maxWords || solvedControl.sampleWords[lane][ordinal][pos] !== 0)));
const nativeFTransparent = solvedControl.sampleWords.map(words =>
  words.map(word => word.filter(symbol => symbol !== 0)));
assert.deepEqual(sameWordOffsetPairs(trueFBypassInverse),
  sameWordOffsetPairs(nativeFTransparent));
for (let lane = 0; lane < 5; lane++)
  for (let w = 0; w < maxWords; w++)
    for (let pos = 0; pos < solvedControl.sampleWords[lane][w].length; pos++)
      assert.equal(
        wordPermutations[w][pos].indexOf(plantedWordClock[lane][w][pos]),
        solvedControl.sampleWords[lane][w][pos]
      );

const donors = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 0x3301b00b + 2 * 19],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 0x3301b00b + 3 * 19],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt',
    0x3301b00b + 4 * 19]
];
const donorResults = donors.map(([name, filename, seed]) => {
  const donorWords = (read(filename).match(/[A-Za-z]+/g) || [])
    .map(encodeWord);
  const control = calibrate(poolOf(donorWords), seed, 16000);
  assert.equal(control.atOrBelow, 0);
  assert.equal(control.wordAtOrBelow, 0);
  assert(control.fWordAtOrBelow <= 3);
  assert(control.mean > 50 && control.mean < 60);
  assert(control.wordMean > 45 && control.wordMean < 55);
  assert(control.fWordMean > 45 && control.fWordMean < 55);
  return {
    donor: name, trainingWords: donorWords.length, draws: control.draws,
    mean: control.mean, minimum: control.min, maximum: control.max,
    atOrBelow: control.atOrBelow, pUpper: control.pUpper,
    wordMean: control.wordMean, wordMinimum: control.wordMin,
    wordMaximum: control.wordMax, wordAtOrBelow: control.wordAtOrBelow,
    wordPUpper: control.wordPUpper,
    fWordMean: control.fWordMean,
    fWordMinimum: control.fWordMin,
    fWordMaximum: control.fWordMax,
    fWordAtOrBelow: control.fWordAtOrBelow,
    fWordPUpper: control.fWordPUpper
  };
});

console.log(JSON.stringify({
  decision: 'Reject synchronized position-wise GP29 bijection into'
    + ' five independent ordinary native-English messages',
  original: {
    source: 'physical LP2 pages 36-38, red numbered 1-5',
    completeUnitRunes: originals.map(words => words.flat().length),
    completeUnitWords: lengths.map(x => x.length),
    prefixRunesPerUnit: W,
    symbolComparisons: 10 * W,
    byPair,
    equalSymbolComparisons: originalMatches,
    wordReset: originalWordClock,
    exhaustiveAuthenticFBypass: {
      originalCiphertextFEvents: originalFEvents,
      candidateMasks: 1 << originalFEvents.length,
      minimumCount: minFWordMatches,
      maximum: bestFWord
    }
  },
  solvedNativeControl: {
    draws: solvedControl.draws,
    mean: solvedControl.mean,
    minimum: solvedControl.min,
    maximum: solvedControl.max,
    atOrBelow: solvedControl.atOrBelow,
    pUpper: solvedControl.pUpper,
    wordMean: solvedControl.wordMean,
    wordMinimum: solvedControl.wordMin,
    wordMaximum: solvedControl.wordMax,
    wordAtOrBelow: solvedControl.wordAtOrBelow,
    wordPUpper: solvedControl.wordPUpper,
    fWordMean: solvedControl.fWordMean,
    fWordMinimum: solvedControl.fWordMin,
    fWordMaximum: solvedControl.fWordMax,
    fWordAtOrBelow: solvedControl.fWordAtOrBelow,
    fWordPUpper: solvedControl.fWordPUpper
  },
  independentEnglishDonors: donorResults,
  plantedSecretBijectionInvariant: true,
  plantedSecretWordResetBijectionInvariant: true,
  plantedHistoricalFBypassMaskedEqualityInvariant: true,
  scope: 'Excludes both common continuous rune-position secret BIJECTIONS'
    + ' and common printed-word-ordinal × within-word-offset secret bijections'
    + ' into native-English-like plaintext. Per-message keys,'
    + ' nonbijective coding, resegmentation, and unknown languages'
    + ' remain possible. The published plaintext-F nonconsuming bypass'
    + ' was also exhausted over every original word-clock ciphertext-F'
    + ' mask under one shared secret alphabet.'
}, null, 2));
console.log('PASS original shared-alphabet equality invariant and controls');
