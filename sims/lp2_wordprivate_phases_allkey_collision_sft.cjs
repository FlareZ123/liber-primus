"use strict";
/**
 * Exhaustive SECRET-KEY-INDEPENDENT GP29 word-private m-phase collision gate.
 * Each original word and each congruence phase (j mod m) may have its own
 * arbitrarily secret 29-rune alphabet bijection. The number of same-symbol
 * pairs within a phase of a word is invariant for every 29! secret key.
 *
 * Native reference comparison only: no unknown plaintext recovered.
 * SFT: node sims/lp2_wordprivate_phases_allkey_collision_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const runes = new Map(corpus.runes.map((s, i) => [s, i]));
const words = [];
let nextWord = [];
for (const ch of raw) {
  if (runes.has(ch)) nextWord.push(runes.get(ch));
  else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
  else if (nextWord.length) {
    words.push(nextWord);
    nextWord = [];
  }
}
if (nextWord.length) words.push(nextWord);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const M = 8;
/** @param {number[]} word */
function phasePairs(word) {
  const totals = Array(M).fill(0);
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] !== word[j]) continue;
      const distance = j - i;
      for (let m = 1; m <= M; m++) if (distance % m === 0) totals[m - 1]++;
    }
  }
  return totals;
}
const original = sum(words.map(phasePairs));
assert.deepEqual(original, [811, 427, 218, 141, 106, 32, 30, 10]);
/** @param {number[][]} items */
function sum(items) {
  const out = Array(M).fill(0);
  for (const item of items) for (let i = 0; i < M; i++) out[i] += item[i];
  return out;
}
const spell = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source */
function wordToGP(source) {
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG");
  const symbols = [];
  for (let i = 0; i < normalized.length;) {
    const match = spell.find(p => normalized.startsWith(p.s, i));
    if (!match) return null;
    symbols.push(match.i);
    i += match.s.length;
  }
  return symbols;
}
/** @param {string} text */
function english(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(wordToGP).filter(a => a && a.length);
}
/** @param {string} text */
function latin(text) {
  const digits = "0123456789ABCDEFGHIJKLMNOPQRS";
  return text.split(/\r?\n/g).map(s => s.trim())
    .filter(s => /^[0-9A-S]+$/.test(s))
    .map(s => [...s].map(c => digits.indexOf(c)));
}
/** @param {string} text */
function solvedLP1(text) {
  return english(text.split(/\r?\n/g)
    .filter(line => !line.startsWith("#") && !line.startsWith("[")
      && !/^\s*\d+\s*/.test(line)).join(" "));
}
/** @param {number[][]} items */
function poolByLength(items) {
  const out = new Map();
  for (const a of items) {
    if (!out.has(a.length)) out.set(a.length, []);
    out.get(a.length).push({runes: a, pairCounts: phasePairs(a)});
  }
  for (const L of new Set(words.map(w => w.length))) {
    assert(out.has(L), "Native source lacks GP word length " + L);
  }
  return out;
}
let seed = 3301;
function nextUint() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @param {number} n */
function pick(n) {
  return Math.floor(nextUint() / 4294967296 * n);
}
/** @param {number[]} values */
function shuffle(values) {
  const out = values.slice();
  for (let k = out.length - 1; k > 0; k--) {
    const i = pick(k + 1);
    [out[k], out[i]] = [out[i], out[k]];
  }
  return out;
}
/** @param {Map<number,{runes:number[],pairCounts:number[]}[]>} pools */
function sample(pools) {
  return words.map(w => {
    const p = pools.get(w.length);
    return p[pick(p.length)];
  });
}
/** @param {number[]} list */
function describe(list) {
  const sorted = list.slice().sort((a, b) => a - b);
  return {min: sorted[0], median: sorted[Math.floor(list.length / 2)],
    max: sorted.at(-1), lowerOrEqualOriginal: 0};
}
const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", english],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", english],
  ["Emerson", "resources/control/emerson_essays_2944.txt", english],
  ["Latin Vulgate", "resources/control/latin-vulgate-gp-wholewords.txt", latin],
  ["Solved LP1", "resources/liber-primus/lp1-plaintext-reference.txt", solvedLP1]
];
const results = [];
for (const [name, file, parser] of sources) {
  const pools = poolByLength(parser(read(file)));
  const trials = [];
  for (let i = 0; i < 256; i++) {
    trials.push(sum(sample(pools).map(w => w.pairCounts)));
  }
  const distributions = Array.from({length: M}, (_, i) => {
    const v = describe(trials.map(t => t[i]));
    v.lowerOrEqualOriginal = trials.filter(t => t[i] <= original[i]).length;
    return {period: i + 1, observed: original[i], ...v};
  });
  results.push({source: name, samples: 256, periods: distributions});
  console.log("CONTROL", JSON.stringify({source: name, periods: distributions}));
}
// Positive, independently random 29! secret substitution per word, per phase.
// Exact recovered plaintext is verified at all 12,956 rune coordinates.
const m = 5;
const plain = sample(poolByLength(english(read(sources[1][1]))))
  .map(w => w.runes);
let recovered = 0;
for (const word of plain) {
  const perms = Array.from({length: m},
    () => shuffle(Array.from({length: 29}, (_, i) => i)));
  const inverses = perms.map(per => {
    const inv = Array(29);
    per.forEach((v, i) => {inv[v] = i;});
    return inv;
  });
  const cipher = word.map((v, i) => perms[i % m][v]);
  const decoded = cipher.map((v, i) => inverses[i % m][v]);
  assert.deepEqual(decoded, word);
  assert.equal(phasePairs(cipher)[m - 1], phasePairs(word)[m - 1]);
  recovered += word.length;
}
assert.equal(recovered, 12956);
const period5SupportsEnglish = results.some(r =>
  r.periods[4].lowerOrEqualOriginal > 0);
assert(period5SupportsEnglish,
  "At least one native English control must attain the original m=5 count");
console.log("DECISION", JSON.stringify({originalRunes: 12956,
  completeWords: 2896, periodCounts: original,
  sourceConditionalPeriodResults: "read measured per-source distributions above",
  period5NotExcluded: true, secretFivePhaseNativeRecovery: recovered,
  meaningfulCaveat: "Periodic phase is word-position modulo m; arbitrary dynamic phase clocks, cross-word mixing and non-native GP plaintext are outside the statement",
  results: results.map(r => ({source: r.source,
    byPeriod: r.periods.map(v => [v.period, v.min, v.median, v.max, v.lowerOrEqualOriginal])}))}));
