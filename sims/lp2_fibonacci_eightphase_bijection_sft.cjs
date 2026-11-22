"use strict";

/**
 * Original LP2 eight-phase differential, all-secret-bijection gate.
 *
 * Claim tested: C[i]-C[i-1] (mod 29) is a bijective substitution of
 * P[i], optionally using one independent secret permutation for each
 * printed-page-and-position-modulo-eight slot.
 *
 * Second, distinct claim: the difference is a bijection of
 * P[i]-P[i-8] (mod 29); its eight-lag output equalities are key-invariant.
 *
 * Both are source-motivated hypotheses, not authenticated Cicada ciphers.
 * SFT: node sims/lp2_fibonacci_eightphase_bijection_sft.cjs
 * CommonJS, Node 20+, no external packages or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const FIB = new Set([0, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(N, 12956);
assert.equal(pages.length, 55);

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} input @returns {number[]} */
function nativeGP(input) {
  const clean = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, "native GP token");
      output.push(token.i);
      i += token.s.length;
    }
  }
  return output;
}

/**
 * @param {number[]} flat
 * @returns {{page:number,indices:number[]}[]}
 */
function assignPages(flat) {
  assert.equal(flat.length, N);
  let offset = 0;
  return pages.map(p => {
    const result = {page: p.page, indices: flat.slice(offset, offset + p.indices.length)};
    offset += p.indices.length;
    return result;
  });
}

/**
 * @param {{page:number,indices:number[]}[]} pieces
 * @param {"delta"|"native"|"lag8diff"} mode
 * @param {boolean} fibOnly
 * @param {boolean} pageSpecific
 * @returns {{n:number,pairs:number,hits:number,rate:number}}
 */
function phaseCollisions(pieces, mode, fibOnly = false, pageSpecific = false) {
  const classes = new Map();
  let n = 0;
  for (const p of pieces) {
    if (fibOnly && !FIB.has(p.page)) continue;
    const x = p.indices;
    for (let i = mode === "lag8diff" ? 8 : 1; i < x.length; i++) {
      const output = mode === "native" ? x[i]
        : mode === "lag8diff" ? (x[i] - x[i - 8] + 29) % 29
          : (x[i] - x[i - 1] + 29) % 29;
      const phase = (i - 1) % 8;
      const state = pageSpecific ? String(p.page) + ":" + phase : String(phase);
      let row = classes.get(state);
      if (!row) { row = new Uint32Array(29); classes.set(state, row); }
      row[output]++;
      n++;
    }
  }
  let pairs = 0, hits = 0;
  for (const row of classes.values()) {
    const m = row.reduce((s, x) => s + x, 0);
    pairs += m * (m - 1) / 2;
    hits += row.reduce((s, x) => s + x * (x - 1) / 2, 0);
  }
  return {n, pairs, hits, rate: hits / pairs};
}

/**
 * Equality at offset eight is preserved by ANY secret bijection
 * used for that eight-phase slot. Includes zero-valued differences.
 *
 * @param {{page:number,indices:number[]}[]} pieces
 * @param {"delta"|"lag8diff"} mode
 * @param {boolean} fibOnly
 * @returns {{n:number,hits:number,rate:number}}
 */
function lagEightEqualities(pieces, mode, fibOnly = false) {
  let n = 0, hits = 0;
  for (const p of pieces) {
    if (fibOnly && !FIB.has(p.page)) continue;
    const x = p.indices;
    const value = i => mode === "delta"
      ? (x[i] - x[i - 1] + 29) % 29
      : (x[i] - x[i - 8] + 29) % 29;
    for (let i = 16; i < x.length; i++) {
      n++;
      hits += Number(value(i) === value(i - 8));
    }
  }
  return {n, hits, rate: hits / n};
}

const actual = [
  phaseCollisions(pages, "delta"),
  phaseCollisions(pages, "delta", true),
  phaseCollisions(pages, "delta", false, true),
  phaseCollisions(pages, "delta", true, true),
  lagEightEqualities(pages, "delta"),
  lagEightEqualities(pages, "delta", true)
];
assert.deepEqual(actual.map(x => [x.hits, x.pairs, x.n]), [
  [366695, 10396697, 12901],
  [12128, 339910, 2336],
  [6859, 192687, 12901],
  [1237, 35013, 2336],
  [407, undefined, 12076],
  [43, undefined, 2186]
]);

