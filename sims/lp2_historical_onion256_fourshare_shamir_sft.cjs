#!/usr/bin/env node
"use strict";
/**
 * Source-exact 256-byte four-object Shamir necessary-condition check.
 * Historical onion2/onion3/onion4 256-byte excerpts are unverified candidate
 * sources. The fourth object is the LP2 pp49–51 32×8 table in row-major order.
 * Test the historically standard four visible x-positions 1,2,3,4, in two
 * eight-bit field conventions, with no unknown key or fitted share labels.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const archived = read("resources/cicada-hiddenservice-256-candidates.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const fromHex = str => [...Buffer.from(str, "hex")];
const sources = archived.sourceServices.map(s => fromHex(s.hex)).concat([table.bytes]);
assert.deepEqual(archived.sourceServices.map(s => s.id), ["onion2","onion3","onion4"]);
assert.deepEqual(sources.map(s => s.length), [256,256,256,256]);

/** @param {number} x @param {number} y @param {number} poly */
function multiply(x,y,poly) {
  let out = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (y & 1) out ^= x;
    y >>>= 1;
    x = ((x << 1) ^ ((x & 128) ? poly : 0)) & 255;
  }
  return out;
}
/** @param {number} base @param {number} power @param {number} poly */
function exponentiate(base,power,poly) {
  let out = 1;
  for (; power > 0; power >>>= 1,base = multiply(base,base,poly))
    if (power & 1) out = multiply(out,base,poly);
  return out;
}
/**
 * Interpolate over GF256 with explicit x-coordinates 1..n.
 * @param {number[]} ys
 * @param {number} target
 * @param {number} poly
 */
function interpolate(ys,target,poly) {
  let result = 0;
  for (let i = 0; i < ys.length; i++) {
    let weight = ys[i];
    for (let j = 0; j < ys.length; j++) {
      if (i === j) continue;
      const denominator = (i + 1) ^ (j + 1);
      const numerator = target ^ (j + 1);
      weight = multiply(weight,multiply(numerator,exponentiate(denominator,254,poly),poly),poly);
    }
    result ^= weight;
  }
  return result;
}

for (const poly of [0x11b,0x11d]) {
  for (const threshold of [2,3]) {
    const indices = [];
    for (let k = 0; k < 256; k++) {
      const predicted = interpolate(sources.slice(0,threshold).map(s => s[k]),4,poly);
      if (predicted === sources[3][k]) indices.push(k);
    }
    assert.equal(indices.length,0, "Source four-object polynomial constraint changed");
    // Positive: use the same 256 byte positions and first three/four share labels.
    for (let k = 0; k < 256; k++) {
      const a = "A real source-selected key recovered from shares".charCodeAt(k % 48) || 65;
      const b = (13 + 17*k) & 255;
      const c = (237 - 11*k) & 255;
      const share = x => a ^ multiply(b,x,poly) ^
        (threshold === 3 ? multiply(c,multiply(x,x,poly),poly) : 0);
      const known = Array.from({length:threshold},(_,i)=>share(i+1));
      assert.equal(interpolate(known,4,poly),share(4));
      assert.equal(interpolate(known,0,poly),a);
    }
    console.log(JSON.stringify({field:poly.toString(16),threshold,
      actualMatchingPositions:indices.length,bytePositions:256,
      plantedPositionsRecovered:256,firstPredicted:
        interpolate(sources.slice(0,threshold).map(s=>s[0]),4,poly),
      firstOriginal:sources[3][0]}));
  }
}

// Source triple interpreted as Shamir 3-of-3 necessarily reduces to the
// already-reported XOR construction when x=1,2,3 in characteristic two.
for (let k = 0; k < 256; k++) {
  for (const poly of [0x11b,0x11d]) {
    assert.equal(interpolate(sources.slice(0,3).map(s => s[k]),0,poly),
      sources[0][k] ^ sources[1][k] ^ sources[2][k]);
  }
}
console.log("Historical three-object Shamir 3/3 secret equals previously tested XOR, 256/256.");
