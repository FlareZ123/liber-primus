"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative */
function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"));
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * Apply one source-fixed 51-position additive key. A single continuous clock
 * runs across physical p54 and p55 because their boundary splits a word.
 * @param {number[]} input
 * @param {number[]} key
 * @param {1|-1} sign
 */
function transform(input, key, sign) {
  return input.map((v, i) => (v + sign * key[i % key.length] + 29) % 29);
}

const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const red = ink.pages.find((p) => p.page === 53).red_spans.find(
  (span) => span.start === 128 && span.length === 51
);
assert.ok(red);
const keyIndices = Array.from(red.runes, (r) => corpus.runes.indexOf(r));
assert.equal(keyIndices.length, 51);
assert.ok(keyIndices.every((v) => v >= 0 && v < 29));
assert.deepEqual(keyIndices, corpus.pages[53].indices.slice(128, 179));
assert.equal(keyIndices.reduce((n, v) => n + corpus.prime[v], 0), 2262);

const page54 = corpus.pages[54].indices;
const page55 = corpus.pages[55].indices;
assert.equal(page54.length, 232);
assert.equal(page55.length, 76);
const ciphertext = page54.concat(page55);
assert.equal(ciphertext.length, 308);

const scores = { raw: ioc(ciphertext), models: [] };
const keys = {
  ordinal: keyIndices,
  primeResidue: keyIndices.map((v) => corpus.prime[v] % 29)
};
for (const [family, key] of Object.entries(keys)) {
  for (const sign of [-1, 1]) {
    const decoded = transform(ciphertext, key, sign);
    assert.deepEqual(transform(decoded, key, /** @type {1|-1} */ (-sign)), ciphertext);
    scores.models.push({
      family,
      sign,
      overallIoC: ioc(decoded),
      page54IoC: ioc(decoded.slice(0, 232)),
      page55IoC: ioc(decoded.slice(232)),
      first40: decoded.slice(0, 40).map((v) => corpus.translit[v]).join("-")
    });
  }
}

assert.ok(Math.abs(scores.raw - 0.03382122763230255) < 1e-12);
const expected = [0.03373662168450442, 0.033525106815009094,
  0.03409619696264647, 0.034942256440627775];
for (let i = 0; i < expected.length; i++) {
  assert.ok(Math.abs(scores.models[i].overallIoC - expected[i]) < 1e-12);
}

/* Independent GP29 plaintext plant checks the chosen inverse and period. */
const sourceTokens = ["TH", "E", "P", "R", "I", "M", "E", "S", "A", "R",
  "E", "S", "A", "C", "R", "E", "D"];
const seed = sourceTokens.map((token) => corpus.translit.indexOf(token));
assert.ok(seed.every((v) => v >= 0));
const planted = Array.from({ length: 308 }, (_, i) => seed[i % seed.length]);
for (const key of Object.values(keys)) {
  const encrypted = transform(planted, key, 1);
  assert.deepEqual(transform(encrypted, key, -1), planted);
  assert.deepEqual(transform(transform(encrypted, key, -1), key, 1), encrypted);
}
console.log(JSON.stringify(scores, null, 2));
