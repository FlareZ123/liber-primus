"use strict";
// Exact known-donor alignment; no key search or language model.
const fs=require("node:fs"),path=require("node:path");
function run(gp, raw, gold, cipherText) {
 const assert=(b,m)=>{if(!b)throw Error(m)}, eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;
 assert(C.length===3008&&C.filter(x=>x===0).length===125&&hash===1862123327,"cipher fingerprint");
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const D=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"donor token");D.push(t.i);w=w.slice(t.s.length)}}
 assert(D.length===217106,"donor length"); const n=C.length,q=13,mod=x=>(x+29)%29;
 function infer(c,p,period){assert(c.length===p.length,"length");let t=0;const key=Array(period).fill(-1),pos=Array(period).fill(-1),holds=[];for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0)return {kind:"literalF",i,c:c[i]};holds.push(i);continue}const j=t++%period,s=mod(c[i]-p[i]);if(key[j]>=0&&key[j]!==s)return {kind:"keyConflict",i,j,prior:pos[j],previous:key[j],current:s};if(key[j]<0){key[j]=s;pos[j]=i}}return {kind:"survivor",key,holds}}
 function encrypt(p,key){let t=0;return p.map(x=>x===0?0:mod(x+key[t++%key.length]))}
 const indices=new Map(gp.runes.map((r,i)=>[r,i])),extract=s=>Array.from(s).filter(x=>indices.has(x)).map(x=>indices.get(x)); const authentic=[{section:1,key:[23,10,1,10,9,10,16,26]},{section:5,key:[0,10,4,0,1,19,0,18,4,18,9,0,18]}].map(({section,key})=>{const p=extract(gold.sections[section].source_text),c=extract(cipherText.split("$")[section]),a=infer(c.slice(0,50),p.slice(0,50),key.length);assert(a.kind==="survivor"&&eq(a.key,key)&&eq(encrypt(p,a.key),c),"authentic");return {section,length:p.length,prefix:50,heldOut:p.length-50,key:a.key}});
 let E=0,F=0; for(let i=0;i<n;i++){E+=+(D[i]===18);F+=+(D[i]===0)}
 const rows=[]; let passF=0,first={literalF:0,keyConflict:0,survivor:0},minMis=Infinity;
 for(let start=0;start<=D.length-n;start++){
 if(E<=286&&F<=125){const P=D.slice(start,start+n),fMismatch=P.reduce((s,p,i)=>s+ +(p===0&&C[i]!==0),0);minMis=Math.min(minMis,fMismatch);passF+= +(fMismatch===0);const a=infer(C,P,q);first[a.kind]++;if(a.kind==="survivor")assert(eq(encrypt(P,a.key),C),"replay");rows.push({start,E,F,fMismatch,...a});}
 if(start<D.length-n){E+=+(D[start+n]===18)- +(D[start]===18);F+=+(D[start+n]===0)- +(D[start]===0)}
 }
 assert(rows.length===1197,"window count");
 const plants=[0,Math.floor(rows.length/2),rows.length-1].map((r,k)=>{let seed=(0x41f9cd21+0x1234567*k)>>>0;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};const key=Array.from({length:q},()=>rng()%29),phase=1+rng()%12,rot=key.slice(phase).concat(key.slice(0,phase)),p=D.slice(rows[r].start,rows[r].start+n),c=encrypt(p,rot),a=infer(c,p,q);assert(a.kind==="survivor"&&eq(a.key,rot)&&eq(encrypt(p,a.key),c),"plant");const wrong=infer(c,D.slice(rows[r].start+1,rows[r].start+1+n),q);assert(wrong.kind!=="survivor","wrong alignment");return {start:rows[r].start,key,phase,recovered:a.key,holds:a.holds.length,wrong:wrong.kind}});
 return {n,hash,donorLength:D.length,totalWindows:D.length-n+1,eligible:rows.length,passF,minMis,first,authentic,plants,rows};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(run(JSON.parse(read(paths[0])),read(paths[1]),JSON.parse(read(paths[2])),read(paths[3])),null,2));
