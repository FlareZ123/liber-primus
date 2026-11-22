'use strict';
/**
 * Source-locked GF(81) bookend zero-axis mixed-difference test.
 * Run from repository root: node sims/lp2_bookend_gf81_zeroaxis_mixed_difference_sft.cjs
 *
 * Inputs: canonical LP2 GP29 rune corpus, original p7 five red-word
 * products and p8 red products, source-visible five numbered paragraphs.
 * No ciphertext-derived key, tuning or separate dependency.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const gp = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const clear = corpus.pages[57].indices;
assert.equal(gp.length, 12956);
assert.equal(clear.length, 95);

/** @param {number} x @returns {number[]} */
function unpack(x) {
  return [x % 3, Math.floor(x / 3) % 3,
    Math.floor(x / 9) % 3, Math.floor(x / 27) % 3];
}

/** @param {number[]} a @returns {number} */
function pack(a) { return a[0] + 3 * a[1] + 9 * a[2] + 27 * a[3]; }

/** Multiply in GF(3)[x] / (x^4+x^2+x+1). @param {number} a @param {number} b @returns {number} */
function fieldMultiply(a, b) {
  const u = unpack(a), v = unpack(b), t = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) t[i + j] += u[i] * v[j];
  }
  // x^4 = -x^2 - x - 1 = 2(x^2+x+1) mod 3.
  for (let i = 6; i >= 4; i--) {
    const factor = t[i] % 3;
    for (let j = 0; j < 3; j++) t[i - 4 + j] += 2 * factor;
    t[i] = 0;
  }
  return pack(t.slice(0, 4).map(x => x % 3));
}
function m29(x) { return ((x % 29) + 29) % 29; }
/** @param {number[]} a @returns {{n:number,ioc:number,top12:number}} */
function count(a) {
  const bins = Array(29).fill(0);
  for (const x of a) bins[x]++;
  const n = a.length;
  const sum = bins.reduce((s, x) => s + x * (x - 1), 0);
  return { n, ioc: sum / (n * (n - 1)),
    top12: bins.slice().sort((a, b) => b - a).slice(0, 12).reduce((a, b) => a + b, 0) };
}
// p7 red products normalize modulo 3 to f(x)=x^4+x^2+x+1;
// original p8 supplies first-word product 4=x+1, an order-80 unit.
const red = [11, 26, 8, 15, 2];
assert.deepEqual(red.map(x => x % 3), [2, 2, 2, 0, 2]);
const powers = [];
let cursor = 1;
for (let i = 0; i < 80; i++) {
  powers.push(cursor);
  cursor = fieldMultiply(cursor, 4);
}
assert.equal(cursor, 1);
assert.equal(new Set(powers).size, 80);
assert.deepEqual(powers.slice(0, 6), [1, 4, 16, 28, 45, 17]);

const first = gp.slice(0, 6561); // 81^2 source cells
const later = gp.slice(6561);    // 6395 glyphs
assert.equal(later.length, 6395);
// Five numbered labels become source-visible empty cells in an 80x80 grid.
const sourceParagraphStarts = [8805, 8944, 9035, 9133, 9229];
const emptyPositions = sourceParagraphStarts.map((n, i) => n - 6561 + i);
assert.deepEqual(emptyPositions, [2244, 2384, 2476, 2575, 2672]);
const holes = new Set(emptyPositions);
const cellValues = Array(6400).fill(null);
for (let slot = 0, rune = 0; slot < 6400; slot++) {
  if (!holes.has(slot)) cellValues[slot] = later[rune++];
}
assert.deepEqual(cellValues.filter(x => x !== null), later);

// The single field-coordinate, zero-axis mixed difference (double-centered
// field grid) avoids fitting any new key: K(u,v) = A(u,v)-A(u,0)-A(0,v)+A(0,0).
// p57's shed-circumferences instruction motivates zero axes as a candidate
// removed L-shaped border of 161 cells. It does not specify this opcode.
const pad = Array(6400);
for (let row = 0; row < 80; row++) {
  for (let col = 0; col < 80; col++) {
    const u = powers[row], v = powers[col], index = 80 * row + col;
    pad[index] = m29(first[u * 81 + v] - first[u * 81] - first[v] + first[0]);
  }
}
const decode = sign => cellValues
  .map((c, i) => c === null ? null : m29(c + sign * pad[i]))
  .filter(x => x !== null);
const minus = decode(-1), plus = decode(1);
assert.equal(minus.length, 6395);
assert.equal(plus.length, 6395);

// Positive: an independently solved original GP29 text cloned to 6395 cells;
// both hypothetical cipher directions must invert the entire 6400-slot mask.
const plant = Array.from({ length: 6395 }, (_, i) => clear[i % clear.length]);
for (const sign of [-1, 1]) {
  let j = 0;
  const forward = cellValues.map((x, i) => x === null ? null : m29(plant[j++] - sign * pad[i]));
  const recovered = forward.map((x, i) => x === null ? null : m29(x + sign * pad[i]))
    .filter(x => x !== null);
  assert.deepEqual(recovered, plant);
  const roundtrip = decode(sign).map((x, i) => {
    // Map source rune order to corresponding nonhole slot for reencryption.
    let z = i;
    for (const h of emptyPositions) if (h <= z) z++;
    return m29(x - sign * pad[z]);
  });
  assert.deepEqual(roundtrip, later);
}
const rawStat = count(later), minusStat = count(minus), plusStat = count(plus);
assert.ok(Math.abs(rawStat.ioc - 0.034451571217445597) < 1e-12);
assert.ok(Math.abs(minusStat.ioc - 0.03445328314293869) < 1e-12);
assert.ok(Math.abs(plusStat.ioc - 0.034503222455179956) < 1e-12);
console.log(JSON.stringify({
  input: 'LP2 unknown original 12956 runes, 81^2/80^2 bookend with five original ordinal holes',
  gf81: { polynomial: 'x^4+x^2+x+1', generator: 4, period: 80 },
  first81Square: first.length, second80SquareCells: 6400,
  originalGPGlyphsInSecondSquare: later.length, emptyPositions,
  invariantInput: rawStat,
  mixedDifferenceSubtract: minusStat,
  mixedDifferenceAdd: plusStat,
  solvedP57Control: count(clear),
  positive: 'both signs: 6395/6395 known GP29 plant recovered and original 6395/6395 reencrypted',
  conclusion: 'No source-native plaintext under the literal double-centered zero-axis pad'
}, null, 2));
