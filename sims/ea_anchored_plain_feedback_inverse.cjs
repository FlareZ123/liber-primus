"use strict";
/**
 * Source-constrained, EXACT conditional inverse of a red-root F29 difference
 * cipher with one-step plaintext autokey and an EA zero-step reset.
 *
 * For page-local i>0, Delta(C_i)=0 iff P_i=GP-EA(28); otherwise
 * log_15(Delta(C_i))=(P_i + a*(P_(i-1) mod28) + b) mod28.
 * Any zero-step determines P_i=28 regardless of a,b, and all subsequent
 * plaintext is recoverable until the next physical page. The prefix before
 * the first zero-step on each page remains unidentifiable without an IV.
 *
 * Search all 28^2 parameter pairs on original pages 0..27, freeze the
 * training winner and score original pages 28..55 without tuning.
 * Genuine native-Cicada GP language must persist on the untouched pages.
 * A source-matched exact positive plant calibrates recovery power.
 *
 * This is a bounded candidate architecture, NOT an actual LP2 decryption.
 * Run: node sims/ea_anchored_plain_feedback_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(original.length,55);
assert.equal(original.reduce((s,p)=>s+p.indices.length,0),12956);
const MOD=28,POWER=[],LOG=new Int8Array(29).fill(-1);
for(let i=0,x=1;i<28;i++,x=x*15%29){
  assert.equal(LOG[x],-1);POWER.push(x);LOG[x]=i;
}
assert.equal(new Set(POWER).size,28);
const token=new Map(corpus.translit.map((s,i)=>[s,i]));
const nativeText=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
/** @returns {number[]} Solved native GP letters, in original order. */
function nativeRunes(){
  const out=[];
  for(const word of nativeText.match(/[A-Za-z]+/gu)||[]){
    const s=word.toUpperCase().replace(/QU/g,"CW")
      .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<s.length;){
      const digraph=token.get(s.slice(i,i+2));
      if(digraph!==undefined){out.push(digraph);i+=2;continue;}
      const value=token.get(s[i]);
      assert.notEqual(value,undefined);
      out.push(value);i++;
    }
  }
  return out;
}
const reference=nativeRunes();
assert.equal(reference.length,3248);
const counts=new Uint32Array(28);
for(const x of reference)if(x!==28)counts[x]++;
const total=counts.reduce((a,b)=>a+b,0);
const prior=Array.from(counts,x=>Math.log((x+1)/(total+28)));
const uniform=prior.reduce((a,b)=>a+b,0)/28;
const mod28=n=>(n%28+28)%28;
/**
 * @param {number[]} ciphertext
 * @returns {number[]} The first position is excluded from the step stream.
 */
function steps(ciphertext){
  return ciphertext.slice(1).map((c,i)=>LOG[(c-ciphertext[i]+29)%29]);
}
/**
 * @param {{page:number,indices?:number[],step?:number[]}[]} pages
 * @returns {{page:number,step:number[]}[]}
 */
function normalized(pages){
  return pages.map(p=>({page:p.page,step:p.step||steps(p.indices)}));
}
/**
 * @param {number[]} step
 * @param {number} a
 * @param {number} b
 * @returns {{plaintext:(number|null)[],count:number,anchors:number}}
 */
