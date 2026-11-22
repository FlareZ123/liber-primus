"use strict";
/**
 * P39 marked polynomial jet evaluated at the previously printed LP2 ciphertext
 * rune. Exact, bounded source-motivated original-input gate.
 *
 * The marked p39 red triplet [27,5,15] equals [P(15),P'(15),15],
 * where P is the original 256-cell table polynomial over F29.
 *
 * Causal trial decoder: plaintext[i] = ciphertext[i] +
 * sign * J(ciphertext[i-1]) (mod 29), with the source seed 15 at the
 * book or physical-page start and J=P or P'.
 *
 * Every variant is invertible because the previous published ciphertext
 * is known. No unknown plaintext, seed, phase, or alphabet is fitted.
 *
 * Run from the repository root: node sims/p39_grid_jet_ciphertext_feedforward_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
/** @param {number} n @returns {number} */
const mod=n=>((n%29)+29)%29;
/** @param {number[]} bytes @param {number} x @returns {[number,number]} */
function jet(bytes,x){
 let value=0,derivative=0;
 for(const b of bytes){
  derivative=mod(derivative*x+value);
  value=mod(value*x+b);
 }
 return [value,derivative];
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
 const counts=Array(29).fill(0);
 for(const x of xs)counts[x]++;
 return counts.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
/**
 * @param {number[]} input
 * @param {number[][]} table
 * @param {number} component
 * @param {number} sign
 * @returns {number[]}
 */
function decode(input,table,component,sign){
 let prev=15;
 const out=[];
 for(const c of input){out.push(mod(c+sign*table[prev][component]));prev=c;}
 return out;
}
/**
 * @param {number[]} plain
 * @param {number[][]} table
 * @param {number} component
 * @param {number} sign
 * @returns {number[]}
 */
function encode(plain,table,component,sign){
 let prev=15;
 const out=[];
 for(const p of plain){const c=mod(p-sign*table[prev][component]);out.push(c);prev=c;}
 return out;
}

const corpus=load("resources/liber-primus/lp2-corpus.json");
const grid=load("resources/liber-primus/base60-grid.json");
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
 "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const table=Array.from({length:29},(_,x)=>jet(bytes,x));
assert.deepEqual(table[15],[27,5]);
const pages=corpus.pages.filter(p=>p.page>=0&&p.page<=55&&p.indices.length>0);
assert.equal(pages.length,55);
const full=pages.flatMap(p=>p.indices);
assert.equal(full.length,12956);
const originalIoc=ioc(full);
assert.ok(Math.abs(originalIoc-0.03447839786450569)<1e-12);
const expectations={
 "value:-1:book":0.034491874585704026,
 "value:-1:page":0.034490254042748254,
 "value:1:book":0.03450419547847067,
 "value:1:page":0.03450311114458115,
 "derivative:-1:book":0.034486607821097776,
 "derivative:-1:page":0.03448946760278443,
 "derivative:1:book":0.03453533135158406,
 "derivative:1:page":0.034534080197096154
};
const planted=[16,8,18,7,10,15,16,24,9,18,19,18,17,6,18,9,5,18];
assert.equal(planted.length,18);
const reports=[];
for(let component=0;component<2;component++){
 for(const sign of [-1,1]){
  for(const pageReset of [false,true]){
   const parts=pageReset?pages.map(p=>p.indices):[full];
   const decoded=parts.flatMap(p=>decode(p,table,component,sign));
   assert.equal(decoded.length,full.length);
   const reencoded=parts.flatMap((p,i)=>encode(pageReset?decoded.slice(pages.slice(0,i).reduce((s,q)=>s+q.indices.length,0),
     pages.slice(0,i+1).reduce((s,q)=>s+q.indices.length,0)):decoded,table,component,sign));
   assert.deepEqual(reencoded,full);
   const known=encode(planted,table,component,sign);
   assert.deepEqual(decode(known,table,component,sign),planted);
   const label=(component?"derivative":"value")+":"+sign+":"+(pageReset?"page":"book");
   const score=ioc(decoded);
   assert.ok(Math.abs(score-expectations[label])<1e-12,label);
   reports.push({label,ioc:score,head:decoded.slice(0,35).map(x=>corpus.translit[x]).join(" ")});
  }
 }
}
console.log(JSON.stringify({inputRunes:full.length,originalIoc,markedJet:table[15],reports},null,2));
