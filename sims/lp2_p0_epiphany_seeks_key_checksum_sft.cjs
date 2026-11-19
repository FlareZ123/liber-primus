"use strict";

/**
 * SFT: source-selected p0 red-title plaintext -> additive-key structural holdouts.
 *
 * This does not assume a global p0 cipher. It derives the 13 GP29 residues
 * required to map the independently selected EPIPHANY SEEKS plaintext onto the
 * original 13-rune red title and tests exact manuscript/source consequences.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const signed = fs.readFileSync(
  path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const tokens = grid.pages.flatMap((page) => page.tokens);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} xs @returns {number} */
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** @returns {string[]} */
function signedWords() {
  const clear = signed
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

/**
 * Count length-n GP29 sequences by (GP0 sum, GP-prime sum).
 * @param {number} n
 * @param {number} maxGp0
 * @param {number} maxPrime
 * @returns {Map<string,bigint>}
 */
function measureCounts(n, maxGp0, maxPrime) {
  let dp = new Map([["0,0", 1n]]);
  for (let step = 0; step < n; step += 1) {
    const next = new Map();
    for (const [key, count] of dp.entries()) {
      const [s, p] = key.split(",").map(Number);
      for (let value = 0; value < 29; value += 1) {
        const ns = s + value;
        const np = p + corpus.prime[value];
        if (ns > maxGp0 || np > maxPrime) continue;
        const nk = ns + "," + np;
        next.set(nk, (next.get(nk) || 0n) + count);
      }
    }
    dp = next;
  }
  return dp;
}

assert.equal(p0.length >= 13, true);
const cipherTitle = p0.slice(0, 13);
assert.deepEqual(cipherTitle, [15,8,18,3,6,19,27,0,15,26,18,21,5]);

const epiphany = gp("EPIPHANY");
const seeks = gp("SEEKS");
assert.equal(epiphany.length, 8);
assert.equal(seeks.length, 5);
const plainTitle = [...epiphany, ...seeks];
const key = cipherTitle.map((value, i) => (value - plainTitle[i] + 29) % 29);

assert.deepEqual(key, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.equal(key.length, 13);
assert.equal(sum(key), 192);
assert.equal(sum(key.map((value) => corpus.prime[value])), 729);
assert.equal(sum(key.slice(0, 8)), 149);
assert.equal(sum(key.slice(8)), 43);

// Independent manuscript/source structures hit by those fixed measurements.
assert.equal(tokens[192], "00");
assert.equal(grid.bytes[192], 0);
assert.equal(
  corpus.pages.filter((page) => page.page >= 0 && page.page <= 2)
    .reduce((n, page) => n + page.indices.length, 0),
  729
);
const strictInteriorLength = 127 - 83 - 1;
assert.equal(strictInteriorLength, 43);

// Source-family census. Keep the same authenticated 43-word parser as the
// established 2016 GP0/p50 receiver SFT.
const message = signedWords();
assert.equal(message.length, 43);
const rows = message.map((word, index) => ({index, word, values: gp(word)}));
const adjacent85 = [];
for (let i = 0; i < rows.length - 1; i += 1) {
  if (rows[i].values.length === 8 && rows[i + 1].values.length === 5) {
    adjacent85.push(rows[i].word.toUpperCase() + " " + rows[i + 1].word.toUpperCase());
  }
}
assert.deepEqual(adjacent85, ["EPIPHANY SEEKS"]);

const ordered85 = [];
for (const first of rows.filter((row) => row.values.length === 8)) {
  for (const second of rows.filter((row) => row.values.length === 5)) {
    const plain = [...first.values, ...second.values];
    const k = cipherTitle.map((value, i) => (value - plain[i] + 29) % 29);
    ordered85.push({
      phrase: first.word.toUpperCase() + " " + second.word.toUpperCase(),
      gp0: sum(k),
      gpPrime: sum(k.map((value) => corpus.prime[value])),
      suffixGp0: sum(k.slice(8)),
    });
  }
}
assert.equal(ordered85.length, 8);
const checksumHits = ordered85.filter((row) =>
  row.gp0 === 192 && row.gpPrime === 729 && row.suffixGp0 === 43);
assert.deepEqual(checksumHits, [{
  phrase: "EPIPHANY SEEKS",
  gp0: 192,
  gpPrime: 729,
  suffixGp0: 43,
}]);

// Fixed random-key calibration: count all 29^13 residue sequences satisfying
// the two whole-key measures, then the stricter suffix-GP0=43 holdout.
const whole = measureCounts(13, 192, 729);
const both = whole.get("192,729") || 0n;
const eight = measureCounts(8, 149, 729);
const five = measureCounts(5, 43, 729);
let triple = 0n;
for (const [k5, c5] of five.entries()) {
  const [s5, p5] = k5.split(",").map(Number);
  if (s5 !== 43) continue;
  const c8 = eight.get("149," + (729 - p5)) || 0n;
  triple += c5 * c8;
}
assert.equal(both, 347924712936372n);
assert.equal(triple, 1892838925720n);
const total = 29n ** 13n;

// Negative extraction check: the recovered key is not a direct 13-pair
// sum/difference readout of any natural 27-cell center line of the 27x27
// p0-p2 square.
const chapter = corpus.pages.filter((page) => page.page >= 0 && page.page <= 2)
  .flatMap((page) => page.indices);
assert.equal(chapter.length, 729);
const lines = [
  Array.from({length:27}, (_, j) => chapter[13 * 27 + j]),
  Array.from({length:27}, (_, i) => chapter[i * 27 + 13]),
  Array.from({length:27}, (_, i) => chapter[i * 27 + i]),
  Array.from({length:27}, (_, i) => chapter[i * 27 + (26 - i)]),
];
let centerLineExact = 0;
for (const line of lines) {
  for (const oriented of [line, [...line].reverse()]) {
    const families = [
      Array.from({length:13}, (_, i) => (oriented[i] + oriented[26 - i]) % 29),
      Array.from({length:13}, (_, i) => (oriented[i] - oriented[26 - i] + 29) % 29),
      Array.from({length:13}, (_, i) => (oriented[26 - i] - oriented[i] + 29) % 29),
    ];
    centerLineExact += families.filter((candidate) =>
      candidate.every((value, i) => value === key[i])).length;
  }
}
assert.equal(centerLineExact, 0);

console.log(JSON.stringify({
  candidate_plaintext: "EPIPHANY SEEKS",
  additive_key_indices: key,
  additive_key_translit: key.map((value) => corpus.translit[value]).join(""),
  measures: {
    length: key.length,
    gp0: sum(key),
    gp_prime: sum(key.map((value) => corpus.prime[value])),
    epiphany_segment_gp0: sum(key.slice(0, 8)),
    seeks_segment_gp0: sum(key.slice(8)),
  },
  exact_source_links: {
    p50_cell_192: tokens[192],
    p0_p2_rune_count: chapter.length,
    strict_interior_length_83_127: strictInteriorLength,
  },
  source_family: {
    signed_words: message.length,
    adjacent_8_5_phrases: adjacent85,
    ordered_8_by_5_pairs: ordered85.length,
    exact_checksum_hits: checksumHits,
  },
  fixed_uniform_key_calibration: {
    sequences_total: total.toString(),
    whole_measure_hits: both.toString(),
    triple_measure_hits: triple.toString(),
    triple_probability: Number(triple) / Number(total),
  },
  natural_27x27_center_pair_extractions: centerLineExact,
  decision: "independent title-plaintext corroboration; checksum does not yet supply the cipher generator",
}, null, 2));
