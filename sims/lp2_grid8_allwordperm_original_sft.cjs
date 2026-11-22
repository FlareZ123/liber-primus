"use strict";

/**
 * Exhaust all 8! fixed row-wise whole-word permutations suggested by the
 * eight printed columns of the LP2 p49-51 table. A different unknown 8!
 * permutation is also allowed at each of the nine illustrated chapters.
 *
 * The score is a source-native, Shakespeare-trained 7-class word-length
 * adjacency log-likelihood ratio. Calibrate every optimization against a
 * seed-fixed shuffle of the EXACT original length inventory, either whole
 * book or within the printed chapters. This permits a key-free cipher test.
 *
 * Standalone (Windows 11 / Node.js 22):
 * node sims/lp2_grid8_allwordperm_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const original = parseSharedCorpus();
const lengths = original.words.map((w) => w.length);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(lengths.length % 8, 0);
const CHAPTER_WORDS = [158, 255, 383, 437, 224, 326, 378, 669, 66];
assert.equal(CHAPTER_WORDS.reduce((a, b) => a + b, 0), lengths.length);

/**
 * Canonical native GP word length, using the historical digraph convention.
 * @param {string} word
 * @returns {number}
 */
function nativeLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const digraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
  let n = 0;
  for (let i = 0; i < s.length; n++) {
    i += digraphs.has(s.slice(i, i + 2)) ? 2 : 1;
  }
  return n;
}

/** @param {string} name @returns {number[]} */
function sourceLengths(name) {
  const source = fs.readFileSync(path.join(ROOT, "resources", "control", name), "utf8");
  return (source.match(/[A-Z]+/gi) || []).map(nativeLength);
}
const shakespeare = sourceLengths("shakespeare_first300k.txt");
const gibran = sourceLengths("gibran_prophet_58585.txt");
assert.equal(shakespeare.length, 55407);
assert.equal(gibran.length, 15733);

/** @param {number} n @returns {number} */
function bin(n) {
  return Math.min(7, n) - 1; // lengths 1,2,3,4,5,6,7+
}
const prior = new Float64Array(49);
const bySource = new Float64Array(7);
const byNext = new Float64Array(7);
for (let i = 1; i < shakespeare.length; i++) {
  const a = bin(shakespeare[i - 1]), b = bin(shakespeare[i]);
  prior[a * 7 + b]++;
  bySource[a]++;
  byNext[b]++;
}
const llr = new Float64Array(49);
for (let a = 0; a < 7; a++) {
  for (let b = 0; b < 7; b++) {
    llr[a * 7 + b] =
      Math.log((prior[a * 7 + b] + 0.5) / (bySource[a] + 3.5)) -
      Math.log((byNext[b] + 0.5) / (shakespeare.length - 1 + 3.5));
  }
}

const permutations = [];
/** @param {number[]} prefix @param {number} mask */
function visit(prefix, mask) {
  if (prefix.length === 8) {
    permutations.push(prefix.slice());
    return;
  }
  for (let j = 0; j < 8; j++) {
    if (mask & (1 << j)) continue;
    prefix.push(j);
    visit(prefix, mask | (1 << j));
    prefix.pop();
  }
}
visit([], 0);
assert.equal(permutations.length, 40320);

/**
 * Score every possible fixed 8-position word permutation. An incomplete final
 * group is unchanged; its bridge from the last full group is included.
 * @param {number[]} x
 * @returns {{ best: number, identity: number, permutation: number[] }}
 */
function optimize(x) {
  assert.ok(x.length >= 8);
  const full = Math.floor(x.length / 8) * 8;
  const cls = Uint8Array.from(x, bin);
  const inside = new Float64Array(64);
  const between = new Float64Array(64);
  const trailing = new Float64Array(8);
  for (let k = 0; k < full; k += 8) {
    for (let a = 0; a < 8; a++) {
      for (let b = 0; b < 8; b++) {
        inside[a * 8 + b] += llr[cls[k + a] * 7 + cls[k + b]];
        if (k + 8 < full) {
          between[a * 8 + b] += llr[cls[k + a] * 7 + cls[k + 8 + b]];
        }
      }
    }
  }
  if (full < x.length) {
    for (let a = 0; a < 8; a++) {
      trailing[a] = llr[cls[full - 8 + a] * 7 + cls[full]];
    }
  }
  let constant = 0;
  for (let k = full + 1; k < x.length; k++) {
    constant += llr[cls[k - 1] * 7 + cls[k]];
  }

  let best = -Infinity, identity = -Infinity, permutation = [];
  for (const p of permutations) {
    let v = constant + trailing[p[7]] + between[p[7] * 8 + p[0]];
    for (let j = 0; j < 7; j++) {
      v += inside[p[j] * 8 + p[j + 1]];
    }
    if (p.every((a, i) => a === i)) identity = v;
    if (v > best) {
      best = v;
      permutation = p;
    }
  }
  return { best, identity, permutation };
}

