"use strict";
/**
 * Recover an unknown MSVCRT rand() 31-bit output-relevant state from the
 * original LP2 p49–51 numeric table, without assuming a seed or date.
 * Independently test the glibc rand()/random() lag-31,lag-3 byte recurrence.
 * Node.js 22 CommonJS. No dependencies; read-only source-exact SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/base60-grid.json"),"utf8"));
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row=>row.length===8));
/** @param {number} x @returns {number} */
function step(x){return (Math.imul(214013,x)+2531011)&0x7fffffff;}
/**
 * Exhaustive: 2^23 initial 31-bit state classes compatible with first byte.
 * Any 32-bit state differs only by the never-observed bit31.
 * @param {number[]} v @param {"low8"|"high8"} mode
 * @returns {{prefix3:number,states:number[]}}
 */
function invert(v,mode){
  assert.ok(v.length>=4);
  const shift=mode==="low8"?16:23, states=[];
  let prefix3=0;
  for(let hi=0;hi<128;hi++)for(let lo=0;lo<65536;lo++){
    const initial=mode==="low8"?(hi<<24)|(v[0]<<16)|lo:(v[0]<<23)|(hi<<16)|lo;
    let s=step(initial);
    if(((s>>>shift)&255)!==v[1])continue;
    s=step(s);
    if(((s>>>shift)&255)!==v[2])continue;
    prefix3++;
    let valid=true;
    for(let i=3;i<v.length;i++){
      s=step(s);
      if(((s>>>shift)&255)!==v[i]){valid=false;break;}
    }
    if(valid)states.push(initial&0x7fffffff);
  }
  return {prefix3,states};
}
/** @param {number} first @param {number} n @param {number} shift @returns {number[]} */
function plantMsvc(first,n,shift){
  let state=first&0x7fffffff;
  const v=[];
  for(let i=0;i<n;i++){v.push((state>>>shift)&255);state=step(state);}
  return v;
}
/**
 * For glibc additive random() mod2^32: x[n]=x[n-3]+x[n-31].
 * Returned bits1–8 imply output[n]-output[n-3]-output[n-31]
 * belongs to {0,1} modulo256 irrespective of all seed and warmup.
 * @param {number[]} v @returns {{matched:number,eligible:number}}
 */
function glibc(v){
  let matched=0;
  for(let i=31;i<v.length;i++){
    const r=(v[i]-v[i-3]-v[i-31])&255;
    if(r===0||r===1)matched++;
  }
  return {matched,eligible:Math.max(0,v.length-31)};
}
/** @param {number} n @returns {number[]} */
function plantGlibc(n){
  const x=Array.from({length:31},(_,i)=>(Math.imul(i+1,1103515245)+12345)>>>0);
  for(let i=31;i<n;i++)x.push((x[i-3]+x[i-31])>>>0);
  return x.map(t=>(t>>>1)&255);
}
for(const [mode,shift] of [["low8",16],["high8",23]]){
  assert.ok(invert(plantMsvc(3301,48,shift),mode).states.includes(3301));
}
assert.deepEqual(glibc(plantGlibc(256)),{matched:225,eligible:225});
const rows=grid.byte_rows;
const readings={
  printed:bytes,
  printedReverse:bytes.slice().reverse(),
  columns:Array.from({length:256},(_,i)=>rows[i%32][Math.floor(i/32)]),
  columnsReverse:Array.from({length:256},(_,i)=>rows[31-i%32][7-Math.floor(i/32)]),
  snake:rows.flatMap((row,i)=>i%2?row.slice().reverse():row),
  snakeReverse:rows.flatMap((row,i)=>i%2?row.slice().reverse():row).reverse()
};
const actual={};
for(const [name,v] of Object.entries(readings)){
  const low=invert(v,"low8"),high=invert(v,"high8");
  actual[name]={threePrefixCandidates:[low.prefix3,high.prefix3],completeStates:[low.states.length,high.states.length],glibc:glibc(v)};
}
assert.deepEqual(Object.values(actual).map(r=>r.completeStates),Array.from({length:6},()=>[0,0]));
assert.deepEqual(Object.values(actual).map(r=>r.glibc.matched),[4,2,2,5,3,1]);
console.log(JSON.stringify({originalSha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",allStateMsvcClassesPerLane:2**23,layouts:actual,syntheticControls:"PASS",newPlaintext:false},null,2));
