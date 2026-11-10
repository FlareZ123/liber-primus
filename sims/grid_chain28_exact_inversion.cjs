"use strict";
/**
 * Exact 28-state chain-cipher inversion against LP2's eight printed 256-bit
 * grid columns. A chain step 0 is hypothesized to represent GP EA (28);
 * every other step is 1+(plaintext+keystream) mod 28.
 * This is a falsifiable candidate model, never an established Cicada cipher.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {encode} = require("./word_partition_invariant.cjs");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/base60-grid.json"),"utf8"));
const pages = corpus.pages.filter(p=>p.status==="unsolved" && p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
const original = pages.flat();
assert.equal(original.length,12956);
const groups=[729,1145,1729,1903,1021,1524,1589,3316];
const spans=[]; let position=0;
for(const n of groups){spans.push([position,position+n]);position+=n;}
assert.equal(position,12956);
const ivs={
  "zero": "00000000000000000000000000000000",
  "square-row": "ba9650decee3e216d8dee0a8a4b6c41c",
  "square-complement": "2b4f9507170203cf0d07053dbf2f21c9",
  "square-spiral": "e3e2e0ded8ceba9650de16a81cc4b6a4",
  "square-spiral-complement": "020305070d172b4f9507cf3dc9212fbf"
};
const columns=Array.from({length:8},(_,col)=>Buffer.from(grid.byte_rows.map(row=>row[col])));
assert(columns.every(key=>key.length===32));
const sample=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const training=sample.slice(0,240000).toUpperCase().match(/[A-Z]+/g).map(encode);
const withheld=sample.slice(240000).toUpperCase().match(/[A-Z]+/g).map(encode);
const count=Array(28).fill(0.5);
for(const w of training)for(const p of w)if(p<28)count[p]++;
const total=count.reduce((x,y)=>x+y,0);
const logOdds=count.map(c=>Math.log(28*c/total));
function rand(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function sourcePlant(){
  const raw=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const {parseLP2Words}=require("./lp2_word_pages.cjs");
  const lengths=parseLP2Words(raw).words.map(w=>w.length);
  assert.equal(lengths.length,2896);
  const trainBin=Array.from({length:32},()=>[]),heldBin=Array.from({length:32},()=>[]);
  for(const w of training)if(w.length<32)trainBin[w.length].push(w);
  for(const w of withheld)if(w.length<32)heldBin[w.length].push(w);
  let fallback=0;const rng=rand(0x5e330115);
  const text=lengths.map(n=>{
    const pool=heldBin[n].length?heldBin[n]:trainBin[n];
    if(!heldBin[n].length)fallback++;
    assert(pool.length,"No source GP words of length "+n);
    return pool[Math.floor(rng()*pool.length)];
  }).flat();
  assert.equal(text.length,original.length);
  return {text,fallback};
}
/** AES-256-CTR output with an explicit byte-to-28 rule and no hidden seed. */
function pad(key,iv,map,direction,n){
  const k=direction==="reverse"?Buffer.from(key).reverse():key;
  const enc=crypto.createCipheriv("aes-256-ctr",k,Buffer.from(iv,"hex"));
  const bytes=enc.update(Buffer.alloc(map==="reject"?n*2:n));
  const out=[];
  for(const b of bytes){
    if(map==="reject" && b>=252)continue;
    out.push(map==="scale"?Math.floor(b*28/256):b%28);
    if(out.length===n)break;
  }
  assert.equal(out.length,n);
  return out;
}
/** Decode one grouped section from the original ciphertext. */
function decode(cipher,span,stream,sign,advanceZero,output=false){
  let j=0,score=0,count=0,valid=0;
  const plain=output?[]:null;
  for(let i=span[0]+1;i<span[1];i++){
    const step=(cipher[i]-cipher[i-1]+29)%29;
    if(step===0){if(advanceZero)j++;if(output)plain.push(28);continue;}
    const p=(step-1+sign*stream[j]+56)%28;
    score+=logOdds[p];count++;j++;
    if(output)plain.push(p);
  }
  return {score,count,mean:score/count,plain};
}
function maxAssignment(matrix){
  const scores=Array(256).fill(-Infinity),paths=Array(256).fill(null);
  scores[0]=0;paths[0]=[];
  for(let mask=0;mask<256;mask++){
    if(!Number.isFinite(scores[mask]))continue;
    const row=paths[mask].length;
    if(row===8)continue;
    for(let key=0;key<8;key++)if(!(mask&(1<<key))){
      const next=mask|(1<<key),v=scores[mask]+matrix[row][key];
      if(v>scores[next]){scores[next]=v;paths[next]=[...paths[mask],key];}
    }
  }
  return {score:scores[255],assignment:paths[255]};
}
function search(cipher){
  const candidates=[];
  for(const [name,iv] of Object.entries(ivs))
  for(const direction of ["forward","reverse"])
  for(const map of ["mod","scale","reject"])
  for(const sign of [-1,1])
  for(const advanceZero of [false,true]){
    const streams=columns.map(key=>pad(key,iv,map,direction,3400));
    const matrix=spans.map(span=>streams.map(stream=>decode(cipher,span,stream,sign,advanceZero).score));
    const best=maxAssignment(matrix);
    candidates.push({iv:name,direction,map,sign,advanceZero,...best,
      meanLogOdds:best.score/12862});
  }
  return candidates.sort((a,b)=>b.score-a.score);
}
function generate(plaintext){
  const trueSetting={iv:"square-spiral-complement",direction:"forward",map:"reject",
    sign:-1,advanceZero:true,assignment:[0,1,2,3,4,5,6,7]};
  const iv=ivs[trueSetting.iv],streams=columns.map(key=>pad(key,iv,trueSetting.map,trueSetting.direction,3400));
  const out=Array(plaintext.length).fill(0);
  let zero=0;
  for(let g=0;g<spans.length;g++){
    const [start,end]=spans[g],stream=streams[g];
    out[start]=original[start];
    let j=0;
    for(let i=start+1;i<end;i++){
      const p=plaintext[i];
      const step=p===28?0:1+((p-trueSetting.sign*stream[j]+28)%28);
      out[i]=(out[i-1]+step)%29;
      if(p===28)zero++;
      j++;
    }
  }
  return {out,trueSetting,zero};
}
function main(){
  const real=search(original);
  const plant=sourcePlant();
  const encoded=generate(plant.text);
  const synthetic=search(encoded.out);
  const best=synthetic[0];
  const wanted=encoded.trueSetting;
  assert.equal(best.iv,wanted.iv);
  assert.equal(best.map,wanted.map);
  assert.equal(best.sign,wanted.sign);
  assert.equal(best.direction,wanted.direction);
  assert.equal(best.advanceZero,wanted.advanceZero);
  assert.deepEqual(best.assignment,wanted.assignment);
  let correct=0,decoded=0;
  const streams=columns.map(key=>pad(key,ivs[wanted.iv],wanted.map,wanted.direction,3400));
  for(let g=0;g<8;g++){
    const r=decode(encoded.out,spans[g],streams[g],wanted.sign,wanted.advanceZero,true);
    for(let j=0;j<r.plain.length;j++){
      const i=spans[g][0]+1+j;
      if(r.plain[j]===plant.text[i])correct++;
      decoded++;
    }
  }
  assert.equal(correct,decoded);
  console.log(JSON.stringify({
    model:"28-state GP-EA-exception ciphertext difference chain with AES256-CTR grid-column keys",
    original:{runes:original.length,groups,nonzeroSteps:original.length-8-
      spans.reduce((n,[a,b])=>n+Array.from({length:b-a-1},(_,j)=>Number(original[a+j+1]===original[a+j])).reduce((x,y)=>x+y,0),0),
      searchedSettings:120,best:real.slice(0,5)},
    positive:{sourceWords:2896,withheldFallbackWords:plant.fallback,zeroSteps:encoded.zero,
      top:best,exactRecovered:correct,totalDecoded:decoded,runnerUp:synthetic[1]},
    conclusion:"No original plaintext or verified key is claimed; compare original mean log odds against correctly recovered independent planted English."
  },null,2));
}
if(require.main===module)main();
module.exports={pad,decode,maxAssignment,search,generate};
