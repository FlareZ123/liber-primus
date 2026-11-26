#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const src=JSON.parse(data[0]), orig=src.pages.slice(0,3).flatMap(x=>x.indices), title=[18,13,10,13,8,24,9,26,15,18,18,5,15], N=29,M=28;
 const mod=(x,m=M)=>(x%m+m)%m;
 const toks=src.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(s){return [...s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)].flatMap(m=>{const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const t=toks.find(t=>w.startsWith(t.t,i));if(t){a.push(t.i);i+=t.t.length}else i++}return a})}
 const ds=data.slice(1).map(native), U=new Float64Array(N),H2=new Float64Array(N*N),H3=new Float64Array(N**3);
 for(let i=0;i<ds[0].length;i++){let p=ds[0];U[p[i]]++;if(i)H2[p[i-1]*N+p[i]]++;if(i>1)H3[(p[i-2]*N+p[i-1])*N+p[i]]++}
 const tot=U.reduce((a,b)=>a+b,0), L1=Float64Array.from(U,x=>(x+.5)/(tot+N*.5)), L3=new Float64Array(N**3);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let s2=0,s3=0;for(let c=0;c<N;c++){s2+=H2[b*N+c];s3+=H3[(a*N+b)*N+c]}for(let c=0;c<N;c++){const p2=(H2[b*N+c]+10*L1[c])/(s2+10);L3[(a*N+b)*N+c]=Math.log((H3[(a*N+b)*N+c]+10*p2)/(s3+10))}}
 const score=(p,a,b)=>{let z=0;for(let i=a+2;i<b;i++)z+=L3[(p[i-2]*N+p[i-1])*N+p[i]];return z/(b-a-2)};
 function solveField(A,b,p,q){
  const m=A.map((row,i)=>[...row.map(x=>mod(x,p)),mod(b[i],p)]), piv=[];let t=0;
  for(let c=0;c<q;c++){let s=t;while(s<m.length&&!m[s][c])s++;if(s===m.length)continue;[m[t],m[s]]=[m[s],m[t]];let inv=1;while(mod(inv*m[t][c],p)!==1)inv++;m[t]=m[t].map(x=>mod(x*inv,p));for(let k=0;k<m.length;k++)if(k!==t&&m[k][c]){let v=m[k][c];m[k]=m[k].map((x,j)=>mod(x-v*m[t][j],p))}piv.push(c);t++}
  if(m.some(row=>row.slice(0,q).every(x=>!x)&&row[q]))return [];
  const free=Array.from({length:q},(_,i)=>i).filter(i=>!piv.includes(i)), out=[],x=Array(q).fill(0);
  function rec(i){if(i<free.length){for(let v=0;v<p;v++){x[free[i]]=v;rec(i+1)}return}for(let j=0;j<piv.length;j++){let v=m[j][q];for(const k of free)v-=m[j][k]*x[k];x[piv[j]]=mod(v,p)}out.push(x.slice())}rec(0);return out;
 }
 function coeffs(k,q){
  const A=[],b=[];for(let t=q;t<k.length;t++){A.push(Array.from({length:q},(_,j)=>k[t-1-j]));b.push(k[t])}
  const s7=solveField(A,b,7,q),s2=solveField(A,b,2,q),s4=[];
  for(const x of s2){const rhs=b.map((v,i)=>{const w=v-A[i].reduce((z,a,j)=>z+a*x[j],0);if(w%2)throw Error("lift");return w/2});for(const y of solveField(A,rhs,2,q))s4.push(x.map((v,j)=>v+2*y[j]))}
  const out=[];for(const x of s4)for(const y of s7){const a=x.map((v,j)=>v+4*mod(2*(y[j]-v),7));if(!A.every((row,i)=>mod(row.reduce((z,v,j)=>z+v*a[j],0)-b[i])===0))throw Error("CRT");out.push(a)}
  return out;
 }
 for(let q=1;q<=2;q++){let k=[4,9,13,22],a=coeffs(k,q), brute=[];for(let i=0;i<M**q;i++){let x=Array.from({length:q},(_,j)=>Math.floor(i/M**j)%M);if(k.slice(q).every((v,t)=>mod(x.reduce((z,u,j)=>z+u*k[t+q-1-j],0))===v))brute.push(x.join(","))}if(JSON.stringify(a.map(x=>x.join(",")).sort())!==JSON.stringify(brute.sort()))throw Error("brute")}
 const rk=(p,e)=>p>e?p-1:p, gp=(p,e)=>p>=e?p+1:p;
 function keyFor(c,e){return title.slice(1).map((p,i)=>{let d=mod(c[i+1]-c[i],N);if(!d)throw Error("title repeat");return mod(d-1-rk(p,e))})}
 function stream(k,a,n){let s=k.slice();for(let t=s.length;t<n;t++){let z=0;for(let j=0;j<a.length;j++)z+=a[j]*s[t-1-j];s.push(mod(z))}return s}
 function decrypt(c,s,e,hold){let p=[title[0]],t=0;for(let i=1;i<c.length;i++){let d=mod(c[i]-c[i-1],N);if(d===0){p.push(e);if(!hold)t++}else p.push(gp(mod(d-1-s[t++]),e))}return p}
 function encrypt(p,s,e,hold,iv){let c=[iv],t=0;for(let i=1;i<p.length;i++){if(p[i]===e){c.push(c[i-1]);if(!hold)t++}else c.push(mod(c[i-1]+1+mod(rk(p[i],e)+s[t++]),N))}return c}
 const escapes=Array.from({length:N},(_,i)=>i).filter(i=>!title.includes(i));
 function fit(c,truth=null){let counts=Array(8).fill(0),per=[],best=null,bestHeld=null,exact=0,n=0;
  for(const e of escapes){const k=keyFor(c,e),ec=Array(8).fill(0);for(let q=1;q<=7;q++){let aa=coeffs(k,q);ec[q]=aa.length;counts[q]+=aa.length;for(const a of aa){const s=stream(k,a,c.length);for(const hold of [false,true]){let p=decrypt(c,s,e,hold);if(!title.every((v,i)=>p[i]===v))throw Error("title mismatch");let train=score(p,13,262),held=score(p,262,c.length);n++;if(truth&&p.every((v,i)=>v===truth[i]))exact++;let v={e,q,a,hold,k,train,held};if(!best||train>best.train){best={...v,p};if(encrypt(p,s,e,hold,c[0]).some((v,i)=>v!==c[i]))throw Error("replay")}if(!bestHeld||held>bestHeld.held)bestHeld=v}}}per.push({e,counts:ec.slice(1)})}
  const ioc=(p)=>{let h=Array(N).fill(0);for(const v of p)h[v]++;return h.reduce((z,v)=>z+v*(v-1),0)/(p.length*(p.length-1))};
  const {p,...v}=best;return {counts:counts.slice(1),per,candidates:n,exact,best:{...v,trainIoC:ioc(p.slice(13,262)),heldIoC:ioc(p.slice(262)),heldExact:truth?p.slice(262).filter((v,i)=>v===truth[i+262]).length:null,excerpt:p.slice(262,362).map(x=>src.translit[x]).join("")},bestHeldDiagnostic:bestHeld}
 }
 function rnd(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 const controls=[];
 for(let d=1;d<=2;d++){const rand=rnd(0x33010600+d), e=d===1?21:28,hold=d===1,a=Array.from({length:7},()=>rand(M)),init=Array.from({length:7},()=>rand(M)),p=title.concat(ds[d].slice(5100+d*137,5100+d*137+716)),s=stream(init,a,p.length),c=encrypt(p,s,e,hold,rand(N));const f=fit(c,p);controls.push({plant:{e,hold,a,init},...f})}
 return {original:fit(orig),controls,escapes,sourceCounts:src.pages.slice(0,3).map(x=>x.indices.length),title};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
