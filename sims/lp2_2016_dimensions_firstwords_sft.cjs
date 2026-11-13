'use strict';

/**
 * Original-cipher source gate: 2016 563x569 tree JPEG dimensions as
 * Gematria-prime word-sum addresses in the first two LP2 physical pages.
 *
 * Run from repository root: node sims/lp2_2016_dimensions_firstwords_sft.cjs
 *
 * Inputs are the repository's canonical rune array and transcription.
 * Shuffling preserves page-specific rune histograms and original word slots.
 * This is a candidate clue, not a decoded key, plaintext, or cipher.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const original = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

const DIMENSIONS = [563, 569];
const NUMBER_OF_SHUFFLES = 30000;
const SEED = 0x3301563;
const index = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const runePages = original.split(/\s*%\s*/);
assert.equal(runePages.length, 57, 'physical p50 is the one runeless page');

const unknownPages = runePages.slice(0, 55).map((page, i) => {
  const words = page.replace(/\s/g, '').replaceAll('/', '')
    .match(/\p{Script=Runic}+/gu) || [];
  return {
    page: i < 50 ? i : i + 1,
    words: words.map(word => [...word].map(glyph => {
      assert.ok(index.has(glyph), 'unrecognized source rune');
      return index.get(glyph);
    }))
  };
});

const sourceWords = unknownPages.flatMap(page =>
  page.words.map((runes, j) => ({
    page: page.page,
    word: j + 1,
    runes,
    sum: runes.reduce((total, rune) => total + corpus.prime[rune], 0)
  }))
);
assert.equal(sourceWords.length, 2928);
assert.equal(sourceWords.reduce((s, word) => s + word.runes.length, 0), 12956);

const p32 = corpus.pages.find(page => page.page === 32);
assert.equal(p32.indices.length, 121);
const topRow = p32.indices.slice(0, 11);
const leftColumn = Array.from({ length: 11 }, (_, row) => p32.indices[11 * row]);
const rowSum = topRow.reduce((sum, rune) => sum + corpus.prime[rune], 0);
const columnSum = leftColumn.reduce((sum, rune) => sum + corpus.prime[rune], 0);
assert.deepEqual([rowSum, columnSum], DIMENSIONS);

const hitWords = DIMENSIONS.map(value => sourceWords.filter(w => w.sum === value));
assert.deepEqual(hitWords.map(h => h.map(w => [w.page, w.word, w.runes.length])),
  [[[0, 6, 11]], [[1, 33, 10]]]);
const firstTwo = unknownPages.slice(0, 2);
assert.deepEqual(firstTwo.map(page => page.words.length), [59, 63]);

/** Deterministic unsigned 32-bit LCG control only, not a secret key. */
let state = SEED;
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
function shuffle(values) {
  for (let j = values.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [values[j], values[k]] = [values[k], values[j]];
  }
}
const layouts = firstTwo.map(page => page.words.map(word => word.length));
const pools = firstTwo.map(page => page.words.flat());
const totals = { eitherAnywhere: 0, orderedPages: 0, originalSlots: 0,
  anyWidth: 0, anyHeight: 0 };
for (let draw = 0; draw < NUMBER_OF_SHUFFLES; draw++) {
  const hits = [];
  for (let pi = 0; pi < 2; pi++) {
    const pool = [...pools[pi]]; // independent fresh draw from the same source multiset
    shuffle(pool);
    let position = 0;
    const pageHits = [];
    for (let w = 0; w < layouts[pi].length; w++) {
      let sum = 0;
      for (let i = 0; i < layouts[pi][w]; i++)
        sum += corpus.prime[pool[position++]];
      if (DIMENSIONS.includes(sum)) pageHits.push([w, sum]);
    }
    assert.equal(position, pool.length);
    hits.push(pageHits);
  }
  const flat = hits.flat();
  const width = flat.some(hit => hit[1] === 563);
  const height = flat.some(hit => hit[1] === 569);
  totals.anyWidth += Number(width);
  totals.anyHeight += Number(height);
  totals.eitherAnywhere += Number(width && height);
  totals.orderedPages += Number(
    hits[0].some(hit => hit[1] === 563) &&
    hits[1].some(hit => hit[1] === 569));
  totals.originalSlots += Number(
    hits[0].some(hit => hit[0] === 5 && hit[1] === 563) &&
    hits[1].some(hit => hit[0] === 32 && hit[1] === 569));
}
assert.deepEqual(totals, {
  eitherAnywhere: 18,
  orderedPages: 6,
  originalSlots: 0,
  anyWidth: 828,
  anyHeight: 828
});


