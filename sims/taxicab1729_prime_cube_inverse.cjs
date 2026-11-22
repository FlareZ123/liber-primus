"use strict";
/**
 * Source-constrained original-LP2 1729-rune cube inversion.
 * p8-p14 exactly 1729 = 9^3+10^3 = 1^3+12^3. Try the six spatial
 * axis read orders on each cube, the two cube orders, reversal,
 * and the authenticated LP2 prime-totient GP29 additive family.
 * This finite test does not assert that either cube layout was intended.
 * Reproduce: node sims/taxicab1729_prime_cube_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ciphertext = corpus.pages.slice(8,15).flatMap(p => p.indices);
assert.equal(ciphertext.length,1729);
const mod29 = a => (a%29+29)%29;
const phiPrime = [];
for(let p=2;phiPrime.length<1730;p++){
 let prime=true;
 for(let f=2;f*f<=p;f++)if(p%f===0){prime=false;break;}
 if(prime)phiPrime.push((p-1)%29);
}
const axes=[[0,1],[0,2],[1,0],[1,2],[2,0],[2,1]];
/** @param {number[]} src @param {number} n @param {number} a @param {number} b @param {boolean} flipped */
function rearrange(src,n,a,b,flipped){
 assert.equal(src.length,n*n*n);
 const out=new Array(src.length);
 for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++){
  const co=[x,y,z],dst=(x*n+y)*n+z;
  const idx=(co[a]*n+co[b])*n+co[3-a-b];
  out[dst]=src[flipped?src.length-1-idx:idx];
 }
 return out;
}
/** @param {number[]} processed @param {number} n @param {number} a @param {number} b @param {boolean} flipped */
function undoRearrange(processed,n,a,b,flipped){
 const out=new Array(processed.length);
 for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++){
  const co=[x,y,z],src=(x*n+y)*n+z;
  const idx=(co[a]*n+co[b])*n+co[3-a-b];
  out[flipped?processed.length-1-idx:idx]=processed[src];
 }
 return out;
}
/** @param {number[]} xs */
function ioc(xs){
 const counts=Array(29).fill(0);
 for(const x of xs)counts[x]++;
 return counts.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));
}
/** @param {number[]} ct @param {object} o */
function decrypt(ct,o){
 const {ns,swapped,axis1,axis2,flipped,reset,sign,skipF}=o;
 const sizes=swapped?[ns[1],ns[0]]:ns;
 const split=sizes[0]**3;
 const src=rearrange(ct.slice(0,split),sizes[0],...axis1,flipped)
  .concat(rearrange(ct.slice(split),sizes[1],...axis2,flipped));
 let index=0;
 return src.map((c,i)=>{
  if(reset&&i===split)index=0;
  if(skipF&&c===0)return 0;
  return mod29(c+sign*phiPrime[index++]);
 });
}
/** @param {number[]} plain @param {object} o */
function encrypt(plain,o){
 const {ns,swapped,axis1,axis2,flipped,reset,sign,skipF}=o;
 const sizes=swapped?[ns[1],ns[0]]:ns,split=sizes[0]**3;
 const source=[];
 let index=0;
 for(let i=0;i<plain.length;i++){
  if(reset&&i===split)index=0;
  const p=plain[i];
  if(skipF&&p===0)source.push(0);
  else source.push(mod29(p-sign*phiPrime[index++]));
 }
 return undoRearrange(source.slice(0,split),sizes[0],...axis1,flipped)
  .concat(undoRearrange(source.slice(split),sizes[1],...axis2,flipped));
}
/** @param {number[]} input */
function scan(input){
 let total=0,best=null,aboveFivePercent=0,positiveKeyRank=null;
 for(const ns of [[9,10],[1,12]])for(const swapped of [false,true])
 for(const axis1 of axes)for(const axis2 of axes)for(const flipped of [false,true])
 for(const reset of [true,false])for(const sign of [-1,1])for(const skipF of [false,true]){
  const cfg={ns,swapped,axis1,axis2,flipped,reset,sign,skipF};
  const score=ioc(decrypt(input,cfg));total++;
  if(score>0.05)aboveFivePercent++;
  if(!best||score>best.ioc)best={ioc:score,config:cfg};
  if(JSON.stringify(cfg)===JSON.stringify(plantConfig))positiveKeyRank={ioc:score};
 }
 return {models:total,best,aboveFivePercent,knownPlantScore:positiveKeyRank?.ioc};
}
const translits=corpus.translit.map((v,i)=>({value:v,index:i})).sort((a,b)=>b.value.length-a.value.length);
const normalized=read("resources/control/shakespeare_first300k.txt").toUpperCase().replace(/[^A-Z]/g,"");
const plain=[];
for(let i=0;i<normalized.length&&plain.length<1729;){
 let matched=false;
 for(const token of translits){
  if(normalized.startsWith(token.value,i)){plain.push(token.index);i+=token.value.length;matched=true;break;}
 }
 if(!matched){const substitutes={K:"C",Q:"C",V:"U",Z:"S"};plain.push(corpus.translit.indexOf(substitutes[normalized[i]]||"S"));i++;}
}
assert.equal(plain.length,1729);
const plantConfig={ns:[9,10],swapped:false,axis1:[1,0],axis2:[0,2],flipped:true,reset:true,sign:-1,skipF:false};
const planted=encrypt(plain,plantConfig);
assert.deepEqual(decrypt(planted,plantConfig),plain);
const original=scan(ciphertext);
const synthetic=scan(planted);
assert.equal(original.models,2304);
assert.equal(synthetic.models,2304);
assert.ok(synthetic.best.ioc>=synthetic.knownPlantScore);
assert.ok(original.best.ioc<0.05);
console.log(JSON.stringify({
 hypothesis:"Two taxicab cube decompositions of p8-p14 with exact LP2 solved-page prime-totient pad",
 sourcePages:"p8-p14",runes:1729,originalRawIoC:ioc(ciphertext),
 original,positive:{source:"1729 GP-English Shakespeare tokens from checked-in reference",
 trueSourceIoC:ioc(plain),exactRoundtrip:1729,
  ...synthetic},
 caveat:"Conditional GP29 source-cube and direct totient-family inverse. No recovered original unknown plaintext or key."
},null,2));
