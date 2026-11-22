'use strict';
/**
 * Two genuine 2014 1033-sum magic squares: source-aligned, full-rank
 * physical GP29 7->5 intertwiner for the quadratic Frobenius trace of the
 * seven-square, and complete 2-rune lossless sidecar. Original LP2 receivers.
 * Node.js 22 CommonJS, Windows 11, read-only, zero dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(base,
  'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const tables = source.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(tables.map(t => t.length), [5, 7, 5]);
assert(tables[1].every(row => row.reduce((a,b) => a+b,0) === 1033));
assert(tables[2].every(row => row.reduce((a,b) => a+b,0) === 1033));
const corpus = JSON.parse(fs.readFileSync(path.join(base,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(path.join(base,
  'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const p55Ink = annotations.pages.find(p => p.page === 55);
assert.deepEqual(p55Ink.large_punctuation, [[76,13,'red']]);

const mod = n => ((n % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inv(x) {
  for(let z=1;z<29;z+=1) if(mod(x*z)===1) return z;
  throw Error('nonunit GF29');
}
/** @param {number} n @returns {number[][]} */
const eye = n => Array.from({length:n},(_,i) =>
  Array.from({length:n},(_,j)=>+(i===j)));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function mult(A,B) {
  assert.equal(A[0].length,B.length);
  return A.map(r=>B[0].map((_,j)=>mod(
    r.reduce((sum,x,k)=>sum+x*B[k][j],0))));
}
/** @param {number[][]} M @param {number[]} b @returns {number[]} */
const matvec = (M,b) => M.map(r=>mod(
  r.reduce((sum,x,j)=>sum+x*b[j],0)));
