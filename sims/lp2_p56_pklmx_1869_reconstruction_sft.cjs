"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {Buffer} */
function readGitAscii(relative) {
  const text = fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
  return Buffer.from(text, "ascii");
}

const standby = readGitAscii("resources/historical/pklmx-2013/standby.txt.asc");
const okinawa = readGitAscii("resources/historical/pklmx-2013/okinawa-japan.txt.asc");
const prefix = Buffer.from("<html>\n<head><title>3301</title></head>\n<body>\n<pre>", "ascii");
const preClose = Buffer.from("</pre>", "ascii");

assert.equal(standby.length, 909);
assert.equal(okinawa.length, 902);
assert.equal(prefix.length, 52);
assert.equal(preClose.length, 6);

// The archived HTTP response says Content-Length: 1869 and contains the
// standby block followed by the Okinawa block. The preserved standalone HTML
// wrapper is prefix + signed block + "</pre>\n</body>\n</html>".
// 1869 - 909 - 902 = 58 = prefix(52) + "</pre>"(6).
// Only the placement of the single closing PRE marker remains ambiguous.
const candidates = {
  inPreAppend: Buffer.concat([prefix, standby, okinawa, preClose]),
  closeBeforeCoordinate: Buffer.concat([prefix, standby, preClose, okinawa]),
};
for (const value of Object.values(candidates)) assert.equal(value.length, 1869);

const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const algorithms = ["sha512", "sha3-512", "blake2b512"];

const rows = [];
for (const [name, value] of Object.entries(candidates)) {
  for (const algorithm of algorithms) {
    const digest = crypto.createHash(algorithm).update(value).digest("hex");
    rows.push({candidate: name, algorithm, digest, matchesTarget: digest === target});
  }
}

// This assertion turns a successful read-only CI conclusion into a decisive
// negative result even when log retrieval is temporarily rate-limited.
assert.equal(rows.some((row) => row.matchesTarget), false);

console.log(JSON.stringify({
  status: "PASS",
  construction: {
    prefixBytes: prefix.length,
    standbyBytes: standby.length,
    okinawaBytes: okinawa.length,
    terminatorBytes: preClose.length,
    totalBytes: 1869,
  },
  target,
  rows,
  conclusion: "Neither of the two exact-length source-derived bodies matches the p56 target under the three previously tested 512-bit digest families.",
}, null, 2));
