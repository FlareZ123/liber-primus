"use strict";

/**
 * Original 2,896-word GP0 -> 256-cell table -> literal hex/ASCII transfer.
 * Source-side control uses the authenticated signed 2016 words under the
 * already established plain GP0-to-table printable-hex decoder.
 *
 * Node 22 CommonJS, read-only single-file test, Windows 11 compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tableData = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const table = tableData.pages.flatMap(page => page.tokens);
assert.equal(table.length, 256);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const alphabet = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gpWord(text) {
  const word = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const unit = alphabet.find(({symbol}) => word.startsWith(symbol, i));
      assert.ok(unit, "Unmapped GP spelling at " + word.slice(i));
      result.push(unit.value);
      i += unit.symbol.length;
    }
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function gpZeroSum(symbols) {
  return symbols.reduce((a, b) => a + b, 0);
}

/**
 * One source-typed literal hex token, with no radix59/base60 assumption.
 * @param {number[]} symbols
 * @returns {{gp0:number,token:string,char:string|null,printable:string|null}}
 */
function lookup(symbols) {
  const gp0 = gpZeroSum(symbols);
  const token = table[gp0];
  assert.ok(token, "GP0 address outside the 256-cell table: " + gp0);
  const valid = /^[0-9a-fA-F]{2}$/u.test(token);
  const char = valid ? String.fromCharCode(Number.parseInt(token, 16)) : null;
  const printable = char && char.charCodeAt(0) >= 32 &&
    char.charCodeAt(0) <= 126 ? char : null;
  return {gp0, token, char, printable};
}

// Original-source positive: exactly the already reported signed-2016
// word-address printable hex channel, with its real source order.
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedBody = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");
const signedWords = signedBody.split(/[^A-Za-z0-9]+/u)
  .filter(word => /^[A-Za-z]+$/u.test(word));
assert.equal(signedWords.length, 43);
const known = signedWords.map(word => lookup(gpWord(word)));
assert.equal(known.filter(x => x.char !== null).length, 16);
assert.equal(known.map(x => x.printable || "").join(""), "$N*N=NN-*");
console.log("AUTHENTICATED-SOURCE CONTROL: 43 signed words -> $N*N=NN-*");

// Physical LP2 unknown pages, including runeless p50, preserve authentic
// cross-line and cross-page printed words. % and / are layout markers.
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const originalWords = [];
let current = [];
/** Close an original printed whole word. */
function closeWord() {
  if (current.length) {
    originalWords.push(current);
    current = [];
  }
}
for (const char of source) {
  if (runeIndex.has(char)) {
    current.push(runeIndex.get(char));
  } else if (char !== "/" && char !== "%" && !/\s/u.test(char)) {
    closeWord();
  }
}
closeWord();
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.reduce((n, word) => n + word.length, 0), 12956);

const converted = originalWords.map(lookup);
const validHex = converted.filter(x => x.char !== null);
const validPrintable = converted.filter(x => x.printable !== null);
const rows = [];
for (let i = 0; i < converted.length;) {
  if (converted[i].printable === null) {
    i++;
    continue;
  }
  let end = i;
  while (end < converted.length && converted[end].printable !== null) end++;
  if (end - i >= 3) {
    rows.push({
      startWordIndex: i,
      printableLength: end - i,
      literalASCII: converted.slice(i, end).map(x => x.printable).join(""),
      sourceGP0: converted.slice(i, end).map(x => x.gp0)
    });
  }
  i = end;
}
rows.sort((a, b) => b.printableLength - a.printableLength);
const compact = converted.map(x => x.printable || "").join("");
assert.equal(compact.length, 537);
assert.equal(compact.slice(0, 16), "3OHM3O$=F<MH-OI=");
assert.equal(
  (compact.match(/[A-Za-z ]{6,}/g) || []).sort((a, b) => b.length - a.length)[0],
  "NMIOMGE"
);
assert.equal(validHex.length, 867);
assert.equal(validPrintable.length, 537);
assert.equal(rows.length, 19);
assert.equal(rows[0].printableLength, 6);
assert.equal(rows[0].literalASCII, "!N!N-!");
assert.equal(rows[0].startWordIndex, 640);
console.log("ORIGINAL FULL UNKNOWN BOOK: " +
  JSON.stringify({
    completeWords: originalWords.length,
    runes: 12956,
    hexByteAddresses: validHex.length,
    printableByteAddresses: validPrintable.length,
    consecutivePrintableRunsLength3plus: rows.length,
    joinedPrintablePrefix: compact.slice(0, 96),
    longestAlphabeticJoinedRun: 'NMIOMGE',
    longestSourceRuns: rows.slice(0, 8)
  }, null, 2));
console.log("PASS: the direct signed-GP0-to-p50-hex receiver yields no " +
  "contiguous unknown-book ASCII prose. This narrow negative leaves " +
  "other source-selected states and intermediate encodings undecided.");
