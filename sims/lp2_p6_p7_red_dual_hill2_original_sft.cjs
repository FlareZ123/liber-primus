"use strict";
/**
 * Source-only Hill-2 test for original LP2 p6/p7 red certificates.
 * Single-file test: node sims/lp2_p6_p7_red_dual_hill2_original_sft.cjs
 * The p6/p7 marker-bracketed 308-rune interval has two source-visible
 * red four-word blocks. Freeze their word sums/products before decoding.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const alpha = new Map(gp.runes.map((r, i) => [r, i]));
const latin = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const MOD = 29;

/** @param {number} value */
const mod = value => ((value % MOD) + MOD) % MOD;

/**
 * Extract complete word rune values or rune offsets, respecting authentic
 * printed word punctuation while ignoring line breaks.
 * @param {number} page
 * @param {number} from
 * @param {number} to
 * @param {boolean} positions
 * @returns {number[][]}
 */
function words(page, from, to, positions = false) {
  let offset = 0;
  let current = [];
  const output = [];
  for (const ch of transcript[page]) {
    const value = alpha.get(ch);
    if (value !== undefined) {
      if (offset >= from && offset < to) {
        current.push(positions ? offset - from : value);
      }
      offset++;
    } else if ("-.$&§".includes(ch) && offset >= from && offset <= to) {
      if (current.length) output.push(current);
      current = [];
    }
  }
  if (current.length) output.push(current);
  return output;
}

