"use strict";

/**
 * P56 hash-family provenance gate.
 *
 * Census authenticated Cicada clear-signed messages pinned in
 * resources/historical/cicada2012...cicada2017 and report their
 * OpenPGP cleartext Hash: headers. This does not identify the algorithm
 * used by p56's 512-bit page digest; it tests whether an authenticated
 * pre-2017 signature header supplies a SHA-512 precedent.
 *
 * Run:
 *   node sims/lp2_p56_hash_family_provenance_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const historical = path.join(root, "resources", "historical");

const files = fs.readdirSync(historical)
  .filter((name) => /^cicada201[2-7].*\.asc$/i.test(name))
  .sort();

const rows = files.map((name) => {
  const content = fs.readFileSync(path.join(historical, name), "utf8");
  const match = content.match(/^Hash:\s*(.+)$/mi);
  return {
    file: name,
    signed: content.includes("-----BEGIN PGP SIGNED MESSAGE-----"),
    hashHeader: match ? match[1].trim() : null,
    year: Number(name.slice(6, 10))
  };
});

assert.equal(rows.length, 17);
assert.ok(rows.every((row) => row.signed));
assert.ok(rows.every((row) => row.hashHeader));

const pre2017 = rows.filter((row) => row.year <= 2016);
const y2017 = rows.filter((row) => row.year === 2017);

assert.equal(pre2017.length, 16);
assert.ok(pre2017.every((row) => row.hashHeader === "SHA1"));
assert.deepEqual(y2017, [{
  file: "cicada2017-yEiTHhvF.asc",
  signed: true,
  hashHeader: "SHA512",
  year: 2017
}]);

const counts = {};
for (const row of rows) {
  const key = `${row.year}:${row.hashHeader}`;
  counts[key] = (counts[key] || 0) + 1;
}

console.log(JSON.stringify({
  authenticatedClearSignedMessages: rows.length,
  pre2017: {
    count: pre2017.length,
    hashHeaders: [...new Set(pre2017.map((row) => row.hashHeader))]
  },
  year2017: y2017,
  counts,
  rows
}, null, 2));

console.log("PASS: all 16 pinned authenticated 2012-2016 clear-signatures use SHA1; the pinned 2017 message uses SHA512.");