/** @param {number[][]} M @returns {number[][]} */
const transpose = M => M[0].map((_,j)=>M.map(r=>r[j]));
/** @param {number[][]} A @param {number[][]} B */
const add = (A,B) => A.map((r,i)=>r.map((v,j)=>mod(v+B[i][j])));
/** @param {number[][]} M @param {number} scalar */
const scale = (M,scalar) => M.map(r=>r.map(v=>mod(v*scalar)));
/** @param {number[][]} B @returns {number[][]} */
function inverse(B) {
  const n=B.length,I=eye(n);
  const A=B.map((r,i)=>[...r.map(mod),...I[i]]);
  for(let j=0;j<n;j+=1) {
    let k=-1;
    for(let i=j;i<n;i+=1) if(A[i][j]){k=i;break;}
    assert(k>=0,'invertible carrier');
    [A[j],A[k]]=[A[k],A[j]];
    const t=inv(A[j][j]);
    A[j]=A[j].map(x=>mod(x*t));
    for(let i=0;i<n;i+=1) {
      if(i===j)continue;
      const q=A[i][j];
      A[i]=A[i].map((v,k)=>mod(v-q*A[j][k]));
    }
  }
  return A.map(r=>r.slice(n));
}
/** RREF nullspace, first free coordinate canonical before normalization. */
function nullspace(M) {
  const A=M.map(r=>r.map(mod)),pivots=[];
  for(let row=0,col=0;row<A.length&&col<A[0].length;col+=1) {
    let pivot=-1;
    for(let k=row;k<A.length;k+=1) if(A[k][col]){pivot=k;break;}
    if(pivot<0)continue;
    [A[row],A[pivot]]=[A[pivot],A[row]];
    const scalar=inv(A[row][col]);
    A[row]=A[row].map(v=>mod(v*scalar));
    for(let i=0;i<A.length;i+=1) {
      if(i===row)continue;
      const factor=A[i][col];
      A[i]=A[i].map((v,j)=>mod(v-factor*A[row][j]));
    }
    pivots.push(col);
    row+=1;
  }
  const free=Array.from({length:A[0].length},(_,i)=>i)
    .filter(i=>!pivots.includes(i));
  return free.map(col=>{
    const v=Array(A[0].length).fill(0);v[col]=1;
    for(let i=0;i<pivots.length;i+=1) {
      v[pivots[i]]=mod(-A[i][col]);
    }
    const first=v.find(x=>x!==0);
    return v.map(x=>mod(x*inv(first)));
  });
}
/** Monic polynomial coefficients low-degree first. */
function atMatrix(poly,M) {
  let out=Array.from({length:M.length},()=>Array(M.length).fill(0));
  let power=eye(M.length);
  for(const factor of poly) {
    out=add(out,scale(power,factor));
    power=mult(power,M);
  }
  return out;
}
const M=tables[1].map(r=>r.map(mod));
const B=tables[2].map(r=>r.map(mod));
const factors=[
  {name:'C', value:5, poly:[16,24,1]},
  {name:'H', value:8, poly:[21,1]},
  {name:'A', value:24, poly:[5,1]},
  {name:'NG',value:21,poly:[8,8,1]},
  {name:'E', value:18,poly:[11,1]},
];
const cols7=[];
for(const f of factors) {
  const space=nullspace(atMatrix(f.poly,M));
  assert.equal(space.length,f.poly.length-1);
  const v=space[0];
  cols7.push(v);
  if(f.poly.length===3) cols7.push(matvec(M,v));
}
assert.equal(cols7.length,7);
const S7=transpose(cols7),Q7=inverse(S7);
assert.deepEqual(mult(S7,Q7),eye(7));
const cols5=factors.map(f=>{
  const space=nullspace(add(B,scale(eye(5),-f.value)));
  assert.equal(space.length,1);
  return space[0];
});
const S5=transpose(cols5),Q5=inverse(S5);
assert.deepEqual(mult(S5,Q5),eye(5));
const trace=[
 [2,5,0,0,0,0,0],
 [0,0,1,0,0,0,0],
 [0,0,0,1,0,0,0],
 [0,0,0,0,2,21,0],
 [0,0,0,0,0,0,1],
 [0,1,0,0,0,0,0],
 [0,0,0,0,0,1,0],
];
// Independent original-source mirror-sector signature: the same five
// CHANGE eigenvalue labels have opposite reversal parities in the two
// genuine historical squares, except the uniform row-sum eigenvalue E.
// This is not enforced during RREF construction or in the source matrix.
const reverse7=eye(7).map(row=>[...row].reverse());
const reverse5=eye(5).map(row=>[...row].reverse());
const classify=(v,J)=>{
  const reversed=matvec(J,v);
  if(reversed.every((x,i)=>x===v[i]))return 'even';
  if(reversed.every((x,i)=>x===mod(-v[i])))return 'odd';
  throw Error('mixed original reflection eigenmode');
};
const sevenParities=[];
let cursor=0;
for(const factor of factors) {
  const modes=cols7.slice(cursor,cursor+factor.poly.length-1);
  const parities=modes.map(v=>classify(v,reverse7));
  assert.equal(new Set(parities).size,1);
  sevenParities.push(parities[0]);
  cursor+=factor.poly.length-1;
}
const fiveParities=cols5.map(v=>classify(v,reverse5));
assert.deepEqual(sevenParities,['even','odd','even','odd','even']);
assert.deepEqual(fiveParities,['odd','even','odd','even','even']);

const D=mult(trace,Q7);
const undoD=inverse(D);
assert.deepEqual(mult(D,undoD),eye(7));
const L=mult(S5,D.slice(0,5));
assert.deepEqual(L,[
 [22,18,28,21,20,18,19],
 [10,7,1,2,23,9,7],
 [19,27,10,25,11,23,2],
 [14,12,27,19,20,14,11],
 [2,3,1,0,22,3,28],
]);
// Source-determined unique factorwise trace polynomial CRT modulo29.
const T=[19,25,22,1,14,3,3];
const N=atMatrix(T,M);
assert.deepEqual(N,[
 [24,10,3,19,1,25,23],
 [16,0,9,20,10,15,6],
 [4,24,4,5,27,13,28],
 [4,18,22,17,22,18,4],
 [28,13,27,5,4,24,4],
 [6,15,10,20,9,0,16],
 [23,25,1,19,3,10,24],
]); 
assert.deepEqual(mult(L,N),mult(B,L),
  'rank5 cross-source intertwiner L T(M)=B L');
