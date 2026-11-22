"use strict";

/**
 * One frozen ordinal-salted SHA-1 reading of original 31 thirteen-dot
 * separators versus the original 32x8 base60 byte grid.
 *
 * Conditional, not author-authenticated, grammar:
 * input_i = byte(i, zero-based 0..31) || original zero-based GP29
 *           index bytes of manuscript fragment i
 * row_i   = SHA1(input_i).subarray(0,8)
 * Output uses physical row-major order. This is NOT the PGP signature hash.
 * Run: node sims/lp2_ordinal_sha1_fragment_gridrow_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
/** @param {string} p @returns {any} */
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json");
const annotations = new Map(ink.pages.map(p => [p.page, p]));

/** @type {number[][]} */
const fragments = [];
/** @type {number[]} */
let current = [];
let marks = 0;
for (const page of corpus.pages) {
  const positions = new Map();
  for (const mark of annotations.get(page.page)?.large_punctuation || []) {
    if (mark[1] === 13) positions.set(mark[0], (positions.get(mark[0]) || 0) + 1);
  }
  for (let j = 0; j <= page.indices.length; j++) {
    for (let k = 0; k < (positions.get(j) || 0); k++) {
      fragments.push(current);
      current = [];
      marks++;
    }
    if (j < page.indices.length) current.push(page.indices[j]);
  }
}
fragments.push(current);
assert.equal(marks, 31);
assert.equal(fragments.length, 32);
assert.equal(fragments.flat().length, 13136);
assert.deepEqual(fragments.flatMap((f, i) => f.length ? [] : [i]), [8, 11]);
assert.equal(ink.pages[0].red_spans[0].length, 13);
assert.equal(ink.pages[0].large_punctuation.find(m => m[1] === 13)[0], 13);

const rows = grid.byte_rows.map(r => Buffer.from(r));
assert.equal(rows.length, 32);
for (const row of rows) assert.equal(row.length, 8);
assert.equal(new Set(rows.map(r => r.toString("hex"))).size, 32);
assert.equal(crypto.createHash("sha1").update("abc").digest("hex"),
  "a9993e364706816aba3e25717850c26c9cd0d89d");
/** @param {number[]} fragment @param {number} i @returns {Buffer} */
const encode = (fragment, i) => Buffer.concat([Buffer.from([i]), Buffer.from(fragment)]);
/** @param {Buffer} payload @returns {Buffer} */
const digest = payload => crypto.createHash("sha1").update(payload).digest().subarray(0, 8);
const predicted = fragments.map((f, i) => digest(encode(f, i)));
assert.ok(!predicted[8].equals(predicted[11]));
const planted = fragments.map((f, i) => digest(encode(f, i)));
assert.equal(planted.filter((b, i) => b.equals(predicted[i])).length, 32);
assert.deepEqual(encode(fragments[8], 8), Buffer.from([8]));
assert.deepEqual(encode(fragments[11], 11), Buffer.from([11]));

const exactRows = predicted.flatMap((b, i) => b.equals(rows[i]) ? [i] : []);
let equalByteCells = 0;
for (let i = 0; i < 32; i++) for (let j = 0; j < 8; j++)
  if (predicted[i][j] === rows[i][j]) equalByteCells++;
assert.equal(exactRows.length, 0);
console.log(JSON.stringify({
  declaredModel: "SHA1(byte(ordinal0) || original-GP29-index-bytes)[0:8]",
  sourceCaveat: "2013 first-party Hash: SHA1 authenticates PGP signatures, not segment PRF framing",
  marks, segments: fragments.length, originalRunes: fragments.flat().length,
  lengths: fragments.map(f => f.length), emptySegmentIndices: [8, 11],
  syntheticExactRows: planted.filter((b, i) => b.equals(predicted[i])).length,
  syntheticEmptyDistinct: !predicted[8].equals(predicted[11]),
  originalExactRows: exactRows, originalEqualByteCells: equalByteCells,
  emptyControls: [8,11].map(i => ({i, predicted: predicted[i].toString("hex"),
    original: rows[i].toString("hex")})),
  predictedRowsHex: predicted.map(b => b.toString("hex"))
}, null, 2));
