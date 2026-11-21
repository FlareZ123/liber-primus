"use strict";
/** Fixed p29+p30 original GF29 remainder mod source p15 char-poly.
 * Frozen in workplace/agent5-p29-p30-p15-matrix-remainder-will-precommit.md.
 * Node.js 22 CJS, source-exact read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {number} x */
const m=x=>(x%29+29)%29;
/** @param {number} p */
const page=p=>source.pages.find(x=>x.page===p).indices;
/** @param {number[]} highfirst @param {number[]} monic */
function remainder(highfirst,monic){
  const work=highfirst.slice();
  for(let i=0;i<=highfirst.length-monic.length;i++){
    const v=work[i];
    for(let j=0;j<monic.length;j++)work[i+j]=m(work[i+j]-v*monic[j]);
  }
  assert.ok(work.slice(0,-monic.length+1).every(v=>v===0));
  return work.slice(-monic.length+1);
}
/** @param {number[]} a @param {number[]} b */
function multiply(a,b){
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)out[i+j]=m(out[i+j]+a[i]*b[j]);
  return out;
}
const modpoly=multiply(multiply([1,21],[1,12]),[1,10,25]);
assert.deepEqual(modpoly,[1,14,27,10,7]);
const a=page(29),b=page(30);
assert.equal(a.length,277);
assert.equal(b.length,263);
const summed=a.map((value,i)=>m(value+(i<14?0:b[i-14])));
assert.equal(summed.length,277);
const output=remainder(summed,modpoly);
assert.deepEqual(output,[5,17,15,20]);
assert.notDeepEqual(output,[7,10,20,20]);
const recomputed=multiply([1,14,27,10,7],[1]);
assert.deepEqual(recomputed,modpoly);
console.log(JSON.stringify({status:"NEGATIVE source-signed WILL33 mismatch",
  originalCiphertexts:[a.length,b.length],
  sourceCharacteristicPolynomial:modpoly,
  remainderHighFirst:output,
  transcript:output.map(x=>source.translit[x]).join(""),
  precommittedExactNextWord:"WILL",
  predictedGP29:[7,10,20,20]
},null,2));
