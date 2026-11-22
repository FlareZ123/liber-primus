"use strict";

/**
 * Exact source-original three-tap, all-secret, top-k GP29 capacity theorem.
 * Source is the 31 authentic 13-dot punctuations and original 12,956 runes.
 * The 28 unsolved source fragments × 8 local phases each have arbitrary,
 * independent coefficients a,b,z in F29 and arbitrary 29-way permutation.
 *
 * Run: node sims/thirteen_dot_grid_three_tap_topk_gate.cjs
 * Node 22, CommonJS, read-only. No authentic plaintext/key is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { sourceSpans, nativeGP } =
  require("./thirteen_dot_grid_8phase_allkey_capacity.cjs");
const { allSecretTopK, rankedCumulative, scanNativeWindows } =
  require("./thirteen_dot_grid_feedback_topk_gate.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
const { spans, plaintextBoundary } = sourceSpans();
const FIELD = 29;
const PERIOD = 8;
assert.equal(original.length, 12956);
assert.equal(plaintextBoundary, original.length);

/**
 * The sharp attainable upper bound U[k] on the occurrence count of ANY
 * fixed set of k plaintext symbols for the entire three-tap family.
 *
 * For each source state s=(13-dot fragment, position mod8), form
 * D_i=(C_i+a_s*C_(i-1)+b_s*C_(i-2)+z_s*C_(i-3)) mod29,
 * with C before each fragment set to zero. Every state independently
 * chooses any a,b,z in F29 and any GP29 output permutation. Therefore
 * for each k, its exact optimum is the maximum over all 29^3 triples of
 * the cumulative count in the k most populous D buckets, and the global
 * exact optimum sums these independent state maxima. No fitted language
 * model, finite key list, or constraints on secret permutations are used.
 *
 * @param {number[]} cipher
 * @param {[number, number][]} segments
 * @returns {number[]} U[0..29].
 */
function allSecretThreeTapTopK(cipher, segments) {
  const upper = new Int32Array(FIELD + 1);
  let states = 0, populatedStates = 0;
  for (const [start, end] of segments.slice(0, 28)) {
    for (let phase = 0; phase < PERIOD; phase++) {
      states++;
      const n = Math.max(0, Math.ceil((end - start - phase) / PERIOD));
      if (!n) continue;
      populatedStates++;
      const c0 = new Uint8Array(n), c1 = new Uint8Array(n);
      const c2 = new Uint8Array(n), c3 = new Uint8Array(n);
      for (let j = 0; j < n; j++) {
        const i = start + phase + PERIOD * j;
        c0[j] = cipher[i];
        c1[j] = i > start ? cipher[i - 1] : 0;
        c2[j] = i > start + 1 ? cipher[i - 2] : 0;
        c3[j] = i > start + 2 ? cipher[i - 3] : 0;
      }

      const best = new Int32Array(FIELD + 1);
      const base = new Uint8Array(n);
      const counts = new Uint16Array(FIELD);
      const bucketOfCount = new Uint8Array(n + 1);
      for (let a = 0; a < FIELD; a++) {
        for (let b = 0; b < FIELD; b++) {
          for (let j = 0; j < n; j++)
            base[j] = (c0[j] + a * c1[j] + b * c2[j]) % FIELD;
          for (let z = 0; z < FIELD; z++) {
            counts.fill(0);
            for (let j = 0; j < n; j++)
              counts[(base[j] + z * c3[j]) % FIELD]++;
            bucketOfCount.fill(0);
            for (const count of counts) bucketOfCount[count]++;
            let k = 0, mass = 0;
            for (let frequency = n; frequency >= 0; frequency--) {
              let multiplicity = bucketOfCount[frequency];
              while (multiplicity-- > 0) {
                k++;
                mass += frequency;
                if (mass > best[k]) best[k] = mass;
              }
            }
            assert.equal(k, FIELD);
            assert.equal(mass, n);
          }
        }
      }
      for (let k = 1; k <= FIELD; k++) upper[k] += best[k];
    }
  }
  assert.equal(states, 224);
  assert.equal(populatedStates, 198);
  assert.equal(upper[FIELD], cipher.length);
  return Array.from(upper);
}

/** Deterministic, fully hidden per-state three-tap key for an original-layout plant. */
function seededKeys() {
  let seed = 0x33012103;
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  return spans.slice(0, 28).map(() =>
    Array.from({ length: PERIOD }, () => {
      const permutation = Array.from({ length: FIELD }, (_, i) => i);
      for (let i = FIELD - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [permutation[i], permutation[j]] =
          [permutation[j], permutation[i]];
      }
      const inverse = new Array(FIELD);
      permutation.forEach((v, i) => { inverse[v] = i; });
      return { a: random() % FIELD, b: random() % FIELD,
        z: random() % FIELD, permutation, inverse };
    }));
}

