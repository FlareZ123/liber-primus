"use strict";

/**
 * Reproduce the pause-count / 29 / GP29 "GIT" candidate and test only its
 * direct period-3 use as a p0-title key.
 *
 * Run from the repository root:
 *   node sims/lp2_2013_prime_echo_gp29_quotient_git_gate.cjs
 *
 * The quotient reading is a hypothesis, not an authenticated instruction.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const primeEcho = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));

const primes = [...primeEcho.matchAll(/echo(?:\s+-n)?\s+"?(\d+)\t"?;/g)]
  .map((match) => Number(match[1]));
const pauseValues = [...primeEcho.matchAll(/echo -n "(\d+)\t"; sleep 2/g)]
  .map((match) => Number(match[1]));

assert.deepEqual(pauseValues, [1033, 3301]);
assert.equal(primes.length, 464);
assert.equal(primes[primes.indexOf(1033)], 1033);
assert.equal(primes[primes.indexOf(3301)], 3301);

const i1033 = primes.indexOf(1033);
const i3301 = primes.indexOf(3301);
const counts = [i1033 + 1, i3301 - i1033, i3301 + 1];

assert.deepEqual(counts, [174, 290, 464]);

// Specificity control: enumerate every reversed-prime pair in this exact
// 464-prime source stream. Only the two pause primes have ranks divisible by 29.
const rank = new Map(primes.map((prime, index) => [prime, index + 1]));
const emirpPairs = [];
for (const prime of primes) {
  const reverse = Number(String(prime).split("").reverse().join(""));
  if (reverse > prime && rank.has(reverse)) {
    emirpPairs.push({
      prime, reverse,
      primeRank: rank.get(prime),
      reverseRank: rank.get(reverse),
    });
  }
}
const bothRanksDivisible29 = emirpPairs.filter((pair) =>
  pair.primeRank % 29 === 0 && pair.reverseRank % 29 === 0
);
assert.equal(emirpPairs.length, 35);
assert.deepEqual(bothRanksDivisible29, [{
  prime: 1033, reverse: 3301, primeRank: 174, reverseRank: 464,
}]);

const quotients = counts.map((count) => count / 29);
assert.deepEqual(quotients, [6, 10, 16]);
assert.ok(quotients.every(Number.isInteger));

const gp29Letters = quotients.map((index) => corpus.translit[index]);
assert.deepEqual(gp29Letters, ["G", "I", "T"]);
const candidateWord = gp29Letters.join("");
assert.equal(candidateWord, "GIT");

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const ciphertext = p0.slice(0, 13);
const candidatePlaintext = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15]; // EPIPHANY SEEKS
const markerDerivedKey = [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19];
const mod29 = (value) => ((value % 29) + 29) % 29;

const required = {
  vigenereSubtract: ciphertext.map((value, i) => mod29(value - candidatePlaintext[i])),
  vigenereAdd: candidatePlaintext.map((value, i) => mod29(value - ciphertext[i])),
  beaufort: candidatePlaintext.map((value, i) => mod29(value + ciphertext[i])),
};
assert.deepEqual(required.vigenereSubtract, markerDerivedKey);

const continuousKey = Array.from({length: 13}, (_, i) => quotients[i % 3]);
const wordResetKey = Array.from({length: 13}, (_, i) =>
  quotients[i < 8 ? i % 3 : (i - 8) % 3]
);
const matches = {};
for (const [convention, needed] of Object.entries(required)) {
  matches[convention] = {
    continuous: JSON.stringify(needed) === JSON.stringify(continuousKey),
    wordReset: JSON.stringify(needed) === JSON.stringify(wordResetKey),
  };
}
assert.ok(Object.values(matches).every((item) => !item.continuous && !item.wordReset));

console.log(JSON.stringify({
  pausesAfter: pauseValues,
  primeCount: primes.length,
  primeOrdinals: [i1033 + 1, i3301 + 1],
  pauseCounts: counts,
  quotients,
  emirpPairCount: emirpPairs.length,
  unique29RankReversal: bothRanksDivisible29,
  gp29Letters,
  candidateWord,
  p0TitleCandidate: "EPIPHANY SEEKS",
  p0Ciphertext: ciphertext,
  p0RequiredKeys: required,
  candidateKeyContinuous: continuousKey,
  candidateKeyWordResetAfterEight: wordResetKey,
  matches,
  decision: "The chronological pause-count quotient yields GIT exactly. Direct period-3 Vigenere-add/subtract and Beaufort use does not reproduce the current p0 title candidate, either continuously or with a reset at its 8+5 word boundary. This does not reject GIT as a navigation clue or destination.",
}, null, 2));
