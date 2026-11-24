'use strict';
// Historical bzip2 zero-run grammar on original raw GP blocks; exact LF gate.
const fs=require('node:fs'),path=require('node:path');
function study(data){
 const check=(x,m)=>{if(!x)throw Error(m)};
 const corpus=JSON.parse(data[0]),pages=corpus.pages.slice(0,56),C=pages.flatMap(p=>p.indices),N=C.length;check(N===12956,"source");
 const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C");let out=[];for(let i=0;i<s.length;){const x=tokens.find(t=>s.startsWith(t.t,i));if(x){out.push(x.i);i+=x.t.length}else i++}return out}
 const cw=gp(data.slice(1,4).join("\n")),raw=data[4],bk=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));check(cw.length===21611&&bk.length===18631,"donor counts");
 const D=[cw.slice(4327,4327+N),cw.slice(8655,8655+N),bk.slice(0,N)];
 function bwt(x){const n=x.length;if(!n)return {last:[],primary:0};let rank=x.slice(),order=Array.from({length:n},(_,i)=>i);for(let k=1;k<n;k*=2){order.sort((a,b)=>rank[a]-rank[b]||rank[(a+k)%n]-rank[(b+k)%n]||a-b);const nr=Array(n).fill(0);for(let j=1;j<n;j++){const a=order[j-1],b=order[j];nr[b]=nr[a]+Number(rank[a]!==rank[b]||rank[(a+k)%n]!==rank[(b+k)%n])}rank=nr;if(rank[order[n-1]]===n-1)break}return {last:order.map(i=>x[(i+n-1)%n]),primary:order.indexOf(0)}}
 function lf(x,A){const counts=new Int32Array(A),before=new Int32Array(A),seen=new Int32Array(A);for(const v of x)counts[v]++;let s=0;for(let i=0;i<A;i++){before[i]=s;s+=counts[i]}return x.map(v=>before[v]+seen[v]++)}
 function inverse(x,A,primary){const map=lf(x,A),out=Array(x.length);let row=primary;for(let i=x.length-1;i>=0;i--){out[i]=x[row];row=map[row]}return out}
 function cycles(x,A){const m=lf(x,A),seen=new Uint8Array(x.length),lengths=[];for(let i=0;i<x.length;i++)if(!seen[i]){let j=i,k=0;while(!seen[j]){seen[j]=1;k++;j=m[j]}lengths.push(k)}return lengths.sort((a,b)=>b-a)}
 // bzip2 MTF zero-run coding: RUNA digit1, RUNB digit2, LSB first.
 function encode(last,A){const list=Array.from({length:A},(_,i)=>i),out=[];let run=0;
  function flush(){let n=run;while(n>0){n--;out.push(n%2);n=Math.floor(n/2)}run=0}
  for(const p of last){const j=list.indexOf(p);if(j===0)run++;else{flush();out.push(j+1);list.splice(j,1);list.unshift(p)}}flush();return out}
 function decode(codes,A){const list=Array.from({length:A},(_,i)=>i),out=[];let run=0,pow=1;function flush(){if(run){for(let i=0;i<run;i++)out.push(list[0]);run=0;pow=1}}
  for(const t of codes){if(t<2){run+=(t+1)*pow;pow*=2;if(run>1000000)throw Error("unreasonable expansion")}else{flush();const j=t-1;if(j>=A)return null;const p=list.splice(j,1)[0];out.push(p);list.unshift(p)}}flush();return out}
 function codesFor(original,eob,a,b,rev){const symbols=Array.from({length:29},(_,i)=>i).filter(v=>v!==eob&&v!==a&&v!==b);if(rev)symbols.reverse();const map=new Int16Array(29);map[a]=0;map[b]=1;symbols.forEach((v,i)=>map[v]=i+2);return original.map(v=>map[v])}
 const positive=[];for(const d of D){const alphabet=Array.from(new Set(d)).sort((a,b)=>a-b);const p=d.map(v=>alphabet.indexOf(v));const {last,primary}=bwt(p),codes=encode(last,alphabet.length),recovered=decode(codes,alphabet.length);check(recovered.every((v,i)=>v===last[i]),"zero RLE MTF positive");check(inverse(recovered,alphabet.length,primary).every((v,i)=>v===p[i]),"native BWT zero-RLE full inverse");positive.push({alphabet:alphabet.length,plain:p.length,codes:codes.length,zeroRunCodes:codes.filter(x=>x<2).length})}
 const cuts=[0];for(const p of pages)cuts.push(cuts.at(-1)+p.indices.length);const starts=[0,3,8,15,23,28,33,40,54,56].map(i=>cuts[i]);const blocks=starts.slice(1).map((b,i)=>C.slice(starts[i],b));
 const outputs=[];
 function tryBlock(x,eobMode,id){
  const eob=eobMode?x.at(-1):-1,original=eobMode?x.slice(0,-1):x,A=eobMode?27:28;const hits=[];let tried=0,invalidEob=0,min=Infinity,max=0;
  if(eobMode&&original.includes(eob)){return {id,eobMode,eob,invalidEob:true,reason:"EOB label appears earlier in block"}}
  for(let a=0;a<29;a++)if(a!==eob)for(let b=0;b<29;b++)if(a!==b&&b!==eob)for(const rev of [false,true]){
    const codes=codesFor(original,eob,a,b,rev),last=decode(codes,A);check(last&&encode(last,A).every((v,i)=>v===codes[i])&&encode(last,A).length===codes.length,"exact original zero-RLE/MTF replay");tried++;min=Math.min(min,last.length);max=Math.max(max,last.length);
    const cy=cycles(last,A);if(cy.every(v=>v===cy[0])){const p=inverse(last,A,0);const forward=bwt(p);check(forward.last.every((v,i)=>v===last[i]),"valid circular BWT exact replay");hits.push({a,b,rev,n:last.length,cycleCount:cy.length,cycle:cy[0],plainPrefix:p.slice(0,100),plainIoC:(()=>{const h=new Uint32Array(A);p.forEach(v=>h[v]++);return h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1))})()})}
  }
  return {id,eobMode,eob,tried,min,max,valid:hits.length,hits}
 }
 outputs.push(tryBlock(C,false,"global"));outputs.push(tryBlock(C,true,"global"));
 for(let i=0;i<blocks.length;i++){outputs.push(tryBlock(blocks[i],false,"chapter"+i));outputs.push(tryBlock(blocks[i],true,"chapter"+i))}
 // A true explicitly terminated bzip2-style stream cannot contain its EOB
 // token before the end. The original block's final token determines it.
 return {N,positive,outputs};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
