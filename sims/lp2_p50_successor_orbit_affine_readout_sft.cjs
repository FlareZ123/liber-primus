"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus,grid){
 const mod=x=>((x%29)+29)%29;
 const inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const assert=(b,m)=>{if(!b)throw Error(m)};
 /** Exact elimination over GF(29); zero free variables give one representative. */
 function solve(X,y){
  const n=X[0].length,A=X.map((row,i)=>[...row.map(mod),mod(y[i])]);let rank=0;const pivots=[];
  for(let j=0;j<n&&rank<A.length;j++){let k=rank;while(k<A.length&&!A[k][j])k++;if(k===A.length)continue;[A[k],A[rank]]=[A[rank],A[k]];const s=inv(A[rank][j]);A[rank]=A[rank].map(v=>mod(v*s));for(let i=0;i<A.length;i++)if(i!==rank&&A[i][j]){const t=A[i][j];A[i]=A[i].map((v,l)=>mod(v-t*A[rank][l]))}pivots.push(j);rank++}
  const inconsistent=A.some(row=>row.slice(0,n).every(v=>v===0)&&row[n]!==0);const coeff=Array(n).fill(0);pivots.forEach((j,i)=>coeff[j]=A[i][n]);
  const basis=A.slice(0,rank).map(row=>row.slice(0,n));
  const determined=row=>{let v=row.slice();pivots.forEach((j,i)=>{const t=v[j];if(t)v=v.map((x,k)=>mod(x-t*basis[i][k]))});return v.every(x=>x===0)};
  return {rank,inconsistent,coeff,determined};
 }
 const dot=(a,b)=>mod(a.reduce((s,v,i)=>s+v*b[i],0));
 const p55=corpus.pages[55].indices,p56=corpus.pages[56].indices,p57=corpus.pages[57].indices;
 assert(p55.length===76&&p56.length===85&&p57.length===95,"page size");
 const primes=[];for(let x=2;primes.length<85;x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
 let j=0;const plain56=p56.map((v,i)=>i===56?0:mod(v-primes[j++]+1));
 assert(j===84&&p56[56]===0&&plain56.slice(0,5).map(v=>corpus.translit[v]).join("")==="ANEND","p56 decode");
 const tokens=grid.pages.flatMap(p=>p.tokens);assert(tokens.length===256,"grid count");
 const rim=[];for(let c=0;c<8;c++)rim.push(c);for(let r=1;r<32;r++)rim.push(8*r+7);for(let c=6;c>=0;c--)rim.push(248+c);for(let r=30;r>=1;r--)rim.push(8*r);
 const inner=[];for(let r=1;r<31;r++)for(let c=1;c<7;c++)inner.push(r*8+c);assert(new Set([...rim,...inner]).size===256,"partition");
 const layouts={row:[...Array(256).keys()],rim:[...rim,...inner]},out=[];
 for(const radix of [59,60]){
  const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  const f=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
  assert(f.every(v=>v>=0&&v<256),"valid addresses");
  let col=[...Array(256).keys()];const cols=[],seen=new Map();let start;
  for(;;){const key=col.join(",");if(seen.has(key)){start=seen.get(key);break}seen.set(key,cols.length);cols.push(col);col=col.map(v=>f[v]);}
  const X=Array.from({length:256},(_,i)=>[1,...cols.map(v=>mod(v[i]))]);
  for(const [layout,order] of Object.entries(layouts)){
   const R=order.map(i=>X[i]),a=R.slice(76,161),b=R.slice(161);
   const fit56=solve(a,plain56),fit57=solve(b,p57),joint=solve([...a,...b],[...plain56,...p57]),printed=solve([...a,...b],[...p56,...p57]);
   const coeff=Array.from({length:X[0].length},(_,i)=>mod(i*i+7*i+11));
   const plant=R.map(row=>dot(row,coeff)),control=solve(a,plant.slice(76,161)),combined=solve([...a,...b],plant.slice(76));
   assert(!control.inconsistent&&!combined.inconsistent,"positive fit");
   for(const row of R){if(combined.determined(row))assert(dot(row,combined.coeff)===dot(row,coeff),"determined prediction");}
   assert(fit56.inconsistent&&fit57.inconsistent&&joint.inconsistent&&printed.inconsistent,"original consistency changed");
   out.push({radix,layout,orbitColumns:cols.length,cycleStart:start,cyclePeriod:cols.length-start,featureCount:X[0].length,fullRank:solve(R,Array(256).fill(0)).rank,fit56:{rank:fit56.rank,inconsistent:fit56.inconsistent},fit57:{rank:fit57.rank,inconsistent:fit57.inconsistent},joint:{rank:joint.rank,inconsistent:joint.inconsistent},printed:{rank:printed.rank,inconsistent:printed.inconsistent},control:{rank:control.rank,holdoutCorrect:b.filter((row,i)=>dot(row,control.coeff)===plant[i+161]).length,holdoutDetermined:b.filter(control.determined).length,unknownCorrect:R.slice(0,76).filter((row,i)=>dot(row,combined.coeff)===plant[i]).length,unknownDetermined:R.slice(0,76).filter(combined.determined).length,jointRank:combined.rank}});
  }
 }
 return {p56:plain56.map(v=>corpus.translit[v]).join(""),cases:out};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-grid-256.json")),null,2));
