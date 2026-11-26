#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
function main(c,n){
 const q=29,mod=x=>(x%q+q)%q,L=Math.log(q),check=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const trim=a=>{a=a.map(mod);while(a.length&&a.at(-1)===0)a.pop();return a;},inv=x=>Array.from({length:q},(_,i)=>i).find(i=>mod(i*x)===1);
 function divmod(a,b){a=trim(a);b=trim(b);check(b.length,"zero divisor");const Q=Array(Math.max(0,a.length-b.length+1)).fill(0),u=inv(b.at(-1));while(a.length>=b.length){const j=a.length-b.length,z=mod(a.at(-1)*u);Q[j]=z;for(let i=0;i<b.length;i++)a[j+i]=mod(a[j+i]-z*b[i]);a=trim(a);}return[trim(Q),a];}
 function mul(a,b){if(!a.length||!b.length)return[];const c=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[i+j]=mod(c[i+j]+a[i]*b[j]);return trim(c);}
 function sub(a,b){return trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>mod((a[i]||0)-(b[i]||0))));}
 function bezout(a,b){let s=[1],t=[];while(b.length){const [k,r]=divmod(a,b);[a,b]=[b,r];[s,t]=[t,sub(s,mul(k,t))];}const u=inv(a.at(-1));return {g:a.map(x=>mod(x*u)),coef:s.map(x=>mod(x*u))};}
 function cyclic(a,b,len){const c=Array(len).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[(i+j)%len]=mod(c[(i+j)%len]+a[i]*b[j]);return c;}
 const opening=c.pages.slice(0,3).flatMap(p=>p.indices);check(opening.length===729&&opening[13]===2,"partition");
 const rows=Array.from({length:55},(_,i)=>opening.slice(14+i*13,27+i*13));
 const sections=n.sections.map(s=>({name:s.name,x:[...s.source_text].map(r=>n.runes.indexOf(r)).filter(v=>v>=0)}));
 const held=sections.filter(s=>["0_warning","jpg107-167","p56_an_end","p57_parable"].includes(s.name)),fit=sections.filter(s=>!held.includes(s));
 const u=Array(q).fill(.5),b=Array.from({length:q},()=>Array(q).fill(.5));for(const {x} of fit){for(const a of x)u[a]++;for(let i=1;i<x.length;i++)b[x[i-1]][x[i]]++;}
 const norm=a=>{const s=a.reduce((x,y)=>x+y,0);return a.map(x=>x/s)},lu=norm(u).map(x=>Math.log(x)+L),lb=b.map(a=>norm(a).map(x=>Math.log(x)+L));
 function score(p){let s=lu[p[0]];for(let i=1;i<p.length;i++)s+=lb[p[i-1]][p[i]];return s/p.length;}
 const read=x=>x.slice(0,100).map(a=>c.translit[a]).join("");
 const ps=c.pages.slice(1,56).filter(p=>p.indices.length);
 const results=[],controls=[];
 for(const orient of [-1,1]){
   const rr=[];
   for(const p of ps){
    const N=p.indices.length,r=rows[p.page-1],kernel=Array(N).fill(0);
    for(let i=0;i<13;i++)kernel[(orient*i+N)%N]=r[i];
    const f=Array(N+1).fill(0);f[0]=28;f[N]=1;
    const {g,coef}=bezout(trim(kernel),f);check(eq(cyclic(kernel,coef,N),g.concat(Array(N-g.length).fill(0))),"Bezout");
    const d=divmod(p.indices,g)[1],row={page:p.page,length:N,nullity:g.length-1,compatible:!d.length,remainder:d,gcd:g};
    if(g.length===1){
     const invPlain=cyclic(p.indices,coef,N);check(eq(cyclic(invPlain,kernel,N),p.indices),"inverse replay");
     const directPlain=cyclic(p.indices,kernel,N);check(eq(cyclic(directPlain,coef,N),p.indices),"direct replay");
     row.inverseScore=score(invPlain);row.inversePrefix=read(invPlain);row.directScore=score(directPlain);row.directPrefix=read(directPlain);
     // Control: take a native section long enough, cycling sections deterministically.
     const eligible=held.filter(s=>s.x.length>=N);if(eligible.length){const plain=eligible[p.page%eligible.length].x.slice(0,N),C=cyclic(plain,kernel,N);check(eq(cyclic(C,coef,N),plain),"native planted inverse");controls.push({orient,page:p.page,source:eligible[p.page%eligible.length].name,count:N,score:score(plain),recovered:N});}
    }
    if(g.length>1&&!d.length){const [cg,rem]=divmod(p.indices,g);check(!rem.length,"divisibility");const p0=cyclic(cg,coef,N);check(eq(cyclic(p0,kernel,N),p.indices),"singular particular solution");
     // All solutions are P0 + (f/g)*t, deg(t)<deg(g). Enumerate exact.
     const [fg,rem2]=divmod(f,g);check(!rem2.length,"annihilator");const dim=g.length-1,Nkeys=q**dim;
     let best=-Infinity,bestP=null;
     for(let k=0;k<Nkeys;k++){
      let a=k;const t=Array.from({length:dim},()=>{const v=a%q;a=Math.floor(a/q);return v;});
      const delta=mul(fg,t),p1=p0.map((x,i)=>mod(x+(delta[i]||0))),v=score(p1);
      if(v>best){best=v;bestP=p1;}
     }
     check(eq(cyclic(bestP,kernel,N),p.indices),"singular best replay");row.inverseScore=best;row.inversePrefix=read(bestP);row.singularSolutions=Nkeys;
    }
    rr.push(row);
   }
   results.push({orient,rows:rr,nonInvertible:rr.filter(x=>x.nullity),incompatible:rr.filter(x=>!x.compatible).map(x=>x.page)});
 }
 return {results,controls};
}
console.log(JSON.stringify(main(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
