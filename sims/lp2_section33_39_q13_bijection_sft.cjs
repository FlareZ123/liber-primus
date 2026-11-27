'use strict';
const fs=require('node:fs');const path=require('node:path');
function solveSection(j){
const anchors=[[33,132,[7,10,20,20]],[34,4,[17,18]],[35,25,[0,3,1,9,23]],[37,146,[20,1,5,5]],[38,49,[0,3,1,9,23]],[38,57,[17,18,7,24,4,18]],[39,132,[0,24,20,15,18]]];
const mod=x=>(x%29+29)%29,seq=n=>Array.from({length:n},(_,i)=>i),inv=seq(29).map(x=>seq(29).find(y=>x*y%29===1));
let starts=[],s=0;for(const page of j.pages){starts.push(s);s+=page.indices.length}
const N=28,q=13,B=Array(N).fill(null),R=Array(q).fill(null);
function add(v){for(let i=0;i<N;i++)if(v[i]&&B[i]){let a=v[i];for(let k=i;k<=N;k++)v[k]=mod(v[k]-a*B[i][k])}
 let i=0;while(i<N&&!v[i])i++;if(i===N){if(v[N])throw Error("inconsistent");return}
 let a=inv[v[i]];for(let k=i;k<=N;k++)v[k]=mod(v[k]*a);for(let z=0;z<N;z++)if(B[z]?.[i]){let a=B[z][i];for(let k=i;k<=N;k++)B[z][k]=mod(B[z][k]-a*v[k])}B[i]=v}
let g=new Int8Array(N+1);g[0]=g[N]=1;add(g);
for(const [page,offset,P] of anchors)for(let i=0;i<P.length;i++){const p=P[i],c=j.pages[page].indices[offset+i],r=(starts[page]+offset+i)%q,e=[p,c];if(!R[r])R[r]=e;else{const v=new Int8Array(N+1);for(const [x,a] of [[c,1],[p,-1],[R[r][1],-1],[R[r][0],1]])if(x)v[x-1]=mod(v[x-1]+a);add(v)}}
const free=seq(N).filter(i=>!B[i]),d=free.length,F=[[0,...free.map(()=>0)],...seq(N).map(i=>B[i]?[B[i][N],...free.map(k=>mod(-B[i][k]))]:[0,...free.map(k=>+(i===k))])];
const seen=new Set(),H=[];for(let a=0;a<29;a++)for(let b=a+1;b<29;b++){let v=F[a].map((x,i)=>mod(x-F[b][i]));let first=v.find(x=>x);if(!first)throw Error("forced equality");const k=inv[first];v=v.map(x=>mod(x*k));const id=v.join(",");if(seen.has(id))continue;seen.add(id);H.push({v,vars:seq(d).filter(i=>v[i+1])})}
const X=new Int8Array(d).fill(-1),full=(1<<29)-1;let nodes=0,cap=false,solutions=[];const capN=500000;
function pop(v){let c=0;for(;v;v&=v-1)c++;return c}
function check(){let D=new Int32Array(d).fill(full),counts=new Int16Array(d);
for(const {v,vars} of H){let sum=v[0],u=-1,n=0;for(const i of vars){if(X[i]<0){u=i;n++;if(n>1)break}else sum+=v[i+1]*X[i]}if(n===0){if(mod(sum)===0)return null}else if(n===1){D[u]&=~(1<<mod(-sum*inv[v[u+1]]));if(!D[u])return null;counts[u]++}}
let best=-1,m=30;for(let i=0;i<d;i++)if(X[i]<0){let n=pop(D[i]);if(n<m||(n===m&&(best<0||counts[i]>counts[best]))){best=i;m=n}}return {best,mask:best<0?0:D[best]}}
function visit(){if(cap||solutions.length>=4)return;if(++nodes>capN){cap=true;return}let z=check();if(!z)return;if(z.best<0){const pi=F.map(v=>mod(v[0]+seq(d).reduce((s,i)=>s+v[i+1]*X[i],0)));if(new Set(pi).size!==29)throw Error("bad solution");const K=R.map(e=>e?mod(pi[e[1]]-pi[e[0]]):null);solutions.push({pi,K});return}for(let m=z.mask;m&&!cap&&solutions.length<4;m&=m-1){X[z.best]=31-Math.clz32(m&-m);visit()}X[z.best]=-1}
visit();
const native=j.pages[57].indices;const translit=j.translit;const dec=solutions.map(sol=>{let I=[];sol.pi.forEach((v,i)=>I[v]=i);let P=[];for(let p=33;p<=39;p++)for(let i=0;i<j.pages[p].indices.length;i++){let k=sol.K[(starts[p]+i)%q];P.push(k===null?null:I[mod(sol.pi[j.pages[p].indices[i]]-k)])}let a=P.slice(0,100).map(x=>x===null?"?":translit[x]).join(" ");let n=P.filter(x=>x!==null),freq=seq(29).map(x=>n.filter(y=>x===y).length);return {sol,coverage:n.length,total:P.length,preview:a,ioc:freq.reduce((s,x)=>s+x*(x-1),0)/(n.length*(n.length-1)),exactAnchors:anchors.every(([p,o,a])=>a.every((x,i)=>P[starts[p]-starts[33]+o+i]===x))}})
return {free:d,hyperplanes:H.length,nodes,cap,solutionLimit:4,solutions:dec,missingPhases:R.map((e,i)=>e?null:i).filter(x=>x!==null),rank:N-d,nativeIOC:seq(29).map(x=>native.filter(y=>x===y).length).reduce((s,x)=>s+x*(x-1),0)/(native.length*(native.length-1))};
}
console.log(JSON.stringify(solveSection(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
