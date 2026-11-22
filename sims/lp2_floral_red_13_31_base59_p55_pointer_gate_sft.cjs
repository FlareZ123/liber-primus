"use strict";

/**
 * LP2 floral red-bookend, 13/31 ornament and base59 grid: exact double
 * address-pair pointer-tree receiver into the independently identified
 * p55 43-inside/33-circumference word partition.
 *
 * The address extraction, pointer walks, all-node-pair null and p55 source
 * receiver are deterministic, no plaintext or key selection on ciphertext.
 * The resulting link is provisional until a source-authored inverse exists.
 * Windows11 Node.js22, CommonJS, read-only SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=data("resources/liber-primus/lp2-corpus.json");
const ink=data("resources/liber-primus/lp2-ink-annotations.json");
const grid=data("resources/liber-primus/lp2-grid-256.json");
const p40=corpus.pages[40].indices;
const p53=corpus.pages[53].indices;
const pp55=corpus.pages[55].indices;
const r40=ink.pages.find(p=>p.page===40).red_spans;
const r53=ink.pages.find(p=>p.page===53).red_spans;
assert.deepEqual(r40.map(s=>[s.start,s.length]),[[0,8]]);
assert.deepEqual(r53.map(s=>[s.start,s.length]),[[128,51]]);
const head=p40.slice(0,8);
const tail=p53.slice(128);
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const hIndex=sum(head,x=>x),hPrime=sum(head,x=>corpus.prime[x]);
const tPrime=sum(tail,x=>corpus.prime[x]);
assert.deepEqual([hIndex,hPrime,tPrime],[116,435,2262]);
const p57=data("resources/external/relikd-solved-gp29-native-v1.json")
  .sections.find(x=>x.name==="p57_parable").source_text;
const p57Words=p57.split(/[^\u16A0-\u16FF]+/u).filter(Boolean);
const gpRuneIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const originalP57Words=p57Words.map(runic=>{
  const positions=Array.from(runic,one=>gpRuneIndex.get(one));
  assert(positions.every(x=>Number.isInteger(x)));
  return {runes:positions,text:positions.map(x=>corpus.translit[x]).join(""),
    GPIndexSum:positions.reduce((a,x)=>a+x,0)};
});
const instarHits=originalP57Words.filter(w=>w.GPIndexSum===tPrime/GP);
assert.equal(instarHits.length,1);
assert.equal(instarHits[0].text,"INSTAR");
assert.equal(tPrime/GP,78);

// Original repeated floral side ornaments, read in printed order as 5-bit
// hollow=0/filled=1, are 01101(binary)=13 and 11111(binary)=31.
const LEFT=13,RIGHT=31,GP=corpus.runes.length;
assert.equal(GP,29);
assert.equal(hIndex%GP,0);
assert.equal(hPrime%GP,0);
assert.equal(tPrime%(LEFT*GP),0);
assert.equal((hPrime+tPrime)%(RIGHT*GP),0);
const leftColumn=tPrime/(LEFT*GP);
const rightColumn=(hPrime+tPrime)/(RIGHT*GP);
assert.deepEqual([leftColumn,rightColumn,hIndex/GP],[6,3,4]);
assert.equal(head.length+tail.length,59);

const tokens=grid.pages.flatMap(p=>p.tokens);
const printedAlphabet=grid.alphabet;
const digit59=printedAlphabet.replace("f","");
assert.equal(printedAlphabet.length,60);
assert.equal(digit59.length,59);
assert.equal(tokens.length,256);
assert.equal(grid.bytes.length,256);
const addressByte=tok=>digit59.indexOf(tok[0])*59+digit59.indexOf(tok[1]);
const table59=tokens.map(addressByte);
assert(table59.every(x=>x>=0&&x<=255));
assert.equal(grid.bytes[13*8+6],32);
assert.equal(table59[13*8+6],32);
assert.equal(grid.bytes[31*8+3],230);
assert.equal(table59[31*8+3],226);
const seedL=LEFT*8+leftColumn,seedR=RIGHT*8+rightColumn;
assert.deepEqual([seedL,seedR],[110,251]);

/** @param {number} seed @param {number[]} table */
function follow(seed,table){
 const seen=new Map(),nodes=[];
 let cur=seed;
 while(!seen.has(cur)){
   seen.set(cur,nodes.length);
   nodes.push(cur);
   cur=table[cur];
 }
 return {seed,nodes,cycleEntry:cur,cycleIndex:seen.get(cur),
   cycleLength:nodes.length-seen.get(cur),
   fixed:table[cur]===cur,
   depth:seen.get(cur)};
}
const left=follow(seedL,table59);
const right=follow(seedR,table59);
assert.deepEqual({depth:left.depth,root:left.cycleEntry,cycle:left.cycleLength},
  {depth:33,root:189,cycle:1});
