"use strict";

/**
 * Original 3299-rune floral body: primitive-root positional permutations
 * followed by all 29 one-tap GF29 feedback slopes and arbitrary secret
 * stationary GP29 alphabet. Source-native English necessary-condition test.
 * Run: node sims/lp2_floral3299_permuted_feedback_allsecret_sft.cjs
 * Node 22 CommonJS, no npm packages or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");
/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p57Plain = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert(p57Plain);
assert.deepEqual(encodeSourceNativeGP(p57Plain), corpus.pages[57].indices);

const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const redPrimes = [40, 53, 54].flatMap(page =>
  ink.pages.find(record => record.page === page).red_spans.flatMap(span =>
    [...span.runes].map(rune => corpus.prime[alphabet.get(rune)])));
assert.equal(redPrimes.length, 68);
assert.equal(redPrimes.reduce((sum, prime) => sum + prime, 0), 3294);
const modulus = 3299;
const generator = 3301 - 3294;
assert.equal(generator, 7);
const original = corpus.pages.slice(40, 56).flatMap(page =>
  page.indices.slice(page.page === 40 ? 8 : page.page === 54 ? 9 : 0));
assert.equal(original.length, modulus);
assert.equal(corpus.pages[50].indices.length, 0);

let power = 1;
const powers = [0];
for (let i = 1; i < modulus; i++) {
  powers.push(power);
  power = power * generator % modulus;
}
assert.equal(power, 1);
assert.equal(new Set(powers).size, modulus);
const invertedPowers = new Array(modulus);
for (let i = 0; i < modulus; i++) invertedPowers[powers[i]] = i;
const inv7 = 1414;
assert.equal(inv7 * 7 % modulus, 1);
const orders = {
  power: powers,
  powerInverse: invertedPowers,
  stride7: Array.from({length: modulus}, (_, i) => i * 7 % modulus),
  strideInverse: Array.from({length: modulus}, (_, i) => i * inv7 % modulus)
};
for (const perm of Object.values(orders)) {
  assert.equal(new Set(perm).size, modulus);
}

/** @param {number[]} values */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const x of values) bins[x]++;
  return bins.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number[]} values @param {number} a */
function feedback(values, a) {
  const output = [];
  for (let i = 1; i < values.length; i++) {
    output.push((values[i] - a * values[i - 1] + 29 * 29) % 29);
  }
  return output;
}

const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => ({name, values: encodeSourceNativeGP(read(file))}));
const sourceMinima = controls.map(({name, values}) => {
  let minimum = Infinity;
  let windows = 0;
  for (let start = 0; start + modulus <= values.length; start += 127) {
    minimum = Math.min(minimum, ioc(values.slice(start + 1, start + modulus)));
    windows++;
  }
  return {name, windows, minIoC: minimum, runes: values.length};
});

let champion;
const byPermutation = [];
for (const [name, perm] of Object.entries(orders)) {
  const restored = perm.map(position => original[position]);
  let best = {slope: null, ioc: -Infinity};
  for (let a = 0; a < 29; a++) {
    const current = ioc(feedback(restored, a));
    if (current > best.ioc) best = {slope: a, ioc: current};
  }
  const entry = {permutation: name, ...best};
  byPermutation.push(entry);
  if (!champion || champion.ioc < entry.ioc) champion = entry;
}
assert(champion.ioc < Math.min(...sourceMinima.map(row => row.minIoC)));

// Independently encoded native-English plant, 29! hidden-alphabet key space.
// h(p) = p^5+7 is a nonlinear GP29 bijection; a=17 is not plain differencing.
const text = controls[0].values.slice(0, modulus);
const h = Array.from({length: 29}, (_, i) => (i ** 5 + 7) % 29);
assert.equal(new Set(h).size, 29);
const hInverse = new Array(29);
h.forEach((value, i) => { hInverse[value] = i; });
const perm = orders.power;
const a = 17;
const steps = new Array(modulus);
steps[0] = h[text[0]];
for (let i = 1; i < modulus; i++) {
  steps[i] = (a * steps[i - 1] + h[text[i]]) % 29;
}
const encrypted = new Array(modulus);
for (let i = 0; i < modulus; i++) encrypted[perm[i]] = steps[i];
const restored = perm.map(index => encrypted[index]);
assert.deepEqual(feedback(restored, a).map(x => hInverse[x]), text.slice(1));
assert.equal(ioc(feedback(restored, a)), ioc(text.slice(1)));

console.log(JSON.stringify({
  status: "original finite native-GP negative; no new plaintext or key",
  source: {floralBodyRunes: original.length, redPrimeSum: 3294, generator: 7},
  scope: {permutations: 4, slopesPerPermutation: 29, secretAlphabets: "all 29!"},
  originalBest: champion, originalByPermutation: byPermutation,
  sourceControls: sourceMinima,
  positive: {p57ExactRunes: 95, plantedRecoveredRunes: 3298,
    plantedNonlinearAlphabet: true, plantedFeedbackSlope: 17}
}, null, 2));
