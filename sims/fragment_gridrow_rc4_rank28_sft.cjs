"use strict";

/**
 * Original-input GP28 predecessor-exclusion plus fragment-row RC4 test.
 *
 * An original-source 13-dot delimiter starts a new text fragment; each of 32
 * fragments can use the corresponding row of the 32x8 p50 table as an RC4
 * key. This independently testable composition was not covered by earlier
 * GP29 fragment-RC4 or repeating-row GP28 experiments.
 *
 * Node 22 CommonJS, no third-party modules.
 * Run: node sims/fragment_gridrow_rc4_rank28_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {any} */
function json(p) {return JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));}
const corpus=json("resources/liber-primus/lp2-corpus.json");
const ink=json("resources/liber-primus/lp2-ink-annotations.json");
const table=json("resources/liber-primus/base60-grid.json").byte_rows;
const cipher=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(cipher.length,12956);
assert.equal(table.length,32);
assert(table.every(r=>r.length===8&&r.every(v=>Number.isInteger(v)&&v>=0&&v<256)));
const mod=(v,n)=>(v%n+n)%n;

/** Source mark offsets: same-place red and black 13-dot events are distinct. */
const marks=ink.pages.flatMap(p=>(p.large_punctuation||[])
  .filter(m=>m[1]===13).map(m=>({page:p.page,local:m[0]})));
assert.equal(marks.length,31);
const bounds=[0];
let globalOffset=0;
for(const page of corpus.pages){
  for(let local=0;local<=page.indices.length;local++){
    for(const mark of marks)
      if(mark.page===page.page&&mark.local===local) bounds.push(globalOffset);
    if(local<page.indices.length)globalOffset++;
  }
}
bounds.push(globalOffset);
assert.equal(bounds.length,33);
assert.equal(bounds[28],cipher.length);
assert.equal(globalOffset,13136);

let state=31;
const order=[];
do{
  order.push(state);
  let taps=state&18,parity=0;
  while(taps){parity^=taps&1;taps>>>=1;}
  state=((state<<1)&31)|parity;
}while(state!==31);
assert.equal(order.length,31);
order.splice(order.indexOf(16)+1,0,0);
const rotate=mod(order.indexOf(0)-8,32);
const deBruijn=order.slice(rotate).concat(order.slice(0,rotate));
assert.equal(deBruijn[8],0);
const rowOrders={
  printed:Array.from({length:32},(_,i)=>i),
  deBruijn
};

/**
 * Standard RC4 KSA/PRGA, with optional discarded prefix.
 * @param {number[]} key @param {number} n @returns {number[]}
 */
