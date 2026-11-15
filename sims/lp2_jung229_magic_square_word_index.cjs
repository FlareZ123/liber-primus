#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const squarePath = path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt");
const squareText = fs.readFileSync(squarePath, "utf8");
const values = (squareText.match(/\d+/g) || []).slice(0, 25).map(Number);
const expected = [
  434, 1311, 312, 278, 966,
  204, 812, 934, 280, 1071,
  626, 620, 809, 620, 626,
  1071, 280, 934, 812, 204,
  966, 278, 312, 1311, 434,
];
assert.deepEqual(values, expected, "The first source square changed; re-adjudicate before using it.");
const rowSums = Array.from({ length: 5 }, (_, r) =>
  values.slice(r * 5, r * 5 + 5).reduce((a, b) => a + b, 0)
);
assert(rowSums.every(x => x === 3301), "Expected the source 5x5 magic constant 3301.");

const inputPaths = process.argv.slice(2);
assert.equal(inputPaths.length, 3, "Pass default, -raw, and -layout pdftotext outputs.");

function wordsFrom(file) {
  const text = fs.readFileSync(file, "utf8").normalize("NFC");
  return text.match(/\\p{L}+(?:['’]\\p{L}+)*/gu) || [];
}
function select(words) {
  return values.map(n => words[n - 1] ?? null);
}
const labels = ["default", "raw", "layout"];
const runs = inputPaths.map((file, i) => {
  const words = wordsFrom(file);
  const selected = select(words);
  return { label: labels[i], wordCount: words.length, selected };
});
const primary = runs[0];
const same = runs.map(run =>
  run.selected.every((word, i) => word === primary.selected[i])
);
const grid = Array.from({ length: 5 }, (_, r) => primary.selected.slice(r * 5, r * 5 + 5));
const result = {
  hypothesis: "LP1's source-authenticated 5x5/3301 magic-square values are 1-based word indices into Jung's Liber Primus prologue, The Way of What Is to Come (the three-page p.229-231 excerpt).",
  source: {
    selector: "resources/cicada2014-openpuff-magic-squares.txt, first 25 values",
    selectorShape: "5x5, row-major",
    selectorMagicConstant: 3301,
    text: "British Association of Jungian Analysts, three-page excerpt from C. G. Jung, Liber Novus / The Red Book, The Way of What Is to Come",
    pdfUrl: "https://www.jungiananalysts.org.uk/wp-content/uploads/2024/09/The-Way-of-What-is-to-Come-from-C.-G.-Jung-Liber-Novus-The-Red-Book-1-1.pdf",
    pdfSha256: process.env.JUNG_PDF_SHA256 || null
  },
  operation: "For each square value n, select alphabetic token n (1-based) from the extracted excerpt; preserve the square's row-major order.",
  tokenization: "Unicode letter runs with internal apostrophes; Latin and English tokens retained; no modulo, offset search, or reordering.",
  extractionModes: runs.map((run, i) => ({
    mode: run.label,
    wordCount: run.wordCount,
    sameSelectedWordsAsDefault: same[i]
  })),
  indicesInRange: primary.selected.every(x => x !== null),
  selectedWordsDefault: primary.selected,
  selectedGridDefault: grid,
  conclusionGate: "A positive requires a coherent, source-specific 25-word instruction in the fixed row-major output, not merely thematic vocabulary."
};
console.log(JSON.stringify(result, null, 2));
