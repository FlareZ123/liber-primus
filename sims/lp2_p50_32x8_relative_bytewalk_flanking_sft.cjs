"use strict";
/**
 * Original-table relative two-coordinate state reader, Issue #1409.
 * Read-only, self-contained single runnable test file (Node.js 22 / CJS).
 * This is a bounded hypothetical cipher, not a recovered Liber Primus key.
 *
 * The table's 256 conventional base60 values form 32 rows by eight columns.
 * Interpret each byte as a signed-free row displacement (upper five bits)
 * and column displacement (lower three bits) on that visible torus. A new
 * byte is read at every location. Emit the byte modulo 29 as a direct GP
 * additive key, starting at the table's first printed cell.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "resources", "liber-primus");
/** @param {string} name */
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const grid = readJson("base60-grid.json");
const corpus = readJson("lp2-corpus.json");

assert.equal(grid.rows.length, 32, "printed 32-row table");
assert.equal(grid.alphabet.length, 60, "printed base60 digit alphabet");
assert.equal(corpus.runes.length, 29, "GP29 alphabet");
const values = grid.rows.flatMap((row) => {
  assert.equal(row.length, 8, "printed eight-column table");
  return row.map((token) => {
    assert.equal(token.length, 2, "source two-digit table token");
    const hi = grid.alphabet.indexOf(token[0]);
    const lo = grid.alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0, "source base60 symbol");
    const value = 60 * hi + lo;
    assert(value >= 0 && value < 256, "native byte");
    return value;
  });
});
assert.equal(values.length, 256);
assert.equal(values[0], 203);

let cell = 0;
const seen = new Map();
const visited = [];
while (!seen.has(cell)) {
  seen.set(cell, visited.length);
  visited.push(cell);
  const byte = values[cell];
  const row = cell >> 3;
  const column = cell & 7;
  const newRow = (row + (byte >> 3)) & 31;
  const newColumn = (column + (byte & 7)) & 7;
  cell = (newRow << 3) | newColumn;
}
const transient = seen.get(cell);
const cycle = visited.length - transient;
assert.deepEqual([transient, cycle], [8, 20]);
assert.equal(new Set(visited).size, visited.length);
assert.deepEqual(visited, [
  0, 203, 15, 219, 22, 73, 144, 13, 9, 2,
  161, 122, 200, 54, 202, 155, 11, 225, 21, 158,
  151, 76, 190, 96, 62, 178, 80, 222,
]);

/** @param {number} ordinal */
function cellAt(ordinal) {
  assert(Number.isSafeInteger(ordinal) && ordinal >= 0);
  const at = ordinal < visited.length
    ? ordinal
    : transient + ((ordinal - transient) % cycle);
  return visited[at];
}

/** @param {number} ordinal */
function keyAt(ordinal) {
  return values[cellAt(ordinal)] % 29;
}

/** @param {number[]} plaintext @param {number} start */
function encrypt(plaintext, start) {
  return plaintext.map((p, i) => (p + keyAt(start + i)) % 29);
}

/** @param {number[]} ciphertext @param {number} start */
function decrypt(ciphertext, start) {
  return ciphertext.map((c, i) => (c - keyAt(start + i) + 29) % 29);
}

/** @param {number[]} seq */
function ioc(seq) {
  const f = Array(29).fill(0);
  for (const symbol of seq) f[symbol]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}

/** @param {number[]} seq */
function doublets(seq) {
  return seq.reduce((sum, x, i) => sum + (i > 0 && x === seq[i - 1] ? 1 : 0), 0);
}

/** @param {number[]} seq */
function transliterate(seq) {
  return seq.map((symbol) => corpus.translit[symbol]).join("");
}
const preTable = [...corpus.pages[48].indices.slice(-72), ...corpus.pages[49].indices];
const postTable = [...corpus.pages[51].indices, ...corpus.pages[52].indices.slice(0, 78)];
assert.equal(preTable.length, 138);
assert.equal(postTable.length, 170);
assert.equal(corpus.pages[50].indices.length, 0);
const preDecoded = decrypt(preTable, 0);
const postDecoded = decrypt(postTable, preTable.length);
assert.deepEqual(encrypt(preDecoded, 0), preTable, "authentic pretable reencryption");
assert.deepEqual(encrypt(postDecoded, preTable.length), postTable, "authentic posttable reencryption");

// Genuine 95-rune clear p57 supplies source-native glyphs in positive controls.
// Repeating its sequence extends to the precise 138/170 source sentence lengths.
const clear = corpus.pages[57].indices;
assert.equal(clear.length, 95);
const plantPre = Array.from({ length: 138 }, (_, i) => clear[i % 95]);
const plantPost = Array.from({ length: 170 }, (_, i) => clear[(i + 43) % 95]);
const cipherPre = encrypt(plantPre, 0);
const cipherPost = encrypt(plantPost, 138);
assert.deepEqual(decrypt(cipherPre, 0), plantPre, "138/138 planted inverse");
assert.deepEqual(decrypt(cipherPost, 138), plantPost, "170/170 held-out planted inverse");
assert.deepEqual(encrypt(decrypt(cipherPre, 0), 0), cipherPre);
assert.deepEqual(encrypt(decrypt(cipherPost, 138), 138), cipherPost);
const report = {
  source: "original 2014 LP2 base60 table; original p48-49 and p51-52 GP29 sentences",
  encodedCells: values.length,
  tableShape: [32, 8],
  byteInterpretation: "radix60",
  operation: "row += byte>>3 mod32; column += byte&7 mod8; key=byte mod29; P=C-key mod29",
  firstPrintedCell: 0,
  transient,
  cycle,
  visited,
  sentenceLengths: [preTable.length, postTable.length],
  original: {
    preIoC: ioc(preTable),
    preDecodedIoC: ioc(preDecoded),
    postIoC: ioc(postTable),
    postDecodedIoC: ioc(postDecoded),
    preDecodedDoublets: doublets(preDecoded),
    postDecodedDoublets: doublets(postDecoded),
    preFirst100: transliterate(preDecoded.slice(0, 100)),
    postFirst100: transliterate(postDecoded.slice(0, 100)),
  },
  authenticClearP57IoC: ioc(clear),
  sourceNativePlantRecovery: [plantPre.length, plantPost.length],
  originalForwardReproduction: [preTable.length, postTable.length],
};
console.log(JSON.stringify(report, null, 2));
console.log("PASS: original two-sentence forward checks and native-GP source plants");
