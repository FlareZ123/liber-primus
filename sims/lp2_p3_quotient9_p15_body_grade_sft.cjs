'use strict';
// POSTPRETARGET original-p15 body language gate.
// The complete original-body input, Q9 key and raw outputs for both signs
// were immutable GitHub-committed BEFORE this script inspected either output.
// No new signs, phases, reversed keys, word-boundary resets or selectors.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),child=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const freeze=read('im-results/lp2-p3-quotient9-p15-body-pretarget-output.json');
const regen=JSON.parse(child.execFileSync(process.execPath,[path.join(__dirname,'lp2_p3_quotient9_p15_body_freeze_sft.cjs')],{encoding:'utf8'}));
assert.deepEqual(freeze,regen,'frozen original inverse file differs from source-only generator');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const mod=x=>((x%29)+29)%29;
const target=corpus.pages[15].indices.slice(20);
assert.equal(target.length,139);assert.deepEqual(freeze.originalReceiver.indices,target);
assert.deepEqual(freeze.key,[5,5,14,9,10,4,27,17,25]);
const solved=corpus.pages[56].indices.concat(corpus.pages[57].indices);
function ioc(xs){
 const n=xs.length,counts=Array(29).fill(0);for(const x of xs)counts[x]++;
 return counts.reduce((s,n)=>s+n*(n-1),0)/(n*(n-1));
}
function crossEntropy(xs,training,order){
 const contexts=new Map(),alpha=0.5,Q=29;
 const key=xs=>xs.join(',');
 for(let i=order;i<training.length;i++){
   const context=key(training.slice(i-order,i));
   if(!contexts.has(context))contexts.set(context,Array(Q).fill(0));
   contexts.get(context)[training[i]]++;
 }
 let entropy=0;
 for(let i=order;i<xs.length;i++){
   const context=key(xs.slice(i-order,i)),count=contexts.get(context)||Array(Q).fill(0);
   const denom=count.reduce((a,b)=>a+b,0)+alpha*Q;
   entropy-=Math.log2((count[xs[i]]+alpha)/denom);
 }
 return entropy/(xs.length-order);
}
function native(x){return x.map(i=>corpus.translit[i]).join('');}
const solvedRefs=[56,57].map(page=>({page,count:corpus.pages[page].indices.length,ioc:ioc(corpus.pages[page].indices),
 unigramCrossEntropy:crossEntropy(corpus.pages[page].indices,solved,0),
 bigramCrossEntropy:crossEntropy(corpus.pages[page].indices,solved,1)}));
const controls={
 untouched:{ioc:ioc(target),unigramCrossEntropy:crossEntropy(target,solved,0),bigramCrossEntropy:crossEntropy(target,solved,1)},
 solvedRefs,
 planted:{
   sampleSize:139,
   pass:(()=>{
     const plant=Array.from({length:139},(_,i)=>solved[i%solved.length]);
     const enc=plant.map((x,i)=>mod(x+freeze.key[i%9]));
     return enc.every((x,i)=>mod(x-freeze.key[i%9])===plant[i]);
   })()
 }
};
assert(controls.planted.pass);
const variants=freeze.variants.map(v=>{
 assert.equal(v.phase,0);assert(v.sign===-1||v.sign===1);
 assert.equal(v.rawInverse.length,139);
 assert(v.rawInverse.every((x,i)=>mod(x-v.sign*freeze.key[i%9])===target[i]));
 return {sign:v.sign,phase:0,plaintextLength:v.rawInverse.length,
  ioc:ioc(v.rawInverse),unigramCrossEntropy:crossEntropy(v.rawInverse,solved,0),
  bigramCrossEntropy:crossEntropy(v.rawInverse,solved,1),
  transliteratedFirst80Runes:native(v.rawInverse.slice(0,80))};
});
const correctHighIoc=variants.filter(v=>v.ioc>=Math.min(...solvedRefs.map(x=>x.ioc)));
console.log(JSON.stringify({classification:'POSTFREEZE ORIGINAL P15 BODY TEST; literal GP29 additive period9 only',
 pretargetCommit:'4e7ea90c9d41917ddcecc659efe63c0222d087c4',
 n:139,key:freeze.key,controls,variants,
 numberAboveSolvedIocFloor:correctHighIoc.length,
 result:'Scores are descriptive; plain native GP text would normally show nonuniformity and recognizable local words. These results cannot exclude further cipher layers.'},null,2));
