"use strict";

/**
 * Source-geometry Reed–Solomon original-input gate: 32×8 = 76 border + 180 inside.
 * Test a full-width polynomial degree <180 over GF(257) and two standard GF(256)
 * representations, with the 256 byte-valued cells fixed in printed row order.
 * Requires Node.js 22, no third-party packages, no file writes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} filename */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", filename), "utf8"));
}

/** @param {number} x @param {number} n @param {(a:number,b:number)=>number} mul */
function power(x, n, mul) {
  let result = 1;
  for (; n > 0; n = Math.floor(n / 2)) {
    if (n % 2 === 1) result = mul(result, x);
    x = mul(x, x);
  }
  return result;
}

/** @returns {Field} */
function gf257() {
  const prime = 257;
  const add = (a, b) => (a + b) % prime;
  const sub = (a, b) => (a + prime - b) % prime;
  const mul = (a, b) => (a * b) % prime;
  const inv = a => {
    assert(a > 0 && a < prime);
    return power(a, prime - 2, mul);
  };
  return { name: "GF(257)", add, sub, mul, inv };
}

/**
 * Polynomial basis of the 8-bit field (AES uses 0x11b; QR/RS typically 0x11d).
 * @param {number} irreducible
 * @returns {Field}
 */
function gf256(irreducible) {
  const add = (a, b) => a ^ b;
  const sub = add;
  const mul = (a, b) => {
    let result = 0;
    while (b > 0) {
      if (b & 1) result ^= a;
      a <<= 1;
      if (a & 256) a ^= irreducible;
      b >>= 1;
    }
    return result;
  };
  const inv = a => {
    assert(a > 0 && a < 256);
    return power(a, 254, mul);
  };
  return { name: "GF(256) polynomial 0x" + irreducible.toString(16),
    add, sub, mul, inv };
}

/** @typedef {{
 * name: string,
 * add: (a:number,b:number)=>number,
 * sub: (a:number,b:number)=>number,
 * mul: (a:number,b:number)=>number,
 * inv: (a:number)=>number
 * }} Field
 */

/**
 * Given 180 unique original grid cell positions, interpolate the unique
 * field polynomial of degree <=179 and predict every unselected position.
 * Barycentric weights depend only on visible original positions.
 * @param {Field} field
 * @param {number[]} inside
 */
function interpolate(field, inside) {
  const {add, sub, mul, inv} = field;
  const weights = inside.map((x, i) => {
    let denominator = 1;
    for (let j = 0; j < inside.length; j++) {
      if (j !== i) denominator = mul(denominator, sub(x, inside[j]));
    }
    return inv(denominator);
  });

  /** @param {number[]} values @param {number} x */
  function evaluate(values, x) {
    const known = inside.indexOf(x);
    if (known !== -1) return values[inside[known]];
    let numerator = 0, denominator = 0;
    for (let i = 0; i < inside.length; i++) {
      const term = mul(weights[i], inv(sub(x, inside[i])));
      numerator = add(numerator, mul(term, values[inside[i]]));
      denominator = add(denominator, term);
    }
    return mul(numerator, inv(denominator));
  }
  return evaluate;
}

/**
 * Deterministically encode 180 source-native GP29 digits as an arbitrary
 * degree <=179 polynomial over the selected field; all 256 evaluations are
 * a genuine extended Reed–Solomon codeword with systematic 180 witnesses.
 * @param {Field} field
 * @param {number[]} coefficients
 */
function encode(field, coefficients) {
  return Array.from({length:256}, (_, x) => {
    let acc = 0;
    for (let i = coefficients.length - 1; i >= 0; i--) {
      acc = field.add(field.mul(acc, x), coefficients[i]);
    }
    return acc;
  });
}

function main() {
  const grid = load("resources/liber-primus/lp2-grid-256.json");
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const bytes = grid.pages.flatMap(page => page.bytes);
  assert.equal(bytes.length, 256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const inside = [];
  for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) inside.push(8 * r + c);
  const insideSet = new Set(inside);
  const border = Array.from({length:256}, (_, i) => i).filter(i => !insideSet.has(i));
  assert.equal(inside.length, 180);
  assert.equal(border.length, 76);

  const solvedP57 = corpus.pages.find(page => page.page === 57).indices;
  assert.equal(solvedP57.length, 95);
  const coefficients = Array.from({length:180}, (_, i) => solvedP57[i % solvedP57.length]);
  const results = [];
  for (const field of [gf257(), gf256(0x11d), gf256(0x11b)]) {
    const evaluate = interpolate(field, inside);
    // Positive control is a known 180-symbol source polynomial over this field.
    const planted = encode(field, coefficients);
    assert(border.every(pos => evaluate(planted, pos) === planted[pos]));
    assert(inside.every(pos => evaluate(planted, pos) === planted[pos]));
    // The original 180 interior bytes are held fixed, then the full 76 cells
    // are predicted with no inferred key or scoring.
    assert(inside.every(pos => evaluate(bytes, pos) === bytes[pos]));
    const predictions = border.map(pos => evaluate(bytes, pos));
    const matched = border.filter((pos, i) => predictions[i] === bytes[pos]);
    assert.equal(matched.length, 0);
    results.push({field:field.name, knownInterior:180,
      predictedOuter:76, exactPerimeterMatches:matched.length,
      first16Predicted:predictions.slice(0,16), plantMatches:76});
  }
  console.log(JSON.stringify({
    source:"original LP2 printed p49–51 32x8 table; original p57 GP29 source-native planted polynomial",
    sourceByteSHA256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    geometry:{rows:32,columns:8,border:76,interior:180,
      terminalUnsolvedPage55Runes:76,terminalSolvedPages56and57Runes:180},
    hypothesis:"256 original table bytes form an extended RS(256,180) evaluation word under original row-major position labels",
    cases:results,
    conclusion:"All three canonical finite-field representations predict zero of 76 original perimeter symbols, despite 76/76 planted recovery. No source-selected codeword or LP2 plaintext."
  }, null, 2));
}
if (require.main === module) main();
module.exports = {gf257,gf256,interpolate,encode,main};