// Entire nonuniform five-channel sector flips mirror parity. The sole
// row-sum mode is preserved, yielding the exact source-only rank-one
// anti-commutator (2/7)*U = 21*U modulo29.
const reflectionAnticommutator=add(mult(reverse5,L),mult(L,reverse7));
assert.deepEqual(reflectionAnticommutator,
  Array.from({length:5},()=>Array(7).fill(21)));
assert.deepEqual(L.map(row=>mod(row.reduce((a,b)=>a+b,0))),
  [1,1,1,1,1]);

assert.notDeepEqual(mult(L,M),mult(B,L),
  'no raw cross-source intertwiner of same rank');
// The original M spectrum shares only the three linear roots H/A/E
// with B; therefore no full rank5 raw map X M=B X can exist.
const original = [
 ['p8-14',8,14,1729], ['p33-39',33,39,1680],
 ['p54-55',54,55,308],
].map(([label,begin,end,length])=>{
  const source=corpus.pages.filter(p=>p.page>=begin&&p.page<=end)
    .flatMap(p=>p.indices);
  assert.equal(source.length,length);
  assert.equal(source.length%7,0);
  return {label,source};
});
const p55=corpus.pages.find(p=>p.page===55);
assert.equal(p55.indices.length,76);
original.push({label:'p55+13dot',
  source:[...p55.indices,13]});
/** Full physical M7->B5 Frobenius trace bridge, residual sidecar 2. */
function encode(input) {
  assert.equal(input.length%7,0);
  const plaintext=[],sidecar=[];
  for(let k=0;k<input.length;k+=7) {
    const chunk=input.slice(k,k+7);
    const v=matvec(D,chunk);
    plaintext.push(...matvec(S5,v.slice(0,5)));
    sidecar.push(...v.slice(5));
    const stored=[...matvec(Q5,matvec(S5,v.slice(0,5))),...v.slice(5)];
    assert.deepEqual(matvec(undoD,stored),chunk);
  }
  return {plaintext,sidecar};
}
/** @param {number[]} a */
function ioc(a) {
  const hist=Array(29).fill(0);
  for(const v of a) hist[v]+=1;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const samples=[];
for(const {label,source} of original) {
  const result=encode(source);
  assert(result.plaintext.length===source.length*5/7);
  assert(result.sidecar.length===source.length*2/7);
  samples.push({label,originalLength:source.length,
    decodedLength:result.plaintext.length,
    sidecarLength:result.sidecar.length,
    decodedIoc:ioc(result.plaintext),
    sidecarIoc:ioc(result.sidecar),
    opening:result.plaintext.slice(0,35)
      .map(v=>corpus.translit[v]).join('')});
}
const known=corpus.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const plant=[];
for(let i=0;i<95;i+=5) {
  const coord=matvec(Q5,known.slice(i,i+5));
  plant.push(...matvec(undoD,[...coord,0,0]));
}
assert.equal(plant.length,133);
const decoded=encode(plant);
assert.deepEqual(decoded.plaintext,known);
assert(decoded.sidecar.every(x=>x===0));
assert(samples.filter(x=>x.label!=='p55+13dot')
  .every(x=>x.decodedIoc<0.04));
console.log(JSON.stringify({
  source:'original Stage10 seven and five 1033 magic squares',
  historicalFieldTracePolynom:T,
  physicalRank5Intertwiner:L,
  originalSevenMirrorParity:sevenParities,
  originalFiveMirrorParity:fiveParities,
  physicalReflectionAnticommutator:reflectionAnticommutator,
  fullRankSevenEncoder:D,
  satisfied:'L*T(M7) = B5*L; L*M7 != B5*L',
  independentlyCompleteOriginalReceivers:samples,
  plantedP57:'all 95 native GP rune symbols recovered from 133 generated source symbols with two-null-sidecar register',
  verdict:'Exact cross-source lossless intertwiner but no unknown native GP plaintext or authored 7to5 instruction.',
},null,2));
