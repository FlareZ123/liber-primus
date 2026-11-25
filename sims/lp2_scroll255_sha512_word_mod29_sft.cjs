#!/usr/bin/env node
"use strict";

/**
 * Test a source-motivated one-word/one-rune digest receiver:
 *   SHA-512(word serialization) as a big-endian integer, reduced mod 29.
 *
 * The 255 whole words on p3-p7 and the adjacent 255-rune p8 form a unique
 * original-source length alignment. The p56 page contains an authenticated
 * SHA-512 checksum example. Neither fact authenticates per-word hashing;
 * this is a small, fixed hypothesis test, not a fitted cipher.
 *
 * Compare the same 255 digest outputs against literal p8 and the separately
 * documented, still-conditional GF4/radix59 corrected p8 candidate Q.
 *
 * Run: node sims/lp2_scroll255_sha512_word_mod29_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const dir = path.join(__dirname, "..", "resources", "liber-primus");
const gp = JSON.parse(fs.readFileSync(path.join(dir, "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(dir, "lp2-grid-256.json"), "utf8"));
const sections = fs.readFileSync(path.join(dir, "lp2-transcription.txt"), "utf8").split("%");
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = x => ((x % 29) + 29) % 29;

const words = [];
let word = [];
for (let page = 3; page <= 7; page++) {
  for (const ch of sections[page]) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if ((ch === "-" || ch === ".") && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));

const rawP8 = gp.pages[8].indices;
assert.equal(rawP8.length, 255);

// Reconstruct the conditional Q receiver exactly as frozen in the existing
// all-secret report. It remains a hypothesis, not established plaintext.
const red5 = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(gp.pages[7].indices.slice(194), red5.flat());
const products = red5.map(w => w.reduce((a, v) => mod29(a * v), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);

function mulGF4(a, b) {
  let z = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) z ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return z;
}
let state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((a, v) => a * 4 + v, 0));
  const next = state.reduce((a, v, j) => a ^ mulGF4(v, products[j] % 4), 0);
  state = [state[1], state[2], state[3], next];
}
assert.equal(new Set(addresses).size, 255);
const alphabet = grid.alphabet.replace("f", "");
assert.equal(alphabet.length, 59);
const table = grid.pages.flatMap(p => p.tokens);
const table59 = table.map(t => 59 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
const correctedQ = rawP8.map((c, i) => mod29(c + table59[addresses[i]]));
assert.deepEqual(
  [[47, 240], [48, 231], [235, 236], [88, 179]].map(([i, j]) => [correctedQ[i], correctedQ[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]
);

const primeProductDecimal = w => w.reduce((a, v) => a * BigInt(gp.prime[v]), 1n).toString();
const serializers = {
  "native-rune-utf8": w => Buffer.from(w.map(v => gp.runes[v]).join(""), "utf8"),
  "gp-transliteration-ascii": w => Buffer.from(w.map(v => gp.translit[v]).join(""), "ascii"),
  "gp-ordinal-bytes": w => Buffer.from(w),
  "gp-prime-value-bytes": w => Buffer.from(w.map(v => gp.prime[v])),
  "gp-prime-product-decimal-ascii": w => Buffer.from(primeProductDecimal(w), "ascii")
};

// The only output projection tested is the natural big-endian digest integer
// modulo the 29-symbol alphabet. No fitted offset, phase, affine relabeling,
// digest byte, endianness, or word reordering is searched.
function digestMod29(bytes) {
  const digest = crypto.createHash("sha512").update(bytes).digest();
  let residue = 0;
  for (const byte of digest) residue = (residue * 256 + byte) % 29;
  return residue;
}

const results = [];
for (const [serialization, encode] of Object.entries(serializers)) {
  const stream = words.map(w => digestMod29(encode(w)));
  const rawMatches = stream.reduce((n, v, i) => n + Number(v === rawP8[i]), 0);
  const qMatches = stream.reduce((n, v, i) => n + Number(v === correctedQ[i]), 0);
  results.push({
    serialization,
    rawP8Matches: rawMatches,
    conditionalQMatches: qMatches,
    first20: stream.slice(0, 20),
    last10: stream.slice(-10)
  });
}

console.log(JSON.stringify({
  experiment: "independent SHA-512 per-word digest, big-endian integer mod29",
  source: {
    wholeWordsP3toP7: words.length,
    sourceRunesP3toP7: words.reduce((n, w) => n + w.length, 0),
    rawP8Runes: rawP8.length,
    conditionalQRunes: correctedQ.length,
    qStatus: "conditional, unverified GF4/radix59 receiver"
  },
  fixedScope: {
    digest: "SHA-512",
    output: "big-endian digest integer mod29",
    serializations: Object.keys(serializers),
    fittedParameters: 0
  },
  results,
  exactRawMatches: results.filter(x => x.rawP8Matches === 255).map(x => x.serialization),
  exactConditionalQMatches: results.filter(x => x.conditionalQMatches === 255).map(x => x.serialization)
}, null, 2));
