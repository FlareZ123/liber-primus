"use strict";

/**
 * SFT: complete-word single-rune IV/header, all-secret GP29 alphabet gate.
 *
 * The original printed first/last rune of each ciphertext word may be an
 * arbitrary secret IV; all remaining runes may undergo an independently
 * selected, arbitrary GP29 alphabet bijection and an arbitrary permutation
 * of the remaining positions, chosen separately for every word.
 *
 * Equal-symbol unordered pair counts within the remaining body are invariant
 * under EVERY such secret bijection, independent of key, source and alphabet.
 *
 * Two distinct plaintext contracts:
 *   A: IV is an extra rune, so plain-word length = cipher-word length - 1;
 *   B: IV replaces an encoded first/last plaintext rune; lengths equal.
 *
 * SFT: node sims/lp2_word_edge_iv_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = (filename) =>
  fs.readFileSync(path.join(ROOT, filename), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));

/** @type {number[][]} */
const words = [];
/** @type {number[]} */
let current = [];
for (const ch of source) {
  if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
  else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Neither original page turns nor printed line wraps end a word.
  } else if (current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
assert.deepEqual(words.flat(),
  gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices));

/**
 * Unordered same-rune pairs inside a single word.
 * This is exact under arbitrary word-local secret alphabet bijections AND
 * any reordering of the word-body runes.
 * @param {number[]} body
 * @returns {number}
 */
function collisions(body) {
  const hist = Array(29).fill(0);
  for (const x of body) hist[x]++;
  return hist.reduce((total, n) => total + n * (n - 1) / 2, 0);
}

/** @param {number[][]} array @returns {number} */
const sumCollisions = (array) =>
  array.reduce((sum, word) => sum + collisions(word), 0);

/** @returns {number[]} */
function suffixRemoved(word) {
  return word.slice(0, -1);
}

const original = {
  bodyPrefix1: sumCollisions(words.map((w) => w.slice(1))),
  bodySuffix1: sumCollisions(words.map(suffixRemoved)),
  bodyHeaderOnEitherEnd: words.reduce((sum, word) =>
    sum + Math.max(collisions(word.slice(1)),
      collisions(suffixRemoved(word))), 0),
  prefix2: sumCollisions(words.map((w) => w.slice(2))),
  prefix3: sumCollisions(words.map((w) => w.slice(3)))
};
assert.deepEqual(original, {
  bodyPrefix1: 540, bodySuffix1: 518, bodyHeaderOnEitherEnd: 690,
  prefix2: 333, prefix3: 206
});

/** @type {{s:string,i:number}[]} */
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * The repository's existing GP-native English control orthography.
 * @param {string} text
 * @returns {number[][]}
 */
function nativeWords(text) {
  const out = [];
  for (let term of text.toUpperCase().match(/[A-Z]+/g) || []) {
    term = term.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG");
    /** @type {number[]} */
    const symbols = [];
    for (let i = 0; i < term.length;) {
      const match = tokens.find((t) => term.startsWith(t.s, i));
      assert(match, "unmapped source control word: " + term);
      symbols.push(match.i);
      i += match.s.length;
    }
    out.push(symbols);
  }
  return out;
}

const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Solved LP1", "resources/liber-primus/lp1-plaintext-reference.txt"]
].map(([name, file]) => {
  let txt = read(file);
  if (name === "Solved LP1") txt = txt.split("\n")
    .filter((line) => !line.startsWith("#") &&
      !line.includes("continued") && !line.startsWith("["))
    .join("\n");
  const native = nativeWords(txt);
  /** @type {Map<number, number[][]>} */
  const byLength = new Map();
  for (const word of native) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  return {name, byLength};
});

/** @param {number} seedValue */
function prng(seedValue) {
  let state = seedValue >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

/**
 * @param {Record<number, number[][]>} pool
 * @param {number} length
 * @param {() => number} draw
 * @returns {number[]}
 */
function sampleExact(pool, length, draw) {
  if (length <= 0) return [];
  assert(pool[length] && pool[length].length);
  const words = pool[length];
  return words[draw() % words.length];
}

/**
 * @param {number[]} values
 * @returns {{min:number,median:number,max:number}}
 */
function summarize(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {min: sorted[0], median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]};
}

