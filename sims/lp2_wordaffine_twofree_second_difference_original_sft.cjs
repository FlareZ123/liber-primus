"use strict";
/**
 * Source-original, all-secret word-local affine-ramp impossibility test:
 * C[w,j] = P[w,j] + A[w] + B[w]*j (mod 29),
 * arbitrary unknown A[w], B[w] for every whole printed word.
 *
 * The complete SECOND DIFFERENCE Δ²C = C[j]-2C[j-1]+C[j-2]
 * is invariant under every choice of both per-word secrets.
 *
 * Run on Windows 11, Node.js 22:
 *   node sims/lp2_wordaffine_twofree_second_difference_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const idx = new Map(corpus.runes.map((r, i) => [r, i]));
const runes = s => [...s].map(c => {
  const i = idx.get(c);
  assert.notEqual(i, undefined);
  return i;
});
const unsolved = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .slice(0, 2896)
  .map(runes);
const known = solved.sections.flatMap(section =>
  (section.source_text.match(/[\u16A0-\u16FF]+/gu) || []).map(runes));
const size = words => words.reduce((s, w) => s + w.length, 0);
const mod = x => ((x % 29) + 29) % 29;
assert.equal(unsolved.length, 2896);
assert.equal(size(unsolved), 12956);
assert.equal(known.length, 740);
assert.equal(size(known), 2979);

/** @param {number[][]} words */
function secondDifferenceHistogram(words) {
  const hist = Array(29).fill(0);
  for (const word of words) {
    for (let j = 2; j < word.length; j++) {
      hist[mod(word[j] - 2 * word[j - 1] + word[j - 2])]++;
    }
  }
  return hist;
}

/** @param {number[]} first @param {number[]} second */
function chiSquareHomogeneity(first, second) {
  const totalA = first.reduce((s, v) => s + v, 0);
  const totalB = second.reduce((s, v) => s + v, 0);
  let chi = 0;
  for (let i = 0; i < 29; i++) {
    const pooled = first[i] + second[i];
    const a = pooled * totalA / (totalA + totalB);
    const b = pooled * totalB / (totalA + totalB);
    chi += (first[i] - a) ** 2 / a + (second[i] - b) ** 2 / b;
  }
  return chi;
}

function makeRandom() {
  let state = 0x3301fa31;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function lengthPools(sourceWords) {
  const pools = Array.from({length: 15}, () => []);
  for (const word of sourceWords) if (word.length < 15) pools[word.length].push(word);
  for (const word of unsolved) assert.ok(pools[word.length].length);
  return pools;
}
function lengthMatchedCycle(pools) {
  const index = Array(15).fill(0);
  return unsolved.map(word => {
    const pool = pools[word.length];
    return pool[index[word.length]++ % pool.length];
  });
}

/**
 * Original-source 2014-style GP Latin tokenization. Check exactly 95 actual
 * p57 rune values before using it to represent independent English texts.
 * @param {string} s
 */
function latinSource(s) {
  const pairs = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
  const lookup = new Map(corpus.translit.map((x, i) => [x, i]));
  return (s.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    const result = [];
    for (let j = 0; j < word.length;) {
      const pair = pairs.find(v => word.startsWith(v, j));
      let r = pair || word[j];
      j += pair ? pair.length : 1;
      if (r === "ING") r = "NG";
      if (r === "K" || r === "Q") r = "C";
      if (r === "V") r = "U";
      if (r === "Z") r = "S";
      const i = lookup.get(r);
      assert.notEqual(i, undefined, `unmapped Latin symbol ${r}`);
      result.push(i);
    }
    return result;
  });
}

/** Full 12,956-source-rune native positive with unrestricted word-specific A,B. */
function plantNative(nativeWords, rng) {
  const cipher = [], secrets = [];
  for (const word of nativeWords) {
    const a = rng() % 29;
    const b = rng() % 29;
    secrets.push([a, b]);
    cipher.push(word.map((p, j) => mod(p + a + b * j)));
  }
  assert.deepEqual(secondDifferenceHistogram(cipher),
    secondDifferenceHistogram(nativeWords));
  const recovered = cipher.map((word, w) => {
    const [a, b] = secrets[w];
    return word.map((c, j) => mod(c - a - b * j));
  });
  assert.deepEqual(recovered, nativeWords);
  assert.equal(size(recovered), 12956);

  // This independent plant is guaranteed to suppress every adjacent repeat.
  // It proves a per-word slope CAN engineer the original anti-doublet sign
  // without changing the second-difference invariant.
  const noDoublets = nativeWords.map(word => {
    const disallowed = new Set();
    for (let j = 1; j < word.length; j++) {
      disallowed.add(mod(word[j - 1] - word[j]));
    }
    const slope = Array.from({length: 29}, (_, v) => v)
      .find(b => !disallowed.has(b));
    assert.notEqual(slope, undefined);
    return word.map((p, j) => mod(p + slope * j));
  });
  let adjacentEquals = 0;
  for (const word of noDoublets) {
    for (let j = 1; j < word.length; j++) {
      adjacentEquals += Number(word[j] === word[j - 1]);
    }
  }
  assert.equal(adjacentEquals, 0);
  assert.deepEqual(secondDifferenceHistogram(noDoublets),
    secondDifferenceHistogram(nativeWords));
  return {nativeRunesRecovered: size(recovered), recoveredWords: recovered.length,
    noDoubletPlantPairs: nativeWords.reduce((s, w) => s + Math.max(0, w.length - 1), 0),
    noDoubletPlantEqualPairs: adjacentEquals,
    invariantExactBothPlants: true};
}


