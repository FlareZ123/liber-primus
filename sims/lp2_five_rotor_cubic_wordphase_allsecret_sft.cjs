'use strict';

/**
 * Agent27 / Director #2231. An independently 2013-era DH-cube-motivated,
 * five-word-phase, nonstationary reversible GP29 key-state family.
 *
 * Objective: recover five unknown initial secret rotor states on genuine
 * GP-native word-length-matched prose, then attempt ORIGINAL pp40..53 with
 * p40..44 as key-only training and p45..53 untouched.
 *
 * This operation is a hypothesis. Neither five independent GP29 rotor
 * states nor a word-indexed cubic update is authenticated by Cicada.
 *
 * SFT Windows 11: node sims/lp2_five_rotor_cubic_wordphase_allsecret_sft.cjs
 * No writes, packages, external network, or hidden dependent files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt').split('%');
const glyph = new Map(gp.runes.map((s, i) => [s, i]));

/** @returns {number[][]} */
function chapterWords() {
  const original = Array.from({length: 14}, (_, i) => i + 40)
    .filter((p) => p !== 50).map((p) => transcript[p > 50 ? p - 1 : p])
    .join('%');
  /** @type {number[][]} */
  const out = [];
  /** @type {number[]} */
  let word = [];
  for (const c of original) {
    const v = glyph.get(c);
    if (v !== undefined) word.push(v);
    else if ('-.$&§0123456789'.includes(c) && word.length) {
      out.push(word);
      word = [];
    }
  }
  if (word.length) out.push(word);
  const exact = gp.pages.slice(40, 54).flatMap((p) => p.indices);
  assert.equal(exact.length, 3008);
  assert.equal(out.length, 669);
  assert.deepEqual(out.flat(), exact,
    'All original runes, red title/footer and cross-page words must match');
  return out;
}
const originalWords = chapterWords();
const original = originalWords.flat();
const sites = originalWords.flatMap((word) =>
  word.map((v, i) => ({phase: i % 5, length: word.length, index: i})));
assert.equal(sites.length, original.length);
const phaseSizes = Array.from({length: 5}, (_, p) =>
  sites.filter((s) => s.phase === p).length);
assert.deepEqual(phaseSizes, [866, 792, 641, 428, 281]);
const collisions = original.flatMap((v, i) =>
  i > 0 && v === original[i - 1] ? [i] : []);
assert.equal(collisions.length, 18);
const prefixRunes = gp.pages.slice(40, 45)
  .reduce((s, p) => s + p.indices.length, 0);
assert.equal(prefixRunes, 1323);

/** @param {number} x @returns {number} */
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const h = new Uint32Array(29);
  for (const v of values) h[v]++;
  let pairs = 0;
  for (const n of h) pairs += n * (n - 1);
  return pairs / (values.length * (values.length - 1));
}

/**
 * 5 independently evolving states selected by position modulo5 IN WORD.
 * Dec: P[i]=C[i]-K[phase]; K[phase]<-(K[phase]+C[i])^3 mod29.
 * Every ciphertext input updates exactly one state; no resets at page
 * turns, runeless p50, punctuation, or word boundaries.
 * @param {number[]} source
 * @param {number[]} initial
 * @param {boolean} forward
 * @returns {number[]}
 */
function transform(source, initial, forward) {
  assert.equal(source.length, sites.length);
  assert.equal(initial.length, 5);
  const state = initial.slice();
  const out = [];
  for (let i = 0; i < source.length; i++) {
    const phase = sites[i].phase;
    const c = forward ? mod(source[i] + state[phase]) : source[i];
    out.push(forward ? c : mod(c - state[phase]));
    state[phase] = mod((state[phase] + c) ** 3);
  }
  return out;
}
const translit = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} raw @returns {number[][]} */
function nativeWords(raw) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    const runes = [];
    for (let j = 0; j < word.length;) {
      if (word.startsWith('ING', j)) {
        runes.push(21);
        j += 3;
      } else if (word.startsWith('IO', j)) {
        runes.push(27);
        j += 2;
      } else {
        const t = translit.find((s) => word.startsWith(s.s, j));
        assert(t, 'Source-native GP word: ' + word);
        runes.push(t.i);
        j += t.s.length;
      }
    }
    out.push(runes);
  }
  return out;
}
const controls = [
  {name: 'Gibran', file: 'resources/control/gibran_prophet_58585.txt'},
  {name: 'Shakespeare', file: 'resources/control/shakespeare_first300k.txt'},
  {name: 'Emerson', file: 'resources/control/emerson_essays_2944.txt'}
];
const pools = controls.map(({file}) => {
  /** @type {number[][][]} */
  const result = Array.from({length: 15}, () => []);
  for (const word of nativeWords(read(file)))
    if (word.length <= 14) result[word.length].push(word);
  for (const word of originalWords)
    assert(result[word.length].length, 'Native word length missing: ' + file);
  return result;
});
// Gibran+Emerson ONLY are used for key learning. The Shakespeare plant
// is a genuinely disjoint archived plaintext source.
const hist = Array.from({length: 15}, () =>
  Array.from({length: 14}, () => Array(29).fill(0)));
