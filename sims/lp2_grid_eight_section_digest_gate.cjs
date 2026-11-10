"use strict";

/**
 * Test whether the 256 printed LP2 base60 grid bytes are the eight SHA256-
 * length fingerprints of the eight author-printed text sections, or four
 * SHA512 digests of consecutive pairs of sections.
 *
 * Exact source-preserving comparison; no partial-hash score or key search.
 * Positive shadow hashes prove that the matching checker works.
 * Run: node sims/lp2_grid_eight_section_digest_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const g = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const flat = g.pages.flatMap((p) => p.bytes);
const row = Array.from({length: 32}, (_, i) => flat.slice(8 * i, 8 * i + 8));
assert.equal(flat.length, 256);
assert.equal(row.length, 32);

const text = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const parts = text.split("$").filter((s) => /[\u16a0-\u16ff]/u.test(s));
assert.equal(parts.length, 8, "Exactly eight cipher-bearing printed sections");
const map = new Map(c.runes.map((s, i) => [s, i]));
const sections = parts.map((s) => {
  const runes = Array.from(s).filter((ch) => map.has(ch));
  return {raw: s, runes, indices: runes.map((ch) => map.get(ch))};
});
assert.deepEqual(sections.map((x) => x.indices.length),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.deepEqual(sections.flatMap((s) => s.indices),
  c.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices));

/** @param {number[]} symbols GP29 numerical indices. */
function packedFive(symbols) {
  const data = [];
  let buffer = 0, bits = 0;
  for (const value of symbols) {
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      data.push((buffer >> bits) & 255);
      buffer &= (1 << bits) - 1;
    }
  }
  if (bits) data.push((buffer << (8 - bits)) & 255);
  return Buffer.from(data);
}

/** @param {{raw:string,runes:string[],indices:number[]}} section */
function serialization(section) {
  return {
    rawOriginalTranscript: Buffer.from(section.raw, "utf8"),
    runeUTF8: Buffer.from(section.runes.join(""), "utf8"),
    gpIndices: Buffer.from(section.indices),
    gpPrimes: Buffer.from(section.indices.map((x) => c.prime[x])),
    gpTranslit: Buffer.from(section.indices
      .map((x) => c.translit[x]).join(""), "utf8"),
    packedFive: packedFive(section.indices)
  };
}

/** @param {string} kind @param {Buffer} payload */
function hash(kind, payload) {
  return createHash(kind).update(payload).digest();
}
const serializations = sections.map(serialization);
const modes = Object.keys(serializations[0]);
assert.equal(modes.length, 6);

/** Eight 32-byte targets, as printed physical columns or contiguous blocks. */
const gridEight = {
  printedColumns: Array.from({length: 8}, (_, k) =>
    Buffer.from(row.map((r) => r[k]))),
  rowMajorChunks: Array.from({length: 8}, (_, i) =>
    Buffer.from(flat.slice(32 * i, 32 * (i + 1))))
};
/** Four 64-byte targets, from physically adjacent pairs of printed columns. */
const gridFour = {
  pairedColumns: Array.from({length: 4}, (_, k) =>
    Buffer.concat([gridEight.printedColumns[2 * k],
      gridEight.printedColumns[2 * k + 1]])),
  rowMajorQuarters: Array.from({length: 4}, (_, i) =>
    Buffer.from(flat.slice(64 * i, 64 * (i + 1))))
};
for (const targets of Object.values(gridEight))
  assert(targets.every((x) => x.length === 32));
for (const targets of Object.values(gridFour))
  assert(targets.every((x) => x.length === 64));

const matches = [];
let comparisons = 0;
const hashes = ["sha256", "sha3-256", "blake2s256"];
for (const algorithm of hashes) {
  for (const mode of modes) {
    for (let s = 0; s < 8; s++) {
      const digest = hash(algorithm, serializations[s][mode]);
      for (const [layout, targets] of Object.entries(gridEight))
        for (let t = 0; t < targets.length; t++) {
          comparisons++;
          if (digest.equals(targets[t]))
            matches.push({algorithm, mode, section: s, layout, target: t});
        }
    }
  }
}

let sha512Comparisons = 0;
const matches64 = [];
for (const mode of modes) {
  for (let group = 0; group < 4; group++) {
    const source = Buffer.concat([serializations[2 * group][mode],
      serializations[2 * group + 1][mode]]);
    const digest = hash("sha512", source);
    for (const [layout, targets] of Object.entries(gridFour))
      for (let t = 0; t < 4; t++) {
        sha512Comparisons++;
        if (digest.equals(targets[t]))
          matches64.push({algorithm: "sha512", mode, group, layout, target: t});
      }
  }
}

// A source-exact shadow target demonstrates detection without changing the
// original printed grid or manufacturing an original match.
const positive = hash("sha256", serializations[0].gpIndices);
const targetCopy = gridEight.printedColumns.map((x) => Buffer.from(x));
targetCopy[3] = positive;
assert(positive.equals(targetCopy[3]));
assert.equal(targetCopy.filter((x) => x.equals(positive)).length, 1);

console.log(JSON.stringify({
  originalGridByteCount: flat.length,
  genuineSectionRuneLengths: sections.map((x) => x.indices.length),
  candidateTextByteEncodings: modes,
  sha256LengthAlgorithms: hashes,
  sourceOriginal32ByteComparisons: comparisons,
  exact32ByteOriginalMatches: matches,
  sha512SourcePairComparisons: sha512Comparisons,
  exact64ByteOriginalMatches: matches64,
  positiveControl: {
    syntheticDigestLength: positive.length,
    chosenShadowColumn: 3,
    correctDetections: targetCopy.filter((x) => x.equals(positive)).length
  },
  inference: matches.length || matches64.length
    ? "Exact source-to-grid digest match: investigate immediately"
    : "No match under these exact section serializations, digest primitives and physical layouts"
}, null, 2));
