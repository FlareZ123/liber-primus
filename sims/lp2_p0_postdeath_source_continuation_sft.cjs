"use strict";

/**
 * SFT: conditional p0-p2 source-only continuation after DEATH.
 *
 * Starting only from the already-selected DEATH endpoint E(26,1), this test:
 * 1. enumerates a boundary-restart mirror family for the next block;
 * 2. uses the following node-distance self-consistency to select one restart
 *    without plaintext or language scoring;
 * 3. carries source coordinates and node roles through two additional blocks.
 *
 * The grammar was reconstructed after the public route was known, so passing
 * this SFT is evidence of a compact source construction, not creator
 * authentication.
 *
 * Run:
 *   node sims/lp2_p0_postdeath_source_continuation_sft.cjs
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
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const scale=(v,n)=>[v[0]*n,v[1]*n];
const sign=v=>[Math.sign(v[0]),Math.sign(v[1])];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const axisEqual=(a,b)=>a[0]===b[0]&&a[1]===b[1];

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
  let rest=n,sgn=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    sgn=-sgn;
    if(rest%p===0)return 0;
  }
  return rest>1?-sgn:sgn;
}

/** @param {[number,number]} a @param {[number,number]} b */
function isEightRay(a,b){
  const dr=Math.abs(a[0]-b[0]);
  const dc=Math.abs(a[1]-b[1]);
  return dr===0||dc===0||dr===dc;
}

/** @param {[number,number]} a @param {[number,number]} b */
function line(a,b){
  assert.ok(isEightRay(a,b));
  const direction=sign(sub(b,a));
  const cells=[];
  for(let q=a;;q=add(q,direction)){
    assert.ok(inBounds(q));
    cells.push(q);
    if(same(q,b))return cells;
  }
}

/** @param {[number,number]} start @param {[number,number]} direction */
function rayToBoundary(start,direction){
  const cells=[];
  for(let q=start;inBounds(q);q=add(q,direction))cells.push(q);
  return cells;
}

const axes=[[1,0],[0,1],[1,1],[1,-1]];
const mirrors=[];
for(let r=1;r<=27;r++){
  for(let c=1;c<=27;c++){
    for(const axis of axes){
      for(let radius=1;radius<=13;radius++){
        const p1=[r-axis[0]*radius,c-axis[1]*radius];
        const p2=[r+axis[0]*radius,c+axis[1]*radius];
        if(!inBounds(p1)||!inBounds(p2))break;
        const outer1=at(p1),center=at([r,c]),outer2=at(p2);
        if(outer1===outer2&&center!==0){
          mirrors.push({center:[r,c],p1,p2,radius,axis,raw:[outer1,center,outer2]});
        }
      }
    }
  }
}
assert.equal(mirrors.length,479);

const centered=q=>mirrors.filter(n=>same(n.center,q));
const touching=q=>mirrors.filter(n=>same(n.center,q)||same(n.p1,q)||same(n.p2,q));
const isOuter=(node,q)=>same(node.p1,q)||same(node.p2,q);

/** @param {{raw:number[]}} node */
function deriveKey(node){
  const derived=[node.raw[0],phi(node.raw[1]),node.raw[2]];
  const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}

/** @param {Array<[number,number]>} cells @param {number[]} key */
function decrypt(cells,key){
  return cells.map((q,i)=>mod(at(q)-key[i%3]));
}

/**
 * Enumerate equally spaced three-cell nodes with an anchored second outer,
 * a required first-outer rune, and a required transformed center.
 *
 * The returned raw order is normalized requiredOuter -> center -> anchor.
 *
 * @param {[number,number]} anchor
 * @param {number} requiredOuter
 * @param {number} requiredTransformedCenter
 */
function anchoredNonMirrorNodes(anchor,requiredOuter,requiredTransformedCenter){
  const out=[];
  for(const axis of axes){
    for(let radius=1;radius<=13;radius++){
      for(const direction of [-1,1]){
        const center=[
          anchor[0]+direction*axis[0]*radius,
          anchor[1]+direction*axis[1]*radius
        ];
        const other=[
          anchor[0]+direction*axis[0]*radius*2,
          anchor[1]+direction*axis[1]*radius*2
        ];
        if(!inBounds(center)||!inBounds(other))continue;
        if(at(other)!==requiredOuter)continue;
        if(phi(at(center))!==requiredTransformedCenter)continue;
        out.push({
          anchor,
          other,
          center,
          axis,
          radius,
          raw:[requiredOuter,at(center),at(anchor)]
        });
      }
    }
  }
  return out;
}