for (const id of [0, 2])
  for (let length = 1; length <= 14; length++)
    for (const word of pools[id][length])
      for (let j = 0; j < length; j++)
        hist[length][j][word[j]]++;
const logP = hist.map((positions) => positions.map((arr) => {
  const den = arr.reduce((a, b) => a + b, 0) + 0.75 * 29;
  return arr.map((n) => Math.log((n + 0.75) / den));
}));

/**
 * The phase states are mutually independent given C, so fit each of
 * the 29 unknown starting seeds independently. This enumerates all
 * 29^5 secret combinations without a combinatorial 20M search.
 *
 * @param {number[]} ciphertext
 * @param {number} n
 * @returns {{seed:number,score:number}[][]}
 */
function rankings(ciphertext, n) {
  const ranks = [];
  for (let phase = 0; phase < 5; phase++) {
    const list = [];
    for (let seed = 0; seed < 29; seed++) {
      let state = seed, score = 0;
      for (let i = 0; i < n; i++) {
        if (sites[i].phase !== phase) continue;
        const c = ciphertext[i], p = mod(c - state), s = sites[i];
        score += logP[s.length][s.index][p];
        state = mod((state + c) ** 3);
      }
      list.push({seed, score});
    }
    list.sort((a, b) => b.score - a.score);
    ranks.push(list);
  }
  return ranks;
}
/**
 * Every exact secret seed affects the nonlinear orbit, but all resulting
 * phase collision counts can still be exhaustively maximized.
 * Even any unknown secret alphabet bijection cannot change these values.
 * @param {number[]} ciphertext
 * @returns {{phase:number,n:number,maxIoC:number,seed:number}[]}
 */
function phaseOracle(ciphertext) {
  return phaseSizes.map((n, phase) => {
    let maxIoC = -1, seed = -1;
    for (let k = 0; k < 29; k++) {
      let state = k, output = [];
      for (let i = 0; i < ciphertext.length; i++) {
        if (sites[i].phase !== phase) continue;
        const c = ciphertext[i];
        output.push(mod(c - state));
        state = mod((state + c) ** 3);
      }
      const value = ioc(output);
      if (value > maxIoC) { maxIoC = value; seed = k; }
    }
    return {phase, n, maxIoC, seed};
  });
}
const originalOracle = phaseOracle(original);
const expectedOracle = [
  [0.03533353802613838, 4],
  [0.03513325415980283, 16],
  [0.03529641185647426, 18],
  [0.03553371708726389, 11],
  [0.03723945094051856, 14]
];
for (let i = 0; i < 5; i++) {
  assert(Math.abs(originalOracle[i].maxIoC - expectedOracle[i][0]) < 1e-12);
  assert.equal(originalOracle[i].seed, expectedOracle[i][1]);
}

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/**
 * Sample real independently authored GP English words of EXACT original
 * printed lengths; preserves the true floral 669-word geometry.
 * @param {number} id
 * @param {() => number} rng
 * @returns {number[]}
 */
function nativePlant(id, rng) {
  return originalWords.flatMap((word) => {
    const options = pools[id][word.length];
    return options[rng() % options.length];
  });
}
/** @param {number[]} values @returns {number[]} */
const phaseIoCs = (values) => phaseSizes.map((_, phase) =>
  ioc(values.filter((v, i) => sites[i].phase === phase)));

// A cryptographically honest positive requires recovering the UNKNOWN
// five-key vector using 1323 ciphertext runes and predicting 1685 withheld
// glyphs from Shakespeare NOT used to fit the native language profile.
const trueSeeds = [13, 5, 20, 0, 22];
const genuineNative = nativePlant(1, random(0x3301));
const plantedCipher = transform(genuineNative, trueSeeds, true);
const plantedRanks = rankings(plantedCipher, prefixRunes);
const recovered = plantedRanks.map((list) => list[0].seed);
assert.deepEqual(recovered, trueSeeds);
assert.deepEqual(transform(plantedCipher, recovered, false), genuineNative);
assert.deepEqual(transform(transform(original, recovered, false),
  recovered, true), original);