function mod29(value) {
  return ((value % 29) + 29) % 29;
}
function indexOfCoincidence(values) {
  const h = Array(29).fill(0);
  for (const value of values) h[value]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

// More concrete consumer: the sole width/height-sum words have 11 and 10
// runes. These can define column keys and the ten remaining row keys for
// p32's natural 11x11 matrix. The source selects the keys and their lengths
// but does not independently instruct this cipher or arithmetic convention.
const rowKey = firstTwo[0].words[5];
const columnKey = firstTwo[1].words[32];
assert.deepEqual([rowKey.length, columnKey.length], [11, 10]);
const p32Cipher = p32.indices;
const p57Native = corpus.pages.find(page => page.page === 57).indices;
const p57PlainIOC = indexOfCoincidence(p57Native);
assert.ok(p57PlainIOC > 0.055);
const twoDimensionalConsumers = [];
const p33OriginalBody81 = corpus.pages.find(page => page.page === 33)
  .indices.slice(10, 91);
assert.equal(p33OriginalBody81.length, 81);
const twoStageP33Consumers = [];


function recordConsumer({ mode, kind, sx = 0, sy = 0, sign = 0,
  firstRow = 0, rowWeights, columnWeights }) {
  const key = p32Cipher.map((_, position) => {
    const row = Math.floor(position / 11);
    const col = position % 11;
    const a = rowWeights[col];
    const b = row === 0 ? firstRow : columnWeights[row - 1];
    if (kind === 'additive') return mod29(sx * a + sy * b);
    return mod29(sign * a * b);
  });
  const plain = p32Cipher.map((v, i) => mod29(v + key[i]));
  const recipher = plain.map((v, i) => mod29(v - key[i]));
  assert.deepEqual(recipher, p32Cipher);
  twoDimensionalConsumers.push({
    mode, kind, sx, sy, sign, firstRow,
    ioc: indexOfCoincidence(plain),
    prefix: plain.slice(0, 44).map(v => corpus.translit[v]).join('')
  });
  // The p32 121-rune intermediate might be a *key* rather than English.
  // The solved p57 instruction SHED OUR OWN CIRCUMFERENCES and the
  // source-ink-delineated p33 81-rune body select a distinct 9x9 consumer.
  // This reuses every previously frozen 11+10 source-key interpretation,
  // without requiring that the whole p32 intermediate read as plaintext.
  const key81 = Array.from({length: 81}, (_, position) => {
    const row = Math.floor(position / 9) + 1;
    const column = position % 9 + 1;
    return plain[row * 11 + column];
  });
  const nativePlant = p57Native.slice(0, 81);
  for (const downstreamSign of [-1, 1]) {
    const restored = p33OriginalBody81.map((rune, i) =>
      mod29(rune + downstreamSign * key81[i]));
    const encodedPlant = nativePlant.map((rune, i) =>
      mod29(rune - downstreamSign * key81[i]));
    assert.deepEqual(encodedPlant.map((rune, i) =>
      mod29(rune + downstreamSign * key81[i])), nativePlant);
    twoStageP33Consumers.push({
      mode, kind, sx, sy, sign, firstRow, downstreamSign,
      ioc: indexOfCoincidence(restored),
      prefix: restored.slice(0, 50)
        .map(value => corpus.translit[value]).join('')
    });
  }

}
for (const mode of ['GP-index', 'GP-prime-mod29']) {
  const scalar = r => mode === 'GP-index' ? r : corpus.prime[r] % 29;
  const rowWeights = rowKey.map(scalar);
  const columnWeights = columnKey.map(scalar);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    recordConsumer({ mode, kind: 'additive', sx, sy,
      rowWeights, columnWeights });
  }
  for (const firstRow of [0, 1]) for (const sign of [-1, 1]) {
    recordConsumer({ mode, kind: 'multiplicative', sign, firstRow,
      rowWeights, columnWeights });
  }
}
assert.equal(twoDimensionalConsumers.length, 16);
assert.equal(twoStageP33Consumers.length, 32);
const bestTwoStageP33 = [...twoStageP33Consumers]
  .sort((a, b) => b.ioc - a.ioc)[0];
