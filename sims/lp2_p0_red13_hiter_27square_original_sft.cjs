'use strict';

/**
 * Source-constrained H-power keystream transfer from the p0 red13 candidate.
 * Original unchanged pp0–2, solved p57 synthetic full inverse.
 * Windows Node.js 22: node sims/lp2_p0_red13_hiter_27square_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const input=gp.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(gp.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
assert.equal(input.length,729);
const mod=x=>((x%29)+29)%29;
const target=[18,13,10,13,8,24,9,26,15,18,18,5,15]; // signed EPIPHANY SEEKS
assert.equal(target.length,13);
const K0=input.slice(0,13).map((n,i)=>mod(n-target[i]));
assert.deepEqual(K0,[26,24,8,19,27,24,18,3,0,8,0,16,19]);

/** @param {number[]} a @returns {number[]} */
function H(a){
  const out=[];
  for(let j=0;j<Math.floor(a.length/2);j++){
    out.push(mod(a[j]-a[a.length-1-j]),mod(a[j]+a[a.length-1-j]));
  }
  if(a.length%2===1)out.push(a[Math.floor(a.length/2)]);
  return out;
}
/** @param {number[]} a @returns {number[]} */
function Hi(a){
  const out=Array(a.length);
  for(let j=0;j<Math.floor(a.length/2);j++){
    const d=a[2*j],s=a[2*j+1];
    out[j]=mod(15*(s+d));
    out[a.length-1-j]=mod(15*(s-d));
  }
  if(a.length%2)out[Math.floor(a.length/2)]=a.at(-1);
  return out;
}
assert.deepEqual(H(Hi(K0)),K0);
assert.deepEqual(Hi(H(K0)),K0);

/**
 * C = P - sign*key; the inverse is P = C + sign*key.
 * @param {number[]} values @param {(a:number[])=>number[]} evolve @param {number} sign
 */
function apply(values,evolve,sign){
  let k=K0.slice();
  const result=[];
  for(let i=0;i<values.length;i++){
    if(i>0&&i%13===0)k=evolve(k);
    result.push(mod(values[i]+sign*k[i%13]));
  }
  return result;
}
/** @param {number[]} a */
function ioc(a){
  const f=Array(29).fill(0);
  for(const x of a){assert(Number.isInteger(x)&&x>=0&&x<29);f[x]+=1;}
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const solved=gp.pages[57].indices;
assert.equal(solved.length,95);
const models=[];
for(const [name,evolve] of [['H',H],['H-inverse',Hi]])for(const sign of [-1,1]){
  const decoded=apply(input,evolve,sign);
  const encoded=apply(decoded,evolve,-sign);
  assert.deepEqual(encoded,input);
  const planted=apply(solved,evolve,-sign);
  assert.deepEqual(apply(planted,evolve,sign),solved);
  if(sign===-1)assert.deepEqual(decoded.slice(0,13),target);
  const vals={
    name,sign,sourceTitleMatched:sign===-1,
    completeOriginalRoundTrip:input.length,
    p0FullIoC:ioc(decoded.slice(0,262)),
    p0BlackIoC:ioc(decoded.slice(13,262)),
    openingChapterIoC:ioc(decoded),
    first104AfterTitleIoC:ioc(decoded.slice(13,117)),
    first24AfterTitle:decoded.slice(13,37).map(i=>gp.translit[i]).join(' '),
    positiveNativeP57Recovered:solved.length
  };
  assert.ok(vals.p0BlackIoC<0.045);
  assert.ok(vals.openingChapterIoC<0.045);
  models.push(vals);
}
console.log(JSON.stringify({
  source:"Original p0–p2 729-rune 27x27 block, fixed signed 2016 EPIPHANY SEEKS title candidate, source H/H-inverse",
  originalKey:K0,
  keyBlockSize:13,
  originalP0UnmodifiedRunes:262,
  fullNativeP57GP29IoC:ioc(solved),
  fixedSourceModels:models,
  result:"No H/Hinverse-evolved 13-key full page or opening-chapter plaintext; first13 target is conditional."
},null,2));
