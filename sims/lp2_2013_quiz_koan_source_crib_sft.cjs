#!/usr/bin/env node
"use strict";

/**
 * Direct historical-prose reuse crib gate on unmodified LP2 unknown text.
 *
 * Input provenance:
 *   2013 private-round quiz questions (participant transcription, May 2023):
 *   https://leroy.works/articles/answers-to-cicada-3301-2013-questionnaire/
 *   2013 private-round server KOAN protocol example (archived participant text):
 *   https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md
 *   2013 audio ID3 PARABLE phrasing, independently clear in original LP2 p57:
 *   https://github.com/neuroretransmit/cicada/blob/main/2014/011-seventh-onion/README.md
 *
 * This checks only UNCHANGED contiguous word-length-preserving quotation.
 * No guessed keys, cryptograms, word resegmentation, or cipher fitting.
 *
 * Run: node sims/lp2_2013_quiz_koan_source_crib_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const gp = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const known = parseLP2Words(raw, 57);
const unsolved = parseLP2Words(raw, 55);
const digraphs = ["TH", "EO", "OE", "NG", "AE", "IA", "EA"];

/** Source wording transcribed by question number, not a new historical authentication. */
const questions = [
  "Observation changes the thing being observed.",
  "Disregarding color blindness, any arbitrary color looks the same to all people.",
  "Grass is only green due to a relationship between the grass, light, and your mind.",
  "What you are is more important than what you do.",
  "You cannot step into the same river twice.",
  "We get hundreds of millions of sensations coming into our minds at any moment. Our brain can't process them all so it categorizes these signals according to our belief systems. This is why we find evidence to support our beliefs and rarely notice evidence to the contrary.",
  "I am the voice inside my head. You undoubtedly just thought I don't have a voice in my head. That is the voice the question is referring to.",
  "1 = 0.999999...",
  "There is no truth.",
  "If A is not true, then it must be.",
  "All things are true.",
  "This sentence is false.",
  "People who only study material after a test do better than those who do not study at all.",
  "Two people are standing by a lake. One says, that's a lovely reflection in the water. The other says I see no reflection, but it's a fascinating assortment of fish, plants, and rocks within the water. Which one is lying?",
  "What does the word it refer to in the following sentence: It is dark outside?",
  "The mathematical operation known as addition is modeled after what?",
  "Name similarities between reality and the concept of the News Feed on Facebook?",
  "Explain, in your own words, what mathematical principle is relied upon for the security of Shamir's Secret Sharing Scheme.",
  "In the programming language of your choice, write a function that returns a function that returns the value 3301.",
  "In the programming language of your choice, write a function that sums digits of a number until it is one digit, by calling itself."
];

const koan = "A master who lived as a hermit on a mountain was asked by a monk, What is the Way? What a fine mountain this is, the master said in reply. I am not asking you about the mountain, but about the Way. So long as you cannot go beyond the mountain, my son, you cannot reach the Way, replied the master.";
const parable = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";

/**
 * Full-word normalization: digits deliberately remain unrepresented, as a
 * 29-rune spelling of 3301 or 0.999999 is not independently specified.
 * @param {string} text
 * @returns {string[]}
 */
function words(text) {
  return text.toUpperCase().replace(/['’]/g, "").match(/[A-Z]+/g) || [];
}

/** @param {string} word @param {"native"|"letters"} register */
function countGP(word, register) {
  let normalized = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  if (register === "letters") return normalized.length;
  // Independently solved p57 spells TUNNELING as TUNNEL-NG (7 runes).
  normalized = normalized.replace(/ING/g, "NG");
  let count = 0;
  for (let i = 0; i < normalized.length;) {
    const pair = digraphs.find((token) => normalized.startsWith(token, i));
    i += pair ? pair.length : 1;
    count++;
  }
  return count;
}

/** @param {string} source @param {"native"|"letters"} register */
function signature(source, register) {
  return words(source).map((word) => countGP(word, register));
}

/**
 * Exhaust every source start against every contiguous canonical printed-word
 * start. Source offset, book word position and physical page are recorded.
 * @param {number[]} source
 * @param {Array<{length:number,startPage:number}>} target
 */
function bestMatch(source, target) {
  let best = {run: 0, sourceOffset: 0, bookWord: 0, physicalPage: null};
  for (let a = 0; a < source.length; a++) {
    for (let b = 0; b < target.length; b++) {
      if (source[a] !== target[b].length) continue;
      let n = 0;
      while (a + n < source.length && b + n < target.length &&
        source[a + n] === target[b + n].length) n++;
      if (n > best.run) best = {
        run: n, sourceOffset: a, bookWord: b,
        physicalPage: target[b].startPage >= 50 ?
          target[b].startPage + 1 : target[b].startPage
      };
    }
  }
  return best;
}

assert.equal(questions.length, 20);
assert.equal(unsolved.words.length, 2896);
assert.equal(unsolved.runeCount, 12956);
assert.equal(unsolved.crossPageWords, 32);
assert.deepEqual(
  [...unsolved.words.flatMap((word) => [...word.runes])],
  gp.pages.filter((p) => p.status === "unsolved")
    .flatMap((p) => p.indices.map((value) => gp.runes[value]))
);

// Genuine *source-derived* exact positive. A 2013 audio PARABLE is visibly
// printed as original solved p57 GP29, with all 20 printed words retained.
const originalP57 = known.byStartPage[56];
const p57Native = signature(parable, "native");
assert.equal(originalP57.length, 20);
assert.equal(p57Native.length, 20);
assert.deepEqual(p57Native, originalP57.map((w) => w.length));
assert.equal(originalP57.reduce((n, w) => n + w.length, 0), 95);
const plantedWrong = signature(parable.replace("DIVINITY", "DIVINE"), "native");
assert.notDeepEqual(plantedWrong, p57Native, "deliberately altered known text passed");

const source = [...questions, koan];
const outputs = source.map((text, id) => ({
  label: id === 20 ? "2013 KOAN protocol example" :
    "2013 quiz Q" + String(id + 1).padStart(2, "0"),
  words: words(text).length,
  native: bestMatch(signature(text, "native"), unsolved.words),
  letters: bestMatch(signature(text, "letters"), unsolved.words)
}));

assert.deepEqual(outputs.map((x) => x.native.run),
  [4, 6, 5, 4, 4, 6, 5, 0, 4, 6, 4, 4, 5, 5, 5, 5, 5, 4, 4, 5, 6]);
assert.deepEqual(outputs.map((x) => x.letters.run),
  [4, 5, 5, 4, 5, 5, 5, 0, 4, 5, 4, 3, 6, 4, 6, 5, 5, 4, 4, 5, 5]);
assert.equal(Math.max(...outputs.map((x) => x.native.run)), 6);
assert.equal(Math.max(...outputs.map((x) => x.letters.run)), 6);

console.log(JSON.stringify({
  status: "PASS",
  source: "2013 participant-reported quiz questions and protocol KOAN",
  original: {runes: unsolved.runeCount, words: unsolved.words.length,
    crossPhysicalPageWords: unsolved.crossPageWords},
  sourcePositive: {parableWords: 20, parableRunes: 95,
    originalGpWordLengthsEqual: true},
  sourceNegative: {alteredParableDifferent: true},
  testedPassages: outputs.length,
  maxOriginalMatchedConsecutiveWordLengths: {native: 6, letters: 6},
  results: outputs,
  conclusion: "No unchanged >=7-word quotation from these 2013 source passages survives on original unknown LP2 word boundaries. Short matches are nonidentifying."
}, null, 2));
