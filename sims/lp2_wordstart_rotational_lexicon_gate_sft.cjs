"use strict";
/**
 * Original LP2 word-start GP29 prefix enrichment under boundary-preserving
 * word rotations and transition-preserving page rotations.
 * Inputs are existing repository resources, no network or generated data.
 * Run in Node.js 22. This is a statistical gate, not a decipherer.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const transcription = fs.readFileSync("resources/lp2-transcription.txt", "utf8");
const lexiconText = fs.readFileSync("resources/control/english_wordfreq_textblob.txt", "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));
const pageTexts = transcription.split("%");
const nonemptyPages = corpus.pages.filter((p) => p.indices.length);
assert.equal(pageTexts.length, 57);
assert.equal(pageTexts.length, nonemptyPages.length);

const words = [];
let current = [];
for (let p = 0; p < pageTexts.length; p++) {
  let pos = 0;
  for (const glyph of pageTexts[p]) {
    if (runeIndex.has(glyph)) {
      const x = runeIndex.get(glyph);
      assert.equal(x, nonemptyPages[p].indices[pos]);
      current.push({ p, i: pos, x });
      pos++;
    } else if ((glyph === "-" || glyph === ".") && current.length) {
      words.push(current);
      current = [];
    }
  }
  assert.equal(pos, nonemptyPages[p].indices.length);
}
if (current.length) words.push(current);
const unknown = words.filter((word) => nonemptyPages[word[0].p].page < 56);
const eligible = unknown.filter((word) => word.length >= 4);
assert.equal(unknown.length, 2896);
assert.equal(eligible.length, 1645);

function asGpPrefix(word) {
  let s = word.toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  while (s.length && out.length < 4) {
    let digraph = s.startsWith("ING") ? "ING" : ["TH", "NG", "EO", "OE", "AE", "IA", "EA"].find((x) => s.startsWith(x));
    const code = digraph ? (digraph === "ING" ? 21 : translitIndex.get(digraph)) : translitIndex.get(s[0]);
    if (code === undefined) return null;
    out.push(code);
    s = s.slice(digraph ? digraph.length : 1);
  }
  return out.length === 4 ? out.join(",") : null;
}

const dictionary = new Set();
for (const line of lexiconText.split(/\r?\n/)) {
  const token = line.split(/\s+/)[0];
  if (!/^[a-z]+$/.test(token)) continue;
  const encoded = asGpPrefix(token);
  if (encoded !== null) dictionary.add(encoded);
}
assert.equal(dictionary.size, 7659);
const prefix = (word) => word.slice(0, 4).map((x) => x.x).join(",");
const original = eligible.filter((word) => dictionary.has(prefix(word))).length;
assert.equal(original, 26);

function makeRng(seed = 0x33013214) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}
function summary(samples, observed) {
  const n = samples.length;
  const mean = samples.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(samples.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  const greaterOrEqual = samples.filter((x) => x >= observed).length;
  return { n, mean, sd, greaterOrEqual, pUpper: (greaterOrEqual + 1) / (n + 1) };
}

const wordRng = makeRng();
const wordSamples = [];
const nRep = 10000;
for (let rep = 0; rep < nRep; rep++) {
  let n = 0;
  for (const word of eligible) {
    const start = wordRng() % word.length;
    if (dictionary.has([0, 1, 2, 3].map((i) => word[(i + start) % word.length].x).join(","))) n++;
  }
  wordSamples.push(n);
}
const wordResult = summary(wordSamples, original);
assert.equal(wordResult.greaterOrEqual, 152);
assert(Math.abs(wordResult.mean - 17.4347) < 1e-9);

let exactWordMean = 0;
for (const word of eligible) {
  let hits = 0;
  for (let phase = 0; phase < word.length; phase++) {
    if (dictionary.has([0, 1, 2, 3].map((i) => word[(i + phase) % word.length].x).join(","))) hits++;
  }
  exactWordMean += hits / word.length;
}
assert(Math.abs(exactWordMean - 17.429112554112542) < 1e-8);

const pageRng = makeRng();
const pageSamples = [];
for (let rep = 0; rep < nRep; rep++) {
  const phases = nonemptyPages.map((page) => pageRng() % page.indices.length);
  let n = 0;
  for (const word of eligible) {
    const k = word.slice(0, 4).map(({ p, i }) => {
      const page = nonemptyPages[p].indices;
      return page[(i + phases[p]) % page.length];
    }).join(",");
    if (dictionary.has(k)) n++;
  }
  pageSamples.push(n);
}
const pageResult = summary(pageSamples, original);

const planted = eligible.map((word, i) => {
  if (i >= 50 || dictionary.has(prefix(word))) return word;
  const copy = word.map((x) => ({ ...x }));
  [8, 3, 19, 18].forEach((x, j) => { copy[j].x = x; });
  return copy;
});
const plantCount = planted.filter((word) => dictionary.has(prefix(word))).length;
assert(plantCount >= original + 40);
assert(wordResult.pUpper < 0.03);
assert(pageResult.pUpper < 0.10);
// Direct first-rune control: the lexical excess must not be attributed to a
// word-initial alphabet-frequency skew without source-calibrated evidence.
const initialPositions = unknown.map((word) => word[0]);
const totalUnknownRunes = nonemptyPages.slice(0, 55).reduce((n, p) => n + p.indices.length, 0);
assert.equal(totalUnknownRunes, 12956);
assert.equal(initialPositions.length, 2896);
const firstFraction = initialPositions.length / totalUnknownRunes;
const fullHist = Array(29).fill(0);
for (const p of nonemptyPages.slice(0, 55)) for (const x of p.indices) fullHist[x]++;
function initialChi(phases) {
  const hist = Array(29).fill(0);
  for (const { p, i } of initialPositions) {
    const page = nonemptyPages[p].indices;
    hist[page[(i + (phases ? phases[p] : 0)) % page.length]]++;
  }
  return hist.reduce((sum, h, x) => {
    const expected = fullHist[x] * firstFraction;
    return sum + (h - expected) ** 2 / (expected * (1 - firstFraction));
  }, 0);
}
const origInitialChi = initialChi(null);
const initialRng = makeRng(0x33013133);
const initialNull = [];
for (let rep = 0; rep < 5000; rep++) {
  const phases = nonemptyPages.slice(0, 55).map((p) => initialRng() % p.indices.length);
  initialNull.push(initialChi(phases));
}
const unigramGate = { originalChi: origInitialChi, pageRotation: summary(initialNull, origInitialChi) };
assert(Math.abs(unigramGate.originalChi - 22.300843244811944) < 1e-9);
assert.equal(unigramGate.pageRotation.greaterOrEqual, 3916);

// Source-native alternative-register controls: the same original word-start
// coordinates and rotation protocol should not automatically enrich any
// language's four-GP-rune lexicon.
function otherRegisterControl(candidates) {
  let actual = 0;
  let expected = 0;
  for (const word of eligible) {
    if (candidates.has(prefix(word))) actual++;
    let h = 0;
    for (let i = 0; i < word.length; i++) {
      if (candidates.has([0, 1, 2, 3].map((j) => word[(i + j) % word.length].x).join(","))) h++;
    }
    expected += h / word.length;
  }
  const rng = makeRng();
  const nullCounts = [];
  for (let rep = 0; rep < 5000; rep++) {
    let h = 0;
    for (const word of eligible) {
      const off = rng() % word.length;
      if (candidates.has([0, 1, 2, 3].map((j) => word[(j + off) % word.length].x).join(","))) h++;
    }
    nullCounts.push(h);
  }
  return { candidatePrefixes: candidates.size, actual, exactMean: expected, wordRotation: summary(nullCounts, actual) };
}
const latinWords = fs.readFileSync("resources/control/latin-vulgate-gp-wholewords.txt", "utf8");
const latinPrefixes = new Set();
for (const raw of latinWords.split(/\r?\n/)) {
  const token = raw.trim();
  if (!/^[0-9A-S]{4,}$/.test(token)) continue;
  latinPrefixes.add(Array.from(token.slice(0, 4), (ch) => parseInt(ch, 36)).join(","));
}
const oldEnglish = JSON.parse(fs.readFileSync("resources/control/beowulf_oe_gp_profile_corrected.json", "utf8"));
const oldEnglishPrefixes = new Set();
let cursor = 0;
for (const n of oldEnglish.allSourceGpWordLengths) {
  if (n >= 4) {
    const indices = Array.from(oldEnglish.sourceGpBase29.slice(cursor, cursor + 4), (ch) => oldEnglish.positiveControlAlphabet.indexOf(ch));
    if (indices.every((n) => n >= 0)) oldEnglishPrefixes.add(indices.join(","));
  }
  cursor += n;
}
assert.equal(cursor, oldEnglish.sourceGpBase29.length);
const latinGate = otherRegisterControl(latinPrefixes);
const oldEnglishGate = otherRegisterControl(oldEnglishPrefixes);
assert.equal(latinGate.actual, 3);
assert.equal(latinGate.wordRotation.greaterOrEqual, 3971);
assert.equal(oldEnglishGate.actual, 5);
assert.equal(oldEnglishGate.wordRotation.greaterOrEqual, 3022);

const output = {
  source: { pages: nonemptyPages.length, unknownWords: unknown.length, eligibleWords: eligible.length, dictionaryPrefixes: dictionary.size },
  original, exactWordMean, wordRotation: wordResult, pageRotation: pageResult, plantedPrefixCount: plantCount, unigramGate, latinGate, oldEnglishGate,
  originalMatches: eligible.filter((word) => dictionary.has(prefix(word))).map((word) => ({
    physicalPage: nonemptyPages[word[0].p].page, pageOffset: word[0].i,
    prefix: word.slice(0, 4).map((r) => corpus.translit[r.x]).join(""),
    wordLength: word.length
  }))
};
console.log(JSON.stringify(output, null, 2));
