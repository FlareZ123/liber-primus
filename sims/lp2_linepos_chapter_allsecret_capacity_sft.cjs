"use strict";

/**
 * Exact all-secret original LP2 invariant for a repeated line-position GP29
 * alphabet: C[chapter,line,column] = permutation[chapter,column](P[...]).
 * Every arbitrary 29! permutation is allowed per visible chapter and column.
 * This covers repeated per-line Vigenere shifts as a strict special case.
 *
 * Run: node sims/lp2_linepos_chapter_allsecret_capacity_sft.cjs
 * All source reads are read-only; no original key or plaintext is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rune = new Map(gp.runes.map((x, i) => [x, i]));
const starts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const pageTexts = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55); // Runeless physical p50 is omitted.
assert.equal(pageTexts.length, 55);
const chapters = Array.from({length: 9}, () => []);
for (let p = 0; p < pageTexts.length; p++) {
  const physical = p < 50 ? p : p + 1;
  const group = starts.findIndex((start, i) => i < 9 &&
    physical >= start && physical < starts[i + 1]);
  assert.ok(group >= 0);
  for (const line of pageTexts[p].split("/")) {
    const row = [...line].filter(ch => rune.has(ch)).map(ch => rune.get(ch));
    if (row.length) chapters[group].push(row);
  }
}
const allLines = chapters.flat();
const total = allLines.flat().length;
assert.deepEqual([total, allLines.length], [12956, 594]);
assert.deepEqual(allLines.flat(), gp.pages.slice(0, 56).flatMap(p => p.indices));
assert.deepEqual(chapters.map(x => x.flat().length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.deepEqual(chapters.map(x => x.length),
  [33, 55, 79, 86, 46, 65, 80, 135, 15]);

/**
 * Independent secret permutation in every group-by-column cell preserves
 * within-cell equal-pair count, and the maximum multiplicity of any one
 * plaintext symbol is bounded by the sum of the largest cell counts.
 * @param {number[][][]} groups
 */
function profile(groups) {
  let same = 0, possible = 0, capacity = 0;
  const byGroup = [];
  for (const lines of groups) {
    const width = Math.max(...lines.map(x => x.length));
    const cells = Array.from({length: width}, () => Array(29).fill(0));
    for (const line of lines)
      line.forEach((rune, j) => { cells[j][rune]++; });
    let groupMax = 0;
    for (const cell of cells) {
      const n = cell.reduce((a, b) => a + b, 0);
      same += cell.reduce((a, b) => a + b * (b - 1) / 2, 0);
      possible += n * (n - 1) / 2;
      groupMax += Math.max(...cell);
    }
    byGroup.push(groupMax);
    capacity += groupMax;
  }
  return {same, possible, rate: same / possible, capacity, byGroup};
}
const observed = {global: profile([allLines]), chapters: profile(chapters)};
assert.deepEqual([observed.global.same, observed.global.possible,
  observed.global.capacity, observed.chapters.same,
  observed.chapters.possible, observed.chapters.capacity],
  [126508, 3638562, 684, 17600, 503168, 1177]);
assert.deepEqual(observed.chapters.byGroup,
  [88, 114, 152, 158, 108, 130, 146, 226, 55]);

const tokens = gp.translit.map((value, i) => ({value, i}))
  .sort((a, b) => b.value.length - a.value.length);
/**
 * Native GP English normalization used by repo controls; the second mode
 * also treats original-source single-rune IO as IA.
 * @param {string} source
 * @param {boolean} sourceIO
 */
function native(source, sourceIO) {
  const result = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG");
    if (sourceIO) word = word.replace(/IO/g, "IA");
    for (let i = 0; i < word.length;) {
      const t = tokens.find(x => word.startsWith(x.value, i));
      assert.ok(t, "unmapped GP source token");
      result.push(t.i);
      i += t.value.length;
    }
  }
  return result;
}
/** @param {number[]} tape */
function partition(tape) {
  let pos = 0;
  const groups = chapters.map(lines => lines.map(line => {
    const value = tape.slice(pos, pos + line.length);
    pos += line.length;
    assert.equal(value.length, line.length);
    return value;
  }));
  assert.equal(pos, tape.length);
  return groups;
}
/** @param {number[]} series */
function summary(series) {
  const values = [...series].sort((a, b) => a - b);
  return {n: values.length, min: values[0],
    median: values[Math.floor(values.length / 2)], max: values.at(-1)};
}

const references = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const e = gp.translit.indexOf("E");
assert.equal(e, 18);
const controls = {};
let plantTape = null;
for (const [name, file] of references) {
  controls[name] = {};
  for (const sourceIO of [false, true]) {
    const flat = native(read(file), sourceIO);
    const E = [], shared = [], chapter = [];
    for (let k = 0; k + total <= flat.length; k += total) {
      const tape = flat.slice(k, k + total);
      if (plantTape === null) plantTape = tape;
      const grouped = partition(tape);
      E.push(tape.filter(x => x === e).length);
      shared.push(profile([grouped.flat()]).rate);
      chapter.push(profile(grouped).rate);
    }
    assert.ok(E.length);
    assert.ok(E.every(n => n > observed.chapters.capacity));
    assert.ok(chapter.every(n => n > observed.chapters.rate));
    controls[name][sourceIO ? "originalIO" : "legacyIO"] = {
      nativeRunes: flat.length, E: summary(E),
      originalLinePositionRates: summary(shared),
      nineChapterLinePositionRates: summary(chapter)
    };
  }
}
assert.ok(plantTape && plantTape.length === total);

let seed = 0x3301cafe;
/** @returns {number} */
function random32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @returns {number[]} */
function permutation() {
  const result = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random32() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
/**
 * Plant/recover an entire 12956-rune authentic-length tape with independent
 * hidden permutation tables at every line position and optional chapter.
 * @param {number[][][]} groups
 * @param {boolean} chapterKeys
 */
function plant(groups, chapterKeys) {
  const tables = (chapterKeys ? groups : [groups.flat()]).map(lines =>
    Array.from({length: Math.max(...lines.map(x => x.length))},
      permutation));
  const cipher = groups.map((lines, g) => lines.map(line =>
    line.map((rune, j) => tables[chapterKeys ? g : 0][j][rune])));
  const inverses = tables.map(cols => cols.map(col => {
    const inv = Array(29).fill(-1);
    col.forEach((rune, i) => { inv[rune] = i; });
    return inv;
  }));
  const plain = cipher.map((lines, g) => lines.map(line =>
    line.map((rune, j) => inverses[chapterKeys ? g : 0][j][rune])));
  assert.deepEqual(plain, groups);
  const outputProfile = profile(chapterKeys ? cipher : [cipher.flat()]);
  const inputProfile = profile(chapterKeys ? groups : [groups.flat()]);
  assert.deepEqual(outputProfile, inputProfile);
  return {recovered: plain.flat().flat().length,
    secretPermutations: tables.reduce((n, x) => n + x.length, 0),
    preservedCapacity: outputProfile.capacity};
}
const planted = partition(plantTape);
const positive = {
  global: plant(planted, false),
  chapterSpecific: plant(planted, true)
};
assert.deepEqual([positive.global.recovered, positive.chapterSpecific.recovered],
  [12956, 12956]);
console.log(JSON.stringify({
  classification: "source-native conditional all-key exclusion, no decrypt",
  original: {runes: total, lines: allLines.length, observed},
  controls, positive,
  exclusions: "repeated unknown GP29 position-specific key per printed line, one global key or nine independently keyed source-visible chapters",
  exceptions: "independently keyed lines/pages, changing state, nonnative prose, altered original text and intermediary transport",
}, null, 2));
