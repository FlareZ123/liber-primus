"use strict";

/**
 * Director #1688 familywise audit of the MUST-selected base60 -> base59 transition.
 * Separates manuscript-wide numeral-state validity from local arithmetic fits.
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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;

/** @param {string} text */
function runeWords(text) {
  return (text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || []).map(
    (word) =>
      [...word].map((rune) => {
        const value = runeIndex.get(rune);
        assert.notEqual(value, undefined);
        return value;
      })
  );
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let value = n;
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % factor !== 0) continue;
    while (value % factor === 0) value /= factor;
    result -= result / factor;
  }
  if (value > 1) result -= result / value;
  return result;
}

/**
 * @param {string} token
 * @param {string} alphabet
 * @param {boolean} reverseToken
 */
function decode(token, alphabet, reverseToken = false) {
  const first = reverseToken ? token[1] : token[0];
  const second = reverseToken ? token[0] : token[1];
  const high = alphabet.indexOf(first);
  const low = alphabet.indexOf(second);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = runeWords(p57.source_text).map((word, index) => ({
  position: index + 1,
  text: translit(word),
  gp0: gp0(word),
  prime: gpPrime(word),
  phiPrime: phi(gpPrime(word)),
}));

/** @param {string} text */
function p57Word(text) {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const must = p57Word("MUST");
const shed = p57Word("SHED");
const parable = p57Word("PARABLE");
const within = p57Word("WITHIN");
const circumferences = p57Word("CIRCUMFERENCES");
const emerge = p57Word("EMERGE");

assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.deepEqual(
  p57Rows
    .slice(0, -1)
    .filter(
      (row) =>
        row.phiPrime === 60 &&
        decode(tokens[row.gp0], alphabet60) === 59
    )
    .map((row) => [row.position, row.text, p57Rows[row.position].text]),
  [[10, "MUST", "SHED"]]
);

const solvedAddressable = [];
for (const section of solved.sections) {
  for (const word of runeWords(section.source_text)) {
    const address = gp0(word);
    if (address > 255) continue;
    solvedAddressable.push({
      section: section.name,
      text: translit(word),
      gp0: address,
      phiPrime: phi(gpPrime(word)),
      base60: decode(tokens[address], alphabet60),
    });
  }
}
assert.equal(solvedAddressable.length, 740);
assert.deepEqual(
  solvedAddressable
    .filter((row) => row.phiPrime === 60 && row.base60 === 59)
    .map((row) => [row.section, row.text, row.gp0]),
  [["p57_parable", "MUST", 51]]
);

const globalValidDrops = [...alphabet60].filter((digit) => {
  const alphabet59 = alphabet60.replace(digit, "");
  return tokens.every((token) => decode(token, alphabet59) !== null);
});
assert.deepEqual(globalValidDrops, ["f"]);
const alphabet59 = alphabet60.replace("f", "");

const digitCounts = Object.fromEntries(
  [...alphabet60].map((digit) => [
    digit,
    tokens.reduce(
      (count, token) =>
        count + [...token].filter((char) => char === digit).length,
      0
    ),
  ])
);
assert.deepEqual(
  Object.entries(digitCounts)
    .filter(([, count]) => count === 0)
    .map(([digit]) => digit),
  ["f"]
);

const orientationRows = [];
for (const reverseAlphabet of [false, true]) {
  const a60 = reverseAlphabet
    ? [...alphabet60].reverse().join("")
    : alphabet60;
  const a59 = reverseAlphabet
    ? [...alphabet59].reverse().join("")
    : alphabet59;
  for (const reverseToken of [false, true]) {
    orientationRows.push({
      reverseAlphabet,
      reverseToken,
      must59: decode(tokens[must.gp0], a60, reverseToken) === 59,
      shared87: decode(tokens[87], a59, reverseToken),
      sharedIsShed:
        decode(tokens[87], a59, reverseToken) === shed.gp0,
    });
  }
}
assert.deepEqual(orientationRows, [
  {
    reverseAlphabet: false,
    reverseToken: false,
    must59: true,
    shared87: 64,
    sharedIsShed: true,
  },
  {
    reverseAlphabet: false,
    reverseToken: true,
    must59: false,
    shared87: 296,
    sharedIsShed: false,
  },
  {
    reverseAlphabet: true,
    reverseToken: false,
    must59: false,
    shared87: 3416,
    sharedIsShed: false,
  },
  {
    reverseAlphabet: true,
    reverseToken: true,
    must59: true,
    shared87: 3184,
    sharedIsShed: false,
  },
]);

assert.equal(decode(tokens[must.gp0], alphabet60), 59);
assert.equal(decode(tokens[must.gp0], alphabet59), 58);
assert.equal(decode(tokens[87], alphabet60), 65);
assert.equal(decode(tokens[87], alphabet59), shed.gp0);

const holdouts = [
  [shed.gp0, parable.gp0, "SHED -> PARABLE"],
  [within.gp0, circumferences.gp0, "WITHIN -> CIRCUMFERENCES"],
].map(([address, expected, label]) => ({
  label,
  address,
  token: tokens[address],
  base60: decode(tokens[address], alphabet60),
  base59: decode(tokens[address], alphabet59),
  expected,
}));
assert.deepEqual(holdouts, [
  {
    label: "SHED -> PARABLE",
    address: 64,
    token: "22",
    base60: 122,
    base59: 120,
    expected: 120,
  },
  {
    label: "WITHIN -> CIRCUMFERENCES",
    address: 38,
    token: "2D",
    base60: 133,
    base59: 131,
    expected: 131,
  },
]);
assert.equal(decode(tokens[parable.gp0], alphabet59), 41);
assert.equal(decode(tokens[41], alphabet59), emerge.gp0);

const localChecks = [
  [87, shed.gp0],
  [shed.gp0, parable.gp0],
  [parable.gp0, 41],
  [41, emerge.gp0],
];
const localDropSurvivors = [];
for (let depth = 1; depth <= localChecks.length; depth += 1) {
  localDropSurvivors.push(
    [...alphabet60]
      .filter((digit) => {
        const alphabet = alphabet60.replace(digit, "");
        return localChecks
          .slice(0, depth)
          .every(
            ([address, expected]) =>
              decode(tokens[address], alphabet) === expected
          );
      })
      .join("")
  );
}
assert.deepEqual(localDropSurvivors.map((row) => row.length), [54, 54, 36, 17]);
assert.equal(localDropSurvivors.at(-1), "PQRSTUVWXYZabcdef");

const countToken = (token) =>
  tokens.filter((candidate) => candidate === token).length;
assert.deepEqual(
  {
    must: countToken("0x"),
    shared: countToken("15"),
    shed: countToken("22"),
  },
  { must: 3, shared: 1, shed: 2 }
);

console.log("#1688 MUST/SHED radix-transition familywise audit");
console.log("p57 adjacent switch positions:", p57Rows.length - 1);
console.log(
  "solved addressable words / conjunction survivors:",
  solvedAddressable.length,
  solvedAddressable
    .filter((row) => row.phiPrime === 60 && row.base60 === 59)
    .map((row) => `${row.section}:${row.text}`)
);
console.log("globally valid one-symbol drops:", globalValidDrops);
console.log("orientation family:", orientationRows);
console.log("holdouts:", holdouts);
console.log(
  "local-only drop survivor counts:",
  localDropSurvivors.map((row) => row.length)
);
console.log("local-only final survivors:", localDropSurvivors.at(-1));
console.log("exact fixed-token selector scale: 1/21760");
console.log("selector plus SHED-address scale: 1/2763520");
console.log(
  "PASS: the global-table-valid family uniquely selects forward base60 -> drop-f base59 at MUST/SHED; local arithmetic alone does not select f."
);