/**
 * Original-layout causal, fully reversible three-tap plant.
 * The input and returned array contain one rune per original unsolved index.
 * @param {number[]} input
 * @param {ReturnType<typeof seededKeys>} keys
 * @param {boolean} decrypt
 */
function transform3(input, keys, decrypt) {
  const output = new Array(input.length);
  for (let row = 0; row < 28; row++) {
    const [start, end] = spans[row];
    let previous = 0, second = 0, third = 0;
    for (let i = start; i < end; i++) {
      const { a, b, z, permutation, inverse } =
        keys[row][(i - start) % PERIOD];
      const mask = a * previous + b * second + z * third;
      const ciphertext = decrypt ? input[i] :
        (permutation[input[i]] - mask + 4 * FIELD * FIELD) % FIELD;
      output[i] = decrypt ?
        inverse[(ciphertext + mask) % FIELD] : ciphertext;
      third = second;
      second = previous;
      previous = ciphertext;
    }
  }
  return output;
}

function main() {
  // Existing two-tap gate is an independent boundary test against a
  // separately implemented 29^2 enumerator, not another language sweep.
  const previous = allSecretTopK(original, spans, 2);
  assert.deepEqual(
    [previous[1], previous[3], previous[8], previous[15], previous[29]],
    [1548, 3296, 6577, 9805, 12956]
  );
  const bound = allSecretThreeTapTopK(original, spans);
  assert.deepEqual(
    [bound[1], bound[2], bound[3], bound[4],
      bound[8], bound[12], bound[15], bound[20], bound[29]],
    [1760, 2710, 3560, 4339, 6833, 8803, 10029, 11640, 12956]
  );
  for (let k = 1; k <= FIELD; k++) assert.ok(bound[k] >= previous[k]);

  const paths = {
    Shakespeare: "resources/control/shakespeare_first300k.txt",
    Gibran: "resources/control/gibran_prophet_58585.txt",
    Emerson: "resources/control/emerson_essays_2944.txt"
  };
  const references = {};
  for (const [name, filename] of Object.entries(paths)) {
    references[name] = scanNativeWindows(
      nativeGP(read(filename)), original.length, bound);
    assert.equal(references[name].compatibleWindows, 0);
  }
  assert.deepEqual(Object.values(references).map(r => r.windows),
    [204689, 49741, 310128]);
  assert.ok(references.Shakespeare.minimumTop12 > bound[12]);
  assert.ok(references.Gibran.minimumTop12 > bound[12]);
  assert.ok(references.Emerson.minimumTop12 > bound[12]);

  // A full native-GP plant with completely independent secret 29-way
  // permutations and three secret coefficients per each source state.
  const source = nativeGP(read(paths.Shakespeare));
  const plaintext = source.slice(25000, 25000 + original.length);
  const keys = seededKeys();
  const encrypted = transform3(plaintext, keys, false);
  assert.deepEqual(transform3(encrypted, keys, true), plaintext);
  assert.deepEqual(
    transform3(transform3(encrypted, keys, true), keys, false), encrypted
  );
  const syntheticBound = allSecretThreeTapTopK(encrypted, spans);
  const trueMass = rankedCumulative(plaintext);
  for (let k = 1; k <= FIELD; k++)
    assert.ok(syntheticBound[k] >= trueMass[k],
      "Three-tap positive plaintext exceeds attainable cap at k=" + k);
  assert.deepEqual(
    transform3(transform3(original, keys, true), keys, false), original
  );

  return {
    evidence: "exact source-original key-independent exclusion for tested native GP registers; no true LP2 key/plaintext",
    source: {
      originalRunes: original.length, punctuationDelimiters: 31,
      unsolvedFragments: 28, phases: PERIOD, secretStates: 224,
      populatedStates: 198, coefficientTriplesPerState: FIELD ** 3
    },
    original: { allSecretThreeTapTopK: bound.slice(1) },
    sourceWindows: references,
    plant: {
      recovered: plaintext.length,
      reencrypted: encrypted.length,
      correctKeyActualTop8: trueMass[8],
      allSecretPlantTop8: syntheticBound[8],
      arbitraryWrongKeyOriginalRoundtrip: original.length
    },
    conclusion: "Every three-tap affine GP29 feedback model with separately arbitrary state coefficients and GP29 alphabet permutations violates the top-k mass of every GP-native full-length reference window. Source-derived state evolution, segmentation, nonlinear or non-GP intermediates remain open."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = { allSecretThreeTapTopK, seededKeys, transform3, main };
