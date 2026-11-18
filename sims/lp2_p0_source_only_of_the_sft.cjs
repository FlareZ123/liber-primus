"use strict";

/**
 * SFT: source-only recurrence from the independently reached IDEA endpoint.
 *
 * No downstream plaintext, dictionary or checksum selects OF or THE.
 * The input state is only the upstream IDEA endpoint D(17,18) and its
 * established read direction down-left.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"
));
const T=corpus.translit;
const grid=corpus.pages.filter(page=>page.page<=2).flatMap(page=>page.indices);
assert.equal(grid.length,729);

const at=point=>grid[(point[0]-1)*27+point[1]-1];
const coord=point=>point[0]+","+point[1];
const mod29=value=>(value%29+29)%29;

/** @param {number} n */
function phi(n){
  let result=n,rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    while(rest%p===0)rest/=p;
    result-=result/p;
  }
  if(rest>1)result-=result/rest;
  return result;
}

/** @param {number} n */
function mu(n){
  let rest=n,sign=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;sign=-sign;
    if(rest%p===0)return 0;
  }
  return rest>1?-sign:sign;
}

const axes=[[0,1],[1,0],[1,1],[1,-1]];
const mirrors=[];
const centered=new Map();
const incident=new Map();
function add(map,key,value){
  if(!map.has(key))map.set(key,[]);
  map.get(key).push(value);
}
for(let row=1;row<=27;row++){
  for(let column=1;column<=27;column++){
    for(const [dr,dc] of axes){
      for(let radius=1;radius<=13;radius++){
        const a=[row-dr*radius,column-dc*radius];
        const b=[row+dr*radius,column+dc*radius];
        if([...a,...b].some(value=>value<1||value>27))break;
        if(at(a)!==at(b))continue;
        const mirror={
          id:mirrors.length,
          a,
          center:[row,column],
          b,
          axis:[dr,dc],
          radius,
          raw:[at(a),at([row,column]),at(b)],
        };
        mirrors.push(mirror);
        add(centered,coord(mirror.center),mirror);
        for(const point of [a,mirror.center,b])add(incident,coord(point),mirror);
      }
    }
  }
}
assert.equal(mirrors.length,507);

