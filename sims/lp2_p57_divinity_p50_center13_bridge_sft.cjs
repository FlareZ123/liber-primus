"use strict";

/**
 * Reconstruct the p50 nested prime-count bracket from solved p57 words.
 *
 * Frozen source hypothesis:
 *   canonical GP0 word sum -> zero-based p50 address.
 *
 * The SFT verifies:
 *   EMERGE=83 selects an inner duplicate boundary;
 *   the immediately outer duplicate pair is the second circumference;
 *   both pairs share center105;
 *   DIUINITY=105 selects that center, whose printed token is unique "13";
 *   the same GP0 addressing exposes WITHIN -> CIRCUMFERENCES -> PARABLE -> FIND -> 28;
 *   FIND -> physical p28 -> primePi(269)=57 closes back to solved p57;
 *   base59 pointer convergence to189 is universal and therefore non-discriminating.
 *
 * Run:
 *   node sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(
  read("resources/liber-primus/lp2-ink-annotations.json")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {string} text @returns {number[][]} */
function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} token */
function decode59(token) {
  return decode(token, alphabet59);
}

/** @param {string} token */
function decode60(token) {
  return decode(token, alphabet60);
}

/** @param {number} start */
function pointerFate59(start) {
  const pathOut = [];
  const seen = new Map();
  let cell = start;
  while (cell >= 0 && cell < 256 && !seen.has(cell)) {
    seen.set(cell, pathOut.length);
    pathOut.push(cell);
    cell = decode59(tokens[cell]);
  }
  if (cell < 0 || cell >= 256) {
    return { path: pathOut, exit: cell, cycle: [] };
  }
  return {
    path: pathOut,
    exit: null,
    cycle: pathOut.slice(seen.get(cell)),
  };
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
assert.equal(p57Words.length, 20);

const wordRows = p57Words.map((word, index) => ({
  position: index + 1,
  text: word.map((value) => corpus.translit[value]).join(""),
  gp0: word.reduce((sum, value) => sum + value, 0),
  gp1: word.reduce((sum, value) => sum + value + 1, 0),
  prime: word.reduce((sum, value) => sum + corpus.prime[value], 0),
  length: word.length,
}));

/** @param {string} text */
function word(text) {
  const row = wordRows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const parable = word("PARABLE");
const tunnel = word("TUNNELNG");
const shed = word("SHED");
const circumferences = word("CIRCUMFERENCES");
const find = word("FIND");
const within = word("WITHIN");
const divinity = word("DIUINITY");
const emerge = word("EMERGE");

assert.deepEqual(
  {
    parable: parable.gp0,
    tunnel: tunnel.gp0,
    shed: shed.gp0,
    circumferences: circumferences.gp0,
    find: find.gp0,
    within: within.gp0,
    divinity: divinity.gp0,
    emerge: emerge.gp0,
  },
  {
    parable: 120,
    tunnel: 94,
    shed: 64,
    circumferences: 131,
    find: 42,
    within: 38,
    divinity: 105,
    emerge: 83,
  }
);

assert.equal(tokens.length, 256);

// EMERGE reconstructs the nested boundary locally.
assert.equal(tokens[emerge.gp0], "3D");
assert.equal(tokens[127], "3D");
assert.equal(tokens[emerge.gp0 - 1], "3L");
assert.equal(tokens[128], "3L");
assert.equal(decode60(tokens[82]), 201);
assert.equal(decode60(tokens[128]), 201);
assert.equal(128 - 82, primePi(201));
assert.equal(decode60(tokens[83]), 193);
assert.equal(decode60(tokens[127]), 193);
assert.equal(127 - 83, primePi(193));
assert.equal((82 + 128) / 2, 105);
assert.equal((83 + 127) / 2, 105);

const payloadLeft = 84;
const payloadRight = 126;
const payloadCenter = 105;
assert.equal(payloadRight - payloadLeft + 1, 43);
assert.equal(divinity.gp0, payloadCenter);
assert.deepEqual(divinity, {
  position: 17,
  text: "DIUINITY",
  gp0: 105,
  gp1: 113,
  prime: 376,
  length: 8,
});
assert.equal(tokens[payloadCenter], "13");
assert.deepEqual(
  tokens
    .map((token, index) => token === "13" ? index : null)
    .filter((index) => index !== null),
  [105]
);

const specialAddresses = new Set([82, 83, 105, 127, 128]);
assert.deepEqual(
  wordRows
    .filter((row) => specialAddresses.has(row.gp0))
    .map((row) => [row.text, row.gp0]),
  [["DIUINITY", 105], ["EMERGE", 83]]
);

// Same frozen GP0 addressing: source-privileged word graph.
assert.equal(tokens[within.gp0], "2D");
assert.equal(decode59(tokens[within.gp0]), circumferences.gp0);
assert.notEqual(decode60(tokens[within.gp0]), circumferences.gp0);

assert.equal(tokens[shed.gp0], "22");
assert.equal(decode59(tokens[shed.gp0]), parable.gp0);
assert.notEqual(decode60(tokens[shed.gp0]), parable.gp0);

assert.equal(tokens[circumferences.gp0], "20");
assert.equal(decode60(tokens[circumferences.gp0]), parable.gp0);
assert.notEqual(decode59(tokens[circumferences.gp0]), parable.gp0);

assert.equal(tokens[parable.gp0], "0g");
assert.equal(decode60(tokens[parable.gp0]), find.gp0);
assert.equal(
  tokens.filter((token) => decode59(token) === find.gp0).length,
  0
);

assert.equal(tokens[find.gp0], "0S");
assert.equal(decode59(tokens[find.gp0]), 28);
assert.equal(decode60(tokens[find.gp0]), 28);

// FIND -> physical p28; bracket-selected prime counting closes to solved p57.
const p28Page = corpus.pages.find((page) => page.page === 28);
assert.ok(p28Page);
assert.equal(p28Page.indices.length, 269);
assert.ok(isPrime(p28Page.indices.length));
assert.equal(primePi(p28Page.indices.length), 57);

const p28to31Counts = [28, 29, 30, 31].map((pageNumber) => {
  const page = corpus.pages.find((candidate) => candidate.page === pageNumber);
  assert.ok(page);
  return page.indices.length;
});
assert.deepEqual(p28to31Counts, [269, 277, 263, 269]);
assert.ok(p28to31Counts.every(isPrime));
assert.deepEqual(p28to31Counts.map(primePi), [57, 59, 56, 57]);

const fourPrimeStarts = [];
for (let start = 0; start <= 52; start += 1) {
  const counts = [0, 1, 2, 3].map((delta) => {
    const page = corpus.pages.find((candidate) => candidate.page === start + delta);
    assert.ok(page);
    return page.indices.length;
  });
  if (counts.every(isPrime)) fourPrimeStarts.push(start);
}
assert.deepEqual(fourPrimeStarts, [28]);

const pagesClosingTo57 = corpus.pages
  .filter((page) => page.page <= 55 && primePi(page.indices.length) === 57)
  .map((page) => page.page);
assert.deepEqual(pagesClosingTo57, [20, 24, 28, 31, 45, 46]);

const gp28OccurrencesOnP28 = p28Page.indices
  .map((value, index) => value === 28 ? index : null)
  .filter((index) => index !== null);
assert.equal(gp28OccurrencesOnP28.length, 14);

// Secondary page-pair alignment.
assert.equal(tokens[tunnel.gp0], "0u");
assert.equal(decode59(tokens[tunnel.gp0]), 55);
assert.equal(decode60(tokens[tunnel.gp0]), 56);

// Conditional exact-multiset selectivity for named GP0 addresses.
const toParableEither = tokens.filter(
  (token) => decode59(token) === parable.gp0 ||
    decode60(token) === parable.gp0
).length;
const toFindEither = tokens.filter(
  (token) => decode59(token) === find.gp0 ||
    decode60(token) === find.gp0
).length;
assert.equal(toParableEither, 3);
assert.equal(toFindEither, 2);

const exactObservedProbability =
  (2 / 256) * (1 / 255) * (2 / 254);
const eitherRadixInboundProbability =
  (3 / 256) * (2 / 255) * (2 / 254);
assert.equal(1 / exactObservedProbability, 4145280);
assert.equal(1 / eitherRadixInboundProbability, 1381760);

// Original p57 visual punctuation.
const p57Ink = ink.pages.find((page) => page.page === 57);
assert.ok(p57Ink);
assert.deepEqual(
  p57Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 7]]
);
assert.deepEqual(
  p57Ink.large_punctuation,
  [[7, 13, "red"], [95, 23, "red"]]
);

