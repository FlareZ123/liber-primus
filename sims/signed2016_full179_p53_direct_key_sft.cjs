"use strict";

/**
 * Signed-2016 message / original physical p53 exact 179-GP-symbol length
 * match and bounded authentic-source direct-key inverse.
 *
 * This is a deliberately finite negative gate, not a source-authenticated
 * instruction or a plaintext recovery. Uses canonical ordinary English GP
 * spelling: K=C, V=U, no extra IO/ING collapsing.
 *
 * Node.js 22, CommonJS, built-in modules only:
 *   node sims/signed2016_full179_p53_direct_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {string} pathname @returns {string} */
function read(pathname) {
  return fs.readFileSync(path.join(__dirname, "..", pathname), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/historical/cicada2016-4gq25-outguess.asc");
const paragraphs = original.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\s*\r?\n/).slice(1)
  .map((part) => part.trim().replace(/\s+/g, " ")).filter(Boolean);
assert.equal(paragraphs.length, 7);
const body = paragraphs.join(" ");
assert(body.includes("7A35090F"));
const canonical = new Map(corpus.translit.map((r, i) => [r, i]));
canonical.set("K", canonical.get("C"));
canonical.set("V", canonical.get("U"));
const tokens = [...canonical.keys()].sort((a, b) => b.length - a.length);

/** @param {string} input @returns {number[]} */
function gp(input) {
  const letters = input.toUpperCase().replace(/[^A-Z]/g, "");
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < letters.length;) {
    const token = tokens.find((t) => letters.startsWith(t, i));
    assert.ok(token, "Unknown rune text " + letters.slice(i));
    result.push(canonical.get(token));
    i += token.length;
  }
  return result;
}

const sourceKey = gp(body);
const sourceWithoutId = gp(body.replace("7A35090F", ""));
const page53 = corpus.pages.find((p) => p.page === 53).indices;
const page55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(page53.length, 179);
assert.equal(sourceKey.length, 179);
assert.equal(sourceWithoutId.length, 177);
assert.equal(page55.length, 76);
assert.deepEqual(
  corpus.pages.filter((p) => p.page < 56 && p.indices.length === sourceKey.length)
    .map((p) => p.page),
  [53]
);

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const x of runes) counts[x]++;
  const n = runes.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (n * (n - 1));
}

/** @param {number[]} runes @returns {string} */
function transliterate(runes) {
  return runes.map((x) => corpus.translit[x]).join("");
}
const plantSource = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(plantSource.length, 95);
const plant = Array.from({length: page53.length},
  (_, i) => plantSource[i % plantSource.length]);

const modes = [
  {name: "GP rune ordinal", number: (i) => i},
  {name: "GP prime weight", number: (i) => corpus.prime[i]},
  {name: "GP prime totient", number: (i) => corpus.prime[i] - 1}
];
const variants = [];
for (const mode of modes) {
  for (const sign of [-1, 1]) {
    const key = sourceKey.map((i) => mod(mode.number(i)));
    const decoded = page53.map((x, i) => mod(x + sign * key[i]));
    const replay = decoded.map((x, i) => mod(x - sign * key[i]));
    assert.deepEqual(replay, page53);
    const encryptedPlant = plant.map((x, i) => mod(x - sign * key[i]));
    assert.deepEqual(
      encryptedPlant.map((x, i) => mod(x + sign * key[i])),
      plant
    );
    variants.push({
      mode: mode.name,
      sign,
      originalGpIoc: ioc(decoded),
      first80runes: transliterate(decoded.slice(0, 80)),
      plantRecovered: plant.length
    });
  }
}

const hash = crypto.createHash("sha256").update(original).digest("hex");
console.log(JSON.stringify({
  signedSourceSha256: hash,
  fullSignedBodyGpCountWithHexIdLetters: sourceKey.length,
  signedBodyGpCountWithoutHexId: sourceWithoutId.length,
  matchedOriginalPage: 53,
  targetRuneLength: page53.length,
  targetIoc: ioc(page53),
  nativeSolvedP57Ioc: ioc(plantSource),
  finiteDirectInverses: variants,
  limitation: "No original/plaintext recovery. Include-AF length match is source-format dependent.",
}, null, 2));
