"use strict";
// Exact all-key relaxed segment-coverage bound. No candidate key search.
const fs=require("node:fs");
const path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function experiment(raw) {
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29, id=w=>w.join(",");
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(const w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){const p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown token "+w);p.push(v.i);j+=v.t.length}out.push(p)}return out}
 const donors=raw.slice(3).map(native), training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections) if(!["0_welcome","jpg107-167"].includes(s.name))training.push(runeWords(s.source_text,/[^\u16a0-\u16ff]/u));
 const vocab=new Map();for(const w of training.flat())if(w.length<=24)vocab.set(id(w),w);
 if(vocab.size!==10842)throw Error("vocabulary changed");
 const byLength=new Map();for(const w of vocab.values()){if(!byLength.has(w.length))byLength.set(w.length,[]);byLength.get(w.length).push(w)}
 // Choose the earliest longest contiguous nonzero span; cap at 8.
 function span(c){let best=0,start=0,a=0;for(let i=0;i<c.length;i++){if(c[i]===0)a=i+1;else if(i-a+1>best){best=i-a+1;start=a}}return {start,len:Math.min(best,8)}}
 function code(c,p,start,m){let x=0;for(let j=start;j<start+m;j++)x=x*29+mod(c[j]-p[j]);return x}
 function options(c,start,m){const s=new Set();for(const p of byLength.get(c.length)||[]){if(p.some((v,i)=>v===0&&c[i]!==0))continue;s.add(code(c,p,start,m))}return s}
 function bound(groups,periods,truth,K){const strata=Array.from({length:9},()=>({n:0,counts:new Map()})),all=Array.from({length:9},()=>({n:0,counts:new Map()}));let checks=0;
 const segments=K?Array.from({length:9},(_,m)=>new Set(K.map((_,s)=>Array.from({length:m},(_,j)=>K[(s+j)%K.length]).reduce((a,b)=>29*a+b,0)))):null;
 for(let i=0;i<groups.length;i++){const c=groups[i],{start,len}=span(c);if(len<2)continue;for(let m=2;m<=len;m++){const opts=options(c,start,m);for(const cell of [all[m],...(m===len?[strata[m]]:[])]){cell.n++;for(const k of opts)cell.counts.set(k,(cell.counts.get(k)||0)+1)}if(truth&&vocab.has(id(truth[i]))){const k=code(c,truth[i],start,m);if(!opts.has(k)||!segments[m].has(k))throw Error("true segment missing");checks++}}}
 const sorted=cell=>{const s=[...cell.counts.values()].sort((a,b)=>b-a);const prefix=[0];for(const v of s)prefix.push(prefix[prefix.length-1]+v);return {n:cell.n,prefix}};
 const S=strata.slice(2).map(sorted),A=all.slice(2).map(sorted),uncovered=(x,q)=>Math.max(0,x.n-x.prefix[Math.min(q,x.prefix.length-1)]);
 const minMissing=q=>Math.max(S.reduce((a,x)=>a+uncovered(x,q),0),...A.map(x=>uncovered(x,q)));
 const maxQ=Math.max(...S.concat(A).map(x=>x.prefix.length-1));
 const budget=Math.floor(groups.length*.05);let requiredPeriod=null;
 if(minMissing(maxQ)<=budget){let lo=0,hi=maxQ;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(minMissing(mid)<=budget)hi=mid;else lo=mid+1}requiredPeriod=lo;}
 if(K&&requiredPeriod!==null&&requiredPeriod>K.length)throw Error("period lower bound rejects true key");
 return periods.map(q=>{const summarize=cell=>{const top=[...cell.counts.values()].sort((a,b)=>b-a).slice(0,q),upper=Math.min(cell.n,top.reduce((a,b)=>a+b,0));return {n:cell.n,top,upper,miss:cell.n-upper,distinct:cell.counts.size}};
 const strat=strata.slice(2).map((x,i)=>({m:i+2,...summarize(x)})),threshold=all.slice(2).map((x,i)=>({m:i+2,...summarize(x)}));
 return {groups:groups.length,q,checks,strat,threshold,miss:Math.max(strat.reduce((a,b)=>a+b.miss,0),...threshold.map(x=>x.miss)),budget,requiredPeriod,periodBoundary:requiredPeriod===null?null:[requiredPeriod?minMissing(requiredPeriod-1):null,minMissing(requiredPeriod)]}});
 }
 function encrypt(words,K){let phase=0;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+K[phase]);phase=(phase+1)%K.length;return c}))}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffle(a,R){for(let j=a.length-1;j>0;j--){const i=R()%(j+1);[a[j],a[i]]=[a[i],a[j]]}return a}
 const controls=[];
 for(const [d,donor] of donors.entries()){const first=Math.floor(donor.length*.8),n=669;let start=first;while(start+n<=donor.length&&donor.slice(start,start+n).filter(w=>!vocab.has(id(w))).length>Math.floor(n*.05))start++;if(start+n>donor.length)throw Error("no control");const p=donor.slice(start,start+n),oov=p.filter(w=>!vocab.has(id(w))).length;for(const q of [8,13]){const R=rng(0x33012684+d*31+q),K=Array.from({length:q},()=>R()%29),c=encrypt(p,K),order=shuffle(p.map((_,i)=>i),R);const result=bound(order.map(i=>c[i]),[q],order.map(i=>p[i]),K)[0];if(result.miss>oov)throw Error("false rejection on native plant");controls.push({d,start,oov,K,holdF:p.flat().filter(x=>x===0).length,consumingZero:c.flat().filter(x=>x===0).length-p.flat().filter(x=>x===0).length,...result})}}
 // All original chapters, with carries retained.
 const source=runeWords(raw[1],/[-.&]/u), flat=source.flat();if(flat.slice(0,12956).join()!=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 function chapter(a,b){const lo=gp.pages.filter(p=>p.page<a).reduce((s,p)=>s+p.indices.length,0),hi=lo+gp.pages.filter(p=>p.page>=a&&p.page<=b).reduce((s,p)=>s+p.indices.length,0);let k=0;const out=[];for(const w of source){if(k>=lo&&k+w.length<=hi)out.push(w);else if(k<hi&&k+w.length>lo)throw Error("clipped chapter "+a+"-"+b);k+=w.length}return out}
 const originals=[];for(const [a,b,n] of [[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]]){const g=chapter(a,b);if(g.length!==n)throw Error("chapter groups "+a+": "+g.length);for(const result of bound(g,[8,13]))originals.push({a,b,...result})}
 return {vocab:vocab.size,controls,originals};
}
const result=experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(result,null,2));
