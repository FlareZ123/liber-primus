/**
 * Original 2014 1033 magic-square spectrum spells CHANGE over GP29.
 * Test its exact 5x5 GF29 change-of-basis matrix as a real cipher operator,
 * without optimizing any eigenvector, key, phase, word boundary or alphabet.
 * Node.js 22/CommonJS, zero dependencies.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'resources/cicada2014-openpuff-magic-squares.txt'),'utf8');
const matrices=src.trim().split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\r?\n/).map(row=>row.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(a=>a.length),[5,7,5]);
const a=matrices[0], b=matrices[2], N=5, Q=29;
const mod=x=>(x%Q+Q)%Q;
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw Error('non-unit');};
const mul=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce((s,x,k)=>s+x*B[k][j],0))));
const transpose=A=>A[0].map((_,i)=>A.map(row=>row[i]));
/**
 * Reduced row echelon kernel for a simple rational eigenvalue.
 * Fix first nonzero coordinate to 1. No plaintext fitting.
 * @param {number[][]} m
 */
function eigenvector(m){
  let t=m.map(row=>row.map(mod)),pivot=[],rank=0;
  for(let j=0;j<N;j++){
    let i=t.findIndex((r,k)=>k>=rank&&r[j]!==0);
    if(i<0)continue;
    [t[rank],t[i]]=[t[i],t[rank]];
    let f=inv(t[rank][j]);t[rank]=t[rank].map(x=>mod(f*x));
    for(let k=0;k<N;k++)if(k!==rank&&t[k][j]){
      const z=t[k][j];t[k]=t[k].map((x,c)=>mod(x-z*t[rank][c]));
    }
    pivot.push(j);rank++;
  }
  const free=Array.from({length:N},(_,i)=>i).filter(i=>!pivot.includes(i));
  assert.equal(free.length,1);
  let v=new Array(N).fill(0);v[free[0]]=1;
  for(let r=rank-1;r>=0;r--)v[pivot[r]]=mod(-t[r].reduce((s,x,c)=>c===pivot[r]?s:s+x*v[c],0));
  const f=inv(v.find(x=>x!==0));return v.map(x=>mod(f*x));
}
function invert(A){
  let r=A.map((v,i)=>v.concat(Array.from({length:N},(_,j)=>Number(i===j))));
  for(let j=0;j<N;j++){
    const i=r.findIndex((row,k)=>k>=j&&row[j]!==0);
    assert.ok(i>=0,'singular source matrix');
    [r[j],r[i]]=[r[i],r[j]];
    const f=inv(r[j][j]);r[j]=r[j].map(x=>mod(x*f));
    for(let k=0;k<N;k++)if(k!==j&&r[k][j]){
      const x=r[k][j];r[k]=r[k].map((v,c)=>mod(v-x*r[j][c]));
    }
  }
  return r.map(row=>row.slice(N));
}
const ids=[5,8,24,21,18], ev=ids.map(l=>eigenvector(b.map((r,i)=>r.map((v,j)=>mod(v-(i===j?l:0))))));
const E=Array.from({length:N},(_,i)=>ev.map(v=>v[i])), Ei=invert(E);
const eigB=mul(mul(Ei,b),E);
assert.deepEqual(eigB,Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>i===j?ids[i]:0)));
const original=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.equal(ids.map(i=>original.translit[i]).join(''),'CHANGE');
// This two-square conjugacy exposes a sparse 2+2+1 decomposition:
// the 3301 square is not simultaneously diagonal, but its rational vs
// quadratic eigenpairs separate in the 1033 square's eigenbasis.
const cross=mul(mul(Ei,a),E);
assert.deepEqual(cross,[
  [24,0,9,0,0],
  [0,17,0,9,0],
  [24,0,5,0,0],
  [0,23,0,12,0],
  [0,0,0,0,24]
]);
const pg=k=>original.pages.find(p=>p.page===k).indices;
const frames={
  'p3_to_p7_5page_scroll':original.pages.filter(p=>p.page>=3&&p.page<=7).flatMap(p=>p.indices),
  'p8_single_source_page':pg(8)
};
assert.equal(frames.p3_to_p7_5page_scroll.length,1145);
assert.equal(frames.p8_single_source_page.length,255);
/** Apply one fixed 5x5 matrix in source adjacent-fives or five equal bands. */
function apply(input,M,bands){
  const L=input.length/N;
  assert.equal(L,Math.floor(L));
  const out=new Array(input.length);
  for(let k=0;k<L;k++){
    const at=Array.from({length:N},(_,j)=>bands?k+j*L:5*k+j);
    const v=at.map(i=>input[i]);
    for(let i=0;i<N;i++)out[at[i]]=mod(M[i].reduce((s,z,j)=>s+z*v[j],0));
  }
  return out;
}
function ioc(v){const n=new Array(Q).fill(0);for(const x of v)n[x]++;return n.reduce((s,k)=>s+k*(k-1),0)/(v.length*(v.length-1));}
const modes=[['E',E,Ei],['Einverse',Ei,E],['Etranspose',transpose(E),transpose(Ei)],['EinverseTranspose',transpose(Ei),transpose(E)]];
const controls=pg(57);
assert.equal(controls.length,95);
const result={basis:E,changeOfBasisA:cross,sourceWord:'CHANGE',frames:{}};
for(const [name,frame]of Object.entries(frames)){
  let tests=[];
  for(const [operator,M,Minv]of modes)for(const bands of [false,true]){
    const decoded=apply(frame,M,bands);
    assert.deepEqual(apply(decoded,Minv,bands),frame,'original roundtrip');
    // Known 95-rune source-native plaintext planted to source frame length.
    const native=Array.from({length:frame.length},(_,i)=>controls[i%controls.length]);
    const encrypted=apply(native,Minv,bands);
    assert.deepEqual(apply(encrypted,M,bands),native,'native plant');
    tests.push({operator,layout:bands?'five_bands':'adjacent_fives',ioc:ioc(decoded),first24:decoded.slice(0,24).map(j=>original.translit[j]).join('')});
  }
  assert.ok(tests.every(v=>v.ioc<0.04),name+' got native-looking collision');
  result.frames[name]={rawIoC:ioc(frame),bestIoC:Math.max(...tests.map(t=>t.ioc)),tests};
}
console.log(JSON.stringify(result,null,2));
console.log('PASS: 2014 CHANGE eigenbasis and two-square cross-basis, all 16 original inverses and native plants');
