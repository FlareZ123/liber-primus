"use strict";
/**
 * Frozen p29/table DH2 residual key test on the six 273-rune LP2 pages.
 * Run from the repo root: node sims/p29_table_dh2_residual_273_page_key_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const table=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
/** @param {number} n @returns {number} */
const mod=n=>(n%29+29)%29;
/** @param {number} n @returns {number} */
function invert(n){for(let i=1;i<29;i++)if(mod(n*i)===1)return i;throw Error("zero divisor");}
/**
 * @param {number[]} coefficients descending polynomial coefficients
 * @param {number[]} factor descending divisor
 * @returns {{q:number[],r:number[]}}
 */
function divide(coefficients,factor){
  const w=coefficients.map(mod),q=[],scale=invert(factor[0]);
  for(let i=0;i<=w.length-factor.length;i++){
    const value=mod(w[i]*scale);q.push(value);
    for(let j=0;j<factor.length;j++)w[i+j]=mod(w[i+j]-value*factor[j]);
  }
  return {q,r:w.slice(1-factor.length)};
}
/** @param {number[]} values @returns {number} */
function ioc(values){
  const bins=Array(29).fill(0);
  for(const value of values)bins[value]++;
  return bins.reduce((s,k)=>s+k*(k-1),0)/(values.length*(values.length-1));
}
const P=corpus.pages[29].indices;
const S=table.byte_rows.flat().map(mod);
const G=[15,5,27],G2=[22,5,23,9,4];
assert.equal(P.length,277);assert.equal(S.length,256);
const residual=P.slice();
for(let i=0;i<S.length;i++)residual[residual.length-S.length+i]=mod(residual[residual.length-S.length+i]-S[i]);
for(let i=0;i<G.length;i++)residual[residual.length-G.length+i]=mod(residual[residual.length-G.length+i]-2*G[i]);
const {q:key,r:remainder}=divide(residual,G2);
assert.equal(key.length,273);assert.deepEqual(remainder,[0,0,0,0]);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length===273);
assert.deepEqual(pages.map(p=>p.page),[11,17,21,25,41,44]);
const result=pages.map(page=>{
  const minus=page.indices.map((v,i)=>mod(v-key[i]));
  const plus=page.indices.map((v,i)=>mod(v+key[i]));
  assert.deepEqual(minus.map((v,i)=>mod(v+key[i])),page.indices);
  assert.deepEqual(plus.map((v,i)=>mod(v-key[i])),page.indices);
  return {page:page.page,rawIoc:ioc(page.indices),minusIoc:ioc(minus),plusIoc:ioc(plus),
    equal:page.indices.filter((v,i)=>v===key[i]).length,
    minusHead:minus.slice(0,30).map(i=>corpus.translit[i]).join(" "),
    plusHead:plus.slice(0,30).map(i=>corpus.translit[i]).join(" ")};
});
assert.deepEqual(result.map(p=>p.equal),[12,7,11,13,7,10]);
assert(Math.max(...result.flatMap(p=>[p.minusIoc,p.plusIoc]))<0.036);
const known=corpus.pages[57].indices;
const plant=Array.from({length:273},(_,i)=>known[i%known.length]);
const cipher=plant.map((v,i)=>mod(v+key[i]));
assert.deepEqual(cipher.map((v,i)=>mod(v-key[i])),plant);
console.log(JSON.stringify({source:"P29 = S50 + 2G + G^2*R mod29",residualLength:key.length,
  residualIoc:ioc(key),remainder,results:result,solvedGPControlRecovered:plant.length},null,2));
