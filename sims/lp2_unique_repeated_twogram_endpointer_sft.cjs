"use strict";

/**
 * Original LP2 2-word ciphertext reprise; all-word chapter-preserving null.
 * Run: node sims/lp2_unique_repeated_twogram_endpointer_sft.cjs
 * Windows 11 / Node.js 22, no dependencies or outbound network.
 *
 * The null permutes complete, unchanged printed GP words independently in
 * each of the nine originally visible chapters. Analytical first moments
 * bound P(any matching >=6-rune two-word pair) by Markov's inequality.
 * This is a conditional diagnostic, not identification of a cipher or key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8")
  .split("%").slice(0, 55).join("%");
const runes = new Set(corpus.runes);

/** @type {{rune:string,page:number,stop:boolean}[]} */
const words = [];
let page = 0, startPage = 0, buffer = "", runeCount = 0;
/** @param {string} delimiter */
function finish(delimiter) {
  if (!buffer) return;
  words.push({rune: buffer, page: startPage, stop: delimiter === "."});
  buffer = "";
}
for (const ch of text) {
  if (runes.has(ch)) {
    if (!buffer) startPage = page;
    buffer += ch;
    runeCount++;
  } else if (ch === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(ch)) {
    finish(ch);
  }
}
finish("");
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(page, 54);
const physical = (p) => p >= 50 ? p + 1 : p;
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
/** @param {number} p @returns {number} */
const chapter = p => bounds.findIndex((v, i) =>
  i + 1 < bounds.length && physical(p) >= v &&
  physical(p) < bounds[i + 1]);

/** @type {Map<string,number[]>} */
const pairs = new Map();
for (let i = 0; i + 1 < words.length; i++) {
  const key = words[i].rune + "-" + words[i + 1].rune;
  if (!pairs.has(key)) pairs.set(key, []);
  pairs.get(key).push(i);
}
const repeats = [...pairs].filter(([key,loc]) => loc.length >= 2)
  .map(([key,loc]) => ({pair:key,wordOffsets:loc}));
assert.deepEqual(repeats, [{
  pair:"ᛞᛄᚢ-ᛒᛖᛁ", wordOffsets:[1462,2894]
}]);
assert.deepEqual(repeats[0].wordOffsets.map(i => physical(words[i].page)), [27,55]);
assert.deepEqual(words.slice(-2).map(w => w.rune), ["ᛞᛄᚢ","ᛒᛖᛁ"]);

/** @type {Map<string,number>[]} */
const registers = Array.from({length:9}, () => new Map());
for (const w of words) {
  const m = registers[chapter(w.page)];
  m.set(w.rune, (m.get(w.rune) || 0) + 1);
}
const n = registers.map(m => [...m.values()].reduce((s,v) => s+v, 0));
assert.deepEqual(n, [158,255,383,437,224,326,378,669,66]);

/*
 * Exact expected number of repeated >=6-rune ordered adjacent word pairs
 * under independent uniform permutations inside each visual chapter:
 *
 * 1) two non-overlapping word-pair slots inside a chapter: sample 4 words
 *    without replacement from that chapter's fixed word multiset;
 * 2) pair slots from two chapters: independent expected type-pair counts;
 * 3) overlapping pair slots require a triple repetition of the SAME word.
 *
 * No length>=3 word has multiplicity >=3 in any one original chapter,
 * so case (3) is identically zero for the threshold>=6 statistic.
 */
let within = 0, across = 0, overlap = 0;
for (let i = 0; i < registers.length; i++) {
  const entries = [...registers[i]];
  const N = n[i];
  for (const [x, fx] of entries) {
    if (x.length >= 3 && fx >= 3) {
      overlap += fx*(fx-1)*(fx-2)/(N*(N-1));
    }
    for (const [y,fy] of entries) {
      if (x.length + y.length < 6) continue;
      const first = x === y ? fx*(fx-1) : fx*fy;
      const second = x === y ? (fx-2)*(fx-3) : (fx-1)*(fy-1);
      // C(N-1,2)-(N-2) = (N-2)(N-3)/2 nonoverlapping edge pairs
      within += first*second/(2*N*(N-1));
    }
  }
  for (let j = i+1; j < registers.length; j++) {
    const other = registers[j], M=n[j];
    const common = entries.filter(([x]) => other.has(x));
    for (const [x,fx] of common) for (const [y,fy] of common) {
      if (x.length + y.length < 6) continue;
      const gx=other.get(x), gy=other.get(y);
      const ea=(x===y ? fx*(fx-1) : fx*fy)/N;
      const eb=(x===y ? gx*(gx-1) : gx*gy)/M;
      across += ea*eb;
    }
  }
}
assert.equal(overlap, 0);
const expectAny=within+across;
assert.ok(Math.abs(expectAny-0.00012181793137475258)<1e-14);

/*
 * Separate endpoint-specific bound: probability the final two words of
 * the last unknown chapter form a >=6-rune pair also occurring in any
 * of the preceding 8 chapters. The final two *positions* are frozen,
 * while word identities are uniformly permuted within each chapter.
 */
let suffixMatch = 0;
const last=registers[8], endN=n[8];
for (const [x, fx] of last) for (const [y,fy] of last) {
  if (x.length+y.length<6) continue;
  const p=(x===y ? fx*(fx-1) : fx*fy)/(endN*(endN-1));
  if (!p) continue;
  for (let j=0;j<8;j++) {
    const m=registers[j], f=m.get(x)||0, g=m.get(y)||0;
    suffixMatch+=p*(x===y ? f*(f-1) : f*g)/n[j];
  }
}
assert.ok(Math.abs(suffixMatch-0.0000014300627797560314)<1e-16);
console.log(JSON.stringify({
  status:"PASS",
  originalWords:words.length,
  originalRunes:runeCount,
  repeatedTwoWordPhrases:repeats,
  repeatedThreeRuneWords: ["ᛞᛄᚢ", "ᛒᛖᛁ"].map(s => ({
    value:s,
    originalCount:words.filter(w => w.rune===s).length
  })),
  visibleChapterWordCounts:n,
  conditionalExchangeableWordNull:{
    expectedDuplicatePairsWithCombinedLengthAtLeast6:expectAny,
    maxProbabilityOfAtLeastOneSuchDuplicate:expectAny,
    maxProbabilityOfFinalTwoWordPairRepeatedEarlier:suffixMatch
  },
  interpretation:"source-certified recurrence; no plaintext/key/decoder inferred"
},null,2));