/**
 * Any polynomial key of degree <= d cancels from the (d+1)st difference.
 * This tests the original p7 five-point/quartic-family word-local rival
 * with entirely secret coefficients, preserving every authentic word.
 * @param {number[][]} words
 * @param {number} order
 */
function finiteDifferenceHistogram(words, order) {
  const hist = Array(29).fill(0);
  for (const word of words) {
    let differences = word.slice();
    for (let d = 0; d < order; d++) {
      differences = differences.slice(1)
        .map((v, j) => mod(v - differences[j]));
    }
    for (const value of differences) hist[value]++;
  }
  return hist;
}

/** Exact, positive 12,956-rune quartic pad using arbitrary secret coefficients. */
function plantQuartic(nativeWords, random) {
  const choose = (j, d) => {
    let value = 1;
    for (let z = 1; z <= d; z++) value = value * (j - z + 1) / z;
    return value;
  };
  const keys = nativeWords.map(() =>
    Array.from({length: 5}, () => random() % 29));
  const ciphertext = nativeWords.map((word, w) =>
    word.map((p, j) => mod(p + keys[w].reduce(
      (sum, coefficient, d) => sum + coefficient * choose(j, d), 0))));
  const decoded = ciphertext.map((word, w) =>
    word.map((c, j) => mod(c - keys[w].reduce(
      (sum, coefficient, d) => sum + coefficient * choose(j, d), 0))));
  assert.deepEqual(decoded, nativeWords);
  assert.deepEqual(finiteDifferenceHistogram(ciphertext, 5),
    finiteDifferenceHistogram(nativeWords, 5));
  assert.equal(size(decoded), 12956);
  return {ciphertextRunes: size(ciphertext), correctlyRecovered: size(decoded),
    fifthDifferencesIdentical: true, separateSecretCoefficients: 5*nativeWords.length};
}

/** Exact source-GP word-matched finite-difference null for degrees 2, 3, 4. */
function higherPolynomialGate(nativeWords, pools) {
  const orders = [3, 4, 5];
  const reference = orders.map(order => finiteDifferenceHistogram(known, order));
  const original = orders.map(order => finiteDifferenceHistogram(unsolved, order));
  const nativeMatched = orders.map(order =>
    finiteDifferenceHistogram(nativeWords, order));
  const actual = original.map((hist, j) =>
    chiSquareHomogeneity(hist, reference[j]));
  const matched = original.map((hist, j) =>
    chiSquareHomogeneity(hist, nativeMatched[j]));
  assert.deepEqual(original.map(h => h.reduce((s, v) => s + v, 0)),
    [4882, 3237, 2105]);
  const checks = [95.8821430142865, 44.66697320209907, 46.07642788475357];
  for (let j = 0; j < 3; j++) assert.ok(Math.abs(actual[j]-checks[j]) < 1e-9);
  const control = plantQuartic(nativeWords, makeRandom());
  const frozen = pools.map(pool => pool.map(word =>
    orders.map(order => finiteDifferenceHistogram([word], order))));
  const random = makeRandom(), repetitions = 500;
  const maxima = Array(3).fill(0), exceed = Array(3).fill(0), sums=Array(3).fill(0);
  for (let n = 0; n < repetitions; n++) {
    const histogram = orders.map(() => Array(29).fill(0));
    for (const word of unsolved) {
      const choices = frozen[word.length];
      const drawn = choices[random() % choices.length];
      for (let k = 0; k < 3; k++) {
        for (let i = 0; i < 29; i++) histogram[k][i] += drawn[k][i];
      }
    }
    for (let k = 0; k < 3; k++) {
      const value = chiSquareHomogeneity(histogram[k], reference[k]);
      maxima[k] = Math.max(maxima[k], value);
      exceed[k] += Number(value >= actual[k]);
      sums[k] += value;
    }
  }
  const expected = [12.249488444204946, 14.608030875967286, 18.649863711483906];
  for (let k = 0; k < 3; k++) {
    assert.ok(Math.abs(maxima[k] - expected[k]) < 1e-9);
    assert.equal(exceed[k], 0);
  }
  return {models: orders.map((order,k) => ({
    secretWordPolynomialDegree: order - 1,
    invariantDerivativeOrder: order,
    originalDerivativePositions: original[k].reduce((a,b)=>a+b,0),
    originalVsSourceNativeChi: actual[k],
    originalVsLengthMatchedNativeChi: matched[k],
    matchedNativeSimulation500Max: maxima[k],
    matchedNativeSimulation500Mean: sums[k] / repetitions,
    matchedNativeSimulation500Exceed: exceed[k]
  })), nativeQuarticPositive: control};
}

