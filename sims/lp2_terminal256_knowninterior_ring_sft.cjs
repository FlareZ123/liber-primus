'use strict';
/**
 * Terminal 256-rune known-interior hypothesis, source-visible ring alignment,
 * exact static decoder gates, and a positive complete p55 inversion plant.
 *
 * Inputs: original LP2 p55-p57 GP runes; 32x8 printed pp49-p51 grid;
 * documented p56 prime-totient inverse; p57 GP plaintext.
 *
 * Run: node sims/lp2_terminal256_knowninterior_ring_sft.cjs
 * Node 22 built-ins only.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} f @returns {unknown} */
function JSONfile(f){return JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));}
const db=JSONfile('resources/liber-primus/lp2-corpus.json');
const grid=JSONfile('resources/liber-primus/lp2-grid-256.json');
const ink55=db.pages[55].indices;
const ink56=db.pages[56].indices;
const ink57=db.pages[57].indices;
const bytes=grid.bytes;
assert.deepEqual([ink55.length,ink56.length,ink57.length,bytes.length],
  [76,85,95,256]);
const mod=x=>(x%29+29)%29;
/** @param {number} n @returns {number[]} */
function primes(n){
  const p=[];
  for(let x=2;p.length<n;x++){
    let good=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){good=false;break;}
    if(good)p.push(x);
  }
  return p;
}
const primeStream=primes(200);
let primeIndex=0;
const plain56=ink56.map(c=>c===0?0:mod(c-(primeStream[primeIndex++]-1)));
const plain180=plain56.concat(ink57);
const ink180=ink56.concat(ink57);
assert.equal(plain180.length,180);
const rings=[];
for(let d=0;d<4;d++){
  const r=[],top=d,bottom=31-d,left=d,right=7-d;
  for(let x=left;x<=right;x++)r.push(8*top+x);
  for(let y=top+1;y<=bottom;y++)r.push(8*y+right);
  for(let x=right-1;x>=left;x--)r.push(8*bottom+x);
  for(let y=bottom-1;y>=top+1;y--)r.push(8*y+left);
  rings.push(r);
}
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
// The 52-symbol deepest geometric ring begins at the exact printed word
// "SHED" in the already-clear p57; its original suffix is the imperative.
const deep52=plain180.slice(68+60);
assert.equal(deep52.length,rings[3].length);
assert.deepEqual(deep52,ink57.slice(43));
const deep52Translit=deep52.map(index=>db.translit[index]).join('');
assert.equal(deep52Translit,
  'SHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE');
