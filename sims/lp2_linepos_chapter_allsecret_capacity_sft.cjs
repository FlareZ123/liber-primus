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
const originalChapterRates = chapters.map(group => profile([group]).rate);
assert.deepEqual([observed.global.same, observed.global.possible,
  observed.global.capacity, observed.chapters.same,
  observed.chapters.possible, observed.chapters.capacity],
  [126508, 3638562, 684, 17600, 503168, 1177]);
assert.deepEqual(observed.chapters.byGroup,
  [88, 114, 152, 158, 108, 130, 146, 226, 55]);


// Source-visible red thirteen-dot punctuation can reset the positional
// alphabet inside a printed line. Grant that stronger, human-motivated
// reset rule exactly: each red-13 interior mark starts a new line-column
// clock, in addition to every ordinary line/chapter start. No mark site
// is fitted to language or inferred from ciphertext.
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const red13Chapters = Array.from({length: 9}, () => []);
let insideRed13 = 0;
let allRed13 = 0;
for (let p = 0; p < pageTexts.length; p++) {
  const physical = p < 50 ? p : p + 1;
  const chapter = starts.findIndex((start, g) =>
    g < 9 && physical >= start && physical < starts[g + 1]);
  const sourcePage = ink.pages.find(page => page.page === physical);
  const marked = (sourcePage?.large_punctuation || []).filter(
    entry => entry[1] === 13 && entry[2] === "red");
  allRed13 += marked.length;
  const lines = pageTexts[p].split("/").map(line =>
    [...line].filter(glyph => rune.has(glyph)).map(glyph => rune.get(glyph)))
    .filter(line => line.length);
  let offset = 0;
  for (const line of lines) {
    const breaks = marked.filter(mark => mark[0] > offset &&
      mark[0] < offset + line.length)
      .map(mark => mark[0] - offset).sort((a, b) => a - b);
    insideRed13 += breaks.length;
    let start = 0;
    for (const end of [...breaks, line.length]) {
      if (end > start) red13Chapters[chapter].push(line.slice(start, end));
      start = end;
    }
    offset += line.length;
  }
}
assert.equal(allRed13, 27);
assert.equal(insideRed13, 11);
assert.equal(red13Chapters.flat().length, 605);
assert.deepEqual(red13Chapters.flat().flat(), allLines.flat());
const markedObserved = profile(red13Chapters);
assert.deepEqual([
  markedObserved.same, markedObserved.possible, markedObserved.capacity
], [17647, 503465, 1177]);

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
    const minPerChapter = chapters.map(() => Infinity);
    for (let k = 0; k + total <= flat.length; k += total) {
      const tape = flat.slice(k, k + total);
      if (plantTape === null) plantTape = tape;
      const grouped = partition(tape);
      E.push(tape.filter(x => x === e).length);
      shared.push(profile([grouped.flat()]).rate);
      chapter.push(profile(grouped).rate);
      grouped.forEach((lines, index) => {
        minPerChapter[index] = Math.min(minPerChapter[index], profile([lines]).rate);
      });
    }
    assert.ok(E.length);
    assert.ok(E.every(n => n > observed.chapters.capacity));
    assert.ok(chapter.every(n => n > observed.chapters.rate));
    assert.ok(minPerChapter.every((value, index) => value > originalChapterRates[index]));
    controls[name][sourceIO ? "originalIO" : "legacyIO"] = {
      nativeRunes: flat.length, E: summary(E),
      originalLinePositionRates: summary(shared),
      nineChapterLinePositionRates: summary(chapter),
      minimumEachChapterSamePositionRate: minPerChapter
    };
  }
}
assert.ok(plantTape && plantTape.length === total);


// Independent historically plausible registers: normalized Latin Vulgate and
// original-sourced Old English Beowulf, already pinned in repository controls.
// These are genuinely GP29-encoded sequences, with distinct digit alphabets.
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).map(line => line.trim())
  .filter(line => /^[0-9A-S]+$/.test(line));
assert.equal(latinWords.length, 39835);
const latinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const latin = [...latinWords.join("")].map(r => latinAlphabet.indexOf(r));
assert.equal(latin.length, 204802);
assert.ok(latin.every(value => value >= 0));

const beowulf = JSON.parse(read(
  "resources/control/beowulf_oe_gp_profile_corrected.json"));
