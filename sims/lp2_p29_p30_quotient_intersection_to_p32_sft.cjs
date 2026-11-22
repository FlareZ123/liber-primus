"use strict";
/** SFT: frozen common-coefficient Q29/Q30 equality selection of p32.
 * Precommit workplace/agent5-p29-p30-coefficient-intersection-p32-precommit.md.
 * Node.js22 CJS read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {number} n */
const mod29=n=>(n%29+29)%29;
/** @param {number} p */
const page=p=>corpus.pages.find(x=>x.page===p).indices;
/** @param {number[]} p @param {number[]} factor */
function quotient(p,factor){
  const remainder=p.slice(),out=[];
  const leadInverse=Array.from({length:28},(_,i)=>i+1).find(v=>mod29(v*factor[0])===1);
  assert.notEqual(leadInverse,undefined);
  for(let i=0;i<=p.length-factor.length;i++){
    const q=mod29(remainder[i]*leadInverse);out.push(q);
    for(let j=0;j<factor.length;j++)remainder[i+j]=mod29(remainder[i+j]-q*factor[j]);
  }
  assert.deepEqual(remainder.slice(out.length),[0,0]);
  return out;
}
const q29=quotient(page(29),[15,5,27]);
const q30=quotient(page(30),[1,4,20]);
assert.equal(q29.length,275);
assert.equal(q30.length,261);
const p32=page(32);
assert.equal(p32.length,121);
const selected=p32.flatMap((v,i)=>q29[i+14]===q30[i]?[{i,q:q30[i],v}]:[]);
assert.deepEqual(selected.map(x=>x.i),[31,66,118]);
assert.deepEqual(selected.map(x=>x.v),[3,15,6]);
const nextWord= [26,3,1];
assert.notDeepEqual(selected.map(x=>x.v),nextWord);
const text=selected.map(x=>corpus.translit[x.v]).join("");
console.log(JSON.stringify({
  verdict:"NEGATIVE: frozen common-coefficient AND selector not signed YOU",
  originalDomains:{q29:q29.length,q30:q30.length,p32:p32.length},
  coefficientAlignment:"Q29[i+14] === Q30[i], i=0..120",
  selected,selectedText:text,predicted:"YOU",
  sourceQuotientChecks:true,authenticOriginalReceiver:true
},null,2));
