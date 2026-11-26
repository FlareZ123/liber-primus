"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const paths = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/2013-liber-al-bookcode-I.txt",
  "resources/external/2013-liber-al-bookcode-II.txt",
  "resources/external/2013-liber-al-bookcode-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"
];
function analyze(inputs) {
  const c = JSON.parse(inputs[0]), R = c.runes.join("");
  const words = [...inputs[1].replace(/[%/\s]/gu,"").matchAll(new RegExp("["+R+"]+","gu"))].map(m=>[...m[0]].map(x=>R.indexOf(x)));
  const original = c.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  let n=0;
  const w=words.filter(x=>{const take=n<original.length;n+=x.length;return take});
  assert.deepEqual(w.flat(),original);
  assert.equal(w.length,2896);
  assert.equal(original.length,12956);
  const value=(seq,d)=>seq.reduce((s,x)=>s*29n+BigInt(d[x]),0n);
  const min=seq=>{const m=new Map();return seq.reduce((s,x)=>{if(!m.has(x))m.set(x,m.size);return s*29n+BigInt(m.get(x))},0n)};
  const leadCounts=ws=>Array.from({length:29},(_,i)=>ws.filter(x=>x.length>1&&x[0]===i).length);
  const longest=w.map((x,i)=>({x,i})).filter(z=>z.x.length===Math.max(...w.map(x=>x.length)));
  assert.equal(longest.length,3);
  assert.equal(longest[0].x.length,14);
  const lead=[...new Set(longest.map(z=>z.x[0]))];
  assert.equal(lead.length,3);
  const rows=[];
  for(const h of lead) for(const z of lead.filter(x=>x!==h)) {
    const d=Array(29).fill(-1);
    d[h]=2;d[z]=0;d[lead.find(x=>x!==h&&x!==z)]=1;
    let q=3;
    const target=longest.find(x=>x.x[0]===h);
    for(const x of target.x)if(d[x]===-1)d[x]=q++;
    for(let x=0;x<29;x++)if(d[x]===-1)d[x]=q++;
    assert.equal(new Set(d).size,29);
    const max=w.reduce((s,x)=>{const a=value(x,d);return a>s?a:s},0n);
    assert.equal(max,value(target.x,d));
    rows.push({h,z,target:target.i,max:String(max),d});
  }
  rows.sort((a,b)=>BigInt(a.max)<BigInt(b.max)?-1:BigInt(a.max)>BigInt(b.max)?1:0);
  const maxind=w.map((x,i)=>({i,x,min:String(min(x))})).reduce((a,b)=>BigInt(a.min)>BigInt(b.min)?a:b);
  const sources=[{name:"Liber AL I-III",s:inputs.slice(2,5).join("\n")},{name:"Blake",s:inputs[5]},{name:"Self-Reliance witness",s:inputs[6]}].map(({name,s})=>{
    const toks=s.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[],dict=[...new Set(toks)],bytes=Buffer.byteLength(s,"utf8");
    const d=rows[0].d;
    const encode=n=>{const x=[];do{x.unshift(d.indexOf(n%29));n=Math.floor(n/29)}while(n);return x};
    const codes=dict.map((_,i)=>encode(i));
    assert.equal(Math.min(...codes.map(x=>x.length)),1);
    assert(codes.every((x,i)=>value(x,d)===BigInt(i)));
    assert(codes.every(x=>x.length===1||d[x[0]]!==0));
    assert.equal(new Set(codes.map(x=>x.join(","))).size,dict.length);
    return {name,bytes,words:toks.length,distinct:dict.length,impossibleEvenIndependent:w.filter(x=>min(x)>=BigInt(dict.length)).length,impossibleAtByteBound:w.filter(x=>min(x)>=BigInt(bytes)).length,oneBasedImpossibleAtByteBound:w.filter(x=>min(x)>BigInt(bytes)).length,controlExact:codes.length};
  });
  const digits="0123456789ABCDEFGHIJKLMNOPQRS";
  const base29=n=>{let out="";do{out=digits[n%29]+out;n=Math.floor(n/29)}while(n);return out};
  assert.equal(base29(3301),"3QO");assert.equal(base29(1033),"16I");assert.equal(base29(30),"11");assert.equal(base29(0),"0");
  const allLead=leadCounts(w),bodyLead=leadCounts(w.slice(2));
  assert.equal(Math.min(...allLead),78);
  assert.equal(Math.min(...bodyLead),78);
  assert.equal(rows[0].max,"21633695484715464044");
  return {words:w.length,runes:original.length,longest,leadCounts:allLead,bodyLeadCounts:bodyLead,maxIndependentMinimum:maxind,sharedMinimax:rows,sources};
}
if(require.main===module){
  const root=path.resolve(__dirname,"..");
  console.log(JSON.stringify(analyze(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));
}
module.exports={analyze,paths};
