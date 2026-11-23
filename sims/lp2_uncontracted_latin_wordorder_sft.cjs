"use strict";
/**
 * LP2 source word-boundary alternative: raw Latin versus Gematria-Primus
 * ligature spelling, with a held-out word-length transition test.
 *
 * No ciphertext rune values, guessed plaintext, model-selected cipher key,
 * invented word separators or downloaded external datasets are required.
 * Run with Node 22: node sims/lp2_uncontracted_latin_wordorder_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const load = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const source = load("resources/liber-primus/lp2-transcription.txt");
const runes = new Set(gp.runes);
const terms = gp.translit.slice().sort((a, b) => b.length - a.length);
const donorPaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const donorWords = donorPaths.map(p => load(p).toUpperCase().match(/[A-Z]+/g) || []);
const limit = gp.pages.slice(0, 56).reduce((n, p) => n + p.indices.length, 0);
assert.equal(limit, 12956);
const pages = [];
let end = 0;
for (const p of gp.pages.slice(0, 56)) {
  end += p.indices.length;
  pages.push({ page: p.page, end });
}
/** @param {number} globalEnd */
const getPage = globalEnd => pages.find(p => globalEnd <= p.end).page;

/** Return source-complete printed words; line/page are END coordinates. */
function originalWordTokens() {
  const words = [];
  let runeCount = 0, wordLength = 0, line = 0;
  for (const c of source) {
    if (runes.has(c)) {
      if (runeCount === limit) break;
      runeCount++;
      wordLength++;
    } else if ((c === "-" || c === ".") && wordLength > 0) {
      words.push({ length: wordLength, line, page: getPage(runeCount) });
      wordLength = 0;
    } else if (c === "/" || c === "%" || c === "&" || c === "$") {
      line++;
    }
  }
  if (wordLength > 0) words.push({ length: wordLength, line, page: getPage(runeCount) });
  assert.equal(runeCount, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, w) => n + w.length, 0), limit);
  assert.equal(words.filter(w => w.length === 1).length, 83);
  assert.equal(words.filter(w => w.length === 2).length, 448);
  return words;
}
const original = originalWordTokens();
const N = original.length;

/** GP spelling from independently known solved-Cicada native source rules. */
function nativeLength(word) {
  const s = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let i = 0, count = 0;
  while (i < s.length) {
    if (s.startsWith("ING", i)) { i += 3; count++; continue; }
    if (s.startsWith("IO", i)) { i += 2; count++; continue; }
    const term = terms.find(t => s.startsWith(t, i));
    assert.ok(term, "Cannot transliterate " + word + " at " + i);
    i += term.length;
    count++;
  }
  return count;
}
assert.equal(nativeLength("THINGS"), 3);
assert.equal(nativeLength("FOLLOWING"), 7);
const donor = donorWords.map(words => ({
  raw: words.map(w => Math.min(15, w.length)),
  gp: words.map(w => Math.min(15, nativeLength(w)))
}));

/** @param {number[]} values */
function windowTwoCounts(values) {
  const hist = new Int32Array(16);
  for (let i = 0; i < N; i++) hist[values[i]]++;
  let min = Number.POSITIVE_INFINITY, below = 0, belowOne = 0;
  for (let start = 0; start <= values.length - N; start++) {
    if (start) {
      hist[values[start - 1]]--;
      hist[values[start + N - 1]]++;
    }
    min = Math.min(min, hist[2]);
    if (hist[2] <= 448) {
      below++;
      if (hist[1] <= 83) belowOne++;
    }
  }
  return { windows: values.length - N + 1, minTwo: min,
    windowsAtMost448: below, windowsAtMost448And83: belowOne };
}
const marginals = donorPaths.map((source, i) => ({
  source, raw: windowTwoCounts(donor[i].raw),
  nativeGP: windowTwoCounts(donor[i].gp)
}));
assert.deepEqual(marginals.map(x => x.nativeGP.minTwo), [527, 612, 711]);
assert.deepEqual(marginals.map(x => x.raw.minTwo), [420, 409, 508]);
assert.deepEqual(marginals.map(x => x.raw.windowsAtMost448), [5946, 2788, 0]);

