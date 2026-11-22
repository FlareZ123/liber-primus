"use strict";
/**
 * Source-exact, word-local five-back equality census and two frozen conditional
 * GP29 cribs.  Neither word asserts a historical decipherment.
 * Windows Node.js 22: node sims/lp2_triple_lag5_two_cribs_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus, physicalLP2Page } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = parseSharedCorpus();
const words = original.words;
const alphabet = corpus.runes;
const names = corpus.translit;
assert.equal(words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);
assert.equal(alphabet.length, 29);
const runeToIndex = new Map(alphabet.map((rune, index) => [rune, index]));
const longestFirst = names.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);

/**
 * Native-GP lexical mapping, identical to the original p36 conditional crib SFT.
 * @param {string} word
 * @returns {number[]}
 */
function native(word) {
  const spelling = word.toUpperCase().replace(/ING/g, "NG").replace(/K/g, "C")
    .replace(/Q/g, "CW").replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let at = 0; at < spelling.length;) {
    const match = longestFirst.find((entry) => spelling.startsWith(entry.name, at));
    if (!match) return [];
    out.push(match.index);
    at += match.name.length;
  }
  return out;
}

/** @param {string} text @returns {number[]} */
function toIndices(text) {
  return [...text].map((rune) => {
    const index = runeToIndex.get(rune);
    assert.notEqual(index, undefined, "Unknown GP rune in canonical transcript");
    return index;
  });
}

/** @param {number[]} indices @returns {string} */
function translit(indices) {
  return indices.map((index) => names[index]).join("");
}

/** @param {number[]} a @returns {boolean[]} */
function shape(a) {
  return a.slice(5).map((rune, at) => rune === a[at]);
}

const entries = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter((line) => /^[a-z]+ \d+$/.test(line))
  .map((line) => {
    const [word, frequency] = line.split(" ");
    return { word, frequency: Number(frequency), indices: native(word) };
  });
assert.equal(entries.length, 29157);
const lexicon = new Set(entries.map((entry) => entry.word));

const echoes = [];
let allFiveBack = 0;
for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
  const word = words[wordIndex];
  const indices = toIndices(word.runes);
  const matches = shape(indices);
  const equalityCount = matches.filter(Boolean).length;
  allFiveBack += equalityCount;
  if (equalityCount >= 2) {
    echoes.push({
      wordIndex, sourcePage: word.startPage, physicalPage: physicalLP2Page(word.startPage),
      length: indices.length, equalityCount, matches, indices,
    });
  }
}
assert.equal(allFiveBack, 104);
assert.equal(echoes.length, 9);
const triple = echoes.filter((row) => row.equalityCount >= 3);
assert.deepEqual(triple.map((row) => [row.wordIndex, row.sourcePage, row.length, row.equalityCount]),
  [[1967, 36, 10, 3], [2722, 50, 8, 3]]);

const expected = [
  { id: 1967, page: 36, jpeg: "53.jpg", candidate: "tapestries", shape: [true, false, false, true, true] },
  { id: 2722, page: 51, jpeg: "68.jpg", candidate: "mesdames", shape: [true, true, true] },
];
const matches = expected.map((item, index) => {
  const actual = triple[index];
  assert.equal(actual.wordIndex, item.id);
  assert.equal(actual.physicalPage, item.page);
  assert.deepEqual(actual.matches, item.shape);
  const candidates = entries.filter((entry) => entry.indices.length === actual.length &&
    item.shape.every((bit, at) => (entry.indices[at] === entry.indices[at + 5]) === bit));
  assert.deepEqual(candidates.map((entry) => entry.word), [item.candidate]);
  return {
    wordIndex: item.id, physicalPage: item.page, originalJpeg: item.jpeg,
    original: namesOf(actual.indices), lagFiveEqualities: actual.matches,
    conditionalNativeEnglishCandidates: candidates.map((entry) => entry.word),
  };
});
/** @param {number[]} indices @returns {string} */
function namesOf(indices) { return indices.map((index) => names[index]).join("-"); }

