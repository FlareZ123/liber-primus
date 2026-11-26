'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const donor = read('resources/external/relikd-solved-gp29-native-v1.json');
const tape = corpus.pages.slice(0,3).flatMap(p => p.indices);
assert.equal(tape.length,729);
const title = [18,13,10,13,8,24,9,26,15,18,18,5,15]; // conditional EPIPHANY SEECS
const mod = x => (x+29)%29;
const K = title.map((p,i)=>mod(tape[i]-p));
assert.deepEqual(K,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
const C = tape.slice(13);
assert.equal(C[0],2); // literal thorn, conditional plaintext indicator
const phases = K.flatMap((k,i)=>k===0?[i]:[]);
assert.deepEqual(phases,[8,10]);
/** @param {number[]} P @param {number} s */
function encrypt(P,s) {
  let j=s;
  return P.map(p=>{
    if(p===0)return 0;
    const c=mod(p+K[j]);j=(j+1)%13;return c;
  });
}
/** @param {number[]} cipher @param {number} start */
function reach(cipher,start) {
  let states=new Set([start]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    for(const j of states){
      if(cipher[i]===0)next.add(j);
      if(mod(cipher[i]-K[j])!==0)next.add((j+1)%13);
    }
    if(!next.size)return {firstFailure:i,phases:[...states].sort((a,b)=>a-b),cipher:cipher[i]};
    states=next;
  }
  return {firstFailure:null,phases:[...states].sort((a,b)=>a-b)};
}
const W=Array.from(donor.sections.find(s=>s.name==='0_welcome').source_text)
  .map(r=>corpus.runes.indexOf(r)).filter(x=>x>=0);
const start=W.indexOf(2), P=W.slice(start,start+249);
assert.equal(start,23);assert.equal(P.length,249);
const controls=phases.map(s=>{
  const enc=encrypt(P,s);
  assert.equal(enc[0],2);
  const result=reach(enc,s);
  assert.equal(result.firstFailure,null);
  assert.ok(result.phases.includes((s+P.filter(x=>x!==0).length)%13));
  return {s,heldF:P.filter(x=>x===0).length,consumedZero:enc.filter((x,i)=>x===0&&P[i]!==0).length,...result};
});
const original=phases.map(s=>({s,...reach(C,s)}));
assert.deepEqual(original,[
  {s:8,firstFailure:153,phases:[0],cipher:26},
  {s:10,firstFailure:72,phases:[2],cipher:8}
]);
console.log(JSON.stringify({phases,controls,original},null,2));
