"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
const primes = firstPrimes(400);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1);
  return (primes[cardinal - 1] - 1) % 29;
}

/** @param {number[]} cardinals @returns {number[]} */
function serialize(cardinals) { return cardinals.map(T); }

/** @param {number[]} values @returns {string} */
function spell(values) { return values.map((value) => corpus.translit[value]).join(""); }

const p23Line = parts[23].split(/\n/u).find((line) => /[\u16A0-\u16FF]/u.test(line));
assert.ok(p23Line);
const p23Words = p23Line.match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = p23Words.map((word) => [...word].length);
const terminalGp0 = runeIndex.get([...p23Words.at(-1)].at(-1));
assert.deepEqual(lengths, [2, 6, 3, 5, 4]);
assert.equal(terminalGp0, 25);

const fiveDots = 5;
const sourcePage = 23;
const destinationPage = 33;
const originCardinals = [...lengths, fiveDots, terminalGp0];
const originalCardinals = [...originCardinals, sourcePage, destinationPage];
const originValues = serialize(originCardinals);
const originalValues = serialize(originalCardinals);

assert.equal(spell(originValues), "THEORIGIN");
assert.equal(spell(originalValues), "THEORIGINAL");

const originGp0 = originValues.reduce((sum, value) => sum + value, 0);
const originalGp0 = originalValues.reduce((sum, value) => sum + value, 0);
assert.equal(originGp0, 53);
assert.equal(originalGp0, 97);
assert.equal(primes[terminalGp0 - 1], originalGp0);

assert.equal(tokens[originGp0], "2p");
assert.equal(bytes[originGp0], 171);
assert.deepEqual([Math.floor(bytes[originGp0] / 29), bytes[originGp0] % 29], [5, 26]);

assert.equal(tokens[originalGp0], "2U");
assert.equal(bytes[originalGp0], 150);
assert.deepEqual(
  [Math.floor(bytes[originalGp0] / 29), bytes[originalGp0] % 29],
  [fiveDots, lengths.length]
);

const byte150Addresses = bytes
  .map((value, address) => value === 150 ? address : null)
  .filter((address) => address !== null);
assert.deepEqual(byte150Addresses, [28, 97, 213]);

const physicalPagesMappingToL = [];
for (let page = 1; page <= 57; page += 1) {
  if (T(page) === 20) physicalPagesMappingToL.push(page);
}
assert.deepEqual(physicalPagesMappingToL, [22, 33]);

console.log(JSON.stringify({
  status: "PASS",
  originPrefix: {
    cardinals: originCardinals,
    serialized: spell(originValues),
    gp0: originGp0,
    p50: {
      token: tokens[originGp0],
      byte: bytes[originGp0],
      divmod29: [Math.floor(bytes[originGp0] / 29), bytes[originGp0] % 29]
    }
  },
  fullPhrase: {
    cardinals: originalCardinals,
    serialized: spell(originalValues),
    gp0: originalGp0,
    terminalCardinal: terminalGp0,
    primeAtTerminalCardinal: primes[terminalGp0 - 1],
    primeClosure: primes[terminalGp0 - 1] === originalGp0,
    p50: {
      token: tokens[originalGp0],
      byte: bytes[originalGp0],
      divmod29: [Math.floor(bytes[originalGp0] / 29), bytes[originalGp0] % 29],
      sourceTypedPair: [fiveDots, lengths.length]
    }
  },
  sensitivity: {
    byte150Addresses,
    physicalPagesWhoseTIsL: physicalPagesMappingToL,
    note:
      "The [5,5] byte is not unique in the 256-cell table; addresses 28,97,213 share it. The evidence is the independently derived phrase address97 landing on that typed source pair."
  },
  classification:
    "Post-discovery cross-object support for THE ORIGINAL over THE ORIGIN. No unknown body ciphertext is decrypted."
}, null, 2));
