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
const allPages = json("resources/liber-primus/lp2-corpus.json").pages;
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const pages = allPages.filter(p => p.page < 56);
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

// Independent published source partition: the signed 2016 "words/map,
// numbers/direction" clue and the source table's column-1 M7 rank cycle
// select a 2,896-rune pole and a 10,240-rune remainder = forty 256 blocks.
// This must use all 58 physical LP2 pages because the pole contains solved
// terminal-page material, while the first scan uses unsolved pp0–55 alone.
const originalAll = allPages.flatMap(page => page.indices);
let prior = 0;
const pageSpans = allPages.map(page => {
  const start = prior;
  prior += page.indices.length;
  return {page: page.page, start};
});
const marks = [];
for (const p of ink.pages) {
  const page = pageSpans.find(x => x.page === p.page);
  for (const mark of p.large_punctuation || [])
    if (mark[1] === 13) marks.push(page.start + mark[0]);
}
marks.sort((a, b) => a - b);
const boundaries = [0, ...marks, originalAll.length];
const fragments = boundaries.slice(0, -1).map((start, i) => ({
  id: i + 1, length: boundaries[i + 1] - start,
  seq: originalAll.slice(start, boundaries[i + 1])
}));
const ranked = fragments.filter(x => x.length > 0)
  .map(x => ({...x, key: grid[(x.id - 1) * 8 + 1]}))
  .sort((a, b) => a.key - b.key);
assert.equal(marks.length, 31);
assert.equal(ranked.length, 30);
/** @param {number} n */
const m7 = n => {
  if (n === 29) return mod(14 * inverse(25));
  const d = mod(25 * n + 28);
  return d === 0 ? 29 : mod((14 * n + 25) * inverse(d));
};
const seen = new Set();
const orbits = [];
for (let i = 0; i < 30; i++) {
  if (seen.has(i)) continue;
  const cycle = [];
  let x = i;
  while (!seen.has(x)) {
    seen.add(x);
    cycle.push(x);
    x = m7(x);
  }
  orbits.push(cycle);
}
const pole = orbits.find(o => o.includes(7));
const excluded = new Set(pole.map(rank => ranked[rank].id));
const retainedRank = ranked.filter(x => !excluded.has(x.id));
const retainedOrbit = orbits.filter(x => x !== pole).flatMap(o => o.map(rank => ranked[rank]));
const concat = parts => parts.flatMap(x => x.seq);
assert.equal(pole.reduce((n, rank) => n + ranked[rank].length, 0), 2896);
const additional = [];
for (const [name, ordered] of [
  ["rank", retainedRank],
  ["M7_orbit", retainedOrbit],
  ["original", retainedRank.slice().sort((a, b) => a.id - b.id)]
]) {
  const data = concat(ordered);
  assert.equal(data.length, 10240);
  const h = [], g = [], dual = [];
  for (let block = 0; block < 40; block++) {
    const coefficients = data.slice(block * 256, (block + 1) * 256);
    const checkH = zero(remainder(coefficients, H));
    const checkG = zero(remainder(coefficients, G));
    if (checkH) h.push(block);
    if (checkG) g.push(block);
    if (checkH && checkG) dual.push(block);
  }
  assert.deepEqual(h, []);
  assert.deepEqual(g, []);
  additional.push({order: name, count: 40, h, g, dual});
}

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
  M7_selected_40block_gate: additional,
  originalUnknownPlaintextRecovered: false,
}, null, 2));
