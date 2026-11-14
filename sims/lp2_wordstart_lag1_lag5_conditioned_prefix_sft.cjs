"use strict";
/**
 * LP2 original word-start English-prefix sensitivity under an exact
 * adjacent/lag5-repeat-position-preserving Markov-chain null.
 * Node.js 22, CommonJS, no dependencies or file writes.
 * Source vocabulary is three previously pinned literary controls.
 * Exploratory tests are not plaintext identifications.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const sourcePaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const ciphertext = gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);
const rune = new Map(gp.runes.map((r, i) => [r, i]));
const starts = [], parsed = [];
let withinWord = false;
for (const char of [...text]) {
  if (rune.has(char)) {
    if (!withinWord) starts.push(parsed.length);
    withinWord = true;
    parsed.push(rune.get(char));
  } else if ("-.$&§".includes(char)) {
    withinWord = false;
  }
}
assert.deepEqual(parsed.slice(0, 12956), ciphertext);
const eligibleStarts = starts.filter((k) => k + 3 < ciphertext.length);
assert.equal(starts.filter((k) => k < ciphertext.length).length, 2896);
assert.equal(eligibleStarts.length, 2895);
const digraph = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const runeOf = new Map(gp.translit.map((s, i) => [s, i]));
function encodeWord(w) {
  w = w.toUpperCase().replace(/QU/g, "CW").replace(/ING/g, "NG")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < w.length;) {
    const token = digraph.find((d) => w.startsWith(d, i)) || w[i];
    if (!runeOf.has(token)) return [];
    out.push(runeOf.get(token));
    i += token.length;
  }
  return out;
}
const encodeFour = (a, k = 0) =>
  ((a[k] * 29 + a[k + 1]) * 29 + a[k + 2]) * 29 + a[k + 3];
const dictionaries = sourcePaths.map((p) => {
  const dict = new Set();
  for (const m of read(p).matchAll(/[A-Za-z]{4,}/g)) {
    const v = encodeWord(m[0]);
    if (v.length >= 4) dict.add(encodeFour(v));
  }
  return dict;
});
const union = new Set(dictionaries.flatMap((d) => [...d]));
assert.deepEqual(dictionaries.map((d) => d.size), [2741, 1395, 3549]);
assert.equal(union.size, 4369);
const sets = [...dictionaries, union];
function score(a) {
  const v = Array(sets.length).fill(0);
  for (const start of eligibleStarts) {
    const code = encodeFour(a, start);
    for (let j = 0; j < sets.length; j++) if (sets[j].has(code)) v[j]++;
  }
  return v;
}
const originalScores = score(ciphertext);
assert.deepEqual(originalScores, [18, 9, 22, 26]);
const pageOffsets = [];
let offset = 0;
for (const p of gp.pages.filter((p) => p.page <= 55)) {
  if (p.indices.length > 1) pageOffsets.push([offset, p.indices.length]);
  offset += p.indices.length;
}
assert.equal(pageOffsets.length, 55);
const sample = ciphertext.slice();
let seed = 0x18053301 >>> 0;
function randomU32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** Swap two runes only if *every* originally observed lag1/lag5
 * equality marker at affected positions is left unchanged.
 * All page rune multisets, delimiters, and word boundaries remain fixed.
 */
function trySwap() {
  const [off, n] = pageOffsets[randomU32() % pageOffsets.length];
  const i = off + randomU32() % n;
  const j = off + randomU32() % n;
  if (i === j || sample[i] === sample[j]) return false;
  const vi = sample[i], vj = sample[j];
  sample[i] = vj;
  sample[j] = vi;
  for (const lag of [1, 5]) {
    for (const t of [i, i - lag, j, j - lag]) {
      if (t < off || t + lag >= off + n) continue;
      if ((sample[t] === sample[t + lag]) !==
          (ciphertext[t] === ciphertext[t + lag])) {
        sample[i] = vi;
        sample[j] = vj;
        return false;
      }
    }
  }
  return true;
}
const burn = 100000, samples = 350, thinning = 14000;
let accepted = 0;
for (let i = 0; i < burn; i++) if (trySwap()) accepted++;
const sums = Array(4).fill(0), exceed = Array(4).fill(0);
const min = Array(4).fill(Infinity), max = Array(4).fill(-Infinity);
for (let trial = 0; trial < samples; trial++) {
  for (let k = 0; k < thinning; k++) if (trySwap()) accepted++;
  const v = score(sample);
  for (let j = 0; j < 4; j++) {
    sums[j] += v[j];
    if (v[j] >= originalScores[j]) exceed[j]++;
    min[j] = Math.min(min[j], v[j]);
    max[j] = Math.max(max[j], v[j]);
  }
}
assert.deepEqual(exceed, [9, 39, 14, 14]);
const result = {
  input: "original 12956 runes; unchanged physical word-starts; 55 nonempty pages",
  controls: sourcePaths,
  runicWordStarts: 2896,
  eligibleFourRuneStarts: 2895,
  vocabularyPrefixCounts: dictionaries.map((d) => d.size).concat(union.size),
  originalScores,
  conditionedEqualityLags: [1, 5],
  conditioning: "exact position of every within-page adjacent and lag5 duplicate",
  burn, samples, thinning, accepted,
  nullMean: sums.map((v) => v / samples),
  nullMinimum: min,
  nullMaximum: max,
  greaterOrEqual: exceed,
  plusOneUpperTail: exceed.map((v) => (v + 1) / (samples + 1))
};
console.log(JSON.stringify(result, null, 2));
