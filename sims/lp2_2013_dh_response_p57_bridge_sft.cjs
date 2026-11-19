"use strict";

/**
 * SFT: authenticated 2013 protocol words -> p50 -> solved p57 bridge.
 *
 * Reproduces the finite protocol-vocabulary census, the complete p50 2D
 * duplicate class selected by DH/WITHIN, and the cross-instance DATA 2
 * equality [GP0(DATA), 2] = [K151, K23].
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const runeIndex = new Map(
  corpus.runes.map((rune, index) => [rune, index])
);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, index));
    assert.ok(token, "unmapped GP spelling in " + word + " at " + index);
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} text @returns {string[]} */
function parseSolvedWords(text) {
  const words = [];
  let current = [];
  const flush = () => {
    if (!current.length) return;
    words.push(current.map((value) => corpus.translit[value]).join(""));
    current = [];
  };

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(char)) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function powMod(base, exponent, modulus) {
  let value = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) value = (value * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return value;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  const small = Math.min(k, n - k);
  let value = 1;
  for (let index = 1; index <= small; index += 1) {
    value *= (n - small + index) / index;
  }
  return value;
}

/**
 * @param {number} population
 * @param {number} successes
 * @param {number} draws
 * @param {number} observed
 * @returns {number}
 */
function hypergeometricTail(population, successes, draws, observed) {
  let tail = 0;
  for (
    let hit = observed;
    hit <= Math.min(successes, draws);
    hit += 1
  ) {
    tail += choose(successes, hit) *
      choose(population - successes, draws - hit) /
      choose(population, draws);
  }
  return tail;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseSolvedWords(p57.source_text);
assert.equal(p57Words.length, 20);
const p57Rows = p57Words.map((word, index) => ({
  position: index + 1,
  word,
  gp0: gp0(word),
}));
const p57Sums = new Set(p57Rows.map((row) => row.gp0));

const authenticatedWords = [
  "WELCOME",
  "RAND",
  "QUINE",
  "BASE29",
  "CODE",
  "KOAN",
  "DH",
  "NEXT",
  "GOODBYE",
  "OK",
  "ERROR",
  "DATA",
];

const protocolRows = authenticatedWords.map((word) => {
  const address = gp0(word);
  const token = tokens[address];
  const base59 = decode(token, alphabet59);
  const base60 = decode(token, alphabet60);
  return {
    word,
    address,
    token,
    base59,
    base60,
    targets59: p57Rows
      .filter((row) => row.gp0 === base59)
      .map((row) => row.word),
    targets60: p57Rows
      .filter((row) => row.gp0 === base60)
      .map((row) => row.word),
  };
});

assert.deepEqual(
  protocolRows
    .filter((row) => row.targets59.length)
    .map((row) => [
      row.word,
      row.address,
      row.token,
      row.base59,
      row.targets59,
    ]),
  [
    ["KOAN", 41, "1O", 83, ["EMERGE"]],
    ["DH", 31, "2D", 131, ["CIRCUMFERENCES"]],
    ["DATA", 87, "15", 64, ["SHED"]],
  ]
);
assert.deepEqual(
  protocolRows.filter((row) => row.targets60.length),
  []
);

const distinctAddresses = new Set(protocolRows.map((row) => row.address));
assert.equal(distinctAddresses.size, 11);

const base59Capable = tokens.filter((token) =>
  p57Sums.has(decode(token, alphabet59)));
assert.equal(base59Capable.length, 25);

const familyTail = hypergeometricTail(256, 25, 11, 3);
assert.ok(Math.abs(familyTail - 0.08034666651672531) < 1e-15);

assert.equal(gp0("DH"), 31);
assert.equal(gp0("WITHIN"), 38);
assert.deepEqual(
  tokens
    .map((token, index) => ({token, index}))
    .filter((row) => row.token === "2D")
    .map((row) => row.index),
  [31, 38]
);
assert.equal(tokens[31], "2D");
assert.equal(tokens[38], "2D");
assert.equal(decode("2D", alphabet59), 131);
assert.equal(gp0("CIRCUMFERENCES"), 131);

const dh23 = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: powMod(5, 6, 23),
  B: powMod(5, 15, 23),
};
dh23.K = powMod(dh23.B, dh23.a, dh23.p);
assert.deepEqual(dh23, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});

const dh151 = {
  p: 151,
  g: 35,
  a: 21,
  b: 55,
  A: powMod(35, 21, 151),
  B: powMod(35, 55, 151),
};
dh151.K = powMod(dh151.B, dh151.a, dh151.p);
assert.deepEqual(dh151, {
  p: 151,
  g: 35,
  a: 21,
  b: 55,
  A: 107,
  B: 66,
  K: 87,
});

assert.equal(gp0("DATA"), 87);
assert.equal(gp0("DATA"), dh151.K);
assert.deepEqual([gp0("DATA"), 2], [dh151.K, dh23.K]);
assert.equal(tokens[dh151.K], "15");
assert.equal(decode(tokens[dh151.K], alphabet59), gp0("SHED"));

assert.equal(gp0("OK"), dh23.A);
const responseNames = ["WELCOME", "OK", "ERROR", "DATA", "GOODBYE"];
const responseMatches = responseNames.map((word) => ({
  word,
  gp0: gp0(word),
  dh23Fields: Object.entries(dh23)
    .filter(([, value]) => value === gp0(word))
    .map(([field]) => field),
  dh151Fields: Object.entries(dh151)
    .filter(([, value]) => value === gp0(word))
    .map(([field]) => field),
}));
assert.deepEqual(responseMatches, [
  {word: "WELCOME", gp0: 90, dh23Fields: [], dh151Fields: []},
  {word: "OK", gp0: 8, dh23Fields: ["A"], dh151Fields: []},
  {word: "ERROR", gp0: 33, dh23Fields: [], dh151Fields: []},
  {word: "DATA", gp0: 87, dh23Fields: [], dh151Fields: ["K"]},
  {word: "GOODBYE", gp0: 96, dh23Fields: [], dh151Fields: []},
]);

console.log(JSON.stringify({
  status: "PASS",
  protocolVocabulary: {
    words: authenticatedWords.length,
    distinctAddresses: distinctAddresses.size,
    base59Hits: protocolRows.filter((row) => row.targets59.length),
    base60Hits: [],
    exactMultisetTailAtLeastThree: familyTail,
  },
  duplicate2D: {
    dhAddress: gp0("DH"),
    withinAddress: gp0("WITHIN"),
    positions: [31, 38],
    base59: 131,
    target: "CIRCUMFERENCES",
  },
  dh23,
  dh151,
  responseBridge: {
    signedWorkedExampleTail: "DATA 2",
    canonicalNumbers: [gp0("DATA"), 2],
    manuscriptSharedSecrets: [dh151.K, dh23.K],
    dataAddressTarget: "SHED",
    responseMatches,
  },
  classification:
    "Source-constrained semantic bridge. It connects authenticated DH response words to both manuscript DH states and solved p57, without defining a p0 GP29 KDF.",
}, null, 2));