// Upstream premise from the independently documented post-IDEA branch.
const deathEndpoint=[26,1];
assert.equal(T[at(deathEndpoint)],"E");
assert.equal(touching(deathEndpoint).length,0);

// ---------- Stage 14 boundary restart ----------
//
// From every in-bounds Moore neighbor of the dead endpoint:
// - take any equal-outer mirror using that neighbor as an outer;
// - at its opposite outer, take another same-axis equal-outer mirror;
// - step one cell past that relay center;
// - require that destination to be a mirror center;
// - read from there in the sign-direction back toward the dead endpoint until
//   the matrix boundary.
//
// This selection uses no candidate plaintext.
const restartCandidates=[];
for(let dr=-1;dr<=1;dr++){
  for(let dc=-1;dc<=1;dc++){
    if(dr===0&&dc===0)continue;
    const anchor=add(deathEndpoint,[dr,dc]);
    if(!inBounds(anchor))continue;

    for(const keyNode of touching(anchor).filter(n=>isOuter(n,anchor))){
      const opposite=same(keyNode.p1,anchor)?keyNode.p2:keyNode.p1;
      const relays=touching(opposite)
        .filter(n=>n!==keyNode&&isOuter(n,opposite)&&axisEqual(n.axis,keyNode.axis));

      for(const relay of relays){
        const towardCenter=sign(sub(relay.center,opposite));
        const start=add(relay.center,towardCenter);
        if(!inBounds(start)||centered(start).length===0)continue;

        const readDirection=sign(sub(deathEndpoint,start));
        const cells=rayToBoundary(start,readDirection);
        restartCandidates.push({
          anchor,
          keyNode,
          opposite,
          relay,
          start,
          readDirection,
          cells
        });
      }
    }
  }
}
assert.equal(restartCandidates.length,2);

// The two source-only restarts are fixed before decryption.
assert.deepEqual(
  restartCandidates.map(x=>({
    anchor:x.anchor,
    key:x.keyNode.raw.map(i=>T[i]),
    relay:x.relay.raw.map(i=>T[i]),
    start:x.start,
    cells:x.cells
  })),
  [
    {
      anchor:[25,2],
      key:["EA","J","EA"],
      relay:["EA","EA","EA"],
      start:[25,16],
      cells:[[25,16],[26,15],[27,14]]
    },
    {
      anchor:[25,2],
      key:["EA","D","EA"],
      relay:["EA","EA","EA"],
      start:[25,14],
      cells:[[25,14],[26,13],[27,12]]
    }
  ]
);

// ---------- Stage 15 structural look-ahead ----------
//
// For each restart, derive d = phi^2(derived previous center), equivalently
// phi^3(original center). Try both horizontal directions from the stage-14
// endpoint. A next equal-outer key node must:
// - use the reached pivot as an outer;
// - have phi(original center) = d;
// - after another distance d in the same direction, place the next ciphertext
//   start on an exact 8-direction ray to the preceding stage's start.
//
// No direction, plaintext, or dictionary is supplied.
const stage15Candidates=[];
for(const restart of restartCandidates){
  const d=phi(phi(phi(restart.keyNode.raw[1])));
  const endpoint=restart.cells.at(-1);

  for(const horizontalDirection of [-1,1]){
    const pivot=add(endpoint,[0,horizontalDirection*d]);
    if(!inBounds(pivot))continue;

    const nextNodes=touching(pivot)
      .filter(n=>isOuter(n,pivot)&&phi(n.raw[1])===d);

    for(const nextNode of nextNodes){
      const start=add(pivot,[0,horizontalDirection*d]);
      if(!inBounds(start))continue;
      const exactRay=isEightRay(start,restart.start);
      stage15Candidates.push({
        restart,
        d,
        horizontalDirection,
        pivot,
        nextNode,
        start,
        exactRay,
        cells:exactRay?line(start,restart.start):[]
      });
    }
  }
}