assert.ok(Math.abs(bestTwoStageP33.ioc - 0.04135802469135803) < 1e-12);
assert.ok(bestTwoStageP33.ioc < indexOfCoincidence(p57Native.slice(0, 81)));

const best2D = [...twoDimensionalConsumers].sort((a,b) => b.ioc - a.ioc)[0];
assert.ok(best2D.ioc < 0.04,
  'original source-addressed 2D consumer surprisingly looks like English: inspect');


/**
 * Exact without-replacement combinatorial probability that a *fixed*
 * printed slot of a fixed length has the specified GP-prime sum, conditional
 * on the source page's original rune inventory. The two pages are shuffled
 * independently in the null; this estimates no discovery-wide probability.
 */
function choose(n, k) {
  let value = 1n;
  for (let j = 1; j <= k; j++)
    value = value * BigInt(n - j + 1) / BigInt(j);
  return value;
}
function exactFixedSlot(pageIndices, length, target) {
  const hist = Array(29).fill(0);
  pageIndices.forEach(i => hist[i]++);
  const newTable = () => Array.from({ length: length + 1 },
    () => Array(target + 1).fill(0n));
  let table = newTable();
  table[0][0] = 1n;
  for (let rune = 0; rune < 29; rune++) {
    const combinations = Array.from({
      length: Math.min(hist[rune], length) + 1
    }, (_, k) => choose(hist[rune], k));
    const next = newTable();
    for (let j = 0; j <= length; j++) {
      for (let sum = 0; sum <= target; sum++) {
        const ways = table[j][sum];
        if (ways === 0n) continue;
        const kMax = Math.min(length - j, combinations.length - 1,
          Math.floor((target - sum) / corpus.prime[rune]));
        for (let k = 0; k <= kMax; k++)
          next[j + k][sum + k * corpus.prime[rune]] +=
            ways * combinations[k];
      }
    }
    table = next;
  }
  const numerator = table[length][target];
  const denominator = choose(pageIndices.length, length);
  return { numerator: numerator.toString(), denominator: denominator.toString(),
    probability: Number(numerator) / Number(denominator) };
}
const indexedSelectors = {
  gapSelectedP0Word: DIMENSIONS[1] - DIMENSIONS[0],
  treePageOneBased: p32.page + 1
};
assert.deepEqual(indexedSelectors, {
  gapSelectedP0Word: 6, treePageOneBased: 33
});
const fixedWord0 = exactFixedSlot(corpus.pages[0].indices, 11, 563);
const fixedWord1 = exactFixedSlot(corpus.pages[1].indices, 10, 569);
assert.equal(fixedWord0.numerator, '35899236695815881');
assert.equal(fixedWord0.denominator, '8086245943682454912');
assert.equal(fixedWord1.numerator, '711438468463099');
assert.equal(fixedWord1.denominator, '411805263302065633');
const fixedTwoSlotJoint = fixedWord0.probability * fixedWord1.probability;


const compass = ['N', 'E', 'S', 'W'].map(token =>
  corpus.translit.indexOf(token));
assert.ok(compass.every(i => i >= 0));
const compassSet = new Set(compass);
const compassPrefixWords = sourceWords.filter(word =>
  word.runes.length >= 3 &&
  word.runes.slice(0, 3).every(rune => compassSet.has(rune)));
