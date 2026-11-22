"use strict";

/**
 * Source-locked, all-secret-alphabet capacity theorem for the proposed
 * 13-dot-punctuation / 32x8-grid cipher-state correspondence.
 *
 * Run from repository root using Node.js 22:
 *   node sims/thirteen_dot_grid_8phase_allkey_capacity.cjs
 *
 * Read-only analysis: no ciphertext fitting, secret-key search, or I/O writes.
 * A complete synthetic plaintext/key inverse checks the implementation;
 * neither it nor a wrong-key roundtrip authenticates an LP2 decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotation = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const letters = corpus.translit;
const alphabet = new Map(letters.map((name, index) => [name, index]));
const multiFirst = letters.slice().sort((a, b) => b.length - a.length);
const FIELD = 29;
const PERIOD = 8;

/**
 * 31 printed 13-dot punctuation marks delimit 32 fragments in the
 * complete 58-page LP2 source. Marks at the same rune offset are distinct.
 * The first 28 fragments end exactly at the final unsolved rune (12956).
 * @returns {{plaintextBoundary:number, cuts:number[], spans:[number,number][]}}
 */
function sourceSpans() {
  assert.equal(corpus.pages.length, 58);
  const byPage = new Map(annotation.pages.map(record => [record.page, record]));
  const markers = [];
  let offset = 0;
  for (const page of corpus.pages) {
    const record = byPage.get(page.page);
    if (record) assert.equal(record.rune_count, page.indices.length);
    for (const mark of record?.large_punctuation || []) {
      if (mark[1] === 13) {
        assert.ok(mark[0] >= 0 && mark[0] <= page.indices.length);
        markers.push(offset + mark[0]);
      }
    }
    offset += page.indices.length;
  }
  markers.sort((a, b) => a - b);
  assert.equal(markers.length, 31);
  assert.equal(offset, 13136);
  const cuts = [0, ...markers, offset];
  const spans = Array.from({ length: 32 }, (_, i) => [cuts[i], cuts[i + 1]]);
  const cipherLength = corpus.pages.filter(page => page.page < 56)
    .reduce((sum, page) => sum + page.indices.length, 0);
  assert.equal(cipherLength, 12956);
  assert.equal(cuts[28], cipherLength);
  assert.equal(spans.filter(([lo, hi]) => lo === hi).length, 2);
  return { plaintextBoundary: cipherLength, cuts, spans };
}