function rc4(key,n){
  const s=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+key[i%key.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  let a=0,b=0;
  const out=new Array(n);
  for(let i=0;i<n;i++){
    a=(a+1)&255;
    b=(b+s[a])&255;
    [s[a],s[b]]=[s[b],s[a]];
    out[i]=s[(s[a]+s[b])&255];
  }
  return out;
}

/**
 * @typedef {{
 *   order:"printed"|"deBruijn",
 *   drop:0|256, project:"mod"|"scaled",
 *   rank:"cyclic"|"sorted", sign:-1|1, skipZero:boolean
 * }} Model
 */

/**
 * Decodes GP29 ciphertext into 29 outputs, with EA(28) as the repeat sentinel.
 * Each fragment's initial rune is a transmitted IV. Its emitted plaintext
 * placeholder is passed unchanged and consumes no key.
 * @param {number[]} values @param {Model} conf
 * @param {boolean} encode @returns {number[]}
 */
function transform(values,conf,encode){
  const out=new Array(values.length);
  const rows=rowOrders[conf.order];
  for(let fragment=0;fragment<28;fragment++){
    const start=bounds[fragment],end=bounds[fragment+1];
    if(start===end)continue;
    const stream=rc4(table[rows[fragment]],conf.drop+end-start);
    out[start]=values[start];
    let used=0;
    for(let i=start+1;i<end;i++){
      const predecessor=encode?out[i-1]:values[i-1];
      const input=values[i];
      const currentCipher=encode?null:input;
      const repeat=encode?input===28:currentCipher===predecessor;
      if(repeat){
        out[i]=encode?predecessor:28;
        if(!conf.skipZero)used++;
        continue;
      }
      const keyByte=stream[conf.drop+used++];
      const key=conf.project==="mod"?keyByte%28:Math.floor(28*keyByte/256);
      if(encode){
        const digit=mod(input+conf.sign*key,28);
        out[i]=conf.rank==="cyclic"?
          mod(predecessor+digit+1,29):
          digit+(digit>=predecessor?1:0);
      }else{
        const digit=conf.rank==="cyclic"?
          mod(input-predecessor-1,29):
          input-(input>predecessor?1:0);
        out[i]=mod(digit-conf.sign*key,28);
      }
    }
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function ioc(values){
  const bins=Array(29).fill(0);
  for(const v of values){assert(v>=0&&v<29);bins[v]++;}
  return bins.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** Native GP source from source-disjoint fixed Shakespeare pages, no word fits. */
function nativeSource(){
  const raw=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
  const s=raw.toUpperCase().replaceAll("QU","CW")
    .replaceAll("V","U").replaceAll("K","C").replaceAll("Z","S");
  const symbols=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let j=0;j<s.length;){
    if(s[j]<"A"||s[j]>"Z"){j++;continue;}
    const hit=symbols.find(x=>s.startsWith(x.s,j));
    assert(hit,"unmapped GP letter "+s[j]);
    out.push(hit.i);
    j+=hit.s.length;
  }
  assert(out.length>30000);
  return out.slice(16000,16000+cipher.length);
}
const models=[];
for(const order of /** @type {Array<Model["order"]>} */ (["printed","deBruijn"]))
  for(const drop of /** @type {Array<Model["drop"]>} */ ([0,256]))
    for(const project of /** @type {Array<Model["project"]>} */ (["mod","scaled"]))
      for(const rank of /** @type {Array<Model["rank"]>} */ (["cyclic","sorted"]))
        for(const sign of /** @type {Array<Model["sign"]>} */ ([-1,1]))
          for(const skipZero of [false,true])
            models.push({order,drop,project,rank,sign,skipZero});
assert.equal(models.length,64);
const half=Math.floor(cipher.length/2);
const tested=models.map(model=>{
  const decoded=transform(cipher,model,false);
  assert.deepEqual(transform(decoded,model,true),cipher);
  return {model,train:ioc(decoded.slice(0,half)),
    withheld:ioc(decoded.slice(half)),
    preview:decoded.slice(0,60).map(x=>corpus.translit[x]).join("")};
}).sort((a,b)=>b.withheld-a.withheld);
assert(tested.every(x=>x.withheld<0.041),"original withheld source-language signal");

// Blind exact hidden-mode selection on a distinct genuine English source.
const trueMode={order:"deBruijn",drop:256,project:"scaled",
  rank:"sorted",sign:-1,skipZero:true};
const english=nativeSource();
assert.equal(english.length,cipher.length);
const plant=transform(english,trueMode,true);
const plantCandidates=models.map(model=>{
  const value=transform(plant,model,false);
  return {model,train:ioc(value.slice(0,half)),
    withheld:ioc(value.slice(half)),
    recovered:value.reduce((n,v,i)=>n+(v===english[i]),0)};
}).sort((a,b)=>b.train-a.train);
assert.deepEqual(plantCandidates[0].model,trueMode);
assert.equal(plantCandidates[0].recovered,cipher.length);
assert.deepEqual(transform(english,trueMode,true),plant);
assert(plantCandidates[0].withheld>0.05);
console.log(JSON.stringify({
  source:{unsolvedRunes:cipher.length,marks:marks.length,
    fragments:32,first28RuneLimit:bounds[28],gridShape:"32x8",
    sampleBoundaries:bounds.slice(0,12)},
  family:"fragment row keyed RC4 x two GP28 predecessor-exclusion ranks",
  models:models.length,
  original:{rawIoC:ioc(cipher),maxWithheld:tested[0],
    minWithheld:tested[tested.length-1].withheld,plaintextRecovered:false},
  planted:{trueMode,rankedFirst:true,recovered:plantCandidates[0].recovered,
    withheldIoC:plantCandidates[0].withheld,exactReencryption:true},
  decision:"No original GP-native plaintext under this frozen 64-mode family"
},null,2));
