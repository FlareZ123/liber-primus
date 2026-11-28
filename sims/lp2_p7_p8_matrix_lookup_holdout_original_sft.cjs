'use strict';

/*
 * p7 → p8 source-seeded matrix clock, adversarial all-29-state lookup inverse.
 * Agent46, 28 November 2026.
 *
 * Fixed source operands: p7 five red GP0 products -> P(X) -> v after five
 * steps; p8 49 literal fragment lengths -> 7x7 M; first post-red black
 * word GP0 product -> K=2. Alternative source matrices M^-1 and P(M).
 * Allow an arbitrary 29-entry UNKNOWN static shift table f(k) and train
 * all 29 entries on one ciphertext segment, without touching held-out data.
 *
 * The complete original-input source/native/control script must recover
 * separately planted solved-GP language while not mistaking overfit random
 * ciphertext for meaningful plaintext.
 *
 * node sims/lp2_p7_p8_matrix_lookup_holdout_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const parts=read('resources/liber-primus/lp2-transcription.txt').split('%');
const idx=new Map(corpus.runes.map((x,i)=>[x,i]));
const mod=x=>((x%29)+29)%29;
const prod=x=>x.reduce((a,b)=>mod(a*b),1);

function pageFragments(page){
 const expected=corpus.pages.find(p=>p.page===page).indices,seq=parts[page>=51?page-1:page];
 let words=[],buf=[],start=0,pos=0;
 const flush=()=>{if(buf.length)words.push({start,indices:buf.slice()});buf=[];};
 for(const ch of seq){
  if(idx.has(ch)){if(!buf.length)start=pos;assert.equal(idx.get(ch),expected[pos++]);buf.push(idx.get(ch));}
  else if(ch==='/'||/\s/u.test(ch))continue;
  else flush();
 }
 flush();
 assert.equal(pos,expected.length);
 return words;
}

const p7=pageFragments(7),r7=ink.pages.find(p=>p.page===7).red_spans[0];
assert.deepEqual([r7.start,r7.length],[194,14]);
const red7=p7.filter(w=>w.start>=r7.start&&w.start<r7.start+r7.length);
assert.equal(red7.length,5);
const coefficients=red7.map(w=>prod(w.indices));
assert.deepEqual(coefficients,[11,26,8,15,2]);
const polynomial=x=>coefficients.reduce((s,a,j)=>mod(s+a*x**j),0);
let seed=0;const warm=[seed];for(let k=0;k<5;k++){seed=polynomial(seed);warm.push(seed);}
assert.deepEqual(warm,[0,11,23,17,18,5]);
const v=[];for(let k=0;k<7;k++){v.push(seed);seed=polynomial(seed);}
assert.deepEqual(v,[5,15,28,9,10,24,7]);

const p8=pageFragments(8),r8=ink.pages.find(p=>p.page===8).red_spans[0];
assert.deepEqual([r8.start,r8.length],[0,12]);
assert.deepEqual(p8.slice(0,2).map(w=>w.indices.length),[4,8]);
const black=p8.slice(2);
assert.equal(black.length,49);
assert.equal(black.reduce((s,w)=>s+w.indices.length,0),243);
const M=Array.from({length:7},(_,i)=>black.slice(i*7,i*7+7).map(w=>w.indices.length));
assert.deepEqual(M,[
 [3,2,3,9,4,3,4],[2,2,6,3,7,3,4],[3,8,4,3,4,5,5],
 [2,3,4,4,7,5,10],[6,12,4,5,3,2,6],[10,4,9,6,5,6,8],
 [8,3,2,9,6,6,1]
]);
const K=prod(black[0].indices);
assert.equal(K,2);
const mv=(A,x)=>A.map(row=>mod(row.reduce((s,a,i)=>s+a*x[i],0)));
assert.deepEqual(mv(M,v),[2,28,5,28,23,28,27]);
function mul(A,B){
 return A.map(row=>B[0].map((_,j)=>mod(row.reduce((s,a,i)=>s+a*B[i][j],0))));
}
const I=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>Number(i===j)));
const inverse=x=>{for(let j=1;j<29;j++)if(mod(x*j)===1)return j;throw Error('not invertible')};
function matrixInverse(A){
 const X=A.map((r,i)=>r.map(mod).concat(I[i]));
 for(let j=0;j<7;j++){
  let k=j;while(k<7&&X[k][j]===0)k++;
  if(k>=7)throw Error('singular');
  [X[k],X[j]]=[X[j],X[k]];
  const a=inverse(X[j][j]);X[j]=X[j].map(x=>mod(x*a));
  for(let i=0;i<7;i++)if(i!==j){const b=X[i][j];X[i]=X[i].map((x,k)=>mod(x-b*X[j][k]));}
 }
 return X.map(r=>r.slice(7));
}
const Minv=matrixInverse(M);
assert.deepEqual(mul(M,Minv),I);
let PM=Array.from({length:7},()=>Array(7).fill(0)),power=I;
for(const a of coefficients){
 PM=PM.map((row,i)=>row.map((x,j)=>mod(x+a*power[i][j])));
 power=mul(power,M);
}
const matrices=[['M',M],['M-inverse',Minv],['P(M)',PM]];

const original=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices).slice(12);
assert.equal(original.length,1717);
assert.deepEqual(original.slice(0,243),black.flatMap(w=>w.indices));
const toGP=sections=>sections.flatMap(s=>[...s.source_text]
 .map(x=>idx.get(x)).filter(x=>x!==undefined));
const reference=toGP(native.sections.slice(0,3));
const separatePlant=toGP(native.sections.slice(3)).slice(200,1917);
assert.equal(reference.length,856);
assert.equal(separatePlant.length,1717);
const freq=Array(29).fill(0.5);
reference.forEach(x=>freq[x]++);
const den=freq.reduce((a,b)=>a+b,0), logp=freq.map(x=>Math.log(x/den));
const clock=(A,origin)=>{
 let state=origin?mv(A,v):v.slice(),keys=[];
 for(let i=0;i<original.length;i++){keys.push(state[K]);state=mv(A,state);}
 return keys;
};

// A maximally liberal 29-entry shift table f(k); each key class trained
// independently with a 29-way argmax and NO ciphertext target word chosen.
const argmaxLookup=(observed,keys,indices)=>{
 const hist=Array.from({length:29},()=>Array(29).fill(0));
 for(const i of indices)hist[keys[i]][observed[i]]++;
 return hist.map(row=>{
  let shift=0,score=-Infinity;
  for(let h=0;h<29;h++){
   let sum=0;for(let x=0;x<29;x++)sum+=row[x]*logp[mod(x-h)];
   if(sum>score){score=sum;shift=h;}
  }
  return shift;
 });
};
const score=(observed,keys,lookup,indices)=>{
 let sum=0,hist=Array(29).fill(0);
 for(const i of indices){
  const symbol=mod(observed[i]-lookup[keys[i]]);
  sum+=logp[symbol];hist[symbol]++;
 }
 const N=indices.length;
 return {
  N,loglikelihoodPerRune:sum/N,
  ioc:hist.reduce((s,x)=>s+x*(x-1),0)/(N*(N-1)),
  first36:indices.slice(0,36).map(i=>corpus.translit[mod(observed[i]-lookup[keys[i]])]).join(' ')
 };
};
const seq=(start,end)=>Array.from({length:end-start},(_,i)=>i+start);
const folds=[
 {name:'first850->last867',train:seq(0,850),holdout:seq(850,1717)},
 {name:'last867->first850',train:seq(850,1717),holdout:seq(0,850)},
 {name:'last1474->p8only243',train:seq(243,1717),holdout:seq(0,243)}
];
const zero=Array(29).fill(0);
const plantedSecret=Array.from({length:29},(_,i)=>mod(7*i+11));
const cases=[];
for(const [name,A] of matrices)for(const origin of [0,1]){
 const keys=clock(A,origin);
 const foldsResult=folds.map(f=>{
  const fitted=argmaxLookup(original,keys,f.train);
  const trained=score(original,keys,fitted,f.train);
  const holdout=score(original,keys,fitted,f.holdout);
  const raw=score(original,keys,zero,f.holdout);
  return {name:f.name,train:trained,holdout,raw,
    heldoutGainVsRaw:holdout.loglikelihoodPerRune-raw.loglikelihoodPerRune};
 });
 const planted=separatePlant.map((x,i)=>mod(x+plantedSecret[keys[i]]));
 const fit=argmaxLookup(planted,keys,folds[0].train);
 const recovered=plantedSecret.filter((q,i)=>q===fit[i]).length;
 const positive=score(planted,keys,fit,folds[0].holdout);
 assert.ok(recovered>=28);
 assert.ok(positive.ioc>0.058);
 assert.ok(positive.loglikelihoodPerRune>-3.05);
 assert.ok(foldsResult.every(f=>f.holdout.ioc<0.040));
 assert.ok(foldsResult.every(f=>f.holdout.loglikelihoodPerRune< -3.85));
 cases.push({name,origin,folds:foldsResult,
  plantedIndependentNative:{source:'source sections 4..9, none in reference sections 1..3',
    secret:'f(k)=(7*k+11)%29',
    recoveredKeyEntries:recovered,holdout:positive}});
}

// The only apparent one-sided favorable result is M^-1 origin0,
// first850 -> last867. It must not be selected as plaintext: against all
// 1717 circularly moved same-marginal clocks, the SOURCE phase0 is only
// rank53; in the independent reverse and p8-only folds it falls to ranks
// 602 and391. Calculate the complete phase control, never select best.
const inverseKeys=clock(Minv,0);
const phaseCensus=[];
for(const fold of folds){
 const shifts=[];
 for(let phase=0;phase<original.length;phase++){
  const rotated=inverseKeys.map((_,i)=>inverseKeys[(i+phase)%original.length]);
  const fitted=argmaxLookup(original,rotated,fold.train);
  const held=score(original,rotated,fitted,fold.holdout);
  shifts.push({phase,ll:held.loglikelihoodPerRune});
 }
 const sorted=shifts.slice().sort((a,b)=>b.ll-a.ll);
 const rank=sorted.findIndex(x=>x.phase===0)+1;
 phaseCensus.push({fold:fold.name,sourceRank:rank,nullSize:shifts.length,
  empiricalFractionAtLeastAsHigh:rank/shifts.length,sourceLL:shifts[0].ll,
  bestThree:sorted.slice(0,3)});
}
assert.deepEqual(phaseCensus.map(x=>x.sourceRank),[53,602,391]);

console.log(JSON.stringify({
 verdict:'NO authentic LP2 plaintext recovered; all-29-state static shift lookup fails independent held-out GP29-language test',
 state:{warm,p7Products:coefficients,v,K,matrix:M,inverse:Minv,firstMv:mv(M,v),
   bodyLength:243,chapterBodyLength:original.length},
 register:{nativeReferenceLength:reference.length,independentNativePlantLength:separatePlant.length,
   laplacePseudocount:0.5,folds:folds.map(x=>({name:x.name,train:x.train.length,holdout:x.holdout.length}))},
 phaseCensus:{clock:'M-inverse origin0; source-selected fixed phase0', folds:phaseCensus},
 cases
},null,2));
