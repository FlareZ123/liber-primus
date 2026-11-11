#!/usr/bin/env node
"use strict";

// Reproduce the exploratory p0 BASE29 / 2013 DH23 candidate.
// Run from the repository root:
//   node sims/p0_dh23_red_heading_candidate.cjs
//
// This tests a source-motivated key derivation, not a recovered LP2 cipher.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const mod = (n, m) => ((n % m) + m) % m;

function base29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
function modPow(a, e, m) {
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = out * a % m;
    a = a * a % m;
    e >>= 1n;
  }
  return out;
}
function phi(n) {
  let out = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      out -= out / p;
    }
  }
  if (n > 1) out -= out / n;
  return out;
}
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = (indices) => indices.map((i) => corpus.translit[i]).join("-");

assert.equal(corpus.pages.length, 58);
const p0Red = annotations.pages.find((p) => p.page === 0).red_spans
  .find((s) => s.start === 0 && s.length === 13);
assert(p0Red, "expected 13-rune red p0 heading at offset 0");

const heading = corpus.pages[0].indices.slice(p0Red.start, p0Red.start + p0Red.length);
const firstBlackLine = corpus.pages[0].indices.slice(13, 20);
assert.equal(heading.length, 13);
assert.equal(firstBlackLine.length, 7);

const N = base29(heading);
const M = base29(firstBlackLine);
const p = 23n;
const g = 5n;
const exponent = Number(N % (p - 1n));
const serverPublic = modPow(g, BigInt(exponent), p);
const clientPublic = M % p;
assert.notEqual(clientPublic, 0n, "DH public share must be nonzero");
const shared = modPow(clientPublic, BigInt(exponent), p);

assert.equal(N.toString(), "5412445423142629857");
assert.equal(M.toString(), "1420123033");
assert.equal(N % 23n, 0n);
assert.equal(exponent, 7);
assert.equal(heading.at(-1), 5);
assert.equal(clientPublic, 16n);
assert.equal(serverPublic, 17n);
assert.equal(shared, 18n);

// Finite control: search every page-local 13-rune window on unsolved pages.
const selectorHits = [];
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let start = 0; start + 13 <= page.indices.length; start++) {
    const digits = page.indices.slice(start, start + 13);
    const value = base29(digits);
    if (value % 23n === 0n && value % 22n === 7n && digits.at(-1) === 5) {
      selectorHits.push({ page: page.page, start });
    }
  }
}
assert.deepEqual(selectorHits, [{ page: 0, start: 0 }]);

// Use the same canonical printed-word parser as the provisional 2016 map.
const printedSource = read("resources/lp2-transcription.txt").split("%");
assert.equal(printedSource.length, 57);
function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const pages = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(printedSource[page > 50 ? page - 1 : page])
);
assert.equal(pages.reduce((n, page) => n + page.length, 0), 2973);
const p18w7 = pages[18][6];
const p18Indices = [...p18w7].map((r) => runeIndex.get(r));
const p18PrimeWeights = p18Indices.map((i) => corpus.prime[i]);
const p18PrimeSum = p18PrimeWeights.reduce((a, b) => a + b, 0);
assert.equal(translit(p18Indices), "GA- A".replace(" ", "") === "GA-A" ? "never" : "GA- A"); // replaced below