const oldEnglish = [...beowulf.sourceGpBase29].map(
  rune => beowulf.positiveControlAlphabet.indexOf(rune));
assert.equal(oldEnglish.length, 48012);
assert.ok(oldEnglish.every(value => value >= 0));
assert.equal(oldEnglish.filter(value => value === e).length,
  beowulf.allGpCounts[e]);

const alternateRegisters = {};
for (const [name, tape] of [
  ["LatinVulgate", latin], ["OldEnglishBeowulf", oldEnglish]
]) {
  const E = [], chapterRate = [];
  for (let k = 0; k + total <= tape.length; k += total) {
    const window = tape.slice(k, k + total);
    E.push(window.filter(value => value === e).length);
    chapterRate.push(profile(partition(window)).rate);
  }
  assert.ok(E.length);
  assert.ok(E.every(n => n > observed.chapters.capacity));
  assert.ok(chapterRate.every(n => n > observed.chapters.rate));
  alternateRegisters[name] = {
    nativeRunes: tape.length, E: summary(E),
    nineChapterLinePositionRates: summary(chapterRate)
  };
}
assert.deepEqual([
  alternateRegisters.LatinVulgate.E.n,
  alternateRegisters.LatinVulgate.E.min,
  alternateRegisters.OldEnglishBeowulf.E.n,
  alternateRegisters.OldEnglishBeowulf.E.min
], [15, 1381, 3, 1480]);


// Stronger source-plaintext controls: preserve all 2896 genuine printed
// word lengths, including words that span original line or page breaks.
const transcription = pageTexts.join("%");
const originalWords = [];
let pendingWord = [];
for (const glyph of transcription) {
  if (rune.has(glyph)) {
    pendingWord.push(rune.get(glyph));
  } else if (glyph === "%" || glyph === "/" || /\s/u.test(glyph)) {
    // Physical layout wraps do not end a printed word.
  } else if (pendingWord.length) {
    originalWords.push(pendingWord);
    pendingWord = [];
  }
}
if (pendingWord.length) originalWords.push(pendingWord);
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.flat().length, 12956);
assert.deepEqual(originalWords.flat(), allLines.flat());
const wordCounts = originalWords.map(w => w.length);
assert.equal(Math.max(...wordCounts), 14);

let wordSamplingSeed = 0x3301aa6d;
/** @returns {number} */
function nextWordRandom() {
  wordSamplingSeed = (Math.imul(wordSamplingSeed, 1664525) +
    1013904223) >>> 0;
  return wordSamplingSeed;
}
const shapeMatchedControls = {};
for (const [name, file] of [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
]) {
  const buckets = Array.from({length: 15}, () => []);
  const sourceWords = read(file).toUpperCase().match(/[A-Z]+/g) || [];
  for (const sourceWord of sourceWords) {
    const term = native(sourceWord, true); // source-calibrated IO rune.
    if (term.length > 0 && term.length <= 14) {
      buckets[term.length].push(term);
    }
  }
  const E = [], rates = [];
  for (let trial = 0; trial < 500; trial++) {
    const selected = originalWords.map(w => {
      const candidates = buckets[w.length];
      assert.ok(candidates && candidates.length,
        "No source-native word of length " + w.length);
      return candidates[nextWordRandom() % candidates.length];
    });
    const tape = selected.flat();
    assert.equal(tape.length, total);
    E.push(tape.filter(x => x === e).length);
    rates.push(profile(partition(tape)).rate);
  }
  assert.ok(E.every(n => n > observed.chapters.capacity));
  assert.ok(rates.every(n => n > observed.chapters.rate));
  shapeMatchedControls[name] = {
    trials: E.length, independentNativeWords: sourceWords.length,
    E: summary(E), nineChapterLinePositionRates: summary(rates)
  };
}
assert.deepEqual([
  shapeMatchedControls.Shakespeare.E.min,
  shapeMatchedControls.Gibran.E.min,
  shapeMatchedControls.Emerson.E.min
], [1451, 1454, 1464]);

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

