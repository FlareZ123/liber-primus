"use strict";

/**
 * SFT for the p40 signed-index PATHS source-state candidate and local inverse.
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
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const inkAnnotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

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

/** @param {number[]} shell @returns {number[]} */
function hInverse(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
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
assert.equal(signed[40].label, "PATHS");
assert.deepEqual(signed[40].values, [13, 24, 2, 15]);

const road = gp("ROAD");
assert.deepEqual(road, [4, 3, 24, 23]);
assert.equal(road.length, signed[40].values.length);
assert.equal(sum(road), 54);
assert.equal(sum(signed[40].values), 54);

const words = parseWords();
const p40StateMatches = words.filter((word) =>
  word.startPage === 40 &&
  word.endPage === 40 &&
  word.values.length === signed[40].values.length &&
  sum(word.values) === sum(signed[40].values)
);
assert.equal(p40StateMatches.length, 1);
assert.deepEqual(
  [p40StateMatches[0].startOffset, p40StateMatches[0].endOffset],
  [71, 74]
);
assert.deepEqual(p40StateMatches[0].values, [4, 15, 14, 21]);

// Fixed upstream state.
const primaryDh = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const statePool = Object.freeze({
  ...primaryDh,
  e: 3,
  q: 4,
  zero: 0,
  one: 1,
});
const lineAtP = Object.freeze({
  HEREp: 26,
  DHp: 20,
});

// Required subtraction key for the independently assigned PATHS target.
const cipher = p40StateMatches[0].values;
const target = signed[40].values;
const requiredKey = cipher.map((value, index) =>
  mod29(value - target[index])
);
assert.deepEqual(requiredKey, [20, 20, 12, 6]);
assert.deepEqual(h(requiredKey), [14, 8, 3, 26]);

const exactShell = [
  mod29(-primaryDh.b),
  primaryDh.A,
  statePool.e,
  lineAtP.HEREp,
];
assert.deepEqual(exactShell, [14, 8, 3, 26]);
assert.deepEqual(hInverse(exactShell), requiredKey);

// Source-visible magnitude control for the selected three-word phrase.
const bLengthWindows = [];
for (let start = 0; start + statePool.e <= signed.length; start += 1) {
  const phrase = signed.slice(start, start + statePool.e);
  if (phrase.reduce((total, word) => total + word.values.length, 0) === primaryDh.b) {
    const end = start + statePool.e - 1;
    const annotation = inkAnnotations.pages.find((entry) => entry.page === end);
    bLengthWindows.push({
      start,
      end,
      labels: phrase.map((word) => word.label),
      redSpanLengths: annotation
        ? annotation.red_spans.map((span) => span.length)
        : [],
    });
  }
}

assert.deepEqual(
  bLengthWindows.map((window) => [window.start, window.end]),
  [[5, 7], [29, 31], [37, 39], [38, 40], [39, 41]]
);
assert.deepEqual(
  bLengthWindows.map((window) => window.redSpanLengths),
  [[14], [], [3], [8], []]
);
const sourceShellWindow = bLengthWindows.filter((window) =>
  window.redSpanLengths.includes(primaryDh.A)
);
assert.deepEqual(sourceShellWindow, [{
  start: 38,
  end: 40,
  labels: ["BEWARE", "FALSE", "PATHS"],
  redSpanLengths: [8],
}]);

// Retrospective family charge: [-v, x, y, LINE[p]].
const shellFamily = [];
for (const [vName, v] of Object.entries(primaryDh)) {
  for (const [xName, x] of Object.entries(statePool)) {
    for (const [yName, y] of Object.entries(statePool)) {
      for (const [lineName, line] of Object.entries(lineAtP)) {
        shellFamily.push({
          name: "[-" + vName + "," + xName + "," + yName + "," + lineName + "]",
          shell: [mod29(-v), x, y, line],
        });
      }
    }
  }
}
assert.equal(shellFamily.length, 1694);

const p40FourRuneWords = words.filter((word) =>
  word.startPage === 40 &&
  word.endPage === 40 &&
  word.values.length === 4
);
assert.equal(p40FourRuneWords.length, 15);

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
for (const word of p40FourRuneWords) {
  for (const candidate of distinctTargets) {
    for (const direction of ["sub", "add"]) {
      const key = word.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - candidate.values[index])
          : mod29(candidate.values[index] - value)
      );
      const shell = h(key);
      const fits = shellFamily.filter((entry) =>
        entry.shell.every((value, index) => value === shell[index])
      );
      if (fits.length > 0) {
        localFamilyHits.push({
          start: word.startOffset,
          target: candidate.label,
          direction,
          key,
          shell,
          fits: fits.map((entry) => entry.name),
        });
      }
    }
  }
}

assert.deepEqual(localFamilyHits, [{
  start: 71,
  target: "PATHS",
  direction: "sub",
  key: [20, 20, 12, 6],
  shell: [14, 8, 3, 26],
  fits: ["[-b,A,e,HEREp]"],
}]);

// Manuscript-wide exact-key charge.
const fourRuneUnknownWords = words.filter((word) =>
  word.startPage < 56 &&
  word.endPage < 56 &&
  word.values.length === 4
);
assert.equal(fourRuneUnknownWords.length, 513);

const exactKeyHits = [];
for (const word of fourRuneUnknownWords) {
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
  page: 40,
  start: 71,
  target: "PATHS",
  direction: "sub",
}]);

assert.deepEqual(
  target.map((value, index) => mod29(value + requiredKey[index])),
  cipher
);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: {
    sourceWordIndex: 40,
    sourceWord: "PATHS",
    targetState: { length: 4, gp0: 54 },
    page: 40,
    uniqueReceiver: [71, 74],
    roadPathsStateCollision: true,
  },
  inverse: {
    cipher,
    target,
    key: requiredKey,
    keyShell: h(requiredKey),
    shellLabels: "[-b,A,e,HERE[p]]",
  },
  sourceMagnitudeControl: {
    bLengthThreeWordWindows: bLengthWindows,
    uniqueAEndpoint: sourceShellWindow[0],
    shellMagnitudes: [primaryDh.b, primaryDh.A, statePool.e, lineAtP.HEREp],
    caveat: "The negative sign on b and serialization were recognized after the PATHS inverse.",
  },
  retrospectiveFamily: {
    configurations: shellFamily.length,
    p40FourRuneWords: p40FourRuneWords.length,
    authenticatedTargets: distinctTargets.length,
    directions: 2,
    hits: localFamilyHits,
  },
  manuscriptExactKeyControl: {
    fourRuneUnknownWords: fourRuneUnknownWords.length,
    hits: exactKeyHits,
  },
  classification:
    "Strong local PATHS plaintext candidate. Target/page/receiver come from signed index40 plus unique p40 length4/GP0=54 state; the compact H-shell family was recognized afterward and is charged retrospectively.",
}, null, 2));
