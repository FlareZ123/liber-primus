#!/usr/bin/env node
"use strict";
// Exact read-only source-red polynomial multiplication gate, pretarget at
// workplace/lp2-local-red-polynomial-body-divisibility-pretarget.md.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const solved=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const mod=x=>((x%29)+29)%29;
const inv=a=>{for(let n=1;n<29;n++)if(mod(a*n)===1)return n;throw Error("nonunit");};
const trim=p=>{let x=p.slice();while(x.length>1&&x.at(-1)===0)x.pop();return x;};
const multiply=(p,q)=>{let r=Array(p.length+q.length-1).fill(0);for(let i=0;i<p.length;i++)for(let j=0;j<q.length;j++)r[i+j]=mod(r[i+j]+p[i]*q[j]);return r;};
const divide=(body,key)=>{
 const k=trim(key),remainder=body.slice(),quotient=Array(Math.max(0,body.length-k.length+1)).fill(0);
 assert(k.at(-1)!==0);
 if(body.length<k.length)return {quotient:[],remainder:body.slice(),degree:k.length-1};
 const inverseLead=inv(k.at(-1));
 for(let d=body.length-1;d>=k.length-1;d--){
   const c=mod(remainder[d]*inverseLead),j=d-k.length+1;quotient[j]=c;
   for(let a=0;a<k.length;a++)remainder[j+a]=mod(remainder[j+a]-c*k[a]);
 }
 assert.deepEqual(multiply(quotient,k).map((v,i)=>mod(v+(remainder[i]||0))),body);
 return {quotient,remainder:remainder.slice(0,k.length-1),degree:k.length-1};
};
// Independent historical-source known positive (different physical pages).
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const f=page(3).slice(119,122),r15=page(15).slice(9,20),r57=page(57).slice(0,7);
assert.deepEqual(f,[13,23,2]);
const known=divide(r15.map((x,j)=>mod(x-(r57[j]||0))),f);
assert.deepEqual(known.remainder,[0,0]);
assert.deepEqual(known.quotient,[5,5,14,9,10,4,27,17,25]);
// Planted source text comes from actual solved record, with independent GP alphabet.
const donor=[...solved.sections.find(s=>s.name==="0_welcome").source_text]
 .filter(ch=>corpus.runes.includes(ch)).map(ch=>corpus.runes.indexOf(ch));
assert(donor.length>100);
const results=[];
for(const pageInfo of ink.pages.filter(p=>p.page<=55)){
 const original=page(pageInfo.page);
 for(const red of(pageInfo.red_spans||[])){
  const next=(pageInfo.red_spans||[]).filter(x=>x.start>red.start);
  const end=next.length?Math.min(...next.map(x=>x.start)):original.length;
  const black=original.slice(red.start+red.length,end);
  const key=original.slice(red.start,red.start+red.length);
  if(black.length<key.length)continue;
  const checks=[];
  for(const direction of["printed-ascending","printed-descending"]){
   const r=direction==="printed-ascending"?key:key.slice().reverse();
   const c=direction==="printed-ascending"?black:black.slice().reverse();
   const o=divide(c,r);
   assert(o.remainder.length===o.degree);
   // True source-native plaintext planted as the *actual quotient*.
   const native=Array.from({length:c.length-trim(r).length+1},(_,j)=>donor[j%donor.length]);
   const generated=multiply(native,trim(r)),back=divide(generated,r);
   assert.deepEqual(back.quotient,native);
   assert(back.remainder.every(v=>v===0));
   checks.push({direction,sourceDegree:o.degree,nonzeroRemainder:o.remainder.filter(v=>v!==0).length,
     zeroRemainder:o.remainder.every(v=>v===0),remainder:o.remainder});
  }
  results.push({page:pageInfo.page,redStart:red.start,redLength:red.length,blackStart:red.start+red.length,
    blackLength:black.length,checks});
 }
}
assert.equal(results.length,13);
assert.equal(results.reduce((n,x)=>n+x.checks.length,0),26);
assert(results.every(x=>x.checks.every(c=>!c.zeroRemainder)));
const output={schema:"lp2-red-local-poly-body-exact-gate-v1",result:"NO_LITERAL_LOCAL_RED_POLYNOMIAL_DIVISOR",
 source:{spansAllOriginal:16,eligible:13,chargedOrientations:26},
 sourceKnownPositive:{p3:f,p15MinusSolvedP57:r15.map((v,j)=>mod(v-(r57[j]||0))),quotient:known.quotient,
  exactRemainder:known.remainder},
 validSourceNativePositivePlants:26,original:results,
 decision:"All local original red-body products have nonzero GF29 remainder in both frozen coefficient orders. Exact p3/p15/p57 red-only cross-page polynomial identity stays valid."};
console.log(JSON.stringify(output,null,2));
