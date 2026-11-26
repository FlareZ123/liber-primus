"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const prior=require("./lp2_unknown_q8_group_anagram_exact_sft.cjs");
const pairs=[];for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)pairs.push([i,j]);
const offsets=[12657,12718,12734,12807,12824];
const id=w=>String.fromCharCode(...w.map(x=>65+x));
const bag=w=>id(w.slice().sort((a,b)=>a-b));
const mod=x=>(x+29)%29;
function canon(K){return Math.min(...K.map((_,i)=>K.slice(i).concat(K.slice(0,i)).reduce((a,b)=>a*29+b,0)));}
function setup(raw,which="original"){
 const db=prior.build(raw),plant=which==="original"?null:prior.makeControl(db,Number(which));
 const full=(plant?plant.rows:db.terminal).filter(x=>x.off>=12657);
 const fit=full.filter(x=>x.off+x.C.length<=12880),hold=full.filter(x=>!fit.includes(x));
 const anchors=offsets.map(o=>fit.find(x=>x.off===o));
 assert.equal(full.length,64);assert.equal(full.flatMap(x=>x.C).length,299);
 assert.equal(fit.length,47);assert.equal(hold.length,17);assert.equal(hold[0].C.length,11);
 assert(anchors.every(x=>x&&x.C.length===8&&!x.C.includes(0)));
 return {db,plant,full,fit,hold,anchors};
}
function runBatch(raw,which="original",from=0,to=80){
 const {db,plant,full,fit,hold,anchors}=setup(raw,which);
 const results=[];for(let i=from;i<to;i++)results.push(prior.pairShift(db,fit,anchors,pairs[i>>3],i&7,3));
 const candidates=[...new Map(results.flatMap(r=>r.survivors).map(o=>[o.n,o])).values()];
 // Only fit nominates keys. Held-out diagnostics are emitted after this freeze.
 const evaluated=candidates.map(o=>{
  const ds=hold.map(x=>prior.domain(x.C,o.K,db.multisets,false));
  const fitDomains=fit.map(x=>prior.domain(x.C,o.K,db.multisets,false));
  const totalMissing=fitDomains.filter(x=>!x.length).length+ds.filter(x=>!x.length).length;
  const edges=full.map(x=>prior.domain(x.C,o.K,db.multisets,false));
  let phase=new Set([0,1,2,3,4,5,6,7]);
  for(const D of edges){if(!D.length){if(phase.size)phase=new Set([0,1,2,3,4,5,6,7]);}else phase=new Set(D.filter(e=>phase.has(e.s)).map(e=>e.t));}
  return {...o,totalMissing,holdCovered:ds.filter(d=>d.length).length,
   holdTrueBags:plant?ds.filter((d,i)=>d.some(e=>e.b===bag(hold[i].P))).length:null,
   holdUnique:ds.filter(d=>new Set(d.flatMap(e=>e.words)).size===1).length,
   optimisticContinuous:phase.size>0};
 });
 let control=null;if(plant){
  const truth=canon(plant.K);
  const trueEdges=full.filter(x=>prior.domain(x.C,plant.K,db.multisets,false).some(e=>e.s===x.s&&e.t===x.t&&e.b===bag(x.P))).length;
  assert.equal(trueEdges,64);
  control={truth,key:plant.K,trueEdges,matched:evaluated.some(o=>o.n===truth)};
 }
 return {which,from,to,fitGroups:fit.length,holdGroups:hold.length,anchorOffsets:offsets,results,evaluated,control};
}
if(require.main===module){const args=process.argv.slice(2);const raw=prior.files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));console.log(JSON.stringify(runBatch(raw,args[0]||"original",Number(args[1]||0),Number(args[2]||80))));}
module.exports={runBatch,setup};
