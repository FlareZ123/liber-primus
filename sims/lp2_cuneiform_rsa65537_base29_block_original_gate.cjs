#!/usr/bin/env node
"use strict";

// Original-source gate for direct fixed-width GP29 RSA on physical pp33-39.
// Run from the repository root:
//   node sims/lp2_cuneiform_rsa65537_base29_block_original_gate.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpusPath = path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const pages = corpus.pages
  .filter((p) => p.page >= 33 && p.page <= 39)
  .sort((a, b) => a.page - b.page);
const pageLengths = pages.map((p) => [p.page, p.indices.length]);
const C = pages.flatMap((p) => p.indices);

const P = 1033n;
const Q = 3301n;
const N = P * Q;
const PHI = (P - 1n) * (Q - 1n);
const E = 65537n;
const D = modInverse(E, PHI);
const RADIX = 29n;
const CIPHER_WIDTH = 5;

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function egcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
}

function modInverse(a, m) {
  const [g, x] = egcd(a, m);
  assert.equal(g, 1n);
  return ((x % m) + m) % m;
}

function modPow(base, exp, mod) {
  let b = base % mod;
  let e = exp;
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return out;
}

function decodeBlock(block, order) {
  let value = 0n;
  if (order === "big") {
    for (const digit of block) value = value * RADIX + BigInt(digit);
  } else {
    for (let i = 0; i < block.length; i++) {
      value += BigInt(block[i]) * (RADIX ** BigInt(i));
    }
  }
  return value;
}

function encodeBase29(value, width) {
  let n = BigInt(value);
  const out = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(n % RADIX);
    n /= RADIX;
  }
  assert.equal(n, 0n, "value does not fit requested base29 width");
  return out;
}

function summarize(order) {
  const blocks = [];
  for (let i = 0; i < C.length; i += CIPHER_WIDTH) {
    const digits = C.slice(i, i + CIPHER_WIDTH);
    assert.equal(digits.length, CIPHER_WIDTH);
    const value = decodeBlock(digits, order);
    blocks.push({
      offset: i,
      digits,
      value: Number(value),
      valid: value < N,
      leadingDigit: order === "big" ? digits[0] : digits[digits.length - 1],
    });
  }
  const invalid = blocks.filter((b) => !b.valid);
  return {
    order,
    blocks: blocks.length,
    valid: blocks.length - invalid.length,
    invalid: invalid.length,
    leadingDigit0to4: blocks.filter((b) => b.leadingDigit <= 4).length,
    firstBlock: blocks[0],
    firstInvalid: invalid[0],
  };
}

function positiveControl() {
  const results = [];
  for (let i = 0; i < 336; i++) {
    const m = BigInt((i * 1009 + 12345) % Number(RADIX ** 4n));
    assert(m < N);
    const c = modPow(m, E, N);
    assert(c < N);
    const digits = encodeBase29(c, CIPHER_WIDTH);
    assert(decodeBlock(digits, "big") === c);
    assert(digits[0] <= 4);
    const recovered = modPow(c, D, N);
    assert.equal(recovered, m);
    results.push({ m: Number(m), c: Number(c), digits });
  }
  return {
    blocks: results.length,
    allCiphertextsBelowN: results.every((x) => BigInt(x.c) < N),
    allLeadingDigits0to4: results.every((x) => x.digits[0] <= 4),
    allRoundTrip: results.every((x) => modPow(BigInt(x.c), D, N) === BigInt(x.m)),
    first: results[0],
    last: results[results.length - 1],
  };
}

assert.equal(isPrime(Number(P)), true);
assert.equal(isPrime(Number(Q)), true);
assert.equal(N, 3409933n);
assert.equal(PHI, 3405600n);
assert.equal(D, 3398273n);
assert.equal(gcd(E, PHI), 1n);
assert.equal(RADIX ** 4n, 707281n);
assert.equal(RADIX ** 5n, 20511149n);
assert(RADIX ** 4n < N && N < RADIX ** 5n);
assert.deepEqual(pageLengths, [
  [33, 214], [34, 261], [35, 271], [36, 238],
  [37, 228], [38, 228], [39, 240],
]);
assert.equal(C.length, 1680);
assert.equal(C.length % CIPHER_WIDTH, 0);

const big = summarize("big");
const little = summarize("little");
assert.equal(big.blocks, 336);
assert.equal(big.valid, 45);
assert.equal(big.invalid, 291);
assert.equal(big.leadingDigit0to4, 47);
assert.deepEqual(big.firstBlock.digits, [23, 12, 14, 5, 0]);
assert.equal(big.firstBlock.value, 16572050);
assert.equal(big.firstBlock.valid, false);

assert.equal(little.blocks, 336);
assert.equal(little.valid, 56);
assert.equal(little.invalid, 280);
assert.equal(little.leadingDigit0to4, 59);
assert.deepEqual(little.firstInvalid.digits, [10, 24, 7, 8, 6]);
assert.equal(little.firstInvalid.offset, 5);
assert.equal(little.firstInvalid.value, 4445391);
assert.equal(little.firstInvalid.valid, false);

const control = positiveControl();
assert.equal(control.blocks, 336);
assert(control.allCiphertextsBelowN);
assert(control.allLeadingDigits0to4);
assert(control.allRoundTrip);

console.log(JSON.stringify({
  source: {
    pages: pageLengths,
    runeCount: C.length,
    blockWidth: CIPHER_WIDTH,
    blockCount: C.length / CIPHER_WIDTH,
    modulus: Number(N),
    phi: Number(PHI),
    exponent: Number(E),
    privateExponent: Number(D),
    radixBounds: { radix4: Number(RADIX ** 4n), modulus: Number(N), radix5: Number(RADIX ** 5n) },
  },
  originalCiphertext: { bigEndian: big, littleEndian: little },
  syntheticPositiveControl: control,
  decision: "Direct fixed-width GP29 RSA block encoding of pp33-39 is impossible: original five-rune groups are not all residues below N.",
}, null, 2));
