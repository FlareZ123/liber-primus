"use strict";

/**
 * Lossless-inversion obstruction for a proposed H2 GP29 ciphertext-equal
 * probabilistic key-row retry. This is a source-cipher counterexample,
 * NOT plaintext recovery or identification of Cicada's actual encryption.
 *
 * Original ciphertext: all 12,956 untouched unknown LP2 rune indices.
 * Key clock: physical-page-restarted prime2 totient (p-1) mod29.
 * Tableau: public invertible cyclic Latin T[row][P]=(P+row) mod29.
 * Decoder-relevant choice: when a proposed output equals the preceding
 * emitted ciphertext, retry with probability q in (0,1), otherwise accept.
 * Each proposed retry consumes one extra prime row. The H2 no-plaintext-F
 * variant is deliberately fixed; additional source rules need separate tests.
 *
 * For every original physical page, the zero-retry interpretation is a valid
 * forward trace with positive probability. A second interpretation at a
 * qualifying site retries exactly once and uses a different plaintext rune.
 * There are 452 such sites. All 453 single-exception full-book input tapes, including the
 * zero-retry tape, forward-generate the identical original GP29 ciphertext
 * under the SAME known cipher and clock. Every original word boundary is
 * untouched. Their text is not native English and is not a proposed solve.
 *
 * The general no-retry existence theorem holds for ANY fixed 29x29 row-wise
 * permutation tableau when q<1 and plaintext-F bypass is absent:
 * P[i] = T[clock[i]]^-1(C[i]) always emits C[i] under a chosen no-retry coin
 * history; equality events have acceptance probability 1-q>0.
 *
 * Reproduce: node sims/lp2_h2_noninjective_original_451_sft.cjs
 * No dependencies or file writes. Windows Node.js 22 / CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const N = 29;
const pages = source.pages
  .filter(page => page.page <= 55 && page.indices.length > 0);
const total = pages.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(total, 12956);
assert.equal(source.pages.find(page => page.page === 50).indices.length, 0);

const primes = [];
for (let value = 2; primes.length < 600; value++) {
  let prime = true;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) {
      prime = false;
      break;
    }
  }
  if (prime) primes.push(value);
}
const rows = primes.map(value => (value - 1) % N);
const mod = value => ((value % N) + N) % N;

/**
 * Replay the proposed stochastic H2 machine on one page, with a specified
 * coin trace. For each collision at i, the caller chooses retry or accept.
 * Here we permit at most one retry, at the selected target index.
 *
 * @param {number[]} plaintext
 * @param {number} skipAt
 * @returns {number[]}
 */
function emit(plaintext, skipAt = -1) {
  let previous = -1;
  let pointer = 0;
  const output = [];
  for (let i = 0; i < plaintext.length; i++) {
    let proposal = mod(plaintext[i] + rows[pointer]);
    if (i === skipAt) {
      assert.equal(proposal, previous, "rejected H2 proposal collision");
      pointer++;
      proposal = mod(plaintext[i] + rows[pointer]);
      assert.notEqual(proposal, previous, "next H2 proposal accepted");
    }
    // Else a collision is accepted by the q<1 coin, which is a legal event.
    output.push(proposal);
    previous = proposal;
    pointer++;
  }
  return output;
}

/** @param {number[]} ciphertext */
function plainNoRetries(ciphertext) {
  return ciphertext.map((c, i) => mod(c - rows[i]));
}

/**
 * Candidate at local i: with the no-retry key clock, the first proposal is
 * the previous visible C; retry under prime row i+1 yields current visible C.
 * The rest of the page accepts directly at the clock shifted forward by 1.
 *
 * @param {number[]} ciphertext
 * @param {number} at
 * @returns {number[]}
 */
function plainWithOneRetry(ciphertext, at) {
  return ciphertext.map((c, i) => {
    if (i < at) return mod(c - rows[i]);
    if (i === at) return mod(ciphertext[i - 1] - rows[i]);
    return mod(c - rows[i + 1]);
  });
}

let eligible = 0;
let independentPageProduct = 1n;
let originalsEqual = 0;
const siteCounts = [];
let firstSite = null;
for (const page of pages) {
  const C = page.indices;
  const base = plainNoRetries(C);
  assert.deepEqual(emit(base), C, "zero-retry trace exactly re-emits original");
  let onPage = 0;

  for (let i = 1; i < C.length; i++) {
    if (C[i] === C[i - 1]) originalsEqual++;
    if (i + 1 >= rows.length) continue;
    const ciphertextStep = mod(C[i] - C[i - 1]);
    const sourceClockStep = mod(rows[i + 1] - rows[i]);
    if (ciphertextStep === 0 || ciphertextStep !== sourceClockStep) {
      continue;
    }

    const alternative = plainWithOneRetry(C, i);
    assert.notEqual(alternative[i], base[i],
      "two preimages have different input runes at the retry");
    assert.deepEqual(emit(alternative, i), C,
      "source-original ciphertext reproduced from distinct preimage");
    for (let j = 0; j < i; j++) {
      assert.equal(alternative[j], base[j],
        "same initial secret and unmodified prefix input");
    }
    eligible++;
    onPage++;
    if (!firstSite) {
      firstSite = {page: page.page, localRuneOffset: i,
        precedingGPIndex: C[i - 1], currentGPIndex: C[i],
        priorPrimeRow: rows[i], nextPrimeRow: rows[i + 1],
        basePlainGPIndex: base[i], alternatePlainGPIndex: alternative[i]};
    }
  }
  independentPageProduct *= BigInt(onPage + 1);
  siteCounts.push({page: page.page, originalRunes: C.length,
    oneRetryAlternatives: onPage});
}

assert.equal(originalsEqual, 86);
assert.equal(eligible, 452);
assert.deepEqual(firstSite, {
  page: 0, localRuneOffset: 37, precedingGPIndex: 6,
  currentGPIndex: 10, priorPrimeRow: 17, nextPrimeRow: 21,
  basePlainGPIndex: 22, alternatePlainGPIndex: 18
});
assert.equal(eligible + 1, 453);
assert.equal(independentPageProduct.toString(),
  "862434223353358438440426765962102288840392704000000");

console.log(JSON.stringify({
  classification: "exact source-original H2 noninjectivity witness; no LP2 plaintext",
  originalUnknownRunes: total,
  physicalRuneBearingPages: pages.length,
  originalEqualAdjacentEvents: originalsEqual,
  keyClock: "prime2 totient mod29, page restart",
  secretTableau: "fixed known cyclic Latin row-permutation, T_r(P)=P+r mod29",
  retryRule: "collision-retry coin q strictly between 0 and 1",
  implicitRetryCoinChoices: "all non-target collisions accepted without retry",
  singleSiteSameCiphertextCompleteInputTapes: eligible + 1,
  distinctIndependentPageChoiceTapes: independentPageProduct.toString(),
  ambiguityLowerBoundBits: Math.log2(Number(independentPageProduct)),
  oneRetryPositions: eligible,
  firstSite,
  byPage: siteCounts
}, null, 2));
