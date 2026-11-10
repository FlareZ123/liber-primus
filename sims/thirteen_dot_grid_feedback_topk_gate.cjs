"use strict";

/**
 * All-secret two-tap / 13-dot-fragment / 8-phase alphabet majorization gate.
 *
 * Node.js 22 CommonJS single-file test:
 *   node sims/thirteen_dot_grid_feedback_topk_gate.cjs
 *
 * Tests the FULL original 12,956-rune LP2 input without selecting a key.
 * Uses the source segmentation and causal two-tap reversible cipher exactly
 * as defined in thirteen_dot_grid_8phase_allkey_capacity.cjs.
 *
 * For every (fragment, phase) state the affine feedback coefficients a,b
 * are completely secret and independent. The output GP29 permutation at
 * each state is also entirely unrestricted. For any chosen set of k GP
 * plaintext runes, maximizing all k counts is EXACTLY the largest sum of
 * k transformed ciphertext-bucket counts. State independence makes the
 * global maximum the sum of those 224 state-wise optima.
 *
 * Original evidence is a bounded negative. Synthetic reencryption is only
 * an implementation check and does not authenticate an LP2 key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  sourceSpans, nativeGP, syntheticFeedbackKeys, feedbackTransform
} = require("./thirteen_dot_grid_8phase_allkey_capacity.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const { plaintextBoundary, spans } = sourceSpans();
assert.equal(original.length, 12956);
assert.equal(plaintextBoundary, original.length);
const FIELD = 29;
const PERIOD = 8;

/**
 * Exact all-secret frequency majorization bounds U[k] on any specified set
 * of k plaintext GP symbols, over all a,b in F29 and all secret per-state
 * GP29 permutations. U[0] is zero; U[29] equals total input length.
 * @param {number[]} cipher Original or planted ciphertext in GP indices.
 * @param {[number, number][]} segments Original punctuation source spans.
 * @param {0|1|2} taps Zero, one or two secret ciphertext feedback taps.
 * @returns {number[]} U[0..29].
 */
function allSecretTopK(cipher, segments, taps) {
  const upper = new Int32Array(FIELD + 1);
  let states = 0;
  for (const [start, end] of segments.slice(0, 28)) {
    for (let phase = 0; phase < PERIOD; phase++) {
      const triples = [];
      for (let i = start + phase; i < end; i += PERIOD)
        triples.push([cipher[i], i > start ? cipher[i - 1] : 0,
          i > start + 1 ? cipher[i - 2] : 0]);
      const best = new Int32Array(FIELD + 1);
      const counts = new Uint16Array(FIELD);
      for (let a = 0; a < (taps >= 1 ? FIELD : 1); a++) {
        for (let b = 0; b < (taps === 2 ? FIELD : 1); b++) {
          counts.fill(0);
          for (const [current, previous, second] of triples)
            counts[(current + a * previous + b * second) % FIELD]++;
          const ordered = Array.from(counts).sort((x, y) => y - x);
          let accumulated = 0;
          for (let k = 1; k <= FIELD; k++) {
            accumulated += ordered[k - 1];
            if (accumulated > best[k]) best[k] = accumulated;
          }
        }
      }
      for (let k = 1; k <= FIELD; k++) upper[k] += best[k];
      states++;
    }
  }
  assert.equal(states, 224);
  assert.equal(upper[FIELD], cipher.length);
  return Array.from(upper);
}

/** Ranked cumulative frequencies for one known GP-plaintext window. */
function rankedCumulative(plain) {
  const counts = new Uint32Array(FIELD);
  for (const symbol of plain) counts[symbol]++;
  const ordered = Array.from(counts).sort((a, b) => b - a);
  const out = new Array(FIELD + 1).fill(0);
  for (let k = 1; k <= FIELD; k++)
    out[k] = out[k - 1] + ordered[k - 1];
  return out;
}

/**
 * Exact census of EVERY source-text window of original length. A single
 * symbol substitution changes any set's count by at most one. Consequently
 * max_k(T_window[k]-U[k]) is a rigorous lower bound on how many plaintext
 * symbols must change before that window can fit the proposed cipher.
 * @param {number[]} text Source-native GP token sequence.
 * @param {number} width Length of original LP2 ciphertext.
 * @param {number[]} upper Exact original all-secret top-k bounds.
 */
