#!/usr/bin/env node
"use strict";

/*
 * Candidate edge-state consumer:
 *   p57 "SHED OUR OWN CIRCUMFERENCES" -> 50+5+2 edge-label inventory
 *   -> fixed root-205 largest-child-first inorder page mapping
 *   -> each page's reverse edge ordinal is its p56 prime-clock start.
 *
 * The p56 page is the last labelled edge and its authentic prime clock starts
 * at index zero; the clear p57 root has no incoming edge. The numeric-only
 * p50 page retains its edge slot. This is one frozen candidate, not a sweep.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const parent=table.bytes;
const M=29;
assert.equal(parent.length,256);
assert.equal(source.pages.length,58);

const children=Array.from({length:256},()=>[]);
parent.forEach((v,i)=>children[v].push(i));
function descendants(rootNode){
  const seen=new Set(),queue=[rootNode];
  while(queue.length){
    const n=queue.pop();
    if(seen.has(n))continue;
    seen.add(n);
    queue.push(...children[n]);
  }
  return [...seen];
}
const sizeMemo=new Map();
function subtreeSize(n,active=new Set()){
  if(sizeMemo.has(n))return sizeMemo.get(n);
  assert(!active.has(n),"reverse tree must be acyclic");
  const next=new Set(active);next.add(n);
  const value=1+children[n].reduce((s,c)=>s+subtreeSize(c,next),0);
  sizeMemo.set(n,value);return value;
}
function inorder(n){
  const cs=children[n].slice().sort((a,b)=>subtreeSize(b)-subtreeSize(a)||a-b);
  return cs.length?[...inorder(cs[0]),n,...cs.slice(1).flatMap(inorder)]:[n];
}
assert.deepEqual([parent[201],parent[74]],[74,205]);
assert.deepEqual([201,74,205].map(n=>descendants(n).length),[56,57,58]);
assert.deepEqual(children[201].slice().sort((a,b)=>a-b),[82,128]);
assert.deepEqual([82,128].map(n=>descendants(n).length),[50,5]);
const pageNodes=inorder(205);
assert.equal(pageNodes.length,58);
assert.equal(new Set(pageNodes).size,58);
assert.deepEqual(
  [pageNodes[0],pageNodes[50],pageNodes[55],pageNodes[56],pageNodes[57]],
  [178,201,128,74,205]
);
assert.equal(pageNodes[57],205); // clear p57 root
assert.equal(pageNodes[56],74);  // solved p56 child
assert.equal(pageNodes[50],201); // rune-free p50 table

// Recover the 20 authentic p57 printed words and their canonical GP indices.
const words=(transcription.split("%").at(-1).replace(/\/\r?\n/g,"")
  .match(/[\u16A0-\u16FF]+/gu)||[])
  .map(word=>[...word].map(r=>source.runes.indexOf(r)));
assert.equal(words.length,20);
assert.deepEqual(words.flat(),source.pages[57].indices);
const title=words[0],body=words.slice(1);
assert.equal(title.length,7);
assert.equal(body.length,19);
assert.equal(body.flat().length,88);
const bodyInterior=body.flatMap(w=>w.slice(1,-1));
const titleInterior=title.slice(1,-1);
assert.equal(bodyInterior.length,50);
assert.equal(titleInterior.length,5);
assert.deepEqual(
  [source.translit[title[0]],source.translit[title.at(-1)]],
  ["P","E"]
);

// Reproduce the existing candidate edge assignment exactly:
// p0-49 <- 50 black interiors; p50 <- P; p51-55 <- five red interiors;
// p56 <- E; p57 is the unlabelled clear root.
const edgeLabels=new Map();
for(let p=0;p<50;p++)edgeLabels.set(pageNodes[p],bodyInterior[p]);
edgeLabels.set(pageNodes[50],title[0]);
for(let p=51;p<=55;p++)edgeLabels.set(pageNodes[p],titleInterior[p-51]);
edgeLabels.set(pageNodes[56],title.at(-1));
assert.equal(edgeLabels.size,57);
assert.equal(edgeLabels.get(201),title[0]);
assert.equal(edgeLabels.get(74),title.at(-1));
assert.equal(edgeLabels.has(205),false);

// Count edge positions backward from p56: its incoming edge is the final
// labelled edge and therefore receives the authentic p56 start index zero.
// p50's numeric-only edge still occupies slot 6; p57 has no edge at all.
const edgeStart=page=>page>=0&&page<=56?56-page:null;
assert.equal(edgeStart(56),0);
assert.equal(edgeStart(50),6);
assert.equal(edgeStart(15),41);
assert.equal(edgeStart(57),null);

function firstPrimes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let ok=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}
    if(ok)out.push(n);
  }
  return out;
}
const maxLength=Math.max(...source.pages.slice(0,57).map(p=>p.indices.length));
const primes=firstPrimes(56+maxLength+2);
const mod=n=>((n%M)+M)%M;
const key=(start,used)=>(primes[start+used]-1)%M;
function analyze(page,start){
  let states=new Map([[0,1n]]),maxStates=1;
  for(let pos=0;pos<page.indices.length;pos++){
    const c=page.indices[pos],next=new Map();
    for(const [used,ways] of states){
      if(c===0)next.set(used,(next.get(used)||0n)+ways); // literal F
      const plain=mod(c-key(start,used));
      if(plain!==0)next.set(used+1,(next.get(used+1)||0n)+ways);
    }
    states=next;maxStates=Math.max(maxStates,states.size);
    if(!states.size)return {page:page.page,start,length:page.indices.length,
      complete:false,failedAt:pos,maxStates};
  }
  return {page:page.page,start,length:page.indices.length,complete:true,
    terminalUsed:[...states.keys()].sort((a,b)=>a-b),
    paths:[...states.values()].reduce((s,n)=>s+n,0n).toString(),maxStates};
}
function enumerate(cipher,start){
  const memo=new Map();
  function visit(pos,used){
    if(pos===cipher.length)return [[]];
    const id=pos+":"+used;if(memo.has(id))return memo.get(id);
    const out=[];
    if(cipher[pos]===0)for(const tail of visit(pos+1,used))out.push([0,...tail]);
    const plain=mod(cipher[pos]-key(start,used));
    if(plain!==0)for(const tail of visit(pos+1,used+1))out.push([plain,...tail]);
    memo.set(id,out);return out;
  }
  return visit(0,0);
}
function encrypt(plain,start){
  let used=0;
  return plain.map(p=>p===0?0:mod(p+key(start,used++)));
}
function ioc(values){
  const h=Array(M).fill(0);for(const x of values)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}

// Authentic p56 known-plaintext control, encoded independently from the
// preserved solved text. Its incoming edge must start at prime index zero.
const tokens=source.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function encodeWord(raw){
  const text=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  const out=[];
  for(let i=0;i<text.length;){
    const token=tokens.find(x=>text.startsWith(x.t,i));
    assert(token,"unmapped GP text at "+text.slice(i));
    out.push(token.i);i+=token.t.length;
  }
  return out;
}
const plain56=("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE "+
  "THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE")
  .split(" ").flatMap(encodeWord);
assert.equal(plain56.length,85);
assert.deepEqual(encrypt(plain56,edgeStart(56)),source.pages[56].indices);
assert.equal(source.pages[57].indices.length,95); // clear root, zero edges

const runePages=source.pages.slice(0,56).filter(p=>p.indices.length>0);
assert.equal(runePages.length,55);
assert.equal(runePages.reduce((s,p)=>s+p.indices.length,0),12956);
const results=runePages.map(p=>analyze(p,edgeStart(p.page)));
const failures=results.filter(r=>!r.complete).map(r=>[r.page,r.failedAt]);
assert.equal(failures.length,54);
assert.deepEqual(failures,[
 [0,41],[1,3],[2,18],[3,167],[4,7],[5,41],[6,18],[7,103],[8,14],[9,2],
 [10,7],[11,187],[12,11],[13,71],[14,0],[16,17],[17,17],[18,25],[19,165],
 [20,141],[21,0],[22,9],[23,90],[24,23],[25,20],[26,4],[27,3],[28,11],[29,5],
 [30,5],[31,3],[32,13],[33,91],[34,2],[35,63],[36,10],[37,35],[38,142],[39,28],
 [40,60],[41,112],[42,93],[43,19],[44,5],[45,7],[46,114],[47,0],[48,4],[49,57],
 [51,31],[52,223],[53,152],[54,11],[55,3]
]);
const survivors=results.filter(r=>r.complete);
assert.deepEqual(survivors.map(r=>[r.page,r.start,r.paths]),[[15,41,"1"]]);
const candidate=enumerate(source.pages[15].indices,41);
assert.equal(candidate.length,1);
assert.deepEqual(encrypt(candidate[0],41),source.pages[15].indices);
const candidateIoC=ioc(candidate[0]);
const clearP57IoC=ioc(source.pages[57].indices);
assert(Math.abs(candidateIoC-0.03463100071650346)<1e-10);
assert(Math.abs(clearP57IoC-0.06270996640537514)<1e-10);

console.log(JSON.stringify({
 hypothesis:"reverse edge ordinal is the per-page p56 prime-clock start: start(page)=56-page",
 tree:{nodes:58,edges:57,branchSizes:[50,5],pageOrderAnchors:{
   p0:pageNodes[0],p50:pageNodes[50],p55:pageNodes[55],p56:pageNodes[56],p57:pageNodes[57]}},
 edgeInventory:{bodyInteriors:50,titleInteriors:5,titleEndpoints:2,total:edgeLabels.size,
   p50RetainsBlankSlot:true,p56EdgeLabel:source.translit[edgeLabels.get(74)],
   p57RootHasNoEdge:true},
 controls:{p56PlaintextRunes:85,p56OriginalCipherExact:true,p56Start:0,
   p57ClearRunes:95,p57Start:null},
 original:{runePages:55,totalRunes:12956,algebraicallyImpossible:54,
   firstImpossibleOffsets:failures,completePages:survivors},
 onlySurvivor:{page:15,start:41,paths:1,length:159,ioc:candidateIoC},
 clearP57IoC,
 decision:"Retire this exact reverse-edge-ordinal p56 prime-clock consumer; the edge-labelled graph may still support another independently selected state update."
},null,2));
