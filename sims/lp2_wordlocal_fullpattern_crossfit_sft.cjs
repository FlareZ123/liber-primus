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
console.log(JSON.stringify({
  originalWords: original.length,
  originalRunes: 12956,
  testedModes: ["GP", "LATIN"],
  sourceSampleWords: 2893,
  trialCountPerHoldout: 1500,
  results,
  positiveRecoveredRunes: recovered,
  status: "PASS"
}, null, 2));
