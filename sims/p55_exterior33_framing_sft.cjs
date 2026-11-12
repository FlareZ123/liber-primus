"use strict";

/**
 * Original LP2 physical p55 (archive 72.jpg) 33-exterior / 43-interior
 * framing gate, fixed source positions and six fixed source-adjacent SHA-1 serializations.
 *
 * Run: node sims/p55_exterior33_framing_sft.cjs
 * Node.js 22, CommonJS built-ins only.
 * A match would require separate source authentication; a nonmatch excludes
 * only those six precise SHA-1 conventions, not all possible hashes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/lp2-transcription.txt");
const p55Original = corpus.pages.find(p => p.page === 55);
assert.ok(p55Original);

const sections = source.split("%");
assert.equal(sections.length, 57);
const section55 = sections[54]; // runeless LP2 p50 is omitted
// Slash/whitespace are line wraps. Printed '-' and '.' delimit words.
const fragments = section55.replace(/[\\/\r\n\s]/gu, "")
  .split(/[^ᚠ-ᛪ]+/u).filter(Boolean);
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @type {number[][]} */
const words = fragments.map(fragment =>
  [...fragment].map(rune => {
    const index = runeToIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  })
);
assert.deepEqual(words.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.deepEqual(words.flat(), p55Original.indices);
const outside = words.flatMap(w => w.length === 1 ?
  [w[0]] : [w[0], w[w.length-1]]);
const inside = words.flatMap(w => w.slice(1,-1));
assert.equal(outside.length, 33);
assert.equal(inside.length, 43);
assert.equal(p55Original.indices.length, 76);
assert.deepEqual(inside, [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,
  20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
]);
assert.deepEqual(outside, [
  21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,
  17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10
]);

// Explicit diagnostic, NOT a source-selected cipher:
// A 160-bit SHA-1 digest takes 33 base-29 digits at full width.
// The ordinary GP indices could be treated as radix-29 digits, but the
// signed BASE29 3301 -> 3QO example does not command this conversion.
const base29Value = outside.reduce((n,d) => n*29n + BigInt(d), 0n);
assert.ok(base29Value < (1n << 160n));
const allegedSha1 = Buffer.from(base29Value.toString(16).padStart(40,"0"),"hex");
assert.equal(allegedSha1.length, 20);
assert.equal(allegedSha1.toString("hex"),
  "efe89bff1c7eff588ec80605c99a364067960320");

const interiorInteger=inside.reduce((n,d)=>n*29n+BigInt(d),0n);
const interiorBigEndian=Buffer.from(interiorInteger.toString(16).padStart(54,"0"),"hex");
assert.equal(interiorBigEndian.length,27);
assert.equal(interiorBigEndian.toString("hex"),
  "013d669f55a697d6b56275a7974c8245639c8c8e09d48f70e92368");
const candidates = new Map([
  ["2013-BASE29-minimal-27-byte-integer", interiorBigEndian],
  ["original-GP-indices-bytes", Buffer.from(inside)],
  ["original-GP-runes-UTF8", Buffer.from(inside.map(i => corpus.runes[i]).join(""), "utf8")],
  ["source-primary-translit-ASCII", Buffer.from(inside.map(i => corpus.translit[i]).join(""),"ascii")],
  ["2013-GP-prime-weight-bytes", Buffer.from(inside.map(i => corpus.prime[i]))],
  ["LP1-Wisdom-totient-of-prime-bytes", Buffer.from(inside.map(i => corpus.prime[i]-1))]
]);
const hashes = [];
for (const [format, bytes] of candidates) {
  const sha = crypto.createHash("sha1").update(bytes).digest("hex");
  hashes.push({format, inputBytes:bytes.length, sha1:sha,
    matchesExterior: sha === allegedSha1.toString("hex")});
  assert.notEqual(sha, allegedSha1.toString("hex"));
}
assert.equal(hashes.length, 6);
assert.equal(hashes[0].sha1, "eddad4828e992391bb68e4e22a7673071f033420");
assert.equal(hashes[4].sha1, "b00ef822ee6d2441323e32c7e97ec850df4a615d");
assert.equal(hashes[5].sha1, "29da8c88569d8f5a99ca05aba46529d5cc848208");
console.log(JSON.stringify({
  source:"original LP2 p55, 72.jpg",
  pageRuneCount:76, printedFragments:words.length,
  completeP55Words:16, continuedP54EndingRuneCount:1,
  strictlyInteriorRunes:inside.length,
  exteriorRunes:outside.length,
  exteriorAs20byteNumber:allegedSha1.toString("hex"),
  sha1FramingDiagnostics:hashes,
  classification:"no source-selected framing/decoder; six fixed SHA-1 diagnostics rejected",
  status:"PASS"
},null,2));
