"use strict";

/**
 * Bounded original-source LP2 polygraphic test for Director issue #2258.
 *
 * Predeclared candidate: GP29 = a singleton F + a 4x7 coordinate board of
 * the remaining 28 GP symbols; reverse column order within each uninterrupted
 * non-F word segment. At each COMPLETE printed word, add the printed p15
 * Fibonacci-prime 16-cell spiral value modulo 29, with the key clock reset
 * at the physical page where that complete word starts. A continued word
 * crossing a physical page is consumed once, never resegmented.
 *
 * Claims are scoped: p15's 4x4 spiral, the historical 7x7 square and actual
 * mirrored LP2 artwork are authentic separate objects, but their *joint*
 * use as this 4x7/word cipher is a HYPOTHESIS without a first-party opcode.
 * The script tests that one complete, lossless model and a key-independent
 * 16-phase singleton obstruction. It does not fit keys to original text.
 *
 * Run: node sims/lp2_2258_rectangle4x7_spiral_word_polygraph_sft.cjs
 * Node 22/CommonJS, read-only, no external dependencies or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const pages = corpus.pages.filter(p => p.page <= 55);
const roman = corpus.translit;
const glyphMap = new Map(corpus.runes.map((r, i) => [r, i]));
const runeRegex = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const source = read("resources/liber-primus/lp2-transcription.txt");
const fullSource = source.split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (fullSource.match(runeRegex) || [])
  .map(w => Array.from(w, r => glyphMap.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), pages.flatMap(p => p.indices));
assert.equal(words.flat().length, 12956);
const pageRanges = [];
let pageStart = 0;
for (const p of pages) {
  pageRanges.push({ page: p.page, start: pageStart, end: pageStart + p.indices.length });
  pageStart += p.indices.length;
}
assert.equal(pageStart, 12956);
const lengths = source.split("%").slice(0, 55).join("%")
  .split("$").map(s => (s.match(new RegExp("[" + corpus.runes.join("") + "]", "gu")) || []).length)
  .filter(Boolean);
assert.deepEqual(lengths, [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
const sectionRanges = [];
let sectionStart = 0;
for (const [section, length] of lengths.entries()) {
  sectionRanges.push({ section, start: sectionStart, end: sectionStart + length });
  sectionStart += length;
}
const events = [];
const firstPageWord = new Map();
const firstSectionWord = new Map();
let runeStart = 0;
for (const [word, seq] of words.entries()) {
  const page = pageRanges.find(p => runeStart >= p.start && runeStart < p.end);
  const sec = sectionRanges.find(s => runeStart >= s.start && runeStart < s.end);
  assert(page && sec);
  if (!firstPageWord.has(page.page)) firstPageWord.set(page.page, word);
  if (!firstSectionWord.has(sec.section)) firstSectionWord.set(sec.section, word);
  events.push({
    word, runeStart, runes: seq, page: page.page, section: sec.section,
    pageWord: word - firstPageWord.get(page.page),
    sectionWord: word - firstSectionWord.get(sec.section),
    pageRune: runeStart - page.start,
    sectionRune: runeStart - sec.start
  });
  runeStart += seq.length;
}
assert.equal(runeStart, 12956);
assert.equal(events.filter(e => e.runes.length === 1).length, 83);

/* These sixteen values are read from the original p15 4x4 printed square. */
const printedMatrix = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiralCells = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const spiral = spiralCells.map(i => printedMatrix.flat()[i]);
assert.deepEqual(spiral,
  [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const key = spiral.map(n => n % 29);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Reversible 4x7 column reversal for a complete GP29 word. F0 creates
 * independent nonzero segments. Reversing columns twice restores exactly.
 * @param {number[]} word
 * @returns {number[]}
 */
function reverseColumns(word) {
  const result = word.slice();
  for (let start = 0; start < result.length;) {
    if (result[start] === 0) { start++; continue; }
    let end = start;
    while (end < result.length && result[end] !== 0) end++;
    const cols = result.slice(start, end).map(v => (v - 1) % 7);
    for (let j = 0; j < end - start; j++) {
      result[start + j] = 1 + 7 * Math.floor((result[start + j] - 1) / 7)
        + cols[end - start - 1 - j];
    }
    start = end;
  }
  return result;
}
function forward(word, phase) {
  return reverseColumns(word).map(v => mod(v + key[phase % 16]));
}
function inverse(word, phase) {
  return reverseColumns(word.map(v => mod(v - key[phase % 16])));
}
for (let n = 0; n < 29; n++) for (let m = 0; m < 29; m++) {
  assert.deepEqual(reverseColumns(reverseColumns([n, m])), [n, m]);
}
const originalCipher = events.map(e => e.runes);
const originalPlainCandidate = events.map(e => inverse(e.runes, e.pageWord));
assert.deepEqual(originalPlainCandidate.map((w, i) => forward(w, events[i].pageWord)),
  originalCipher, "every original printed word reencrypts without page-wrap damage");
assert.equal(originalPlainCandidate.flat().length, 12956);

/**
 * Within-word repeats are a direct observable; all wordwise uniform Caesar
 * shifts leave them fixed, so they test the coordinate step itself.
 * @param {number[][]} records
 */
function stats(records) {
  const count = new Uint32Array(29);
  let n = 0, pairs = 0, equals = 0;
  for (const w of records) {
    for (let j = 0; j < w.length; j++) {
      count[w[j]]++;
      n++;
      if (j > 0) { pairs++; equals += Number(w[j] === w[j - 1]); }
    }
  }
  const ioc = count.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1));
  return { runes: n, words: records.length, pairs, equals, ioc };
}
const origStats = stats(originalCipher);
const inverseStats = stats(originalPlainCandidate);
assert.equal(origStats.equals, 63);
assert.equal(origStats.pairs, 10060);

