"use strict";
/**
 * LP2 4-rune radix-29 p-adic power-cipher exclusion.
 *
 * A cipher applying a fixed, unknown exponent e coprime to phi(29^4) to
 * each four-rune radix-29 integer preserves the collision count of one
 * visible rune per block, even if e, orientation, and phase vary by page.
 * Every source-native GP29 English plant is independently readable through
 * the same invariant. This test recovers no unknown LP2 plaintext or key.
 *
 * Run: node sims/lp2_base29_power_block_invariant.cjs
 * Node 22, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {plaintextWords} = require("./authentic_decryption_regression.cjs");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const DOC = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const PAGES = DOC.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices.slice());
assert.equal(PAGES.length, 55);
assert.equal(PAGES.flat().length, 12956);
const W = 4;
const RADIX = 29n;
const TOTIENT = 28n * 29n ** 3n;

/** @param {string} input @returns {number[]} */
function gp(input) {
  return plaintextWords(input).flat();
}

/**
 * Count symbol-equality pairs in the protected numeral place of complete
 * four-rune blocks. Any fixed unit-power exponent acts as a permutation
 * of that GP symbol, so this count is independent of the secret exponent.
 * @param {number[]} page
 * @param {number} phase
 * @param {boolean} littleEndian
 * @returns {{numerator:number,denominator:number,phase:number,littleEndian:boolean}}
 */
function protectedPairs(page, phase, littleEndian) {
  const frequencies = new Uint32Array(29);
  let n = 0;
  for (let start = phase; start + 3 < page.length; start += W) {
    const index = start + (littleEndian ? 0 : 3);
    frequencies[page[index]]++;
    n++;
  }
  let numerator = 0;
  for (const count of frequencies) numerator += count * (count - 1);
  return {numerator, denominator: n * (n - 1), phase, littleEndian};
}

/** @param {number[]} page */
function options(page) {
  const result = [];
  for (const littleEndian of [false, true])
    for (let phase = 0; phase < W; phase++)
      result.push(protectedPairs(page, phase, littleEndian));
  return result;
}

/**
 * Optimize a global pooled collision ratio over all 8^55 independently
 * selectable per-page phases/digit orientations in linear time per iteration.
 * Dinkelbach's fractional optimization reduces to one option per page.
 * An exact integer dual certificate establishes the chosen extremum.
 *
 * @param {number[][]} pages
 * @param {"min"|"max"} direction
 */
function exactExtreme(pages, direction) {
  const perPage = pages.map(options);
  const maximizing = direction === "max";
  let ratio = maximizing ? 0.02 : 0.08;
  let selected = [];
  let iterations = 0;
  for (; iterations < 100; iterations++) {
    selected = perPage.map(row => row.reduce((winner, candidate) => {
      const delta = (candidate.numerator - ratio * candidate.denominator) -
        (winner.numerator - ratio * winner.denominator);
      return (maximizing ? delta > 0 : delta < 0) ? candidate : winner;
    }));
    const numerator = selected.reduce((s, x) => s + x.numerator, 0);
    const denominator = selected.reduce((s, x) => s + x.denominator, 0);
    const next = numerator / denominator;
    if (next === ratio) break;
    ratio = next;
  }
  assert.ok(iterations < 100, "Dinkelbach convergence");
  const numerator = selected.reduce((s, x) => s + x.numerator, 0);
  const denominator = selected.reduce((s, x) => s + x.denominator, 0);
  assert.ok(denominator > 0);
  let dual = 0n;
  for (const row of perPage) {
    const values = row.map(x =>
      BigInt(x.numerator) * BigInt(denominator) -
      BigInt(numerator) * BigInt(x.denominator));
    dual += values.reduce((best, candidate) =>
      (maximizing ? candidate > best : candidate < best) ? candidate : best);
  }
  assert.equal(dual, 0n, "Exact global optimum certificate");
  return {
    numerator, denominator, ratio: numerator / denominator,
    iterations: iterations + 1,
    phaseSelection: Array.from({length: W}, (_, phase) =>
      selected.filter(x => x.phase === phase).length),
    orientationSelection: [false, true].map(littleEndian =>
      selected.filter(x => x.littleEndian === littleEndian).length),
    certified: true
  };
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {bigint} a @param {bigint} b */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} e @param {bigint} m */
function modularInverse(e, m) {
  let a = m, b = e, x = 0n, y = 1n;
  while (b !== 0n) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1n);
  return (x % m + m) % m;
}

