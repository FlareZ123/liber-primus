"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const M = 29;
const ORIGINAL_NULLS = 1000;
const CONTROL_NULLS = 250;
const SEEDS = {
  originalNull: 0x21b0da7a,
  wordResetPlain: 0x21f00d17,
  perSymbolPlain: 0x21f00d18,
  wordResetNull: 0x21f00d19,
  perSymbolNull: 0x21f00d20
};
const GP = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
  "A", "AE", "Y", "IA", "EA"
];
const GP_INDEX = new Map(GP.map((x, i) => [x, i]));

function random32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function encodeEnglish(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (GP_INDEX.has(pair)) {
        out.push(GP_INDEX.get(pair));
        i += 2;
      } else {
        const value = GP_INDEX.get(word[i]);
        if (value === undefined) throw new Error("Unencodable English letter");
        out.push(value);
        i++;
      }
    }
  }
  return out;
}

function buildBoundaryFlags(pages, words) {
  const wordEnds = new Set();
  let total = 0;
  for (const word of words) {
    total += word.length;
    wordEnds.add(total);
  }
  assert.equal(total, 12956);

  const flags = [];
  let pageOffset = 0;
  for (const page of pages) {
    const pageFlags = [];
    for (let i = 0; i < page.length - 1; i++)
      pageFlags.push(wordEnds.has(pageOffset + i + 1));
    flags.push(pageFlags);
    pageOffset += page.length;
  }
  assert.equal(pageOffset, 12956);
  return flags;
}

/**
 * I(B; delta), in nats. B is the printed word-boundary flag and
 * delta=(nextRune-previousRune) mod 29. Physical page-boundary edges
 * are excluded to match the per-page Eulerian null.
 */
function boundaryDeltaMI(pages, flags) {
  const counts = [new Float64Array(M), new Float64Array(M)];
  const boundaryCounts = [0, 0];
  const deltaCounts = new Float64Array(M);
  let n = 0;
  for (let p = 0; p < pages.length; p++) {
    for (let i = 0; i < pages[p].length - 1; i++) {
      const b = flags[p][i] ? 1 : 0;
      const delta = (pages[p][i + 1] - pages[p][i] + M) % M;
      counts[b][delta]++;
      boundaryCounts[b]++;
      deltaCounts[delta]++;
      n++;
    }
  }
  let mi = 0;
  for (let b = 0; b < 2; b++) {
    for (let d = 0; d < M; d++) {
      const count = counts[b][d];
      if (count)
        mi += count / n * Math.log((count * n) / (boundaryCounts[b] * deltaCounts[d]));
    }
  }
  return {
    mi, n, boundaryEdges: boundaryCounts[1], interiorEdges: boundaryCounts[0],
    boundaryDeltaCounts: Array.from(counts[1]),
    interiorDeltaCounts: Array.from(counts[0])
  };
}

function reshuffleBigrams(page, random) {
  const outgoing = Array.from({ length: M }, () => []);
  for (let i = 1; i < page.length; i++)
    outgoing[page[i - 1]].push(page[i]);
  for (const edges of outgoing) {
    for (let i = edges.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [edges[i], edges[j]] = [edges[j], edges[i]];
    }
  }
  const stack = [page[0]];
  const trail = [];
  while (stack.length) {
    const edges = outgoing[stack[stack.length - 1]];
    if (edges.length) stack.push(edges.pop());
    else trail.push(stack.pop());
  }
  trail.reverse();
  assert.equal(trail.length, page.length);
  assert.equal(trail[0], page[0]);
  assert.equal(trail[trail.length - 1], page[page.length - 1]);
  return trail;
}

function nullSamples(pages, flags, count, seed) {
  const random = random32(seed);
  const values = [];
  for (let i = 0; i < count; i++) {
    const randomized = pages.map(page => reshuffleBigrams(page, random));
    values.push(boundaryDeltaMI(randomized, flags).mi);
  }
  return values;
}

function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * q)];
}

function summarize(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0)
    / (values.length - 1));
  return {
    n: values.length, mean, sd, min: Math.min(...values),
    q01: quantile(values, 0.01), q05: quantile(values, 0.05),
    median: quantile(values, 0.5), q95: quantile(values, 0.95),
    q99: quantile(values, 0.99), max: Math.max(...values)
  };
}

