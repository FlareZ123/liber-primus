'use strict';
const fs=require('node:fs');const path=require('node:path');
function phaseMRV(j){
const def=[[0,39,"LUCK",[20,1,5,5],[8,17,9,27]],[0,49,"GOOD",[6,3,3,23],[24,21,26,14]],[0,117,"FOUND",[0,3,1,9,23],[12,2,11,10,2]],[2,36,"GOOD",[6,3,3,23],[1,2,8,26]],[32,30,"YOU",[26,3,1],[0,3,2]],[33,132,"WILL",[7,10,20,20],[3,15,17,22]],[34,4,"BE",[17,18],[12,23]],[35,25,"FOUND",[0,3,1,9,23],[19,17,19,24,11]],[37,146,"LUCK",[20,1,5,5],[3,2,6,27]],[38,49,"FOUND",[0,3,1,9,23],[19,25,22,26,3]],[40,71,"PATHS",[13,24,2,15],[4,15,14,21]]];
def.push([38,57,"BEWARE",[17,18,7,24,4,18],[8,25,14,2,17,22]],[39,132,"FALSE",[0,24,20,15,18],[19,7,10,17,23]]);
const A=def.map(([page,offset,name,p,c])=>{if(j.pages[page].indices.slice(offset,offset+p.length).join()!=c.join())throw Error("source mismatch");return {page,offset,name,p,c}});
const mod=x=>(x%29+29)%29,seq=n=>Array.from({length:n},(_,i)=>i),inv=seq(29).map(x=>seq(29).find(y=>x*y%29===1));

function run(anchors,q=13,cap=500000){
const G=anchors.map(a=>a.p.map((p,i)=>({p,c:a.c[i],r:i}))),n=G.length,N=28,full=(1<<q)-1;
const compatible=(a,b)=>(a.p===a.c)===(b.p===b.c)&&!(a.p===b.p&&a.c!==b.c)&&!(a.c===b.c&&a.p!==b.p);
const masks=G.map(a=>G.map(b=>seq(q).map(s=>seq(q).reduce((m,t)=>m|(+a.every(x=>b.every(y=>(x.r+s)%q!==(y.r+t)%q||compatible(x,y)))<<t),0))));
let nodes=0,collisions=0,domainPrunes=0,leaf=null,capped=false;
function add(B,v){for(let i=0;i<N;i++)if(v[i]&&B[i]){const a=v[i];for(let k=i;k<N;k++)v[k]=mod(v[k]-a*B[i][k])}let i=v.findIndex(x=>x);if(i<0)return;const a=inv[v[i]];for(let k=i;k<N;k++)v[k]=mod(v[k]*a);for(let z=0;z<N;z++)if(B[z]?.[i]){let w=B[z].slice();const a=w[i];for(let k=i;k<N;k++)w[k]=mod(w[k]-a*v[k]);B[z]=w}B[i]=v}
function eq(a,b){const v=new Int8Array(N);for(const [x,s] of [[a.c,1],[a.p,-1],[b.c,-1],[b.p,1]])if(x)v[x-1]=mod(v[x-1]+s);return v}
function forms(B){const F=seq(N).filter(i=>!B[i]);return {free:F,f:[[...F.map(()=>0)],...seq(N).map(i=>B[i]?F.map(k=>mod(-B[i][k])):F.map(k=>+(i===k)))]}}
function pop(x){let n=0;while(x){x&=x-1;n++}return n}
function walk(B,R,domains,phases,left){if(leaf||capped)return;if(++nodes>cap){capped=true;return}const {free,f}=forms(B);if(new Set(f.map(x=>x.join(","))).size!==29){collisions++;return}if(!left){leaf={phases,free:free.length};return}
let best=-1,size=Infinity;for(let i=0;i<n;i++)if(phases[i]<0){let c=pop(domains[i]);if(c<size||(c===size&&G[i].length>G[best].length)){best=i;size=c}}
for(let m=domains[best];m&&!leaf&&!capped;m&=m-1){const p=31-Math.clz32(m&-m),d=domains.slice(),ph=phases.slice();ph[best]=p;let ok=true;for(let i=0;i<n;i++)if(ph[i]<0){d[i]&=masks[best][i][p];if(!d[i]){ok=false;break}}if(!ok){domainPrunes++;continue}const b=B.slice(),r=R.slice();for(const e of G[best]){const k=(e.r+p)%q;if(!r[k])r[k]=e;else add(b,eq(e,r[k]))}walk(b,r,d,ph,left-1)}
}
const domains=Array(n).fill(full);domains[n===13?11:2]=1;walk(Array(N).fill(null),Array(q).fill(null),domains,Array(n).fill(-1),n);
return {n,q,nodes,collisions,domainPrunes,capped,leaf,decision:leaf?"relaxation_survives":capped?"capped":"excluded"};
}
const results=[];for(const n of [11,13])results.push(run(A.slice(0,n)));
const controls=[];for(const n of [11,13])for(let seed=1;seed<=4;seed++){let state=seed;const rng=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};const pi=seq(29);for(let i=28;i>0;i--){const k=rng(i+1);[pi[i],pi[k]]=[pi[k],pi[i]]}const I=[];pi.forEach((v,i)=>I[v]=i);const K=seq(13).map(()=>rng(29));const planted=A.slice(0,n).map(a=>{const phase=rng(13);return {...a,c:a.p.map((p,i)=>I[mod(pi[p]+K[(phase+i)%13])])}});const x=run(planted);if(x.decision!=="relaxation_survives")throw Error("control did not survive");controls.push({seed,...x})}
return {results,controls};
}

console.log(JSON.stringify(phaseMRV(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
