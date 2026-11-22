"use strict";

/**
 * Exact original-cipher known-plaintext scan for the p23-26 five-dot,
 * 201-quintet, stationary one-bit-per-rune Bacon candidate.
 *
 * Reads only pinned repository corpus and independent literature controls.
 * A candidate quoted English window constrains all 29 unknown rune bits;
 * any contradictory repeated-rune assignment rejects the window outright.
 * No language score, adaptive key search, padding, or output postselection.
 *
 * Run: node sims/lp2_p23_26_bacon_crib_scan_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(pages.map(p => p.indices.length), [213, 270, 273, 265]);
const source = pages.flatMap(p => p.indices);
const header = [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26];
assert.deepEqual(source.slice(0, 16), header);
const body = source.slice(16);
assert.equal(body.length, 1005);
assert.equal(new Set(body).size, 29);

/** @type {number[][]} */
const groups = Array.from({length: 201}, (_, i) => body.slice(5 * i, 5 * i + 5));
const variants = [
  {name: "forward", quints: groups},
  {name: "mirror-bits", quints: groups.map(g => [...g].reverse())},
  {name: "reverse-group-order", quints: [...groups].reverse()},
  {name: "reverse-both", quints: [...groups].reverse().map(g => [...g].reverse())},
];
const references = [
  ["Shakespeare", "shakespeare_first300k.txt", 229448],
  ["Emerson", "emerson_essays_2944.txt", 340374],
  ["Gibran", "gibran_prophet_58585.txt", 66521],
  ["Blake", "blake_song_of_liberty_train.txt", 2170],
].map(([name, filename, expectedLetters]) => {
  const raw = fs.readFileSync(path.join(root, "resources/control", filename), "utf8");
  const letters = raw.toUpperCase().replace(/[^A-Z]/g, "");
  assert.equal(letters.length, expectedLetters);
  return {name, letters};
});

/**
 * Test an exact known-plaintext window with one arbitrary secret binary
 * label per GP rune. A repeated source glyph must always carry the same bit.
 * @param {number[][]} quints
 * @param {string} text
 * @param {number} offset
 * @param {number} count
 * @returns {boolean}
 */
function hasStationaryBitKey(quints, text, offset, count) {
  assert.ok(Number.isInteger(offset) && offset >= 0 && offset + count <= text.length);
  assert.ok(count >= 1 && count <= quints.length);
  const bits = new Int8Array(29).fill(-1);
  for (let i = 0; i < count; i++) {
    const code = text.charCodeAt(offset + i) - 65;
    assert.ok(code >= 0 && code <= 25);
    for (let j = 0; j < 5; j++) {
      const rune = quints[i][j];
      const bit = (code >> (4 - j)) & 1;
      if (bits[rune] >= 0 && bits[rune] !== bit) return false;
      bits[rune] = bit;
    }
  }
  return true;
}

/**
 * Preserve a positive control: arbitrary known English can be encoded
 * as binary Bacon with a stationary 29-rune homophone alphabet.
 */
function plantControl(text) {
  const one = Array.from({length: 10}, (_, i) => i);
  const zero = Array.from({length: 19}, (_, i) => i + 10);
  return Array.from({length: text.length}, (_, i) =>
    Array.from({length: 5}, (_, j) => {
      const bit = ((text.charCodeAt(i) - 65) >> (4 - j)) & 1;
      const bucket = bit ? one : zero;
      return bucket[(i * 7 + j * 11) % bucket.length];
    })
  );
}
const plantText = references[0].letters.slice(0, 201);
assert.equal(plantText.length, 201);
assert.ok(hasStationaryBitKey(plantControl(plantText), plantText, 0, 201));

const census = [];
for (const variant of variants) {
  for (const reference of references) {
    let match12 = 0, match20 = 0, match201 = 0;
    for (let k = 0; k + 201 <= reference.letters.length; k++) {
      if (!hasStationaryBitKey(variant.quints, reference.letters, k, 12)) continue;
      match12++;
      if (!hasStationaryBitKey(variant.quints, reference.letters, k, 20)) continue;
      match20++;
      if (hasStationaryBitKey(variant.quints, reference.letters, k, 201)) match201++;
    }
    census.push({direction: variant.name, reference: reference.name,
      sourceLength: reference.letters.length, match12, match20, match201});
  }
}
assert.equal(census.length, 16);
assert.ok(census.every(row => row.match12 === 0 &&
  row.match20 === 0 && row.match201 === 0));
console.log(JSON.stringify({
  sourcePages: [23, 24, 25, 26], originalQuintets: groups.length,
  exactKeyIndependentContradictionThreshold: 12,
  plant201: "passed", census,
  limitation: "finite quoted-text exclusion, not a universal cipher rejection",
}, null, 2));
