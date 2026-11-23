"use strict";
/**
 * All-secret, per-word 4/5-phase substitution ciphertext test.
 * Full within-phase equality signatures, source-native and Latin registers.
 * Exact original LP2 ciphertext, leave-one-donor-out controls, reversible plant.
 * Single-file Windows 11 Node.js 22 CommonJS; no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const src = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const donorPaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const names = ["Shakespeare", "Emerson", "Gibran"];
const donorTexts = donorPaths.map(read);
const gutenberg = donorTexts[2].toUpperCase();
const gibranStart = gutenberg.indexOf("ALMUSTAFA");
const gibranEnd = gutenberg.indexOf("*** END OF", gibranStart);
assert(gibranStart >= 0 && gibranEnd > gibranStart);
donorTexts[2] = donorTexts[2].slice(gibranStart, gibranEnd);
assert.equal(donorTexts[2].length, 68955);
const tokens = src.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[]} */
function gpNative(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {result.push(21); i += 3; continue;}
    if (s.startsWith("IO", i)) {result.push(27); i += 2; continue;}
    const token = tokens.find(t => s.startsWith(t.s, i));
    assert(token, "unmapped donor token " + word + " at " + i);
    result.push(token.i);
    i += token.s.length;
  }
  return result;
}

/**
 * Canonical equality partition for each modulo-m position class.
 * All arbitrary separate phase permutations preserve the exact signature.
 * @param {number[]} word @param {number} m @returns {string}
 */
function signature(word, m) {
  const maps = Array.from({length: m}, () => new Map());
  const next = Array(m).fill(0);
  let output = "";
  for (let i = 0; i < word.length; i++) {
    const phase = i % m;
    if (!maps[phase].has(word[i])) maps[phase].set(word[i], next[phase]++);
    output += maps[phase].get(word[i]);
  }
  return output;
}

/**
 * Exact probability of this entire phase-equality partition under IID GP29.
 * Each phase with k distinct observed labels and n positions has probability
 * (29)_k / 29^n for a specified canonical equality pattern.
 * @param {number[]} word @param {number} m @returns {number}
 */
function uniformSignatureProbability(word, m) {
  let probability = 1;
  for (let phase = 0; phase < m; phase++) {
    const distinct = new Set();
    let count = 0;
    for (let i = phase; i < word.length; i += m) {
      distinct.add(word[i]);
      count++;
    }
    for (let k = 0; k < distinct.size; k++) probability *= (29 - k) / 29;
    for (let k = distinct.size; k < count; k++) probability /= 29;
  }
  return probability;
}
const stream = transcript.split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runeRegex = new RegExp("[" + src.runes.join("") + "]+", "gu");
const original = (stream.match(runeRegex) || []).map(s =>
  Array.from(s, c => src.runes.indexOf(c)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, w) => sum + w.length, 0), 12956);
assert.deepEqual(original.flat(), src.pages.slice(0, 56).flatMap(p => p.indices));
assert.equal(original.filter(w => w.length === 1).length, 83);
assert.equal(original.filter(w => w.length === 2).length, 448);

/** @param {string} source @param {"GP"|"LATIN"} mode */
function donorPools(source, mode) {
  const pools = new Map();
  for (const textWord of source.match(/[A-Za-z]+/g) || []) {
    const letters = mode === "GP" ? gpNative(textWord) :
      Array.from(textWord.toLowerCase(), c => c.charCodeAt(0) - 97);
    if (!pools.has(letters.length)) pools.set(letters.length, []);
    pools.get(letters.length).push(letters);
  }
  return pools;
}

