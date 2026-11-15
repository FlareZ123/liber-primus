'use strict';

/**
 * Signed 2013 BASE29/DH -> LP2 word-local affine six-back bridge.
 *
 * The published signed 2013 example supplies BASE29(3301) = [3,26,24],
 * DH modulus 23, generator 5, server public 8, client public 19 and
 * shared secret 2. Its server exponent is 6, since 5^6 mod 23 = 8.
 * The post-hoc candidate C[i] = 24 - 2*C[i-6] (mod 29) matches the
 * independently observed strongest 5,684-affine/lag LP2 echo.
 *
 * This code tests source-derived candidate relations against actual
 * original ciphertext under exact word-multiset + adjacent-repeat
 * constrained nulls. It does NOT decrypt the manuscript.
 *
 * Windows Node22, CommonJS. No command-line arguments or dependencies.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');

/** @param {number} b @param {number} e @param {number} n @returns {number} */
function powMod(b, e, n) {
  let v = 1;
  for (let i = 0; i < e; i++) v = (v * b) % n;
  return v;
}
assert.equal(powMod(5, 6, 23), 8);
assert.equal(powMod(5, 15, 23), 19);
assert.equal(powMod(19, 6, 23), 2);
assert.equal(powMod(8, 15, 23), 2);
assert.equal(3301 % 29, 24);
assert.equal(3 * 29 ** 2 + 26 * 29 + 24, 3301);
assert.equal((27 + 2) % 29, 0);

