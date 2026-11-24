"use strict";

/**
 * Bounded SFT: test the conditional p0 title and its two geometric key nodes
 * as continuous repeating additive GP29 keys for the original 716-rune p0-p2
 * body. The title and node readings are conditional inputs from the existing
 * source-only p0 route; this script tests only their direct key use.
 *
 * Run: node sims/lp2_p0_title_key_body_vigenere_sft.cjs
 * Node.js 22+, CommonJS, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));

const selected = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(selected.length, 729, "original p0-p2 source span must be 27x27");
const body = selected.slice(13);
assert.equal(body.length, 716, "exclude only the 13-rune original p0 red heading");

assert.deepEqual(ink.physical_zero_based.red_words.map(word => word.length), [8, 5]);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].dots, 13);
assert.deepEqual(ink.physical_zero_based.red_words.flatMap(word => word.gp_indices), selected.slice(0, 13));

const tokenIndex = token => {
  const index = corpus.translit.indexOf(token);
  assert.notEqual(index, -1, "missing GP29 token: " + token);
  return index;
};
const tokens = values => values.map(tokenIndex);

// These are conditional candidate inputs from the existing p0 source-only
// construction. Preserve TH as one GP rune in the second node.
const keys = {
  conditionalTitle: tokens(["S", "E", "C", "U", "E", "N", "D", "I", "R", "A", "T", "I", "O"]),
  firstGeometricNode: tokens(["X", "N", "X", "C"]),
  secondGeometricNode: tokens(["J", "TH", "TH"]),
};
keys.concatenatedNodes = [...keys.firstGeometricNode, ...keys.secondGeometricNode];
keys.sumOfPeriodicNodes = Array.from({length: 12}, (_, i) =>
  (keys.firstGeometricNode[i % 4] + keys.secondGeometricNode[i % 3]) % 29
);

function decode(cipher, key, sign) {
  return cipher.map((value, i) => (value + sign * key[i % key.length] + 29) % 29);
}
function encode(plain, key, sign) {
  return plain.map((value, i) => (value - sign * key[i % key.length] + 29) % 29);
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function show(values) {
  return values.map(index => corpus.translit[index]).join("");
}
function rounded(value) {
  return Number(value.toFixed(12));
}

const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95, "clear p57 PARABLE control length");
const variants = [];
for (const [name, key] of Object.entries(keys)) {
  assert.ok(key.length > 0);
  for (const sign of [-1, 1]) {
    const plain = decode(body, key, sign);
    assert.deepEqual(encode(plain, key, sign), body,
      name + " must exactly re-encrypt the original body");
    variants.push({
      key: name,
      keyTokens: key.map(index => corpus.translit[index]),
      period: key.length,
      sign: sign < 0 ? "subtract" : "add",
      ioc: rounded(ioc(plain)),
      first120: show(plain.slice(0, 120)),
      exactReencrypt: true,
    });
  }
}
assert.equal(variants.length, 10);

console.log(JSON.stringify({
  status: "bounded direct repeating-key negative; no LP2 plaintext recovered",
  selectedSpanRunes: selected.length,
  titleRunesExcluded: 13,
  bodyRunesTested: body.length,
  bodyIoC: rounded(ioc(body)),
  uniform29Baseline: rounded(1 / 29),
  clearP57ControlRunes: p57.length,
  clearP57ControlIoC: rounded(ioc(p57)),
  variants,
  exactReencryptments: variants.filter(variant => variant.exactReencrypt).length + "/" + variants.length,
}, null, 2));
