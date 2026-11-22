'use strict';

/**
 * Original-LP2 key-independent gate for five source-constrained nonlinear
 * predecessor predictors in a fully position-keyed, reversible GF29 cipher.
 *
 * Model: C[i] = C[i-1] + k[i] * (P[i] - m(P[i-1])) (mod 29),
 * with arbitrary nonzero secret k[i] at EVERY position and page-local resets.
 *
 * Run from the repository root on Windows 11, Node.js 22:
 *   node sims/lp2_nonlinear_zero_map_allsecret_source_gate_sft.cjs
 *
 * No original unknown plaintext, key, or author-selected decoder is claimed.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./affine_echo_literary_control.cjs');

const ROOT = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphToIndex = new Map(corpus.runes.map((x, i) => [x, i]));
/** @param {number} n @returns {number} */
const mod29 = n => (n % 29 + 29) % 29;
/** @param {number} base @param {number} exponent @returns {number} */
function modPow(base, exponent) {
  let value = 1;
  while (exponent > 0) {
    if (exponent % 2) value = value * base % 29;
    base = base * base % 29;
    exponent = Math.floor(exponent / 2);
  }
  return value;
}
/** @param {number} a @returns {number} */
function inv29(a) {
  assert(a >= 1 && a <= 28);
  return modPow(a, 27);
}

