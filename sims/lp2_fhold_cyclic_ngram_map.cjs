"use strict";
/**
 * Exact cyclic n-gram optimization for a GP29 periodic additive key conditional
 * on a specified plaintext-F hold mask. No printed word boundaries.
 * q>=3; order 2 or 3. Each score factor spans consecutive consuming phases.
 */
const MOD=29,ALL=(1<<29)-1,mod=x=>(x%MOD+MOD)%MOD;
const inv=a=>{if(!Number.isInteger(a)||a<1||a>28)throw Error('nonzero slope required');return Array.from({length:28},(_,i)=>i+1).find(i=>mod(i*a)===1)};
const logadd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
/** @param {number[]} C @param {number} q @param {number} mask */
function fixedMask(C,q,mask){
 const phase=new Int16Array(C.length),allowed=Array(q).fill(ALL);let active=0,zero=0;
 for(let i=0;i<C.length;i++){const c=C[i];if(c===0&&((mask>>>zero++)&1)){phase[i]=-1;continue}const ph=active++%q;phase[i]=ph;allowed[ph]&=ALL^(1<<c);if(!allowed[ph])return null}
 const domains=allowed.map(m=>Array.from({length:29},(_,i)=>i).filter(v=>m&(1<<v)));
 return {phase,domains,endPhase:active%q,holds:zero?C.length-active:0};
}
/** @param {number[]} C @param {number} q @param {{phase:Int16Array,domains:number[][]}} state @param {{uni:Float64Array,bi:Float64Array,tri:Float64Array}} lm @param {2|3} order */
function factors(C,q,state,lm,order,a=1){
 const ai=inv(a);
 const {phase,domains}=state,D=domains.map(a=>a.length),U=D.map(n=>new Float64Array(n)),B=D.map((n,j)=>new Float64Array(n*D[(j+1)%q])),T=order===3?D.map((n,j)=>new Float64Array(n*D[(j+1)%q]*D[(j+2)%q])):null;
 const values=C.map((c,i)=>phase[i]<0?[0]:domains[phase[i]].map(k=>mod(ai*(c-k))));
 let constant=0;
 for(let i=0;i<C.length;i++){const n=Math.min(i+1,order),start=i-n+1,ph=Array.from(phase.slice(start,i+1)).filter(v=>v>=0),m=ph.length;
  if(!m){constant+=(n===1?lm.uni[0]:n===2?lm.bi[0]:lm.tri[0]);continue}
  const j=ph[0],out=m===1?U[j]:m===2?B[j]:T[j],v0=values[start],v1=n>=2?values[start+1]:null,v2=n===3?values[start+2]:null;
  if(n===1){for(let a=0;a<v0.length;a++)out[a]+=lm.uni[v0[a]]}
  else if(n===2){let idx=0;for(let a=0;a<v0.length;a++)for(let b=0;b<v1.length;b++)out[idx++]+=lm.bi[v0[a]*29+v1[b]]}
  else {let idx=0;for(let a=0;a<v0.length;a++)for(let b=0;b<v1.length;b++)for(let c=0;c<v2.length;c++)out[idx++]+=lm.tri[(v0[a]*29+v1[b])*29+v2[c]]}
  // Held positions have dimension1, so row-major indexing exactly removes them.
 }
 if(order===2){for(let j=0;j<q;j++)for(let a=0;a<D[j];a++)for(let b=0;b<D[(j+1)%q];b++)B[j][a*D[(j+1)%q]+b]+=U[j][a];return {D,F:B,constant}}
 for(let j=0;j<q;j++){const db=D[(j+1)%q],dc=D[(j+2)%q],t=T[j];let idx=0;for(let a=0;a<D[j];a++)for(let b=0;b<db;b++){const score=U[j][a]+B[j][a*db+b];for(let c=0;c<dc;c++)t[idx++]+=score}}
 return {D,F:T,constant};
}
/** Exact MAP for the closed cycle; condition on one or two smallest adjacent domains. */
function optimize(state,fac,order){
 const q=fac.D.length,D=fac.D,F=fac.F;let r=0;
 for(let j=1;j<q;j++)if((order===2?D[j]:D[j]*D[(j+1)%q])<(order===2?D[r]:D[r]*D[(r+1)%q]))r=j;
 const d=Array.from({length:q},(_,j)=>D[(r+j)%q]),f=Array.from({length:q},(_,j)=>F[(r+j)%q]);let best=-Infinity,chosen=null;
 function run2(a,trace){let dp=new Float64Array(d[0]).fill(-Infinity);dp[a]=0;const back=[];
  for(let i=1;i<q;i++){const next=new Float64Array(d[i]).fill(-Infinity),prev=trace?new Int16Array(d[i]).fill(-1):null,ff=f[i-1];
   for(let p=0;p<d[i-1];p++){const x=dp[p];if(x===-Infinity)continue;const off=p*d[i];for(let c=0;c<d[i];c++){const y=x+ff[off+c];if(y>next[c]){next[c]=y;if(trace)prev[c]=p}}}
   dp=next;if(trace)back[i]=prev
  }let score=-Infinity,end=-1;for(let p=0;p<d[q-1];p++){const y=dp[p]+f[q-1][p*d[0]+a];if(y>score){score=y;end=p}}
  if(!trace)return {score,end};const idx=Array(q);idx[q-1]=end;for(let i=q-1;i>0;i--)idx[i-1]=back[i][idx[i]];return {score,idx}
 }
 function run3(a,b,trace){let dp=new Float64Array(d[0]*d[1]).fill(-Infinity);dp[a*d[1]+b]=0;const back=[];
  for(let i=2;i<q;i++){const da=d[i-2],db=d[i-1],dc=d[i],next=new Float64Array(db*dc).fill(-Infinity),prev=trace?new Int16Array(db*dc).fill(-1):null,ff=f[i-2];
   for(let p=0;p<da;p++)for(let t=0;t<db;t++){const idx=p*db+t,x=dp[idx];if(x===-Infinity)continue;const off=idx*dc,out=t*dc;for(let c=0;c<dc;c++){const y=x+ff[off+c];if(y>next[out+c]){next[out+c]=y;if(trace)prev[out+c]=p}}}
   dp=next;if(trace)back[i]=prev
  }let score=-Infinity,endA=-1,endB=-1;const da=d[q-2],db=d[q-1];for(let p=0;p<da;p++)for(let t=0;t<db;t++){const y=dp[p*db+t]+f[q-2][(p*db+t)*d[0]+a]+f[q-1][(t*d[0]+a)*d[1]+b];if(y>score){score=y;endA=p;endB=t}}
  if(!trace)return {score};const idx=Array(q);idx[q-2]=endA;idx[q-1]=endB;for(let i=q-1;i>=2;i--)idx[i-2]=back[i][idx[i-1]*d[i]+idx[i]];return {score,idx}
 }
 if(order===2){for(let a=0;a<d[0];a++){const v=run2(a,false);if(v.score>best){best=v.score;chosen=[a]}}}
 else for(let a=0;a<d[0];a++)for(let b=0;b<d[1];b++){const v=run3(a,b,false);if(v.score>best){best=v.score;chosen=[a,b]}}
 const result=order===2?run2(chosen[0],true):run3(chosen[0],chosen[1],true),key=Array(q);
 for(let i=0;i<q;i++){const j=(r+i)%q;key[j]=state.domains[j][result.idx[i]]}return {key,score:result.score+fac.constant};
}
function plainFor(C,state,key,a=1){const ai=inv(a);return C.map((c,i)=>state.phase[i]<0?0:mod(ai*(c-key[state.phase[i]])))}
function scorePlain(P,lm,order=3){let s=0;for(let i=0;i<P.length;i++)s+=i===0?lm.uni[P[i]]:i===1||order===2?lm.bi[P[i-1]*29+P[i]]:lm.tri[(P[i-2]*29+P[i-1])*29+P[i]];return s}
function train(seqs,alpha=.15){
 const u=new Float64Array(29),b=new Float64Array(29*29),t=new Float64Array(29**3),bt=new Float64Array(29),tt=new Float64Array(29**2);let total=0;
 for(const a of seqs)for(let i=0;i<a.length;i++){const c=a[i];u[c]++;total++;if(i){const x=a[i-1];b[x*29+c]++;bt[x]++}if(i>=2){const x=a[i-2]*29+a[i-1];t[x*29+c]++;tt[x]++}}
 const pu=Array.from(u,v=>(v+alpha)/(total+29*alpha)),pb=new Float64Array(b.length),pt=new Float64Array(t.length);
 for(let x=0;x<29;x++)for(let c=0;c<29;c++)pb[x*29+c]=(b[x*29+c]+4*pu[c])/(bt[x]+4);
 for(let x=0;x<29**2;x++)for(let c=0;c<29;c++)pt[x*29+c]=(t[x*29+c]+5*pb[(x%29)*29+c])/(tt[x]+5);
 return {uni:Float64Array.from(pu,Math.log),bi:Float64Array.from(pb,Math.log),tri:Float64Array.from(pt,Math.log)};
}
/** @param {number[]} C @param {number} q @param {ReturnType<typeof train>} lm */
function recover(C,q,lm,{maxZeros=13,trigramMasks=16,exactIfZeros=5}={}){
 const z=C.filter(v=>v===0).length;if(z>maxZeros)return {zeros:z,reason:"F mask budget",ranked:[]};
 const ranks=[];for(let mask=0;mask<2**z;mask++){const state=fixedMask(C,q,mask);if(!state)continue;const r=optimize(state,factors(C,q,state,lm,2),2);ranks.push({mask,...r})}
 ranks.sort((a,b)=>b.score-a.score);const best=[];
 for(const x of ranks.slice(0,z<=exactIfZeros?ranks.length:trigramMasks)){const state=fixedMask(C,q,x.mask),r=optimize(state,factors(C,q,state,lm,3),3),p=plainFor(C,state,r.key);if(Math.abs(r.score-scorePlain(p,lm,3))>1e-6)throw Error("factor score mismatch");best.push({mask:x.mask,key:r.key,score:r.score,bigramScore:x.score,endPhase:state.endPhase,p})}
 best.sort((a,b)=>b.score-a.score);return {zeros:z,totalMasks:2**z,legalMasks:ranks.length,trigramMasks:best.length,exhaustiveTrigram:best.length===ranks.length,ranked:best,bigramTop:ranks.slice(0,8)};
}