assert.deepEqual({depth:right.depth,root:right.cycleEntry,cycle:right.cycleLength},
  {depth:6,root:189,cycle:1});
assert.equal(table59[189],189);
const commonNode=left.nodes.find(x=>right.nodes.includes(x));
const leftEntry=left.nodes.indexOf(commonNode);
const rightEntry=right.nodes.indexOf(commonNode);
const sharedTail=left.depth-leftEntry;
assert.deepEqual({commonNode,leftEntry,rightEntry,sharedTail},
  {commonNode:72,leftEntry:29,rightEntry:2,sharedTail:4});
assert.equal(leftEntry,GP);
assert.equal(sharedTail,hIndex/GP);
assert.equal(right.depth,tPrime/(LEFT*GP));
assert.deepEqual([left.nodes[1],left.nodes[16],left.nodes[18]],[32,244,58]);
assert.deepEqual([corpus.pages[32].indices.length,corpus.pages[55].indices.length],[121,76]);

const base60L=follow(seedL,grid.bytes);
const base60R=follow(seedR,grid.bytes);
assert.deepEqual([base60L.cycleLength,base60R.cycleLength],[11,11]);
assert.notEqual(base60L.depth,left.depth);
assert.notEqual(base60R.depth,right.depth);

// A fixed-pair descriptive null over the original unaltered base59 graph.
// All 256^2 ordered seed pairs, with no cherry-picked table cells.
const graph=Array.from({length:256},(_,i)=>follow(i,table59));
assert(graph.every(x=>x.fixed&&x.cycleEntry===189));
const subtreeSizes=new Array(256).fill(0);
for (const walk of graph) {
  for (const address of walk.nodes) subtreeSizes[address]++;
}
assert.deepEqual(
  subtreeSizes.map((n,i)=>n===33?i:null).filter(x=>x!==null),[146]);
assert.deepEqual(
  subtreeSizes.map((n,i)=>n===76?i:null).filter(x=>x!==null),[244]);
assert.deepEqual(
  subtreeSizes.map((n,i)=>n===121?i:null).filter(x=>x!==null),[58]);
assert.equal(subtreeSizes[189],256);

let allPairs=0,restricted=0;
const passing=[];
for(let i=0;i<256;i++) for(let j=0;j<256;j++){
 const a=graph[i],b=graph[j];
 if(a.depth!==33||b.depth!==6)continue;
 const first=a.nodes.find(x=>b.nodes.includes(x));
 if(first===undefined)continue;
 const li=a.nodes.indexOf(first),ri=b.nodes.indexOf(first);
 const condition=li===29&&ri===2&&a.depth-li===4;
 if(condition){
   allPairs++;
   passing.push([i,j]);
   if(Math.floor(i/8)===LEFT && Math.floor(j/8)===RIGHT)restricted++;
 }
}
assert.equal(allPairs,18);
assert.equal(restricted,1);
assert(passing.some(([i,j])=>i===seedL&&j===seedR));

// p55 word circumferences: one 1-rune incoming p54 continuation plus
// sixteen original complete local words. The source p57 command explicitly
// says to SHED OUR OWN CIRCUMFERENCES; independent 3301 check is 43*76+33.
const sourceWordLengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(sum(sourceWordLengths,x=>x),76);
const exterior=[],interior=[];
let pos=0;
for(const n of sourceWordLengths){
 for(let i=0;i<n;i++){
   const entry={pos:pos+i,rune:pp55[pos+i]};
   if(i===0||i===n-1)exterior.push(entry);
   else interior.push(entry);
 }
 pos+=n;
}
assert.equal(pos,76);
assert.deepEqual([interior.length,exterior.length],[43,33]);
assert.equal(43*76+33,3301);
assert.equal(exterior.length,left.depth);
assert.equal(sourceWordLengths.length-1,16);
assert.equal(left.nodes.indexOf(244)-left.nodes.indexOf(32)+1,16);


