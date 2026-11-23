'use strict';

/**
 * SFT: 16-page floral source register, source-visible 3299 link, and frozen
 * modular-doubling inverse. Node.js 22, CommonJS, read-only.
 *
 * Evidence: original GP29 transcription/ink ledger/p50 grid in resources.
 * The interpretation is exploratory; no original plaintext or key is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = (filename) => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = read('lp2-corpus.json');
const ink = read('lp2-ink-annotations.json');
const table = read('lp2-grid-256.json');
const selected = corpus.pages.filter((p) => p.page >= 40 && p.page <= 55);
const redByPage = new Map(ink.pages.map((p) => [p.page, p.red_spans || []]));
assert.equal(selected.length, 16);
assert.equal(table.bytes.length, 256);
assert.equal(corpus.translit.length, 29);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const v of values) freq[v]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {number} */
function equalNeighbours(values) {
  let n = 0;
  for (let i = 1; i < values.length; i++) if (values[i] === values[i - 1]) n++;
  return n;
}

/** @param {number[]} values @returns {number} */
function adjacentMutualInformation(values) {
  const left = Array(29).fill(0);
  const right = Array(29).fill(0);
  const pairs = Array.from({ length: 29 }, () => Array(29).fill(0));
  const n = values.length - 1;
  for (let i = 1; i < values.length; i++) {
    const a = values[i - 1], b = values[i];
    left[a]++;
    right[b]++;
    pairs[a][b]++;
  }
  let result = 0;
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const m = pairs[a][b];
    if (m) result += (m / n) * Math.log2(m * n / (left[a] * right[b]));
  }
  return result;
}

const full = [];
const black = [];
const withoutIntroRubrics = [];
const redCounts = [];
for (const p of selected) {
  assert.ok(Array.isArray(p.indices));
  const redSpans = redByPage.get(p.page) || [];
  let redN = 0;
  for (let i = 0; i < p.indices.length; i++) {
    const symbol = p.indices[i];
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    const red = redSpans.some((s) => i >= s.start && i < s.start + s.length);
    full.push(symbol);
    if (!red) black.push(symbol);
    else redN++;
    if (!((p.page === 40 && i < 8) || (p.page === 54 && i < 9))) {
      withoutIntroRubrics.push(symbol);
    }
  }
  if (redN) redCounts.push([p.page, redN]);
}
assert.deepEqual(redCounts, [[40, 8], [53, 51], [54, 9]]);
assert.equal(full.length, 3316);
assert.equal(black.length, 3248);
assert.equal(withoutIntroRubrics.length, 3299);
assert.equal(black.length, 16 * 7 * 29);
assert.equal(black.length, 16 * 203);
assert.equal(3299, 3301 - 2);
assert.equal(3248 + 51, 3299);

/**
 * A key-independent diagnostic for sixteen 203-rune rows.
 * Comparisons are across rows at a common column, preserving unknown key.
 *
 * @param {number[][]} rows
 * @param {number[]} shifts
 * @returns {number}
 */
function columnCollisions(rows, shifts) {
  let total = 0;
  for (let col = 0; col < 203; col++) {
    const f = new Uint8Array(29);
    for (let row = 0; row < 16; row++) f[rows[row][(col + shifts[row]) % 203]]++;
    for (const k of f) total += k * (k - 1) / 2;
  }
  return total;
}
const rows = Array.from({ length: 16 }, (_, k) => black.slice(k * 203, (k + 1) * 203));
assert.ok(rows.every((r) => r.length === 203));
const observedCollisions = columnCollisions(rows, Array(16).fill(0));
assert.equal(observedCollisions, 857);
const comparisonPairs = 203 * 16 * 15 / 2;
assert.equal(comparisonPairs, 24360);

let state = 0x3301a77;
/** @returns {number} */
function xorshift32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
let ge = 0, sum = 0, min = Infinity, max = -Infinity;
for (let t = 0; t < 2048; t++) {
  const shifts = Array.from({ length: 16 }, () => xorshift32() % 203);
  const n = columnCollisions(rows, shifts);
  if (n >= observedCollisions) ge++;
  sum += n;
  min = Math.min(min, n);
  max = Math.max(max, n);
}
assert.equal(ge, 574);
assert.equal(sum, 1721258);
assert.equal(min, 757);
assert.equal(max, 932);

/**
 * The p15 source's red cell is 3299, with 3301-3299=2.
 * Since 2 is a primitive root mod 3299, it defines a full order of
 * the 3299 putative register positions. This is a proposed operator.
 */
