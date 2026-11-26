"use strict";
const {edges,replay,train,decode:reference,encode,makeRng,mod}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const Q=29,M=30,B=M**3,S=29,SUPP=1-.664/3.448;
const la=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
/** Merge histories whose consuming clocks differ by complete key cycles. */
function decode(C,k,phase,lp,supp=SUPP){
 const n=C.length,q=k.length,K=Array.from({length:n+q},(_,i)=>k[i%q]),D=Array.from({length:n+1},()=>new Map()),start=(S*M+S)*M+S;D[0].set(phase*B+start,{ph:phase,h:start,a:0,u:0,v:0});
 const ul=-Math.log(Q);let states=1;
 for(let i=0;i<n;i++){
  const E=new Map();
  for(const s of D[i].values()){
   let es=E.get(s.ph);if(!es){es=edges(C,K,i,s.ph,supp);E.set(s.ph,es)}
   for(const e of es){
    const ph=e.j%q,h=(s.h%(M*M))*M+e.p,id=ph*B+h,l=lp[s.h*Q+e.p]+e.w,u=ul+e.w;let t=D[e.i].get(id);
    if(!t){t={ph,h,a:-Infinity,u:-Infinity,v:-Infinity};D[e.i].set(id,t);states++}
    t.a=la(t.a,s.a+l);t.u=la(t.u,s.u+u);if(s.v+l>t.v){t.v=s.v+l;t.back=s;t.e=e;t.i=i}
   }
  }
 }
 let A=-Infinity,U=-Infinity,best=null;for(const s of D[n].values()){A=la(A,s.a);U=la(U,s.u);if(!best||s.v>best.v)best=s}
 if(!best)return {possible:false,states};
 const ev=[];for(let s=best;s.back;s=s.back)ev.push(s.e);ev.reverse();
 let j=0,i=0;const events=ev.map(e=>{if(e.kind!=="hold")j+=e.i-i;i=e.i;return {...e,j}});
 replay(C,Array.from({length:n},(_,i)=>k[(phase+i)%q]),events,supp);
 return {possible:true,P:events.map(e=>e.p),events,ll:A/n,bf:(A-U)/n,logEvidence:A,uniformEvidence:U,states};
}
function test(){
 const rng=makeRng(0x47c1c),lp=train([Array.from({length:30000},()=>rng(29))]);let total=0,feasible=0;
 for(let q=1;q<=16;q++)for(let i=0;i<24;i++){
  const n=100+rng(100),k=Array.from({length:q},()=>rng(29)),phase=rng(q),K=Array.from({length:n+100},(_,i)=>k[(phase+i)%q]),s=i%3===0?0:i%3===1?SUPP:1,C=i%2===0?encode(Array.from({length:n},()=>rng(29)),K,rng,s).C:Array.from({length:n},()=>rng(29));
  const a=decode(C,k,phase,lp,s),b=reference(C,K,lp,s);if(a.possible!==b.possible)throw Error("reach disagreement");
  if(a.possible){if(Math.abs(a.logEvidence-b.logEvidence)>1e-7||Math.abs(a.uniformEvidence-b.uniformEvidence)>1e-7)throw Error("evidence disagreement");feasible++}
  total++;
 }
 return {total,feasible};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={decode,test};
