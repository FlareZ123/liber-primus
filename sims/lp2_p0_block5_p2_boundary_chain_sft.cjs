"use strict";

/**
 * SFT: p0-p2 physical-page-boundary selector from COLD through IDEA.
 *
 * Starting from the frozen COLD source geometry, this test selects block 5,
 * CRY, NOW THE, and IDEA using only original grid geometry plus the physical
 * p2 start. Plaintext is checked only after the source cells are fixed.
 *
 * The grammar was identified after the public candidate route was known, so
 * this is an intermediate source selector rather than authenticated plaintext.
 *
 * Run: node sims/lp2_p0_block5_p2_boundary_chain_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const T=corpus.translit;
const pages=corpus.pages.filter(p=>p.page<=2);
assert.deepEqual(pages.map(p=>p.indices.length),[262,266,201]);
const grid=pages.flatMap(p=>p.indices);
assert.equal(grid.length,729);

const at=(r,c)=>grid[(r-1)*27+c-1];
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const mod=x=>(x%29+29)%29;
const axes=[[1,0],[0,1],[1,1],[1,-1]];
const cardinals=[[-1,0],[1,0],[0,-1],[0,1]];
const directions=[];
for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)directions.push([dr,dc]);

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

/** @param {number[]} raw */
function deriveKey(raw){
  const derived=[raw[0],phi(raw[1]),raw[2]];
  const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}

/** @param {Array<[number,number]>} cells @param {number[]} key */
function decrypt(cells,key){
  return cells.map((q,i)=>mod(at(q[0],q[1])-key[i%key.length]));
}

const mirrors=[];
for(let r=1;r<=27;r++)for(let c=1;c<=27;c++)for(const axis of axes)for(let radius=1;radius<=13;radius++){
  const p1=[r-axis[0]*radius,c-axis[1]*radius];
  const p2=[r+axis[0]*radius,c+axis[1]*radius];
  if(!inBounds(p1)||!inBounds(p2))break;
  const raw=[at(p1[0],p1[1]),at(r,c),at(p2[0],p2[1])];
  if(raw[0]===raw[2]&&raw[1]!==0)mirrors.push({center:[r,c],p1,p2,axis,radius,raw});
}
assert.equal(mirrors.length,479);
const centered=q=>mirrors.filter(node=>same(node.center,q));
const isOuter=(node,q)=>same(node.p1,q)||same(node.p2,q);

/**
 * @param {[number,number]} endpoint
 * @param {[number,number]} target
 */
function boundaryContinuations(endpoint,target){
  const out=[];
  for(const source of mirrors.filter(node=>node.radius===1&&isOuter(node,endpoint))){
    const distance=phi(source.raw[1]);
    const key=deriveKey(source.raw);
    for(const move of directions){
      const landing=[source.center[0]+distance*move[0],source.center[1]+distance*move[1]];
      if(!inBounds(landing))continue;
      for(const next of centered(landing)){
        let opposite=null;
        if(same(next.p1,target))opposite=next.p2;
        else if(same(next.p2,target))opposite=next.p1;
        else continue;
        const read=[Math.sign(opposite[0]-landing[0]),Math.sign(opposite[1]-landing[1])];
        const onePast=[opposite[0]+read[0],opposite[1]+read[1]];
        if(!inBounds(onePast))continue;
        const cells=[];
        let q=[...landing];
        while(true){
          cells.push([...q]);
          if(same(q,onePast))break;
          q=[q[0]+read[0],q[1]+read[1]];
          if(!inBounds(q)){cells.length=0;break;}
        }
        if(cells.length)out.push({source,distance,key,move,landing,next,read,cells});
      }
    }
  }
  return out;
}

/**
 * @param {[number,number]} endpoint
 * @param {[number,number]} target
 */
function outerBoundaryChains(endpoint,target){
  const out=[];
  for(const node1 of mirrors.filter(node=>isOuter(node,endpoint))){
    const other=same(node1.p1,endpoint)?node1.p2:node1.p1;
    for(const node2 of centered(other)){
      if(same(node2.p1,target)||same(node2.p2,target))out.push({node1,other,node2});
    }
  }
  return out;
}

