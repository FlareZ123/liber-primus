#!/usr/bin/env node
"use strict";

// Frozen, clue-selected test; deliberately no offset/phase/KDF search.
//
// Human path hypothesis:
//   * LP2 p15's 4x4 grid is read from its red central 3299, spiralling
//     outward. Its 13th Fibonacci-prime term is |3301 - prime(234)|
//     = |3301 - 1481| = 1820.
//   * LP2 p55 carries a 13-dot red terminal marker.
//   * LP2 p57's parable says "LIKE THE INSTAR TUNNELING TO THE SURFACE",
//     plausibly selecting the center-outward spiral / Cicada instar context.
//   * p15's heading independently selects the historical DATA/560.13
//     resource; the 2013 puzzle documents bytewise XOR against that file.
//
// Test exactly offset 1820 against the 76 p55 runes, using only the two
// obvious Gematria encodings: rune index and rune prime weight. The historical
// offset-12821 onion XOR is a positive control. This is a hypothesis test,
// not an assertion that the 13-dot/instar selector is correct.

const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const padPath = process.argv[2] || "resources/derived/cicada2013-56013-reconstructed.bin";
const pad = fs.readFileSync(padPath);
const padSha256 = crypto.createHash("sha256").update(pad).digest("hex");

const FULL_LENGTH = 118818811;
const FULL_SHA256 = "db79072c9a06a7f86b1b35cf12cddf6d8a10a4a4f8c24f6d9e70c3e9e3a8f9b3";
const PREFIX_LENGTH = 15330;
assert.ok(pad.length === FULL_LENGTH || pad.length === PREFIX_LENGTH,
  `Unexpected DATA/560.13 length: ${pad.length}`);
if (pad.length === FULL_LENGTH) {
  assert.equal(padSha256, FULL_SHA256, "Full DATA/560.13 SHA-256 mismatch");
}

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const page55 = corpus.pages.find(p => p.page === 55);
assert.ok(page55, "Missing canonical LP2 p55 page");
const runes = page55.indices;
assert.equal(runes.length, 76, "Expected 76 original p55 runes");
assert.equal(corpus.prime.length, 29, "Expected 29 Gematria prime weights");

function nthPrime(n) {
  const primes = [];
  for (let x = 2; primes.length < n; x++) {
    let isPrime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(x);
  }
  return primes[n - 1];
}
const fibDistinct = [0, 1];
let fa = 0, fb = 1;
while (fibDistinct.length < 13) {
  [fa, fb] = [fb, fa + fb];
  if (fb !== fibDistinct[fibDistinct.length - 1]) fibDistinct.push(fb);
}
assert.equal(fibDistinct[12], 233, "13th distinct Fibonacci term changed");
assert.equal(nthPrime(234), 1481, "prime(234) changed");
const selectedOffset = Math.abs(3301 - nthPrime(fibDistinct[12] + 1));
assert.equal(selectedOffset, 1820, "p15 13th-term offset changed");

// Positive control from the independently documented 2013 XOR operation.
const phoneCipher = Buffer.from(
  "28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex"
);
const phonePlain = Buffer.from(phoneCipher.map((b, i) => b ^ pad[12821 + i]));
assert.equal(phonePlain.toString("ascii"), "gbyh7znm6c7ezsmr.onion\n",
  "Historical offset-12821 XOR positive control failed");

const offset = selectedOffset;
assert.ok(offset + runes.length <= pad.length, "Selected offset is outside available DATA/560.13 bytes");
const slice = pad.subarray(offset, offset + runes.length);
const runeIndexBytes = Buffer.from(runes);
const runePrimeBytes = Buffer.from(runes.map(i => corpus.prime[i]));

const translit = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
function describe(name, encoded) {
  const x = Buffer.from(encoded.map((b, i) => b ^ slice[i]));
  const ascii = [...x].map(b => (b >= 0x20 && b <= 0x7e) || b === 0x0a ? String.fromCharCode(b) : ".").join("");
  const printable = [...x].filter(b => (b >= 0x20 && b <= 0x7e) || b === 0x0a).length / x.length;
  return {
    encoding: name,
    printableFraction: Number(printable.toFixed(4)),
    xorHex: x.toString("hex"),
    xorAscii: ascii,
    xorModulo29: [...x].map(b => translit[b % 29]).join(" ")
  };
}

const report = {
  test: "LP2 p55 / p15 13th Fibonacci-prime term / DATA/560.13 XOR",
  padPath,
  padLength: pad.length,
  padSha256,
  positiveControl: phonePlain.toString("ascii"),
  selectedOffset: offset,
  p55RuneCount: runes.length,
  padSliceHex: slice.toString("hex"),
  outputs: [
    describe("GP rune indices", [...runeIndexBytes]),
    describe("GP prime weights", [...runePrimeBytes])
  ]
};
console.log(JSON.stringify(report, null, 2));
