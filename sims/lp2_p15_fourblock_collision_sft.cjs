"use strict";

/**
 * Source-selected 4x4 Hill key and all-secret fixed-block equality gate.
 * Windows 11 / Node.js 22 / CommonJS, no third-party modules.
 * SFT: node sims/lp2_p15_fourblock_collision_sft.cjs
 *
 * Any one-to-one substitution of complete k-rune blocks preserves
 * equality among blocks in the same key/reset stratum. This is true
 * for arbitrary secret tables as well as every invertible GF29 Hill key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknown = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
const original = unknown.flatMap(p => p.indices);
const N = original.length;
assert.equal(N, 12956);
assert.equal(unknown.length, 55);

const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const layouts = {
  book: [N],
  chapter: chapters,
  page: unknown.map(p => p.indices.length)
};
for (const lengths of Object.values(layouts)) {
  assert.equal(lengths.reduce((a, b) => a + b, 0), N);
}

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Source-calibrated GP29 English spelling, including literal ING and IO
 * attested on solved LP1 and LP2 p57. Avoid legacy extra I before NG/IO.
 * @param {string} text
 * @returns {number[]}
 */
function encodeNative(text) {
  const result = [];
  const s = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of s.match(/[A-Z]+/g) || []) {
    for (let pos = 0; pos < word.length;) {
      if (word.startsWith("ING", pos)) {
        result.push(21);
        pos += 3;
      } else if (word.startsWith("IO", pos)) {
        result.push(27);
        pos += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, pos));
        assert(token, "unmapped GP token at " + word + ":" + pos);
        result.push(token.i);
        pos += token.s.length;
      }
    }
  }
  return result;
}
assert.deepEqual(encodeNative("TUNNELING"), [16, 1, 9, 9, 18, 20, 21]);
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => ({name, symbols: encodeNative(read(file))}));

/**
 * Ordered pairs of equal non-overlapping k-rune blocks; discard only the
 * incomplete trailing block in each independently reset stratum.
 * @param {number[]} symbols
 * @param {number[]} lengths
 * @param {number} k
 * @returns {number}
 */
function collisionPairs(symbols, lengths, k) {
  let total = 0;
  let base = 0;
  for (const len of lengths) {
    const frequency = new Map();
    for (let off = 0; off + k <= len; off += k) {
      const block = String.fromCharCode(
        ...symbols.slice(base + off, base + off + k));
      frequency.set(block, (frequency.get(block) || 0) + 1);
    }
    for (const f of frequency.values()) total += f * (f - 1) / 2;
    base += len;
  }
  assert.equal(base, symbols.length);
  return total;
}

/** @param {number[]} symbols @param {number} stride @returns {number[][]} */
function windows(symbols, stride) {
  const out = [];
  for (let pos = 0; pos + N <= symbols.length; pos += stride) {
    out.push(symbols.slice(pos, pos + N));
  }
  return out;
}
const expected = {
  4: {book: [5, 848], chapter: [1, 136], page: [0, 27]},
  5: {book: [1, 142], chapter: [0, 26], page: [0, 4]},
  6: {book: [0, 39], chapter: [0, 6], page: [0, 0]},
  7: {book: [0, 7], chapter: [0, 2], page: [0, 0]},
  8: {book: [0, 3], chapter: [0, 0], page: [0, 0]},
  9: {book: [0, 0], chapter: [0, 0], page: [0, 0]}
};
const expectedDisjoint = {
  4: {book: 848, chapter: 138, page: 27},
  5: {book: 142, chapter: 31, page: 5},
  6: {book: 48, chapter: 10, page: 0},
  7: {book: 7, chapter: 2, page: 0},
  8: {book: 4, chapter: 0, page: 0},
  9: {book: 0, chapter: 0, page: 0}
};
const overlaps = corpora.map(c => windows(c.symbols, N / 2));
const disjoint = corpora.map(c => windows(c.symbols, N));
assert.deepEqual(overlaps.map(x => x.length), [32, 8, 48]);
assert.deepEqual(disjoint.map(x => x.length), [16, 4, 24]);
for (let k = 4; k <= 9; k++) {
  for (const [name, lengths] of Object.entries(layouts)) {
    const observed = collisionPairs(original, lengths, k);
    const overlappingMinimum = Math.min(...overlaps.flatMap(w =>
      w.map(c => collisionPairs(c, lengths, k))));
    const disjointMinimum = Math.min(...disjoint.flatMap(w =>
      w.map(c => collisionPairs(c, lengths, k))));
    assert.deepEqual([observed, overlappingMinimum],
      expected[k][name], "original/overlap collision pairs k=" + k + " " + name);
    assert.equal(disjointMinimum, expectedDisjoint[k][name],
      "independent-block control minimum k=" + k + " " + name);
    console.log("k=" + k + ", reset=" + name +
      ", original=" + observed +
      ", 88 half-overlap control minimum=" + overlappingMinimum +
      ", 44 disjoint control minimum=" + disjointMinimum);
  }
}

