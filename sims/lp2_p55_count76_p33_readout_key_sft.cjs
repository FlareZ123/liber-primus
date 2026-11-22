"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);

/** @param {number} address @returns {[number, number]} */
function divmod29(address) {
  const value = bytes[address];
  return [Math.floor(value / 29), value % 29];
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const readOutKey = [state.e, 29 - state.K];
assert.deepEqual(readOutKey, [3, 27]);

const outerCircumference = 2 * (32 + 8) - 4;
assert.equal(outerCircumference, 76);

const p55 = ink.pages.find((page) => page.page === 55);
assert.ok(p55);
assert.equal(p55.rune_count, outerCircumference);

assert.equal(tokens[33], "1s");
assert.equal(tokens[76], "1s");
assert.equal(bytes[33], 114);
assert.equal(bytes[76], 114);
assert.deepEqual(divmod29(33), readOutKey);
assert.deepEqual(divmod29(76), readOutKey);

const token114Addresses = bytes
  .map((value, address) => value === 114 ? address : null)
  .filter((address) => address !== null);
assert.deepEqual(token114Addresses, [33, 76]);

const physicalPageKeyHits = Array.from({ length: 58 }, (_, page) => page)
  .filter((page) => page !== 50)
  .filter((page) => {
    const pair = divmod29(page);
    return pair[0] === readOutKey[0] && pair[1] === readOutKey[1];
  });
assert.deepEqual(physicalPageKeyHits, [33]);

const runeCountKeyHits = ink.pages
  .filter((page) => page.page <= 55 && page.page !== 50 && page.rune_count < 256)
  .filter((page) => {
    const pair = divmod29(page.rune_count);
    return pair[0] === readOutKey[0] && pair[1] === readOutKey[1];
  })
  .map((page) => ({ page: page.page, runeCount: page.rune_count }));
assert.deepEqual(runeCountKeyHits, [{ page: 55, runeCount: 76 }]);

/** @param {number} base @param {number} exponent @returns {number} */
function powMod29(base, exponent) {
  let result = 1;
  let factor = base % 29;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % 29;
    factor = (factor * factor) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const p27Corpus = corpus.pages.find((page) => page.page === 27);
const p55Corpus = corpus.pages.find((page) => page.page === 55);
assert.ok(p27Corpus);
assert.ok(p55Corpus);
const repeatedP27 = p27Corpus.indices.slice(28, 34);
const repeatedP55 = p55Corpus.indices.slice(70, 76);
assert.deepEqual(repeatedP27, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(repeatedP55, repeatedP27);
assert.equal(spell(repeatedP55), "DJUBEI");

const keyedRepeatedPair = [
  ...repeatedP55.slice(0, 3).map((value) => powMod29(value, readOutKey[0])),
  ...repeatedP55.slice(3).map((value) => powMod29(value, readOutKey[1]))
];
assert.equal(spell(keyedRepeatedPair), "TYUEONGO");

const p33 = ink.pages.find((page) => page.page === 33);
assert.ok(p33);
assert.equal(p33.rune_count, 214);
assert.equal(tokens[p33.rune_count], "4B");
assert.equal(bytes[p33.rune_count], 251);
assert.deepEqual(divmod29(p33.rune_count), [state.A, state.B]);

console.log(JSON.stringify({
  status: "PASS",
  readOutKey,
  p55: {
    runeCount: p55.rune_count,
    equalsOuterCircumference: p55.rune_count === outerCircumference,
    p50AtRuneCount: {
      address: p55.rune_count,
      token: tokens[p55.rune_count],
      byte: bytes[p55.rune_count],
      pair: divmod29(p55.rune_count)
    },
    repeatedTerminalPair: {
      source: spell(repeatedP55),
      keyedOutput: spell(keyedRepeatedPair),
      decision:
        "Negative direct two-word consumer: apply exponent3 to DJU and exponent27 to BEI once in printed order; output is nonprose TYUEONGO."
    }
  },
  p33: {
    pageAddress: {
      address: 33,
      token: tokens[33],
      byte: bytes[33],
      pair: divmod29(33)
    },
    runeCount: p33.rune_count,
    p50AtRuneCount: {
      address: p33.rune_count,
      token: tokens[p33.rune_count],
      byte: bytes[p33.rune_count],
      pair: divmod29(p33.rune_count)
    }
  },
  exactKeyTokenAddresses: token114Addresses,
  controls: {
    physicalPageAddressesWithExactKey: physicalPageKeyHits,
    sourcePageRuneCountsWithExactKey: runeCountKeyHits
  },
  classification:
    "Cross-object key confirmation. The fixed READ OUT key [e,-K]=[3,27] occurs at exactly p50 addresses33 and76; these are independently physical p33 and the p55 rune-count/outer-circumference scalar. This does not decrypt p55 or establish a universal duplicate-token opcode."
}, null, 2));
