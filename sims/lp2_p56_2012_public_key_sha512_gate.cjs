#!/usr/bin/env node
"use strict";

// Direct, source-bounded p56 preimage check against Cicada's preserved
// 2012 public key. Only exact ASCII armor and decoded OpenPGP keyring
// bytes are tested; no guessed wrappers or normalization variants.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const keyPath = path.join(root, "resources/historical/cicada-3301-2012-public-key.asc");
const raw = fs.readFileSync(keyPath);
const armor = raw.toString("ascii");
const base64Lines = armor.split(/\r?\n/)
  .filter(line => line && !line.startsWith("-----") && !line.startsWith("=") && !line.includes(":"));
const decoded = Buffer.from(base64Lines.join(""), "base64");
const canonicalLf = Buffer.from(armor.replace(/\r\n/g, "\n"), "ascii");
const gitBlobSha1 = crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from(`blob ${canonicalLf.length}\0`), canonicalLf]))
  .digest("hex");

const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const sha512 = bytes => crypto.createHash("sha512").update(bytes).digest("hex");
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

if (sha512(Buffer.from("abc", "ascii")) !==
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f") {
  throw new Error("SHA-512 provider failed the standard abc vector");
}
if (gitBlobSha1 !== "d44aec389e2f346c6b9d149d4c61e890f62979c9") {
  throw new Error(`Canonical LF bytes do not match the expected Git blob: ${gitBlobSha1}`);
}
if (!armor.startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----") ||
    !armor.includes("-----END PGP PUBLIC KEY BLOCK-----")) {
  throw new Error("Input is not the expected armored public-key block");
}

const result = {
  source: "resources/historical/cicada-3301-2012-public-key.asc",
  workingTreeArmorBytes: raw.length,
  canonicalLfArmorBytes: canonicalLf.length,
  decodedOpenPgpBytes: decoded.length,
  gitBlobSha1,
  workingTreeArmorSha512: sha512(raw),
  canonicalLfArmorSha256: sha256(canonicalLf),
  canonicalLfArmorSha512: sha512(canonicalLf),
  decodedOpenPgpSha256: sha256(decoded),
  decodedOpenPgpSha512: sha512(decoded),
  targetSha512: target,
  canonicalLfArmorMatch: sha512(canonicalLf) === target,
  decodedOpenPgpMatch: sha512(decoded) === target
};
console.log(JSON.stringify(result, null, 2));
