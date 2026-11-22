'use strict';
/**
 * Direct GF(29) factor-coefficient and formal-derivative key on physical LP2 p36.
 *
 * A printed 256-token numeral table (pp49–51) has an exact degree-238
 * residual factor Q(X). Physical p36 independently contains 238 GP runes.
 * This bounded original-cipher experiment treats either Q's 238 nonleading
 * coefficients or the 238 coefficients of Q'(X) as additive GP29 keys.
 *
 * This is exploratory, NOT an authenticated Cicada key or decryption.
 * Run: node sims/lp2_p36_q238_derivative_key_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
  return result;
}

/** @param {number[]} a @param {number[]} divisor @returns {number[]} */
function monicDivide(a, divisor) {
  assert.equal(divisor.at(-1), 1);
  const residual = a.slice();
  const quotient = Array(a.length - divisor.length + 1).fill(0);
  for (let k = residual.length - 1; k >= divisor.length - 1; k--) {
    const coeff = residual[k];
    const start = k - divisor.length + 1;
    quotient[start] = coeff;
    for (let j = 0; j < divisor.length; j++)
      residual[start + j] = mod(residual[start + j] - coeff * divisor[j]);
  }
  assert(residual.every(value => value === 0), 'GF29 factor division failed');
  assert.deepEqual(multiply(divisor, quotient), a,
    'Original 256 numerals must reconstruct exactly modulo29');
  return quotient;
}

/**
 * @param {string} input
 * @param {Array<{value:string,index:number}>} alphabet
 * @returns {number[][]} Source-native GP tokenization, including ING as one rune.
 */
function gpWords(input, alphabet) {
  return (input.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    const normalized = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    const tokens = [];
    for (let i = 0; i < normalized.length;) {
      const token = alphabet.find(entry => normalized.startsWith(entry.value, i));
      assert(token, 'Missing GP transliteration for ' + word);
      tokens.push(token.index);
      i += token.value.length;
    }
    return tokens;
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} ciphertext @param {number[]} key */
function transform(ciphertext, key, sign, reverse, transparentF) {
  const result = [];
  let clock = 0;
  for (const value of ciphertext) {
    if (transparentF && value === 0) { result.push(0); continue; }
    const keySymbol = key[reverse ? key.length - 1 - clock : clock];
    assert.notEqual(keySymbol, undefined, 'Key clock exceeds 238 coefficients');
    result.push(mod(value + sign * keySymbol));
    clock++;
  }
  return {symbols: result, consumed: clock};
}

/** @param {number[]} values @param {Float64Array} trigramScores */
function languageScore(values, trigramScores) {
  let total = 0;
  for (let i = 2; i < values.length; i++)
    total += trigramScores[values[i - 2] * 841 + values[i - 1] * 29 + values[i]];
  return total / (values.length - 2);
}

/** @param {number[]} native @returns {{score:Float64Array,heldout:number[]}} */
function model(native) {
  const trainEnd = Math.floor(native.length * .75);
  const tris = new Float64Array(29 ** 3).fill(.005);
  const bis = new Float64Array(29 ** 2).fill(.145);
  for (let i = 2; i < trainEnd; i++) {
    const id = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
    tris[id]++;
    bis[Math.floor(id / 29)]++;
  }
  const scores = Float64Array.from(tris,
    (value, index) => Math.log(value / bis[Math.floor(index / 29)]));
  const heldout = [];
  for (let i = trainEnd; i + 238 <= native.length; i += 238)
    heldout.push(languageScore(native.slice(i, i + 238), scores));
  heldout.sort((a, b) => a - b);
  return {score: scores, heldout};
}

/** @param {number[]} values @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} array @param {() => number} random @returns {number[]} */
function shuffle(array, random) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const index = random() % (i + 1);
    [result[i], result[index]] = [result[index], result[i]];
  }
  return result;
}