/** Greedy native-GP reference tokenizer, identical for both controls. */
function nativeGP(reference) {
  const output = [];
  for (let word of (reference.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S")
      .replace(/Q/g, "C").replace(/ING/g, "NG");
    for (let i = 0; i < word.length;) {
      const token = multiFirst.find(t => word.startsWith(t, i));
      assert.ok(token, "unencodable GP reference token");
      output.push(alphabet.get(token));
      i += token.length;
    }
  }
  return output;
}

/**
 * Exact all-secret-key maximum count of any *specified* plaintext rune.
 * For state (13-dot fragment, local index mod 8), the unknown bijection
 * can map that plaintext rune to at most one ciphertext glyph. Selecting
 * the most common ciphertext glyph is attainable independently per state.
 * The collision equality fraction is also invariant under those bijections.
 *
 * @param {number[]} input Same-length ciphertext or synthetic GP sequence.
 * @param {[number,number][]} spans Source fragments from sourceSpans().
 */
function allSecretCapacity(input, spans) {
  let maximum = 0;
  let equalOrderedPairs = 0;
  let eligibleOrderedPairs = 0;
  for (const [start, end] of spans.slice(0, 28)) {
    for (let phase = 0; phase < PERIOD; phase++) {
      const freq = new Uint16Array(FIELD);
      let count = 0;
      for (let i = start + phase; i < end; i += PERIOD) {
        freq[input[i]]++;
        count++;
      }
      maximum += Math.max(...freq);
      eligibleOrderedPairs += count * (count - 1);
      for (const seen of freq) equalOrderedPairs += seen * (seen - 1);
    }
  }
  return {
    maxOnePlaintextRune: maximum,
    maxOneFraction: maximum / input.length,
    equalOrderedPairs,
    eligibleOrderedPairs,
    sameStateEquality: equalOrderedPairs / eligibleOrderedPairs
  };
}


/**
 * Exact maximum possible occurrences of any one chosen GP plaintext rune
 * across ALL secret taps and ALL secret output permutations, separately for
 * every punctuation-fragment / local mod-8 clock state.
 *
 * At each source state, encode the rune with a bijection sigma:
 *     D_i = sigma(P_i) = (C_i + a*C_(i-1) + b*C_(i-2)) mod29.
 * Prior ciphertext is reset to zero at the beginning of every fragment.
 * taps=0 fixes a=b=0, taps=1 frees a, taps=2 frees a and b; both
 * coefficients may be chosen INDEPENDENTLY at every one of the 224 states.
 * Each candidate's frequency table is exhaustive over all 29 GP symbols.
 *
 * The bound is mathematically sharp for the one-rune frequency statistic
 * even when the 224 output alphabets and feedback coefficients are unknown.
 *
 * @param {number[]} input
 * @param {[number,number][]} spans
 * @param {0|1|2} taps
 */
function allSecretFeedbackCapacity(input, spans, taps) {
  assert.ok([0, 1, 2].includes(taps));
  let maximum = 0;
  let candidateStateCount = 0;
  for (const [start, end] of spans.slice(0, 28)) {
    for (let phase = 0; phase < PERIOD; phase++) {
      const triples = [];
      for (let i = start + phase; i < end; i += PERIOD) {
        triples.push([
          input[i],
          i > start ? input[i - 1] : 0,
          i > start + 1 ? input[i - 2] : 0
        ]);
      }
      const counts = new Uint16Array(FIELD);
      let best = 0;
      for (let a = 0; a < (taps > 0 ? FIELD : 1); a++) {
        for (let b = 0; b < (taps > 1 ? FIELD : 1); b++) {
          counts.fill(0);
          for (const [current, previous, secondPrevious] of triples)
            counts[(current + a * previous + b * secondPrevious) % FIELD]++;
          best = Math.max(best, ...counts);
        }
      }
      maximum += best;
      candidateStateCount++;
    }
  }
  assert.equal(candidateStateCount, 28 * PERIOD);
  return {
    taps, maximum, fraction: maximum / input.length,
    stateCount: candidateStateCount,
    secretCoefficientCandidatesPerState: FIELD ** taps
  };
}

/**
 * Hidden-key synthetic plant for the n-tap ciphertext-feedback family.
 * Each state has two secret coefficients and an independent GP29 permutation.
 * The schema is a test fixture, not an attributed Cicada state generator.
 *
 * @param {[number,number][]} spans
 * @param {1|2} taps
 */
function syntheticFeedbackKeys(spans, taps) {
  let seed = taps === 1 ? 0x11330127 : 0x22330127;
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
      return { a: random() % FIELD, b: taps === 2 ? random() % FIELD : 0,
        permutation };
    }));
}

/**
 * Fully reversible causal original-length encoder/decoder, using previous
 * CIPHERTEXT runes and resetting the two-rune register at each punctuation.
 * @param {number[]} input
 * @param {[number,number][]} spans
 * @param {{a:number,b:number,permutation:number[]}[][]} keys
 * @param {boolean} decrypt
 */
