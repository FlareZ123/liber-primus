"use strict";

/**
 * Test the source-selected p0 23-rune receiver, and its fixed p28
 * center-cube/outer-reciprocal transform, as repeating GP29 keys on untouched
 * p1-p55. No key phase or extra layer is fitted.
 *
 * Run: node sims/lp2_readout_p0_23rune_key_transfer_sft.cjs
 * Node.js 22+, CommonJS, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = mod(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power >>= 1;
  }
  return result;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function transliterate(values) {
  return values.map(index => corpus.translit[index]).join("");
}
function letters(values) {
  return transliterate(values).replace(/[^A-Z]/g, "");
}
function buildTrigramModel(text) {
  const counts = new Map();
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  return {counts, total: text.length - 2, vocabulary: 26 ** 3};
}
function trigramScore(text, model) {
  let score = 0;
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    score += Math.log(((model.counts.get(gram) || 0) + 0.1) /
      (model.total + 0.1 * model.vocabulary));
  }
  return score / (text.length - 2);
}
function round(value) {
  return Number(value.toFixed(12));
}
function transformContinuous(values, key, sign) {
  return values.map((value, i) => mod(value + sign * key[i % key.length], 29));
}
function transformPageReset(pages, key, sign) {
  return pages.flatMap(page =>
    page.indices.map((value, i) => mod(value + sign * key[i % key.length], 29))
  );
}
function encodeContinuous(values, key, sign) {
  return values.map((value, i) => mod(value - sign * key[i % key.length], 29));
}
function encodePageReset(pages, key, sign) {
  return pages.flatMap(page =>
    page.indices.map((value, i) => mod(value - sign * key[i % key.length], 29))
  );
}

const p0 = corpus.pages.find(page => page.page === 0).indices;
const rawKey = p0.slice(80, 103);
assert.equal(rawKey.length, 23);
assert.deepEqual(rawKey, [
  21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26,
]);
assert.deepEqual(rawKey.map((value, i) => value === 0 ? i : -1).filter(i => i >= 0), [11]);

// The existing p28 transfer applies cube3 to the center and reciprocal power27
// to all 22 nonzero outer symbols. The center F=0 remains zero under cube3.
const p28OutputKey = rawKey.map((value, i) => powMod(value, i === 11 ? 3 : 27, 29));
assert.deepEqual(p28OutputKey, [
  18,7,15,3,7,11,27,15,9,5,19,0,18,6,8,15,23,26,3,18,3,14,19,
]);
assert.equal(rawKey.length, p28OutputKey.length);

const pages = corpus.pages.filter(page => page.page >= 1 && page.page <= 55);
assert.equal(pages.length, 55);
const target = pages.flatMap(page => page.indices);
assert.equal(target.length, 12694);
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);

const caesarText = read("resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt")
  .split(/\r?\n/).filter(line => !line.startsWith("#")).join(" ")
  .toUpperCase().replace(/[^A-Z]/g, "");
const shakespeareText = read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().replace(/[^A-Z]/g, "");
const models = {
  latin: buildTrigramModel(caesarText),
  english: buildTrigramModel(shakespeareText),
};

const candidates = [
  {name: "raw_p0_receiver", key: rawKey},
  {name: "p28_center_cube_outer_reciprocal", key: p28OutputKey},
];
const variants = [];
for (const candidate of candidates) {
  for (const sign of [-1, 1]) {
    for (const clock of ["continuous", "page-reset"]) {
      const output = clock === "continuous"
        ? transformContinuous(target, candidate.key, sign)
        : transformPageReset(pages, candidate.key, sign);
      const replay = clock === "continuous"
        ? encodeContinuous(output, candidate.key, sign)
        : encodePageReset(pages.map((page, i) => ({
            ...page,
            indices: output.slice(
              pages.slice(0, i).reduce((sum, previous) => sum + previous.indices.length, 0),
              pages.slice(0, i + 1).reduce((sum, previous) => sum + previous.indices.length, 0)
            )
          })), candidate.key, sign);
      assert.deepEqual(replay, target, candidate.name + " " + clock + " must re-encrypt exactly");
      const text = letters(output);
      variants.push({
        key: candidate.name,
        keyLength: candidate.key.length,
        keyTransliteration: transliterate(candidate.key),
        sign: sign < 0 ? "subtract" : "add",
        clock,
        ioc: round(ioc(output)),
        latinTrigramScore: round(trigramScore(text, models.latin)),
        englishTrigramScore: round(trigramScore(text, models.english)),
        first160: text.slice(0, 160),
        exactReencrypt: true,
      });
    }
  }
}
assert.equal(variants.length, 8);

console.log(JSON.stringify({
  status: "bounded direct repeating-key negative; no LP2 plaintext recovered",
  receiverSourceOffsetsZeroBased: [80, 102],
  targetPages: [1, 55],
  targetRunes: target.length,
  keyLength: 23,
  rawKeyIndices: rawKey,
  rawKeyTransliteration: transliterate(rawKey),
  p28OutputKeyIndices: p28OutputKey,
  p28OutputKeyTransliteration: transliterate(p28OutputKey),
  originalIoC: round(ioc(target)),
  clearP57Control: {
    runes: p57.length,
    ioc: round(ioc(p57)),
    latinTrigramScore: round(trigramScore(letters(p57), models.latin)),
    englishTrigramScore: round(trigramScore(letters(p57), models.english)),
  },
  uniform29Baseline: round(1 / 29),
  variants,
  exactReencryptments: variants.filter(variant => variant.exactReencrypt).length + "/" + variants.length,
}, null, 2));
