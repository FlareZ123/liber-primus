"use strict";
/**
 * Full 29^3 cubic source-factor starting-state search on original LP2.
 * Native GP-Shakespeare is independent; page0 is the key-fit interval and
 * page1 is an unmodified held-out original prediction.
 * Node 22: node sims/grid_cubic_allseed_original_lm_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=json("resources/liber-primus/lp2-corpus.json");
const p0=corpus.pages.find(p=>p.page===0).indices;
const p1=corpus.pages.find(p=>p.page===1).indices;
assert.equal(p0.length,262);assert.equal(p1.length,266);
const english=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
/** Existing repository Gematria normalization with greedy digraphs.
 * @param {string} text @returns {number[]} */
function gpEncode(text){
  const map=new Map(corpus.translit.map((s,i)=>[s,i])),out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=word.slice(i,i+2);
      if(map.has(pair)){out.push(map.get(pair));i+=2;}
      else {if(map.has(word[i]))out.push(map.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gpEncode(english);
assert(gp.length>200000);
const train=gp.slice(0,100000);
const t=new Uint32Array(29**3),b=new Uint32Array(29**2);
for(let i=2;i<train.length;i++){
  t[train[i-2]*841+train[i-1]*29+train[i]]++;
  b[train[i-2]*29+train[i-1]]++;
}
const lm=new Float64Array(29**3);
for(let a=0;a<29;a++)for(let b0=0;b0<29;b0++)for(let c=0;c<29;c++){
  const j=a*841+b0*29+c;
  lm[j]=Math.log((t[j]+.25)/(b[a*29+b0]+7.25));
}
/** @param {number} x @returns {number} */
function mod(x){return ((x%29)+29)%29;}
const length=p0.length+p1.length;
/** Source-factor recurrence: s[i+3]=-24s[i]-16s[i+1]-14s[i+2].
 * @param {number} a @param {number} b0 @param {number} c @returns {Uint8Array} */
function pad(a,b0,c){
  const out=new Uint8Array(length);out[0]=a;out[1]=b0;out[2]=c;
  for(let i=3;i<length;i++)out[i]=mod(-24*out[i-3]-16*out[i-2]-14*out[i-1]);
  return out;
}
/** @param {number[]} cipher @param {Uint8Array} stream
 * @param {number} sign @param {number} start @returns {Uint8Array} */
function decode(cipher,stream,sign,start){
  const out=new Uint8Array(cipher.length);
  for(let i=0;i<out.length;i++)out[i]=mod(cipher[i]+sign*stream[i+start]);
  return out;
}
/** @param {ArrayLike<number>} a @returns {number} */
function score(a){
  let sum=0;
  for(let i=2;i<a.length;i++)sum+=lm[a[i-2]*841+a[i-1]*29+a[i]];
  return sum/(a.length-2);
}
const candidates=[];
for(const sign of [-1,1])for(let a=0;a<29;a++)for(let b0=0;b0<29;b0++)for(let c=0;c<29;c++){
  candidates.push({sign,seed:[a,b0,c],training:score(decode(p0,pad(a,b0,c),sign,0))});
}
assert.equal(candidates.length,48778);
candidates.sort((x,y)=>y.training-x.training);
const best=candidates[0],bestPad=pad(...best.seed);
assert.equal(best.sign,-1);
assert.deepEqual(best.seed,[22,6,27]);
assert(Math.abs(best.training-(-3.891812576215245))<1e-12);
const testContinuous=score(decode(p1,bestPad,best.sign,p0.length));
const testReset=score(decode(p1,bestPad,best.sign,0));
assert(Math.abs(testContinuous-(-4.172874538726274))<1e-12);
assert(Math.abs(testReset-(-4.141698859472946))<1e-12);
const dec0=decode(p0,bestPad,best.sign,0);
assert.deepEqual(Array.from(dec0,(x,i)=>mod(x-best.sign*bestPad[i])),p0);
// Native GP plant uses a disjoint Shakespeare tail and a hidden true seed.
const plant=gp.slice(150000,150000+length),trueSeed=[5,8,13],truePad=pad(...trueSeed);
assert.equal(plant.length,length);
const encrypted=plant.map((x,i)=>mod(x-truePad[i]));
const trueScore=score(plant.slice(0,p0.length));
let superior=0;
for(let a=0;a<29;a++)for(let b0=0;b0<29;b0++)for(let c=0;c<29;c++){
  const plaintext=decode(encrypted.slice(0,p0.length),pad(a,b0,c),1,0);
  if(score(plaintext)>trueScore+1e-12)superior++;
}
assert.equal(superior,0);
assert.deepEqual(Array.from(decode(encrypted.slice(0,p0.length),truePad,1,0)),plant.slice(0,p0.length));
assert.deepEqual(Array.from(decode(encrypted.slice(p0.length),truePad,1,p0.length)),plant.slice(p0.length));
console.log(JSON.stringify({
  original_train:p0.length,original_holdout:p1.length,
  searched_state_sign_pairs:candidates.length,unique_states:29**3,
  best_original:{...best,p1_continuous:testContinuous,p1_reset:testReset},
  native_control:{seed:trueSeed,p0_score:trueScore,p1_score:score(plant.slice(p0.length)),rival_states:superior},
  original_raw_p0:score(p0),original_raw_p1:score(p1),
  original_roundtrip:true,native_roundtrip:true,recovered_unknown_plaintext:false
},null,2));
