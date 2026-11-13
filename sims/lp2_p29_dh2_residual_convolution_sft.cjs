"use strict";
/** Original p29/table signed DH2 residual as a GF29 polynomial convolution key.
 * Six exact 273-rune pages, high/low coefficient orientations and both
 * forward/inverse operations, with full genuine-original reencryption.
 * Node.js CommonJS; no dependencies or filesystem writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const M=x=>((x%29)+29)%29;
const H=[27,5,15],square=Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)square[i+j]=M(square[i+j]+H[i]*H[j]);
assert.deepEqual(square,[4,9,23,5,22]);
const P=gp.pages.find(p=>p.page===29).indices.slice().reverse();
const S=grid.bytes.map(M).reverse();
const work=P.map((v,i)=>M(v-(S[i]||0)-2*(H[i]||0)));
const inv=x=>{for(let k=1;k<29;k++)if(M(x*k)===1)return k;throw Error("singular key")};
const R=Array(P.length-4).fill(0);
for(let i=work.length-1;i>=4;i--){let x=M(work[i]*inv(square[4]));R[i-4]=x;for(let j=0;j<5;j++)work[i-4+j]=M(work[i-4+j]-x*square[j]);}
assert.deepEqual(work.slice(0,4),[0,0,0,0]);
assert.equal(R.length,273);
assert.deepEqual(R.slice(0,16),[22,26,3,28,25,22,3,6,6,27,14,0,4,13,26,15]);
assert.equal(R.at(-1),8);
const pages=[11,17,21,25,41,44].map(id=>({id,runes:gp.pages.find(p=>p.page===id).indices}));
assert(pages.every(p=>p.runes.length===273));
/** @param {number[]} data @param {number[]} key @param {boolean} decode */
function run(data,key,decode){
  const output=Array(data.length).fill(0),factor=inv(key[0]);
  for(let i=0;i<data.length;i++){
    let v=decode?data[i]:0;
    for(let j=decode?1:0;j<key.length&&j<=i;j++)
      v+=(decode?-key[j]*output[i-j]:key[j]*data[i-j]);
    output[i]=M(v*(decode?factor:1));
  }
  return output;
}
/** @param {number[]} a */
function ioc(a){const h=Array(29).fill(0);for(const v of a)h[v]++;return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));}
const solved=gp.pages.find(p=>p.page===57).indices;
const native=Array.from({length:273},(_,i)=>solved[i%solved.length]);
const result=[];
for(const [direction,key]of [["constant-first",R],["high-degree-first",R.slice().reverse()]])
for(const op of [true,false]){
  const plant=run(native,key,!op);
  assert.deepEqual(run(plant,key,op),native);
  for(const page of pages){
    const decoded=run(page.runes,key,op);
    assert.deepEqual(run(decoded,key,!op),page.runes);
    result.push({page:page.id,direction,operation:op?"deconvolve":"convolve",
      ioc:ioc(decoded),first30:decoded.slice(0,30).map(x=>gp.translit[x]).join("")});
  }
}
assert.equal(result.length,24);
assert(result.every(r=>r.ioc<0.06));
console.log(JSON.stringify({source:"P29 = S256 + 2*G + G^2*R",
  signedDHSharedSecret:2,residualLength:R.length,originalOutputTests:result.length,
  sourceNativePlantRecoveredRunesPerVariant:273,allOriginalRereencoded:true,
  originalSummary:{minIoc:Math.min(...result.map(r=>r.ioc)),maxIoc:Math.max(...result.map(r=>r.ioc))},
  originalResults:result,authenticPlaintextRecovered:false},null,2));
