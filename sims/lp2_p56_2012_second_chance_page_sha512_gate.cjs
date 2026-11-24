#!/usr/bin/env node
"use strict";

// Test only exact, source-pinned 2012 Cicada page/message objects that
// could plausibly be the historical hidden-service return payload.
// No guessed URL strings, wrappers, line-ending variants or hash-family sweep.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const sha512 = b => crypto.createHash("sha512").update(b).digest("hex");
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const gitBlobSha1 = b => crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest("hex");

assert.equal(sha512(Buffer.from("abc", "ascii")),
  "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f");

const midiPath = process.argv[2];
assert(midiPath, "Pass the exact Cicada.mid extracted from the signed 2012 email");
const inputs = [
  {
    name: "2012 countdown clear-signed message",
    path: path.join(root, "resources/historical/cicada2012-countdown-message.asc"),
    expectedGitBlobSha1: "7229104f48f4a0eeeae69c901eb74cb21baed956"
  },
  {
    name: "2012 one-time RSA page clear-signed message",
    path: path.join(root, "resources/historical/cicada2012-message-only-displayed.asc"),
    expectedGitBlobSha1: "672184615cf25d19e5eb177875be83b4d83c1128"
  },
  {
    name: "2012 second-chance MIDI follow-up clear-signed email",
    path: path.join(root, "resources/historical/cicada2012-midi-email.asc"),
    expectedGitBlobSha1: "cbdb9899a5c77f364456f55e39bd25b73467d809"
  },
  {
    name: "2012 signed literal MIDI attachment Cicada.mid",
    path: midiPath,
    expectedGitBlobSha1: "11924e0e195208c2eea757655035e149fb8a190f",
    expectedSha256: "e6c5b86bb1a95f1a2239237eaf9d060ba708f07d46ffe8c4bce4fca06a5c529c"
  }
];

const results = inputs.map(input => {
  const bytes = fs.readFileSync(input.path);
  const blob = gitBlobSha1(bytes);
  const result = {
    name: input.name,
    bytes: bytes.length,
    git_blob_sha1: blob,
    sha256: sha256(bytes),
    sha512: sha512(bytes),
    matches_p56_sha512_target: sha512(bytes) === target
  };
  assert.equal(blob, input.expectedGitBlobSha1, `Source blob mismatch for ${input.name}`);
  if (input.expectedSha256) assert.equal(result.sha256, input.expectedSha256);
  if (input.name.includes("Cicada.mid")) assert.equal(bytes.length, 10889);
  return result;
});

console.log(JSON.stringify({target_sha512: target, digest_convention: "SHA-512 only; 128-hex target; candidate-specific test, not proof of intended algorithm", results}, null, 2));
