#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = process.argv[2];
if (!path) throw new Error("Usage: node sims/lp2_p56_2014_onion6_hexdump_image_hash_gate.cjs <downloaded-file>");
const bytes = fs.readFileSync(path);
const gitBlobSha1 = crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes])).digest("hex");
const sha512 = crypto.createHash("sha512").update(bytes).digest("hex");
const result = {
  source: "krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469:archives/cijhho/2014/Websites/onion 6/onion6.jpg",
  bytes: bytes.length, expectedBytes: 4240957,
  gitBlobSha1, expectedGitBlobSha1: "369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec",
  sha512,
  p56Target: "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4",
  matchesP56Target: sha512 === "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4",
};
console.log(JSON.stringify(result, null, 2));
if (bytes.length !== result.expectedBytes || gitBlobSha1 !== result.expectedGitBlobSha1) process.exitCode = 2;