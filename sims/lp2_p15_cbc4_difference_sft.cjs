"use strict";

/**
 * LP2 p15 4x4 Hill CBC: an all-secret output-feedback collision gate and
 * direct original-source inverse tests. Node.js 22, CommonJS, no dependencies.
 * See im-results/lp2-p15-cbc4-source-difference-gate.md.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page >= 16 && p.page <= 22);
const original = pages.flatMap(p => p.indices);
const sourceIV = corpus.pages.find(p => p.page === 15).indices.slice(-4);
const N = original.length;
assert.deepEqual(pages.map(p => p.indices.length),
  [267, 273, 260, 271, 269, 273, 131]);
assert.equal(N, 1744);
assert.equal(N % 4, 0);

const mod = x => (x % 29 + 29) % 29;
const transpose = M => M.map((_, j) => M.map(row => row[j]));
const multiply = (M, v) =>
  M.map(row => mod(row.reduce((sum, a, j) => sum + a * v[j], 0)));
const add = (a, b, sign) => a.map((v, j) => mod(v + sign * b[j]));

/** @param {number[][]} M @returns {number[][]} */
function matrixInverse(M) {
  const rows = M.map((r, i) => [
    ...r, ...Array.from({length: 4}, (_, j) => +(i === j))
  ]);
  for (let j = 0; j < 4; j++) {
    let pivot = j;
    while (pivot < 4 && rows[pivot][j] === 0) pivot++;
    assert(pivot < 4, "matrix invertible modulo29");
    [rows[j], rows[pivot]] = [rows[pivot], rows[j]];
    let inverse = 1;
    while (mod(rows[j][j] * inverse) !== 1) inverse++;
    rows[j] = rows[j].map(v => mod(v * inverse));
    for (let k = 0; k < 4; k++) if (k !== j) {
      const scale = rows[k][j];
      rows[k] = rows[k].map((v, h) => mod(v - scale * rows[j][h]));
    }
  }
  return rows.map(r => r.slice(4));
}
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
].map(row => row.map(mod));
const printedInverse = matrixInverse(printed);
assert.deepEqual(printedInverse,
  [[19,1,6,3], [11,7,8,22], [2,10,15,28], [25,4,1,15]]);

/**
 * A source-specified CBC-output law would have C[b] = F(P[b]) + C[b-1]
 * in GF29^4 with any UNKNOWN, fixed bijection F. Its observable differences
 * D[b] = C[b] - C[b-1] = F(P[b]) preserve plaintext block equality exactly.
 * No assumption about F being linear or the identity of its secret key.
 */
function differenceBlocks(C, iv) {
  const result = [];
  let previous = iv;
  for (let i = 0; i < C.length; i += 4) {
    const current = C.slice(i, i + 4);
    result.push(...add(current, previous, -1));
    previous = current;
  }
  return result;
}
/** @param {number[]} values */
function collisionPairs(values, skipFirst = false) {
  let collisions = 0;
  const counts = new Map();
  for (let i = skipFirst ? 4 : 0; i < values.length; i += 4) {
    const block = values.slice(i, i + 4).join(",");
    const count = counts.get(block) || 0;
    collisions += count;
    counts.set(block, count + 1);
  }
  return collisions;
}
/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
assert.equal(collisionPairs(differenceBlocks(original, [0,0,0,0])), 0);
assert.equal(collisionPairs(differenceBlocks(original, sourceIV)), 0);
// With any hidden IV, the other 435 observable D-blocks are unchanged.
assert.equal(collisionPairs(differenceBlocks(original, [0,0,0,0]), true), 0);

// Independently pinned original-source-calibrated English corpora.
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const out = [];
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let pos = 0; pos < word.length;) {
      if (word.startsWith("ING", pos)) {
        out.push(21);
        pos += 3;
      } else if (word.startsWith("IO", pos)) {
        out.push(27);
        pos += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, pos));
        assert(token, "GP mapping available for " + word + ":" + pos);
        out.push(token.i);
        pos += token.s.length;
      }
    }
  }
  return out;
}
assert.deepEqual(encodeNative("TUNNELING"), [16, 1, 9, 9, 18, 20, 21]);
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 124, 10, 10],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 35, 26, 25],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 184, 11, 11]
].map(([name, file, expectedWindows, expectedMin, expectedSuffixMin]) => {
  const symbols = encodeNative(read(file));
  let windows = 0;
  let minCollision = Infinity;
  let minSuffixCollision = Infinity;
  for (let offset = 0; offset + N <= symbols.length; offset += N) {
    const chunk = symbols.slice(offset, offset + N);
    const count = collisionPairs(chunk);
    minCollision = Math.min(minCollision, count);
    minSuffixCollision = Math.min(minSuffixCollision, collisionPairs(chunk, true));
    windows++;
  }
  assert.equal(windows, expectedWindows, name + " exact corpus windows");
  assert.equal(minCollision, expectedMin, name + " minimum collisions");
  assert.equal(minSuffixCollision, expectedSuffixMin,
    name + " minimum after first block");
  return {name, windows, minimum: minCollision,
    suffixMinimum: minSuffixCollision, symbols};
});
const planted = controls[0].symbols.slice(0, N);
assert(ioc(planted) > 0.06);
assert(collisionPairs(planted) >= 10);

