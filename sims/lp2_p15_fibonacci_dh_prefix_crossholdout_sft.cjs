'use strict';
const assert = require('node:assert/strict');

const CICADA = 3301;
const state = Object.freeze({F:0,K:2,e:3,g:5,a:6,A:8,b:15,B:19,p:23});
const printed = Object.freeze([
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d=3; d*d<=n; d+=2) if (n%d===0) return false;
  return true;
}

/** @param {number} index */
function nthPrime(index) {
  let count=0;
  for (let n=2;;n++) if (isPrime(n) && ++count===index) return n;
}

function distinctFibonacci(count) {
  const out=[]; let a=0,b=1;
  while(out.length<count) {
    if (!out.length || out[out.length-1]!==a) out.push(a);
    [a,b]=[b,a+b];
  }
  return out;
}

/** @param {number[]} xs */
function orientations(xs) {
  const out=[];
  for (const reversed of [false,true]) {
    const base=reversed?xs.slice().reverse():xs.slice();
    for(let start=0;start<xs.length;start++)
      out.push({reversed,start,values:base.slice(start).concat(base.slice(0,start))});
  }
  return out;
}

/** @param {number} base @param {number} target @param {number} p */
function logs(base,target,p) {
  const hits=[];
  for(let x=1;x<p;x++) {
    let v=1;
    for(let i=0;i<x;i++) v=(v*base)%p;
    if(v===target) hits.push(x);
  }
  return hits;
}

function main() {
  const fib=distinctFibonacci(16);
  assert.deepEqual(fib,[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]);

  const primeValues=fib.map(x=>nthPrime(x+1));
  assert.deepEqual(primeValues,[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
  assert.deepEqual(primeValues.map(p=>Math.abs(CICADA-p)),printed);

  const fibPacket=[state.F,1,state.K,state.e,state.g,state.A,state.b-state.K];
  const primePacket=[state.K,state.e,state.g,state.K+state.g,state.b-state.K,state.p];

  assert.deepEqual(fib.slice(0,7),fibPacket);
  assert.deepEqual(primeValues.slice(0,6),primePacket);
  assert.deepEqual(printed.slice(0,6),primePacket.map(x=>CICADA-x));

  const fibHits=orientations(fib).filter(o=>o.values.slice(0,7).every((v,i)=>v===fibPacket[i]));
  const primeHits=orientations(primeValues).filter(o=>o.values.slice(0,6).every((v,i)=>v===primePacket[i]));
  assert.deepEqual(fibHits.map(x=>[x.reversed,x.start]),[[false,0]]);
  assert.deepEqual(primeHits.map(x=>[x.reversed,x.start]),[[false,0]]);

  assert.deepEqual(logs(state.g,state.A,state.p),[state.a]);
  assert.deepEqual(logs(state.g,state.B,state.p),[state.b]);
  let shared=1;
  for(let i=0;i<state.a;i++) shared=(shared*state.B)%state.p;
  assert.equal(shared,state.K);

  console.log(JSON.stringify({
    schema:'lp2-p15-fibonacci-dh-prefix-crossholdout-v1',
    fibonacciPrefix:fibPacket,
    fibonacciLabels:['F','1','K','e','g','A','b-K'],
    selectedPrimePrefix:primePacket,
    primeLabels:['K','e','g','K+g','b-K','p'],
    printedPrefix:printed.slice(0,6),
    orientationCharge:{presentations:32,fibonacciHits:fibHits.length,primeHits:primeHits.length},
    dhClosure:state
  },null,2));
}
if(require.main===module) main();
module.exports={isPrime,nthPrime,distinctFibonacci,orientations};