function feedbackTransform(input, spans, keys, decrypt) {
  const out = new Array(input.length);
  for (let row = 0; row < 28; row++) {
    const [start, end] = spans[row];
    let previous = 0, secondPrevious = 0;
    for (let i = start; i < end; i++) {
      const { a, b, permutation } = keys[row][(i - start) % PERIOD];
      let ciphertext, plaintext;
      if (decrypt) {
        ciphertext = input[i];
        const remapped = (ciphertext + a * previous +
          b * secondPrevious) % FIELD;
        plaintext = permutation.indexOf(remapped);
        out[i] = plaintext;
      } else {
        plaintext = input[i];
        const remapped = permutation[plaintext];
        ciphertext = (remapped - a * previous -
          b * secondPrevious + 2 * FIELD * FIELD) % FIELD;
        out[i] = ciphertext;
      }
      assert.ok(out[i] >= 0 && out[i] < FIELD);
      secondPrevious = previous;
      previous = ciphertext;
    }
  }
  return out;
}

/**
 * Exact sliding-window bounds on literal GP-E (index 18), without assuming
 * independent windows or attaching an uncalibrated discovery p-value.
 * @param {number[]} text
 * @param {number} width
 */
function eWindows(text, width) {
  assert.ok(text.length >= width);
  const prefix = new Uint32Array(text.length + 1);
  for (let i = 0; i < text.length; i++)
    prefix[i + 1] = prefix[i] + Number(text[i] === 18);
  let least = Infinity, most = -Infinity, earliestMinimum = -1;
  for (let start = 0; start + width <= text.length; start++) {
    const e = prefix[start + width] - prefix[start];
    if (e < least) {
      least = e;
      earliestMinimum = start;
    }
    most = Math.max(most, e);
  }
  return { gpRunes: text.length, windows: text.length - width + 1,
    minE: least, maxE: most, earliestMinimum };
}

