"use strict";
/** Original terminal 128+128 known-pair inverse with independent secret alphabet maps and row/column shifts. */
const fs=require("node:fs"),path=require("node:path");
function experiment(gp,grid){
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,j)=>j+1).find(z=>mod(x*z)===1):0);
 const cipher56=gp.pages.find(p=>p.page===56).indices,Q=gp.pages.find(p=>p.page===57).indices;
 const primes=[];for(let p=2;primes.length<84;p++)if(!primes.some(q=>p%q===0))primes.push(p);
 let j=0;const P=cipher56.map((x,i)=>i===56?0:mod(x-primes[j++]+1));j=0;
 assert(cipher56.every((x,i)=>i===56?x===0:x===mod(P[i]+primes[j++]-1)),"native p56 replay");
 const data=grid.pages.flatMap(p=>p.tokens);
 assert(P.length===85&&Q.length===95&&data.length===256&&grid.pages.map(x=>x.rows).join()==="10,13,9","source shape");
 /** Exact echelon reduction with original row-combination certificates.
  * @param {number[][]} rows
  * @param {number} n
  */
 function eliminate(rows,n){
  const b=new Map();let first=null,violations=0;
  for(let i=0;i<rows.length;i++){
   let v=rows[i].slice(),w=new Uint8Array(rows.length);w[i]=1;
   for(let k=0;k<n;k++){
    if(!v[k])continue;const p=b.get(k);
    if(!p){const z=inv[v[k]];v=v.map(x=>mod(x*z));w=w.map(x=>mod(x*z));b.set(k,{v,w});break;}
    const f=v[k];v=v.map((x,j)=>mod(x-f*p.v[j]));w=w.map((x,j)=>mod(x-f*p.w[j]));
   }
   if(v.slice(0,n).every(x=>x===0)&&v[n]!==0){
    violations++;const reconstructed=Array.from({length:n+1},(_,k)=>mod(rows.reduce((s,r,j)=>s+w[j]*r[k],0)));
    assert(reconstructed.slice(0,n).every(x=>x===0)&&reconstructed[n]===v[n],"exact inconsistency certificate");
    if(!first)first={prefix:i+1,residual:v[n],terms:[...w].flatMap((x,j)=>x?[[j+43,x]]:[])};
   }
  }
  const x=Array(n).fill(0);for(let k=n-1;k>=0;k--){const p=b.get(k);if(p)x[k]=mod(p.v[n]-p.v.slice(k+1,n).reduce((s,z,j)=>s+z*x[k+1+j],0));}
  if(!first)assert(rows.every(r=>mod(r.slice(0,n).reduce((s,z,j)=>s+z*x[j],0))===r[n]),"consistent inverse");
  /** @param {number[]} row */
  function predict(row){
   let c=row.slice(0,n),y=0;
   for(let k=0;k<n;k++){if(!c[k])continue;const p=b.get(k);if(!p)return null;const f=c[k];c=c.map((z,j)=>mod(z-f*p.v[j]));y=mod(y+f*p.v[n]);}
   return y;
  }
  return {rank:b.size,violations,first,x:first?null:x,predict};
 }
 /** @param {number} seed */
 function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};}
 /** @param {()=>number} rand */
 function perm(rand){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const out=[];
 for(const radix of [59,60]){
  const alph=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  const v=data.map(s=>alph.indexOf(s[0])*radix+alph.indexOf(s[1]));
  assert(v.every(x=>x>=0&&x<256),"byte domain");
  for(const reflect of [false,true])for(const plain56 of [true,false]){
   const p=plain56?P:cipher56,n=82;
   const rows=Array.from({length:85},(_,i)=>{const pos=i+43,z=reflect?(pos^7):pos,row=Array(n+1).fill(0);row[p[i]]=1;row[29+Q[i+10]]=28;row[58+pos%8]=1;row[66+(pos>>3)]=1;row[n]=mod(v[pos]-v[128+z]);return row});
   const result=eliminate(rows,n);
   assert(result.first,"original unexpectedly consistent; investigate before reporting");
   const rand=rng(190000+radix*100+Number(reflect)*10+Number(plain56));
   const left=perm(rand),right=perm(rand),shifts=Array.from({length:24},()=>rand()%29),secret=[...left,...right,...shifts];
   const plantedBytes=Array(256).fill(0);
   const lift=x=>x+29*(rand()%(Math.floor((255-x)/29)+1));
   for(let i=0;i<85;i++){
     const pos=i+43,z=reflect?(pos^7):pos,K=rand()%29;
     const cl=mod(left[p[i]]+K+shifts[pos%8]+shifts[8+(pos>>3)]),cr=mod(right[Q[i+10]]+K);
     plantedBytes[pos]=lift(cl);plantedBytes[128+z]=lift(cr);
   }
   const plant=rows.map((row,i)=>{
     const pos=i+43,z=reflect?(pos^7):pos;
     return [...row.slice(0,n),mod(plantedBytes[pos]-plantedBytes[128+z])];
   });
   const c=eliminate(plant,n),fit=eliminate(plant.slice(0,60),n),bad=plant.map(row=>row.slice());
   const held=plant.slice(60).map(row=>({predicted:fit.predict(row),actual:row[n]}));
   const predictable=held.filter(x=>x.predicted!==null);
   assert(predictable.every(x=>x.predicted===x.actual),"locked independent holdout prediction");
   const k=rows.findIndex((_,i)=>i>=65&&eliminate(plant.slice(0,i+1),n).rank===eliminate(plant.slice(0,i),n).rank);
   assert(k>=65,"redundant test position");bad[k][n]=mod(bad[k][n]+1);
   const neg=eliminate(bad,n);
   assert(!c.first&&neg.first&&plant.every(row=>mod(row.slice(0,n).reduce((s,z,j)=>s+z*secret[j],0))===row[n]),"calibration");
   out.push({radix,reflect,plain56,rank:result.rank,violations:result.violations,first:result.first,plantRank:c.rank,plantFits:85,fitRank:fit.rank,heldTotal:25,heldPredictable:predictable.length,heldCorrect:predictable.filter(x=>x.predicted===x.actual).length,negativeAlteredPosition:k+43,negativeDetectedAt:neg.first.prefix});
  }
 }
 return {known:[P.length,Q.length],hypothesis:"independent GP29 maps, shared arbitrary pad, arbitrary row and column relative shift; additive mod29",results:out};
}
if(require.main===module){const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",f),"utf8"));console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-grid-256.json")),null,2));}
module.exports={experiment};
