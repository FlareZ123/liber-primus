'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} count */
function primes(count) {
  const out=[];
  for(let n=2;out.length<count;n++){
    let ok=true; for(const p of out){if(p*p>n)break;if(n%p===0){ok=false;break;}}
    if(ok)out.push(n);
  }
  return out;
}
/** @param {number[]} input @param {number[]} key */
function encode(input,key){
  let j=0; return input.map(p=>p===0?0:mod(p+key[j++]));
}
/** Exact native literal-F inverse, retaining all consuming clocks.
 * @param {number[]} input @param {number[]} key */
function inverse(input,key) {
  let s=new Set([0]), peak=1;
  for(let i=0;i<input.length;i++){
    const next=new Set();
    for(const j of s){
      if(input[i]===0)next.add(j);
      if(j<key.length && mod(input[i]-key[j])!==0)next.add(j+1);
    }
    if(!next.size)return {prefix:i,peak,end:[]};
    s=next;peak=Math.max(peak,s.size);
  }
  return {prefix:input.length,peak,end:[...s].sort((a,b)=>a-b)};
}
/** @param {number[]} arr */
function ioc(arr){
  const counts=Array(29).fill(0);for(const x of arr)counts[x]++;
  return counts.reduce((a,c)=>a+c*(c-1),0)/(arr.length*(arr.length-1));
}
/** @param {any} corpus @param {any} native */
function run(corpus,native) {
  const p=primes(2000), fib=[0,1,2];while(fib.at(-1)<987)fib.push(fib.at(-1)+fib.at(-2));
  const ord=fib.map(x=>x+1);
  const plate=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
  assert.deepEqual(ord.map(o=>Math.abs(3301-p[o-1])),plate);
  const removed=new Set(ord);
  const raw=p.map(x=>mod(x-1));
  const complement=p.filter((_,i)=>!removed.has(i+1)).map(x=>mod(x-1));
  const runeMap=new Map(corpus.runes.map((s,i)=>[s,i]));
  const controls=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c))}));
  const an=controls.find(s=>s.name.includes('p56'));
  assert(an);
  assert.deepEqual(encode(an.p,raw),corpus.pages[56].indices);
  const plants=controls.filter(s=>s.p.length>100).slice(0,3).map(s=>{
    const c=encode(s.p,complement), result=inverse(c,complement), truth=s.p.filter(x=>x!==0).length;
    assert(result.end.includes(truth)); return {name:s.name,n:c.length,truth,legalEndStates:result.end,peak:result.peak};
  });
  const ref=controls.filter(s=>s.name!==an.name).flatMap(s=>s.p);
  const counts=Array(29).fill(0.5);for(const x of ref)counts[x]++;
  const total=counts.reduce((a,b)=>a+b,0);
  const gain=a=>a.reduce((s,x)=>s+Math.log(29*counts[x]/total),0)/a.length;
  const tape=corpus.pages.slice(16,23).flatMap(s=>s.indices);
  const targets=[{name:'p15_black_through_p22',c:[...corpus.pages[15].indices.slice(20),...tape]},{name:'p16_through_p22',c:tape}];
  const original=targets.map(({name,c})=>{
    const ordinary=c.map((x,i)=>mod(x-complement[i]));
    return {name,n:c.length,baseline:inverse(c,raw),complement:inverse(c,complement),ordinaryIoC:ioc(ordinary),ordinaryGain:gain(ordinary),cipherIoC:ioc(c),ordinaryPrefix:ordinary.slice(0,40).map(x=>corpus.translit[x]).join(' ')};
  });
  return {ord,plate,firstKeys:complement.slice(0,20),genuineP56:{runes:an.p.length,consumed:an.p.filter(x=>x!==0).length},plants,original};
}
module.exports={run};
if(require.main===module){
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
}
