#!/usr/bin/env node
'use strict';

/*
 * Agent13 — chapter-terminal -> p50 MAP/ROAD midpoint bridge.
 *
 * Reconstructs from original resources:
 *   1) the frozen chapter first-black SUM->PRODUCT route,
 *   2) the p40 terminal word's unused [length,OUT] pair,
 *   3) the independently established strict p50 support lines,
 *   4) the base59 pointer sink + horizontal-reflection return path.
 *
 * No unknown plaintext, fitted key, hexadecimal interpretation, or p3
 * fallback is used.
 *
 * Usage: node sims/lp2_chapter_terminal_p50_midpoint_bridge_sft.cjs
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');

const corpus=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const grid=JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const transcript=load('resources/liber-primus/lp2-transcription.txt').replace(/\r/g,'').split('%');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const chapters=[0,3,8,15,23,27,33,40,54];

/** @param {number} page */
function firstBlackRecord(page){
  const source=corpus.pages.find(x=>x.page===page).indices;
  const pageInk=ink.pages.find(x=>x.page===page);
  assert.equal(pageInk.red_spans[0].start,0);
  let titleEnd=pageInk.red_spans[0].length;
  for(let i=1;i<pageInk.red_spans.length&&pageInk.red_spans[i].start===titleEnd;i+=1){
    titleEnd+=pageInk.red_spans[i].length;
  }

  const segment=transcript[page>=51?page-1:page];
  const words=[];
  let current=[];
  let offset=0;
  const flush=()=>{if(current.length){words.push(current);current=[];}};

  for(const ch of segment){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      assert.equal(source[offset],value,`transcription mismatch p${page}@${offset}`);
      current.push(offset);
      offset+=1;
    }else if(ch==='/'||/\s/u.test(ch)){
      continue;
    }else{
      flush();
    }
  }
  flush();
  assert.equal(offset,source.length);

  const positions=words.find(w=>w[0]===titleEnd);
  assert.ok(positions,`missing first black word p${page}`);
  const values=positions.map(i=>source[i]);
  return {
    page,
    start:positions[0],
    length:values.length,
    sum:values.reduce((s,x)=>s+x,0)%29,
    product:values.reduce((s,x)=>s*x%29,1),
  };
}

const records=chapters.map(firstBlackRecord);
assert.deepEqual(records,[
  {page:0,start:13,length:4,sum:15,product:23},
  {page:3,start:16,length:4,sum:9,product:11},
  {page:8,start:12,length:3,sum:23,product:2},
  {page:15,start:20,length:4,sum:22,product:13},
  {page:23,start:16,length:8,sum:25,product:16},
  {page:27,start:19,length:7,sum:2,product:19},
  {page:33,start:10,length:2,sum:5,product:3},
  {page:40,start:8,length:5,sum:27,product:3},
  {page:54,start:9,length:8,sum:19,product:27},
]);

// Frozen graph: IN=sum, OUT=product.
const route=[0];
let cursor=0;
while(true){
  const current=records.find(x=>x.page===cursor);
  const targets=records.filter(x=>x.sum===current.product);
  if(!targets.length) break;
  assert.equal(targets.length,1);
  cursor=targets[0].page;
  route.push(cursor);
}
assert.deepEqual(route,[0,8,27,54,40]);
const terminal=records.find(x=>x.page===40);
assert.deepEqual(
  {length:terminal.length,in:terminal.sum,out:terminal.product},
  {length:5,in:27,out:3}
);
assert.equal(records.filter(x=>x.sum===terminal.product).length,0);

// Reconstruct the four strict support lines from original tokens/codecs.
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.equal(grid.alphabet.length,60);
const alpha59=grid.alphabet.replace('f','');
assert.equal(alpha59.length,59);

/** @param {string} token */
function b59(token){
  const hi=alpha59.indexOf(token[0]),lo=alpha59.indexOf(token[1]);
  assert.ok(hi>=0&&lo>=0);
  return hi*59+lo;
}

/** @param {number} n */
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d+=1) if(n%d===0)return false;
  return true;
}
const primes=[];
for(let n=2;primes.length<60;n+=1) if(isPrime(n))primes.push(n);
const primeRank=value=>{
  const i=primes.indexOf(value);
  return i<0?null:i+1;
};

