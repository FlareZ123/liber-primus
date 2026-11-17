'use strict';

/**
 * LP2 original-source fixed-window H*G codeword challenge.
 *
 * Conditional model: interpret each original GP29 rune as a coefficient of a
 * descending GF(29) polynomial. Every consecutive 256-rune source block
 * beginning at an original physical page boundary is then claimed to share
 * the exact four parity checks of the original 256-cell numeric table:
 *
 *   G=(X-24)^2 ; H=X^2+18X+11.
 *
 * No key, fitted offset, English filter or transcript-reserialization occurs.
 * A source-derived codeword plant and a corrupted negative verify the gate.
 *
 * Windows starting at physical p55 are excluded because only 76 unknown runes
 * remain. p50 has zero runes, so it contributes no start. Page boundaries use
 * original p0..p55 GP29 offsets and preserve original p49/p51 adjacency.
 *
 * Run: node sims/lp2_grid_hg_pageblock_syndrome_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pathLib = require('node:path');

const root = pathLib.resolve(__dirname, '..');
/** @param {string} rel @returns {any} */
function readJSON(rel) {
  return JSON.parse(fs.readFileSync(pathLib.join(root, rel), 'utf8'));
}
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/**
 * Horner value and formal derivative at X=24, descending coefficients.
 * @param {number[]} coefficients
 * @returns {[number, number]}
 */
function gSyndrome(coefficients) {
  let value = 0;
  let derivative = 0;
  for (const x of coefficients) {
    derivative = mod(24 * derivative + value);
    value = mod(24 * value + x);
  }
  return [value, derivative];
}

/**
 * Return the degree-1 GF29 remainder on H(X)=X^2+18X+11.
 * @param {number[]} coefficients Descending
 * @returns {[number, number]}
 */
function hSyndrome(coefficients) {
  const state = coefficients.map(mod);
  for (let k = 0; k < state.length - 2; k++) {
    const leading = state[k];
    state[k] = 0;
    state[k + 1] = mod(state[k + 1] - 18 * leading);
    state[k + 2] = mod(state[k + 2] - 11 * leading);
  }
  return [state.at(-2), state.at(-1)];
}

/**
 * Multiply GF29 polynomials in descending coefficient order.
 * @param {number[]} lhs
 * @param {number[]} rhs
 * @returns {number[]}
 */
function multiply(lhs, rhs) {
  const result = Array(lhs.length + rhs.length - 1).fill(0);
  for (let i = 0; i < lhs.length; i++) {
    for (let j = 0; j < rhs.length; j++) {
      result[i + j] = mod(result[i + j] + lhs[i] * rhs[j]);
    }
  }
  return result;
}
const zero = (x) => x.every((v) => v === 0);
const table = grid.pages.flatMap((part) => part.bytes);
assert.equal(table.length, 256);
assert.deepEqual(gSyndrome(table), [0, 0]);
assert.deepEqual(hSyndrome(table), [0, 0]);

// Complete positive codeword plant under both table factors.
const plantPayload = Array.from({length: 252}, (_, i) => mod(7 + i * i + 11 * i));
const sourceCode = multiply(multiply(plantPayload, [1, 10, 25]), [1, 18, 11]);
assert.equal(sourceCode.length, 256);
assert.deepEqual(gSyndrome(sourceCode), [0, 0]);
assert.deepEqual(hSyndrome(sourceCode), [0, 0]);
const corrupted = sourceCode.slice();
corrupted[127] = mod(corrupted[127] + 1);
assert.ok(!zero(gSyndrome(corrupted)) || !zero(hSyndrome(corrupted)));

const originalPages = corpus.pages.filter((p) => p.page < 56);
assert.equal(originalPages.length, 56);
const original = originalPages.flatMap((p) => p.indices);
assert.equal(original.length, 12956);
const pageStarts = new Map();
let offset = 0;
for (const page of originalPages) {
  if (page.indices.length > 0) pageStarts.set(page.page, offset);
  offset += page.indices.length;
}
assert.equal(offset, original.length);
assert.equal(pageStarts.has(50), false);
const pageWindows = [];
for (const [page, at] of pageStarts.entries()) {
  if (original.length - at < 256) continue;
  const block = original.slice(at, at + 256);
  pageWindows.push({
    page, at, G: gSyndrome(block), H: hSyndrome(block)
  });
}
assert.equal(pageWindows.length, 54);
const p24Zero = pageWindows.filter((r) => r.G[0] === 0).map((r) => r.page);
const gBoth = pageWindows.filter((r) => zero(r.G)).map((r) => r.page);
const hBoth = pageWindows.filter((r) => zero(r.H)).map((r) => r.page);
const hgBoth = pageWindows.filter((r) => zero(r.G) && zero(r.H)).map((r) => r.page);
assert.deepEqual(p24Zero, [11, 33]);
assert.deepEqual(gBoth, []);
assert.deepEqual(hBoth, []);
assert.deepEqual(hgBoth, []);

// The nine author-visible chapter begins have independently selected starts.
const chapters = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const chapterWindows = chapters.map((page) => pageWindows.find((w) => w.page === page));
assert.ok(chapterWindows.every(Boolean));
assert.deepEqual(chapterWindows.filter((w) => zero(w.G)).map((w) => w.page), []);
assert.deepEqual(chapterWindows.filter((w) => zero(w.H)).map((w) => w.page), []);

console.log('Source table: G and H all four parity checks = 0');
console.log('Original: 12,956 runes, 56 physical p0..p55 pages');
console.log('Original complete page-start 256-rune windows:', pageWindows.length);
console.log('Source p24 single-root hits:', JSON.stringify(p24Zero));
console.log('Source p24 double-root hits:', JSON.stringify(gBoth));
console.log('Original H quadratic parity hits:', JSON.stringify(hBoth));
console.log('Original joint H*G codewords:', JSON.stringify(hgBoth));
console.log('Original nine chapter-start double-root hits: 0/9');
console.log('Original p33 first-window G,H:', JSON.stringify(pageWindows.find((w) => w.page === 33)));
console.log('Native length-256 H*G codeword plant: 4/4 checks; corruption: detected');
console.log('Conclusion: direct unmodified 256-rune physical-page/chapter-start shared-codeword model fails');
