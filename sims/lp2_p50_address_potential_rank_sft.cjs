"use strict";
const fs = require("node:fs");
/** @param {{pages:{indices:number[]}[],translit:string[]}} corpus @param {{alphabet:string,pages:{tokens:string[]}[]}} grid */
function run(corpus,grid){
 const mod=x=>(x%29+29)%29, R=n=>Array.from({length:n},(_,i)=>i);
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const ring=[...R(8),...R(31).map(i=>(i+1)*8+7),...R(7).map(i=>31*8+6-i),...R(30).map(i=>(30-i)*8)];
 const path=[...ring,...R(30).flatMap(r=>R(6).map(c=>(r+1)*8+c+1))];
 assert(new Set(path).size===256&&ring.length===76,"frame");
 const C=corpus.pages.slice(55,58).flatMap(p=>p.indices);
 assert(C.length===256&&corpus.pages[56].indices.length===85&&corpus.pages[57].indices.length===95,"terminal corpus");
 const primes=[];for(let n=2;primes.length<84;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let j=0;const d=[...corpus.pages[56].indices.map((_,i)=>i===56?0:mod(primes[j++]-1)),...Array(95).fill(0)];
 const p56=corpus.pages[56].indices.map((x,i)=>mod(x-d[i]));let k=0;
 assert(j===84&&p56.map(x=>x===0?0:mod(x+primes[k++]-1)).every((x,i)=>x===C[76+i])&&k===84,"p56 F-hold replay");
 /** @param {number[][]} M @param {number[]} [rhs] @param {boolean} [track] */
 function reduce(M,rhs,track=false){
  const n=M[0].length,m=M.length;const A=M.map((r,i)=>[...r,...(rhs?[rhs[i]]:[]),...(track?R(m).map(j=>Number(i===j)):[])].map(mod));
  const pivots=[];let k=0;
  for(let j=0;j<n;j++){const h=A.findIndex((r,i)=>i>=k&&r[j]);if(h<0)continue;
   [A[k],A[h]]=[A[h],A[k]];const inv=R(29).find(x=>mod(x*A[k][j])===1);
   for(let z=j;z<A[k].length;z++)A[k][z]=mod(A[k][z]*inv);
   for(let i=0;i<m;i++)if(i!==k&&A[i][j]){const b=A[i][j];for(let z=j;z<A[i].length;z++)A[i][z]=mod(A[i][z]-b*A[k][z]);}
   pivots.push(j);k++;
  }
  const consistent=!rhs||A.slice(k).every(r=>r[n]===0), solution=consistent&&rhs?R(n).map(()=>0):null;
  if(solution)pivots.forEach((v,i)=>solution[v]=A[i][n]);
  return {rank:k,consistent,solution,relations:track?A.slice(k).map(r=>r.slice(n+Number(!!rhs))):[]};
 }
 const dot=(a,b)=>mod(a.reduce((s,v,i)=>s+v*b[i],0));
 const out=[];
 for(const radix of [59,60]){
  const a=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  const addr=grid.pages.flatMap(p=>p.tokens).map(t=>a.indexOf(t[0])*radix+a.indexOf(t[1]));
  assert(addr.length===256&&addr.every(x=>Number.isInteger(x)&&x>=0&&x<256),"address domain");
  for(const model of ["cell","token","gp29","separableRowCol"]){
   const N=model==="gp29"?29:model==="separableRowCol"?40:256;
   const features=i=>model==="separableRowCol"?[Math.floor(i/8),32+i%8]:[model==="cell"?i:model==="token"?addr[i]:i%29];
   const M=path.map(i=>{const row=Array(N+1).fill(0);for(const v of features(i))row[v]++;for(const v of features(addr[i]))row[v]--;row[N]=1;return row;});
   const F=reduce(M.slice(76,161),d.slice(0,85)),K=reduce(M.slice(76),d),A=reduce(M,undefined,true);
   const hidden=R(N+1).map(i=>(i*i+7*i+11)%29),plant=M.map(r=>dot(r,hidden));
   const cp=reduce(M,plant);assert(cp.consistent&&M.every((r,i)=>dot(r,cp.solution)===plant[i]),"planted full-field replay");
   const fixed=[];if(K.consistent)for(let i=0;i<76;i++)if(reduce([...M.slice(76),M[i]]).rank===K.rank)fixed.push(i);
   const relation=A.relations.map(row=>{
    assert(R(N+1).every(j=>dot(row,M.map(r=>r[j]))===0),"left-null certificate");
    return {support:row.flatMap((coef,i)=>coef?[{i,cell:path[i],target:addr[path[i]],coef}]:[]),rhs:mod(dot(row.slice(0,76),C.slice(0,76))+dot(row.slice(76),d))};
   });
   let arbitraryWitnesses=0,adjustedWitnesses=0;
   if(model==="cell"&&K.consistent){
    assert(A.relations.length===Number(radix===60),"conditional dimension");
    let seed=0x9e3779b9;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29;};
    for(let trial=0;trial<32;trial++){
     const p=trial===0?corpus.pages[57].indices.slice(0,76):trial===1?p56.slice(0,76):R(76).map(rng);
     if(A.relations.length){const row=A.relations[0].slice(0,76),i=row.findIndex(Boolean),inv=R(29).find(x=>mod(x*row[i])===1);p[i]=mod(p[i]+inv*(relation[0].rhs-dot(row,p)));adjustedWitnesses++;}
     else arbitraryWitnesses++;
     const want=[...p,...p56,...C.slice(161)],shifts=C.map((x,i)=>mod(x-want[i]));
     const s=reduce(M,shifts);
     assert(s.consistent&&M.every((row,i)=>mod(want[i]+dot(row,s.solution))===C[i]),"original full replay with fabricated p55");
    }
   }
   out.push({radix,model,rankFit:F.rank,augFit:F.rank+Number(!F.consistent),rankKnown:K.rank,augKnown:K.rank+Number(!K.consistent),rankAll:A.rank,conditionalP55Dimension:A.rank-K.rank,heldP57Dimension:K.rank-F.rank,pointwiseP55Fixed:fixed,plantPass:true,relation:model==="cell"?relation:undefined,arbitraryWitnesses,adjustedWitnesses});
  }
 }
 return out;
}
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const grid=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
console.log(JSON.stringify(run(corpus,grid),null,2));
