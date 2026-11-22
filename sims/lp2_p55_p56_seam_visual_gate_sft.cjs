"use strict";

/**
 * SFT: source-visible p55 -> p56 seam comparison for Director #1551.
 *
 * This test uses only the canonical original-image-derived red-rune and
 * large-punctuation annotation. It does not inspect zero-F output or solved
 * p56 plaintext.
 *
 * Run:
 *   node sims/lp2_p55_p56_seam_visual_gate_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json"),
  "utf8"
));

const pages = new Map(annotations.pages.map(page => [page.page, page]));

// Established nine unsolved visual chapters used throughout repository work.
const unknownChapters = [
  [0, 2],
  [3, 7],
  [8, 14],
  [15, 22],
  [23, 26],
  [27, 32],
  [33, 39],
  [40, 53],
  [54, 55],
];

// Add the two terminal pages as their own visibly titled source units.
const units = [...unknownChapters, [56, 56], [57, 57]];

function hasTerminalRed13(pageNumber) {
  const page = pages.get(pageNumber);
  assert.ok(page);
  return (page.large_punctuation || []).some(mark =>
    mark[0] === page.rune_count && mark[1] === 13 && mark[2] === "red"
  );
}

function hasRedStart(pageNumber) {
  const page = pages.get(pageNumber);
  assert.ok(page);
  return (page.red_spans || []).some(span =>
    span.start === 0 && span.length > 0
  );
}

const seams = [];
for (let i = 0; i + 1 < units.length; i++) {
  const left = units[i][1];
  const right = units[i + 1][0];
  seams.push({
    left,
    right,
    terminalRed13: hasTerminalRed13(left),
    nextStartsRed: hasRedStart(right),
  });
}

assert.equal(seams.length, 10);
assert.ok(seams.every(seam => seam.terminalRed13));
assert.ok(seams.every(seam => seam.nextStartsRed));

const target = seams.find(seam => seam.left === 55 && seam.right === 56);
assert.deepEqual(target, {
  left: 55,
  right: 56,
  terminalRed13: true,
  nextStartsRed: true,
});

const p55 = pages.get(55);
const p56 = pages.get(56);
assert.equal(p55.rune_count, 76);
assert.equal(p56.rune_count, 85);
assert.deepEqual(p55.large_punctuation, [[76, 13, "red"]]);
assert.equal(p56.red_spans[0].start, 0);
assert.equal(p56.red_spans[0].length, 5);
assert.ok(p56.large_punctuation.some(mark =>
  mark[0] === 5 && mark[1] === 13 && mark[2] === "red"
));

console.log(JSON.stringify({
  status: "source-visible seam comparison",
  targetSeam: target,
  visualUnitSeams: seams,
  repeatedBoundarySignatureCount: seams.filter(seam =>
    seam.terminalRed13 && seam.nextStartsRed
  ).length,
  decision:
    "p55->p56 is a genuine visual chapter boundary, but its terminal-red13 " +
    "then red-start-rubric signature is shared by all compared visual-unit " +
    "seams. That source grammar does not uniquely select a zero-F mode switch.",
}, null, 2));