/** Fixed-key prefix marginal and posterior-predictive suffix; no refitting. */
function continueFrozen(C,split,key,lm,a=1){
 const ai=inv(a);
 const q=key.length,enc=(j,a,b)=>j*900+a*30+b,decode=s=>[Math.floor(s/900),Math.floor(s%900/30),s%30];
 function next(s,c){const [j,a,b]=decode(s),p=mod(ai*(c-key[j])),v=[];function emit(x,k){const score=b===29?lm.uni[x]:a===29?lm.bi[b*29+x]:lm.tri[(a*29+b)*29+x];v.push([enc(k,b,x),x,score]);}if(!c)emit(0,j);if(p!==0)emit(p,(j+1)%q);return v}
 let states=new Map([[enc(0,29,29),{z:0,v:0,path:[]}]]); 
 for(let i=0;i<split;i++){const dst=new Map();for(const [s,r] of states)for(const [t,p,w] of next(s,C[i])){let x=dst.get(t),v=r.v+w,z=r.z+w;if(!x)dst.set(t,{z,v,path:[...r.path,p]});else{x.z=logadd(x.z,z);if(v>x.v){x.v=v;x.path=[...r.path,p]}}}states=dst;if(!states.size)return {legal:false,failedAt:i};}
 const prefix=states,prefixZ=[...prefix.values()].reduce((a,x)=>logadd(a,x.z),-Infinity);
 states=new Map([...prefix].map(([s,x])=>[s,{z:x.z,v:x.z,path:[],origin:s}]));
 for(let i=split;i<C.length;i++){const dst=new Map();for(const [s,r] of states)for(const [t,p,w] of next(s,C[i])){let x=dst.get(t),v=r.v+w,z=r.z+w;if(!x)dst.set(t,{z,v,path:[...r.path,p],origin:r.origin});else{x.z=logadd(x.z,z);if(v>x.v){x.v=v;x.path=[...r.path,p];x.origin=r.origin}}}states=dst;if(!states.size)return {legal:false,failedAt:i,prefixStates:prefix.size,prefixZ};}
 const all=[...states.values()],best=all.reduce((a,b)=>a.v>b.v?a:b),z=all.reduce((a,x)=>logadd(a,x.z),-Infinity);
 const prior=prefix.get(best.origin),P=prior.path.concat(best.path);let j=0;const replay=P.map(x=>x===0?0:mod(a*x+key[j++%q]));
 return {legal:true,prefixStates:prefix.size,endStates:states.size,prefixZ,conditionalLogEvidence:z-prefixZ,suffixMap:best.v-prefixZ,chosenBoundaryLogPosterior:prior.z-prefixZ,prefix:prior.path,suffix:best.path,replay:replay.every((x,i)=>x===C[i])};
}

module.exports={fixedMask,factors,optimize,plainFor,scorePlain,train,recover,logadd,continueFrozen};
