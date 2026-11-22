"use strict";
/**
 * A source-frozen prime-origin test for historical 761 (2013 audio and 2014
 * "Patience is a virtue") and its independently named duration reversal 167.
 *
 * Freeze cipher to the authentically solved LP2 p56 phi(consecutive primes)
 * with arbitrary literal, non-key-consuming visible-Fehu masks. Only the
 * starting PRIME VALUE differs; 167 and 761 are both historical values.
 * On original unsolved pages, no scores choose key parameters for a later page.
 * Run: node sims/instar761_prime_start_original_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  exhaustLiteralF, primeTotients, trainNativeGP
} = require("./historical_solve_path_transfer.cjs");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");
const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {string} */
function textFile(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(textFile("resources/liber-primus/lp2-corpus.json"));
const model = trainNativeGP(textFile("resources/control/emerson_essays_2944.txt"));
const p56 = corpus.pages.find(page => page.page === 56).indices;
const knownP56 = plaintextWords("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE").flat();
assert.equal(p56.length, 85);
assert.equal(knownP56.length, 85);
const authentic = exhaustLiteralF(p56, primeTotients(85, 1), model, knownP56);
assert.equal(authentic.correctMask, 8);
assert.equal(authentic.rankOfKnownPlain, 1);
assert.equal(authentic.exactMatches, 1);
assert.ok(Math.abs(authentic.correctScore + 2.383854012446893) < 1e-8);

/**
 * @param {number} primeValue Source-visible first prime value.
 * @param {number} ordinal One-based ordinal among ordinary primes.
 * @returns {object}
 */
function probe(primeValue, ordinal) {
  assert.equal(primeTotients(1, ordinal)[0], primeValue - 1);
  const pages = [0, 1, 5].map(page => {
    const cipher = corpus.pages.find(x => x.page === page).indices;
    const result = exhaustLiteralF(cipher, primeTotients(cipher.length, ordinal), model);
    return {
      physicalPage: page,
      cipherRunes: cipher.length,
      maskCount: result.totalMasks,
      bestScorePerRune: result.best.score,
      postselectedMask: result.best.mask,
      bestPreview: result.best.plaintext.slice(0, 65)
        .map(x => corpus.translit[x]).join("")
    };
  });
  return {
    primeValue,
    ordinal,
    testedMechanism: "original solved-p56 totient inverse, page reset, every visible-F literal skip mask",
    pages
  };
}
const output = {
  evidenceClass: "bounded original-input negative; no LP2 plaintext or key",
  originatingSource: "2013 Cicada OS AUDIO/761.MP3 metadata and 2014 original Patience=761 clue; 167 is the named audio duration reversal",
  scoredWith: "Emerson Essays GP29 trigram, independent of LP2",
  trainingRunes: model.symbolCount,
  authenticP56: {
    firstPrime: 2,
    recovered: knownP56.length,
    literalFehuMask: authentic.correctMask,
    correctScore: authentic.correctScore,
    correctRankAmongMasks: authentic.rankOfKnownPlain
  },
  original: [probe(761, 135), probe(167, 39)]
};
assert.ok(output.original.every(item =>
  item.pages.every(page => page.bestScorePerRune < authentic.correctScore - 2)));
assert.ok(Math.abs(output.original[0].pages[0].bestScorePerRune + 5.87278794400182) < 1e-8);
assert.ok(Math.abs(output.original[1].pages[0].bestScorePerRune + 5.835271060882835) < 1e-8);
console.log(JSON.stringify(output, null, 2));