assert.equal(stage15Candidates.length,2);
const stage15Survivors=stage15Candidates.filter(x=>x.exactRay);
assert.equal(stage15Survivors.length,1);

assert.deepEqual(
  stage15Candidates.map(x=>({
    priorKey:x.restart.keyNode.raw.map(i=>T[i]),
    d:x.d,
    direction:x.horizontalDirection,
    pivot:x.pivot,
    nextKey:x.nextNode.raw.map(i=>T[i]),
    start:x.start,
    exactRay:x.exactRay
  })),
  [
    {
      priorKey:["EA","J","EA"],
      d:2,
      direction:1,
      pivot:[27,16],
      nextKey:["P","R","P"],
      start:[27,18],
      exactRay:true
    },
    {
      priorKey:["EA","D","EA"],
      d:4,
      direction:-1,
      pivot:[27,8],
      nextKey:["J","C","J"],
      start:[27,4],
      exactRay:false
    }
  ]
);

const stage15=stage15Survivors[0];
const stage14=stage15.restart;

// Only after structural selection, decrypt the chosen stage 14 and 15 cells.
const plaintext14=decrypt(stage14.cells,deriveKey(stage14.keyNode));
const plaintext15=decrypt(stage15.cells,deriveKey(stage15.nextNode));
assert.deepEqual(plaintext14.map(i=>T[i]),["S","E","E"]);
assert.deepEqual(plaintext15.map(i=>T[i]),["Y","O","U"]);

// ---------- Stage 16 non-mirror consensus ----------
//
// The selected stage-14 relay supplies exactly three EA cells: its entry outer,
// center, and far outer. The stage-15 endpoint supplies phi(row)=L. The
// stage-15 key center supplies R=4. At each relay EA, demand an equally spaced
// three-cell node whose other outer is L and whose center transforms to R.
//
// The source has exactly one such triple at each relay EA.
const relayOtherOuter=same(stage14.relay.p1,stage14.opposite)
  ?stage14.relay.p2
  :stage14.relay.p1;
const relayEAs=[stage14.opposite,stage14.relay.center,relayOtherOuter];
assert.deepEqual(relayEAs,[[25,10],[25,15],[25,20]]);
assert.deepEqual(relayEAs.map(at),[28,28,28]);

const endpoint15=stage15.cells.at(-1);
assert.deepEqual(endpoint15,stage14.start);
const requiredOuter=phi(endpoint15[0]);
const requiredTransformedCenter=stage15.nextNode.raw[1];
assert.equal(T[requiredOuter],"L");
assert.equal(T[requiredTransformedCenter],"R");

const stage16NodeSets=relayEAs.map(anchor=>
  anchoredNonMirrorNodes(anchor,requiredOuter,requiredTransformedCenter)
);
assert.deepEqual(stage16NodeSets.map(x=>x.length),[1,1,1]);

const stage16Nodes=stage16NodeSets.map(x=>x[0]);
assert.deepEqual(
  stage16Nodes.map(n=>({
    other:n.other,
    center:n.center,
    anchor:n.anchor,
    raw:n.raw.map(i=>T[i]),
    radius:n.radius
  })),
  [
    {other:[25,4],center:[25,7],anchor:[25,10],raw:["L","C","EA"],radius:3},
    {other:[15,15],center:[20,15],anchor:[25,15],raw:["L","I","EA"],radius:5},
    {other:[25,8],center:[25,14],anchor:[25,20],raw:["L","EO","EA"],radius:6}
  ]
);

// All three source nodes collapse to the identical transformed raw key.
const stage16DerivedRaw=stage16Nodes.map(n=>[n.raw[0],phi(n.raw[1]),n.raw[2]]);
assert.deepEqual(
  stage16DerivedRaw.map(k=>k.map(i=>T[i])),
  [
    ["L","R","EA"],
    ["L","R","EA"],
    ["L","R","EA"]
  ]
);

