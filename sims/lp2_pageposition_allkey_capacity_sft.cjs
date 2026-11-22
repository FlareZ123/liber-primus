"use strict";

/**
 * Original LP2 all-secret page-position substitution capacity.
 * Single runnable test: node sims/lp2_pageposition_allkey_capacity_sft.cjs
 *
 * Any secret GP29 permutation shared at a given printed-page rune offset is
 * admitted, independently for all 277 offsets. A separate, more restrictive
 * family is an arbitrary GP29 permutation per continuous-book phase, with
 * an unknown period from 1 through the p50 table's 256 cells.
 *
 * The exact majorization bounds below require no key fitting and no
 * assumption that ciphertext GP labels represent plaintext directly.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { nativeGP } = require("./thirteen_dot_grid_8phase_allkey_capacity.cjs");
const {
  rankedCumulative,
  scanNativeWindows
} = require("./thirteen_dot_grid_feedback_topk_gate.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const PAGES = source.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const FULL = PAGES.flat();
const FIELD = 29;
const PAGE_WIDTH = Math.max(...PAGES.map(p => p.length));
assert.equal(PAGES.length, 55);
assert.equal(FULL.length, 12956);
assert.equal(PAGE_WIDTH, 277);

/**
 * Exact upper bound on appearances of any fixed k-symbol plaintext subset.
 * Every state has a completely independent unknown 29-rune permutation.
 *
 * @param {Uint16Array[]} hist Per-state ciphertext histograms
 * @returns {number[]} U[0..29], with U[29]=12956
 */
function majorization(hist) {
  const bound = new Int32Array(FIELD + 1);
  for (const bucket of hist) {
    const frequencies = Array.from(bucket).sort((a, b) => b - a);
    let sum = 0;
    for (let k = 1; k <= FIELD; k++) {
      sum += frequencies[k - 1];
      bound[k] += sum;
    }
  }
  return Array.from(bound);
}

/** All shared but otherwise unconstrained page-local substitution alphabets. */
function pagePositionBound(cipherPages) {
  const width = Math.max(...cipherPages.map(page => page.length));
  const hist = Array.from({ length: width }, () => new Uint16Array(FIELD));
  for (const page of cipherPages)
    for (let i = 0; i < page.length; i++) hist[i][page[i]]++;
  return majorization(hist);
}

/** All shared continuous-book permutation alphabets at period p. */
function continuousPeriodBound(cipher, period) {
  const hist = Array.from({ length: period }, () => new Uint16Array(FIELD));
  for (let i = 0; i < cipher.length; i++)
    hist[i % period][cipher[i]]++;
  return majorization(hist);
}

/**
 * Exact minimum, across all unaltered source windows, of the largest
 * frequency of any one GP symbol. This is a one-pass sliding count.
 * @param {number[]} text Native GP indices
 * @param {number} length Rune window width
 */
function minimumDominantCount(text, length) {
  const counts = new Uint32Array(FIELD);
  for (let i = 0; i < length; i++) counts[text[i]]++;
  let minimum = Number.POSITIVE_INFINITY;
  for (let i = 0; i + length <= text.length; i++) {
    minimum = Math.min(minimum, Math.max(...counts));
    if (i + length < text.length) {
      counts[text[i]]--;
      counts[text[i + length]]++;
    }
  }
  return minimum;
}

function syntheticPositive(native) {
  const plain = native.slice(110000, 110000 + FULL.length);
  assert.equal(plain.length, FULL.length);

  // Deterministic unbiased-enough PRNG for a test fixture; not cryptographic.
  let seed = 0x33012770;
  const rand = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  const keys = Array.from({ length: PAGE_WIDTH }, () => {
    const enc = Array.from({ length: FIELD }, (_, i) => i);
    for (let i = FIELD - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [enc[i], enc[j]] = [enc[j], enc[i]];
    }
    const dec = new Array(FIELD);
    enc.forEach((value, key) => { dec[value] = key; });
    return { enc, dec };
  });

  const plantedPages = [];
  const decoded = [];
  let offset = 0;
  for (const page of PAGES) {
    const enc = [];
    for (let i = 0; i < page.length; i++) {
      const input = plain[offset++];
      const output = keys[i].enc[input];
      enc.push(output);
      assert.equal(keys[i].dec[output], input);
      decoded.push(keys[i].dec[output]);
    }
    plantedPages.push(enc);
  }
  assert.equal(offset, FULL.length);
  assert.deepEqual(decoded, plain);
  const reencryption = decoded.map(() => 0);
  offset = 0;
  for (const page of PAGES)
    for (let i = 0; i < page.length; i++)
      reencryption[offset] = keys[i].enc[decoded[offset++]];
  assert.deepEqual(reencryption, plantedPages.flat());
  const bound = pagePositionBound(plantedPages);
  const truePlainFrequency = rankedCumulative(plain);
  for (let k = 1; k <= FIELD; k++)
    assert.ok(bound[k] >= truePlainFrequency[k],
      "genuine secret-permutation plaintext must pass majorization");

  return {
    plantedPlaintextRunes: plain.length,
    exactlyDecoded: decoded.length,
    exactlyReencrypted: reencryption.length,
    trueTop12: truePlainFrequency[12],
    encryptedTop12Capacity: bound[12]
  };
}

