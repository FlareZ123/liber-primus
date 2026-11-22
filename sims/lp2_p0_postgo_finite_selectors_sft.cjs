"use strict";

/**
 * SFT: conditional finite source selectors for public candidate blocks 23-24.
 *
 * Upstream premise: block 22 is source-selected as GO with key TH-G-TH,
 * center (12,14), radius 7, ciphertext H(9,20)->C/K(9,21).
 *
 * Block 23 is selected from a radius-derived mirror family. Block 24 is then
 * reduced to two geometric non-mirror candidates and the already-fixed
 * next-key signature recurrence selects one before decryption.
 *
 * These constructions remain post-hoc because the public route was known
 * before the coordinate families were formulated.
 *
 * Run:
 *   node sims/lp2_p0_postgo_finite_selectors_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(
  fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8")
);
const T=corpus.translit;
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(grid.length,729);

const at=q=>grid[(q[0]-1)*27+q[1]-1];
const mod=x=>(x%29+29)%29;
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];

/** @param {number} n */
function phi(n){
  let value=n,rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    while(rest%p===0)rest/=p;
    value-=value/p;
  }
  if(rest>1)value-=value/rest;
  return value;
}

/** @param {number} n */
function mu(n){
  let rest=n,sign=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    sign=-sign;
    if(rest%p===0)return 0;
  }
  return rest>1?-sign:sign;
}

/** @param {number[]} raw @param {boolean} transformCenter */
function deriveKey(raw,transformCenter){
  const derived=transformCenter
    ?[raw[0],phi(raw[1]),raw[2]]
    :raw.slice();
  const signature=derived.map(v=>mu(phi(v)));
  const rotation=((signature.reduce((sum,v)=>sum+v,0)%3)+3)%3;
  return {
    signature,
    rotation,
    key:derived.slice(rotation).concat(derived.slice(0,rotation))
  };
}

/** @param {Array<[number,number]>} cells @param {number[]} key */
function decrypt(cells,key){
  return cells.map((q,i)=>mod(at(q)-key[i%3]));
}

/** @param {[number,number]} q */
function n0(q){
  return 27*(q[0]-1)+q[1];
}

/** @param {[number,number]} q */
function n1(q){
  return 27*(q[1]-1)+28-q[0];
}

/**
 * Existing Direct/+0 signature recurrence used after accumulated phase reaches
 * 21. The caller supplies the previous two-rune ciphertext, its leftmost cell,
 * and previous outer state.
 *
 * @param {Array<[number,number]>} cells
 * @param {[number,number]} leftmost
 * @param {0|1} outerState
 */
function predictDirectSignature(cells,leftmost,outerState){
  const phase=((cells.reduce((sum,q)=>sum+mu(n0(q)),0)%3)+3)%3;
  const nextOuterState=(outerState+mu(n1(leftmost))+2)%2;
  const outer=nextOuterState===1?1:0;
  const residue=((phase-2*nextOuterState)%3+3)%3;
  const middle=residue===2?-1:residue;
  return {
    phase,
    outerState:nextOuterState,
    signature:[outer,middle,outer]
  };
}

const axes=[[1,0],[0,1],[1,1],[1,-1]];

/**
 * @param {[number,number]} center
 * @param {[number,number]} axis
 * @param {number} radius
 */
function nodeAt(center,axis,radius){
  const p1=[center[0]-axis[0]*radius,center[1]-axis[1]*radius];
  const p2=[center[0]+axis[0]*radius,center[1]+axis[1]*radius];
  if(!inBounds(center)||!inBounds(p1)||!inBounds(p2))return null;
  return {
    center,
    axis,
    radius,
    p1,
    p2,
    raw:[at(p1),at(center),at(p2)],
    equalOuter:at(p1)===at(p2)&&at(center)!==0
  };
}

// ---------- Upstream block 22 GO ----------

const block22={
  node:{center:[12,14],axis:[1,0],radius:7,raw:[2,6,2]},
  start:[9,20],
  cells:[[9,20],[9,21]],
  endpoint:[9,21],
  direction:[0,1],
  length:2
};

assert.deepEqual(block22.node.raw.map(i=>T[i]),["TH","G","TH"]);
assert.deepEqual(block22.cells.map(at).map(i=>T[i]),["H","C"]);
assert.deepEqual(
  decrypt(block22.cells,deriveKey(block22.node.raw,true).key).map(i=>T[i]),
  ["G","O"]
);

