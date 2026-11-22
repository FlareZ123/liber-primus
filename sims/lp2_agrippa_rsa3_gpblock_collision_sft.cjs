"use strict";
/**
 * Historical Agrippa-RSA3 candidate: exact independent three-GP-rune
 * block cipher collision invariant on untouched LP2 original pages.
 * Context: https://agrippa.english.ucsb.edu/wp-content/uploads/images/cracked-code/submissions-toc.html
 * The 1992 poem cipher used deterministic, independent 3-char RSA blocks.
 *
 * A length-preserving adaptation to GP29 would preserve the number of
 * repeated aligned 3-rune blocks under any secret block bijection,
 * separately for every original page and unknown starting phase.
 *
 * Run node sims/lp2_agrippa_rsa3_gpblock_collision_sft.cjs (Node22).
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const N=pages.reduce((sum,p)=>sum+p.indices.length,0);
assert.equal(N,12956);assert.equal(pages.length,55);
const labels=corpus.translit.map((s,i)=>({s,i}))
  .concat([{s:"ING",i:21},{s:"IO",i:27}])
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]} */
function nativeGP(raw){
  const latin=raw.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const plain=[];
  for(const word of latin.match(/[A-Z]+/g)||[]){
    for(let j=0;j<word.length;){
      const token=labels.find(t=>word.startsWith(t.s,j));
      assert(token,"unmapped source English spelling");
      plain.push(token.i);j+=token.s.length;
    }
  }
  return plain;
}
assert.deepEqual(nativeGP("FUNCTION"),[0,1,9,5,16,27,9]);
/** @param {number[]} sequence @param {number} phase @returns {number} */
function collisions(sequence,phase){
  const freqs=new Map();
  for(let i=phase;i+2<sequence.length;i+=3){
    const trip=sequence[i]*841+sequence[i+1]*29+sequence[i+2];
    freqs.set(trip,(freqs.get(trip)||0)+1);
  }
  let pairs=0;
  for(const n of freqs.values())pairs+=n*(n-1)/2;
  return pairs;
}
/** @param {number[][]} slices */
function profile(slices){
  const fixed=[0,0,0];
  let pageBest=0,pageWorst=0;
  for(const page of slices){
    const score=[0,1,2].map(phase=>collisions(page,phase));
    score.forEach((value,k)=>{fixed[k]+=value;});
    pageBest+=Math.min(...score);
    pageWorst+=Math.max(...score);
  }
  return {fixed,pageBest,pageWorst};
}
const original=profile(pages.map(p=>p.indices));
assert.deepEqual(original,{fixed:[4,9,4],pageBest:0,pageWorst:17});
const controls=[];
let firstPlant=null;
for(const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
]){
  const source=nativeGP(read(file)),windowScores=[];
  for(let start=0;start+N<=source.length;start+=Math.floor(N/2)){
    let at=start;
    const slice=pages.map(p=>{
      const c=source.slice(at,at+p.indices.length);
      at+=p.indices.length;return c;
    });
    if(!firstPlant)firstPlant=slice;
    windowScores.push(profile(slice));
  }
  assert(windowScores.length>0,file);
  const minBest=Math.min(...windowScores.map(s=>s.pageBest));
  const minFixed=[0,1,2].map(k=>Math.min(...windowScores.map(s=>s.fixed[k])));
  assert(minBest>original.pageWorst,"original RSA3 collision exclusion");
  controls.push({file,sourceGP29Runes:source.length,
    windows:windowScores.length,minUnderAllPerPagePhases:minBest,
    minUnderFixedPhase:minFixed});
}
assert.deepEqual(controls.map(x=>[x.windows,x.minUnderAllPerPagePhases]),
  [[32,123],[8,219],[48,112]]);
assert(firstPlant!==null);
/**
 * A genuine secret arbitrary *fixed per-page* triple bijection preserves
 * aligned block collisions. Affine factors 7 and 9 are invertible mod29.
 * @param {number[]} p
 * @param {number} pageNum
 * @returns {number[]}
 */
function encrypt(p,pageNum){
  const c=p.slice();
  for(let i=1;i+2<c.length;i+=3){
    c[i]=(p[i]+pageNum+5)%29;
    c[i+1]=(7*p[i+1]+11)%29;
    c[i+2]=(9*p[i+2]+pageNum)%29;
  }
  return c;
}
/** @param {number[]} c @param {number} pageNum */
function decrypt(c,pageNum){
  const p=c.slice();
  for(let i=1;i+2<p.length;i+=3){
    p[i]=((c[i]-pageNum-5)%29+29)%29;
    p[i+1]=(25*(c[i+1]-11+29))%29; // 7*25=175=1 mod29
    p[i+2]=(13*((c[i+2]-pageNum)%29+29))%29; // 9*13=117=1 mod29
  }
  return p;
}
let planted=0;
for(let j=0;j<pages.length;j++){
  const plain=firstPlant[j],cipher=encrypt(plain,pages[j].page);
  assert.deepEqual(decrypt(cipher,pages[j].page),plain);
  assert.equal(collisions(cipher,1),collisions(plain,1));
  planted+=plain.length;
}
assert.equal(planted,N);
console.log(JSON.stringify({
  status:"exact source-GP29 three-rune-block direct transfer excluded",
  source:"1992 Agrippa independently encrypted three-character blocks",
  original:{pages:55,runes:N,collisions:original},
  controls,synthetic:{
    cipher:"page-specific invertible 3-symbol affine codebook",
    verifiedPlaintextSymbols:planted,collisionInvariantPreserved:true},
  decision:"No deterministic reused RSA3-style direct GP29 block code on native-English text; no original LP2 decryption",
  limit:"Variable-length ASCII/RSA encoding, per-block key changes, random padding, and different plaintext registers are not constrained."
},null,2));
