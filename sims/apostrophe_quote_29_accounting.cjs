#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const transcription = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ann = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const quadSource = read("resources/control/duko_round27_english_quadgrams.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = x => ((x % 29) + 29) % 29;
const isRune = ch => ch.codePointAt(0) >= 0x16A0 && ch.codePointAt(0) <= 0x16FF;

// Preserve lexical words across '/' line wraps and '%' page wraps.
const source = transcription.split("%").slice(0, 55).join("%");
const chars = [], words = [];
let page = 0, offset = 0, current = [], currentStart = 0, currentPages = new Set();
function flush() {
  if (!current.length) return;
  words.push({start: currentStart, end: offset, runes: current.join(""), pages: [...currentPages]});
  current = [];
  currentPages = new Set();
}
for (const ch of source) {
  if (isRune(ch)) {
    if (!current.length) currentStart = offset;
    current.push(ch); chars.push(ch); currentPages.add(page); offset++;
  } else if (ch === "%") page++;
  else if (ch === "/" || /\s/u.test(ch)) { /* layout only */ }
  else flush();
}
flush();

const quotes = ann.quotes;
const apostrophes = ann.apostrophes_before_rune;
const quoteMask = new Uint8Array(chars.length);
const quoteWordCounts = [];
for (const q of quotes) {
  for (let i = q.start; i < q.end; i++) quoteMask[i] = 1;
  const overlap = words.filter(w => w.start < q.end && w.end > q.start);
  const inside = overlap.filter(w => w.start >= q.start && w.end <= q.end);
  assert.equal(inside.length, overlap.length, "quote boundary bisects a word");
  assert.equal(inside[0].start, q.start);
  assert.equal(inside.at(-1).end, q.end);
  quoteWordCounts.push(inside.length);
}
const quoteWords = words.filter(w => quotes.some(q => w.start >= q.start && w.end <= q.end));
const quoteRunes = quotes.reduce((s, q) => s + q.end - q.start, 0);

const apostropheWords = apostrophes.map(at => {
  const w = words.find(x => x.start < at && at < x.end);
  assert(w, "apostrophe is not inside a word: " + at);
  assert.equal(at, w.end - 1, "apostrophe is not before final rune: " + at);
  assert([3, 4].includes(w.end - w.start));
  return {at, page: w.pages[0] >= 50 ? w.pages[0] + 1 : w.pages[0],
    word: w.runes, stem: w.runes.slice(0, -1), suffix: w.runes.at(-1)};
});

const splitStarts = new Set(apostropheWords.map(a => words.find(w => w.start < a.at && a.at < w.end).start));
const tokens = [];
for (const w of words) {
  if (splitStarts.has(w.start)) {
    tokens.push({start: w.start, runes: w.runes.slice(0, -1)});
    tokens.push({start: w.end - 1, runes: w.runes.at(-1)});
  } else tokens.push({start: w.start, runes: w.runes});
}
const singles = words.filter(w => w.runes.length === 1);
const splitSingles = tokens.filter(t => t.runes.length === 1);
const singletonAlphabet = new Set(singles.map(w => w.runes[0]));
const splitAlphabet = new Set(splitSingles.map(w => w.runes[0]));
const missingSingletonRunes = corpus.runes.filter(r => !singletonAlphabet.has(r));

const doublets = [];
for (let i = 0; i + 1 < chars.length; i++) if (chars[i] === chars[i + 1]) doublets.push({at: i, rune: chars[i]});
const quoteDoublets = doublets.filter(d => quoteMask[d.at] && quoteMask[d.at + 1]);

const C = chars.map(r => runeIndex.get(r));
const quoteKey = quotes.flatMap(q => C.slice(q.start, q.end));
const singletonKey = [
  ...singles.map(w => ({at: w.start, rune: w.runes[0]})),
  ...apostropheWords.map(a => ({at: a.at, rune: a.suffix}))
].sort((a, b) => a.at - b.at).map(x => runeIndex.get(x.rune));
const grams = new Map();
for (const line of quadSource.split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (m) grams.set(m[1], Number(m[2]));
}
const gramTotal = [...grams.values()].reduce((s, n) => s + n, 0);
assert(gramTotal > 0);
function score(indices) {
  const s = indices.map(i => corpus.translit[i]).join("");
  let total = 0, n = 0, hits = 0;
  for (let i = 0; i + 4 <= s.length; i++) {
    const count = grams.get(s.slice(i, i + 4)) || 0;
    total += Math.log10((count + 0.01) / gramTotal); n++; if (count) hits++;
  }
  return {avgLog10: total / n, observedQuadgrams: hits, windows: n, preview: s.slice(0, 120)};
}
function repeatDecrypt(key, sign, before = new Set(), after = new Set()) {
  let k = 0; const out = [];
  for (let i = 0; i < C.length; i++) {
    if (before.has(i)) k++;
    out.push(mod29(C[i] + sign * key[k % key.length]));
    k++;
    if (after.has(i + 1)) k++;
  }
  return {consumed: k, cycles: k / key.length, score: score(out)};
}
const quoteStarts = new Set(quotes.map(q => q.start));
const quoteEnds = new Set(quotes.map(q => q.end));
const quoteWordIndices = quoteWords.map(w => [...w.runes].map(r => runeIndex.get(r)));
function perWordShift(key, sign) {
  return score(quoteWordIndices.flatMap((w, j) => w.map(x => mod29(x + sign * key[j]))));
}
const doubletKey = doublets.map(d => runeIndex.get(d.rune));
const diffKey = singletonKey.slice(1).map((x, i) => mod29(x - singletonKey[i]));