const support={
  map:{cells:[219,211],axis:'col',coord:3,codec:'base60',ranks:[17,18]},
  road:{cells:[40,41],axis:'row',coord:5,codec:'base59',ranks:[22,23]},
  bewareFalse:{cells:[126,182],axis:'col',coord:6,codec:'base60',ranks:[38,39]},
  falsePaths:{cells:[2,26],axis:'col',coord:2,codec:'base60',ranks:[39,40]},
};
for(const line of Object.values(support)){
  const got=line.cells.map(index=>
    primeRank(line.codec==='base60'?grid.bytes[index]:b59(tokens[index]))
  );
  assert.deepEqual(got,line.ranks);
  if(line.axis==='col') assert.ok(line.cells.every(i=>i%8===line.coord));
  else assert.ok(line.cells.every(i=>Math.floor(i/8)===line.coord));
}

// The terminal's IN=sum was already consumed to enter p40. The remaining
// source descriptor pair [length,OUT] is [5,3], which independently names
// the sole strict horizontal support (ROAD row5) and MAP vertical support
// (column3). Reversal [3,5] names neither a strict row+column crossing.
const terminalPair=[terminal.length,terminal.product];
assert.deepEqual(terminalPair,[support.road.coord,support.map.coord]);
const selectedCell=8*terminalPair[0]+terminalPair[1];
assert.equal(selectedCell,43);
assert.equal(tokens[selectedCell],'1D');

const strictRows=Object.values(support).filter(x=>x.axis==='row').map(x=>x.coord);
const strictCols=Object.values(support).filter(x=>x.axis==='col').map(x=>x.coord);
assert.deepEqual(strictRows,[5]);
assert.deepEqual(strictCols.sort((a,b)=>a-b),[2,3,6]);

// Charge the exact [length,OUT] grammar across all nine chapter operands.
// P40 alone has one strict-row value followed by one strict-column value.
const pairCharge=records.map(r=>({
  page:r.page,
  pair:[r.length,r.product],
  rowMatch:support.road.coord===r.length,
  colMatches:Object.entries(support)
    .filter(([,x])=>x.axis==='col'&&x.coord===r.product)
    .map(([name])=>name),
}));
assert.deepEqual(pairCharge.filter(x=>x.rowMatch&&x.colMatches.length===1),[{
  page:40,
  pair:[5,3],
  rowMatch:true,
  colMatches:['map'],
}]);

// Base59 pointer graph. All 256 cells reach unique fixed sink189.
const values59=tokens.map(b59);
const sink=189;
assert.equal(values59[sink],sink);

/** @param {number} start */
function pathToSink59(start){
  const path=[start];
  const seen=new Set();
  while(path.at(-1)!==sink){
    const x=path.at(-1);
    assert.ok(x>=0&&x<256,`out-of-range base59 node ${x}`);
    assert.ok(!seen.has(x),`base59 cycle before sink from ${start}`);
    seen.add(x);
    path.push(values59[x]);
  }
  return path;
}
for(let i=0;i<256;i+=1) pathToSink59(i);

// Horizontal reflection of sink189 in the physical 8-column panel.
const sinkRow=Math.floor(sink/8),sinkCol=sink%8;
assert.deepEqual([sinkRow,sinkCol],[23,5]);
const reflected=sinkRow*8+(7-sinkCol);
assert.equal(reflected,186);
const mirrorPath=pathToSink59(reflected);
assert.deepEqual(mirrorPath,[186,19,33,112,72,161,214,247,189]);
assert.equal(mirrorPath.length-1,8);

// The selected cell's base59 token value is exactly the midpoint node.
const selectedValue59=values59[selectedCell];
assert.equal(selectedValue59,72);
assert.equal(mirrorPath.indexOf(selectedValue59),4);
assert.equal(pathToSink59(selectedValue59).length-1,4);
assert.equal(pathToSink59(selectedCell).length-1,5);

