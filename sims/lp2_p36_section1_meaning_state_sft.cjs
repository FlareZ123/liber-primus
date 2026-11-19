"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

const state = {
  K: signedWords.indexOf("PATH"),
  e: signedWords.indexOf("LIES"),
  q: signedWords.indexOf("EMPTY"),
  g: signedWords.indexOf("EPIPHANY"),
  a: signedWords.indexOf("SEEKS"),
  A: signedWords.indexOf("DEVOTED"),
  b: signedWords.indexOf("WORDS"),
  B: signedWords.indexOf("THEIR"),
  p: signedWords.indexOf("ROAD"),
};
assert.deepEqual(state, {
  K: 2, e: 3, q: 4, g: 5, a: 6, A: 8, b: 15, B: 19, p: 23,
});

// Canonical cross-page word parser.
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      index: page.words.length,
      start: startOffset,
      end: startOffset + currentWord.length - 1,
      values: currentWord.slice(),
    });
  }
  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed line/page wrap can continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const completeWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
assert.equal(completeWords.length, 2864);
const fourRuneWords = completeWords.filter((word) => word.values.length === 4);
assert.equal(fourRuneWords.length, 509);

// Visible authored numbered sections 1-5 span physical p36-p38.
const numberedText = [parts[36], parts[37], parts[38]].join("\n");
const markers = [...numberedText.matchAll(/([1-5])-/g)];
assert.deepEqual(markers.map((match) => Number(match[1])), [1, 2, 3, 4, 5]);

const sectionStarts = [];
for (let markerIndex = 0; markerIndex < markers.length; markerIndex += 1) {
  const marker = markers[markerIndex];
  const section = Number(marker[1]);
  const begin = marker.index + marker[0].length;
  const end =
    markerIndex + 1 < markers.length
      ? markers[markerIndex + 1].index
      : numberedText.length;
  const chunk = numberedText.slice(begin, end);
  const values = [];

  for (const char of [...chunk]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      values.push(value);
    } else if ((char === "-" || char === ".") && values.length) {
      break;
    }
  }
  sectionStarts.push({
    section,
    values,
    length: values.length,
    gp0: values.reduce((total, value) => total + value, 0),
  });
}

assert.deepEqual(
  sectionStarts.map((row) => [row.section, row.values, row.gp0]),
  [
    [1, [20, 2, 12, 22], 56],
    [2, [9, 26, 18, 14], 67],
    [3, [23, 1, 13], 37],
    [4, [21, 11, 15, 11, 19, 4, 19], 100],
    [5, [8, 25, 14, 2, 17, 22], 88],
  ]
);

// Section1 first word is canonical p36 word19, offsets99..102.
const p36Section1 = fourRuneWords.find(
  (word) =>
    word.page === 36 &&
    word.start === 99 &&
    word.values.join(",") === "20,2,12,22"
);
assert.ok(p36Section1);
assert.equal(p36Section1.index, 19);

const rawShell = H4(p36Section1.values);
assert.deepEqual(rawShell, [
  mod29(-state.K),
  state.B,
  mod29(-state.b),
  mod29(state.b - state.K),
]);
assert.deepEqual(rawShell, [27, 19, 14, 13]);

// The exact raw four-rune ciphertext occurs once manuscript-wide.
assert.deepEqual(
  fourRuneWords
    .filter((word) =>
      word.values.every((value, index) => value === p36Section1.values[index])
    )
    .map((word) => [word.page, word.index, word.start]),
  [[36, 19, 99]]
);

// Distinct authenticated source targets grouped by GP length.
const targetsByLength = new Map();
for (const word of signedWords) {
  const values = gp(word);
  if (!targetsByLength.has(values.length)) targetsByLength.set(values.length, []);
  const bucket = targetsByLength.get(values.length);
  if (!bucket.some((entry) => entry.word === word)) {
    bucket.push({word, values});
  }
}
assert.equal(targetsByLength.get(4).length, 9);

