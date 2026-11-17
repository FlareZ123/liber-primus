'use strict';
/**
 * Source-constrained base59 256-node tree, clear p57 95-leaf labels,
 * and independently solved p56 85 internal labels.
 * Exact all-secret 29-output lookup-table obstruction on original ciphertext.
 * Seven first-party-motivated child reductions, 60 independent source layouts,
 * 420 original tests and 420 exact original-shaped synthetic positive controls.
 * Windows 11, Node.js 22, CommonJS; read-only SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const load = name => JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', name), 'utf8'));
const grid = load('base60-grid.json');
const corpus = load('lp2-corpus.json');
const abc = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
assert.equal(abc.length, 59);
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const next = tokens.map(x => abc.indexOf(x[0])*59 + abc.indexOf(x[1]));
assert.ok(next.every(x => x >= 0 && x < 256));
const children = Array.from({length:256},()=>[]);
const indeg = Array(256).fill(0);
for(let i=0;i<256;i++){ indeg[next[i]]++; if(next[i] !== i) children[next[i]].push(i); }
const rootNode = next.findIndex((v,i)=>i===v);
assert.equal(rootNode, 189);
const pre=[], post=[];
/** @param {number} i */
function visit(i){pre.push(i); for(const child of children[i]) visit(child); post.push(i);}
visit(rootNode);
assert.equal(new Set(pre).size,256);
const leaves = {
  address: Array.from({length:256},(_,i)=>i).filter(i=>indeg[i]===0),
  dfs: pre.filter(i=>indeg[i]===0)
};
const internals = {
  address: Array.from({length:256},(_,i)=>i).filter(i=>indeg[i]>0),
  preorder: pre.filter(i=>indeg[i]>0),
  postorder: post.filter(i=>indeg[i]>0)
};
assert.equal(leaves.address.length,95);
assert.equal(internals.address.length,161);
const page = n => corpus.pages.find(p=>p.page===n).indices;
const p57 = page(57),c56 = page(56);
assert.deepEqual([page(55).length,c56.length,p57.length],[76,85,95]);
/** @param {number} x @returns {number} */
const mod=x=>((x%29)+29)%29;
/** @param {number} n @returns {number[]} */
function firstPrimes(n){const out=[];for(let x=2;out.length<n;x++){
  if(out.every(p=>p*p>x||x%p!==0))out.push(x);
}return out;}
const ps=firstPrimes(84);
let clock=0;
const p56=c56.map((v,i)=>i===56?0:mod(v-(ps[clock++]-1)));
assert.equal(clock,84);
assert.equal(p56.map(x=>corpus.translit[x]).join(''),
 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

const breadth=[];
const queue=[rootNode];
for (let i=0;i<queue.length;i++) {
  const node=queue[i];
  breadth.push(node);
  queue.push(...children[node]);
}
assert.equal(breadth.length,256);
const leafOrders={
  address:leaves.address,
  depthFirst:leaves.dfs,
  breadthFirst:breadth.filter(node=>indeg[node]===0)
};
const internalOrders={
  address:internals.address,
  depthFirst:internals.preorder,
  postorder:internals.postorder,
  breadthFirst:breadth.filter(node=>indeg[node]>0),
  inward:breadth.filter(node=>indeg[node]>0).reverse()
};
const sourcePrimes=corpus.prime;
const reducers={
  indexSum: list=>mod(list.reduce((s,x)=>s+x,0)),
  indexProduct: list=>mod(list.reduce((s,x)=>s*x,1)),
  primeSum: list=>mod(list.reduce((s,x)=>s+sourcePrimes[x],0)),
  primeProduct: list=>mod(list.reduce((s,x)=>s*mod(sourcePrimes[x]),1)),
  totientSum: list=>mod(list.reduce((s,x)=>s+sourcePrimes[x]-1,0)),
  totientProduct: list=>mod(list.reduce((s,x)=>s*mod(sourcePrimes[x]-1),1)),
  indexXor: list=>mod(list.reduce((s,x)=>s^x,0))
};
/** @param {(number|null)[]} values @param {number[]} internalOrder @returns {{input:number[],output:number}[]} */
function constraints(values,internalOrder){
  return internalOrder.filter(node=>values[node]!==null&&
    children[node].every(ch=>values[ch]!==null)).map(node=>({
      input:children[node].map(ch=>values[ch]),
      output:values[node]
    }));
}
/** @param {{input:number[],output:number}[]} observations @param {(x:number[])=>number} reducer */
function contradictions(observations,reducer){
  const counts=Array.from({length:29},()=>Array(29).fill(0));
  for(const row of observations) counts[reducer(row.input)][row.output]++;
  let changes=0,inputs=0,comparedPairs=0,conflictPairs=0;
  for(const hist of counts){
    const size=hist.reduce((sum,x)=>sum+x,0);
    if(size===0)continue;
    inputs++;
    changes+=size-Math.max(...hist);
    comparedPairs+=size*(size-1)/2;
    conflictPairs+=(size*size-hist.reduce((sum,x)=>sum+x*x,0))/2;
  }
  return {changes,inputs,comparedPairs,conflictPairs};
}
const cases=[];
let positiveCount=0;
for(const [leafName,leafOrder] of Object.entries(leafOrders))
for(const [internalName,internalOrder] of Object.entries(internalOrders))
for(const reverse of [false,true])
for(const p56First of [false,true]){
  const values=Array(256).fill(null);
  const leafRunes=reverse?p57.slice().reverse():p57;
  leafOrder.forEach((node,i)=>{values[node]=leafRunes[i];});
  const at=p56First?0:76;
  for(let i=0;i<85;i++)values[internalOrder[at+i]]=p56[i];
  const actual=constraints(values,internalOrder);
  assert.ok(actual.length>=55);
  for(const [feature,reducer] of Object.entries(reducers)){
    const observation=contradictions(actual,reducer);
    cases.push({feature,leafName,internalName,reverse,p56First,
      known:actual.length,...observation});
    // Independent planted arbitrary nonlinear 29-entry secret table:
    // the same original p57 leaves and the same 76 withheld-node locations.
    const secret=x=>mod(x*x+3*x+11);
    const plant=Array(256).fill(null);
    leafOrder.forEach((node,i)=>{plant[node]=leafRunes[i];});
    for(const node of post)if(indeg[node]>0){
      plant[node]=secret(reducer(children[node].map(ch=>plant[ch])));
    }
    const plantedKnown=plant.map((v,i)=>values[i]===null?null:v);
    const plantedRows=constraints(plantedKnown,internalOrder);
    assert.equal(plantedRows.length,actual.length);
    assert.equal(contradictions(plantedRows,reducer).changes,0);
    positiveCount++;
  }
}
assert.equal(cases.length,420);
assert.equal(positiveCount,420);
const exact=cases.filter(x=>x.changes===0);
const minima=Object.fromEntries(Object.keys(reducers).map(name=>[
  name,Math.min(...cases.filter(x=>x.feature===name).map(x=>x.changes))
]));
const best=cases.reduce((a,b)=>(a.changes<=b.changes?a:b));
assert.equal(exact.length,0);
assert.equal(best.changes,24);
console.log(JSON.stringify({
  source:'p49-51 base59 table; p56 independently decrypted; p57 clear',
  tableCells:256,root:rootNode,leaves:95,internals:161,
  independentLayouts:60,aggregateFeatures:Object.keys(reducers).length,
  allSecretTests:cases.length,knownConstraintsRange:[
    Math.min(...cases.map(x=>x.known)),Math.max(...cases.map(x=>x.known))
  ],exactOriginalModels:exact.length,
  minimumNecessaryOriginalEdits:best.changes,best,
  minimumByFeature:minima,originalShapedPositiveControls:positiveCount,
  decision:'No single global 29-entry function of any tested child aggregate can generate the authentic p56 known labels from source p57 leaves in the stated tree layouts. p55 untouched.'
},null,2));