// Original LP1 source-corrected GP control: physical p3, pp8-11 and p14
// contain printed cleartext; p5 and pp12-13 contain encrypted runes.
// This check needs no modern-English encoder or hypothetical plaintext.
const lp1Chunks = read("resources/transcriptions/lp1_wulfic_canonical.txt")
  .split("%");
const gpIndex = new Map(gp.runes.map((r, i) => [r, i]));
const selectedClearPages = [3, 8, 9, 10, 11, 14];
const sourceClear = selectedClearPages.map(page => {
  const symbols = [...lp1Chunks[page]].filter(r => gpIndex.has(r))
    .map(r => gpIndex.get(r));
  return {page, symbols};
});
assert.deepEqual(sourceClear.map(x => x.symbols.length),
  [157, 187, 207, 192, 169, 89]);
assert.equal(sourceClear.reduce((n, x) => n + x.symbols.length, 0), 1001);
const clearStarts = ["SOMEWISDOM", "THELOSSOF", "WEHAUEWHAT",
  "MOSTTHINGS", "CETHATHAUE", "ANINSTRUCTION"];
for (let j = 0; j < sourceClear.length; j++) {
  const native = sourceClear[j].symbols.map(i =>
    i === 21 ? "ING" : i === 27 ? "IO" : gp.translit[i]).join("");
  assert(native.startsWith(clearStarts[j]),
    "original cleartext GP witness p=" + selectedClearPages[j]);
}
const lp1ClearLengths = sourceClear.map(x => x.symbols.length);
const lp1ClearRunes = sourceClear.flatMap(x => x.symbols);
assert.equal(collisionPairs(lp1ClearRunes, lp1ClearLengths, 4), 11);
assert.equal(collisionPairs(lp1ClearRunes, lp1ClearLengths, 5), 4);
console.log("Six verified source-clear GP pages: 1001 runes, " +
  "11 page-aligned four-block pairs and 4 five-block pairs; " +
  "original unknown LP2 has zero of each.");

// Page15's exact physical 4x4 printed numbers. Every map which treats
// this as an invertible Hill key belongs to the exhausted 4-block family.
const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const Minv = [
  [19, 1, 6, 3],
  [11, 7, 8, 22],
  [2, 10, 15, 28],
  [25, 4, 1, 15]
];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    const dot = M[i].reduce((sum, v, t) => sum + v * Minv[t][j], 0) % 29;
    assert.equal(dot, i === j ? 1 : 0, "Hill inverse cell");
  }
}

/**
 * Cipher column-vector blocks using the p15 printed matrix modulo 29,
 * preserving incomplete trailing blocks unchanged on each physical page.
 * @param {number[]} symbols
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function hillPagewise(symbols, matrix) {
  const out = symbols.slice();
  let base = 0;
  for (const len of layouts.page) {
    for (let off = 0; off + 4 <= len; off += 4) {
      const old = symbols.slice(base + off, base + off + 4);
      for (let r = 0; r < 4; r++) {
        out[base + off + r] = matrix[r].reduce(
          (sum, m, c) => sum + m * old[c], 0) % 29;
      }
    }
    base += len;
  }
  return out;
}
const nativePlant = disjoint[0][0];
const encryptedPlant = hillPagewise(nativePlant, M);
assert.deepEqual(hillPagewise(encryptedPlant, Minv), nativePlant);
assert.equal(collisionPairs(encryptedPlant, layouts.page, 4),
  collisionPairs(nativePlant, layouts.page, 4));
// The genuine ciphertext must round-trip under any invertible proposed key;
// that property alone cannot authenticate a guessed plaintext.
const originalInverse = hillPagewise(original, Minv);
assert.deepEqual(hillPagewise(originalInverse, M), original);
assert.equal(collisionPairs(originalInverse, layouts.page, 4), 0);
console.log("Original p15 4x4 Hill matrix invertible mod29; source-native " +
  "full-length positive plant and original exact inverse/replay passed.");
console.log("Decision: page-stationary bijections of 4 or 5 GP29 runes " +
  "cannot account for any of 88 tested native-English windows.");
