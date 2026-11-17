"use strict";
/**
 * LP2 p51 first eight complete words versus p50 eight 32-byte table columns.
 * Source-first SHA-256 preimage probe with exact byte-level positives.
 * node sims/lp2_p51_eightword_p50_eightdigest_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/lp2-transcription.txt").split("%");
const ids = new Map(gp.runes.map((ch, i) => [ch, i]));
const afterText = source[50] + source[51];
/** @type {number[][]} */
const words = [];
/** @type {number[]} */
let current = [];
for (const char of afterText) {
  if (ids.has(char)) current.push(ids.get(char));
  else if (char !== "/" && !/\s/u.test(char) && current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
const first = words.slice(0, 8);
const wordLengths = first.map(a => a.length);
assert.deepEqual(wordLengths, [3, 6, 5, 5, 3, 4, 3, 3]);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 32);
const allSourceValues = gp.pages[51].indices.concat(gp.pages[52].indices);
assert.deepEqual(words.flat(), allSourceValues);
const table = grid.bytes;
assert.equal(table.length, 256);
/** @param {number} c */
function column(c) { return Buffer.from(Array.from({length: 32}, (_, row) => table[row * 8 + c])); }
const columns = Array.from({length: 8}, (_, c) => column(c));
assert.ok(columns.every(c => c.length === 32));
/** @param {Buffer} v */
function sha(v) { return crypto.createHash("sha256").update(v).digest(); }
assert.equal(sha(Buffer.from("abc")).toString("hex"),
 "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
/** @param {number[]} v */
function variants(v) {
  const runes = v.map(n => gp.runes[n]).join("");
  const latin = v.map(n => gp.translit[n]).join("");
  const primes = v.map(n => gp.prime[n]);
  return {
    rune_utf8: Buffer.from(runes, "utf8"),
    latin_upper_utf8: Buffer.from(latin, "utf8"),
    latin_lower_utf8: Buffer.from(latin.toLowerCase(), "utf8"),
    gp29_byte: Buffer.from(v),
    prime_byte: Buffer.from(primes),
    prime_decimal_csv: Buffer.from(primes.join(","), "utf8"),
    gp29_decimal_csv: Buffer.from(v.join(","), "utf8")
  };
}
const wordsLatin = first.map(v => v.map(x => gp.translit[x]).join(""));
const allInputs = [];
for (let w = 0; w < first.length; w++)
  for (const [format, data] of Object.entries(variants(first[w])))
    allInputs.push({word: w, format, data});
const group = first.flat();
for (const [format, data] of Object.entries(variants(group)))
  allInputs.push({word: "all_eight", format, data});
const matched = [];
const smallestHamming = [];
for (const input of allInputs) {
  const digest = sha(input.data);
  let best = 257, bestCol = -1;
  for (let c = 0; c < 8; c++) {
    let bits = 0;
    for (let i = 0; i < 32; i++) {
      let value = digest[i] ^ columns[c][i];
      while (value) { value &= value - 1; bits++; }
    }
    if (bits < best) { best = bits; bestCol = c; }
    if (bits === 0) matched.push({word: input.word, format: input.format, column: c});
  }
  smallestHamming.push({word: input.word, format: input.format, nearestColumn: bestCol, differingBits: best});
}
assert.equal(allInputs.length, 63);
const originalMatches = matched.length;
// Positive control injects exactly known 32-byte SHA-256 preimage into
// the alleged column, then verifies exact same-key match (not mere bit score).
const positiveWord = 4, positiveCol = 3, positiveFormat = "gp29_byte";
const plant = columns.map(c => Buffer.from(c));
const positiveInput = Buffer.from(first[positiveWord]);
plant[positiveCol] = sha(positiveInput);
assert.deepEqual(sha(positiveInput), plant[positiveCol]);
assert.ok(!sha(positiveInput).equals(columns[positiveCol]) || originalMatches > 0);
assert.equal(originalMatches, 0);
const min = smallestHamming.slice().sort((a,b) => a.differingBits - b.differingBits)[0];
console.log(JSON.stringify({
  source: "physical p51 eight words = 32 runes, p50 eight columns = 32 bytes each",
  wordLengths, wordsLatin,
  columnsSha256: columns.map(c => sha(c).toString("hex")),
  sourceInputVariants: Object.keys(variants(first[0])),
  testedOriginalInputs: allInputs.length,
  exactDigestMatches: matched,
  nearestDescriptiveMismatch: min,
  exactSyntheticDigestColumn: true,
  recoveredUnknownPlaintext: false
}, null, 2));
