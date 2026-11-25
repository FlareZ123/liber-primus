'use strict';
const fs=require('node:fs');
function experiment(gp,T,ink,punct){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const rows=[],words=[],digits=new Set(),offsets=[0];
 for(const p of gp.pages)offsets.push(offsets.at(-1)+p.indices.length);
 let raw=0,p=0,o=0,line=0,cur=[],lastSep="",preceding="";
 function finish(sep){if(cur.length){words.push({id:words.length,rs:cur,v:cur.map(x=>x.i),before:preceding,after:sep});cur=[];}if(sep)lastSep=sep}
 for(const s of T.split(/\r?\n/)){
  if(s==="%"){raw++;p=raw+(raw>=50?1:0);o=0;line=0;continue}
  if(s==="$")continue;if(s==="&"){finish("&");continue}if(p>=56)break;
  const rec=[];
  for(const c of s){
   const i=gp.runes.indexOf(c);
   if(i>=0){if(!cur.length)preceding=lastSep;const t={i,p,o:o++,line,col:rec.length};cur.push(t);rec.push(t)}
   else if(c==="-"||c===".")finish(c);
   else if(/[0-9]/.test(c))digits.add(offsets[p]+o);
  }
  if(rec.length){rows.push({p,line,rs:rec});line++}
 }
 finish("");
 const flat=words.flatMap(w=>w.v),canonical=gp.pages.slice(0,56).flatMap(p=>p.indices);
 assert(flat.length===12956&&same(flat,canonical),"canonical tape");
 assert(words.length===2896,"word count "+words.length);assert(rows.length===594,"rows "+rows.length);
 assert(words.filter(w=>w.rs[0].p!==w.rs.at(-1).p).length===32,"carry");
 const rowLengths=new Map(rows.map(x=>[`${x.p}:${x.line}`,x.rs.length]));
 const marks=new Set([...punct.events.map(e=>e.rune_offset),...digits]),red=new Set();
 for(const p of ink.pages){
  for(const [o] of p.large_punctuation||[])marks.add(offsets[p.page]+o);
  for(const s of p.red_spans||[])for(let i=s.start;i<s.start+s.length;i++)red.add(offsets[p.page]+i);
 }
 const bounds=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const ch=words.map(w=>bounds.findIndex(([lo,hi])=>w.rs[0].p>=lo&&w.rs[0].p<=hi));
 const eligible=words.map(w=>{
  const a=w.rs[0],b=w.rs.at(-1),reasons=[];
  if(a.p!==b.p||a.line!==b.line)reasons.push("carry");
  if(a.col===0||b.col===rowLengths.get(`${b.p}:${b.line}`)-1)reasons.push("lineEdge");
  if(w.before!=="-"||w.after!=="-")reasons.push("punctuation");
  if(w.rs.some(x=>{let i=offsets[x.p]+x.o;return red.has(i)||marks.has(i)||marks.has(i+1)}))reasons.push("ink-or-literal");
  if(w.id===0||w.id===words.length-1||ch[w.id]!==ch[w.id-1]||ch[w.id]!==ch[w.id+1])reasons.push("chapter");
  return {w,reasons};
 });
 function fact(n){let x=1n;for(let k=2n;k<=BigInt(n);k++)x*=k;return x}
 function hist(a,n,fn){const out=Array(n).fill(0);for(let i=0;i<a.length;i++){const x=fn(a,i);if(x!==null)out[x]++}return out}
 function verify(alt,scope){
  assert(alt.every((v,i)=>v.length===words[i].v.length&&v[0]===words[i].v[0]&&v.at(-1)===words[i].v.at(-1)),"slot invariants");
  assert(alt.every((v,i)=>!eligible[i].reasons.length||same(v,words[i].v)),"frozen");
  const changed=alt.flat();
  if(scope==="page"||scope==="line")for(let p=0;p<56;p++){
   const a=flat.slice(offsets[p],offsets[p+1]),b=changed.slice(offsets[p],offsets[p+1]);
   assert(same(hist(a,29,(v,i)=>v[i]),hist(b,29,(v,i)=>v[i])),"page unigram");
   assert(same(hist(a,841,(v,i)=>i?v[i-1]*29+v[i]:null),hist(b,841,(v,i)=>i?v[i-1]*29+v[i]:null)),"page bigram");
  }
  if(scope==="line")for(const row of rows){
   const i=offsets[row.p]+row.rs[0].o,len=row.rs.length,a=flat.slice(i,i+len),b=changed.slice(i,i+len);
   assert(same(hist(a,29,(v,i)=>v[i]),hist(b,29,(v,i)=>v[i])),"line unigram");
   assert(same(hist(a,841,(v,i)=>i?v[i-1]*29+v[i]:null),hist(b,841,(v,i)=>i?v[i-1]*29+v[i]:null)),"line bigram");
  }
  return alt.filter((v,i)=>!same(v,words[i].v)).length;
 }
 const out={wordCount:words.length,runeCount:flat.length,rowCount:rows.length,eligible:eligible.filter(x=>!x.reasons.length).length,tiers:[]};
 for(const scope of ["chapter","page","line"]){
  const map=new Map();
  for(const {w,reasons} of eligible){
   if(reasons.length)continue;
   const a=w.rs[0],k=[scope==="chapter"?ch[w.id]:a.p,scope==="line"?a.line:-1,w.v[0],w.v.at(-1),w.v.length].join(",");
   if(!map.has(k))map.set(k,[]);map.get(k).push(w);
  }
  let num=1n,classes=[],alt=words.map(w=>w.v.slice());
  for(const arr of map.values()){
   const counts=new Map();
   for(const w of arr){const k=w.v.join(",");counts.set(k,(counts.get(k)||0)+1)}
   if(counts.size<2)continue;
   let f=fact(arr.length);for(const n of counts.values())f/=fact(n);num*=f;
   const j=arr.findIndex(w=>!same(w.v,arr[0].v));
   [alt[arr[0].id],alt[arr[j].id]]=[alt[arr[j].id],alt[arr[0].id]];
   classes.push({ids:arr.map(w=>w.id),page:arr.map(w=>w.rs[0].p),line:arr.map(w=>w.rs[0].line),offset:arr.map(w=>w.rs[0].o),runes:arr.map(w=>w.v.map(i=>gp.translit[i])),primeSums:arr.map(w=>w.v.reduce((s,i)=>s+gp.prime[i],0)),swapped:[arr[0].id,arr[j].id],forms:counts.size,capacity:f.toString()});
  }
  const moved=verify(alt,scope);
  out.tiers.push({scope,classes:classes.length,count:num.toString(),bits:Math.log2(Number(num)),moved,allClasses:classes});
 }
 // Independently enumerate every binary line-local witness and verify all 594 line matrices.
 const local=out.tiers[2].allClasses;assert(local.every(c=>c.ids.length===2),"binary line classes");
 const witnesses=new Set();
 for(let mask=0;mask<2**local.length;mask++){
  const alt=words.map(w=>w.v.slice());
  for(let j=0;j<local.length;j++)if(mask&(1<<j)){const [a,b]=local[j].ids;[alt[a],alt[b]]=[alt[b],alt[a]]}
  verify(alt,"line");witnesses.add(alt.flat().join(","));
 }
 assert(BigInt(witnesses.size)===BigInt(out.tiers[2].count),"line witness count");
 out.lineWitnessCount=witnesses.size;
 return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-punctuation-identity.json"];
const a=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),a[1],JSON.parse(a[2]),JSON.parse(a[3])),null,2));
