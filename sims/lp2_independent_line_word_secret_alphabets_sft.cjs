"use strict";

/**
 * Source-original, all-key linewise and wordwise GP29 substitution gate.
 *
 * Every printed line and every printed word may have its OWN arbitrary secret
 * 29-symbol bijection, with no key shared by different units. A bijection
 * preserves the number of equal-symbol pairs inside its unit. Permuting symbol
 * positions inside a unit preserves that count as well.
 *
 * This is a necessary-condition test on original LP2 against GP-native prose.
 * No ciphertext key or original unknown plaintext is claimed.
 *
 * SFT: node sims/lp2_independent_line_word_secret_alphabets_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const indices = new Map(gp.runes.map((r, i) => [r, i]));
const lines = raw.split(/[/%]/u).map(segment =>
  [...segment].filter(ch => indices.has(ch)).map(ch => indices.get(ch)))
  .filter(a => a.length);
/** @type {number[][]} */
const words = [];
let pending = [];
for (const ch of raw) {
  if (indices.has(ch)) {
    pending.push(indices.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Page and print-line breaks do not terminate manuscript words.
  } else if (pending.length) {
    words.push(pending);
    pending = [];
  }
}
if (pending.length) words.push(pending);
assert.deepEqual([lines.length, words.length], [594, 2896]);
const total = a => a.reduce((n, part) => n + part.length, 0);
assert.equal(total(lines), 12956);
assert.equal(total(words), 12956);
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(lines.flat(), original);
assert.deepEqual(words.flat(), original);
const choose2 = n => n * (n - 1) / 2;
/** @param {number[][]} units */
function collisions(units) {
  let same = 0;
  let pairs = 0;
  for (const unit of units) {
    const counts = Array(29).fill(0);
    for (const rune of unit) counts[rune]++;
    same += counts.reduce((n, count) => n + choose2(count), 0);
    pairs += choose2(unit.length);
  }
  return {same, pairs, rate: same / pairs};
}
const observed = {line: collisions(lines), word: collisions(words)};
assert.deepEqual([observed.line.same, observed.line.pairs,
  observed.word.same, observed.word.pairs], [4358, 136831, 811, 30281]);

// The control mapping follows the native GP word-shape benchmark. It is
// deliberately different from literal English orthography and is pinned here.
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function nativeWords(text) {
  const out = [];
  for (let term of text.toUpperCase().match(/[A-Z]+/g) || []) {
    term = term.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG");
    const symbols = [];
    for (let cursor = 0; cursor < term.length;) {
      const token = tokens.find(t => term.startsWith(t.s, cursor));
      assert(token, "unmapped GP spelling: " + term);
      symbols.push(token.i);
      cursor += token.s.length;
    }
    out.push(symbols);
  }
  return out;
}
/** @param {number[]} values */
function describe(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {n: values.length, min: sorted[0],
    median: sorted[Math.floor(values.length / 2)],
    max: sorted.at(-1),
    mean: values.reduce((s, x) => s + x, 0) / values.length};
}
/** @param {number[]} input @param {number[][]} units */
function repartition(input, units) {
  let at = 0;
  const out = units.map(unit => {
    const slice = input.slice(at, at += unit.length);
    assert.equal(slice.length, unit.length);
    return slice;
  });
  assert.equal(at, input.length);
  return out;
}
let seed = 0x3301a033;
function random32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @returns {number[]} */
function permutation() {
  const a = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random32() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** @param {number[][]} units */
function encryptedPlant(units) {
  const table = units.map(permutation);
  const enc = units.map((word, i) => word.map(x => table[i][x]));
  const inverse = table.map(perm => {
    const inv = Array(29).fill(-1);
    for (let k = 0; k < 29; k++) inv[perm[k]] = k;
    return inv;
  });
  const dec = enc.map((unit, i) => unit.map(x => inverse[i][x]));
  assert.deepEqual(dec, units);
  assert.deepEqual(collisions(enc), collisions(units));
  return {secretTables: table.length, recovered: total(dec),
    samePairs: collisions(enc).same};
}
const corpusFiles = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const reference = {};
let controlPlant = null;
for (const [name, file] of corpusFiles) {
  const wordPool = nativeWords(read(file));
  const flat = wordPool.flat();
  if (controlPlant === null) controlPlant = flat.slice(0, 12956);
  const lineWindows = [], wordWindows = [];
  for (let start = 0; start + 12956 <= flat.length; start += 6478) {
    const candidate = flat.slice(start, start + 12956);
    lineWindows.push(collisions(repartition(candidate, lines)).same);
    wordWindows.push(collisions(repartition(candidate, words)).same);
  }
  const byLength = new Map();
  for (const unit of wordPool) {
    if (!byLength.has(unit.length)) byLength.set(unit.length, []);
    byLength.get(unit.length).push(unit);
  }
  const matchedWordTrials = [];
  for (let trial = 0; trial < 500; trial++) {
    const sample = words.map(sourceWord => {
      const pool = byLength.get(sourceWord.length);
      assert(pool && pool.length, "missing length " + sourceWord.length);
      return pool[random32() % pool.length];
    });
    matchedWordTrials.push(collisions(sample).same);
  }
  assert(lineWindows.length > 0);
  assert(wordWindows.length > 0);
  reference[name] = {
    nativeRunes: flat.length,
    lineWindows: describe(lineWindows),
    wordWindows: describe(wordWindows),
    exactWordLength: describe(matchedWordTrials)
  };
  assert(Math.min(...lineWindows) > observed.line.same);
  assert(Math.min(...wordWindows) > observed.word.same);
  assert(Math.min(...matchedWordTrials) > observed.word.same);
}
// Cross-check the exact word-length result against source-author prose, not
// only independent literary controls. The LP1 editor-normalized reference has
// annotations and duplicate page summaries: use selected textual sections,
// drop bracketed/editorial lines, and add the authentic solved LP2 p57 runes.
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const parts = lp1.split(/^###\s+(\d+)/m);
const sections = new Set([1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
/** @type {number[][]} */
const authorWords = [];
for (let i = 1; i + 1 < parts.length; i += 2) {
  if (!sections.has(Number(parts[i]))) continue;
  const originalText = parts[i + 1].split("\n")
    .filter(line => !line.trim().startsWith("[") &&
      !line.trim().startsWith("#")).join(" ");
  authorWords.push(...nativeWords(originalText));
}
const solvedP57 = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").at(-1);
let sourceTerm = [];
for (const ch of solvedP57) {
  if (indices.has(ch)) sourceTerm.push(indices.get(ch));
  else if (ch === "/" || /\s/u.test(ch)) {
    // Layout break inside a printed word.
  } else if (sourceTerm.length) {
    authorWords.push(sourceTerm);
    sourceTerm = [];
  }
}
if (sourceTerm.length) authorWords.push(sourceTerm);
assert.equal(authorWords.filter(w => w.length).length, authorWords.length);
const authorPool = new Map();
for (const term of authorWords) {
  if (!authorPool.has(term.length)) authorPool.set(term.length, []);
  authorPool.get(term.length).push(term);
}
const authorMatched = [];
for (let trial = 0; trial < 1200; trial++) {
  const sample = words.map(sourceWord => {
    const list = authorPool.get(sourceWord.length);
    assert(list && list.length, "source-author register missing length " +
      sourceWord.length);
    return list[random32() % list.length];
  });
  authorMatched.push(collisions(sample).same);
}
assert(Math.min(...authorMatched) > observed.word.same);
reference["Cicada LP1 solved + LP2 p57 solved"] = {
  authenticSourceWords: authorWords.length,
  exactWordLength: describe(authorMatched)
};
const planted = {
  independentLineAlphabets: encryptedPlant(repartition(controlPlant, lines)),
  independentWordAlphabets: encryptedPlant(repartition(controlPlant, words))
};
assert.deepEqual([planted.independentLineAlphabets.secretTables,
  planted.independentWordAlphabets.secretTables], [594, 2896]);
console.log(JSON.stringify({
  scope: "GP29 English, unchanged original LP2 page/word/line boundaries",
  runes: original.length, lines: lines.length, words: words.length,
  original: observed, controls: reference, planted
}, null, 2));
