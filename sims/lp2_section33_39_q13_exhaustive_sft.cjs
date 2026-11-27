'use strict';
const fs=require('node:fs');const path=require('node:path');
function exhaustiveSection(j,training){
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
const used=new Set(anchors.flatMap(([p,o,a])=>a.concat(j.pages[p].indices.slice(o,o+a.length))));const unused=seq(29).filter(x=>!used.has(x));const skip=new Set(free.map((v,i)=>unused.includes(v+1)?i:-1).filter(i=>i>=0));const seen=new Set(),H=[];for(let a=0;a<29;a++)for(let b=a+1;b<29;b++){if(!used.has(a)||!used.has(b))continue;let v=F[a].map((x,i)=>mod(x-F[b][i]));let first=v.find(x=>x);if(!first)throw Error("forced equality");const k=inv[first];v=v.map(x=>mod(x*k));const id=v.join(",");if(seen.has(id))continue;seen.add(id);H.push({v,vars:seq(d).filter(i=>v[i+1])})}
const X=new Int8Array(d).fill(-1),full=(1<<29)-1;let nodes=0,cap=false,solutions=[];const capN=1000000;let count=0;
function pop(v){let c=0;for(;v;v&=v-1)c++;return c}
function check(){let D=new Int32Array(d).fill(full),counts=new Int16Array(d);
for(const {v,vars} of H){let sum=v[0],u=-1,n=0;for(const i of vars){if(X[i]<0){u=i;n++;if(n>1)break}else sum+=v[i+1]*X[i]}if(n===0){if(mod(sum)===0)return null}else if(n===1){D[u]&=~(1<<mod(-sum*inv[v[u+1]]));if(!D[u])return null;counts[u]++}}
let best=-1,m=30;for(let i=0;i<d;i++)if(X[i]<0&&!skip.has(i)){let n=pop(D[i]);if(n<m||(n===m&&(best<0||counts[i]>counts[best]))){best=i;m=n}}return {best,mask:best<0?0:D[best]}}
function visit(){if(cap||false)return;if(++nodes>capN){cap=true;return}let z=check();if(!z)return;if(z.best<0){count++;const pi=F.map((v,l)=>used.has(l)?mod(v[0]+seq(d).reduce((s,i)=>s+v[i+1]*X[i],0)):-1);if(new Set([...used].map(l=>pi[l])).size!==used.size)throw Error("used collision");const K=R.map(e=>mod(pi[e[1]]-pi[e[0]]));const missing=seq(29).filter(v=>!pi.includes(v));function perm(i,left){if(i===unused.length){solutions.push({pi:pi.slice(),K:K.slice()});return}for(const v of left){pi[unused[i]]=v;perm(i+1,left.filter(x=>x!==v))}}perm(0,missing);return}for(let m=z.mask;m&&!cap&&true;m&=m-1){X[z.best]=31-Math.clz32(m&-m);visit()}X[z.best]=-1}
visit();

const train=training.key; if(train.some(x=>!Number.isInteger(x)||x<0||x>=29))throw Error("training");
const big=Array.from({length:29},()=>Array(29).fill(.5));for(let i=1;i<train.length;i++)big[train[i-1]][train[i]]++;for(const row of big){const sum=row.reduce((a,b)=>a+b,0);for(let i=0;i<29;i++)row[i]=Math.log(row[i]/sum)}
const C=j.pages.slice(33,40).flatMap(p=>p.indices),offset=starts[33],cut=starts[38]-offset,mask=new Set(anchors.flatMap(([p,o,a])=>a.map((_,i)=>starts[p]-offset+o+i)));
function score(P,lo,hi,m=new Set()){let sum=0,n=0;for(let i=lo+1;i<hi;i++){if(m.has(i)||m.has(i-1))continue;sum+=big[P[i-1]][P[i]];n++}return sum/n}
function ioc(P){const n=P.length,f=seq(29).map(x=>P.filter(y=>x===y).length);return f.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1))}
const dec=solutions.map(sol=>{const I=[];sol.pi.forEach((v,i)=>I[v]=i);const P=C.map((c,i)=>I[mod(sol.pi[c]-sol.K[(offset+i)%q])]);if(new Set(sol.pi).size!==29||!anchors.every(([p,o,a])=>a.every((x,i)=>P[starts[p]-offset+o+i]===x))||!P.every((p,i)=>I[mod(sol.pi[p]+sol.K[(offset+i)%q])]===C[i]))throw Error("replay");return {sol,P,fit:score(P,0,cut,mask),held:score(P,cut,P.length,mask),all:score(P,0,P.length,mask),ioc:ioc(P)}});
const best=(k)=>dec.slice().sort((a,b)=>b[k]-a[k])[0];const serialize=x=>({...x,rendered:x.P.map(v=>j.translit[v]).join(" ")});
return {free:d,unused,quotientHyperplanes:H.length,nodes,cap,observedAssignments:count,solutions:dec.length,distinctKeyVectors:new Set(dec.map(x=>x.sol.K.join(","))).size,distinctPlaintexts:new Set(dec.map(x=>x.P.join(","))).size,trainRunes:train.length,cribRunes:mask.size,sectionRunes:C.length,fitRunes:cut,heldRunes:C.length-cut,nativeP57:{score:score(j.pages[57].indices,0,j.pages[57].indices.length),ioc:ioc(j.pages[57].indices)},uniformLog:-Math.log(29),scoreRanges:Object.fromEntries(["fit","held","all","ioc"].map(k=>[k,[Math.min(...dec.map(x=>x[k])),Math.max(...dec.map(x=>x[k]))]])),bestFit:serialize(best("fit")),bestHeld:serialize(best("held")),bestAll:serialize(best("all")),allCandidates:dec.map(({sol,fit,held,all,ioc})=>({sol,fit,held,all,ioc}))};
}

const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'../',p),'utf8'));console.log(JSON.stringify(exhaustiveSection(read('resources/liber-primus/lp2-corpus.json'),read('resources/derived/dukotah-r37-lp1-map-runes.json')),null,2));
