'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const d = JSON.parse(readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const F=[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const lag=j=>F.filter(f=>f<=j).at(-1),mod=x=>(x+29)%29;
/** Encode an array of plaintext GP indices with a known eight-rune primer. */
function encode(P,primer){
  let a=[],C=[],holds=[];
  for(let i=0;i<P.length;i++){
    const p=P[i],j=a.length;
    if(!p){C.push(0);holds.push(i);continue;}
    const k=j<8?primer[j]:a[j-lag(j)];
    const c=mod(p+k);a.push(c);C.push(c);
  }
  return {C,holds};
}
/** Null primer represents all primers existentially: independent initial keys
 * can always set each initial consuming plaintext to 1. No path truncation. */
function walk(C,knownPrimer=null){
  let states=[{a:[],holds:[],p:[]}],peak=1,trace=[];
  for(let i=0;i<C.length;i++){
    const c=C[i],next=[],killed=[];
    for(const s of states){
      const j=s.a.length;
      if(c===0)next.push({a:s.a,holds:[...s.holds,i],p:[...s.p,0]});
      const k=j<8?(knownPrimer?knownPrimer[j]:mod(c-1)):s.a[j-lag(j)].c;
      const p=mod(c-k);
      if(p!==0)next.push({a:[...s.a,{c,i}],holds:s.holds,p:[...s.p,p]});
      else if(c!==0)killed.push({i,c,activeIndex:j,lag:j<8?null:lag(j),reference:j<8?null:s.a[j-lag(j)],held:s.holds});
    }
    states=next;peak=Math.max(peak,states.length);
    if(c===0||!states.length||i===138||i===203)trace.push({i,states:states.length,masks:states.map(s=>s.holds)});
    if(!states.length)return {failure:i,peak,trace,states,killed};
  }
  return {failure:null,peak,trace,states};
}
const original=d.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(20));
assert.equal(original.length,1883);
const w=walk(original);
assert.equal(w.failure,204);
assert.equal(w.peak,6);
assert.deepEqual(w.trace.find(t=>t.i===138).masks,[[7,46,76],[7,66,76]]);
assert.deepEqual(w.killed,[{i:204,c:8,activeIndex:200,lag:144,reference:{c:8,i:58},held:[7,46,76,194]}]);
console.log(JSON.stringify({original:{length:original.length,failure:w.failure,peak:w.peak,trace:w.trace,killed:w.killed}},null,2));
for(let t=0;t<3;t++){
  const P=Array.from({length:339},(_,i)=>d.pages[57].indices[(i+17*t)%95]);
  const key=Array.from({length:8},(_,i)=>(3+7*i+11*t)%29);
  const e=encode(P,key),v=walk(e.C,key);
  const truePath=v.states.find(s=>s.holds.join(',')===e.holds.join(',')&&s.p.every((p,i)=>p===P[i]));
  assert(truePath);
  assert.deepEqual(encode(truePath.p,key).C,e.C);
  console.log(JSON.stringify({t,key,holds:e.holds.length,consumingZeros:e.C.filter(c=>!c).length-e.holds.length,peak:v.peak,finalPaths:v.states.length,replayed:339}));
}
console.log('PASS exact Fibonacci-addressed ciphertext feedback gate');
