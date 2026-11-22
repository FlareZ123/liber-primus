"use strict";

/**
 * Source-motivated 100x29 circumference / Mobius-inspired whole-token spiral gate.
 * Input: original LP2 transcription + original apostrophe annotations.
 * Tests 32 concentric-perimeter spiral descriptions and the 10 direct matrix
 * descriptions from apostrophe_29x100_wordtranspose_sft.cjs (42 total).
 * A deterministic 5,000-shuffle max-statistic null controls the full route family.
 *
 * Run: node sims/apostrophe_29x100_mobius_spiral_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const ann = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const raw = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const splitBefore = new Set(ann.apostrophes_before_rune);
const tokens = [];
let runeCount = 0;
let word = "";

function flush() {
  if (!word) return;
  if (splitBefore.has(runeCount - 1)) {
    assert.ok(word.length === 3 || word.length === 4);
    tokens.push(word.length - 1, 1);
  } else {
    tokens.push(word.length);
  }
  word = "";
}

for (const c of raw) {
  const n = c.codePointAt(0);
  if (n >= 0x16a0 && n <= 0x16ff) {
    runeCount++;
    word += c;
  } else if (c === "/" || c === "%" || /\s/u.test(c)) {
    // Printed page and line wraps are layout, not word separators.
  } else {
    flush();
  }
}
flush();

assert.equal(runeCount, 12956);
assert.equal(tokens.length, 2900);
assert.equal(tokens.filter((n) => n === 1).length, 87);
assert.equal(splitBefore.size, 4);

const category = (n) => n <= 2 ? 0 : n <= 5 ? 1 : 2;

function chiSquared(values) {
  const matrix = Array(9).fill(0);
  const rows = Array(3).fill(0);
  const cols = Array(3).fill(0);
  for (let i = 1; i < values.length; i++) {
    const a = category(values[i - 1]);
    const b = category(values[i]);
    matrix[3 * a + b]++;
    rows[a]++;
    cols[b]++;
  }
  const n = values.length - 1;
  let score = 0;
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const expected = rows[a] * cols[b] / n;
      score += (matrix[3 * a + b] - expected) ** 2 / expected;
    }
  }
  return score;
}

function chiPermutation(categories, permutation) {
  const matrix = Array(9).fill(0);
  const rows = Array(3).fill(0);
  const cols = Array(3).fill(0);
  for (let i = 1; i < permutation.length; i++) {
    const a = categories[permutation[i - 1]];
    const b = categories[permutation[i]];
    matrix[3 * a + b]++;
    rows[a]++;
    cols[b]++;
  }
  const n = permutation.length - 1;
  let score = 0;
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const expected = rows[a] * cols[b] / n;
      score += (matrix[3 * a + b] - expected) ** 2 / expected;
    }
  }
  return score;
}

function inverse(permutation) {
  const out = Array(permutation.length);
  for (let i = 0; i < permutation.length; i++) out[permutation[i]] = i;
  assert.equal(new Set(out).size, permutation.length);
  return out;
}

function ringCells(height, width, top, bottom, left, right) {
  const cells = [];
  for (let c = left; c <= right; c++) cells.push(top * width + c);
  for (let r = top + 1; r <= bottom; r++) cells.push(r * width + right);
  if (bottom > top) {
    for (let c = right - 1; c >= left; c--) cells.push(bottom * width + c);
  }
  if (right > left) {
    for (let r = bottom - 1; r > top; r--) cells.push(r * width + left);
  }
  return cells;
}

/**
 * Read each concentric rectangular perimeter. The alternating variant reverses
 * direction on every successive ring: a deliberately finite Mobius-inspired
 * twist, not a claim that the source specifies a unique topological embedding.
 */
function spiralPermutation(height, width, corner, direction, alternateRingDirection) {
  const out = [];
  for (let layer = 0; layer < Math.ceil(Math.min(height, width) / 2); layer++) {
    const top = layer;
    const bottom = height - 1 - layer;
    const left = layer;
    const right = width - 1 - layer;
    if (top > bottom || left > right) break;
    const ring = ringCells(height, width, top, bottom, left, right);
    let start = 0;
    if (corner === 1) start = ring.indexOf(top * width + right);
    if (corner === 2) start = ring.indexOf(bottom * width + right);
    if (corner === 3) start = ring.indexOf(bottom * width + left);
    const step = alternateRingDirection && layer % 2 ? -direction : direction;
    for (let j = 0; j < ring.length; j++) {
      const ix = (start + step * j % ring.length + ring.length) % ring.length;
      out.push(ring[ix]);
    }
  }
  assert.equal(out.length, height * width);
  assert.equal(new Set(out).size, height * width);
  return out;
}

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
  } else {
    throw new Error("Unsupported matrix route");
  }
  assert.equal(new Set(p).size, tokens.length);
  return p;
}

