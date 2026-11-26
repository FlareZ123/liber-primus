#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const assert = require("node:assert/strict");

const imagePath = process.argv[2];
const outputPath = process.argv[3];
if (!imagePath) throw new Error("Usage: node sims/lp2_p56_2014_onion6_hexdump_image_hash_gate.cjs <downloaded-file> [output.json]");

const bytes = fs.readFileSync(imagePath);
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const gitBlobSha1 = crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes])).digest("hex");
assert.equal(bytes.length, 4240957, "Unexpected source byte length");
assert.equal(gitBlobSha1, "369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec", "Source Git blob SHA-1 mismatch");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const local10 = fs.readFileSync(path.join(root, "10.jpg"));
assert.deepEqual(bytes, local10, "Archived Onion6 source differs from canonical LP1 archive member 10.jpg");

const layout = require("./jpeg10_concatenation.cjs").inspect(bytes);
assert.deepEqual(layout.starts, [0, 754662, 1467395, 2170823]);
assert.deepEqual(layout.lengths, [754662, 712733, 703428, 2070134]);

function sha512(b) {
  return crypto.createHash("sha512").update(b).digest("hex");
}
function whirlpool(b) {
  const p = spawnSync("openssl", ["dgst", "-provider", "legacy", "-whirlpool"], { input: b, encoding: "utf8" });
  if (p.error) throw p.error;
  if (p.status !== 0) throw new Error("OpenSSL Whirlpool failed: " + p.stderr);
  const m = p.stdout.match(/([0-9a-f]{128})\\s*$/i);
  if (!m) throw new Error("Could not parse Whirlpool digest: " + p.stdout);
  return m[1].toLowerCase();
}

const segments = layout.starts.map((start, i) => {
  const end = start + layout.lengths[i];
  const content = bytes.subarray(start, end);
  if (i === 0) {
    assert.deepEqual(content.subarray(0, 2), Buffer.from([0xff, 0xd8]));
    assert.deepEqual(content.subarray(-2), Buffer.from([0xff, 0xd9]));
  } else {
    const referenceName = `${10 + i}.jpg`;
    const reference = fs.readFileSync(path.join(root, referenceName));
    assert.deepEqual(content, reference, `Embedded stream does not equal canonical ${referenceName}`);
  }
  return {
    name: i === 0 ? "LP1 image 10 (first JPEG stream)" : `LP1 image ${10 + i} (embedded copy of ${10 + i}.jpg)`,
    offset: start,
    bytes: content.length,
    sha256: crypto.createHash("sha256").update(content).digest("hex"),
    sha512: sha512(content),
    whirlpool: whirlpool(content),
    matchesP56Sha512: sha512(content) === target,
    matchesP56Whirlpool: whirlpool(content) === target
  };
});

const whole = {
  name: "complete 10.jpg / archived Onion6 container",
  offset: 0,
  bytes: bytes.length,
  sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  sha512: sha512(bytes),
  whirlpool: whirlpool(bytes),
  matchesP56Sha512: sha512(bytes) === target,
  matchesP56Whirlpool: whirlpool(bytes) === target
};

const result = {
  source: "krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469:archives/cijhho/2014/Websites/onion 6/onion6.jpg",
  expectedBytes: 4240957,
  gitBlobSha1,
  expectedGitBlobSha1: "369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec",
  canonicalArchive10Sha256: layout.sha256,
  target,
  jpegLayout: { starts: layout.starts, lengths: layout.lengths, exactFourStreams: true },
  candidates: [whole, ...segments]
};
console.log(JSON.stringify(result, null, 2));
if (outputPath) fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
