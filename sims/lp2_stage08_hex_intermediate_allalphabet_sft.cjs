"use strict";
// Node.js 22, repository root. Reads the pinned 2014 signed source and canonical LP2 input.
const fs=require("node:fs");
const crypto=require("node:crypto");
const url="https://raw.githubusercontent.com/krisyotam/cicada3301/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index";
function gate(corpus,historical) {
 const assert=(condition,label)=>{if(!condition)throw Error(label)};
 const s=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
 assert(s.length===1680 && s.every(x=>Number.isInteger(x)&&x>=0&&x<29),"original p33–39 source shape");
 const FULL=(1<<29)-1, ARC=(1<<16)-1;
 const pc=m=>{let n=0;while(m){m&=m-1;n++}return n};
 const rot=(m,k)=>k===0?m:((m<<k)|(m>>>(29-k)))&FULL;
 const phases=(a,p)=>{const out=new Uint32Array(p);a.forEach((v,i)=>out[i%p]|=1<<v);return [...out]};
 const allowed=(m,k)=> (m&~rot(ARC,k))===0;
 function literal(p){let bad=0,log=0;for(const m of phases(s,p)){let n=0;for(let k=0;k<29;k++)if(allowed(m,k))n++;if(!n)bad++;else log+=Math.log2(n)}return {p,bad,log2keys:bad?null:log}}
 function pairExcluded(a){const b=[...a].sort((x,y)=>pc(y)-pc(x));if(pc(b[0])>16)return true;for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){if(pc(b[i])+pc(b[j])<=16)break;let fit=false;for(let k=0;k<29;k++)if(pc(b[i]|rot(b[j],k))<=16){fit=true;break}if(!fit)return true}return false}
 const body=historical.split("-----BEGIN PGP SIGNATURE-----")[0];
 const blocks=body.split(/\r?\n\s*\r?\n/).map(x=>x.trim().split(/\r?\n/).map(x=>x.trim())).filter(lines=>lines.length>1&&lines.every(x=>/^(?:[0-9a-f]{2})+$/i.test(x)));
 const hex=blocks.map(b=>b.join(""));
 const bytes=hex.map(h=>h.match(/../g).map(x=>parseInt(x,16)));
 assert(bytes.length===3,"three self-delimited hex blocks");
 const jpeg=b=>b[0]===255&&b[1]===216&&b[b.length-2]===255&&b[b.length-1]===217;
 assert(jpeg(bytes[0])&&jpeg(bytes[1]),"historical JPEG delimiters");
 let offset=0;const frameHeaders={};while(offset<bytes[2].length){const [a,b,c,d]=bytes[2].slice(offset,offset+4);const ver=(b>>3)&3,layer=(b>>1)&3,bi=c>>4,si=(c>>2)&3,pad=(c>>1)&1;const br=[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160][bi],sr=[22050,24000,16000][si];const len=Math.floor(72000*br/sr)+pad;assert(a===255&&(b&224)===224&&ver===2&&layer===1&&len===72,"historical MPEG frame");const h=[a,b,c,d].map(x=>x.toString(16).padStart(2,"0")).join("");frameHeaders[h]=(frameHeaders[h]??0)+1;offset+=len}assert(offset===bytes[2].length,"complete MPEG frames");
 let common=0;while(common<hex[0].length&&hex[0][common]===hex[1][common])common++;
 const forms=[
 ["jpegSOIEOI","ffd8","ffd9"],["jpeg-next-marker","ffd8ff","ffd9"],["stage08-common-JFIF",hex[0].slice(0,common),"ffd9"],["stage08-first-JFIF",hex[0].slice(0,46),"ffd9"],["stage08-second-JFIF",hex[1].slice(0,46),"ffd9"],["mpeg-sync-fff","fff",""],["mpeg-sync-ffe","ffe",""],["stage08-MP3-first-frame",hex[2].slice(0,8),""],["stage08-MP3-32-byte-prefix",hex[2].slice(0,64),""]];
 function match(dom){const m=Array(29).fill(-1);function aug(u,seen){for(let v=0;v<29;v++){if(!(dom[u]&(1<<v))||seen[v])continue;seen[v]=true;if(m[v]<0||aug(m[v],seen)){m[v]=u;return true}}return false}for(let u=0;u<16;u++)if(!aug(u,Array(29).fill(false)))return false;return true}
 function header(a,p,ps,anchor,mask,head,tail){const dom=Array(16).fill(mask),seen=new Set();function add(i,h){const j=i%p,d=parseInt(h,16);assert(!seen.has(j),"template repeats a phase");seen.add(j);let possible=0;for(let k=0;k<29;k++){if(j===anchor&&k!==0)continue;const m=rot(ps[j],(29-k)%29);if((m&mask)===m)possible|=1<<((a[i]-k+29)%29)}dom[d]&=possible;return !!dom[d]}for(let i=0;i<head.length;i++)if(!add(i,head[i]))return false;for(let i=0;i<tail.length;i++)if(!add(a.length-tail.length+i,tail[i]))return false;return match(dom)}
 function enumerate(p,typed=false){const ps=phases(s,p),anchor=ps.indexOf(ps.reduce((a,b)=>pc(b)>pc(a)?b:a)),base=ps[anchor];const a=ps.map((m,i)=>({m,i})).filter(x=>x.i!==anchor).sort((x,y)=>pc(y.m)-pc(x.m));const unique=new Set(),choices=[];for(const {m} of a){const r=[...new Set(Array.from({length:29},(_,k)=>rot(m,k)))].sort((x,y)=>x-y);const id=r.join(",");if(!unique.has(id)){unique.add(id);choices.push(r)}}const free=Array.from({length:29},(_,i)=>i).filter(i=>!(base&(1<<i)));let tested=0,good=0;const hits=Object.fromEntries(forms.map(x=>[x[0],0]));function test(m){tested++;for(const r of choices){let ok=false;for(const x of r){if((x&m)===x){ok=true;break}}if(!ok)return}good++;if(typed)for(const [name,h,t] of forms)if(header(s,p,ps,anchor,m,h,t))hits[name]++}function visit(i,n,m){if(n===0){test(m);return}for(let j=i;j<=free.length-n;j++)visit(j+1,n-1,m|(1<<free[j]))}if(pc(base)<=16)visit(0,16-pc(base),base);return {p,anchor,anchorSize:pc(base),patterns:choices.length,tested,good,...(typed?{hits}:{})}}
 const short=Array.from({length:151},(_,i)=>pairExcluded(phases(s,i+1)));assert(short.every(Boolean),"all periods 1–151 pair/cardinality obstruction");
 const extended=Array.from({length:23},(_,i)=>enumerate(i+152));assert(extended.every(r=>r.good===0),"all periods 152–174 exhaustive support");
 const lit=Array.from({length:1033},(_,i)=>literal(i+1));assert(lit.slice(0,836).every(x=>x.bad>0),"literal 1–836 fail");
 const result464=enumerate(464,true);
 assert(result464.tested===5200300&&result464.good===1457&&result464.hits["jpegSOIEOI"]===2&&result464.hits["jpeg-next-marker"]===0,"exact original header counts");
 const plantPlain=hex[0].split("").map(x=>parseInt(x,16));
 const codebook=Array.from({length:16},(_,i)=>(i*7+3)%29),mask=codebook.reduce((m,v)=>m|(1<<v),0);
 const plantKey=Array.from({length:464},(_,i)=>(13*i+4)%29);
 const enc=plantPlain.map((v,i)=>(codebook[v]+plantKey[i%464])%29);
 const dec=enc.map((v,i)=>codebook.indexOf((v-plantKey[i%464]+29)%29));
 assert(dec.every((v,i)=>v===plantPlain[i]),"historical full JPEG positive inverse");
 const pp=phases(enc,464),plantAnchor=0,k=plantKey[plantAnchor],translated=rot(mask,k);
 assert(pp.every((m,j)=>{const mm=rot(m,(k-plantKey[j]+29)%29);return (mm&translated)===mm}),"positive arbitrary shared alphabet");
 assert(header(enc,464,pp,plantAnchor,translated,"ffd8ff","ffd9"),"historical true JPEG header matching");
 return {historical:{objects:blocks.map((b,i)=>({lines:b.length,widths:[...new Set(b.map(l=>l.length))],digits:hex[i].length,bytes:bytes[i].length,prefix:hex[i].slice(0,16),suffix:hex[i].slice(-16)})),commonJPEGPrefix:hex[0].slice(0,common),frameHeaders,frames:Object.values(frameHeaders).reduce((a,b)=>a+b,0)},original:{runes:s.length,bytes:s.length/2,pairExcludedThrough:151,exhaustivelyExcludedThrough:174,period174:extended[22],literalFirstFeasible:lit.find(x=>!x.bad),literalSelected:[174,464,837,838,839,840,1033].map(p=>lit[p-1]),result464},control:{historicalJPEGNibbles:plantPlain.length,recovered:dec.length,headerPass:true}};
}
(async()=>{const historical=process.argv[2]?fs.readFileSync(process.argv[2],"utf8"):await (await fetch(url)).text();const hash=crypto.createHash("sha256").update(historical).digest("hex");if(hash!=="0c1054e9b013c6894eb7b2f0f01ad7e8627ff9432a13688c84686810e705a844")throw Error("historical source SHA-256 mismatch: "+hash);const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));console.log(JSON.stringify(gate(corpus,historical),null,2));})().catch(e=>{console.error(e);process.exitCode=1});
