'use strict';
// Source-typed raw GP29 BWT+adaptive-rank pipeline: original inverse and all-secret rank phase bound.
const fs=require('node:fs'),path=require('node:path');
function study(data){
 const check=(x,m)=>{if(!x)throw Error(m)};
 const corpus=JSON.parse(data[0]),pages=corpus.pages.slice(0,56),c=pages.flatMap(p=>p.indices),N=c.length;check(N===12956,"source count");
 const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C");let out=[];for(let i=0;i<s.length;){const x=tokens.find(t=>s.startsWith(t.t,i));if(x){out.push(x.i);i+=x.t.length}else i++}return out}
 const cw=gp(data.slice(1,4).join("\n")),raw=data[4],bk=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));check(cw.length===21611&&bk.length===18631,"donor counts");
 const donors=[cw.slice(0,N),cw.slice(4327,4327+N),cw.slice(8655,8655+N),bk.slice(0,N),bk.slice(5675,5675+N)];
 const cuts=[0];for(const p of pages)cuts.push(cuts.at(-1)+p.indices.length);const spans=x=>x.slice(1).map((b,i)=>[x[i],b]);
 const regimes=[{id:"global",ss:[[0,N]],max:3301},{id:"chapter",ss:spans([0,3,8,15,23,28,33,40,54,56].map(i=>cuts[i])),max:1033},{id:"page",ss:spans(cuts),max:130}];
 // Standard cyclic BWT via prefix doubling, no guessed primary index.
 function bwt(x,rev=false){const n=x.length;if(!n)return {last:[],primary:0};let rank=x.map(v=>rev?28-v:v),order=Array.from({length:n},(_,i)=>i);
  for(let k=1;k<n;k*=2){order.sort((a,b)=>rank[a]-rank[b]||rank[(a+k)%n]-rank[(b+k)%n]||a-b);const nr=Array(n).fill(0);for(let j=1;j<n;j++){const a=order[j-1],b=order[j];nr[b]=nr[a]+Number(rank[a]!==rank[b]||rank[(a+k)%n]!==rank[(b+k)%n])}rank=nr;if(rank[order[n-1]]===n-1)break}
  return {last:order.map(i=>x[(i+n-1)%n]),primary:order.indexOf(0)}}
 function lf(x,rev=false){const counts=new Int32Array(29),before=new Int32Array(29),seen=new Int32Array(29);for(const v of x)counts[v]++;let s=0;for(let i=0;i<29;i++){const v=rev?28-i:i;before[v]=s;s+=counts[v]}return x.map(v=>before[v]+seen[v]++)}
 function inverse(x,primary,rev=false){const map=lf(x,rev),out=Array(x.length);let row=primary;for(let i=x.length-1;i>=0;i--){out[i]=x[row];row=map[row]}return out}
 function cycles(x,rev=false){const map=lf(x,rev),seen=new Uint8Array(x.length),lengths=[];for(let i=0;i<x.length;i++)if(!seen[i]){let j=i,k=0;while(!seen[j]){seen[j]=1;k++;j=map[j]}lengths.push(k)}return lengths.sort((a,b)=>b-a)}
 function mtf(x,inverse,back,rev,initial){const L=initial?initial.slice():Array.from({length:29},(_,i)=>rev?28-i:i);return x.map(v=>{const rank=inverse?v:L.indexOf(v),p=L.splice(rank,1)[0];if(back)L.push(p);else L.unshift(p);return inverse?p:rank})}
 function ranks(x){const L=[];return x.map(v=>{const j=L.indexOf(v);if(j>=0)L.splice(j,1);L.unshift(v);return j})}
 function pairCount(x,q,ss,counts){let t=0;for(const [a,b] of ss){counts.fill(0,0,29*q);for(let i=a;i<b;i++){const v=x[i];if(v>=0)t+=counts[((i-a)%q)*29+v]++}}return t}
 const direct=[];const bounds=[];
 for(const {id,ss,max}of regimes){
  // Test all blocks with canonical BWT alphabet and reversed alphabet;
  // rank update orientation and starting list fixed by matching alphabet.
  for(const rev of [false,true])for(const back of [false,true]){let valid=0,blocks=0,first=null;for(const [a,b]of ss){if(a===b)continue;const original=c.slice(a,b),last=mtf(original,true,back,rev);check(mtf(last,false,back,rev).every((v,i)=>v===original[i]),"original MTF replay");const ls=cycles(last,rev);if(first===null)first=ls;if(ls.every(v=>v===ls[0]))valid++;blocks++}direct.push({id,rev,back,blocks,valid,firstCycleCount:first.length,firstLargestCycles:first.slice(0,12)})}
  for(const rev of [false,true]){
   const D=donors.map(d=>{const out=new Int16Array(N);out.fill(-1);for(const [a,b]of ss){if(a===b)continue;const p=d.slice(a,b),{last,primary}=bwt(p,rev);check(inverse(last,primary,rev).every((v,i)=>v===p[i]),"BWT donor inverse");const cy=cycles(last,rev);check(cy.every(v=>v===cy[0]),"BWT cycle condition");const R=ranks(last);out.set(R,a);
    for(const back of [false,true]){const init=Array.from({length:29},(_,i)=>(i*7+3)%29);const rank=mtf(last,false,back,rev,init);check(mtf(rank,true,back,rev,init).every((v,i)=>v===last[i]),"native BWT-MTF inverse");for(let j=0;j<R.length;j++)if(R[j]>=0)check(rank[j]===(back?28-R[j]:R[j]),"initial-order independence")}}
    return out});
   const counts=new Uint16Array(29*max),fail=[],checks=[];let minGap=Infinity,qMin=0;
   for(let q=1;q<=max;q++){const x=pairCount(c,q,ss,counts),y=D.map(d=>pairCount(d,q,ss,counts)),g=Math.min(...y)-x;if(g<=0)fail.push(q);if(g<minGap){minGap=g;qMin=q}if([1,13,31,403,840,1033,3301].includes(q))checks.push({q,x,y,g})}
   bounds.push({id,rev,max,excluded:max-fail.length,fail,minGap,qMin,checks});
  }
 }
 return {N,direct,bounds};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