/** @param {number[]} sequence */
const sum = sequence => sequence.reduce((a, b) => a + b, 0);
/** @param {number[]} sequence */
const product = sequence => sequence.reduce((a, b) => mod(a * b), 1);
/** @param {number[]} matrix */
const det = matrix => mod(matrix[0] * matrix[3] - matrix[1] * matrix[2]);
/** @param {number[]} matrix */
function inverse(matrix) {
  const d = det(matrix);
  const inv = Array.from({length: MOD}, (_, i) => i).find(x => mod(d * x) === 1);
  assert.notEqual(inv, undefined, "matrix is singular");
  return [matrix[3], -matrix[1], -matrix[2], matrix[0]].map(x => mod(x * inv));
}
/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  return [
    mod(a[0] * b[0] + a[1] * b[2]),
    mod(a[0] * b[1] + a[1] * b[3]),
    mod(a[2] * b[0] + a[3] * b[2]),
    mod(a[2] * b[1] + a[3] * b[3]),
  ];
}
/** @param {number[]} matrix @param {number[]} input */
function apply(matrix, input) {
  assert.equal(input.length % 2, 0, "Hill2 input must have even length");
  const output = [];
  for (let i = 0; i < input.length; i += 2) {
    output.push(
      mod(matrix[0] * input[i] + matrix[1] * input[i + 1]),
      mod(matrix[2] * input[i] + matrix[3] * input[i + 1]),
    );
  }
  return output;
}
/** @param {number[]} input */
function normalizedIC(input) {
  const hist = Array(MOD).fill(0);
  for (const n of input) hist[n]++;
  return MOD * hist.reduce((s, n) => s + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {string} source @returns {number[]|null} */
function native(source) {
  const token = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < token.length;) {
    if (token.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (token.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const match = latin.find(x => token.startsWith(x.s, i));
      if (!match) return null;
      result.push(match.i);
      i += match.s.length;
    }
  }
  return result;
}
const dictionary = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const encoded = native(match[1]);
  if (encoded) dictionary.add(encoded.join(","));
}
assert.equal(dictionary.size, 29060);

/* The original red four-word sequences are the independent key inputs. */
const red6 = words(6, 71, 82);
const red7 = words(7, 194, 208);
assert.deepEqual(red6.map(sum), [71, 19, 65, 26]);
assert.deepEqual(red7.map(sum), [26, 65, 23, 42, 53]);
assert.deepEqual(red6.map(product), [13, 19, 14, 23]);
assert.deepEqual(red7.map(product), [11, 26, 8, 15, 2]);
const keys6 = {
  sum: red6.slice(0, 4).map(w => mod(sum(w))),
  product: red6.slice(0, 4).map(product),
};
const keys7 = {
  sum: red7.slice(0, 4).map(w => mod(sum(w))),
  product: red7.slice(0, 4).map(product),
};
assert.deepEqual(Object.values(keys6).map(det), [2, 4]);
assert.deepEqual(Object.values(keys7).map(det), [3, 15]);
assert.equal(mod(det(keys7.product) * product(red7[4])), 1);

/* Marker-enclosed body; both sides are even, so the printed page seam is
 * itself a Hill2 pair boundary. Its one carried word is joined for scoring.
 */
const p6 = gp.pages[6].indices.slice(82);
const p7 = gp.pages[7].indices.slice(0, 194);
assert.equal(gp.pages[6].indices.length, 196);
assert.equal(gp.pages[7].indices.length, 208);
assert.equal(p6.length, 114);
assert.equal(p7.length, 194);
const cipher = [...p6, ...p7];
const pos6 = words(6, 82, 196, true);
const pos7 = words(7, 0, 194, true).map(w => w.map(x => x + 114));
const boundaryMerged = [...pos6[pos6.length - 1], ...pos7[0]];
assert.equal(boundaryMerged.length, 3);
const positions = [...pos6.slice(0, -1), boundaryMerged, ...pos7.slice(1)];
const longWords = positions.filter(w => w.length >= 4);
assert.equal(cipher.length, 308);
assert.equal(longWords.length, 40);

/* The authentic solved parable is a separate positive round-trip source. */
const control = gp.pages[57].indices.slice(0, 94);
assert.equal(control.length, 94);
for (const matrix of [...Object.values(keys6), ...Object.values(keys7)]) {
  assert.deepEqual(apply(inverse(matrix), apply(matrix, control)), control);
  assert.deepEqual(apply(matrix, apply(inverse(matrix), control)), control);
}
const results = [];
/** @param {string} label @param {number[]} values */
function record(label, values) {
  const hits = longWords.filter(w => dictionary.has(w.map(i => values[i]).join(","))).length;
  results.push({label, hits, longWords: longWords.length, normalizedIC: normalizedIC(values)});
}
for (const [name6, k6] of Object.entries(keys6)) {
  for (const [name7, k7] of Object.entries(keys7)) {
    /* Page-local matrix, natural pair phase zero at each printed page. */
    for (const d6 of ["inverse", "forward"]) {
      for (const d7 of ["inverse", "forward"]) {
        const a6 = d6 === "inverse" ? inverse(k6) : k6;
        const a7 = d7 === "inverse" ? inverse(k7) : k7;
        const v6 = apply(a6, p6), v7 = apply(a7, p7);
        assert.deepEqual(apply(inverse(a6), v6), p6);
        assert.deepEqual(apply(inverse(a7), v7), p7);
        record("perpage_" + name6 + "_" + name7 + "_" + d6 + "_" + d7,
          [...v6, ...v7]);
      }
    }
    /* Two-stage Hill2 over all 308 source runes, in each original red order. */
    for (const order of ["6then7", "7then6"]) {
      const composite = order === "6then7" ? multiply(k6, k7) : multiply(k7, k6);
      for (const direction of ["inverse", "forward"]) {
        const decoder = direction === "inverse" ? inverse(composite) : composite;
        const decoded = apply(decoder, cipher);
        assert.deepEqual(apply(inverse(decoder), decoded), cipher);
        record("two_round_" + name6 + "_" + name7 + "_" + order + "_" + direction,
          decoded);
      }
    }
  }
}
assert.equal(results.length, 32);
assert.equal(Math.max(...results.map(x => x.hits)), 0);
const bestIC = Math.max(...results.map(x => x.normalizedIC));
const worstIC = Math.min(...results.map(x => x.normalizedIC));
assert(Math.abs(bestIC - 1.0709843902026313) < 1e-10);
assert(Math.abs(worstIC - 0.9710013113921909) < 1e-10);
console.log(JSON.stringify({
  sourceRunes: cipher.length,
  originalNormalizedIC: normalizedIC(cipher),
  matrixDeterminants: {
    p6_sum: det(keys6.sum), p6_product: det(keys6.product),
    p7_sum: det(keys7.sum), p7_product: det(keys7.product),
  },
  variants: results.length,
  fourRuneOrLongerOriginalWords: longWords.length,
  maxDictionaryHits: Math.max(...results.map(x => x.hits)),
  normalizedIC_range: [worstIC, bestIC],
  bestIC_variant: results.find(x => x.normalizedIC === bestIC),
  solvedControlSymbols: control.length,
}, null, 2));
