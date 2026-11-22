'use strict';
const assert = require('node:assert/strict');
/** @param {number} n @returns {number} */
const mod = n => ((n % 32) + 32) % 32;
/** @param {number} a @param {number} b @returns {number[]} */
function walk(a,b) {
  const out=[],seen=new Set(); let x=0;
  for(let i=0;i<32;i++){assert(!seen.has(x));seen.add(x);out.push(x);x=mod(a*x+b);}
  assert.equal(x,0);assert.equal(seen.size,32);return out;
}
/** @param {number[]} xs @returns {number[]} */
const tail=xs=>xs.filter(i=>i>=28);
/** @param {number[]} xs @returns {boolean} */
const cyclic=xs=>[0,1,2,3].some(k=>xs.every((v,i)=>v===28+(k+i)%4));
const all=[];
for(let a=1;a<32;a+=4)for(let b=1;b<32;b+=2){
  const f=walk(a,b),ai=Array.from({length:32},(_,i)=>i).find(i=>mod(a*i)===1);
  assert.notEqual(ai,undefined);
  const reverse=walk(ai,mod(-ai*b));
  assert.deepEqual(reverse.slice(1),f.slice(1).reverse());
  all.push({a,b,forward:tail(f),
    inversePosition:tail(Array.from({length:32},(_,i)=>f.indexOf(i))),
    backwards:tail(reverse)});
}
assert.equal(all.length,128);
const picked=all.find(x=>x.a===13&&x.b===31);
assert.deepEqual(picked.forward,[31,28,29,30]);
assert.deepEqual(picked.inversePosition,[31,28,29,30]);
assert.deepEqual(picked.backwards,[30,29,28,31]);
// Source-verified p56/p57 fragment lengths: 5,80,7,88.
const chunks=['A'.repeat(5),'B'.repeat(80),'C'.repeat(7),'D'.repeat(88)];
const joined=chunks.join(''),rotated=joined.slice(92)+joined.slice(0,92);
const assemble=ids=>ids.map(i=>chunks[i-28]).join('');
assert.equal(assemble(picked.forward),rotated);
assert.equal(assemble(picked.inversePosition),rotated);
assert.notEqual(assemble(picked.backwards),rotated);
const exact=all.filter(x=>x.forward.join()==='31,28,29,30'&&
  x.inversePosition.join()==='31,28,29,30');
assert.deepEqual(exact.map(x=>[x.a,x.b]),[[13,31]]);
const counts={
 forwardCyclic:all.filter(x=>cyclic(x.forward)).length,
 inversePositionCyclic:all.filter(x=>cyclic(x.inversePosition)).length,
 backwardCyclic:all.filter(x=>cyclic(x.backwards)).length,
 matchingCyclic:all.filter(x=>cyclic(x.forward)&&
 x.forward.join()===x.inversePosition.join()).length,
 exactDoubleMatch:exact.length};
assert.deepEqual(counts,{forwardCyclic:18,inversePositionCyclic:22,
 backwardCyclic:18,matchingCyclic:4,exactDoubleMatch:1});
const rotations=Array.from({length:5},(_,i)=>mod((13<<i)|(13>>>(5-i))));
assert.deepEqual([...new Set(rotations)].sort((a,b)=>a-b),[11,13,21,22,26]);
assert.deepEqual(rotations.filter(x=>x%4===1).sort((a,b)=>a-b),[13,21]);
assert(!cyclic(all.find(x=>x.a===21&&x.b===31).forward));
console.log(JSON.stringify({fullPeriodFamily:all.length,selected:picked,
 ornamentValidMultipliers:[13,21],counts,
 conclusion:'Conditional source index constraint; no decrypted plaintext or key'},null,2));
