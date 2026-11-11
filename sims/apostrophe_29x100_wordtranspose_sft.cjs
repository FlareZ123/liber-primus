"use strict";

/**
 * Source-constrained 100x29 original-LP2 word-transposition challenge.
 * Four original apostrophes split one word each, producing 2,900 tokens.
 * Tests both rectangle orientations, straight/alternating column traversal,
 * row boustrophedon, and exact inverse permutations.
 *
 * SFT: node sims/apostrophe_29x100_wordtranspose_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const ann = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const raw = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const splitBefore = new Set(ann.apostrophes_before_rune);
const words = [];
const tokens = [];
let count = 0;
let word = "";

function flush() {
  if (!word) return;
  words.push(word.length);
  if (splitBefore.has(count - 1)) {
    assert.ok(word.length === 3 || word.length === 4);
    tokens.push(word.length - 1, 1);
  } else tokens.push(word.length);
  word = "";
}

for (const c of raw) {
  const n = c.codePointAt(0);
  if (n >= 0x16a0 && n <= 0x16ff) {
    count++;
    word += c;
  } else if (c === "/" || c === "%" || /\s/u.test(c)) {
    // Printed page and line wraps are not word separators.
  } else flush();
}
flush();
assert.equal(count, 12956);
assert.equal(words.length, 2896);
assert.equal(tokens.length, 2900);
assert.equal(tokens.filter((n) => n === 1).length, 87);
assert.equal(splitBefore.size, 4);

const category = (n) => n <= 2 ? 0 : n <= 5 ? 1 : 2;
/** Adjacent GP rune-word length category dependence, 3x3 Pearson statistic. */
function chiSquared(lengths) {
  const matrix = Array(9).fill(0);
  const rows = Array(3).fill(0);
  const cols = Array(3).fill(0);
  for (let i = 1; i < lengths.length; i++) {
    const a = category(lengths[i - 1]);
    const b = category(lengths[i]);
    matrix[3 * a + b]++;
    rows[a]++;
    cols[b]++;
  }
  const n = lengths.length - 1;
  return matrix.reduce((sum, actual, ix) => {
    const expected = rows[Math.floor(ix / 3)] * cols[ix % 3] / n;
    return sum + (actual - expected) ** 2 / expected;
  }, 0);
}

/** Inverse permutation of a complete index permutation. */
function inverse(perm) {
  const out = Array(perm.length);
  for (let i = 0; i < perm.length; i++) out[perm[i]] = i;
  assert.equal(new Set(out).size, perm.length);
  return out;
}
const apply = (values, perm) => perm.map((i) => values[i]);

/** A 29- or 100-column matrix, with printed order interpreted row-major. */
function matrixRoute(width, style) {
  const height = tokens.length / width;
  assert.ok(Number.isInteger(height));
  const p = [];
  if (style === "column" || style === "columnSnake") {
    for (let c = 0; c < width; c++) {
      for (let j = 0; j < height; j++) {
        const r = style === "columnSnake" && c % 2 ? height - 1 - j : j;
        p.push(r * width + c);
      }
    }
  } else if (style === "rowSnake") {
    for (let r = 0; r < height; r++) {
      for (let j = 0; j < width; j++) {
        const c = r % 2 ? width - 1 - j : j;
        p.push(r * width + c);
      }
    }
  } else throw new Error("Unsupported route style");
  assert.equal(new Set(p).size, tokens.length);
  return p;
}

const routes = [];
for (const width of [29, 100]) {
  const height = tokens.length / width;
  for (const style of ["column", "columnSnake", "rowSnake"]) {
    const perm = matrixRoute(width, style);
    const id = String(height) + "x" + String(width) + "/" + style;
    routes.push({ id, perm });
    if (style !== "rowSnake")
      routes.push({ id: id + "/inverse", perm: inverse(perm) });
  }
}
assert.equal(routes.length, 10);

const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u)
  .filter((x) => /^[0-9A-S]+$/u.test(x))
  .slice(0, 2900)
  .map((x) => x.length);
assert.equal(latin.length, 2900);

const originalChi = chiSquared(tokens);
const latinChi = chiSquared(latin);
const measurements = routes.map(({ id, perm }) => {
  const decoded = apply(tokens, perm);
  const nativePlant = apply(latin, inverse(perm));
  const recoveredPlant = apply(nativePlant, perm);
  assert.deepEqual(recoveredPlant, latin, id + " source-native inverse");
  return {
    route: id,
    originalChi: chiSquared(decoded),
    nativeLatinRecoveredChi: chiSquared(recoveredPlant),
    exactNativeWordRecovery: recoveredPlant.length
  };
}).sort((a, b) => b.originalChi - a.originalChi);

assert.ok(Math.abs(chiSquared(words) - 3.949446088360591) < 1e-9);
assert.ok(Math.abs(originalChi - 4.015945354608834) < 1e-9);
assert.ok(Math.abs(measurements[0].originalChi - 6.761394672819174) < 1e-9);
assert.ok(Math.abs(latinChi - 132.26409762064623) < 1e-9);

console.log(JSON.stringify({
  classification: "original source 29x100 word-order negative, not a decryption",
  nOriginalRunes: count,
  nCanonicalWords: words.length,
  originalApostropheRuneOffsets: ann.apostrophes_before_rune,
  nApostropheSplitTokens: tokens.length,
  originalSplitSingletons: tokens.filter((x) => x === 1).length,
  originalCanonicalChi: chiSquared(words),
  originalSplitChi: originalChi,
  sourceNativeLatinChi: latinChi,
  sourceNativeControl: "each route exactly recovers all 2900 planted Latin word lengths",
  routeCount: measurements.length,
  results: measurements,
  interpretation: "No natural 29x100/100x29 reversal restores native-like consecutive word-length association; keyed routes, altered boundaries, and non-GP registers remain unresolved."
}, null, 2));
