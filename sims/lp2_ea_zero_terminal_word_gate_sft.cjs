"use strict";

/**
 * Exact original-cipher word-terminal falsifier for GP29 EA-as-zero-step models.
 *
 * Run from repository root: node sims/lp2_ea_zero_terminal_word_gate_sft.cjs
 *
 * This tests any model with the immutable implication
 *   C[i] == C[i-1] => plaintext[i] == EA (GP rune index28),
 * provided original printed word boundaries and GP English are preserved.
 * It does not assume a particular cipher key, transition register, or direction.
 *
 * Sources: unchanged original LP2 transcription; nine published, already-solved
 * GP29 source texts; original 2012 Blake and 2013 Book of Law literary texts.
 * All inputs are committed; no external dependencies or network access.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.equal(corpus.runes.length, 29);
assert.deepEqual(solved.runes, corpus.runes);
const GP = new Set(corpus.runes);
const EA = corpus.runes[28];
assert.equal(EA, "ᛠ");

// Canonical actual source-word segmentation, including page-carried words.
// The original markup distinguishes line wrap "/" from authentic word "-".
// This exact parser is independently calibrated in the existing lag5 SFT.
const pages = original.split("%");
assert.equal(pages.length, 57);
const words = pages.slice(0, 55).join("").replace(/[\/\s]/g, "")
  .split(/[-.&$§]+/)
  .filter(word => word.length > 0 && Array.from(word).every(r => GP.has(r)))
  .map(word => Array.from(word));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);

const GPRegex = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const solvedWords = solved.sections.flatMap(section =>
  (section.source_text.match(GPRegex) ?? []).map(word => Array.from(word)));
assert.equal(solvedWords.length, 740);
assert.equal(solvedWords.reduce((n, word) => n + word.length, 0), 2979);

/** @param {number[][] | string[][]} input */
function lengthAndSuffix(input, EAValue) {
  let total = 0;
  let threePlus = 0;
  let suffix = 0;
  let longSuffix = 0;
  const byLength = {};
  for (const word of input) {
    total++;
    if (word.length >= 3) threePlus++;
    const hasSuffix = word[word.length - 1] === EAValue;
    if (hasSuffix) {
      suffix++;
      byLength[word.length] = (byLength[word.length] ?? 0) + 1;
      if (word.length >= 3) longSuffix++;
    }
  }
  return { words: total, words3plus: threePlus, terminalEA: suffix,
    terminalEA3plus: longSuffix, terminalByLength: byLength };
}

/** @param {string} raw @returns {string[][]} */
function literaryGP(raw) {
  const tokens = ["ING", "TH", "EO", "NG", "OE", "AE", "IA", "EA"];
  const words = raw.toUpperCase().match(/[A-Z]+/g) ?? [];
  return words.map(word => {
    const s = word.replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const output = [];
    for (let i = 0; i < s.length;) {
      const token = tokens.find(item => s.startsWith(item, i));
      if (token) {
        output.push(token);
        i += token.length;
      } else {
        output.push(s[i]);
        i++;
      }
    }
    return output;
  });
}

/**
 * Stable binomial right tail computed starting at the first requested event.
 * @param {number} k
 * @param {number} n
 * @param {number} p
 */
function rightTail(k, n, p) {
  let logChoose = 0;
  for (let i = 0; i < k; i++) logChoose += Math.log(n-i) - Math.log(i+1);
  let term = Math.exp(logChoose + k*Math.log(p) + (n-k)*Math.log1p(-p));
  let sum = term;
  for (let i = k; i < n && term > Number.MIN_VALUE * 100; i++) {
    term *= (n-i)/(i+1)*p/(1-p);
    sum += term;
  }
  return sum;
}