/** @param {number} seed */
function rng(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
const results = {};
for (const mode of ["GP", "LATIN"]) {
  const pools = donorTexts.map(text => donorPools(text, mode));
  results[mode] = {};
  for (const m of [4, 5]) {
    const foldResults = [];
    for (let hold = 0; hold < 3; hold++) {
      const train = [0, 1, 2].filter(x => x !== hold);
      const admissible = new Set(original.map(w => w.length)
        .filter(n => pools[hold].has(n) && train.every(t => pools[t].has(n))));
      const targetWords = original.filter(w => admissible.has(w.length));
      assert.equal(targetWords.length, 2893);
      const models = train.map(t => {
        const byLength = new Map();
        for (const [length, rows] of pools[t]) {
          const histogram = new Map();
          for (const row of rows) {
            const key = signature(row, m);
            histogram.set(key, (histogram.get(key) || 0) + 1);
          }
          byLength.set(length, {histogram, total: rows.length});
        }
        return byLength;
      });
      const score = word => {
        const key = signature(word, m);
        const baseline = uniformSignatureProbability(word, m);
        let englishProbability = 0;
        for (const model of models) {
          const {histogram, total} = model.get(word.length);
          englishProbability += (histogram.get(key) || 0) / total / 2;
        }
        // Frozen 80% equally weighted source model and 20% IID baseline.
        return Math.log((0.8 * englishProbability + 0.2 * baseline) /
          baseline);
      };
      const observed = targetWords.reduce((sum, word) => sum + score(word), 0);
      const draw = rng(0x8b0048 + hold * 97 + m * 13 +
        (mode === "GP" ? 0 : 1400));
      const repetitions = 1500;
      let countAtOrBelow = 0;
      let sum = 0;
      let squares = 0;
      let minimum = Infinity;
      for (let trial = 0; trial < repetitions; trial++) {
        let statistic = 0;
        for (const word of targetWords) {
          const candidates = pools[hold].get(word.length);
          statistic += score(candidates[Math.floor(draw() * candidates.length)]);
        }
        if (statistic <= observed) countAtOrBelow++;
        sum += statistic / repetitions;
        squares += statistic * statistic / repetitions;
        minimum = Math.min(minimum, statistic);
      }
      foldResults.push({
        heldout: names[hold],
        words: targetWords.length,
        observed,
        mean: sum,
        standardDeviation: Math.sqrt(squares - sum * sum),
        minimum,
        atOrBelow: countAtOrBelow,
        trials: repetitions
      });
    }
    results[mode]["m" + m] = foldResults;
  }
}
const expected = {
  GP: {m4: [0, 1, 0], m5: [4, 222, 12]},
  LATIN: {m4: [0, 0, 0], m5: [2, 28, 0]}
};
for (const mode of Object.keys(expected)) {
  for (const m of ["m4", "m5"]) {
    assert.deepEqual(results[mode][m].map(row => row.atOrBelow),
      expected[mode][m]);
  }
}
// Positive: real donor words, 5 arbitrary 29-way secret permutations per word.
const plantPools = donorPools(donorTexts[2], "GP");
const plantWords = original.filter(w => plantPools.has(w.length));
assert.equal(plantWords.length, 2893);
const plantDraw = rng(0x46d1c4da);
let recovered = 0;
for (const sourceWord of plantWords) {
  const candidates = plantPools.get(sourceWord.length);
  const plaintext = candidates[Math.floor(plantDraw() * candidates.length)];
  const alphabets = Array.from({length: 5}, () => {
    const a = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const k = Math.floor(plantDraw() * (i + 1));
      [a[i], a[k]] = [a[k], a[i]];
    }
    return a;
  });
  const ciphertext = plaintext.map((p, i) => alphabets[i % 5][p]);
  assert.equal(signature(plaintext, 5), signature(ciphertext, 5));
  const inverse = alphabets.map(a => {
    const inv = Array(29);
    for (let i = 0; i < 29; i++) inv[a[i]] = i;
    return inv;
  });
  const decoded = ciphertext.map((c, i) => inverse[i % 5][c]);
  assert.deepEqual(decoded, plaintext);
  recovered += decoded.length;
}
assert(recovered > 12000);

// Constructive original-cipher ambiguity, using an independent finite lexicon.
// For each printed source word, choose one same-signature native-English word.
// Every phase map is then constructed as a 29-way bijection and extended over
// unused symbols. This demonstrates real original-cipher reencryption and a
// large finite lexical preimage set, not a claim of recovered true plaintext.
const lexicon = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).map(line => /^([a-z]+)\s+\d+/.exec(line))
  .filter(Boolean).map(match => match[1]);
