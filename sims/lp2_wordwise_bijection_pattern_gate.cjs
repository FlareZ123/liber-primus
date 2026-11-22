"use strict";
/**
 * Key-independent word-pattern gate for an arbitrary independent GP29
 * permutation at every printed LP2 word. SFT: run with Node.js from repo root.
 *
 * A cipher word C[i] = pi_word(P[i]) preserves the complete equality
 * partition inside each word, regardless of how each 29! key is chosen.
 * This tests that invariant against exact length-matched native GP controls.
 *
 * node sims/lp2_wordwise_bijection_pattern_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNIC = /[\u16A0-\u16FF]/u;
const symbols = corpus.runes;
const sourcePaths = [
  ["LP1 solved", "resources/liber-primus/lp1-plaintext-reference.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

/**
 * Canonical parser: line and physical page wrap are transparent; original
 * printed dashes, stops, markers and other nonrune characters end a word.
 * @param {string} raw
 * @returns {number[][]}
 */
function parseLP2Words(raw) {
  const stream = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [];
  function finish() {
    if (word.length) words.push(word);
    word = [];
  }
  for (const ch of stream) {
    if (RUNIC.test(ch)) {
      const id = symbols.indexOf(ch);
      assert.ok(id >= 0, "Unrecognized GP rune");
      word.push(id);
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      finish();
    }
  }
  finish();
  return words;
}

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[][]} */
function nativeWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(original => {
    const w = original.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const runes = [];
    for (let i = 0; i < w.length;) {
      const token = tokens.find(x => w.startsWith(x.s, i));
      assert.ok(token, "No GP token: " + w.slice(i));
      runes.push(token.i);
      i += token.s.length;
    }
    return runes;
  });
}

/**
 * Exact invariants of an arbitrary bijective per-word substitution.
 * [equal pairs at any distance, adjacent doubles, all-distinct indicator]
 * @param {number[]} w
 * @returns {[number,number,number]}
 */
function features(w) {
  let pairs = 0;
  let doubles = 0;
  for (let i = 0; i < w.length; i++) {
    if (i > 0 && w[i] === w[i - 1]) doubles++;
    for (let j = i + 1; j < w.length; j++)
      if (w[i] === w[j]) pairs++;
  }
  return [pairs, doubles, Number(pairs === 0)];
}
/** @param {number[][]} words */
function totals(words) {
  return words.map(features).reduce((a, b) => a.map((x, j) => x + b[j]),
    [0, 0, 0]);
}

/** @param {number[]} w */
function pattern(w) {
  const map = new Map();
  return w.map(c => {
    if (!map.has(c)) map.set(c, map.size);
    return map.get(c);
  }).join(".");
}

/** @param {number} seed */
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const original = parseLP2Words(read("resources/lp2-transcription.txt"));
assert.equal(original.length, 2896);
assert.equal(original.reduce((a, w) => a + w.length, 0), 12956);
const observed = totals(original);
assert.deepEqual(observed, [811, 63, 2275]);

const hist = new Map();
for (const w of original) hist.set(w.length, (hist.get(w.length) || 0) + 1);
const summaries = [];
const dictionaries = [];
for (let sourceIndex = 0; sourceIndex < sourcePaths.length; sourceIndex++) {
  const [name, file] = sourcePaths[sourceIndex];
  const reference = nativeWords(read(file));
  const pools = new Map();
  for (const w of reference) {
    const group = pools.get(w.length) || [];
    group.push({w, f: features(w)});
    pools.set(w.length, group);
  }
  dictionaries.push(new Set(reference.map(pattern)));
  for (const len of hist.keys())
    assert.ok(pools.has(len), name + " missing length " + len);

  const means = [0, 0, 0];
  const variances = [0, 0, 0];
  for (const [length, count] of hist) {
    const entries = pools.get(length);
    for (let k = 0; k < 3; k++) {
      const avg = entries.reduce((sum, x) => sum + x.f[k], 0) /
        entries.length;
      const variance = entries.reduce((sum, x) =>
        sum + (x.f[k] - avg) ** 2, 0) / entries.length;
      means[k] += count * avg;
      variances[k] += count * variance;
    }
  }

  // Exact source-length matching, 2,000 seeded manuscripts per reference.
  // Three simultaneous one-sided tests: pairs and doubles are unusually
  // LOW, all-distinct words unusually HIGH.
  const rng = random(0x14330011 + sourceIndex * 0x10001);
  const lowerTails = [0, 0, 0];
  for (let trial = 0; trial < 2000; trial++) {
    const counts = [0, 0, 0];
    for (const w of original) {
      const group = pools.get(w.length);
      const f = group[Math.floor(rng() * group.length)].f;
      for (let k = 0; k < 3; k++) counts[k] += f[k];
    }
    if (counts[0] <= observed[0]) lowerTails[0]++;
    if (counts[1] <= observed[1]) lowerTails[1]++;
    if (counts[2] >= observed[2]) lowerTails[2]++;
  }

  // Synthetic GP plaintext -> independent random bijection per word.
  // Verify the inverse recovers all 12,956 positions and that the word
  // equality partition (not merely the aggregate) is invariant.
  const plantRng = random(0x14330091 + sourceIndex * 0x10001);
  let recovered = 0;
  for (const originalWord of original) {
    const group = pools.get(originalWord.length);
    const plain = group[Math.floor(plantRng() * group.length)].w;
    const permutation = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = Math.floor(plantRng() * (i + 1));
      [permutation[i], permutation[j]] =
        [permutation[j], permutation[i]];
    }
    const inverse = [];
    for (let i = 0; i < 29; i++) inverse[permutation[i]] = i;
    const cipher = plain.map(id => permutation[id]);
    assert.equal(pattern(cipher), pattern(plain));
    assert.deepEqual(cipher.map(id => inverse[id]), plain);
    recovered += plain.length;
  }
  assert.equal(recovered, 12956);
  summaries.push({
    source: name,
    referenceWords: reference.length,
    expected: means.map(x => +x.toFixed(6)),
    standardDeviation: variances.map(x => +Math.sqrt(x).toFixed(6)),
    z: means.map((x, k) => +
      ((observed[k] - x) / Math.sqrt(variances[k])).toFixed(6)),
    extremeReplicates: lowerTails,
    trials: 2000,
    nativePlantRoundTripRunes: recovered
  });
}
const union = new Set(dictionaries.flatMap(x => [...x]));
const unmatched = original.filter(w => !union.has(pattern(w)));
assert.equal(unmatched.length, 81);
console.log(JSON.stringify({
  hypothesis: "independent arbitrary bijection of 29 GP symbols per word",
  wordBoundaryAssumption: "LP2 printed word = plaintext word",
  original: {words: original.length, runes: 12956, observed},
  invariantMetrics: ["within-word equality pairs", "adjacent doubles",
    "words with no repeated runes"],
  summaries,
  finiteControlDictionary: {
    unmatchedLP2Patterns: unmatched.length,
    matchedLP2Patterns: original.length - unmatched.length,
    scope: "only the four named reference vocabularies"
  },
  conclusion: "source-conditional word-local direct-GP negative; no plaintext",
}, null, 2));
