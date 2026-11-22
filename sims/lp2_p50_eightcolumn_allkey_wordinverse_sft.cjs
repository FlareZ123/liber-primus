"use strict";

/**
 * Source-nominated 8×362 LP2 whole-word inverse under ALL 8! secret
 * p50-column assignments, with fully charged maximum-score null.
 *
 * Original p50 has 8 printed columns; unknown LP2 contains exactly
 * 2896 complete printed words = 8×362. Test whether any permutation
 * of eight 362-word ciphertext columns restores native-GP English
 * adjacent printed-word-length grammar. Native-English controls are
 * encrypted under arbitrary column orders and inverted exactly.
 *
 * This is source-driven word-order cryptanalysis, not a rune decoder.
 * Read-only single-file Node22 CommonJS, compatible with Windows 11.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runes = new Set(gp.runes);
const originalText = read("resources/liber-primus/lp2-transcription.txt");
const CHAPTER_WORDS = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const W = 8, H = 362, N = W * H, K = 12;
const original = [];
let runesRead = 0, word = 0;
for (const ch of originalText) {
  if (runes.has(ch)) {
    word++; runesRead++;
    if (runesRead === 12956) {
      original.push(word);
      break;
    }
  } else if ("-.&".includes(ch) && word) {
    original.push(word);
    word = 0;
  }
}
assert.equal(runesRead, 12956);
assert.equal(original.length, N);
assert.equal(original.reduce((s, x) => s + x, 0), 12956);
assert.equal(CHAPTER_WORDS.reduce((s, x) => s + x, 0), N);
assert.equal(grid.bytes.length, 256);

/** @param {number} n @returns {number} */
const bin = n => Math.min(K - 1, n - 1);

/** @param {string} word @returns {number} */
function nativeGPLen(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);
  let count = 0;
  for (let i = 0; i < normalized.length;) {
    const n = normalized.startsWith("ING", i) ? 3
      : normalized.startsWith("IO", i) ? 2
      : (tokens.find(s => normalized.startsWith(s, i)) || "").length;
    assert(n > 0, "GP spelling for " + word);
    i += n; count++;
  }
  return count;
}

/** @param {string} text @returns {number[]} */
function sourceLengths(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(nativeGPLen);
}

const gibran = sourceLengths(read("resources/control/gibran_prophet_58585.txt"));
const shakespeare = sourceLengths(read("resources/control/shakespeare_first300k.txt"));
assert.deepEqual([gibran.length, shakespeare.length], [15733, 55407]);

// Use the identical frozen language score as the previous unkeyed 8-col SFT.
const pairs = Array.from({length: K}, () => Array(K).fill(0));
const lhs = Array(K).fill(0), rhs = Array(K).fill(0);
let total = 0;
for (const [lengths, count] of [[gibran, 8500], [shakespeare, 40000]]) {
  for (let i = 1; i < count; i++) {
    const a = bin(lengths[i - 1]), b = bin(lengths[i]);
    pairs[a][b]++; lhs[a]++; rhs[b]++; total++;
  }
}
const lr = pairs.map((row, a) => row.map((n, b) =>
  Math.log((n + 2) / (lhs[a] + 2 * K))
  - Math.log((rhs[b] + 2) / (total + 2 * K))));

/** @param {number[]} lengths @returns {number} */
function nativeScore(lengths) {
  let sum = 0;
  for (let i = 1; i < lengths.length; i++)
    sum += lr[bin(lengths[i - 1])][bin(lengths[i])];
  return sum / (lengths.length - 1);
}

/**
 * The observed ciphertext word register is eight consecutive 362-word
 * column blocks. A candidate output-column order is a permutation of the
 * block IDs. Precompute every across-row and row-seam pair likelihood.
 *
 * @param {number[]} seq
 * @returns {{along:Float64Array, seam:Float64Array}}
 */
function weights(seq) {
  assert.equal(seq.length, N);
  const along = new Float64Array(64), seam = new Float64Array(64);
  for (let a = 0; a < W; a++) {
    for (let b = 0; b < W; b++) {
      let x = 0, y = 0;
      for (let r = 0; r < H; r++) {
        x += lr[bin(seq[a * H + r])][bin(seq[b * H + r])];
        if (r + 1 < H)
          y += lr[bin(seq[a * H + r])][bin(seq[b * H + r + 1])];
      }
      along[a * W + b] = x;
      seam[a * W + b] = y;
    }
  }
  return {along, seam};
}

/** @param {number[]} order @param {{along:Float64Array,seam:Float64Array}} wt */
function evaluate(order, wt) {
  let sum = wt.seam[order[W - 1] * W + order[0]];
  for (let j = 1; j < W; j++)
    sum += wt.along[order[j - 1] * W + order[j]];
  return sum / (N - 1);
}