const derived16=stage16DerivedRaw[0];
const rotation16=((derived16.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
const key16=derived16.slice(rotation16).concat(derived16.slice(0,rotation16));
assert.equal(rotation16,2);
assert.deepEqual(key16.map(i=>T[i]),["EA","L","R"]);

// The endpoint column supplies phi(16)=H. On its current row H occurs once.
const target16=phi(endpoint15[1]);
assert.equal(T[target16],"H");
const rowMatches16=[];
for(let c=1;c<=27;c++)if(at([endpoint15[0],c])===target16)rowMatches16.push([endpoint15[0],c]);
assert.deepEqual(rowMatches16,[[25,19]]);

const end16=rowMatches16[0];
const direction16=sign(sub(end16,endpoint15));
const cells16=line(endpoint15,end16);
const plaintext16=decrypt(cells16,key16);
assert.deepEqual(cells16,[[25,16],[25,17],[25,18],[25,19]]);
assert.deepEqual(plaintext16.map(i=>T[i]),["S","O","O","N"]);

// ---------- Stage 17 carried direction + second-totient distances ----------
//
// Carry the eastward stage-16 direction. phi^2(column) gives the start offset;
// phi^2(row) gives the end offset. At the midpoint between the old endpoint and
// new start, demand an equal-outer mirror whose axis is perpendicular to the
// carried read direction. Exactly one source node qualifies.
const dStart17=phi(phi(end16[1]));
const dEnd17=phi(phi(end16[0]));
assert.equal(dStart17,6);
assert.equal(dEnd17,8);

const start17=add(end16,scale(direction16,dStart17));
const end17=add(end16,scale(direction16,dEnd17));
assert.deepEqual(start17,[25,25]);
assert.deepEqual(end17,[25,27]);

assert.equal(dStart17%2,0);
const midpoint17=add(end16,scale(direction16,dStart17/2));
assert.deepEqual(midpoint17,[25,22]);
assert.equal(T[at(midpoint17)],"IA");

const keyNodes17=touching(midpoint17)
  .filter(n=>isOuter(n,midpoint17))
  .filter(n=>n.axis[0]*direction16[0]+n.axis[1]*direction16[1]===0);
assert.equal(keyNodes17.length,1);
const node17=keyNodes17[0];
assert.deepEqual(node17.raw.map(i=>T[i]),["IA","IA","IA"]);
assert.deepEqual(node17.center,[26,22]);
assert.equal(node17.radius,1);

const cells17=line(start17,end17);
const plaintext17=decrypt(cells17,deriveKey(node17));
assert.deepEqual(cells17,[[25,25],[25,26],[25,27]]);
assert.deepEqual(plaintext17.map(i=>T[i]),["TH","E","N"]);

// THEN is a real stopping boundary for this local grammar: the endpoint has
// multiple unrelated mirror incidences, so no unique next equal-outer handoff
// follows from the rules above.
assert.equal(touching(end17).length,3);

console.log(JSON.stringify({
  status:"conditional source-only continuation selects SEE YOU SOON THEN after DEATH",
  mirrorNodeCount:mirrors.length,
  stage14:{
    structuralRestartCandidates:restartCandidates.length,
    selectedCells:stage14.cells,
    keyNode:stage14.keyNode.raw.map(i=>T[i]),
    plaintext:plaintext14.map(i=>T[i])
  },
  stage15:{
    structuralCandidates:stage15Candidates.length,
    exactRaySurvivors:stage15Survivors.length,
    d:stage15.d,
    keyNode:stage15.nextNode.raw.map(i=>T[i]),
    cells:stage15.cells,
    plaintext:plaintext15.map(i=>T[i])
  },
  stage16:{
    relayEAs,
    qualifyingNonMirrorNodesPerAnchor:stage16NodeSets.map(x=>x.length),
    nodes:stage16Nodes.map(n=>n.raw.map(i=>T[i])),
    key:key16.map(i=>T[i]),
    cells:cells16,
    plaintext:plaintext16.map(i=>T[i])
  },
  stage17:{
    distances:{start:dStart17,end:dEnd17},
    midpoint:midpoint17,
    perpendicularMirrorCount:keyNodes17.length,
    keyNode:node17.raw.map(i=>T[i]),
    cells:cells17,
    plaintext:plaintext17.map(i=>T[i])
  },
  nextBoundary:{
    endpoint:end17,
    endpointRune:T[at(end17)],
    mirrorIncidences:touching(end17).length
  },
  caveat:"The selector grammar was reconstructed after the public route was known. It is a compact plaintext-blind source construction, not yet authenticated Cicada plaintext."
},null,2));
