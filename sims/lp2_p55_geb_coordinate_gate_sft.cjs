"use strict";

/**
 * Single-file test of the source-fixed 2014 GEB-coordinate interpretation
 * of the 43 p55 interior runes.
 * @returns {void}
 */
function main() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const base = path.join(__dirname, "..", "resources", "liber-primus");
  const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
  const transcript = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
  const section = transcript.split("\n%\n").at(-3).split(/\n[&$]/)[0];
  const alphabet = new Set(corpus.runes);
  const words = section.replace(/[\n/.]/g, "").split("-")
    .filter(Boolean).map(w => [...w].filter(g => alphabet.has(g)));
  const glyphs = words.flat();
  const source = corpus.pages.find(p => p.page === 55).indices;
  assert.deepEqual(glyphs.map(g => corpus.runes.indexOf(g)), source);
  assert.equal(glyphs.length, 76);
  assert.equal(words.length, 17);
  const inner = words.flatMap(w => w.slice(1, -1)).map(g => corpus.runes.indexOf(g));
  const outer = words.flatMap(w => w.length === 1 ? [w[0]] : [w[0], w.at(-1)]);
  assert.equal(inner.length, 43);
  assert.equal(outer.length, 33);

  // Author-signed 2014 Fifth-Onion GEB code: fourteen numeric triples
  // with chapter-title abbreviations, two literal digits and ONION marker.
  // First-party witness mirrored at neuroretransmit/cicada, pinned commit
  // ade9a02889ef8acbc8cde8edbfd0a785c369f4c3,
  // 2014/007-fifth-onion/README.md.
  const triples = [
    [6, 1, 3], [1, 1, 1], [19, 9, 1], [5, 3, 1],
    [13, 10, 1], [8, 6, 1], [3, 7, 2], [5, 23, 6],
    [1, 8, 1], [4, 5, 3], [6, 2, 1], [2, 17, 5],
    [3, 17, 1], [2, 8, 1],
  ];
  const fields = triples.flat();
  assert.equal(fields.length, 42);

  /** @param {number[]} items @returns {Map<number, number>} */
  function counts(items) {
    const tally = new Map();
    for (const item of items) tally.set(item, (tally.get(item) || 0) + 1);
    return tally;
  }
  const cipherCounts = counts(inner);
  const fieldCounts = counts(fields);
  const maxCipherMultiplicity = Math.max(...cipherCounts.values());
  const repeatedOne = fieldCounts.get(1);
  assert.equal(repeatedOne, 13);
  assert.equal(maxCipherMultiplicity, 4);
  assert.equal(cipherCounts.size, 21);
  assert.equal(fieldCounts.size, 14);
  assert.equal(repeatedOne - maxCipherMultiplicity, 9);

  // Synthetic positive: a planted affine GP29 encoder maps all 42 fields.
  const planted = fields.map(v => (5 * v + 7) % 29);
  const decoded = planted.map(v => (((v - 7) * 6) % 29 + 29) % 29);
  assert.deepEqual(decoded, fields);
  assert.equal(Math.max(...counts(planted).values()), 13);

  console.log("ORIGINAL p55: 76 runes / 17 words / 43 interiors / 33 exteriors");
  console.log("Original p55 interior indices:", inner.join(","));
  console.log("First-party 2014 GEB: 14 records / 42 fields / 14 values");
  console.log("Numeric coordinate 1 multiplicity:", repeatedOne);
  console.log("Maximum original interior rune multiplicity:", maxCipherMultiplicity);
  console.log("DIRECT STATIONARY ONE-RUNE CODE REJECTED:",
    "at least 9 conflicts independently of permutation, reversal, one marker.");
  console.log("SYNTHETIC POSITIVE PASS: 42/42.");
  console.log("Stateful, homophonic or exterior-keyed models are untested.");
}
main();
