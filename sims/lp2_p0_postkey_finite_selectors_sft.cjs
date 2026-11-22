"use strict";

/**
 * SFT: conditional p0-p2 finite source selectors for blocks 20-22.
 *
 * Upstream premise: the post-THEN finite selector has already chosen block 19:
 * key TH-H-TH centered at (12,16), radius 1, and ciphertext
 * N(21,4)->L(20,4)->EA(19,4), yielding the rune sequence C/K-E-Y.
 *
 * This file exhausts small sign/axis families before decryption for the next
 * three blocks. The families were formulated after the public candidate route
 * was known, so these are reproducible post-hoc mechanism candidates.
 *
 * Run:
 *   node sims/lp2_p0_postkey_finite_selectors_sft.cjs
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

/** @param {number[]} raw */
function deriveKey(raw){
  const derived=[raw[0],phi(raw[1]),raw[2]];
  const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}

/** @param {Array<[number,number]>} cells @param {number[]} key */
function decrypt(cells,key){
  return cells.map((q,i)=>mod(at(q)-key[i%3]));
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
  if(!inBounds(p1)||!inBounds(p2)||!inBounds(center))return null;
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

// ---------- Upstream block 19 ----------

const block19={
  node:{center:[12,16],axis:[1,0],radius:1,raw:[2,8,2]},
  cells:[[21,4],[20,4],[19,4]],
  endpoint:[19,4],
  ciphertextLength:3
};

assert.deepEqual(block19.node.raw.map(i=>T[i]),["TH","H","TH"]);
assert.deepEqual(block19.cells.map(at).map(i=>T[i]),["N","L","EA"]);
assert.deepEqual(
  decrypt(block19.cells,deriveKey(block19.node.raw)).map(i=>T[i]),
  ["C","E","Y"]
);

// ---------- Block 20 finite sign/axis family ----------
//
// Derive:
//   next length = phi(previous endpoint column)
//   next radius = mean(phi(previous key-center row), phi(previous key-center col))
//
// For all four sign pairs:
//   start  = previous endpoint + (signRow*currentRadius,
//                                 signCol*currentCipherLength)
//   center = start + (signRow*currentRadius,
//                     signCol*nextLength)
//
// At each in-bounds center, test all four grid axes at the derived radius.
// Plaintext is ignored until the equal-outer source node is selected.

const length20=phi(block19.endpoint[1]);
const radius20=(phi(block19.node.center[0])+phi(block19.node.center[1]))/2;
assert.deepEqual({length20,radius20},{length20:2,radius20:6});
assert.ok(Number.isInteger(radius20));

const candidates20=[];
for(const rowSign of [-1,1]){
  for(const colSign of [-1,1]){
    const start=[
      block19.endpoint[0]+rowSign*block19.node.radius,
      block19.endpoint[1]+colSign*block19.ciphertextLength
    ];
    const center=[
      start[0]+rowSign*block19.node.radius,
      start[1]+colSign*length20
    ];
    if(!inBounds(start)||!inBounds(center))continue;

    for(const axis of axes){
      const node=nodeAt(center,axis,radius20);
      if(!node)continue;
      candidates20.push({rowSign,colSign,start,node});
    }
  }
}

assert.equal(candidates20.length,8);
const mirrors20=candidates20.filter(x=>x.node.equalOuter);
assert.equal(mirrors20.length,1);

const selected20=mirrors20[0];
assert.deepEqual({
  signs:[selected20.rowSign,selected20.colSign],
  start:selected20.start,
  center:selected20.node.center,
  axis:selected20.node.axis,
  radius:selected20.node.radius,
  raw:selected20.node.raw.map(i=>T[i])
},{
  signs:[-1,1],
  start:[18,7],
  center:[17,9],
  axis:[0,1],
  radius:6,
  raw:["W","I","W"]
});

const direction20=[-selected20.rowSign,-selected20.colSign];
const cells20=[];
for(let i=0,q=selected20.start;i<length20;i++,q=[
  q[0]+direction20[0],
  q[1]+direction20[1]
]){
  assert.ok(inBounds(q));
  cells20.push(q);
}
const key20=deriveKey(selected20.node.raw);
const plaintext20=decrypt(cells20,key20);

assert.deepEqual(cells20,[[18,7],[19,6]]);
assert.deepEqual(cells20.map(at).map(i=>T[i]),["X","OE"]);
assert.deepEqual(key20.map(i=>T[i]),["R","W","W"]);
assert.deepEqual(plaintext20.map(i=>T[i]),["I","S"]);

// ---------- Block 21 carried/reversed-direction family ----------
//
// From block 20:
// - allow either the carried read direction or its exact reverse;
// - jump from the previous endpoint by the current original center-rune index;
// - move the next key center from the current key center by
//     (direction.row * current center column,
//      direction.col * phi(current center row));
// - halve the current radius;
// - test all four axes.
//
// Bounds are applied before source-rune equality.

const endpoint20=cells20.at(-1);
const direction21Choices=[
  direction20,
  [-direction20[0],-direction20[1]]
];
const radius21=selected20.node.radius/2;
assert.equal(radius21,3);

const candidates21=[];
for(const direction of direction21Choices){
  const start=[
    endpoint20[0]+direction[0]*selected20.node.raw[1],
    endpoint20[1]+direction[1]*selected20.node.raw[1]
  ];
  const center=[
    selected20.node.center[0]+direction[0]*selected20.node.center[1],
    selected20.node.center[1]+direction[1]*phi(selected20.node.center[0])
  ];
  if(!inBounds(start)||!inBounds(center))continue;

  for(const axis of axes){
    const node=nodeAt(center,axis,radius21);
    if(!node)continue;
    candidates21.push({direction,start,node});
  }
}

// The carried direction exits the matrix. The reversed direction leaves one
// in-bounds axis geometry, and that geometry is a mirror.
assert.equal(candidates21.length,1);
const mirrors21=candidates21.filter(x=>x.node.equalOuter);
assert.equal(mirrors21.length,1);

const selected21=mirrors21[0];
assert.deepEqual({
  direction:selected21.direction,
  start:selected21.start,
  center:selected21.node.center,
  axis:selected21.node.axis,
  radius:selected21.node.radius,
  raw:selected21.node.raw.map(i=>T[i])
},{
  direction:[-1,1],
  start:[9,16],
  center:[8,25],
  axis:[1,0],
  radius:3,
  raw:["X","M","X"]
});

const cells21=[];
for(let i=0,q=selected21.start;i<length20;i++,q=[
  q[0]+selected21.direction[0],
  q[1]+selected21.direction[1]
]){
  assert.ok(inBounds(q));
  cells21.push(q);
}
const key21=deriveKey(selected21.node.raw);
const plaintext21=decrypt(cells21,key21);

assert.deepEqual(cells21,[[9,16],[8,17]]);
assert.deepEqual(cells21.map(at).map(i=>T[i]),["U","NG"]);
assert.deepEqual(key21.map(i=>T[i]),["X","E","X"]);
assert.deepEqual(plaintext21.map(i=>T[i]),["T","O"]);

// ---------- Block 22 finite key/start family ----------
//
// From block 21:
//   d = phi(current key-center row)
//   next radius = current radius + d
//
// Enumerate all four sign pairs for:
//   candidate center = previous endpoint + (signRow*d,
//                                           signCol*currentRadius)
// and all four axes at the new radius.
//
// Source equality selects one key node. For the ciphertext start, try both
// horizontal signs from the previous block's start at distance d. Keep the
// start whose horizontal distance to the selected key center equals
// phi(nextRadius). Read two runes in the chosen horizontal direction.

const endpoint21=cells21.at(-1);
const d22=phi(selected21.node.center[0]);
const radius22=selected21.node.radius+d22;
assert.deepEqual({d22,radius22},{d22:4,radius22:7});

const candidates22=[];
for(const rowSign of [-1,1]){
  for(const colSign of [-1,1]){
    const center=[
      endpoint21[0]+rowSign*d22,
      endpoint21[1]+colSign*selected21.node.radius
    ];
    if(!inBounds(center))continue;

    for(const axis of axes){
      const node=nodeAt(center,axis,radius22);
      if(!node)continue;
      candidates22.push({rowSign,colSign,node});
    }
  }
}

assert.equal(candidates22.length,10);
const mirrors22=candidates22.filter(x=>x.node.equalOuter);
assert.equal(mirrors22.length,1);
const selected22=mirrors22[0];

assert.deepEqual({
  center:selected22.node.center,
  axis:selected22.node.axis,
  radius:selected22.node.radius,
  raw:selected22.node.raw.map(i=>T[i])
},{
  center:[12,14],
  axis:[1,0],
  radius:7,
  raw:["TH","G","TH"]
});

const startCandidates22=[];
for(const colSign of [-1,1]){
  const start=[
    selected21.start[0],
    selected21.start[1]+colSign*d22
  ];
  if(!inBounds(start))continue;
  const centerDistance=Math.abs(start[1]-selected22.node.center[1]);
  startCandidates22.push({
    colSign,
    start,
    centerDistance,
    targetDistance:phi(radius22),
    matches:centerDistance===phi(radius22)
  });
}

assert.equal(startCandidates22.length,2);
const starts22=startCandidates22.filter(x=>x.matches);
assert.equal(starts22.length,1);
assert.deepEqual(starts22[0],{
  colSign:1,
  start:[9,20],
  centerDistance:6,
  targetDistance:6,
  matches:true
});

const cells22=[
  starts22[0].start,
  [starts22[0].start[0],starts22[0].start[1]+starts22[0].colSign]
];
const key22=deriveKey(selected22.node.raw);
const plaintext22=decrypt(cells22,key22);

assert.deepEqual(cells22,[[9,20],[9,21]]);
assert.deepEqual(cells22.map(at).map(i=>T[i]),["H","C"]);
assert.deepEqual(key22.map(i=>T[i]),["TH","TH","TH"]);
assert.deepEqual(plaintext22.map(i=>T[i]),["G","O"]);

console.log(JSON.stringify({
  status:"conditional finite source selectors reproduce blocks 20-22",
  block20:{
    familyCandidates:candidates20.length,
    equalOuterSurvivors:mirrors20.length,
    selected:{
      start:selected20.start,
      center:selected20.node.center,
      radius:selected20.node.radius,
      axis:selected20.node.axis,
      node:selected20.node.raw.map(i=>T[i]),
      cells:cells20,
      key:key20.map(i=>T[i]),
      plaintext:plaintext20.map(i=>T[i])
    }
  },
  block21:{
    directionChoices:direction21Choices,
    inBoundsGeometries:candidates21.length,
    equalOuterSurvivors:mirrors21.length,
    selected:{
      direction:selected21.direction,
      start:selected21.start,
      center:selected21.node.center,
      radius:selected21.node.radius,
      axis:selected21.node.axis,
      node:selected21.node.raw.map(i=>T[i]),
      cells:cells21,
      key:key21.map(i=>T[i]),
      plaintext:plaintext21.map(i=>T[i])
    }
  },
  block22:{
    keyGeometries:candidates22.length,
    equalOuterKeySurvivors:mirrors22.length,
    startCandidates:startCandidates22,
    startSurvivors:starts22.length,
    selected:{
      center:selected22.node.center,
      radius:selected22.node.radius,
      axis:selected22.node.axis,
      node:selected22.node.raw.map(i=>T[i]),
      cells:cells22,
      key:key22.map(i=>T[i]),
      plaintext:plaintext22.map(i=>T[i])
    }
  },
  caveat:"These finite selector families were formulated after the public candidate route was known. They reduce source ambiguity without independently authenticating the plaintext."
},null,2));
