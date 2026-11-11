#!/usr/bin/env node
"use strict";

/**
 * Key-independent test of one fixed GP29 bijection per source-titled LP2 body.
 *
 * The primary source-only segmentation is documented in
 * workplace/lp2-section-clock-ambiguity.md: p32 closes; p33 local offsets
 * 0 and 91 begin distinct titled units. It partitions all 12,956 unknown
 * runes into nine bodies [729,1145,1738,1894,1021,1433,91,1589,3316].
 *
 * Any fixed bijection of the 29 GP symbols within a body preserves that
 * body's index of coincidence exactly. A within-body transposition does too.
 * This test therefore excludes every secret alphabet for this literal
 * architecture without enumerating keys or scoring candidate plaintext.
 *
 * It does NOT test polyalphabetic/evolving state, per-body KDFs, nonlinear
 * maps, cross-body mixing, non-GP registers, or non-English plaintext.
 *
 * Run: node sims/lp2_nine_body_fixed_substitution_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encode } = require("./word_partition_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const BODY_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316];
const TOTAL = 12956;

function ioc(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  let pairs = 0;
  for (const count of counts.values()) pairs += count * (count - 1);
  return values.length > 1 ? pairs / (values.length * (values.length - 1)) : 0;
}

function splitBodies(stream) {
  assert.equal(BODY_LENGTHS.reduce((sum, length) => sum + length, 0), TOTAL);
  let offset = 0;
  return BODY_LENGTHS.map((length, index) => {
    const body = stream.slice(offset, offset + length);
    assert.equal(body.length, length, \`body \${index + 1} length\`);
    offset += length;
    return body;
  });
}

function summarize(bodies) {
  return bodies.map((body, index) => ({
    body: index + 1,
    runes: body.length,
    ioc: Number(ioc(body).toFixed(9))
  }));
}

function range(rows) {
  const values = rows.map(row => row.ioc);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length
  };
}

function loadUnknown() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const stream = corpus.pages
    .filter(page => page.status === "unsolved" && page.indices.length)
    .flatMap(page => page.indices);
  assert.equal(stream.length, TOTAL);
  return stream;
}

function loadEnglishControl() {
  const words = (read("resources/control/shakespeare_first300k.txt")
    .toUpperCase().match(/[A-Z]+/g) || []).map(encode);
  const stream = words.flat().slice(0, TOTAL);
  assert.equal(stream.length, TOTAL);
  return stream;
}

/** Nine independent nonzero affine multipliers, one per body, must preserve IoC. */
function positiveControl(bodies) {
  const checks = bodies.map((body, index) => {
    const a = index + 1; // 1..9, all invertible modulo prime 29
    const b = (7 * index + 11) % 29;
    const transformed = body.map(value => (a * value + b) % 29);
    assert.equal(ioc(body), ioc(transformed),
      \`body \${index + 1}: fixed affine bijection changed IoC\`);
    return { body: index + 1, a, b, exactIoCPreserved: true };
  });
  return { independentBodyBijections: checks, allPreserved: true };
}

function run() {
  const sectionSynthesis = read("workplace/lp2-section-clock-ambiguity.md");
  assert.ok(sectionSynthesis.includes(
    "729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316"),
    "source-section synthesis no longer contains the frozen nine-body lengths");

  const unknownBodies = splitBodies(loadUnknown());
  const englishBodies = splitBodies(loadEnglishControl());
  const unknownRows = summarize(unknownBodies);
  const englishRows = summarize(englishBodies);
  const unknownSummary = range(unknownRows);
  const englishSummary = range(englishRows);
  assert.ok(unknownSummary.max < englishSummary.min,
    "unknown bodies must separate from the length-matched English control");

  const largeUnknown = unknownRows.filter(row => row.runes >= 700);
  return {
    classification: "bounded negative; no LP2 plaintext or key recovered",
    model: "one independent fixed GP29 monoalphabetic bijection per each of the nine source-titled bodies; within-body transposition also preserves the tested invariant",
    sourceSegmentation: {
      p32EndClosesPriorUnit: true,
      p33Local0AndLocal91BeginDistinctTitledUnits: true,
      bodyLengths: BODY_LENGTHS,
      totalRunes: TOTAL
    },
    sourceInputs: {
      corpusBlobSha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
      sectionSynthesisBlobSha: "a6462a1c31333a5b7c91c321b40a70f99d32e9f5",
      shakespeareControlBlobSha: "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
    },
    originalLP2: { bodies: unknownRows, summary: unknownSummary },
    lengthMatchedShakespeareGPControl: {
      source: "resources/control/shakespeare_first300k.txt",
      bodies: englishRows,
      summary: englishSummary
    },
    eightBodiesAtLeast700Runes: {
      count: largeUnknown.length,
      minIoC: Math.min(...largeUnknown.map(row => row.ioc)),
      maxIoC: Math.max(...largeUnknown.map(row => row.ioc)),
      meanIoC: largeUnknown.reduce((sum, row) => sum + row.ioc, 0) / largeUnknown.length
    },
    positiveControl: positiveControl(englishBodies),
    decision: {
      uniformBaseline: 1 / 29,
      maximumOriginalBodyIoC: unknownSummary.max,
      minimumEnglishControlBodyIoC: englishSummary.min,
      result: "All nine original bodies remain near the 1/29 uniform baseline, while every length-matched English control body is substantially higher. No fixed secret GP29 alphabet per body, nor within-body transposition, can explain native-English-like plaintext under this segmentation."
    },
    limitations: [
      "The 91-rune p33 interlude is a small statistical sample; the other eight bodies are each at least 729 runes.",
      "Does not exclude evolving or polyalphabetic per-body ciphers, title-dependent KDFs, nonlinear transformations, or cross-body mixing.",
      "Does not exclude non-GP intermediate registers or non-English plaintext.",
      "A typographic body boundary does not itself prove that the cipher resets there."
    ]
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { ioc, splitBodies, summarize, range, positiveControl, run };