// Source-derived palindrome family:
// key(section s, state field x) = [s, x, ..., x, s].
// Charge every numbered-section start, every authenticated state field,
// every matching-length authenticated target, and both additive signs.
const stateEntries = Object.entries(state);
const palindromeHits = [];
let palindromeConfigurations = 0;
for (const start of sectionStarts) {
  const targets = targetsByLength.get(start.length) || [];
  for (const [field, value] of stateEntries) {
    const key = [
      start.section,
      ...Array(Math.max(0, start.length - 2)).fill(value),
      start.section,
    ];
    for (const sign of [-1, 1]) {
      const output = start.values.map((cipher, index) =>
        mod29(cipher + (sign * key[index]))
      );
      for (const target of targets) {
        palindromeConfigurations += 1;
        if (output.every((item, index) => item === target.values[index])) {
          palindromeHits.push({
            section: start.section,
            field,
            stateValue: value,
            sign,
            key,
            target: target.word,
            output,
          });
        }
      }
    }
  }
}
assert.equal(palindromeConfigurations, 558);
assert.deepEqual(palindromeHits, [{
  section: 1,
  field: "e",
  stateValue: 3,
  sign: -1,
  key: [1, 3, 3, 1],
  target: "MEANING",
  output: [19, 28, 9, 21],
}]);

const key = palindromeHits[0].key;
const meaning = gp("MEANING");
assert.deepEqual(meaning, [19, 28, 9, 21]);
assert.deepEqual(
  p36Section1.values.map((value, index) => mod29(value - key[index])),
  meaning
);

const keyShell = H4(key);
assert.deepEqual(keyShell, [0, 0, state.a, state.K]);
assert.deepEqual(keyShell, [0, 0, 6, 2]);

const meaningShell = H4(meaning);
assert.deepEqual(meaningShell, [
  mod29(-state.K),
  state.B,
  state.A,
  mod29(state.b - state.q),
]);
assert.deepEqual(meaningShell, [27, 19, 8, 11]);

// The same prospective rule on the other four-rune section start does not
// produce any authenticated four-rune source target.
const section2 = sectionStarts[1];
const section2Key = [2, state.e, state.e, 2];
const section2Output = section2.values.map((value, index) =>
  mod29(value - section2Key[index])
);
assert.deepEqual(section2Output, [7, 23, 15, 12]);
assert.ok(
  !(targetsByLength.get(4) || []).some((target) =>
    target.values.every((value, index) => value === section2Output[index])
  )
);

// Hold the exact section1/e key across every canonical complete four-rune
// unknown word, all nine authenticated four-rune targets, and both signs.
const targetByValues = new Map(
  targetsByLength.get(4).map((entry) => [entry.values.join(","), entry.word])
);
const fixedKeyHits = [];
for (const word of fourRuneWords) {
  for (const sign of [-1, 1]) {
    const output = word.values.map((value, index) =>
      mod29(value + (sign * key[index]))
    );
    const target = targetByValues.get(output.join(","));
    if (target) {
      fixedKeyHits.push({
        page: word.page,
        wordIndex: word.index,
        start: word.start,
        sign,
        target,
        cipher: word.values,
      });
    }
  }
}
assert.deepEqual(fixedKeyHits, [{
  page: 36,
  wordIndex: 19,
  start: 99,
  sign: -1,
  target: "MEANING",
  cipher: [20, 2, 12, 22],
}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "strong local MEANING plaintext candidate on the authored p36 section-1 start; the source-derived palindrome key family has one hit and the exact key is manuscript-selective",
  state,
  sectionStarts,
  p36Section1: {
    page: 36,
    wordIndex: p36Section1.index,
    start: p36Section1.start,
    cipher: p36Section1.values,
    rawShell,
    key,
    keyLabels: "[section1,e,e,section1]",
    keyShell,
    keyShellLabels: "[0,0,a,K]",
    plaintext: meaning,
    plaintextWord: "MEANING",
    plaintextShell: meaningShell,
    plaintextShellLabels: "[-K,B,A,b-q]",
  },
  controls: {
    palindromeConfigurations,
    palindromeHits,
    completeFourRuneWords: fourRuneWords.length,
    fixedKeyConfigurations:
      fourRuneWords.length * targetsByLength.get(4).length * 2,
    fixedKeyHits,
    section2SameRuleOutput: section2Output,
  },
}, null, 2));
