"use strict";

const assert = require("node:assert/strict");
const mod29 = value => ((value % 29) + 29) % 29;
/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [mod29(values[0]-values[3]),mod29(values[1]-values[2]),
    mod29(values[1]+values[2]),mod29(values[0]+values[3])];
}
/** @param {number[]} values @returns {number[]} */
function invH4(values) {
  assert.equal(values.length, 4);
  const inv2=15;
  return [mod29(inv2*(values[0]+values[3])),mod29(inv2*(values[1]+values[2])),
    mod29(inv2*(values[2]-values[1])),mod29(inv2*(values[3]-values[0]))];
}
const balanced29=value=>{const r=mod29(value); return r>14?r-29:r;};

// Exact source-established 4/5/4 stencil. The outer four cells occupy the
// four vertical gaps of the five-cell centre column.
const points=[
  ...[-3,-1,1,3].map((y,i)=>({x:-1,y,page:30+i})),
  ...[-4,-2,0,2,4].map((y,i)=>({x:0,y,page:34+i})),
  ...[-3,-1,1,3].map((y,i)=>({x:1,y,page:39+i})),
];
assert.equal(points.length,13);
const byCoordinate=new Map(points.map(p=>[`${p.x},${p.y}`,p.page]));
function symmetryMap(sx,sy){
  const mapping=new Map();
  for(const p of points){
    const target=byCoordinate.get(`${sx*p.x},${sy*p.y}`);
    assert.notEqual(target,undefined);
    mapping.set(p.page,target);
  }
  return mapping;
}
const symmetries=[
  {name:"identity",sx:1,sy:1},
  {name:"left-right",sx:-1,sy:1},
  {name:"top-bottom",sx:1,sy:-1},
  {name:"rotation-180",sx:-1,sy:-1},
].map(s=>({...s,map:symmetryMap(s.sx,s.sy)}));
const mirrorPairs=[[30,42],[31,41],[32,40],[33,39],[34,38],[35,37],[36,36]];
const forwardPairs=[[32,37],[33,38],[34,39],[35,40]];
const realizes=(mapping,pairs)=>pairs.every(([a,b])=>mapping.get(a)===b);
const mirrorSymmetries=symmetries.filter(s=>realizes(s.map,mirrorPairs));
const forwardSymmetries=symmetries.filter(s=>realizes(s.map,forwardPairs));
assert.deepEqual(mirrorSymmetries.map(s=>s.name),["rotation-180"]);
assert.equal(forwardSymmetries.length,0);

// The forward packet also has a cleaner p6-only inverse-H4 description.
const titleLengths=[4,1,4,2];
const titleH=h4(titleLengths);
assert.deepEqual(titleH,[2,26,5,6]);
const K=titleLengths[3],singleton=titleLengths[1],a=titleH[3];
const finalLineWidth=22,u=12,F=0,w1First=24,w1Last=17;
const forwardQ=invH4([K,finalLineWidth,singleton,a]).map(balanced29);
const forwardD=invH4([u,F,w1First,w1Last]).map(balanced29);
assert.deepEqual(forwardQ,[4,-3,4,2]);
assert.deepEqual(forwardD,[0,12,12,-12]);
assert.deepEqual(h4(forwardQ),[K,finalLineWidth,singleton,a]);
assert.deepEqual(h4(forwardD),[u,F,w1First,w1Last]);

// Topology is selected by the stencil; numeric mirror field order is not.
const mirrorQInner=[1,F,K,4],mirrorDInner=[u,F,-5,5];
assert.equal(new Set(mirrorQInner.map(mod29)).size,4);
assert.equal(new Set(mirrorDInner.map(mod29)).size,4);
const p6OnlyInnerFieldOrders=24*24;
assert.equal(p6OnlyInnerFieldOrders,576);

console.log(JSON.stringify({
  status:"PASS",
  stencil:{
    columns:[4,5,4],
    pageOrder:points.map(p=>p.page),
    symmetries:symmetries.map(s=>({name:s.name,mapping:[...s.map.entries()]})),
    uniqueMirrorSelector:mirrorSymmetries[0].name,
    forwardSymmetryHits:forwardSymmetries.length,
  },
  forwardTransport:{
    q:forwardQ,d:forwardD,
    qH4Packet:[K,finalLineWidth,singleton,a],
    dH4Packet:[u,F,w1First,w1Last],
    inference:"p6-visible algebraic refactor, but the forward page pairing is not a stencil symmetry",
  },
  mirrorTransport:{
    innerQ:mirrorQInner,innerD:mirrorDInner,p6OnlyInnerFieldOrders,
    inference:"the stencil fixes the 180-degree mirror topology, not the numeric field order",
  },
},null,2));
