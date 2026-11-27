'use strict';
// Conditional joint local-candidate GP29 phase constraint; no plaintext authenticated.
const fs = require('node:fs');
const path = require('node:path');
function experiment(j){
const def=[[0,39,"LUCK",[20,1,5,5],[8,17,9,27]],[0,49,"GOOD",[6,3,3,23],[24,21,26,14]],[0,117,"FOUND",[0,3,1,9,23],[12,2,11,10,2]],[2,36,"GOOD",[6,3,3,23],[1,2,8,26]],[32,30,"YOU",[26,3,1],[0,3,2]],[33,132,"WILL",[7,10,20,20],[3,15,17,22]],[34,4,"BE",[17,18],[12,23]],[35,25,"FOUND",[0,3,1,9,23],[19,17,19,24,11]],[37,146,"LUCK",[20,1,5,5],[3,2,6,27]],[38,49,"FOUND",[0,3,1,9,23],[19,25,22,26,3]],[40,71,"PATHS",[13,24,2,15],[4,15,14,21]]];
const A=def.map(([page,offset,name,p,c])=>{if(j.pages[page].indices.slice(offset,offset+p.length).join()!=c.join())throw Error("source mismatch");return {page,offset,name,p,c}});
const mod=x=>(x%29+29)%29,seq=n=>Array.from({length:n},(_,i)=>i),inv=seq(29).map(x=>seq(29).find(y=>x*y%29===1));
const starts=[];let t=0;for(const page of j.pages){starts.push(t);t+=page.indices.length}
const groupKey=(a,clock)=>clock==="page"?String(a.page):clock==="word"?`${a.page}:${a.offset}`:"all";
const offset=(a,clock)=>clock==="global"?starts[a.page]+a.offset:clock==="word"?0:a.offset;
function run(q,anchors,clock,cap=50000,known=null){
 const groups=new Map();
 for(const a of anchors){const g=groupKey(a,clock),off=offset(a,clock);if(!groups.has(g))groups.set(g,[]);a.p.forEach((p,i)=>groups.get(g).push({p,c:a.c[i],r:(off+i)%q,site:[a.page,a.offset+i]}))}
 const G=[...groups].sort((a,b)=>b[1].length-a[1].length),N=28;let nodes=0,pairPrune=0,collision=0,capHit=false,bestRank=0,leaf=null;
 function add(B,v){for(let i=0;i<N;i++)if(v[i]&&B[i]){const a=v[i];for(let k=i;k<N;k++)v[k]=mod(v[k]-a*B[i][k])}let i=v.findIndex(x=>x);if(i<0)return;const a=inv[v[i]];for(let k=i;k<N;k++)v[k]=mod(v[k]*a);for(let z=0;z<N;z++)if(B[z]?.[i]){let w=B[z].slice();const a=w[i];for(let k=i;k<N;k++)w[k]=mod(w[k]-a*v[k]);B[z]=w}B[i]=v}
 function eq(a,b){const v=new Int8Array(N);for(const [x,s] of [[a.c,1],[a.p,-1],[b.c,-1],[b.p,1]])if(x)v[x-1]=mod(v[x-1]+s);return v}
 function forms(B){const F=seq(N).filter(i=>!B[i]);return {free:F,f:[[...F.map(()=>0)],...seq(N).map(i=>B[i]?F.map(k=>mod(-B[i][k])):F.map(k=>+(i===k)))]}}
 function walk(depth,B,R,phases){if(leaf||capHit)return;if(++nodes>cap){capHit=true;return}
 const {free,f}=forms(B);bestRank=Math.max(bestRank,N-free.length);if(new Set(f.map(x=>x.join(","))).size!==29){collision++;return}
 if(depth===G.length){leaf={free:free.length,phases:Object.fromEntries(G.map(([key],i)=>[key,phases[i]]))};return}
 const [key,edges]=G[depth],allowed=known?[mod(known[key]-known[G[0][0]])%q]:depth===0?[0]:seq(q);
 // known phases must be normalized modulo q, not 29
 if(known)allowed[0]=((known[key]-known[G[0][0]])%q+q)%q;
 for(const phase of allowed){const b=B.slice(),r=R.slice();let ok=true;for(const e of edges){const p=(e.r+phase)%q,old=r[p];if(!old){r[p]=e;continue}if((e.p===e.c)!==(old.p===old.c)||(e.p===old.p&&e.c!==old.c)||(e.c===old.c&&e.p!==old.p)){ok=false;break}add(b,eq(e,old))}
 if(ok)walk(depth+1,b,r,phases.concat(phase));else pairPrune++;if(leaf||capHit)return}
 }
 walk(0,Array(N).fill(null),Array(q).fill(null),[]);return {q,clock,nodes,pairPrune,collision,bestRank,capHit,leaf,decision:leaf?"relaxation_survives":capHit?"capped":"excluded"};
}
const results=[];for(const q of [8,13])for(const clock of ["global","reset","page","word"])results.push(run(q,A,clock));
const minimal=[];for(const q of [8,13]){let M=A.slice();for(const a of A){const sub=M.filter(x=>x!==a);if(run(q,sub,"page").decision==="excluded")M=sub}minimal.push({q,anchors:M.map(a=>`${a.page}:${a.offset} ${a.name}`),result:run(q,M,"page"),deletions:M.map(a=>({removed:`${a.page}:${a.offset}`,decision:run(q,M.filter(x=>x!==a),"page").decision}))})}
let state=0x3b921e5d;const rng=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
const controls=[];for(const q of [8,13])for(const clock of ["global","reset","page","word"]){const pi=seq(29);for(let i=28;i>1;i--){const k=1+rng(i);[pi[i],pi[k]]=[pi[k],pi[i]]}const I=[];pi.forEach((v,i)=>I[v]=i);const K=seq(q).map(()=>rng(29)),phases={};for(const a of A){const key=groupKey(a,clock);if(!(key in phases))phases[key]=rng(q)}
 const C=A.map(a=>({...a,c:a.p.map((p,i)=>I[mod(pi[p]+K[(offset(a,clock)+i+phases[groupKey(a,clock)])%q])])}));
 const forced=run(q,C,clock,50000,phases),unrestricted=run(q,C,clock,50000);if(forced.decision!=="relaxation_survives"||unrestricted.decision==="excluded")throw Error("false negative control");controls.push({q,clock,forced:forced.decision,unrestricted:unrestricted.decision,unrestrictedNodes:unrestricted.nodes})}
return {anchors:A,results,minimal,controls,literalFIncompatible:A.filter(a=>a.p.some((p,i)=>p===0&&a.c[i]!==0)).map(a=>`${a.page}:${a.offset} ${a.name}`)};
}
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(experiment(corpus),null,2));
