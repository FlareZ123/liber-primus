#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

function readPinned(relative, expectedSha) {
  const raw = fs.readFileSync(path.join(__dirname, "..", relative));
  const blobSha = createHash("sha1")
    .update(Buffer.from(`blob ${raw.length}\0`))
    .update(raw)
    .digest("hex");
  assert.equal(blobSha, expectedSha, `${relative} changed`);
  return raw;
}
const gridRaw = readPinned("resources/liber-primus/lp2-grid-256.json", "39c4f098566fc5eba9d6738416a2fd193f800701");
const corpusRaw = readPinned("resources/liber-primus/lp2-corpus.json", "054f2a0f780b7d46901acbe3d9bf4f0ac1801165");
const transcriptionRaw = readPinned("resources/lp2-transcription.txt", "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
const grid = JSON.parse(gridRaw.toString("utf8"));
const corpus = JSON.parse(corpusRaw.toString("utf8"));
const physical = transcriptionRaw.toString("utf8").split("%");

assert.equal(grid.bytes[83], 193);
assert.equal(grid.bytes[127], 193);
const p50Bytes = grid.bytes.slice(84, 127);
assert.equal(p50Bytes.length, 43);

const p55Words = physical[54].replace(/[\/\r\n]/g, "").match(/[ᚠ-᛿]+/gu) || [];
assert.deepEqual(p55Words.map(w => [...w].length), [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const p55InteriorRunes = p55Words.flatMap(w => [...w].slice(1, -1));
const p55Interior = p55InteriorRunes.map(r => corpus.runes.indexOf(r));
assert.equal(p55Interior.length, 43);

const mod29 = n => ((n % 29) + 29) % 29;
const key = p50Bytes.map(v => mod29(v));
const ioc = values => {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s,n) => s + n*(n-1), 0) / (values.length*(values.length-1));
};
const tr = values => values.map(v => corpus.translit[v]).join(" ");
const wordLengths = p55Words.slice(1).map(w => [...w].length - 2);
function splitWords(values) {
  let offset = 0;
  return wordLengths.map(n => {
    const word = values.slice(offset, offset+n);
    offset += n;
    return tr(word);
  }).join(" | ");
}

const results = [];
for (const alignment of ["forward", "reverse"]) {
  const alignedKey = alignment === "forward" ? key : [...key].reverse();
  for (const [direction, transform] of [
    ["C-K", (c,k) => mod29(c-k)],
    ["C+K", (c,k) => mod29(c+k)],
    ["K-C", (c,k) => mod29(k-c)]
  ]) {
    const output = p55Interior.map((c,i) => transform(c, alignedKey[i]));
    results.push({
      alignment,
      direction,
      ioc: ioc(output),
      output: tr(output),
      original_word_breaks: splitWords(output)
    });
  }
}

const xorResults = [];
for (const alignment of ["forward", "reverse"]) {
  const alignedBytes = alignment === "forward" ? p50Bytes : [...p50Bytes].reverse();
  const output = p55Interior.map((rune, i) => alignedBytes[i] ^ rune);
  const printableCount = output.filter(v => v >= 32 && v <= 126).length;
  const alphaCount = output.filter(v => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length;
  xorResults.push({
    alignment,
    hex: output.map(v => v.toString(16).padStart(2, "0")).join(""),
    printable_count: printableCount,
    printable_fraction: printableCount / output.length,
    ascii_letter_count: alphaCount,
    ascii_letter_fraction: alphaCount / output.length
  });
}

// Arithmetic positive control: a synthetic GP29 stream must round-trip.
const syntheticPlain = Array.from({length:43}, (_,i) => i % 29);
const syntheticCipher = syntheticPlain.map((v,i) => mod29(v + key[i]));
const syntheticRecovered = syntheticCipher.map((v,i) => mod29(v - key[i]));
assert.deepEqual(syntheticRecovered, syntheticPlain);

console.log(JSON.stringify({
  sources: {
    grid_blob_sha: "39c4f098566fc5eba9d6738416a2fd193f800701",
    corpus_blob_sha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
    transcription_blob_sha: "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  selector: "p50 raw-byte offsets 84..126, bracketed by byte-193 / base60 token 3D at offsets 83 and 127",
  p50_bytes: p50Bytes,
  p50_key_mod29: key,
  p50_key_transliteration: tr(key),
  p55_word_lengths: p55Words.map(w => [...w].length),
  p55_interior_length: p55Interior.length,
  p55_interior_values: p55Interior,
  p55_interior_transliteration: tr(p55Interior),
  results,
  raw_byte_xor_results: xorResults,
  positive_control_roundtrip: true,
  interpretation: "All six direct byte-mod29 additive/Beaufort alignments are nonlinguistic. Raw-byte XOR in forward and reversed order is also nontextual. These tests reject only the stated mappings; they do not determine another p50 byte/token representation."
}, null, 2));
