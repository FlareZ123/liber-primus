#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
function main(c,n,g){
 const q=29,mod=x=>(x%q+q)%q,check=(x,m)=>{if(!x)throw Error(m)},L=Math.log(q);
 const opening=c.pages.slice(0,3).flatMap(p=>p.indices);check(opening.length===729&&opening[13]===2,"opening");
 const rows=Array.from({length:55},(_,i)=>opening.slice(14+i*13,27+i*13)),pack=r=>{const v=r.reduce((s,x)=>29n*s+BigInt(x),0n);return Array.from({length:8},(_,i)=>Number(v>>BigInt(56-8*i)&255n));};
 const tables=[g.alphabet,g.alphabet.replace("f","")].map(a=>g.rows.slice(10,23).map(r=>r.map(t=>{check([...t].every(x=>a.includes(x)),"grid alphabet");return a.length*a.indexOf(t[0])+a.indexOf(t[1]);})));
 const product=(r,B)=>Array.from({length:8},(_,i)=>mod(B.reduce((s,a,j)=>s+a[i]*r[j],0)));
 const banks=[{name:"base29-packed-BE",keys:rows.map(r=>pack(r).map(mod))},{name:"base29-packed-LE",keys:rows.map(r=>pack(r).reverse().map(mod))},...tables.map((B,i)=>({name:`physical-p50-base${60-i}-matrix-product`,keys:rows.map(r=>product(r,B))}))];
 const sections=n.sections.map(s=>({name:s.name,x:[...s.source_text].map(x=>n.runes.indexOf(x)).filter(x=>x>=0)}));
 const held=sections.filter(s=>["0_warning","jpg107-167","p56_an_end","p57_parable"].includes(s.name)),fit=sections.filter(s=>!held.includes(s));
 const u=Array(q).fill(.5),b=Array.from({length:q},()=>Array(q).fill(.5));for(const {x} of fit){for(const a of x)u[a]++;for(let i=1;i<x.length;i++)b[x[i-1]][x[i]]++;}
 const norm=a=>{const t=a.reduce((s,x)=>s+x,0);return a.map(x=>x/t);},lu=norm(u).map(Math.log),lb=b.map(a=>norm(a).map(Math.log));
 // Historical literal F: plain F maps to cipher F and does not consume the key.
 // Any consuming branch must decode a non-F plain rune, including when C=F.
 function encode(x,k,sign,hold){let j=0;return x.map(p=>{if(hold&&p===0)return 0;const c=mod(p+sign*k[j]);j=(j+1)%k.length;return c;});}
 function decode(x,k,sign,hold){
  const m=k.length,S=m*q;let states=new Float64Array(S).fill(-Infinity),backs=[],emits=[];
  for(let i=0;i<x.length;i++){
   const next=new Float64Array(S).fill(-Infinity),bp=new Int16Array(S).fill(-1);
   const emit=(j,prev,score,from)=>{const push=(p,t)=>{const v=score+(i?lb[prev][p]:lu[p]),idx=t*q+p;if(v>next[idx]){next[idx]=v;bp[idx]=from;}};if(hold&&x[i]===0)push(0,j);const p=mod(x[i]-sign*k[j]);if(!hold||p!==0)push(p,(j+1)%m);};
   if(i===0)emit(0,0,0,-2);else for(let a=0;a<S;a++)if(Number.isFinite(states[a]))emit(Math.floor(a/q),a%q,states[a],a);
   states=next;backs.push(bp);
  }
  let best=-Infinity,z=-1;for(let i=0;i<S;i++)if(states[i]>best){best=states[i];z=i;}
  if(z<0)return {score:null,plain:null};
  const out=Array(x.length);for(let i=x.length-1;i>=0;i--){out[i]=z%q;z=backs[i][z];}check(z===-2,"backtrack");
  check(encode(out,k,sign,hold).every((a,i)=>a===x[i]),"exact replay");return {score:best+x.length*L,plain:out};
 }
 const ps=c.pages.slice(3,56).filter(p=>p.indices.length);
 const read=x=>x.slice(0,100).map(a=>c.translit[a]).join("");
 const result=[];
 for(const bank of banks)for(const sign of [-1,1])for(const hold of [false,true]){
  let sum=0,chars=0,invalid=0,entries=[];for(const p of ps){const d=decode(p.indices,bank.keys[p.page-1],sign,hold);if(d.score===null)invalid++;else{sum+=d.score;chars+=p.indices.length;}entries.push({page:p.page,length:p.indices.length,key:bank.keys[p.page-1],score:d.score===null?null:d.score/p.indices.length,prefix:d.plain&&read(d.plain)});}
  result.push({name:bank.name,sign,hold,invalid,runicCount:chars,logRatio:sum,mean:sum/chars,best:entries.filter(p=>p.score!==null).sort((a,b)=>b.score-a.score).slice(0,3),entries});
 }
 const controls=[];for(const bank of banks)for(const sign of [-1,1])for(const hold of [false,true]){
  let score=0,correct=0,count=0;for(let i=0;i<held.length;i++){const p=held[i].x,k=bank.keys[2+i];const d=decode(encode(p,k,sign,hold),k,sign,hold);check(d.plain!==null,"control decode");score+=d.score;correct+=d.plain.filter((a,i)=>a===p[i]).length;count+=p.length;}
  controls.push({name:bank.name,sign,hold,score,correct,count});
 }
 return {model:{fit:fit.map(s=>s.name),held:held.map(s=>s.name)},p50ColumnSums:tables.map(t=>Array.from({length:8},(_,i)=>mod(t.reduce((s,r)=>s+r[i],0)))),results:result,controls};
}
console.log(JSON.stringify(main(...["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/base60-grid.json"].map(p=>JSON.parse(fs.readFileSync(p,"utf8")))),null,2));
