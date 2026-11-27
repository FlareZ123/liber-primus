'use strict';
const fs=require('node:fs');const path=require('node:path');
function extension(j){
const def=[[0,39,"LUCK",[20,1,5,5],[8,17,9,27]],[0,49,"GOOD",[6,3,3,23],[24,21,26,14]],[0,117,"FOUND",[0,3,1,9,23],[12,2,11,10,2]],[2,36,"GOOD",[6,3,3,23],[1,2,8,26]],[32,30,"YOU",[26,3,1],[0,3,2]],[33,132,"WILL",[7,10,20,20],[3,15,17,22]],[34,4,"BE",[17,18],[12,23]],[35,25,"FOUND",[0,3,1,9,23],[19,17,19,24,11]],[37,146,"LUCK",[20,1,5,5],[3,2,6,27]],[38,49,"FOUND",[0,3,1,9,23],[19,25,22,26,3]],[40,71,"PATHS",[13,24,2,15],[4,15,14,21]]];
def.push([38,57,"BEWARE",[17,18,7,24,4,18],[8,25,14,2,17,22]],[39,132,"FALSE",[0,24,20,15,18],[19,7,10,17,23]]);
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

const result=[];
const local=A.filter(a=>a.page>=33&&a.page<=39);
for(const q of [8,13])for(const clock of ["global","reset","page","word"]){
result.push({set:"p33-39",...run(q,local,clock,100000)});
}
for(const q of [8,13])for(const clock of ["word","page"]){
result.push({set:"all13",...run(q,A,clock,100000)});
}
return {local,results:result};
}

console.log(JSON.stringify(extension(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
