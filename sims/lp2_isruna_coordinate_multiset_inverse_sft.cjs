'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];

/** @param {string[]} files */
function run(files){
 const assert=(a,msg)=>{if(!a)throw Error(msg)};
 const corpus=JSON.parse(files[0]),T=corpus.translit, ix=new Map(corpus.runes.map((r,i)=>[r,i])), labels=new Map(T.map((t,i)=>[t,i]));
 const tokenize=(w,mode=0)=>{w=w.toUpperCase().replace(/QU/g,mode?"CU":"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){let tok=["ING","TH","NG","EO","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t,i)&&!(mode&&["ING","IO"].includes(t)))||w[i];let n=labels.get(tok==="ING"?"NG":tok==="IO"?"IA":tok);if(n!==undefined)out.push(n);i+=tok.length}return out};
 const parse=s=>{let words=[],w=[];for(const ch of s){if(ix.has(ch))w.push(ix.get(ch));else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)){if(w.length)words.push(w);w=[]}}if(w.length)words.push(w);return words};
 const words=parse(files[1].split("%").slice(0,55).join("%")),tape=words.flat();
 const canon=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(tape.length===12956&&words.length===2896&&tape.every((x,i)=>x===canon[i]),"canonical transcript");
 const opening=canon.slice(13,729),openingWords=[];let off=0;for(let w of words){let end=off+w.length;if(off>=13&&end<=729)openingWords.push(w);off=end}assert(openingWords.flat().length===716,"opening boundary");
 const solved=parse(files[1].split("%").slice(56,57).join("%"));assert(solved.flat().length===95&&solved.flat().every((x,i)=>x===corpus.pages[57].indices[i]),"p57 control");
 const sal=[T.slice(0,8),T.slice(8,16),T.slice(16,24),["A","AE","Y","EA"]];
 const dom=[...sal[0],...sal[1],"T","B","E","M","L","NG","D","OE","A","AE","Y","EA","IA","Q","K","ST","GAR"];
 const boards=[];
 function add(name,rows){let loc=Array(29),cells=new Map();rows.forEach((row,r)=>row.forEach((s,c)=>{if(!labels.has(s))return;let x=labels.get(s);assert(loc[x]===undefined,"duplicate");loc[x]=[r,c];cells.set(r+","+c,x)}));assert(loc.filter(Boolean).length===29,"missing");const R=rows.length,C=Math.max(...rows.map(r=>r.length));boards.push({name,loc,cells,R,C})}
 for(let i=0;i<=4;i++){let late=sal[3].slice();late.splice(i,0,"IA");add("Salzburg+Ior slot "+(i+1),[...sal.slice(0,3),late])}
 for(const lens of [[8,8,17],[8,8,12,5],[8,8,8,9]]){let k=0;add("Domitian "+lens.join("+"),lens.map(n=>{let a=dom.slice(k,k+n);k+=n;return a}))}
 const donors=files.slice(3).map(t=>tokenize(t));
 const lex=new Map();
 for(const line of files[2].split(/\r?\n/)){let m=line.match(/^([a-z]+)\s+(\d+)\s*$/i);if(!m)continue;for(let mode=0;mode<2;mode++){let a=tokenize(m[1],mode);if(!a.length)continue;let k=a.join(",");let old=lex.get(k);if(!old||old.freq<+m[2])lex.set(k,{a,w:m[1],freq:+m[2]})}}
 const known=new Set(solved.map(w=>w.join(",")));
 for(let w of solved){let k=w.join(",");if(!lex.has(k))lex.set(k,{a:w,w:w.map(x=>T[x]).join(""),freq:1})}
 function counts(a,b){let h=Array(b.R+b.C).fill(0);for(let x of a){let [r,c]=b.loc[x];h[r]++;h[b.R+c]++}return h}
 function sig(a,b){return counts(a,b).join(",")}
 function route(p,c,b){let rp=Array.from({length:b.R},()=>[]),cp=Array.from({length:b.C},()=>[]);p.forEach((x,i)=>{let [r,k]=b.loc[x];rp[r].push(i);cp[k].push(i)});let row=c.map(x=>rp[b.loc[x][0]].pop()),col=c.map(x=>cp[b.loc[x][1]].pop());assert(row.every(x=>x!==undefined)&&col.every(x=>x!==undefined),"signature witness");assert(c.every((x,i)=>b.cells.get(b.loc[p[row[i]]][0]+","+b.loc[p[col[i]]][1])===x),"forward");let out=Array(p.length),rows=Array(p.length),cols=Array(p.length);c.forEach((x,i)=>{rows[row[i]]=b.loc[x][0];cols[col[i]]=b.loc[x][1]});for(let i=0;i<p.length;i++)out[i]=b.cells.get(rows[i]+","+cols[i]);assert(out.every((x,i)=>x===p[i]),"inverse");return {row,col}}
 function fitWindows(target,d,b){let h=counts(d.slice(0,target.length),b),g=counts(target,b),best=Infinity,exact=0,offset=-1;const n=d.length-target.length+1;if(n<=0)return{windows:0,exact:0,minL1:null};for(let j=0;j<n;j++){let l=h.reduce((s,x,i)=>s+Math.abs(x-g[i]),0);if(l<best){best=l;offset=j}if(!l)exact++;if(j+1<n){let [r,c]=b.loc[d[j]], [r2,c2]=b.loc[d[j+target.length]];h[r]--;h[b.R+c]--;h[r2]++;h[b.R+c2]++}}return{windows:n,exact,minL1:best,bestOffset:offset}}
 let rows=[];
 for(let b of boards){
 const dict=new Map();for(let v of lex.values()){let k=sig(v.a,b);if(!dict.has(k))dict.set(k,[]);dict.get(k).push(v)}for(let a of dict.values())a.sort((x,y)=>y.freq-x.freq||x.w.localeCompare(y.w));
 function evaluate(ws){let miss=[],unique=[],sizes={},total=0,coveredRunes=0,longMiss=0;for(let i=0;i<ws.length;i++){let w=ws[i],cand=dict.get(sig(w,b))||[];total+=cand.length;sizes[w.length]??={n:0,miss:0,unique:0};sizes[w.length].n++;if(!cand.length){sizes[w.length].miss++;if(w.length>=5)longMiss++;miss.push(i)}else{coveredRunes+=w.length;route(cand[0].a,w,b);if(cand.length===1){sizes[w.length].unique++;unique.push({i,word:cand[0].w})}}}return{groups:ws.length,miss:miss.length,longMiss,unique:unique.length,total,coveredRunes,sizes,firstMissing:miss.slice(0,12),firstUnique:unique.slice(0,12)}}
 // deterministic reversible pair exchanges on p57: swap columns iff both cells occupied
 let plants=solved.map(w=>{let c=w.slice();for(let i=0;i+1<c.length;i+=2){let [r,k]=b.loc[c[i]],[s,l]=b.loc[c[i+1]],x=b.cells.get(r+","+l),y=b.cells.get(s+","+k);if(x!==undefined&&y!==undefined){c[i]=x;c[i+1]=y}}return c});
 let exact=0,top=0,changed=0;for(let i=0;i<solved.length;i++){let c=plants[i],p=solved[i],cand=dict.get(sig(c,b));assert(cand.some(x=>x.a.join(",")===p.join(",")),"lost solved native control");route(p,c,b);exact++;if(cand[0].a.join(",")===p.join(","))top++;changed+=c.filter((x,j)=>x!==p[j]).length}
 rows.push({board:b.name,R:b.R,C:b.C,opening:evaluate(openingWords),whole:evaluate(words),control:{groups:exact,top,changed,total:95},windowGate:donors.map(d=>fitWindows(opening,d,b)),wholeGate:donors.map(d=>fitWindows(canon,d,b))});
 }
 return {scope:"fixed historical chart, arbitrary independent row/column positional permutations preserving group membership for word receiver; arbitrary whole-opening/book permutations for window gate",lexicon:lex.size,solvedGroups:known.size,openingGroups:openingWords.length,donorLengths:donors.map(d=>d.length),rows};
}

console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
