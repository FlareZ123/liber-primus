"use strict";

/**
 * Original LP2 source gate: can any contiguous 256-GP-rune segment carry
 * the same dual-GF29 polynomial codeword as the original printed 256-byte grid?
 *
 * H from signed 2013 BASE29 3301=3QO, G from the LP2 p39 red triad;
 * ascending source coefficients become descending [24,26,3], [15,5,27].
 *
 * Exact complete 12,701-window sliding scan with unchanged rune sequence.
 * No fitted coefficient, key, phase, language score, or window length.
 * Run: node sims/lp2_256window_dual_factor_codeword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const grid = json("resources/liber-primus/lp2-grid-256.json").bytes;
const pages = json("resources/liber-primus/lp2-corpus.json").pages.filter(p => p.page < 56);
const unknown = pages.flatMap(p => p.indices);
const H = [24, 26, 3];
const G = [15, 5, 27];
const P = 29;
/** @param {number} n */
const mod = n => (n % P + P) % P;
/** @param {number} n */
function inverse(n) {
  for (let k = 1; k < P; k++) if (mod(n * k) === 1) return k;
  throw new Error("Zero coefficient");
}
/**
 * Exactly the same original convention as the published grid factors.
 * @param {number[]} coeff Descending polynomial coefficients
 * @param {number[]} factor Descending degree-two factor
 * @returns {number[]}
 */
function remainder(coeff, factor) {
  const a = coeff.map(mod);
  const leadingInverse = inverse(factor[0]);
  for (let i = 0; i < a.length - 2; i++) {
    const q = mod(a[i] * leadingInverse);
    if (q === 0) continue;
    a[i] = 0;
    a[i + 1] = mod(a[i + 1] - q * factor[1]);
    a[i + 2] = mod(a[i + 2] - q * factor[2]);
  }
  return a.slice(-2);
}
/** @param {number[]} a */
const zero = a => a.every(x => x === 0);
/** @param {number[]} stream */
function scan(stream) {
  const h = [], g = [], both = [], reversed = [];
  for (let offset = 0; offset + 256 <= stream.length; offset++) {
    const chunk = stream.slice(offset, offset + 256);
    const hpass = zero(remainder(chunk, H));
    const gpass = zero(remainder(chunk, G));
    if (hpass) h.push(offset);
    if (gpass) g.push(offset);
    if (hpass && gpass) both.push(offset);
    // Wrong coefficient orientation makes a separate, predeclared control.
    if (zero(remainder(chunk, H.slice().reverse())) &&
        zero(remainder(chunk, G.slice().reverse()))) reversed.push(offset);
  }
  return {h, g, both, reversed};
}

assert.equal(grid.length, 256);
assert.equal(unknown.length, 12956);
assert.equal(createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.deepEqual(remainder(grid, H), [0, 0]);
assert.deepEqual(remainder(grid, G), [0, 0]);
assert.ok(!zero(remainder(grid, H.slice().reverse())));

const original = scan(unknown);
assert.equal(unknown.length - 255, 12701);
assert.equal(original.h.length, 22);
assert.equal(original.g.length, 11);
assert.deepEqual(original.both, []);
assert.deepEqual(original.reversed, []);

// A deterministic exact original-codeword plant proves both that this scan
// includes unaligned windows and that it would detect a true dual match.
const filler = Array.from({length: 700}, (_, i) => (i * 13 + (i * i) % 29) % 29);
const planted = filler.slice(0, 111).concat(grid.map(mod), filler.slice(111));
const control = scan(planted);
assert.ok(control.both.includes(111));

let cursor = 0;
const starts = pages.map(p => {
  const start = cursor;
  cursor += p.indices.length;
  return {page: p.page, start, end: cursor};
});
/** @param {number} offset */
const locate = offset => starts.find(p => p.start <= offset && offset < p.end).page;
console.log(JSON.stringify({
  originalSource: "LP2 original p0-55 runes, p49-51 256 numerical cells",
  originalRuneLength: unknown.length,
  fixedWindowLength: grid.length,
  windowsExamined: 12701,
  sourceTableRemainders: {H: remainder(grid, H), G: remainder(grid, G)},
  originalIndividualPasses: {H: original.h.length, G: original.g.length},
  originalDualPasses: original.both,
  reversedDualPasses: original.reversed,
  representativeSinglePasses: {
    H: original.h.slice(0, 6).map(x => ({offset: x, page: locate(x)})),
    G: original.g.slice(0, 6).map(x => ({offset: x, page: locate(x)}))
  },
  iidUniformExpectedDualHits: 12701 / (29 ** 4),
  positiveControlInsertedAt: 111,
  positiveControlPassed: control.both.includes(111),
  originalUnknownPlaintextRecovered: false,
}, null, 2));