const corners=[[0,0],[0,7],[31,7],[31,0]];
/** @param {number} corner @param {number} direction @returns {number[]} */
function pathFor(corner,direction){
  const [cy,cx]=corners[corner];
  return rings.flatMap((ring,d)=>{
    const y=Math.max(d,Math.min(31-d,cy));
    const x=Math.max(d,Math.min(7-d,cx));
    const start=ring.indexOf(8*y+x);
    assert(start>=0);
    return ring.map((_,i)=>ring[(start+direction*i+ring.length*2)%ring.length]);
  });
}
/** @param {number[]} X @param {number[]} Y */
function optimalFixedMap(X,Y){
  const groups=new Map();
  for(let i=0;i<X.length;i++){
    const h=groups.get(X[i])||new Map();
    h.set(Y[i],(h.get(Y[i])||0)+1);
    groups.set(X[i],h);
  }
  const fits=[...groups.values()].reduce((total,h)=>total+Math.max(...h.values()),0);
  return {distinctInputs:groups.size,bestMatches:fits,requiredExceptions:X.length-fits,
    conflictingInputs:[...groups.values()].filter(h=>h.size>1).length};
}
/** @param {number} a @returns {number} */
function inverse(a){for(let x=1;x<29;x++)if(a*x%29===1)return x;throw Error('nonunit');}
/** @param {number[]} s @returns {number} */
function linearComplexity(s){
  const C=[1],B=[1];
  let L=0,m=1,b=1;
  for(let n=0;n<s.length;n++){
    let delta=s[n];
    for(let i=1;i<=L;i++)delta=mod(delta+(C[i]||0)*s[n-i]);
    if(delta===0){m++;continue;}
    const previous=C.slice(),factor=mod(delta*inverse(b));
    for(let i=0;i<B.length;i++)
      C[i+m]=mod((C[i+m]||0)-factor*B[i]);
    if(2*L<=n){
      L=n+1-L;B.splice(0,B.length,...previous);b=delta;m=1;
    }else m++;
  }
  return L;
}
const staticTests=[],complexities=[];
for(let corner=0;corner<4;corner++){
  for(const direction of [-1,1]){
    const ringPath=pathFor(corner,direction);
    assert.equal(new Set(ringPath).size,256);
    const outer=ringPath.slice(0,76).map(i=>bytes[i]%29);
    const inner=ringPath.slice(76).map(i=>bytes[i]%29);
    staticTests.push({corner,direction,
      directOuterMatches:outer.filter((v,i)=>v===ink55[i]).length,
      innerPlainMatches:inner.filter((v,i)=>v===plain180[i]).length,
      innerInkMatches:inner.filter((v,i)=>v===ink180[i]).length,
      arbitrary29to29Plain:optimalFixedMap(inner,plain180)});
    for(const [name,known] of [['plain',plain180],['ink',ink180]]){
      for(const sign of [-1,1]){
        const seq=inner.map((v,i)=>mod(v+sign*known[i]));
        complexities.push({corner,direction,target:name,sign,
          linearComplexity:linearComplexity(seq)});
      }
    }
  }
}
assert(staticTests.every(x=>x.arbitrary29to29Plain.requiredExceptions>=128));
assert(complexities.every(x=>x.linearComplexity>=89));
const innerRowMajor=[];
for(let y=1;y<31;y++)for(let x=1;x<7;x++)innerRowMajor.push(bytes[8*y+x]%29);
assert.equal(innerRowMajor.length,180);
const directRowMajor=innerRowMajor.filter((v,i)=>v===plain180[i]).length;
const rowMajorMap=optimalFixedMap(innerRowMajor,plain180);
assert.deepEqual([directRowMajor,rowMajorMap.bestMatches],[3,47]);
const keys=bytes.map(x=>x%29);
const observed256=ink55.concat(ink56,ink57);
const U=76,N=256;
const inverses=Array.from({length:29},(_,n)=>n?inverse(n):0);
/** @param {number} j @param {number} t @param {number} dir */
const at=(j,t,dir)=>(dir===1?j-t+256:j+t)%256;
/** @param {number[]} P @param {number} dir @returns {number[]} */
function convolution(P,dir){
  const result=[];
  for(let j=0;j<N;j++){
    let s=0;
    for(let k=0;k<N;k++)s+=keys[at(j,k,dir)]*P[k];
    result.push(mod(s));
  }
  return result;
}
/** @param {number[]} C @param {number} dir @returns {number[][]} */
function equations(C,dir){
  return Array.from({length:N},(_,j)=>{
    const row=Array(U+1).fill(0);
    let b=C[j];
    for(let t=0;t<N;t++){
      const value=keys[at(j,t,dir)];
      if(t<U)row[t]=value;
      else b=mod(b-value*plain180[t-U]);
    }
    row[U]=b;
    return row;
  });
}
/** @param {number[][]} matrix */
function solve(matrix){
  const A=matrix.map(r=>r.slice()),pivots=[];
  let pivotRow=0;
  for(let col=0;col<U&&pivotRow<A.length;col++){
    let choice=pivotRow;
    while(choice<A.length&&A[choice][col]===0)choice++;
    if(choice===A.length)continue;
    [A[pivotRow],A[choice]]=[A[choice],A[pivotRow]];
    const scale=inverses[A[pivotRow][col]];
    for(let k=col;k<=U;k++)A[pivotRow][k]=mod(A[pivotRow][k]*scale);
    for(let i=0;i<A.length;i++){
      if(i===pivotRow||A[i][col]===0)continue;
      const q=A[i][col];
      for(let k=col;k<=U;k++)A[i][k]=mod(A[i][k]-q*A[pivotRow][k]);
    }
    pivots.push(col);pivotRow++;
  }
  const contradictions=A.slice(pivotRow).filter(row=>row[U]!==0).length;
  const recovered=Array(U).fill(0);
  for(let i=0;i<pivots.length;i++)recovered[pivots[i]]=A[i][U];
  return {rank:pivotRow,contradictions,recovered};
}
const inverseTests=[];
for(const dir of [1,-1]){
  const original=solve(equations(observed256,dir));
  const nativePlantPlain=ink57.slice(0,U).concat(plain180);
  const plantCipher=convolution(nativePlantPlain,dir);
  const plant=solve(equations(plantCipher,dir));
  const recovered=plant.recovered.filter((x,i)=>x===nativePlantPlain[i]).length;
  assert.equal(plant.rank,U);
  assert.equal(plant.contradictions,0);
  assert.equal(recovered,U);
  assert.equal(original.rank,U);
  inverseTests.push({direction:dir,originalRank:original.rank,
    originalContradictions:original.contradictions,
    plantRecovered:recovered,plantContradictions:plant.contradictions});
}
assert.deepEqual(inverseTests.map(x=>x.originalContradictions),[172,174]);
console.log(JSON.stringify({
  exactSourceLayout:{
    gridShape:[32,8],gridCells:256,perimeter:76,interior:180,
    terminalPageRunes:[ink55.length,ink56.length,ink57.length],
    ringLengths:rings.map(r=>r.length),
    deepestRing:{startIn256:204,page57RuneOffset:43,runicLength:deep52.length,plainTransliteration:deep52Translit}
  },
  nativeControls:{p56PlainTokens:plain56.length,p57PlainTokens:ink57.length},
  rowMajorLiteralRegister:{directMatches:directRowMajor,
    bestUnrestrictedCodebook:rowMajorMap},
  fixedRingOrientations:staticTests,
  candidateKnownInteriorKeystream:{models:complexities.length,
    minComplexity:Math.min(...complexities.map(x=>x.linearComplexity)),
    maxComplexity:Math.max(...complexities.map(x=>x.linearComplexity))},
  cyclic256TapGF29OriginalDecoder:inverseTests,
  decision:'Source-exact 76+180 perimeter/interior alignment. Original text does not match direct/natively bijective byte-mod29 map, a compact linear keystream, or either exact 256-tap cyclic convolution. Synthetic inverse recovers all 76 unknowns. No authentic p55 plaintext or key.'
},null,2));
