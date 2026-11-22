"use strict";

/**
 * Original p49–51 32x8 byte register vs eight genuine LP2 ciphertext sections.
 * Source clue: eight printed columns of 32 literal byte values, and eight
 * source-marked '#' / '$' unknown runic sections. SHA-256 digest transport
 * is a *hypothesis*, not an authenticated Cicada decoding instruction.
 * Test first-party source ciphertext itself, never generated plaintext.
 *
 * SFT: node sims/lp2_grid8_sha256_original_sections_sft.cjs
 * Windows 11, Node.js 22 CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const master = read("resources/lp2-transcription.txt");
const source = master.split("$").slice(0, 8);
const runes = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} txt @returns {number[]} */
const ordinal = txt => [...txt].filter(c => runes.has(c)).map(c => runes.get(c));
const sectionIndices = source.map(ordinal);
assert.deepEqual(sectionIndices.map(v => v.length),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.equal(sectionIndices.reduce((s, v) => s + v.length, 0), 12956);
assert.deepEqual(sectionIndices.flat(),
  gp.pages.filter(p => p.page < 56).flatMap(p => p.indices));

const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert(bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
const column = Array.from({length:8}, (_, col) =>
  Buffer.from(Array.from({length:32}, (_, row) => bytes[row*8+col])));
const consecutive = Array.from({length:8}, (_,i) =>
  Buffer.from(bytes.slice(i*32,(i+1)*32)));
/** @param {Buffer|string} b @returns {string} */
function sha(b) {
  return crypto.createHash("sha256").update(b).digest("hex");
}
assert.equal(sha("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
const modes = [
  ["GP rune UTF8, punctuation omitted", i => gp.runes[0].repeat(0) + sectionIndices[i].map(n => gp.runes[n]).join("")],
  ["GP ordinal raw bytes 0..28", i => Buffer.from(sectionIndices[i])],
  ["GP ordinal decimal comma-separated", i => sectionIndices[i].join(",")],
  ["GP ordinal decimal packed", i => sectionIndices[i].join("")],
  ["GP source transliteration contiguous", i => sectionIndices[i].map(n => gp.translit[n]).join("")],
  ["Original section exact UTF8 with printed delimiters", i => source[i]]
];
const originalMatches = [];
for (const [layout, series] of [
  ["32-row vertical eight-column",column],
  ["eight consecutive 32-byte row-major blocks",consecutive]
]) {
  const targets = series.map(b => b.toString("hex"));
  for (const [mode,encode] of modes) {
    for (let s=0;s<8;s++) {
      const digest=sha(encode(s));
      for (let g=0;g<8;g++) {
        if (digest === targets[g])
          originalMatches.push({layout,mode,originalSection:s,gridSlot:g,digest});
      }
    }
  }
}
// Positive replay with an actual complete unknown section's *ciphertext*
// as a plant, ensuring that this test can detect an authentic SHA256 match.
const plantedDigest = sha(Buffer.from(sectionIndices[0]));
assert.equal(plantedDigest, sha(modes[1][1](0)));
assert.notEqual(plantedDigest, sha(Buffer.from(sectionIndices[1])));

// There is no known author instruction selecting a SHA256 digest grammar.
// This exact test rules out only these source-native input representations.
assert.equal(originalMatches.length, 0,
  "Unexpected exact digest match! Must preserve and investigate.");
console.log(JSON.stringify({
  status:"No exact eight-column SHA256 of any original LP2 source section; no plaintext recovered",
  corpusSections:sectionIndices.length,
  exactSourceRuneCounts:sectionIndices.map(v=>v.length),
  tableShape:[32,8],
  layoutsTested:["32-row columnwise","eight 32-byte row-major blocks"],
  inputModes:modes.map(([s])=>s),
  digestComparisons:8*2*6*8,
  originalMatches,
  plantedSourceSHA256Positive:plantedDigest,
  originalSolvedP57ExcludedFromUnknownDigestTest:true
},null,2));
