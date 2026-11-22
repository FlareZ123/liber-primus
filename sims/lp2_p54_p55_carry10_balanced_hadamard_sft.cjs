"use strict";
/**
 * SFT: Physical p54->p55 10-rune word carry closes p55's 43/33 word-interior
 * partition into two complete 43-rune tapes. Tests one symmetric, invertible
 * Hadamard mixing law on all 86 original runes, plus a native solved-p57 plant.
 *
 * Original corpus, original image-preserving transcript, source-only lengths.
 * No fitted key, no relaxed segmentation, no filesystem writes.
 * Node 22 CommonJS built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const c = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%");
const glyph = new Map(c.runes.map((r, i) => [r, i]));
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const f = new Uint32Array(29);
  for (const v of x) f[v] += 1;
  return f.reduce((n, v) => n + v * (v - 1), 0) / (x.length * (x.length - 1));
}
/** / are visual line breaks, unlike literal '-' and '.' word boundaries. */
function segments(s) {
  return s.split(/[-.]/).map(part => Array.from(part, ch => glyph.get(ch))
    .filter(index => index !== undefined)).filter(a => a.length);
}
function visiblePage(n) {
  const textIndex = n < 50 ? n : n - 1; // runeless physical p50 has no '%' chunk
  const s = segments(pages[textIndex]);
  assert.deepEqual(s.flat(), c.pages[n].indices);
  return s;
}
assert.equal(c.pages[54].runic_count, 232);
assert.equal(c.pages[55].runic_count, 76);
assert.equal(c.pages[57].runic_count, 95);
const last = visiblePage(54).at(-1);
const p55seg = visiblePage(55);
const widths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.deepEqual(p55seg.map(x => x.length), widths);
assert.equal(last.length, 10);
assert.equal(p55seg[0].length, 1);
assert.equal(p55seg[0][0], 21); // carried NG, originally on physical p55
const p55 = c.pages[55].indices;
const innerPositions = [];
const outerPositions = [];
for (let at = 0, w = 0; w < p55seg.length; w += 1) {
  const n = p55seg[w].length;
  for (let j = 0; j < n; j += 1) {
    (j > 0 && j < n - 1 ? innerPositions : outerPositions).push(at + j);
  }
  at += n;
}
assert.equal(innerPositions.length, 43);
assert.equal(outerPositions.length, 33);
const inner = innerPositions.map(i => p55[i]);
const outside = last.concat(outerPositions.map(i => p55[i]));
assert.equal(outside.length, 43);
assert.equal(inner.length + outside.length, 86);
assert.deepEqual(last, c.pages[54].indices.slice(-10));
assert.deepEqual([last.at(-1), p55[0]], [26, 21]); // final Y -> NG across page break

/**
 * Partitioned Hadamard for original 43+43 tapes.
 * Forward [A+B,A-B]; inverse 15*[A+B,A-B], because 2*15=1 mod29.
 * @param {number[]} a
 * @param {number[]} b
 * @param {boolean} inverse
 * @returns {[number[],number[]]}
 */
function mix(a, b, inverse) {
  assert.equal(a.length, 43);
  assert.equal(b.length, 43);
  const coefficient = inverse ? 15 : 1;
  return [a.map((v, i) => mod(coefficient * (v + b[i]))),
    a.map((v, i) => mod(coefficient * (v - b[i])))];
}
/** Restore changed GP29 runes at the exact original p54 seam + p55 positions. */
function physical(a, b) {
  const all = Array.from({ length: 86 }, () => -1);
  for (let i = 0; i < 10; i += 1) all[i] = b[i];
  for (let i = 0; i < 33; i += 1) all[10 + outerPositions[i]] = b[10 + i];
  for (let i = 0; i < 43; i += 1) all[10 + innerPositions[i]] = a[i];
  assert.ok(all.every(x => x >= 0 && x < 29));
  return all;
}
const original = last.concat(p55);
assert.deepEqual(physical(inner, outside), original);
const tested = [];
for (const inverse of [false, true]) {
  const [a, b] = mix(inner, outside, inverse);
  const decoded = physical(a, b);
  const [replayA, replayB] = mix(a, b, !inverse);
  assert.deepEqual(physical(replayA, replayB), original);
  const segmentation = [];
  let at = 10;
  for (const n of widths) {
    segmentation.push(decoded.slice(at, at + n).map(v => c.translit[v]).join(""));
    at += n;
  }
  assert.equal(at, 86);
  tested.push({
    operation: inverse ? "H-inverse (15 times each)" : "H-forward",
    originalRuneCount: decoded.length,
    page55RuneCount: decoded.length - 10,
    iocWhole86: Number(ioc(decoded).toFixed(12)),
    p55PrintedWords: segmentation,
    firstTenDecoded: decoded.slice(0, 10).map(v => c.translit[v]).join("-")
  });
}
assert.ok(tested.every(x => x.iocWhole86 < .04));
// A real solved native-GP passage in an 86-position source-shaped synthetic plant.
const planted = c.pages[57].indices.slice(0, 86);
const [cipherA, cipherB] = mix(planted.slice(0, 43), planted.slice(43), false);
const [plainA, plainB] = mix(cipherA, cipherB, true);
assert.deepEqual(plainA.concat(plainB), planted);
assert.deepEqual(mix(plainA, plainB, false), [cipherA, cipherB]);

// Source-only competing-original-page check (physical adjacency, p50 excluded).
const pageCensus = [];
for (let p = 1; p <= 55; p += 1) {
  if (p === 50 || p === 51) continue;
  const s = visiblePage(p), previous = visiblePage(p - 1);
  const insiders = s.reduce((n, w) => n + Math.max(0, w.length - 2), 0);
  const outsiders = s.reduce((n, w) => n + Math.min(w.length, 2), 0);
  const carry = previous.at(-1).length;
  pageCensus.push({ page: p, delta: insiders - outsiders, previousLast: carry });
}
assert.equal(pageCensus.length, 53);
assert.deepEqual(pageCensus.filter(x => x.delta === x.previousLast),
  [{ page: 55, delta: 10, previousLast: 10 }]);

console.log(JSON.stringify({
  result: "New physically continuous 10+33=43 paired-stream geometry; simple full-state H/H^-1 does not reveal plaintext",
  exactSource: {
    p54Runes: 232, p55Runes: 76, previousFinalFragment: 10,
    p55Interior: 43, p55Exterior: 33, completedTapes: [43, 43],
    originalNativePhysicalReconstruction: 86,
    physicallyAdjacentSourceControlPages: 53,
    otherPagesMatchingExactDeltaAndPriorLastFragment: 0
  },
  originalGP86IoC: ioc(original),
  originalOutputs: tested,
  realSolvedP57NativePlantRecovered: "86/86",
  fullSourceRoundtrip: "86/86 for both nontrivial directions",
  verifiedDecoder: false,
  recoveredUnknownGPPlaintext: 0
}, null, 2));