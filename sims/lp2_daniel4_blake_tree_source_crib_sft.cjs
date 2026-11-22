"use strict";
/**
 * Frozen image-attributed 40+ GP rune known-plaintext crib gate.
 *
 * Source selection is independent of ciphertext: Daniel 4:10-12 describes
 * Nebuchadnezzar's great tree (LP2 physical pp16-21); Daniel 4:33 describes
 * the king's abjection and bird feathers (pp22-27, figure/wing); Blake's
 * Laocoon plate explicitly labels two opposed Trees (p32 illustrated tree).
 * Original 2014 cover 1033.jpg contains William Blake artwork of
 * Nebuchadnezzar, Newton and The Ancient of Days.
 *
 * The sources are historical conjectures, not claims of actual LP2 plaintext.
 * Preserve original word lengths without arbitrary resegmentation; compare
 * with 2000 shuffles of the original ciphertext word lengths within pages,
 * applying the entire three-source selection to every null draw.
 *
 * Run: node sims/lp2_daniel4_blake_tree_source_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
const original = parseLP2Words(
  fs.readFileSync(path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8"));
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
const SOURCE = Object.freeze([
  {
    label: "KJV Daniel 4:10-12, great-tree vision",
    url: "https://original.sacred-texts.com/bib/kjv/dan004.htm",
    targetPhysicalPages: [16, 21],
    expectedWordCount: 96,
    expectedRuneCount: 323,
    text: "Thus were the visions of mine head in my bed; I saw, and behold a tree in the midst of the earth, and the height thereof was great. The tree grew, and was strong, and the height thereof reached unto heaven, and the sight thereof to the end of all the earth. The leaves thereof were fair, and the fruit thereof much, and in it was meat for all: the beasts of the field had shadow under it, and the fowls of the heaven dwelt in the boughs thereof, and all flesh was fed of it."
  },
  {
    label: "KJV Daniel 4:33, king's feathers and claws",
    url: "https://www.biblegateway.com/passage/?search=Daniel+4%3A33&version=KJV",
    targetPhysicalPages: [22, 27],
    expectedWordCount: 45,
    expectedRuneCount: 176,
    text: "The same hour was the thing fulfilled upon Nebuchadnezzar: and he was driven from men, and did eat grass as oxen, and his body was wet with the dew of heaven, till his hairs were grown like eagles' feathers, and his nails like birds' claws."
  },
  {
    label: "William Blake Laocoon tree-of-life inscription",
    url: "https://blake.lib.asu.edu/html/laocoon.html",
    targetPhysicalPages: [32, 32],
    expectedWordCount: 15,
    expectedRuneCount: 47,
    text: "SCIENCE is the Tree of DEATH ART is the Tree of LIFE GOD is JESUS"
  }
]);
const DIGRAPHS = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
/**
 * @param {string} passage
 * @returns {number[]}
 */
function gpWordLengths(passage) {
  return (passage.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    const plain = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    let n = 0;
    for (let i = 0; i < plain.length;) {
      const ing = plain.startsWith("ING", i);
      const digraph = DIGRAPHS.has(plain.slice(i, i + 2));
      n++;
      i += ing ? 3 : (digraph ? 2 : 1);
    }
    return n;
  });
}
/**
 * @param {number[]} observed
 * @param {number[]} text
 * @returns {{length:number, observedWord:number, sourceWord:number}}
 */
function longestExact(observed, text) {
  let previous = new Uint16Array(text.length + 1);
  let current = new Uint16Array(text.length + 1);
  let max = 0, observedWord = -1, sourceWord = -1;
  for (let i = 0; i < observed.length; i++) {
    current.fill(0);
    for (let j = 0; j < text.length; j++) {
      if (observed[i] === text[j]) {
        current[j + 1] = previous[j] + 1;
        if (current[j + 1] > max) {
          max = current[j + 1];
          observedWord = i + 1 - max;
          sourceWord = j + 1 - max;
        }
      }
    }
    [current, previous] = [previous, current];
  }
  return {length:max, observedWord, sourceWord};
}
/**
 * @param {number[]} array
 * @param {() => number} rand
 */
function shuffled(array, rand) {
  const output = array.slice();
  for (let i = output.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}
/** @returns {() => number} */
function seeded(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}
const PAGE_WORDS = original.byStartPage.map(words => words.map(word => word.length));
const prepared = SOURCE.map(test => {
  const sourceLengths = gpWordLengths(test.text);
  assert.equal(sourceLengths.length, test.expectedWordCount);
  assert.equal(sourceLengths.reduce((a, b) => a + b, 0), test.expectedRuneCount);
  const [first, last] = test.targetPhysicalPages;
  const observed = PAGE_WORDS.slice(first, last + 1).flat();
  const winner = longestExact(observed, sourceLengths);
  return { ...test, sourceLengths, observed, winner };
});
assert.deepEqual(prepared.map(x => x.winner.length), [5, 5, 2]);
assert.deepEqual(prepared.map(x => x.observed.length), [373, 303, 21]);
for (const row of prepared) {
  const planted = row.observed.slice();
  const start = 0;
  planted.splice(start, row.sourceLengths.length, ...row.sourceLengths);
  assert.equal(longestExact(planted, row.sourceLengths).length, row.sourceLengths.length);
}
const REPEATS = 2000;
const rand = seeded(0x041c3301);
let atLeast = 0, min = Infinity, max = -Infinity, sum = 0;
const histogram = {};
const observedMax = Math.max(...prepared.map(x => x.winner.length));
for (let run = 0; run < REPEATS; run++) {
  const pageLengths = PAGE_WORDS.map(page => shuffled(page, rand));
  let statistic = 0;
  for (const row of prepared) {
    const [first, last] = row.targetPhysicalPages;
    const trial = pageLengths.slice(first, last + 1).flat();
    statistic = Math.max(statistic, longestExact(trial, row.sourceLengths).length);
  }
  atLeast += Number(statistic >= observedMax);
  min = Math.min(min, statistic);
  max = Math.max(max, statistic);
  sum += statistic;
  histogram[statistic] = (histogram[statistic] || 0) + 1;
}
const result = {
  inference: "No source-authentic 40+ rune contiguous LP2 plaintext crib from these image-attributed texts",
  sourceSelection: "KJV Daniel chapter 4 and Blake Laocoon selected from 1033.jpg Nebuchadnezzar/Blake cover and the original physical illustrations",
  originalCipherWords: original.words.length,
  originalCipherRunes: original.runeCount,
  candidates: prepared.map(x => ({
    label:x.label, sourceUrl:x.url, originalPageInterval:x.targetPhysicalPages,
    candidateWords:x.expectedWordCount, candidateGPRunes:x.expectedRuneCount,
    observedWords:x.observed.length, exactMatchedWords:x.winner.length,
    startAtOriginalWord:x.winner.observedWord, startAtSourceWord:x.winner.sourceWord,
    maxMatchedCipherGPRunes:x.observed.slice(x.winner.observedWord,
      x.winner.observedWord + x.winner.length).reduce((a, b) => a + b, 0),
    exact40GPRuneCribFound:false
  })),
  calibration: {
    description:"familywise best-of-three exact match with independent shuffles inside each original physical page",
    seed:"0x041c3301", draws:REPEATS, observedMaxWords:observedMax,
    meanNullMax:sum / REPEATS, minNullMax:min, maxNullMax:max, histogram,
    drawsAtLeastObserved:atLeast, addOneTail:(atLeast+1)/(REPEATS+1)
  },
  control:"Three synthetic source-window implants recovered their entire fixed original length sequence, with all GP lengths checked"
};
console.log(JSON.stringify(result, null, 2));
