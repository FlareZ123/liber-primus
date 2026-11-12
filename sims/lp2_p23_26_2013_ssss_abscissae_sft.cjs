"use strict";

/**
 * SFT: source-bounded original LP2 p23-26 five-of-ten Shamir GP29 gate.
 * Run: node sims/lp2_p23_26_2013_ssss_abscissae_sft.cjs
 *
 * Source premise: 2013 Cicada genuinely employed five-of-ten secret sharing.
 * The original LP2 p23 five dots, red16 heading, and 1005 body runes suggest
 * (but do not prove) a 201 x 5 five-share input. Over GF(29), enumerate
 * every ordered distinct choice of five x identifiers from historical
 * numbered slots 1..10. This is a complete search within that exact family.
 *
 * Source controls are GP-orthographically approximated ordinary-English text,
 * so exclusion is limited to DIRECT native-English GP29 output. The test
 * deliberately does not promote a 2013->2014 cipher link as established.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const section = corpus.pages.slice(23, 27);
assert.deepEqual(section.map((p) => p.page), [23, 24, 25, 26]);
assert.deepEqual(section.map((p) => p.indices.length), [213, 270, 273, 265]);
assert.deepEqual(section[0].indices.slice(0, 16),
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const body = section.flatMap((p) => p.indices).slice(16);
assert.equal(body.length, 1005);

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let out = 1;
  for (let n = exponent, b = mod(base); n > 0; n >>= 1, b = mod(b * b)) {
    if (n & 1) out = mod(out * b);
  }
  return out;
}

/** @param {number[]} xs @returns {number[]} GF29 interpolation at x=0. */
function weights(xs) {
  assert.equal(xs.length, 5);
  assert.equal(new Set(xs).size, 5);
  return xs.map((xi, i) => {
    let numerator = 1;
    let denominator = 1;
    for (let j = 0; j < 5; j++) {
      if (j === i) continue;
      numerator = mod(numerator * (-xs[j]));
      denominator = mod(denominator * (xi - xs[j]));
    }
    return mod(numerator * power(denominator, 27));
  });
}

/** @returns {Array<{xs: number[], w: number[]}>} */
function allShareWeights() {
  const distinct = new Map();
  /** @param {number[]} xs */
  function visit(xs) {
    if (xs.length === 5) {
      const w = weights(xs);
      const key = w.join(",");
      if (!distinct.has(key)) distinct.set(key, {xs, w});
      return;
    }
    for (let x = 1; x <= 10; x++) {
      if (!xs.includes(x)) visit([...xs, x]);
    }
  }
  visit([]);
  assert.equal(distinct.size, 24730);
  return [...distinct.values()];
}

/** @param {number[][]} groups @param {number[]} w @returns {number[]} */
function decode(groups, w) {
  return groups.map((g) => mod(
    g[0] * w[0] + g[1] * w[1] + g[2] * w[2] +
    g[3] * w[3] + g[4] * w[4]));
}

/** @param {number[]} symbols @returns {number} */
function collisionNumerator(symbols) {
  const f = new Uint16Array(29);
  for (const v of symbols) f[v]++;
  let n = 0;
  for (const count of f) n += count * (count - 1);
  return n;
}

/**
 * @param {number[][]} groups
 * @param {Array<{xs:number[],w:number[]}>} keys
 */
function strongest(groups, keys) {
  let best = {numerator: -1, xs: [], w: [], output: []};
  for (const key of keys) {
    const out = decode(groups, key.w);
    const n = collisionNumerator(out);
    if (n > best.numerator) {
      best = {numerator: n, xs: key.xs, w: key.w, output: out};
    }
  }
  return best;
}

/** @param {number[]} symbols @returns {string} */
const asGP = (symbols) => symbols.map((x) => corpus.translit[x]).join("");

const printed = Array.from({length: 201}, (_, i) =>
  body.slice(i * 5, i * 5 + 5));
const fiveBlocks = Array.from({length: 201}, (_, i) =>
  Array.from({length: 5}, (_, j) => body[j * 201 + i]));
const keys = allShareWeights();
const original = [
  ["printed quintets", strongest(printed, keys)],
  ["five contiguous 201-rune blocks", strongest(fiveBlocks, keys)]
];
for (const [name, result] of original) {
  assert.equal(result.numerator, 1664);
  console.log(name + ": maximum IoC=" +
    (result.numerator / (201 * 200)).toFixed(9) +
    "; representative x=" + JSON.stringify(result.xs) +
    "; GF29 weights=" + JSON.stringify(result.w));
  console.log("  original decoded prefix=" + asGP(result.output).slice(0, 120));
}

/**
 * Exhaust all stationary five-input GF29 affine decoders without any
 * assumption about share identifiers. For any nonzero coefficient sum t,
 * dividing all coefficients by t gives a sum-one vector; field rescaling
 * preserves the output histogram and IoC. For sum zero, nonzero vectors
 * are equivalent up to any nonzero field multiplier; test one representative
 * per class by requiring its first nonzero coefficient to equal one.
 *
 * Any additive output constant and any subsequent global rune permutation
 * preserve IoC too. The all-zero vector always yields a constant, so it is
 * excluded as a non-decoder.
 *
 * @param {number[][]} groups
 */
