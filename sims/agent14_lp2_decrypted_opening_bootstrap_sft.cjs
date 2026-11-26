#!/usr/bin/env node
"use strict";
// Exact cyclic maximum for the conditional decrypted-opening page-key bootstrap.
const fs=require("node:fs");
function main(c,n){
 const q=29,mod=x=>(x%q+q)%q,check=(x,m)=>{if(!x)throw Error(m)},L=Math.log(q);
 const pages=c.pages.slice(0,56).map(p=>p.indices),n0=pages[0].length-14,n1=pages[1].length,n2=pages[2].length;
 check(n0===248&&n1===266&&n2===201,"opening lengths");
 const ss=n.sections.map(s=>({name:s.name,x:[...s.source_text].map(x=>n.runes.indexOf(x)).filter(x=>x>=0)}));
 const held=ss.filter(s=>["0_warning","jpg107-167","p56_an_end","p57_parable"].includes(s.name)),fit=ss.filter(s=>!held.includes(s));
 const u=Array(q).fill(.5),b=Array.from({length:q},()=>Array(q).fill(.5));
 for(const {x} of fit){for(const a of x)u[a]++;for(let i=1;i<x.length;i++)b[x[i-1]][x[i]]++;}
 const norm=a=>{const t=a.reduce((s,x)=>s+x,0);return a.map(x=>Math.log(x/t)+L);},lu=norm(u),lb=b.map(norm);
 const score=x=>x.length?x.slice(1).reduce((v,a,i)=>v+lb[x[i]][a],lu[x[0]]):0;
 const rows=x=>Array.from({length:55},(_,i)=>x.slice(13*i,13*i+13));
 function setup(ps,s){
  const a=ps[0].slice(14),k0=a.slice(0,13),k1=a.slice(13,26);
  // Each triple is [constant, coefficient, mask index].
  const bank=rows(a.map((v,i)=>[v,-1,i%13]).concat(
   ps[1].map((v,i)=>[mod(v-s*k0[i%13]),s,i%13]),
   ps[2].map((v,i)=>[mod(v-s*k1[i%13]),s,i%13])));
  const entries=ps.slice(3).map((x,j)=>({page:j+3,x,terms:x.map((v,i)=>{const [a,b,k]=bank[j+2][i%13];return [mod(v-s*a),-s*b,k]})})).filter(e=>e.x.length);
  const seam=entries.filter(e=>e.terms.slice(1).some((a,i)=>a[2]!==((e.terms[i][2]+1)%13))).map(e=>e.page);
  check(JSON.stringify(seam)==="[20,40]","expected seam-key pages");
  return {bank,entries,seam};
 }
 const read=(t,k)=>t.map(([a,b,j])=>mod(a+b*k[j]));
 function optimize(es){
  const U=Array.from({length:13},()=>new Float64Array(q)),T=Array.from({length:13},()=>new Float64Array(q*q));
  let count=0;
  for(const e of es){const t=e.terms;count+=t.length;const [a,b,j]=t[0];for(let k=0;k<q;k++)U[j][k]+=lu[mod(a+b*k)];
   for(let i=1;i<t.length;i++){const [a,b,j]=t[i-1],[d,f,h]=t[i];check(h===(j+1)%13,"noncycle edge");for(let k=0;k<q;k++)for(let l=0;l<q;l++)T[j][q*k+l]+=lb[mod(a+b*k)][mod(d+f*l)];}
  }
  let best=-Infinity,key=null;
  for(let root=0;root<q;root++){
   let dp=new Float64Array(q).fill(-Infinity);dp[root]=U[0][root];const back=[];
   for(let j=1;j<13;j++){const next=new Float64Array(q).fill(-Infinity),prev=new Int8Array(q);for(let l=0;l<q;l++){for(let k=0;k<q;k++){const v=dp[k]+T[j-1][q*k+l]+U[j][l];if(v>next[l]){next[l]=v;prev[l]=k;}}}dp=next;back.push(prev);}
   for(let last=0;last<q;last++){const v=dp[last]+T[12][q*last+root];if(v>best){best=v;key=Array(13);key[12]=last;for(let j=12;j>0;j--)key[j-1]=back[j-1][key[j]];check(key[0]===root,"trace");}}
  }
  const direct=es.reduce((v,e)=>v+score(read(e.terms,key)),0);check(Math.abs(best-direct)<1e-6,"score trace");
  return {count,best,key,mean:best/count};
 }
 function decode(ps,s,k){
  const p0=ps[0].slice(14).map((v,i)=>mod(v-k[i%13]));const a=p0.slice(0,13),b=p0.slice(13,26);
  const p1=ps[1].map((v,i)=>mod(v-s*a[i%13])),p2=ps[2].map((v,i)=>mod(v-s*b[i%13]));const bank=rows(p0.concat(p1,p2));
  const later=ps.slice(3).map((x,j)=>x.map((v,i)=>mod(v-s*bank[j+2][i%13])));
  check(p0.every((v,i)=>mod(v+k[i%13])===ps[0][14+i]),"p0 replay");
  check(p1.every((v,i)=>mod(v+s*a[i%13])===ps[1][i])&&p2.every((v,i)=>mod(v+s*b[i%13])===ps[2][i]),"p1/p2 replay");
  check(later.every((x,j)=>x.every((v,i)=>mod(v+s*bank[j+2][i%13])===ps[j+3][i])),"later replay");
  return {bank,later};
 }
 function evalOne(ps,s){
  const {entries,seam}=setup(ps,s),tr=entries.filter(e=>e.page<40&&!seam.includes(e.page)),te=entries.filter(e=>e.page>=40&&!seam.includes(e.page)),all=tr.concat(te),f=optimize(tr),g=optimize(all),d=decode(ps,s,f.key);
  check(entries.every(e=>read(e.terms,f.key).every((v,i)=>v===d.later[e.page-3][i])),"linear reduction");
  const heldScore=te.reduce((v,e)=>v+score(read(e.terms,f.key)),0),heldCount=te.reduce((v,e)=>v+e.x.length,0);
  const pageScores=entries.map(e=>({page:e.page,n:e.x.length,mean:score(d.later[e.page-3])/e.x.length,prefix:d.later[e.page-3].slice(0,45).map(i=>c.translit[i]).join(" ")}));
  return {sign:s,seam,f,all:g,heldCount,heldScore,heldMean:heldScore/heldCount,allPageMean:d.later.reduce((v,x)=>v+score(x),0)/d.later.flat().length,p55:pageScores.find(e=>e.page===55),bestPages:pageScores.sort((a,b)=>b.mean-a.mean).slice(0,3),decoded:d};
 }
 function plant(seed,s,di){
  let z=seed>>>0;const rand=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return (z>>>0)%q;};
  const mask=Array.from({length:13},rand),bank=Array.from({length:715},rand),ks=rows(bank);
  const p0=bank.slice(0,n0),p1=bank.slice(n0,n0+n1),p2=bank.slice(n0+n1);
  const truth=pages.slice(3).map((a,j)=>{const donor=held[(j+di)%held.length].x;return a.map((_,i)=>donor[(i+j*17)%donor.length]);});
  const ps=[pages[0].slice(0,14).concat(p0.map((v,i)=>mod(v+mask[i%13]))),p1.map((v,i)=>mod(v+s*ks[0][i%13])),p2.map((v,i)=>mod(v+s*ks[1][i%13])),...truth.map((x,j)=>x.map((v,i)=>mod(v+s*ks[j+2][i%13])))];
  const o=evalOne(ps,s),out=o.decoded.later;return {seed,s,mask,found:o.f.key,keyMatches:o.f.key.filter((x,i)=>x===mask[i]).length,truthBankMatches:o.decoded.bank.flat().filter((x,i)=>x===bank[i]).length,allMatches:out.flat().filter((x,i)=>x===truth.flat()[i]).length,total:truth.flat().length,fitMean:o.f.mean,heldMean:o.heldMean,allMean:o.all.mean};
 }
 const original=[-1,1].map(s=>{const o=evalOne(pages,s);delete o.decoded;return o;});
 const controls=[plant(140026,-1,0),plant(140027,1,1)];
 return {fitSections:fit.map(s=>s.name),heldSections:held.map(s=>s.name),original,controls};
}
console.log(JSON.stringify(main(...["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>JSON.parse(fs.readFileSync(p,"utf8")))),null,2));