assert.deepEqual(compassPrefixWords.map(word => [word.page, word.word]),
  [[0, 6], [18, 39], [23, 15], [37, 22], [45, 35]]);
const actualPrefix = firstTwo[0].words[5].slice(0, 3);
assert.deepEqual(actualPrefix,
  ['N', 'E', 'W'].map(token => corpus.translit.indexOf(token)));
assert.equal(sourceWords.filter(w =>
  w.runes.length >= 3 && w.runes.slice(0, 3)
    .every((rune, i) => rune === actualPrefix[i])).length, 1);

/**
 * Exact probability of a nominated ordered 3-rune prefix AND the sum
 * target in a fixed original word slot under page-inventory shuffling.
 * The prefix and the slot were noticed post hoc, so do not interpret
 * this as a discovery-wide probability of an intentional cardinal clue.
 */
function fixedPrefixAndSumProbability(prefix) {
  const originalPool = corpus.pages[0].indices;
  const remainingPool = [...originalPool];
  let prefixProbability = 1;
  for (let j = 0; j < prefix.length; j++) {
    const n = remainingPool.filter(rune => rune === prefix[j]).length;
    prefixProbability *= n / remainingPool.length;
    const position = remainingPool.indexOf(prefix[j]);
    if (position < 0) return 0;
    remainingPool.splice(position, 1);
  }
  const remainingSum = DIMENSIONS[0] -
    prefix.reduce((s, rune) => s + corpus.prime[rune], 0);
  return prefixProbability * exactFixedSlot(
    remainingPool, rowKey.length - prefix.length, remainingSum).probability;
}
const exactNEWWordsumProbability =
  fixedPrefixAndSumProbability(actualPrefix);
let anyCompassTripleWith563 = 0;
for (const a of compass) for (const b of compass) for (const c of compass)
  anyCompassTripleWith563 += fixedPrefixAndSumProbability([a, b, c]);
assert.ok(anyCompassTripleWith563 > 0);
assert.ok(exactNEWWordsumProbability < anyCompassTripleWith563);

// A different, literal possible consumer of the source-selected opening
// word is a change of numerical radix. BASE29 is a historically attested
// Cicada command, whereas a 59/60-letter digit alphabet for the LP2 table
// is only a conventional hypothesis. The source DOES NOT spell NEW BASE:
// after NEWBAS the next rune is OE, not E.
const newBasPrefix = ['N', 'E', 'W', 'B', 'A', 'S']
  .map(token => corpus.translit.indexOf(token));
assert.deepEqual(rowKey.slice(0, 6), newBasPrefix);
assert.equal(sourceWords.filter(word =>
  word.runes.length >= 6 &&
  word.runes.slice(0, 6).every((value, i) =>
    value === newBasPrefix[i])).length, 1);
assert.notEqual(rowKey[6], corpus.translit.indexOf('E'));

const p50Numeral = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(p50Numeral.alphabet.length, 60);

/** Positional base29 original word to its ordinary unpadded radix-N digits. */
function rebaseWord(sourceIndices, targetRadix, digitAlphabet) {
  let value = sourceIndices.reduce((sum, rune) =>
    sum * 29n + BigInt(rune), 0n);
  let result = '';
  do {
    result = digitAlphabet[Number(value % BigInt(targetRadix))] + result;
    value /= BigInt(targetRadix);
  } while (value > 0n);
  return result;
}

