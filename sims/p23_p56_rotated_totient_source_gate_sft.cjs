#!/usr/bin/env node
"use strict";

/**
 * Original-image-selected p23->p56 rotated-stencil transfer SFT.
 *
 * In original 40.jpg (LP2 p23) and 73.jpg (solved p56), the five black-dot
 * figures are the SAME source stencil at 180-degree orientation difference.
 * The image registration is independently established in
 * im-results/black-dot-template-reflections.md. The dots occur before the
 * p23 chapter and after the p56 page, motivating one fixed read-backwards
 * test, not an arbitrary phase/key sweep.
 *
 * Frozen candidate: reverse all 1021 rune indices of physical pp23-26
 * (the original red-heading/red13 chapter), then subtract the consecutive
 * Euler totients of primes 2, 3, 5, ... modulo 29. No F clock skips are
 * invented. Controls: raw chapter, reverse-only, forward-clock phi, reversed
 * prime rather than phi, page-23-only reversed phi, and authentic solved p56.
 *
 * Usage: node sims/p23_p56_rotated_totient_source_gate_sft.cjs
 * No files are written.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const alph = corpus.translit;
const root = path.join(__dirname, "..");
const quadFile = path.join(root, "resources/control/duko_round27_english_quadgrams.txt");
const quadData = fs.readFileSync(quadFile, "utf8");
const quads = new Map();
let denominator = 0;
for (const line of quadData.trim().split(/\r?\n/)) {
  const [gram, value] = line.trim().split(/\s+/);
  const count = Number(value);
  if (gram.length !== 4 || !Number.isFinite(count)) continue;
  quads.set(gram, count);
  denominator += count;
}

const page = n => corpus.pages.find(p => p.page === n).indices;
const chapter = [23, 24, 25, 26].flatMap(page);
assert.equal(chapter.length, 1021);
assert.equal(page(23).length, 213);
assert.equal(page(56).length, 85);

/** @param {number} n */
function firstPrimes(n) {
  const primes = [];
  for (let x = 2; primes.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) primes.push(x);
  }
  return primes;
}
const primes = firstPrimes(chapter.length);

/**
 * @param {number[]} source
 * @param {"phi"|"prime"} key
 * @param {1|-1} sign
 * @param {number|null} skip
 */
function transform(source, key = "phi", sign = -1, skip = null) {
  let clock = 0;
  return source.map((rune, position) => {
    if (position === skip) return rune;
    const shift = primes[clock++] - Number(key === "phi");
    return ((rune + sign * shift) % 29 + 29) % 29;
  });
}

/** @param {number[]} indices */
function score(indices) {
  const text = indices.map(i => alph[i]).join("").replace(/[^A-Z]/g, "");
  let logSum = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    logSum += Math.log10((quads.get(text.slice(i, i + 4)) || 0.01) / denominator);
  }
  const counts = Array(29).fill(0);
  indices.forEach(i => counts[i]++);
  const matches = counts.reduce((n, count) => n + count * (count - 1), 0);
  return {
    runes: indices.length,
    quadgramMean: logSum / (text.length - 3),
    ioc: matches / (indices.length * (indices.length - 1)),
    prefix: text.slice(0, 90)
  };
}

/** @param {string} text */
function encodeGp(text) {
  const tokens = alph.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(" ")) for (let i = 0; i < word.length;) {
    const selected = tokens.find(item => word.startsWith(item.token, i));
    assert.ok(selected, "missing GP rune for " + word.slice(i));
    out.push(selected.index);
    i += selected.token.length;
  }
  return out;
}

const knownPlain = encodeGp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.deepEqual(transform(page(56), "phi", -1, 56), knownPlain, "authentic solved p56");
assert.deepEqual(transform(knownPlain, "phi", 1, 56), page(56), "p56 forward replay");

const reversed = chapter.slice().reverse();
const candidate = transform(reversed);
assert.deepEqual(transform(candidate, "phi", 1).reverse(), chapter, "candidate exact re-encryption");
const scores = {
  raw: score(chapter),
  reversedOnly: score(reversed),
  directPrimeTotient: score(transform(chapter)),
  reversePrimeTotient: score(candidate),
  reversePrimeNotTotient: score(transform(reversed, "prime")),
  page23ReverseTotient: score(transform(page(23).slice().reverse())),
  authenticSolvedP56: score(knownPlain)
};
for (const [name, value] of Object.entries({
  raw: -7.336008, reversedOnly: -7.383280,
  directPrimeTotient: -7.438830, reversePrimeTotient: -7.438285,
  reversePrimeNotTotient: -7.513567, page23ReverseTotient: -7.496804,
  authenticSolvedP56: -4.461649
})) assert.ok(Math.abs(scores[name].quadgramMean - value) < 0.0000011, name + " score drift");
assert.ok(scores.reversePrimeTotient.ioc < 0.04);
assert.ok(scores.authenticSolvedP56.ioc > 0.06);

console.log(JSON.stringify({
  source: "40.jpg p23 and 73.jpg solved p56 exact half-turn black-dot stencil",
  originalInput: "physical p23-26, 1021 GP29 runes, original chapter boundary",
  fixedOperation: "reverse whole chapter; P[i] = C_reversed[i] - (prime[i]-1) mod29; no F skipping",
  scoreCalibration: "same frozen duko_round27_english_quadgrams source for all outputs",
  scores, exactForwardReplay: true,
  status: "NEGATIVE: no authentic p23-26 plaintext or key recovered under this motivated direct transfer"
}, null, 2));
