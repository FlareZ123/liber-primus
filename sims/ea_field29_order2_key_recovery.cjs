'use strict';

/**
 * Original-LP2 candidate plaintext inversion of an EA-transparent 28-step
 * F29 difference code with a homogeneous second-order linear key recurrence.
 * This is an exhaustive 28^4 fit of a short key/state class, followed by a
 * frozen untouched original-ciphertext tail. It does not assume that LP2
 * actually uses the cipher family.
 *
 * Native control plants use independently solved LP1 text, not the scored
 * Shakespeare corpus. Run with Node22:
 * node sims/ea_field29_order2_key_recovery.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encode } = require('./grid_keyskip_viterbi.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);
const M = 29, Q = 28, TRAIN_END = 350, WINDOW = 729;
const mod = (x, n) => (x % n + n) % n;

const exp = Array(Q).fill(0);
const log = new Int8Array(M).fill(-1);
let v = 1;
for (let i = 0; i < Q; i++) {
  assert.equal(log[v], -1);
  exp[i] = v;
  log[v] = i;
  v = v * 15 % M;
}
assert.equal(v, 1);
assert.equal(log[0], -1);
assert.equal(exp[2], 22);

/** @param {number[]} cipher GP indices */
function toRanks(cipher) {
  const ranks = [-1];
  for (let i = 1; i < cipher.length; i++) {
    ranks.push(log[mod(cipher[i] - cipher[i - 1], M)]);
  }
  return ranks;
}

/** @param {number[]} ranks original log-step digits including -1 at zero */
function observations(ranks) {
  const all = ranks.slice(1);
  const nonzero = all.filter(x => x >= 0);
  const train = ranks.slice(1, TRAIN_END).filter(x => x >= 0).length;
  return [
    { clock: 'all-steps', data: all, cutoff: TRAIN_END - 1 },
    { clock: 'nonzero-only', data: nonzero, cutoff: train },
  ];
}

/** @returns {number[]} Native 28-rune log probabilities. */
function language() {
  const gp = encode(read('resources/control/shakespeare_first300k.txt'));
  assert(gp.length > 140000, 'source GP encoder must provide training distribution');
  const counts = new Float64Array(Q).fill(0.5);
  for (let i = 0; i < 140000; i++) if (gp[i] < Q) counts[gp[i]]++;
  const sum = counts.reduce((a, b) => a + b, 0);
  return Array.from(counts, n => Math.log(n * Q / sum));
}

/**
 * Exact inverse for every seed0, seed1, a, b in Z28, with original
 * observations containing transparent (X=-1) EA positions.
 * @param {{clock:string,data:number[],cutoff:number}[]} views
 * @param {number[]} likelihood
 */
function fit(views, likelihood) {
  let best = { train: -Infinity };
  for (const view of views) {
    const data = view.data;
    const cut = view.cutoff;
    for (let a = 0; a < Q; a++) for (let b = 0; b < Q; b++) {
      for (let seed0 = 0; seed0 < Q; seed0++) for (let seed1 = 0; seed1 < Q; seed1++) {
        let score = 0, prev2 = seed0, prev1 = seed1;
        for (let j = 0; j < cut; j++) {
          let key;
          if (j === 0) key = seed0;
          else if (j === 1) key = seed1;
          else {
            key = (a * prev1 + b * prev2) % Q;
            prev2 = prev1;
            prev1 = key;
          }
          const digit = data[j];
          if (digit >= 0) score += likelihood[mod(digit - key, Q)];
        }
        if (score > best.train) {
          best = { train: score, a, b, seed0, seed1, clock: view.clock };
        }
      }
    }
  }
  const chosen = views.find(v => v.clock === best.clock);
  const decoded = decode(chosen.data, best);
  const knownTraining = chosen.data.slice(0, chosen.cutoff).filter(x => x >= 0).length;
  const knownHoldout = chosen.data.slice(chosen.cutoff).filter(x => x >= 0).length;
  let hold = 0;
  for (let i = chosen.cutoff; i < chosen.data.length; i++) {
    if (decoded[i] >= 0) hold += likelihood[decoded[i]];
  }
  return {
    ...best,
    trainPerRune: best.train / knownTraining,
    holdPerRune: hold / knownHoldout,
    holdRuneCount: knownHoldout,
    decodedFirst60: decoded.slice(0, 60).map(x => x < 0 ? 'EA' : corpus.translit[x]),
    decodedLast80: decoded.slice(-80).map(x => x < 0 ? 'EA' : corpus.translit[x]),
  };
}