/**
 * Contract A: a header adds one ciphertext rune, so the body must be a
 * complete English GP word of length L-1. Longer front-header baselines
 * are useful strict alternatives; they are not a claim of a 2/3-rune key.
 */
const additiveIV = {};
const rndA = prng(0x3848300);
for (const {name, byLength} of corpora) {
  additiveIV[name] = {};
  const pool = Object.fromEntries(byLength);
  for (const nHeader of [1, 2, 3]) {
    /** @type {number[]} */
    const observations = [];
    for (let trial = 0; trial < 400; trial++) {
      let count = 0;
      for (const cipherWord of words) {
        const size = cipherWord.length - nHeader;
        const plainWord = sampleExact(pool, size, rndA);
        count += collisions(plainWord);
      }
      observations.push(count);
    }
    const s = summarize(observations);
    additiveIV[name][nHeader] = s;
    if (nHeader === 1)
      assert(s.min > original.bodyHeaderOnEitherEnd,
        name + " native one-header lower bound must exceed all ciphertext endpoint placements");
    if (nHeader === 2) assert(s.min > original.prefix2);
    if (nHeader === 3) assert(s.min > original.prefix3);
  }
}

/**
 * Contract B: the header encodes one of the original plaintext runes,
 * preserving word length. Compare both fixed edges and also report a
 * freely word-by-word chosen side, to expose the actual scope boundary.
 */
const replacementIV = {};
const rndB = prng(0x38b1041);
for (const {name, byLength} of corpora) {
  const pool = Object.fromEntries(byLength);
  const samples = {prefix: [], suffix: [], bestNative: []};
  for (let trial = 0; trial < 400; trial++) {
    let prefix = 0;
    let suffix = 0;
    let bestNative = 0;
    for (const cipherWord of words) {
      const control = sampleExact(pool, cipherWord.length, rndB);
      const a = collisions(control.slice(1));
      const b = collisions(suffixRemoved(control));
      prefix += a;
      suffix += b;
      bestNative += Math.min(a, b);
    }
    samples.prefix.push(prefix);
    samples.suffix.push(suffix);
    samples.bestNative.push(bestNative);
  }
  replacementIV[name] = {
    prefix: summarize(samples.prefix),
    suffix: summarize(samples.suffix),
    wordwiseFavorableSide: summarize(samples.bestNative)
  };
  assert(replacementIV[name].prefix.min > original.bodyPrefix1);
  assert(replacementIV[name].suffix.min > original.bodySuffix1);
}

/**
 * Independent full-word native-GP plant: every cipher word gets a freely
 * chosen IV and a DIFFERENT secret 29-way permutation. Both endpoints
 * preserve all body same-pair counts, and the known native body recovers.
 *
 * @param {number} side 0 leading / 1 trailing IV
 * @returns {{decoded:number,ivWords:number}}
 */
function sourceShapedPlant(side) {
  const draw = prng(0x383012ab + side);
  const byLength = Object.fromEntries(corpora[0].byLength);
  let decoded = 0;
  for (const originalWord of words) {
    const plain = sampleExact(byLength, originalWord.length - 1, draw);
    const perm = Array.from({length:29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = draw() % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    const inverse = Array(29).fill(-1);
    for (let i = 0; i < 29; i++) inverse[perm[i]] = i;
    const iv = draw() % 29;
    const payload = plain.map((p) => perm[p]);
    const cipher = side === 0 ? [iv, ...payload] : [...payload, iv];
    assert.equal(cipher.length, originalWord.length);
    const body = side === 0 ? cipher.slice(1) : suffixRemoved(cipher);
    assert.equal(collisions(body), collisions(plain));
    assert.deepEqual(body.map((c) => inverse[c]), plain);
    decoded += plain.length;
  }
  assert.equal(decoded, 10060);
  return {decoded, ivWords: words.length};
}
const plant = {
  prefix: sourceShapedPlant(0), suffix: sourceShapedPlant(1)
};
console.log(JSON.stringify({original, additiveIV, replacementIV, plant},
  null, 2));
console.log("Decision: one arbitrary edge header + independent secret word alphabet");
console.log("cannot explain ordinary GP-native words under the tested fixed and");
console.log("separate header, single-rune replacement cases. A freely variable");
console.log("edge side in the length-preserving contract overlaps the controls;");
console.log("no arbitrary-interior-header or stateful-body exclusion is claimed.");