/** Build ALL 40,320 8-column orders once; do not fit a column key. */
const permutations = [];
/** @param {number[]} left @param {number[]} chosen */
function recurse(left, chosen) {
  if (!left.length) {
    permutations.push(chosen);
    return;
  }
  for (let i = 0; i < left.length; i++)
    recurse(left.filter((_, j) => i !== j), [...chosen, left[i]]);
}
recurse(Array.from({length: W}, (_, i) => i), []);
assert.equal(permutations.length, 40320);

/** @param {number[]} words @returns {{best:number,order:number[]}} */
function maxKeyed(words) {
  const wt = weights(words);
  let best = -Infinity, order = [];
  for (const p of permutations) {
    const score = evaluate(p, wt);
    if (score > best) {
      best = score;
      order = p;
    }
  }
  return {best, order};
}

/**
 * @param {number[]} seq
 * @param {number[]} columns
 * @returns {number[]}
 */
function decode(seq, columns) {
  const out = [];
  for (let r = 0; r < H; r++)
    for (const c of columns) out.push(seq[c * H + r]);
  return out;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} columns
 * @returns {number[]}
 */
function plant(plaintext, columns) {
  const encrypted = Array(N);
  for (let r = 0; r < H; r++)
    for (let j = 0; j < W; j++)
      encrypted[columns[j] * H + r] = plaintext[r * W + j];
  return encrypted;
}

const printedOrder = Array.from({length: W}, (_, i) => i);
const firstRow = grid.bytes.slice(0, W);
const ascending = printedOrder.slice().sort((a, b) =>
  firstRow[a] - firstRow[b]);
const descending = ascending.slice().reverse();
/** @param {number[]} arr @returns {number[]} */
function inverse(arr) {
  const out = Array(W);
  arr.forEach((x, i) => {out[x] = i;});
  return out;
}
const sourceOrders = [
  ["printed", printedOrder],
  ["first_row_ascending", ascending],
  ["first_row_descending", descending],
  ["inverse_ascending", inverse(ascending)],
  ["inverse_descending", inverse(descending)]
];
const originalWeights = weights(original);
const sourceScores = sourceOrders.map(([name, order]) =>
  ({name, order, score: evaluate(order, originalWeights)}));
const optimized = maxKeyed(original);
assert.equal(nativeScore(decode(original, optimized.order)),
  optimized.best);
const nativeComparators = [];
for (const [name, lengths, start] of [
  ["Gibran", gibran, 10000],
  ["Shakespeare", shakespeare, 45000]
]) {
  const text = lengths.slice(start, start + N);
  assert.equal(text.length, N);
  const cipher = plant(text, ascending);
  const recovered = decode(cipher, ascending);
  assert.deepEqual(recovered, text);
  const actual = maxKeyed(cipher);
  assert(actual.best + 1e-11 >= nativeScore(text));
  nativeComparators.push({name, plaintextScore:nativeScore(text),
    printedScore:nativeScore(cipher), best:actual.best,
    actualKeyScore: nativeScore(recovered), bestKey:actual.order});
}

let seed = 0x3301f0c5;
/** @returns {number} */
function random() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @param {number[]} arr @returns {number[]} */
function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const chapterParts = [];
let offset = 0;
for (const n of CHAPTER_WORDS) {
  chapterParts.push(original.slice(offset, offset + n));
  offset += n;
}
const trials = 500;
const nullMax = [];
for (let i = 0; i < trials; i++) {
  const shuffled = chapterParts.flatMap(shuffle);
  nullMax.push(maxKeyed(shuffled).best);
}
const nullTail = (1 + nullMax.filter(v => v >= optimized.best).length)
  / (trials + 1);
const nullMean = nullMax.reduce((a, b) => a + b, 0) / trials;
const sortedNull = nullMax.slice().sort((a, b) => a - b);
console.log(JSON.stringify({
  hypothesis:"p50 eight-column any-secret-key inverse, word lengths only",
  originalRUMES:12956,
  originalPrintedWords:N,
  sourceShape:[H,W],
  firstRow,
  sourceScores,
  observedPrinted:nativeScore(original),
  optimized,
  nulls:{count:trials,seed:"0x3301f0c5",mean:nullMean,
    min:sortedNull[0],median:sortedNull[Math.floor(trials/2)],
    max:sortedNull.at(-1),tail:nullTail},
  nativeComparators,
  status:"This source-shaped inverse alone supplies no GP plaintext letters"
}, null, 2));
