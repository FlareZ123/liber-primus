'use strict';
/**
 * Source-fixed five-numbered-item 1033/3301 dual magic-square test.
 * Both integer matrices appeared in authentic Cicada 2014.
 * Original 5 numbered units have lengths 139,91,98,96,129.
 * Frozen common prefix is 91 symbols per unit, no fitted keys.
 * Windows 11 / Node.js 22 CommonJS; read-only, single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = corpus.pages;
const page = n => source.find(p => p.page === n).indices;
const mod = n => ((n % 29) + 29) % 29;
const A = [[272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],[18,320,130,199,366],[151,131,341,138,272]];
const B = [[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]];
const items = [page(36).slice(99,238),page(37).slice(0,91),page(37).slice(91,189),page(37).slice(189,228).concat(page(38).slice(0,57)),page(38).slice(57,186)];
assert.deepEqual(items.map(x => x.length), [139,91,98,96,129]);
const first91 = items.map(x => x.slice(0,91));
/** @param {number[][]} X @param {number[][]} Y */
function multiply(X, Y) {
  return X.map(row => Y[0].map((_,j) => mod(row.reduce((s,v,k) => s + v*Y[k][j],0))));
}
/** @param {number[][]} matrix */
function eliminate(matrix) {
  const n=matrix.length;
  const a=matrix.map((r,i) => r.map(mod).concat(Array.from({length:n},(_,j) => Number(i===j))));
  let determinant=1;
  for(let i=0;i<n;i++) {
    let pivot=i;
    while(pivot<n && !a[pivot][i]) pivot++;
    assert.ok(pivot<n,'singular modulo29');
    if(pivot!==i) { [a[i],a[pivot]]=[a[pivot],a[i]]; determinant=mod(-determinant); }
    const lead=a[i][i], inverse=Array.from({length:29},(_,x)=>x).find(x=>mod(x*lead)===1);
    assert.notEqual(inverse,undefined);
    determinant=mod(determinant*lead);
    a[i]=a[i].map(v=>mod(v*inverse));
    for(let j=0;j<n;j++) if(j!==i) {
      const f=a[j][i];
      a[j]=a[j].map((v,k)=>mod(v-f*a[i][k]));
    }
  }
  return {determinant,inverse:a.map(r=>r.slice(n))};
}
/** @param {number[][]} matrix @param {number[][]} lanes */
function apply(matrix,lanes) {
  const result=Array.from({length:5},()=>[]);
  for(let j=0;j<lanes[0].length;j++) {
    const column=lanes.map(x=>x[j]);
    for(let k=0;k<5;k++) result[k].push(mod(matrix[k].reduce((s,x,i)=>s+x*column[i],0)));
  }
  return result;
}
/** @param {number[]} arr */
function ioc(arr) {
  const hist=Array(29).fill(0);
  for(const x of arr) hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
assert.equal(eliminate(A).determinant,3);
assert.equal(eliminate(B).determinant,10);
const sourceNative=page(57);
assert.equal(sourceNative.length,95);
const nativeLanes=Array.from({length:5},(_,k)=>Array.from({length:91},(_,i)=>sourceNative[(i+19*k)%95]));
const matrices={AB:multiply(A,B),BA:multiply(B,A)};
const outcome={source:{items:items.map(a=>a.length),complete:553,originalIoc:ioc(items.flat()),p57ClearIoc:ioc(sourceNative)},matrices:{}};
for(const [name,M] of Object.entries({...matrices,invAB:eliminate(matrices.AB).inverse,invBA:eliminate(matrices.BA).inverse})) {
  const {determinant,inverse}=eliminate(M);
  assert.equal(determinant,1);
  assert.deepEqual(multiply(M,inverse),Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>Number(i===j))));
  const originalOutput=apply(M,first91);
  assert.deepEqual(apply(inverse,originalOutput),first91);
  const nativeOutput=apply(M,nativeLanes);
  assert.deepEqual(apply(inverse,nativeOutput),nativeLanes);
  outcome.matrices[name]={determinant,originalIoc:ioc(originalOutput.flat()),originalPerLaneIoc:originalOutput.map(ioc),nativeDecodedIoc:ioc(apply(inverse,nativeOutput).flat())};
}
// A second source-fixed interpretation: run a 5-vector key state under both
// squares, seeded solely by the five printed red item labels 1..5. No key fitting.
// Both composites have period 28, a natural GF29 multiplicative-group period.
outcome.period28 = {};
const identity = Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>Number(i===j)));
for(const [name,M] of Object.entries(matrices)) {
  let state=[1,2,3,4,5], keys=[];
  for(let t=0;t<28;t++) { keys.push(state); state=M.map(row=>mod(row.reduce((sum,x,j)=>sum+x*state[j],0))); }
  assert.deepEqual(state,[1,2,3,4,5]);
  const key91=Array.from({length:91},(_,t)=>keys[t%28]);
  outcome.period28[name]={};
  for(const sign of [-1,1]) {
    const plain=first91.map((lane,i)=>lane.map((x,t)=>mod(x+sign*key91[t][i])));
    const replay=plain.map((lane,i)=>lane.map((x,t)=>mod(x-sign*key91[t][i])));
    assert.deepEqual(replay,first91);
    const plantedCipher=nativeLanes.map((lane,i)=>lane.map((x,t)=>mod(x-sign*key91[t][i])));
    const plantedDecode=plantedCipher.map((lane,i)=>lane.map((x,t)=>mod(x+sign*key91[t][i])));
    assert.deepEqual(plantedDecode,nativeLanes);
    outcome.period28[name][sign<0?'subtract':'add']={originalIoc:ioc(plain.flat()),originalPerLaneIoc:plain.map(ioc),nativeDecodedIoc:ioc(plantedDecode.flat())};
  }
}
assert.ok(outcome.matrices.AB.originalIoc<0.04);
assert.ok(outcome.matrices.BA.originalIoc<0.04);
assert.ok(outcome.matrices.invAB.originalIoc<0.04);
assert.ok(outcome.matrices.invBA.originalIoc<0.04);
console.log('PASS exact source and 455-rune native positive controls');
console.log(JSON.stringify(outcome,null,2));
