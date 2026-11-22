"use strict";
/**
 * Exact independent-source 2013/2014/2016 table junction.
 * Run: node sims/lp2_3qo_source_ordinal_two_cell_sft.cjs
 *
 * External fixed clues: signed 2013 TCP BASE29 3301 -> 3QO,
 * original 2016 tree image 563x569 (prime ordinal 103 and 104).
 * 2014 manuscript table is the original table-byte source.
 * Extraction rule is a HYPOTHESIS, not authenticated by Cicada.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
/** @param {string} relative @returns {any} */
const json = relative => JSON.parse(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"));
const gp = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/lp2-grid-256.json");
const digits60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
/** @param {string} token @returns {number} */
const tokenByte = token => 60 * digits60.indexOf(token[0]) + digits60.indexOf(token[1]);
/** @param {number} index @returns {number} */
function nthPrime(index) {
  let seen = 0;
  for (let n = 2; ; n++) {
    let prime = true;
    for (let d = 2; d*d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime && ++seen === index) return n;
  }
}
/** @param {string} numeral @returns {number} */
const base29 = numeral => [...numeral].reduce((a, c) => {
  const digit = digits60.indexOf(c);
  assert(digit >= 0 && digit < 29);
  return 29*a + digit;
}, 0);
const tokens = table.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(table.bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(table.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert(tokens.every((s, i) => s.length === 2 && tokenByte(s) === table.bytes[i]));

// The independent, original p32 square has one 11-rune first row and first column.
const square = gp.pages[32].indices;
assert.equal(square.length, 121);
const firstRowSum = square.slice(0, 11).reduce((a, v) => a + gp.prime[v], 0);
const firstColSum = Array.from({length:11}, (_, r) => square[11*r])
  .reduce((a, v) => a + gp.prime[v], 0);
assert.deepEqual([firstRowSum, firstColSum], [563, 569]);
assert.deepEqual([nthPrime(103), nthPrime(104)], [563, 569]);

// One-based physical table cells 103 and 104, no fitted offset.
const widthOrdinal = 103, heightOrdinal = 104;
const cell103 = tokens[widthOrdinal - 1];
const cell104 = tokens[heightOrdinal - 1];
assert.equal(cell103, "0W");
assert.equal(cell104, "3Q");
assert.deepEqual([table.bytes[102], table.bytes[103]], [32, 206]);

// Candidate mixed operation: the height-directed literal two-character token
// followed by the width-directed GP rune of the preceding byte modulo 29.
const suffixRuneIndex = table.bytes[102] % 29;
const suffixGP = gp.translit[suffixRuneIndex];
assert.deepEqual([suffixRuneIndex, suffixGP], [3, "O"]);
const result = cell104 + suffixGP;
assert.equal(result, "3QO");
assert.equal(base29(result), 3301);

// Check the precise joint-source pattern occurs once in the entire 256-cell
// original printed stream, without changing cell direction or the extraction.
const matches = [];
for (let i = 0; i+1 < tokens.length; i++) {
  if (tokens[i+1] + gp.translit[table.bytes[i] % 29] === "3QO") {
    matches.push(i+1); // one-based first cell
  }
}
assert.deepEqual(matches, [103]);

// Independent first-puzzle image 503x509, whose prime ordinals are 96 and 97.
assert.deepEqual([nthPrime(96), nthPrime(97)], [503,509]);
const older = tokens[96] + gp.translit[table.bytes[95] % 29];
assert.equal(older, "3gG");
assert.notEqual(older, result);

console.log(JSON.stringify({
  firstP32RowPrimeSum:firstRowSum,
  firstP32ColumnPrimeSum:firstColSum,
  signed2016ImageDimensions:[563,569],
  primeOrdinals:[widthOrdinal,heightOrdinal],
  oneBasedTableCells:[widthOrdinal,heightOrdinal],
  originalPrintedTokens:[cell103,cell104],
  base60Bytes:[table.bytes[102],table.bytes[103]],
  GP29OfFirstByte:suffixGP,
  candidateHeightTokenPlusWidthRune:result,
  signed2013BASE29Value:base29(result),
  originalMatchingAdjacentPairs:matches,
  older2012PictureControl:older,
  status:"Exact cross-source numeric reconstruction; extraction/order not source-authenticated; no LP2 decryption"
},null,2));
