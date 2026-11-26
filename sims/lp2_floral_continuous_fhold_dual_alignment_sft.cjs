"use strict";
function dualAlignment(C,T,iterations=200){
 const n=C.length,degree=n-1,S=4096,NEG=-1073741824,ns=C.map(x=>1+x.filter(v=>v===0).length);
 const assert=(x,m)=>{if(!x)throw Error(m)};
 assert(C.every((x,i)=>x.length-ns[i]+1>=T),"horizon guaranteed");
 const ends=C.map((x,i)=>{const a=new Int16Array(T*ns[i]);for(let t=0;t<T;t++)for(let h=0;h<ns[i];h++){let v=h;if(t+v>=x.length){a[t*ns[i]+h]=-1;continue}while(v+1<ns[i]&&t+v+1<x.length&&x[t+v]===0)v++;a[t*ns[i]+h]=v}return a});
 const E=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=ns[i],b=ns[j];E.push({i,j,a,b,L:new Int32Array(T*a),R:new Int32Array(T*b),p:new Int32Array(a*b),q:new Int32Array(a*b),prev:new Int16Array(T*a*b)})}
 function solvePair(e){const {i,j,a,b,L,R,prev}=e,A=C[i],B=C[j],X=ends[i],Y=ends[j],N=a*b;let p=e.p,q=e.q;p.fill(NEG);p[0]=0;
  for(let t=0;t<T;t++){q.fill(NEG);const ba=t*a,bb=t*b,bp=t*N;for(let h=0;h<a;h++)for(let k=0;k<b;k++){const id=h*b+k,s=p[id];if(s===NEG)continue;const he=X[ba+h],ke=Y[bb+k];for(let u=h;u<=he;u++){const x=A[t+u],z=s+L[ba+u];for(let v=k;v<=ke;v++){const idx=u*b+v,score=z+R[bb+v]+S*(x===B[t+v]);if(score>q[idx]){q[idx]=score;prev[bp+idx]=id}}}}[p,q]=[q,p]}
  let k=0;for(let id=1;id<N;id++)if(p[id]>p[k])k=id;const score=p[k],U=new Uint8Array(T),V=new Uint8Array(T);assert(score!==NEG,"pair feasibility");for(let t=T-1;t>=0;t--){U[t]=Math.floor(k/b);V[t]=k%b;k=prev[t*N+k]}assert(k===0,"pair start");return {score,U,V}}
 function solvePage(i,reward){const m=ns[i],e=ends[i];let p=new Int32Array(m),q=new Int32Array(m),prev=new Int16Array(T*m);p.fill(NEG);p[0]=0;for(let t=0;t<T;t++){q.fill(NEG);const b=t*m;for(let h=0;h<m;h++){const s=p[h];if(s===NEG)continue;for(let k=h;k<=e[b+h];k++){const v=s+reward[b+k];if(v>q[k]){q[k]=v;prev[b+k]=h}}}[p,q]=[q,p]}let k=0;for(let h=1;h<m;h++)if(p[h]>p[k])k=h;const path=new Uint8Array(T);for(let t=T-1;t>=0;t--){path[t]=k;k=prev[t*m+k]}return path}
 function score(P){let z=0;for(const e of E){const {i,j}=e;for(let t=0;t<T;t++)z+=C[i][t+P[i][t]]===C[j][t+P[j][t]]}return z}
 function improve(P){let z=score(P);for(let sweep=0;sweep<20;sweep++){const before=z;for(let i=0;i<n;i++){const m=ns[i],r=new Int32Array(T*m);for(let t=0;t<T;t++)for(let h=0;h<m&&t+h<C[i].length;h++){const v=C[i][t+h];let s=0;for(let j=0;j<n;j++)if(j!==i)s+=v===C[j][t+P[j][t]];r[t*m+h]=s}const old=P[i],path=solvePage(i,r);P[i]=path;const next=score(P);if(next>z)z=next;else P[i]=old}if(z===before)break}return {score:z,P}}
 let seed=0x44a11ce;const rand=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 function randomPath(i){const m=ns[i],path=new Uint8Array(T);let h=0;for(let t=0;t<T;t++){const e=ends[i][t*m+h];while(h<e&&(rand()>>>31))h++;path[t]=h}return path}
 let low=improve(C.map(()=>new Uint8Array(T)));for(let s=0;s<24;s++){const r=improve(C.map((_,i)=>randomPath(i)));if(r.score>low.score)low=r}
 const initialLower=low.score,history=[];let best=Infinity,bestIteration=-1,bestWeights=null,lastImproved=0,mult=1;
 const counts=ns.map(m=>new Int16Array(T*m));
 for(let it=0;it<iterations;it++){for(const a of counts)a.fill(0);let D=0;const paths=[];for(const e of E){const x=solvePair(e);D+=x.score;paths.push(x);for(let t=0;t<T;t++){counts[e.i][t*e.a+x.U[t]]++;counts[e.j][t*e.b+x.V[t]]++}}
  if(D<best){best=D;bestIteration=it;bestWeights=E.map(e=>[e.L.slice(),e.R.slice()]);lastImproved=it}
  if(it%5===0){const p=improve(C.map((_,i)=>solvePage(i,counts[i])));if(p.score>low.score)low=p}
  assert(D>=low.score*S,"valid bound");
  let norm=0;for(let i=0;i<n;i++)for(let t=0;t<T;t++){let ss=0;for(let h=0;h<ns[i];h++){const v=counts[i][t*ns[i]+h];ss+=v*v}norm+=degree-ss/degree}
  if(it%10===0||it===iterations-1)history.push({it,dual:D/S,best:best/S,lower:low.score,norm,mult});
  if(Math.floor(best/S)===low.score||norm===0)break;
  if(it-lastImproved>=25){mult*=0.7;lastImproved=it}
  const eta=Math.max(1,Math.floor(mult*(D-low.score*S)/(norm*degree)));
  for(let k=0;k<E.length;k++){const e=E[k],x=paths[k],U=counts[e.i],V=counts[e.j];for(let q=0;q<e.L.length;q++)e.L[q]+=eta*U[q];for(let q=0;q<e.R.length;q++)e.R[q]+=eta*V[q];for(let t=0;t<T;t++){e.L[t*e.a+x.U[t]]-=eta*degree;e.R[t*e.b+x.V[t]]-=eta*degree}}
 }
 const sum=ns.map(m=>new Int32Array(T*m));let verified=0;for(let k=0;k<E.length;k++){const e=E[k];e.L=bestWeights[k][0];e.R=bestWeights[k][1];for(let q=0;q<e.L.length;q++)sum[e.i][q]+=e.L[q];for(let q=0;q<e.R.length;q++)sum[e.j][q]+=e.R[q];verified+=solvePair(e).score}assert(sum.every(a=>a.every(v=>v===0)),"exact zero-sum dual weights");assert(verified===best,"certificate score");
 for(let i=0;i<n;i++){let h=0;for(let t=0;t<T;t++){const x=low.P[i][t];assert(x>=h&&x<=ends[i][t*ns[i]+h],"primal legality");h=x}}assert(score(low.P)===low.score,"primal score");
 return {n,T,iterations,S,initialLower,lower:low.score,upper:Math.floor(best/S),dualNumerator:best,bestIteration,history,primal:low.P.map(p=>Array.from(p)),certificate:bestWeights.map(([a,b])=>[Array.from(a),Array.from(b)])};
}
const fs=require("node:fs"),path=require("node:path");
const gp=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const C=gp.pages.slice(40,49).map(p=>p.indices);
console.log(JSON.stringify(dualAlignment(C,200,Number(process.argv[2]||200)),null,2));
