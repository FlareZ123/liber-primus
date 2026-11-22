'use strict';

/**
 * Collision-only hidden-consumption Viterbi for the source-derived 2013 audio
 * keys. The key is periodic (period 7 or 28), so the dynamic program tracks
 * only (next key phase, previous skip bit), not an unbounded skip count.
 *
 * A skip at position i is admissible only if using the skipped key symbol
 * would have emitted the previous ciphertext rune. At most one extra draw
 * is permitted per rune. This is the collision-rejection model used in the
 * repository's other keyskip experiments, specialized to a periodic key.
 *
 * Source keys:
 *   24*16^i (period 7), 24*24^i (period 7), 24*11^i (period 28),
 *   with forward/reverse direction, both signs, book/page clocks.
 *
 * A deterministic 1,200-symbol English plant validates exact recovery.
 * Twenty random cyclic-order controls per period calibrate the best source
 * score against the same number of orientations/signs/clocks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const inverse = x => {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error('non-invertible field element');
};
const lm = train(shakespeare.slice(0, 200000));
const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices?.length);
const original = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

function makeKey(seed, generator, period) {
  const key = [];
  let x = seed;
  for (let i = 0; i < period; i++) {
    key.push(x);
    x = mod(x * generator);
  }
  return key;
}

/**
 * State after processing i:
 *   phase = next key index before the optional skip at i+1;
 *   previousSkip = whether position i consumed one extra key draw.
 *
 * If the previous position skipped, the key used two positions back is
 * phase-2-previousSkip; the key used one position back is phase-1.
 */
function viterbi(cipher, key, sign, skipPenalty = 3.5) {
  const period = key.length;
  const stateCount = period * 2;
  const n = cipher.length;
  const decode = (i, keyIndex) =>
    mod(cipher[i] - sign * key[(keyIndex + period) % period]);
  const encodeState = (phase, previousSkip) => phase * 2 + previousSkip;

  let dp = new Float64Array(stateCount).fill(-Infinity);
  const trace = new Int16Array(n * stateCount).fill(-1);
  const firstPlain = decode(0, 0);
  dp[encodeState(1 % period, 0)] = lm.unigram[firstPlain];

  for (let i = 1; i < n; i++) {
    const next = new Float64Array(stateCount).fill(-Infinity);
    for (let state = 0; state < stateCount; state++) {
      const base = dp[state];
      if (!Number.isFinite(base)) continue;
      const phase = Math.floor(state / 2);
      const previousSkip = state % 2;
      const previousPlain = decode(i - 1, phase - 1);
      const previousPreviousPlain = i >= 2
        ? decode(i - 2, phase - 2 - previousSkip)
        : 0;

      for (let skip = 0; skip <= 1; skip++) {
        const plain = decode(i, phase + skip);
        if (skip && mod(plain + sign * key[phase % period]) !== cipher[i - 1]) {
          continue;
        }
        const languageScore = i === 1
          ? lm.bigram[previousPlain * 29 + plain]
          : lm.trigram[(previousPreviousPlain * 29 + previousPlain) * 29 + plain];
        const candidate = base + languageScore - skipPenalty * skip;
        const nextPhase = (phase + 1 + skip) % period;
        const nextState = encodeState(nextPhase, skip);
        if (candidate > next[nextState]) {
          next[nextState] = candidate;
          trace[i * stateCount + nextState] = state;
        }
      }
    }
    dp = next;
  }

  let bestScore = -Infinity;
  let bestState = -1;
  for (let state = 0; state < stateCount; state++) {
    if (dp[state] > bestScore) {
      bestScore = dp[state];
      bestState = state;
    }
  }
  assert.notEqual(bestState, -1);

  const plaintext = new Array(n);
  let state = bestState;
  let skips = 0;
  for (let i = n - 1; i >= 1; i--) {
    const phaseAfter = Math.floor(state / 2);
    const skipped = state % 2;
    const keyPhaseUsed = (phaseAfter - 1 + period) % period;
    plaintext[i] = decode(i, keyPhaseUsed);
    skips += skipped;
    state = trace[i * stateCount + state];
    assert.ok(state >= 0, 'missing Viterbi backpointer');
  }
  plaintext[0] = firstPlain;
  return { plaintext, score: bestScore, perRune: bestScore / n, skips };
}

function pageReset(cipherPages, key, sign) {
  const plaintext = [];
  let score = 0;
  let skips = 0;
  let length = 0;
  for (const page of cipherPages) {
    const result = viterbi(page.indices, key, sign);
    plaintext.push(...result.plaintext);
    score += result.score;
    skips += result.skips;
    length += page.indices.length;
  }
  return { plaintext, score, perRune: score / length, skips };
}

function runKey(key, sign, clock) {
  return clock === 'book'
    ? viterbi(original, key, sign)
    : pageReset(pages, key, sign);
}