const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 32],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 8],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 49]
];
const observedRaw = actual.slice(0, 4).map(x => x.rate);
const observedFibonacciLag8 = actual[5].rate;
let windows = 0, rejectedDirect = 0, rejectedLag8 = 0;
const limits = {
  direct: [Infinity, Infinity, Infinity, Infinity],
  lag8: Infinity,
  lag8marginal: {min: Infinity, max: -Infinity, belowSource: 0}
};
const perCorpus = [];
for (const [name, file, expected] of corpora) {
  const native = nativeGP(read(file));
  let count = 0, directBelow = 0, lag8Below = 0;
  for (let start = 0; start + N <= native.length; start += Math.floor(N / 2)) {
    const control = assignPages(native.slice(start, start + N));
    const raw = [
      phaseCollisions(control, "native"),
      phaseCollisions(control, "native", true),
      phaseCollisions(control, "native", false, true),
      phaseCollisions(control, "native", true, true)
    ];
    raw.forEach((x, i) => { limits.direct[i] = Math.min(limits.direct[i], x.rate); });
    const passedDirect = raw.some((x, i) => x.rate <= observedRaw[i]);
    const eight = lagEightEqualities(control, "lag8diff", true);
    limits.lag8 = Math.min(limits.lag8, eight.rate);
    const phase = phaseCollisions(control, "lag8diff", true, true).rate;
    limits.lag8marginal.min = Math.min(limits.lag8marginal.min, phase);
    limits.lag8marginal.max = Math.max(limits.lag8marginal.max, phase);
    limits.lag8marginal.belowSource += Number(phase <=
      phaseCollisions(pages, "delta", true, true).rate);
    directBelow += Number(passedDirect);
    lag8Below += Number(eight.rate <= observedFibonacciLag8);
    count++;
  }
  assert.equal(count, expected, name);
  perCorpus.push({name, windows: count, directBelow, lag8Below});
  windows += count;
  rejectedDirect += directBelow;
  rejectedLag8 += lag8Below;
}
assert.equal(windows, 89);
assert.equal(rejectedDirect, 0);
assert.equal(rejectedLag8, 0);
assert(limits.direct[0] > observedRaw[0]);
assert(limits.direct[1] > observedRaw[1]);
assert(limits.direct[2] > observedRaw[2]);
assert(limits.direct[3] > observedRaw[3]);
assert(limits.lag8 > observedFibonacciLag8);
assert(limits.lag8marginal.belowSource > 0,
  "Eight-lag transformed plaintext marginal can match; equality still fails");

// Positive controls: an arbitrary secret phase permutation preserves exactly
// the empirical conditional collision table and all same-phase equalities.
let rng = 0x330148;
const next = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng; };
const perms = Array.from({length: 8}, () => {
  const a = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = next() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
});
const inverse = perms.map(p => {
  const a = new Array(29);
  p.forEach((value, i) => { a[value] = i; });
  return a;
});
const control = nativeGP(read(corpora[1][1])).slice(0, 2600);
assert.equal(control.length, 2600);
let cipher = [17];
for (let i = 1; i < control.length; i++) {
  const d = perms[(i - 1) % 8][control[i]];
  cipher.push((cipher[i - 1] + d) % 29);
  assert.equal(inverse[(i - 1) % 8][(cipher[i] - cipher[i - 1] + 29) % 29],
    control[i]);
}
const simplePlain = [{page: 0, indices: control}];
const simpleCipher = [{page: 0, indices: cipher}];
const a = phaseCollisions(simplePlain, "native");
const b = phaseCollisions(simpleCipher, "delta");
assert.deepEqual([a.hits, a.pairs], [b.hits, b.pairs]);
let cipher8 = Array.from({length: 8}, (_, i) => i + 1);
for (let i = 8; i < control.length; i++) {
  const d = (control[i] - control[i - 8] + 29) % 29;
  cipher8.push((cipher8[i - 1] + perms[(i - 1) % 8][d]) % 29);
}
const q8control = [{page: 0, indices: cipher8}];
assert.equal(lagEightEqualities(simplePlain, "lag8diff").hits,
  lagEightEqualities(q8control, "delta").hits);

console.log(JSON.stringify({
  interpretation: "finite native-GP controls; no LP2 plaintext or key",
  originals: {
    fullEightPhase: actual[0],
    fibonacciEightPhase: actual[1],
    pageSpecificEightPhase: actual[2],
    fibonacciPageSpecificEightPhase: actual[3],
    lagEightAll: actual[4],
    lagEightFibonacci: actual[5]
  },
  controlWindowCount: windows, perCorpus, controlMinimums: limits,
  sourceNativeDirectAtOrBelow: rejectedDirect,
  sourceNativeEightLagEqualityAtOrBelow: rejectedLag8,
  syntheticKnownKeyInverse: true
}, null, 2));
