"use strict";
/**
 * The entire externally archived S2 top-1024 seed list, independently
 * retested on 240 authentic original runes under fixed native-GP Latin.
 * Controls: ten disjoint 240-rune held-out Vulgate windows absent
 * from the 203,357-rune GP-Latin trigram training source.
 *
 * Node 22. Run: node sims/round27_s2_top1024_latin.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {beam}=require("./round27_s2_crosslane_alias.cjs");
const root=path.join(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const source=read("resources/control/latin-vulgate-gp-trigrams.json");
const holdout=read("resources/control/latin-vulgate-heldout-gp.json");
const top=read("resources/control/duko_round27_s2_top1024.json");
assert.equal(source.n,203357);
assert.equal(holdout.runes.length,2400);
assert.equal(top.length,1024);
const N=29,U=Float64Array.from(source.u);
const B=new Float64Array(N*N),T=new Float64Array(N*N*N);
for(const [key,count] of source.b) B[key]=count;
for(const [key,count] of source.t) T[key]=count;
const context3=new Float64Array(N*N),context2=new Float64Array(N);
for(let i=0;i<T.length;i++)context3[Math.floor(i/N)]+=T[i];
for(let i=0;i<B.length;i++)context2[Math.floor(i/N)]+=B[i];

/**
 * Exact published Jelinek-Mercer four-way native-GP trigram mixture:
 * lambda3=.7, lambda2=.2, lambda1=.09, uniform residual=.01,
 * with unseen contexts' unused mass redistributed to uniform.
 * @param {number[]} runes
 */
function gpLatinScore(runes){
  let score=0;
  for(let i=2;i<runes.length;i++){
    const a=runes[i-2],b=runes[i-1],c=runes[i],ab=a*N+b,bc=b*N+c,abc=ab*N+c;
    const valid3=context3[ab]>0,valid2=context2[b]>0;
    const s3=valid3?0.7*T[abc]/context3[ab]:0;
    const s2=valid2?0.2*B[bc]/context2[b]:0;
    const s1=0.09*U[c]/source.n;
    const backoff=(1-(valid3?0.7:0)-(valid2?0.2:0)-0.09)/N;
    const p=s3+s2+s1+backoff;
    assert.ok(p>0);
    score+=Math.log10(p);
  }
  return score/(runes.length-2);
}
function main(){
  const refs=Array.from({length:10},(_,i)=>
    gpLatinScore(holdout.runes.slice(240*i,240*i+240))).sort((a,b)=>a-b);
  const rec=[];
  for(let i=0;i<top.length;i++){
    const out=beam(top[i].seed,"exact",240);
    const gp=gpLatinScore(out.plain_idx);
    rec.push({rankAtL120:i+1,seed:top[i].seed,oldL120Pmax:top[i].pmax,
      gpLatinTrigramLog10:gp,originalPreview:out.latin.slice(0,100),
      skips:out.n_skips});
  }
  rec.sort((a,b)=>b.gpLatinTrigramLog10-a.gpLatinTrigramLog10);
  const distribution=rec.map(x=>x.gpLatinTrigramLog10).sort((a,b)=>a-b);
  const above=rec.filter(x=>x.gpLatinTrigramLog10>=refs[0]);
  return {
    classification:"Source-native Latin GP heldout retest of exact-S2 original 1024 candidates",
    realOriginalRunes:240,originalSourceTopSeeds:1024,modelNativeGPRunes:source.n,
    originalScoreMin:distribution[0],originalScoreMedian:distribution[512],
    originalScoreMax:distribution.at(-1),
    referenceHeldout:{windows:refs.length,windowGpRunes:240,
      worst:refs[0],median:refs[5],best:refs[9]},
    meetWeakestNativeLatin:above.length,
    best15:rec.slice(0,15),
    flaggedSeed:rec.find(x=>x.seed===35563892),
    scope:"Original GP ciphertext, known MT19937 key and exact keyskip, independently archived Latin Vulgate GP control; no model reconstruction of source repo's 9-register pmax and no claim about other plaintext registers."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={gpLatinScore,main};
