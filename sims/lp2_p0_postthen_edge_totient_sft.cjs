"use strict";

/**
 * SFT: conditional post-THEN right-edge and next-block totient selectors.
 *
 * Upstream premise: the source-only continuation has selected block 17 THEN,
 * with key IA-IA-IA centered at (26,22) and ciphertext ending W(25,27).
 *
 * This test contains two plaintext-blind finite selectors:
 * 1. a right-edge "center-pair" transform that selects block 18;
 * 2. a coordinate/radius totient transform that selects block 19.
 *
 * The constructions were found after the public candidate route was known.
 * They are therefore intermediate mechanism candidates, not authentication.
 *
 * Run:
 *   node sims/lp2_p0_postthen_edge_totient_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const T=corpus.translit;
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(grid.length,729);

const at=q=>grid[(q[0]-1)*27+q[1]-1];
const mod=x=>(x%29+29)%29;
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];

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

/** @param {number} n @param {number} count */
function phiIterate(n,count){
  for(let i=0;i<count;i++)n=phi(n);
  return n;
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

// ---------- Upstream THEN state ----------

const thenKey={
  p1:[25,22],
  center:[26,22],
  p2:[27,22],
  axis:[1,0],
  radius:1,
  raw:[27,27,27]
};
const thenCells=[[25,25],[25,26],[25,27]];
const thenEndpoint=thenCells.at(-1);

assert.deepEqual(thenKey.raw.map(i=>T[i]),["IA","IA","IA"]);
assert.deepEqual(thenCells.map(at).map(i=>T[i]),["L","T","W"]);
assert.deepEqual(decrypt(thenCells,deriveKey(thenKey.raw)).map(i=>T[i]),["TH","E","N"]);
assert.equal(thenEndpoint[1],27);

// ---------- Block 18 center-pair edge family ----------
//
// The prior key's center cell supplies two semantically fixed values:
// - its coordinate on the boundary-normal dimension: column 22;
// - its rune index: IA = 27.
//
// The candidate transform uses phi-iterates of those two values as an outer
// placement scale and an inner placement/radius scale. To avoid silently
// choosing the desired iterate depths or orientation, enumerate:
// - phi depths 1..5 for each source;
// - both half/full coordinate shapes;
// - all four sign pairs;
// - all four grid axes.
//
// Keep only in-bounds geometries with even scales and a nonzero equal-outer
// three-cell node at the proposed center. Plaintext is not consulted.

const edgeCandidates=[];
for(let outerDepth=1;outerDepth<=5;outerDepth++){
  for(let innerDepth=1;innerDepth<=5;innerDepth++){
    const outerScale=phiIterate(thenKey.center[1],outerDepth);
    const innerScale=phiIterate(thenKey.raw[1],innerDepth);
    if(outerScale%2!==0||innerScale%2!==0||innerScale<2)continue;

    for(const shape of ["rowHalf_colFull","rowFull_colHalf"]){
      for(const rowSign of [-1,1]){
        for(const colSign of [-1,1]){
          const center=shape==="rowHalf_colFull"
            ?[
              thenEndpoint[0]+rowSign*outerScale/2,
              thenEndpoint[1]+colSign*outerScale
            ]
            :[
              thenEndpoint[0]+rowSign*outerScale,
              thenEndpoint[1]+colSign*outerScale/2
            ];
          const start=shape==="rowHalf_colFull"
            ?[
              thenEndpoint[0]+rowSign*innerScale/2,
              thenEndpoint[1]+colSign*innerScale
            ]
            :[
              thenEndpoint[0]+rowSign*innerScale,
              thenEndpoint[1]+colSign*innerScale/2
            ];
          if(!inBounds(center)||!inBounds(start))continue;

          const radius=innerScale/2;
          for(const axis of axes){
            const p1=[center[0]-axis[0]*radius,center[1]-axis[1]*radius];
            const p2=[center[0]+axis[0]*radius,center[1]+axis[1]*radius];
            if(!inBounds(p1)||!inBounds(p2))continue;

            edgeCandidates.push({
              outerDepth,
              innerDepth,
              outerScale,
              innerScale,
              shape,
              rowSign,
              colSign,
              center,
              start,
              radius,
              axis,
              p1,
              p2,
              raw:[at(p1),at(center),at(p2)],
              equalOuter:at(p1)===at(p2)&&at(center)!==0
            });
          }
        }
      }
    }
  }
}

assert.equal(edgeCandidates.length,47);
const edgeMirrors=edgeCandidates.filter(x=>x.equalOuter);
assert.equal(edgeMirrors.length,1);
const block18=edgeMirrors[0];

assert.deepEqual({
  outerDepth:block18.outerDepth,
  innerDepth:block18.innerDepth,
  outerScale:block18.outerScale,
  innerScale:block18.innerScale,
  shape:block18.shape,
  rowSign:block18.rowSign,
  colSign:block18.colSign,
  center:block18.center,
  start:block18.start,
  radius:block18.radius,
  axis:block18.axis,
  raw:block18.raw.map(i=>T[i])
},{
  outerDepth:1,
  innerDepth:2,
  outerScale:10,
  innerScale:6,
  shape:"rowHalf_colFull",
  rowSign:-1,
  colSign:-1,
  center:[20,17],
  start:[22,21],
  radius:3,
  axis:[1,0],
  raw:["N","M","N"]
});

// The read direction is the sign of the selected inward placement vector; the
// inner scale determines length by one more totient.
const direction18=[block18.rowSign,block18.colSign];
const length18=phi(block18.innerScale);
assert.equal(length18,2);
const cells18=[];
for(let i=0,q=block18.start;i<length18;i++,q=add(q,direction18)){
  assert.ok(inBounds(q));
  cells18.push(q);
}
const key18=deriveKey(block18.raw);
const plaintext18=decrypt(cells18,key18);

assert.deepEqual(cells18,[[22,21],[21,20]]);
assert.deepEqual(cells18.map(at).map(i=>T[i]),["J","W"]);
assert.deepEqual(key18.map(i=>T[i]),["N","E","N"]);
assert.deepEqual(plaintext18.map(i=>T[i]),["TH","E"]);

// Negative control: the fixed depth-1/depth-2 center-pair transform applied to
// the earlier left-edge DEATH state produces no equal-outer source node.
function fixedCenterPairMirrorCount(endpoint,keyCenterColumn,keyCenterRune){
  const outerScale=phi(keyCenterColumn);
  const innerScale=phi(phi(keyCenterRune));
  if(outerScale%2!==0||innerScale%2!==0||innerScale<2)return 0;
  let count=0;

  for(const shape of ["rowHalf_colFull","rowFull_colHalf"]){
    for(const rowSign of [-1,1]){
      for(const colSign of [-1,1]){
        const center=shape==="rowHalf_colFull"
          ?[
            endpoint[0]+rowSign*outerScale/2,
            endpoint[1]+colSign*outerScale
          ]
          :[
            endpoint[0]+rowSign*outerScale,
            endpoint[1]+colSign*outerScale/2
          ];
        if(!inBounds(center))continue;

        const radius=innerScale/2;
        for(const axis of axes){
          const p1=[center[0]-axis[0]*radius,center[1]-axis[1]*radius];
          const p2=[center[0]+axis[0]*radius,center[1]+axis[1]*radius];
          if(!inBounds(p1)||!inBounds(p2))continue;
          if(at(p1)===at(p2)&&at(center)!==0)count++;
        }
      }
    }
  }
  return count;
}

assert.equal(fixedCenterPairMirrorCount([26,1],12,17),0);
assert.equal(fixedCenterPairMirrorCount(thenEndpoint,thenKey.center[1],thenKey.raw[1]),1);

// ---------- Block 19 finite coordinate/radius transform ----------
//
// From the selected block-18 state:
// - phi(key-center row) supplies a row displacement;
// - phi(key-center column) supplies a ciphertext-column displacement;
// - phi^2(current radius) supplies the new key radius and its column offset.
//
// Enumerate both row/column signs and all axes for the key node. Separately,
// allow both signs for the ciphertext displacement. Bounds and equal-outer
// source geometry do the selection.

const rowShift19=phi(block18.center[0]);
const cipherShift19=phi(block18.center[1]);
const unit19=phi(phi(block18.radius));
assert.deepEqual({rowShift19,cipherShift19,unit19},{rowShift19:8,cipherShift19:16,unit19:1});

const keyCandidates19=[];
for(const rowSign of [-1,1]){
  for(const colSign of [-1,1]){
    const center=[
      block18.center[0]+rowSign*rowShift19,
      block18.center[1]+colSign*unit19
    ];
    if(!inBounds(center))continue;

    for(const axis of axes){
      const p1=[center[0]-axis[0]*unit19,center[1]-axis[1]*unit19];
      const p2=[center[0]+axis[0]*unit19,center[1]+axis[1]*unit19];
      if(!inBounds(p1)||!inBounds(p2))continue;
      keyCandidates19.push({
        rowSign,
        colSign,
        center,
        axis,
        radius:unit19,
        p1,
        p2,
        raw:[at(p1),at(center),at(p2)],
        equalOuter:at(p1)===at(p2)&&at(center)!==0
      });
    }
  }
}
assert.equal(keyCandidates19.length,8);
const keyMirrors19=keyCandidates19.filter(x=>x.equalOuter);
assert.equal(keyMirrors19.length,1);
const node19=keyMirrors19[0];

assert.deepEqual({
  center:node19.center,
  axis:node19.axis,
  radius:node19.radius,
  raw:node19.raw.map(i=>T[i])
},{
  center:[12,16],
  axis:[1,0],
  radius:1,
  raw:["TH","H","TH"]
});

const startCandidates19=[];
const endpoint18=cells18.at(-1);
for(const colSign of [-1,1]){
  const start=[endpoint18[0],endpoint18[1]+colSign*cipherShift19];
  startCandidates19.push({colSign,start,inBounds:inBounds(start)});
}
assert.deepEqual(startCandidates19,[
  {colSign:-1,start:[21,4],inBounds:true},
  {colSign:1,start:[21,36],inBounds:false}
]);
const start19=startCandidates19.find(x=>x.inBounds).start;

// Read toward the selected key-center row. Current radius 3 supplies length.
const direction19=[Math.sign(node19.center[0]-start19[0]),0];
const cells19=[];
for(let i=0,q=start19;i<block18.radius;i++,q=add(q,direction19)){
  assert.ok(inBounds(q));
  cells19.push(q);
}
const key19=deriveKey(node19.raw);
const plaintext19=decrypt(cells19,key19);

assert.deepEqual(cells19,[[21,4],[20,4],[19,4]]);
assert.deepEqual(cells19.map(at).map(i=>T[i]),["N","L","EA"]);
assert.deepEqual(key19.map(i=>T[i]),["R","TH","TH"]);
assert.deepEqual(plaintext19.map(i=>T[i]),["C","E","Y"]);

console.log(JSON.stringify({
  status:"conditional post-THEN finite source selectors reproduce blocks 18-19",
  block18:{
    familyCandidates:edgeCandidates.length,
    equalOuterSurvivors:edgeMirrors.length,
    selected:{
      outerDepth:block18.outerDepth,
      innerDepth:block18.innerDepth,
      scales:[block18.outerScale,block18.innerScale],
      center:block18.center,
      start:block18.start,
      radius:block18.radius,
      axis:block18.axis,
      node:block18.raw.map(i=>T[i]),
      cells:cells18,
      key:key18.map(i=>T[i]),
      plaintext:plaintext18.map(i=>T[i])
    }
  },
  deathNegativeControl:{
    equalOuterSurvivors:fixedCenterPairMirrorCount([26,1],12,17)
  },
  block19:{
    keyGeometryCandidates:keyCandidates19.length,
    equalOuterKeySurvivors:keyMirrors19.length,
    ciphertextStartCandidates:startCandidates19,
    selected:{
      center:node19.center,
      radius:node19.radius,
      axis:node19.axis,
      node:node19.raw.map(i=>T[i]),
      cells:cells19,
      key:key19.map(i=>T[i]),
      plaintext:plaintext19.map(i=>T[i])
    }
  },
  caveat:"The transform families were formulated after the public route was known. Their finite source selection is real, but they remain post-hoc mechanism candidates."
},null,2));
