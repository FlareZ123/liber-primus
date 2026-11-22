"use strict";
/**
 * Original LP2 scroll255→p8: exact all-secret XOR-wordhash impossibility.
 * Source-selected GF4 255-state correction is conditional, not authenticated.
 *
 * Any stationary hash H(word)=f(XOR_{glyph in word} secretGlyphBits[glyph])
 * necessarily identifies words with the same rune parity multiset, for
 * arbitrary secret bit width and arbitrary deterministic private output f.
 * Original black-word parity collisions contradict this consequence.
 *
 * Windows 11, Node.js 20+, CommonJS:
 * node sims/lp2_scroll255_xor_wordhash_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const fragments = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const words = [];
let word = [];
for (let p = 3; p <= 7; p++) for (const ch of fragments[p]) {
  if (runeMap.has(ch)) word.push(runeMap.get(ch));
  else if ((ch === "-" || ch === ".") && word.length) {
    words.push(word); word = [];
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));
const products = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]].map(w => w.reduce((v, r) => mod(v * r), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
assert.deepEqual(gp.pages[7].indices.slice(194),
  [23, 3, 22, 16, 2, 25, 5, 7, 11, 14, 28, 6, 28, 19]);
/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a, b) {
  let v = 0;
  for (let k = 0; k < 2; k++) {
    if ((b >>> k) & 1) v ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return v;
}
const taps = products.slice(0, 4).map(x => x % 4);
let state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((v, x) => 4 * v + x, 0));
  let feedback = 0;
  for (let j = 0; j < 4; j++) feedback ^= gf4mul(state[j], taps[j]);
  state = [state[1], state[2], state[3], feedback];
}
assert.deepEqual(state, [2, 0, 0, 0]);
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
const digits = grid.alphabet.replace("f", "");
const table = grid.pages.flatMap(p => p.tokens).map(t =>
  59 * digits.indexOf(t[0]) + digits.indexOf(t[1]));
assert.equal(table.length, 256);
assert(table.every(x => x >= 0 && x <= 251));
const key = addresses.map(i => table[i]);
const raw = gp.pages[8].indices;
assert.equal(raw.length, 255);
const H = raw.map((v, i) => mod(v + key[i]));
assert.deepEqual(H.map((v, i) => mod(v - key[i])), raw);

// Equal parity vectors force equal XOR of arbitrary per-glyph secret bitstrings.
/** @param {number[]} w @returns {number} */
const parity = w => w.reduce((mask, r) => mask ^ (1 << r), 0);
const classes = new Map();
words.forEach((w, i) => {
  const k = parity(w);
  classes.set(k, [...(classes.get(k) || []), i]);
});
assert.equal(classes.size, 249);
const shared = [...classes.values()].filter(ids => ids.length > 1);
assert.deepEqual(shared, [[12, 114], [47, 240], [48, 231],
  [88, 179], [131, 209], [235, 236]]);
const wrong = shared.filter(ids => new Set(ids.map(i => H[i])).size > 1);
assert.deepEqual(wrong, [[12, 114], [131, 209]]);
assert.deepEqual(wrong.map(ids => ids.map(i => H[i])), [[25, 20], [9, 20]]);
assert.deepEqual(words[12], [23, 12]);
assert.deepEqual(words[114], [12, 23, 12, 21, 12, 21]);
assert.deepEqual(words[131], [12, 9, 24]);
assert.deepEqual(words[209], [14, 24, 9, 12, 14]);
// Confirm a separate red/black output lookup cannot rescue the model:
const redPositions = new Set();
let offset = 0;
for (let p = 3; p <= 7; p++) {
  for (const span of ink.pages.find(z => z.page === p)?.red_spans || [])
    for (let j = 0; j < span.length; j++)
      redPositions.add(offset + span.start + j);
  offset += gp.pages[p].indices.length;
}
const blackWords = new Set(), redWords = new Set();
let at = 0;
words.forEach((w, i) => {
  const red = w.every((_, j) => redPositions.has(at + j));
  const black = w.every((_, j) => !redPositions.has(at + j));
  assert(red || black);
  (red ? redWords : blackWords).add(i);
  at += w.length;
});
assert.deepEqual([blackWords.size, redWords.size], [242, 13]);
assert(wrong.flat().every(i => blackWords.has(i)));

// Complete source-shaped positive plant on original word tape and key:
const secretGlyphBytes = Array.from({ length: 29 }, (_, i) =>
  (13 + 61 * i + 7 * i * i) & 255);
const secretReadout = Array.from({ length: 256 }, (_, i) =>
  (7 * i + i * i + 11) % 29);
const planted = words.map(w =>
  secretReadout[w.reduce((v, r) => v ^ secretGlyphBytes[r], 0)]);
const plantedCipher = planted.map((v, i) => mod(v - key[i]));
assert.deepEqual(plantedCipher.map((v, i) => mod(v + key[i])), planted);
for (const ids of shared)
  assert.equal(new Set(ids.map(i => planted[i])).size, 1);

console.log(JSON.stringify({
  originalRunes: words.flat().length, originalWords: words.length,
  originalP8CipherRunes: raw.length,
  sourceProducts: products, sourceRedWords: redWords.size,
  sourceBlackWords: blackWords.size, originalParityClasses: classes.size,
  equalParityGroups: shared, contradictingOriginalGroups: wrong,
  contradictedCorrectedValues: wrong.map(ids => ids.map(i => H[i])),
  allBitWidthsAndDeterministicOutputTablesExcluded: true,
  positiveSecret256ReadoutReencryptedAndReplayed: true,
  recoveredPlaintext: false
}, null, 2));
