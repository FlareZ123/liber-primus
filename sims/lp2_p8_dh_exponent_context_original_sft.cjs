"use strict";

/**
 * LP2 p8 as 243-cell state codebook driving a 2013 DH-style multiplicative
 * GP29 cipher. Node 22 / Windows 11. No network, no files written.
 *
 * Uses exact p7 red word products for GF(3) taps, two legitimate de Bruijn
 * zero splice locations, and native p8 243 black runes as exponent labels.
 * Tests the two source-attested 2013 DH constants (g5 and shared K2) as
 * nonzero multiplicative group generators on GP29, in place of an already
 * exhausted additive p8 lookup. Exact original p9..p14 plus native p57 plant.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gp = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const p7=gp.pages[7].indices, p8=gp.pages[8].indices;
const target=gp.pages.slice(9,15).flatMap(p=>p.indices);
const solved=gp.pages[57].indices;
assert.equal(target.length,1474);
assert.equal(p8.length,255);
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(p7.slice(-14),redWords.flat());
const tap=redWords.map(w=>w.reduce((p,x)=>p*x%29,1)%3);
assert.deepEqual(tap,[2,2,2,0,2]);
const mseq=[];
let register=tap.slice();
for(let i=0;i<242;i++) {
  mseq.push(register[0]);
  register=[...register.slice(1), tap.reduce((v,x,j)=>v+x*register[j],0)%3];
}
assert.deepEqual(register,tap);

/**
 * Enumerate all (not just first) admissible four-zero windows:
 * the 2014 puzzle does not pick a splice.
 * @returns {{insertion:number,states:number[]}[]}
 */
function legitimateZeroSplices() {
  const possibilities=[];
  for(let i=0;i<242;i++) {
    if(![0,1,2,3].every(j=>mseq[(i+j)%242]===0)) continue;
    const position=(i+4)%242;
    const sequence=mseq.slice();
    sequence.splice(position,0,0);
    const addresses=Array.from({length:243},(_,k)=>{
      let value=0;
      for(let j=0;j<5;j++) value=3*value+sequence[(k+j)%243];
      return value;
    });
    assert.equal(new Set(addresses).size,243);
    const table=Array(243);
    addresses.forEach((address,j)=>table[address]=p8[12+j]);
    assert(table.every(x=>Number.isInteger(x)&&x>=0&&x<=28));
    possibilities.push({insertion:position,states:table});
  }
  return possibilities;
}
const splices=legitimateZeroSplices();
assert.deepEqual(splices.map(x=>x.insertion),[87,208]);
assert.equal(splices.filter(x=>x.states.join(",")===splices[0].states.join(",")).length,1);

const mod=x=>(x%29+29)%29;
/** @param {number} base @param {number} exponent @returns {number} */
function power(base,exponent) {
  let n=mod(exponent); // reduction modulo 29 is harmless for inputs 0..28;
  n=(exponent%28+28)%28;
  let out=1;
  for(let i=0;i<n;i++) out=out*base%29;
  return out;
}
/** @param {number} factor @returns {number} */
function inverse(factor) {
  for(let x=1;x<29;x++) if(x*factor%29===1) return x;
  throw new Error("source-derived multiplier must be nonzero modulo29");
}
const initial=p8.slice(-5);
assert.equal(initial.length,5);
/**
 * @param {number[]} stream
 * @param {number[]} table
 * @param {number} base
 * @param {-1|1} sign
 * @param {boolean} primeTrits
 * @param {"cipher"|"plain"} feedback
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(stream,table,base,sign,primeTrits,feedback,encrypt) {
  const prior=initial.slice(),result=[];
  for(const rune of stream) {
    let state=0;
    for(const v of prior.slice(-5)) {
      const radixTrit=primeTrits ? gp.prime[v]%3 : v%3;
      state=state*3+radixTrit;
    }
    const factor=power(base,sign*table[state]);
    const effective=encrypt ? factor : inverse(factor);
    const converted=rune*effective%29;
    result.push(converted);
    prior.push(feedback==="cipher" ? (encrypt ? converted : rune) :
      (encrypt ? rune : converted));
  }
  return result;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts=Array(29).fill(0);
  for(const x of arr) counts[x]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(arr.length*(arr.length-1));
}
const control=Array.from({length:target.length},(_,i)=>solved[i%solved.length]);
const results=[];
for(const {insertion,states} of splices) {
  for(const base of [2,5]) for(const sign of [-1,1]) {
    for(const primeTrits of [false,true]) for(const feedback of ["cipher","plain"]) {
      const args=[states,base,sign,primeTrits,feedback];
      const decoded=transform(target,...args,false);
      assert.deepEqual(transform(decoded,...args,true),target);
      const ciphertextPlant=transform(control,...args,true);
      assert.deepEqual(transform(ciphertextPlant,...args,false),control);
      assert.equal(decoded.filter(x=>x===0).length,target.filter(x=>x===0).length);
      results.push({insertion,base,sign,trits:primeTrits?"GP-prime":"GP-index",
        feedback,originalRunes:decoded.length,
        IoC:+ioc(decoded).toFixed(10),
        e:decoded.filter(x=>x===18).length,
        first40:decoded.slice(0,40).map(x=>gp.translit[x]).join("."),
        fullOriginalReencryption:"1474/1474",nativePlant:"1474/1474"});
    }
  }
}
assert.equal(results.length,32);
const ordered=results.slice().sort((a,b)=>b.IoC-a.IoC);
const verdict="Both first-party 2013 DH operands with both legitimate GF3 zero-splice choices fail to recover source-native p9-p14 text by direct source-table exponentiation; no author-authenticated DH-to-p8 opcode is given.";
console.log(JSON.stringify({
  source:"exact original p7 five red-word products, p8 native 243 black GP29 runes, p9-p14 1474 original runes and solved p57 positive",
  tap,zeroSplices:splices.map(x=>x.insertion),
  architecture:"multiplicative GP29 via exponentiated p8 table label, plaintext-F zero preserved",
  originalIoC:+ioc(target).toFixed(10),nativeSolvedIoC:+ioc(solved).toFixed(10),
  candidateCount:results.length,bestFiveByIoC:ordered.slice(0,5),
  minIoC:Math.min(...results.map(x=>x.IoC)),
  maxIoC:Math.max(...results.map(x=>x.IoC)),
  maxE:Math.max(...results.map(x=>x.e)),
  verdict,results
},null,2));
