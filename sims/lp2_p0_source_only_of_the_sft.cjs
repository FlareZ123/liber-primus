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

console.log(JSON.stringify({
  status:"source-only recurrence deterministically extends IDEA through OF THE and fixes the next END key/start/direction",
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
  nextStage:{
    unusedIncidentKeyCandidates:nextKeys.length,
    keyMirror:endKeyMirror.raw.map(value=>T[value]),
    key:endKey.map(value=>T[value]),
    bridgeNear,
    alignedRadiusMatchedBridges:alignedBridge.length,
    bridge:alignedBridge[0].raw.map(value=>T[value]),
    start:endStart,
    readDirection:endRead,
    threeRuneProbe:endThree.map(at).map(value=>T[value]),
    threeRunePlaintext:decrypt(endThree,endKey).map(value=>T[value]),
    stopLengthStatus:"three runes decrypt END, but the recurrence above does not independently derive that stop length",
  },
},null,2));
