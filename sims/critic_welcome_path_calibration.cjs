// Critic audit of known-key WELCOME F-hold path ambiguity (post hoc).
// Run from repository root with node.
"use strict";
const fs=require("node:fs");
const read=p=>fs.readFileSync(p,"utf8");
const A=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const G=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ix=new Map(A.runes.map((x,i)=>[x,i]));
const seq=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x));
const C=seq(read("resources/transcriptions/lp1_wulfic_canonical.txt").split("$")[1]);
const P=seq(G.sections[1].source_text);
const K=C.slice(0,8).map((x,i)=>(x-P[i]+29)%29);
const L=8,N=C.length;
const edges=(t,k)=>{
  const p=(C[t]-K[k]+29)%29;
  return [...(C[t]===0?[[0,k]]:[]),...(p!==0?[[p,(k+1)%L]]:[])];
};
const B=Array.from({length:N+1},()=>Array(L).fill(0n));
B[N].fill(1n);
for(let t=N-1;t>=16;t--)for(let k=0;k<L;k++)
  for(const [,j] of edges(t,k)) B[t][k]+=B[t+1][j];
const paths=[],path=[];
function walk(t,k){
  if(t===N){paths.push(path.slice());return;}
  for(const [p,j] of edges(t,k))if(B[t+1][j]){
    path.push(p);walk(t+1,j);path.pop();
  }
}
walk(16,0);
const forced=Array.from({length:N-16},(_,t)=>new Set(paths.map(p=>p[t])).size)
  .filter(n=>n===1).length;
function evaluate(ids,order,alpha){
  const size=29**(order-1),counts=new Float64Array(size*29),totals=new Float64Array(size);
  for(const id of ids){
    const s=seq(G.sections[id].source_text);
    for(let i=order-1;i<s.length;i++){
      let ctx=0;
      for(let j=i-order+1;j<i;j++)ctx=ctx*29+s[j];
      counts[ctx*29+s[i]]++;totals[ctx]++;
    }
  }
  const log=counts.map((n,i)=>Math.log((n+alpha)/(totals[Math.floor(i/29)]+alpha*29)));
  let goldScore=-Infinity;
  const scores=paths.map(p=>{
    const full=P.slice(0,16).concat(p);
    let s=0,m=0;
    for(let t=16;t<N;t++){
      let ctx=0;
      for(let j=t-order+1;j<t;j++)ctx=ctx*29+full[j];
      s+=log[ctx*29+full[t]];
      if(full[t]!==P[t])m++;
    }
    if(m===0)goldScore=s;
    return {s,m};
  }).sort((a,b)=>b.s-a.s);
  return {ids,order,alpha,top:scores[0],second:scores[1],
    goldRank:1+scores.filter(x=>x.s>goldScore+1e-9).length,
    margin:scores[0].s-scores[1].s};
}
const models=[];
for(const ids of [[0,2,3,4,6,7,8],[0,2,3,4,6],[0,2,4,6],[7,8]])
  for(const order of [1,2,3])models.push(evaluate(ids,order,0.1));
const d=C.slice(0,16).map((v,i)=>(v-P[i]+29)%29);
const cribPeriods=[8,9,10,11,12,13,14,15,16].map(n=>({
  n,periods:Array.from({length:Math.min(n,13)},(_,i)=>i+1)
    .filter(k=>d.slice(0,n).every((x,i)=>x===d[i%k]))
}));
console.log(JSON.stringify({key:K.map(i=>A.translit[i]),paths:paths.length,
  forced,ambiguous:N-16-forced,models,cribPeriods},null,2));
