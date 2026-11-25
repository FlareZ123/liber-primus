"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const grid = require("../resources/liber-primus/lp2-grid-256.json");
const bytes = Buffer.from(grid.bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const limit = 1n << 256n;
const modulus = limit | 0x425n;

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function mul(a, b) {
  let y = 0n;
  while (b) {
    if (b & 1n) y ^= a;
    b >>= 1n;
    a <<= 1n;
    if (a & limit) a ^= modulus;
  }
  return y;
}
/** @param {bigint} x @returns {bigint} */
function inv(x) {
  assert(x !== 0n);
  let u = x, v = modulus, g = 1n, h = 0n;
  while (u !== 1n) {
    let d = u.toString(2).length - v.toString(2).length;
    if (d < 0) { [u,v] = [v,u]; [g,h] = [h,g]; d = -d; }
    u ^= v << BigInt(d);
    g ^= h << BigInt(d);
  }
  while (g >= limit) g ^= modulus << BigInt(g.toString(2).length - 257);
  assert.equal(mul(x, g), 1n);
  return g;
}
/** @param {bigint[]} xs @param {bigint[]} ys @returns {bigint} */
function lead(xs, ys) {
  return xs.reduce((acc, x, i) => {
    const d = xs.reduce((p,z,j) => i === j ? p : mul(p,x^z),1n);
    return acc ^ mul(ys[i],inv(d));
  },0n);
}
/** @param {bigint[]} coefficients @param {bigint} x @returns {bigint} */
function evalPoly(coefficients,x) {
  return coefficients.reduceRight((y,c)=>mul(y,x)^c,0n);
}
/** @param {bigint[]} input @returns {{subsets:number,assignments:number,matches:number[][]}} */
function census(input) {
  assert.equal(input.length,7);
  let subsets=0, assignments=0;
  /** @type {number[][]} */
  const matches=[];
  /** @param {number[]} ids @param {number} start */
  function select(ids,start) {
    if(ids.length<7) {
      for(let i=start;i<=10-(6-ids.length);i++) select([...ids,i],i+1);
      return;
    }
    subsets++;
    const xs=ids.map(BigInt);
    const weights=xs.map(x=>inv(xs.reduce((p,z)=>x===z?p:mul(p,x^z),1n)));
    const products=input.map(v=>weights.map(w=>mul(v,w)));
    const order=Array(7).fill(0);
    /** @param {number} depth @param {number} used @param {bigint} sum */
    function permute(depth,used,sum) {
      if(depth===7) {
        assignments++;
        if(sum===0n) matches.push(order.map(j=>ids[j]));
        return;
      }
      for(let j=0;j<7;j++) if(!(used&(1<<j))) {
        order[depth]=j;
        permute(depth+1,used|(1<<j),sum^products[depth][j]);
      }
    }
    permute(0,0,0n);
  }
  select([],1);
  assert.equal(subsets,120);
  assert.equal(assignments,604800);
  return {subsets,assignments,matches};
}
/** @param {Buffer} b @returns {bigint} */
const pack=b=>BigInt("0x"+b.toString("hex"));
const vertical=Array.from({length:8},(_,c)=>pack(Buffer.from(Array.from({length:32},(_,r)=>bytes[8*r+c]))));
const contiguous=Array.from({length:8},(_,i)=>pack(bytes.subarray(32*i,32*i+32)));

// Exact positive: a common nonzero multiplier and an arbitrary degree-five mask
// turn a genuine monic quintic into a nonmonic degree-five polynomial.
const ids=[9,3,10,1,5,7,2].map(BigInt);
const q=Array.from({length:5},(_,i)=>pack(crypto.createHash("sha256").update(`degree6-control-${i}`).digest()));
q.push(1n);
const scale=0x123456789abcdefn;
const mask=[0xa4n,0xe5n,0x3301n,0x1033n,0x52n,0x761n];
const plant=ids.map(x=>mul(scale,evalPoly(q,x))^evalPoly(mask,x));
assert.equal(lead(ids,plant),0n);
const plant6=plant.map((v,i)=>v^evalPoly([0n,0n,0n,0n,0n,0n,0x123n],ids[i]));
assert.equal(lead(ids,plant6),0x123n);
const control=census(plant);
assert(control.matches.some(m=>m.every((x,i)=>BigInt(x)===ids[i])));
const a=census(vertical.slice(0,7)), b=census(contiguous.slice(0,7));
assert.equal(a.matches.length,0);
assert.equal(b.matches.length,0);
console.log(JSON.stringify({field:"GF(2^256), x^256+x^10+x^5+x^2+1",control,vertical:a,contiguous:b},null,2));
