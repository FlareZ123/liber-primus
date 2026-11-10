"use strict";

/**
 * Source-exact terminal red near-repeat and marked-triad field selector.
 *
 * The p53/p54 red inscription pair was recognized retrospectively. This SFT
 * tests the concrete source observation, its entire-red comparator family,
 * and the previously known GF(29^2) original-grid root. It does not decode
 * original plaintext or identify an authentic LP2 encryption method.
 *
 * Run: node sims/terminal_red_splice_field_selector_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const unsolved = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const stream = unsolved.flatMap(p => p.indices);
const spans = ink.pages.flatMap(page => (page.red_spans || []).map(span => ({
  page: page.page, start: span.start,
  symbols: [...span.runes].map(r => runeIndex.get(r))
})));
const marked = (page, start) =>
  spans.find(s => s.page === page && s.start === start).symbols;
const p3 = marked(3, 119);
const p39 = marked(39, 119);
const p53 = marked(53, 128);
const p54 = marked(54, 0);

assert.equal(stream.length, 12956);
assert.equal(spans.length, 18);
assert.equal(spans.reduce((n, s) => n + s.symbols.length, 0), 225);
assert.deepEqual(p3, [13, 23, 2]);
assert.deepEqual(p39, [27, 5, 15]);
assert.equal(unsolved.find(p => p.page === 53).indices.length, 179);
assert.equal(p53.length, 51);
assert.equal(p54.length, 9);

const splice = [p3[1], p39[0], p3[2]];
assert.deepEqual(splice, [23, 27, 2]);
assert.deepEqual(p53.slice(15, 20), [23, 27, 2, 24, 10]);
assert.deepEqual(p54.slice(3, 8), [23, 27, 2, 14, 10]);
assert.deepEqual(p53.slice(15, 18), splice);
assert.deepEqual(p54.slice(3, 6), splice);
const displacement = 179 + 3 - (128 + 15);
assert.equal(displacement, 39);

/** Count five-symbol windows differing at no more than one rune. */
function redWindowPairs() {
  const matches = [];
  let comparisons = 0;
  for (let a = 0; a < spans.length; a++) {
    for (let b = a + 1; b < spans.length; b++) {
      const x = spans[a], y = spans[b];
      for (let i = 0; i + 5 <= x.symbols.length; i++) {
        for (let j = 0; j + 5 <= y.symbols.length; j++) {
          comparisons++;
          let same = 0;
          for (let k = 0; k < 5; k++)
            same += Number(x.symbols[i + k] === y.symbols[j + k]);
          if (same >= 4) matches.push({
            pageA: x.page, offsetA: x.start + i,
            pageB: y.page, offsetB: y.start + j, same
          });
        }
      }
    }
  }
  return {comparisons, matches};
}
const redPairs = redWindowPairs();
assert.equal(redPairs.comparisons, 10416);
assert.deepEqual(redPairs.matches, [{
  pageA: 53, offsetA: 143, pageB: 54, offsetB: 3, same: 4
}]);

const tripleSites = [];
for (const page of unsolved) {
  for (let i = 0; i + 3 <= page.indices.length; i++)
    if (splice.every((s, j) => page.indices[i + j] === s))
      tripleSites.push({page: page.page, offset: i});
}
assert.deepEqual(tripleSites, [
  {page: 53, offset: 143}, {page: 54, offset: 3}
]);

/**
 * Source-matched empirical diagnostic: scan all original 60-rune windows
 * with the p53-red 51 / p54-red 9 split. Overlapping windows are dependent.
 */
function empiricalNearRepeats() {
  let windows = 0, hits = 0;
  for (let start = 0; start + 60 <= stream.length; start++) {
    windows++;
    let found = false;
    for (let i = 0; i <= 46 && !found; i++) {
      for (let j = 0; j <= 4 && !found; j++) {
        let same = 0;
        for (let k = 0; k < 5; k++)
          same += Number(stream[start + i + k] ===
            stream[start + 51 + j + k]);
        if (same >= 4) found = true;
      }
    }
    hits += Number(found);
  }
  return {windows, hits, rate: hits / windows};
}
const empirical = empiricalNearRepeats();
assert.deepEqual([empirical.windows, empirical.hits], [12897, 20]);

/** Arithmetic in GF(29)[u] / (u^2-3u-8). */
const mod = n => (n % 29 + 29) % 29;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const mul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
/** @param {number[]} coeffs Descending powers, beginning with printed grid[0]. */
function polyValue(coeffs, z) {
  return coeffs.reduce((v, c) => add(mul(v, z), [mod(c), 0]), [0, 0]);
}
/** @param {number[]} coeffs Descending powers in GF29. */
function valueAndDerivative(coeffs, x) {
  let v = 0, d = 0;
  for (const c of coeffs) {
    d = mod(d * x + v);
    v = mod(v * x + c);
  }
  return [v, d];
}
const gridBytes = grid.pages.flatMap(p => p.bytes);
assert.equal(gridBytes.length, 256);
const coefficients = gridBytes.map(mod);
const u = [0, 1];
const z = [splice[0], splice[1]];
assert.deepEqual(mul(u, u), [8, 3]);
assert.deepEqual(polyValue(coefficients, z), [0, 0]);
assert.deepEqual(valueAndDerivative(coefficients, 24), [0, 0]);
assert.deepEqual(polyValue([1, 18, 11], z), [0, 0]);
assert.deepEqual(valueAndDerivative([27, 5, 15].reverse(), 24), [0, 0]);

let power = [1, 0];
let log = -1;
for (let i = 0; i < 840; i++) {
  if (power[0] === z[0] && power[1] === z[1]) log = i;
  power = mul(power, u);
}
assert.deepEqual(power, [1, 0]);
assert.equal(log, 433);

// The whole three-rune terminal polynomial is NOT the selected table root.
// This guards against silently conflating a source-given triple with a
// cherry-picked two-coordinate interpretation.
const fullTripleAtU = add(z, mul([splice[2], 0], mul(u, u)));
assert.deepEqual(fullTripleAtU, [10, 4]);
assert.deepEqual(polyValue(coefficients, fullTripleAtU), [13, 28]);

console.log(JSON.stringify({
  input: {sourceRedSpans: 18, redRunes: 225, originalRunes: 12956},
  redUniqueNearRepeat: redPairs,
  terminalSplice: {
    markedP3: p3, markedP39: p39, repeated: splice,
    p53Five: p53.slice(15, 20), p54Five: p54.slice(3, 8),
    originalTripleSites: tripleSites, globalLag: displacement
  },
  sourcePolynomial: {
    gridBytes: 256, fieldRelation: "u^2=3u+8",
    root: z, minimalPolynomial: [1, 18, 11], discreteLogBaseU: log,
    PofZ: polyValue(coefficients, z), Pof24AndDerivative: [0, 0],
    quadraticReadingOfFullTriple: fullTripleAtU,
    PofFullTripleQuadratic: polyValue(coefficients, fullTripleAtU)
  },
  empiricalMatchedLengthWindows: empirical,
  uniformIIDFiveWindowProbability: 141 / 29 ** 5,
  warning: "Exploratory source selector and postselected coincidence; no recovered key, original plaintext or authenticated cipher."
}, null, 2));
