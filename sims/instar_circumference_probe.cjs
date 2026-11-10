"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const quadgramText = fs.readFileSync(
  path.join(ROOT, "resources", "control", "duko_round27_english_quadgrams.txt"), "utf8");
const quadgrams = new Map();
for (const line of quadgramText.trim().split(/\r?\n/u)) {
  const match = line.trim().match(/^([A-Z]{4})\s+(\d+)$/u);
  if (match) quadgrams.set(match[1], Number(match[2]));
}

const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956, "original unsolved rune count");
assert.equal(parsed.words.length, 2896, "canonical continuous word count");
assert.equal(parsed.crossPageWords, 32, "cross-page word count");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeWords = parsed.words.map((word) => [...word.runes].map((rune) => {
  const index = runeIndex.get(rune);
  assert(Number.isInteger(index), "unknown rune " + rune);
  return index;
}));

// Literal circumference removal: discard both endpoint runes of every
// canonical word. A one- or two-rune word has no interior.
const interiors = runeWords.map((word) => word.length > 2 ? word.slice(1, -1) : []);

const keyText = "DIUINITY"; // GP orthography: V is represented by U.
const key = [...keyText].map((letter) => corpus.translit.indexOf(letter));
assert(key.every((index) => index >= 0), "DIVINITY key must map to GP");
assert.deepEqual(key, [23, 10, 1, 10, 9, 10, 16, 26]);

function runeText(word) {
  return word.map((index) => corpus.translit[index]).join("");
}

function scoreStrings(words) {
  let sum = 0;
  let grams = 0;
  let unknown = 0;
  for (const word of words) {
    for (let i = 0; i + 4 <= word.length; i++) {
      const count = quadgrams.get(word.slice(i, i + 4)) || 0;
      if (!count) unknown++;
      sum += Math.log(count + 0.01);
      grams++;
    }
  }
  return {
    meanLogCount: grams ? sum / grams : null,
    grams,
    unknown,
    coverage: grams ? (grams - unknown) / grams : null
  };
}

function scoreIndices(words) {
  return scoreStrings(words.map(runeText));
}

function applyVigenere(words, options) {
  let globalStep = options.phase;
  return words.map((word) => {
    let localStep = options.phase;
    return word.map((symbol) => {
      const step = options.resetPerWord ? localStep++ : globalStep++;
      const shift = key[step % key.length];
      return (symbol + options.sign * shift + 290) % 29;
    });
  });
}

function indexOfCoincidence(words) {
  const counts = Array(29).fill(0);
  let n = 0;
  for (const word of words) for (const symbol of word) {
    counts[symbol]++;
    n++;
  }
  return {
    n,
    ioc: n > 1
      ? counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1))
      : null
  };
}

function doubletRate(words) {
  let pairs = 0;
  let doublets = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      pairs++;
      if (word[i] === word[i - 1]) doublets++;
    }
  }
  return {pairs, doublets, rate: pairs ? doublets / pairs : null};
}

const configs = [];
for (const resetPerWord of [false, true]) {
  for (const sign of [-1, 1]) {
    for (let phase = 0; phase < key.length; phase++) {
      const decoded = applyVigenere(interiors, {resetPerWord, sign, phase});
      configs.push({
        resetPerWord, sign, phase,
        ...scoreIndices(decoded)
      });
    }
  }
}
configs.sort((a, b) => b.meanLogCount - a.meanLogCount);

const p56Control = [
  "AN", "END", "WITHIN", "THE", "DEEP", "WEB", "THERE", "EXISTS",
  "A", "PAGE", "THAT", "HASHES", "TO", "IT", "IT", "IS", "THE",
  "DUTY", "OF", "EUERY", "PILGRIM", "TO", "SEEC", "OUT", "THIS", "PAGE"
];
const p57Control = [
  "PARABLE", "LIKE", "THE", "INSTAR", "TUNNELING", "TO", "THE",
  "SURFACE", "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES",
  "FIND", "THE", "DIVINITY", "WITHIN", "AND", "EMERGE"
];

const result = {
  interpretation: "remove the first and last rune of every original word; optionally decrypt each interior with repeating GP-DIUINITY",
  source: {
    runeCount: parsed.runeCount,
    wordCount: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    interiorRuneCount: interiors.reduce((sum, word) => sum + word.length, 0),
    key: keyText,
    configurations: configs.length
  },
  structural: {
    originalIoC: indexOfCoincidence(runeWords),
    interiorIoC: indexOfCoincidence(interiors),
    originalDoublets: doubletRate(runeWords),
    interiorDoublets: doubletRate(interiors)
  },
  language: {
    original: scoreIndices(runeWords),
    interiorWithoutKey: scoreIndices(interiors),
    bestDIVINITY: configs[0],
    p56CleartextControl: scoreStrings(p56Control),
    p57CleartextControl: scoreStrings(p57Control)
  },
  allConfigurations: configs
};

console.log(JSON.stringify(result, null, 2));
