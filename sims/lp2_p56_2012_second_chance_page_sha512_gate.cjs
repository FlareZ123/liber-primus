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
    name: "2012 sq6wmgv2zcsrix6t.onion exact root HTML page",
    authentication: "archived HTML; embedded PGP message verifies with Cicada 2012 key",
    path: path.join(root, "resources/external/2012-sq6wmgv2zcsrix6t-onion-index.html"),
    expectedGitBlobSha1: "03a7bd9e98578fd51ae3f798375cbbe8bc41dd96"
  },
  {
    name: "2012 participant-mirrored one-time RSA page message",
    authentication: "provenance-qualified mirror; PGP signature does not verify",
    path: path.join(root, "resources/external/2012-sq6wmgv2zcsrix6t-unknown.asc"),
    expectedGitBlobSha1: "0e69b063b379a8ccdd8a96815de318bcf65a1247"
  },
  {
    name: "2012 participant-mirrored second-chance RSA page message",
    authentication: "provenance-qualified mirror; PGP signature does not verify",
    path: path.join(root, "resources/external/2012-sq6wmgv2zcsrix6t-another-unknown.asc"),
    expectedGitBlobSha1: "e2dbbad61d8dfb1a9efa736a331f183745ac157e"
  },
  {
    name: "2012 valid participant-specific RSA message (quaetrix0)",
    authentication: "Cicada PGP signature; archive identifies this as the only valid signed participant version",
    path: path.join(root, "resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc"),
    expectedGitBlobSha1: "30a45f2149bf46fd99d156d24b7132f8e0f207b3"
  },
  {
    name: "2012 countdown clear-signed message",
    authentication: "clear-signed; verified with Cicada 2012 key in workflow",
    path: path.join(root, "resources/historical/cicada2012-countdown-message.asc"),
    expectedGitBlobSha1: "7229104f48f4a0eeeae69c901eb74cb21baed956"
  },
  {
    name: "2012 one-time RSA page clear-signed message",
    authentication: "clear-signed; verified with Cicada 2012 key in workflow",
    path: path.join(root, "resources/historical/cicada2012-message-only-displayed.asc"),
    expectedGitBlobSha1: "672184615cf25d19e5eb177875be83b4d83c1128"
  },
  {
    name: "2012 second-chance MIDI follow-up clear-signed email",
    authentication: "clear-signed; verified with Cicada 2012 key in workflow",
    path: path.join(root, "resources/historical/cicada2012-midi-email.asc"),
    expectedGitBlobSha1: "cbdb9899a5c77f364456f55e39bd25b73467d809"
  },
  {
    name: "2012 signed literal MIDI attachment Cicada.mid",
    authentication: "embedded PGP signature verifies with Cicada 2012 key",
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
    authentication: input.authentication,
    bytes: bytes.length,
    git_blob_sha1: blob,
    sha256: sha256(bytes),
    sha512: sha512(bytes),
    matches_p56_sha512_target: sha512(bytes) === target
  };
  assert.equal(blob, input.expectedGitBlobSha1, `Source blob mismatch for ${input.name}`);
  if (input.expectedSha256) assert.equal(result.sha256, input.expectedSha256);
  if (input.name.includes("Cicada.mid")) assert.equal(bytes.length, 10889);
  if (input.name.includes("root HTML page")) assert.equal(bytes.length, 1788);
  return result;
});

console.log(JSON.stringify({target_sha512: target, digest_convention: "SHA-512 only; 128-hex target; candidate-specific test, not proof of intended algorithm", results}, null, 2));
