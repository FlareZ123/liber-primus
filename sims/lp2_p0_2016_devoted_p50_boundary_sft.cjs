"use strict";
/**
 * One runnable, original-input SFT for the signed-2016 THE DEVOTED p0 crib.
 *
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_p0_2016_devoted_p50_boundary_sft.cjs
 *
 * The candidate is NOT authenticated plaintext. The numerical route and its
 * mixed word/rune typing were discovered before this phrase observation,
 * while the interpretation of that route remains a hypothesis.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
const source = asc.slice(asc.indexOf("Hello."), asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const sourceWords = source.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(sourceWords.length, 43);
const symbols = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Canonical GP29 transliteration, with K->C and V->U.
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  let rest = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  while (rest.length) {
    const token = symbols.find(({ s }) => rest.startsWith(s));
    assert.ok(token, "No GP token for " + rest);
    result.push(token.i);
    rest = rest.slice(token.s.length);
  }
  return result;
}
/** @param {string} word @returns {number} */
const gp0 = (word) => gp(word).reduce((a, b) => a + b, 0);
const triples = [];
for (let i = 0; i + 2 < sourceWords.length; i++) {
  const sums = sourceWords.slice(i, i + 3).map(gp0);
  if (sums[1] - sums[0] === 29 && sums[2] - sums[1] === 29) {
    triples.push({ i, words: sourceWords.slice(i, i + 3), sums });
  }
}
assert.deepEqual(triples, [{
  i: 3, words: ["lies", "empty", "epiphany"], sums: [63, 92, 121]
}]);
const addresses = triples[0].sums.map((i) => grid.bytes[i]);
assert.deepEqual(addresses, [51, 236, 237]);
const sourcePairs = [];
for (let i = 0; i + 1 < sourceWords.length; i++) {
  if (gp(sourceWords[i]).length === 2 && gp(sourceWords[i + 1]).length === 7) {
    sourcePairs.push({ i, words: sourceWords.slice(i, i + 2) });
  }
}
assert.deepEqual(sourcePairs, [{ i: 7, words: ["the", "devoted"] }]);
const p0Text = read("resources/lp2-transcription.txt").split("%")[0]
  .replace(/\/\s*/g, "");
const p0Words = p0Text.match(/[\u16a0-\u16ff]+/gu) || [];
let total = 0;
const words = p0Words.map((runic, i) => {
  const start = total;
  const len = [...runic].length;
  total += len;
  return { ordinal: i + 1, start, end: total - 1, len };
});
const ciphertext = corpus.pages[0].indices;
assert.deepEqual([p0Words.length, total, ciphertext.length], [59, 262, 262]);
assert.deepEqual(words.slice(0, 2).map((w) => w.len), [8, 5]);
const p0Pairs = [];
for (let i = 0; i + 1 < words.length; i++) {
  if (words[i].len === 2 && words[i + 1].len === 7) {
    p0Pairs.push({ i, left: words[i], right: words[i + 1] });
  }
}
assert.equal(p0Pairs.length, 1);
const { i, left, right } = p0Pairs[0];
assert.equal(i, 52);
assert.deepEqual([left.ordinal, right.ordinal, left.start, left.end,
  right.start, right.end], [53, 54, 235, 236, 237, 243]);
const bodyWordOrdinal = left.ordinal - 2;
assert.deepEqual([bodyWordOrdinal, left.end, right.start], addresses);
const inferredPlain = sourcePairs[0].words.flatMap(gp);
const remoteCipher = ciphertext.slice(left.start, right.end + 1);
const mod = (x) => ((x % 29) + 29) % 29;
const remoteKey = remoteCipher.map((x, j) => mod(x - inferredPlain[j]));
assert.deepEqual(inferredPlain, [2, 18, 23, 18, 1, 3, 16, 18, 23]);
assert.deepEqual(remoteCipher, [8, 5, 15, 22, 16, 22, 21, 1, 4]);
assert.deepEqual(remoteKey, [6, 16, 21, 4, 15, 19, 5, 12, 10]);
assert.deepEqual(inferredPlain.map((x, j) => mod(x + remoteKey[j])),
  remoteCipher);
