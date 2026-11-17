'use strict';
/**
 * LP2 source-selected p49-51 256-byte functional graph, p57 95 leaves,
 * p55+p56 161 internal nodes. Exhausts parent = a*sum(children)
 * + b*numberOfChildren + c (mod 29), with all a,b,c in GF(29).
 *
 * Tests against the genuinely solved 85 p56 plaintext runes, with no p55
 * guesses; reports the fit on a frozen first-half train / second-half holdout.
 * Original manuscript is never fitted to unknown plaintext. Positive control
 * plants a complete tree using a known affine rule and checks exact recovery.
 * Windows 11 / Node.js 22 / CommonJS. Read-only SFT.
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
/** @param {number[]} values @param {number[]} order @returns {{i:number,sum:number,degree:number,parent:number}[]} */
function samples(values,order){
 return order.filter(i=>values[i]!==null&&children[i].every(j=>values[j]!==null))
 .map(i=>({i,sum:mod(children[i].reduce((s,j)=>s+values[j],0)),
   degree:children[i].length,parent:values[i]}));
}
/** @param {{sum:number,degree:number,parent:number}[]} x @param {number[]} params @returns {number} */
function hits(x,params){const [a,b,c]=params;return x.reduce((s,p)=>
 s+Number(mod(a*p.sum+b*p.degree+c)===p.parent),0);}
/** @param {{sum:number,degree:number,parent:number}[]} ex @returns {any} */
function exhaustive(ex){
 const split=Math.floor(ex.length/2),train=ex.slice(0,split),hold=ex.slice(split);
 let maxAll=-1,maxTrain=-1,holdAtTrain=-1,allParams=null,trainParams=null,exact=0;
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
  const p=[a,b,c], t=hits(train,p), h=hits(hold,p), both=t+h;
  if(both>maxAll){maxAll=both;allParams=p;}
  if(t>maxTrain||(t===maxTrain&&h>holdAtTrain)){
   maxTrain=t;holdAtTrain=h;trainParams=p;
  }
  if(both===ex.length)exact++;
 }
 return {knownConstraints:ex.length,train:split,hold:ex.length-split,
   bestOriginalFull:maxAll,maximumTrain:maxTrain,holdoutAtTrain:holdAtTrain,
   bestOriginalParams:allParams,trainParams,exactModels:exact};
}
const reports=[];
const weights={
  gpIndex: Array.from({length:29},(_,i)=>i),
  primeMod29: corpus.prime.map(v=>v%29)
};
for(const [label,weight] of Object.entries(weights))
for(const [leafOrderName,leafOrder] of Object.entries(leaves))
for(const [internalOrderName,internalOrder] of Object.entries(internals))
for(const reversed of [false,true])
for(const p56First of [false,true]){
 const values=Array(256).fill(null),leafText=reversed?p57.slice().reverse():p57;
 leafOrder.forEach((node,i)=>values[node]=weight[leafText[i]]);
 const start=p56First?0:76;
 for(let i=0;i<85;i++)values[internalOrder[start+i]]=weight[p56[i]];
 const constraints=samples(values,internalOrder);
 assert.ok(constraints.length>=55);
 const original=exhaustive(constraints);
 assert.equal(original.exactModels,0,'Found unexpected exact original model');
 const planted=Array(256).fill(null);
 leafOrder.forEach((node,i)=>planted[node]=weight[leafText[i]]);
 for(const i of post) if(indeg[i]>0) planted[i]=mod(7*mod(children[i].reduce(
   (s,j)=>s+planted[j],0))+5*children[i].length+3);
 const plantedKnown=planted.map((v,i)=>values[i]===null?null:v);
 const positive=samples(plantedKnown,internalOrder);
 assert.equal(positive.length,constraints.length);
 assert.equal(hits(positive,[7,5,3]),positive.length);
 const fit=exhaustive(positive);
 assert.equal(fit.exactModels>0,true,'Synthetic original-shaped tree must pass');
 reports.push({label,leafOrder:leafOrderName,internalOrder:internalOrderName,
   reversed,p56First,...original,syntheticExactModels:fit.exactModels});
}
assert.equal(reports.length,48);
const max=reports.reduce((a,b)=>a.bestOriginalFull>=b.bestOriginalFull?a:b);
const bestSplit=reports.reduce((a,b)=>a.maximumTrain>=b.maximumTrain?a:b);
const verified=reports.filter(r=>r.exactModels>0).length;
assert.equal(verified,0);
console.log(JSON.stringify({source:'original p49-51 table, solved p56, clear p57',
  tableNodes:256,root:rootNode,leaves:95,internals:161,
  family:'parent=a*sum(children)+b*degree+c mod29, all 29^3 coefficients',
  layouts:reports.length,exactOriginalModels:0,
  maximalFullFit:{matched:max.bestOriginalFull,total:max.knownConstraints,
    alignment:{label:max.label,leaf:max.leafOrder,internal:max.internalOrder,
    reverse:max.reversed,p56First:max.p56First},parameters:max.bestOriginalParams},
  highestTrainingFit:{train:bestSplit.maximumTrain,trainN:bestSplit.train,
    heldout:bestSplit.holdoutAtTrain,holdN:bestSplit.hold},
  plantedControlsPass:reports.every(r=>r.syntheticExactModels>0),
  all:reports,decision:'This complete source-shaped local affine tree law cannot reconstruct authentic p56 plaintext. No p55 plaintext/key recovered.'},null,2));
