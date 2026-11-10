"use strict";
/**
 * Source-selected 3^8 LP2 prefix: recover additive GF29 ternary-coordinate
 * coefficients independently by grouping ciphertext into ternary triples.
 * A complete secret-key Shakespeare plant must invert exactly.
 * Usage: node sims/lp2_ternary_digit_affine_key_inverse.cjs
 * Node 22, CommonJS, built-in dependencies, no filesystem writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const all = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const N = 3 ** 8;
assert.equal(all.length, 12956);
assert.deepEqual(all.slice(6555, 6561), all.slice(-6));
const original = all.slice(0, N);
const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const mod = x => (x % 29 + 29) % 29;

/** @param {string} source @returns {number[]} */
function gp(source) {
  const clean = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(t => word.startsWith(t.token, i));
      assert(found, "No GP spelling for " + word.slice(i));
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}
function sourceBody(source) {
  return source.split(/\r?\n/u).filter(line => {
    const v = line.trim();
    return !v.startsWith("#") && !v.startsWith("[") &&
      !/^[0-9a-f]{25,}$/iu.test(v);
  }).join(" ");
}
const reference = gp(sourceBody(read("resources/liber-primus/lp1-plaintext-reference.txt")));
assert.equal(reference.length, 3248);
const count = new Uint32Array(29);
for (const v of reference) count[v]++;
const probability = Array.from(count, n => (n + 0.5) / (reference.length + 14.5));
const logProb = probability.map(Math.log);
const tripleLog = Array.from({length:29}, () => new Float64Array(29));
for (let u = 0; u < 29; u++)
for (let v = 0; v < 29; v++) {
  let mass = 0;
  for (let z = 0; z < 29; z++)
    mass += probability[z] * probability[(z + u) % 29] *
      probability[(z + v) % 29];
  tripleLog[u][v] = Math.log(mass);
}
const digit = Array.from({length:8}, (_, j) =>
  Uint8Array.from(original.map((_, i) => Math.floor(i / (3 ** j)) % 3)));

/**
 * Independent coefficient MLE: triple differences eliminate the other seven
 * coordinate keys and the constant exactly, using an iid-GP source prior.
 * @param {number[]} cipher
 * @returns {{keys:number[],gaps:number[],phase:number,score:number,baseline:number,plaintext:number[]}}
 */
function invert(cipher) {
  assert.equal(cipher.length, N);
  const keys = [], gaps = [];
  for (let j = 0; j < 8; j++) {
    const step = 3 ** j, width = 3 * step;
    const histogram = Array.from({length:29}, () => new Uint32Array(29));
    for (let start = 0; start < N; start += width)
      for (let t = 0; t < step; t++) {
        const u = mod(cipher[start + step + t] - cipher[start + t]);
        const v = mod(cipher[start + 2 * step + t] - cipher[start + t]);
        histogram[u][v]++;
      }
    const candidates = [];
    for (let key = 0; key < 29; key++) {
      let likelihood = 0;
      for (let u = 0; u < 29; u++)
        for (let v = 0; v < 29; v++)
          likelihood += histogram[u][v] *
            tripleLog[mod(u - key)][mod(v - 2 * key)];
      candidates.push({key, likelihood});
    }
    candidates.sort((a, b) => b.likelihood - a.likelihood);
    keys.push(candidates[0].key);
    gaps.push(candidates[0].likelihood - candidates[1].likelihood);
  }
  let baseline = 0;
  for (const r of cipher) baseline += logProb[r];
  let score = -Infinity, phase = -1;
  for (let b = 0; b < 29; b++) {
    let value = 0;
    for (let i = 0; i < N; i++) {
      let p = cipher[i] - b;
      for (let j = 0; j < 8; j++) p -= keys[j] * digit[j][i];
      value += logProb[mod(p)];
    }
    if (value > score) { score = value; phase = b; }
  }
  const plaintext = cipher.map((r, i) => {
    let v = r - phase;
    for (let j = 0; j < 8; j++) v -= keys[j] * digit[j][i];
    return mod(v);
  });
  return {keys, gaps, phase, score, baseline, plaintext};
}
/** @param {number[]} plaintext @param {number[]} keys @param {number} phase */
function encipher(plaintext, keys, phase) {
  return plaintext.map((r, i) => {
    let v = r + phase;
    for (let j = 0; j < 8; j++) v += keys[j] * digit[j][i];
    return mod(v);
  });
}
function random(seed) {
  let x = seed >>> 0;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0;};
}
const secret = [15, 22, 5, 7, 13, 3, 0, 27], secretPhase = 8;
const entireShakespeare = gp(read("resources/control/shakespeare_first300k.txt"))
  .slice(0, all.length);
