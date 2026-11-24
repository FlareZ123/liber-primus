'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function analyze(c,transcription){
  const map=new Map(c.runes.map((r,i)=>[r,i]));
  const words=transcription.split("%").slice(0,55).join("").replace(/[\/\r\n]/g,"").replace(/[&$§.-]/g," ").split(/\s+/).map(w=>Array.from(w).filter(r=>map.has(r)).map(r=>map.get(r))).filter(w=>w.length);
  const exact=seq=>seq.reduce((n,x)=>n*29n+BigInt(x),0n);
  const minCode=seq=>{const seen=new Map();let n=0n;for(const x of seq){if(!seen.has(x))seen.set(x,seen.size);n=n*29n+BigInt(seen.get(x))}return n};
  const summary=(ws,seed)=>{let bad=0,gp=0;for(let j=0;j<ws.length;j++){const ix=ws[j].slice(0,-1),bound=BigInt(seed+j);if(minCode(ix)>bound)bad++;if(exact(ix)>bound)gp++}return {records:ws.length,badAnyDigitPermutation:bad,badGPOrder:gp}};
  const max=words.map((w,j)=>({j,w,n:minCode(w.slice(0,-1))-BigInt(j)})).reduce((a,b)=>a.n>b.n?a:b);
  const p=c.pages.find(p=>p.page===57).indices;
  const key=x=>x.join(",");
  const d=new Map([["",0]]);let prefix=[],records=[];
  const digits=n=>{const a=[];while(n){a.unshift(n%29);n=Math.floor(n/29)}return a};
  for(const x of p){const s=[...prefix,x],k=key(s);if(d.has(k)){prefix=s;continue}records.push([...digits(d.get(key(prefix))),x]);d.set(k,d.size);prefix=[]}
  const dd=[[]],out=[];
  for(const w of records){const n=Number(exact(w.slice(0,-1)));if(n>=dd.length)throw Error("Control pointer out of range");const v=[...dd[n],w.at(-1)];dd.push(v);out.push(...v)}
  // An explicit terminal reference, only needed for the positive control.
  const terminal=d.get(key(prefix));if(prefix.length)out.push(...dd[terminal]);
  if(out.length!==p.length||!out.every((x,i)=>x===p[i]))throw Error("Control replay failed");
  if(summary(records,0).badAnyDigitPermutation!==0||summary(records,0).badGPOrder!==0)throw Error("False rejection of plant");
  return {words:words.length,runes:words.flat().length,first:words[0],firstMinimum:String(minCode(words[0].slice(0,-1))),bodyFirst:words[2],bodyFirstMinimum:String(minCode(words[2].slice(0,-1))),empty:summary(words,0),seed29:summary(words,29),body29:summary(words.slice(2),29),maxSeed:{record:max.j,word:max.w,minSeed:String(max.n)},control:{native:p.length,ordinaryRecords:records.length,tailLength:prefix.length,terminal,exact:out.length,longestRecord:Math.max(...records.map(w=>w.length))}};
}
const root=path.resolve(__dirname,'..');
const result=analyze(JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8'));
assert.equal(result.words,2896);assert.equal(result.runes,12956);assert.equal(result.empty.badAnyDigitPermutation,907);assert.equal(result.seed29.badAnyDigitPermutation,897);assert.equal(result.body29.badAnyDigitPermutation,896);assert.equal(result.control.exact,95);
console.log(JSON.stringify(result,null,2));
