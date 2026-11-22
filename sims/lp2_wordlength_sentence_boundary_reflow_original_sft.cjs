"use strict";
/**
 * Source-native word-boundary grammar decision for LP2 director issue #2278.
 * Windows Node 22, CommonJS, deterministic, read-only, no dependencies.
 *
 * The *only* premise is that punctuation/word lengths carry the same
 * syntactic information as real English or Latin. A negative diagnostic
 * cannot exclude unusual prose, segmentation changes, or a keyed cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const runes = /[\u16A0-\u16FF]+/gu;
const getRunes = s => s.match(runes) || [];
const raw = read("resources/liber-primus/lp2-transcription.txt").split("%");
const unknown = raw.slice(0, 55).join("%"); // canonical text omits rune-free p50
const sanitize = s => s.replace(/\/\r?\n/g, "").replace(/[%$&\s]/g, "");
const scopes = text => sanitize(text).split(".")
  .map(segment => getRunes(segment).map(word => word.length))
  .filter(segment => segment.length);
const full = scopes(unknown);
const words = full.flat();
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, len) => n + len, 0), 12956);
assert.equal(full.length, 175);
assert.equal(words.filter(x => x === 1).length, 83);
assert.equal(words.filter(x => x === 2).length, 448);

const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const solved = native.sections.flatMap(section =>
  section.source_text.split(/[⁘⁜]/u)
    .map(text => getRunes(text).map(word => word.length))
    .filter(group => group.length));
assert.equal(solved.flat().length, 740);

const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).filter(word => /^[0-9A-S]+$/.test(word))
  .map(word => word.length);
assert.equal(latin.length, 39835);
const gpLength = word => word.replace(/ING/g, "NG")
  .replace(/TH|EO|OE|NG|AE|IA|EA/g, "X").length;
const english = file => (read(file).toUpperCase().match(/[A-Z]+/g) || [])
  .map(gpLength);
const oldEnglish = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json")).allSourceGpWordLengths;
assert.equal(oldEnglish.length, 10885);
const donors = {
  beowulf_old_english: oldEnglish,
  latin,
  gibran: english("resources/control/gibran_prophet_58585.txt"),
  shakespeare: english("resources/control/shakespeare_first300k.txt"),
  emerson: english("resources/control/emerson_essays_2944.txt")
};

/** Short-word nearest-neighbor ratio for a length-preserving order test. */
function adjacency(a) {
  const n = a.length;
  const s = a.reduce((sum, l) => sum + Number(l <= 2), 0);
  let observed = 0;
  for (let i = 1; i < n; i++) {
    if (a[i - 1] <= 2 && a[i] <= 2) observed++;
  }
  const expected = s * (s - 1) / n;
  return { n, short: s, observed, expected, ratio: observed / expected };
}

/**
 * Exact permutation expectations per genuine '.' scope.
 * End-of-sentence z uses the sum of each sentence's finite-population
 * variance. Singleton sentences do not contribute to that statistic.
 */
function sentenceMetrics(groups) {
  let n = 0, pairs = 0, shortPair = 0, expected = 0;
  let terminalShift = 0, terminalVariance = 0, terminals = 0;
  for (const g of groups) {
    n += g.length;
    const short = g.filter(v => v <= 2).length;
    expected += short * (short - 1) / g.length;
    for (let i = 1; i < g.length; i++) {
      pairs++;
      if (g[i - 1] <= 2 && g[i] <= 2) shortPair++;
    }
    if (g.length >= 2) {
      const mean = g.reduce((x, y) => x + y, 0) / g.length;
      terminalShift += g[g.length - 1] - mean;
      terminalVariance += g.reduce((v, x) => v + (x - mean) ** 2, 0) / g.length;
      terminals++;
    }
  }
  return { scopes: groups.length, words: n, pairs, shortPair,
    conditionalExpected: expected, shortPairExcess: shortPair - expected,
    terminalCount: terminals, terminalShift,
    terminalZ: terminalShift / Math.sqrt(terminalVariance) };
}

/**
 * Exact word-order route for a partially populated width-k rectangle.
 * The formatting, punctuation and page-carry tape is held separately;
 * this test only claims a reversible whole-word order hypothesis.
 * Reversing twice returns the original words, regardless of their values.
 */
function route(items, width, decode) {
  const n = items.length;
  const order = [];
  for (let col = 0; col < width; col++) {
    for (let i = col; i < n; i += width) order.push(i);
  }
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    if (decode) result[order[i]] = items[i];
    else result[i] = items[order[i]];
  }
  return result;
}
for (const width of [5, 8]) {
  for (const group of full.concat(solved)) {
    assert.deepEqual(route(route(group, width, false), width, true), group);
    assert.deepEqual(route(route(group, width, true), width, false), group);
  }
}