/** Exact positive-control inverse on an externally chosen uppercase word. */
function base29NumeralOf(word, radix, alphabet) {
  let value = [...word].reduce((sum, letter) =>
    sum * BigInt(radix) + BigInt(alphabet.indexOf(letter)), 0n);
  const runes = [];
  do {
    runes.unshift(Number(value % 29n));
    value /= 29n;
  } while (value > 0n);
  return runes;
}
const sourceWordRadixGates = [59, 60].map(radix => {
  const alphabet = p50Numeral.alphabet.slice(0, radix);
  const allOutputs = sourceWords.map(word =>
    rebaseWord(word.runes, radix, alphabet));
  const firstTwoOutputs = firstTwo.flatMap(page =>
    page.words.map(word => rebaseWord(word, radix, alphabet)));
  assert.equal(rebaseWord(base29NumeralOf('HELLO', radix, alphabet),
    radix, alphabet), 'HELLO');
  const originalUppercase = allOutputs.filter(w => /^[A-Z]+$/.test(w)).length;
  const firstTwoUppercase = firstTwoOutputs.filter(w => /^[A-Z]+$/.test(w)).length;
  const widthWord = rebaseWord(rowKey, radix, alphabet);
  const heightWord = rebaseWord(columnKey, radix, alphabet);
  return {radix, originalUppercase, firstTwoUppercase, widthWord, heightWord};
});
assert.deepEqual(sourceWordRadixGates, [
  {radix: 59, originalUppercase: 189, firstTwoUppercase: 6,
    widthWord: 'RYriPRWG4', heightWord: '15BR2c2dI'},
  {radix: 60, originalUppercase: 188, firstTwoUppercase: 6,
    widthWord: 'O7DTNDFbK', heightWord: 'v48oELtj'}
]);

// Distinct source-motivated *key* consumer: the signed image axis
// difference 569-563=6 fixes six initial GP29 symbols of p0#6, NEWBAS.
// The independently demonstrated 2014 solved-text Vigenere step motivates
// a fixed six-period key only as a hypothesis. Start immediately after
// p0#6 and reset the key once at the first rune of the following p1.
// No fitted phase, key truncation, offset selection or language search.
const word6End = firstTwo[0].words.slice(0, 6)
  .reduce((sum, word) => sum + word.length, 0);
assert.equal(word6End, 34);
const fixedNewBasKey = rowKey.slice(0, DIMENSIONS[1] - DIMENSIONS[0]);
assert.equal(fixedNewBasKey.length, 6);
assert.deepEqual(fixedNewBasKey, newBasPrefix);
const originalP0AfterWord6 = corpus.pages[0].indices.slice(word6End);
const originalP1 = corpus.pages[1].indices;
assert.deepEqual([originalP0AfterWord6.length, originalP1.length], [228, 266]);

/**
 * Six-symbol source-word additive key inverse; optional literal F passes
 * through without consuming the key, as the historical p56 cipher does.
 * This F-variant is a conditional ciphertext-driven readout, not a
 * guaranteed bijection on every unrestricted GP29 plaintext.
 * @param {number[]} cipher
 * @param {number} sign
 * @param {boolean} skipF
 * @returns {number[]}
 */
function decodeNewBas(cipher, sign, skipF) {
  let keyOffset = 0;
  return cipher.map(value => {
    if (skipF && value === 0) return value;
    const output = mod29(value + sign *
      fixedNewBasKey[keyOffset % fixedNewBasKey.length]);
    keyOffset++;
    return output;
  });
}
const keyConsumerResults = [];
for (const sign of [-1, 1]) for (const skipF of [false, true]) {
  const p0Original = decodeNewBas(originalP0AfterWord6, sign, skipF);
  const p1Original = decodeNewBas(originalP1, sign, skipF);
  const bookRun = decodeNewBas(originalP0AfterWord6.concat(originalP1),
    sign, skipF);
  keyConsumerResults.push({sign, skipF,
    p0IoC: indexOfCoincidence(p0Original),
    p1IoC: indexOfCoincidence(p1Original),
    continuousIoC: indexOfCoincidence(bookRun),
    p0Prefix: p0Original.slice(0, 60)
      .map(value => corpus.translit[value]).join(''),
    p1Prefix: p1Original.slice(0, 60)
      .map(value => corpus.translit[value]).join('')});
}
assert.deepEqual(keyConsumerResults.map(row =>
  [row.sign, row.skipF, Number(row.p0IoC.toFixed(9)),
    Number(row.p1IoC.toFixed(9)),
    Number(row.continuousIoC.toFixed(9))]),
  [
    [-1, false, 0.034083005, 0.034387856, 0.033809363],
    [-1, true, 0.035976505, 0.036572563, 0.035574973],
    [1, false, 0.032382719, 0.032940843, 0.033521939],
    [1, true, 0.036015148, 0.037452121, 0.036552217]
  ]);
