"use strict";

/**
 * A full-field, order-independent parity obstruction to ordinary
 * extended Reed-Solomon (256,k) or low-degree polynomial-evaluation
 * interpretations of the original pp49-51 numeric table.
 *
 * At all 256 distinct elements of GF(2^8), sum_x f(x)=0 for
 * deg(f)<255. Addition is bytewise XOR, independently of the
 * irreducible polynomial or enumeration of the evaluation points.
 *
 * Windows 11 / Node.js 22 SFT:
 *   node sims/lp2_grid256_gf256_fullfield_parity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert(bytes.every(n => Number.isInteger(n) && n >= 0 && n < 256));
const xor = ns => ns.reduce((a,b) => a ^ b, 0);
assert.equal(xor(bytes), 0x94, "original 256 table bytes");

/** Multiply in GF(2^8), reduced modulo AES's x^8+x^4+x^3+x+1. */
function multiply(a, b) {
  let answer=0;
  for(let i=0;i<8;i++) {
    if (b&1) answer^=a;
    const high = a&0x80;
    a = (a<<1)&255;
    if (high) a^=0x1b;
    b>>>=1;
  }
  return answer;
}

/** Evaluate a polynomial with GF256 coefficients, low-degree first. */
function evaluate(coefficients, x) {
  let value=0;
  for(let i=coefficients.length-1;i>=0;i--)
    value = multiply(value,x)^coefficients[i];
  return value;
}
// A frozen planted degree-179 polynomial, sufficient for an (256,180)
// extended RS native control. This is a REAL 256-point evaluation
// under the concrete AES field, rather than a synthetic zero array.
const coefficients = Array(180).fill(0);
coefficients[0]=7;
coefficients[3]=29;
coefficients[179]=103;
const planted = Array.from({length:256},(_,x)=>evaluate(coefficients,x));
assert.equal(new Set(planted).size>100,true,"nontrivial full-field plant");
assert.equal(xor(planted),0,"ordinary extended RS parity must vanish");
assert.equal(xor(planted.slice().reverse()),0,"reading order cannot affect parity");
assert.notEqual(xor(bytes),xor(planted),"original table violates the code invariant");
console.log(JSON.stringify({
  source:"Physical LP2 pp49-51, 32x8 radix60 byte table",
  sourceLength:bytes.length,
  originalFullFieldXor:xor(bytes),
  originalHex:"0x"+xor(bytes).toString(16).padStart(2,"0"),
  ordinaryCompleteGF256EvaluationDegAtMost254:"excluded",
  independentOfFieldPolynomialAndCellOrder:true,
  positiveControl:"256 evaluations of degree179 over AES GF256, XOR zero",
  recoveredPlaintextRunes:0
},null,2));
