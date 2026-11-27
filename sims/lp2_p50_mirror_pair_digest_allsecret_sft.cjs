"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const digest="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const raw=Buffer.from(grid.pages.flatMap(p=>p.bytes));
if(crypto.createHash("sha256").update(raw).digest("hex")!=="3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290")throw Error("wrong canonical grid");
/** @param {{pages: Array<{tokens:string[]}>}} grid @param {string} digest */
function run(grid,digest){
 const tokens=grid.pages.flatMap(p=>p.tokens);
 if(tokens.length!==256||!/^[0-9a-f]{128}$/.test(digest))throw Error("invalid source geometry/digest");
 const pairs=Array.from({length:128},(_,i)=>[tokens[8*Math.floor(i/4)+i%4],tokens[8*Math.floor(i/4)+7-i%4]]);
 const vertices=[...new Set(tokens)];
 const key=p=>[...p].sort().join("|");
 const byPair=new Map();
 pairs.forEach((p,i)=>{const k=key(p);if(!byPair.has(k))byPair.set(k,[]);byPair.get(k).push(i)});
 const duplicates=[...byPair].filter(([,idx])=>idx.length>1);
 const adj=new Map(vertices.map(v=>[v,[]]));
 pairs.forEach(([a,b],i)=>{adj.get(a).push([b,i]);adj.get(b).push([a,i])});
 const seen=new Set(),components=[];
 for(const v of vertices){if(seen.has(v))continue;const queue=[v],edges=new Set();seen.add(v);
  for(let i=0;i<queue.length;i++)for(const [w,e] of adj.get(queue[i])){edges.add(e);if(!seen.has(w)){seen.add(w);queue.push(w)}}
  components.push({vertices:queue,edgeCount:edges.size,distinctEdges:new Set([...edges].map(e=>key(pairs[e]))).size});
 }
 components.sort((a,b)=>b.vertices.length-a.vertices.length);
 const results=[];
 for(const reverseRows of [false,true])for(const reversePairs of [false,true]){
  const position=i=>4*(reverseRows?31-Math.floor(i/4):Math.floor(i/4))+(reversePairs?3-i%4:i%4);
  const conflicts=duplicates.map(([pair,idx])=>({pair,sourcePairIndices:idx,targetIndices:idx.map(position),targetChars:idx.map(i=>digest[position(i)])})).filter(x=>new Set(x.targetChars).size>1);
  results.push({reverseRows,reversePairs,conflicts});
 }
 const rowRelaxation=[];
 for(const reverseRows of [false,true]){
  const idx=duplicates[0][1],rows=idx.map(i=>reverseRows?31-Math.floor(i/4):Math.floor(i/4));
  const blocks=rows.map(row=>digest.slice(row*4,row*4+4));
  const compatibleSlots=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(blocks[0][a]===blocks[1][b])compatibleSlots.push([a,b,blocks[0][a]]);
  rowRelaxation.push({reverseRows,rows,blocks,compatibleSlots});
 }
 // Explicit actual-geometry XOR plants: arbitrary injective labels, exact cycle consistency.
 const labels=new Map(vertices.map((v,i)=>[v,(73*i+19)%256]));
 const plant=pairs.map(([a,b])=>labels.get(a)^labels.get(b));
 const changed=plant.slice();changed[duplicates[0][1][1]]^=1;
 const consistent=values=>{const potential=new Map();for(const v of vertices){if(potential.has(v))continue;potential.set(v,0);const q=[v];for(let i=0;i<q.length;i++){const u=q[i];for(const [w,e] of adj.get(u)){const x=potential.get(u)^values[e];if(!potential.has(w)){potential.set(w,x);q.push(w)}else if(potential.get(w)!==x)return false}}}return true};
 const fixed=results.map(x=>{const vals=Array.from({length:128},(_,i)=>{const row=Math.floor(i/4),col=i%4;return digest.charCodeAt(4*(x.reverseRows?31-row:row)+(x.reversePairs?3-col:col))});return {reverseRows:x.reverseRows,reversePairs:x.reversePairs,asciiXorConsistent:consistent(vals),nibbleXorConsistent:consistent(vals.map(v=>parseInt(String.fromCharCode(v),16)))}});
 const capacityPlant=new Map(Array.from({length:16},(_,i)=>[i,0x90|i]));
 const capacityPlantEdges=Array.from({length:15},(_,i)=>capacityPlant.get(i)^capacityPlant.get(i+1));
 const positive=consistent(plant),negative=!consistent(changed),capacityControl=new Set(capacityPlant.values()).size===16&&capacityPlantEdges.every(x=>x<16);
 if(!positive||!negative||!capacityControl||results.some(x=>x.conflicts.length!==1)||fixed.some(x=>x.asciiXorConsistent||x.nibbleXorConsistent)||components[0].vertices.length!==29)throw Error("failed invariant");
 return {vertices:vertices.length,edges:pairs.length,uniquePairs:byPair.size,selfPairs:pairs.filter(([a,b])=>a===b).length,components:components.map(c=>({size:c.vertices.length,edges:c.edgeCount,distinctEdges:c.distinctEdges})),largestVertices:components[0].vertices,duplicates,fixedOrder:results,rowRelaxation,xorConsistency:fixed,nibbleCapacity:{maximumDistinctLabelsPerConnectedComponent:16,actualLargestComponent:components[0].vertices.length,injectivePossible:false},controls:{injectiveByteLabelPlant:positive,changedDuplicateRejected:negative,sixteenVertexNibbleCapacityPlant:capacityControl}};
}
console.log(JSON.stringify(run(grid,digest),null,2));