// Source-typed *candidate* 33-rune direct readout: each left branch node
// or the corresponding byte value provides a GP29 additive mask to the
// published exterior in printed order. This is an affordable receiver gate,
// not an authenticated prescribed cipher.
const mod=x=>(x%GP+GP)%GP;
const ioc=a=>{
 const f=new Uint16Array(29);
 for(const v of a)f[v]++;
 return [...f].reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
const originalExterior=exterior.map(x=>x.rune);
const plants=corpus.pages[57].indices;
const recoveries=[];
for(const [reading,key] of [
 ["nodeIndex",left.nodes.slice(0,left.depth).map(x=>x%GP)],
 ["nodeByte",left.nodes.slice(0,left.depth).map(x=>table59[x]%GP)]
]) for(const sign of [-1,1]){
 const direct=originalExterior.map((c,i)=>mod(c+sign*key[i]));
 const recon=direct.map((p,i)=>mod(p-sign*key[i]));
 assert.deepEqual(recon,originalExterior);
 const plant=Array.from({length:33},(_,i)=>plants[i]);
 const synthetic=plant.map((p,i)=>mod(p-sign*key[i]));
 assert.deepEqual(synthetic.map((c,i)=>mod(c+sign*key[i])),plant);
 recoveries.push({reading,sign,originalExteriorIoC:ioc(originalExterior),
   decodedExteriorIoC:ioc(direct),first33SourceTranslit:direct.map(x=>corpus.translit[x]).join(" "),
   exactOriginalReplay:33,positiveNativeRecovered:33});
}
console.log(JSON.stringify({
  model:"original red8, red51, ornament 13/31 prime sums into exact row/column addresses; follow base59 source-table pointers; compare p55 literal word circumferences",
  source:{headIndices:head,headIndexSum:hIndex,headPrimeSum:hPrime,
    closingPrimeSum:tPrime,bothPrimeSum:hPrime+tPrime,
    redCount:59,redFiveDot:[LEFT,RIGHT],
    quotientColumns:[leftColumn,rightColumn],addresses:[seedL,seedR],
    tokenAtLeft:tokens[seedL],tokenAtRight:tokens[seedR],
    p55Whole:pp55.length,p55Inside:43,p55Circumference:33},
  pointers:{base59Root:189,rootToken:tokens[189],leftDepth:left.depth,
    rightDepth:right.depth,firstMeetingNode:commonNode,
    leftBranchBeforeMeeting:leftEntry,rightBranchBeforeMeeting:rightEntry,
    commonTailDepth:sharedTail,alphabetSize:GP,
    leftNodes:left.nodes.slice(0,left.depth),rightNodes:right.nodes.slice(0,right.depth),
    sourceTreeReceivers:{
      firstHopPhysicalP32:left.nodes[1],
      p32SourceRunes:corpus.pages[32].indices.length,
      p55SourceRunes:corpus.pages[55].indices.length,
      uniqueP55SubtreeNode:244,
      uniqueP55SubtreeSize:subtreeSizes[244],
      uniqueP32SubtreeNode:58,
      uniqueP32SubtreeSize:subtreeSizes[58],
      uniqueExterior33SubtreeNode:146,
      uniqueExterior33SubtreeSize:subtreeSizes[146],
      originalP55CompleteWords:sourceWordLengths.length-1,
      p32ToP55Edges:left.nodes.indexOf(244)-left.nodes.indexOf(32)
    },

    base60CycleLengths:[base60L.cycleLength,base60R.cycleLength],
    totalOrderedPairMatches:allPairs,allOrderedPairs:256**2,
    markedOrnamentRowPairs:8*8,markedRowMatches:restricted},
  directP55CircumferenceGate:recoveries,
  interpretation:"Coherent original-source address/pointer/33-circumference receiver; no author-selected numeric-to-rune decoder or authenticated unknown plaintext recovered."
},null,2));