function run() {
  const original = secondDifferenceHistogram(unsolved);
  const source = secondDifferenceHistogram(known);
  const nativeChi = chiSquareHomogeneity(original, source);
  assert.equal(original.reduce((s, v) => s + v, 0), 7247);
  assert.equal(original[0], 267);
  assert.equal(source.reduce((s, v) => s + v, 0), 1527);
  assert.ok(Math.abs(nativeChi - 150.15391685853427) < 1e-9);

  const nativePools = lengthPools(known);
  const nativeMatched = lengthMatchedCycle(nativePools);
  const matchedNativeChi = chiSquareHomogeneity(original,
    secondDifferenceHistogram(nativeMatched));
  assert.ok(Math.abs(matchedNativeChi - 412.6176547403711) < 1e-9);

  const p57 = latinSource(read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split("### 57")[1]).flat();
  assert.deepEqual(p57, corpus.pages.find(p => p.page === 57).indices);

  const positive = plantNative(nativeMatched, makeRandom());
  const rng = makeRandom();

  // 2,000 source-native original-word-length matched *random* placements
  // against the independent actual solved GP29 reference. Comparisons
  // preserve all 2,896 original word lengths; no cipher values are altered.
  const reps = 2000, simulations = [];
  for (let t = 0; t < reps; t++) {
    const hist = Array(29).fill(0);
    for (const word of unsolved) {
      const pool = nativePools[word.length];
      const sampled = pool[rng() % pool.length];
      for (let j = 2; j < sampled.length; j++) {
        hist[mod(sampled[j] - 2 * sampled[j - 1] + sampled[j - 2])]++;
      }
    }
    simulations.push(chiSquareHomogeneity(hist, source));
  }
  simulations.sort((a, b) => a - b);
  const simMax = simulations[reps - 1];
  assert.equal(simulations.filter(v => v >= nativeChi).length, 0);
  assert.ok(simMax < 16.5); // benchmark expected max about 15.9
  assert.ok(Math.abs(simMax - 15.932849586541241) < 1e-9);

  const polynomial = higherPolynomialGate(nativeMatched, nativePools);

  const independent = [
    ["Gibran", "resources/control/gibran_prophet_58585.txt", 269.0301910135937],
    ["Emerson", "resources/control/emerson_essays_2944.txt", 192.15928068059597],
    ["Shakespeare", "resources/control/shakespeare_first300k.txt", 253.29831984382776]
  ].map(([name, sourcePath, expected]) => {
    const donor = lengthMatchedCycle(lengthPools(latinSource(read(sourcePath))));
    assert.equal(size(donor), 12956);
    const chi = chiSquareHomogeneity(original, secondDifferenceHistogram(donor));
    assert.ok(Math.abs(chi - expected) < 1e-9);
    return {name, gpRunes: size(donor), chi};
  });

  const result = {
    problem: "Unrestricted source-word affine ramp C=P+A_w+B_w*j mod29",
    sourceOriginal: {words: unsolved.length, runeCount: size(unsolved),
      secondDifferences: 7247, histogram: original, zero: original[0]},
    allSecretNecessaryInvariant: "Within-word second differences of C and P must agree, for all 29^(2*2896) arbitrary independent offsets/slopes",
    nativeReference: {solvedWords: known.length, solvedRunes: size(known),
      histogram: source, chi: nativeChi,
      originalLengthMatchedNativeChi: matchedNativeChi},
    sourceNativeNull: {trials: reps, benchmarkActualChi: nativeChi,
      median: simulations[999], p95: simulations[1899], max: simMax,
      atLeastActual: 0},
    literarySourceHoldouts: independent,
    plantedCipher: positive,
    fullySecretQuadraticCubicQuarticWordPads: polynomial,
    exactP57PlaintextTokenizer: "95/95 GP runes",
    decision: "No ordinary length-preserving GP29 English/Latin-author register under any per-word affine offset plus slope. Other evolving/nonlinear alphabets, languages or segmentation remain unresolved. No unknown plaintext recovered."
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = {secondDifferenceHistogram, finiteDifferenceHistogram, chiSquareHomogeneity, plantNative, plantQuartic, higherPolynomialGate, run};
