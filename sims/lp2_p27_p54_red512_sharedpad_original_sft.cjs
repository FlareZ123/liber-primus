"use strict";
/**
 * Source-derived p27/p54 mod-256 title collision; exact two-time pad gate.
 *
 * Both original page-start red headings have GP-prime sums 1109 and 597.
 * Difference 512 means they address the same original p50 base60 byte at
 * index 85. The hypothesis is that this one address initializes the SAME
 * additive GP29 keystream for both source-bounded chapters, either from the
 * first title rune or each chapter's black-body boundary. The key cancels:
 * (C27 - C54) mod29 == (P27 - P54) mod29.
 *
 * We test the untouched ciphertext, preserving all printed word boundaries.
 * All complete printed-word overlaps of the two aligned passage prefixes
 * must admit native-GP English word pairs with these exact differences.
 * A generous external dictionary is used to avoid rejecting on a few
 * unfamiliar words. A planted GP-native additive shared key must pass.
 *
 * Node.js 22, Windows 11; one read-only SFT, no CLI arguments.
 * This does NOT establish that the modulo-256 table address is an author
 * supplied key. It only rejects one direct consumer under stated lexicon
 * and source-native English/word-boundary assumptions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const mod29 = v => ((v % 29) + 29) % 29;

const unknown = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const all = corpus.pages.flatMap(page => page.indices);
assert.equal(unknown.length, 12956);
assert.equal(all.length, 13136);
const pStart = number => corpus.pages.slice(0, number)
  .reduce((sum, page) => sum + page.indices.length, 0);
const redTitle = page => {
  const annotation = ink.pages.find(p => p.page === page);
  const span = annotation.red_spans.find(s => s.start === 0);
  return corpus.pages[page].indices.slice(0, span.length);
};
const red27 = redTitle(27), red54 = redTitle(54);
const primeSum = seq => seq.reduce((s, v) => s + corpus.prime[v], 0);
assert.equal(red27.length, 19);
assert.equal(red54.length, 9);
assert.deepEqual([primeSum(red27), primeSum(red54)], [1109, 597]);
assert.equal((1109 - 597) % 256, 0);
assert.equal(1109 % 256, 85);
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[85], "0S");
const sharedSourceByte = grid.alphabet.indexOf(tokens[85][0]) * 60
  + grid.alphabet.indexOf(tokens[85][1]);
assert.equal(sharedSourceByte, 28);

const originalRunes = new Map(corpus.runes.map((r, i) => [r, i]));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const printed = [];
const printedRunes = [];
let wordStart = null;
for (const ch of transcription) {
  const rune = originalRunes.get(ch);
  if (rune !== undefined) {
    if (wordStart === null) wordStart = printedRunes.length;
    printedRunes.push(rune);
  } else if ("-.:&$".includes(ch) && wordStart !== null) {
    printed.push({ start: wordStart, end: printedRunes.length });
    wordStart = null;
  }
}
if (wordStart !== null) printed.push({
  start: wordStart, end: printedRunes.length
});
assert.equal(printed.length, 2941);
assert.deepEqual(printedRunes, all, "exact original source rune transcription");

// Source-calibrated orthography, using a broad historical/corpus lexicon.
// Storing GP codes as ASCII A..] keeps both keyed comparisons exact.
const lex = Array.from({ length: 64 }, () => new Set());
const add = word => {
  const gp = encodeSourceNativeGP(word);
  if (gp.length >= 1 && gp.length < lex.length)
    lex[gp.length].add(gp.map(x => String.fromCharCode(65 + x)).join(""));
};
let textblobWords = 0;
for (const row of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+$/.exec(row);
  if (match) {
    add(match[1]);
    textblobWords++;
  }
}
for (const word of read("resources/control/dwyl-english-alpha-gp13-14-only.txt")
  .split(/\s+/))
  if (/^[a-z]+$/.test(word)) add(word);
assert.equal(textblobWords, 29157);
const dictionary = lex.map(s => [...s]);
assert.equal(dictionary[7].length, 4776);
assert.equal(dictionary[8].length, 4325);
assert.equal(dictionary[12].length, 767);

const makeCase = (name, first, second, limit) => {
  const firstWordEnds = new Set(printed.filter(w =>
    w.start >= first && w.end <= first + limit)
    .map(w => w.end - first));
  const commonEnds = printed.filter(w =>
    w.start >= second && w.end <= second + limit
    && firstWordEnds.has(w.end - second));
  const n = Math.max(...commonEnds.map(w => w.end - second));
  const localWords = start => printed.filter(w =>
    w.start >= start && w.end <= start + n)
    .map(w => ({
      start: w.start - start,
      end: w.end - start,
      length: w.end - w.start
    }));
  const aWords = localWords(first);
  const bWords = localWords(second);
  assert.equal(aWords[0].start, 0);
  assert.equal(bWords[0].start, 0);
  assert.equal(aWords.at(-1).end, n);
  assert.equal(bWords.at(-1).end, n);
  const cipherA = all.slice(first, first + n);
  const cipherB = all.slice(second, second + n);
  const difference = cipherA.map((v, i) => mod29(v - cipherB[i]));
  return { name, limit, n, aWords, bWords, cipherA, cipherB, difference };
};

/** All complete distinct word overlaps, without invented segmentation. */
const overlaps = c => {
  const edges = [];
  let b = 0;
  for (let a = 0; a < c.aWords.length; a++) {
    const aw = c.aWords[a];
    while (b < c.bWords.length && c.bWords[b].end <= aw.start) b++;
    for (let j = b; j < c.bWords.length && c.bWords[j].start < aw.end; j++) {
      const bw = c.bWords[j];
      const lo = Math.max(aw.start, bw.start);
      const hi = Math.min(aw.end, bw.end);
      edges.push({
        a, b: j, lo, hi,
        aLength: aw.length, bLength: bw.length,
        aOffset: lo - aw.start, bOffset: lo - bw.start
      });
    }
  }
  return edges;
};