/** @param {[number,number]} start @param {[number,number]} read @param {number} length */
function rayCells(start,read,length){
  const cells=[];
  let q=[...start];
  for(let i=0;i<length;i++){
    assert.ok(inBounds(q));
    cells.push([...q]);
    q=[q[0]+read[0],q[1]+read[1]];
  }
  return cells;
}

const p2StartIndex=pages[0].indices.length+pages[1].indices.length;
const p2Start=[Math.floor(p2StartIndex/27)+1,p2StartIndex%27+1];
assert.deepEqual(p2Start,[20,16]);

const coldAnchor=[14,19];
const coldKeyCenter=[26,19];
const coldStart=[14,7];
const coldEnd=[11,7];
const coldLandmarks=[coldAnchor,coldKeyCenter,coldStart,coldEnd];

const candidateCenters=[];
for(const dr of [-4,4])for(const dc of [-1,1])candidateCenters.push([coldEnd[0]+dr,coldEnd[1]+dc]);

const block5Nodes=[];
for(const center of candidateCenters){
  for(const [axisName,dr,dc] of [["H",0,1],["V",1,0]]){
    const raw=[
      at(center[0]-2*dr,center[1]-2*dc),
      at(center[0],center[1]),
      at(center[0]+2*dr,center[1]+2*dc)
    ];
    block5Nodes.push({center,axisName,raw,key:deriveKey(raw),mirror:raw[0]===raw[2]});
  }
}
assert.equal(block5Nodes.length,8);
assert.equal(block5Nodes.length*coldLandmarks.length*cardinals.length,128);

const block5MirrorNodes=block5Nodes.filter(node=>node.mirror);
assert.equal(block5MirrorNodes.length,1);
const block5Node=block5MirrorNodes[0];
assert.deepEqual(block5Node.center,[15,8]);
assert.equal(block5Node.axisName,"V");
assert.deepEqual(block5Node.raw.map(i=>T[i]),["NG","B","NG"]);
assert.deepEqual(block5Node.key.map(i=>T[i]),["NG","T","NG"]);

const block5Hits=[];
for(const start of coldLandmarks){
  for(const read of cardinals){
    let q=[...start],length=1;
    while(inBounds(q)){
      const continuation=boundaryContinuations(q,p2Start);
      if(continuation.length)block5Hits.push({start,read,length,endpoint:[...q],continuation});
      q=[q[0]+read[0],q[1]+read[1]];
      length++;
    }
  }
}
assert.equal(block5Hits.length,1);
const block5=block5Hits[0];
assert.deepEqual(block5.start,[26,19]);
assert.deepEqual(block5.read,[0,-1]);
assert.equal(block5.length,4);
assert.deepEqual(block5.endpoint,[26,16]);
const block5Cells=rayCells(block5.start,block5.read,block5.length);
assert.deepEqual(decrypt(block5Cells,block5Node.key).map(i=>T[i]),["I","M","A","Y"]);

assert.equal(block5.continuation.length,1);
const cryTransition=block5.continuation[0];
assert.deepEqual(cryTransition.source.raw.map(i=>T[i]),["E","X","E"]);
assert.deepEqual(cryTransition.source.center,[25,16]);
assert.equal(cryTransition.distance,6);
assert.deepEqual(cryTransition.key.map(i=>T[i]),["G","E","E"]);
assert.deepEqual(cryTransition.move,[-1,0]);
assert.deepEqual(cryTransition.landing,[19,16]);
assert.deepEqual(cryTransition.next.raw.map(i=>T[i]),["OE","J","OE"]);
assert.deepEqual(cryTransition.next.center,[19,16]);
assert.ok(same(cryTransition.next.p1,p2Start)||same(cryTransition.next.p2,p2Start));
assert.deepEqual(cryTransition.cells,[[19,16],[18,16],[17,16]]);
assert.deepEqual(decrypt(cryTransition.cells,cryTransition.key).map(i=>T[i]),["C","R","Y"]);