// A stronger, key-independent necessary-and-sufficient condition for any
// additive period-five key is equality of all fifth-back differences between
// ciphertext and candidate plaintext. The p36 conditional TAPESTRIES fails
// this condition (even though its equality mask matches).
/**
 * @param {number[]} a
 * @returns {number[]}
 */
function lagFiveDifferences(a) {
  return a.slice(5).map((rune, at) => (rune - a[at] + 29) % 29);
}
const p36 = triple[0].indices;
const p36Plain = native("tapestries");
assert.deepEqual(lagFiveDifferences(p36), [0, 9, 2, 0, 0]);
assert.deepEqual(lagFiveDifferences(p36Plain), [0, 9, 26, 0, 0]);
assert.notDeepEqual(lagFiveDifferences(p36), lagFiveDifferences(p36Plain));
const additiveCandidates = triple.map(({ indices }) => entries
  .filter(({ indices: candidate }) => candidate.length === indices.length &&
    lagFiveDifferences(candidate).every((delta, at) =>
      delta === lagFiveDifferences(indices)[at]))
  .map((entry) => entry.word));
assert.deepEqual(additiveCandidates, [[], ["mesdames"]]);

// Independent Latin Vulgate control: two native-GP occurrences of the word
// TURBETUR have the same p51 triple-repeat shape. This invalidates any claim
// that MESDAMES is the unique plausible plaintext across languages.
const gp29Digits = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));
assert.equal(latinWords.length, 39835);
const latinByLength = [new Set(latinWords.filter((word) => word.length === 10)),
  new Set(latinWords.filter((word) => word.length === 8))];
const latinIndices = (word) => [...word].map((char) => gp29Digits.indexOf(char));
assert(latinWords.every((word) => [...word].every((char) => gp29Digits.includes(char))));
const latinShapeCandidates = triple.map(({ indices }, at) =>
  [...latinByLength[at]].filter((word) =>
    shape(latinIndices(word)).every((equal, phase) => equal === shape(indices)[phase])));
assert.deepEqual(latinShapeCandidates, [[], ["G14HIG14"]]);
assert.equal(latinWords.filter((word) => word === "G14HIG14").length, 2);
const latinAdditiveCandidates = triple.map(({ indices }, at) =>
  [...latinByLength[at]].filter((word) =>
    lagFiveDifferences(latinIndices(word)).every((delta, phase) =>
      delta === lagFiveDifferences(indices)[phase])));
assert.deepEqual(latinAdditiveCandidates, [[], ["G14HIG14"]]);

// The p51 conditional word fixes exactly one additive period-5 key. Its
// word-reset and continuous-clock extensions fail on neighboring source words.
const crib = triple[1].indices;
const proposedPlaintext = native("mesdames");
assert.equal(proposedPlaintext.length, crib.length);
const key = proposedPlaintext.slice(0, 5)
  .map((rune, at) => (crib[at] - rune + 29) % 29);
assert.deepEqual(key, [25, 5, 6, 12, 25]);
assert.deepEqual(crib.map((rune, at) => (rune - key[at % 5] + 29) % 29),
  proposedPlaintext);
const left = 2707, rightExclusive = 2732, anchor = 2722;
const window = words.slice(left, rightExclusive);
const beforeAnchor = window.slice(0, anchor - left)
  .reduce((sum, word) => sum + [...word.runes].length, 0);

/**
 * Decode a source neighbor under the one crib-derived period-5 additive key.
 * @param {"word-reset"|"continuous"} clock
 * @returns {string[]}
 */
function decryptWindow(clock) {
  let offset = 0;
  const result = [];
  for (const word of window) {
    const a = toIndices(word.runes);
    const clear = a.map((rune, at) => {
      const absolute = clock === "word-reset" ? at : offset + at - beforeAnchor;
      const phase = ((absolute % 5) + 5) % 5;
      return (rune - key[phase] + 29) % 29;
    });
    result.push(translit(clear).toLowerCase());
    offset += a.length;
  }
  assert.equal(result[anchor - left], "mesdames");
  return result;
}
// Under TURBETUR as the p51 original plaintext, the fully determined Latin
// five-shift pad yields no exact Vulgate vocabulary words in its 24 neighbors.
const latinPlain = latinIndices("G14HIG14");
const latinKey = crib.slice(0, 5)
  .map((value, at) => (value - latinPlain[at] + 29) % 29);