/** @param {bigint} base @param {bigint} exp @param {bigint} m */
function modPow(base, exp, m) {
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = result * base % m;
    base = base * base % m;
    exp >>= 1n;
  }
  return result;
}

/**
 * Radix-29 valuation-preserving unit-power automorphism modulo 29^4.
 * For a multiple of 29, raise its unit part modulo 29^(4-valuation).
 * This avoids the lossy ordinary exponentiation of zero divisors.
 * @param {bigint} x
 * @param {bigint} exponent
 */
function powerMap(x, exponent) {
  if (x === 0n) return 0n;
  let valuation = 0;
  while (x % RADIX === 0n) {
    x /= RADIX;
    valuation++;
  }
  const factor = RADIX ** BigInt(valuation);
  const modulus = RADIX ** BigInt(W - valuation);
  return factor * modPow(x, exponent, modulus);
}

/** @param {number[]} block @param {boolean} littleEndian */
function pack(block, littleEndian) {
  const digits = littleEndian ? block.slice().reverse() : block;
  return digits.reduce((n, v) => n * RADIX + BigInt(v), 0n);
}

/** @param {bigint} x @param {boolean} littleEndian */
function unpack(x, littleEndian) {
  const digits = Array(W).fill(0);
  for (let j = W - 1; j >= 0; j--) {
    digits[j] = Number(x % RADIX);
    x /= RADIX;
  }
  assert.equal(x, 0n);
  return littleEndian ? digits.reverse() : digits;
}

/**
 * @param {number[]} values
 * @param {bigint} exponent
 * @param {boolean} littleEndian
 */
function mapBlocks(values, exponent, littleEndian) {
  const output = values.slice();
  for (let i = 0; i + W <= values.length; i += W) {
    const block = values.slice(i, i + W);
    const mapped = unpack(powerMap(pack(block, littleEndian), exponent),
      littleEndian);
    for (let j = 0; j < W; j++) output[i + j] = mapped[j];
  }
  return output;
}

function originalPowerControls(sources) {
  const english = sources[0].runes.slice(180000, 180000 + 12956);
  assert.equal(english.length, 12956);
  const tests = [];
  for (const exponent of [1033n, 3301n]) {
    assert.equal(gcd(exponent, TOTIENT), 1n);
    const inverse = modularInverse(exponent, TOTIENT);
    for (const littleEndian of [false, true]) {
      const cipher = mapBlocks(english, exponent, littleEndian);
      const recovered = mapBlocks(cipher, inverse, littleEndian);
      assert.deepEqual(recovered, english, "Exact positive plaintext recovery");
      const sourceDigit = protectedPairs(english, 0, littleEndian);
      const cipherDigit = protectedPairs(cipher, 0, littleEndian);
      assert.equal(sourceDigit.numerator, cipherDigit.numerator);
      assert.equal(sourceDigit.denominator, cipherDigit.denominator);
      let exactOriginalRecipher = 0;
      for (const page of PAGES) {
        const decrypted = mapBlocks(page, inverse, littleEndian);
        const reencryption = mapBlocks(decrypted, exponent, littleEndian);
        assert.deepEqual(reencryption, page);
        exactOriginalRecipher += page.length;
      }
      tests.push({
        exponent: String(exponent),
        littleEndian,
        plantedPlaintextRunesRecovered: recovered.length,
        originalCiphertextRunesReencrypted: exactOriginalRecipher,
        protectedSourceRatio: sourceDigit.numerator / sourceDigit.denominator,
        protectedCipherRatio: cipherDigit.numerator / cipherDigit.denominator
      });
    }
  }
  return tests;
}

