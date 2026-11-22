"use strict";

/**
 * A source-locked known-plaintext attack on the real 2013 CicadaOS DATA/560.13.
 *
 * Original LP2 p0 red title is a 13-rune, 8|5 packet. The independently
 * reconstructed 2016 signed word register and p0 13-dot geometry nominate
 * EPIPHANY SEEKS as a candidate plaintext, NOT an established decryption.
 * Test whether its exact 13-symbol required key occurs anywhere in a genuine
 * 2013 Cicada byte pad under the finite, originally available transfers.
 *
 * Windows Node.js 22:
 *   node sims/lp2_p0_2013_historical_pad_knownplain_crib_sft.cjs <DATA_560.13>
 *
 * Zero offset guessing: every possible byte start is searched once. A full
 * 13-symbol hit is an independently strong new lead; short matches are noise.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const title = corpus.pages[0].indices.slice(0, 13);
const guessedPlain = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
assert.deepEqual(title, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(title.length, 13);
assert.equal(guessedPlain.length, 13);
const mod29 = (n) => ((n % 29) + 29) % 29;
const mappings = [
  {
    name: "literal_GP_index_XOR",
    target: title.map((c, i) => c ^ guessedPlain[i]),
    map: (b) => b,
    encode: (v) => v,
  },
  {
    name: "literal_GP_prime_weight_XOR",
    target: title.map((c, i) => corpus.prime[c] ^ corpus.prime[guessedPlain[i]]),
    map: (b) => b,
    encode: (v) => v,
  },
  {
    name: "BASE29_byte_remainder_CminusP",
    target: title.map((c, i) => mod29(c - guessedPlain[i])),
    map: (b) => b % 29,
    encode: (v) => v,
  },
  {
    name: "BASE29_byte_remainder_PminusC",
    target: title.map((c, i) => mod29(guessedPlain[i] - c)),
    map: (b) => b % 29,
    encode: (v) => v,
  },
  {
    name: "uniform_byte_partition_CminusP",
    target: title.map((c, i) => mod29(c - guessedPlain[i])),
    map: (b) => Math.floor(29 * b / 256),
    encode: (v) => Math.ceil(256 * v / 29),
  },
  {
    name: "uniform_byte_partition_PminusC",
    target: title.map((c, i) => mod29(guessedPlain[i] - c)),
    map: (b) => Math.floor(29 * b / 256),
    encode: (v) => Math.ceil(256 * v / 29),
  },
];

/**
 * @param {Buffer} source Authentic file or synthetic test buffer.
 * @param {number[]} target Exact 13-symbol key pattern.
 * @param {(value: number) => number} mapping Byte-to-key-symbol codec.
 * @returns {{hits: number[], longest: number, windows: number}}
 */
function scan(source, target, mapping) {
  const hits = [];
  let longest = 0;
  const limit = source.length - target.length;
  const mapTable = Uint8Array.from({length: 256}, (_, b) => mapping(b));
  for (let at = 0; at <= limit; at++) {
    if (mapTable[source[at]] !== target[0]) continue;
    let k = 1;
    while (k < target.length && mapTable[source[at + k]] === target[k]) k++;
    if (k > longest) longest = k;
    if (k === target.length) hits.push(at);
  }
  return {hits, longest, windows: Math.max(0, limit + 1)};
}

// Genuine round-trip, source-shaped positive control for every finite transfer,
// both byte orders. A synthetic 13-byte exact key is inserted at fixed offset.
for (const variant of mappings) {
  const fake = Buffer.from(Array.from({length: 230}, (_, i) => (i * 71 + 23) & 255));
  for (const backwards of [false, true]) {
    const key = backwards ? [...variant.target].reverse() : variant.target;
    const at = 137;
    key.forEach((v, i) => { fake[at + i] = variant.encode(v); });
    const test = scan(fake, key, variant.map);
    assert.ok(test.hits.includes(at), "Synthetic exact-key recovery failed for " + variant.name);
  }
}

const sourcePath = process.argv[2];
assert.ok(sourcePath, "Supply the complete historical DATA/560.13 file path");
const bytes = fs.readFileSync(sourcePath);
assert.equal(bytes.length, 118818811);
const digest = crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(digest, "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");

const tests = [];
for (const variant of mappings) {
  for (const backwards of [false, true]) {
    const key = backwards ? [...variant.target].reverse() : variant.target;
    const result = scan(bytes, key, variant.map);
    tests.push({
      case: variant.name,
      key_direction: backwards ? "reverse" : "forward",
      longest_matching_key_prefix: result.longest,
      full_13_key_hits: result.hits.length,
      exact_byte_offsets: result.hits.slice(0, 100),
      windows: result.windows,
    });
  }
}
const fullHits = tests.reduce((sum, t) => sum + t.full_13_key_hits, 0);
console.log(JSON.stringify({
  original_p0_red_title_GP29: title,
  candidate_EPIPHANY_SEEKS_GP29: guessedPlain,
  candidate_status: "Retrospectively derived. NOT independently authenticated plaintext.",
  original_historical_dataset_sha256: digest,
  source_bytes: bytes.length,
  tested_model_count: tests.length,
  original_full_key_hits: fullHits,
  tests,
  interpretation: fullHits
    ? "Full 13-rune pattern found. Inspect authentic source offset and test the unmodified continuation on untouched p0 black ciphertext BEFORE claiming a decoder."
    : "This CicadaOS 2013 dataset contains no contiguous 13-byte key able to generate the p0 candidate under these exact direct historical and finite GP29 byte transfers. Nonlinear/transposed pads and other sources remain open.",
}, null, 2));
