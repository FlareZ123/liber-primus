"use strict";
const fs=require("node:fs");const path=require("node:path");
function experiment(corpus,native){
 const map=new Map(corpus.runes.map((r,i)=>[r,i]));const sections=native.sections.map(s=>({name:s.name,v:Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x))}));
 const original=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
 const chapterStarts=[0,3,8,15,23,27,33,40,54,56];
 const chapters=chapterStarts.slice(0,-1).map((p,i)=>({name:"p"+p+"-"+(chapterStarts[i+1]-1),v:original.filter(x=>x.page>=p&&x.page<chapterStarts[i+1]).flatMap(x=>x.indices)}));
 const repeat=v=>v.slice(1).reduce((n,x,i)=>n+(x===v[i]),0);
 function invariant(v,phase){
   const pairs=[],counts=new Map(),freq=Array(29).fill(0);for(const x of v)freq[x]++;
   for(let i=phase;i+1<v.length;i+=2){const a=v[i],b=v[i+1];pairs.push([a,b]);const k=29*Math.min(a,b)+Math.max(a,b);counts.set(k,(counts.get(k)||0)+1)}
   const equal=pairs.reduce((n,[a,b])=>n+(a===b),0);let states=new Map([[phase?v[0]:-1,0]]);
   for(const [a,b] of pairs){const next=new Map();for(const [l,c] of states)for(const [x,y] of [[a,b],[b,a]])next.set(y,Math.min(next.get(y)??Infinity,c+(l===x)));states=next}
   const tail=(v.length-phase)%2?v[v.length-1]:-1;
   const minSeam=Math.min(...Array.from(states,([l,c])=>c+(tail===l&&tail!==-1)));
   const f=freq.sort((a,b)=>a-b).join(","),m=[...counts.values()].sort((a,b)=>a-b).join(",");
   return {n:v.length,pairs:pairs.length,equal,minRepeat:equal+minSeam,repeat:repeat(v),signature:f+"|"+equal+"|"+m};
 }
 function encode(v,phase){const out=v.slice();for(let i=phase,k=0;i+1<v.length;i+=2,k++){const a=v[i],b=v[i+1];if(((a+b+k)%2)===1){out[i]=b;out[i+1]=a}}return out}
 // Full 29^2 domain, each alternating parity.
 const domain=[0,1].map(t=>{const good=new Set(),bad=new Set();for(let a=0;a<29;a++)for(let b=0;b<29;b++){good.add(((a+b+t)%2)?29*b+a:29*a+b);bad.add(a<b?29*b+a:29*a+b)}return {phase:t,goodImage:good.size,nonInvariantImage:bad.size}});
 const nativeStats=sections.map(s=>({name:s.name,...[0,1].reduce((o,p)=>({...o,[p]:{...invariant(s.v,p),after:repeat(encode(s.v,p))}}),{})}));
 for(const s of sections)for(const p of [0,1]){if(encode(encode(s.v,p),p).join()!==s.v.join()||invariant(s.v,p).signature!==invariant(encode(s.v,p),p).signature)throw Error("involution failed")}
 const chapterStats=chapters.map(s=>({name:s.name,...[0,1].reduce((o,p)=>({...o,[p]:invariant(s.v,p)}),{})}));
 const total=[0,1].map(p=>{const v=original.flatMap(x=>x.indices),x=invariant(v,p);return {...x,signature:undefined}});
 // Match original physical page lengths against every contiguous native window.
 // For arbitrary common alphabet relabeling, sorted marginal counts, diagonal count, and sorted unordered-pair frequencies are necessary invariants.
 const lengths=[...new Set(original.map(p=>p.indices.length))],windows=new Map();
 for(const n of lengths){const a=[[],[]];for(const s of sections)for(let i=0;i+n<=s.v.length;i++){const w=s.v.slice(i,i+n);for(const p of [0,1]){const t=invariant(w,p);a[p].push({equal:t.equal,minRepeat:t.minRepeat,signature:t.signature})}}windows.set(n,a)}
 const pageMatches=original.map(p=>{const n=p.indices.length;return {page:p.page,n,phases:[0,1].map(phase=>{const x=invariant(p.indices,phase),a=windows.get(n)[phase];return {phase,originalInternal:x.equal,originalRepeat:x.repeat,originalMin:x.minRepeat,nativeWindows:a.length,windowsAtOrBelowOriginalTotal:a.filter(w=>w.minRepeat<=x.repeat).length,equalityMatch:a.filter(w=>w.equal===x.equal).length,invariantMatch:a.filter(w=>w.signature===x.signature).length,minNativeRepeat:a.length?Math.min(...a.map(w=>w.minRepeat)):null}})}});
 const nativeSum=[0,1].map(p=>nativeStats.reduce((a,x)=>({n:a.n+x[p].n,pairs:a.pairs+x[p].pairs,equal:a.equal+x[p].equal,minRepeat:a.minRepeat+x[p].minRepeat,repeat:a.repeat+x[p].repeat,after:a.after+x[p].after}),{n:0,pairs:0,equal:0,minRepeat:0,repeat:0,after:0}));
 return {domain,total,nativeSum,nativeStats:nativeStats.map(x=>({...x,0:{...x[0],signature:undefined},1:{...x[1],signature:undefined}})),chapterStats:chapterStats.map(x=>({...x,0:{...x[0],signature:undefined},1:{...x[1],signature:undefined}})),pageMatches};
}
if(require.main===module){const root=path.join(__dirname,"../resources");console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,"liber-primus/lp2-corpus.json"),"utf8")),JSON.parse(fs.readFileSync(path.join(root,"external/relikd-solved-gp29-native-v1.json"),"utf8"))),null,2));}
module.exports=experiment;
