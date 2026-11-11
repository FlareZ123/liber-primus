'use strict';

/**
 * Source-motivated 13-of-31 Shamir reconstruction from 32 grid ROWS.
 * Distinct from the earlier eight-column, <=7-threshold sharing gate.
 * The two original five-slot ornaments suggest 13 and 31 only under
 * an independently recorded (but unauthenticated) binary orientation.
 * No ciphertext is used to fit any polynomial or its coordinates.
 *
 * @module grid_31share13_threshold_gate
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const table = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const BYTES = table.bytes;
assert.equal(BYTES.length,256);
const DB = [31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,
  10,21,11,23,14,29,27,22,12,24,17,3,7,15];
assert.equal(new Set(DB).size,32);

/**
 * @param {number} a First field element.
 * @param {number} b Second field element.
 * @param {number} field 0x11b, 0x11d, or 257.
 * @returns {number}
 */
function mul(a,b,field) {
  if(field===257)return a*b%257;
  let out=0;
  for(let i=0;i<8;i++){
    if(b&1)out^=a;
    b>>>=1;
    a<<=1;
    if(a&256)a^=field;
  }
  return out;
}

/** @param {number} a @param {number} n @param {number} field */
function pow(a,n,field) {
  let result=1;
  while(n>0) {
    if(n&1)result=mul(result,a,field);
    a=mul(a,a,field);
    n=Math.floor(n/2);
  }
  return result;
}

/** @param {number} a @param {number} field */
function inv(a,field) {
  assert.notEqual(a,0);
  return pow(a,field===257?255:254,field);
}

/** @param {number} a @param {number} b @param {number} field */
function sub(a,b,field) {
  return field===257?(a-b+257)%257:a^b;
}

/**
 * Exactly k shares interpolate a polynomial of degree < k.
 * The prediction uses no target symbol beyond the first k.
 * @param {number[]} xs Unique source share coordinates.
 * @param {number[]} ys Source symbols.
 * @param {number} x Target coordinate.
 * @param {number} field GF field identifier.
 * @param {number} k Frozen Shamir threshold.
 * @returns {number}
 */
function interpolate(xs,ys,x,field,k=13) {
  let result=0;
  for(let i=0;i<k;i++){
    let basis=1;
    for(let j=0;j<k;j++)if(i!==j) {
      const ratio=mul(sub(x,xs[j],field),
        inv(sub(xs[i],xs[j],field),field),field);
      basis=mul(basis,ratio,field);
    }
    const term=mul(ys[i],basis,field);
    result=field===257?(result+term)%257:result^term;
  }
  return result;
}

/** @param {number[]} coefficients @param {number} x @param {number} field */
function evaluate(coefficients,x,field) {
  let out=0;
  for(let i=coefficients.length-1;i>=0;i--) {
    out=mul(out,x,field);
    out=field===257?(out+coefficients[i])%257:out^coefficients[i];
  }
  return out;
}

function run() {
  const result=[];
  const maps=[['printed-row',Array.from({length:32},(_,i)=>i+1)],
    ['recorded-debruijn-row-state',DB]];
  const EXPECTED={
    '283:printed-row':[0,0,0,0,0,0,0,0],
    '283:recorded-debruijn-row-state':[0,0,0,0,1,0,0,0],
    '285:printed-row':[0,0,0,0,0,0,0,0],
    '285:recorded-debruijn-row-state':[0,0,0,0,1,0,0,0],
    '257:printed-row':[0,1,0,0,0,0,0,0],
    '257:recorded-debruijn-row-state':[0,0,0,0,0,0,0,0]
  };
  for(const field of [0x11b,0x11d,257]) {
    for(const [name,xs] of maps) {
      assert.equal(new Set(xs).size,32);
      const matches=[];
      for(let column=0;column<8;column++) {
        const ys=Array.from({length:32},(_,r)=>BYTES[8*r+column]);
        let hit=0;
        for(let r=13;r<32;r++) {
          const candidate=interpolate(xs,ys,xs[r],field);
          if(candidate===ys[r])hit++;
        }
        matches.push(hit);
        // A correctly constructed polynomial always passes on all rows
        // including the 19 genuinely held-out shares and any secret x=0.
        const coefficients=Array.from({length:13},(_,k)=>
          (7+19*k+37*column)%(field===257?257:256));
        const plant=xs.map(x=>evaluate(coefficients,x,field));
        for(let r=0;r<32;r++)assert.equal(
          interpolate(xs,plant,xs[r],field),plant[r]);
        assert.equal(interpolate(xs,plant,0,field),coefficients[0]);
      }
      assert.deepEqual(matches,EXPECTED[field+':'+name]);
      assert.ok(matches.every(n=>n<19));
      result.push({field:field===0x11b?'GF256-AES':
        field===0x11d?'GF256-RS':'GF257',map:name,
        threshold:13,sharedRows:32,heldoutRows:19,
        heldoutMatchesByColumn:matches,
        recoveredSecret:false,positiveControlPass:true});
    }
  }
  return result;
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={mul,interpolate,evaluate,run};
