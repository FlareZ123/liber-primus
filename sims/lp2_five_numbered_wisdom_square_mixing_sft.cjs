'use strict';
/**
 * Original-source, five-numbered-passage Hill-5 cross-stream mixer.
 *
 * Original LP2 p36-p38 displays numbered 1..5 passages of 139/91/98/96/129
 * runes; the original LP1 p05 Wisdom page supplies a 5x5 source magic square
 * and explicitly mentions prime weights and Euler's totient. Each original
 * 5-rune column of the 91-position shared core is mixed by one fixed source
 * 5x5 matrix over GF29. Four predeclared models: raw vs totient cell weights,
 * square in printed/transpose orientation. No unknown secret key or clocks.
 *
 * Does not claim Cicada selected the mixer; source gives no 'apply Hill5'
 * instruction and the remaining 98 runes are deliberately outside scope.
 *
 * Standalone read-only Node22 CommonJS SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
assert.equal(corpus.runes.length,29);
/** @param {number} p */
const page=p=>corpus.pages.find(q=>q.page===p).indices;
const parts=[
  page(36).slice(99,238),
  page(37).slice(0,91),
  page(37).slice(91,189),
  [...page(37).slice(189,228),...page(38).slice(0,57)],
  page(38).slice(57,186)
];
const counts=parts.map(p=>p.length);
assert.deepEqual(counts,[139,91,98,96,129]);
assert.equal(counts.reduce((s,n)=>s+n,0),553);
const coreLength=Math.min(...counts);
assert.equal(coreLength,91);
const original=parts.map(p=>p.slice(0,coreLength));
const tailCount=parts.reduce((s,p)=>s+p.length-coreLength,0);
assert.equal(tailCount,98);
const sourceSquare=[
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
];
for(const row of sourceSquare)assert.equal(row.reduce((s,v)=>s+v,0),1033);
for(let j=0;j<5;j++)assert.equal(sourceSquare.reduce((s,r)=>s+r[j],0),1033);
const mod=x=>((x%29)+29)%29;
/** @param {number} n */
function phi(n){
  let result=n,rest=n;
  for(let k=2;k*k<=rest;k++){
    if(rest%k===0){
      while(rest%k===0)rest/=k;
      result-=result/k;
    }
  }
  if(rest>1)result-=result/rest;
  return result;
}
/** @param {number[][]} m */
const transpose=m=>m.map((_,i)=>m.map(r=>r[i]));
/** @param {number[][]} m @param {number[]} v */
const mul=(m,v)=>m.map(row=>mod(row.reduce((a,b,i)=>a+b*v[i],0)));
/** @param {number[][]} m */
function inverseAndDet(m){
  const a=m.map((r,i)=>[...r.map(mod),...Array.from({length:5},(_,j)=>+(i===j))]);
  let determinant=1;
  for(let k=0;k<5;k++){
    const pivot=a.findIndex((v,i)=>i>=k&&v[k]!==0);
    assert(pivot>=0,'singular original square');
    if(pivot!==k){
      [a[k],a[pivot]]=[a[pivot],a[k]];
      determinant=mod(-determinant);
    }
    const value=a[k][k];
    determinant=mod(determinant*value);
    const reciprocal=Array.from({length:28},(_,i)=>i+1)
      .find(i=>mod(i*value)===1);
    assert(reciprocal!==undefined);
    a[k]=a[k].map(v=>mod(v*reciprocal));
    for(let i=0;i<5;i++){
      if(i===k)continue;
      const multiplier=a[i][k];
      a[i]=a[i].map((v,j)=>mod(v-multiplier*a[k][j]));
    }
  }
  const inv=a.map(r=>r.slice(5));
  for(let i=0;i<5;i++)
    for(let j=0;j<5;j++)
      assert.equal(mul(m,inv.map(r=>r[j]))[i],+(i===j));
  return {inverse:inv,determinant};
}
/** @param {number[]} values */
function ioc(values){
  const hist=Array(29).fill(0);
  for(const v of values)hist[v]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[][]} rows */
const flatten=rows=>rows.flat();
const cases=[
  ['raw','column',sourceSquare],
  ['raw','row',transpose(sourceSquare)],
  ['totient','column',sourceSquare.map(r=>r.map(phi))],
  ['totient','row',transpose(sourceSquare.map(r=>r.map(phi)))]
];
const expected=[
  ['raw','column',3,0.033586677639541075],
  ['raw','row',3,0.03494215036065256],
  ['totient','column',28,0.03408045698794598],
  ['totient','row',28,0.03471946555646996]
];
assert.equal(ioc(flatten(original)),0.03448709880427942);
const results=[];
for(const [index,[model,orientation,matrix]] of cases.entries()){
  const {inverse,determinant}=inverseAndDet(matrix);
  const reconstructed=Array.from({length:5},()=>[]);
  for(let position=0;position<coreLength;position++){
    const cipher=original.map(r=>r[position]);
    const plain=mul(inverse,cipher);
    assert.deepEqual(mul(matrix,plain),cipher);
    for(let row=0;row<5;row++)reconstructed[row].push(plain[row]);
  }
  const native=page(57); // Solved GP plaintext, not cipher/hidden reference.
  assert.equal(native.length,95);
  const target=Array.from({length:5},(_,row)=>
    Array.from({length:coreLength},(_,i)=>native[(i*5+row)%native.length]));
  let plantedCount=0;
  for(let i=0;i<coreLength;i++){
    const plain=target.map(r=>r[i]);
    const plant=mul(matrix,plain);
    const output=mul(inverse,plant);
    assert.deepEqual(output,plain);
    plantedCount+=output.length;
  }
  assert.equal(plantedCount,455);
  const score=ioc(flatten(reconstructed));
  const [wantModel,wantOrientation,wantDet,wantIoc]=expected[index];
  assert.equal(model,wantModel);
  assert.equal(orientation,wantOrientation);
  assert.equal(determinant,wantDet);
  assert(Math.abs(score-wantIoc)<1e-14);
  results.push({
    model,orientation,determinant,
    originalCiphertextRerecovered:455,
    nativePlantedPlaintextRecovered:455,
    coreIoc:score,
    firstEach:reconstructed.map(r=>r.slice(0,33).map(i=>corpus.translit[i]).join('')),
    perPassageIoc:reconstructed.map(ioc)
  });
}
console.log(JSON.stringify({
  interpretation:'four source-anchored but not historically instructed Hill5 paragraph mixers',
  result:'No recovered unknown original LP2 plaintext or independently sourced key',
  passageLengths:counts,
  commonCoreSymbols:455,
  unmodifiedTailSymbols:tailCount,
  ciphertextIoc:ioc(flatten(original)),
  results
},null,2));
