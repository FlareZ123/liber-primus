"use strict";
/**
 * Original LP2 red-triad Newton field clock, with no fitted cipher key.
 *
 * Source p3 red [13,23,2] defines u²=3u+8 in GF(29²).
 * Source p39 red [27,5,15] is [P(15),P'(15),15] for the grid polynomial.
 * The uniquely selected field state u^690=15 has Newton correction
 * P(15)/P'(15)=17 and Newton successor 27.
 *
 * Hypothetical decoder: k_i = projection(P(z_i)/P'(z_i)) or
 * projection(z_i-P(z_i)/P'(z_i)), z_i=15*u^i.
 * These are source-motivated potential keys, not actual Cicada keys.
 * At the two exact critical states define the quotient's sentinel as zero.
 *
 * Run with Node 22 from repository root:
 * node sims/p39_newton_field_clock_original_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} file @returns {any} */
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
/** @param {number} x @returns {number} */
const mod=x=>((x%29)+29)%29;
/** @typedef {[number,number]} F */
/** @param {F} a @param {F} b @returns {F} */
function mul(a,b){
  return [mod(a[0]*b[0]+8*a[1]*b[1]),
    mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
}
/** @param {F} a @param {F} b @returns {F} */
function sub(a,b){return [mod(a[0]-b[0]),mod(a[1]-b[1])];}
/** @param {F} a @param {number} power @returns {F} */
function pow(a,power){
  let out=[1,0],base=a;
  for(let n=power;n>0;n=Math.floor(n/2)){
    if(n%2)out=mul(out,base);
    base=mul(base,base);
  }
  return out;
}
/** @param {number[]} coeff @param {F} x @returns {F} */
function evaluate(coeff,x){
  let out=[0,0];
  for(const c of coeff){out=mul(out,x);out[0]=mod(out[0]+c);}
  return out;
}
/** @param {number[]} coeff @returns {number[]} */
function derivative(coeff){
  return coeff.slice(0,-1).map((c,i)=>mod(c*(coeff.length-1-i)));
}
const bytes=json("resources/liber-primus/lp2-grid-256.json").bytes;
const corpus=json("resources/liber-primus/lp2-corpus.json");
const annotations=json("resources/liber-primus/lp2-ink-annotations.json");
const english=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
assert.equal(bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const redTriples=annotations.pages.flatMap(page=>(page.red_spans||[])
  .filter(span=>span.length===3)
  .map(span=>({page:page.page,start:span.start,
    indices:[...span.runes].map(c=>corpus.runes.indexOf(c))})));
assert.deepEqual(redTriples,[
  {page:3,start:119,indices:[13,23,2]},
  {page:39,start:119,indices:[27,5,15]}
]);
const P=bytes.map(mod),D=derivative(P);
assert.deepEqual(evaluate(P,[15,0]),[27,0]);
assert.deepEqual(evaluate(D,[15,0]),[5,0]);
assert.deepEqual(evaluate(D,[13,0]),[0,0]);
assert.deepEqual(evaluate(D,[24,0]),[0,0]);
const clock=[];
let state=[1,0];
for(let exponent=0;exponent<840;exponent++){
  const value=evaluate(P,state),slope=evaluate(D,state);
  const singular=slope[0]===0&&slope[1]===0;
  const displacement=singular?[0,0]:mul(value,pow(slope,839));
  clock.push({exponent,state,displacement,newton:sub(state,displacement),singular});
  state=mul(state,[0,1]);
}
assert.deepEqual(state,[1,0]);
assert.notDeepEqual(pow([0,1],420),[1,0]);
assert.notDeepEqual(pow([0,1],280),[1,0]);
assert.notDeepEqual(pow([0,1],168),[1,0]);
assert.deepEqual(clock.filter(x=>x.singular)
  .map(({exponent,state})=>({exponent,state})),[
    {exponent:180,state:[13,0]},
    {exponent:360,state:[24,0]}
  ]);
const rootPhase=clock.find(x=>x.state[0]===15&&x.state[1]===0).exponent;
assert.equal(rootPhase,690);
assert.deepEqual(clock[rootPhase].displacement,[17,0]);
assert.deepEqual(clock[rootPhase].newton,[27,0]);
const projection={
  a: x=>x[0],
  b: x=>x[1],
  trace: x=>mod(2*x[0]+3*x[1]),
  norm: x=>mod(x[0]*x[0]+3*x[0]*x[1]-8*x[1]*x[1])
};
const log15=Array(29).fill(-1);
const pow15=[];
{let x=1;for(let i=0;i<28;i++){pow15.push(x);log15[x]=i;x=mod(x*15);}}
assert.equal(new Set(pow15).size,28);
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
  .map(p=>p.indices);
const original=pages.flat();
assert.equal(pages.length,55);
assert.equal(original.length,12956);
/** @param {string} text @returns {number[]} */
function gpEncode(text){
  const gp=new Map(corpus.translit.map((s,i)=>[s,i])),out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const two=word.slice(i,i+2);
      if(gp.has(two)){out.push(gp.get(two));i+=2;}
      else {if(gp.has(word[i]))out.push(gp.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gpEncode(english);
assert(gp.length>162956);
const trigram=new Uint32Array(29**3);
const bigram=new Uint32Array(29**2);
for(let i=2;i<100000;i++){
  trigram[gp[i-2]*841+gp[i-1]*29+gp[i]]++;
  bigram[gp[i-2]*29+gp[i-1]]++;
}
const lm=Float64Array.from({length:29**3},(_,i)=>
  Math.log((trigram[i]+0.25)/(bigram[Math.floor(i/29)]+7.25)));
/** @param {number[]} a @returns {number} */
function score(a){
  let sum=0;
  for(let i=2;i<a.length;i++)sum+=lm[a[i-2]*841+a[i-1]*29+a[i]];
  return sum/(a.length-2);
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((sum,c)=>sum+c*(c-1),0)/(a.length*(a.length-1));
}
/**
 * @typedef {{operation:"displacement"|"newton",view:"a"|"b"|"trace"|"norm",
 * mode:"gp29"|"rank28"|"log28",pageReset:boolean,sign:number}} Configuration
 * @param {Configuration} cfg
 * @returns {number[]}
 */
function keyStream(cfg){
  return clock.map(z=>projection[cfg.view](z[cfg.operation]));
}
/**
 * Decode or encode a plain sequence under a source-fixed key, preserving
 * all 55 page-IV symbols and GP28 transparent repeated-ciphertext markers.
 *
 * @param {number[][]} input
 * @param {Configuration} cfg
 * @param {boolean} encrypt
 * @returns {number[][]}
 */
function apply(input,cfg,encrypt){
  const key=keyStream(cfg),out=[];
  let t=0;
  for(const page of input){
    if(cfg.pageReset)t=0;
    const decoded=[];
    for(let i=0;i<page.length;i++){
      if(cfg.mode==="gp29"){
        decoded.push(mod(page[i]+(encrypt?-cfg.sign:cfg.sign)*key[(rootPhase+t)%840]));
        t++;
        continue;
      }
      if(i===0){decoded.push(page[0]);continue;}
      if(encrypt){
        if(page[i]===28){decoded.push(decoded[i-1]);continue;}
        const x=((page[i]-cfg.sign*key[(rootPhase+t)%840])%28+28)%28;
        const delta=cfg.mode==="rank28"?x+1:pow15[x];
        decoded.push(mod(decoded[i-1]+delta));
        t++;
      }else{
        const delta=mod(page[i]-page[i-1]);
        if(delta===0){decoded.push(28);continue;}
        const x=cfg.mode==="rank28"?delta-1:log15[delta];
        decoded.push(((x+cfg.sign*key[(rootPhase+t)%840])%28+28)%28);
        t++;
      }
    }
    out.push(decoded);
  }
  return out;
}
const tests=[],reference=gp.slice(150000,150000+original.length);
let at=0;const nativePages=pages.map(page=>{
  const x=reference.slice(at,at+page.length);at+=page.length;return x;
});
assert.equal(at,reference.length);
for(const operation of ["displacement","newton"])
  for(const view of ["a","b","trace","norm"])
    for(const mode of ["gp29","rank28","log28"])
      for(const pageReset of [false,true])
        for(const sign of [-1,1]){
          const cfg={operation,view,mode,pageReset,sign};
          const candidate=apply(pages,cfg,false);
          assert.deepEqual(apply(candidate,cfg,true),pages);
          const planted=apply(nativePages,cfg,true);
          assert.deepEqual(apply(planted,cfg,false),nativePages);
          const p=candidate.flat();
          tests.push({...cfg,score:score(p),ioc:ioc(p)});
        }
assert.equal(tests.length,96);
tests.sort((a,b)=>b.score-a.score);
const best=tests[0];
assert(best.score< -3.8);
const selected={operation:"displacement",view:"norm",
  mode:"gp29",pageReset:false,sign:1};
const planted=apply(nativePages,selected,true);
assert.deepEqual(apply(planted,selected,false),nativePages);
const raw=score(original);
assert(Math.abs(raw-(-4.147504344592278))<1e-9);
const correctScore=score(reference);
assert(correctScore > -3.0);
console.log(JSON.stringify({
  classification:"Source-marked Newton field-stream 96-configuration original-negative",
  sourceSHA256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  markedTriads:redTriples,
  field:{generatorOrder:840,sourceSeed15Exponent:690,
    fieldCriticalStates:[{exponent:180,element:13},{exponent:360,element:24}],
    markedNewtonAt15:{value:27,derivative:5,quotient:17,next:27}},
  original:{runes:original.length,rawScore:raw,rawIoC:ioc(original),
    models:tests.length,best,bestFive:tests.slice(0,5),
    markedContinuousNorm:tests.filter(t=>t.operation==="displacement"
      &&t.view==="norm"&&t.mode==="gp29"&&!t.pageReset),
    allExactReencryptions:true},
  independentNative:{runes:reference.length,score:correctScore,ioc:ioc(reference),
    all96ExactPlants:true},
  recoveredUnknownPlaintext:false
},null,2));