/** Exact one-word pair feasibility, irrespective of unobserved secret pad. */
function supported(c, edge, difference = c.difference) {
  const n = edge.hi - edge.lo;
  const signatures = new Set();
  for (const text of dictionary[edge.aLength]) {
    let sig = "";
    for (let k = 0; k < n; k++) {
      sig += String.fromCharCode(65 + mod29(
        (text.charCodeAt(edge.aOffset + k) - 65)
        - difference[edge.lo + k]));
    }
    signatures.add(sig);
  }
  for (const text of dictionary[edge.bLength]) {
    if (signatures.has(text.slice(edge.bOffset, edge.bOffset + n)))
      return true;
  }
  return false;
}

const cases = [
  makeCase("title_to_title", pStart(27), pStart(54), 308),
  makeCase("black_to_black", pStart(27) + 19, pStart(54) + 9, 299)
];

/** A positive from real GP lexical words sharing a fixed arbitrary pad. */
function positive(c) {
  const nativeWordStream = words => words.flatMap(word => {
    const candidate = dictionary[word.length][0];
    assert(candidate, "positive native GP word length");
    return [...candidate].map(v => v.charCodeAt(0) - 65);
  });
  const nativeA = nativeWordStream(c.aWords);
  const nativeB = nativeWordStream(c.bWords);
  assert.equal(nativeA.length, c.n);
  assert.equal(nativeB.length, c.n);
  const key = Array.from({ length: c.n },
    (_, i) => mod29(17 * i * i + 19 * i + 23));
  const cipherA = nativeA.map((v, i) => mod29(v + key[i]));
  const cipherB = nativeB.map((v, i) => mod29(v + key[i]));
  assert.deepEqual(cipherA.map((v, i) => mod29(v - key[i])), nativeA);
  assert.deepEqual(cipherB.map((v, i) => mod29(v - key[i])), nativeB);
  const differences = cipherA.map((v, i) => mod29(v - cipherB[i]));
  assert.deepEqual(differences, nativeA.map((v, i) => mod29(v - nativeB[i])));
  for (const e of overlaps(c)) assert(supported(c, e, differences),
    "native two-time-pad positive every printed overlap");
  return { positiveRecoveredRunesPerPassage: c.n,
    positiveAllWordOverlapsSupported: true };
}

const output = cases.map(c => {
  const edges = overlaps(c);
  const zero = edges.filter(e => !supported(c, e));
  const equal = c.cipherA.filter((r, i) => r === c.cipherB[i]).length;
  return {
    alignment: c.name,
    commonFullyPrintedRunes: c.n,
    originalWholeWordCounts: [c.aWords.length, c.bWords.length],
    overlapConstraints: edges.length,
    originalIdenticalCipherRunePairs: equal,
    impossibleOriginalEnglishWordOverlaps: zero.length,
    initialUnsupportedOverlaps: zero.slice(0, 12).map(e => ({
      interval: [e.lo, e.hi],
      firstWordLength: e.aLength, secondWordLength: e.bLength,
      firstCandidates: dictionary[e.aLength].length,
      secondCandidates: dictionary[e.bLength].length
    })),
    sourceNativeSharedPadPositive: positive(c)
  };
});
assert.deepEqual(output.map(o => [
  o.commonFullyPrintedRunes, o.overlapConstraints,
  o.impossibleOriginalEnglishWordOverlaps
]), [[305, 117, 13], [296, 115, 10]]);
assert.deepEqual(output.map(o => o.originalWholeWordCounts), [
  [67, 65], [66, 63]
]);
assert.deepEqual(output.map(o => o.originalIdenticalCipherRunePairs),
  [14, 5]);
assert.deepEqual(output[1].initialUnsupportedOverlaps[0].interval, [0, 7]);
assert.deepEqual(
  [output[1].initialUnsupportedOverlaps[0].firstWordLength,
    output[1].initialUnsupportedOverlaps[0].secondWordLength],
  [7, 8]
);
console.log(JSON.stringify({
  result: "The same GP29 additive keystream at p27/p54 cannot encode both "
    + "original print-aligned passages as words from the generous GP lexicon.",
  premise: "red prime sums 1109 and 597 differ 512 -> table cell85, 0S=28",
  originalUnknownPlaintextRecovered: false,
  sourcePrintedWords: printed.length,
  sourceRuneCount: printedRunes.length,
  broadDictionary: {
    textblobWords, supplementaryLongWordList: true,
    gpWordTypesByLength1to12: dictionary.slice(1, 13).map(v => v.length)
  },
  output,
  limitation: "Finite English lexicon and source-native GP orthography; "
    + "p27/p54 key reuse itself is speculative, other ciphers unresolved."
}, null, 2));
