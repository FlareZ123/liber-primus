/**
 * All-secret first-order autoregressive feedback test under the original
 * 256 mixed mark/repeat boundaries. No fitted cipher key or plaintext.
 *
 * Model per nonempty segment: C[j] = a_s*C[j-1]+sigma_s(P[j]) mod29, j>start.
 * a_s any of 29 residues, sigma_s any GP29 bijection, both entirely secret
 * but constant within the segment. Hence for the true a_s, the equality
 * profile of D[j]=C[j]-a_s*C[j-1] must equal the GP29 plaintext profile.
 * Independently maximising the collisions over all 29 a_s per segment
 * is an exact, adversarial all-secret upper bound.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=p=>JSON.parse(read(p));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const punct=load('resources/liber-primus/lp2-punctuation-identity.json');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const pages=corpus.pages.filter(p=>p.page<=55);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const print=punct.events.filter(e=>![57,58,59,60,125].includes(e.index))
  .filter(e=>e.symbol==='⁜'||(e.symbol==='⁘'&&e.index!==127));
assert.equal(print.length,170);
let offset=0;
const reps=[];
for(const p of pages){
  for(let i=1;i<p.indices.length;i++)
    if(p.indices[i]===p.indices[i-1])
      reps.push({pos:offset+i,kind:1});
  offset+=p.indices.length;
}
assert.equal(reps.length,86);
const ev=[
  ...print.map(e=>({pos:e.rune_offset,kind:0})),
  ...reps
].sort((a,b)=>a.pos-b.pos||a.kind-b.kind);
assert.equal(ev.length,256);
const segments=[];
let last=0;
for(const e of ev){segments.push({start:last,end:e.pos});last=e.pos;}
assert.equal(last,original.length);
assert.equal(segments.filter(s=>s.end===s.start).length,4);
const suffixPairs=segments.reduce((sum,s)=>{
  const n=Math.max(0,s.end-s.start-1);
  return sum+n*(n-1)/2;
},0);
assert.equal(suffixPairs,591828);
const collisions=arr=>{
  assert.equal(arr.length,original.length);
  let hits=0;
  for(const seg of segments){
    const hist=new Uint16Array(29);
    for(let j=seg.start+1;j<seg.end;j++)hist[arr[j]]++;
    for(const n of hist)hits+=n*(n-1)/2;
  }
  return hits;
};
const modulo=n=>(n%29+29)%29;
/** Exact residual equality histogram for one segment and one secret a. */
function residualHits(C,seg,a){
  const hist=new Uint16Array(29);
  for(let j=seg.start+1;j<seg.end;j++)
    hist[modulo(C[j]-a*C[j-1])]++;
  let sum=0;
  for(const n of hist)sum+=n*(n-1)/2;
  return sum;
}
let sourceMax=0, sourceZero=0, sourceOne=0, sourceMinusOne=0;
const chosen=Array(29).fill(0);
for(const seg of segments){
  const byA=Array.from({length:29},(_,a)=>residualHits(original,seg,a));
  const best=Math.max(...byA);
  sourceMax+=best;
  chosen[byA.indexOf(best)]++;
  sourceZero+=byA[0];sourceOne+=byA[1];sourceMinusOne+=byA[28];
}
assert.equal(sourceZero,19951);
assert.equal(sourceOne,21262);
assert.equal(sourceMinusOne,20432);
assert.equal(sourceMax,24229);
const sourceRate=sourceMax/suffixPairs;
assert.ok(Math.abs(sourceRate-0.04093925937941429)<1e-14);

// Source-native GP controls are independently calibrated against solved LP1
// and independent solved p57 by their imported orthography SFT.
const controls=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt',32],
  ['Gibran','resources/control/gibran_prophet_58585.txt',8],
  ['Emerson','resources/control/emerson_essays_2944.txt',48]
];
let globalMinimum=Infinity,plant=null,total=0;
const register=[];
for(const [name,p,expected] of controls){
  const text=encodeSourceNativeGP(read(p));
  let localMin=Infinity,localMax=-Infinity,count=0;
  for(let start=0;start+original.length<=text.length;start+=6478){
    const window=text.slice(start,start+original.length);
    if(plant===null)plant=window;
    const z=collisions(window)/suffixPairs;
    assert.ok(z>sourceRate,name+' all-secret original bound');
    localMin=Math.min(localMin,z);
    localMax=Math.max(localMax,z);
    globalMinimum=Math.min(globalMinimum,z);
    count++;total++;
  }
  assert.equal(count,expected);
  register.push({name,windows:count,min:localMin,max:localMax});
}
assert.equal(total,88);
assert.ok(globalMinimum>0.0574);
const solved=load('resources/external/relikd-solved-gp29-native-v1.json')
  .sections.flatMap(s=>Array.from(s.source_text)
    .map(ch=>corpus.runes.indexOf(ch)).filter(x=>x>=0));
assert.equal(solved.length,2979);
const solvedRates=[0,193,971,1541,2043,2500].map(shift=>{
  const sample=Array.from({length:original.length},(_,i)=>solved[(i+shift)%solved.length]);
  return collisions(sample)/suffixPairs;
});
assert.ok(solvedRates.every(x=>x>0.0607));

// Full lossless positive plant for the declared autoregression; first
// character of each segment is a source-provided seed not tested by the
// suffix collision invariant. All 256 independent secret a and sigma may
// vary freely between segments.
const enc=Array(original.length).fill(-1);
let trueHits=0;
for(let i=0;i<segments.length;i++){
  const seg=segments[i];
  if(seg.end<=seg.start)continue;
  const a=(7*i+3)%29, alpha=1+(11*i+7)%28, beta=(5*i+7)%29;
  enc[seg.start]=(13*i+17)%29;
  for(let j=seg.start+1;j<seg.end;j++){
    enc[j]=modulo(a*enc[j-1]+alpha*plant[j]+beta);
    const inverseAlpha=Array.from({length:29},(_,x)=>x).find(x=>alpha*x%29===1);
    const recovered=modulo(inverseAlpha*modulo(enc[j]-a*enc[j-1]-beta));
    assert.equal(recovered,plant[j]);
  }
  trueHits+=residualHits(enc,seg,a);
}
assert.equal(trueHits,collisions(plant));
let plantedAllSecret=0;
for(const seg of segments)
  plantedAllSecret+=Math.max(...Array.from({length:29},
    (_,a)=>residualHits(enc,seg,a)));
assert.ok(plantedAllSecret>=trueHits);
console.log(JSON.stringify({
  classification:'key-free all-29-coefficient-per-segment feedback exclusion; no unknown plaintext',
  segments:256,suffixPairs,
  source:{coeff0:sourceZero,coeff1:sourceOne,coeff28:sourceMinusOne,
    upperHits:sourceMax,upperRate:sourceRate,
    selectedBestCoefficientCounts:chosen},
  naturalEnglish:{windows:total,minRate:globalMinimum,register},
  actualSolvedCicada:{runes:solved.length,controls:solvedRates},
  plantedRecovery:{fullSuffix:true,actualPlainHits:trueHits,
    adversarialMaxHits:plantedAllSecret}
},null,2));
