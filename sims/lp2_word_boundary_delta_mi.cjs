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
  originalEulerianNull: 0x21b0da7a,
  originalPageLabelNull: 0x21b0da7b,
  wordResetPlant: 0x21f00d17,
  perSymbolPlant: 0x21f00d18,
  wordResetNull: 0x21f00d19,
  perSymbolWordNull: 0x21f00d20,
  lineResetPlant: 0x21f00d21,
  lineResetNull: 0x21f00d22,
  pageResetPlant: 0x21f00d23,
  pageResetNull: 0x21f00d24,
  perSymbolPageNull: 0x21f00d25
};
const GP = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
  "A", "AE", "Y", "IA", "EA"
];
const GP_INDEX = new Map(GP.map((x, i) => [x, i]));
const RUNIC = /[\u16A0-\u16FF]/u;

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

function cumulativeEnds(lengths) {
  const ends = new Set();
  let total = 0;
  for (const length of lengths) {
    total += length;
    ends.add(total);
  }
  assert.equal(total, 12956);
  return ends;
}

function readLineLayout(raw) {
  const stream = raw.split("%").slice(0, 55).join("%");
  const ends = new Set();
  const lengths = [];
  let runeCount = 0;
  let lineStart = 0;
  for (const ch of stream) {
    if (RUNIC.test(ch)) {
      runeCount++;
    } else if (ch === "/") {
      ends.add(runeCount);
      lengths.push(runeCount - lineStart);
      lineStart = runeCount;
    }
  }
  if (lineStart < runeCount) {
    ends.add(runeCount);
    lengths.push(runeCount - lineStart);
  }
  assert.equal(runeCount, 12956);
  assert.equal(lengths.length, 594);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
  return { ends, lengths };
}

function buildPageFlags(pages, endPositions) {
  const flags = [];
  let pageOffset = 0;
  for (const page of pages) {
    const pageFlags = [];
    for (let i = 0; i < page.length - 1; i++)
      pageFlags.push(endPositions.has(pageOffset + i + 1));
    flags.push(pageFlags);
    pageOffset += page.length;
  }
  assert.equal(pageOffset, 12956);
  return flags;
}