function scanNativeWindows(text, width, upper) {
  assert.ok(text.length >= width);
  const counts = new Uint32Array(FIELD);
  for (let i = 0; i < width; i++) counts[text[i]]++;
  const minimumTopK = new Array(FIELD + 1).fill(Number.POSITIVE_INFINITY);
  let nearestRequiredEdits = Infinity;
  let nearestOffset = -1;
  let compatibleWindows = 0;
  let maxRequiredEdits = 0;
  for (let start = 0; start + width <= text.length; start++) {
    const sorted = Array.from(counts).sort((a, b) => b - a);
    let total = 0;
    let requiredEdits = 0;
    for (let k = 1; k <= FIELD; k++) {
      total += sorted[k - 1];
      if (total < minimumTopK[k]) minimumTopK[k] = total;
      requiredEdits = Math.max(requiredEdits, total - upper[k]);
    }
    if (requiredEdits < nearestRequiredEdits) {
      nearestRequiredEdits = requiredEdits;
      nearestOffset = start;
    }
    maxRequiredEdits = Math.max(maxRequiredEdits, requiredEdits);
    if (requiredEdits === 0) compatibleWindows++;
    if (start + width < text.length) {
      counts[text[start]]--;
      counts[text[start + width]]++;
    }
  }
  return {
    gpRunes: text.length, windows: text.length - width + 1,
    compatibleWindows, nearestRequiredEdits, nearestOffset,
    maxRequiredEdits,
    minimumTop3: minimumTopK[3], minimumTop12: minimumTopK[12],
    minimumTop16: minimumTopK[16]
  };
}

function main() {
  const zero = allSecretTopK(original, spans, 0);
  const one = allSecretTopK(original, spans, 1);
  const two = allSecretTopK(original, spans, 2);
  assert.deepEqual([zero[1], one[1], two[1]], [989, 1298, 1548]);
  assert.deepEqual([two[2], two[3], two[12], two[16], two[29]],
    [2468, 3296, 8540, 10185, 12956]);

  const references = {};
  const paths = {
    Shakespeare: "resources/control/shakespeare_first300k.txt",
    Gibran: "resources/control/gibran_prophet_58585.txt",
    Emerson: "resources/control/emerson_essays_2944.txt"
  };
  for (const [name, filename] of Object.entries(paths)) {
    references[name] = scanNativeWindows(
      nativeGP(read(filename)), original.length, two);
    assert.equal(references[name].compatibleWindows, 0);
  }
  assert.deepEqual(Object.values(references).map(r => r.windows),
    [204689, 49741, 310128]);
  assert.deepEqual(Object.values(references).map(r => r.nearestRequiredEdits),
    [1262, 1357, 1468]);

  // Full model-native, source-native English positive control.
  const shakespeare = nativeGP(read(paths.Shakespeare));
  const plaintext = shakespeare.slice(25000, 25000 + original.length);
  const keys = syntheticFeedbackKeys(spans, 2);
  const planted = feedbackTransform(plaintext, spans, keys, false);
  const decoded = feedbackTransform(planted, spans, keys, true);
  assert.deepEqual(decoded, plaintext);
  assert.deepEqual(feedbackTransform(decoded, spans, keys, false), planted);
  const plantUpper = allSecretTopK(planted, spans, 2);
  const trueCumulative = rankedCumulative(plaintext);
  for (let k = 1; k <= FIELD; k++)
    assert.ok(trueCumulative[k] <= plantUpper[k],
      "Secret-key planted plaintext violates all-secret upper bound at k=" + k);
  const arbitraryOriginalDecryption =
    feedbackTransform(original, spans, keys, true);
  assert.deepEqual(
    feedbackTransform(arbitraryOriginalDecryption, spans, keys, false),
    original);

  return {
    evidence: "key-independent conditional original-source exclusion",
    original: {
      runes: original.length, sourceFragments: 28, phaseColumns: 8,
      independentlyKeyedStates: 224, coefficientsPerState: 841,
      topKBounds: two.slice(1)
    },
    references,
    nativeControl: {
      truePlaintextRunes: plaintext.length,
      fullyRecovered: decoded.length,
      fullyReencrypted: planted.length,
      plantedTop3: plantUpper[3],
      actualPlaintextTop3: trueCumulative[3],
      wrongKeyOriginalRoundtrip: original.length
    },
    interpretation: "All three finite native-GP reference corpora are " +
      "excluded under the source-defined 28x8 two-tap direct-plaintext " +
      "model even with 224 unrestricted GP29 permutations and all 841 " +
      "coefficient pairs per state. Changing the source state, segmentation, " +
      "intermediate register or plaintext genre remains possible."
  };
}

if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = { allSecretTopK, rankedCumulative, scanNativeWindows, main };
