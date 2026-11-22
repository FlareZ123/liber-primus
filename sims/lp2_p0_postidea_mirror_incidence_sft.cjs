"use strict";

/**
 * SFT: post-IDEA mirror-walk parser candidate on the original p0-p2 27x27 grid.
 *
 * The selector below never inspects candidate plaintext or checksum values while
 * choosing stages 09-13. It starts only from the already-conditional IDEA end
 * state and the original rune grid. The parser was reverse-engineered after the
 * public route was known, so this is a reproducible post-hoc parser candidate,
 * not yet an authenticated Cicada mechanism.
 *
 * Run: node sims/lp2_p0_postidea_mirror_incidence_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const T=corpus.translit;
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(grid.length,729);

const mod=x=>(x%29+29)%29;
const at=q=>grid[(q[0]-1)*27+q[1]-1];
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const axisEq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const sign=v=>[Math.sign(v[0]),Math.sign(v[1])];
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
  let rest=n,signValue=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    signValue=-signValue;
    if(rest%p===0)return 0;
  }
  return rest>1?-signValue:signValue;
}

/** @param {number} count */
function firstPrimes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}

/**
 * @param {[number,number]} vector
 * @param {[number,number]} axis
 * @returns {[number,number]}
 */
function reflect(vector,axis){
  const denominator=axis[0]*axis[0]+axis[1]*axis[1];
  const dot=vector[0]*axis[0]+vector[1]*axis[1];
  return [
    Math.round(2*dot*axis[0]/denominator-vector[0]),
    Math.round(2*dot*axis[1]/denominator-vector[1])
  ];
}

const GP=firstPrimes(29);
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