const routes = [];
const corners = ["TL", "TR", "BR", "BL"];
for (const [height, width, shape] of [[100, 29, "100x29"], [29, 100, "29x100"]]) {
  for (let corner = 0; corner < 4; corner++) {
    for (const direction of [1, -1]) {
      for (const alternate of [false, true]) {
        routes.push({
          id: shape + "/" + corners[corner] + "/" + (direction === 1 ? "CW" : "CCW") + "/alternate-" + alternate,
          permutation: spiralPermutation(height, width, corner, direction, alternate),
          family: "concentric-perimeter spiral"
        });
      }
    }
  }
}
for (const width of [29, 100]) {
  const height = tokens.length / width;
  for (const style of ["column", "columnSnake", "rowSnake"]) {
    const permutation = matrixRoute(width, style);
    const id = String(height) + "x" + String(width) + "/" + style;
    routes.push({ id, permutation, family: "direct matrix" });
    if (style !== "rowSnake") {
      routes.push({ id: id + "/inverse", permutation: inverse(permutation), family: "direct matrix" });
    }
  }
}
assert.equal(routes.length, 42);
assert.equal(new Set(routes.map((x) => x.id)).size, 42);

const originalChi = chiSquared(tokens);
const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u)
  .filter((x) => /^[0-9A-S]+$/u.test(x))
  .slice(0, 2900)
  .map((x) => x.length);
assert.equal(latin.length, 2900);
const latinChi = chiSquared(latin);

const measured = routes.map((route) => {
  const decoded = route.permutation.map((i) => tokens[i]);
  const nativePlant = inverse(route.permutation).map((i) => latin[i]);
  const recoveredPlant = route.permutation.map((i) => nativePlant[i]);
  assert.deepEqual(recoveredPlant, latin, route.id + " native positive control");
  return {
    route: route.id,
    family: route.family,
    chiSquared: chiSquared(decoded),
    positiveControlRecoveredWords: recoveredPlant.length,
    positiveControlChiSquared: chiSquared(recoveredPlant)
  };
}).sort((a, b) => b.chiSquared - a.chiSquared);

const bestSpiral = measured.find((x) => x.family === "concentric-perimeter spiral");
const bestDirect = measured.find((x) => x.family === "direct matrix");
const best = measured[0];
const categories = tokens.map(category);
let seed = 0x20261116;
function random01() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const sample = categories.slice();
const maxima = [];
const samples = 5000;
for (let s = 0; s < samples; s++) {
  for (let i = sample.length - 1; i > 0; i--) {
    const j = Math.floor(random01() * (i + 1));
    const temp = sample[i];
    sample[i] = sample[j];
    sample[j] = temp;
  }
  let maximum = 0;
  for (const route of routes) {
    const score = chiPermutation(sample, route.permutation);
    if (score > maximum) maximum = score;
  }
  maxima.push(maximum);
}
maxima.sort((a, b) => a - b);
const exceedances = maxima.filter((x) => x >= best.chiSquared).length;
const pFamilywise = (exceedances + 1) / (samples + 1);
const quantile = (p) => maxima[Math.floor(samples * p) - 1];

assert.ok(Math.abs(originalChi - 4.015945354608834) < 1e-9);
assert.ok(Math.abs(latinChi - 132.26409762064623) < 1e-9);
assert.equal(best.route, "100x29/TR/CW/alternate-true");
assert.ok(Math.abs(best.chiSquared - 11.018356173033435) < 1e-9);
assert.equal(exceedances, 1185);
assert.ok(Math.abs(pFamilywise - 0.23715256948610278) < 1e-12);
assert.equal(measured.filter((x) => x.positiveControlRecoveredWords === 2900).length, 42);

console.log(JSON.stringify({
  classification: "bounded original-cipher negative; no plaintext or key recovered",
  source: {
    transcription: "resources/lp2-transcription.txt",
    apostropheAnnotations: "resources/liber-primus/lp2-quote-punctuation-spans.json",
    nativeControl: "resources/control/latin-vulgate-gp-wholewords.txt"
  },
  originalRunes: runeCount,
  originalCanonicalWords: 2896,
  apostropheSplitTokens: tokens.length,
  singletonTokens: tokens.filter((x) => x === 1).length,
  matrixRouteDescriptions: 10,
  spiralRouteDescriptions: 32,
  totalRouteDescriptions: routes.length,
  originalSplitWordLengthChiSquared: originalChi,
  bestDirectRoute: bestDirect,
  bestSpiralRoute: bestSpiral,
  bestOverallRoute: best,
  nativeLatinControlChiSquared: latinChi,
  positiveControls: "all 42 inverse-permutation plants recover all 2900 Latin word lengths exactly",
  familywiseNull: {
    method: "deterministic Fisher-Yates shuffles of the three word-length categories, preserving category counts; maximum statistic over all 42 route descriptions",
    seed: "0x20261116",
    samples,
    exceedances,
    pFamilywise,
    q90: quantile(0.90),
    q95: quantile(0.95),
    q99: quantile(0.99)
  },
  results: measured
}, null, 2));
