'use strict';
/**
 * Source-only 2014 Stage7 7x7 magic square × LP2 p8 7x7 black-fragment
 * matrix cross-check. No fitted plaintext, key phase, indexing, or model.
 * Run at repository root: node sims/lp2_stage7_p8_shared_root24_7matrix_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=read('resources/cicada2014-openpuff-magic-squares.txt');
const transcription=read('resources/liber-primus/lp2-transcription.txt').replace(/\r/g,'');
const allSquares=source.trim().split(/\r?\n\s*\r?\n/).map(part=>part.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(allSquares.map(A=>[A.length,A[0].length]),[[5,5],[7,7],[5,5]]);
assert.deepEqual(allSquares.map(A=>A[0].reduce((a,b)=>a+b,0)),[3301,1033,1033]);
const stage7=allSquares[1];
assert.ok(stage7.every(row=>row.reduce((a,b)=>a+b,0)===1033));
const runeIndex=new Map(corpus.runes.map((v,i)=>[v,i]));
const page8=transcription.split(/\n%\n/)[8];
let at=0,current=[],fragments=[];
const flush=()=>{if(current.length){fragments.push(current);current=[];}};
for(const ch of page8){
  if(runeIndex.has(ch)){
    assert.equal(runeIndex.get(ch),corpus.pages.find(p=>p.page===8).indices[at]);
    current.push(runeIndex.get(ch));at++;
  }else if(ch==='/' || /\s/u.test(ch))continue;
  else flush();
}
flush();
assert.equal(at,255);
assert.deepEqual(fragments.slice(0,2).map(w=>w.length),[4,8]);
const black=fragments.slice(2);assert.equal(black.length,49);
const lengths=black.map(w=>w.length);
const p8=Array.from({length:7},(_,i)=>lengths.slice(7*i,7*i+7));
assert.deepEqual(p8,[[3,2,3,9,4,3,4],[2,2,6,3,7,3,4],[3,8,4,3,4,5,5],[2,3,4,4,7,5,10],[6,12,4,5,3,2,6],[10,4,9,6,5,6,8],[8,3,2,9,6,6,1]]);
const P=29, mod=n=>((n%P)+P)%P,inv=n=>{for(let i=1;i<P;i++)if(mod(n*i)===1)return i;throw Error('singular pivot');};
const mul=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce((a,x,i)=>a+x*B[i][j],0))));
const rowReduce=input=>{
  const A=input.map(row=>row.map(mod));let rank=0,det=1;
  for(let k=0;k<A[0].length&&rank<A.length;k++){
    let pivot=rank;while(pivot<A.length&&!A[pivot][k])pivot++;
    if(pivot===A.length)continue;
    if(pivot!==rank){[A[pivot],A[rank]]=[A[rank],A[pivot]];det=mod(-det);}
    const v=A[rank][k];det=mod(det*v),scale=inv(v);
    A[rank]=A[rank].map(x=>mod(x*scale));
    for(let i=0;i<A.length;i++)if(i!==rank&&A[i][k]){
      const factor=A[i][k];A[i]=A[i].map((x,j)=>mod(x-factor*A[rank][j]));
    }
    rank++;
  }
  return {rank,det};
};
const eye=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>Number(i===j)));
const shift=(A,x)=>A.map((row,i)=>row.map((v,j)=>mod(v-(i===j?x:0))));
const roots=A=>Array.from({length:29},(_,x)=>x).filter(x=>rowReduce(shift(A,x)).rank<7);
const S=stage7.map(row=>row.map(mod)),M=p8.map(row=>row.map(mod));
assert.equal(rowReduce(S).det,2);
assert.equal(rowReduce(M).det,18);
assert.deepEqual(roots(S),[8,18,24]);
assert.deepEqual(roots(M),[24]);
// Complete black 7x7 objects, not cherry-picked control windows:
// parse original page text and independently source-annotated red spans.
const annotated=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const textPages=transcription.split(/\n%\n/);
function blackLengthsOnPage(pageNo){
  const p=corpus.pages.find(x=>x.page===pageNo);
  const raw=textPages[pageNo<50?pageNo:pageNo-1];
  assert.ok(raw!==undefined);
  const red=Array(p.runic_count).fill(false);
  for(const span of (annotated.pages.find(x=>x.page===pageNo)?.red_spans||[]))
    for(let k=span.start;k<span.start+span.length;k++)red[k]=true;
  let i=0,fragment=[],black=[];
  const flush=()=>{
    if(!fragment.length)return;
    assert.ok(fragment.every(x=>x===fragment[0]),'mixed red-black fragment');
    if(!fragment[0])black.push(fragment.length);
    fragment=[];
  };
  for(const char of raw){
    if(runeIndex.has(char)){
      assert.equal(runeIndex.get(char),p.indices[i]);
      fragment.push(red[i]);i++;
    }else if(char==='/'||/\s/u.test(char))continue;
    else flush();
  }
  flush();assert.equal(i,p.runic_count);
  return black;
}
const exactly49Black=corpus.pages.filter(p=>p.page<=55&&p.page!==50)
  .filter(p=>blackLengthsOnPage(p.page).length===49).map(p=>p.page);
assert.deepEqual(exactly49Black,[8,27,33]);
const black49Controls=exactly49Black.map(p=>{
  const values=blackLengthsOnPage(p);
  const matrix=Array.from({length:7},(_,i)=>values.slice(7*i,7*i+7));
  return {page:p,fragmentCount:49,rootSet:roots(matrix),root24:roots(matrix).includes(24)};
});
assert.deepEqual(black49Controls.map(p=>p.rootSet),[[24],[17,26],[11]]);


// Matched source-order null: independently reorder only the seven ORIGINAL
// columns. It preserves all individual historical rows, every row total,
// 7x7 dimensions and the exact printed entries, but challenges whether the
// published cross-register eigenvalue alignment is forced by row sums.
// Canonical Stage7 S has roots8=A(p15) and24=-g(p8), both independently
// derived source values before this comparison. This null is conditional,
// NOT an unconditional probability of a discovered two-root coincidence.
function* permutations(values,pos=0){
  if(pos===values.length){yield values.slice();return;}
  for(let i=pos;i<values.length;i++){
    [values[pos],values[i]]=[values[i],values[pos]];
    yield* permutations(values,pos+1);
    [values[pos],values[i]]=[values[i],values[pos]];
  }
}
const columnNull={n:0,root8:0,root18:0,root24:0,both8and24:0};
for(const columns of permutations([0,1,2,3,4,5,6])){
  const permuted=S.map(row=>columns.map(j=>row[j]));
  const r8=rowReduce(shift(permuted,8)).rank<7;
  const r24=rowReduce(shift(permuted,24)).rank<7;
  const r18=rowReduce(shift(permuted,18)).rank<7;
  columnNull.n+=1;
  if(r8)columnNull.root8+=1;
  if(r24)columnNull.root24+=1;
  if(r18)columnNull.root18+=1;
  if(r8&&r24)columnNull.both8and24+=1;
}
assert.deepEqual(columnNull,{n:5040,root8:197,root18:5040,root24:229,both8and24:9});

const sVector=[1,10,20,25,20,10,1],mVector=[18,9,9,8,28,0,1];
const multiplyVector=(A,x)=>A.map(row=>mod(row.reduce((n,a,i)=>n+a*x[i],0)));
assert.deepEqual(multiplyVector(S,sVector),sVector.map(x=>mod(24*x)));
assert.deepEqual(multiplyVector(M,mVector),mVector.map(x=>mod(24*x)));
const commonRank=rowReduce(shift(S,24).concat(shift(M,24))).rank;
assert.equal(commonRank,7,'no shared right eigenvector for root24');
const inverse=A=>{
  const aug=A.map((row,i)=>row.map(mod).concat(eye[i]));
  for(let k=0;k<7;k++){
    let pivot=k;while(pivot<7&&!aug[pivot][k])pivot++;
    assert.notEqual(pivot,7);[aug[pivot],aug[k]]=[aug[k],aug[pivot]];
    const scale=inv(aug[k][k]);aug[k]=aug[k].map(x=>mod(x*scale));
    for(let i=0;i<7;i++)if(i!==k&&aug[i][k]){
      let f=aug[i][k];aug[i]=aug[i].map((x,j)=>mod(x-f*aug[k][j]));
    }
  }
  return aug.map(row=>row.slice(7));
};
const Sinv=inverse(S);
assert.deepEqual(mul(S,Sinv),eye);
const ioc=a=>{const counts=Array(29).fill(0);for(const x of a)counts[x]++;return counts.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));};
const transforms={
  'S^-1*M':mul(Sinv,M), 'M*S^-1':mul(M,Sinv),
  'S*M':mul(S,M), 'M*S':mul(M,S)
};
const attempts=Object.fromEntries(Object.entries(transforms).map(([name,A])=>{
  const bytes=A.flat();return [name,{ioc:ioc(bytes),values:bytes,latin:bytes.map(x=>corpus.translit[x]).join('')}];
}));
const nativeP57=corpus.pages.find(p=>p.page===57); // independent known-clear page, 95 runes
assert.equal(nativeP57.runic_count,95);
const plain=Array.from({length:7},(_,i)=>nativeP57.indices.slice(i*7,i*7+7));
assert.deepEqual(mul(Sinv,mul(S,plain)),plain.map(row=>row.map(mod)));
assert.deepEqual(mul(mul(plain,S),Sinv),plain.map(row=>row.map(mod)));
console.log(JSON.stringify({status:'PASS',sources:['resources/cicada2014-openpuff-magic-squares.txt','resources/liber-primus/lp2-transcription.txt','resources/liber-primus/lp2-corpus.json'],historical7RowSum:1033,stage7Roots:roots(S),p8FragmentRoots:roots(M),stage7ColumnPermutationNull:columnNull,complete49BlackPageControls:black49Controls,sharedRoot:24,stage7RightVector:sVector,p8RightVector:mVector,sharedRightEigenvector:false,sharedEigenspaceStackRank:commonRank,stage7Mod29Det:rowReduce(S).det,p8Mod29Det:rowReduce(M).det,attempts,positiveNative49:true,classification:'shared root, no authenticated decoder'},null,2));