function partitionByPage(values, pages) {
  let offset = 0;
  return pages.map(page => {
    const part = values.slice(offset, offset + page.length);
    offset += page.length;
    return part;
  });
}

function plantWordReset(source, wordLengths, pages, seed) {
  const random = random32(seed);
  const output = [];
  let offset = 0;
  for (const length of wordLengths) {
    const shift = random() % M;
    for (let i = 0; i < length; i++)
      output.push((source[offset++] + shift) % M);
  }
  assert.equal(offset, source.length);
  return partitionByPage(output, pages);
}

function plantPerSymbolPad(source, pages, seed) {
  const random = random32(seed);
  const output = source.map(value => (value + random() % M) % M);
  return partitionByPage(output, pages);
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const pages = corpus.pages
    .filter(page => page.status === "unsolved" && page.indices.length)
    .map(page => page.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((n, page) => n + page.length, 0), 12956);
  assert.equal(pages.reduce((n, page) => n + page.length - 1, 0), 12901);

  const parsed = parseSharedCorpus();
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  const wordLengths = parsed.words.map(word => word.length);
  const flags = buildBoundaryFlags(pages, wordLengths);
  const observed = boundaryDeltaMI(pages, flags);
  assert.equal(observed.n, 12901);
  assert.equal(observed.boundaryEdges, 2873);
  assert.equal(observed.interiorEdges, 10028);

  const originalNull = nullSamples(pages, flags, ORIGINAL_NULLS, SEEDS.originalNull);
  const upper = originalNull.filter(value => value >= observed.mi).length;
  const lower = originalNull.filter(value => value <= observed.mi).length;

  const english = fs.readFileSync(
    path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8");
  const englishGP = encodeEnglish(english).slice(0, 12956);
  assert.equal(englishGP.length, 12956);

  const wordReset = plantWordReset(
    englishGP, wordLengths, pages, SEEDS.wordResetPlain);
  const wordResetObserved = boundaryDeltaMI(wordReset, flags);
  const wordResetNull = nullSamples(
    wordReset, flags, CONTROL_NULLS, SEEDS.wordResetNull);
  const wordResetUpper = wordResetNull.filter(
    value => value >= wordResetObserved.mi).length;

  const perSymbol = plantPerSymbolPad(
    englishGP, pages, SEEDS.perSymbolPlain);
  const perSymbolObserved = boundaryDeltaMI(perSymbol, flags);
  const perSymbolNull = nullSamples(
    perSymbol, flags, CONTROL_NULLS, SEEDS.perSymbolNull);
  const perSymbolUpper = perSymbolNull.filter(
    value => value >= perSymbolObserved.mi).length;

  assert.equal(wordResetUpper, 0);
  return {
    method: "I(word-boundary; GP29 first difference) under exact per-page bigram-preserving Euler-trail randomization",
    source: {
      pages: pages.length, runes: parsed.runeCount, words: parsed.words.length,
      crossPageWords: parsed.crossPageWords,
      pageInternalAdjacencies: observed.n,
      wordBoundaryEdges: observed.boundaryEdges,
      withinWordEdges: observed.interiorEdges
    },
    original: {
      observedMI: observed.mi,
      null: summarize(originalNull),
      upperExceedances: upper,
      upperTailAddOneP: (upper + 1) / (ORIGINAL_NULLS + 1),
      lowerExceedances: lower,
      lowerTailAddOneP: (lower + 1) / (ORIGINAL_NULLS + 1)
    },
    controls: {
      englishSource: "first 12,956 GP29 tokens from Shakespeare control, cut by exact LP2 word lengths",
      wordResetAdditive: {
        observedMI: wordResetObserved.mi,
        null: summarize(wordResetNull),
        upperExceedances: wordResetUpper,
        upperTailAddOneP: (wordResetUpper + 1) / (CONTROL_NULLS + 1)
      },
      independentPerSymbolAdditive: {
        observedMI: perSymbolObserved.mi,
        null: summarize(perSymbolNull),
        upperExceedances: perSymbolUpper,
        upperTailAddOneP: (perSymbolUpper + 1) / (CONTROL_NULLS + 1)
      }
    },
    seeds: Object.fromEntries(Object.entries(SEEDS)
      .map(([key, value]) => [key, "0x" + value.toString(16)])),
    note: "Eulerian randomization preserves each page's exact bigram multiset, endpoints, and length; it does not claim uniform sampling over all Eulerian trails."
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + "\n");
}