function plant(plaintext, key, sign, seed = 0x3301ad42, skipProbability = 0.81) {
  let rngState = seed >>> 0;
  const random = () => {
    rngState ^= rngState << 13;
    rngState ^= rngState >>> 17;
    rngState ^= rngState << 5;
    return (rngState >>> 0) / 4294967296;
  };
  let phase = 0;
  let previousCipher = -1;
  let skips = 0;
  const ciphertext = [];
  for (const plain of plaintext) {
    let cipher = mod(plain + sign * key[phase % key.length]);
    if (previousCipher >= 0 && cipher === previousCipher && random() < skipProbability) {
      phase++;
      skips++;
      cipher = mod(plain + sign * key[phase % key.length]);
    }
    ciphertext.push(cipher);
    previousCipher = cipher;
    phase++;
  }
  return { ciphertext, skips };
}

function bestSource(keys) {
  const results = [];
  for (const item of keys) {
    for (const sign of [1, -1]) {
      for (const clock of ['book', 'page']) {
        const r = runKey(item.key, sign, clock);
        results.push({
          name: item.name,
          direction: item.direction,
          sign,
          clock,
          key: item.key,
          score: r.score,
          perRune: r.perRune,
          skips: r.skips,
          plaintextHead: r.plaintext.slice(0, 100)
            .map(x => corpus.translit[x]).join('')
        });
      }
    }
  }
  results.sort((a, b) => b.perRune - a.perRune);
  return results;
}

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
function shuffle(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function bestScoreForKeys(keys) {
  let best = -Infinity;
  for (const key of keys) {
    for (const sign of [1, -1]) {
      for (const clock of ['book', 'page']) {
        best = Math.max(best, runKey(key, sign, clock).perRune);
      }
    }
  }
  return best;
}
function summarize(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
    values: sorted
  };
}

function main() {
  // Positive control: exact recovery of a planted English stream.
  const plantPlain = encode(shakespeare.slice(205000, 225000)).slice(0, 1200);
  const plantKey = makeKey(24, 16, 7);
  const planted = plant(plantPlain, plantKey, 1);
  const recovered = viterbi(planted.ciphertext, plantKey, 1);
  const exactRecovery = recovered.plaintext.every((x, i) => x === plantPlain[i]);
  assert.equal(exactRecovery, true);
  assert.equal(recovered.skips, planted.skips);

  const sourceKeys = [
    { name: 'period7-factor16', direction: 'forward', key: makeKey(24, 16, 7) },
    { name: 'period7-factor16', direction: 'reverse', key: makeKey(24, inverse(16), 7) },
    { name: 'period7-product24', direction: 'forward', key: makeKey(24, 24, 7) },
    { name: 'period7-product24', direction: 'reverse', key: makeKey(24, inverse(24), 7) },
    { name: 'period28-primitive11', direction: 'forward', key: makeKey(24, 11, 28) },
    { name: 'period28-primitive11', direction: 'reverse', key: makeKey(24, inverse(11), 28) }
  ];
  const sourceResults = bestSource(sourceKeys);
  const source7Best = sourceResults.filter(x => x.key.length === 7)[0].perRune;
  const source28Best = sourceResults.filter(x => x.key.length === 28)[0].perRune;

  const random = xorshift(0x9e3779b9);
  const null7 = [];
  const null28 = [];
  const subgroup7 = makeKey(24, 16, 7);
  for (let trial = 0; trial < 20; trial++) {
    const base28 = [24, ...shuffle(
      Array.from({ length: 28 }, (_, i) => i + 1).filter(x => x !== 24), random
    )];
    const reverse28 = [24, ...base28.slice(1).reverse()];
    null28.push(bestScoreForKeys([base28, reverse28]));

    const base7 = [24, ...shuffle(subgroup7.filter(x => x !== 24), random)];
    const stride = s => Array.from({ length: 7 }, (_, i) => base7[(s * i) % 7]);
    null7.push(bestScoreForKeys([stride(1), stride(6), stride(4), stride(3)]));
  }

  const result = {
    source: {
      audioInteger: 1595277641,
      factors: [1259, 1031, 1229],
      residues: [12, 16, 11],
      seed: 24,
      fileId: 761,
      fileIdMod29: 7,
      keyPeriod7Factor16: makeKey(24, 16, 7),
      keyPeriod7Product24: makeKey(24, 24, 7),
      keyPeriod28Primitive11: makeKey(24, 11, 28)
    },
    languageModelSymbols: lm.symbols,
    unknownRunes: original.length,
    pages: pages.length,
    positiveControl: {
      plaintextSymbols: plantPlain.length,
      plantedSkips: planted.skips,
      recoveredSkips: recovered.skips,
      exactRecovery
    },
    sourceKeyBest: {
      period7: source7Best,
      period28: source28Best,
      bestCandidates: sourceResults.slice(0, 8)
    },
    randomPermutationNull: {
      period7: summarize(null7),
      period28: summarize(null28),
      sourcePercentile: {
        period7: null7.filter(x => x <= source7Best).length / null7.length,
        period28: null28.filter(x => x <= source28Best).length / null28.length
      }
    },
    interpretation: 'The fixed audio-derived keys are not exceptional against random cyclic orders under the collision-only model; no readable LP2 plaintext is recovered.'
  };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = { viterbi, makeKey, pageReset };