assert.equal(entireShakespeare.length, 12956);
const shakespeare = entireShakespeare.slice(0, N);
assert.equal(shakespeare.length, N);
const plantedCipher = encipher(shakespeare, secret, secretPhase);
const plant = invert(plantedCipher);
assert.deepEqual(plant.keys, secret);
assert.equal(plant.phase, secretPhase);
assert.deepEqual(plant.plaintext, shakespeare);
assert.deepEqual(encipher(plant.plaintext, plant.keys, plant.phase), plantedCipher);
const source = invert(original);
assert.deepEqual(encipher(source.plaintext, source.keys, source.phase), original);

const rng = random(33011553), controls = [], TRIALS = 40;
for (let run = 0; run < TRIALS; run++) {
  const shuffled = original.slice();
  for (let i = N - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = invert(shuffled);
  controls.push(result.score - result.baseline);
}
const sourceGain = source.score - source.baseline;
const more = controls.filter(gain => gain >= sourceGain).length;
assert.equal(more, 21);

/**
 * Full additive separable model:
 * K(i) = b + sum_j g_j[d_j(i)], g_j(0)=0,
 * with BOTH g_j(1) and g_j(2) unrestricted (16 independent coefficients).
 * The triple differences make all other g_k cancel before likelihood fitting.
 * @param {number[]} cipher
 */
function invertFullTritTables(cipher) {
  assert.equal(cipher.length, N);
  const keys = [], gaps = [];
  for (let j = 0; j < 8; j++) {
    const step = 3 ** j, width = 3 * step;
    const histogram = Array.from({length:29}, () => new Uint32Array(29));
    for (let start = 0; start < N; start += width)
      for (let t = 0; t < step; t++) {
        const u = mod(cipher[start + step + t] - cipher[start + t]);
        const v = mod(cipher[start + 2 * step + t] - cipher[start + t]);
        histogram[u][v]++;
      }
    const candidates = [];
    for (let u = 0; u < 29; u++)
    for (let v = 0; v < 29; v++) {
      let score = 0;
      for (let x = 0; x < 29; x++)
        for (let y = 0; y < 29; y++)
          if (histogram[x][y]) score += histogram[x][y] *
            tripleLog[mod(x-u)][mod(y-v)];
      candidates.push({u, v, score});
    }
    candidates.sort((a, b) => b.score - a.score);
    keys.push([candidates[0].u, candidates[0].v]);
    gaps.push(candidates[0].score - candidates[1].score);
  }
  let score = -Infinity, phase = -1;
  for (let b = 0; b < 29; b++) {
    let value = 0;
    for (let i = 0; i < N; i++) {
      let p = cipher[i] - b;
      for (let j = 0; j < 8; j++)
        if (digit[j][i]) p -= keys[j][digit[j][i] - 1];
      value += logProb[mod(p)];
    }
    if (value > score) {score = value; phase = b;}
  }
  const plaintext = cipher.map((r, i) => {
    let v = r - phase;
    for (let j = 0; j < 8; j++)
      if (digit[j][i]) v -= keys[j][digit[j][i] - 1];
    return mod(v);
  });
  return {keys, gaps, phase, score,
    baseline:cipher.reduce((sum, r) => sum + logProb[r], 0), plaintext};
}
/** @param {number[]} plaintext @param {number[][]} tables @param {number} phase */
function encipherFullTritTables(plaintext, tables, phase) {
  return plaintext.map((r, i) => {
    let v = r + phase;
    for (let j = 0; j < 8; j++)
      if (digit[j][i]) v += tables[j][digit[j][i] - 1];
    return mod(v);
  });
}
const fullSecret = [[15,9],[22,16],[5,25],[7,3],
  [13,17],[3,14],[0,24],[27,11]];
const fullCipher = encipherFullTritTables(shakespeare, fullSecret, secretPhase);
const fullPlant = invertFullTritTables(fullCipher);
assert.deepEqual(fullPlant.keys, fullSecret);
assert.equal(fullPlant.phase, secretPhase);
assert.deepEqual(fullPlant.plaintext, shakespeare);
assert.deepEqual(encipherFullTritTables(fullPlant.plaintext, fullPlant.keys,
  fullPlant.phase), fullCipher);
const fullSource = invertFullTritTables(original);
assert.deepEqual(encipherFullTritTables(fullSource.plaintext, fullSource.keys,
  fullSource.phase), original);
const fullRandom = random(0x331573), fullControls = [];
for (let run = 0; run < 20; run++) {
  const shuffled = original.slice();
  for (let i = N - 1; i > 0; i--) {
    const j = fullRandom() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = invertFullTritTables(shuffled);
  fullControls.push(result.score - result.baseline);
}
const fullGain = fullSource.score - fullSource.baseline;
const fullMore = fullControls.filter(gain => gain >= fullGain).length;
assert.equal(fullMore, 17);


/** @param {number} i @param {number[]|number[][]} keys @param {number} phase @param {boolean} full */
function globalMask(i, keys, phase, full) {
  let value = phase;
  for (let j = 0; j < 8; j++) {
    const d = Math.floor(i / (3 ** j)) % 3;
    if (full) {
      if (d) value += keys[j][d-1];
    } else value += keys[j] * d;
  }
  return mod(value);
}
/** Score the 6,395 original source runes beyond the first 3^8 key-selection block. */
function scoreTail(cipher, keys, phase, full) {
  let total = 0;
  for (let i = N; i < all.length; i++)
    total += logProb[mod(cipher[i] - globalMask(i, keys, phase, full))];
  return total / (all.length - N);
}
const rawTail = all.slice(N).reduce((s, r) => s + logProb[r], 0) /
  (all.length - N);
const affineTail = scoreTail(all, source.keys, source.phase, false);
const fullTail = scoreTail(all, fullSource.keys, fullSource.phase, true);
function positiveTail(keys, phase, full) {
  let exact = 0, total = 0;
  for (let i = N; i < all.length; i++) {
    const encoded = mod(entireShakespeare[i] + globalMask(i,
      full ? fullSecret : secret, secretPhase, full));
    const recovered = mod(encoded - globalMask(i, keys, phase, full));
    if (recovered === entireShakespeare[i]) exact++;
    total += logProb[recovered];
  }
  assert.equal(exact, all.length - N);
  return {exactRecovered:exact, meanLogLikelihood:total/(all.length-N)};
}
const affinePlantTail = positiveTail(plant.keys, plant.phase, false);
const fullPlantTail = positiveTail(fullPlant.keys, fullPlant.phase, true);

const compact = x => ({
  keys:x.keys, phase:x.phase,
  scorePerRune:x.score / N,
  rawScorePerRune:x.baseline / N,
  logLikelihoodGain:x.score - x.baseline,
  perAxisRunnerUpGaps:x.gaps
});
console.log(JSON.stringify({
  originalInput:"First 6561 of 12956 unchanged LP2 source runes",
  sourceCoordinates:"8 ternary digits, i in [0,6561)",
  model:"C(i) = P(i) + b + sum_j a[j] * floor(i/3^j)%3 (mod 29)",
  reference:"3248 GP-rune known Cicada prose, native transliteration",
  original:compact(source),
  sourceMatchedControl:{
    source:"First 6561 Shakespeare GP runes",
    planted:{keys:secret,phase:secretPhase},
    recovered:compact(plant),
    exactRecoveredRunes:N, exactReencryption:true
  },
  originalInventoryShuffle:{
    trials:TRIALS, seed:33011553,
    meanLogLikelihoodGain:controls.reduce((a,b)=>a+b,0)/TRIALS,
    minimum:Math.min(...controls), maximum:Math.max(...controls),
    nullAtLeastOriginal:more, plusOneTail:(more+1)/(TRIALS+1)
  },
  arbitraryThreeStateTritTables:{
    model:"C(i) = P(i) + b + sum_j g_j[d_j(i)] (mod29); g_j(0)=0; 16 unrestricted table values",
    original:{
      keys:fullSource.keys, phase:fullSource.phase,
      scorePerRune:fullSource.score/N,
      rawScorePerRune:fullSource.baseline/N,
      logLikelihoodGain:fullGain,
      perAxisRunnerUpGaps:fullSource.gaps
    },
    sourceMatchedShakespearePlant:{
      plantedKeys:fullSecret, plantedPhase:secretPhase,
      recoveredKeys:fullPlant.keys, recoveredPhase:fullPlant.phase,
      exactRecoveredRunes:N, exactReencryption:true,
      scorePerRune:fullPlant.score/N,
      logLikelihoodGain:fullPlant.score-fullPlant.baseline
    },
    originalInventoryShuffle:{
      trials:20, seed:0x331573,
      meanGain:fullControls.reduce((a,b)=>a+b,0)/20,
      minimum:Math.min(...fullControls), maximum:Math.max(...fullControls),
      nullAtLeastOriginal:fullMore, plusOneTail:(fullMore+1)/21
    }
  },
  heldoutOriginalBeyondFirst6561:{
    runes:all.length-N,
    keyClock:"The same eight lowest ternary digits of the global rune index, period 6561",
    rawGPMeanLogLikelihood:rawTail,
    affineWithFrozenFirstHalfKeys:affineTail,
    unrestrictedTritTablesWithFrozenFirstHalfKeys:fullTail,
    independentShakespearePlantAffine:affinePlantTail,
    independentShakespearePlantUnrestricted:fullPlantTail
  },
  status:"Both source-native conditional negatives; no unknown LP2 plaintext or key recovered"
}, null, 2));
