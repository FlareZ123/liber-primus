"use strict";

/**
 * Lossless, fully reversible permutation repair inspired by LP2's word-local
 * lag6 affine echoes, S-specific lag5 echoes, and lag5 echo bursts.
 *
 * At each noninitial ciphertext position, plaintext EA(28) maps to Cprev.
 * The other 28 GP indices map bijectively to Cprev+15^P mod29, then apply
 * context-conditioned swaps to force plausible common source rune channels
 * onto source-determined ciphertext echo targets.
 *
 * S=GP index15 is independently selected by the existing red-ink page40
 * quotient and 15 is the primitive root of F29. T6=24-2*C[i-6] mod29
 * uses 3301 mod29 =24, from the original ciphertext affinity. The S5
 * E-channel and lag5-continuation switches are exploratory; model selection
 * on these known anomalies does not authenticate historical encryption.
 */
const fs=require("node:fs"),path=require("node:path");
const {encodeGP}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const dataset=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcript=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const english=encodeGP(fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8"));
const pages=dataset.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const source=pages.flat(),runemap=new Map(dataset.runes.map((r,i)=>[r,i]));
const wordpos=[],sourceR=[];
let offset=0;
for(const glyph of transcript.split("%").slice(0,55).join("%")){
  if(runemap.has(glyph)){
    sourceR.push(runemap.get(glyph));
    wordpos.push(offset++);
  }else if(glyph==="%"||glyph==="/"||/\s/u.test(glyph)){
    // Keep word active across original physical page and printed line.
  }else offset=0;
}
if(sourceR.length!==source.length||source.some((v,i)=>v!==sourceR[i]))
  throw new Error("canonical word/GP rune transcript mismatch");
const pageInitial=new Uint8Array(source.length);
for(let i=0;i<pages.length;i++){
  const index=pages.slice(0,i).reduce((a,p)=>a+p.length,0);
  pageInitial[index]=1;
}
const powers=[];
for(let i=0,v=1;i<28;i++){powers.push(v);v=v*15%29;}
const mod29=n=>(n%29+29)%29;
/**
 * Return all 28 output runes assigned to plaintext GP indices 0..27.
 * @param {number[]} cipher
 * @param {number} i
 * @param {number} variant 0=none,1=T6,2=T6+S5,3=+lag5 echo continuation.
 */
function assignment(cipher,i,variant){
  const prev=cipher[i-1];
  const out=powers.map(d=>(prev+d)%29);
  if(variant>=1&&wordpos[i]>=6){
    const goal=mod29(24-2*cipher[i-6]);
    if(goal!==prev){
      const other=out.indexOf(goal);
      [out[15],out[other]]=[out[other],out[15]];
    }
  }
  if(variant>=2&&wordpos[i]>=5&&cipher[i-5]===15&&prev!==15){
    const preimage=out.indexOf(15);
    // Preserve the S->T6 anchor whenever T6 happens to equal visible S.
    if(preimage!==15)[out[18],out[preimage]]=[out[preimage],out[18]];
  }
  if(variant>=3&&wordpos[i]>=6&&
      cipher[i-1]===cipher[i-6]&&cipher[i-5]!==prev){
    const old=cipher[i-5],preimage=out.indexOf(old);
    if(preimage!==15)[out[18],out[preimage]]=[out[preimage],out[18]];
  }
  return out;
}
/** @param {number[]} plain @param {number} variant */
function encrypt(plain,variant){
  const cipher=[];
  for(let i=0;i<plain.length;i++){
    if(pageInitial[i]){cipher.push(plain[i]);continue;}
    cipher.push(plain[i]===28?cipher[i-1]:
      assignment(cipher,i,variant)[plain[i]]);
  }
  return cipher;
}
/** @param {number[]} cipher @param {number} variant */
function decrypt(cipher,variant){
  const plain=[];
  for(let i=0;i<cipher.length;i++){
    if(pageInitial[i]){plain.push(cipher[i]);continue;}
    plain.push(cipher[i]===cipher[i-1]?28:
      assignment(cipher,i,variant).indexOf(cipher[i]));
  }
  return plain;
}
/** @param {number[]} cipher */
function features(cipher){
  let t6=0,s5=0,lag5=0,paired=0,duplicates=0,eligible6=0,eligible5=0,sExposures=0;
  for(let i=1;i<cipher.length;i++){
    if(!pageInitial[i]&&cipher[i]===cipher[i-1])duplicates++;
    if(wordpos[i]>=5){
      eligible5++;
      lag5+=Number(cipher[i]===cipher[i-5]);
      if(cipher[i-5]===15){
        sExposures++;
        s5+=Number(cipher[i]===15);
      }
    }
    if(wordpos[i]>=6){
      eligible6++;
      t6+=Number(cipher[i]===mod29(24-2*cipher[i-6]));
      paired+=Number(cipher[i]===cipher[i-5]&&cipher[i-1]===cipher[i-6]);
    }
  }
  return {t6,eligible6,s5,sExposures,lag5,eligible5,paired,duplicates};
}
/** @param {number[]} data */
function ioc(data){
  const c=new Uint16Array(29);
  for(const d of data)c[d]++;
  let sum=0;for(const n of c)sum+=n*(n-1);
  return sum/(data.length*(data.length-1));
}
/** @param {number} seed */
function random(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
function main(){
  const original=features(source);
  const all=[];
  const randomStart=random(0x3301e653);
  for(let variant=0;variant<=3;variant++){
    const decoded=decrypt(source,variant);
    let inferredT6S=0,inferredS5E=0;
    for(let i=1;i<source.length;i++){
      if(wordpos[i]>=6&&source[i]===mod29(24-2*source[i-6]))
        inferredT6S+=Number(decoded[i]===15);
      if(wordpos[i]>=5&&source[i-5]===15&&source[i]===15)
        inferredS5E+=Number(decoded[i]===18);
    }
    const stats=[];
    let exactCount=0;
    for(let replicate=0;replicate<160;replicate++){
      const start=randomStart()%(english.length-source.length);
      const plain=english.slice(start,start+source.length);
      const cipher=encrypt(plain,variant);
      if(decrypt(cipher,variant).every((v,i)=>v===plain[i]))exactCount++;
      stats.push(features(cipher));
    }
    const descriptors={};
    for(const metric of ["t6","s5","lag5","paired","duplicates"]){
      const values=stats.map(x=>x[metric]);
      const mean=values.reduce((s,v)=>s+v,0)/values.length;
      const variance=values.reduce((s,v)=>s+(v-mean)**2,0)/values.length;
      descriptors[metric]={mean,sd:Math.sqrt(variance),min:Math.min(...values),
        max:Math.max(...values)};
    }
    all.push({variant,originalDecodedIoC:ioc(decoded),
      originalConditionalPlainSAtT6:inferredT6S,
      originalConditionalPlainEAtS5:inferredS5E,
      sourcePlants:160,exactInversePlants:exactCount,
      plantMeanAndRange:descriptors});
  }
  console.log(JSON.stringify({inputRunes:source.length,canonicalWordCount:2896,
    originalCipherFeatures:original,
    models:all},null,2));
  if(all.some(x=>x.exactInversePlants!==160)||source.length!==12956)
    throw new Error("lossless source control failed");
}
if(require.main===module)main();
module.exports={assignment,encrypt,decrypt,features,ioc};