/**
 * Reversible row-wise word permutation.
 * @param {number[]} x
 * @param {number[]} order
 * @returns {number[]}
 */
function permute(x, order) {
  const out = x.slice();
  for (let i = 0; i + 8 <= x.length; i += 8) {
    for (let j = 0; j < 8; j++) out[i + j] = x[i + order[j]];
  }
  return out;
}

/**
 * Reproducible xorshift32 for null calibration only.
 * @param {number} seed
 * @returns {() => number}
 */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} x @param {() => number} rng */
function shuffle(x, rng) {
  for (let i = x.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [x[i], x[j]] = [x[j], x[i]];
  }
}

const global = optimize(lengths);
const globalNull = [];
const globalRand = random(0x33012608);
const scratch = lengths.slice();
for (let trial = 0; trial < 300; trial++) {
  shuffle(scratch, globalRand);
  globalNull.push(optimize(scratch).best);
}
const globalExceed = globalNull.filter((v) => v >= global.best).length;
assert.equal(globalExceed, 156);
assert.ok(Math.abs(global.best - (-17.063087817265306)) < 1e-9);
assert.deepEqual(global.permutation, [6, 2, 5, 0, 3, 4, 1, 7]);

const chapters = [];
let cursor = 0;
for (const count of CHAPTER_WORDS) {
  chapters.push(lengths.slice(cursor, cursor + count));
  cursor += count;
}
const chapterOptima = chapters.map(optimize);
const chapterBest = chapterOptima.reduce((a, v) => a + v.best, 0);
const chapterNull = [];
const chapterRand = random(0x33012609);
const chapterScratch = chapters.map((a) => a.slice());
for (let trial = 0; trial < 120; trial++) {
  let total = 0;
  for (const x of chapterScratch) {
    shuffle(x, chapterRand);
    total += optimize(x).best;
  }
  chapterNull.push(total);
}
const chapterExceed = chapterNull.filter((v) => v >= chapterBest).length;
assert.equal(chapterExceed, 72);
assert.ok(Math.abs(chapterBest - 33.036773608280555) < 1e-9);

// Genuine contiguous native-language positive, independent of training source.
const native = gibran.slice(1000, 1000 + lengths.length);
assert.equal(native.length, lengths.length);
const secret = [2, 5, 0, 7, 1, 6, 3, 4];
const scrambled = permute(native, secret);
const recovered = optimize(scrambled);
const restored = permute(scrambled, recovered.permutation);
assert.deepEqual(restored, native);
assert.deepEqual(recovered.permutation, [2, 4, 0, 6, 7, 1, 5, 3]);
assert.ok(Math.abs(recovered.best - 50.061351976561305) < 1e-9);

// All original words are retained and the cipher order is reversible.
const invert = (p) => p.map((_, i) => p.indexOf(i));
assert.deepEqual(permute(permute(lengths, global.permutation),
  invert(global.permutation)), lengths);

console.log(JSON.stringify({
  input: { runes: original.runeCount, words: lengths.length,
    sourceGeometry: "32x8 numeric table, eight whole-word positions per row" },
  keyspace: permutations.length,
  model: "Shakespeare 7-bin GP-native word-length adjacency log-likelihood ratio",
  global: { best: global, optimizedNullTrials: globalNull.length,
    nullAtLeastOriginal: globalExceed,
    nullTail: (globalExceed + 1) / (globalNull.length + 1) },
  chapterwise: { sourceChapterWordCounts: CHAPTER_WORDS,
    originalOptimizedScore: chapterBest,
    originalPerChapter: chapterOptima,
    optimizedNullTrials: chapterNull.length,
    nullAtLeastOriginal: chapterExceed,
    nullTail: (chapterExceed + 1) / (chapterNull.length + 1) },
  independentPositive: { source: "Gibran", plantedWords: native.length,
    exactRecovered: restored.length, recoveredOrder: recovered.permutation,
    restoredLanguageScore: recovered.best },
  decision: "No independent source-language word-order signal under any fixed 8-position repeated row permutation, even with a separate arbitrary key in each illustrated chapter; this does not test changing word boundaries or nonstationary keys."
}, null, 2));