// Complete strict ROAD/support intersection charge.
const roadCrossings=strictCols.map(col=>{
  const cell=8*support.road.coord+col;
  const next=values59[cell];
  return {
    col,
    cell,
    token:tokens[cell],
    next,
    mirrorIndex:mirrorPath.indexOf(next),
    successorDistance:pathToSink59(next).length-1,
  };
});
assert.deepEqual(roadCrossings,[
  {col:2,cell:42,token:'0S',next:28,mirrorIndex:-1,successorDistance:24},
  {col:3,cell:43,token:'1D',next:72,mirrorIndex:4,successorDistance:4},
  {col:6,cell:46,token:'3J',next:196,mirrorIndex:-1,successorDistance:29},
]);

// Distance-to-sink supplies a second exact state check. Cell43 itself is five
// pointer edges from the sink, equal to terminal length/ROAD row g=5. Its
// first successor72 is four edges from the sink, equal to q=4. No other cell
// in physical row5 has distance5.
const distanceToSink=Array.from({length:256},(_,i)=>pathToSink59(i).length-1);
assert.equal(distanceToSink[selectedCell],5);
assert.equal(distanceToSink[selectedValue59],4);
const row5Distance5=Array.from({length:8},(_,col)=>8*5+col)
  .filter(cell=>distanceToSink[cell]===5);
assert.deepEqual(row5Distance5,[43]);
const globalDistanceEqualsRow=[];
for(let cell=0;cell<256;cell+=1){
  const row=Math.floor(cell/8);
  if(distanceToSink[cell]===row) globalDistanceEqualsRow.push(cell);
}
assert.deepEqual(globalDistanceEqualsRow,[34,43,158,230,233]);

// Post-discovery state closure on the already source-selected five-edge path.
// Address residues themselves are [-b,-b,AK,A^-1,b,b]; the middle pair
// multiplies to K. Charge only this exact three-feature conjunction across all
// 256 starts. It is unique, while each component alone is non-rare.
const selectedResidues=pathToSink59(selectedCell).slice(0,6).map(x=>x%29);
assert.deepEqual(selectedResidues,[14,14,16,11,15,15]);
assert.equal((selectedResidues[2]*selectedResidues[3])%29,2);
const fiveEdgeFeatures=[];
for(let cell=0;cell<256;cell+=1){
  const path=[cell];
  let x=cell;
  for(let step=0;step<5;step+=1){
    x=values59[x];
    path.push(x);
  }
  const residues=path.map(y=>y%29);
  fiveEdgeFeatures.push({
    cell,
    eqStart:residues[0]===residues[1],
    eqEnd:residues[4]===residues[5],
    middleK:(residues[2]*residues[3])%29===2,
  });
}
assert.equal(fiveEdgeFeatures.filter(x=>x.eqStart).length,9);
assert.equal(fiveEdgeFeatures.filter(x=>x.eqEnd).length,29);
assert.equal(fiveEdgeFeatures.filter(x=>x.middleK).length,14);
assert.deepEqual(
  fiveEdgeFeatures.filter(x=>x.eqStart&&x.eqEnd&&x.middleK).map(x=>x.cell),
  [43]
);

// Global multiplicity: 72 has four predecessors; geometry selects one of them.
const midpointPredecessors=values59
  .map((x,i)=>x===72?i:null)
  .filter(x=>x!==null);
assert.deepEqual(midpointPredecessors,[43,69,112,226]);

// Codec control: the same physical token is 73 in base60. Following base60
// addresses from cell43 enters a cycle rather than sink189/midpoint72.
const values60=grid.bytes;
assert.equal(values60[selectedCell],73);
function walk60(start){
  const path=[start];
  const seen=new Set();
  while(true){
    const x=path.at(-1);
    if(x<0||x>=256||seen.has(x)||x===sink) return {path,terminal:x,hitSink:x===sink};
    seen.add(x);
    path.push(values60[x]);
  }
}
const base60Walk=walk60(selectedCell);
assert.equal(base60Walk.hitSink,false);
assert.equal(base60Walk.path.includes(72),false);

