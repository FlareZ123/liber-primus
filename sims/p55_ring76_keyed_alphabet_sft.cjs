"use strict";
/**
 * Source-motivated first-occurrence keyed-alphabet test:
 * 76-cell perimeter of the original 32x8 LP2 numeric table -> GP29
 * keyed alphabet -> original p55 (full 76 runes and PARABLE-stripped
 * 43 strict-interior runes).
 *
 * Candidate convention: reduce perimeter bytes mod29, retain first
 * occurrence of each residue, then append missing GP indices ascending.
 * Test only base59/base60, clockwise/reverse, and the two inverse
 * directions of that one permutation. No phase or key fitting.
 *
 * Run: node sims/p55_ring76_keyed_alphabet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p55.length, 76);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(grid.rows.flat().length, 256);

const INTERIOR_OFFSETS = [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,
  37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74
];
const interior = INTERIOR_OFFSETS.map(offset => p55[offset]);
assert.equal(interior.length, 43);

const ALPHABET60 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const ALPHABET59 = ALPHABET60.replace("f", "");
assert.equal(ALPHABET60.length, 60);
assert.equal(ALPHABET59.length, 59);
assert.equal(grid.alphabet, ALPHABET60);
assert.equal(grid.rows.flat().some(token => token.includes("f")), false);

function bytesFor(radix) {
  const alphabet = radix === 60 ? ALPHABET60 : ALPHABET59;
  const bytes = grid.rows.flat().map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "invalid source token under base " + radix);
    const value = hi * radix + lo;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
  if (radix === 60) assert.deepEqual(bytes, grid.byte_rows.flat());
  return bytes;
}

// Physical clockwise perimeter, beginning at the printed top-left cell.
const perimeterXY = [];
for (let column = 0; column < 8; column++) perimeterXY.push([0, column]);
for (let row = 1; row < 32; row++) perimeterXY.push([row, 7]);
for (let column = 6; column >= 0; column--) perimeterXY.push([31, column]);
for (let row = 30; row >= 1; row--) perimeterXY.push([row, 0]);
assert.equal(perimeterXY.length, 76);
assert.equal(new Set(perimeterXY.map(([r,c]) => r * 8 + c)).size, 76);

function keyedAlphabet(radix, orientation) {
  const bytes = bytesFor(radix);
  const sequence = perimeterXY.map(([row, column]) =>
    bytes[row * 8 + column] % 29);
  if (orientation === "reverse") sequence.reverse();
  const key = [];
  for (const symbol of sequence) if (!key.includes(symbol)) key.push(symbol);
  const uniqueResidues = key.length;
  const missing = Array.from({length:29}, (_, i) => i)
    .filter(symbol => !key.includes(symbol));
  // Standard keyword-alphabet completion: append unused symbols in GP order.
  key.push(...missing);
  assert.equal(key.length, 29);
  assert.equal(new Set(key).size, 29);
  return {key, uniqueResidues, missing};
}

// "rank": P = rank_K(C). "inverse": P = K[C].
function decode(cipher, key, mode) {
  return cipher.map(symbol =>
    mode === "rank" ? key.indexOf(symbol) : key[symbol]);
}
function encode(plain, key, mode) {
  const inverse = Array(29);
  key.forEach((symbol, position) => { inverse[symbol] = position; });
  return plain.map(symbol =>
    mode === "rank" ? key[symbol] : inverse[symbol]);
}

const transliterations = corpus.translit.map((value, index) => ({value,index}))
  .sort((a,b) => b.value.length - a.value.length);
function toGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const match = transliterations.find(symbol => word.startsWith(symbol.value, i));
      if (match) { output.push(match.index); i += match.value.length; }
      else i++;
    }
  }
  return output;
}

const native = toGP(shakespeare);
assert.equal(native.length, 218800);
const trainingEnd = Math.floor(native.length * 0.75);
const trigram = new Float64Array(29 ** 3).fill(0.005);
const bigram = new Float64Array(29 ** 2).fill(0.145);
for (let i = 2; i < trainingEnd; i++) {
  const code = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
  trigram[code]++;
  bigram[Math.floor(code / 29)]++;
}
function score(symbols) {
  let total = 0;
  for (let i = 2; i < symbols.length; i++) {
    const code = symbols[i - 2] * 841 + symbols[i - 1] * 29 + symbols[i];
    total += Math.log(trigram[code] / bigram[Math.floor(code / 29)]);
  }
  return total / (symbols.length - 2);
}
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const heldout43 = [];
for (let i = trainingEnd; i + 43 < native.length; i++)
  heldout43.push(score(native.slice(i, i + 43)));
heldout43.sort((a,b) => a - b);
const heldout76 = [];
for (let i = trainingEnd; i + 76 < native.length; i += 76)
  heldout76.push(score(native.slice(i, i + 76)));
heldout76.sort((a,b) => a - b);
assert.equal(heldout43.length, 54657);
assert.equal(heldout76.length, 719);

const variants = [];
for (const radix of [60, 59]) {
  for (const orientation of ["clockwise", "reverse"]) {
    const {key, uniqueResidues, missing} = keyedAlphabet(radix, orientation);
    for (const mode of ["rank", "inverse"]) {
      const decodedInterior = decode(interior, key, mode);
      const decodedFull = decode(p55, key, mode);
      const plant43 = native.slice(trainingEnd, trainingEnd + 43);
      const plant76 = native.slice(trainingEnd, trainingEnd + 76);
      const recovered43 = decode(encode(plant43, key, mode), key, mode);
      const recovered76 = decode(encode(plant76, key, mode), key, mode);
      assert.deepEqual(recovered43, plant43);
      assert.deepEqual(recovered76, plant76);
      variants.push({
        radix, orientation, mode, uniqueResidues, missing, key,
        interiorScore: score(decodedInterior),
        interiorIoC: ioc(decodedInterior),
        interiorGP: decodedInterior.map(i => corpus.translit[i]).join("-"),
        fullScore: score(decodedFull),
        fullGP: decodedFull.map(i => corpus.translit[i]).join("-"),
        native43PlantRecovered: recovered43.length,
        native76PlantRecovered: recovered76.length
      });
    }
  }
}
assert.equal(variants.length, 8);
assert(variants.every(v => v.interiorScore < heldout43[0]));
assert(variants.every(v => v.fullScore < heldout76[0]));

const bestInterior = variants.reduce((a,b) =>
  a.interiorScore > b.interiorScore ? a : b);
const bestFull = variants.reduce((a,b) =>
  a.fullScore > b.fullScore ? a : b);
console.log(JSON.stringify({
  hypothesis: "First-occurrence keyed alphabet from the p50 76-cell perimeter, applied to p55",
  source: {
    p55Runes: p55.length,
    strippedInteriorRunes: interior.length,
    interiorOffsets: INTERIOR_OFFSETS,
    perimeterCells: perimeterXY.length,
    gridTokens: grid.rows.flat().length,
    shakespeareGPRunes: native.length
  },
  controls: {
    trainingGPRunes: trainingEnd,
    heldout43: {
      overlappingWindows: heldout43.length,
      minimum: heldout43[0],
      median: heldout43[Math.floor(heldout43.length / 2)]
    },
    heldout76: {
      nonoverlappingWindows: heldout76.length,
      minimum: heldout76[0],
      median: heldout76[Math.floor(heldout76.length / 2)]
    }
  },
  original: {
    rawInteriorScore: score(interior),
    rawFullScore: score(p55),
    interiorIoC: ioc(interior)
  },
  variants,
  bestInterior,
  bestFull,
  decision: "All eight frozen keyed-alphabet inverses remain below every corresponding native-English holdout; no unknown LP2 plaintext, key, or cipher recovered."
}, null, 2));
