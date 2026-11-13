"use strict";

/**
 * Original LP2 p15 4x4 Hill input-CBC, every possible hidden inverse first row.
 * Each of the 29^4 row keys is evaluated exactly on all 435 original complete
 * four-rune blocks AFTER the first; this makes the gate independent of IV.
 * Node.js 22, CommonJS, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page >= 16 && p.page <= 22);
const original = pages.flatMap(p => p.indices);
assert.deepEqual(pages.map(p => p.indices.length),
  [267, 273, 260, 271, 269, 273, 131]);
assert.equal(original.length, 1744);
const blockCount = original.length / 4;
const admitted = blockCount - 1; // The first block's initial vector is unknown.
assert.equal(blockCount, 436);
const mod = x => (x % 29 + 29) % 29;

/** @param {number[]} xs @returns {number} */
function orderedCollisionPairs(xs) {
  const count = Array(29).fill(0);
  for (const x of xs) count[x]++;
  return count.reduce((n, x) => n + x * (x - 1), 0);
}

/**
 * In CBC-input C_b = M(P_b + C_{b-1}), the FIRST plaintext coordinate
 * after block zero is a dot C_b - previous ciphertext coordinate.
 * a is row zero of unknown M^-1; test ALL 29^4 possible rows.
 * @param {number[]} cipher @returns {{score:number,key:number[],ties:number}}
 */
function exhaustiveFirstRow(cipher) {
  assert.equal(cipher.length, 1744);
  const x = Array.from({length: 4}, () => new Uint8Array(blockCount));
  const preceding = new Uint8Array(blockCount);
  for (let block = 0; block < blockCount; block++) {
    for (let j = 0; j < 4; j++) x[j][block] = cipher[block * 4 + j];
    if (block > 0) preceding[block] = cipher[4 * block - 4];
  }
  const precomputed = new Uint8Array(blockCount);
  const histogram = new Uint16Array(29);
  let top = -1;
  let best = [];
  let ties = 0;
  let visited = 0;
  for (let a0 = 0; a0 < 29; a0++)
    for (let a1 = 0; a1 < 29; a1++)
      for (let a2 = 0; a2 < 29; a2++) {
        for (let b = 1; b < blockCount; b++)
          precomputed[b] = mod(a0 * x[0][b] + a1 * x[1][b] +
            a2 * x[2][b] - preceding[b]);
        for (let a3 = 0; a3 < 29; a3++) {
          visited++;
          histogram.fill(0);
          for (let b = 1; b < blockCount; b++) {
            const value = (precomputed[b] + a3 * x[3][b]) % 29;
            histogram[value]++;
          }
          let score = 0;
          for (let j = 0; j < 29; j++)
            score += histogram[j] * (histogram[j] - 1);
          if (score > top) {
            top = score;
            best = [a0, a1, a2, a3];
            ties = 1;
          } else if (score === top) {
            ties++;
          }
        }
      }
  assert.equal(visited, 707281);
  return {score: top, key: best, ties, candidates: visited,
    ioc: top / (admitted * (admitted - 1))};
}

// Every row vector, including zero and rows from singular matrices, is tested.
const observed = exhaustiveFirstRow(original);
assert.equal(observed.score, 7408);
assert.deepEqual(observed.key, [7, 0, 2, 4]);
assert.equal(observed.ties, 1);
assert(Math.abs(observed.ioc - 0.03923936649186927) < 1e-14);

// Same native-GP spellings as the established four-block source SFT.
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} raw @returns {number[]} */
function nativeGP(raw) {
  const out = [];
  const s = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of s.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21); i += 3;
      } else if (word.startsWith("IO", i)) {
        out.push(27); i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "complete native GP encoding for " + word + ":" + i);
        out.push(token.i); i += token.s.length;
      }
    }
  }
  return out;
}
assert.deepEqual(nativeGP("TUNNELING"), [16,1,9,9,18,20,21]);

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 124, 9752],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 35, 10142],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 184, 10210]
].map(([name, file, expectedWindows, expectedMinimum]) => {
  const symbols = nativeGP(read(file));
  let windows = 0;
  let minimum = Infinity;
  for (let start = 0; start + original.length <= symbols.length;
    start += original.length) {
    const firstRow = [];
    for (let pos = start + 4; pos < start + original.length; pos += 4)
      firstRow.push(symbols[pos]);
    const score = orderedCollisionPairs(firstRow);
    minimum = Math.min(minimum, score);
    windows++;
  }
  assert.equal(windows, expectedWindows, name + " windows");
  assert.equal(minimum, expectedMinimum, name + " first-row source floor");
  assert(minimum > observed.score);
  return {name, windows, minimum,
    minIoC: minimum / (admitted * (admitted - 1)), symbols};
});

// Known planted 4x4 INPUT-CBC with the actual printed p15 matrix.
// Recovers the unique *correct secret first inverse row* without knowing
// that inverse row during exhaustive search.
const plain = controls[0].symbols.slice(0, original.length);
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
].map(row => row.map(mod));
const plantedCipher = [];
let previous = [0, 0, 0, 0];
for (let i = 0; i < plain.length; i += 4) {
  const input = plain.slice(i, i + 4).map((v, j) => mod(v + previous[j]));
  const cipher = printed.map(row =>
    mod(row.reduce((sum, coeff, j) => sum + coeff * input[j], 0)));
  plantedCipher.push(...cipher);
  previous = cipher;
}
const recovered = exhaustiveFirstRow(plantedCipher);
assert.deepEqual(recovered.key, [19, 1, 6, 3]);
assert.equal(recovered.score, 11354);
assert.equal(recovered.ties, 1);
assert(Math.abs(recovered.ioc - 0.060140897293288836) < 1e-14);
const plantedPhase0 = [];
for (let i = 4; i < plain.length; i += 4) plantedPhase0.push(plain[i]);
assert.equal(orderedCollisionPairs(plantedPhase0), recovered.score);

console.log(JSON.stringify({
  source: "LP2 p15 printed 4x4 grid and immediately following pp16-22",
  original: {runes: 1744, blocks: 436,
    discarded_iv_affected_blocks: 1, ...observed},
  corpus_disjoint_windows: controls.map(({name, windows, minimum, minIoC}) =>
    ({name, windows, minimum, minIoC})),
  planted_true_key_recovery: recovered,
  conclusion: "Every fixed GF29 Hill4 CBC-input inverse first row has " +
    "lower native-GP first-column repeat concentration than any of the " +
    "343 exact English controls. No original plaintext/key recovered."
}, null, 2));