// Director #3442 — prospective target was frozen on the Issue before cell79 reveal.
// Mirror is the original row-wise reflection M(r,c) = (r,7-c). A reusable
// midpoint-switch would make D59(M(72)) = M(D59(72)) = 166 and would land
// at M(189)=186 after four more steps. These claims fail without tuning.
const M=cell=>8*Math.floor(cell/8)+(7-cell%8);
const hop=(D,start,count)=>{
  const path=[start];
  for(let n=0;n<count;n+=1)path.push(D[path.at(-1)]);
  return path;
};
const mirrorMidpoint=M(selectedValue59);
assert.equal(mirrorMidpoint,79);
const predictedMirrorNext=M(values59[selectedValue59]);
const actualMirrorNext=values59[mirrorMidpoint];
assert.equal(predictedMirrorNext,166);
assert.equal(actualMirrorNext,81);
const mirrorMidpointPath4=hop(values59,mirrorMidpoint,4);
const predictedMirrorEndpoint=M(hop(values59,selectedValue59,4).at(-1));
assert.equal(predictedMirrorEndpoint,186);
assert.deepEqual(mirrorMidpointPath4,[79,81,57,116,53]);
const mirrorMidpointPath4Base60=hop(values60,mirrorMidpoint,4);
assert.deepEqual(mirrorMidpointPath4Base60,[79,82,201,74,205]);
const mirroredEdgeHits=values59.filter((value,i)=>values59[M(i)]===M(value)).length;
const mirrored4HopHits=values59.filter((value,i)=>hop(values59,M(i),4).at(-1)===M(hop(values59,i,4).at(-1))).length;
assert.equal(mirroredEdgeHits,0);
assert.equal(mirrored4HopHits,4);
const mirroredMidpointTransfer={
  frozenAt:'https://github.com/FlareZ123/liber-primus/issues/3442#issuecomment-7239016265',
  mirrorMidpoint,token:tokens[mirrorMidpoint],
  predictedMirrorNext,actualMirrorNext,oneHopHit:predictedMirrorNext===actualMirrorNext,
  predictedMirrorEndpoint,mirrorMidpointPath4,
  fourHopHit:mirrorMidpointPath4.at(-1)===predictedMirrorEndpoint,
  mirrorMidpointPath4Base60,
  completeGridCommutingEdges:mirroredEdgeHits,
  completeGridCommutingFourHopPairs:mirrored4HopHits,
  alreadyKnownForwardFrom72:hop(values59,selectedValue59,4),
  distinctInverseParents:midpointPredecessors,
};

console.log(JSON.stringify({
  status:'PASS',
  classification:'post-discovery source-typed p40->p50 continuation; no plaintext/key claim',
  chapter:{route,terminal,pairCharge},
  p50:{
    support,
    terminalPair,
    selectedCell,
    selectedToken:tokens[selectedCell],
    base59Value:selectedValue59,
    mirrorPath,
    midpointIndex:mirrorPath.indexOf(selectedValue59),
    roadCrossings,
    distanceSelfCheck:{
      selectedDistance:distanceToSink[selectedCell],
      successorDistance:distanceToSink[selectedValue59],
      row5Distance5,
      globalDistanceEqualsRow,
    },
    fiveEdgeStateClosure:{
      selectedResidues,
      labels:['-b','-b','AK','A^-1','b','b'],
      componentCounts:{
        equalStart:fiveEdgeFeatures.filter(x=>x.eqStart).length,
        equalEnd:fiveEdgeFeatures.filter(x=>x.eqEnd).length,
        middleProductK:fiveEdgeFeatures.filter(x=>x.middleK).length,
      },
      exactConjunctionStarts:fiveEdgeFeatures
        .filter(x=>x.eqStart&&x.eqEnd&&x.middleK).map(x=>x.cell),
    },
    midpointPredecessors,
    mirroredMidpointTransfer,
    base60Value:values60[selectedCell],
    base60Walk,
  },
  decision:'Within the reached p40 chapter, terminal [length,OUT]=[5,3] selects ROAD row5/MAP col3; base59 sends their cell43 intersection to the exact midpoint of the independently established mirror186->sink189 return path. Hex is unnecessary, and the frozen midpoint mirror-transfer predictions fail; no post-midpoint opcode is source-selected.',
},null,2));
