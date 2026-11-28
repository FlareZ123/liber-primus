'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,punct,native,transcription){
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const R=corpus.runes, L=corpus.translit, A="0123456789ABCDEFGHIJKLMNOPQRS";
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const encode=d=>d.reduce((a,b)=>29n*a+BigInt(b),0n);
  const digits=(x,n)=>{const a=Array(n).fill(0);for(let i=n-1;i>=0;i--){a[i]=Number(x%29n);x/=29n}assert(x===0n,"overflow");return a};
  const inverse=(a,m)=>{let r=m,s=a,t=0n,u=1n;while(s){const q=r/s;[r,s]=[s,r-q*s];[t,u]=[u,t-q*u]}assert(r===1n,"nonunit");return (t%m+m)%m};
  function recip(d){let x=encode(d),v=0;if(x===0n)return d.slice();while(x%29n===0n){x/=29n;v++}return digits(29n**BigInt(v)*inverse(x,29n**BigInt(d.length-v)),d.length)}
  const radix=n=>{let o="";do{o=A[Number(n%29n)]+o;n/=29n}while(n);return o};
  const vectors=[[3301n,"3QO"],[1033n,"16I"],[30n,"11"]];for(const [n,s] of vectors)assert(radix(n)===s,"BASE29 mismatch");
  for(let n=1;n<=3;n++){const lim=29**n;for(let i=0;i<lim;i++){const d=digits(BigInt(i),n),p=recip(d);assert(eq(recip(p),d),"exhaustive involution")}}
  const nativeFrames=s=>s.split(/[⁘⁜]/u).map(x=>Array.from(x).map(r=>R.indexOf(r)).filter(i=>i>=0)).filter(x=>x.length);
  const training=native.sections.filter(s=>!s.name.startsWith("p5")).flatMap(s=>nativeFrames(s.source_text));
  const tri=new Map(),bi=new Map();for(const d of training)for(let i=2;i<d.length;i++){let k=d[i-2]*29+d[i-1],h=k*29+d[i];bi.set(k,(bi.get(k)||0)+1);tri.set(h,(tri.get(h)||0)+1)}
  const score=frames=>{let s=0,n=0;for(const d of frames)for(let i=2;i<d.length;i++){let k=d[i-2]*29+d[i-1],h=k*29+d[i];s+=Math.log(((tri.get(h)||0)+0.1)/((bi.get(k)||0)+2.9));n++}return {mean:s/n,trigrams:n}};
  const toLatin=d=>d.map(i=>L[i]).join("");
  const render=d=>d.map(i=>R[i]).join("");
  const info=frames=>({frames:frames.length,runes:frames.reduce((a,d)=>a+d.length,0),nonunits:frames.filter(d=>d.at(-1)===0).length,leadingZeros:frames.filter(d=>d[0]===0).length,score:score(frames),lengths:frames.map(d=>d.length)});
  const controls=native.sections.map(s=>{const p=nativeFrames(s.source_text),c=p.map(recip),back=c.map(recip);assert(back.every((d,i)=>eq(d,p[i])),"native plant");return {name:s.name,plain:info(p),encrypted:info(c),recovered:info(back),exact:true}});
  const all=corpus.pages.flatMap(p=>p.indices);
  const p57=native.sections.find(s=>s.name==="p57_parable");assert(eq(nativeFrames(p57.source_text).flat(),corpus.pages[57].indices),"p57 native source mismatch");
  const p56=native.sections.find(s=>s.name==="p56_an_end");const p56plain=nativeFrames(p56.source_text).flat();let k=0,prime=1;const nextPrime=()=>{while(true){prime++;let good=true;for(let d=2;d*d<=prime;d++)if(prime%d===0){good=false;break}if(good)return prime}};
  const p56enc=p56plain.map(x=>{if(x===0)return 0;k++;return (x+nextPrime()-1)%29});assert(eq(p56enc,corpus.pages[56].indices),"p56 real control mismatch");
  const t=Array.from(transcription);const runeTape=t.map(r=>R.indexOf(r)).filter(x=>x>=0);assert(eq(runeTape,all),"normalized tape mismatch");
  const ranges=[[0,2],[3,7]],results=[];
  for(const [p0,p1] of ranges){
    const start=corpus.pages.slice(0,p0).reduce((a,p)=>a+p.indices.length,0),end=corpus.pages.slice(0,p1+1).reduce((a,p)=>a+p.indices.length,0);
    const cuts=[start,...new Set(punct.events.filter(e=>e.rune_offset>start&&e.rune_offset<end&&["⁘","⁜"].includes(e.symbol)&&e.original_ink_event!==false).map(e=>e.rune_offset)),end].sort((a,b)=>a-b);
    const c=cuts.slice(1).map((b,i)=>all.slice(cuts[i],b)),p=c.map(recip);assert(p.every((d,i)=>eq(recip(d),c[i])),"original replay");
    let i=0;const flat=p.flat();let candidate="",candidateLatin="",absolute=0;
    for(const char of t){const d=R.indexOf(char);if(d>=0){if(absolute>=start&&absolute<end){candidate+=R[flat[i]];candidateLatin+=L[flat[i]];i++}absolute++}else if(absolute>start&&absolute<end){candidate+=char;candidateLatin+=char}}
    assert(i===end-start,"layout rendering");
    results.push({pages:[p0,p1],start,end,cuts,input:info(c),output:info(p),frames:p.map((d,i)=>({start:cuts[i],end:cuts[i+1],cipherDigits:c[i].map(x=>A[x]).join(""),plainDigits:d.map(x=>A[x]).join(""),plainRunes:render(d),latin:toLatin(d)})),candidate,candidateLatin,exactReplay:true});
  }
  return {definition:"Fixed big-endian GP29 ordinal, clause boundaries at original ⁘/⁜ and chapter endpoints, zero fixed, valuation-preserving unit reciprocal modulo 29^(n-v); printed spaces carried through unchanged only as a display hypothesis",historicalVectors:3,exhaustiveWidths:[1,2,3],exhaustiveCases:29+29**2+29**3,realP57:95,realP56:p56plain.length,p56Consuming:k,trainingFrames:training.length,controls,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-punctuation-identity.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp2-image-corrected.txt"];
const root=path.resolve(__dirname,'..');
const files=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
const result=run(...files.slice(0,3).map(JSON.parse),files[3]);
result.inputBlobs=Object.fromEntries(paths.map((p,i)=>[p,require('node:crypto').createHash('sha1').update('blob '+Buffer.byteLength(files[i])+'\0').update(files[i]).digest('hex')]));
console.log(JSON.stringify(result,null,2));
