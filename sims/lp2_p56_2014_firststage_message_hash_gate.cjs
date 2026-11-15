#!/usr/bin/env node
"use strict";

// Source-frozen p56 candidate check: the solved 2014 first-three-page message
// and the onion handoff it names. This hashes only exact candidate strings;
// it does not substitute a URL string for the unavailable HTTP page body.

const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");

const TARGET =
  "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

const CIPHERTEXT_70 =
  "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const PLAINTEXT_70 =
  "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
const SPACED_PLAINTEXT =
  "GOOD WORK ULTIMATE TRUTH IS THE ULTIMATE ILLUSION JOIN US AT FV7LYUCMEOZZD5J4ONIO";
const ONION_HOST = "fv7lyucmeozzd5j4.onion";

assert.equal(TARGET.length, 128);
assert.equal(CIPHERTEXT_70.length, 70);
assert.equal(PLAINTEXT_70.length, 70);

// Known empty-message vectors protect the three built-in hash implementations.
const emptyVectors = {
  sha512: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
  "sha3-512": "a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26",
  blake2b512: "786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419d25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce"
};
for (const [algorithm, expected] of Object.entries(emptyVectors)) {
  assert.equal(createHash(algorithm).update(Buffer.alloc(0)).digest("hex"), expected);
}

const candidates = [
  { label: "2014 ciphertext, exact 70 characters", text: CIPHERTEXT_70 },
  { label: "2014 recovered plaintext, exact 70 characters", text: PLAINTEXT_70 },
  { label: "2014 recovered plaintext, natural word spaces", text: SPACED_PLAINTEXT },
  { label: "2014 onion host, bare", text: "fv7lyucmeozzd5j4" },
  { label: "2014 onion host, .onion form", text: ONION_HOST },
  { label: "2014 onion host, http URL", text: "http://" + ONION_HOST }
];
const algorithms = ["sha512", "sha3-512", "blake2b512"];
const results = [];
for (const candidate of candidates) {
  for (const algorithm of algorithms) {
    const digest = createHash(algorithm)
      .update(Buffer.from(candidate.text, "utf8"))
      .digest("hex");
    results.push({
      candidate: candidate.label,
      algorithm,
      utf8Bytes: Buffer.byteLength(candidate.text, "utf8"),
      digest,
      matchesTarget: digest === TARGET
    });
  }
}
const matches = results.filter(result => result.matchesTarget);
assert.equal(results.length, 18);
assert.equal(matches.length, 0);

console.log(JSON.stringify({
  classification: "source-motivated exact-string p56 hash gate; no match",
  target: TARGET,
  byteEncoding: "exact UTF-8; no BOM, newline, Unicode normalization, or inferred punctuation",
  algorithms: algorithms,
  emptyMessageVectorsPassed: true,
  candidates,
  comparisons: results.length,
  matches,
  results
}, null, 2));
