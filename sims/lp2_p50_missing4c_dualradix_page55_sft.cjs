"use strict";

/**
 * Original LP2 p49-p51 absent 4C token: finite cross-radix / page-count audit.
 *
 * Source: resources/liber-primus/base60-grid.json and lp2-corpus.json.
 * Reads the complete original 32x8 printed token table and all 58 LP2 page
 * rune counts. This checks a conditional pointer; it does not decrypt text.
 *
 * Windows Node.js 22: run the file from anywhere using node.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} filename */
function sourceJson(filename) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", filename), "utf8"),
  );
}

const grid = sourceJson("base60-grid.json");
const corpus = sourceJson("lp2-corpus.json");
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";

/** @param {string} token */
function parse60(token) {
  assert.equal(token.length, 2);
  const hi = alphabet60.indexOf(token[0]);
  const lo = alphabet60.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0, "Invalid original base60 token");
  return 60 * hi + lo;
}

assert.equal(grid.rows.length, 32);
assert(grid.rows.every((row) => row.length === 8));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.translit.length, 29);

const tokens = grid.rows.flat();
const bytes = tokens.map(parse60);
assert.equal(tokens.length, 256);
assert(bytes.every((byte) => byte >= 0 && byte < 256));
for (let row = 0; row < 32; row += 1) {
  for (let col = 0; col < 8; col += 1) {
    assert.equal(bytes[8 * row + col], grid.byte_rows[row][col]);
  }
}

const gp = Object.fromEntries(corpus.translit.map((token, index) => [token, index]));
gp.K = gp.C; // The historical GP table uses C for both C and K.
gp.V = gp.U;
gp.Q = gp.C;
gp.Z = gp.S;

/**
 * A..O are the uppercase ASCII letters whose two-character hexadecimal
 * representation has a leading 4 and therefore can occur in the panel.
 * All fifteen candidates are considered, including absent source tokens.
 */
const candidates = Array.from({ length: 15 }, (_, offset) => {
  const letter = String.fromCharCode(65 + offset);
  const ascii = letter.charCodeAt(0);
  const hexToken = ascii.toString(16).toUpperCase();
  const base60 = parse60(hexToken);
  const pageMatches = corpus.pages
    .filter((page) => page.indices.length === ascii)
    .map((page) => page.page);
  return {
    letter,
    hexToken,
    occurrences: tokens.filter((token) => token === hexToken).length,
    ascii,
    base60,
    residue29: base60 % 29,
    gpIndex: gp[letter],
    selfIndex: base60 % 29 === gp[letter],
    pageMatches,
  };
});

const selfIndexed = candidates.filter((item) => item.selfIndex);
const tripleMatch = candidates.filter(
  (item) => item.selfIndex && item.occurrences === 0 && item.pageMatches.length > 0,
);

assert.deepEqual(selfIndexed.map((x) => x.letter), ["L"]);
assert.deepEqual(tripleMatch.map((x) => x.letter), ["L"]);
assert.deepEqual(tripleMatch[0].pageMatches, [55]);

const pointer = tripleMatch[0];
assert.equal(pointer.hexToken, "4C");
assert.equal(pointer.ascii, 76);
assert.equal(pointer.base60, 252);
assert.equal(pointer.residue29, 20);
assert.equal(pointer.gpIndex, 20);
assert.equal(corpus.translit[corpus.pages[32].indices[0]], "L");
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages.filter((page) => page.indices.length === 76).length, 1);

// The L self-index equality depends on the proposed radix: under base59,
// the same literal characters give 4*59+12 = 248, residue 16.
assert.equal((4 * 59 + 12) % 29, 16);

console.log("Original LP2 source: 32 rows x 8 cells, 256 tokens; 58 pages");
for (const c of candidates) {
  console.log(
    `${c.letter}: token=${c.hexToken} count=${c.occurrences} ` +
      `hexASCII=${c.ascii} base60=${c.base60} mod29=${c.residue29} ` +
      `GP=${c.gpIndex} self=${c.selfIndex} pages=${c.pageMatches.join(",") || "-"}`,
  );
}
console.log(
  "Exact conditional conjunction: missing 4C -> ASCII L=76 -> only page 55; " +
    "base60(4C)%29=GP(L)=20; original page 32 starts with L.",
);
console.log(
  "Alternative base59 residue=16; numeral base, mixed-radix interpretation " +
    "and any ciphertext decoding operation remain unselected by first-party instructions.",
);
console.log("PASS: source-census identity only. No LP2 unknown plaintext or key recovered.");
