"use strict";

/**
 * SFT: plaintext-blind NOW THE -> IDEA selector on the original p0-p2 27x27 grid.
 *
 * Selector inputs: the frozen NOW THE ciphertext path, mirror geometry, and the
 * next physical page start. Plaintext/dictionary/checksum are inspected only
 * after the source cells and key have been selected.
 *
 * Run: node sims/lp2_p0_idea_pageboundary_selector_sft.cjs
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

const at=q=>grid[(q[0]-1)*27+q[1]-1];
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const mod=x=>(x%29+29)%29;
const axes=[[1,0],[0,1],[1,1],[1,-1]];
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
  let rest=n,sgn=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    sgn=-sgn;
    if(rest%p===0)return 0;
  }
  return rest>1?-sgn:sgn;
}

const mirrors=[];
for(let r=1;r<=27;r++)for(let c=1;c<=27;c++)for(const axis of axes)for(let radius=1;radius<=13;radius++){
  const p1=[r-axis[0]*radius,c-axis[1]*radius];
  const p2=[r+axis[0]*radius,c+axis[1]*radius];
  if(!inBounds(p1)||!inBounds(p2))break;
  const raw=[at(p1),at([r,c]),at(p2)];
  if(raw[0]===raw[2]&&raw[1]!==0)mirrors.push({center:[r,c],p1,p2,axis,radius,raw});
}
assert.equal(mirrors.length,479);
const centered=q=>mirrors.filter(n=>same(n.center,q));

/** @param {{raw:number[]}} node */
function deriveKey(node){
  const d=[node.raw[0],phi(node.raw[1]),node.raw[2]];
  const rot=((d.reduce((s,v)=>s+mu(phi(v)),0)%3)+3)%3;
  return d.slice(rot).concat(d.slice(0,rot));
}

/**
 * @param {[number,number]} endpoint
 * @param {[number,number]} target
 */
function chainsToBoundary(endpoint,target){
  const out=[];
  for(const node1 of centered(endpoint))for(const junction of [node1.p1,node1.p2])for(const node2 of centered(junction)){
    if(same(node2.p1,target)||same(node2.p2,target))out.push({node1,junction,node2});
  }
  return out;
}

/**
 * @param {[number,number]} start
 * @param {[number,number]} target
 */
function boundaryHits(start,target){
  const hits=[];
  for(const direction of directions){
    let q=[...start];
    for(let length=1;inBounds(q);length++){
      const chains=chainsToBoundary(q,target);
      if(chains.length)hits.push({direction,length,endpoint:[...q],chains});
      q=[q[0]+direction[0],q[1]+direction[1]];
    }
  }
  return hits;
}

/**
 * @param {[number,number]} start
 * @param {[number,number]} direction
 * @param {number} length
 */
function rayCells(start,direction,length){
  const cells=[];
  let q=[...start];
  for(let i=0;i<length;i++){
    assert.ok(inBounds(q));
    cells.push([...q]);
    q=[q[0]+direction[0],q[1]+direction[1]];
  }
  return cells;
}

const nowThe=[[11,16],[12,17],[13,18],[14,19],[15,20]];
const nowSet=new Set(nowThe.map(q=>q.join(",")));
const sourceCandidates=mirrors.filter(n=>nowSet.has(n.center.join(",")));
assert.equal(sourceCandidates.length,7);

const scored=sourceCandidates.map(node=>({
  node,
  overlap:[node.p1,node.center,node.p2].filter(q=>nowSet.has(q.join(","))).length
}));
const maxOverlap=Math.max(...scored.map(x=>x.overlap));
const winners=scored.filter(x=>x.overlap===maxOverlap);
assert.equal(maxOverlap,2);
assert.equal(winners.length,1);

const ideaNode=winners[0].node;
assert.deepEqual(ideaNode.center,[11,16]);
assert.equal(ideaNode.radius,3);
assert.deepEqual(ideaNode.raw.map(i=>T[i]),["A","TH","A"]);
const ideaKey=deriveKey(ideaNode);
assert.deepEqual(ideaKey.map(i=>T[i]),["U","A","A"]);

const p0End=[10,19],p1Start=[10,20],p1End=[20,15],p2Start=[20,16],matrixEnd=[27,27];
const start=nowThe.at(-1);
for(const target of [p0End,p1Start,p1End,matrixEnd])assert.equal(boundaryHits(start,target).length,0);

const hits=boundaryHits(start,p2Start);
assert.deepEqual(hits.map(x=>({direction:x.direction,length:x.length,endpoint:x.endpoint,chains:x.chains.length})),[
  {direction:[1,-1],length:3,endpoint:[17,18],chains:1},
  {direction:[1,-1],length:9,endpoint:[23,12],chains:1}
]);

const selected=hits[0];
const ideaCells=rayCells(start,selected.direction,selected.length);
assert.deepEqual(ideaCells,[[15,20],[16,19],[17,18]]);
const plain=ideaCells.map((q,i)=>mod(at(q)-ideaKey[i%3]));
assert.deepEqual(plain.map(i=>T[i]),["I","D","EA"]);

const chain=selected.chains[0];
assert.deepEqual(chain.node1.raw.map(i=>T[i]),["J","D","J"]);
assert.deepEqual(chain.junction,[19,16]);
assert.deepEqual(chain.node2.raw.map(i=>T[i]),["OE","J","OE"]);
assert.ok(same(chain.node2.p1,p2Start)||same(chain.node2.p2,p2Start));

console.log(JSON.stringify({
  status:"PASS: source geometry selects IDEA without plaintext feedback",
  pageLengths:pages.map(p=>p.indices.length),
  p2Start,
  mirrorCount:mirrors.length,
  sourceCandidates:sourceCandidates.length,
  selectedSource:{center:ideaNode.center,radius:ideaNode.radius,node:ideaNode.raw.map(i=>T[i]),overlap:maxOverlap,key:ideaKey.map(i=>T[i])},
  boundaryControls:{p0End:0,p1Start:0,p1End:0,matrixEnd:0,p2StartHits:hits.length},
  selectedRay:{direction:selected.direction,length:selected.length,cells:ideaCells,plaintext:plain.map(i=>T[i])},
  nextChain:[chain.node1.raw.map(i=>T[i]),chain.node2.raw.map(i=>T[i])],
  caveat:"The overlap-plus-next-page-boundary rule was recognized after the candidate route. It removes the English selector at this transition but remains an intermediate post-hoc local rule until prospectively predicted or independently instructed."
},null,2));