const p57KeyPlant = corpus.pages[57].indices;
for (const sign of [-1, 1]) {
  const cipher = p57KeyPlant.map((value, i) =>
    mod29(value - sign * fixedNewBasKey[i % 6]));
  assert.deepEqual(decodeNewBas(cipher, sign, false), p57KeyPlant);
}

// Source word-map alternative: the first two physical pages contain
// 59+63 = 122 page-local words, one more than the 121 p32 tree runes.
// The independently source-sum-selected p0#6 and p1#33 are the only
// two declared one-word omissions. Keep all remaining 121 whole-word
// GP-prime sums as a source-ordered GP29 additive key, with no fitted
// positions or numeric transformations beyond modulo29. A second stage
// reuses the fixed 9x9 p32 interior against p33's marked 81-rune body.
const firstTwoWordsFlat = firstTwo.flatMap(page => page.words);
assert.equal(firstTwoWordsFlat.length, 122);
assert.equal(firstTwo[0].words.length, 59);
const wordMap121Results = [];
for (const droppedWord of [5, 59 + 32]) {
  const wordPrimeKey121 = firstTwoWordsFlat
    .filter((_, index) => index !== droppedWord)
    .map(word => word.reduce((sum, rune) =>
      sum + corpus.prime[rune], 0) % 29);
  assert.equal(wordPrimeKey121.length, 121);
  for (const sign of [-1, 1]) {
    const stageOne = p32Cipher.map((value, i) =>
      mod29(value + sign * wordPrimeKey121[i]));
    const plantCipher = p57Native.map((value, i) =>
      mod29(value - sign * wordPrimeKey121[i]));
    assert.deepEqual(plantCipher.map((value, i) =>
      mod29(value + sign * wordPrimeKey121[i])), p57Native);
    const stageTwoKey81 = Array.from({length: 81}, (_, index) =>
      stageOne[(Math.floor(index / 9) + 1) * 11 +
        (index % 9 + 1)]);
    const scoreOutput = (values, nextSign) => ({
      removed: droppedWord === 5 ? 'p0word6' : 'p1word33',
      sign, downstreamSign: nextSign,
      ioc: indexOfCoincidence(values),
      prefix: values.slice(0, 50)
        .map(value => corpus.translit[value]).join('')
    });
    wordMap121Results.push(scoreOutput(stageOne, 0));
    for (const nextSign of [-1, 1]) {
      const second = p33OriginalBody81.map((value, i) =>
        mod29(value + nextSign * stageTwoKey81[i]));
      const knownPlant = p57Native.slice(0, 81);
      assert.deepEqual(knownPlant.map((value, i) =>
        mod29(value - nextSign * stageTwoKey81[i]))
        .map((value, i) =>
          mod29(value + nextSign * stageTwoKey81[i])),
      knownPlant);
      wordMap121Results.push(scoreOutput(second, nextSign));
    }
  }
}
assert.equal(wordMap121Results.length, 12);
const bestWordMap121 = [...wordMap121Results].sort((a, b) =>
  b.ioc - a.ioc)[0];
assert.equal(bestWordMap121.removed, 'p1word33');
assert.equal(bestWordMap121.sign, 1);
assert.equal(bestWordMap121.downstreamSign, -1);
assert.ok(Math.abs(bestWordMap121.ioc - 0.03950617283950617) < 1e-12);
assert.ok(wordMap121Results.every(result => result.ioc < 0.04));