assert.equal(genuineNative.length, 3008);

// Entire actual original, with p45..53 LOCKED before key ranking.
const sourceRanks = rankings(original, prefixRunes);
const originalSeeds = sourceRanks.map((list) => list[0].seed);
assert.deepEqual(originalSeeds, [27, 22, 9, 4, 19]);
const candidate = transform(original, originalSeeds, false);
assert.deepEqual(transform(candidate, originalSeeds, true), original);
const candidateTrainIoC = ioc(candidate.slice(0, prefixRunes));
const candidateHeldIoC = ioc(candidate.slice(prefixRunes));
assert(Math.abs(candidateTrainIoC - 0.03451674837021714) < 1e-12);
assert(Math.abs(candidateHeldIoC - 0.03434101369496113) < 1e-12);

// Strong key-independent source-native necessary condition. Compare 80
// deterministic complete English plants EACH from three actual sources.
// No source reference shares plaintext with the original LP2.
const rngControl = random(0x33013301);
const sourceControl = controls.map((spec, id) => {
  const min = Array(5).fill(Infinity);
  for (let sample = 0; sample < 80; sample++) {
    const plant = nativePlant(id, rngControl), phase = phaseIoCs(plant);
    for (let p = 0; p < 5; p++) min[p] = Math.min(min[p], phase[p]);
  }
  for (let p = 0; p < 5; p++)
    assert(min[p] > originalOracle[p].maxIoC,
      'All-secret rotor must fail source-native phase ' + p);
  return {name: spec.name, samples: 80, minimumNativePhaseIoC: min};
});

// Language-model winner's curse null: freeze the TRUE original locations
// of ALL 18 adjacent repeats and draw the remaining bytes uniformly from
// the other 28 symbols. This gives a closer null than a uniform OTP and
// retains original observed immediate-repeat positions without fitted
// original GP rune values. Fit all five secret seeds on each synthetic
// ciphertext, then score the untouched holdout.
const nullRng = random(0x13ca31);
const repeatSites = new Set(collisions);
const nullScores = [], nullHold = [];
for (let t = 0; t < 100; t++) {
  const fake = [nullRng() % 29];
  for (let i = 1; i < original.length; i++) {
    const previous = fake[i - 1];
    const next = nullRng() % 28;
    fake.push(repeatSites.has(i) ? previous
      : next >= previous ? next + 1 : next);
  }
  const r = rankings(fake, prefixRunes);
  const seeds = r.map((list) => list[0].seed);
  nullScores.push(r.reduce((sum, list) => sum + list[0].score, 0));
  nullHold.push(ioc(transform(fake, seeds, false).slice(prefixRunes)));
}
const originalScore = sourceRanks.reduce((sum, list) => sum + list[0].score, 0);
console.log(JSON.stringify({
  hypothesis: 'five independent changing GF29 cubic state rotors, within-word j mod5, ciphertext-forced',
  original: {runes: original.length, completeWords: originalWords.length,
    phaseSizes, training: prefixRunes, withheld: original.length - prefixRunes,
    originalImmediateRepeatPositions: collisions.length,
    allSecretPhaseIoC: originalOracle,
    trainedSeedVector: originalSeeds, trainedLogLikelihood: originalScore,
    trainedIoC: candidateTrainIoC, withheldIoC: candidateHeldIoC,
    withheldFirst60GP: candidate.slice(prefixRunes, prefixRunes + 60)
      .map((v) => gp.translit[v]).join('-')},
  seededNativePositive: {trueSeeds, recovered,
    wholeRecovered: original.length, withheldRecovered: original.length - prefixRunes,
    nativeWholeIoC: ioc(genuineNative),
    seedRankingMargin: plantedRanks.map((r) => r[0].score - r[1].score)},
  genuineEnglishControls: sourceControl,
  antiRepeatNull: {trials: nullScores.length, winnerScoresAtLeastOriginal:
      nullScores.filter((x) => x >= originalScore).length,
    meanWinnerScore: nullScores.reduce((a, b) => a + b, 0) / nullScores.length,
    minWinnerScore: Math.min(...nullScores),
    maxWinnerScore: Math.max(...nullScores),
    meanWithheldIoC: nullHold.reduce((a, b) => a + b, 0) / nullHold.length},
  decision: '5 independent GP29 secret starting states (29^5 keys), all page-carry continuous. Original cannot recover native GP English.'
}, null, 2));
console.log('PASS: exact original 3008, 669 words and 18 repeats; 145 state orbits; blind native cross-source key recovery and 1685-rune positive; 240 matched-source controls; null 100.');