function ratios(text) {
  const bins = [1, 2, 4, 6, Infinity];
  const cl = value => bins.findIndex(bound => value <= bound);
  const rows = Array.from({ length: 5 }, () => Array(5).fill(0));
  const margins = Array(5).fill(0);
  const denominators = Array(5).fill(0);
  for (let i = 0; i < text.length; i++) {
    const curr = cl(text[i]);
    margins[curr]++;
    if (i) {
      const prev = cl(text[i - 1]);
      denominators[prev]++;
      rows[prev][curr]++;
    }
  }
  return rows.map((row, i) => row.map((count, j) =>
    Math.log((count + 0.5) / (denominators[i] + 2.5)
      * ((text.length + 2.5) / (margins[j] + 0.5)))));
}
const model = ratios(latin);
function markov(groups) {
  const bins = [1, 2, 4, 6, Infinity];
  const cl = value => bins.findIndex(bound => value <= bound);
  let sum = 0, count = 0;
  for (const g of groups) {
    for (let i = 1; i < g.length; i++) {
      sum += model[cl(g[i - 1])][cl(g[i])];
      count++;
    }
  }
  return sum / count;
}

const train = scopes(raw.slice(16, 22).join("%"));
const heldout = scopes(raw.slice(40, 53).join("%")); // physical p40..p53; p50 rune-free
assert.equal(train.flat().reduce((a, b) => a + b, 0), 1613);
assert.equal(heldout.flat().reduce((a, b) => a + b, 0), 3008);
function readout(groups, width, decode) {
  const changed = groups.map(g => route(g, width, decode));
  return { ...sentenceMetrics(changed), latinMarkovPerPair: markov(changed) };
}
const routes = [];
for (const width of [1, 5, 8]) {
  for (const decode of width === 1 ? [false] : [false, true]) {
    routes.push({ width, decode,
      full: readout(full, width, decode),
      train: readout(train, width, decode),
      heldout: readout(heldout, width, decode) });
  }
}

/** Overlapping source windows provide controls, not independent p-values. */
function donorWindows(a) {
  const values = [];
  for (let start = 0; start + words.length <= a.length; start += 97) {
    values.push(adjacency(a.slice(start, start + words.length)).ratio);
  }
  values.sort((x, y) => x - y);
  return { windows: values.length, min: values[0],
    median: values[Math.floor(values.length / 2)],
    max: values[values.length - 1],
    atLeastOriginal: values.filter(v => v >= adjacency(words).ratio).length };
}
const {stats: grammarStats, rankMatch} = require("./lp2_wordlength_order_grammar_sft.cjs");
const originalChi = grammarStats(words).chi;
const orderedOld = [];
const targetSorted = words.slice().sort((a, b) => a - b);
for (let start = 0; start + words.length <= oldEnglish.length; start += 97) {
  const match = rankMatch(oldEnglish.slice(start, start + words.length), targetSorted);
  orderedOld.push({chi: grammarStats(match).chi, shortPairRatio: adjacency(match).ratio});
}
const oldEnglishHistogramMatched = {
  windows: orderedOld.length,
  originalChi,
  originalShortPairRatio: adjacency(words).ratio,
  chiBelowOriginal: orderedOld.filter(x => x.chi <= originalChi).length,
  shortRatioBelowOriginal: orderedOld.filter(x => x.shortPairRatio <= adjacency(words).ratio).length,
  minChi: Math.min(...orderedOld.map(x => x.chi)),
  minShortPairRatio: Math.min(...orderedOld.map(x => x.shortPairRatio))
};
assert.equal(oldEnglishHistogramMatched.windows, 83);
assert.equal(oldEnglishHistogramMatched.chiBelowOriginal, 6);
assert.equal(oldEnglishHistogramMatched.shortRatioBelowOriginal, 0);

const result = {
  source: "LP2 original 55 rune-bearing physical pages, 2014 original text and pinned donor corpora",
  original: { global: adjacency(words), punctuation: sentenceMetrics(full) },
  oldEnglishHistogramMatched,
  authenticSolved: sentenceMetrics(solved),
  donorWindows: Object.fromEntries(Object.entries(donors)
    .map(([name, lengths]) => [name, donorWindows(lengths)])),
  routes
};
assert.equal(result.original.global.observed, 94);
assert.equal(result.original.punctuation.shortPair, 88);
assert.ok(Math.abs(result.original.punctuation.conditionalExpected - 85.90505517407924) < 1e-8);
assert.ok(Math.abs(result.original.punctuation.terminalZ + 0.68356206596369) < 1e-7);
assert.equal(result.donorWindows.latin.atLeastOriginal, 0);
assert.equal(result.donorWindows.beowulf_old_english.windows, 83);
assert.equal(result.donorWindows.beowulf_old_english.atLeastOriginal, 83);
assert.equal(result.donorWindows.shakespeare.atLeastOriginal, 0);
assert.ok(routes.filter(r => r.width === 5 || r.width === 8)
  .every(r => r.heldout.latinMarkovPerPair < 0));
console.log(JSON.stringify(result, null, 2));
console.log("PASS: original grammar controls, 5/8 route inverse and heldout tests.");