// Base59 "emerge from center" pointer walk is a universal attractor.
const fixedPoints59 = tokens
  .map((token, cell) => decode59(token) === cell ? cell : null)
  .filter((cell) => cell !== null);
assert.deepEqual(fixedPoints59, [189]);

const allFates = Array.from({ length: 256 }, (_, start) => ({
  start,
  fate: pointerFate59(start),
}));
assert.ok(allFates.every(({ fate }) =>
  fate.cycle.length === 1 && fate.cycle[0] === 189
));
const centerFate = allFates[payloadCenter].fate;
assert.equal(centerFate.path.indexOf(189), 28);
const distance28Starts = allFates
  .filter(({ fate }) => fate.path.indexOf(189) === 28)
  .map(({ start }) => start);
assert.deepEqual(distance28Starts, [105, 126, 140, 173, 210, 230]);

// Conditional red-13 continuation.
const adjacentRed13 = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    const mark = (page.large_punctuation || []).find(
      (candidate) =>
        candidate[0] === end &&
        candidate[1] === 13 &&
        candidate[2] === "red"
    );
    if (!mark) continue;
    const values = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    adjacentRed13.push({
      page: page.page,
      start: span.start,
      length: span.length,
      values,
    });
  }
}

const indexableRed13 = adjacentRed13
  .filter((row) => row.length >= 13)
  .map((row) => {
    const primeSum = row.values.reduce(
      (sum, value) => sum + corpus.prime[value],
      0
    );
    return {
      page: row.page,
      length: row.length,
      thirteenthTranslit: corpus.translit[row.values[12]],
      thirteenthPrime: corpus.prime[row.values[12]],
      residual: row.length - 13,
      primeSum,
      primeSumIsPrime: isPrime(primeSum),
    };
  });

