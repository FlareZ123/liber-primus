'use strict';
const fs=require('node:fs');
function envelope(c,gs,es,ss){
const assert=(x,m)=>{if(!x)throw Error(m)},mod=(x,m)=>(x%m+m)%m;
const C=c.pages.slice(0,56).flatMap(p=>p.indices),N=C.length;assert(N===12956,"original length");
const starts=[0,3,8,15,23,27,33,40,54].map(p=>c.pages.slice(0,p).reduce((a,b)=>a+b.indices.length,0));const bounds=[...starts,N];
const primes=[];for(let x=2;primes.length<=N;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break;}}if(ok)primes.push(x);}
const log=Array(29).fill(-1);let a=1;for(let i=0;i<28;i++){log[a]=i;a=a*15%29;}assert(log.slice(1).every(x=>x>=0),"root15");
function maxAssignment(W){const n=W.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-W[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<d){d=min[j];j1=j;}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d;}else min[j]-=d;}j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}const ans=Array(n);for(let j=1;j<=n;j++)ans[p[j]-1]=j-1;return ans;}
function cap(q,hold,order,privateChapters){let total=0,zero=0,chapterCaps=[];const ranges=privateChapters?bounds:[0,N];
for(let seg=0;seg<ranges.length-1;seg++){const W=Array.from({length:q},()=>Array.from({length:28},()=>Array(28).fill(0)));let t=0,last=0,zs=0;for(let i=ranges[seg];i<ranges[seg+1];i++){const d=mod(C[i]-last,29),k=mod(primes[t]-1,28),ph=t%q;last=C[i];if(!d){zs++;if(!hold)t++;continue;}const z=mod(log[d]-(order==="before"?k:0),28);for(let r=0;r<28;r++){const R=mod(r-(order==="after"?k:0),28);if(R===17||R===18)W[ph][z][r]++;}t++;}
let val=zs;for(const mat of W){const assignment=maxAssignment(mat);val+=assignment.reduce((s,r,z)=>s+mat[z][r],0);if(order!=="after"){const h=mat.map(row=>row[17]).sort((a,b)=>b-a);assert(assignment.reduce((s,r,z)=>s+mat[z][r],0)===h[0]+h[1],"top-two equality");}}total+=val;zero+=zs;chapterCaps.push(val);}
return {q,hold,order,privateChapters,Ecap:total,zero,chapterCaps};}
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encodeText(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){const k=keys.find(x=>w.startsWith(x));assert(k,"token "+w);out.push(map[k]);w=w.slice(k.length);}}return out;}
function windowMin(A,n){let count=A.slice(0,n).filter(x=>x===18).length,min=count,max=count,at=0;for(let i=n;i<A.length;i++){count+=Number(A[i]===18)-Number(A[i-n]===18);if(count<min){min=count;at=i-n+1;}max=Math.max(max,count);}return {n,windows:A.length-n+1,min,max,at};}
const g=gs.slice(gs.indexOf("|Almustafa"),gs.indexOf("*** END OF")),e=es.slice(es.indexOf("THERE is one mind"),es.indexOf("*** END OF"));assert(g.length>0&&e.length>0,"body");
const donors=[["Gibran",g],["Emerson",e],["Shakespeare",ss]].map(([name,s])=>{const tape=encodeText(s);return {name,runes:tape.length,...windowMin(tape,N)};});
const modes=[];for(const q of [8,13,28,29,256])for(const hold of [false,true])for(const order of ["none","before","after"])for(const privateChapters of [false,true])modes.push(cap(q,hold,order,privateChapters));
return {N,bounds,donors,modes};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(envelope(JSON.parse(fs.readFileSync(paths[0],'utf8')),...paths.slice(1).map(p=>fs.readFileSync(p,'utf8'))),null,2));
