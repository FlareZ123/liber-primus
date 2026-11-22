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

// Exact limited arithmetic inventory: among unordered three-digit
// prime-reversal pairs, only the historical cookies sum to a multiple of 29.
// This is a *retrospective* structural discriminator, not an intent p-value.
const emirpPairs = [];
for (let n = 100; n <= 999; n++) {
  const reversed = Number([...String(n)].reverse().join(""));
  if (n < reversed && prime(n) && prime(reversed))
    emirpPairs.push([n, reversed]);
}
assert.equal(emirpPairs.length, 14);
const base29Sums = emirpPairs
  .filter(([n, rev]) => (n + rev) % 29 === 0)
  .map(([n, rev]) => [n, rev, (n + rev) / 29]);
assert.deepEqual(base29Sums, [[167, 761, 32]]);

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
// An independent original LP2 table gate is source-aligned by the *actual*
// 32 rows x 8 columns: each historical cookie contains one byte per row.
// Its keying premise remains conjectural, so test only the two obvious row
// layouts (alternating columns or two half-rows), both cookie orders, and
// their XOR-combined row key. All operations are fully reversible XORs.
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8")).bytes;
assert.equal(grid.length, 256);
const firstKey = Buffer.from(cookies["167"], "hex");
const secondKey = Buffer.from(cookies["761"], "hex");
assert.equal(firstKey.length, 32);
assert.equal(secondKey.length, 32);
assert.equal(167 + 761, 32 * 29);
const layouts = [
  ["alternating-167-even", (r, c) => c % 2 === 0 ? firstKey[r] : secondKey[r]],
  ["alternating-761-even", (r, c) => c % 2 === 0 ? secondKey[r] : firstKey[r]],
  ["half-167-first", (r, c) => c < 4 ? firstKey[r] : secondKey[r]],
  ["half-761-first", (r, c) => c < 4 ? secondKey[r] : firstKey[r]],
  ["combined-xor", (r) => firstKey[r] ^ secondKey[r]],
];
const tableResults = layouts.map(([layout, select]) => {
  const xor = grid.map((original, i) =>
    original ^ select(Math.floor(i / 8), i % 8));
  const roundTrip = xor.map((decoded, i) =>
    decoded ^ select(Math.floor(i / 8), i % 8));
  assert.deepEqual(roundTrip, grid, "256/256 original-byte recovery");
  const printable = xor.filter((v) => v >= 32 && v <= 126).length;
  const longestASCII = Buffer.from(xor).toString("latin1")
    .match(/[A-Za-z]{5,}/gu) || [];
  return {layout, printable, asciiWordsOfFiveOrMore: longestASCII};
});
assert.deepEqual(tableResults.map((x) => x.printable),
  [90, 104, 84, 110, 89]);
assert.ok(tableResults.every((x) => x.asciiWordsOfFiveOrMore.length === 0));

const output = {
  source: "2013 third-onion cookie values 167 and 761, each 32 bytes",
  sourceSelectedOperation: "2013 NUMBER decimal prime reversal",
  cookieNamesAreReciprocalPrimes: true,
  threeDigitEmirpPairs: emirpPairs.length,
  uniqueBase29DivisibleEmirpSum: base29Sums,
  printed2014TargetHex: witness.target_hex,
  models: tested,
  matches: tested.filter((x) => x.matches).length,
  byteGridSourceAlignedXor: tableResults,
  decision: "No direct identity, SHA512, SHA3-512 or HMAC-SHA512 match. This says nothing about untested KDFs, missing session data, the meaning of the cookie values, or unknown LP2 plaintext.",
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
