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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word @returns {number[]} */
function encodeGp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset));
    assert.ok(token, `unmapped GP spelling: ${word} at ${offset}`);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} digits @returns {number} */
function decodeBase29(digits) {
  let value = 0;
  for (const digit of digits) value = value * 29 + digit;
  return value;
}

/** @param {string} token @returns {number|null} */
function decodeDropFBase59(token) {
  const alphabet59 = grid.alphabet.replace("f", "");
  let value = 0;
  for (const char of token) {
    const digit = alphabet59.indexOf(char);
    if (digit < 0) return null;
    value = value * alphabet59.length + digit;
  }
  return value;
}

const signedBody = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"),
  )
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  ordinal: index + 1,
  word: word.toUpperCase(),
  values: encodeGp(word),
}));
assert.equal(signedWords.length, 43);

const uniqueByRuneLength = (length) => {
  const map = new Map();
  for (const row of signedWords) {
    if (row.values.length === length && !map.has(row.word)) map.set(row.word, row);
  }
  return [...map.values()];
};

const signedTwo = uniqueByRuneLength(2);
const signedFour = uniqueByRuneLength(4);
assert.deepEqual(signedTwo.map((row) => row.word), ["THE", "IS", "BE"]);
assert.deepEqual(signedFour.map((row) => row.word), [
  "LIES", "THEIR", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2};
const fields = Object.entries(dh);

const parts = transcription.split("%").slice(0, 55);
const words = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const source = parts[page <= 49 ? page : page - 1];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  const finish = () => {
    if (!current.length) return;
    words.push({
      ordinal: words.length + 1,
      page,
      start,
      values: current.slice(),
      gp0: gp0(current),
    });
    current = [];
  };

  for (const char of [...source]) {
    if (runeSet.has(char)) {
      if (!current.length) start = runeOffset;
      current.push(runeIndex.get(char));
      runeOffset += 1;
    } else if (char === "-" || char === ".") {
      finish();
    }
  }
  finish();
}

// General predeclared family:
// every canonical 2-rune -> 4-rune adjacency;
// every ordered pair of distinct fixed DH fields;
// both additive signs;
// every authenticated 2016 two-rune target.
// The target's base29 numeral must equal GP0 of the following ciphertext word.
let adjacencyCount = 0;
let trials = 0;
const directionHits = [];

for (let index = 0; index + 1 < words.length; index += 1) {
  const first = words[index];
  const second = words[index + 1];
  if (first.values.length !== 2 || second.values.length !== 4) continue;
  adjacencyCount += 1;

  for (const [leftName, leftValue] of fields) {
    for (const [rightName, rightValue] of fields) {
      if (leftName === rightName) continue;
      for (const sign of [-1, 1]) {
        trials += 1;
        const plaintext = [
          mod29(first.values[0] + sign * leftValue),
          mod29(first.values[1] + sign * rightValue),
        ];
        const target = signedTwo.find((row) =>
          row.values[0] === plaintext[0] &&
          row.values[1] === plaintext[1]);

        if (target && second.gp0 === decodeBase29(target.values)) {
          directionHits.push({
            pair: [first.ordinal, second.ordinal],
            page: first.page,
            starts: [first.start, second.start],
            key: [leftName, rightName],
            sign,
            target: target.word,
            targetBase29: decodeBase29(target.values),
            nextCipherGp0: second.gp0,
          });
        }
      }
    }
  }
}

assert.equal(adjacencyCount, 72);
assert.equal(trials, 6048);
assert.deepEqual(directionHits, [
  {
    pair: [22, 23],
    page: 0,
    starts: [103, 105],
    key: ["p", "a"],
    sign: 1,
    target: "THE",
    targetBase29: 76,
    nextCipherGp0: 76,
  },
  {
    pair: [22, 23],
    page: 0,
    starts: [103, 105],
    key: ["a", "p"],
    sign: -1,
    target: "THE",
    targetBase29: 76,
    nextCipherGp0: 76,
  },
]);

const p0Word23 = words[22];
assert.deepEqual(p0Word23.values, [16, 8, 25, 27]);

// Source-descriptor ROAD key recovered from the p28/HERE route.
const roadKey = [12, 5, 1, 4];
const roadPlain = p0Word23.values.map((value, index) =>
  mod29(value - roadKey[index]));
assert.deepEqual(roadPlain, encodeGp("ROAD"));

const thePlain = encodeGp("THE");
assert.equal(decodeBase29(thePlain), 76);
assert.equal(p0Word23.gp0, 76);

const roadNumber = decodeBase29(roadPlain);
assert.equal(roadNumber, 100798);

// The p50 table has a unique intrinsic self-pointer under the already used
// drop-f base59 interpretation.
const flatTokens = grid.pages.flatMap((page) => page.tokens);
const selfPointers = [];
for (let index = 0; index < flatTokens.length; index += 1) {
  if (decodeDropFBase59(flatTokens[index]) === index) {
    selfPointers.push({index, token: flatTokens[index]});
  }
}
assert.deepEqual(selfPointers, [{index: 189, token: "3C"}]);