/**
 * mode="input": C[b]=M(P[b]+C[b-1]).
 * mode="output": C[b]=M P[b]+C[b-1].
 * IV is either the fixed zero block or p15's physically preceding last4.
 * @param {number[]} P @param {number[][]} M @param {string} mode
 * @param {number[]} iv @returns {number[]}
 */
function encrypt(P, M, mode, iv) {
  const result = [];
  let previous = iv;
  for (let i = 0; i < P.length; i += 4) {
    const plaintext = P.slice(i, i + 4);
    const ciphertext = mode === "input"
      ? multiply(M, add(plaintext, previous, 1))
      : add(multiply(M, plaintext), previous, 1);
    result.push(...ciphertext);
    previous = ciphertext;
  }
  return result;
}
/**
 * @param {number[]} C @param {number[][]} M @param {string} mode
 * @param {number[]} iv @returns {number[]}
 */
function decrypt(C, M, mode, iv) {
  const Minv = matrixInverse(M);
  const result = [];
  let previous = iv;
  for (let i = 0; i < C.length; i += 4) {
    const ciphertext = C.slice(i, i + 4);
    const plaintext = mode === "input"
      ? add(multiply(Minv, ciphertext), previous, -1)
      : multiply(Minv, add(ciphertext, previous, -1));
    result.push(...plaintext);
    previous = ciphertext;
  }
  return result;
}

const direct = [];
for (const transposed of [false, true])
  for (const inverseEncoder of [false, true])
    for (const mode of ["input", "output"])
      for (const useP15IV of [false, true]) {
        let M = transposed ? transpose(printed) : printed;
        if (inverseEncoder) M = matrixInverse(M);
        const iv = useP15IV ? sourceIV : [0,0,0,0];
        const ciphertextPlant = encrypt(planted, M, mode, iv);
        if (mode === "output") {
          assert.equal(collisionPairs(differenceBlocks(ciphertextPlant, iv), true),
            collisionPairs(planted, true), "CBC-output equality plant");
        }
        assert.deepEqual(decrypt(ciphertextPlant, M, mode, iv), planted,
          "complete native-English plant recovery");
        const decoded = decrypt(original, M, mode, iv);
        assert.deepEqual(encrypt(decoded, M, mode, iv), original,
          "exact complete original-cipher forward replay");
        const value = ioc(decoded);
        assert(value < 0.045, "original inverse remains ciphertext-like");
        direct.push({
          transposed, inverseEncoder, mode,
          iv: useP15IV ? "p15-tail" : "zero", ioc: value
        });
      }
assert.equal(direct.length, 16);
const ranked = direct.slice().sort((a, b) => b.ioc - a.ioc);
assert(Math.abs(ranked[0].ioc - 0.034682636180370235) < 1e-12);
assert(Math.abs(ranked[15].ioc - 0.03423918478632749) < 1e-12);
console.log(JSON.stringify({
  source: "LP2 p15 original 4x4 grid, pp16-22 original rune ciphertext",
  runes: N, blocks: N / 4,
  source_iv: sourceIV,
  original_source_ioc: ioc(original),
  source_english_plant_ioc: ioc(planted),
  allsecret_output_cbc_original_collisions: {
    iv_zero: collisionPairs(differenceBlocks(original, [0,0,0,0])),
    iv_p15_tail: collisionPairs(differenceBlocks(original, sourceIV))
  },
  corpus_disjoint_windows: controls.map(({name, windows, minimum,
    suffixMinimum}) => ({name, windows,
    min_plaintext_4block_collisions: minimum,
    min_after_discarding_first_block: suffixMinimum})),
  direct_hill_cbc_tested: direct.length,
  direct_best: ranked[0], direct_worst: ranked[15],
  conclusion: "Source-fixed Hill4 CBC inverses fail. Any fixed secret " +
    "bijective four-rune CBC-output map fails the bounded native-English " +
    "reference register. CBC-input with an unknown key is not excluded."
}, null, 2));
