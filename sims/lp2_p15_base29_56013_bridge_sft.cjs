"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const pad = fs.readFileSync(path.join(ROOT, "resources", "derived", "cicada2013-56013-reconstructed.bin"));

/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((v, digit) => v * 29n + BigInt(digit), 0n);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function printable(values) {
  return values.filter((v) => v >= 32 && v <= 126).length;
}

/** @param {number[]} values @returns {number} */
function letters(values) {
  return values.filter((v) => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length;
}

const p15 = corpus.pages.find((p) => p.page === 15);
const p15Ink = ink.pages.find((p) => p.page === 15);
assert.equal(p15.indices.length, 159);
assert.deepEqual(p15Ink.red_spans.map((s) => [s.start, s.length]), [[0, 9], [9, 11]]);

const upper = p15.indices.slice(0, 9);
const lower = p15.indices.slice(9, 20);
assert.deepEqual(upper, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
assert.deepEqual(lower, [20, 1, 21, 9, 5, 1, 17, 9, 16, 0, 21]);

const upperNumber = base29(upper);
const upperReverse = base29([...upper].reverse());
const lowerNumber = base29(lower);
assert.equal(upperNumber, 29553734724n);
assert.equal(upperNumber % 3301n, 560n);
assert.equal(upperReverse % 3301n, 3298n);
assert.equal(lowerNumber, 8439315242423360n);
assert.equal(lowerNumber % 3301n, 2293n);

// Count the actual red-runic candidates; this does not correct the retrospective
// selection of page 15, radix 29, modulus 3301, or the historical file-name target.
const allRed = ink.pages.flatMap((p) => p.red_spans.map((span) => {
  const indices = corpus.pages.find((q) => q.page === p.page).indices.slice(span.start, span.start + span.length);
  return {
    page: p.page,
    start: span.start,
    length: span.length,
    direct: Number(base29(indices) % 3301n),
    reversed: Number(base29([...indices].reverse()) % 3301n),
  };
}));
assert.equal(allRed.length, 18);
assert.deepEqual(allRed.filter((span) => span.direct === 560 || span.reversed === 560)
  .map((span) => [span.page, span.start, span.length]), [[15, 0, 9]]);

// The local source is a reconstruction of only the first 15,330 bytes of
// 2013 DATA/560.13. Confirm its period-original XOR operation on the known
// third-onion 23-byte positive control at offset 12821.
assert.equal(pad.length, 15330);
const historicalCipher = Buffer.from("28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex");
const onion = Buffer.from(historicalCipher.map((v, i) => v ^ pad[12821 + i])).toString("utf8");
assert.equal(onion, "gbyh7znm6c7ezsmr.onion\n");

// A clearly labeled conditional original-LP2 transfer: joining the two
// different red titles as separate BASE29 numbers would make 560 a putative
// file-name prefix and 2293 a putative byte offset. The source does not say
// to concatenate word-separated runes or to select suffix .13 over .00/.17.
const original = p15.indices.slice(20);
const offset = Number(lowerNumber % 3301n);
const localPad = [...pad.subarray(offset, offset + original.length)];
assert.equal(original.length, 139);
const xorIndex = original.map((v, i) => v ^ localPad[i]);
const xorPrime = original.map((v, i) => corpus.prime[v] ^ localPad[i]);
const modSub = original.map((v, i) => mod29(v - localPad[i]));

// The spiral's exact source-derived prime offsets give another entirely
// preselected 16-byte read, without testing any other phases or byte offsets.
const primeOffsets = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
const spiralPad = primeOffsets.map((v) => pad[v]);
const spiralModSub = original.map((v, i) => mod29(v - spiralPad[i % 16]));

assert.equal(printable(xorIndex), 53);
assert.equal(letters(xorIndex), 25);
assert.equal(printable(xorPrime), 62);
assert.equal(letters(xorPrime), 32);
assert.ok(Math.abs(ioc(modSub) - 0.03513710770514024) < 1e-12);
assert.ok(Math.abs(ioc(spiralModSub) - 0.03430299238869774) < 1e-12);

const report = {
  established_arithmetic: {
    page: 15,
    first_red_indices: upper,
    first_red_base29: upperNumber.toString(),
    first_mod3301: Number(upperNumber % 3301n),
    reversed_first_mod3301: Number(upperReverse % 3301n),
    second_red_base29: lowerNumber.toString(),
    second_mod3301: offset,
    total_red_spans: allRed.length,
    exact_560_spans: allRed.filter((span) => span.direct === 560 || span.reversed === 560),
  },
  conditional_2013_transfer: {
    data_prefix_length: pad.length,
    historical_positive_control: onion.trimEnd(),
    target_p15_body_runes: original.length,
    selected_offset: offset,
    xor_gp_index_ascii_printable: printable(xorIndex),
    xor_gp_index_ascii_letters: letters(xorIndex),
    xor_gp_prime_ascii_printable: printable(xorPrime),
    xor_gp_prime_ascii_letters: letters(xorPrime),
    mod29_subtraction_ioc: ioc(modSub),
    prime_offset_16_key_ioc: ioc(spiralModSub),
    original_ioc: ioc(original),
  },
  decision: "The literal byte-XOR and modulo29 transfers do not recover readable p15 original plaintext. No file suffix, offset rule, cipher or plaintext is authenticated by the modular coincidence.",
};
console.log(JSON.stringify(report, null, 2));
