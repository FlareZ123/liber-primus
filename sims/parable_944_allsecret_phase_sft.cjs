"use strict";

/**
 * All-secret equality test for a 944-rune public phase clock.
 *
 * Source route: the 2013 Cicada `number` operation reverses decimal
 * digits; the solved LP2 PARABLE heading has GP-prime sum 449, whose reversal
 * is 944 = 16 * 59. The 16-cell p15 spiral and the independently signed
 * 2016 message's 59-rune subdivision motivate testing this period, without
 * asserting that the creator intended it.
 *
 * At public phase h, either C_i = pi_h(P_i) or
 * (C_i - C_(i-1)) mod 29 = pi_h(P_i) for a completely arbitrary
 * secret permutation pi_h on 29 GP symbols. Within-phase equalities are
 * preserved under all 29! choices of pi_h, eliminating key guessing.
 *
 * Run: node sims/parable_944_allsecret_phase_sft.cjs
 * Read-only single-file test; source filenames are relative to repository.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeGP} = require("./exponent_feedback_lookup_attack.cjs");

const ROOT = path.resolve(__dirname, "..");
const PERIOD = 944;
const EXPECTED_LENGTH = 12956;
const REFS = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalPages = corpus.pages
  .filter(p => p.page < 56 && p.indices.length > 0)
  .map(p => p.indices);
const widths = originalPages.map(p => p.length);
const ciphertext = originalPages.flat();
assert.equal(widths.length, 55);
assert.equal(ciphertext.length, EXPECTED_LENGTH);
assert.equal(widths.reduce((a, b) => a + b, 0), EXPECTED_LENGTH);

/**
 * Produce within-physical-page differences. Page first positions remain
 * present for indexing but are excluded from the step-mode equality count.
 * @param {number[]} input
 * @returns {number[]}
 */
function differences(input) {
  const result = input.slice();
  let offset = 0;
  for (const width of widths) {
    for (let local = 1; local < width; local++)
      result[offset + local] =
        (input[offset + local] - input[offset + local - 1] + 29) % 29;
    offset += width;
  }
  return result;
}

/**
 * For a fixed public phase, secret bijections preserve every equality
 * among symbols at that phase. Returns exact *unordered* pair counts.
 * @param {number[]} input
 * @param {"book"|"page"} clock
 * @param {boolean} omitPageStarts
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function phasePairs(input, clock, omitPageStarts) {
  assert.equal(input.length, EXPECTED_LENGTH);
  const hist = Array.from({length: PERIOD}, () => new Uint16Array(29));
  let at = 0;
  for (const width of widths) {
    for (let local = 0; local < width; local++, at++) {
      if (omitPageStarts && local === 0) continue;
      const value = input[at];
      assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
      const phase = (clock === "book" ? at : local) % PERIOD;
      hist[phase][value]++;
    }
  }
  let equal = 0, pairs = 0;
  for (const row of hist) {
    let length = 0;
    for (const count of row) {
      length += count;
      equal += count * (count - 1) / 2;
    }
    pairs += length * (length - 1) / 2;
  }
  return {equal, pairs, rate: equal / pairs};
}

/** @returns {() => number} */
function seededRandom() {
  let x = 0x3301944;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

const rand = seededRandom();
const permutations = Array.from({length: PERIOD}, () => {
  const row = Array.from({length: 29}, (_, i) => i);
  for (let j = 28; j > 0; j--) {
    const k = rand() % (j + 1);
    [row[j], row[k]] = [row[k], row[j]];
  }
  assert.equal(new Set(row).size, 29);
  return row;
});

/**
 * Encode an authentic GP-English length-matched plant through arbitrary
 * *secret* phase-specific permutations, with optional chained transport.
 * @param {number[]} plaintext
 * @param {"book"|"page"} clock
 * @param {"raw"|"step"} family
 */
function plant(plaintext, clock, family) {
  const out = [];
  let at = 0;
  for (const width of widths) {
    for (let local = 0; local < width; local++, at++) {
      const phase = (clock === "book" ? at : local) % PERIOD;
      const v = permutations[phase][plaintext[at]];
      out.push(family === "step" && local > 0
        ? (out[at - 1] + v) % 29 : v);
    }
  }
  return out;
}

const original = {
  book: {
    raw: phasePairs(ciphertext, "book", false),
    step: phasePairs(differences(ciphertext), "book", true)
  },
  page: {
    raw: phasePairs(ciphertext, "page", false),
    step: phasePairs(differences(ciphertext), "page", true)
  }
};

assert.deepEqual(original.book.raw, {
  equal: 2907, pairs: 82524, rate: 2907 / 82524
});
assert.deepEqual(original.book.step, {
  equal: 2844, pairs: 81831, rate: 2844 / 81831
});
assert.deepEqual(original.page.raw, {
  equal: 10751, pairs: 311132, rate: 10751 / 311132
});
assert.deepEqual(original.page.step, {
  equal: 11006, pairs: 309647, rate: 11006 / 309647
});

const references = {};
let totalWindows = 0;
let minimumNative = Infinity;
for (const [name, source] of REFS) {
  const gp = encodeGP(read(source));
  const windows = [];
  for (let start = 0; start + EXPECTED_LENGTH <= gp.length;
       start += EXPECTED_LENGTH) {
    const plain = gp.slice(start, start + EXPECTED_LENGTH);
    const test = {};
    for (const clock of /** @type {const} */ (["book", "page"])) {
      test[clock] = {
        raw: phasePairs(plain, clock, false),
        step: phasePairs(plain, clock, true)
      };
      for (const family of /** @type {const} */ (["raw", "step"])) {
        const transformed = plant(plain, clock, family);
        const reread = family === "raw" ? transformed : differences(transformed);
        assert.deepEqual(
          phasePairs(reread, clock, family === "step"),
          test[clock][family],
          "Planted arbitrary per-phase secret permutation changed equality"
        );
        assert.ok(test[clock][family].rate > original[clock][family].rate,
          "Unexpected native window as flat as original for " +
          name + "/" + clock + "/" + family);
        minimumNative = Math.min(minimumNative, test[clock][family].rate);
      }
    }
    windows.push(test);
    totalWindows++;
  }
  /** @param {"book"|"page"} clock @param {"raw"|"step"} family */
  function bounds(clock, family) {
    const values = windows.map(w => w[clock][family].rate);
    return {min: Math.min(...values), max: Math.max(...values)};
  }
  references[name] = {
    runeCount: gp.length,
    disjointWindows: windows.length,
    book: {raw: bounds("book", "raw"), step: bounds("book", "step")},
    page: {raw: bounds("page", "raw"), step: bounds("page", "step")}
  };
}
assert.equal(totalWindows, 45);
process.stdout.write(JSON.stringify({
  hypothesis: "Source-motivated 449->944 decimal reversal, 944=16*59",
  family: "29-symbol arbitrary secret bijection per fixed public 944-phase",
  clock: "book-global or reset on each physical page",
  transport: "rune output or within-page first difference",
  original, references, totalWindows, minimumNative,
  plant: "All 180 arbitrary-secret raw/step phase plants preserve exact equality counts",
  interpretation: "The original phase fingerprints are below every " +
    "45 independently offset-matched GP-English control windows. " +
    "Reject these four direct-GP phase-permutation architectures " +
    "for comparable English plaintext. Hidden state, arbitrary " +
    "page-specific keys, non-GP intermediate registers, and an " +
    "aperiodic or differently indexed key remain open."
}, null, 2) + "\n");