// The signed words/numbers/direction clue can also be read as a walk,
// assigning the opening 121 whole-word GP-prime totals to 121 tree cells.
// The only two source-selected omitted words are p0#6 and p1#33.
// Test the literal one-dimensional modular walk and the usual 11x11
// coordinate-carry interpretation. An actual bijective cell ordering
// must visit all 121 distinct cells; repeated visits prevent that
// particular simple word-as-permutation decoding. No tuned start/steps.
function wordSumWalk(numbers, cartesian) {
  let cursor = 0;
  let row = 0;
  let column = 0;
  const occurrences = Array(121).fill(0);
  for (const number of numbers) {
    const cell = cartesian ? row * 11 + column : cursor;
    occurrences[cell]++;
    if (cartesian) {
      row = (row + Math.floor(number / 11)) % 11;
      column = (column + number % 11) % 11;
    } else {
      cursor = (cursor + number) % 121;
    }
  }
  return {distinct: occurrences.filter(count => count > 0).length,
    maxVisits: Math.max(...occurrences),
    end: cartesian ? row * 11 + column : cursor};
}
// Explicit synthetic Hamiltonian paths confirm the walk decoder can
// recognize complete coverage under both fixed arithmetic conventions.
assert.equal(wordSumWalk(Array(121).fill(1), false).distinct, 121);
const syntheticCartesianSteps = Array.from({length: 121}, (_, i) =>
  i % 11 === 10 ? 12 : 1);
assert.equal(wordSumWalk(syntheticCartesianSteps, true).distinct, 121);
const wordMapWalkResults = [];
for (const omitted of [5, 59 + 32]) {
  const numbers = firstTwoWordsFlat
    .filter((_, wordIndex) => wordIndex !== omitted)
    .map(word => word.reduce((sum, rune) =>
      sum + corpus.prime[rune], 0));
  for (const cartesian of [false, true]) {
    wordMapWalkResults.push({
      removed: omitted === 5 ? 'p0word6' : 'p1word33',
      mode: cartesian ? 'cartesian-11x11' : 'linear-mod121',
      ...wordSumWalk(numbers, cartesian)
    });
  }
}
assert.deepEqual(wordMapWalkResults, [
  {removed:'p0word6', mode:'linear-mod121', distinct:79,
    maxVisits:4, end:75},
  {removed:'p0word6', mode:'cartesian-11x11', distinct:78,
    maxVisits:4, end:53},
  {removed:'p1word33', mode:'linear-mod121', distinct:75,
    maxVisits:5, end:69},
  {removed:'p1word33', mode:'cartesian-11x11', distinct:74,
    maxVisits:4, end:47}
]);

// An alternative to using numeric letters as additive shifts is a
// key-ordered grid transposition. The unique 11-rune width word supplies
// a complete sort key for all 11 columns, and the 10-rune height word
// supplies a stable sort key for the 10 remaining rows. Keep the
// image-selected first row fixed, then read the 9x9 interior as a p33
// one-shot key. This is a source-sized but hypothesized cipher operator.
const keySortedP32ToP33 = [];
function stableRuneRank(key, direction) {
  return Array.from({length: key.length}, (_, index) => index)
    .sort((i, j) => direction * (key[i] - key[j]) || i - j);
}
for (const columnDirection of [-1, 1])
  for (const rowDirection of [-1, 1]) {
    const cols = stableRuneRank(rowKey, columnDirection);
    const rows = [0, ...stableRuneRank(columnKey, rowDirection)
      .map(i => i + 1)];
    const sortedP32 = rows.flatMap(row => cols.map(col =>
      p32Cipher[row * 11 + col]));
    assert.deepEqual(
      [...sortedP32].sort((a, b) => a - b),
      [...p32Cipher].sort((a, b) => a - b));
    const sortedInner = Array.from({length: 81}, (_, index) =>
      sortedP32[(Math.floor(index / 9) + 1) * 11 +
        (index % 9 + 1)]);
    for (const sign of [-1, 1]) {
      const decoded = p33OriginalBody81.map((v, i) =>
        mod29(v + sign * sortedInner[i]));
      const control = p57Native.slice(0, 81);
      const enc = control.map((v, i) =>
        mod29(v - sign * sortedInner[i]));
      assert.deepEqual(enc.map((v, i) =>
        mod29(v + sign * sortedInner[i])), control);
      keySortedP32ToP33.push({
        columnDirection, rowDirection, sign,
        ioc: indexOfCoincidence(decoded),
        prefix: decoded.slice(0, 50)
          .map(v => corpus.translit[v]).join('')
      });
    }
  }