/** Smoothed native donor model of adjacent word-length dependencies. */
function fit(arrays) {
  const K = 16, pairs = new Float64Array(K * K);
  const singles = new Float64Array(K), rows = new Float64Array(K);
  for (const a of arrays) {
    for (let i = 1; i < a.length; i++) {
      pairs[a[i - 1] * K + a[i]]++;
      singles[a[i]]++;
      rows[a[i - 1]]++;
    }
  }
  const sum = singles.reduce((a, b) => a + b, 0);
  return {
    gain(a, b) {
      const p = Math.log((pairs[a * K + b] + 0.5) / (rows[a] + 0.5 * K));
      const u = Math.log((singles[b] + 0.5) / (sum + 0.5 * K));
      return p - u;
    }
  };
}
/** Nats per adjacent original word-length pair, relative to singleton model. */
function score(words, model) {
  let z = 0;
  for (let i = 1; i < words.length; i++) {
    const a = Math.min(words[i - 1].length ?? words[i - 1], 15);
    const b = Math.min(words[i].length ?? words[i], 15);
    z += model.gain(a, b);
  }
  return z / (words.length - 1);
}
const originalLengths = original.map(x => Math.min(15, x.length));
let seed = 0xc1cada34;
/** Explicit fixed-seed xorshift32 null, independent of any ciphertext contents. */
function rnd() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
function shuffledStats(model) {
  const values = [];
  for (let trial = 0; trial < 256; trial++) {
    const a = originalLengths.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    values.push(score(a, model));
  }
  const mean = values.reduce((s, n) => s + n, 0) / values.length;
  const sd = Math.sqrt(values.reduce((s, n) => s + (n - mean) ** 2, 0) / (values.length - 1));
  return { mean, sd };
}
const orderEvidence = {};
for (const representation of ["raw", "gp"]) {
  orderEvidence[representation] = donorPaths.map((path, hold) => {
    const others = donor.filter((_, i) => i !== hold).map(x => x[representation]);
    const model = fit(others);
    const observed = score(originalLengths, model);
    const shuffled = shuffledStats(model);
    const values = donor[hold][representation];
    const choices = values.length - N + 1;
    const stride = Math.max(1, Math.floor(choices / 350));
    const control = [];
    for (let i = 0; i < choices; i += stride) {
      control.push(score(values.slice(i, i + N), model));
    }
    const min = Math.min(...control), max = Math.max(...control);
    assert.ok(observed < min, path + " expected stronger native adjacency");
    return { heldout: path, observed, shuffledMean: shuffled.mean,
      shuffledSD: shuffled.sd, zVsShuffle: (observed - shuffled.mean) / shuffled.sd,
      heldoutWindowsChecked: control.length, heldoutMin: min, heldoutMax: max };
  });
}

/* Authenticated author-style control: editor-normalized translations from
   solved LP1. Exclude commentary/meta rows, numeric grids and continuation
   editorial annotations. The corpus is a short, annotated author sample,
   so do not treat its sliding comparison as an English-universality claim. */