const modulus = 3299;
const order = [0];
const key = [];
let v = 1;
for (let i = 0; i < modulus - 1; i++) {
  order.push(v);
  v = 2 * v % modulus;
}
assert.equal(v, 1);
assert.equal(order.length, modulus);
assert.equal(new Set(order).size, modulus);
v = 1;
for (let i = 0; i < modulus; i++) {
  key.push(v % 29);
  v = 2 * v % modulus;
}
const permuted = order.map((i) => withoutIntroRubrics[i]);
const additive = withoutIntroRubrics.map((ci, i) => (ci - key[i] + 29) % 29);
// Source-control against treating p15's 4x4 spiral as a literal physical-page shuffle.
// The source transcription omits the runeless numeric page50 as a rune segment.
const physicalLines = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8').split(/\\n%\\n/);
assert.equal(physicalLines.length, 57);
const runeChars = new Set(corpus.runes);
const printed = (page) => physicalLines[page < 50 ? page : page - 1].trim();
const carriedEdges = [];
for (let pg = 40; pg < 55; pg++) {
  if (pg === 49 || pg === 50) continue;
  if (printed(pg).endsWith('/') && runeChars.has([...printed(pg + 1)][0])) {
    carriedEdges.push(pg + '>' + (pg + 1));
  }
}
assert.equal(carriedEdges.length, 12);
const spiralPages = [45, 46, 50, 49, 48, 44, 40, 41, 42, 43, 47, 51, 55, 54, 53, 52];
assert.equal(new Set(spiralPages).size, 16);
const joinedSpiral = [];
for (let k = 1; k < spiralPages.length; k++) {
  const edge = spiralPages[k - 1] + '>' + spiralPages[k];
  if (carriedEdges.includes(edge)) joinedSpiral.push(edge);
}
assert.equal(joinedSpiral.length, 4);

const known = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(known.length, 95);
const planted = Array.from({ length: modulus }, (_, i) => known[i % known.length]);
const plantedCipher = planted.map((pi, i) => (pi + key[i]) % 29);
assert.deepEqual(plantedCipher.map((ci, i) => (ci - key[i] + 29) % 29), planted);
const plantedShuffled = Array(modulus);
for (let i = 0; i < modulus; i++) plantedShuffled[order[i]] = planted[i];
assert.deepEqual(order.map((i) => plantedShuffled[i]), planted);

console.log('SOURCE     pages=40..55 count=16, printed runes=' + full.length);
console.log('SOURCE     red spans=' + JSON.stringify(redCounts) + ', black=' + black.length);
console.log('SOURCE     3248=16*7*29=16*203; exclude only p40/p54 headers =>3299');
console.log('SOURCE     p15 red origin=3299 and 3301-3299=2 (authored arithmetic, speculative receiver)');
console.log('SOURCE     p50 printed bytes=' + table.bytes.length + '=16*16 (another unassigned interface)');
console.log('DIAGNOSTIC period203 equality=' + observedCollisions + '/' + comparisonPairs
  + ', IoC=' + (observedCollisions / comparisonPairs).toFixed(9));
console.log('NULL       2048 row-rotation controls, mean=' + (sum / 2048).toFixed(4)
  + ', range=[' + min + ',' + max + '], one-sided p>=' + ((ge + 1) / 2049).toFixed(6));
console.log('SHEAR      literal p15 spiral page-order: preserves ' + joinedSpiral.length + '/' + carriedEdges.length + ' printed runic carries (not a prose-order solution)');
console.log('CONTROL    native solved p57 IoC=' + ioc(known).toFixed(9));
console.log('INVERSE    original 3299-runic IoC=' + ioc(withoutIntroRubrics).toFixed(9)
  + ', adjacent equals=' + equalNeighbours(withoutIntroRubrics));
console.log('INVERSE    modular-doubling order: IoC=' + ioc(permuted).toFixed(9)
  + ', mutual information=' + adjacentMutualInformation(permuted).toFixed(9)
  + ', adjacent equals=' + equalNeighbours(permuted));
console.log('INVERSE    pow2-mod3299 key: IoC=' + ioc(additive).toFixed(9)
  + ', first 100 runes=' + additive.slice(0, 100).map((i) => corpus.translit[i]).join(''));
console.log('PLANTS     true 3299-runic synthetic inverses exact, wrong/source keys not endorsed');
console.log('RESULT     NO ORIGINAL PLAINTEXT; input-shape coincidence does not select a cipher.');
