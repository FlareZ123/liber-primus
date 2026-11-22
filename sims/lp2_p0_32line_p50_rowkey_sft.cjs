"use strict";

/**
 * Original p0-p2 first-chapter 32-line / p50 32x8 row receiver gate.
 * Windows Node.js 22 standalone read-only SFT.
 * Only source-order, row-local, phase-zero consumers are tested.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @param {string} text @returns {number[]} */
function decodeRunes(text) {
  return [...text].filter((rune) => runeToIndex.has(rune))
    .map((rune) => /** @type {number} */ (runeToIndex.get(rune)));
}
/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

const sourcePages = original.split(/\n%\s*\n/u);
assert.equal(sourcePages.length, 57, "p50 has no GP text and is omitted");
const groups = sourcePages.slice(0, 3).map((text) => text.split("/")
  .map(decodeRunes).filter((line) => line.length > 0));
assert.deepEqual(groups.map((page) => page.length), [12, 12, 9]);
const opening = groups[0][0];
assert.equal(opening.length, 20);
assert.deepEqual(opening.slice(0, 13), corpus.pages[0].indices.slice(0, 13));
const lines = groups[0].slice(1).concat(groups[1], groups[2]);
assert.equal(lines.length, 32);
assert.equal(lines.flat().length, 709);
assert.equal(corpus.pages[0].runic_count - 13, 249);
assert.equal(corpus.pages.slice(0, 3).reduce((sum, page) =>
  sum + page.runic_count, 0) - 13, 716);

const openingWords = sourcePages.slice(0, 3).join("")
  .replace(/\/\n/g, "").replace(/\s/g, "")
  .split(/[-.&$§]+/u).map(decodeRunes).filter((word) => word.length);
assert.equal(openingWords.length, 158);
assert.deepEqual(openingWords.slice(0, 2).map((word) => word.length), [8, 5]);
assert.equal(openingWords.slice(2).length, 156);
assert.equal(openingWords.slice(2).flat().length, 716);
assert.equal(corpus.pages[49].runic_count + corpus.pages[51].runic_count, 158);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.pages.reduce((sum, page) => sum + page.rows, 0), 32);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.bytes[249], 158);
assert.equal(grid.bytes[158], 249);

const alphabets = {
  60: grid.alphabet,
  59: grid.alphabet.replace("f", ""),
};
/** @param {string} token @param {59|60} radix @returns {{high:number,low:number,byte:number}} */
function parseToken(token, radix) {
  const alpha = alphabets[radix];
  const high = alpha.indexOf(token[0]);
  const low = alpha.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return { high, low, byte: radix * high + low };
}

/**
 * A reversible source-order candidate: eight table bytes are the
 * repeating additive key on the corresponding source line.
 * @param {59|60} radix
 * @param {-1|1} sign
 * @returns {number}
 */
function rowPad(radix, sign) {
  const output = [];
  for (let row = 0; row < 32; row += 1) {
    const key = tokens.slice(row * 8, row * 8 + 8)
      .map((token) => parseToken(token, radix).byte % 29);
    const decrypted = lines[row].map((value, pos) =>
      mod29(value + sign * key[pos % 8]));
    assert.deepEqual(decrypted.map((value, pos) =>
      mod29(value - sign * key[pos % 8])), lines[row],
      "exact forward re-encryption must preserve source line");
    output.push(...decrypted);
  }
  return ioc(output);
}

/**
 * A deterministic, nonreversible read-out candidate: each table
 * cell indexes one glyph on its aligned physical source line.
 * It can only yield a short instruction, never complete decryption.
 * @param {59|60} radix
 * @param {"byte"|"low"|"high"|"quot8"|"quot29"} form
 * @param {boolean} reverseOdd
 * @returns {number}
 */
function rowPointer(radix, form, reverseOdd) {
  const output = [];
  for (let row = 0; row < 32; row += 1) {
    const line = lines[row];
    for (let column = 0; column < 8; column += 1) {
      const { high, low, byte } = parseToken(tokens[row * 8 + column], radix);
      const number = form === "byte" ? byte
        : form === "low" ? low
        : form === "high" ? high
        : form === "quot8" ? Math.floor(byte / 8)
        : Math.floor(byte / 29);
      const position = number % line.length;
      output.push(line[reverseOdd && row % 2 === 1
        ? line.length - 1 - position : position]);
    }
  }
  assert.equal(output.length, 256);
  return ioc(output);
}

const direct = [];
const pointers = [];
for (const radix of /** @type {(59|60)[]} */ ([59, 60])) {
  for (const sign of /** @type {(-1|1)[]} */ ([-1, 1])) {
    direct.push({ radix, sign, ioc: rowPad(radix, sign) });
  }
  for (const form of /** @type {("byte"|"low"|"high"|"quot8"|"quot29")[]} */
    (["byte", "low", "high", "quot8", "quot29"])) {
    for (const reverseOdd of [false, true]) {
      pointers.push({ radix, form, reverseOdd,
        ioc: rowPointer(radix, form, reverseOdd) });
    }
  }
}

const knownClearIoc = ioc(corpus.pages[57].indices);
assert.ok(Math.abs(knownClearIoc - 0.06270997) < 0.000001);
assert.ok(Math.max(...direct.map((x) => x.ioc)) < 0.04);
assert.ok(Math.max(...pointers.map((x) => x.ioc)) < 0.04);
const info = {
  source: {
    sourcePageLineCounts: groups.map((page) => page.length),
    redHeadingRunes: 13,
    followingPhysicalLines: lines.length,
    followingLineRunes: lines.flat().length,
    completeOpeningBodyRunes: openingWords.slice(2).flat().length,
    completeOpeningBodyWords: openingWords.slice(2).length,
    tableShape: [32, 8],
    tableCycle249_158: [grid.bytes[249], grid.bytes[158]],
  },
  nativePlainIoc: knownClearIoc,
  direct,
  pointerTop: pointers.sort((a, b) => b.ioc - a.ioc).slice(0, 5),
};
process.stdout.write(JSON.stringify(info, null, 2) + "\n");
