#!/usr/bin/env node
"use strict";
/**
 * Exact SHA-512 preimage check for the original 2013 Cicada 761.MP3.
 * Source pinned at rtkd/iddqd commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023,
 * path 2013/02/761.MP3; the existing ID3 audit pins its 4,010,732 bytes and SHA-256.
 *
 * This is one source-fixed candidate for the 64-byte SHA-512 digest printed on
 * LP2 p56. It hashes the complete original MP3 bytes, with no trimming,
 * re-encoding, metadata removal, or guessed serialization.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const EXPECTED_BYTES = 4010732;
const SOURCE_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const P56_SHA512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

const input = process.argv[2];
assert.ok(input, "Pass the pinned original 761.MP3 path");
const bytes = fs.readFileSync(input);
assert.equal(bytes.length, EXPECTED_BYTES, "Refuse non-pinned 761.MP3 byte length");
const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(sha256, SOURCE_SHA256, "Refuse non-pinned original 761.MP3 bytes");
const sha512 = crypto.createHash("sha512").update(bytes).digest("hex");
assert.match(sha512, /^[0-9a-f]{128}$/u);
console.log(JSON.stringify({
  source: "rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023:2013/02/761.MP3",
  bytes: bytes.length,
  sha256,
  sha512,
  p56TargetSha512: P56_SHA512,
  exactPreimageMatch: sha512 === P56_SHA512,
  scope: "raw complete MP3 bytes only; no guessed alternate serialization"
}, null, 2));
