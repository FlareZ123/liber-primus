"use strict";
/**
 * Arbitrary-exponent-per-block 4-rune p-adic cipher gate.
 *
 * Every unit power x^e mod 29 with gcd(e,28)=1 preserves the multiplicative
 * order of x in F29*. This is true even when every block selects a different,
 * completely unknown e. The zero rune is its own preserved class.
 *
 * A source-trained integer log-likelihood ratio scores the protected digit's
 * seven immutable classes. All 8^55 per-page phase/orientation selections are
 * optimized exactly, with BigInt dual certificates; controls use native GP.
 *
 * Run: node sims/lp2_base29_orderclass_anyblock_power.cjs
 * Node >=22, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {plaintextWords} = require("./authentic_decryption_regression.cjs");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {powerMap} = require("./lp2_base29_power_block_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const PAGES = JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .pages.filter(p => p.page < 56 && p.indices.length).map(p => p.indices);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.flat().length, 12956);
const N = 29, TOTIENT = 28n * 29n ** 3n;
const ORDERS = [0, 1, 2, 4, 7, 14, 28];

/** @param {number} value */
function multiplicativeOrder(value) {
  if (value === 0) return 0;
  let s = value, order = 1;
  while (s !== 1) {s = s * value % N; order++;}
  assert.ok(28 % order === 0);
  return order;
}
const category = Array.from({length: N}, (_, i) =>
  ORDERS.indexOf(multiplicativeOrder(i)));
assert.ok(category.every(i => i >= 0));
assert.deepEqual(ORDERS.map((_, j) => category.filter(k => k === j).length),
  [1, 1, 1, 2, 6, 6, 12]);

/** @param {string} name */
function source(name) {
  const text = read(name);
  const words = (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(word => plaintextWords(word)[0]);
  const runes = words.flat();
  const bank = new Map();
  for (const word of words) {
    if (!bank.has(word.length)) bank.set(word.length, []);
    bank.get(word.length).push(word);
  }
  return {runes, bank};
}

/**
 * Fixed reference weights: 1000*log[P_Shakespeare(order class)/P_uniform(order class)],
 * rounded to nearest integer. Never fitted to unknown LP2 ciphertext.
 * @param {number[]} training
 */
function sourceWeights(training) {
  const totals = new Uint32Array(ORDERS.length);
  for (const symbol of training) totals[category[symbol]]++;
  return ORDERS.map((_, j) => Math.round(1000 * Math.log(
    (totals[j] / training.length) /
    (category.filter(k => k === j).length / N)
  )));
}
const REFERENCES = [
  ["Shakespeare", source("resources/control/shakespeare_first300k.txt")],
  ["Emerson", source("resources/control/emerson_essays_2944.txt")],
  ["Gibran", source("resources/control/gibran_prophet_58585.txt")]
];
assert.deepEqual(REFERENCES.map(x => x[1].runes.length),
  [217644, 323083, 62696]);
const WEIGHTS = sourceWeights(REFERENCES[0][1].runes);
assert.deepEqual(WEIGHTS, [-529, 380, -1525, -1347, 141, -83, 138]);

/**
 * @param {number[]} page
 * @param {number} phase
 * @param {boolean} littleEndian
 */
function orderClassScore(page, phase, littleEndian) {
  let numerator = 0, denominator = 0;
  for (let start = phase; start + 4 <= page.length; start += 4) {
    const symbol = page[start + (littleEndian ? 0 : 3)];
    numerator += WEIGHTS[category[symbol]];
    denominator++;
  }
  return {numerator, denominator, phase, littleEndian};
}
/** @param {number[]} page */
function options(page) {
  const o = [];
  for (const littleEndian of [false, true])
    for (let phase = 0; phase < 4; phase++)
      o.push(orderClassScore(page, phase, littleEndian));
  return o;
}

/**
 * Exact max/min of the pooled order-class source-likelihood score across
 * all 8^55 independent page phase/orientation choices.
 * @param {number[][]} pages
 * @param {"min"|"max"} direction
 */
function exactExtreme(pages, direction) {
  const opts = pages.map(options), max = direction === "max";
  let ratio = max ? -2e3 : 2e3;
  let chosen = [], iteration = 0;
  for (; iteration < 60; iteration++) {
    chosen = opts.map(row => row.reduce((winner, candidate) => {
      const delta =
        (candidate.numerator - ratio * candidate.denominator) -
        (winner.numerator - ratio * winner.denominator);
      return (max ? delta > 0 : delta < 0) ? candidate : winner;
    }));
    const s = chosen.reduce((total, x) => total + x.numerator, 0);
    const n = chosen.reduce((total, x) => total + x.denominator, 0);
    const next = s / n;
    if (Math.abs(next - ratio) < 1e-12) break;
    ratio = next;
  }
  assert.ok(iteration < 60, "ratio iteration converged");
  const numerator = chosen.reduce((s, x) => s + x.numerator, 0);
  const denominator = chosen.reduce((s, x) => s + x.denominator, 0);
  let dual = 0n;
  for (const row of opts) {
    const vals = row.map(x =>
      BigInt(x.numerator) * BigInt(denominator) -
      BigInt(numerator) * BigInt(x.denominator));
    dual += vals.reduce((best, candidate) =>
      (max ? candidate > best : candidate < best) ? candidate : best);
  }
  assert.equal(dual, 0n, "exact globally optimal selection");
  return {numerator, denominator, scorePer1000: numerator / denominator / 1000,
    iterations: iteration + 1, certified: true};
}

/** @param {number} seed */
function rng(seed) {
  let s = seed >>> 0;
  return () => {s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return s >>> 0;};
}

/**
 * @param {bigint} e
 * @param {bigint} modulus
 */
function modularInverse(e, modulus) {
  let [a, b, x, y] = [modulus, e, 0n, 1n];
  while (b) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1n);
  return (x % modulus + modulus) % modulus;
}
/** @param {number[]} values @param {boolean} littleEndian */
function pack(values, littleEndian) {
  const digits = littleEndian ? values.slice().reverse() : values;
  return digits.reduce((x, digit) => x * 29n + BigInt(digit), 0n);
}
/** @param {bigint} x @param {boolean} littleEndian */
function unpack(x, littleEndian) {
  const digits = new Array(4);
  for (let j = 3; j >= 0; j--) {digits[j] = Number(x % 29n); x /= 29n;}
  assert.equal(x, 0n);
  return littleEndian ? digits.reverse() : digits;
}

