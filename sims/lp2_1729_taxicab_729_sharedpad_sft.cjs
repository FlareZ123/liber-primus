'use strict';

/** Fixed 729/1729 original-section two-time-pad discriminator, Node22 CJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const a = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const full = corpus.pages.filter(p => p.page >= 8 && p.page <= 14).flatMap(p => p.indices);
assert.deepEqual([a.length, full.length], [729, 1729]);
assert.equal(729, 9**3);
assert.equal(1729, 9**3+10**3);
const b = full.slice(0, 729);
const alphabet = new Map(corpus.translit.map((s,i) => [s,i]));
const digraphs = new Set(['TH','NG','EO','OE','AE','IA','EA']);
/** @param {string} input @returns {number[]} */
function gp(input) {
  const s=input.toUpperCase().replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;) {
    if (!/[A-Z]/.test(s[i])) {i++;continue;}
    let token;
    if(s.slice(i,i+3)==='ING'){token='NG';i+=3;}
    else {token=digraphs.has(s.slice(i,i+2))?s.slice(i,i+2):s[i];i+=token.length;}
    const index=alphabet.get(token);
    if(index!==undefined) out.push(index);
  }
  return out;
}
const sh=gp(read('resources/control/shakespeare_first300k.txt'));
const gb=gp(read('resources/control/gibran_prophet_58585.txt'));
assert(sh.length>100000 && gb.length>10000);
/** @param {number[]} s @returns {number[]} */
function freq(s) {
  const count=Array(29).fill(0);for(const x of s) count[x]++;
  return count.map(v=>v/s.length);
}
const f=freq(sh),g=freq(gb);
const weights=Array.from({length:29},(_,d)=>
  Math.log(29*f.reduce((sum,x,i)=>sum+x*g[(i-d+29)%29],0)));
/** @param {number[]} x @param {number[]} y @returns {{score:number,zeros:number}} */
function evaluate(x,y){
  assert.equal(x.length,y.length);
  let score=0,zeros=0;
  for(let i=0;i<x.length;i++){const d=(x[i]-y[i]+29)%29;score+=weights[d];if(d===0)zeros++;}
  return {score,zeros};
}
let seed=0x3301729;
/** @returns {number} */
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
const observed=evaluate(a,b);assert.equal(observed.zeros,20);
assert(Math.abs(observed.score+15.44818125946644)<1e-7);
const shuffled=b.slice(),nulls=[];
for(let t=0;t<2000;t++){
  for(let j=shuffled.length-1;j>0;j--){let k=Math.floor(rand()*(j+1));[shuffled[j],shuffled[k]]=[shuffled[k],shuffled[j]];}
  nulls.push(evaluate(a,shuffled).score);
}
const mean=nulls.reduce((p,v)=>p+v,0)/nulls.length;
const sd=Math.sqrt(nulls.reduce((p,v)=>p+(v-mean)**2,0)/(nulls.length-1));
const upperP=(1+nulls.filter(v=>v>=observed.score).length)/(nulls.length+1);
assert(upperP>.05 && upperP<.95);
let lowerNative=0,minNative=Infinity;
for(let t=0;t<2000;t++){
  const i=Math.floor(rand()*(sh.length-729)),j=Math.floor(rand()*(gb.length-729));
  const v=evaluate(sh.slice(i,i+729),gb.slice(j,j+729)).score;
  if(v<=observed.score) lowerNative++;
  minNative=Math.min(minNative,v);
}
assert.equal(lowerNative,0);
const pa=sh.slice(3000,3729),pb=gb.slice(3000,3729);
const k=Array.from({length:729},(_,i)=>(i*i+18*i+3301)%29);
const ca=pa.map((x,i)=>(x+k[i])%29),cb=pb.map((x,i)=>(x+k[i])%29);
assert.equal(evaluate(pa,pb).score,evaluate(ca,cb).score);
for(let i=0;i<729;i++)assert.equal((ca[i]-cb[i]+29)%29,(pa[i]-pb[i]+29)%29);
console.log(JSON.stringify({status:'PASS',originalLengths:[729,1729],original:observed,
  shuffle:{mean,sd,z:(observed.score-mean)/sd,upperP},
  native:{draws:2000,minNative,lowerNative},plantedPad:'729/729'}));
