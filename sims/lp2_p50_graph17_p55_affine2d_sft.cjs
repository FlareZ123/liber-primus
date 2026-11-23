"use strict";

/**
 * LP2 p50 17-cell functional path -> p55 17 printed fragments.
 * Source-spelled 32-by-8 grid coordinates provide one 2-parameter affine
 * GP29 per-fragment inverse. A complete, exactly reversible original-cipher
 * test with 76-rune author-solved GP29 plant. No opcode is attributed to
 * Cicada; an alternate affine or pad-family sweep is intentionally omitted.
 *
 * Windows Node.js 22, read-only: node sims/lp2_p50_graph17_p55_affine2d_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const allPages = read("resources/liber-primus/lp2-transcription.txt");
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);

/** @param {string} s @returns {number[]} */
function numeric(s) {
  return [...s].filter((ch) => runeMap.has(ch))
    .map((ch) => runeMap.get(ch));
}

/** @param {string} s @returns {number} */
function b60(s) {
  assert.equal(s.length, 2);
  const a = grid.alphabet.indexOf(s[0]);
  const b = grid.alphabet.indexOf(s[1]);
  assert.ok(a >= 0 && b >= 0);
  return 60 * a + b;
}
const values = tokens.map(b60);
assert.ok(values.every((v) => v >= 0 && v <= 255));
const startMark = ink.pages.find((p) => p.page === 33)
  .red_spans.find((s) => s.start === 91);
const stopMark = ink.pages.find((p) => p.page === 39)
  .red_spans.find((s) => s.start === 119);
const start = numeric(startMark.runes).reduce((a, b) => a + b, 0);
const stop = numeric(stopMark.runes).reduce((a, b) => a + b, 0);
assert.equal(start, 84);
assert.equal(stop, 47);
const route = [start];
while (route.at(-1) !== stop) {
  const next = values[route.at(-1)];
  assert.ok(!route.includes(next), "Encountered cycle before marked stop");
  route.push(next);
}
assert.deepEqual(route,
  [84,173,117,171,54,156,52,86,111,115,247,192,0,203,68,199,47]);
assert.equal(values[stop], 76);

const page55 = allPages.split(/^\s*%\s*$/m)[54];
assert.ok(page55);
const fragments = (page55.replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || []).map(numeric);
assert.deepEqual(fragments.map((f) => f.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(fragments.flat(),
  corpus.pages.find((p) => p.page === 55).indices);
assert.equal(fragments.flat().length, 76);

/** @param {number} n @returns {number} */
function inv29(n) {
  for (let k = 1; k < 29; k++)
    if ((n * k) % 29 === 1) return k;
  throw new Error("Noninvertible modulo-29 multiplier");
}

/**
 * One source-chosen grid row and column per original printed fragment.
 * Convention frozen: cell index = 8*row + col;
 * C = (col+1)*P + row (mod29).
 * The +1 is required for injectivity when the printed column is zero.
 * @param {number[][]} words
 * @param {boolean} encrypt
 * @returns {number[][]}
 */
function affine(words, encrypt) {
  assert.equal(words.length, route.length);
  return words.map((word, i) => {
    const row = Math.floor(route[i] / 8);
    const col = route[i] % 8;
    const factor = col + 1;
    const inverse = inv29(factor);
    return word.map((r) => encrypt ? ((factor * r + row) % 29) :
      (((r - row + 29) * inverse) % 29));
  });
}
/** @param {number[]} vals @returns {number} */
function ioc(vals) {
  const freq = Array(29).fill(0);
  for (const v of vals) freq[v]++;
  return freq.reduce((s, n) => s+n*(n-1), 0)/(vals.length*(vals.length-1));
}
const solved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved.length, 95);
let offset = 0;
const plaintextPlant = fragments.map((w) => {
  const sample = solved.slice(offset, offset + w.length);
  offset += w.length;
  return sample;
});
assert.equal(offset, 76);
assert.deepEqual(affine(affine(plaintextPlant, true), false), plaintextPlant);

const decoded = affine(fragments, false);
assert.deepEqual(affine(decoded, true), fragments);
assert.equal(decoded.flat().length, 76);
const report = {
  decision: "No original plaintext under the single source-grid-coordinate affine rule",
  p33RedStartGP0:start, p39RedStopGP0:stop,
  sourceRoute:route, printedTableSuccessors:route.map((k) => values[k]),
  page55FragmentLengths:fragments.map((w) => w.length),
  originalRunes:fragments.flat().length,
  originalIoC:ioc(fragments.flat()),
  decodedIoC:ioc(decoded.flat()),
  sourceOriginal:fragments.map((w) => w.map((r) => corpus.translit[r]).join("")).join(" "),
  attemptedNativeGP:decoded.map((w) => w.map((r) => corpus.translit[r]).join("")).join(" "),
  heldoutNativePositive: "76/76 solved p57 GP29 runes exactly recovered",
  sourceLimit: "No original Cicada text specifies an affine decoder or the column+1 multiplier"
};
assert.ok(report.decodedIoC < 0.04);
console.log(JSON.stringify(report, null, 2));
console.log("PASS: source-exact 17-fragment affine inverse and author-GP positive control");
if (require.main === module) {
  module.exports = { main: report, affine, inv29, ioc };
}
