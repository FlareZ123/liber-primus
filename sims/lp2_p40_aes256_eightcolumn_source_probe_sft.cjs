"use strict";
/**
 * Agent18 independent source-shaped LP2 p40–53 key-consumer experiment.
 * The original eight-rune heading defines an eight-column sort, and the
 * 32x8 source table provides eight distinct 256-bit key operands.
 *
 * AES-256-CTR with a zero IV is an explicitly hypothetical 2014-era
 * receiver. No surviving first-party instruction selects this opcode/IV.
 * Modes: column-only, and predecessor-difference before column restoration.
 *
 * Node.js 22, CommonJS, original repo resources, no network or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {string} relative @returns {any} */
const read = (relative) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"));

const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json").bytes;
const chapter = corpus.pages.slice(40, 54).flatMap((page) => page.indices);
const red8 = chapter.slice(0, 8);
const body = chapter.slice(8);
const width = 8;
const height = 375;
const order = red8
  .map((value, index) => ({ value, index }))
  .sort((a, b) => a.value - b.value)
  .map((v) => v.index);
const mod = (value) => (value % 29 + 29) % 29;

assert.equal(chapter.length, 3008);
assert.equal(body.length, width * height);
assert.deepEqual(red8, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);
assert.equal(grid.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

/** @type {number[][]} */
const padColumns = [];
for (let column = 0; column < width; column++) {
  const key = Buffer.from(Array.from({ length: 32 }, (_, row) => grid[row * width + column]));
  const cipher = crypto.createCipheriv("aes-256-ctr", key, Buffer.alloc(16));
  const stream = Buffer.concat([cipher.update(Buffer.alloc(height)), cipher.final()]);
  assert.equal(stream.length, height);
  padColumns.push(Array.from(stream, (b) => b % 29));
}

/** @param {number[]} input @returns {number[]} */
function undoColumnSort(input) {
  assert.equal(input.length, height * width);
  const columns = Array(width);
  for (let block = 0; block < width; block++)
    columns[order[block]] = input.slice(block * height, (block + 1) * height);
  return Array.from({ length: input.length }, (_, i) =>
    columns[i % width][Math.floor(i / width)]
  );
}

/** @param {number[]} rows @returns {number[]} */
function sortColumns(rows) {
  assert.equal(rows.length, height * width);
  return order.flatMap((col) =>
    Array.from({ length: height }, (_, row) => rows[row * width + col])
  );
}

/**
 * @param {number[]} ciphertext
 * @param {boolean} differential
 * @returns {number[]}
 */
function decrypt(ciphertext, differential) {
  assert.equal(ciphertext.length, height * width);
  const transposed = differential
    ? ciphertext.map((val, i) => mod(val - (i === 0 ? 0 : ciphertext[i - 1])))
    : ciphertext;
  const rowwise = undoColumnSort(transposed);
  return rowwise.map((val, i) =>
    mod(val + padColumns[i % width][Math.floor(i / width)])
  );
}

/**
 * @param {number[]} plaintext
 * @param {boolean} differential
 * @returns {number[]}
 */
function encrypt(plaintext, differential) {
  assert.equal(plaintext.length, height * width);
  const rowwise = plaintext.map((val, i) =>
    mod(val - padColumns[i % width][Math.floor(i / width)])
  );
  const ordered = sortColumns(rowwise);
  if (!differential) return ordered;
  const output = [];
  let preceding = 0;
  for (const step of ordered) {
    preceding = mod(preceding + step);
    output.push(preceding);
  }
  return output;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const histogram = Array(29).fill(0);
  for (const v of values) histogram[v]++;
  return histogram.reduce((n, c) => n + c * (c - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((v) => corpus.translit[v]).join("");
}

const positive = Array.from(
  { length: body.length },
  (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length]
);
const outcomes = [];
for (const differential of [false, true]) {
  const plaintext = decrypt(body, differential);
  assert.deepEqual(encrypt(plaintext, differential), body);
  assert.deepEqual(decrypt(encrypt(positive, differential), differential), positive);
  assert.deepEqual(encrypt(decrypt(encrypt(positive, differential), differential), differential), encrypt(positive, differential));
  const score = ioc(plaintext);
  assert.ok(score < 0.037, "Original source must not be misrepresented as normal GP prose");
  outcomes.push({
    mode: differential ? "predecessor-difference-then-column" : "column",
    originalIoC: ioc(body),
    candidateIoC: score,
    candidateIoCTimes29: score * 29,
    nativePositiveIoC: ioc(positive),
    outputGPIndexSHA256: crypto.createHash("sha256")
      .update(Buffer.from(plaintext))
      .digest("hex"),
    plaintextFirst100: translit(plaintext.slice(0, 100)),
    exact3000RuneRoundtrip: true,
    nativeGPPositive3000RuneRoundtrip: true
  });
}
console.log(JSON.stringify({
  source: "original LP2 pp40–53, p40 red8 and p49–51 canonical conditional base60 table",
  sourceTableSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  sourceRed8: red8,
  sourceColumnOrder: order,
  key: "8 x 32 table bytes, each key one printed column",
  IV: "sixteen zero bytes (hypothesis, not first-party authenticated)",
  opcode: "eight AES-256-CTR keystreams reduced modulo 29, historical additive decoder sign",
  output: outcomes
}, null, 2));
