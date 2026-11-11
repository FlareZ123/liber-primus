'use strict';
/**
 * Source-selected GF(29^2) terminal-register falsification on original LP2.
 * Reads existing immutable corpus/table; never fits source order or a secret.
 * Node 22: node sims/red_triad_terminal_linear_state_allsecret_sft.cjs
 * Scope: a linear output of a source-forced affine field state directly
 * generating p53's 51 red plus p55's 76 ciphertext GP symbols.
 * No unknown plaintext or genuine cipher is claimed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} file */
const load=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
function mul(a,b){return [mod(a[0]*b[0]+8*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];}
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
function add(a,b){return [mod(a[0]+b[0]),mod(a[1]+b[1])];}
/** @param {[number,number]} x */
const tr=x=>mod(2*x[0]+3*x[1]);
/** Descending F29 division by (X-24), retaining leading zeros.
 * @param {number[]} src
 */
function divide(src){
  const q=[mod(src[0])];
  for(let i=1;i<src.length-1;i++)q.push(mod(src[i]+24*q[q.length-1]));
  return {q,remainder:mod(src[src.length-1]+24*q[q.length-1])};
}
/** Row reduction over F29; exact rank, no floating point. @param {number[][]} matrix */
function rank(matrix){
  const a=matrix.map(row=>row.slice()),cols=a[0].length;
  let r=0;
  for(let c=0;c<cols&&r<a.length;c++){
    let k=r;
    while(k<a.length&&a[k][c]===0)k++;
    if(k===a.length)continue;
    [a[r],a[k]]=[a[k],a[r]];
    let inv=1;
    while(mod(a[r][c]*inv)!==1)inv++;
    for(let j=c;j<cols;j++)a[r][j]=mod(a[r][j]*inv);
    for(let i=0;i<a.length;i++)if(i!==r){
      const f=a[i][c];
      if(f)for(let j=c;j<cols;j++)a[i][j]=mod(a[i][j]-f*a[r][j]);
    }
    r++;
  }
  return r;
}
/** @param {number[]} values */
function ioc(values){
  const counts=Array(29).fill(0);
  for(const x of values)counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
const grid=load('resources/liber-primus/base60-grid.json');
const corpus=load('resources/liber-primus/lp2-corpus.json');
const ink=load('resources/liber-primus/lp2-ink-annotations.json');
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const triads=ink.pages.flatMap(p=>(p.red_spans||[]).filter(s=>s.length===3)
  .map(s=>({page:p.page,start:s.start,indices:[...s.runes].map(c=>corpus.runes.indexOf(c))})));
assert.deepEqual(triads,[
  {page:3,start:119,indices:[13,23,2]},
  {page:39,start:119,indices:[27,5,15]}
]);
const ac=corpus.pages.find(p=>p.page===54).indices[0];
assert.equal(ac,24);
const red=corpus.pages.find(p=>p.page===53).indices.slice(128);
const black=corpus.pages.find(p=>p.page===55).indices;
const target=red.concat(black);
assert.deepEqual([red.length,black.length,target.length],[51,76,127]);
const p=bytes.map(mod),d1=divide(p),d2=divide(d1.q);
assert.deepEqual([d1.remainder,d2.remainder,d2.q.length,d2.q[0]],[0,0,254,0]);
const u=[0,1],z=[23,27];
/**
 * We allow arbitrary hidden W,V in F29^2 and scalar b:
 * y[i]=Tr(W*u^i+V*F[i])+b, F[i+1]=u*F[i]+Q[i].
 * This over-approximates V*S0 when S0 is fixed or secretly chosen.
 * Each observed symbol is one F29 linear equation in five parameters.
 * @param {'adjacent'|'halves'} layout
 */
function model(layout){
  let U=[1,0],F=[0,0];
  const rows=[],key=[];
  for(let i=0;i<127;i++){
    rows.push([tr(U),tr(mul(u,U)),tr(F),tr(mul(u,F)),1]);
    key.push(mod(tr(add(mul([ac,0],U),mul(z,F)))+13));
    const q=layout==='adjacent'?
      [d2.q[2*i],d2.q[2*i+1]]:[d2.q[i],d2.q[i+127]];
    U=mul(u,U);
    F=add(mul(u,F),q);
  }
  return {rows,key};
}
const result={sourceBytes:bytes.length,sourceQuotient:d2.q.length,
  originalTargetLengths:[red.length,black.length],rawTargetIoC:ioc(target),
  field:'F29[u] with u^2=3u+8',sourceSeed:ac,sourceObservation:z,
  cases:[]};
for(const layout of ['adjacent','halves']){
  const {rows,key}=model(layout);
  const augmented=rows.map((row,i)=>row.concat(target[i]));
  const rankOriginal=rank(rows),rankAugmented=rank(augmented);
  const prefixFirstImpossible=Array.from({length:127},(_,i)=>i+1)
    .find(n=>rank(rows.slice(0,n))<rank(augmented.slice(0,n)));
  let disjointIncompatible6=0,disjointCompatible6=0;
  for(let start=0;start+6<=127;start+=6){
    if(rank(augmented.slice(start,start+6))>rank(rows.slice(start,start+6)).valueOf())
      disjointIncompatible6++;
    else disjointCompatible6++;
  }
  // Five FREE secret GP29 parameters: positive synthetic control.
  const plant=rows.map(r=>mod(7*r[0]+11*r[1]+13*r[2]+17*r[3]+19*r[4]));
  assert.equal(rank(rows.map((row,i)=>row.concat(plant[i]))),rankOriginal);
  // One wholly source-picked additive cipher, tested against actual source.
  const decoded=target.map((symbol,i)=>mod(symbol-key[i]));
  const recipher=decoded.map((symbol,i)=>mod(symbol+key[i]));
  assert.deepEqual(recipher,target);
  const syntheticPlain=Array.from({length:127},(_,i)=>[16,8,18,15,18,5,4,18,16,15,24,4,18,7,4,10,16,16,18,9][i%20]);
  const syntheticCipher=syntheticPlain.map((x,i)=>mod(x+key[i]));
  assert.deepEqual(syntheticCipher.map((x,i)=>mod(x-key[i])),syntheticPlain);
  assert.equal(rankOriginal,5);
  assert.equal(rankAugmented,6);
  assert.equal(prefixFirstImpossible,6);
  result.cases.push({layout,rankOriginal,rankAugmented,prefixFirstImpossible,
    disjointIncompatible6,disjointCompatible6,
    minimumOriginalTargetEditsAtLeast:disjointIncompatible6,
    sourceKeyDirectMatches:key.filter((x,i)=>x===target[i]).length,
    sourceKeyDecodedIoC:ioc(decoded),
    sourceKeyDecodedFirst60Indices:decoded.slice(0,60),
    positiveControl:'all 127 planted symbols invert; secret five-parameter rank five'});
}
assert.deepEqual(result.cases.map(x=>x.disjointIncompatible6),[21,20]);
assert.equal(result.cases[0].sourceKeyDirectMatches,3);
assert.equal(result.cases[1].sourceKeyDirectMatches,8);

/**
 * Every arbitrary stationary (possibly nonlinear) secret map from one GF841
 * state to a GP29 rune must preserve symbol equality whenever state recurs.
 * Test all 841 secret initial states. The second gate grants independent
 * arbitrary lookup tables for red p53 and black p55.
 * @param {'adjacent'|'halves'} layout
 */
function nonlinearGate(layout){
  const pairs=Array.from({length:127},(_,i)=>layout==='adjacent'?
    [d2.q[2*i],d2.q[2*i+1]]:[d2.q[i],d2.q[i+127]]);
  /** @param {[number,number]} seed */
  function states(seed){
    let s=seed.slice();
    const out=[];
    for(let i=0;i<127;i++){
      out.push(s[0]+','+s[1]);
      s=add(mul(u,s),pairs[i]);
    }
    return out;
  }
  /** @param {string[]} stateKeys @param {number[]} text @param {boolean} twoInk */
  function conflicts(stateKeys,text,twoInk){
    const seen=new Map();
    let n=0;
    for(let i=0;i<127;i++){
      const key=(twoInk?(i<51?'red:':'black:'):'')+stateKeys[i];
      if(seen.has(key)&&seen.get(key)!==text[i])n++;
      else if(!seen.has(key))seen.set(key,text[i]);
    }
    return n;
  }
  const survivorsSingle=[],survivorsInk=[];
  let minConflicts=Infinity,minInkConflicts=Infinity;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const trajectory=states([a,b]);
    const common=conflicts(trajectory,target,false);
    const twoInk=conflicts(trajectory,target,true);
    minConflicts=Math.min(minConflicts,common);
    minInkConflicts=Math.min(minInkConflicts,twoInk);
    if(common===0)survivorsSingle.push([a,b]);
    if(twoInk===0)survivorsInk.push([a,b]);
  }
  const acState=states([24,0]),extState=states([23,27]);
  const ac24=[conflicts(acState,target,false),conflicts(acState,target,true)];
  const extension=[conflicts(extState,target,false),conflicts(extState,target,true)];
  // A private nonlinear source-native lookup is permitted by the exact gate.
  const plantKeys=states([11,7]);
  const plant=plantKeys.map(k=>{
    const [a,b]=k.split(',').map(Number);
    return mod(a*a+7*a*b+13*b*b+5);
  });
  const inkPlant=plant.map((v,i)=>mod(v+(i<51?0:11)));
  assert.equal(conflicts(plantKeys,plant,false),0);
  assert.equal(conflicts(plantKeys,inkPlant,true),0);
  return {layout,allSecretInitialStates:841,
    possibleSingleLookupSeeds:survivorsSingle.length,
    minimumContradictionsForSingleLookup:minConflicts,
    possibleSeparateRedBlackLookupSeeds:survivorsInk.length,
    minimumContradictionsForSeparateLookups:minInkConflicts,
    separateLookupSurvivors:survivorsInk,
    ac24SeedContradictions:{single:ac24[0],twoInk:ac24[1]},
    extensionRootSeedContradictions:{single:extension[0],twoInk:extension[1]},
    plant:'nonlinear hidden-state single and two-ink observations both pass exactly'};
}
result.nonlinearAllSecretGate=['adjacent','halves'].map(nonlinearGate);
assert.deepEqual(result.nonlinearAllSecretGate.map(x=>x.possibleSingleLookupSeeds),[0,0]);
assert.deepEqual(result.nonlinearAllSecretGate.map(x=>x.possibleSeparateRedBlackLookupSeeds),[8,3]);
assert.deepEqual(result.nonlinearAllSecretGate.map(x=>x.minimumContradictionsForSingleLookup),[2,1]);
assert.deepEqual(result.nonlinearAllSecretGate.map(x=>x.ac24SeedContradictions.twoInk),[5,7]);

console.log(JSON.stringify(result,null,2));
