"use strict";

/**
 * SFT: READ OUT -> p0 MLCD -> Roman sum 1650 -> Euler criterion mod3301
 * applied directly to the original 32x8 p50 table.
 *
 * This is a bounded direct-consumer gate. It tests only:
 * - original base60 and already selected post-SHED base59 numeric states;
 * - QR/NQR polarity;
 * - printed row-major and printed-column grouping;
 * - left bit as MSB or LSB.
 *
 * No rotations, arbitrary permutations, KDFs, or fitted encodings are searched.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {{start:number,values:number[]}[]} */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      words.push({start, values: current});
      current = [];
    }
  }

  if (current.length) words.push({start, values: current});
  return words;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1n;
  let factor = BigInt(base) % BigInt(modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);

  while (e > 0n) {
    if (e & 1n) result = (result * factor) % m;
    factor = (factor * factor) % m;
    e >>= 1n;
  }

  return Number(result);
}

/**
 * @param {number[]} states
 * @param {"qr"|"nqr"} polarity
 * @returns {number[]}
 */
function bitsFor(states, polarity) {
  return states.map((state) => {
    if (polarity === "qr") return state === 1 ? 1 : 0;
    return state === MODULUS - 1 ? 1 : 0;
  });
}

/**
 * Pack the printed 32 rows directly as 32 bytes.
 * @param {number[]} bits
 * @param {boolean} lsb
 * @returns {number[]}
 */
function packRows(bits, lsb) {
  const bytes = [];

  for (let row = 0; row < 32; row += 1) {
    let value = 0;
    for (let col = 0; col < 8; col += 1) {
      value |= bits[row * 8 + col] << (lsb ? col : 7 - col);
    }
    bytes.push(value);
  }

  return bytes;
}

/**
 * Read each printed column top-to-bottom in four consecutive 8-bit chunks.
 * @param {number[]} bits
 * @param {boolean} lsb
 * @returns {number[]}
 */
function packColumns(bits, lsb) {
  const bytes = [];

  for (let col = 0; col < 8; col += 1) {
    for (let chunk = 0; chunk < 4; chunk += 1) {
      let value = 0;
      for (let row = 0; row < 8; row += 1) {
        value |= bits[(chunk * 8 + row) * 8 + col] << (lsb ? row : 7 - row);
      }
      bytes.push(value);
    }
  }

  return bytes;
}

/** @param {number[]} bytes @returns {string} */
function hex(bytes) {
  return Buffer.from(bytes).toString("hex");
}

// Reconstruct the independently selected READ OUT receiver.
const READ = [4, 28, 23];
const OUT = [3, 1, 16];
assert.equal(spell(READ), "READ");
assert.equal(spell(OUT), "OUT");
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes60.length, 256);
assert.equal(tableBytes60[55], 80);
assert.equal(tableBytes60[20], 102);

const p0Words = parseWords(physicalPart(0));
const selected = p0Words.filter(
  (word) =>
    word.start >= 80 &&
    word.start + word.values.length - 1 <= 102
);
assert.equal(selected.length, 4);
const residues = selected.map((word) => gp0(word.values) % 29);
assert.deepEqual(residues, [19, 20, 5, 23]);
assert.equal(spell(residues), "MLCD");

// Standard Roman denominations for the four source-selected letters.
const roman = new Map([
  [19, 1000], // M
  [20, 50],   // L
  [5, 100],   // C
  [23, 500],  // D
]);
const romanValues = residues.map((value) => roman.get(value));
assert.deepEqual(romanValues, [1000, 50, 100, 500]);
const HALF = romanValues.reduce((sum, value) => sum + value, 0);
assert.equal(HALF, 1650);

const MODULUS = 3301;
assert.equal(2 * HALF + 1, MODULUS);

// Positive Euler-criterion checks for the independently selected prime.
assert.equal(modPow(1, HALF, MODULUS), 1);
assert.equal(modPow(MODULUS - 1, HALF, MODULUS), 1);
assert.ok([1, MODULUS - 1].includes(modPow(2, HALF, MODULUS)));