// ---------- Block 23 radius-derived mirror family ----------

const phiRadius23=phi(block22.node.radius);
const phi2Radius23=phi(phiRadius23);
const major23=block22.node.radius-phi2Radius23;
const half23=phiRadius23/2;
const radius23=phiRadius23;

assert.deepEqual({
  phiRadius23,
  phi2Radius23,
  major23,
  half23,
  radius23
},{
  phiRadius23:6,
  phi2Radius23:2,
  major23:5,
  half23:3,
  radius23:6
});

const keyCandidates23=[];
for(const shape of ["major-half","half-major"]){
  for(const rowSign of [-1,1]){
    for(const colSign of [-1,1]){
      const dr=shape==="major-half"?major23:half23;
      const dc=shape==="major-half"?half23:major23;
      const center=[
        block22.node.center[0]+rowSign*dr,
        block22.node.center[1]+colSign*dc
      ];
      if(!inBounds(center))continue;

      for(const axis of axes){
        const node=nodeAt(center,axis,radius23);
        if(!node)continue;
        keyCandidates23.push({shape,rowSign,colSign,node});
      }
    }
  }
}

assert.equal(keyCandidates23.length,32);
const mirrors23=keyCandidates23.filter(x=>x.node.equalOuter);
assert.equal(mirrors23.length,1);
const selected23=mirrors23[0];

assert.deepEqual({
  shape:selected23.shape,
  signs:[selected23.rowSign,selected23.colSign],
  center:selected23.node.center,
  radius:selected23.node.radius,
  axis:selected23.node.axis,
  raw:selected23.node.raw.map(i=>T[i])
},{
  shape:"major-half",
  signs:[1,1],
  center:[17,17],
  radius:6,
  axis:[1,1],
  raw:["D","N","D"]
});

// With the selected key signs, test the two nested placements made from the
// remaining radius-derived pair (half23, phi2Radius23) and its swap.
// Source continuity requires the next start to reuse the previous key-center
// row. This selects one start before decryption.
const nestedStarts23=[
  {
    shape:"half-phi2",
    start:[
      block22.endpoint[0]+selected23.rowSign*half23,
      block22.endpoint[1]+selected23.colSign*phi2Radius23
    ]
  },
  {
    shape:"phi2-half",
    start:[
      block22.endpoint[0]+selected23.rowSign*phi2Radius23,
      block22.endpoint[1]+selected23.colSign*half23
    ]
  }
].filter(x=>inBounds(x.start));

assert.equal(nestedStarts23.length,2);
const startSurvivors23=nestedStarts23.filter(
  x=>x.start[0]===block22.node.center[0]
);
assert.equal(startSurvivors23.length,1);
const start23=startSurvivors23[0].start;
assert.deepEqual(start23,[12,23]);

// Read horizontally toward the selected key center, preserving the current
// two-rune length.
const direction23=[0,Math.sign(selected23.node.center[1]-start23[1])];
const cells23=[
  start23,
  [start23[0],start23[1]+direction23[1]]
];
const key23=deriveKey(selected23.node.raw,true);
const plaintext23=decrypt(cells23,key23.key);

assert.deepEqual(cells23,[[12,23],[12,22]]);
assert.deepEqual(cells23.map(at).map(i=>T[i]),["OE","Y"]);
assert.deepEqual(key23.key.map(i=>T[i]),["G","D","D"]);
assert.deepEqual(plaintext23.map(i=>T[i]),["T","O"]);

// ---------- Block 24 two-candidate non-mirror family ----------
//
// Halve the current radius. The long column displacement is
// phi(current center column) - halfRadius. Couple the same sign pair to:
//   next center = current center + (signRow*half, signCol*long)
//   next start  = current endpoint + (signRow*half, signCol*half)
//
// The next node axis is perpendicular to the current horizontal ciphertext
// direction, so test a vertical node at radius half. Bounds leave two source
// geometries.

const half24=selected23.node.radius/2;
const long24=phi(selected23.node.center[1])-half24;
assert.deepEqual({half24,long24},{half24:3,long24:13});

