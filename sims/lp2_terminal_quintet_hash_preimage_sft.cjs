"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"),
  "utf8"
));
const mod = (x) => ((x % 29) + 29) % 29;
const page55 = corpus.pages.find((p) => p.page === 55);
assert.ok(page55);
assert.equal(page55.indices.length, 76);

const body = page55.indices.slice(1);
assert.equal(body.length, 75);

const packetBytes = [];
const overflowFlags = [];
for (let i = 0; i < 15; i++) {
  const quintet = body.slice(i * 5, i * 5 + 5);
  assert.equal(quintet.length, 5);
  let value = 0;
  for (const rune of quintet) value = value * 29 + rune;
  const flag = Math.floor(value / 16777216);
  const low24 = value % 16777216;
  overflowFlags.push(flag);
  packetBytes.push((low24 >>> 16) & 255, (low24 >>> 8) & 255, low24 & 255);
}

const packet45 = Buffer.from(packetBytes);
const interior43 = packet45.subarray(1, 44);
const packetHex = packet45.toString("hex");
const interiorHex = interior43.toString("hex");
assert.equal(overflowFlags.join(""), "100100000000000");
assert.equal(packetHex, "15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d");
assert.equal(interiorHex, "023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc7310637750");

const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(target.length, 128);

const hex43Lower = interior43.toString("hex");
const hex43Upper = hex43Lower.toUpperCase();
const hex45Lower = packet45.toString("hex");
const representations = [
  ["43-byte raw", interior43],
  ["45-byte framed raw", packet45],
  ["43-byte lowercase hex ASCII", Buffer.from(hex43Lower, "ascii")],
  ["43-byte uppercase hex ASCII", Buffer.from(hex43Upper, "ascii")],
  ["43-byte lowercase hex ASCII plus LF", Buffer.from(hex43Lower + "\n", "ascii")],
  ["43-byte uppercase hex ASCII plus LF", Buffer.from(hex43Upper + "\n", "ascii")],
  ["45-byte lowercase hex ASCII", Buffer.from(hex45Lower, "ascii")],
  ["45-byte lowercase hex ASCII plus LF", Buffer.from(hex45Lower + "\n", "ascii")]
];

function whirlpool(buffer) {
  if (crypto.getHashes().includes("whirlpool")) {
    return crypto.createHash("whirlpool").update(buffer).digest("hex");
  }
  const result = spawnSync(
    "openssl",
    ["dgst", "-provider", "default", "-provider", "legacy", "-whirlpool"],
    { input: buffer, encoding: "utf8" }
  );
  assert.equal(
    result.status,
    0,
    "Whirlpool requires OpenSSL with the legacy provider: " + String(result.stderr || "")
  );
  const match = String(result.stdout).match(/([0-9a-f]{128})\s*$/i);
  assert.ok(match, "could not parse OpenSSL Whirlpool digest");
  return match[1].toLowerCase();
}

const algorithms = [
  ["SHA-512", (buffer) => crypto.createHash("sha512").update(buffer).digest("hex")],
  ["SHA3-512", (buffer) => crypto.createHash("sha3-512").update(buffer).digest("hex")],
  ["BLAKE2b-512", (buffer) => crypto.createHash("blake2b512").update(buffer).digest("hex")],
  ["Whirlpool", whirlpool]
];

const tested = [];
const matches = [];
for (const [representation, bytes] of representations) {
  for (const [algorithm, digest] of algorithms) {
    const actual = digest(bytes).toLowerCase();
    tested.push({ representation, algorithm, digest: actual });
    if (actual === target) matches.push({ representation, algorithm });
  }
}

assert.equal(tested.length, 32);
assert.equal(matches.length, 0, "a direct packet representation unexpectedly matched the p56 digest");

console.log(JSON.stringify({
  p55Runes: page55.indices.length,
  carriedLeadingRuneExcluded: true,
  bodyRunes: body.length,
  quintetCount: 15,
  overflowFlags: overflowFlags.join(""),
  packet45Hex: packetHex,
  interior43Hex: interiorHex,
  p56TargetDigest: target,
  representations: representations.map(([name]) => name),
  algorithms: algorithms.map(([name]) => name),
  testedDigestCount: tested.length,
  matches
}, null, 2));
