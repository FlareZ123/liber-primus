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

/** @param {number[]} shell @returns {number[]} */
function H4inv(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
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

// Canonical unknown-word parser. Printed line wraps and physical page breaks
// may continue a word; only true punctuation/delimiters terminate one. Retain
// only words wholly contained on one physical unknown page.
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
      // Line/page wrap can continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const canonicalWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
assert.equal(canonicalWords.length, 2864);
const wordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);

/** @param {number} page @returns {{index:number,start:number,end:number,values:number[]}[]} */
function pageWords(page) {
  return wordsByPage.get(page) || [];
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

// Charge the literal double-index reading of "their numbers are the direction":
// signed word i -> physical page i -> printed word i, all zero-based.
const doubleIndexRows = [];
for (let index = 0; index < signedWords.length; index += 1) {
  const words = pageWords(index);
  if (index >= words.length) continue;
  const target = gp(signedWords[index]);
  const receiver = words[index];
  doubleIndexRows.push({
    index,
    sourceWord: signedWords[index],
    sourceLength: target.length,
    cipherLength: receiver.values.length,
    start: receiver.start,
    cipher: receiver.values,
    gp0: receiver.values.reduce((total, value) => total + value, 0),
  });
}
assert.equal(doubleIndexRows.length, 42);

const plusOnePointers = doubleIndexRows.filter(
  (row) => row.gp0 === row.index + 1
);
assert.deepEqual(
  plusOnePointers.map((row) => [row.index, row.sourceWord, row.gp0]),
  [[37, "LUCK", 38]]
);

// The sole raw +1 pointer lands on the next authenticated word/page, whose
// receiver was independently selected before this double-index observation.
const bewareValues = gp("BEWARE");
const p38BewareReceivers = pageWords(38).filter(
  (word) =>
    word.values.length === bewareValues.length &&
    word.values.reduce((total, value) => total + value, 0) ===
      bewareValues.reduce((total, value) => total + value, 0)
);
assert.deepEqual(
  p38BewareReceivers.map((word) => [word.index, word.start, word.values]),
  [[11, 57, [8, 25, 14, 2, 17, 22]]]
);

const tape = grid.pages.flatMap((page) => page.tokens);
const base60Alphabet = grid.alphabet;
assert.equal(tape[88], "3V");
assert.equal(base60Alphabet.indexOf(tape[88][1]), 31);
assert.equal(
  31,
  gp("LUCK").reduce((total, value) => total + value, 0)
);

const lengthMatches = doubleIndexRows.filter(
  (row) => row.sourceLength === row.cipherLength
);
assert.deepEqual(
  lengthMatches.map((row) => [row.index, row.sourceWord, row.sourceLength, row.start]),
  [
    [3, "LIES", 4, 16],
    [11, "IS", 2, 49],
    [14, "ITS", 3, 59],
    [15, "WORDS", 5, 71],
    [21, "IS", 2, 121],
    [31, "AND", 3, 126],
    [37, "LUCK", 4, 146],
  ]
);
assert.deepEqual(
  lengthMatches
    .filter((row) => row.gp0 === row.index + 1)
    .map((row) => [row.index, row.sourceWord, row.gp0]),
  [[37, "LUCK", 38]]
);

const p37Word37 = pageWords(37)[37];
assert.deepEqual(p37Word37, {
  index: 37,
  start: 146,
  end: 149,
  values: [3, 2, 6, 27],
});
const rawShell = H4(p37Word37.values);
assert.deepEqual(rawShell, [
  state.g,
  mod29(state.p + state.K),
  state.A,
  mod29(state.a - state.g),
]);
assert.deepEqual(rawShell, [5, 25, 8, 1]);

// The untouched raw shell is unique across every canonical complete unknown
// four-rune word.
const fourRuneWords = canonicalWords.filter((word) => word.values.length === 4);
const rawShellHits = fourRuneWords
  .filter((word) =>
    H4(word.values).every((value, slot) => value === rawShell[slot])
  )
  .map((word) => ({
    page: word.page,
    wordIndex: word.index,
    start: word.start,
    cipher: word.values,
  }));
assert.equal(fourRuneWords.length, 509);
assert.deepEqual(rawShellHits, [{
  page: 37,
  wordIndex: 37,
  start: 146,
  cipher: [3, 2, 6, 27],
}]);

const luck = gp("LUCK");
assert.deepEqual(luck, [20, 1, 5, 5]);
const exactKey = p37Word37.values.map((value, index) =>
  mod29(value - luck[index])
);
assert.deepEqual(exactKey, [12, 1, 1, 22]);
const exactKeyShell = H4(exactKey);
assert.deepEqual(exactKeyShell, [state.B, 0, state.K, state.g]);
assert.deepEqual(exactKeyShell, [19, 0, 2, 5]);
assert.deepEqual(
  p37Word37.values.map((value, index) => mod29(value - exactKey[index])),
  luck
);

// Distinct authenticated four-rune source targets.
const fourRuneTargets = [];
for (const word of signedWords) {
  const values = gp(word);
  if (
    values.length === 4 &&
    !fourRuneTargets.some((entry) => entry.word === word)
  ) {
    fourRuneTargets.push({word, values});
  }
}
assert.deepEqual(fourRuneTargets.map((entry) => entry.word), [
  "LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);
const targetByValues = new Map(
  fourRuneTargets.map((entry) => [entry.values.join(","), entry.word])
);

// Charge all H-shells whose four coordinates are drawn directly from the
// authenticated DH fields plus zero. This is a complete 10^4 shell family.
const shellFields = [
  ["0", 0],
  ["p", state.p],
  ["g", state.g],
  ["a", state.a],
  ["b", state.b],
  ["A", state.A],
  ["B", state.B],
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
];
const directStateHits = [];
let directStateShells = 0;
for (const [n0, v0] of shellFields) {
  for (const [n1, v1] of shellFields) {
    for (const [n2, v2] of shellFields) {
      for (const [n3, v3] of shellFields) {
        directStateShells += 1;
        const shell = [v0, v1, v2, v3];
        const key = H4inv(shell);
        for (const sign of [-1, 1]) {
          const out = p37Word37.values.map((value, index) =>
            mod29(value + (sign * key[index]))
          );
          const target = targetByValues.get(out.join(","));
          if (target) {
            directStateHits.push({
              labels: [n0, n1, n2, n3],
              shell,
              key,
              sign,
              target,
            });
          }
        }
      }
    }
  }
}
assert.equal(directStateShells, 10000);
assert.deepEqual(directStateHits, [{
  labels: ["B", "0", "K", "g"],
  shell: [19, 0, 2, 5],
  key: [12, 1, 1, 22],
  sign: -1,
  target: "LUCK",
}]);

// Hold the exact key across every complete four-rune unknown word, all nine
// authenticated four-rune targets, and both additive signs.
const fixedKeyHits = [];
for (const word of fourRuneWords) {
  for (const sign of [-1, 1]) {
    const out = word.values.map((value, index) =>
      mod29(value + (sign * exactKey[index]))
    );
    const target = targetByValues.get(out.join(","));
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
  page: 37,
  wordIndex: 37,
  start: 146,
  sign: -1,
  target: "LUCK",
  cipher: [3, 2, 6, 27],
}]);

// Family context: among the seven double-index length matches, direct-state
// H-shell keys also occur for a few very short 2-3 rune cases. P37 is the only
// length >= 4 case with any direct-state-shell target hit.
const directValues = new Set(shellFields.map((entry) => entry[1]));

/** @param {number[]} values @returns {number[]} */
function Hn(values) {
  const diffs = [];
  const sums = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    diffs.push(mod29(values[left] - values[right]));
    sums.unshift(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) diffs.push(values[Math.floor(values.length / 2)]);
  return diffs.concat(sums);
}

const targetsByLength = new Map();
for (const word of signedWords) {
  const values = gp(word);
  if (!targetsByLength.has(values.length)) targetsByLength.set(values.length, []);
  const bucket = targetsByLength.get(values.length);
  if (!bucket.some((entry) => entry.word === word)) bucket.push({word, values});
}

const doubleIndexDirectHits = [];
for (const row of lengthMatches) {
  const receiver = pageWords(row.index)[row.index];
  for (const target of targetsByLength.get(row.sourceLength)) {
    for (const sign of [-1, 1]) {
      const key = receiver.values.map((value, index) =>
        mod29(sign === -1 ? value - target.values[index] : target.values[index] - value)
      );
      const shell = Hn(key);
      if (shell.every((value) => directValues.has(value))) {
        doubleIndexDirectHits.push({
          index: row.index,
          sourceWord: row.sourceWord,
          target: target.word,
          length: row.sourceLength,
          sign,
          shell,
        });
      }
    }
  }
}
assert.deepEqual(
  doubleIndexDirectHits.filter((row) => row.length >= 4),
  [{
    index: 37,
    sourceWord: "LUCK",
    target: "LUCK",
    length: 4,
    sign: -1,
    shell: [19, 0, 2, 5],
  }]
);

console.log(JSON.stringify({
  status: "PASS",
  selector: {
    doubleIndexRows: doubleIndexRows.length,
    lengthMatches: lengthMatches.map((row) => ({
      index: row.index,
      word: row.sourceWord,
      length: row.sourceLength,
      start: row.start,
    })),
    plusOnePointers: plusOnePointers.map((row) => ({
      index: row.index,
      word: row.sourceWord,
      gp0: row.gp0,
    })),
    independentDestination: {
      pointer: 38,
      target: "BEWARE",
      receiver: {
        wordIndex: p38BewareReceivers[0].index,
        start: p38BewareReceivers[0].start,
        cipher: p38BewareReceivers[0].values,
      },
      p50LowAtBewareGp0: 31,
    },
    plusOneLengthMatches: lengthMatches
      .filter((row) => row.gp0 === row.index + 1)
      .map((row) => ({index: row.index, word: row.sourceWord, gp0: row.gp0})),
  },
  p37: {
    sourceWord: signedWords[37],
    receiver: {
      page: 37,
      wordIndex: 37,
      start: p37Word37.start,
      cipher: p37Word37.values,
    },
    rawShell,
    rawShellManuscriptHits: rawShellHits.length,
    exactKey,
    exactKeyShell,
    plaintext: luck,
  },
  controls: {
    fourRuneWords: fourRuneWords.length,
    fourRuneTargets: fourRuneTargets.map((entry) => entry.word),
    directStateShells,
    directStateFamilyConfigurations:
      directStateShells * fourRuneTargets.length * 2,
    directStateHits,
    fixedKeyConfigurations:
      fourRuneWords.length * fourRuneTargets.length * 2,
    fixedKeyHits,
    longDoubleIndexDirectHits:
      doubleIndexDirectHits.filter((row) => row.length >= 4),
  },
  interpretation:
    "Signed index37 selects physical p37 and printed word37 under the already active zero-based source-number convention. Under the canonical cross-page word parser its raw GP0 is 38, making p37 the sole GP0=i+1 case among all 42 double-index receivers and pointing directly to authenticated word/page38 BEWARE. It is also the sole such case among the seven target-length matches. The untouched four-rune receiver has the manuscript-unique H shell [g,p+K,A,a-g]. Across every direct authenticated-state H4 key shell plus zero, every authenticated four-rune target and both signs, [B,0,K,g] with subtraction is the sole hit and yields LUCK. Preserve as a strong local plaintext candidate; the second use of the source index remains the main route caveat.",
}, null, 2));