assert.deepEqual(
  indexableRed13.map((row) => row.page),
  [0, 3, 7, 23, 27, 53]
);
assert.deepEqual(
  indexableRed13.map((row) => row.primeSum),
  [662, 742, 766, 786, 1109, 2262]
);
assert.deepEqual(
  indexableRed13.filter((row) => row.primeSumIsPrime)
    .map((row) => row.page),
  [27]
);
const p27 = indexableRed13.find((row) => row.page === 27);
assert.ok(p27);
assert.equal(p27.thirteenthTranslit, "I");
assert.equal(p27.thirteenthPrime, 31);
assert.equal(p27.residual, 6);
assert.equal(p27.thirteenthPrime * p27.residual, 186);

console.log(JSON.stringify({
  status:
    "PASS: solved p57 EMERGE/DIUINITY reconstruct the p50 nested bracket under GP0 addressing",
  p57BracketRoute: {
    emerge: { gp0: emerge.gp0, cell: 83, token: tokens[83] },
    innerPair: { cells: [83, 127], token: "3D", value60: 193, separation: 44 },
    outerPair: { cells: [82, 128], token: "3L", value60: 201, separation: 46 },
    sharedCenter: payloadCenter,
    divinity: { gp0: divinity.gp0, cell: 105, token: tokens[105] },
    strictInterior: [payloadLeft, payloadRight],
    strictInteriorLength: 43,
  },
  wordGraph: {
    within: { address: 38, token: tokens[38], base59: decode59(tokens[38]), target: "CIRCUMFERENCES" },
    shed: { address: 64, token: tokens[64], base59: decode59(tokens[64]), target: "PARABLE" },
    circumferences: { address: 131, token: tokens[131], base60: decode60(tokens[131]), target: "PARABLE" },
    parable: { address: 120, token: tokens[120], base60: decode60(tokens[120]), target: "FIND" },
    find: { address: 42, token: tokens[42], base59: 28, base60: 28 },
    tunnel: { address: 94, token: tokens[94], base59: 55, base60: 56 },
    conditionalExactObservedInverse: 1 / exactObservedProbability,
    conditionalEitherRadixInboundInverse: 1 / eitherRadixInboundProbability,
  },
  find28Closure: {
    selectedPhysicalPage: 28,
    runeCount: p28Page.indices.length,
    primeOrdinal: primePi(p28Page.indices.length),
    uniqueFourPrimeRunStart: fourPrimeStarts[0],
    runCounts: p28to31Counts,
    runPrimeOrdinals: p28to31Counts.map(primePi),
    pagesWithPrimePiCount57: pagesClosingTo57,
    gpRune28OccurrencesOnP28: gp28OccurrencesOnP28.length,
  },
  emergePointerNegative: {
    fixedPoints59,
    startsReaching189: allFates.length,
    centerHopsTo189: 28,
    distance28Starts,
  },
  p57Visual: {
    titleRedSpan: p57Ink.red_spans.map((span) => [span.start, span.length]),
    punctuation: p57Ink.large_punctuation,
  },
  red13Conditional: {
    indexablePages: indexableRed13.map((row) => row.page),
    uniquePrimeSumPage: 27,
    p27Closure: "31 * 6 = 186",
  },
  interpretation:
    "The solved p57 verbs and noun reconstruct a plausible human route into p50: EMERGE=83 selects the inner duplicate boundary, the immediately outer pair supplies the second circumference, and DIUINITY=105 lands at their common center. The same frozen GP0 addressing gives WITHIN -> CIRCUMFERENCES -> PARABLE -> FIND -> 28. Physical p28 then supplies269 runes, and the bracket-selected prime-count operation returns57, closing to the solved instruction page. The printed center13 remains conditional; the universal base59 attractor189 is explicitly rejected as corroboration.",
}, null, 2));
