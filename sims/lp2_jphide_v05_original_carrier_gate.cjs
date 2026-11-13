"use strict";

/**
 * Frozen historical JPHide/JPSeek v0.5 carrier probe.
 *
 * Reads original LP2 JPEG bytes only, a small source-anchored carrier subset,
 * and period-recognizable passphrases. The independent upstream decoder is
 * checked against its own byte-exact JPHide v0.5 mode0 fixture before any LP2
 * file is examined. A verified 72-bit header is required; apparent random
 * output from an unverified header does not qualify.
 *
 * Invocation (Windows Node.js 22):
 *    set STEGOSTUDIO_DIR=C:\path\to\stegostudio
 *    node --expose-gc sims/lp2_jphide_v05_original_carrier_gate.cjs
 *
 * Dependency: rickschaves/stegostudio, commit
 * 201689b5755c0f1267223cd881429e679230b835 (GPL-3.0).
 * This file imports the dependency at runtime; it does not vendor its source.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const upstream = process.env.STEGOSTUDIO_DIR;
assert(upstream, "Set STEGOSTUDIO_DIR to the pinned third-party checkout");
const up = file => fs.readFileSync(path.join(upstream, file));
const src = up("src/jpeg_dct.js").toString("utf8") +
  "\n" + up("src/decoder.js").toString("utf8") +
  "\nreturn {decodeJpegCoefficients,jphideDecodeV05};";
const api = new Function(src)();
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

// Independent genuine JPHide/JPSeek v0.5 mode0 JPEG positive control.
const manifest = JSON.parse(up("test/fixtures/third-party/jphide-v05-f10/manifest.json"));
const control = manifest.cases.find(c => c.mode === 0);
assert(control, "historical v0.5 positive fixture missing");
const sample = up("test/fixtures/third-party/jphide-v05-f10/" + control.image);
assert.equal(sha(sample), control.image_sha256, "positive JPEG changed");
const witness = api.jphideDecodeV05(
  new Uint8Array(sample), control.password,
  api.decodeJpegCoefficients(new Uint8Array(sample))
);
assert(witness && witness.verified && witness.mode === 0);
assert.equal(witness.data.length, control.length);
assert.equal(sha(witness.data), control.payload_sha256,
  "fixture recovery is not byte exact");
assert.equal(api.jphideDecodeV05(
  new Uint8Array(sample), "incorrect",
  api.decodeJpegCoefficients(new Uint8Array(sample))
), null, "incorrect fixture password should be rejected");
console.log("Verified historical mode0 positive control:",control.length,
  "byte exact, wrong password rejected");

// All passwords are independent, source-visible text or prior signed markers.
// This is a format discrimination test; the source does not instruct JPHide.
const passwords = [
  "3301",
  "7A35090F",
  "FOLD",
  "epiphany",
  "THE PRIMES ARE SACRED",
  "THE TOTIENT FUNCTION IS SACRED",
  "Liber Primus is the way",
  "LET THE TEXT GUIDE YOU",
  "SOME WISDOM"
];

// Source archive holds original LP1 scans 00–16 and LP2 scans 17–74.
// All archived JPEGs are frozen before testing any output. A runeless page
// and noncolour carriers remain in the census; the upstream decoder safely
// rejects incompatible JPEG coefficient structures.
const archiveIndexes = Array.from({length:75},(_,i)=>i);
const findings = [];
for (const archiveIndex of archiveIndexes) {
  const page = archiveIndex >= 17 ? archiveIndex - 17 : null;
  const archive = String(archiveIndex).padStart(2,"0") + ".jpg";
  const file = path.join(root,"resources","liber-primus",archive);
  const bytes = new Uint8Array(fs.readFileSync(file));
  const decoded = api.decodeJpegCoefficients(bytes);
  let tried = 0;
  for (const password of passwords) {
    const result = api.jphideDecodeV05(bytes,password,decoded);
    tried++;
    if (result && result.verified) {
      const hit = {
        page, archive, password, mode:result.mode,
        length:result.length, unsupported:result.unsupported,
        sha256:result.data ? sha(result.data):null,
        mime:result.mime||null, text:result.text?.slice(0,500)||null
      };
      findings.push(hit);
      console.log("VERIFIED_JPHIDE_HEADER",JSON.stringify(hit));
    }
  }
  console.log("LP1/LP2 JPHide v0.5 page",page,"archive",archive,
    "bytes",bytes.byteLength,"passwords",tried,"verified",
    findings.filter(x=>x.page===page).length);
  if (global.gc) global.gc();
}
console.log(JSON.stringify({
  status:"frozen original-JPEG JPHide-v0.5 header gate",
  fixture:"authentic v0.5 mode0 11067-byte GIF recovered byte-exact",
  archiveIndexes, passwordCount:passwords.length,
  verifiedHeaders:findings.length, findings
},null,2));