assert.equal(lexicon.length, 29157);
const lexicalWitnesses = {};
for (const mode of ["GP", "LATIN"]) {
  const bySignature = new Map();
  for (const entry of lexicon) {
    const candidate = mode === "GP" ? gpNative(entry) :
      Array.from(entry, c => c.charCodeAt(0) - 97);
    const key = candidate.length + ":" + signature(candidate, 5);
    if (!bySignature.has(key)) {
      bySignature.set(key, {text: entry, plaintext: candidate, count: 0});
    }
    bySignature.get(key).count++;
  }
  let witnessRuneCount = 0;
  let witnessLog2Count = 0;
  let smallestDomain = Infinity;
  for (const originalWord of original) {
    const key = originalWord.length + ":" + signature(originalWord, 5);
    const witness = bySignature.get(key);
    assert(witness, "missing 5-phase native dictionary witness: " + key);
    const plainWord = witness.plaintext;
    witnessLog2Count += Math.log2(witness.count);
    smallestDomain = Math.min(smallestDomain, witness.count);
    const perm = [];
    const inverses = [];
    for (let phase = 0; phase < 5; phase++) {
      const a = Array(29).fill(-1);
      const used = new Set();
      for (let i = phase; i < plainWord.length; i += 5) {
        const p = plainWord[i];
        const c = originalWord[i];
        if (a[p] !== -1) assert.equal(a[p], c);
        else {
          assert(!used.has(c), "non-injective phase mapping");
          a[p] = c;
          used.add(c);
        }
      }
      const remaining = Array.from({length: 29}, (_, i) => i)
        .filter(i => !used.has(i));
      let k = 0;
      for (let i = 0; i < 29; i++) {
        if (a[i] === -1) a[i] = remaining[k++];
      }
      assert.equal(k, remaining.length);
      const inverse = Array(29);
      for (let i = 0; i < 29; i++) inverse[a[i]] = i;
      perm.push(a);
      inverses.push(inverse);
    }
    const enciphered = plainWord.map((x, i) => perm[i % 5][x]);
    assert.deepEqual(enciphered, originalWord);
    const deciphered = originalWord.map((x, i) => inverses[i % 5][x]);
    assert.deepEqual(deciphered, plainWord);
    witnessRuneCount += enciphered.length;
  }
  assert.equal(witnessRuneCount, 12956);
  assert.equal(smallestDomain, 1);
  const expectedLog = mode === "GP" ?
    29219.84150033074 : 28653.042772024448;
  assert(Math.abs(witnessLog2Count - expectedLog) < 1e-6);
  lexicalWitnesses[mode] = {
    originalRuneReplays: witnessRuneCount,
    originalPrintedWords: original.length,
    independentTextBlobWitnessesLog2: witnessLog2Count,
    minimumWordDomain: smallestDomain
  };
}


// Robustness to worst original word-pattern outliers. Train on two authors,
// hold out Gibran, and remove the 100 lowest individual log-ratios from EACH
// book before comparing source with length-matched donor controls.
const robust = {};
for (const mode of ["GP", "LATIN"]) {
  const donors = donorTexts.map(t => donorPools(t, mode));
  const m = 4;
  const admissible = new Set(original.map(w => w.length)
    .filter(n => donors.every(p => p.has(n))));
  const chosen = original.filter(w => admissible.has(w.length));
  assert.equal(chosen.length, 2893);
  const models = [0, 1].map(i => {
    const bins = new Map();
    for (const [length, words] of donors[i]) {
      const hist = new Map();
      for (const word of words) {
        const key = signature(word, m);
        hist.set(key, (hist.get(key) || 0) + 1);
      }
      bins.set(length, {hist, n: words.length});
    }
    return bins;
  });
  const score = word => {
    const key = signature(word, m);
    const baseline = uniformSignatureProbability(word, m);
    let value = 0;
    for (const model of models) {
      const {hist, n} = model.get(word.length);
      value += (hist.get(key) || 0) / n / 2;
    }
    return Math.log((0.8 * value + 0.2 * baseline) / baseline);
  };
  const originalScores = chosen.map(score).sort((a, b) => a - b);
  const candidatesByLength = new Map();
  for (const [length, words] of donors[2]) {
    candidatesByLength.set(length, words.map(score));
  }
  robust[mode] = [];
  for (const trim of [0, 5, 10, 20, 32, 64, 100]) {
    const sourceScore = originalScores.slice(trim)
      .reduce((sum, value) => sum + value, 0);
    const random = rng(0x191caca + trim * 17 +
      (mode === "GP" ? 0 : 1001));
    let count = 0;
    let mean = 0;
    let min = Infinity;
    const samples = 400;
    for (let sample = 0; sample < samples; sample++) {
      const donorScores = chosen.map(w => {
        const scores = candidatesByLength.get(w.length);
        return scores[Math.floor(random() * scores.length)];
      });
      donorScores.sort((a, b) => a - b);
      const statistic = donorScores.slice(trim)
        .reduce((sum, value) => sum + value, 0);
      count += Number(statistic <= sourceScore);
      mean += statistic / samples;
      min = Math.min(min, statistic);
    }
    robust[mode].push({trim, sourceScore, donorMean: mean,
      donorMinimum: min, atOrBelow: count, samples});
  }
  assert.deepEqual(robust[mode].map(x => x.atOrBelow),
    [0, 0, 0, 0, 0, 0, 0]);
}
assert(Math.abs(robust.GP[6].sourceScore - (-3.0676)) < 0.0002);
assert(Math.abs(robust.LATIN[6].sourceScore - (-4.7203)) < 0.0002);

console.log(JSON.stringify({
  originalWords: original.length,
  originalRunes: 12956,
  testedModes: ["GP", "LATIN"],
  sourceSampleWords: 2893,
  trialCountPerHoldout: 1500,
  results,
  positiveRecoveredRunes: recovered,
  lexicalWitnesses,
  robust,
  status: "PASS"
}, null, 2));
