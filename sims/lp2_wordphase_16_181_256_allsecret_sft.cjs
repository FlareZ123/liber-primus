"use strict";

/**
 * LP2 source period16/181/256/362 whole-word-key all-secret majorization SFT.
 * Read-only Node.js 22 / Windows 11.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const parsed = parseLP2Words(transcript, 55);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
const map = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const words = parsed.words.map(word => [...word.runes].map(glyph => {
  const value = map.get(glyph);
  assert.notEqual(value, undefined);
  return value;
}));
const actual = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(actual.length, 12956);
assert.deepEqual(words.flat(), actual);
const len = actual.length;
const wordLengths = words.map(w => w.length);
assert.equal(wordLengths.reduce((s, n) => s + n, 0), 12956);
assert.equal(16 * 181, words.length);
assert.equal(8 * 362, words.length);
const sourceClocks = [
  {label: "p15 original 16-cell square / word period16", period: 16,
    expected: [635, 1223, 1790, 2338], rejectAtK: 4},
  {label: "16-by-181 complete-word rectangle / word period181", period: 181,
    expected: [1063, 1988, 2839, 3624], rejectAtK: 4},
  {label: "p50 original 256-byte table / word period256", period: 256,
    expected: [1226, 2250, 3170, 4021], rejectAtK: 4},
  {label: "p50 eight printed columns / word period362", period: 362,
    expected: [1377, 2536, 3553, 4471], rejectAtK: 1}
];
/**
 * The sharp concentration bound under arbitrary independent fixed
 * source-word phase bijections. A separate unknown permutation of all 29
 * symbols is allowed for every one of p phase classes, no matter the key.
 *
 * @param {number[][]} sourceWords
 * @param {number} period
 */
function phaseCapacity(sourceWords, period) {
  const states = Array.from({length: period}, () => new Uint16Array(29));
  sourceWords.forEach((word, index) => {
    const row = states[index % period];
    for (const r of word) row[r]++;
  });
  const bounds = Array.from({length: 4}, (_, k) =>
    states.reduce((sum, row) =>
      sum + [...row].sort((a, b) => b - a).slice(0, k + 1)
        .reduce((a, b) => a + b, 0), 0));
  let collisions = 0, pairs = 0;
  for (const row of states) {
    const n = row.reduce((s, x) => s + x, 0);
    pairs += n * (n - 1);
    collisions += [...row].reduce((s, x) => s + x * (x - 1), 0);
  }
  return {period, bounds, phaseIoC: collisions / pairs, pairs};
}
const gpToken = corpus.translit.map((token, digit) => ({token, digit}))
  .sort((a, b) => b.token.length - a.token.length);
/** Source-calibrated runic orthography, from authenticated solved LP1. */
function nativeGP(english) {
  const normal = english.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of normal.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      if (word.startsWith("ING", j)) {out.push(21); j += 3;}
      else if (word.startsWith("IO", j)) {out.push(27); j += 2;}
      else {
        const match = gpToken.find(x => word.startsWith(x.token, j));
        assert.ok(match, "GP29 orthography mismatch");
        out.push(match.digit);
        j += match.token.length;
      }
    }
  }
  return out;
}
/** @param {number[]} indices */
function topK(indices, k) {
  const count = new Uint32Array(29);
  for (const value of indices) count[value]++;
  return [...count].sort((a, b) => b - a).slice(0, k)
    .reduce((a, b) => a + b, 0);
}
const donors = [
  {name: "Gibran", value: nativeGP(read("resources/control/gibran_prophet_58585.txt")),
    expectedLength: 62492, expectedWindows: 99, expectedMinimum: [1423, 4373]},
  {name: "Shakespeare", value: nativeGP(read("resources/control/shakespeare_first300k.txt")),
    expectedLength: 217106, expectedWindows: 406, expectedMinimum: [1409, 4266]}
];
for (const donor of donors) {
  assert.equal(donor.value.length, donor.expectedLength);
  const scores = [[], []];
  for (let start = 0; start + len <= donor.value.length; start += 503) {
    const window = donor.value.slice(start, start + len);
    scores[0].push(topK(window, 1));
    scores[1].push(topK(window, 4));
  }
  assert.equal(scores[0].length, donor.expectedWindows);
  const minima = scores.map(v => Math.min(...v));
  assert.deepEqual(minima, donor.expectedMinimum);
  donor.minimum = minima;
}

/**
 * Deterministic arbitrary unknown permutation positive control. It
 * validates exactly 2896 original printed word frames, 12956 GP symbols,
 * and every source-nominated periodic alphabet key space.
 * @param {number[]} plaintext
 * @param {number} period
 * @param {number} seed
 */
function roundtrip(plaintext, period, seed) {
  let state = seed >>> 0;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const masks = Array.from({length: period}, () => {
    const perm = Array.from({length: 29}, (_, i) => i);
    for (let j = 28; j > 0; j--) {
      const k = random() % (j + 1);
      [perm[k], perm[j]] = [perm[j], perm[k]];
    }
    const inverse = Array(29);
    perm.forEach((value, i) => inverse[value] = i);
    return {perm, inverse};
  });
  const encrypted = [], decrypted = [];
  let cursor = 0;
  wordLengths.forEach((length, w) => {
    const mask = masks[w % period];
    for (let j = 0; j < length; j++) {
      const c = mask.perm[plaintext[cursor++]];
      encrypted.push(c);
      decrypted.push(mask.inverse[c]);
    }
  });
  assert.equal(cursor, len);
  assert.deepEqual(decrypted, plaintext);
  const originalTop4 = topK(plaintext, 4);
  const upper = phaseCapacity(wordLengths.map((L, i) => {
    const start = wordLengths.slice(0, i).reduce((a, b) => a + b, 0);
    return encrypted.slice(start, start + L);
  }), period).bounds[3];
  assert.ok(upper >= originalTop4);
  return {originalTop4, upper, recovered: decrypted.length};
}

const records = [];
for (const variant of sourceClocks) {
  const candidate = phaseCapacity(words, variant.period);
  assert.deepEqual(candidate.bounds, variant.expected);
  const k = variant.rejectAtK;
  assert.ok(donors.every(d => candidate.bounds[k - 1] < d.minimum[k === 1 ? 0 : 1]),
    "all-secret table cannot have enough native GP top-k symbols");
  const plant = roundtrip(donors[0].value.slice(0, len), variant.period,
    (0x33010000 + variant.period) >>> 0);
  records.push({label: variant.label, ...candidate, rejectAtK: k,
    sourceBoundShare: candidate.bounds[k - 1] / len,
    fullNativePlant: plant});
}
console.log("PASS LP2 period16/181/256/362 all-secret source word-key rejection");
console.log(JSON.stringify({
  sourceWords: words.length, sourceRunes: len, crossPageWords: parsed.crossPageWords,
  references: donors.map(d => ({source: d.name, totalRunes: d.value.length,
    windows: d.expectedWindows, minimumTop1: d.minimum[0],
    minimumTop4: d.minimum[1],
    minimumTop1Share: d.minimum[0] / len,
    minimumTop4Share: d.minimum[1] / len})),
  records
}, null, 2));