const titlePlain = ["epiphany", "seeks"].flatMap(gp);
const titleCipher = ciphertext.slice(0, 13);
const titleKey = titleCipher.map((x, j) => mod(x - titlePlain[j]));
assert.deepEqual(titleKey, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
/** Fit the minimum ordinary linear recurrence over GF(29). @param {number[]} sequence */
function berlekampMassey(sequence) {
  let coefficients = [1], previous = [1], degree = 0, oldDelta = 1, shift = 1;
  for (let n = 0; n < sequence.length; n++) {
    let delta = 0;
    for (let j = 0; j <= degree; j++) {
      delta = mod(delta + coefficients[j] * sequence[n - j]);
    }
    if (delta === 0) { shift++; continue; }
    const snapshot = coefficients.slice();
    const factor = mod(delta * inv(oldDelta));
    while (coefficients.length < previous.length + shift) coefficients.push(0);
    for (let j = 0; j < previous.length; j++) {
      coefficients[j + shift] = mod(coefficients[j + shift] - factor * previous[j]);
    }
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      previous = snapshot;
      oldDelta = delta;
      shift = 1;
    } else {
      shift++;
    }
  }
  return { degree, coefficients: coefficients.slice(0, degree + 1) };
}
/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < 29; i++) if ((x * i) % 29 === 1) return i;
  throw new Error("No inverse of " + x);
}
const recurrence = berlekampMassey(titleKey);
assert.deepEqual(recurrence, {
  degree: 6, coefficients: [1, 9, 13, 23, 22, 17, 23]
});
const stream = titleKey.slice();
for (let n = stream.length; n <= right.end; n++) {
  let sum = 0;
  for (let t = 1; t <= recurrence.degree; t++) {
    sum += recurrence.coefficients[t] * stream[n - t];
  }
  stream.push(mod(-sum));
}
const extrapolated = stream.slice(left.start, right.end + 1);
const matches = extrapolated.filter((v, j) => v === remoteKey[j]).length;
assert.deepEqual(extrapolated, [19, 16, 8, 13, 28, 5, 2, 20, 21]);
assert.equal(matches, 1);
const periodic = remoteKey.filter((v, j) =>
  v === titleKey[(left.start + j) % 13]).length;
assert.equal(periodic, 0);
// Period-13 substitution collision is key-free and stronger than Vigenere.
// It applies to every fixed, bijective alphabet at each absolute rune phase,
// even if all 13 alphabets are completely unknown.
const period13Witness = {
  title: { offset: 1, phase: 1 % 13, cipher: titleCipher[1], plain: titlePlain[1] },
  distant: {
    offset: left.start, phase: left.start % 13,
    cipher: remoteCipher[0], plain: inferredPlain[0]
  }
};
assert.deepEqual(period13Witness, {
  title: { offset: 1, phase: 1, cipher: 8, plain: 13 },
  distant: { offset: 235, phase: 1, cipher: 8, plain: 2 }
});
assert.equal(period13Witness.title.cipher, period13Witness.distant.cipher);
assert.notEqual(period13Witness.title.plain, period13Witness.distant.plain);
// This does not apply after an unknown plaintext-dependent phase skip/reset.
const report = {
  status: "CONDITIONAL CRIB ONLY, NO PLAINTEXT RECOVERED",
  sourceTriple: triples[0],
  p50Base60Bytes: addresses,
  sourceTwoSevenPairs: sourcePairs,
  p0TwoSevenPairs: p0Pairs.map(({ left, right }) => ({ left, right })),
  inferredPhrase: "THE DEUOTED",
  originalCipher: remoteCipher,
  hypotheticalPlain: inferredPlain,
  requiredAdditiveKey: remoteKey,
  titleRequiredKey: titleKey,
  minimalLinearRecurrence: recurrence,
  remoteLinearPredictions: extrapolated,
  linearMatches: matches,
  repeatedTitleKeyMatches: periodic,
  arbitraryPeriod13SubstitutionImpossible: period13Witness
};
if (require.main === module) console.log(JSON.stringify(report, null, 2));
module.exports = { run: () => report };
