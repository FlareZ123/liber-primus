"use strict";

/**
 * SFT for the p33 signed-index WILL local inverse.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,
 *   values:number[]
 * }>}
 */
function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedTokens = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
const signed = signedTokens.map((word, index) => ({
  index,
  label: word.toUpperCase(),
  values: gp(word),
}));

assert.equal(signed.length, 43);
assert.equal(signed[33].label, "WILL");
assert.deepEqual(signed[33].values, [7, 10, 20, 20]);
assert.equal(sum(signed[33].values), 57);

// Independent upstream page selector: B=19, p50[19]=0X=33.
assert.equal(grid.bytes[19], 33);

const words = parseWords();
const p33WillState = words.filter((word) =>
  word.startPage === 33 &&
  word.endPage === 33 &&
  word.values.length === signed[33].values.length &&
  sum(word.values) === sum(signed[33].values)
);
assert.equal(p33WillState.length, 1);
assert.deepEqual(
  [p33WillState[0].startOffset, p33WillState[0].endOffset],
  [132, 135]
);
assert.deepEqual(p33WillState[0].values, [3, 15, 17, 22]);

const cipher = p33WillState[0].values;
const target = signed[33].values;
const requiredKey = cipher.map((value, index) =>
  mod29(value - target[index])
);
assert.deepEqual(requiredKey, [25, 5, 26, 2]);
assert.deepEqual(h(requiredKey), [23, 8, 2, 27]);
assert.deepEqual(
  target.map((value, index) => mod29(value + requiredKey[index])),
  cipher
);

// Reconstruct the pre-existing p33 red-title geometry directly.
const p33Ink = ink.pages.find((entry) => entry.page === 33);
assert.ok(p33Ink);
assert.deepEqual(
  p33Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 10], [91, 8]]
);

const p33Words = words.filter((word) =>
  word.startPage === 33 && word.endPage === 33
);
const wordsInside = (start, length) =>
  p33Words.filter((word) =>
    word.startOffset >= start && word.endOffset < start + length
  );

const firstTitleWords = wordsInside(0, 10);
const secondTitleWords = wordsInside(91, 8);
assert.deepEqual(
  firstTitleWords.map((word) => word.values.length),
  [2, 8]
);
assert.deepEqual(
  secondTitleWords.map((word) => word.values.length),
  [3, 5]
);

// These were already interpreted in the p33 layout report as
// [K,A] and [e,g].
const state = Object.freeze({
  p: 23,
  g: 5,
  e: 3,
  K: 2,
  A: 8,
  negK: 27,
  ApK: 10,
});
assert.deepEqual(h([state.K, state.A, 0, 0]).slice(0, 2), [2, 8]);
// The candidate key shell itself uses only fixed p33 state values.
assert.deepEqual(h(requiredKey), [state.p, state.A, state.K, state.negK]);

// Charge a broad retrospective H-shell family from the scalar values already
// exposed by the p33 title/layout analysis.
const layoutScalars = [
  state.K,
  state.A,
  state.p,
  state.ApK,
  state.e,
  state.g,
  state.negK,
];
assert.equal(new Set(layoutScalars).size, 7);

const shellFamily = [];
for (const a of layoutScalars) {
  for (const b of layoutScalars) {
    for (const c of layoutScalars) {
      for (const d of layoutScalars) {
        shellFamily.push([a, b, c, d]);
      }
    }
  }
}
assert.equal(shellFamily.length, 2401);

const p33FourRuneWords = p33Words.filter((word) => word.values.length === 4);
assert.equal(p33FourRuneWords.length, 7);

const distinctTargets = [
  ...new Map(
    signed
      .filter((word) => word.values.length === 4)
      .map((word) => [word.label, word])
  ).values(),
];
assert.deepEqual(
  distinctTargets.map((word) => word.label),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);

const localFamilyHits = [];
for (const word of p33FourRuneWords) {
  for (const candidate of distinctTargets) {
    for (const direction of ["sub", "add"]) {
      const key = word.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - candidate.values[index])
          : mod29(candidate.values[index] - value)
      );
      const shell = h(key);
      if (shellFamily.some((entry) =>
        entry.every((value, index) => value === shell[index])
      )) {
        localFamilyHits.push({
          start: word.startOffset,
          target: candidate.label,
          direction,
          key,
          shell,
        });
      }
    }
  }
}

assert.deepEqual(localFamilyHits, [
  {
    start: 119,
    target: "WILL",
    direction: "sub",
    key: [27, 1, 7, 4],
    shell: [23, 23, 8, 2],
  },
  {
    start: 132,
    target: "WILL",
    direction: "sub",
    key: [25, 5, 26, 2],
    shell: [23, 8, 2, 27],
  },
]);

// The source-assigned WILL state selects start132 uniquely before this shell
// family is consulted.
assert.equal(
  localFamilyHits.filter((hit) => hit.start === p33WillState[0].startOffset).length,
  1
);

// Hold the exact key fixed across every unknown four-rune word.
const unknownFourRuneWords = words.filter((word) =>
  word.startPage < 56 &&
  word.endPage < 56 &&
  word.values.length === 4
);
assert.equal(unknownFourRuneWords.length, 513);

const exactKeyHits = [];
for (const word of unknownFourRuneWords) {
  for (const candidate of distinctTargets) {
    for (const direction of ["sub", "add"]) {
      const output = word.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - requiredKey[index])
          : mod29(value + requiredKey[index])
      );
      if (output.every((value, index) => value === candidate.values[index])) {
        exactKeyHits.push({
          page: word.startPage,
          start: word.startOffset,
          target: candidate.label,
          direction,
        });
      }
    }
  }
}
assert.deepEqual(exactKeyHits, [{
  page: 33,
  start: 132,
  target: "WILL",
  direction: "sub",
}]);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: {
    signedIndex: 33,
    sourceWord: "WILL",
    sourceState: { length: 4, gp0: 57 },
    upstreamPageSelector: "B=19 -> p50[19]=33",
    receiver: [132, 135],
    cipher,
  },
  inverse: {
    target,
    key: requiredKey,
    hShell: h(requiredKey),
    shellLabels: "[p,A,K,-K]",
  },
  p33LayoutControl: {
    redSpans: p33Ink.red_spans.map((span) => [span.start, span.length]),
    firstTitleWordLengths: firstTitleWords.map((word) => word.values.length),
    secondTitleWordLengths: secondTitleWords.map((word) => word.values.length),
    chargedLayoutScalars: layoutScalars,
    shellFamilySize: shellFamily.length,
    localFamilyHits,
  },
  manuscriptExactKeyControl: {
    unknownFourRuneWords: unknownFourRuneWords.length,
    hits: exactKeyHits,
  },
  classification:
    "Strong local WILL plaintext candidate. Page33 is selected upstream, signed index33 supplies WILL and its state, and p33 has one matching receiver at132..135. The exact H-shell serialization [p,A,K,-K] was recognized afterward and remains retrospective.",
}, null, 2));