// All source-visible equalities, preserving the *word* location of a match.
// At a word-final position where C[i] == C[i-1], any zero=>EA mechanism forces
// that exact printed word's decoded final GP rune to be EA.
let last = null;
let allDoublets = 0;
const forcedTerminalWords = [];
let acrossWordDoublets = 0;
for (let w = 0; w < words.length; w++) {
  const word = words[w];
  for (let j = 0; j < word.length; j++) {
    const rune = word[j];
    if (rune === last) {
      allDoublets++;
      if (j === 0) acrossWordDoublets++;
      if (j === word.length - 1 && j > 0) forcedTerminalWords.push({wordIndex: w, length: word.length, originalRunes: word.join("")});
    }
    last = rune;
  }
}
assert.equal(allDoublets, 86);
assert.equal(acrossWordDoublets, 23);
assert.equal(forcedTerminalWords.length, 19);
const actual = {
  totalPrintedWords: words.length,
  runeCount: words.reduce((n, w) => n + w.length, 0),
  doublets: allDoublets,
  doubletsAtWordStart: acrossWordDoublets,
  forcedTerminalEA: forcedTerminalWords.length,
  forcedTerminalEA3plus: forcedTerminalWords.filter(word => word.length >= 3).length,
  wordLengthHistogram: Object.fromEntries([...new Set(words.map(word => word.length))].sort((a,b)=>a-b).map(L => [L, words.filter(w=>w.length===L).length])),
  forcedTerminalByLength: Object.fromEntries([...new Set(forcedTerminalWords.map(w=>w.length))].sort((a,b)=>a-b).map(L => [L, forcedTerminalWords.filter(w=>w.length===L).length])),
  examples: forcedTerminalWords,
};
assert.equal(actual.forcedTerminalEA3plus, 18);
const native = lengthAndSuffix(solvedWords, EA);
assert.deepEqual([native.words, native.words3plus, native.terminalEA], [740, 534, 0]);

const paths = [
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
];
const references = paths.map(p => ({file:p, ...lengthAndSuffix(literaryGP(read(p)), "EA")}));
const merged = {
  words: references.reduce((n,r)=>n+r.words,0),
  words3plus: references.reduce((n,r)=>n+r.words3plus,0),
  terminalEA: references.reduce((n,r)=>n+r.terminalEA,0),
  terminalEA3plus: references.reduce((n,r)=>n+r.terminalEA3plus,0),
};
assert.deepEqual(merged, {words:13645,words3plus:9447,terminalEA:8,terminalEA3plus:0});
assert.equal(actual.wordLengthHistogram["1"], 83);
assert.equal(actual.wordLengthHistogram["2"], 448);

// This tail is a descriptive iid literary-rate comparison and is not a
// cryptographic proof of word-register semantics or independent authorship.
const p = merged.terminalEA / merged.words;
const tail = rightTail(actual.forcedTerminalEA, actual.totalPrintedWords, p);
assert.ok(Math.abs(tail / 3.6554104956204455e-14 - 1) < 1e-8);

console.log(JSON.stringify({
  conclusion: "Any lossless model forcing GP plaintext EA on every ciphertext doublet and preserving the printed English word boundaries would require 19 original words ending in EA, of which 18 have at least three GP runes. This is strongly atypical of the source-native controls; alternative plaintext languages, word boundary semantics, or zero-step meanings remain possible.",
  original_source: actual,
  solved_native_gp_reference: native,
  original_cicada_literary_sources: references,
  combined_literary_reference: merged,
  literary_terminal_ea_rate: p,
  required_terminal_ea_rate: actual.forcedTerminalEA / actual.totalPrintedWords,
  rate_ratio: (actual.forcedTerminalEA / actual.totalPrintedWords) / p,
  descriptive_iid_binomial_right_tail: tail,
  references_gp_threeplus_and_native: merged.words3plus + native.words3plus,
  reference_gp_threeplus_terminal_ea: merged.terminalEA3plus + native.terminalEA3plus,
  status: "word-orthography obstruction; no original LP2 plaintext or key",
},null,2));
