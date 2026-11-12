"use strict";

/**
 * Single-file test of the original 256 red-event versus 256 numeric-cell
 * common-factor hypothesis in GF(29). No ciphertext symbols are modified.
 * Run from the repository root using Node.js 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const root = "resources/liber-primus/";
const read = (name) => JSON.parse(fs.readFileSync(root + name, "utf8"));
const corpus = read("lp2-corpus.json");
const annotation = read("lp2-ink-annotations.json");
const table = read("base60-grid.json");
const bytes = table.byte_rows.flat();

assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(annotation.counts.red, 225);
assert.equal(annotation.counts.red13 + annotation.counts.black13, 31);

const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} number */
function inverse(number) {
  for (let i = 1; i < 29; i++) if ((number * i) % 29 === 1) return i;
  throw new Error("GF(29): zero has no inverse");
}

/** @param {number[]} polynomial */
function trim(polynomial) {
  let end = polynomial.length;
  while (end && polynomial[end - 1] === 0) end--;
  return polynomial.slice(0, end);
}

/**
 * Ascending-power Euclidean remainder, in GF(29).
 * @param {number[]} numerator
 * @param {number[]} divisor
 */
function remainder(numerator, divisor) {
  let poly = trim(numerator.map(mod));
  const den = trim(divisor.map(mod));
  assert.ok(den.length > 0);
  const invLead = inverse(den[den.length - 1]);
  while (poly.length >= den.length) {
    const offset = poly.length - den.length;
    const factor = mod(poly[poly.length - 1] * invLead);
    for (let i = 0; i < den.length; i++)
      poly[i + offset] = mod(poly[i + offset] - factor * den[i]);
    poly = trim(poly);
  }
  return poly;
}

/**
 * Monic GF(29) polynomial GCD. [] denotes zero.
 * @param {number[]} left
 * @param {number[]} right
 */
function gcd(left, right) {
  let a = trim(left.map(mod));
  let b = trim(right.map(mod));
  while (b.length) [a, b] = [b, remainder(a, b)];
  if (!a.length) return [];
  const factor = inverse(a[a.length - 1]);
  return a.map((v) => mod(v * factor));
}

/** Original page/offset event, with 13-dot markers BEFORE runes at the same offset. */
const events = [];
for (const entry of annotation.pages) {
  for (const span of entry.red_spans || []) {
    const glyphs = Array.from(span.runes);
    assert.equal(glyphs.length, span.length);
    for (let offset = 0; offset < glyphs.length; offset++) {
      const pos = span.start + offset;
      const index = corpus.runes.indexOf(glyphs[offset]);
      assert.ok(index >= 0);
      assert.equal(corpus.pages[entry.page].indices[pos], index);
      events.push({ page: entry.page, pos, kind: 1, index });
    }
  }
  for (const mark of entry.large_punctuation || []) {
    if (mark[1] === 13)
      events.push({ page: entry.page, pos: mark[0], kind: 0, index: 0 });
  }
}
events.sort((a, b) =>
  a.page - b.page || a.pos - b.pos || a.kind - b.kind
);
assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.kind === 1).length, 225);
assert.equal(events.filter((e) => e.kind === 0).length, 31);
assert.deepEqual(
  corpus.pages[39].indices.slice(119, 122),
  [27, 5, 15]
);

// The table's first printed byte is the highest-power coefficient.
const sourcePolynomial = bytes.map(mod).reverse();
assert.equal(trim(sourcePolynomial).length - 1, 254);
const sourceFactors = [
  [5, 1],
  [3, 26, 24],
  [27, 5, 15],
  [24, 16, 14, 1],
  [11, 15, 9, 1, 5, 10, 20, 12, 1, 1],
];
for (const factor of sourceFactors)
  assert.deepEqual(remainder(sourcePolynomial, factor), []);
assert.equal(gcd(sourcePolynomial, sourcePolynomial).length - 1, 254);
assert.deepEqual(gcd(sourcePolynomial, [1]), [1]);

const survivors = [];
for (const direction of ["source", "reversed"]) {
  const order = direction === "source" ? events : [...events].reverse();
  for (const representation of ["rune-index", "rune-prime"]) {
    for (let marker = 0; marker < 29; marker++) {
      const values = order.map((e) =>
        e.kind
          ? (representation === "rune-index" ? e.index : corpus.prime[e.index])
          : marker
      );
      const redPolynomial = values.map(mod).reverse();
      const shared = gcd(sourcePolynomial, redPolynomial);
      if (marker === 0 || marker === 13) assert.deepEqual(shared, [1]);
      if (shared.length > 1)
        survivors.push({ direction, representation, marker, factor: shared });
    }
  }
}

const expected = [
  { direction: "source", representation: "rune-index", marker: 26, factor: [5, 1] },
  { direction: "source", representation: "rune-prime", marker: 18, factor: [5, 1] },
  { direction: "reversed", representation: "rune-index", marker: 11, factor: [5, 1] },
  { direction: "reversed", representation: "rune-prime", marker: 1, factor: [5, 1] },
];
assert.deepEqual(survivors, expected);
console.log("PASS source SHA256, 225 red runes, 31 13-dot marks, 256 cells");
console.log("PASS original table H/G/linear/cubic/nonic factors and positive controls");
console.log("PASS 116 original entire-stream GF(29) GCDs");
console.log("No natural marker 0/13 shares any nonconstant factor.");
console.log("Only four postselected linear X+5 collisions:", JSON.stringify(survivors));
console.log("No choice shares either source-derived quadratic or a higher factor.");