// Charge both ordinary receiver origins for every authenticated four-rune word.
// "zero" uses n mod 256 directly. "one" reads n mod 256 as a one-based
// position, so residue 190 denotes zero-based cell189.
const rootHits = [];
for (const target of signedFour) {
  const number = decodeBase29(target.values);
  const residue = number % flatTokens.length;
  for (const origin of ["zero", "one"]) {
    const index = origin === "zero"
      ? residue
      : (residue + flatTokens.length - 1) % flatTokens.length;
    if (decodeDropFBase59(flatTokens[index]) === index) {
      rootHits.push({
        target: target.word,
        base29: number,
        residue,
        origin,
        index,
        token: flatTokens[index],
      });
    }
  }
}

assert.deepEqual(rootHits, [{
  target: "ROAD",
  base29: 100798,
  residue: 190,
  origin: "one",
  index: 189,
  token: "3C",
}]);

// "THE ROAD" itself is also uniquely distinguished inside the signed 2016
// adjacent-word sequence by the canonical GP0 sum hitting an authenticated
// 2013 command address. GP0(BASE29) means the alphabetic GP spelling BASE;
// the decimal suffix is outside the rune alphabet and is ignored.
const commandNames = ["RAND", "QUINE", "BASE29", "CODE", "KOAN", "DH", "NEXT", "GOODBYE"];
const commandAddresses = new Map();
for (const command of commandNames) {
  const address = gp0(encodeGp(command));
  if (!commandAddresses.has(address)) commandAddresses.set(address, []);
  commandAddresses.get(address).push(command);
}

const commandPairHits = [];
for (let index = 0; index + 1 < signedWords.length; index += 1) {
  const left = signedWords[index];
  const right = signedWords[index + 1];
  const address = gp0(left.values) + gp0(right.values);
  if (commandAddresses.has(address)) {
    commandPairHits.push({
      pair: [left.word, right.word],
      address,
      commands: commandAddresses.get(address),
    });
  }
}

assert.deepEqual(commandPairHits, [{
  pair: ["THE", "ROAD"],
  address: 74,
  commands: ["BASE29"],
}]);

// Prospective transfer of the solved-page-validated nX ordinal consumer.\n// ROAD directs to p50 cell189 = 3C. On p0, rune189 would need to be\n// the third C for that consumer to transfer. It is instead the 11th F.\nconst p0Runes = [...parts[0]]\n  .filter((char) => runeSet.has(char))\n  .map((char) => runeIndex.get(char));\nconst p0OrdinalValue = p0Runes[189];\nconst p0OrdinalSymbol = corpus.translit[p0OrdinalValue];\nconst p0OrdinalCount = p0Runes\n  .slice(0, 190)\n  .filter((value) => value === p0OrdinalValue)\n  .length;\nconst p0OrdinalConsumer = {\n  address: 189,\n  token: flatTokens[189],\n  actualSymbol: p0OrdinalSymbol,\n  actualPrefixOccurrence: p0OrdinalCount,\n  expectedSymbol: "C",\n  expectedOccurrence: 3,\n  hit: p0OrdinalSymbol === "C" && p0OrdinalCount === 3,\n};\nassert.deepEqual(p0OrdinalConsumer, {\n  address: 189,\n  token: "3C",\n  actualSymbol: "F",\n  actualPrefixOccurrence: 11,\n  expectedSymbol: "C",\n  expectedOccurrence: 3,\n  hit: false,\n});\nconsole.log("prospective p0 ordinal consumer:", JSON.stringify(p0OrdinalConsumer));\nconsole.log(JSON.stringify({
  status: "PASS: THE ROAD numbers form a unique source-direction chain",
  theToRoad: {
    adjacentTwoFourPairs: adjacencyCount,
    chargedDhTrials: trials,
    hits: directionHits,
  },
  road: {
    ciphertext: p0Word23.values,
    sourceDescriptorKey: roadKey,
    plaintext: roadPlain,
    base29: roadNumber,
  },
  signedCommandBridge: {
    adjacentPairs: signedWords.length - 1,
    hits: commandPairHits,
  },
  p50Root: {
    selfPointers,
    chargedTargets: signedFour.map((row) => row.word),
    chargedOrigins: ["zero", "one"],
    hits: rootHits,
  },
  decision:
    "Under a fixed numeric-reading grammar, THE uniquely directs to the following ROAD ciphertext by base29-number = next-word GP0, while ROAD uniquely lands on p50's sole drop-f-base59 self-pointer under one-based modulo-256 reception. THE ROAD is also the sole signed-2016 adjacent pair whose GP0 sum equals an authenticated 2013 command address, BASE29.",
}, null, 2));