function decode(step,a,b){
  let prev=-1,anchors=0,count=0;
  const plaintext=[];
  for(const e of step){
    if(e<0){prev=28;anchors++;plaintext.push(28);continue;}
    if(prev<0){plaintext.push(null);continue;}
    prev=mod28(e-a*(prev%28)-b);
    plaintext.push(prev);count++;
  }
  return {plaintext,count,anchors};
}
/** @param {{page:number,step:number[]}[]} pages */
function rank(pages){
  const ranked=[];
  for(let a=0;a<28;a++)for(let b=0;b<28;b++){
    let tr=0,ho=0,nt=0,nh=0,at=0,ah=0;
    for(const page of pages){
      let prev=-1;
      for(const e of page.step){
        if(e<0){prev=28;if(page.page<28)at++;else ah++;continue;}
        if(prev<0)continue;
        prev=mod28(e-a*(prev%28)-b);
        if(page.page<28){tr+=prior[prev];nt++;}
        else{ho+=prior[prev];nh++;}
      }
    }
    ranked.push({a,b,trainPerRune:tr/nt,holdoutPerRune:ho/nh,
      trainDecoded:nt,holdoutDecoded:nh,trainAnchors:at,holdoutAnchors:ah});
  }
  ranked.sort((x,y)=>y.trainPerRune-x.trainPerRune);
  return ranked;
}
/** @param {number} seed */
function random32(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;
    state^=state<<5;return state>>>0;};
}
/**
 * @param {number[]} plaintext
 * @param {number} a
 * @param {number} b
 * @param {number} iv
 */
function encrypt(plaintext,a,b,iv){
  let previous=plaintext[0],c=iv;
  const out=[c];
  for(let i=1;i<plaintext.length;i++){
    const p=plaintext[i],e=p===28?-1:mod28(p+a*(previous%28)+b);
    c=(c+(e<0?0:POWER[e]))%29;
    out.push(c);previous=p;
  }
  return out;
}
function run(){
  const source=normalized(original),actual=rank(source),win=actual[0];
  const holdBest=Math.max(...actual.map(x=>x.holdoutPerRune));
  const r=random32(0x3301),plants=[],truePlain=[];
  for(const page of original){
    const p=Array.from({length:page.indices.length},
      ()=>reference[r()%reference.length]);
    const cipher=encrypt(p,15,22,r()%29);
    const s=steps(cipher),out=decode(s,15,22);
    const first=s.findIndex(x=>x<0);
    if(first>=0)for(let i=first;i<s.length;i++)
      assert.equal(out.plaintext[i],p[i+1]);
    plants.push({page:page.page,step:s});
    truePlain.push(p);
  }
  const positive=rank(plants),truth=positive.find(x=>x.a===15&&x.b===22);
  assert.equal(positive[0],truth);
  assert.ok(truth.holdoutPerRune>uniform+0.9);
  const checked=source.reduce((s,p)=>s+decode(p.step,win.a,win.b).count,0);
  assert.equal(checked,win.trainDecoded+win.holdoutDecoded);
  // A strict reverse calculation on every reconstructed original rune step.
  for(const page of source){
    const recovered=decode(page.step,win.a,win.b).plaintext;
    for(let i=0;i<page.step.length;i++){
      if(recovered[i]===null)continue;
      const e=page.step[i];
      if(e<0){assert.equal(recovered[i],28);continue;}
      const predecessor=i?recovered[i-1]:null;
      assert.notEqual(predecessor,null);
      assert.equal(mod28(recovered[i]+win.a*(predecessor%28)+win.b),e);
    }
  }
  return {
    model:"EA-anchored, page-local GP29 log-step first-order plaintext autokey",
    source:{pages:original.length,runes:12956,
      nativeSolvedSourceRunes:reference.length,trainPages:"0..27",
      untouchedPages:"28..55"},
    candidateCount:28*28,sourceRoot:15,zeroMarker:28,
    uniformNonEAReferenceLogScore:uniform,
    original:{
      trainedBest:win,
      untouchedGainVsUniform:win.holdoutPerRune-uniform,
      holdoutScoreRankByTraining:actual.findIndex(x=>x.holdoutPerRune===holdBest)+1,
      topFive:actual.slice(0,5),decodedAfterFirstPageMarker:checked
    },
    control:{
      seed:"0x3301",truth:{a:15,b:22},trainedWinner:{
        a:positive[0].a,b:positive[0].b},
      truthScores:truth,trueCoefficientsRecovered:true,
      postMarkerPlaintextRecoveredExactly:true
    },
    interpretation:"No original LP2 plaintext recovered: the trained winner has negligible frozen-holdout gain against the uniform baseline; exact source-native planted coefficients and plaintext recover."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={decode,encrypt,steps,rank,run};