/**
 * @param {number[]} digits raw observed step digits
 * @param {{a:number,b:number,seed0:number,seed1:number}} model
 */
function decode(digits, model) {
  let prev2 = model.seed0, prev1 = model.seed1;
  const out = [];
  for (let j = 0; j < digits.length; j++) {
    let key;
    if (j === 0) key = model.seed0;
    else if (j === 1) key = model.seed1;
    else {
      key = (model.a * prev1 + model.b * prev2) % Q;
      prev2 = prev1;
      prev1 = key;
    }
    out.push(digits[j] === -1 ? -1 : mod(digits[j] - key, Q));
  }
  return out;
}

/**
 * Independently encrypt solved GP runes as a cyclic field29 difference
 * chain, with exact EA-transparent zero-step behavior.
 * @param {number[]} plain GP indices, first rune chosen as IV surrogate
 * @param {{a:number,b:number,seed0:number,seed1:number,clock:string}} model
 */
function encrypt(plain, model) {
  let prev2 = model.seed0, prev1 = model.seed1;
  let counter = 0;
  const cipher = [11];
  for (let i = 1; i < plain.length; i++) {
    const p = plain[i];
    if (p === 28) {
      cipher.push(cipher[i - 1]);
      if (model.clock === 'nonzero-only') continue;
    }
    let key;
    if (counter === 0) key = model.seed0;
    else if (counter === 1) key = model.seed1;
    else {
      key = (model.a * prev1 + model.b * prev2) % Q;
      prev2 = prev1;
      prev1 = key;
    }
    counter++;
    if (p !== 28) {
      cipher.push(mod(cipher[i - 1] + exp[(p + key) % Q], M));
    }
  }
  assert.equal(cipher.length, plain.length);
  return cipher;
}

/** Source-independent xorshift32; all zeros are retained at original sites. */
function permute(ranks, random) {
  const data = ranks.filter(x => x >= 0);
  for (let i = data.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [data[i], data[j]] = [data[j], data[i]];
  }
  let k = 0;
  return ranks.map(x => x < 0 ? -1 : data[k++]);
}

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}


/**
 * Full 28-way alphabet-permutation-invariant key search. A genuine GP-English
 * source must have elevated coincidence even if its GP symbols are arbitrarily
 * permuted. Fit candidate key on independent early section runes only.
 * @param {{clock:string,data:number[],cutoff:number}[]} views
 */
function fitPermutationInvariant(views) {
  let bestNumerator = -1;
  let best = null;
  const hist = new Uint16Array(Q);
  for (const view of views) {
    for (let a = 0; a < Q; a++) for (let b = 0; b < Q; b++) {
      for (let seed0 = 0; seed0 < Q; seed0++) for (let seed1 = 0; seed1 < Q; seed1++) {
        hist.fill(0);
        let prev2 = seed0, prev1 = seed1;
        for (let j = 0; j < view.cutoff; j++) {
          let key;
          if (j === 0) key = seed0;
          else if (j === 1) key = seed1;
          else {
            key = (a * prev1 + b * prev2) % Q;
            prev2 = prev1;
            prev1 = key;
          }
          if (view.data[j] >= 0) hist[mod(view.data[j] - key, Q)]++;
        }
        let numerator = 0;
        for (const n of hist) numerator += n * (n - 1);
        if (numerator > bestNumerator) {
          bestNumerator = numerator;
          best = { a, b, seed0, seed1, clock: view.clock };
        }
      }
    }
  }
  assert(best);
  const view = views.find(x => x.clock === best.clock);
  const decoded = decode(view.data, best);
  hist.fill(0);
  let nTrain = 0, nHold = 0;
  for (let j = 0; j < view.cutoff; j++) {
    if (decoded[j] < 0) continue;
    nTrain++;
  }
  for (let j = view.cutoff; j < decoded.length; j++) {
    if (decoded[j] < 0) continue;
    hist[decoded[j]]++;
    nHold++;
  }
  let holdNumerator = 0;
  for (const n of hist) holdNumerator += n * (n - 1);
  return {
    ...best, trainIoC: bestNumerator / (nTrain * (nTrain - 1)),
    holdIoC: holdNumerator / (nHold * (nHold - 1)),
    trainRuneCount: nTrain, holdRuneCount: nHold,
  };
}