const lp1 = load("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\\r?\\n/)
  .filter(line => line.trim() && !line.startsWith("#")
    && !line.startsWith("[") && !/^\\d/.test(line))
  .join(" ").toUpperCase().match(/[A-Z]+/g).map(word => Math.min(15, word.length));
assert.equal(lp1.length, 761);
const authorStyleModel = fit(donor.map(x => x.raw));
const authorStyleGain = score(lp1, authorStyleModel);
const sourceLength = originalLengths;
let sourceBest = -Infinity, sourceExceed = 0, sourceMin = Infinity;
for (let i = 0; i <= sourceLength.length - lp1.length; i++) {
  const g = score(sourceLength.slice(i, i + lp1.length), authorStyleModel);
  sourceMin = Math.min(sourceMin, g);
  sourceBest = Math.max(sourceBest, g);
  if (g >= authorStyleGain) sourceExceed++;
}
let lp1Seed = 0xacd334;
function lp1Random() {
  lp1Seed ^= lp1Seed << 13;
  lp1Seed ^= lp1Seed >>> 17;
  lp1Seed ^= lp1Seed << 5;
  return lp1Seed >>> 0;
}
const lp1Null = [];
for (let trial = 0; trial < 1000; trial++) {
  const a = lp1.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = lp1Random() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  lp1Null.push(score(a, authorStyleModel));
}
const lp1NullMean = lp1Null.reduce((s, n) => s + n, 0) / lp1Null.length;
const lp1NullSd = Math.sqrt(lp1Null.reduce((s, n) =>
  s + (n - lp1NullMean) ** 2, 0) / (lp1Null.length - 1));
const authorStyle = { source: "editor-normalized solved LP1 plaintext",
  words: lp1.length, nativeGain: authorStyleGain,
  nativeVsShuffledZ: (authorStyleGain - lp1NullMean) / lp1NullSd,
  originalWindows: sourceLength.length - lp1.length + 1,
  originalMinimum: sourceMin, originalMaximum: sourceBest,
  originalExceedances: sourceExceed };
assert.equal(authorStyle.originalWindows, 2136);
assert.equal(authorStyle.originalExceedances, 0);

/* Freeze eight source-visible historical-style line-order alternatives;
   these are tests, not discovered decipherment operations. */
const linesByPage = new Map();
for (const word of original) {
  if (!linesByPage.has(word.page)) linesByPage.set(word.page, new Map());
  const lines = linesByPage.get(word.page);
  if (!lines.has(word.line)) lines.set(word.line, []);
  lines.get(word.line).push(word);
}
const orderFns = {
  asPrinted: rows => rows.flat(),
  reverseEveryLine: rows => rows.flatMap(x => x.slice().reverse()),
  reverseOddLines: rows => rows.flatMap((x, i) => i % 2 ? x.slice().reverse() : x),
  reverseEvenLines: rows => rows.flatMap((x, i) => i % 2 === 0 ? x.slice().reverse() : x),
  reverseLineOrder: rows => rows.slice().reverse().flat(),
  verticalColumns: rows => Array.from({ length: Math.max(...rows.map(r => r.length)) },
    (_, i) => rows.flatMap(row => row[i] ? [row[i]] : [])).flat(),
  reverseVerticalColumns: rows => Array.from({ length: Math.max(...rows.map(r => r.length)) },
    (_, i) => rows.slice().reverse().flatMap(row => row[i] ? [row[i]] : [])).flat(),
  snakeColumns: rows => Array.from({ length: Math.max(...rows.map(r => r.length)) },
    (_, i) => (i % 2 ? rows.slice().reverse() : rows).flatMap(row => row[i] ? [row[i]] : [])).flat()
};
const nativeModel = fit(donor.map(d => d.raw));
const lineOrders = Object.entries(orderFns).map(([name, reorder]) => {
  const words = [...linesByPage].sort((a, b) => a[0] - b[0])
    .flatMap(([, group]) => reorder([...group.values()]));
  assert.equal(words.length, N);
  return { name, full: score(words, nativeModel),
    trainingPages16to21: score(words.filter(w => w.page >= 16 && w.page <= 21), nativeModel),
    heldoutPages40to53: score(words.filter(w => w.page >= 40 && w.page <= 53), nativeModel) };
});
console.log(JSON.stringify({ source: "original LP2 p0-55 + three pinned control corpora",
  original: { runes: limit, words: N, one: 83, two: 448 },
  marginals, orderEvidence, authorStyle, lineOrders }, null, 2));
console.log("PASS: full original source and all independent control windows");
