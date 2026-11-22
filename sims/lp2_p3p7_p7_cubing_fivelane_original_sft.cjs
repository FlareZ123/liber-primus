"use strict";
/**
 * Five-lane nonlinear GF29 cubic-feedback source experiment on original p3–p7.
 * Authenticated inputs: original red-word GP29 products [11,26,8,15,2],
 * GP29 modulus29, and cubic orbit completed by original p8 red M19.
 *
 * Explicit four no-fit reversible conventions for adding/cubing the source
 * state; state advances once per original five-rune block. Evaluate first
 * 300 cipher runes and untrained next200 without parameter changes.
 *
 * Windows11 Node22: node sims/lp2_p3p7_p7_cubing_fivelane_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const pages=corpus.pages;
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const book=pages.filter(p=>p.page>=3&&p.page<=7).flatMap(p=>p.indices);
assert.equal(book.length,1145);
const red=ink.pages.find(p=>p.page===7).red_spans.at(-1);
assert.equal(red.start,194);
assert.equal(red.length,14);
const symbols=pages.find(p=>p.page===7).indices.slice(red.start,red.start+red.length);
assert.equal(symbols.length,14);
const sizes=[2,4,3,2,3],offsets=[0,2,6,9,11];
const seed=sizes.map((n,i)=>symbols.slice(offsets[i],offsets[i]+n)
 .reduce((v,x)=>v*x%29,1));
assert.deepEqual(seed,[11,26,8,15,2]);
const p8red=ink.pages.find(p=>p.page===8).red_spans[0];
const red8=pages.find(p=>p.page===8).indices.slice(p8red.start,p8red.start+p8red.length);
assert.equal(red8[3],19);
const mod=x=>(x%29+29)%29;
/** @param {number} base @param {number} exponent */
function pow(base,exponent) {
 let r=1;for(let k=0;k<exponent;k++)r=r*base%29;
 return r;
}
for(let x=0;x<29;x++)assert.equal(pow(pow(x,3),19),x);
const orbit=[2,8,19,15,11,26,2];
for(let i=0;i<orbit.length-1;i++)
 assert.equal(pow(orbit[i],3),orbit[i+1]);
/**
 * mode 0: C=(P+S)^3, inversion P=C^19-S
 * mode 1: C=P+S^3, inversion P=C-S^3
 * mode 2: C=P^3+S, inversion P=(C-S)^19
 * mode 3: C=(P+S^3)^3, inversion P=C^19-S^3
 *
 * In every mode the private lane register S updates by S<-S^3 every
 * FIVE consumed original rune positions, without resets at page breaks.
 * @param {number[]} input @param {number[]} initial
 * @param {number} mode @param {boolean} decrypt
 */
function transport(input,initial,mode,decrypt){
 const out=[],state=initial.slice();
 for(let i=0;i<input.length;i++){
  const j=i%5,x=input[i],s=state[j],s3=pow(s,3);
  let y;
  if(mode===0)y=decrypt?mod(pow(x,19)-s):pow(mod(x+s),3);
  if(mode===1)y=decrypt?mod(x-s3):mod(x+s3);
  if(mode===2)y=decrypt?pow(mod(x-s),19):mod(pow(x,3)+s);
  if(mode===3)y=decrypt?mod(pow(x,19)-s3):pow(mod(x+s3),3);
  out.push(y);
  if(j===4)for(let k=0;k<5;k++)state[k]=pow(state[k],3);
 }
 return out;
}
/** @param {number[]} seq */
function ioc(seq){
 const h=new Uint16Array(29);for(const x of seq)h[x]++;
 return [...h].reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
const nativeRunes=[...native.sections.map(x=>x.source_text).join("")]
 .filter(r=>runeMap.has(r)).map(x=>runeMap.get(x));
assert(nativeRunes.length>=1145);
const plant=nativeRunes.slice(0,book.length);
const wrongSeed=seed.slice(1).concat(seed[0]);
const output=[];
for(let mode=0;mode<4;mode++){
 const decoded=transport(book,seed,mode,true);
 assert.deepEqual(transport(decoded,seed,mode,false),book);
 const encrypted=transport(plant,seed,mode,false);
 assert.deepEqual(transport(encrypted,seed,mode,true),plant,
  "authentic source-GP control must be recovered completely");
 const wrong=transport(encrypted,wrongSeed,mode,true);
 const wrongMatches=wrong.reduce((n,x,i)=>n+(x===plant[i]),0);
 assert(wrongMatches<plant.length/8);
 const score={mode,train300:ioc(decoded.slice(0,300)),
  heldout200:ioc(decoded.slice(300,500)),whole1145:ioc(decoded),
  nativeTrain300:ioc(plant.slice(0,300)),
  nativeHeldout200:ioc(plant.slice(300,500)),
  wrongKeyMatches:wrongMatches,
  sourceFirst40:decoded.slice(0,40).map(x=>corpus.translit[x]).join(" ")};
 assert(score.train300<0.047);
 assert(score.heldout200<0.047);
 assert(score.nativeTrain300>0.05);
 assert(score.nativeHeldout200>0.05);
 output.push(score);
}
console.log("PASS "+JSON.stringify({sourceScroll:"physical p3–7",runes:book.length,
 sourceP7Products:seed,cubicOrbit:orbit,sourceP8RedM:19,
 originalIoC:ioc(book),nativePositiveIc:ioc(plant),
 fourExactSourceConventions:output,
 excluded:"these exact low-state cubing/rune transport conventions",
 remaining:"source does not select any nonlinear rune receiver or its IV/clock; no unknown plaintext"}));
