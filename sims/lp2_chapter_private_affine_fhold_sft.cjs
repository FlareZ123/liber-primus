'use strict';
/** Exact chapter-private q8/q13 affine GP29 rows, latent transparent plaintext F.
 * Native GP27 support and original intact A/I singleton assumptions. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const mod=x=>(x%29+29)%29;
const rows=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)rows.push([a,b]);
const ALL=(1n<<812n)-1n;
const masks=Array.from({length:2},(_,s)=>Array.from({length:29},(_,c)=>rows.reduce((z,[a,b],i)=>{
 const ok=s?[10,24].some(p=>mod(a*p+b)===c):![0,12,22].some(p=>mod(a*p+b)===c);
 return ok?z|(1n<<BigInt(i)):z;
},0n)));
function solve(C,ss,q,cap=2500000,fixed=null){
 const runs=[[]],zeros=[];
 for(let i=0;i<C.length;i++){const s=+ss.has(i);if(C[i]===0){zeros.push(s);runs.push([])}else runs.at(-1).push(masks[s][C[i]])}
 const mm=runs.map(v=>Array.from({length:q},(_,p)=>{const d=Array(q).fill(ALL);v.forEach((m,i)=>d[(p+i)%q]&=m);return d}));
 let nodes=0,deep=0,capped=false,leaf=null;
 function go(t,p,d,h){
  if(++nodes>cap){capped=true;return false}deep=Math.max(deep,t);
  const e=d.map((m,j)=>m&mm[t][p][j]);if(e.some(m=>m===0n))return false;
  p=(p+runs[t].length)%q;
  if(t===zeros.length){leaf={h,domainCount:e.map(m=>m.toString(2).replace(/0/g,'').length)};return true}
  if(!zeros[t]&&go(t+1,p,e,h+'H'))return true;if(capped)return false;
  if(e[p]&masks[zeros[t]][0]){e[p]&=masks[zeros[t]][0];if(go(t+1,(p+1)%q,e,h+'C'))return true}
  return false
 }
 const ok=go(0,0,fixed?fixed.map(x=>1n<<BigInt(x)):Array(q).fill(ALL),'');
 return {ok,capped,nodes,deep,zeros:zeros.length,leaf}
}
function parse(raw,alphabet,original){
 let C=[],ss=new Set();
 let words=original?raw.split(/[-.&$§]/):[...raw.matchAll(/[ᚠ-᛿]+/gu)].map(m=>m[0]);
 for(const w of words){const t=Array.from(w).map(c=>alphabet.indexOf(c)).filter(x=>x>=0);if(t.length===1)ss.add(C.length);C.push(...t)}
 return {C,ss}
}
function experiment(d,raw,native){
 const {C,ss}=parse(raw,d.runes,true);assert.deepEqual(C,d.pages.flatMap(p=>p.indices));
 const controls=[],original=[];
 for(const s of native.sections.filter(s=>['0_koan_1','0_welcome','0_loss_of_divinity'].includes(s.name))){
  const p=parse(s.source_text,d.runes,false);
  for(const q of [8,13]){
   let j=0;const key=Array.from({length:q},(_,j)=>((17*j+5)%28)*29+(11*j+7)%29);
   const enc=p.C.map(x=>{if(x===0)return 0;const [a,b]=rows[key[j]];j=(j+1)%q;return mod(a*x+b)});
   const v=solve(enc,p.ss,q,2500000,key);assert(v.ok,'planted key lost');controls.push({name:s.name,q,n:p.C.length,singletons:p.ss.size,nodes:v.nodes,ok:v.ok})
  }
 }
 const ch=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 let offset=0;
 for(const [a,b] of ch){
  const len=d.pages.slice(a,b+1).reduce((s,p)=>s+p.indices.length,0);
  const cc=C.slice(offset,offset+len),sing=new Set([...ss].filter(i=>i>=offset&&i<offset+len).map(i=>i-offset));
  for(const q of [8,13])original.push({chapter:[a,b],q,n:len,singletons:sing.size,...solve(cc,sing,q)});
  offset+=len
 }
 assert.equal(offset,12956);
 assert.deepEqual(original.map(v=>v.nodes),[92811,145703,2008,23547,15073,478819,4110,686723,9985,832938,32614,2500001,1727,35801,46842,2500001,10,7]);
 const reverse=[];
 for(const [lo,hi] of [[27,32],[40,53]]){
  const off=d.pages.slice(0,lo).reduce((s,p)=>s+p.indices.length,0),n=d.pages.slice(lo,hi+1).reduce((s,p)=>s+p.indices.length,0);
  const cc=C.slice(off,off+n).reverse(),sing=new Set([...ss].filter(i=>i>=off&&i<off+n).map(i=>n-1-(i-off)));
  reverse.push({chapter:[lo,hi],q:13,...solve(cc,sing,13)});
 }
 assert.deepEqual(reverse.map(v=>[v.ok,v.capped,v.nodes]),[[false,false,91360],[false,false,716495]]);
 return {controls,original,reverse}
}
module.exports={solve,experiment,parse};
if(require.main===module){
 const root=process.argv[2]||path.resolve(__dirname,'..');
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2))
}
