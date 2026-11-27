#!/usr/bin/env node
"use strict";
/*
  Director #3247: radix-free literal two-character p50 transition graph.
  Reads only literal token characters and printed 32x8 geometry.
  No radix/value conversion is used.
*/
const fs=require("fs");
const path=require("path");
const src=path.resolve(__dirname,"../resources/liber-primus/base60-grid.json");
const data=JSON.parse(fs.readFileSync(src,"utf8"));
const rows=data.rows, flat=rows.flat(), N=flat.length;
if(rows.length!==32 || rows.some(r=>r.length!==8) || N!==256) throw new Error("unexpected grid geometry");

function metrics(arr){
  let fwd=0,rev=0,boundaryF=0,boundaryR=0,maxF=1,maxR=1,mirrorRecip=0,mirrorSame=0;
  const fwdPairs=[],revPairs=[];
  for(let r=0;r<32;r++){
    let cf=1,cr=1;
    for(let c=0;c<7;c++){
      const a=arr[r*8+c], b=arr[r*8+c+1];
      if(a[1]===b[0]){fwd++;cf++;maxF=Math.max(maxF,cf);fwdPairs.push({r,c,a,b,via:a[1]});} else cf=1;
      if(a[0]===b[1]){rev++;cr++;maxR=Math.max(maxR,cr);revPairs.push({r,c,a,b,via:a[0]});} else cr=1;
    }
    for(let c=0;c<4;c++){
      const a=arr[r*8+c], b=arr[r*8+7-c];
      if(a===b) mirrorSame++;
      if(a[0]===b[1] && a[1]===b[0]) mirrorRecip++;
    }
    if(r<31){
      const a=arr[r*8+7], b=arr[(r+1)*8];
      if(a[1]===b[0]) boundaryF++;
      if(a[0]===b[1]) boundaryR++;
    }
  }
  return {fwd,rev,boundaryF,boundaryR,maxF,maxR,mirrorRecip,mirrorSame,fwdPairs,revPairs};
}
const obs=metrics(flat);

const V=[...new Set(flat.flatMap(t=>[t[0],t[1]]))].sort();
const adj=Object.fromEntries(V.map(v=>[v,[]]));
const out=Object.fromEntries(V.map(v=>[v,0]));
const inn=Object.fromEntries(V.map(v=>[v,0]));
const mult={};
for(const t of flat){adj[t[0]].push(t[1]);out[t[0]]++;inn[t[1]]++;mult[t]=(mult[t]||0)+1;}

let ti=0,stack=[],on=new Set(),I={},L={},comps=[];
function tarjan(v){
  I[v]=L[v]=ti++;stack.push(v);on.add(v);
  for(const w of adj[v]){
    if(I[w]===undefined){tarjan(w);L[v]=Math.min(L[v],L[w]);}
    else if(on.has(w)) L[v]=Math.min(L[v],I[w]);
  }
  if(L[v]===I[v]){
    const c=[]; while(true){const w=stack.pop();on.delete(w);c.push(w);if(w===v)break;}
    comps.push(c.sort());
  }
}
for(const v of V) if(I[v]===undefined) tarjan(v);
comps.sort((a,b)=>b.length-a.length||a[0].localeCompare(b[0]));
const deltas=V.map(v=>({v,out:out[v],in:inn[v],delta:out[v]-inn[v]}));
const eulerCycle=deltas.every(x=>x.delta===0);
const eulerTrail=deltas.filter(x=>x.delta===1).length===1 &&
                 deltas.filter(x=>x.delta===-1).length===1 &&
                 deltas.every(x=>Math.abs(x.delta)<=1);

let orderedF=0,orderedR=0,orderedSame=0,orderedRecip=0;
for(let i=0;i<N;i++) for(let j=0;j<N;j++) if(i!==j){
  const a=flat[i],b=flat[j];
  if(a[1]===b[0]) orderedF++;
  if(a[0]===b[1]) orderedR++;
  if(a===b) orderedSame++;
  if(a[0]===b[1]&&a[1]===b[0]) orderedRecip++;
}
const denom=N*(N-1), pF=orderedF/denom, pR=orderedR/denom, pSame=orderedSame/denom, pRecip=orderedRecip/denom;
const exactExpectation={
  fwd:224*pF,rev:224*pR,boundaryF:31*pF,boundaryR:31*pR,
  mirrorSame:128*pSame,mirrorRecip:128*pRecip,pF,pR,pSame,pRecip,
  orderedF,orderedR,orderedSame,orderedRecip
};

let seed=0x3247c0de>>>0;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
const B=100000, keys=["fwd","rev","boundaryF","boundaryR","mirrorRecip","mirrorSame"];
const nullCounts=Object.fromEntries(keys.map(k=>[k,{eq:0,le:0,ge:0,min:1e9,max:-1}]));
const a=flat.slice();
for(let b=0;b<B;b++){
  for(let i=N-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  const m=metrics(a);
  for(const k of keys){
    const q=nullCounts[k],v=m[k],o=obs[k];
    if(v===o)q.eq++; if(v<=o)q.le++; if(v>=o)q.ge++;
    q.min=Math.min(q.min,v); q.max=Math.max(q.max,v);
  }
}
for(const k of keys){
  const q=nullCounts[k];
  q.p_le=(q.le+1)/(B+1); q.p_ge=(q.ge+1)/(B+1);
  q.p_two=Math.min(1,2*Math.min(q.p_le,q.p_ge));
  delete q.le; delete q.ge;
}
const repHist={}; for(const n of Object.values(mult)) repHist[n]=(repHist[n]||0)+1;
const result={
  schema:1,issue:3247,source:sourcePath,geometry:[32,8],token_count:N,
  graph:{
    vertex_count:V.length,
    vertices:V,
    source_vertices:V.filter(v=>out[v]>0),
    sink_only_vertex_count:V.filter(v=>out[v]===0&&inn[v]>0).length,
    nontrivial_sccs:comps.filter(c=>c.length>1),
    scc_sizes:comps.map(c=>c.length),
    euler_cycle:eulerCycle,euler_trail:eulerTrail,
    repeated_edge_histogram:repHist,
    max_edge_multiplicity:Math.max(...Object.values(mult)),
    digit_internal_edge_count:flat.filter(t=>"01234".includes(t[0])&&"01234".includes(t[1])).length
  },
  observed:obs,
  exact_expectation:exactExpectation,
  permutation_null:{draws:B,seed_hex:"0x3247c0de",preserves:"exact 256-token multiset and fixed 32x8 adjacency/mirror geometry",statistics:nullCounts},
  decision:"negative: no exceptional exact literal-edge grammar; do not instantiate adjacent receiver"
};
if(obs.fwd!==3||obs.rev!==1||obs.boundaryF!==0||obs.boundaryR!==1||obs.mirrorRecip!==0||obs.mirrorSame!==0) throw new Error("observation regression");
if(V.length!==59||result.graph.sink_only_vertex_count!==54||JSON.stringify(result.graph.nontrivial_sccs)!=='[["0","4"]]') throw new Error("graph regression");
process.stdout.write(JSON.stringify(result,null,2)+"\n");