/** @param {{raw:number[]}} node */
function deriveKey(node){
  const derived=[node.raw[0],phi(node.raw[1]),node.raw[2]];
  const rotation=((derived.reduce((s,v)=>s+mu(phi(v)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}

/**
 * @param {Array<[number,number]>} cells
 * @param {number[]} key
 */
function decrypt(cells,key){
  return cells.map((q,i)=>mod(at(q)-key[i%3]));
}

/**
 * @param {[number,number]} start
 * @param {[number,number]} direction
 * @param {(q:[number,number], cells:Array<[number,number]>)=>boolean} stop
 */
function rayUntil(start,direction,stop){
  const cells=[];
  for(let q=start;inBounds(q);q=add(q,direction)){
    cells.push(q);
    if(stop(q,cells))break;
  }
  return cells;
}

/**
 * @param {Array<[number,number]>} cells
 * @returns {{indices:number[], indexSum:number, gpSum:number}}
 */
function metrics(cells){
  const indices=cells.map(at);
  return {
    indices,
    indexSum:indices.reduce((a,b)=>a+b,0),
    gpSum:indices.reduce((a,b)=>a+GP[b],0)
  };
}

// Frozen incoming state from the independently documented conditional IDEA block.
const ideaCells=[[15,20],[16,19],[17,18]];
const ideaKey=["U","A","A"].map(x=>T.indexOf(x));
assert.deepEqual(decrypt(ideaCells,ideaKey).map(i=>T[i]),["I","D","EA"]);
const ideaEndpoint=ideaCells.at(-1);
assert.equal(T[at(ideaEndpoint)],"D");

// Stage 09 key node: the IDEA endpoint is the center of exactly one mirror.
assert.equal(centered(ideaEndpoint).length,1);
const node09=centered(ideaEndpoint)[0];
assert.deepEqual(node09.raw.map(i=>T[i]),["J","D","J"]);

// Exactly one outer of J-D-J is itself a mirror center. That fixes the junction
// and the stage-10 key node.
const outerCenters=[node09.p1,node09.p2].map(q=>({q,nodes:centered(q)}));
const junctionChoice=outerCenters.filter(x=>x.nodes.length===1);
assert.equal(junctionChoice.length,1);
const junction=junctionChoice[0].q;
const node10=junctionChoice[0].nodes[0];
assert.deepEqual(junction,[19,16]);
assert.deepEqual(node10.raw.map(i=>T[i]),["OE","J","OE"]);

// The shared junction has exactly one further mirror incidence. That fixes the
// stage-11 key node.
const remainingAtJunction=touching(junction).filter(n=>n!==node09&&n!==node10);
assert.equal(remainingAtJunction.length,1);
const node11=remainingAtJunction[0];
assert.deepEqual(node11.raw.map(i=>T[i]),["J","B","J"]);

// Stage 09 ciphertext. Reflect the unit direction from the junction toward the
// old node center across the new mirror axis. Start one cell there, then enter
// the nearest cell of the new mirror by Manhattan distance.
const towardOldCenter=sign(sub(node09.center,junction));
const reflected09=reflect(towardOldCenter,node10.axis);
const start09=add(junction,reflected09);
const node10Cells=[node10.p1,node10.center,node10.p2];
const distances09=node10Cells.map(q=>({q,d:Math.abs(q[0]-start09[0])+Math.abs(q[1]-start09[1])})).sort((a,b)=>a.d-b.d);
assert.notEqual(distances09[0].d,distances09[1].d);
const end09=distances09[0].q;
const direction09=sign(sub(end09,start09));
const cells09=[start09,end09];
assert.deepEqual(cells09,[[18,15],[18,16]]);

// Stage 10 ciphertext. Reflect the previous read direction across the current
// key-node axis. The next mirror shares the junction, so use the minimum
// two-rune approach into that junction.
const direction10=reflect(direction09,node10.axis);
const end10=junction;
const start10=sub(end10,direction10);
const cells10=[start10,end10];
assert.deepEqual(cells10,[[19,17],[19,16]]);

// Stage 11 direction is the same reflection rule across J-B-J.
const direction11=reflect(direction10,node11.axis);
assert.deepEqual(direction11,[1,0]);

// Continue one cell in the old direction. Among mirrors that use that cell as
// an outer, are perpendicular to the new read direction, and cross to the
// opposite side, choose the smallest radius.
const entry11=add(end10,direction10);
const perpendicularAxis11=[direction11[1],direction11[0]];
const bounce11=touching(entry11)
  .filter(n=>axisEq(n.axis,perpendicularAxis11)&&(same(n.p1,entry11)||same(n.p2,entry11)))
  .map(n=>({node:n,opposite:same(n.p1,entry11)?n.p2:n.p1}))
  .filter(x=>{
    const delta=sub(x.opposite,entry11);
    return delta[0]*direction10[0]+delta[1]*direction10[1]<0;
  })
  .sort((a,b)=>a.node.radius-b.node.radius);
assert.ok(bounce11.length>=1);
assert.ok(bounce11.length===1||bounce11[0].node.radius<bounce11[1].node.radius);
assert.deepEqual(bounce11[0].node.raw.map(i=>T[i]),["F","X","F"]);
assert.equal(bounce11[0].node.radius,4);
const start11=bounce11[0].opposite;

// Stop at the first post-start cell with a unique mirror incidence.
const cells11=rayUntil(start11,direction11,(q,cells)=>cells.length>1&&touching(q).length===1);
assert.deepEqual(cells11,[[19,23],[20,23],[21,23]]);
const end11=cells11.at(-1);

// Stage 12 key/start walk. The END endpoint has one mirror. At its center,
// switch to the other same-axis centered mirror.
assert.equal(touching(end11).length,1);
const entryMirror12=touching(end11)[0];
const center12=entryMirror12.center;
const centeredSameAxis12=centered(center12).filter(n=>axisEq(n.axis,entryMirror12.axis)&&n!==entryMirror12);
assert.equal(centeredSameAxis12.length,1);
const node12=centeredSameAxis12[0];
assert.deepEqual(node12.raw.map(i=>T[i]),["H","R","H"]);

// Both H outers have a same-axis continuation. The reusable tie-break is
// smallest continuation radius, which selects H-L-H (6) over H-O-H (11).
const branch12=[node12.p1,node12.p2]
  .map(q=>({
    q,
    alternatives:touching(q)
      .filter(n=>n!==node12&&axisEq(n.axis,node12.axis)&&(same(n.p1,q)||same(n.p2,q)))
      .sort((a,b)=>a.radius-b.radius)
  }))
  .filter(x=>x.alternatives.length)
  .sort((a,b)=>a.alternatives[0].radius-b.alternatives[0].radius);
assert.ok(branch12.length>=2);
assert.ok(branch12[0].alternatives[0].radius<branch12[1].alternatives[0].radius);
const hJunction=branch12[0].q;
const hLh=branch12[0].alternatives[0];
assert.deepEqual(hJunction,[21,17]);
assert.deepEqual(hLh.raw.map(i=>T[i]),["H","L","H"]);

const lCenter=hLh.center;
const lCenteredAlternatives=centered(lCenter).filter(n=>n!==hLh&&axisEq(n.axis,hLh.axis)).sort((a,b)=>a.radius-b.radius);
assert.equal(lCenteredAlternatives.length,1);
const eoLeo=lCenteredAlternatives[0];
assert.deepEqual(eoLeo.raw.map(i=>T[i]),["EO","L","EO"]);

const chainDirection12=sign(sub(lCenter,hJunction));
const start12=[eoLeo.p1,eoLeo.p2].find(q=>{
  const delta=sub(q,lCenter);
  return delta[0]*chainDirection12[0]+delta[1]*chainDirection12[1]>0;
});
assert.ok(start12);
assert.deepEqual(start12,[21,9]);

// Bounce back from the terminal outer and stop at the first new mirror center
// outside the just-traversed same-axis chain.
const direction12=[-chainDirection12[0],-chainDirection12[1]];
const traversed12=new Set([entryMirror12,node12,hLh,eoLeo]);
const cells12=rayUntil(start12,direction12,(q,cells)=>{
  if(cells.length<=1)return false;
  return centered(q).some(n=>!traversed12.has(n));
});
assert.deepEqual(cells12,[[21,9],[21,10]]);
const end12=cells12.at(-1);

// Stage 13 pivot. At D choose the shortest centered mirror not parallel to the
// incoming read direction.
const pivotMirrors13=centered(end12)
  .filter(n=>!axisEq(n.axis,direction12))
  .sort((a,b)=>a.radius-b.radius);
assert.ok(pivotMirrors13.length>=1);
assert.ok(pivotMirrors13.length===1||pivotMirrors13[0].radius<pivotMirrors13[1].radius);
const pivot13=pivotMirrors13[0];
assert.deepEqual(pivot13.raw.map(i=>T[i]),["E","D","E"]);
assert.equal(pivot13.radius,2);

// Move one pivot radius perpendicular to E-D-E. Both sides land on mirror
// centers; choose the side whose shortest centered mirror has the smaller
// radius. This selects B/J-B-J (4) over U/F-U-F (7).
const perpendicular13=[pivot13.axis[1],-pivot13.axis[0]];
const perpendicularCandidates13=[
  [end12[0]+perpendicular13[0]*pivot13.radius,end12[1]+perpendicular13[1]*pivot13.radius],
  [end12[0]-perpendicular13[0]*pivot13.radius,end12[1]-perpendicular13[1]*pivot13.radius]
]
  .filter(inBounds)
  .map(q=>({q,nodes:centered(q).slice().sort((a,b)=>a.radius-b.radius)}))
  .filter(x=>x.nodes.length)
  .sort((a,b)=>a.nodes[0].radius-b.nodes[0].radius);
assert.equal(perpendicularCandidates13.length,2);
assert.ok(perpendicularCandidates13[0].nodes[0].radius<perpendicularCandidates13[1].nodes[0].radius);
assert.deepEqual(
  perpendicularCandidates13.map(x=>({q:x.q,radius:x.nodes[0].radius,raw:x.nodes[0].raw.map(i=>T[i])})),
  [
    {q:[23,12],radius:4,raw:["J","B","J"]},
    {q:[19,8],radius:7,raw:["F","U","F"]}
  ]
);
const node13=perpendicularCandidates13[0].nodes[0];

// At the J-B-J endpoints, choose the side whose shortest alternative
// outer-role mirror has the smaller radius: J-C-J radius1 beats J-D-J radius2.
const branch13=[node13.p1,node13.p2]
  .map(q=>({
    q,
    alternatives:touching(q)
      .filter(n=>n!==node13&&(same(n.p1,q)||same(n.p2,q)))
      .sort((a,b)=>a.radius-b.radius)
  }))
  .filter(x=>x.alternatives.length)
  .sort((a,b)=>a.alternatives[0].radius-b.alternatives[0].radius);
assert.ok(branch13.length>=2);
assert.ok(branch13[0].alternatives[0].radius<branch13[1].alternatives[0].radius);
const jJunction13=branch13[0].q;
const jCj=branch13[0].alternatives[0];
assert.deepEqual(jJunction13,[27,8]);
assert.deepEqual(jCj.raw.map(i=>T[i]),["J","C","J"]);
assert.equal(jCj.radius,1);

// At the new C center, exactly one other mirror uses C as an outer: C-OE-C.
const cCenter=jCj.center;
const cOuterMirrors=touching(cCenter)
  .filter(n=>n!==jCj&&(same(n.p1,cCenter)||same(n.p2,cCenter)));
assert.equal(cOuterMirrors.length,1);
const cOeC=cOuterMirrors[0];
assert.deepEqual(cOeC.raw.map(i=>T[i]),["C","OE","C"]);
const start13=same(cOeC.p1,cCenter)?cOeC.p2:cOeC.p1;
assert.deepEqual(start13,[26,3]);

// Continue away from the C center to the physical matrix edge.
const direction13=sign(sub(start13,cCenter));
const cells13=rayUntil(start13,direction13,()=>false);
assert.deepEqual(cells13,[[26,3],[26,2],[26,1]]);

const stages=[
  {stage:9,node:node09,cells:cells09},
  {stage:10,node:node10,cells:cells10},
  {stage:11,node:node11,cells:cells11},
  {stage:12,node:node12,cells:cells12},
  {stage:13,node:node13,cells:cells13}
];

const outputs=stages.map(s=>{
  const key=deriveKey(s.node);
  const plaintext=decrypt(s.cells,key);
  return {
    stage:s.stage,
    node:s.node.raw.map(i=>T[i]),
    key:key.map(i=>T[i]),
    cells:s.cells,
    cipher:s.cells.map(q=>T[at(q)]),
    plaintext:plaintext.map(i=>T[i]),
    plaintextIndices:plaintext
  };
});

// These assertions are regression checks only. None of them participates in
// the selector above.
assert.deepEqual(outputs.map(x=>x.cells),[
  [[18,15],[18,16]],
  [[19,17],[19,16]],
  [[19,23],[20,23],[21,23]],
  [[21,9],[21,10]],
  [[26,3],[26,2],[26,1]]
]);
assert.deepEqual(outputs.flatMap(x=>x.plaintext),[
  "O","F","TH","E","E","N","D","I","S","D","EA","TH"
]);

const allPlain=outputs.flatMap(x=>x.plaintextIndices);
const aggregate={
  runes:allPlain.length,
  indexSum:allPlain.reduce((a,b)=>a+b,0),
  gpSum:allPlain.reduce((a,b)=>a+GP[b],0)
};
assert.deepEqual(aggregate,{runes:12,indexSum:151,gpSum:553});

// Broad branch-family gate. The deterministic shortest-radius path above is a
// compact representative, but it is not needed as a selector here. Keep every
// locally role-valid mirror handoff in the same walk grammar, then apply the
// previously locked aggregate only after source-cell selection.
const isOuter=(node,q)=>same(node.p1,q)||same(node.p2,q);
const broadFamily=[];
const stage11Bounces=touching(entry11)
  .filter(n=>isOuter(n,entry11))
  .map(n=>({node:n,opposite:same(n.p1,entry11)?n.p2:n.p1}))
  .filter(x=>{
    const delta=sub(x.opposite,entry11);
    return delta[0]*direction10[0]+delta[1]*direction10[1]<0;
  });

for(const bounce of stage11Bounces){
  const candidate11=rayUntil(
    bounce.opposite,
    direction11,
    (q,cells)=>cells.length>1&&touching(q).length===1
  );
  const candidateEnd11=candidate11.at(-1);
  if(touching(candidateEnd11).length!==1)continue;

  const entryMirror=touching(candidateEnd11)[0];
  const entryCenter=entryMirror.center;
  for(const candidateNode12 of centered(entryCenter).filter(n=>n!==entryMirror)){
    for(const outer12 of [candidateNode12.p1,candidateNode12.p2]){
      const handoffs12=touching(outer12).filter(n=>n!==candidateNode12&&isOuter(n,outer12));
      for(const handoff12 of handoffs12){
        const handoffCenter=handoff12.center;
        for(const exitMirror12 of centered(handoffCenter).filter(n=>n!==handoff12)){
          const chainDirection=sign(sub(handoffCenter,outer12));
          const starts12=[exitMirror12.p1,exitMirror12.p2].filter(q=>{
            const delta=sub(q,handoffCenter);
            return delta[0]*chainDirection[0]+delta[1]*chainDirection[1]>0;
          });
          for(const candidateStart12 of starts12){
            const candidateDirection12=[-chainDirection[0],-chainDirection[1]];
            const traversed=new Set([entryMirror,candidateNode12,handoff12,exitMirror12]);
            const candidate12=rayUntil(
              candidateStart12,
              candidateDirection12,
              (q,cells)=>cells.length>1&&centered(q).some(n=>!traversed.has(n))
            );
            if(candidate12.length<2)continue;
            const candidateEnd12=candidate12.at(-1);

            for(const pivot of centered(candidateEnd12)){
              const perpendicular=[pivot.axis[1],-pivot.axis[0]];
              const pivotDestinations=[
                [
                  candidateEnd12[0]+perpendicular[0]*pivot.radius,
                  candidateEnd12[1]+perpendicular[1]*pivot.radius
                ],
                [
                  candidateEnd12[0]-perpendicular[0]*pivot.radius,
                  candidateEnd12[1]-perpendicular[1]*pivot.radius
                ]
              ].filter(inBounds);

              for(const destination of pivotDestinations){
                for(const candidateNode13 of centered(destination)){
                  for(const junction13 of [candidateNode13.p1,candidateNode13.p2]){
                    const handoffs13=touching(junction13)
                      .filter(n=>n!==candidateNode13&&isOuter(n,junction13));
                    for(const handoff13 of handoffs13){
                      const cCenterCandidate=handoff13.center;
                      const exits13=touching(cCenterCandidate)
                        .filter(n=>n!==handoff13&&isOuter(n,cCenterCandidate));
                      for(const exit13 of exits13){
                        const candidateStart13=same(exit13.p1,cCenterCandidate)?exit13.p2:exit13.p1;
                        const candidateDirection13=sign(sub(candidateStart13,cCenterCandidate));
                        const candidate13=rayUntil(candidateStart13,candidateDirection13,()=>false);
                        const plaintext=[
                          ...decrypt(cells09,deriveKey(node09)),
                          ...decrypt(cells10,deriveKey(node10)),
                          ...decrypt(candidate11,deriveKey(node11)),
                          ...decrypt(candidate12,deriveKey(candidateNode12)),
                          ...decrypt(candidate13,deriveKey(candidateNode13))
                        ];
                        broadFamily.push({
                          cells:[cells09,cells10,candidate11,candidate12,candidate13],
                          plaintext,
                          runes:plaintext.length,
                          indexSum:plaintext.reduce((a,b)=>a+b,0),
                          gpSum:plaintext.reduce((a,b)=>a+GP[b],0)
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

assert.equal(broadFamily.length,66);
const broadLength12=broadFamily.filter(x=>x.runes===12);
assert.equal(broadLength12.length,7);
const broadExact=broadLength12.filter(x=>x.indexSum===151&&x.gpSum===553);
assert.equal(broadExact.length,1);
assert.deepEqual(broadExact[0].cells,outputs.map(x=>x.cells));
assert.deepEqual(broadExact[0].plaintext,allPlain);

console.log(JSON.stringify({
  status:"post-hoc source-only parser candidate reproduces stages 09-13 without plaintext feedback",
  mirrorNodeCount:mirrors.length,
  stages:outputs,
  aggregate,
  broadFamilyGate:{completeAssignments:broadFamily.length,length12Assignments:broadLength12.length,exactChecksumAssignments:broadExact.length},
  caveat:"The rules were reverse-engineered after the public route was known. The exact output and locked checksum are regression/confirmation checks, not selector inputs. A genuinely prospective passage or independent original clue is still required before treating this as authenticated Cicada plaintext."
},null,2));