/** @returns {Array<Array<{value:number,page:number}>>} */
function originalWords() {
  const segments = read('resources/lp2-transcription.txt').split('%').slice(0, 55);
  assert.equal(segments.length, 55);
  const words = [];
  let word = [];
  let page = 0;
  const finish = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (const ch of segments.join('%')) {
    if (glyphToIndex.has(ch)) {
      word.push({value: glyphToIndex.get(ch), page});
    } else if (ch === '%') {
      page++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // A line wrap, unlike source punctuation, does not end a word.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(page, 54);
  assert.equal(words.length, 2896);
  const all = words.flat();
  assert.equal(all.length, 12956);
  assert.equal(new Set(all.map(x => x.page)).size, 55);
  const actualPages = corpus.pages.filter(x => x.page <= 55 && x.indices.length);
  assert.equal(actualPages.length, 55);
  for (const p of actualPages) {
    assert.deepEqual(all.filter(x => x.page === p.page).map(x => x.value), p.indices);
  }
  return words;
}

/**
 * For this cipher's exact zero-step invariant, count P[j] = map[P[j-1]].
 * @param {number[]} word
 * @param {number[]} predictor
 * @param {boolean[]} eligible
 * @returns {number}
 */
function predictorCount(word, predictor, eligible) {
  let count = 0;
  for (let i = 1; i < word.length; i++) {
    if (eligible[i - 1] && word[i] === predictor[word[i - 1]]) count++;
  }
  return count;
}

/** @param {Array<Array<{value:number,page:number}>>} words */
function layoutGroups(words) {
  const groups = new Map();
  let withinWordPairs = 0;
  let actualEqualPairs = 0;
  for (const word of words) {
    const eligible = word.slice(1).map((x, j) => x.page === word[j].page);
    withinWordPairs += eligible.filter(Boolean).length;
    actualEqualPairs += predictorCount(
      word.map(x => x.value),
      Array.from({length: 29}, (_, i) => i),
      eligible
    );
    const id = word.length + '|' + eligible.map(x => x ? '1' : '0').join('');
    if (groups.has(id)) groups.get(id).n++;
    else groups.set(id, {length: word.length, eligible, n: 1});
  }
  assert.equal(groups.size, 34);
  assert.equal(withinWordPairs, 10028);
  assert.equal(actualEqualPairs, 63);
  return {groups: [...groups.values()], withinWordPairs, actualEqualPairs};
}

/**
 * Exact Chernoff upper bound on P(sum <= observed) under independent
 * source-native whole-word draws matched by GP length and physical-page mask.
 * @param {Array<{n:number, hist:Array<[number,number]>,size:number}>} strata
 * @param {number} observed
 */
function chernoff(strata, observed) {
  /** @param {number} s */
  function evaluate(s) {
    let logUpper = s * observed;
    let derivative = observed;
    for (const {n, hist, size} of strata) {
      let z = 0;
      let weighted = 0;
      for (const [count, frequency] of hist) {
        const term = frequency * Math.exp(-s * count);
        z += term;
        weighted += count * term;
      }
      logUpper += n * Math.log(z / size);
      derivative -= n * weighted / z;
    }
    return {logUpper, derivative};
  }
  assert(evaluate(0).derivative < 0);
  let lo = 0;
  let hi = 8;
  while (evaluate(hi).derivative <= 0) hi *= 2;
  for (let k = 0; k < 85; k++) {
    const s = (lo + hi) / 2;
    if (evaluate(s).derivative < 0) lo = s;
    else hi = s;
  }
  const s = (lo + hi) / 2;
  return {s, log10UpperBound: evaluate(s).logUpper / Math.LN10};
}

/**
 * Exact inverse positive on a complete native-English original-shaped plant.
 * Every non-page-initial position has a potentially different secret key.
 * @param {Array<Array<{value:number,page:number}>>} words
 * @param {Map<number,number[][]>} byLength
 * @param {number[]} predictor
 */
function plant(words, byLength, predictor) {
  const plain = [];
  const pages = [];
  words.forEach((word, index) => {
    const pool = byLength.get(word.length);
    const chosen = pool[(index * 1337 + 11) % pool.length];
    word.forEach((slot, j) => {
      pages.push(slot.page);
      plain.push(chosen[j]);
    });
  });
  assert.equal(plain.length, 12956);
  const cipher = [];
  const decoded = [];
  let withinPageRepeats = 0;
  for (let i = 0; i < plain.length; i++) {
    const pageStart = i === 0 || pages[i] !== pages[i - 1];
    if (pageStart) {
      cipher[i] = mod29(plain[i] + 7 + 11 * pages[i]);
      decoded[i] = mod29(cipher[i] - 7 - 11 * pages[i]);
    } else {
      const k = 1 + (17 * i + 9) % 28;
      cipher[i] = mod29(
        cipher[i - 1] + k * mod29(plain[i] - predictor[plain[i - 1]])
      );
      decoded[i] = mod29(
        predictor[decoded[i - 1]] +
        inv29(k) * mod29(cipher[i] - cipher[i - 1])
      );
      assert.equal(
        cipher[i] === cipher[i - 1],
        plain[i] === predictor[plain[i - 1]]
      );
      if (cipher[i] === cipher[i - 1]) withinPageRepeats++;
    }
    assert.equal(decoded[i], plain[i]);
  }
  assert.deepEqual(decoded, plain);
  return {runes: plain.length, pageStarts: 55, exactRoundTrip: true,
    independentlyVaryingNonzeroKeys: true, withinPageRepeats};
}


/**
 * Complete, key-independent exclusion gate for the entire GF29 power-map
 * family m(x)=x^e, 1 <= e <= 28, including every possible unknown e.
 * @param {Array<Array<{value:number,page:number}>>} words
 * @param {Array<{name:string,byLength:Map<number,number[][]>}>} controls
 * @param {{groups:Array<{length:number,eligible:boolean[],n:number}>,actualEqualPairs:number}} layout
 */
function fullPowerFamily(words, controls, layout) {
  const powers = [];
  let mostPermissive = {exponent: 0, source: '', log10UpperBound: -Infinity};
  for (let exponent = 1; exponent <= 28; exponent++) {
    const predictor = Array.from({length: 29},
      (_, index) => modPow(index, exponent));
    const sources = [];
    for (const reference of controls) {
      let expectedCount = 0;
      const strata = [];
      for (const group of layout.groups) {
        const pool = reference.byLength.get(group.length);
        assert(pool && pool.length);
        let sum = 0;
        const hist = new Map();
        for (const candidate of pool) {
          const count = predictorCount(candidate, predictor, group.eligible);
          sum += count;
          hist.set(count, (hist.get(count) || 0) + 1);
        }
        expectedCount += group.n * sum / pool.length;
        strata.push({n: group.n, hist: [...hist], size: pool.length});
      }
      const exactBound = chernoff(strata, layout.actualEqualPairs);
      const result = {source: reference.name,
        expectedCount, log10UpperBound: exactBound.log10UpperBound};
      sources.push(result);
      if (result.log10UpperBound > mostPermissive.log10UpperBound) {
        mostPermissive = {exponent, ...result};
      }
    }
    const control = plant(words, controls[0].byLength, predictor);
    assert.equal(control.exactRoundTrip, true);
    powers.push({exponent, sources, nativeRoundtripRunes: control.runes});
  }
  assert.equal(powers.length, 28);
  assert.equal(mostPermissive.exponent, 21);
  assert(mostPermissive.source.includes('gibran_prophet_58585'));
  assert(Math.abs(mostPermissive.expectedCount - 134.490219) < 0.001);
  assert(Math.abs(mostPermissive.log10UpperBound - (-10.7315)) < 0.0001);
  // Even after allowing an investigator to select any of all 28 exponents,
  // union bound under each independently fixed literary source.
  const unionLog10UpperBound = Math.log10(28) + mostPermissive.log10UpperBound;
  assert(unionLog10UpperBound < -9.28);
  return {exponents: powers.length, sources: controls.length,
    mostPermissive, unionLog10UpperBound, powers};
}

/** @returns {object} */
function run() {
  const words = originalWords();
  const layout = layoutGroups(words);
  const mappings = {
    gpPrimeMod29: corpus.prime.map(x => x % 29),
    gpTotientMod29: corpus.prime.map(x => mod29(x - 1)),
    gpCube: Array.from({length: 29}, (_, i) => modPow(i, 3)),
    gpPower27: Array.from({length: 29}, (_, i) => modPow(i, 27)),
    dhAffine8_19: Array.from({length: 29}, (_, i) => mod29(8 * i + 19))
  };
  const sourceNames = [
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  const controls = sourceNames.map(name => {
    const nativeWords = (read(name).match(/[A-Za-z]+/g) || []).map(encode);
    const byLength = new Map();
    for (const word of nativeWords) {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(word);
    }
    return {name, words: nativeWords.length, byLength};
  });
  assert.deepEqual(controls.map(x => x.words), [55407, 15733, 77932]);
  const textblob = read('resources/control/english_wordfreq_textblob.txt');
  const long12 = [];
  for (const line of textblob.split(/\r?\n/u)) {
    if (!/^[a-z]+ \d+$/u.test(line)) continue;
    const original = line.split(' ')[0];
    try {
      const a = encode(original);
      if (a.length === 12) long12.push({original, a});
    } catch {
      // The historical wordlist includes isolated Q; no GP rune encodes Q.
    }
  }
  assert.equal(long12.length, 890);
  const special = [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18];
  const unusual = words.filter(word =>
    word[0].page === 27 &&
    word.length === special.length &&
    word.every((r, i) => r.value === special[i])
  );
  assert.equal(unusual.length, 1);
  const p27 = unusual[0].map(x => x.value);
  const full = Array(11).fill(true);
  const originalP27Mask = [];
  for (let j = 1; j < p27.length; j++) {
    if (p27[j] === p27[j - 1]) originalP27Mask.push(j);
  }
  assert.deepEqual(originalP27Mask, [5, 11]);
  const modelResults = [];
  const expectedMeans = {
    gpPrimeMod29: [425.08996547, 401.75982081, 413.60970478],
    gpTotientMod29: [452.32015314, 440.60870996, 474.31731393],
    gpCube: [153.88496832, 183.86357267, 195.77310473],
    gpPower27: [185.78694290, 146.38378378, 159.12403553],
    dhAffine8_19: [129.71469755, 103.84476920, 92.58482571]
  };
  const expectedBounds = {
    gpPrimeMod29: [-111.43978314, -105.66954871, -110.22219470],
    gpTotientMod29: [-123.73754595, -122.53132195, -137.49391481],
    gpCube: [-15.22199931, -24.20933686, -26.63004713],
    gpPower27: [-24.65431829, -13.85272761, -17.85079106],
    dhAffine8_19: [-9.63115481, -4.19460943, -2.38071210]
  };
  for (const [name, predictor] of Object.entries(mappings)) {
    assert.equal(predictor.length, 29);
    assert(predictor.every(x => Number.isInteger(x) && x >= 0 && x < 29));
    const p27Matches = long12.filter(entry => {
      const mask = [];
      for (let j = 1; j < entry.a.length; j++) {
        if (entry.a[j] === predictor[entry.a[j - 1]]) mask.push(j);
      }
      return mask.join(',') === originalP27Mask.join(',');
    });
    assert.equal(p27Matches.length, 0);
    const results = [];
    for (let j = 0; j < controls.length; j++) {
      const ref = controls[j];
      let expectation = 0;
      let variance = 0;
      const strata = [];
      for (const g of layout.groups) {
        const pool = ref.byLength.get(g.length);
        assert(pool && pool.length);
        const hist = new Map();
        let s1 = 0;
        let s2 = 0;
        for (const word of pool) {
          const count = predictorCount(word, predictor, g.eligible);
          hist.set(count, (hist.get(count) || 0) + 1);
          s1 += count;
          s2 += count * count;
        }
        expectation += g.n * s1 / pool.length;
        variance += g.n * (s2 / pool.length - (s1 / pool.length) ** 2);
        strata.push({n: g.n, hist: [...hist], size: pool.length});
      }
      const bound = chernoff(strata, layout.actualEqualPairs);
      assert(Math.abs(expectation - expectedMeans[name][j]) < 0.000001);
      assert(Math.abs(bound.log10UpperBound - expectedBounds[name][j]) < 0.000001);
      results.push({source: ref.name, referenceWords: ref.words,
        expectation, sd: Math.sqrt(variance), ...bound});
    }
    const nativePositive = plant(words, controls[0].byLength, predictor);
    modelResults.push({name, mapping: predictor, originalP27Mask,
      originalP27NativeLexiconCompatibleTypes: p27Matches.length,
      nativeGP12Types: long12.length, controls: results, nativePositive});
  }
  return {
    original: {pages: 55, runes: 12956, words: words.length,
      eligibleWithinWordPairs: layout.withinWordPairs,
      ciphertextWithinWordEqualAdjacentPairs: layout.actualEqualPairs,
      sourceShapes: layout.groups.length},
    assumption: 'Native GP29 English; manuscript word and page boundaries retained.',
    invariant: 'Within one page: C[i]==C[i-1] iff P[i]==predictor[P[i-1]]',
    family: 'All 28 nonzero GF29 multipliers allowed independently at every position',
    models: modelResults,
    allPowerMapFamily: fullPowerFamily(words, controls, layout),
    recoveredUnknownPlaintext: false
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, chernoff, predictorCount, plant, fullPowerFamily};
