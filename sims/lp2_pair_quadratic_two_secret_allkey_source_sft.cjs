"use strict";

/**
 * GP29 two-rune triangular quadratic mixing: exact ALL-SECRET marginal gate.
 * SFT: node sims/lp2_pair_quadratic_two_secret_allkey_source_sft.cjs
 *
 * Forward:  C0 = P0 + a*P1^2 + k  (mod 29)
 *           C1 = P1 + b*C0^2 + l (mod 29)
 * Inverse:  P1 = C1 - b*C0^2 - l  (mod 29)
 *           P0 = C0 - a*P1^2 - k (mod 29)
 *
 * For any a,b,k,l in GF29, decoded coordinate P1 depends only on b,l,
 * and varying l is a cyclic relabeling. The sorted frequency histogram
 * therefore cannot depend on ANY of a,k,l. Scan b=0..28 and both phases:
 * this EXACTLY bounds all 29^4 secret keys for the decoded second coordinate.
 * No first-party author instruction selects this family or a specific key.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root=path.join(__dirname,"..");
/** @param {string} source */
const read=(source)=>fs.readFileSync(path.join(root,source),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=[
  {name:"p16–p21 training",indices:corpus.pages.slice(16,22).flatMap(x=>x.indices),expected:1613},
  {name:"p40–p45 withheld",indices:corpus.pages.slice(40,46).flatMap(x=>x.indices),expected:1593}
];
original.forEach(region=>assert.equal(region.indices.length,region.expected));
const gpTokens=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index}))
  .sort((a,b)=>b.token.length-a.token.length);

/** @param {number} x */
const mod29=(x)=>(x%29+29)%29;
/** @param {string} raw @returns {number[]} */
function encodeWord(raw){
  const word=raw.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  const runes=[];
  for(let i=0;i<word.length;){
    const unit=gpTokens.find(item=>word.startsWith(item.token,i));
    if(!unit)return [];
    runes.push(unit.index);
    i+=unit.token.length;
  }
  return runes;
}
const gibran=read("resources/control/gibran_prophet_58585.txt");
const begin=gibran.indexOf("*** START OF");
const end=gibran.indexOf("*** END OF");
assert(begin>0 && end>begin);
const gibranNative=(gibran.slice(begin,end).match(/[A-Za-z]+/g)||[]).flatMap(encodeWord);
assert(gibranNative.length>40000);

/** @param {number[]} values */
function top12(values){
  const bins=Array(29).fill(0);
  values.forEach(v=>{assert(Number.isInteger(v)&&v>=0&&v<29);bins[v]++;});
  return bins.sort((a,b)=>b-a).slice(0,12).reduce((s,n)=>s+n,0);
}
/** @param {number[]} values @param {0|1} phase */
function secondCoordinates(values,phase){
  const out=[];
  for(let i=phase;i+1<values.length;i+=2)out.push(values[i+1]);
  return out;
}
/** @param {number[]} cipher @param {number} b @param {0|1} phase */
function decodedSecond(cipher,b,phase){
  const output=[];
  for(let i=phase;i+1<cipher.length;i+=2)
    output.push(mod29(cipher[i+1]-b*cipher[i]*cipher[i]));
  return output;
}

/** @param {number[]} text @param {{a:number,b:number,k:number,l:number}} params @param {0|1} phase */
function encrypt(text,params,phase){
  const output=text.slice(),{a,b,k,l}=params;
  for(let i=phase;i+1<text.length;i+=2){
    const c0=mod29(text[i]+a*text[i+1]*text[i+1]+k);
    const c1=mod29(text[i+1]+b*c0*c0+l);
    output[i]=c0; output[i+1]=c1;
  }
  return output;
}
/** @param {number[]} text @param {{a:number,b:number,k:number,l:number}} params @param {0|1} phase */
function decrypt(text,params,phase){
  const output=text.slice(),{a,b,k,l}=params;
  for(let i=phase;i+1<text.length;i+=2){
    const p1=mod29(text[i+1]-b*text[i]*text[i]-l);
    const p0=mod29(text[i]-a*p1*p1-k);
    output[i]=p0; output[i+1]=p1;
  }
  return output;
}
/** @param {number[]} text */
function bestOriginal(text){
  const rows=[];
  for(const phase of [0,1]){
    for(let b=0;b<29;b++){
      const v=decodedSecond(text,b,phase);
      rows.push({phase,b,n:v.length,top12:top12(v)});
      // The full 29 values of the hidden l relabel the 29 output bins;
      // their sorted top-12 count is exactly invariant.
      for(let l=0;l<29;l++)
        assert.equal(top12(v.map(x=>mod29(x-l))),top12(v));
    }
  }
  return rows.sort((a,b)=>b.top12-a.top12||a.phase-b.phase||a.b-b.b)[0];
}
const seed={a:13,b:23,k:2,l:5};
const result=original.map(({name,indices,expected})=>{
  const upper=bestOriginal(indices);
  // Every phase and all four independent secret values form a genuine
  // length-preserving, invertible encryption over the entire original span.
  for(const phase of [0,1]){
    const decoded=decrypt(indices,seed,phase);
    assert.deepEqual(encrypt(decoded,seed,phase),indices);
    const nativePlant=gibranNative.slice(2500,2500+expected);
    assert.equal(nativePlant.length,expected);
    assert.deepEqual(decrypt(encrypt(nativePlant,seed,phase),seed,phase),nativePlant);
    assert.equal(top12(secondCoordinates(nativePlant,phase)),
      top12(decodedSecond(encrypt(nativePlant,seed,phase),seed.b,phase)));
  }

  // Nonoverlapping unmodified natural GP literary passages constitute
  // independent SECOND-COORDINATE references, never keys for fitting.
  const windows=[];
  for(let offset=0;offset+expected<=gibranNative.length;offset+=expected){
    const window=gibranNative.slice(offset,offset+expected);
    for(const phase of [0,1]){
      const second=secondCoordinates(window,phase);
      windows.push({offset,phase,n:second.length,top12:top12(second)});
    }
  }
  const least=windows.reduce((a,b)=>a.top12/a.n<b.top12/b.n?a:b);
  assert(upper.top12/upper.n<least.top12/least.n);
  return {
    name,allSecretKeyCount:29**4,pairPhases:2,
    bound:upper,upperFraction:upper.top12/upper.n,
    nativeIndependentWindowCount:windows.length,
    nativeLeast:least,nativeLeastFraction:least.top12/least.n,
    gapToLeast:least.top12/least.n-upper.top12/upper.n,
    exactReencryption:"all-original positions",nativePlant:"all positions"
  };
});
console.log(JSON.stringify({
  hypothesis:"Any secret quadratic triangular GP29 pair mixer, two phase conventions",
  verdict:"Excluded as a single-step native-GP plaintext decoder on both independent original receivers",
  keyIndependentReason:"P1 = C1 - b*C0^2 - l; a and k absent; l cyclically relabels symbols",
  sourceGIbranNativeRunes:gibranNative.length,
  sourceAuthenticatedCipher:false,
  positiveSyntheticPassed:true,
  originalPlaintextRecovered:false,
  result
},null,2));