function deriveKey(mirror){
  const derived=[mirror.raw[0],phi(mirror.raw[1]),mirror.raw[2]];
  const rotation=((derived.reduce((sum,value)=>sum+mu(phi(value)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}
function decrypt(cells,key){
  return cells.map((cell,i)=>mod29(at(cell)-key[i%3]));
}
function isOuter(mirror,point){
  return coord(mirror.a)===coord(point)||coord(mirror.b)===coord(point);
}
function chebyshev(a,b){
  return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
}

// Upstream state from the existing source-bounded continuation.
const ideaEndpoint=[17,18];
const ideaRead=[1,-1];
assert.equal(T[at(ideaEndpoint)],"D");

// The endpoint centers exactly one equal-outer mirror.
const primary=(centered.get(coord(ideaEndpoint))||[]);
assert.equal(primary.length,1);
const primaryMirror=primary[0];
assert.deepEqual(primaryMirror.raw.map(value=>T[value]),["J","D","J"]);

// Exactly one outer cell of that mirror is itself the center of another
// equal-outer mirror.
const outerCentered=[];
for(const outer of [primaryMirror.a,primaryMirror.b]){
  for(const mirror of centered.get(coord(outer))||[]){
    outerCentered.push({outer,mirror});
  }
}
assert.equal(outerCentered.length,1);
const secondary=outerCentered[0].mirror;
assert.deepEqual(secondary.raw.map(value=>T[value]),["OE","J","OE"]);
assert.deepEqual(secondary.center,[19,16]);

// Choose the secondary outer nearest the IDEA endpoint. It is unique.
const secondaryOuters=[secondary.a,secondary.b]
  .map(point=>({point,distance:chebyshev(point,ideaEndpoint)}))
  .sort((a,b)=>a.distance-b.distance);
assert.notEqual(secondaryOuters[0].distance,secondaryOuters[1].distance);
const nearOuter=secondaryOuters[0].point;
assert.deepEqual(nearOuter,[18,16]);

// Project the prior IDEA read direction onto the perpendicular axis of the
// secondary mirror. This deterministically yields one cell left.
const perpendicular=[-secondary.axis[1],secondary.axis[0]];
const dot=ideaRead[0]*perpendicular[0]+ideaRead[1]*perpendicular[1];
assert.notEqual(dot,0);
const inheritedPerpendicular=perpendicular.map(value=>value*Math.sign(dot));
assert.deepEqual(inheritedPerpendicular,[0,-1]);

const ofStart=[
  nearOuter[0]+inheritedPerpendicular[0],
  nearOuter[1]+inheritedPerpendicular[1],
];
const ofRead=inheritedPerpendicular.map(value=>-value);
const ofCells=[ofStart,nearOuter];
const ofKey=deriveKey(primaryMirror);
const ofPlain=decrypt(ofCells,ofKey);
assert.deepEqual(ofCells,[[18,15],[18,16]]);
assert.deepEqual(ofKey.map(value=>T[value]),["J","OE","J"]);
assert.deepEqual(ofPlain.map(value=>T[value]),["O","F"]);

// The same secondary mirror becomes the next key. Move from its near outer
// inward to its center. Then take one cell in the prior OF read direction and
// read back to the center.
const centerStep=[
  Math.sign(secondary.center[0]-nearOuter[0]),
  Math.sign(secondary.center[1]-nearOuter[1]),
];
assert.deepEqual(centerStep,[1,0]);
const sharedCenter=[
  nearOuter[0]+centerStep[0],
  nearOuter[1]+centerStep[1],
];
assert.deepEqual(sharedCenter,secondary.center);
const theStart=[
  sharedCenter[0]+ofRead[0],
  sharedCenter[1]+ofRead[1],
];
const theRead=ofRead.map(value=>-value);
const theCells=[theStart,sharedCenter];
const theKey=deriveKey(secondary);
const thePlain=decrypt(theCells,theKey);
assert.deepEqual(theCells,[[19,17],[19,16]]);
assert.deepEqual(theKey.map(value=>T[value]),["OE","OE","I"]);
assert.deepEqual(thePlain.map(value=>T[value]),["TH","E"]);

// The next key and START geometry are also source-constrained, even though
// the stop length is not yet supplied by this recurrence.
const usedIds=new Set([primaryMirror.id,secondary.id]);
const nextKeys=(incident.get(coord(sharedCenter))||[])
  .filter(mirror=>!usedIds.has(mirror.id));
assert.equal(nextKeys.length,1);
const endKeyMirror=nextKeys[0];
assert.deepEqual(endKeyMirror.raw.map(value=>T[value]),["J","B","J"]);
assert.equal(endKeyMirror.radius,4);

const bridgeNear=[
  sharedCenter[0]+theRead[0],
  sharedCenter[1]+theRead[1],
];
assert.deepEqual(bridgeNear,[19,15]);
assert.equal(T[at(bridgeNear)],"F");
const alignedBridge=(incident.get(coord(bridgeNear))||[]).filter(mirror=>{
  if(!isOuter(mirror,bridgeNear))return false;
  if(mirror.radius!==endKeyMirror.radius)return false;
  const horizontal=theRead[0]===0;
  return horizontal?mirror.axis[0]===0:mirror.axis[1]===0;
});
assert.equal(alignedBridge.length,1);
assert.deepEqual(alignedBridge[0].raw.map(value=>T[value]),["F","X","F"]);
const endStart=coord(alignedBridge[0].a)===coord(bridgeNear)
  ? alignedBridge[0].b
  : alignedBridge[0].a;
assert.deepEqual(endStart,[19,23]);

const keyVector=[
  endKeyMirror.center[0]-sharedCenter[0],
  endKeyMirror.center[1]-sharedCenter[1],
];
const endRead=alignedBridge[0].axis[0]===0
  ? [Math.sign(keyVector[0]),0]
  : [0,Math.sign(keyVector[1])];
assert.deepEqual(endRead,[1,0]);
const endKey=deriveKey(endKeyMirror);
assert.deepEqual(endKey.map(value=>T[value]),["J","J","T"]);
const endThree=[
  endStart,
  [endStart[0]+endRead[0],endStart[1]+endRead[1]],
  [endStart[0]+2*endRead[0],endStart[1]+2*endRead[1]],
];
assert.deepEqual(endThree.map(at).map(value=>T[value]),["F","L","I"]);
assert.deepEqual(decrypt(endThree,endKey).map(value=>T[value]),["E","N","D"]);

// END stop: continue down from the source-derived start. A viable structural
// handoff is an outer-endpoint mirror that has exactly one distinct mirror at
// the same center with the same totient signature after center replacement.
function signature(mirror){
  const derived=[mirror.raw[0],phi(mirror.raw[1]),mirror.raw[2]];
  return derived.map(value=>phi(value));
}
function signatureTransitions(point){
  const out=[];
  for(const base of (incident.get(coord(point))||[]).filter(
    mirror=>isOuter(mirror,point)
  )){
    const sig=JSON.stringify(signature(base));
    for(const mate of centered.get(coord(base.center))||[]){
      if(mate.id===base.id)continue;
      if(JSON.stringify(signature(mate))===sig)out.push({base,mate});
    }
  }
  return out;
}
const endRay=[];
for(let step=1;;step++){
  const point=[
    endStart[0]+endRead[0]*step,
    endStart[1]+endRead[1]*step,
  ];
  if(point.some(value=>value<1||value>27))break;
  endRay.push({step,point,transitions:signatureTransitions(point)});
}
const endHandoffs=endRay.filter(row=>row.transitions.length>0);
assert.equal(endHandoffs.length,1);
assert.equal(endHandoffs[0].step,2);
assert.deepEqual(endHandoffs[0].point,[21,23]);
assert.equal(endHandoffs[0].transitions.length,1);
const endCells=[
  endStart,
  [endStart[0]+endRead[0],endStart[1]+endRead[1]],
  endHandoffs[0].point,
];
const endPlain=decrypt(endCells,endKey);
assert.deepEqual(endPlain.map(value=>T[value]),["E","N","D"]);

// The unique END handoff is I-R-I -> H-R-H. The latter becomes the IS key.
const isBase=endHandoffs[0].transitions[0].base;
const isKeyMirror=endHandoffs[0].transitions[0].mate;
assert.deepEqual(isBase.raw.map(value=>T[value]),["I","R","I"]);
assert.deepEqual(isKeyMirror.raw.map(value=>T[value]),["H","R","H"]);

// Select the H outer opposite the END endpoint across the shared center.
const endEndpoint=endHandoffs[0].point;
const endpointSide=Math.sign(endEndpoint[1]-isBase.center[1]);
const isKeyOuter=[isKeyMirror.a,isKeyMirror.b].filter(point=>
  Math.sign(point[1]-isKeyMirror.center[1])===-endpointSide
);
assert.equal(isKeyOuter.length,1);
assert.deepEqual(isKeyOuter[0],[21,17]);

// Continue through the unique same-axis mirror at that H, then the unique
// other same-axis mirror centered on the resulting L.
const hBridges=(incident.get(coord(isKeyOuter[0]))||[]).filter(mirror=>
  mirror.id!==isKeyMirror.id &&
  isOuter(mirror,isKeyOuter[0]) &&
  JSON.stringify(mirror.axis)===JSON.stringify(isKeyMirror.axis)
);
assert.equal(hBridges.length,1);
assert.deepEqual(hBridges[0].raw.map(value=>T[value]),["H","L","H"]);
const lCenter=hBridges[0].center;
const eoBridges=(centered.get(coord(lCenter))||[]).filter(mirror=>
  mirror.id!==hBridges[0].id &&
  JSON.stringify(mirror.axis)===JSON.stringify(hBridges[0].axis)
);
assert.equal(eoBridges.length,1);
assert.deepEqual(eoBridges[0].raw.map(value=>T[value]),["EO","L","EO"]);
const traversalSign=Math.sign(lCenter[1]-isKeyOuter[0][1]);
const isStarts=[eoBridges[0].a,eoBridges[0].b].filter(point=>
  Math.sign(point[1]-lCenter[1])===traversalSign
);
assert.equal(isStarts.length,1);
const isStart=isStarts[0];
const isRead=[0,-traversalSign];
assert.deepEqual(isStart,[21,9]);
assert.deepEqual(isRead,[0,1]);

// IS stop and DEATH key: scan toward L for the first centered mirror whose
// perpendicular-radius displacement lands on the center of an already used
// key. The only such event on the full ray lands on J-B-J's center.
const usedKeyCenters=new Map([[coord(endKeyMirror.center),endKeyMirror]]);
function reuseBridges(point){
  const out=[];
  for(const mirror of centered.get(coord(point))||[]){
    const perpendicular=[mirror.axis[1],-mirror.axis[0]];
    for(const sign of [-1,1]){
      const target=[
        point[0]+sign*mirror.radius*perpendicular[0],
        point[1]+sign*mirror.radius*perpendicular[1],
      ];
      const reused=usedKeyCenters.get(coord(target));
      if(reused)out.push({mirror,target,reused});
    }
  }
  return out;
}
const isRay=[];
for(let step=1;;step++){
  const point=[
    isStart[0]+isRead[0]*step,
    isStart[1]+isRead[1]*step,
  ];
  if(point.some(value=>value<1||value>27))break;
  isRay.push({step,point,bridges:reuseBridges(point)});
}
const reuseEvents=isRay.filter(row=>row.bridges.length>0);
assert.equal(reuseEvents.length,1);
assert.equal(reuseEvents[0].step,1);
assert.deepEqual(reuseEvents[0].point,[21,10]);
assert.equal(reuseEvents[0].bridges.length,1);
const reuseEvent=reuseEvents[0].bridges[0];
assert.deepEqual(reuseEvent.mirror.raw.map(value=>T[value]),["E","D","E"]);
assert.deepEqual(reuseEvent.target,[23,12]);
assert.equal(reuseEvent.reused.id,endKeyMirror.id);

const isCells=[isStart,reuseEvents[0].point];
const isKey=deriveKey(isKeyMirror);
const isPlain=decrypt(isCells,isKey);
assert.deepEqual(isKey.map(value=>T[value]),["TH","H","H"]);
assert.deepEqual(isPlain.map(value=>T[value]),["I","S"]);

// Reuse J-B-J for DEATH. Its J at the prior THE/END junction is already
// consumed, so the opposite outer J(27,8) is the unique forward outer.
const deathKeyMirror=reuseEvent.reused;
const deathOuters=[deathKeyMirror.a,deathKeyMirror.b]
  .filter(point=>coord(point)!==coord(sharedCenter));
assert.equal(deathOuters.length,1);
const deathOuter=deathOuters[0];
assert.deepEqual(deathOuter,[27,8]);

// At that J, exclude the reused key and choose the shortest new equal-outer
// mirror. J-C-J at radius 1 is the unique minimum.
const deathNextMirrors=(incident.get(coord(deathOuter))||[]).filter(mirror=>
  mirror.id!==deathKeyMirror.id && isOuter(mirror,deathOuter)
);
const minimumDeathRadius=Math.min(...deathNextMirrors.map(mirror=>mirror.radius));
const minimumDeathMirrors=deathNextMirrors.filter(
  mirror=>mirror.radius===minimumDeathRadius
);
assert.equal(minimumDeathMirrors.length,1);
const jcMirror=minimumDeathMirrors[0];
assert.deepEqual(jcMirror.raw.map(value=>T[value]),["J","C","J"]);
assert.equal(jcMirror.radius,1);
const cCenter=jcMirror.center;
assert.deepEqual(cCenter,[26,7]);

// At C(26,7), exactly one other mirror uses C as an outer endpoint.
const cBridges=(incident.get(coord(cCenter))||[]).filter(mirror=>
  mirror.id!==jcMirror.id && isOuter(mirror,cCenter)
);
assert.equal(cBridges.length,1);
assert.deepEqual(cBridges[0].raw.map(value=>T[value]),["C","OE","C"]);
const deathStart=coord(cBridges[0].a)===coord(cCenter)
  ? cBridges[0].b
  : cBridges[0].a;
assert.deepEqual(deathStart,[26,3]);

// Continue in the same direction from the C-OE-C center through its far outer
// and onward to the boundary. The boundary fixes the three-rune stop.
const deathRead=[
  Math.sign(deathStart[0]-cBridges[0].center[0]),
  Math.sign(deathStart[1]-cBridges[0].center[1]),
];
assert.deepEqual(deathRead,[0,-1]);
const deathCells=[];
for(
  let point=[...deathStart];
  point.every(value=>value>=1&&value<=27);
  point=[point[0]+deathRead[0],point[1]+deathRead[1]]
){
  deathCells.push([...point]);
}
assert.deepEqual(deathCells,[[26,3],[26,2],[26,1]]);
const deathKey=deriveKey(deathKeyMirror);
const deathPlain=decrypt(deathCells,deathKey);
assert.deepEqual(deathKey.map(value=>T[value]),["J","J","T"]);
assert.deepEqual(deathPlain.map(value=>T[value]),["D","EA","TH"]);

const continuationPlain=[
  ...ofPlain,...thePlain,...endPlain,...isPlain,...deathPlain,
];
assert.equal(continuationPlain.length,12);
assert.equal(
  continuationPlain.reduce((sum,value)=>sum+value,0),
  151
);

console.log(JSON.stringify({
  status:"source-only recurrence deterministically extends IDEA through OF THE END IS DEATH",
  idea:{endpoint:ideaEndpoint,readDirection:ideaRead},
  of:{
    primaryMirror:primaryMirror.raw.map(value=>T[value]),
    secondaryMirror:secondary.raw.map(value=>T[value]),
    secondaryOuterDistances:secondaryOuters,
    inheritedPerpendicular,
    start:ofStart,
    ciphertext:ofCells.map(at).map(value=>T[value]),
    key:ofKey.map(value=>T[value]),
    plaintext:ofPlain.map(value=>T[value]),
    endpoint:nearOuter,
    readDirection:ofRead,
  },
  the:{
    start:theStart,
    ciphertext:theCells.map(at).map(value=>T[value]),
    key:theKey.map(value=>T[value]),
    plaintext:thePlain.map(value=>T[value]),
    endpoint:sharedCenter,
    readDirection:theRead,
  },
  end:{
    unusedIncidentKeyCandidates:nextKeys.length,
    keyMirror:endKeyMirror.raw.map(value=>T[value]),
    key:endKey.map(value=>T[value]),
    bridge:alignedBridge[0].raw.map(value=>T[value]),
    start:endStart,
    readDirection:endRead,
    rayHandoffCounts:endRay.map(row=>({
      point:row.point,
      count:row.transitions.length,
    })),
    endpoint:endEndpoint,
    ciphertext:endCells.map(at).map(value=>T[value]),
    plaintext:endPlain.map(value=>T[value]),
  },
  is:{
    baseMirror:isBase.raw.map(value=>T[value]),
    keyMirror:isKeyMirror.raw.map(value=>T[value]),
    key:isKey.map(value=>T[value]),
    start:isStart,
    readDirection:isRead,
    reuseBridgeEvents:isRay.map(row=>({
      point:row.point,
      count:row.bridges.length,
    })),
    endpoint:reuseEvents[0].point,
    ciphertext:isCells.map(at).map(value=>T[value]),
    plaintext:isPlain.map(value=>T[value]),
  },
  death:{
    reuseMirror:reuseEvent.mirror.raw.map(value=>T[value]),
    reusedKeyMirror:deathKeyMirror.raw.map(value=>T[value]),
    forwardOuter:deathOuter,
    nextMirrorCandidates:deathNextMirrors.map(mirror=>({
      runes:mirror.raw.map(value=>T[value]),
      radius:mirror.radius,
    })),
    selectedNextMirror:jcMirror.raw.map(value=>T[value]),
    cBridge:cBridges[0].raw.map(value=>T[value]),
    start:deathStart,
    readDirection:deathRead,
    ciphertext:deathCells.map(at).map(value=>T[value]),
    plaintext:deathPlain.map(value=>T[value]),
  },
  continuation:{
    plaintext:continuationPlain.map(value=>T[value]),
    runes:continuationPlain.length,
    indexSum:continuationPlain.reduce((sum,value)=>sum+value,0),
    selectorInputs:"geometry, prior endpoint/read state, mirror signatures, key reuse, boundary; no dictionary or downstream checksum",
  },
},null,2));
