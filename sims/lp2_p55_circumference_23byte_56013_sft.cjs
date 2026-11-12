#!/usr/bin/env node
"use strict";

/**
 * Source-constrained 23-byte LP2 continuation test.
 *
 * Human solve-path hypothesis:
 *   1. p57: "Shed our own circumferences. Find the divinity within."
 *      Remove the first and last rune of each complete p55 word.
 *   2. The canonical p55 word parser yields 16 complete words and 43
 *      interior runes. The only red 23-dot punctuation glyph in LP2 is
 *      p57's terminal mark, selecting the central 23 of those 43 runes
 *      (ten discarded from each side).
 *   3. p15's original red heading gives the source-fixed BASE29 Euclidean
 *      quotient 8,952,964 and remainder 560, selecting DATA/560.13 and
 *      its exact byte offset.
 *   4. The historical 2013 Cicada operation is bytewise XOR. Its known
 *      offset-12821 onion-address result is retained as a positive control.
 *
 * This is one frozen test: no offset scan, phase fit, reversal, or KDF.
 * Try only GP rune-index bytes and GP prime-weight bytes as the 23-byte
 * ciphertext representations. A valid v2 onion address is a possible
 * result, not an assumption.
 *
 * Node 22:
 *   node sims/lp2_p55_circumference_23byte_56013_sft.cjs <full DATA_560.13 path>
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const FULL_LENGTH = 118818811;
const FULL_SHA256 = "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f";

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"
));

// p15's original nine-rune red heading -> BASE29 quotient/remainder.
const p15 = corpus.pages.find((page) => page.page === 15);
assert.ok(p15, "Missing canonical LP2 p15");
const heading = p15.indices.slice(0, 9);
assert.deepEqual(heading, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const titleNumber = heading.reduce((v, x) => v * 29n + BigInt(x), 0n);
const quotient = titleNumber / 3301n;
const remainder = titleNumber % 3301n;
assert.equal(titleNumber, 29553734724n);
assert.equal(quotient, 8952964n);
assert.equal(remainder, 560n);
const offset = Number(quotient);

// The unique 23-dot red terminal punctuation glyph is on p57.
assert.equal(annotations.counts.red23, 1, "23-dot red mark is no longer unique");
const p57 = annotations.pages.find((page) => page.page === 57);
assert.ok(p57, "Missing p57 ink annotations");
assert.deepEqual(
  p57.large_punctuation.filter((mark) => mark[1] === 23),
  [[95, 23, "red"]]
);

// "Shed circumferences": strip the first/last rune from every complete
// physical p55 word. The parser's page 54 is physical p55 (p50 has no runes).
const parsed = parseSharedCorpus();
const completeP55Words = parsed.byContainedPage[54];
assert.equal(completeP55Words.length, 16, "Unexpected number of complete p55 words");
const interior = completeP55Words.flatMap((word) => [...word.runes].slice(1, -1));
assert.equal(interior.length, 43, "Expected 43 p55 interior runes");

// "Find the divinity within": the unique p57 23-dot mark selects the
// central 23 symbols of the 43-symbol interior stream.
const ciphertext = interior.slice(10, 33);
assert.equal(ciphertext.length, 23);
const central23 = ciphertext.map((rune) => corpus.runes.indexOf(rune));
assert.ok(central23.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
// A second, *distinct* source-selected 23-rune reading uses the parable's
// repeated circumference removal twice on every one of p55's 16 complete
// words, rather than fitting a centered 23-character slice of first interiors.
const twicePeeled = completeP55Words.flatMap((word) =>
  [...word.runes].slice(2, -2));
assert.equal(twicePeeled.length, 23);
const nested23 = twicePeeled.map(rune => corpus.runes.indexOf(rune));
assert.deepEqual(nested23, [
  6, 23, 24, 17, 0, 14, 10, 19, 1, 5, 13, 8,
  21, 23, 27, 10, 6, 14, 12, 2, 2, 10, 19
]);
const nestedIndexBytes = Buffer.from(nested23);
const nestedPrimeBytes = Buffer.from(nested23.map(i => corpus.prime[i]));

const primeBytes = Buffer.from(central23.map((i) => corpus.prime[i]));
const indexBytes = Buffer.from(central23);

// Read and authenticate the original historical DATA/560.13 member.
const filePath = process.argv[2];
assert.ok(filePath, "Provide the authentic full DATA/560.13 file");
const pad = fs.readFileSync(filePath);
assert.equal(pad.length, FULL_LENGTH, "Unexpected historical DATA/560.13 length");
const sha256 = crypto.createHash("sha256").update(pad).digest("hex");
assert.equal(sha256, FULL_SHA256, "Historical DATA/560.13 SHA-256 mismatch");

// Positive control: independently documented 2013 bytewise XOR at offset 12821.
const phoneCipher = Buffer.from(
  "28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex"
);
const phonePlain = Buffer.from(phoneCipher.map((b, i) => b ^ pad[12821 + i]));
assert.equal(phonePlain.toString("ascii"), "gbyh7znm6c7ezsmr.onion\n",
  "Historical offset-12821 XOR positive control failed");

// The p15 source-fixed offset, not a fitted offset or a search result.
const padSlice = pad.subarray(offset, offset + 23);
assert.equal(padSlice.length, 23, "Selected DATA/560.13 slice is incomplete");

const GP = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
function xorReport(label, encoded) {
  const out = Buffer.from(encoded.map((b, i) => b ^ padSlice[i]));
  const ascii = [...out].map((b) =>
    (b >= 0x20 && b <= 0x7e) || b === 0x0a ? String.fromCharCode(b) : "."
  ).join("");
  return {
    encoding: label,
    xorHex: out.toString("hex"),
    ascii,
    printableFraction: Number((
      [...out].filter((b) => (b >= 0x20 && b <= 0x7e) || b === 0x0a).length / 23
    ).toFixed(4)),
    v2OnionAddress: /^[a-z2-7]{16}\.onion\n$/.test(out.toString("ascii")),
    modulo29Diagnostic: [...out].map((b) => GP[b % 29]).join(" ")
  };
}

console.log(JSON.stringify({
  test: "p55 43 interiors -> central 23 -> DATA/560.13 bytewise XOR",
  p15HeadingBase29: titleNumber.toString(),
  p15QuotientOffset: offset,
  p15Remainder: Number(remainder),
  p57UniqueRed23Marker: p57.large_punctuation.filter((mark) => mark[1] === 23),
  p55CompleteWordCount: completeP55Words.length,
  p55InteriorCount: interior.length,
  central23Indices: central23,
  central23GP: central23.map((i) => GP[i]).join(" "),
  twicePeeled23Indices: nested23,
  twicePeeled23GP: nested23.map((i) => GP[i]).join(" "),
  padLength: pad.length,
  padSha256: sha256,
  historicalPositiveControl: phonePlain.toString("ascii"),
  padSliceHex: padSlice.toString("hex"),
  outputs: [
    xorReport("GP rune indices; first-peel central23", [...indexBytes]),
    xorReport("GP prime weights; first-peel central23", [...primeBytes]),
    xorReport("GP rune indices; two literal peels", [...nestedIndexBytes]),
    xorReport("GP prime weights; two literal peels", [...nestedPrimeBytes])
  ]
}, null, 2));