const input = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
const allWords = parseUnsolved(input);
const runeCount = allWords.reduce((n, w) => n + w.length, 0);
assert.equal(allWords.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(Math.max(...allWords.map(w => w.length)), 14);
const words = allWords.filter(w => w.length > 2);
assert.equal(words.length, 2365);

// Explicitly comparable source-defined numbers. A client private exponent 15,
// public 19 and modulus23 have no word-local sites because max length is14.
// Lag6, coefficient -2 and offset24 is a post-discovery conjunction, not an
// instruction actually printed by Cicada.
const lags = [2, 5, 6, 8];
const intercepts = [3, 26, 24];
const signs = [-1, 1];
const candidates = [];
for (const lag of lags) for (const intercept of intercepts)
  for (const sign of signs)
    candidates.push({lag, intercept, sign, id: candidates.length});
assert.equal(candidates.length, 24);

const target = candidates.map(({intercept, sign}) =>
  Array.from({length: 29}, (_, x) => ((intercept + sign * 2 * x) % 29 + 29) % 29));
const atLag = lags.map(lag => candidates.filter(c => c.lag === lag).map(c => c.id));

/**
 * @param {number[][]} pageWords
 * @returns {Int32Array}
 */
function matches(pageWords) {
  const out = new Int32Array(candidates.length);
  for (const word of pageWords) for (let g = 0; g < lags.length; g++) {
    const lag = lags[g];
    for (let i = lag; i < word.length; i++) {
      const x = word[i - lag], y = word[i];
      for (const id of atLag[g]) if (target[id][x] === y) out[id]++;
    }
  }
  return out;
}

const observed = Array.from(matches(words));
const selected = candidates.find(c => c.lag === 6 && c.intercept === 24 && c.sign === -1);
assert.ok(selected);
assert.equal(selected.id, 16);
assert.equal(observed[selected.id], 80);
const firstHalf = matches(allWords.slice(0, 1448))[selected.id];
const secondHalf = matches(allWords.slice(1448))[selected.id];
assert.deepEqual([firstHalf, secondHalf], [40, 40]);

// Positive pattern test with exact source triple, planting 20 independent
// six-apart affine values into a word and checking the deterministic detector.
const plant = Array.from({length: 26}, (_, j) => (j * 13 + 7) % 29);
for (let i = 6; i < plant.length; i++) plant[i] = (24 - 2 * plant[i - 6] + 58) % 29;
assert.equal(matches([plant])[selected.id], plant.length - 6);

const TRAIN = 350;
const TEST = 1200;
const SEED = 0x62012429;
const rnd = random32(SEED);
const exactAdj = words.map(adjacentEqualCount);

/** @returns {Int32Array} */
function simulatedBook() {
  const shuffled = words.map((w, i) => {
    let candidate;
    do {
      candidate = shuffledCopy(w, rnd);
    } while (adjacentEqualCount(candidate) !== exactAdj[i]);
    return candidate;
  });
  return matches(shuffled);
}

const train = Array.from({length: TRAIN}, simulatedBook);
const means = candidates.map((_, i) => train.reduce((s, x) => s + x[i], 0) / TRAIN);
const sds = candidates.map((_, i) => Math.sqrt(train.reduce(
  (s, x) => s + (x[i] - means[i]) ** 2, 0) / TRAIN));
assert.ok(sds.every(n => n > 0));
const scores = observed.map((x, i) => (x - means[i]) / sds[i]);
const bestScore = Math.max(...scores);
assert.equal(scores.indexOf(bestScore), selected.id);

let exceedBest = 0;
let exceedSelected = 0;
for (let j = 0; j < TEST; j++) {
  const sample = simulatedBook();
  const maxZ = Math.max(...Array.from(sample, (n, i) => (n - means[i]) / sds[i]));
  if (maxZ >= bestScore) exceedBest++;
  if (sample[selected.id] >= observed[selected.id]) exceedSelected++;
}
const runnerUp = candidates.map((c, i) => ({...c, observed: observed[i], z: scores[i]}))
  .sort((a,b) => b.z - a.z);
assert.equal(runnerUp[0].id, selected.id);
assert.equal(exceedBest, 0);
assert.equal(exceedSelected, 0);
console.log(JSON.stringify({
  status: 'PASS: exact source-led lag6 bridge is the strongest of 24 signed-example choices',
  historicalSource: '2013 signed BASE29 3301 -> 3QO, DH 23: g5, A8, B19, K2',
  sourceDerived: { serverPrivateExponent: 6, clientPrivateExponent: 15, lastBase29Digit: 24,
    sharedSecret: 2, proposedMap: 'C[i] = (24 - 2*C[i-6]) mod29' },
  originality: 'The source-to-lag6 coupling was identified retrospectively; no authored reuse instruction',
  input: { originalWords: 2896, originalRunes: 12956,
    wordsEligibleForLag2: words.length, sourceFamily: candidates.length },
  originalSelectedHits: observed[selected.id],
  originalEligibleLag6Sites: words.reduce((sum,w) => sum + Math.max(0, w.length-6), 0),
  independentOriginalHalves: [firstHalf,secondHalf],
  null: { trainingBooks: TRAIN, independentTestBooks: TEST, seed: '0x' + SEED.toString(16),
    conditioning: 'each word original rune multiset, length and original adjacent doublet count',
    chosenNullMean: means[selected.id], chosenNullSD: sds[selected.id],
    chosenZ: bestScore, fixedExceed: exceedSelected, familyExceed: exceedBest,
    familyCorrectedFiniteP: (exceedBest+1)/(TEST+1) },
  topThree: runnerUp.slice(0,3).map(x => ({
    lag:x.lag, intercept:x.intercept, coefficient:x.sign*2, hits:x.observed,z:x.z
  })),
  interpretation: 'source-specific signal; NOT plaintext, key selection, encryption proof, or decryption'
}, null, 2));


/**
 * The *other* p39 original red quadratic is exactly
 * G(y) = 15*(y+5)^2 = (y+g)^2/K over GP29.
 * The previously chosen signed-source Tminus(x)=-(g+K*x) has
 * G(Tminus(x)) = K*x^2. This equality also has a second, distinct
 * source-conditioned branch Tplus(x)= -g+K*x (unless x=0).
 *
 * An exact original-rune sign discriminator decides whether the
 * quadratic collision suggestion supports both natural branches or
 * only the independently known lag6 affine branch.
 */
function mod29(x) {
  return (x % 29 + 29) % 29;
}

/** @param {number} y @returns {number} */
function p39Quadratic(y) {
  return mod29(27 + 5 * y + 15 * y * y);
}
for (let x = 0; x < 29; x++) {
  assert.equal(mod29(15 * (x + 5) ** 2), p39Quadratic(x));
  assert.equal(p39Quadratic(mod29(-5 - 2 * x)), mod29(2 * x * x));
  assert.equal(p39Quadratic(mod29(-5 + 2 * x)), mod29(2 * x * x));
}
assert.equal(mod29(-5 - 2 * 8), 8);
assert.equal(mod29(-5), 24);

/** @param {number[][]} wholeWords */
function quadraticBranches(wholeWords) {
  let negative = 0, positive = 0, union = 0, overlap = 0, sites = 0;
  for (const word of wholeWords) for (let i = 6; i < word.length; i++) {
    const x = word[i - 6], y = word[i];
    const minus = y === mod29(-5 - 2 * x);
    const plus = y === mod29(-5 + 2 * x);
    negative += Number(minus);
    positive += Number(plus);
    union += Number(minus || plus);
    overlap += Number(minus && plus);
    sites++;
  }
  return {negative, positive, union, overlap, sites, asymmetry:negative-positive};
}
const quadraticObserved = quadraticBranches(allWords);
assert.deepEqual(quadraticObserved, {
  negative:80, positive:34, union:113, overlap:1, sites:1290, asymmetry:46
});
const quadraticFirstHalf = quadraticBranches(allWords.slice(0, 1448));
const quadraticLastHalf = quadraticBranches(allWords.slice(1448));
assert.deepEqual([quadraticFirstHalf.negative, quadraticFirstHalf.positive,
  quadraticLastHalf.negative, quadraticLastHalf.positive], [40,19,40,15]);

// For the explicit ± branches, construct independent positive examples
// with generated output satisfying each branch at all 20 eligible sites.
for (const sign of [-1, 1]) {
  const planted = Array.from({length:26}, (_, i) => mod29(i * 13 + 7));
  for (let i = 6; i < planted.length; i++)
    planted[i] = mod29(-5 + sign * 2 * planted[i - 6]);
  const observedPlant = quadraticBranches([planted]);
  assert.equal(sign === -1 ? observedPlant.negative : observedPlant.positive, 20);
  assert.equal(observedPlant.union, 20);
}

const quadraticSeed = 0x29ac0320;
const quadraticRng = random32(quadraticSeed);
const quadraticReplicates = 1800;
const quadraticOutcomes = [];
for (let sample = 0; sample < quadraticReplicates; sample++) {
  const surrogate = allWords.map((w) => {
    let s;
    const want = adjacentEqualCount(w);
    do s = shuffledCopy(w, quadraticRng);
    while (adjacentEqualCount(s) !== want);
    return s;
  });
  quadraticOutcomes.push(quadraticBranches(surrogate));
}
const quadraticSummaries = ['negative','positive','union','asymmetry'].map(key => {
  const vals = quadraticOutcomes.map(o => o[key]);
  const mean = vals.reduce((a,b) => a+b,0) / vals.length;
  const variance = vals.reduce((a,b)=>a+(b-mean)**2,0) / vals.length;
  const exceed = vals.filter(v=>v>=quadraticObserved[key]).length;
  return {branch:key,original:quadraticObserved[key],nullMean:mean,
    nullSD:Math.sqrt(variance),upperExceed:exceed,
    upperTailFiniteP:(exceed+1)/(vals.length+1)};
});
assert.equal(quadraticSummaries[0].upperExceed,0);
assert.equal(quadraticSummaries[2].upperExceed,0);
assert.equal(quadraticSummaries[3].upperExceed,0);
console.log(JSON.stringify({
  status:'PASS: p39 original square factor bridges two signed-DH affine branches',
  originalRedFactor:'G(X)=27+5X+15X^2=(X+5)^2/2 over GF29',
  sourceAffine:'Tminus(X)=-(5+2X)=24-2X over GF29',
  exactIdentity:'G(Tminus(X))=2X^2=G(Tplus(X)) for every GP29 X',
  original:quadraticObserved,
  originalHalves:{first:quadraticFirstHalf,last:quadraticLastHalf},
  null:{conditioning:'original whole-word multiset, length, adjacent-repeat count',
    samples:quadraticReplicates,seed:'0x'+quadraticSeed.toString(16),
    summaries:quadraticSummaries},
  implication:'Signed minus branch enriched, opposite quadratic root is not; no inverse or plaintext recovered'
},null,2));


/**
 * Source-selected lag-six *clock* discriminator.
 * Under a one-shot-per-long-word first-eligible-site mechanism, the exact
 * Tminus agreement surplus could only occur at local offset j=6. Evaluate
 * original within-word positions 6 versus 7+, with unchanged complete
 * words, original doublet counts and unchanged genuine ciphertext.
 * This distinguishes a narrow one-shot hook from a continuing state rule.
 *
 * A per-word randomization is the conditional comparator, not a generative
 * model for a cipher. The split is mechanism-selected (first legal j=6 vs
 * later legal sites), not an unbounded scan over threshold positions.
 */
/** @param {number[][]} runicWords */
function echoByLocalOffset(runicWords) {
  const counts = [0,0,0,0], sites = [0,0,0,0];
  for (const word of runicWords) {
    for (let j = 6; j < word.length; j++) {
      const group = j === 6 ? 0 : j === 7 ? 1 : j === 8 ? 2 : 3;
      sites[group]++;
      counts[group] += Number(word[j] === mod29(24 - 2*word[j-6]));
    }
  }
  return {counts, sites, late:counts[1]+counts[2]+counts[3],
    total:counts.reduce((a,b)=>a+b,0)};
}
const offsetsReal = echoByLocalOffset(allWords);
assert.deepEqual(offsetsReal, {
  counts:[33,19,12,16],sites:[559,343,187,201],late:47,total:80
});
const positionTrials = 1900, positionSeed = 0x6acc2013;
const positionRng = random32(positionSeed);
const firstDraws = [], lateDraws = [];
for (let trial = 0; trial < positionTrials; trial++) {
  const shuffledWords = allWords.map(w => {
    let result;
    const targetDoublets = adjacentEqualCount(w);
    do result = shuffledCopy(w, positionRng);
    while (adjacentEqualCount(result) !== targetDoublets);
    return result;
  });
  const sample = echoByLocalOffset(shuffledWords);
  firstDraws.push(sample.counts[0]);
  lateDraws.push(sample.late);
}
/**
 * @param {number[]} values
 * @param {number} target
 */
function boundedNull(values, target) {
  const mean = values.reduce((a,b) => a+b,0)/values.length;
  const sd = Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/values.length);
  const exceed = values.filter(n=>n>=target).length;
  return {observed:target,mean,sd,z:(target-mean)/sd,
    upperExceed:exceed,upperAddOne:(exceed+1)/(values.length+1)};
}
const firstSummary = boundedNull(firstDraws, offsetsReal.counts[0]);
const lateSummary = boundedNull(lateDraws, offsetsReal.late);
assert.equal(firstSummary.upperExceed,8);
assert.equal(lateSummary.upperExceed,0);
console.log(JSON.stringify({
  result:'PASS: signed T6 echo surplus persists after the first legal rune in each complete word',
  source: '2,896 canonical LP2 complete ciphertext words, 12,956 GP29 symbols',
  original: offsetsReal,
  null: {trials:positionTrials,seed:'0x'+positionSeed.toString(16),
    conditioning:'each original word preserves exact multiset, length and adjacent-doublet count',
    firstLegalRune: firstSummary, subsequentLegalRunes:lateSummary},
  decision:'Reject first-legal-rune-only T6 insertion in isolation; an echo generator must permit later sites. Still no decryption or site selector.'
},null,2));