const cryEndpoint=cryTransition.cells.at(-1);
const nowTheGeometry=[];
for(const move of directions){
  const start=[cryEndpoint[0]+cryTransition.distance*move[0],cryEndpoint[1]+cryTransition.distance*move[1]];
  if(!inBounds(start))continue;
  for(const source of centered(start)){
    for(const sign of [-1,1]){
      const read=[source.axis[0]*sign,source.axis[1]*sign];
      let q=[...start],length=1;
      while(inBounds(q)){
        const chains=outerBoundaryChains(q,p2Start);
        if(chains.length)nowTheGeometry.push({move,start,source,read,length,endpoint:[...q],chains});
        q=[q[0]+read[0],q[1]+read[1]];
        length++;
      }
    }
  }
}
assert.equal(nowTheGeometry.length,1);
const nowThe=nowTheGeometry[0];
assert.deepEqual(nowThe.move,[-1,0]);
assert.deepEqual(nowThe.start,[11,16]);
assert.deepEqual(nowThe.source.raw.map(i=>T[i]),["A","TH","A"]);
assert.equal(nowThe.source.radius,3);
assert.deepEqual(nowThe.read,[1,1]);
assert.equal(nowThe.length,5);
assert.deepEqual(nowThe.endpoint,[15,20]);
assert.equal(nowThe.chains.length,1);

const nowTheCells=rayCells(nowThe.start,nowThe.read,nowThe.length);
const nowTheKey=deriveKey(cryTransition.next.raw);
assert.deepEqual(nowTheKey.map(i=>T[i]),["OE","OE","I"]);
assert.deepEqual(decrypt(nowTheCells,nowTheKey).map(i=>T[i]),["N","O","W","TH","E"]);

const ideaKey=deriveKey(nowThe.source.raw);
assert.deepEqual(ideaKey.map(i=>T[i]),["U","A","A"]);
const ideaChain=nowThe.chains[0];
assert.deepEqual(ideaChain.node1.raw.map(i=>T[i]),["J","D","J"]);
assert.deepEqual(ideaChain.node1.center,[17,18]);
assert.deepEqual(ideaChain.other,[19,16]);
assert.deepEqual(ideaChain.node2.raw.map(i=>T[i]),["OE","J","OE"]);
assert.deepEqual(ideaChain.node2.center,[19,16]);

const toIdeaCenter=[
  Math.sign(ideaChain.node1.center[0]-nowThe.endpoint[0]),
  Math.sign(ideaChain.node1.center[1]-nowThe.endpoint[1])
];
const ideaLength=Math.max(
  Math.abs(ideaChain.node1.center[0]-nowThe.endpoint[0]),
  Math.abs(ideaChain.node1.center[1]-nowThe.endpoint[1])
)+1;
const ideaCells=rayCells(nowThe.endpoint,toIdeaCenter,ideaLength);
assert.deepEqual(ideaCells,[[15,20],[16,19],[17,18]]);
assert.deepEqual(decrypt(ideaCells,ideaKey).map(i=>T[i]),["I","D","EA"]);

assert.equal(boundaryContinuations(coldEnd,p2Start).length,0);

console.log(JSON.stringify({
  status:"PASS: physical p2 boundary selects block5 through IDEA without language scoring",
  p2Start,
  block5Family:{
    keyNodes:block5Nodes.length,
    mirrorKeyNodes:block5MirrorNodes.length,
    baseAssignments:block5Nodes.length*coldLandmarks.length*cardinals.length,
    allPrefixBoundaryHits:block5Hits.length
  },
  block5:{node:block5Node.raw.map(i=>T[i]),key:block5Node.key.map(i=>T[i]),cells:block5Cells,plaintext:decrypt(block5Cells,block5Node.key).map(i=>T[i])},
  cry:{source:cryTransition.source.raw.map(i=>T[i]),distance:cryTransition.distance,landing:cryTransition.landing,boundaryMirror:cryTransition.next.raw.map(i=>T[i]),cells:cryTransition.cells,plaintext:decrypt(cryTransition.cells,cryTransition.key).map(i=>T[i])},
  nowThe:{source:nowThe.source.raw.map(i=>T[i]),move:nowThe.move,cells:nowTheCells,plaintext:decrypt(nowTheCells,nowTheKey).map(i=>T[i])},
  idea:{keySource:nowThe.source.raw.map(i=>T[i]),chain:[ideaChain.node1.raw.map(i=>T[i]),ideaChain.node2.raw.map(i=>T[i])],cells:ideaCells,plaintext:decrypt(ideaCells,ideaKey).map(i=>T[i])},
  control:{coldEndpointDirectBoundaryHits:0},
  caveat:"The physical-boundary/mirror grammar was identified after the public candidate route. It removes language feedback from these local selections but remains an intermediate post-hoc mechanism."
},null,2));