/**
 * Every block has its own e in a deterministic, undisclosed per-block schedule.
 * @param {number[]} page
 * @param {boolean} littleEndian
 * @param {boolean} decrypt
 */
function varyingPowerMap(page, littleEndian, decrypt = false) {
  const output = page.slice();
  const keys = [1033n, 3301n], inverses = keys.map(e => modularInverse(e, TOTIENT));
  for (let start = 0; start + 4 <= page.length; start += 4) {
    const k = (start / 4) % keys.length;
    const exponent = decrypt ? inverses[k] : keys[k];
    const block = output.slice(start, start + 4);
    const mapped = unpack(powerMap(pack(block, littleEndian), exponent), littleEndian);
    for (let j = 0; j < 4; j++) output[start + j] = mapped[j];
  }
  return output;
}

function positives() {
  const runs = [];
  for (const littleEndian of [false, true]) {
    let recovery = 0, originalRecovery = 0, classPreservation = 0;
    const plant = REFERENCES[0][1].runes.slice(180000, 180000 + 12956);
    let offset = 0;
    for (const page of PAGES) {
      const plaintext = plant.slice(offset, offset + page.length);
      offset += page.length;
      const ciphertext = varyingPowerMap(plaintext, littleEndian);
      const inverse = varyingPowerMap(ciphertext, littleEndian, true);
      assert.deepEqual(inverse, plaintext);
      recovery += inverse.length;
      const originalCipher = varyingPowerMap(page, littleEndian);
      assert.deepEqual(varyingPowerMap(originalCipher, littleEndian, true), page);
      originalRecovery += page.length;
      const originalClass = orderClassScore(plaintext, 0, littleEndian);
      const cipherClass = orderClassScore(ciphertext, 0, littleEndian);
      assert.equal(originalClass.numerator, cipherClass.numerator);
      classPreservation += plaintext.length;
    }
    assert.equal(offset, 12956);
    runs.push({littleEndian, plantedPlaintextRecovered: recovery,
      originalCiphertextReencrypted: originalRecovery,
      originalClassPositionsPreserved: classPreservation});
  }
  return runs;
}
function summary(values) {
  return {min: Math.min(...values), max: Math.max(...values),
    mean: values.reduce((s, x) => s + x, 0) / values.length};
}
function main() {
  const originalMax = exactExtreme(PAGES, "max");
  const originalMin = exactExtreme(PAGES, "min");
  const random = rng(0x3301ea27);
  const lengths = parseSharedCorpus().words.map(w => w.length);
  assert.equal(lengths.length, 2896);
  assert.equal(lengths.reduce((s, n) => s + n, 0), 12956);
  const controls = [];
  for (const [name, src] of REFERENCES) {
    const contiguous = [], matched = [];
    for (let trial = 0; trial < 256; trial++) {
      const pages = PAGES.map(page => {
        const at = random() % (src.runes.length - page.length + 1);
        return src.runes.slice(at, at + page.length);
      });
      contiguous.push(exactExtreme(pages, "min").scorePer1000);
    }
    for (let trial = 0; trial < 128; trial++) {
      const full = lengths.flatMap(length => {
        const options = src.bank.get(length);
        assert.ok(options?.length);
        return options[random() % options.length];
      });
      let offset = 0;
      const pages = PAGES.map(page => {
        const out = full.slice(offset, offset + page.length);
        offset += page.length;
        return out;
      });
      assert.equal(offset, 12956);
      matched.push(exactExtreme(pages, "min").scorePer1000);
    }
    assert.ok(Math.min(...contiguous) > originalMax.scorePer1000);
    assert.ok(Math.min(...matched) > originalMax.scorePer1000);
    controls.push({source: name, availableSourceRunes: src.runes.length,
      contiguous256AdversarialMinimum: summary(contiguous),
      originalWordShape128AdversarialMinimum: summary(matched),
      countAtOrBelowStrongestOriginal: 0});
  }
  return {
    classification: "Exact GP29 multiplicative-order invariant under fully varying per-block unit exponents; source-native-English exclusion only, no authentic LP2 key or plaintext",
    source: "55 original rune-bearing unsolved physical LP2 pages, 12956 runes",
    model: "Four-rune radix-29 valuation-preserving unit powers; exponent may change adversarially every block, phase and orientation are independent on every page",
    immutableClasses: ORDERS,
    classSupport: ORDERS.map((order, j) => ({order,
      originalRuneIndices: category.flatMap((k, i) => k === j ? [i] : [])})),
    sourceOnlyShakespeareWeightsTimes1000: WEIGHTS,
    allPagePhaseOrientations: "8^55, exact dual-certified extrema",
    originalMax, originalMin,
    independentSourceControls: controls,
    forwardInversePositive: positives(),
    conclusion: "No variable per-block valid exponent can change the protected digit's multiplicative-order class. The most source-like original ratio is below the least source-like ratio in all 1152 original-shape GP-English references. Direct single-layer radix29 4-rune power model is strongly unsupported, even with arbitrary per-block exponents."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {main, exactExtreme, multiplicativeOrder, orderClassScore};