function main() {
  const likelihood = language();
  const target = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
  assert.equal(target.length, WINDOW);
  const originalRanks = toRanks(target);
  const observed = fit(observations(originalRanks), likelihood);
  const sourceGp = encode(read('resources/liber-primus/lp1-plaintext-reference.txt'));
  assert(sourceGp.length > WINDOW + 100);
  const sourcePlain = sourceGp.slice(100, 100 + WINDOW);
  const truth = { a: 15, b: 22, seed0: 8, seed1: 13, clock: 'nonzero-only' };
  const plantedCipher = encrypt(sourcePlain, truth);
  const synthetic = fit(observations(toRanks(plantedCipher)), likelihood);
  const recovered = ['a', 'b', 'seed0', 'seed1', 'clock'].every(k => synthetic[k] === truth[k]);
  const plantedRanks = toRanks(plantedCipher);
  const decodedDigits = decode(observations(plantedRanks)[1].data, truth);
  let draw = 0;
  const decoded = plantedRanks.slice(1).map(r => r < 0 ? 28 : decodedDigits[draw++]);
  assert.equal(draw, decodedDigits.length);
  const exact = sourcePlain.slice(1).filter((p, i) => p === decoded[i]).length;
  assert.equal(exact, WINDOW - 1, 'positive true-key cipher exactly inverts');
  assert(synthetic.holdPerRune > 0, 'blinded synthetic key search must recover high GP signal');
  const next = random(0x25ae3301);
  const nulls = [];
  for (let i = 0; i < 20; i++) nulls.push(fit(observations(permute(originalRanks, next)), likelihood).holdPerRune);
  const higher = nulls.filter(x => x >= observed.holdPerRune).length;
  const invariant = fitPermutationInvariant(observations(originalRanks));
  const scrambledPlant = sourcePlain.map(p => p === 28 ? 28 : (5 * p + 7) % Q);
  const alien = fitPermutationInvariant(observations(toRanks(encrypt(scrambledPlant, truth))));
  assert(alien.holdIoC > 0.045, 'Unknown alphabet positive must retain GP source coincidence');
  const invariantNull = [];
  const independentRng = random(0x72928351);
  for (let i = 0; i < 20; i++) {
    invariantNull.push(fitPermutationInvariant(observations(
      permute(originalRanks, independentRng))).holdIoC);
  }
  const invariantExceed = invariantNull.filter(x => x >= invariant.holdIoC).length;
  console.log('ALPHABET_INVARIANT', JSON.stringify({
    searchScope: 'same 1,229,312 second-order key/clock family, arbitrary fixed unknown 28-symbol output renaming',
    original: invariant,
    permutedGenuineSolvedGPPlant: alien,
    null: {
      n: invariantNull.length,
      mean: invariantNull.reduce((a, b) => a + b, 0) / invariantNull.length,
      countGeObserved: invariantExceed,
      addOneUpperTail: (invariantExceed + 1) / (invariantNull.length + 1),
      maximum: Math.max(...invariantNull),
    },
  }, null, 2));
  console.log(JSON.stringify({
    model: 'EA-transparent 29-rune step, F29 root15, homogeneous affine-free mod28 order2 key',
    originalRunes: target.length,
    configurations: 28 ** 4 * 2,
    actual: observed,
    positive: { truth, blind: synthetic, exactRoundTrip: exact, recoveredParameters: recovered },
    null: {
      samples: nulls.length,
      mean: nulls.reduce((x, y) => x + y, 0) / nulls.length,
      nullAtLeastActual: higher,
      upperTail: (higher + 1) / (nulls.length + 1),
      maximum: Math.max(...nulls),
    },
    status: 'Inversion diagnostic only: declare recovered LP2 plaintext only with independent readable original continuation',
  }, null, 2));
}
if (require.main === module) main();
module.exports = { toRanks, observations, fit, decode, encrypt };