assert.equal(keySortedP32ToP33.length, 8);
const bestKeySort = [...keySortedP32ToP33]
  .sort((a, b) => b.ioc - a.ioc)[0];
assert.deepEqual(
  [bestKeySort.columnDirection, bestKeySort.rowDirection,
    bestKeySort.sign], [1, 1, -1]);
assert.ok(Math.abs(bestKeySort.ioc - 0.0404320987654321) < 1e-12);

// 2012 original first-image dimensions 509x503 do not supply the same pair.
const controlDimensions = [503, 509].map(value =>
  sourceWords.filter(word => word.sum === value).length);
assert.deepEqual(controlDimensions, [3, 0]);

console.log(JSON.stringify({
  source: '2016 associated tree JPEG, 563x569, signed words/numbers clue',
  sourceStructure: { p32TopRowSum: rowSum, p32FirstColumnSum: columnSum },
  exactGlobalWordHits: hitWords.map((hits, i) => ({
    target: DIMENSIONS[i],
    hits: hits.map(word => ({
      page: word.page, word: word.word, length: word.runes.length,
      transliteration: word.runes.map(r => corpus.translit[r]).join('')
    }))
  })),
  control: {
    algorithm: 'Fisher-Yates per-page rune shuffle; exact word slots',
    seed: SEED,
    draws: NUMBER_OF_SHUFFLES,
    counts: totals,
    ratioOriginalOrder: totals.orderedPages / NUMBER_OF_SHUFFLES
  },
  control2012ImageWordHitCounts: controlDimensions,
  dimensionWordSortedP32P33: {best: bestKeySort,
    variants: keySortedP32ToP33},
  opening121WordDirectionalWalks: wordMapWalkResults,
  opening122WordMapToP32: {totalWords: firstTwoWordsFlat.length,
    p32KeySlots: 121, best: bestWordMap121, variants: wordMap121Results},
  newBASp32AsKeyP33Body81: {
    originalP33BodyIOC: indexOfCoincidence(p33OriginalBody81),
    solvedP57ControlIOC: indexOfCoincidence(p57Native.slice(0, 81)),
    best: bestTwoStageP33, all: twoStageP33Consumers
  },
  newBasSixRuneSourceKey: {source: 'p0 word6 prefix6, axis gap6',
    originalP0TailLength: originalP0AfterWord6.length,
    originalP1Length: originalP1.length, variants: keyConsumerResults},
  possibleNewBasePrefixAndLiteralRadix: {originalPrefix: 'NEWBAS',
    followingRune: 'OE', gates: sourceWordRadixGates},
  compassSourcePrefix: {sourceWord: 'p0 word 6', originalPrefix: 'NEW',
    allThreeCompassPrefixLocations: compassPrefixWords.map(w => [w.page,w.word]),
    fixedWordExactNEWSum563Chance: exactNEWWordsumProbability,
    fixedWordAnyThreeCompassSum563Chance: anyCompassTripleWith563,
    anyCompassConditionalOnWordSum563: anyCompassTripleWith563 / fixedWord0.probability},
  fixedWordIndexHypothesis: {indexSelectors: indexedSelectors,
    p0: fixedWord0, p1: fixedWord1, jointProbability: fixedTwoSlotJoint},
  p32TwoDimensionalNaturalConsumers: {nativeP57IOC: p57PlainIOC,
    bestOriginalIOC: best2D.ioc, variants: twoDimensionalConsumers},
  conclusion: 'Exact source-linked alignment, no decoder or authentic plaintext'
}, null, 2));
