"use strict";

// Historical GIMP 2-D random field sampled at source-exact p55 ink-box centers.
// Run on Windows Node22: node sims/lp2_p55_gimp_field_glyphcenter_sft.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources", "liber-primus");
/** @typedef {{rect:[number,number,number,number],ordinal:number,line:number,gp29_index:number}} Glyph */
/** @type {{glyphs:Glyph[]}} */
const geometry = JSON.parse(fs.readFileSync(path.join(root, "lp2-p55-source-glyph-coordinates.json"), "utf8"));
/** @type {{pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const p54 = corpus.pages.find(p=>p.page===54);
const p55 = corpus.pages.find(p=>p.page===55);
const p57 = corpus.pages.find(p=>p.page===57);
assert.ok(p54 && p55 && p57);
assert.equal(geometry.glyphs.length,76);
assert.equal(p55.indices.length,76);
assert.equal(p57.indices.length,95);
assert.deepEqual(geometry.glyphs.map(x=>x.gp29_index),p55.indices);
assert.deepEqual([...new Set(geometry.glyphs.map(x=>x.line))],[1,2,3,4]);

/** GLib 2.38.2 GRand default version22 MT19937. @param {number} seed */
function mt19937(seed) {
  const state = new Uint32Array(624);
  state[0] = seed >>> 0;
  for(let i=1;i<624;i++){
    state[i]=(Math.imul(1812433253,state[i-1]^(state[i-1]>>>30))+i)>>>0;
  }
  let pointer=624;
  return () => {
    if(pointer===624) {
      for(let j=0;j<624;j++) {
        const y=((state[j]&0x80000000)|(state[(j+1)%624]&0x7fffffff))>>>0;
        state[j]=(state[(j+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0;
      }
      pointer=0;
    }
    let y=state[pointer++];
    y^=y>>>11;
    y^=(y<<7)&0x9d2c5680;
    y^=(y<<15)&0xefc60000;
    y^=y>>>18;
    return y>>>0;
  };
}
const master = mt19937(314159265);
const rowSeeds=Array.from({length:4096},()=>master());
assert.deepEqual(rowSeeds.slice(0,8),[
  3721122731,618219707,807213306,3144837749,
  3447982176,3230631767,755972506,1398685501
]);
const firstRow=mt19937(rowSeeds[0]);
assert.deepEqual(Array.from({length:8},()=>firstRow()),[
  505524582,4277517655,1702989131,912900261,
  1432505218,4108960502,2270003630,316039421
]);

/** @type {Map<number,number[]>} */
const cache=new Map();
/** Each visible glyph center supplies its own zero-based original pixel (x,y).
 * No fitted shift/rotation/seed, no inspected text before choosing sampling.
 * @param {Glyph} glyph @returns {number}
 */
function pixelWord(glyph) {
  const [left,top,right,bottom]=glyph.rect;
  const x=Math.floor((left+right)/2),y=Math.floor((top+bottom)/2);
  assert.ok(x>=0&&x<2400&&y>=0&&y<3600);
  if(!cache.has(y)){
    const next=mt19937(rowSeeds[y&4095]);
    cache.set(y,Array.from({length:2400},()=>next()));
  }
  const arr=cache.get(y);
  assert.ok(arr);
  return arr[x];
}
const words=geometry.glyphs.map(pixelWord);
const mapping={
  raw29: words.map(x=>x%29),
  scaled29:words.map(x=>Math.floor(29*x/4294967296)),
  highByte29:words.map(x=>(x>>>24)%29),
  highByteScaled29:words.map(x=>Math.floor(29*(x>>>24)/256))
};
const stepMappings={
  raw28:words.map(x=>1+x%28),
  scaled28:words.map(x=>1+Math.floor(28*x/4294967296))
};
/** @param {number[]} a @returns {number} */
function ioc(a){
  const n=a.length,counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((sum,c)=>sum+c*(c-1),0)/(n*(n-1));
}
/** @param {number[]} ct @param {number[]} key @param {1|-1} sign @returns {number[]} */
function decode(ct,key,sign){return ct.map((v,i)=>(v+sign*key[i]+58)%29);}
const output={};
const originalPrevious=p54.indices.at(-1);
assert.equal(typeof originalPrevious,"number");
/** @param {number[]} cipher @param {number[]} key @param {1|-1} sign @param {number} previous */
function feedbackDecode(cipher,key,sign,previous){
  return cipher.map((v,i)=>(v-(i?cipher[i-1]:previous)+sign*key[i]+58)%29);
}
/** @param {number[]} plain @param {number[]} key @param {number} previous */
function feedbackEncode(plain,key,previous){
  const cipher=[];
  let prior=previous;
  for(let i=0;i<plain.length;i++){prior=(prior+plain[i]+key[i])%29;cipher.push(prior);}
  return cipher;
}
for(const [name,key] of Object.entries(mapping)){
  const positive=p57.indices.slice(0,76),planted=positive.map((v,i)=>(v+key[i])%29);
  assert.deepEqual(decode(planted,key,-1),positive);
  assert.deepEqual(decode(p55.indices,key,-1).map((v,i)=>(v+key[i])%29),p55.indices);
  const minus=decode(p55.indices,key,-1),plus=decode(p55.indices,key,1);
  const feedbackCipher=feedbackEncode(positive,key,originalPrevious);
  assert.deepEqual(feedbackDecode(feedbackCipher,key,-1,originalPrevious),positive);
  assert.deepEqual(feedbackEncode(feedbackDecode(p55.indices,key,-1,originalPrevious),key,originalPrevious),p55.indices);
  const feedbackMinus=feedbackDecode(p55.indices,key,-1,originalPrevious);
  const feedbackPlus=feedbackDecode(p55.indices,key,1,originalPrevious);
  output[name]={
    minusIoC:ioc(minus),plusIoC:ioc(plus),
    feedbackMinusIoC:ioc(feedbackMinus),feedbackPlusIoC:ioc(feedbackPlus),
    minusOpening:minus.slice(0,14),plusOpening:plus.slice(0,14),
    feedbackMinusOpening:feedbackMinus.slice(0,14)
  };
}
const prior=p54.indices.at(-1);
assert.equal(typeof prior,"number");
const sourceStep=p55.indices.map((v,i)=>(v-(i? p55.indices[i-1]:prior)+29)%29);
const nonzeroSites=sourceStep.map((v,i)=>[v,i]).filter(x=>x[0]!==0);
const stepScores={};
for(const [name,values] of Object.entries(stepMappings)){
  let same=0,inverse=0;
  for(const [v,i] of nonzeroSites){same+=Number(v===values[i]);inverse+=Number(v===29-values[i]);}
  stepScores[name]={same,inverse,expected:nonzeroSites.length/28};
}
const originalIoC=ioc(p55.indices);
assert.ok(originalIoC>=0&&originalIoC<=1);
assert.ok(Object.values(output).every(x=>
  x.minusIoC<0.085 && x.plusIoC<0.085 &&
  x.feedbackMinusIoC<0.085 && x.feedbackPlusIoC<0.085));
assert.ok(Object.values(stepScores).every(x=>x.same<16&&x.inverse<16));
console.log(JSON.stringify({
 source:"Original 2400x3600 LP2 p55 / 72.jpg, 76 original ink boxes",
 glyphs:geometry.glyphs.length,uniqueYRows:cache.size,
 historicSeed:314159265,rootFirstEight:rowSeeds.slice(0,8),originalIoC,
 directGP29:output,originalP54ToP55NonzeroSteps:nonzeroSites.length,
 sourcePixelStepComparisons:stepScores,
 positiveNativeP57Plant:"76/76 correct under each GP29 mapping, both direct and predecessor-cipher feedback",
 decision:"Source-faithful 2-D GIMP pixel-center field does not identify a direct original p55 additive, p54-carry ciphertext-feedback, or nonzero-step key.",
 caution:"Original Cicada does not authorize using GIMP field as LP2 glyph key or prescribe pixel center conversion.",
 status:"PASS"
},null,2));
