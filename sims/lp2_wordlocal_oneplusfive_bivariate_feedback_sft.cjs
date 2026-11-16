"use strict";

/**
 * Original LP2 GP29 word-local two-history feedback inverse, Windows Node 22 SFT.
 * Usage: node sims/lp2_wordlocal_oneplusfive_bivariate_feedback_sft.cjs
 *
 * Tested cipher C[i] = P[i] + a*C[i-1] + b*C[i-5] (mod 29) for i >= 5
 * inside each printed word. Positions i<5 carry an arbitrary five-rune seed.
 * The inverse never consumes plaintext as its feedback input.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const transcript = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);
const lexicon = fs.readFileSync(
  path.join(root, "resources", "control", "english_wordfreq_textblob.txt"), "utf8"
);

const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const translits = new Map(corpus.translit.map((r, i) => [r, i]));
const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} text @returns {number[][]} */
function parseWords(text) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let word = [];
  for (const ch of text) {
    if (runes.has(ch)) {
      word.push(runes.get(ch));
    } else if ("-.$&§".includes(ch) && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {string} latin @returns {number[] | null} */
function encode(latin) {
  const cleaned = latin.toUpperCase()
    .replace(/QU/g, "CW").replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/Q/g, "C").replace(/ING/g, "NG").replace(/IO/g, "IA");
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < cleaned.length;) {
    const token = tokens.find(t => cleaned.startsWith(t, i));
    if (!token) return null;
    result.push(translits.get(token));
    i += token.length;
  }
  return result;
}

/** @param {number[][]} words @param {number} a @param {number} b @returns {number[][]} */
function encrypt(words, a, b) {
  return words.map(w => {
    /** @type {number[]} */
    const c = [];
    for (let i = 0; i < w.length; i++) {
      c.push(i < 5 ? w[i] : (w[i] + a * c[i - 1] + b * c[i - 5]) % 29);
    }
    return c;
  });
}

/** @param {number[][]} words @param {number} a @param {number} b @returns {number[][]} */
function decrypt(words, a, b) {
  return words.map(c => c.map((v, i) =>
    i < 5 ? v : ((v - a * c[i - 1] - b * c[i - 5]) % 29 + 29) % 29
  ));
}

/**
 * GP29 pooled index of coincidence for the word-internal i>=5 inverse outputs.
 * @param {number[][]} words @param {number} a @param {number} b
 * @returns {{ioc:number, n:number}}
 */
function score(words, a, b) {
  const bins = new Array(29).fill(0);
  let n = 0;
  for (const w of words) for (let i = 5; i < w.length; i++) {
    const x = ((w[i] - a * w[i - 1] - b * w[i - 5]) % 29 + 29) % 29;
    bins[x]++;
    n++;
  }
  assert.ok(n > 1);
  const pairs = bins.reduce((sum, x) => sum + x * (x - 1), 0);
  return { ioc: pairs / (n * (n - 1)), n };
}

/** @param {number[][]} words @returns {{a:number,b:number,train:number}[]} */
function rank(words) {
  const result = [];
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    result.push({ a, b, train: score(words, a, b).ioc });
  }
  return result.sort((x, y) => y.train - x.train || x.a - y.a || x.b - y.b);
}

const sections = transcript.split(/\r?\n%\r?\n/);
assert.equal(sections.length, 57);
const original = parseWords(sections.slice(0, 55).join(""));
const originalFlattened = original.flat();
const pageFlattened = corpus.pages.filter(p => p.status === "unsolved")
  .flatMap(p => p.indices);
assert.equal(original.length, 2896);
assert.equal(originalFlattened.length, 12956);
assert.deepEqual(originalFlattened, pageFlattened);
assert.equal(score(original, 0, 0).n, 2105);

const midpoint = original.length / 2;
const originalsTrain = original.slice(0, midpoint);
const originalsTest = original.slice(midpoint);
const originalRanks = rank(originalsTrain);
const bestOriginal = originalRanks[0];
const originalHeldout = score(originalsTest, bestOriginal.a, bestOriginal.b);

/** @type {Map<number, {word:number[],frequency:number}[]>} */
const byLength = new Map();
for (const line of lexicon.split(/\r?\n/)) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (!m) continue;
  const word = encode(m[1]);
  if (!word) continue;
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push({ word, frequency: Number(m[2]) });
}
for (const candidates of byLength.values()) {
  candidates.sort((a, b) => b.frequency - a.frequency);
}

let rng = 3301;
/** @param {number} max @returns {number} */
function pick(max) {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) % max;
}
const native = original.map(w => {
  const choices = byLength.get(w.length);
  assert.ok(choices && choices.length, "Missing authentic-source-length English control");
  const pool = choices.slice(0, Math.min(100, choices.length));
  return pool[pick(pool.length)].word;
});
assert.deepEqual(encode("DIVINITY"), [23, 10, 1, 10, 9, 10, 16, 26]);
const plantedA = 11;
const plantedB = 17;
const planted = encrypt(native, plantedA, plantedB);
assert.deepEqual(decrypt(planted, plantedA, plantedB), native);
const plantedRanks = rank(planted.slice(0, midpoint));
assert.deepEqual([plantedRanks[0].a, plantedRanks[0].b], [plantedA, plantedB]);
assert.ok(plantedRanks[0].train > 0.075);
assert.ok(bestOriginal.train < 0.036);
assert.ok(originalHeldout.ioc < 0.036);

const result = {
  source: {
    unknownPages: 56, words: original.length, runes: originalFlattened.length,
    positionsAfterWordLocalFifth: score(original, 0, 0).n
  },
  model: "C[i]=(P[i]+a*C[i-1]+b*C[i-5]) mod29, i>=5; 841 global (a,b) keys",
  original: {
    untransformedEligibleIoC: score(original, 0, 0).ioc,
    bestTraining: bestOriginal,
    heldoutIoC: originalHeldout.ioc,
    nextFourTraining: originalRanks.slice(1, 5)
  },
  control: {
    matchingWordLengths: native.length, nativeEligibleIoC: score(native, 0, 0).ioc,
    hiddenPair: [plantedA, plantedB], recoveredPair: [plantedRanks[0].a, plantedRanks[0].b],
    trainingIoC: plantedRanks[0].train,
    heldoutIoC: score(planted.slice(midpoint), plantedA, plantedB).ioc,
    perfectWordByWordRoundTrip: true
  }
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