// Exact dynamic program over ALL extra physical-page-boundary resets.
// The nine red-marked chapter starts are compulsory group boundaries.
// We ask how many additional (visually unmarked) page cuts are necessary
// to give the same secret line-position alphabet family enough per-rune
// capacity even to represent the least E-heavy of the native controls.
const pageGroups = Array.from({length: 9}, () => []);
for (let i = 0; i < pageTexts.length; i++) {
  const physical = i < 50 ? i : i + 1;
  const chapter = starts.findIndex((start, g) =>
    g < 9 && physical >= start && physical < starts[g + 1]);
  const pageLines = pageTexts[i].split("/")
    .map(line => [...line].filter(ch => rune.has(ch)).map(ch => rune.get(ch)))
    .filter(line => line.length);
  pageGroups[chapter].push({page: physical, lines: pageLines});
}
/** @type {{capacity:number, cuts:number[]}[]} */
let frontier = [{capacity: 0, cuts: []}];
for (const pages of pageGroups) {
  const n = pages.length;
  // Local DP: exact maximum with k groups ending after page e.
  const dp = Array.from({length: n + 1}, () =>
    Array(n + 1).fill(null));
  dp[0][0] = {capacity: 0, cuts: []};
  for (let k = 1; k <= n; k++) {
    for (let end = k; end <= n; end++) {
      for (let begin = k - 1; begin < end; begin++) {
        const previous = dp[k - 1][begin];
        if (!previous) continue;
        const slice = pages.slice(begin, end);
        const value = previous.capacity +
          profile([slice.flatMap(page => page.lines)]).capacity;
        if (!dp[k][end] || value > dp[k][end].capacity) {
          dp[k][end] = {capacity: value, cuts: [
            ...previous.cuts, pages[end - 1].page
          ]};
        }
      }
    }
  }
  const next = [];
  for (let priorCount = 0; priorCount < frontier.length; priorCount++) {
    const state = frontier[priorCount];
    if (!state) continue;
    for (let localCount = 1; localCount <= n; localCount++) {
      const local = dp[localCount][n];
      if (!local) continue;
      const count = priorCount + localCount;
      const capacity = state.capacity + local.capacity;
      if (!next[count] || capacity > next[count].capacity) {
        next[count] = {capacity, cuts: [...state.cuts, ...local.cuts]};
      }
    }
  }
  frontier = next;
}
assert.equal(frontier[9].capacity, observed.chapters.capacity);
assert.deepEqual(frontier.slice(9, 17).map(v => v.capacity),
  [1177, 1231, 1279, 1326, 1368, 1410, 1451, 1490]);
assert.ok(frontier[15].capacity < 1458);
assert.ok(frontier[16].capacity >= 1458);
// Independently exhaust all four contiguous partitions of p0-p2 to
// confirm the local DP's endpoints rather than trusting a recurrence.
const firstPages = pageGroups[0];
const localBrute = [];
for (let mask = 0; mask < (1 << (firstPages.length - 1)); mask++) {
  const groups = [];
  let start = 0;
  for (let b = 0; b < firstPages.length; b++) {
    if (b === firstPages.length - 1 || (mask & (1 << b))) {
      groups.push(firstPages.slice(start, b + 1)
        .flatMap(page => page.lines));
      start = b + 1;
    }
  }
  localBrute.push({groups: groups.length, capacity: profile(groups).capacity});
}
const allTwo = localBrute.filter(x => x.groups === 2);
assert.equal(Math.max(...allTwo.map(x => x.capacity)), 116);
// The 16-domain witness respects the already-pinned nine boundaries.
const linePositionResetLowerBound = {
  minVisibleChapterDomains: 9,
  minAdditionalUnmarkedPageCutsToReach1458E: 7,
  minDomainsToReach1458E: 16,
  domainCapacityFrontier9Through16: frontier.slice(9, 17)
    .map((state, i) => ({domains: i + 9, capacity: state.capacity})),
  maximizer16PageEnds: frontier[16].cuts
};

console.log(JSON.stringify({
  classification: "source-native conditional all-key exclusion, no decrypt",
  original: {runes: total, lines: allLines.length, observed, originalChapterRates},
  controls, alternateRegisters, shapeMatchedControls, markedSourceReset: {allRed13, insideRed13, segmentCount: red13Chapters.flat().length, markedObserved}, positive, linePositionResetLowerBound,
  exclusions: "repeated unknown GP29 position-specific key per printed line, one global key or nine independently keyed source-visible chapters",
  exceptions: "independently keyed lines/pages, changing state, nonnative prose, altered original text and intermediary transport",
}, null, 2));
