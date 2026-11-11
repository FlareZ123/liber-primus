"use strict";

/**
 * Historical 2013 reciprocal-prime cookie values versus the original 2014
 * AN END printed 64-byte digest. This is a finite key/target gate, not an
 * LP2 decryption or an asserted connection between the two rounds.
 *
 * The cookie key/value pair is transcribed from the archived pre-2014 source:
 * https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
 *
 * Independently committed literal p56 digest:
 * resources/cicada2014-anend-binary-witness.json
 *
 * No packages needed. Run on Node.js 22.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const witness = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/cicada2014-anend-binary-witness.json"), "utf8"));
const target = Buffer.from(witness.target_hex, "hex");
assert.equal(target.length, 64);

const cookies = Object.freeze({
  "167": "6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6",
  "761": "7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5",
});

/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
for (const [name, value] of Object.entries(cookies)) {
  assert.equal(value.length, 64);
  assert.equal(Buffer.from(value, "hex").length, 32);
  assert.ok(prime(Number(name)), "each source cookie name is prime");
  const reversed = [...name].reverse().join("");
  assert.ok(prime(Number(reversed)), "reversed 2013 NUMBER input is prime");
  assert.ok(Object.hasOwn(cookies, reversed), "source names form reciprocal pair");
}

const tested = [];
for (const [firstName, secondName] of [["167", "761"], ["761", "167"]]) {
  for (const representation of ["raw32", "ascii64"]) {
    const first = representation === "raw32"
      ? Buffer.from(cookies[firstName], "hex")
      : Buffer.from(cookies[firstName], "ascii");
    const second = representation === "raw32"
      ? Buffer.from(cookies[secondName], "hex")
      : Buffer.from(cookies[secondName], "ascii");
    const combined = Buffer.concat([first, second]);
    const proposals = [
      ["identity", combined],
      ["sha512", crypto.createHash("sha512").update(combined).digest()],
      ["sha3-512", crypto.createHash("sha3-512").update(combined).digest()],
      ["hmac-sha512", crypto.createHmac("sha512", first).update(second).digest()],
    ];
    for (const [operation, result] of proposals) {
      const matches = result.equals(target);
      tested.push({order: firstName + "," + secondName,
        representation, operation, resultBytes: result.length, matches});
      assert.equal(matches, false,
        "a digest/key identification requires independent original evidence");
    }
  }
}
assert.equal(tested.length, 16);
const output = {
  source: "2013 third-onion cookie values 167 and 761, each 32 bytes",
  sourceSelectedOperation: "2013 NUMBER decimal prime reversal",
  cookieNamesAreReciprocalPrimes: true,
  printed2014TargetHex: witness.target_hex,
  models: tested,
  matches: tested.filter((x) => x.matches).length,
  decision: "No direct identity, SHA512, SHA3-512 or HMAC-SHA512 match. This says nothing about untested KDFs, missing session data, the meaning of the cookie values, or unknown LP2 plaintext.",
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
