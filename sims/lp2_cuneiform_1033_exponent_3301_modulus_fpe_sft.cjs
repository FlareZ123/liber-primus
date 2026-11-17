#!/usr/bin/env node
"use strict";

// Test the literal 2013 command-operand role assignment e=BASE29(1033),
// n=DH(3301) as a two-rune, cycle-walked modular-power permutation.
// This is a fixed hypothesis, not an exponent/key search.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(root, "resources/external/2013-tcp-live-test-vectors.json"), "utf8"));
const transcript = vectors.sources.find((source) =>
  source.observed?.base29Request === 1033 && source.observed?.dhModulus === 3301
);
assert.ok(transcript, "preserved 2013 transcript must contain BASE29 1033 and DH 3301");

const exponent = transcript.observed.base29Request;
const modulus = transcript.observed.dhModulus;
const phi = modulus - 1; // 3301 is prime.
const inverseExponent = 1297;
assert.equal(modulus, 3301);
assert.equal(exponent, 1033);
assert.equal(transcript.observed.base29Output, "16I");
assert.equal((exponent * inverseExponent) % phi, 1);

const alphabetSize = 29;
const domain = alphabetSize ** 2;
assert.equal(domain, 841);
assert.ok(domain < modulus);
assert.ok(alphabetSize ** 3 > modulus);

const pages = corpus.pages.filter((page) => page.page >= 33 && page.page <= 39)
  .sort((a, b) => a.page - b.page);
assert.deepEqual(pages.map((page) => page.page), [33, 34, 35, 36, 37, 38, 39]);
const ciphertext = pages.flatMap((page) => page.indices);
assert.equal(ciphertext.length, 1680);
assert.equal(ciphertext.length / 2, 840);

function modPow(base, exp, mod) {
  let a = BigInt(base);
  let b = BigInt(exp);
  const m = BigInt(mod);
  let result = 1n;
  while (b > 0n) {
    if (b & 1n) result = (result * a) % m;
    a = (a * a) % m;
    b >>= 1n;
  }
  return Number(result);
}

function cycleWalk(value, exp) {
  let current = value;
  let steps = 0;
  do {
    current = modPow(current, exp, modulus);
    steps++;
    if (steps > 1000) throw new Error("cycle-walk exceeded fixed safety bound");
  } while (current >= domain);
  return { value: current, steps };
}

function ioc(values) {
  const counts = Array(alphabetSize).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function decodeBlocks(input, decryptExponent, littleEndian) {
  const output = [];
  const steps = [];
  for (let i = 0; i < input.length; i += 2) {
    const a = input[i];
    const b = input[i + 1];
    const block = littleEndian ? alphabetSize * b + a : alphabetSize * a + b;
    const result = cycleWalk(block, decryptExponent);
    steps.push(result.steps);
    output.push(...(littleEndian
      ? [result.value % alphabetSize, Math.floor(result.value / alphabetSize)]
      : [Math.floor(result.value / alphabetSize), result.value % alphabetSize]));
  }
  return {
    ioc: Number(ioc(output).toFixed(8)),
    maxSteps: Math.max(...steps),
    meanSteps: steps.reduce((sum, value) => sum + value, 0) / steps.length,
    preview: output.slice(0, 100).map((value) => corpus.translit[value]).join(" ")
  };
}

// Exhaustively validate the cycle-walked permutation and both inverse directions
// over the complete 841-state two-rune domain.
let maxControlSteps = 0;
let totalControlSteps = 0;
for (let value = 0; value < domain; value++) {
  const encE = cycleWalk(value, exponent);
  const decD = cycleWalk(encE.value, inverseExponent);
  assert.equal(decD.value, value, `e/d inverse failed at state ${value}`);

  const encD = cycleWalk(value, inverseExponent);
  const decE = cycleWalk(encD.value, exponent);
  assert.equal(decE.value, value, `d/e inverse failed at state ${value}`);

  maxControlSteps = Math.max(maxControlSteps, encE.steps, decD.steps, encD.steps, decE.steps);
  totalControlSteps += encE.steps + decD.steps + encD.steps + decE.steps;
}

const candidates = [];
for (const littleEndian of [false, true]) {
  for (const decryptExponent of [inverseExponent, exponent]) {
    candidates.push({
      serialization: littleEndian ? "little-endian control" : "printed big-endian",
      decryptExponent,
      ...decodeBlocks(ciphertext, decryptExponent, littleEndian)
    });
  }
}

const counts = Array(alphabetSize).fill(0);
for (const value of ciphertext) counts[value]++;
const n = ciphertext.length;
process.stdout.write(JSON.stringify({
  source: transcript.url,
  base29Output: transcript.observed.base29Output,
  exponent,
  modulus,
  phi,
  inverseExponent,
  inverseCheck: (exponent * inverseExponent) % phi,
  blockDomain: domain,
  chapterPages: pages.map((page) => page.page),
  chapterRunes: ciphertext.length,
  twoRuneBlocks: ciphertext.length / 2,
  ciphertextIoc: Number((counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1))).toFixed(8)),
  exhaustivePermutationControl: {
    states: domain,
    bothDirectionsInvertExactly: true,
    maxCycleWalkSteps: maxControlSteps,
    meanCycleWalkSteps: totalControlSteps / (4 * domain)
  },
  candidates
}, null, 2) + "\n");
