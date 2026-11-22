"use strict";
/**
 * Exact conditional no-go for a stateless one-word -> one-key-symbol mapping
 * on the 2016 Cicada signed THE1..WAY13 source interval and original p0
 * 13-rune EPIPHANY SEECS candidate. No unknown plaintext is asserted.
 *
 * Run: node sims/lp2_p0_signed13_repeated_the_allkey_obstruction_sft.cjs
 * Source files are read-only. Node.js 22, CommonJS, no dependencies.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.find(page => page.page === 0).indices.slice(0, 13);
assert.equal(original.length, 13);
const translit = corpus.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const source = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  let remaining = source.replace(/[^A-Z]/g, "");
  const sequence = [];
  while (remaining.length) {
    const symbol = translit.find(value => remaining.startsWith(value));
    assert.ok(symbol, "Unencoded GP segment: " + remaining);
    sequence.push(corpus.translit.indexOf(symbol));
    remaining = remaining.slice(symbol.length);
  }
  return sequence;
}
const guessedPlain = encodeGP("EPIPHANY SEEKS");
assert.equal(guessedPlain.length, 13);
const residualKey = original.map((cipher, i) => (cipher - guessedPlain[i] + 29) % 29);
assert.deepEqual(residualKey, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
assert.deepEqual(original, guessedPlain.map((plain, i) => (plain + residualKey[i]) % 29));

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedSegment = signed.match(/The path lies empty; epiphany seeks the devoted\.\s+Liber Primus is the way\./i);
assert.ok(signedSegment, "The signed source text has changed");
const sourceWords = signedSegment[0].toUpperCase().match(/[A-Z]+/g);
assert.deepEqual(sourceWords, [
  "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY",
]);
const repeatedThePositions = sourceWords
  .map((word, index) => word === "THE" ? index : -1).filter(i => i >= 0);
assert.deepEqual(repeatedThePositions, [0, 6, 11]);
assert.deepEqual(repeatedThePositions.map(i => residualKey[i]), [26, 18, 16]);
const unequalThe = new Set(repeatedThePositions.map(i => residualKey[i])).size;
assert.equal(unequalThe, 3);

/** @param {string[]} words @param {number[]} keys @returns {boolean} */
function hasStatelessWordMap(words, keys) {
  const mapping = new Map();
  for (let i = 0; i < words.length; i++) {
    if (mapping.has(words[i]) && mapping.get(words[i]) !== keys[i]) return false;
    mapping.set(words[i], keys[i]);
  }
  return true;
}
assert.equal(hasStatelessWordMap(sourceWords, residualKey), false);

// Positive control: any repeated word given a stable key can be expressed by
// a deterministic (even arbitrary secret) word -> single-symbol function.
const positiveKeys = residualKey.slice();
positiveKeys[6] = positiveKeys[0];
positiveKeys[11] = positiveKeys[0];
assert.equal(hasStatelessWordMap(sourceWords, positiveKeys), true);
const altPlain = original.map((cipher, i) => (cipher - positiveKeys[i] + 29) % 29);
assert.deepEqual(original, altPlain.map((p, i) => (p + positiveKeys[i]) % 29));

process.stdout.write(JSON.stringify({
  scope: "conditional p0 original red13 -> signed 2016 THE1..WAY13",
  originalP0Cipher13: original,
  conjecturalPlaintext: "EPIPHANY SEECS",
  derivedResidualKey13: residualKey,
  signedWords13: sourceWords,
  originalSignedTHEpositionsOneBased: repeatedThePositions.map(i => i + 1),
  requiredKeyAtTHEpositions: repeatedThePositions.map(i => residualKey[i]),
  allSecretStatelessWordToKey: "IMPOSSIBLE",
  keyedPositionOrEvolvingState: "not tested, not implied",
  originalAdditiveReplay: "exact 13/13",
  statelessPositive: "passed exact 13/13 after equal-key THE",
  establishesNewPlaintext: false,
}, null, 2) + "\n");
