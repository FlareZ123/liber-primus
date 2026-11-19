"use strict";

/**
 * SFT: solved FIND THEIR WAY HERE -> p50 high digits -> FOUR.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const table = grid.pages.flatMap((page) => page.tokens);
const solvedRuneIndex = new Map(solved.runes.map((rune, index) => [rune, index]));

/** @param {string} text @returns {number[][]} */
function solvedWords(text) {
  const out = [];
  let current = [];
  for (const char of [...text]) {
    if (solvedRuneIndex.has(char)) {
      current.push(solvedRuneIndex.get(char));
    } else if (current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

/** @param {number[]} vector */
const gp0v = (vector) => vector.reduce((sum, value) => sum + value, 0);

/** @param {number[]} vector */
const textOf = (vector) =>
  vector.map((value) => corpus.translit[value]).join("").toUpperCase();

const primes = [];
for (let n = 2; primes.length < 29; n += 1) {
  let prime = true;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) {
      prime = false;
      break;
    }
  }
  if (prime) primes.push(n);
}

/** @param {number[]} vector */
const gpPrimeV = (vector) =>
  vector.reduce((sum, value) => sum + primes[value], 0);

const welcome = solved.sections.find((section) => section.name === "0_welcome");
assert.ok(welcome);
const welcomeWords = solvedWords(welcome.source_text);
const phrase = ["FIND", "THEIR", "WAY", "HERE"];
const phraseHits = [];

for (let index = 0; index + 3 < welcomeWords.length; index += 1) {
  const source = welcomeWords.slice(index, index + 4).map(textOf);
  if (source.join(" ") === phrase.join(" ")) phraseHits.push(index);
}
assert.deepEqual(phraseHits, [23]);

const phraseVectors = welcomeWords.slice(23, 27);
const addresses = phraseVectors.map(gp0v);
const tokens = addresses.map((address) => table[address]);
const highDigits = tokens.map((token) => Number(token[0]));
assert.deepEqual(addresses, [42, 34, 57, 48]);
assert.deepEqual(tokens, ["0S", "3H", "1w", "4D"]);
assert.deepEqual(highDigits, [0, 3, 1, 4]);
assert.equal(textOf(highDigits), "FOUR");

/*
 * Full solved-corpus four-word-window census under the same all-high rule.
 */
const fourWindowHits = [];
let fourWordWindows = 0;
for (const section of solved.sections) {
  const words = solvedWords(section.source_text);
  for (let index = 0; index + 3 < words.length; index += 1) {
    fourWordWindows += 1;
    const window = words.slice(index, index + 4);
    const windowAddresses = window.map(gp0v);
    if (windowAddresses.some((address) => address >= table.length)) continue;
    const output = windowAddresses.map((address) => Number(table[address][0]));
    if (textOf(output) === "FOUR") {
      fourWindowHits.push({
        section: section.name,
        index,
        source: window.map(textOf),
        addresses: windowAddresses,
        tokens: windowAddresses.map((address) => table[address]),
        output,
      });
    }
  }
}
assert.equal(fourWordWindows, 713);
assert.deepEqual(fourWindowHits, [{
  section: "0_welcome",
  index: 23,
  source: phrase,
  addresses,
  tokens,
  output: highDigits,
}]);

/*
 * Charge component choice and read direction for the already fixed source
 * phrase. Each token contributes either its high or low base60 digit; discard
 * a configuration if a selected digit is outside the GP29 index range.
 * Compare to the complete solved four-GP-rune word lexicon.
 */
const solvedFourRuneLexicon = new Set();
const distinctSolvedWords = new Map();
for (const section of solved.sections) {
  for (const word of solvedWords(section.source_text)) {
    distinctSolvedWords.set(word.join(","), word);
    if (word.length === 4) solvedFourRuneLexicon.add(word.join(","));
  }
}

const allHighLexicalHits = [];
for (const section of solved.sections) {
  const words = solvedWords(section.source_text);
  for (let index = 0; index + 3 < words.length; index += 1) {
    const window = words.slice(index, index + 4);
    const windowAddresses = window.map(gp0v);
    const output = windowAddresses.map((address) => Number(table[address][0]));
    if (solvedFourRuneLexicon.has(output.join(","))) {
      allHighLexicalHits.push({
        section: section.name,
        index,
        source: window.map(textOf),
        output,
        text: textOf(output),
      });
    }
  }
}
assert.deepEqual(allHighLexicalHits, [{
  section: "0_welcome",
  index: 23,
  source: phrase,
  output: [0, 3, 1, 4],
  text: "FOUR",
}]);

const componentRows = tokens.map((token, index) => ({
  word: phrase[index],
  token,
  high: grid.alphabet.indexOf(token[0]),
  low: grid.alphabet.indexOf(token[1]),
}));

let validConfigurations = 0;
const lexicalHits = [];
for (let mask = 0; mask < 16; mask += 1) {
  const selected = componentRows.map((row, index) =>
    ((mask >> index) & 1) === 1 ? row.low : row.high
  );
  if (selected.some((value) => value < 0 || value >= 29)) continue;

  for (const reverse of [false, true]) {
    validConfigurations += 1;
    const output = reverse ? [...selected].reverse() : selected;
    if (solvedFourRuneLexicon.has(output.join(","))) {
      lexicalHits.push({
        mask,
        components: componentRows.map((row, index) =>
          ((mask >> index) & 1) === 1 ? "low" : "high"
        ),
        reverse,
        output,
        text: textOf(output),
      });
    }
  }
}
assert.equal(validConfigurations, 16);
assert.deepEqual(lexicalHits, [{
  mask: 0,
  components: ["high", "high", "high", "high"],
  reverse: false,
  output: [0, 3, 1, 4],
  text: "FOUR",
}]);

/*
 * FOUR occurs once in the solved corpus and uniquely carries the established
 * p28 DH pair (A,p) under the two already-used GP numberings.
 */
const fourOccurrences = [];
for (const section of solved.sections) {
  const words = solvedWords(section.source_text);
  for (let index = 0; index < words.length; index += 1) {
    if (textOf(words[index]) === "FOUR") {
      fourOccurrences.push({ section: section.name, index });
    }
  }
}
assert.deepEqual(fourOccurrences, [{ section: "0_koan_1", index: 203 }]);

const numericPairHits = [...distinctSolvedWords.values()]
  .filter((word) => gp0v(word) === 8 && gpPrimeV(word) === 23)
  .map((word) => ({ text: textOf(word), vector: word }));
assert.deepEqual(numericPairHits, [{
  text: "FOUR",
  vector: [0, 3, 1, 4],
}]);

const FOUR = [0, 3, 1, 4];
assert.equal(gp0v(FOUR), 8);
assert.equal(gpPrimeV(FOUR), 23);

/*
 * Reopen only the original p28 DH line to verify the numeric consumer.
 * H(p,A) is exactly the first source packet [b,K].
 */
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {string} text @returns {number[]} */
function sourceValues(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(sourceValues)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  return [
    mod(fragment[0] - fragment.at(-1)),
    mod(fragment[0] + fragment.at(-1)),
  ];
}

const parts = transcription.split(/^\s*%\s*$/m);
const p28Lines = parts[28].trim().split("/");
const dhFragments = fragments(p28Lines[5]);
const hStream = dhFragments.flatMap(outerH);
assert.deepEqual(hStream, [15, 2, 14, 4, 12, 12, 23, 12, 8, 19]);
assert.deepEqual(dhFragments[0], [23, 8]);
assert.equal(textOf([gpPrimeV(FOUR), gp0v(FOUR)]), "DH");
assert.equal(textOf([gp0v(FOUR), gpPrimeV(FOUR)]), "HD");

const p = gpPrimeV(FOUR);
const A = gp0v(FOUR);
const H = (x, y) => [mod(x - y), mod(x + y)];
assert.deepEqual([p, A], [23, 8]);
assert.deepEqual(H(p, A), [15, 2]);
assert.deepEqual(H(p, A), hStream.slice(0, 2));

console.log(JSON.stringify({
  status: "PASS",
  sourcePhrase: {
    phrase,
    section: "0_welcome",
    index: 23,
    addresses,
    tokens,
    highDigits,
    output: "FOUR",
  },
  controls: {
    fourWordWindows,
    fourWindowHits,
    allHighLexicalHits,
    validComponentDirectionConfigurations: validConfigurations,
    lexicalHits,
    distinctSolvedWords: distinctSolvedWords.size,
    numericPairHits,
    fourOccurrences,
  },
  p28Consumer: {
    fourLabelByPrimeThenGp0: textOf([p, A]),
    sourceFirstFragment: textOf(dhFragments[0]),
    fourGp0: A,
    fourGpPrime: p,
    pair: ["A", "p"],
    hInput: [p, A],
    hOutput: H(p, A),
    sourceDhPrefix: hStream.slice(0, 2),
  },
  classification:
    "Strong source-derived readout: the solved phrase FIND THEIR WAY HERE maps through GP0-addressed p50 high digits to FOUR, as the only all-high solved four-rune lexical hit across 713 solved four-word windows and uniquely in the fixed component/direction family. FOUR uniquely carries GP0=8=A and GP-prime=23=p among solved words; [GP-prime,GP0]=[23,8] literally transliterates to the source line label DH, and H(p,A) reproduces that line's opening packet [b,K]=[15,2].",
}, null, 2));