/** @param {string} sourceName @param {string} rel */
function reference(sourceName, rel) {
  const text = read(rel);
  const runes = gp(text);
  const bank = new Map();
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const codes = gp(word);
    if (!bank.has(codes.length)) bank.set(codes.length, []);
    bank.get(codes.length).push(codes);
  }
  return {sourceName, runes, bank};
}

/** @param {number[]} series */
function summary(series) {
  return {
    min: Math.min(...series),
    max: Math.max(...series),
    mean: series.reduce((a, b) => a + b, 0) / series.length
  };
}

function main() {
  const originalMax = exactExtreme(PAGES, "max");
  const originalMin = exactExtreme(PAGES, "min");
  assert.equal(originalMax.numerator, 7530);
  assert.equal(originalMax.denominator, 192452);
  assert.equal(originalMin.numerator, 5776);
  assert.equal(originalMin.denominator, 192504);
  const sourceReferences = [
    reference("Shakespeare", "resources/control/shakespeare_first300k.txt"),
    reference("Emerson", "resources/control/emerson_essays_2944.txt"),
    reference("Gibran", "resources/control/gibran_prophet_58585.txt")
  ];
  assert.deepEqual(sourceReferences.map(s => s.runes.length),
    [218800, 324630, 63114]);
  const controls = [];
  const random = rng(0x3301ea27);
  const words = parseSharedCorpus().words;
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((s, word) => s + word.length, 0), 12956);
  for (const src of sourceReferences) {
    const contiguous = [];
    const wordMatched = [];
    for (let trial = 0; trial < 256; trial++) {
      const plantPages = PAGES.map(page => {
        const at = random() % (src.runes.length - page.length + 1);
        return src.runes.slice(at, at + page.length);
      });
      contiguous.push(exactExtreme(plantPages, "min").ratio);
    }
    for (let trial = 0; trial < 128; trial++) {
      const full = words.flatMap(word => {
        const items = src.bank.get(word.length);
        assert.ok(items?.length, "Missing source GP word length");
        return items[random() % items.length];
      });
      assert.equal(full.length, 12956);
      let offset = 0;
      const plantPages = PAGES.map(page => {
        const segment = full.slice(offset, offset + page.length);
        offset += page.length;
        return segment;
      });
      assert.equal(offset, 12956);
      wordMatched.push(exactExtreme(plantPages, "min").ratio);
    }
    assert.ok(Math.min(...contiguous) > originalMax.ratio);
    assert.ok(Math.min(...wordMatched) > originalMax.ratio);
    controls.push({
      source: src.sourceName,
      availableSourceRunes: src.runes.length,
      contiguous256: summary(contiguous),
      nativeWordShape128: summary(wordMatched),
      sourceWindowsAtOrBelowStrongestOriginal: 0
    });
  }
  return {
    classification: "Exact key-independent 4-rune p-adic power-family invariant; no unsolved LP2 plaintext or authentic key recovered",
    nativeOriginalInput: "55 original rune-bearing physical LP2 pages, 12956 GP29 runes",
    candidate: "29^4 p-adic unit-power mapping on complete 4-rune blocks; arbitrary secret exponent coprime to 28*29^3, independent page-specific secret exponents, phase and digit orientation",
    evaluatedPagePhaseOrientationCombinations: "8^55, optimized exactly",
    originalMostEnglishLike: originalMax,
    originalLeastEnglishLike: originalMin,
    independentGPSourceControls: controls,
    exactForwardInverseControls: originalPowerControls(sourceReferences),
    conclusion: "The protected GP rune's equality profile stays near 1/29 even under adversarial page-specific orientations and phases; independent native-English controls remain far more collision-rich under every corresponding choice. Incompatible with single-layer fixed-exponent 4-rune p-adic power encoding of these source-language controls. Unknown per-block exponents, a separate whitening layer or a nonnative plaintext register remain open."
  };
}
if (require.main === module)
  console.log(JSON.stringify(main(), null, 2));
module.exports = {main, protectedPairs, exactExtreme, powerMap, mapBlocks};