function entireAffineFiveFold(groups) {
  const maxBySum = [
    {numerator: -1, weights: [], count: 0},
    {numerator: -1, weights: [], count: 0}
  ];
  const freq = new Uint16Array(29);
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let c = 0; c < 29; c++) {
        for (let d = 0; d < 29; d++) {
          const sum = ((a + b + c + d) % 29);
          for (let which = 0; which < 2; which++) {
            const e = mod(which - sum);
            const weights = [a, b, c, d, e];
            if (which === 0) {
              const first = weights.find((n) => n !== 0);
              if (first !== 1) continue;
            }
            const result = maxBySum[which];
            result.count++;
            freq.fill(0);
            for (const group of groups) {
              freq[(
                a * group[0] + b * group[1] + c * group[2] +
                d * group[3] + e * group[4]
              ) % 29]++;
            }
            let numerator = 0;
            for (const n of freq) numerator += n * (n - 1);
            if (numerator > result.numerator) {
              result.numerator = numerator;
              result.weights = weights;
            }
          }
        }
      }
    }
  }
  assert.equal(maxBySum[0].count, 25260);
  assert.equal(maxBySum[1].count, 707281);
  return maxBySum;
}

const affine = [
  ["printed quintets", entireAffineFiveFold(printed)],
  ["five contiguous blocks", entireAffineFiveFold(fiveBlocks)]
];
assert.deepEqual(affine.map((x) => x[1].map((y) => y.numerator)),
  [[1696, 1788], [1688, 1770]]);
for (const [name, results] of affine) {
  console.log(name + ": all nonconstant affine GF29 folds, " +
    "maximum 201-rune IoC=" +
    (Math.max(...results.map((x) => x.numerator)) / 40200).toFixed(9));
  console.log("  zero-sum (25260 scale classes): " + JSON.stringify(results[0]));
  console.log("  nonzero-sum (707281 normalized keys): " +
    JSON.stringify(results[1]));
}
const allAffineOriginalMax = 1788;

// This covers every nonconstant original 5-rune affine fold mod29: nonzero
// coefficient sum scales to one, while zero-sum vectors are classified
// separately by nonzero scalar equivalence. Reading order, an arbitrary
// constant, and a fixed secret GP29 relabeling do not change IoC.

// The GP29 letter mapping includes the common Futhorc digraphs. Exotic
// English letters K,Q,V,Z use conventional approximate C,C,U,S aliases.
// Controls are an explicit orthographic calibration, not exact 2014 plaintext.
const letters = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5,
  L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26, Z:15
};
const digraphs = {TH:2, NG:21, EO:12, OE:22, EA:28, AE:25, IA:27};

/** @param {string} input @returns {number[]} */
function approximateEnglishGP(input) {
  const s = input.toUpperCase().replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (digraphs[pair] !== undefined) {
      out.push(digraphs[pair]);
      i += 2;
    } else {
      out.push(letters[s[i]]);
      i++;
    }
  }
  return out;
}

/** @param {number[]} text @returns {{min:number, windows:number, below:number}} */
function sliding201Control(text) {
  assert.ok(text.length >= 201);
  const freq = new Uint16Array(29);
  for (let i = 0; i < 201; i++) freq[text[i]]++;
  let numerator = collisionNumerator(text.slice(0, 201));
  let min = numerator, below = 0, windows = 0;
  for (let i = 0; i + 201 <= text.length; i++) {
    if (i !== 0) {
      const old = text[i - 1], added = text[i + 200];
      numerator -= 2 * (freq[old] - 1);
      freq[old]--;
      numerator += 2 * freq[added];
      freq[added]++;
    }
    if (numerator < min) min = numerator;
    if (numerator <= allAffineOriginalMax) below++;
    windows++;
  }
  return {min, windows, below};
}

const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
];
for (const [name, file] of controls) {
  const values = approximateEnglishGP(read(file));
  const s = sliding201Control(values);
  assert.ok(s.min > allAffineOriginalMax, "control is not separated: " + name);
  assert.equal(s.below, 0);
  console.log(name + ": GP runes=" + values.length +
    ", 201-rune sliding windows=" + s.windows +
    ", minimum IoC=" + (s.min / (201 * 200)).toFixed(9) +
    ", windows at/below original maximum=" + s.below);
}

/** Reproducible positive plant with five shares per genuine GP symbol. */
let seed = 0x3301c1ca;
/** @returns {number} */
function randomMod29() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % 29;
}
const known = approximateEnglishGP(read(controls[0][1])).slice(5000, 5201);
const xs = [1, 2, 3, 4, 5];
const plant = known.map((secret) => {
  const a = [secret, randomMod29(), randomMod29(),
    randomMod29(), randomMod29()];
  return xs.map((x) => {
    let out = 0;
    for (let j = 4; j >= 0; j--) out = mod(out * x + a[j]);
    return out;
  });
});
assert.deepEqual(decode(plant, weights(xs)), known);
const bestPlant = strongest(plant, keys);
assert.ok(bestPlant.numerator >= collisionNumerator(known));
assert.ok(collisionNumerator(known) > allAffineOriginalMax);
console.log("positive GP29 five-share plant: exact 201/201 recovery, all-key IoC scan successful");
console.log("source-keyspace: 10P5 = 30,240 ordered inputs, " + keys.length +
  " distinct at-zero GF29 coefficient vectors, both original layouts tested");
console.log("Decision: this finite historical 2013 five-of-ten direct GP29 " +
  "transfer and its entire stationary affine GF29 five-input superset " +
  "cannot produce ordinary native-English output on original pp23-26.");
