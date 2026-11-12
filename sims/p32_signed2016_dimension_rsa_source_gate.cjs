"use strict";
/**
 * Original p32 literal RSA test from signed 2016 tree dimensions 563x569
 * and signed number 3301. The page's 121 original runes and source-first
 * 11x11 GP prime sums select this candidate, but no signed clue commands RSA.
 * Tests 3/4 GP digits, both natural sentinel positions and endian conventions.
 * Run: node sims/p32_signed2016_dimension_rsa_source_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const db=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const page=db.pages[32].indices;
assert.equal(page.length,121);
const N=563*569, phi=562*568, e=3301, d=250557;
assert.equal(N,320347);
assert.equal(phi,319216);
assert.equal(e*d%phi,1);
/** @param {number} v @param {number} exp @param {number} mod */
function powmod(v,exp,mod){
  let n=BigInt(mod),a=BigInt(exp),b=BigInt(v),o=1n;
  while(a>0n){
    if(a&1n)o=o*b%n;
    b=b*b%n;
    a>>=1n;
  }
  return Number(o);
}
/** @param {number[]} values @param {boolean} reversed */
function base29(values,reversed){
  const digits=reversed?values.slice().reverse():values;
  return digits.reduce((s,v)=>s*29+v,0);
}
for(const v of [0,1,29,3301,24388,320346])
  assert.equal(powmod(powmod(v,e,N),d,N),v);
const tests=[];
for(const firstDropped of [false,true]){
  const runes=firstDropped?page.slice(1):page.slice(0,120);
  assert.equal(runes.length,120);
  for(const width of [3,4]){
    for(const reversed of [false,true]){
      const blocks=Array.from({length:120/width},(_,i)=>
        base29(runes.slice(i*width,(i+1)*width),reversed));
      const invalidCipher=blocks.filter(v=>v>=N).length;
      const invalidPlain=invalidCipher?null:blocks.map(v=>powmod(v,d,N))
        .filter(v=>v>=29**width).length;
      tests.push({firstDropped,width,reversed,blocks:blocks.length,
        invalidCipher,invalidPlain});
      assert(invalidCipher>0||invalidPlain>0);
    }
  }
}
assert.deepEqual(tests.map(v=>[v.invalidCipher,v.invalidPlain]),[
  [0,36],[0,37],[16,null],[17,null],
  [0,37],[0,38],[23,null],[15,null]
]);
console.log(JSON.stringify({source:"original LP2 p32 121 GP29 runes",
  hypothesis:"textbook RSA with N=563*569, e=3301",
  sourceQualification:"primes and exponent are conjectural role assignments",
  positiveControl:"6/6 valid RSA messages",
  tests,conclusion:"No same-width 3/4-digit RSA inverse for source p32"},null,2));
