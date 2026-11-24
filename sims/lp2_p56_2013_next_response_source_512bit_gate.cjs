#!/usr/bin/env node
"use strict";

// Bounded p56 512-bit preimage test for five exact 2013 signed NEXT objects.
// The original p56 target is 128 hex characters (512 bits), not SHA-256.
// Test the three 512-bit functions already used in the p56 synthesis:
// SHA-512, BLAKE2b-512 and SHA3-512. No archive/URL search or wrappers.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p));
const hash = (algorithm, bytes) => crypto.createHash(algorithm).update(bytes).digest("hex");
const algorithms = ["sha512", "blake2b512", "sha3-512"];
for (const algorithm of algorithms) {
  assert(crypto.getHashes().includes(algorithm), "Node/OpenSSL lacks " + algorithm);
}

const armoredLF = read("resources/historical/derived/cicada2013-20130303-next-response.asc");
const clientlog = read("resources/historical/cicada2013-clientlog-1362290293-9.txt");
const publicKey = read("resources/control/cicada-3301-public-key.asc");
const tcpPath = process.env.TCP_SOURCE_PATH;
assert(tcpPath, "Set TCP_SOURCE_PATH to the exact pinned upstream messages/2013/tcp-server.asc");
const tcpSource = fs.readFileSync(tcpPath);
const gold = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json").toString("utf8"));
const p56 = gold.sections.find((section) => section.name === "p56_an_end");
assert(p56, "Missing solved native p56 source text");
const targets = p56.source_text.match(/[0-9a-f]{128}/gi) || [];
assert.equal(targets.length, 1, "Expected exactly one 128-hex p56 digest");
const target = targets[0].toLowerCase();
assert.equal(target.length, 128);
assert.equal(clientlog.length, 10636);
assert.equal(armoredLF.length, 3182);
assert.equal(tcpSource.length, 3775);
assert.equal(publicKey.length, 3057);

// The clientlog preserves each server line as a Received line record with a
// literal escaped CRLF terminator. Reconstruct the exact server response in
// its original CRLF serialization, plus its LF-normalized stored derivative.
const logText = clientlog.toString("ascii");
assert(!/[^\x00-\x7f]/.test(logText), "Clientlog is not ASCII");
const extracted = [];
let captured = false;
for (const line of logText.split(/\r?\n/u)) {
  const marker = line.indexOf("Received line:");
  if (marker < 0) continue;
  const rest = line.slice(marker + "Received line:".length).trimStart();
  const quote = rest[0];
  if (quote !== "'" && quote !== '"') continue;
  const end = rest.lastIndexOf(quote);
  if (end <= 0) continue;
  let payload = rest.slice(1, end);
  if (!captured && payload === "-----BEGIN PGP SIGNED MESSAGE-----\\r\\n") captured = true;
  if (!captured) continue;
  if (payload.endsWith("\\r\\n")) payload = payload.slice(0, -4);
  else if (payload.endsWith("\\n")) payload = payload.slice(0, -2);
  extracted.push(payload);
  if (payload === "-----END PGP SIGNATURE-----") break;
}
assert(captured);
assert.equal(extracted[0], "-----BEGIN PGP SIGNED MESSAGE-----");
assert.equal(extracted[1], "Hash: SHA1");
assert.equal(extracted[2], "");
assert.equal(extracted.at(-1), "-----END PGP SIGNATURE-----");
assert.equal(extracted.length, 65);
const signatureStart = extracted.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.equal(signatureStart, 48);

const armoredLFReconstructed = Buffer.from(extracted.join("\n") + "\n", "ascii");
const armoredCRLFOriginal = Buffer.from(extracted.join("\r\n") + "\r\n", "ascii");
const clearSignedBodyCRLF = Buffer.from(extracted.slice(3, signatureStart).join("\r\n") + "\r\n", "ascii");
assert.equal(armoredLFReconstructed.length, 3182);
assert(armoredLFReconstructed.equals(armoredLF),
  "Clientlog-derived LF armor no longer equals the preserved .asc file");
assert.equal(armoredCRLFOriginal.length, 3247);
assert.equal(clearSignedBodyCRLF.length, 2344);

// Five logical candidate objects: complete original CRLF armor, clear-signed
// body with original CRLF, raw clientlog, pinned raw signed TCP source, and
// the exact public key used by the signature verifier. The stored LF .asc is
// verified as a normalized copy of the armor, not counted as a sixth object.
const candidates = [
  { name: "complete_armored_NEXT_original_CRLF", bytes: armoredCRLFOriginal },
  { name: "clear_signed_message_body_original_CRLF", bytes: clearSignedBodyCRLF },
  { name: "raw_clientlog", bytes: clientlog },
  { name: "signed_TCP_server_source_pinned_commit", bytes: tcpSource },
  { name: "verification_public_key", bytes: publicKey }
];
const tcpSha256 = hash("sha256", tcpSource);
const armoredLFSha256 = hash("sha256", armoredLF);
assert.equal(tcpSha256, "fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c",
  "Pinned TCP source bytes do not match the preserved source note");
assert.equal(armoredLFSha256, "062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87",
  "Stored NEXT armor bytes changed");

const results = candidates.map((candidate) => {
  const hashes = Object.fromEntries(algorithms.map((algorithm) =>
    [algorithm, hash(algorithm, candidate.bytes)]));
  const matches = algorithms.filter((algorithm) => hashes[algorithm] === target);
  return {
    name: candidate.name,
    bytes: candidate.bytes.length,
    sha256_integrity: hash("sha256", candidate.bytes),
    hashes_512: hashes,
    matchingFunctions: matches
  };
});
const matches = results.flatMap((result) => result.matchingFunctions.map((algorithm) => ({
  object: result.name, algorithm
})));
assert.equal(matches.length, 0, "A 512-bit candidate matches p56; investigate before closing");

process.stdout.write(JSON.stringify({
  decision: "finite negative: no exact match among five 2013 NEXT/source/key objects",
  p56Target: { hex: target, hexCharacters: target.length, bits: 512, algorithm: "not authenticated by length alone" },
  testedFunctions: algorithms,
  candidateObjects: candidates.length,
  comparisons: candidates.length * algorithms.length,
  reconstruction: {
    receivedLineRecords: extracted.length,
    signatureBeginLine: signatureStart,
    armoredLFStoredBytes: armoredLF.length,
    armoredLFReconstructionEqualsStored: true,
    armoredCRLFOriginalBytes: armoredCRLFOriginal.length,
    clearSignedBodyCRLFBytes: clearSignedBodyCRLF.length,
    clientlogBytes: clientlog.length
  },
  pinnedTCPSource: {
    commit: "27309e66746e21542f2b908d7f60b906915fe7c6",
    path: "messages/2013/tcp-server.asc",
    bytes: tcpSource.length,
    sha256: tcpSha256
  },
  results,
  matches
}, null, 2) + "\n");