// Both source-motivated table numeric states.
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const numericStates = {
  base60: tableTokens.map((token) => decodeToken(token, alphabet60)),
  base59: tableTokens.map((token) => decodeToken(token, alphabet59)),
};
assert.deepEqual(numericStates.base60, tableBytes60);

const outputs = [];
const stateCounts = {};

for (const [radix, values] of Object.entries(numericStates)) {
  const states = values.map((value) => modPow(value, HALF, MODULUS));

  stateCounts[radix] = {
    qr: states.filter((value) => value === 1).length,
    nqr: states.filter((value) => value === MODULUS - 1).length,
    zero: states.filter((value) => value === 0).length,
    other: states.filter(
      (value) => ![0, 1, MODULUS - 1].includes(value)
    ).length,
  };

  assert.equal(stateCounts[radix].zero, 2);
  assert.equal(stateCounts[radix].other, 0);

  for (const polarity of ["qr", "nqr"]) {
    const bits = bitsFor(states, polarity);

    for (const bitOrder of ["msb", "lsb"]) {
      const lsb = bitOrder === "lsb";

      outputs.push({
        radix,
        polarity,
        geometry: "row",
        bitOrder,
        bytes: packRows(bits, lsb),
      });
      outputs.push({
        radix,
        polarity,
        geometry: "column",
        bitOrder,
        bytes: packColumns(bits, lsb),
      });
    }
  }
}

assert.equal(outputs.length, 16);
for (const output of outputs) assert.equal(output.bytes.length, 32);

// No direct output is readable ASCII. Charge the full fixed family, not just
// whichever orientation looks most promising.
for (const output of outputs) {
  const printable = output.bytes.filter((value) => value >= 32 && value <= 126).length;
  assert.ok(printable < 24);
}

// Typed 32-byte controls already present in the research/source corpus.
const p56Section = solved.sections.find((section) => /p56/i.test(section.name));
assert.ok(p56Section);
const p56Hash = p56Section.source_text.match(/[0-9a-f]{128}/i)?.[0].toLowerCase();
assert.ok(p56Hash);
const typed32 = new Set([
  p56Hash.slice(0, 64),
  p56Hash.slice(64),
  crypto.createHash("sha256").update(Buffer.from(tableBytes60)).digest("hex"),
]);

const exactTypedMatches = outputs
  .map((output) => ({
    radix: output.radix,
    polarity: output.polarity,
    geometry: output.geometry,
    bitOrder: output.bitOrder,
    hex: hex(output.bytes),
  }))
  .filter((output) => typed32.has(output.hex));

assert.deepEqual(exactTypedMatches, []);

// Pin the direct primary outputs so later work cannot silently change the
// consumer while claiming to reproduce this gate.
const pinned = Object.fromEntries(
  outputs.map((output) => [
    [output.radix, output.polarity, output.geometry, output.bitOrder].join("_"),
    hex(output.bytes),
  ])
);

assert.equal(
  pinned.base60_qr_row_msb,
  "fcf5f9b0d5f2cbd4bfec8dd59dc1c26e2819b1df29a41b5f3e4143c47b39910f"
);
assert.equal(
  pinned.base59_qr_row_msb,
  "21ce7d745defc16278af9fb715441b9d5034f142f016ab1f28ef19801a01b777"
);
assert.equal(
  pinned.base59_qr_column_msb,
  "46712a527f84b841b5d06ac338bbed2b6ce303e87c7d45434572174bae7b2367"
);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    residues,
    text: spell(residues),
    romanValues,
    romanSum: HALF,
    modulus: MODULUS,
    relation: "2*1650+1=3301",
  },
  stateCounts,
  outputs: outputs.map((output) => ({
    radix: output.radix,
    polarity: output.polarity,
    geometry: output.geometry,
    bitOrder: output.bitOrder,
    hex: hex(output.bytes),
    ascii: Buffer.from(output.bytes)
      .toString("latin1")
      .replace(/[^\x20-\x7e]/g, "."),
  })),
  exactTypedMatches,
  classification:
    "bounded negative for direct Euler-criterion bitmaps under the two source-selected p50 numeric states; MLCD remains a clue without an authenticated consumer",
}, null, 2));
