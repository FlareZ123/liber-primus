'use strict';

/**
 * Original LP2 p49–51 numerical-grid generator gate: source-order LFSR,
 * homogeneous GF(q) recurrences, and a direct 8-bit affine recurrence.
 * Node.js 22, CommonJS, no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80, 104, 72]);
assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.deepEqual(bytes.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

/** @typedef {{add:(a:number,b:number)=>number,sub:(a:number,b:number)=>number,mul:(a:number,b:number)=>number,inv:(a:number)=>number}} Field */

/** @param {number} prime @returns {Field} */
function primeField(prime) {
  const mod = n => ((n % prime) + prime) % prime;
  const pow = (a, exponent) => {
    let value = 1;
    while (exponent) {
      if (exponent % 2) value = mod(value * a);
      a = mod(a * a);
      exponent = Math.floor(exponent / 2);
    }
    return value;
  };
  return {
    add:(a,b)=>mod(a+b), sub:(a,b)=>mod(a-b), mul:(a,b)=>mod(a*b),
    inv:a=>{assert.notEqual(a,0);return pow(a,prime-2);}
  };
}

/** @param {number} poly 0x11b or 0x11d @returns {Field} */
function byteField(poly) {
  const mul=(left,right)=>{
    let result=0;
    while(right) {
      if(right&1) result^=left;
      left<<=1;
      if(left&0x100) left^=poly;
      right>>>=1;
    }
    return result;
  };
  const pow=(a,n)=>{
    let value=1;
    while(n) {
      if(n&1) value=mul(value,a);
      a=mul(a,a);
      n>>>=1;
    }
    return value;
  };
  return {
    add:(a,b)=>a^b, sub:(a,b)=>a^b, mul,
    inv:a=>{assert.notEqual(a,0);return pow(a,254);}
  };
}

/**
 * Shortest homogeneous linear recurrence on the supplied finite field.
 * @param {number[]} sequence
 * @param {Field} field
 * @returns {{degree:number,coefficients:number[]}}
 */
function berlekampMassey(sequence,field) {
  let C=[1],B=[1],L=0,last=1,gap=1;
  for(let n=0;n<sequence.length;n++) {
    let discrepancy=0;
    for(let i=0;i<=L;i++) discrepancy=field.add(discrepancy,field.mul(C[i]||0,sequence[n-i]));
    if(discrepancy===0) {gap++;continue;}
    const saved=C.slice();
    const ratio=field.mul(discrepancy,field.inv(last));
    while(C.length<B.length+gap) C.push(0);
    for(let j=0;j<B.length;j++) C[j+gap]=field.sub(C[j+gap],field.mul(ratio,B[j]));
    if(2*L<=n) {L=n+1-L;B=saved;last=discrepancy;gap=1;}
    else gap++;
  }
  return {degree:L,coefficients:C.slice(0,L+1)};
}

/** @param {number[]} items @param {boolean} msb @returns {number[]} */
function bits(items,msb) {
  return items.flatMap(b=>Array.from({length:8},(_,i)=>(b>>(msb?7-i:i))&1));
}

// Positive controls: exact recovery of generated 31-bit and 11-byte laws.
const plantBits=Array.from({length:31},(_,i)=>(i*17+Math.floor(i/3))&1);
for(let i=31;i<2048;i++) plantBits.push(plantBits[i-31]^plantBits[i-28]);
assert.equal(berlekampMassey(plantBits,primeField(2)).degree,31);
for(const [name,field,modulus] of [
  ['GF29',primeField(29),29],['GF257',primeField(257),257],
  ['GF256_11b',byteField(0x11b),256],['GF256_11d',byteField(0x11d),256]
]) {
  const plant=Array.from({length:11},(_,i)=>(i*i*3+i*23+1)%modulus);
  for(let i=11;i<256;i++) plant.push(field.add(field.mul(13,plant[i-1]),field.mul(7,plant[i-11])));
  assert.equal(berlekampMassey(plant,field).degree,11,name);
}

const orders={
  row:bytes,
  reverse:bytes.slice().reverse(),
  column:Array.from({length:8},(_,c)=>Array.from({length:32},(_,r)=>bytes[8*r+c])).flat()
};
const results={};
for(const [name,s] of Object.entries(orders)) {
  results[name]={
    bits_msb:berlekampMassey(bits(s,true),primeField(2)).degree,
    bits_lsb:berlekampMassey(bits(s,false),primeField(2)).degree,
    gf256_11b:berlekampMassey(s,byteField(0x11b)).degree,
    gf256_11d:berlekampMassey(s,byteField(0x11d)).degree,
    gf29:berlekampMassey(s.map(x=>x%29),primeField(29)).degree,
    gf257:berlekampMassey(s,primeField(257)).degree
  };
}
let lcgMax=0;
for(let a=0;a<256;a++) {
  const b=(bytes[1]-a*bytes[0])&255;
  let matches=0;
  for(let i=0;i<255;i++) matches+=Number(bytes[i+1]===((a*bytes[i]+b)&255));
  lcgMax=Math.max(lcgMax,matches);
}
assert.ok(lcgMax<255);
console.log(JSON.stringify({
  source:'original-source 256 numeral cells, conditional base60 byte mapping',
  first8:bytes.slice(0,8),unique:new Set(bytes).size,
  byteSum:bytes.reduce((a,b)=>a+b,0),
  linearComplexity:results,
  bestAnchoredLCGMatches:lcgMax,
  positive:'31-stage binary and four field-specific 11-stage plants pass'
},null,2));
