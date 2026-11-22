#!/usr/bin/env node
'use strict';

// Test the p50 5x5 base59 square as a Hill-5 key over GP29 against the
// 75 complete runes of original p55. This is a bounded receiver test.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const alphabet=grid.alphabet.replace('f','');
const mod=(x,n)=>((x%n)+n)%n;
const values=grid.rows.map(row=>row.map(token=>{
 const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
 assert(a>=0&&b>=0,'p50 token must use the proposed base59 alphabet');
 return a*59+b;
}));

// The source-derived square is rows 21..25, columns 1..5 (zero-based).
const square=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>values[21+i][1+j]));
assert.deepEqual([square[0][0],square[0][4],square[4][0],square[4][4]],[224,115,73,75]);
const M=square.map(row=>row.map(x=>mod(x,29)));
const p55=corpus.pages.find(page=>page.page===55).indices;
assert.equal(corpus.translit[p55[0]],'NG','p55 begins with a one-rune carry from p54');
const input=p55.slice(1);
assert.equal(input.length,75);
assert.equal(input.length%5,0);
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
function inverseMod(a,n){for(let x=1;x<n;x++)if(mod(a*x,n)===1)return x;return null;}
function determinantMod(A,n){
 const a=A.map(row=>row.map(x=>mod(x,n)));
 let det=1;
 for(let col=0;col<n;col++){
  let pivot=col;
  while(pivot<n&&a[pivot][col]===0)pivot++;
  if(pivot===n)return 0;
  if(pivot!==col){[a[pivot],a[col]]=[a[col],a[pivot]];det=mod(-det,n);}
  const value=a[col][col];
  det=mod(det*value,n);
  const iv=inverseMod(value,n);
  for(let r=col+1;r<n;r++){
   const factor=mod(a[r][col]*iv,n);
   for(let j=col;j<n;j++)a[r][j]=mod(a[r][j]-factor*a[col][j],n);
  }
 }
 return det;
}
function matrixInverse(A,n){
 const size=A.length;
 const aug=A.map((row,i)=>row.map(x=>mod(x,n)).concat(
  Array.from({length:size},(_,j)=>i===j?1:0)
 ));
 for(let col=0;col<size;col++){
  let pivot=col;
  while(pivot<size&&aug[pivot][col]===0)pivot++;
  if(pivot===size)return null;
  [aug[col],aug[pivot]]=[aug[pivot],aug[col]];
  const iv=inverseMod(aug[col][col],n);
  if(iv===null)return null;
  aug[col]=aug[col].map(x=>mod(x*iv,n));
  for(let r=0;r<size;r++)if(r!==col){
   const factor=aug[r][col];
   aug[r]=aug[r].map((x,j)=>mod(x-factor*aug[col][j],n));
  }
 }
 return aug.map(row=>row.slice(size));
}
const det=determinantMod(M,29);
assert.equal(det,17);
const Minv=matrixInverse(M,29);
assert(Minv,'Hill key must be invertible mod29');
const MT=transpose(M),MinvT=transpose(Minv);
function mulMatVec(A,v){return A.map(row=>mod(row.reduce((s,x,j)=>s+x*v[j],0),29));}
function mulVecMat(v,A){return A[0].map((_,j)=>mod(v.reduce((s,x,i)=>s+x*A[i][j],0),29));}
function transform(sequence,A,orientation){
 assert.equal(sequence.length%5,0);
 const out=[];
 for(let i=0;i<sequence.length;i+=5){
  const block=sequence.slice(i,i+5);
  out.push(...(orientation==='column'?mulMatVec(A,block):mulVecMat(block,A)));
 }
 return out;
}
const synthetic=transform(input,M,'column');
assert.deepEqual(transform(synthetic,Minv,'column'),input);
const render=a=>a.map(x=>corpus.translit[x]).join('');
const variants=[
 ['M',M],['M-transpose',MT],['M-inverse',Minv],['M-inverse-transpose',MinvT]
];
const outputs=[];
for(const [name,A] of variants){
 for(const orientation of ['column','row']){
  const plaintext=transform(input,A,orientation);
  outputs.push({matrix:name,orientation,plaintext:render(plaintext)});
 }
}
console.log(JSON.stringify({
 source:{
  squareRows:[21,22,23,24,25],
  squareColumns:[1,2,3,4,5],
  corners:[square[0][0],square[0][4],square[4][0],square[4][4]],
  matrixMod29:M,
  determinantMod29:det,
  inverseMod29:Minv,
  p55Runes:76,
  excludedLeadingCarry:'NG',
  completeRunes:75,
  blockCount:15
 },
 tests:{
  matrices:['M','M^T','M^-1','(M^-1)^T'],
  vectorConventions:['column','row'],
  syntheticRoundTrip:'PASS',
  outputs
 },
 conclusion:'The p50 square is invertible mod29, but all direct/inverse and row/column Hill-5 readings fail to yield readable p55 plaintext.'
},null,2));
