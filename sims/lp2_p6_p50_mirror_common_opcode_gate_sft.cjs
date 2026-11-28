"use strict";

const assert = require("node:assert/strict");

const p6Points = [
  ...[-3,-1,1,3].map((y,i)=>({x:-1,y,page:30+i})),
  ...[-4,-2,0,2,4].map((y,i)=>({x:0,y,page:34+i})),
  ...[-3,-1,1,3].map((y,i)=>({x:1,y,page:39+i})),
];
const p6ByCoord = new Map(p6Points.map((p)=>[`${p.x},${p.y}`,p.page]));
const p6Rotation = new Map(p6Points.map((p)=>[p.page,p6ByCoord.get(`${-p.x},${-p.y}`)]));
assert.equal(p6Rotation.get(30),42);
assert.equal(p6Rotation.get(36),36);

const p50Reflection = new Map();
for (let r=0;r<32;r+=1) {
  for (let c=0;c<8;c+=1) {
    const i=8*r+c;
    p50Reflection.set(i,8*r+(7-c));
  }
}
assert.equal(p50Reflection.get(0),7);
assert.equal(p50Reflection.get(7),0);

/** @param {Map<number,number>} map */
function cycleProfile(map) {
  const seen=new Set();
  const counts=new Map();
  for (const start of map.keys()) {
    if (seen.has(start)) continue;
    let x=start, n=0;
    do { seen.add(x); x=map.get(x); n+=1; } while (x!==start);
    counts.set(n,(counts.get(n)||0)+1);
  }
  return Object.fromEntries([...counts.entries()].sort((a,b)=>a[0]-b[0]));
}

const p6Profile=cycleProfile(p6Rotation);
const p50Profile=cycleProfile(p50Reflection);
assert.deepEqual(p6Profile,{1:1,2:6});
assert.deepEqual(p50Profile,{2:128});

const p6Linear=[[-1,0],[0,-1]];
const p50Linear=[[1,0],[0,-1]];
const det=(m)=>m[0][0]*m[1][1]-m[0][1]*m[1][0];
assert.equal(det(p6Linear),1);
assert.equal(det(p50Linear),-1);

const p6LeftRight=new Map(p6Points.map((p)=>[p.page,p6ByCoord.get(`${-p.x},${p.y}`)]));
assert.notEqual(p6LeftRight.get(30),p6Rotation.get(30));
const p50HalfTurn=(r,c)=>8*(31-r)+(7-c);
assert.notEqual(p50HalfTurn(0,0),p50Reflection.get(0));

console.log(JSON.stringify({
  status:"PASS",
  p6:{operation:"180-degree rotation",linear:p6Linear,determinant:det(p6Linear),cycleProfile:p6Profile,fixedPoints:[36]},
  p50:{operation:"horizontal reflection",linear:p50Linear,determinant:det(p50Linear),cycleProfile:p50Profile,fixedPoints:[]},
  commonOperationTests:{
    sharedHorizontalReflectionFailsP6:true,
    sharedHalfTurnFailsP50:true,
    abstractInvolutionOnly:"too weak to predict an address because it discards axis/orientation",
  },
  conclusion:"The source-selected p6 and p50 symmetries are distinct involutions, not one reusable coordinate opcode. Their only common invariant is involution, which has no fresh predictive content."
},null,2));
