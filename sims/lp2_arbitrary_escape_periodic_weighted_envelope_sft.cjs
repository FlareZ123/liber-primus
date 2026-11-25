'use strict';
const fs=require('node:fs');
function weighted(c,n,gs,es,ss){
const check=(x,m)=>{if(!x)throw Error(m)},mod=(x,m)=>(x%m+m)%m;
const C=c.pages.slice(0,56).flatMap(p=>p.indices),N=C.length;check(N===12956,"original length");
const native=n.sections.flatMap(s=>Array.from(s.source_text).map(x=>c.runes.indexOf(x)).filter(x=>x>=0));const cnt=Array(29).fill(.5);for(const x of native)cnt[x]++;
const weights=cnt.map(x=>Math.round(1000*Math.log(x/(native.length+14.5))));
const primes=[];for(let x=2;primes.length<=N;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break;}}if(ok)primes.push(x);}
const log=Array(29).fill(-1);let a=1;for(let i=0;i<28;i++){log[a]=i;a=a*15%29;}
function assign(W){const n=W.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-W[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<d){d=min[j];j1=j;}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d;}else min[j]-=d;}j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}const ans=Array(n);for(let j=1;j<=n;j++)ans[p[j]-1]=j-1;return ans;}
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encodeText(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){const k=keys.find(x=>w.startsWith(x));check(k,"token "+w);out.push(map[k]);w=w.slice(k.length);}}return out;}
const donors=[["Gibran",gs.slice(gs.indexOf("|Almustafa"),gs.indexOf("*** END OF"))],["Emerson",es.slice(es.indexOf("THERE is one mind"),es.indexOf("*** END OF"))],["Shakespeare",ss]].map(([name,s])=>({name,P:encodeText(s)}));
function win(A,w){let s=A.slice(0,N).reduce((a,p)=>a+w[p],0),min=s,max=s,at=0;for(let i=N;i<A.length;i++){s+=w[A[i]]-w[A[i-N]];if(s<min){min=s;at=i-N+1;}max=Math.max(max,s);}return {min,max,at};}
const weightSets=[{name:"native log-probability",w:weights},{name:"native frequency",w:cnt.map(x=>Math.round(1000*x/native.length))}];for(const k of [1,2,3,4,5,6,7,8,9,10,12,15,18,21,24,27]){const top=cnt.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]).slice(0,k).map(x=>x[1]);weightSets.push({name:"native top"+k,w:Array.from({length:29},(_,i)=>Number(top.includes(i)))});}
for(const ws of weightSets){ws.native=donors.map(d=>({name:d.name,...win(d.P,ws.w)}));ws.min=Math.min(...ws.native.map(x=>x.min));}
const tests=[];for(const q of [8,13])for(const hold of [false,true]){
const arr=Array.from({length:q},()=>Array.from({length:28},()=>Array(28).fill(0)));let t=0,last=0,zs=0;for(const x of C){const d=mod(x-last,29);last=x;const k=mod(primes[t]-1,28),ph=t%q;if(!d){zs++;if(!hold)t++;continue;}arr[ph][log[d]][k]++;t++;}
const result=[];for(const ws of weightSets){const w=ws.w,mx=Array.from({length:28},(_,r)=>Math.max(w[r],w[r+1]));let total=zs*Math.max(...w);for(const matrix of arr){const W=matrix.map(row=>Array.from({length:28},(_,r)=>{let sum=0;for(let k=0;k<28;k++)sum+=row[k]*mx[(r-k+28)%28];return sum;}));const A=assign(W);total+=A.reduce((s,r,z)=>s+W[z][r],0);}result.push({name:ws.name,total,min:ws.min,margin:ws.min-total});}tests.push({q,hold,result});}
return {N,weightSets,tests};}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(weighted(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),...paths.slice(2).map(p=>fs.readFileSync(p,'utf8'))),null,2));
