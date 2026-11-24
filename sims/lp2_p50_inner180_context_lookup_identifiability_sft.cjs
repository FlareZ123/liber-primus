"use strict";
// Agent 7 — exact conditional p50 terminal lookup identifiability.
// Node 22 CommonJS. Run from the repository: node sims/lp2_p50_inner180_context_lookup_identifiability_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
function experiment(corpus, grid){
  const mod=x=>(x%29+29)%29;
  function check(v,m){if(!v)throw Error(m)}
  check(grid.length===32&&grid.every(r=>r.length===8),"grid dimensions");
  const G=grid.flat(), pages=corpus.pages;
  let primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p))primes.push(n);
  let clock=0;const p56=pages.find(p=>p.page===56).indices.map((x,i)=>i===56?0:mod(x-(primes[clock++]-1)));
  check(clock===84&&pages.find(p=>p.page===56).indices[56]===0,"native F hold");
  check(p56.map(x=>corpus.translit[x]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","authentic p56 inverse");
  const P=p56.concat(pages.find(p=>p.page===57).indices);
  const I=G.map((_,i)=>i).filter(i=>i>=8&&i<248&&i%8>0&&i%8<7),O=G.map((_,i)=>i).filter(i=>!I.includes(i));
  check(P.length===180&&I.length===180&&O.length===76,"partition");
  /** @param {number} n @returns {{add:(row:number[])=>void,reduce:(row:number[])=>number[],rank:()=>number,bad:()=>number,solution:()=>number[]}} */
  function linear(n){
    const basis=new Map();let bad=0;
    function reduce(row){const r=row.slice();for(let j=0;j<n;j++)if(r[j]&&basis.has(j)){const k=r[j],q=basis.get(j);for(let i=j;i<=n;i++)r[i]=mod(r[i]-k*q[i]);}return r;}
    return {add(row){const r=reduce(row);const j=r.findIndex((v,i)=>i<n&&v);if(j<0){if(r[n])bad++;return;}let inv=1;while(mod(r[j]*inv)!==1)inv++;for(let i=j;i<=n;i++)r[i]=mod(r[i]*inv);basis.set(j,r);},reduce,rank:()=>basis.size,bad:()=>bad,solution(){check(!bad,"inconsistent");let x=Array(n).fill(0);for(let j=n-1;j>=0;j--)if(basis.has(j)){const r=basis.get(j);x[j]=mod(r[n]-r.slice(j+1,n).reduce((s,a,k)=>s+a*x[j+1+k],0));}return x;}};
  }
  const output=[];
  for(const raw of [false,true])for(const mode of ["cropped","physical"])for(const geo of [false,true]){
    const N=raw?256:29,n=2*N+(geo?8:0),map=x=>raw?x:x%29;
    function row(idx,prev){const r=Array(n+1).fill(0);r[map(G[idx])]=1;r[N+map(G[prev])]=1;if(geo)r[2*N+idx%8]=1;return r;}
    const A=I.flatMap((idx,i)=>mode==="cropped"&&(i===0||i===85)?[]:[{r:row(idx,mode==="cropped"?I[i-1]:idx-1),v:P[i]}]);
    const E=O.map((idx,i)=>row(idx,mode==="cropped"?O[(i+75)%76]:(idx+255)%256));
    const build=(data)=>{const s=linear(n);for(const {r,v} of data){const q=r.slice();q[n]=v;s.add(q);}return s;};
    const dot=(r,x)=>mod(r.slice(0,n).reduce((s,v,i)=>s+v*x[i],0));
    const s=build(A),rank=s.rank(),bad=s.bad();const plant=Array.from({length:n},(_,i)=>mod(7*i*i+3*i+11));
    const planted=build(A.map(({r})=>({r,v:dot(r,plant)})));
    check(!planted.bad(),"positive consistency");let predicted=0;
    for(const r of E){const q=planted.reduce(r);if(q.slice(0,n).every(v=>!v)){predicted++;check(mod(-q[n])===dot(r,plant),"positive exact outer prediction");}}
    const all=build(A.map(({r})=>({r,v:0})));for(const r of E)all.add(r);const dim=all.rank()-rank;
    let constructions=0;
    if(!bad){
      for(const target of [Array(76).fill(0),pages.find(p=>p.page===55).indices,Array.from({length:76},(_,i)=>mod(i*i+13*i+7))]){
        const equations=A.concat(E.map((r,i)=>({r,v:target[i]})));const complete=build(equations);check(!complete.bad(),"prescribed perimeter impossible");const x=complete.solution();check(equations.every(({r,v})=>dot(r,x)===v),"back-substitution failed");constructions++;
      }
    }
    const expected=raw?(mode==="cropped"?[178,0,76,0]:[180,0,76,0]):mode==="cropped"?(geo?[62,115,5,12]:[57,119,0,76]):(geo?[62,116,5,12]:[57,115,0,76]);
    check(rank===expected[0]&&bad===expected[1]&&predicted===expected[3],"frozen original rank/control mismatch");
    if(raw)check(dim===76&&constructions===3,"full output freedom");
    output.push({raw,mode,geo,parameters:n,innerEquations:A.length,rank,contradictions:bad,outerDimension:dim,plantPredicted:predicted,constructions});
  }
  return output;
}
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/base60-grid.json").byte_rows),null,2));
