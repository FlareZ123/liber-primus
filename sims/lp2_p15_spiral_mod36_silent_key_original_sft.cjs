"use strict";
/**
 * Source-fixed p15 Fibonacci-prime spiral residues, transferred to the
 * independently calibrated mod36 hidden-output receiver. No original key fitting.
 * Run: node sims/lp2_p15_spiral_mod36_silent_key_original_sft.cjs
 */
const fs = require("node:fs"), path = require("node:path");
const assert = require("node:assert/strict");
const {experiment} = require("./lp2_alt36_silent_exact_latent_viterbi_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const raw = {
  gp:read("resources/liber-primus/lp2-corpus.json"),
  shakespeare:read("resources/control/shakespeare_first300k.txt"),
  gibran:read("resources/control/gibran_prophet_58585.txt"),
  emerson:read("resources/control/emerson_essays_2944.txt")
};
const gp=JSON.parse(raw.gp);
const values=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
const period=values.map(v=>v%36);
const repeat=(p,phase=0)=>Array.from({length:4000},(_,i)=>p[(i+phase)%p.length]);
const K=repeat(period);
let s=3301;
const wrongPeriod=Array.from({length:16},()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%36});
const WK=repeat(wrongPeriod), SK=repeat(period,7);
const words=raw.gibran.toUpperCase().match(/[A-Z]+/g);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const tape=[];
for(let w of words.slice(Math.floor(words.length*.57))){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let j=0;j<w.length;){
    const z=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:tokens.find(x=>w.startsWith(x.s,j));
    assert(z,w);tape.push(z.i);j+=z.s.length;
  }
  tape.push(29);
}
const P=tape.slice(2500,2900);
assert.equal(P.length,400);
let j=0,prev=-1;
const E=[];
for(const p of P){
  while((p+K[j])%36===prev)j++;
  const c=(p+K[j])%36;
  E.push({p,c,j});prev=c;j++;
}
const C=E.filter(x=>x.c<29).map(x=>x.c);
const truth=E.filter(x=>x.c<29&&x.p<29).map(x=>x.p);
function lcs(a,b){
  let x=new Uint16Array(b.length+1);
  for(const q of a){
    const y=new Uint16Array(b.length+1);
    for(let i=0;i<b.length;i++)y[i+1]=q===b[i]?x[i]+1:Math.max(y[i],x[i+1]);
    x=y;
  }
  return x[b.length];
}
function decode(c,key){
  const z=experiment(raw,{beam:400,maxHidden:3,decodeInput:{cipher:c,key}});
  assert.equal(z.status,"candidate decoder output (not an authenticated original plaintext)");
  return z;
}
function control(key){
  const z=decode(C,key);
  return {score:z.score,lcs:lcs(z.indices,truth)/Math.max(z.indices.length,truth.length),clock:z.lastConsumedKeyIndex};
}
function original(c){
  const z=decode(c,K);
  return {count:c.length,score:z.score,clock:z.lastConsumedKeyIndex,preview:z.transliteration.slice(0,250),indices:z.indices};
}
const following=gp.pages.slice(16,19).flatMap(x=>x.indices);
assert.equal(following.length,800);assert.equal(gp.pages[15].indices.length,159);
const body=gp.pages[15].indices.slice(20).concat(following);
assert.equal(body.length,939);
const right=control(K),phase7=control(SK),wrong=control(WK);
assert(right.lcs>.95);assert(right.score-wrong.score>2);
const result={
  period,wrongPeriod,
  control:{printed:C.length,truth:truth.length,clock:E.filter(x=>x.c<29).at(-1).j,right,phase7,wrong},
  original:{nextPage:original(following),samePageBody:original(body)},
  scope:"Fixed source key, two declared reset origins, bounded receiver; no key or unknown plaintext recovered."
};
console.log(JSON.stringify(result,null,2));