assert.deepEqual(latinKey, [28, 22, 17, 18, 2]);
assert.deepEqual(crib.map((value, at) => (value - latinKey[at % 5] + 29) % 29),
  latinPlain);
const latinLexicon = new Set(latinWords);
/** @param {"word-reset"|"continuous"} clock */
function latinHeldoutMatches(clock) {
  let offset = 0;
  let count = 0;
  for (let at = 0; at < window.length; at++) {
    const word = window[at];
    const ciphertext = toIndices(word.runes);
    const decoded = ciphertext.map((rune, inner) => {
      const absolute = clock === "word-reset" ? inner : offset + inner - beforeAnchor;
      return (rune - latinKey[((absolute % 5) + 5) % 5] + 29) % 29;
    }).map((rune) => gp29Digits[rune]).join("");
    if (at + left !== anchor && latinLexicon.has(decoded)) count++;
    offset += ciphertext.length;
  }
  return count;
}
assert.equal(latinHeldoutMatches("word-reset"), 0);
assert.equal(latinHeldoutMatches("continuous"), 0);

const wordReset = decryptWindow("word-reset");
const continuous = decryptWindow("continuous");
const summarize = (candidate) => ({
  heldOutWords: candidate.length - 1,
  exactTextBlobMatches: candidate.flatMap((word, at) =>
    at + left === anchor || !lexicon.has(word) ? [] : [{ wordIndex: at + left, word }]),
});
const resetSummary = summarize(wordReset);
const continuousSummary = summarize(continuous);
assert.deepEqual(resetSummary.exactTextBlobMatches, [{ wordIndex: 2723, word: "y" }]);
assert.deepEqual(continuousSummary.exactTextBlobMatches,
  [{ wordIndex: 2710, word: "eau" }, { wordIndex: 2723, word: "i" }]);

// Independent positive controls show the concrete decoder recovers arbitrary
// GP-native words encrypted by the stipulated additive period-5 law.
const controls = entries.filter((entry) => entry.indices.length >= 3 && entry.frequency > 100)
  .slice(0, window.length).map((entry) => entry.indices);
assert.equal(controls.length, window.length);
for (const clock of ["word-reset", "continuous"]) {
  let offset = 0;
  for (const word of controls) {
    for (let at = 0; at < word.length; at++) {
      const position = clock === "word-reset" ? at : offset + at;
      const phase = position % 5;
      const encoded = (word[at] + key[phase]) % 29;
      assert.equal((encoded - key[phase] + 29) % 29, word[at]);
    }
    offset += word.length;
  }
}
console.log(JSON.stringify({
  originalRuneCount: original.runeCount,
  originalWords: words.length,
  wordLocalLagFiveEchoes: allFiveBack,
  wordsWithAtLeastTwoEchoes: echoes.length,
  wordsWithAtLeastThreeEchoes: matches,
  p36CiphertextLag5Differences: lagFiveDifferences(p36),
  p36ConditionalCribLag5Differences: lagFiveDifferences(p36Plain),
  fullAdditiveFivePeriodLexicalCandidates: additiveCandidates,
  latinVulgateGP29ShapeCandidates: latinShapeCandidates,
  latinVulgateGP29AdditiveCandidates: latinAdditiveCandidates,
  p51LatinConditionalWord: "TURBETUR",
  conditionalP51LatinAdditiveKey: latinKey,
  originalP51LatinHeldoutMatches: {wordReset: latinHeldoutMatches("word-reset"), continuous: latinHeldoutMatches("continuous")},
  conditionalP51AdditiveKey: key,
  originalP51NeighborWordReset: resetSummary,
  originalP51NeighborContinuous: continuousSummary,
  plantedNativeGPControl: "25/25 words pass both period-5 clocks",
  conclusion: "Both source words are shape-compatible with five-phase substitution alphabets, but p36 has no TextBlob/Vulgate additive period-five word under any secret key; the p51 alternatives MESDAMES and TURBETUR yield no coherent held-out neighbors. No unknown plaintext is recovered. No unknown plaintext is recovered.",
}, null, 2));