function main() {
  const originalBound = pagePositionBound(PAGES);
  assert.equal(originalBound[1], 1277);
  assert.equal(originalBound[12], 9160);
  assert.equal(originalBound[16], 10846);
  assert.equal(originalBound[29], 12956);

  const maximalContinuous = new Int32Array(FIELD + 1);
  const attaining = new Int32Array(FIELD + 1);
  for (let p = 1; p <= 256; p++) {
    const bound = continuousPeriodBound(FULL, p);
    for (let k = 1; k <= FIELD; k++) {
      if (bound[k] > maximalContinuous[k]) {
        maximalContinuous[k] = bound[k];
        attaining[k] = p;
      }
    }
  }
  assert.equal(maximalContinuous[1], 1273);
  assert.equal(attaining[1], 252);
  assert.equal(maximalContinuous[12], 9069);
  assert.equal(attaining[12], 256);

  const controls = {};
  const texts = {
    Shakespeare: "resources/control/shakespeare_first300k.txt",
    Gibran: "resources/control/gibran_prophet_58585.txt",
    Emerson: "resources/control/emerson_essays_2944.txt"
  };
  const expected = {
    Shakespeare: [204689, 1404, 9651, 631, 147886],
    Gibran: [49741, 1414, 9897, 751, 42748],
    Emerson: [310128, 1486, 9986, 871, 152728]
  };
  let nativeShakespeare;
  for (const [name, file] of Object.entries(texts)) {
    const native = nativeGP(read(file));
    if (name === "Shakespeare") nativeShakespeare = native;
    const score = scanNativeWindows(native, FULL.length, originalBound);
    const minimumMostFrequentRune = minimumDominantCount(native, FULL.length);
    assert.equal(score.windows, expected[name][0]);
    assert.equal(minimumMostFrequentRune, expected[name][1]);
    assert.equal(score.minimumTop12, expected[name][2]);
    assert.equal(score.nearestRequiredEdits, expected[name][3]);
    assert.equal(score.nearestOffset, expected[name][4]);
    assert.equal(score.compatibleWindows, 0);
    controls[name] = {
      gpRunes: score.gpRunes,
      windows: score.windows,
      minTop1: minimumMostFrequentRune,
      minTop12: score.minimumTop12,
      nearestRequiredEdits: score.nearestRequiredEdits,
      nearestOffset: score.nearestOffset
    };
  }
  // Any source of the printed 256-phase key that only replaces the
  // secret permutation at each clock phase stays below the controls.
  assert.ok(maximalContinuous[12] < controls.Shakespeare.minTop12);
  assert.ok(originalBound[12] < controls.Shakespeare.minTop12);

  const positive = syntheticPositive(nativeShakespeare);
  const result = {
    pageCount: PAGES.length,
    runeCount: FULL.length,
    sourcePageMaxRunes: PAGE_WIDTH,
    unrestrictedPagePosition: {
      maxOnePlaintextSymbol: originalBound[1],
      top12PlaintextSymbols: originalBound[12],
      top16PlaintextSymbols: originalBound[16]
    },
    continuousPeriodsOneThrough256: {
      maxOne: maximalContinuous[1],
      maxOnePeriod: attaining[1],
      maxTop12: maximalContinuous[12],
      maxTop12Period: attaining[12]
    },
    independentNativeTextControls: controls,
    sourceTrueSecretPermutationControl: positive
  };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = { majorization, pagePositionBound, continuousPeriodBound };
