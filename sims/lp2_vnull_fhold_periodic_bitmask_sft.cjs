"use strict";
const fs=require("node:fs");
const {edges,encode,makeRng,mod}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
/** Exact known-periodic-key event-boundary reachability, all initial phases or a supplied phase mask. */
function makeReceiver(n,q=8){
 if(q<1||q>29)throw Error("period");
 const all=(1<<q)-1,R=new Uint32Array(n+1),forbidden=new Uint32Array(29),delta=new Uint32Array(q*29);
 const rot=(m,s)=>((m<<s)|(m>>>(q-s)))&all;
 function setKey(k){
  forbidden.fill(0);delta.fill(0);
  for(let ph=0;ph<q;ph++){const bit=1<<ph;forbidden[k[ph]]|=bit;for(let t=0;t<q;t++)delta[t*29+mod(k[(ph+t)%q]-k[ph])]|=bit}
 }
 function reach(C,start=all,supp=1-.664/3.448){
  const n=C.length;if(n>=R.length)throw Error("receiver too short");
  R.fill(0,0,n+1);R[0]=start;let far=0;
  for(let i=0;i<=far&&i<n;i++){
   const m=R[i];if(!m)continue;
   const c=C[i],prev=C[i-1],one=(c===0?m:0)|((c!==prev||supp<1)?rot(m&~forbidden[c],1%q):0);
   if(one){R[i+1]|=one;if(i+1>far)far=i+1}
   if(!supp||!i||c===prev)continue;
   let pending=m&~forbidden[prev];
   for(let t=1;pending&&i+t<n;t++){
    const a=C[i+t],b=C[i+t-1],d=(t%q)*29,terminal=(a!==b||supp<1)?pending&delta[d+mod(a-prev)]:0;
    if(terminal){const end=i+t+1;R[end]|=rot(terminal,(t+1)%q);if(end>far)far=end}
    pending=a!==b?pending&delta[d+mod(b-prev)]:0;
   }
  }
  return {possible:R[n]!==0,longest:far,terminal:R[n]};
 }
 return {setKey,reach,all};
}
function reference(C,k,start,supp){
 const q=k.length,K=Array.from({length:C.length+q},(_,i)=>k[i%q]),R=Array.from({length:C.length+1},()=>new Set());for(let i=0;i<q;i++)if(start&(1<<i))R[0].add(i);
 let far=0;for(let i=0;i<C.length;i++)for(const j of R[i])for(const e of edges(C,K,i,j,supp)){R[e.i].add(e.j%q);far=Math.max(far,e.i)}
 let terminal=0;for(const j of R[C.length])terminal|=1<<j;return {possible:!!terminal,longest:far,terminal};
}
function test(){
 const rng=makeRng(0x47b17),counts={random:0,planted:0,extreme:0};
 for(let q=1;q<=16;q++)for(let i=0;i<100;i++){
  const n=1+rng(200),k=Array.from({length:q},()=>rng(29)),R=makeReceiver(n+100,q);R.setKey(k);
  const K=Array.from({length:n+100},(_,j)=>k[j%q]),s=i%3===0?0:i%3===1?1-.664/3.448:1,plant=i%2===0;
  const C=plant?encode(Array.from({length:n},()=>rng(29)),K,rng,s).C:Array.from({length:n},()=>rng(29)),start=plant?1:1+rng(R.all);
  const a=R.reach(C,start,s),b=reference(C,k,start,s);if(JSON.stringify(a)!==JSON.stringify(b))throw Error(JSON.stringify({q,i,s,start,a,b,C,k}));
  if(plant&&!a.possible)throw Error("plant lost");counts[plant?"planted":"random"]++;if(s===0||s===1)counts.extreme++;
 }
 return counts;
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={makeReceiver,reference,test};
