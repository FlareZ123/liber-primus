"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol: symbol.toUpperCase(), value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
};

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word0 @returns {number} */
function gp0(word0) {
  const word = word0
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let total = 0;
  for (let offset = 0; offset < word.length;) {
    if (word.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (word.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      word.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP word: " + word.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/**
 * @param {string} source
 * @returns {{start:number,values:number[]}[]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };
  for (const character of source) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (character === "-" || character === "." || character === "&") {
      flush();
    } else if (character === "/" || /\s/u.test(character)) {
      // line wrapping preserves a word
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} address @returns {{token:string,low60:number,base59:number,base60:number}} */
function tableOutputs(address) {
  const token = tape[address];
  const high60 = alpha60.indexOf(token[0]);
  const low60 = alpha60.indexOf(token[1]);
  const high59 = alpha59.indexOf(token[0]);
  const low59 = alpha59.indexOf(token[1]);
  return {
    token,
    low60,
    base59: high59 >= 0 && low59 >= 0 ? 59 * high59 + low59 : -1,
    base60: 60 * high60 + low60,
  };
}

const p33 = raw.split(/^\s*%\s*$/m)[33];
const units = p33.split("&");
assert.equal(units.length, 2);
const upperTitle = parseWords(units[0].split(".")[0]);
const lowerTitle = parseWords(units[1].split(".")[0]);
const upper = parseWords(units[0].split(".").slice(1).join("."));
const lower = parseWords(units[1].split(".").slice(1).join("."));

assert.deepEqual(upperTitle.map((word) => word.values.length), [state.K, state.A]);
assert.deepEqual(lowerTitle.map((word) => word.values.length), [state.e, state.g]);
const sums = (words) => words.map((word) =>
  word.values.reduce((sum, value) => sum + value, 0)
);
const upperGp0 = sums(upper);
const lowerGp0 = sums(lower);

assert.equal(upper.length, state.p - state.K); // 21
assert.equal(lower.length, state.p + state.g); // 28
assert.equal(upper.flatMap((word) => word.values).length, state.e ** state.q); // 81
assert.equal(lower.flatMap((word) => word.values).length, state.p * state.g); // 115

const hEq = H(state.e, state.q);
assert.deepEqual(hEq, [28, 7]);

const expected = {
  TUNNELNG: gp0("TUNNELNG"),
  TO: gp0("TO"),
  THE: gp0("THE"),
  SURFACE: gp0("SURFACE"),
  WE: gp0("WE"),
  MUST: gp0("MUST"),
  SHED: gp0("SHED"),
  OUR: gp0("OUR"),
  OWN: gp0("OWN"),
  CIRCUMFERENCES: gp0("CIRCUMFERENCES"),
  FIND: gp0("FIND"),
  DIUINITY: gp0("DIUINITY"),
  WITHIN: gp0("WITHIN"),
  AND: gp0("AND"),
  EMERGE: gp0("EMERGE"),
};
assert.deepEqual(expected, {
  TUNNELNG: 94,
  TO: 19,
  THE: 20,
  SURFACE: 67,
  WE: 25,
  MUST: 51,
  SHED: 64,
  OUR: 8,
  OWN: 19,
  CIRCUMFERENCES: 131,
  FIND: 42,
  DIUINITY: 105,
  WITHIN: 38,
  AND: 56,
  EMERGE: 83,
});

// Upper-map fixed state positions.
assert.equal(upperGp0[state.e - 1], expected.TUNNELNG);
assert.equal(upperGp0[state.b + state.K - 1], expected.TO); // same GP0 as OWN
assert.equal(upperGp0[hEq[1] - 1], expected.THE);
assert.equal(upperGp0[state.e ** 2 - 1], expected.DIUINITY);
assert.equal(upperGp0[state.A + state.K - 1], expected.WITHIN);

// Lower-map fixed state positions.
assert.equal(lowerGp0[state.g - 1], expected.SURFACE);
assert.equal(lowerGp0[state.p - state.e - 1], expected.FIND);
assert.equal(lowerGp0[state.p + state.K - 1], expected.EMERGE);

// Existing p50 graph edges and p23/p28 low-digit operation.
assert.equal(tableOutputs(expected.THE).low60, expected.FIND);
assert.equal(upperGp0[state.a - 1], gp0("ORIGINAL"));
assert.equal(tableOutputs(gp0("ORIGINAL")).low60, expected.MUST);
assert.equal(tableOutputs(expected.TUNNELNG).base60, expected.AND);
assert.equal(tableOutputs(expected.WITHIN).base59, expected.CIRCUMFERENCES);

// Existing visible p33 H chain supplies WE directly.
assert.deepEqual(H(state.B, state.p), [expected.WE, 13]);

// DH public/state values themselves coincide with two source words.
assert.equal(state.A, expected.OUR);
assert.equal(state.B, expected.OWN);

// Exact map controls across every manuscript window.
const parts = raw.split(/^\s*%\s*$/m);
const upperPattern = new Map([
  [state.e, expected.TUNNELNG],
  [hEq[1], expected.THE],
  [state.e ** 2, expected.DIUINITY],
  [state.A + state.K, expected.WITHIN],
  [state.b + state.K, expected.TO],
]);
const lowerPattern = new Map([
  [state.g, expected.SURFACE],
  [state.p - state.e, expected.FIND],
  [state.p + state.K, expected.EMERGE],
]);

let upperWindows = 0;
let lowerWindows = 0;
const upperHits = [];
const lowerHits = [];

for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const source = parts[physicalPage <= 49 ? physicalPage : physicalPage - 1];
  const words = parseWords(source);
  const wordSums = sums(words);

  for (let start = 0; start + upper.length <= words.length; start += 1) {
    upperWindows += 1;
    const ok = [...upperPattern].every(([position, value]) =>
      wordSums[start + position - 1] === value
    );
    if (ok) {
      upperHits.push({
        physicalPage,
        startWord: start + 1,
        startOffset: words[start].start,
      });
    }
  }

  for (let start = 0; start + lower.length <= words.length; start += 1) {
    lowerWindows += 1;
    const ok = [...lowerPattern].every(([position, value]) =>
      wordSums[start + position - 1] === value
    );
    if (ok) {
      lowerHits.push({
        physicalPage,
        startWord: start + 1,
        startOffset: words[start].start,
      });
    }
  }
}

assert.equal(upperWindows, 1833);
assert.equal(lowerWindows, 1474);
assert.deepEqual(upperHits, [{
  physicalPage: 33,
  startWord: 3,
  startOffset: 10,
}]);
assert.deepEqual(lowerHits, [{
  physicalPage: 33,
  startWord: 26,
  startOffset: 99,
}]);

// The source-visible upper red title is [K,A]=[2,8], while map word A is
// RISE. Exponentiation is therefore selected by a literal map word rather than
// introduced solely to fit SHED. The two directions of the same title pair
// produce an independent structural target and the formerly missing word.
const mapCellCount = state.K ** state.A;
const shedCandidate = state.A ** state.K;
assert.equal(mapCellCount, tape.length);
assert.equal(mapCellCount, 256);
assert.equal(shedCandidate, expected.SHED);
assert.equal(shedCandidate, 64);

console.log(JSON.stringify({
  status: "PASS",
  state,
  hEq,
  upperMap: {
    words: upper.length,
    runes: upper.flatMap((word) => word.values).length,
    selected: {
      e: ["TUNNELNG", upperGp0[state.e - 1]],
      bPlusK: ["TO/OWN", upperGp0[state.b + state.K - 1]],
      hEqSecond: ["THE", upperGp0[hEq[1] - 1]],
      eSquared: ["DIUINITY", upperGp0[state.e ** 2 - 1]],
      APlusK: ["WITHIN", upperGp0[state.A + state.K - 1]],
      aThenLowDigit: ["ORIGINAL -> MUST", upperGp0[state.a - 1], tableOutputs(upperGp0[state.a - 1]).low60],
    },
    exactPatternHits: upperHits,
  },
  lowerMap: {
    words: lower.length,
    runes: lower.flatMap((word) => word.values).length,
    selected: {
      g: ["SURFACE", lowerGp0[state.g - 1]],
      pMinusE: ["FIND", lowerGp0[state.p - state.e - 1]],
      pPlusK: ["EMERGE", lowerGp0[state.p + state.K - 1]],
    },
    exactPatternHits: lowerHits,
  },
  establishedEdges: {
    theToFind: [expected.THE, tableOutputs(expected.THE).low60],
    originalToMust: [gp0("ORIGINAL"), tableOutputs(gp0("ORIGINAL")).low60],
    tunnelngToAnd: [expected.TUNNELNG, tableOutputs(expected.TUNNELNG).base60],
    withinToCircumferences: [expected.WITHIN, tableOutputs(expected.WITHIN).base59],
    visibleHToWe: H(state.B, state.p),
    AEqualsOur: state.A,
    BEqualsOwnOrTo: state.B,
  },
  recoveredSentence: [
    "TUNNELNG TO THE SURFACE",
    "WE MUST SHED OUR OWN CIRCUMFERENCES",
    "FIND THE DIUINITY WITHIN AND EMERGE",
  ],
  coverage: {
    sourceSentenceSlots: 16,
    connectedSlots: 16,
    directOrEstablishedEdgeSlots: 15,
    titlePowerCompletionSlots: 1,
  },
  titleRisePower: {
    upperRedTitleLengths: upperTitle.map((word) => word.values.length),
    riseMapPosition: state.A,
    riseMapGp0: upperGp0[state.A - 1],
    forwardTitlePower: {
      expression: "K^A",
      value: mapCellCount,
      independentStructuralTarget: "p50 256-cell map",
    },
    reverseTitlePower: {
      expression: "A^K",
      value: shedCandidate,
      gp0Word: "SHED",
    },
    evidenceBoundary: "RISE supplies a source-visible power cue and K^A independently lands on the 256-cell p50 map. A^K=SHED completes the sole missing known-p57 slot, so retain this lexical edge as strongly supported but still post-discovery until an unknown-text consequence depends on it.",
  },
  decision: "P33's independently selected 21-word and 28-word maps reconstruct all 16 lexical slots of the solved p57 terminal instruction. Fifteen are connected through fixed state positions and established p50/H edges. The sole former gap SHED is completed by the source-visible red-title pair [K,A]=[2,8] under map word A=RISE: K^A=256 independently identifies the p50 map size, while A^K=64=GP0(SHED). This is a strong source-motivated completion, although the SHED lexical identity was recognized with p57 plaintext already known.",
}, null, 2));
