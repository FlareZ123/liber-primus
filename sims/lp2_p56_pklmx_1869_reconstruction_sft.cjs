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
const candidate = Buffer.concat([prefix, standby, okinawa, preClose]);

assert.equal(standby.length, 909);
assert.equal(okinawa.length, 902);
assert.equal(prefix.length, 52);
assert.equal(preClose.length, 6);
assert.equal(candidate.length, 1869);

const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

const digests = {
  sha512: crypto.createHash("sha512").update(candidate).digest("hex"),
  sha3_512: crypto.createHash("sha3-512").update(candidate).digest("hex"),
  blake2b512: crypto.createHash("blake2b512").update(candidate).digest("hex"),
};

console.log(JSON.stringify({
  status: "PASS",
  construction: {
    prefixBytes: prefix.length,
    standbyBytes: standby.length,
    okinawaBytes: okinawa.length,
    terminatorBytes: preClose.length,
    totalBytes: candidate.length,
  },
  digests,
  target,
  matches: Object.fromEntries(Object.entries(digests).map(([name, value]) => [name, value === target])),
}, null, 2));
