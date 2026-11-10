"use strict";

/**
 * Source-locked seven-lane equality obstruction for the p33–39 cuneiform body.
 *
 * The same common bijection at every column preserves equality between rows.
 * This covers an arbitrary secret column-specific substitution as well as a
 * common additive one-time pad. It does not cover separate row keys, hidden
 * coordinates, non-GP plaintext or compression.
 *
 * Run: node sims/lp2_cuneiform_sevenlane_shared_key_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relativePath @returns {string} */
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, 29);

/**
 * Greedy GP transliteration: Cicada uses the two-letter graphemes as single
 * runes; source text punctuation/whitespace is discarded.
 * @param {string} text
 * @returns {number[]}
 */
function toGp(text) {
  const index = new Map(corpus.translit.map((name, i) => [name, i]));
  const upper = text.toUpperCase();
  const output = [];
  for (let i = 0; i < upper.length; i++) {
    const digraph = upper.slice(i, i + 2);
    if (index.has(digraph)) {
      output.push(index.get(digraph));
      i++;
    } else if (index.has(upper[i])) {
      output.push(index.get(upper[i]));
    }
  }
  return output;
}

/**
 * For seven same-length rows, count within-column ciphertext equalities.
 * This count is an exact invariant of any columnwise shared permutation.
 * @param {number[][]} rows
 * @returns {{matches:number, comparisons:number, perPair:number[]}}
 */
function equalities(rows) {
  assert.equal(rows.length, 7);
  const width = rows[0].length;
  for (const row of rows) assert.equal(row.length, width);
  let matches = 0;
  const perPair = [];
  for (let a = 0; a < 7; a++) {
    for (let b = a + 1; b < 7; b++) {
      let count = 0;
      for (let j = 0; j < width; j++) {
        if (rows[a][j] === rows[b][j]) count++;
      }
      matches += count;
      perPair.push(count);
    }
  }
  return { matches, comparisons: 21 * width, perPair };
}

/**
 * @param {number[]} seq
 * @param {number} width
 * @returns {number[][]}
 */
function lanes(seq, width) {
  return Array.from({ length: 7 }, (_, k) => seq.slice(k * width, (k + 1) * width));
}

/**
 * Keep the fully source-visible native same-page coordinate width, 123;
 * compare with the exact 7 × 227 continuous packing of the cuneiform body.
 * @param {number[]} seq
 * @returns {{packed:number,native:number}}
 */
function twoFormats(seq) {
  const lengths = [123, 261, 271, 238, 228, 228, 240];
  let position = 0;
  const pageRows = lengths.map((length) => {
    const row = seq.slice(position, position + 123);
    position += length;
    return row;
  });
  assert.equal(position, 1589);
  return {
    packed: equalities(lanes(seq, 227)).matches,
    native: equalities(pageRows).matches
  };
}

/**
 * A completely enumerated deterministic sliding-window reference: sample
 * source windows at regular stride. The comparison uses actual unmodified
 * contiguous GP source sequences, not a probabilistic language model.
 * @param {string} pathName
 * @returns {{name:string,gpRunes:number,windows:number,packed:{min:number,median:number,max:number,mean:number,atMostOriginal:number},native:{min:number,median:number,max:number,mean:number,atMostOriginal:number}}}
 */
function reference(pathName) {
  const source = toGp(read(pathName));
  const stride = Math.max(1, Math.floor((source.length - 1589) / 2000));
  const packed = [], native = [];
  for (let off = 0; off + 1589 <= source.length; off += stride) {
    const r = twoFormats(source.slice(off, off + 1589));
    packed.push(r.packed);
    native.push(r.native);
  }
  /** @param {number[]} values @param {number} observed */
  const stats = (values, observed) => {
    values.sort((a, b) => a - b);
    return {
      min: values[0], median: values[Math.floor(values.length / 2)],
      max: values.at(-1),
      mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(6)),
      atMostOriginal: values.filter((x) => x <= observed).length
    };
  };
  return {
    name: pathName, gpRunes: source.length, windows: packed.length,
    packed: stats(packed, 159), native: stats(native, 93)
  };
}

function main() {
  const pageStreams = corpus.pages.slice(33, 40)
    .map((page) => page.indices.slice(page.page === 33 ? 91 : 0));
  assert.deepEqual(pageStreams.map((p) => p.length), [123, 261, 271, 238, 228, 228, 240]);
  const original = pageStreams.flat();
  assert.equal(original.length, 1589);

  const packed = lanes(original, 227);
  const native = pageStreams.map((p) => p.slice(0, 123));
  const measured = { packed: equalities(packed), native: equalities(native) };
  assert.equal(measured.packed.matches, 159);
  assert.equal(measured.native.matches, 93);

  // Source-native plant under 227 independent column-specific GP29 bijections.
  // Each column has an invertible affine permutation x -> 7*x + 11*j (mod29).
  const shakespeare = toGp(read("resources/control/shakespeare_first300k.txt"));
  const english = lanes(shakespeare.slice(5000, 5000 + 1589), 227);
  const planted = english.map((row) => row.map((x, j) => (7 * x + 11 * j) % 29));
  const decoded = planted.map((row) => row.map((x, j) =>
    (25 * ((x - 11 * j) % 29 + 29)) % 29)); // 7^-1 mod29 = 25
  assert.deepEqual(decoded, english);
  assert.deepEqual(equalities(planted), equalities(english));

  const references = [
    reference("resources/control/shakespeare_first300k.txt"),
    reference("resources/control/emerson_essays_2944.txt")
  ];
  for (const r of references) {
    assert.equal(r.packed.atMostOriginal, 0);
    assert.equal(r.native.atMostOriginal, 0);
  }
  console.log(JSON.stringify({
    status: "SOURCE-BOUND MODEL EXCLUDED; NO ORIGINAL PLAINTEXT",
    sourcePages: "p33 local91 through p39, inclusive",
    sourceRunes: 1589,
    model: "one shared arbitrary GP29 bijection per column across seven lanes",
    original: measured,
    references,
    sourceNativePlant: "exact 1589-rune recovery and forward encryption"
  }, null, 2));
}
main();