function mutualInformation(sequence, flags) {
  const counts = [new Float64Array(M), new Float64Array(M)];
  const boundaryCounts = [0, 0];
  const deltaCounts = new Float64Array(M);
  let n = 0;
  for (let i = 0; i < sequence.length - 1; i++) {
    const b = flags[i] ? 1 : 0;
    const delta = (sequence[i + 1] - sequence[i] + M) % M;
    counts[b][delta]++;
    boundaryCounts[b]++;
    deltaCounts[delta]++;
    n++;
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

function mutualInformationByPage(pages, flags) {
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

function eulerianNulls(pages, wordFlags, lineFlags, count, seed) {
  const random = random32(seed);
  const word = [];
  const line = [];
  for (let i = 0; i < count; i++) {
    const randomized = pages.map(page => reshuffleBigrams(page, random));
    word.push(mutualInformationByPage(randomized, wordFlags).mi);
    line.push(mutualInformationByPage(randomized, lineFlags).mi);
  }
  return { word, line };
}

function randomFixedCountFlags(n, k, random) {
  const flags = Array(n).fill(false);
  for (let i = 0; i < k; i++) flags[i] = true;
  for (let i = n - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [flags[i], flags[j]] = [flags[j], flags[i]];
  }
  return flags;
}

function pageLabelNulls(sequence, boundaryCount, count, seed) {
  const random = random32(seed);
  const values = [];
  for (let i = 0; i < count; i++) {
    const flags = randomFixedCountFlags(sequence.length - 1, boundaryCount, random);
    values.push(mutualInformation(sequence, flags).mi);
  }
  return values;
}

function oneBoundaryNulls(pages, flags, count, seed) {
  const random = random32(seed);
  const values = [];
  for (let i = 0; i < count; i++) {
    const randomized = pages.map(page => reshuffleBigrams(page, random));
    values.push(mutualInformationByPage(randomized, flags).mi);
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

function tailSummary(values, observed) {
  const upper = values.filter(value => value >= observed).length;
  const lower = values.filter(value => value <= observed).length;
  return {
    upperExceedances: upper,
    upperTailAddOneP: (upper + 1) / (values.length + 1),
    lowerExceedances: lower,
    lowerTailAddOneP: (lower + 1) / (values.length + 1)
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

function plantByLengths(source, lengths, pages, seed) {
  const random = random32(seed);
  const output = [];
  let offset = 0;
  for (const length of lengths) {
    const shift = random() % M;
    for (let i = 0; i < length; i++)
      output.push((source[offset++] + shift) % M);
  }
  assert.equal(offset, source.length);
  return partitionByPage(output, pages);
}

function plantPerSymbolPad(source, pages, seed) {
  const random = random32(seed);
  return partitionByPage(
    source.map(value => (value + random() % M) % M), pages);
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const pages = corpus.pages
    .filter(page => page.status === "unsolved" && page.indices.length)
    .map(page => page.indices);
  const pageLengths = pages.map(page => page.length);
  const flat = pages.flat();
  assert.equal(pages.length, 55);
  assert.equal(flat.length, 12956);
  assert.equal(pages.reduce((n, page) => n + page.length - 1, 0), 12901);

  const parsed = parseSharedCorpus();
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  const wordLengths = parsed.words.map(word => word.length);
  const wordFlags = buildPageFlags(pages, cumulativeEnds(wordLengths));
  const raw = fs.readFileSync(
    path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
  const lineLayout = readLineLayout(raw);
  const lineFlags = buildPageFlags(pages, lineLayout.ends);
  assert.equal(wordFlags.reduce((n, a) => n + a.filter(Boolean).length, 0), 2873);
  assert.equal(lineFlags.reduce((n, a) => n + a.filter(Boolean).length, 0), 539);

  const wordObserved = mutualInformationByPage(pages, wordFlags);
  const lineObserved = mutualInformationByPage(pages, lineFlags);
  const originalNull = eulerianNulls(
    pages, wordFlags, lineFlags, ORIGINAL_NULLS, SEEDS.originalEulerianNull);
  const wordNullStats = summarize(originalNull.word);
  const lineNullStats = summarize(originalNull.line);
  const wordTail = tailSummary(originalNull.word, wordObserved.mi);
  const lineTail = tailSummary(originalNull.line, lineObserved.mi);
  const wordZ = (wordObserved.mi - wordNullStats.mean) / wordNullStats.sd;
  const lineZ = (lineObserved.mi - lineNullStats.mean) / lineNullStats.sd;
  const observedMaxZ = Math.max(Math.abs(wordZ), Math.abs(lineZ));
  const maxNullZ = originalNull.word.map((value, i) => Math.max(
    Math.abs((value - wordNullStats.mean) / wordNullStats.sd),
    Math.abs((originalNull.line[i] - lineNullStats.mean) / lineNullStats.sd)
  ));
  const familyExceed = maxNullZ.filter(value => value >= observedMaxZ).length;

  const english = fs.readFileSync(
    path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8");
  const englishGP = encodeEnglish(english).slice(0, flat.length);
  assert.equal(englishGP.length, flat.length);

  const wordReset = plantByLengths(
    englishGP, wordLengths, pages, SEEDS.wordResetPlant);
  const wordResetObserved = mutualInformationByPage(wordReset, wordFlags).mi;
  const wordResetNull = oneBoundaryNulls(
    wordReset, wordFlags, CONTROL_NULLS, SEEDS.wordResetNull);
  const wordResetUpper = wordResetNull.filter(
    value => value >= wordResetObserved).length;

  const lineReset = plantByLengths(
    englishGP, lineLayout.lengths, pages, SEEDS.lineResetPlant);
  const lineResetObserved = mutualInformationByPage(lineReset, lineFlags).mi;
  const lineResetNull = oneBoundaryNulls(
    lineReset, lineFlags, CONTROL_NULLS, SEEDS.lineResetNull);
  const lineResetUpper = lineResetNull.filter(
    value => value >= lineResetObserved).length;

  const perSymbol = plantPerSymbolPad(englishGP, pages, SEEDS.perSymbolPlant);
  const perSymbolWordObserved = mutualInformationByPage(perSymbol, wordFlags).mi;
  const perSymbolWordNull = oneBoundaryNulls(
    perSymbol, wordFlags, CONTROL_NULLS, SEEDS.perSymbolWordNull);
  const perSymbolWordUpper = perSymbolWordNull.filter(
    value => value >= perSymbolWordObserved).length;

  const pageFlags = Array(flat.length - 1).fill(false);
  let pageOffset = 0;
  for (let i = 0; i < pages.length - 1; i++) {
    pageOffset += pages[i].length;
    pageFlags[pageOffset - 1] = true;
  }
  const pageObserved = mutualInformation(flat, pageFlags);
  const pageNull = pageLabelNulls(
    flat, pages.length - 1, ORIGINAL_NULLS, SEEDS.originalPageLabelNull);
  const pageTail = tailSummary(pageNull, pageObserved.mi);

  const pageReset = plantByLengths(
    englishGP, pageLengths, pages, SEEDS.pageResetPlant).flat();
  const pageResetObserved = mutualInformation(pageReset, pageFlags).mi;
  const pageResetNull = pageLabelNulls(
    pageReset, pages.length - 1, CONTROL_NULLS, SEEDS.pageResetNull);
  const pageResetUpper = pageResetNull.filter(
    value => value >= pageResetObserved).length;

  const perSymbolPageObserved = mutualInformation(perSymbol.flat(), pageFlags).mi;
  const perSymbolPageNull = pageLabelNulls(
    perSymbol.flat(), pages.length - 1, CONTROL_NULLS, SEEDS.perSymbolPageNull);
  const perSymbolPageUpper = perSymbolPageNull.filter(
    value => value >= perSymbolPageObserved).length;

  assert.equal(wordResetUpper, 0);
  assert.equal(lineResetUpper, 0);
  return {
    method: "I(boundary; GP29 first difference) with per-page Eulerian conditioning for word/line boundaries and fixed-count label permutation for page boundaries",
    source: {
      pages: pages.length, runes: parsed.runeCount, words: parsed.words.length,
      crossPageWords: parsed.crossPageWords, printedLines: lineLayout.lengths.length,
      pageInternalAdjacencies: wordObserved.n,
      wordBoundaryEdges: wordObserved.boundaryEdges,
      lineBoundaryEdges: lineObserved.boundaryEdges,
      withinWordEdges: wordObserved.interiorEdges,
      withinLineEdges: lineObserved.interiorEdges,
      pageBoundaryEdges: pages.length - 1
    },
    original: {
      word: {
        observedMI: wordObserved.mi, null: wordNullStats, ...wordTail
      },
      line: {
        observedMI: lineObserved.mi, null: lineNullStats, ...lineTail
      },
      wordLineFamilywise: {
        observedMaxAbsZ: observedMaxZ,
        nullExceedances: familyExceed,
        addOneP: (familyExceed + 1) / (ORIGINAL_NULLS + 1)
      },
      page: {
        observedMI: pageObserved.mi, null: summarize(pageNull), ...pageTail
      }
    },
    controls: {
      englishSource: "first 12,956 GP29 tokens from Shakespeare control, cut by exact LP2 word/line/page lengths",
      wordResetAdditive: {
        observedMI: wordResetObserved, null: summarize(wordResetNull),
        upperExceedances: wordResetUpper,
        upperTailAddOneP: (wordResetUpper + 1) / (CONTROL_NULLS + 1)
      },
      lineResetAdditive: {
        observedMI: lineResetObserved, null: summarize(lineResetNull),
        upperExceedances: lineResetUpper,
        upperTailAddOneP: (lineResetUpper + 1) / (CONTROL_NULLS + 1)
      },
      independentPerSymbolAdditive: {
        wordObservedMI: perSymbolWordObserved, wordNull: summarize(perSymbolWordNull),
        wordUpperExceedances: perSymbolWordUpper,
        wordUpperTailAddOneP: (perSymbolWordUpper + 1) / (CONTROL_NULLS + 1),
        pageObservedMI: perSymbolPageObserved, pageNull: summarize(perSymbolPageNull),
        pageUpperExceedances: perSymbolPageUpper,
        pageUpperTailAddOneP: (perSymbolPageUpper + 1) / (CONTROL_NULLS + 1)
      },
      pageResetAdditive: {
        observedMI: pageResetObserved, null: summarize(pageResetNull),
        upperExceedances: pageResetUpper,
        upperTailAddOneP: (pageResetUpper + 1) / (CONTROL_NULLS + 1)
      }
    },
    seeds: Object.fromEntries(Object.entries(SEEDS)
      .map(([key, value]) => [key, "0x" + value.toString(16)])),
    note: "Eulerian randomization preserves each page's exact bigram multiset, endpoints, and length; it does not claim uniform sampling over all Eulerian trails. Page-boundary label permutation is a separate, weaker diagnostic."
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + "\n");
}
