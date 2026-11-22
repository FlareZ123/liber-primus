"use strict";

/**
 * Independent source-sized 32x8 perimeter -> LP2 physical p55
 * predecessor-differential GP29 decoder gate.
 *
 * Hypothesis: C_i = C_(i-1) + P_i + sign*K_i (mod 29), with K supplied
 * by one physical 76-cell perimeter of the printed 256-byte table.
 * Clockwise starts at the top-left printed cell; reverse reverses this
 * fixed sequence. No phase fitting, p55 word clock, or skipped symbols.
 *
 * Run from repository root: node sims/p55_grid_ring76_differential_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

/** @param {number} x */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert(rows.every((r) => r.length === 8));

const xy = [];
for (let j = 0; j < 8; j++) xy.push([0, j]);
for (let i = 1; i < 32; i++) xy.push([i, 7]);
for (let j = 6; j >= 0; j--) xy.push([31, j]);
for (let i = 30; i >= 1; i--) xy.push([i, 0]);
assert.equal(xy.length, 76);
assert.equal(new Set(xy.map(([i, j]) => i * 8 + j)).size, 76);
const ring = xy.map(([i, j]) => rows[i][j] % 29);

const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p54 = corpus.pages.find((p) => p.page === 54).indices;
assert.equal(p55.length, 76);

/**
 * Source-native GP transliteration: longest GP groups first; conventional
 * K/V/Z/Q normalization follows the shared manuscript language controls.
 * @param {string} input
 * @returns {number[]}
 */
function toGP(input) {
  const rank = corpus.translit.map((v, i) => ({v, i}))
    .sort((a, b) => b.v.length - a.v.length);
  const cleaned = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  const output = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const hit = rank.find((r) => word.startsWith(r.v, i));
      if (hit) {
        output.push(hit.i);
        i += hit.v.length;
      } else {
        i++;
      }
    }
  }
  return output;
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const n of values) counts[n]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) /
    (values.length * (values.length - 1));
}

const native = toGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(native.length, 218800);
const cut = Math.floor(native.length * 0.75);
const tri = new Float64Array(29 ** 3).fill(0.005);
const bi = new Float64Array(29 ** 2).fill(0.145);
for (let i = 2; i < cut; i++) {
  const code = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
  tri[code]++;
  bi[Math.floor(code / 29)]++;
}

/** @param {number[]} symbols */
function score(symbols) {
  let sum = 0;
  for (let i = 2; i < symbols.length; i++) {
    const code = symbols[i - 2] * 841 + symbols[i - 1] * 29 +
      symbols[i];
    sum += Math.log(tri[code] / bi[Math.floor(code / 29)]);
  }
  return sum / (symbols.length - 2);
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} initial
 * @param {number} sign
 * @returns {number[]}
 */
function decode(ciphertext, key, initial, sign) {
  return ciphertext.map((c, i) => mod(c -
    (i ? ciphertext[i - 1] : initial) + sign * key[i]));
}

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} initial
 * @param {number} sign
 * @returns {number[]}
 */
function encode(plaintext, key, initial, sign) {
  const out = [];
  let previous = initial;
  for (let i = 0; i < plaintext.length; i++) {
    const c = mod(previous + plaintext[i] - sign * key[i]);
    out.push(c);
    previous = c;
  }
  return out;
}

const planted = native.slice(cut, cut + 76);
const plantCiphertext = encode(planted, ring, 0, -1);
assert.deepEqual(decode(plantCiphertext, ring, 0, -1), planted);
assert.deepEqual(encode(decode(plantCiphertext, ring, 0, -1),
  ring, 0, -1), plantCiphertext);

const referenceScores = [];
for (let i = cut; i + 76 < native.length; i += 76) {
  referenceScores.push(score(native.slice(i, i + 76)));
}
referenceScores.sort((a, b) => a - b);
assert.equal(referenceScores.length, 719);

const variants = [];
for (const predecessor of ["zero", "p54-last"]) {
  const initial = predecessor === "zero" ? 0 : p54.at(-1);
  for (const orientation of ["clockwise", "reverse"]) {
    const key = orientation === "clockwise" ? ring : ring.slice().reverse();
    for (const sign of [-1, 1]) {
      const decoded = decode(p55, key, initial, sign);
      assert.deepEqual(encode(decoded, key, initial, sign), p55);
      variants.push({
        predecessor, orientation, sign,
        score: score(decoded),
        ioc: ioc(decoded),
        head: decoded.slice(0, 24)
          .map((n) => corpus.translit[n]).join("-")
      });
    }
  }
}
const best = variants.reduce((a, b) => a.score > b.score ? a : b);
assert.equal(best.predecessor, "p54-last");
assert.equal(best.orientation, "clockwise");
assert.equal(best.sign, 1);
assert(Math.abs(best.score - (-5.219586530935149)) < 1e-10);
assert(best.score < referenceScores[0]);

console.log(JSON.stringify({
  source: {grid: [32, 8], ring: 76, page55: p55.length},
  hypothesis: "direct modulo-29 running-sum feedback using printed table ring",
  originalRawScore: score(p55),
  originalDifferenceScore: score(decode(p55, Array(76).fill(0), 0, 1)),
  nativeControls: {
    count: referenceScores.length,
    min: referenceScores[0],
    median: referenceScores[Math.floor(referenceScores.length / 2)],
    max: referenceScores.at(-1)
  },
  variants, best,
  sourceNativePlant: {symbols: planted.length, roundtrip: true},
  decision: "No original plain-language recovery under eight source-fixed variants."
}, null, 2));
