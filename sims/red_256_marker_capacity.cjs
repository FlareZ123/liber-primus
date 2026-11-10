"use strict";
/**
 * Exact 32-run punctuation-key capacity and source-length base60 null.
 * Uses BigInt dynamic programming; no floating-point count approximation.
 * Node.js 22 CommonJS. Run: node sims/red_256_marker_capacity.cjs
 */
const assert=require("node:assert/strict");
const {events}=require("./red_256_event_key_inverse.cjs");

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isInteger(n)&&Number.isInteger(k)&&n>=k&&k>=0);
  let result=1n;
  for(let i=1;i<=k;i++)result=result*BigInt(n-k+i)/BigInt(i);
  return result;
}
/**
 * Count weak compositions of a fixed total into labeled parts, each
 * with a value between zero and maxValue inclusive.
 * @param {number} total @param {number} parts @param {number} maxValue
 * @returns {bigint}
 */
function boundedCompositions(total,parts,maxValue) {
  let dp=Array.from({length:total+1},(_,i)=>i===0?1n:0n);
  for(let p=0;p<parts;p++){
    const pref=[0n];
    for(let i=0;i<=total;i++)pref.push(pref[i]+dp[i]);
    dp=Array.from({length:total+1},(_,s)=>
      pref[s+1]-pref[Math.max(0,s-maxValue)]);
  }
  return dp[total];
}
function run(){
  const stream=events();
  const markers=stream.filter(e=>e.kind===0).length;
  const red=stream.length-markers;
  const intervals=markers+1;
  assert.deepEqual([red,markers,intervals,stream.length],[225,31,32,256]);
  const digitMax=59;
  const totalLayouts=choose(stream.length,markers);
  const cappedLayouts=boundedCompositions(red,intervals,digitMax);
  const uncapped=choose(red+intervals-1,intervals-1);
  assert.equal(totalLayouts,uncapped);
  assert.equal(totalLayouts.toString(),
    "8283675595268374292919471912522442632960");
  assert.equal(cappedLayouts.toString(),
    "8247228282470386923261247318860927231744");
  const probability=Number(cappedLayouts)/Number(totalLayouts);
  assert.ok(probability>0.99 && probability<1);
  return {red,markers,intervals,sourceAlphabetDigits:60,
    totalLayouts:totalLayouts.toString(),
    cappedLayouts:cappedLayouts.toString(),
    maxRunLength:digitMax,uncappedBits:Math.log2(Number(totalLayouts)),
    cappedBits:Math.log2(Number(cappedLayouts)),
    probabilityAllRunsFitBase60:probability,
    interpretation:"Uniform marker-position null only; not historical intent or actual key entropy"};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={choose,boundedCompositions,run};
