'use strict';
/**
 * Distinct source-led source-key hypothesis:
 * p40 and p54 are the ONLY floral red titles with an identical root x=24,
 * hence perhaps their following chapter bodies share a single additive GP29
 * pad keyed at the red/black handoff. A repeated pad must cancel exactly.
 * Evaluate the original difference against original-length heldout native GP
 * plaintext pairs, with the difference law trained on disjoint Shakespeare.
 *
 * Windows 11 Node.js22 CJS, original unchanged source runes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} pathName */
const read=pathName=>fs.readFileSync(path.join(root,pathName),'utf8');
const data=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const a=data.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
const b=data.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
assert.equal(a.length,3008);
assert.equal(b.length,308);
const mod=x=>(x%29+29)%29;
const sources={
  train:encodeSourceNativeGP(read('resources/control/shakespeare_first300k.txt')),
  gibran:encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')),
  emerson:encodeSourceNativeGP(read('resources/control/emerson_essays_2944.txt'))
};
const hist=new Float64Array(29);
for(const p of sources.train)hist[p]++;
const freq=[...hist].map(x=>x/sources.train.length);
/** Distribution of differences between two independent native-GP runes. */
const law=Array.from({length:29},(_,d)=>
  freq.reduce((sum,f,i)=>sum+f*freq[mod(i-d)],0));
assert(Math.abs(law.reduce((s,v)=>s+v,0)-1)<1e-12);
assert(law[0]>0.05);
function score(c1,c2) {
  assert(c1.length===c2.length);
  return c1.reduce((s,v,i)=>s+Math.log(29*law[mod(v-c2[i])]),0);
}
function same(c1,c2) {return c1.filter((v,i)=>v===c2[i]).length;}
function reference(n,seed) {
  const samples=[];
  for(let t=0;t<300;t++) {
    const x=sources.gibran,y=sources.emerson;
    const ix=(seed+7919*t)%(x.length-n),iy=(seed*3+12347*t)%(y.length-n);
    const p=x.slice(ix,ix+n),q=y.slice(iy,iy+n);
    samples.push({score:score(p,q),equals:same(p,q)});
  }
  return samples;
}
function plant(n,seed) {
  const p=sources.gibran.slice(seed,seed+n);
  const q=sources.emerson.slice(seed*3,seed*3+n);
  let state=0x3301f10a;const key=[];
  for(let i=0;i<n;i++){state^=state<<13;state^=state>>>17;state^=state<<5;key.push((state>>>0)%29);}
  const cp=p.map((v,i)=>mod(v+key[i]));
  const cq=q.map((v,i)=>mod(v+key[i]));
  assert.deepEqual(cp.map((v,i)=>mod(v-key[i])),p);
  assert.deepEqual(cq.map((v,i)=>mod(v-key[i])),q);
  assert.deepEqual(cp.map((v,i)=>mod(v-cq[i])),p.map((v,i)=>mod(v-q[i])));
  assert(Math.abs(score(cp,cq)-score(p,q))<1e-10);
  return {recoveredNativePairs:n,reencryptedPairs:n,identicalPadCancellationExact:true,
    equals:same(cp,cq),sourceLLR:score(cp,cq)};
}
const cases=[
  {name:'both_flora_title_to_title',p:a.slice(0,b.length),q:b},
  {name:'both_flora_black_body_to_black_body',p:a.slice(8,8+b.length-9),q:b.slice(9)}
];
const output=cases.map((v,i)=>{
  const n=v.q.length;
  assert(v.p.length===n);
  const original={n,equalValues:same(v.p,v.q),nativeDifferenceScore:score(v.p,v.q)};
  const pos=reference(n,991*i+13),posScores=pos.map(x=>x.score);
  const min=Math.min(...posScores);
  const median=posScores.slice().sort((x,y)=>x-y)[150];
  const answer={name:v.name,original,
    originalScoreBelowNativeMinimum:original.nativeDifferenceScore<min,
    nativeReferencePairs:posScores.length,
    nativeReferenceMin:min,nativeReferenceMedian:median,
    positiveSourceAtOrBelowOriginal:posScores.filter(s=>s<=original.nativeDifferenceScore).length,
    sourceNativePlant:plant(n,53+i)};
  assert.equal(answer.positiveSourceAtOrBelowOriginal,0);
  return answer;
});
console.log(JSON.stringify({
  classification:'Source floral chapter pair same-position additive-pad reuse rejected in matched native GP controls',
  source:'only two floral red headings p40/p54 with common x=24 root',
  rawRuneLengths:[a.length,b.length],
  sourceTitleLengths:[8,9],
  test:'Exact repeated continuous GP29 additive pad; no unknown key fitting or phase sweep',
  referenceTrainedOnlyOn:'Shakespeare 217106 source-calibrated GP runes',
  referenceHeldout:'300 independent window pairs from Gibran and Emerson per case',
  output,
  scope:'Exact zero-relative-phase pad synchronization only; nonlinear/contextual/nonmatching-offset key use remains untested.',
  originalUnknownPlaintextRecovered:false
},null,2));