const candidates24=[];
const endpoint23=cells23.at(-1);
for(const rowSign of [-1,1]){
  for(const colSign of [-1,1]){
    const center=[
      selected23.node.center[0]+rowSign*half24,
      selected23.node.center[1]+colSign*long24
    ];
    const start=[
      endpoint23[0]+rowSign*half24,
      endpoint23[1]+colSign*half24
    ];
    const node=nodeAt(center,[1,0],half24);
    if(!node||!inBounds(start))continue;

    const direct=deriveKey(node.raw,false);
    candidates24.push({
      rowSign,
      colSign,
      start,
      node,
      direct
    });
  }
}

assert.equal(candidates24.length,2);
assert.deepEqual(
  candidates24.map(x=>({
    signs:[x.rowSign,x.colSign],
    center:x.node.center,
    start:x.start,
    raw:x.node.raw.map(i=>T[i]),
    signature:x.direct.signature
  })),
  [
    {
      signs:[-1,-1],
      center:[14,4],
      start:[9,19],
      raw:["L","X","S"],
      signature:[0,1,0]
    },
    {
      signs:[1,-1],
      center:[20,4],
      start:[15,19],
      raw:["S","L","TH"],
      signature:[0,0,1]
    }
  ]
);

// Existing Report-01 Direct/+0 recurrence. Block 23 has outer state 1.
// Its leftmost cell is its endpoint Y(12,22).
const prediction24=predictDirectSignature(cells23,endpoint23,1);
assert.deepEqual(prediction24,{
  phase:1,
  outerState:0,
  signature:[0,1,0]
});

const signatureSurvivors24=candidates24.filter(
  x=>JSON.stringify(x.direct.signature)===JSON.stringify(prediction24.signature)
);
assert.equal(signatureSurvivors24.length,1);
const selected24=signatureSurvivors24[0];

assert.deepEqual({
  center:selected24.node.center,
  start:selected24.start,
  raw:selected24.node.raw.map(i=>T[i]),
  phase:selected24.direct.rotation,
  key:selected24.direct.key.map(i=>T[i])
},{
  center:[14,4],
  start:[9,19],
  raw:["L","X","S"],
  phase:1,
  key:["X","S","L"]
});

const direction24=[0,Math.sign(selected24.node.center[1]-selected24.start[1])];
const cells24=[
  selected24.start,
  [selected24.start[0],selected24.start[1]+direction24[1]]
];
const plaintext24=decrypt(cells24,selected24.direct.key);

assert.deepEqual(cells24,[[9,19],[9,18]]);
assert.deepEqual(cells24.map(at).map(i=>T[i]),["T","R"]);
assert.deepEqual(plaintext24.map(i=>T[i]),["TH","E"]);

// The chosen block-24 source is genuinely non-mirror, and the direct key path
// matters: transforming X -> phi(X) would give a different key.
assert.notEqual(selected24.node.raw[0],selected24.node.raw[2]);
assert.notDeepEqual(
  deriveKey(selected24.node.raw,true).key,
  selected24.direct.key
);

console.log(JSON.stringify({
  status:"conditional finite source selectors reproduce public candidate blocks 23-24",
  block23:{
    keyFamilyCandidates:keyCandidates23.length,
    equalOuterKeySurvivors:mirrors23.length,
    nestedStartCandidates:nestedStarts23,
    rowContinuitySurvivors:startSurvivors23.length,
    selected:{
      node:selected23.node.raw.map(i=>T[i]),
      center:selected23.node.center,
      radius:selected23.node.radius,
      axis:selected23.node.axis,
      start:start23,
      cells:cells23,
      key:key23.key.map(i=>T[i]),
      plaintext:plaintext23.map(i=>T[i])
    }
  },
  block24:{
    geometricCandidates:candidates24.length,
    predictedSignature:prediction24.signature,
    signatureSurvivors:signatureSurvivors24.length,
    selected:{
      node:selected24.node.raw.map(i=>T[i]),
      center:selected24.node.center,
      radius:selected24.node.radius,
      start:selected24.start,
      cells:cells24,
      key:selected24.direct.key.map(i=>T[i]),
      plaintext:plaintext24.map(i=>T[i])
    }
  },
  caveat:"The coordinate families and row-continuity rule were formulated after the public route was known. Block 24 additionally depends on the pre-existing Direct/+0 signature recurrence. This is finite source selection, not independent authentication."
},null,2));
