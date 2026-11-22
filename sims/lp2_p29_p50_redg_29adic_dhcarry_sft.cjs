"use strict";
/** Source-original p29/p50 shared red-G 29-adic carry test.
 * Windows Node22/CommonJS SFT. Postselected state relation, no plaintext.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const C=corpus.pages.find(p=>p.page===29).indices;
const B=grid.bytes;
const G=[15,5,27], H=[24,26,3], p=23,e=3;
const mod=(x,m)=>((x%m)+m)%m;
/** @param {number[]} source @param {number[]} factor @param {29|841} m */
function divide(source,factor,m) {
 const a=source.slice(), q=[];
 const inv=Array.from({length:m},(_,i)=>i).find(v=>mod(factor[0]*v,m)===1);
 assert.notEqual(inv,undefined);
 for(let i=0;i<=source.length-factor.length;i++) {
   const c=mod(a[i]*inv,m);q.push(c);
   for(let j=0;j<factor.length;j++)a[i+j]=mod(a[i+j]-c*factor[j],m);
 }
 return {q,rem:a.slice(source.length-factor.length+1)};
}
/** @param {number[]} q */
function multiplyG(q) {
 const r=new Array(q.length+2).fill(0);
 for(let i=0;i<q.length;i++)for(let j=0;j<3;j++)r[i+j]=mod(r[i+j]+G[j]*q[i],29);
 return r;
}
const quotient=divide(C,G,29);
assert.deepEqual(quotient.rem,[0,0]);
assert.deepEqual(divide(B,G,29).rem,[0,0]);
assert.deepEqual(divide(B,H,29).rem,[0,0]);
const cR=divide(C,G,841).rem;
const bGR=divide(B,G,841).rem;
const bHR=divide(B,H,841).rem;
assert.deepEqual(cR,[377,551]);
assert.deepEqual(bGR,[435,58]);
assert.deepEqual(bHR,[232,145]);
const lift=r=>r.map(x=>{assert.equal(x%29,0);return x/29;});
const [x,y]=lift(cR);
assert.deepEqual([x,y],[13,19]);
assert.deepEqual([mod(x-y,29),mod(x+y,29)],[p,e]);
assert.deepEqual(lift(bGR),[15,2]);
assert.deepEqual(lift(bHR),[8,5]);
let seed=0x3301f29;
function rand32(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
let matching=0;const distinct=new Set();const M=8000;
for(let t=0;t<M;t++){
 const q=quotient.q.slice();
 for(let i=q.length-1;i>0;i--){const j=rand32()%(i+1);[q[i],q[j]]=[q[j],q[i]];}
 const z=lift(divide(multiplyG(q),G,841).rem);
 distinct.add(z.join(","));
 if(z[0]===13&&z[1]===19)matching++;
}
assert.equal(matching,11);
assert.equal(distinct.size,841);
console.log(JSON.stringify({status:"PASS",classification:"Postselected key-like arithmetic only; no original plaintext.",
p29G:{rem841:cR,carry:[x,y],H:[p,e]},
p50:{Gcarry:lift(bGR),Hcarry:lift(bHR)},
conditionalNull:{seed:"0x3301f29",M,matching,distinctPairs:distinct.size,plusOne:(matching+1)/(M+1)},
caution:"The exact p29 DH pair was seen before the target was nominated, so the null's 0.0015 is descriptive and not an independent authorship p-value."},null,2));