/** Seeded fixture permutations; every state uses an independent bijection. */
function syntheticKeys(spans) {
  let seed = 0x33012513;
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  return spans.slice(0, 28).map(() =>
    Array.from({ length: PERIOD }, () => {
      const order = Array.from({ length: FIELD }, (_, i) => i);
      for (let i = FIELD - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
      return order;
    }));
}

/**
 * @param {number[]} input
 * @param {[number,number][]} spans
 * @param {number[][][]} keys
 * @param {boolean} decrypt
 */
function transform(input, spans, keys, decrypt) {
  const out = new Array(input.length);
  for (let row = 0; row < 28; row++) {
    const [start, end] = spans[row];
    for (let i = start; i < end; i++) {
      const permutation = keys[row][(i - start) % PERIOD];
      const value = input[i];
      out[i] = decrypt ? permutation.indexOf(value) : permutation[value];
      assert.ok(out[i] >= 0 && out[i] < FIELD);
    }
  }
  return out;
}

function main() {
  const { plaintextBoundary, cuts, spans } = sourceSpans();
  const original = corpus.pages.filter(p => p.page < 56)
    .flatMap(page => page.indices);
  assert.equal(original.length, plaintextBoundary);
  const observed = allSecretCapacity(original, spans);
  assert.equal(observed.maxOnePlaintextRune, 989);
  assert.equal(observed.equalOrderedPairs, 94652);
  assert.equal(observed.eligibleOrderedPairs, 2728348);
  const feedback = [0, 1, 2].map(taps =>
    allSecretFeedbackCapacity(original, spans, /** @type {0|1|2} */ (taps)));
  assert.deepEqual(feedback.map(x => x.maximum), [989, 1298, 1548]);

  const shakespeare = nativeGP(read("resources/control/shakespeare_first300k.txt"));
  const gibran = nativeGP(read("resources/control/gibran_prophet_58585.txt"));
  const shakespeareWindows = eWindows(shakespeare, original.length);
  const gibranWindows = eWindows(gibran, original.length);
  assert.equal(shakespeareWindows.gpRunes, 217644);
  assert.equal(shakespeareWindows.minE, 1404);
  assert.equal(gibranWindows.gpRunes, 62696);
  assert.equal(gibranWindows.minE, 1414);

  const truePlain = shakespeare.slice(25000, 25000 + original.length);
  const keys = syntheticKeys(spans);
  const plantCipher = transform(truePlain, spans, keys, false);
  const recovered = transform(plantCipher, spans, keys, true);
  assert.deepEqual(recovered, truePlain);
  assert.deepEqual(transform(recovered, spans, keys, false), plantCipher);
  const plantStats = allSecretCapacity(plantCipher, spans);
  const plainStats = allSecretCapacity(truePlain, spans);
  assert.equal(plantStats.equalOrderedPairs, plainStats.equalOrderedPairs);
  assert.ok(plantStats.maxOnePlaintextRune >=
    truePlain.filter(x => x === 18).length);

  // An arbitrary, incorrect original key also roundtrips all original
  // ciphertext. This is an implementation invariant, not authentication.
  const feedbackPlants = [];
  for (const taps of [1, 2]) {
    const secret = syntheticFeedbackKeys(spans, /** @type {1|2} */ (taps));
    const encrypted = feedbackTransform(truePlain, spans, secret, false);
    const deciphered = feedbackTransform(encrypted, spans, secret, true);
    assert.deepEqual(deciphered, truePlain);
    assert.deepEqual(feedbackTransform(deciphered, spans, secret, false),
      encrypted);
    if (taps === 1) assert.ok(feedback[taps].maximum <
      shakespeareWindows.minE);
    const nativeE = truePlain.filter(x => x === 18).length;
    const plantCapacity = allSecretFeedbackCapacity(encrypted, spans,
      /** @type {0|1|2} */ (taps));
    assert.ok(plantCapacity.maximum >= nativeE);
    const hypotheticalOriginal =
      feedbackTransform(original, spans, secret, true);
    assert.deepEqual(feedbackTransform(hypotheticalOriginal, spans,
      secret, false), original);
    feedbackPlants.push({ taps, nativeE, plantBound: plantCapacity.maximum,
      recovered: deciphered.length, reencrypted: encrypted.length,
      wrongKeyRoundtrip: original.length });
  }

  const hypothetical = transform(original, spans, keys, true);
  assert.deepEqual(transform(hypothetical, spans, keys, false), original);

  return {
    classification: "exact conditional all-key exclusion; no LP2 plaintext or key",
    source: {
      totalRunes: cuts[cuts.length - 1], marks13: 31,
      totalFragments: spans.length, emptyFragments: 2,
      originalCipherRunes: original.length, originalFragments: 28,
      gridColumns: PERIOD, arbitrarySecretStatePermutations: 28 * PERIOD
    },
    original: observed,
    allSecretAffineFeedback: feedback,
    feedbackMinimumRuneAlterations: {
      oneTapVsShakespeare: shakespeareWindows.minE - feedback[1].maximum,
      oneTapVsGibran: gibranWindows.minE - feedback[1].maximum,
      twoTapSurvivesOnlyECount: feedback[2].maximum >=
        shakespeareWindows.minE
    },
    feedbackPlants,
    references: { shakespeare: shakespeareWindows, gibran: gibranWindows },
    guaranteedAdditionalERewrites: {
      shakespeare: shakespeareWindows.minE - observed.maxOnePlaintextRune,
      gibran: gibranWindows.minE - observed.maxOnePlaintextRune
    },
    synthetic: {
      originalGpE: truePlain.filter(x => x === 18).length,
      allKeyPlantCeiling: plantStats.maxOnePlaintextRune,
      exactRecovered: recovered.length, exactReencrypted: plantCipher.length,
      wrongKeyOriginalRoundtrip: original.length
    },
    interpretation: "Excludes source-segment and 8-column phased, state-fixed " +
      "bijective per-symbol substitutions of direct native GP prose; " +
      "two-tap feedback survives the E-count necessary condition; " +
      "other registers and segmentation remain open."
  };
}

if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = { main, sourceSpans, nativeGP, allSecretCapacity, eWindows,
  syntheticKeys, transform, allSecretFeedbackCapacity,
  syntheticFeedbackKeys, feedbackTransform };