const report = {
  source: {runes: chars.length, words: words.length, crossPageWords: words.filter(w => w.pages.length > 1).length},
  apostrophes: {
    count: apostrophes.length, markedWords: apostropheWords,
    canonicalSingletons: singles.length, canonicalSingletonAlphabetSize: singletonAlphabet.size,
    missingCanonicalSingletonRunes: missingSingletonRunes,
    afterSplitTokens: tokens.length, afterSplitSingletons: splitSingles.length,
    afterSplitSingletonAlphabetSize: splitAlphabet.size,
    firstThreeSplits: {words: words.length + 3, singletons: singles.length + 3,
      wordsMod29: (words.length + 3) % 29, singletonsMod29: (singles.length + 3) % 29},
    afterAllSplits: {words: tokens.length, singletons: splitSingles.length,
      wordRows29: tokens.length / 29, singletonRows29: splitSingles.length / 29}
  },
  quotes: {count: quotes.length, runeLengths: quotes.map(q => q.end - q.start),
    wordCounts: quoteWordCounts, totalRunes: quoteRunes, totalWords: quoteWords.length,
    wholeWordBoundaries: true, wordsPlusOneOver29: (quoteWords.length + 1) / 29,
    runesPlusOneOver29: (quoteRunes + 1) / 29},
  repeats: {adjacentEqualPairs: doublets.length, inQuotes: quoteDoublets.length,
    outsideQuotes: doublets.length - quoteDoublets.length},
  countIdentities: {
    totalRunes: chars.length, quoteRunesTimes32MinusFourApostrophes: 32 * quoteRunes - apostrophes.length,
    singletonKeyLength: singletonKey.length,
    singletonKeyTimes149MinusSevenQuoteSpans: 149 * singletonKey.length - quotes.length
  },
  keyTests: {
    ciphertextBaseline: score(C),
    quotedCiphertextBaseline: score(quoteWordIndices.flat()),
    quote405RepeatingKeyWithApostropheSkips: {
      minus: repeatDecrypt(quoteKey, -1, new Set(apostrophes)),
      plus: repeatDecrypt(quoteKey, 1, new Set(apostrophes))
    },
    singleton87RepeatingKeyWithQuoteStartSkips: {
      minus: repeatDecrypt(singletonKey, -1, quoteStarts),
      plus: repeatDecrypt(singletonKey, 1, quoteStarts)
    },
    singleton87RepeatingKeyWithQuoteEndSkips: {
      minus: repeatDecrypt(singletonKey, -1, new Set(), quoteEnds),
      plus: repeatDecrypt(singletonKey, 1, new Set(), quoteEnds)
    },
    singleton87PerQuoteWordShift: {
      dropFirstMinus: perWordShift(singletonKey.slice(1), -1),
      dropFirstPlus: perWordShift(singletonKey.slice(1), 1),
      dropLastMinus: perWordShift(singletonKey.slice(0, -1), -1),
      dropLastPlus: perWordShift(singletonKey.slice(0, -1), 1)
    },
    doublet86PerQuoteWordShift: {minus: perWordShift(doubletKey, -1), plus: perWordShift(doubletKey, 1)},
    singletonFirstDifferencePerQuoteWordShift: {minus: perWordShift(diffKey, -1), plus: perWordShift(diffKey, 1)}
  }
};

assert.equal(chars.length, 12956);
assert.equal(words.length, 2896);
assert.equal(report.source.crossPageWords, 32);
assert.equal(apostrophes.length, 4);
assert.equal(quoteRunes, 405);
assert.equal(quoteWords.length, 86);
assert.equal(doublets.length, 86);
assert.equal(tokens.length, 2900);
assert.equal(splitSingles.length, 87);
assert.equal(singletonAlphabet.size, 28);
assert.equal(splitAlphabet.size, 29);
assert.equal(32 * quoteRunes - apostrophes.length, chars.length);
assert.equal(149 * singletonKey.length - quotes.length, chars.length);

console.log(JSON.stringify(report, null, 2));