/** @param {number[]} original @param {number[]} direct @param {number[]} derivative */
function scoreVariants(original, direct, derivative, scores) {
  const variants = [];
  for (const [name, key] of [['factor', direct], ['derivative', derivative]])
    for (const reverse of [false, true])
      for (const sign of [-1, 1])
        for (const transparentF of [false, true]) {
          const result = transform(original, key, sign, reverse, transparentF);
          // Ciphertext-tied inverse: a literal F carries no key when skipped.
          let clock = 0;
          const reconstruction = original.map((c, i) => {
            if (transparentF && c === 0) return 0;
            const k = key[reverse ? key.length - 1 - clock : clock];
            clock++;
            return mod(result.symbols[i] - sign * k);
          });
          assert.deepEqual(reconstruction, original);
          variants.push({key: name, reverse, sign, transparentF,
            score: languageScore(result.symbols, scores),
            ioc: ioc(result.symbols), consumed: result.consumed});
        }
  return variants.sort((a, b) => b.score - a.score);
}

/** Original physical-page word breaks, avoiding line-break artifacts. */
function page36Words(transcription, runes, ciphertext) {
  const runeToIndex = new Map(runes.map((rune, index) => [rune, index]));
  const source = transcription.split('%')[36];
  const words = [];
  let current = [];
  for (const char of source) {
    if (runeToIndex.has(char)) current.push(runeToIndex.get(char));
    else if ('-.$&§'.includes(char) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  assert.equal(words.length, 50);
  assert.deepEqual(words.flat(), ciphertext);
  return words;
}

function run() {
  const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const transcription = read('resources/lp2-transcription.txt');
  const glyphs = grid.byte_rows.flat();
  assert.equal(glyphs.length, 256);
  const original = glyphs.map(value => mod(-value)).reverse();
  while (original.at(-1) === 0) original.pop();
  assert.equal(original.length, 255);
  assert.equal(original.at(-1), 1);
  const smallFactors = [[5, 1], [5, 1], [11, 18, 1],
    [24, 16, 14, 1], [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]];
  const divisor = smallFactors.reduce(multiply, [1]);
  assert.equal(divisor.length, 17);
  const quotient = monicDivide(original, divisor);
  assert.equal(quotient.length, 239);
  assert.equal(quotient.at(-1), 1);
  const factorKey = quotient.slice(0, 238);
  const derivativeKey = quotient.slice(1).map((coeff, i) => mod((i + 1) * coeff));
  assert.equal(derivativeKey.length, 238);
  const originalPage = corpus.pages.find(page => page.page === 36).indices;
  assert.equal(originalPage.length, 238);
  const decoded = transform(originalPage, derivativeKey, -1, false, false).symbols;
  assert.deepEqual(
    transform(decoded, derivativeKey, +1, false, false).symbols, originalPage);

  const alphabet = corpus.translit.map((value, index) => ({value, index}))
    .concat([{value: 'ING', index: 21}])
    .sort((a, b) => b.value.length - a.value.length);
  const sources = [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
    ['Emerson', 'resources/control/emerson_essays_2944.txt']
  ];
  const dictionaries = [];
  const language = [];
  let mainScores = null;
  for (const [source, file] of sources) {
    const words = gpWords(read(file), alphabet);
    dictionaries.push(new Set(words.map(word => word.join(','))));
    const sourceModel = model(words.flat());
    if (source === 'Shakespeare') mainScores = sourceModel.score;
    language.push({
      source, heldoutWindows: sourceModel.heldout.length,
      nativeMinimum: sourceModel.heldout[0],
      nativeMedian: sourceModel.heldout[Math.floor(sourceModel.heldout.length / 2)],
      originalScore: languageScore(originalPage, sourceModel.score),
      derivativeScore: languageScore(decoded, sourceModel.score)
    });
  }
  assert(mainScores);
  const variants = scoreVariants(originalPage, factorKey, derivativeKey, mainScores);
  assert.deepEqual(
    [variants[0].key, variants[0].reverse, variants[0].sign, variants[0].transparentF],
    ['derivative', false, -1, false]);
  const nativeSource = gpWords(read(sources[0][1]), alphabet).flat();
  const planted = nativeSource.slice(400, 638);
  assert.equal(planted.length, 238);
  assert.deepEqual(transform(
    transform(planted, derivativeKey, +1, false, false).symbols,
    derivativeKey, -1, false, false).symbols, planted);

  const half = [0, 119].map(start => ({
    from: start, toExclusive: start + 119,
    originalScore: languageScore(originalPage.slice(start, start + 119), mainScores),
    derivativeScore: languageScore(decoded.slice(start, start + 119), mainScores)
  }));
  const allPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= 238)
    .map(page => {
      const original238 = page.indices.slice(0, 238);
      const output = transform(original238, derivativeKey, -1, false, false).symbols;
      const originalScore = languageScore(original238, mainScores);
      const derivativeScore = languageScore(output, mainScores);
      return {page: page.page, originalScore, derivativeScore,
        improvement: derivativeScore - originalScore};
    });
  const byDecoded = allPages.slice().sort((a, b) =>
    b.derivativeScore - a.derivativeScore);
  const byImprovement = allPages.slice().sort((a, b) =>
    b.improvement - a.improvement);
  const originalWordList = page36Words(transcription, corpus.runes, originalPage);
  const union = new Set(dictionaries.flatMap(source => [...source]));
  let offset = 0;
  const wordOutputs = originalWordList.map((word, index) => {
    const symbols = decoded.slice(offset, offset + word.length);
    offset += word.length;
    return {index, length: word.length,
      text: symbols.map(symbol => corpus.translit[symbol]).join(''),
      inReferenceLexicon: union.has(symbols.join(','))};
  });
  assert.equal(offset, 238);
  const lexiconMatches = wordOutputs.filter(word => word.inReferenceLexicon);
  const random = rng(0x3301babe);
  let shuffledAtLeastBest = 0;
  const samples = 1000;
  const bestScore = variants[0].score;
  for (let trial = 0; trial < samples; trial++) {
    const q = shuffle(factorKey, random);
    const d = shuffle(derivativeKey, random);
    const nullBest = scoreVariants(originalPage, q, d, mainScores)[0].score;
    if (nullBest >= bestScore) shuffledAtLeastBest++;
  }
  return {
    classification: 'Exploratory source-derived key alignment, no recovered plaintext',
    originalInputs: {
      grid: 'LP2 pp49-51 256-token original table interpreted as base60 bytes',
      target: 'LP2 p36 238 original GP runes, 50 original words',
      factorization: 'Monic -P(X)=(X+5)^2*(X^2+18X+11)*(X^3+14X^2+16X+24)*(degree9 factor)*Q238(X)',
      residueDegree: quotient.length - 1,
      directKeyLength: factorKey.length,
      derivativeKeyLength: derivativeKey.length,
      signedGPModulus: 29,
      tableByteCount: glyphs.length
    },
    frozenCandidate: {
      rule: 'P_i = (C_i - [X^i]Q238_prime(X)) mod29, i=0..237',
      decodedGP: decoded.map(index => corpus.translit[index]).join(''),
      completeOriginalWords: wordOutputs,
      recoveredDictionaryWords: lexiconMatches,
      originalIoC: ioc(originalPage),
      candidateIoC: ioc(decoded),
      exact238RuneForwardInverse: true,
      solvedNativePlant238Exact: true
    },
    language, variants,
    fixedHalfScores: half,
    original238PageControl: {
      testedPages: allPages.length,
      page36RankByScore: byDecoded.findIndex(item => item.page === 36) + 1,
      page36RankByGain: byImprovement.findIndex(item => item.page === 36) + 1,
      topDecodedPages: byDecoded.slice(0, 5)
    },
    shuffledKeyNull: {
      hypothesisFamily: 'Both full keys, directions, signs, F transparency',
      trials: samples, seed: '0x3301babe',
      atLeastOriginal: shuffledAtLeastBest,
      addOneConditionalP: (shuffledAtLeastBest + 1) / (samples + 1)
    },
    limitation: 'The derivative inverse fails source word grammar and remains far below every native-text reference control. This p-value is conditional on a postselected family, with no global multiple-search correction and no author-selected key operation.'
  };
}
if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {run, mod, multiply, monicDivide, gpWords, languageScore, transform};