/**
 * Lossless English GP words; native source spelling is established against
 * solved LP1 and p57 in the separate calibrated source test.
 * @param {string} text
 */
function nativeWords(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  return words.map(w => encodeSourceNativeGP(w)).filter(w => w.length);
}
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p57 = solved.split("### 57\n")[1].trim();
const p57Words = nativeWords(p57);
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Words.flat(), corpus.pages.find(p => p.page === 57).indices,
  "independent source-native p57 control");
const p57Cipher = p57Words.map((w, i) => forward(w, i));
assert.deepEqual(p57Cipher.map((w, i) => inverse(w, i)), p57Words,
  "solved first-party p57 positive");
const corpora = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const plants = [];
for (const [name, file] of corpora) {
  const plain = nativeWords(read(file)).slice(0, 2896);
  assert.equal(plain.length, 2896);
  const cipher = plain.map((w, i) => forward(w, events[i].pageWord));
  assert.deepEqual(cipher.map((w, i) => inverse(w, events[i].pageWord)), plain,
    "native positive with exact 2896-word and page-continued source clock");
  const wrong = cipher.map((w, i) => inverse(w, events[i].pageWord + 1));
  const wrongGlyphs = wrong.flat().filter((v, i) => v !== plain.flat()[i]).length;
  assert(wrongGlyphs > 1000, "wrong clock must not recover source-native text");
  plants.push({name, native:stats(plain), encrypted:stats(cipher), wrongGlyphs});
}

/**
 * Key-independent singleton capacity of ANY unknown phase-specific
 * bijection following a within-word polygraphic step. A length-one word
 * has no other letters to combine, and English source singletons may be
 * A or I; conservatively allow a third unknown symbol/escape.
 *
 * @param {"globalWord"|"globalRune"|"sectionWord"|"sectionRune"|"pageWord"|"pageRune"} scope
 */
function singletonCapacity(scope) {
  const cells = new Map();
  const singleton = events.filter(e => e.runes.length === 1);
  for (const e of singleton) {
    const phase =
      scope === "globalWord" ? e.word % 16 :
      scope === "globalRune" ? e.runeStart % 16 :
      scope === "sectionWord" ? e.section * 16 + e.sectionWord % 16 :
      scope === "sectionRune" ? e.section * 16 + e.sectionRune % 16 :
      scope === "pageWord" ? e.page * 16 + e.pageWord % 16 :
      e.page * 16 + e.pageRune % 16;
    if (!cells.has(phase)) cells.set(phase, new Set());
    cells.get(phase).add(e.runes[0]);
  }
  const distinct = [...cells.values()].map(s => s.size);
  const violating2 = distinct.filter(n => n > 2).length;
  const violating3 = distinct.filter(n => n > 3).length;
  const max = Math.max(...distinct);
  const witness = [...cells].filter(([,s]) => s.size === max)
    .map(([phase, syms]) => ({phase, distinct:syms.size,
      ciphertext: [...syms].map(i => roman[i])})).slice(0, 3);
  return {scope, observedPhases:cells.size, violating2, violating3, max, witness};
}
const capacities = ["globalWord","globalRune","sectionWord","sectionRune",
  "pageWord","pageRune"].map(singletonCapacity);
assert.deepEqual(capacities.map(x => [x.violating2, x.violating3, x.max]),
  [[14,10,7],[13,12,9],[2,1,4],[2,1,4],[0,0,2],[0,0,2]]);

/**
 * Evaluate original untouched physical pages by word START; this deliberately
 * assigns a continued word to its physical source page and preserves it.
 */
function pageStats(start, end) {
  return stats(events.map((e,i) => ({...e, plain:originalPlainCandidate[i]}))
    .filter(e => e.page >= start && e.page <= end).map(e => e.plain));
}
const page0to2 = pageStats(0, 2);
const page16to21 = pageStats(16, 21);
const firstWords = originalPlainCandidate.slice(0, 26)
  .map(w => w.map(i => roman[i]).join("")).join(" ");
const output = {
  classification: "bounded candidate negative; no recovered LP2 plaintext or key",
  model: "GP28 4x7 per-word column reverse; F0 reserved; p15 printed spiral wordwise +mod29, physical page reset",
  original:origStats, candidate:inverseStats,
  originalP0to2:page0to2, untouchedP16to21:page16to21,
  originalFirst26DecodedWords:firstWords, singletonCount:83,
  allSecret16PhaseSingletonCapacities:capacities, solvedP57Control:true,
  exactOriginalReencryption:true, sourceNativePlants:plants
};
console.log(JSON.stringify(output,null,2));
