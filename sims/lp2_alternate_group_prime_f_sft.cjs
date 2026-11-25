"use strict";
const fs=require("node:fs"),path=require("node:path");const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function experiment(raw){
const gp=JSON.parse(raw[1]),runes=new Map(gp.runes.map((x,i)=>[x,i])),source=raw[0].split("%").slice(0,55).join("%"),groups=[];let page=0,start=0,w=[];
function finish(){if(w.length){groups.push({page:start>=50?start+1:start,w});w=[]}}
for(const c of source){if(runes.has(c)){if(!w.length)start=page;w.push(runes.get(c))}else if(c==="%")page++;else if("-.$&§0123456789".includes(c))finish()}finish();
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);if(JSON.stringify(groups.flatMap(g=>g.w))!==JSON.stringify(original)||groups.length!==2896)throw Error("source parity");
const mod=x=>((x%29)+29)%29, primes=[];for(let p=2;primes.length<5000;p++){let ok=true;for(const q of primes){if(q*q>p)break;if(p%q===0){ok=false;break}}if(ok)primes.push(p)}const key=primes.map(p=>(p-1)%29);
function encrypt(a){let j=0;return a.map(x=>x===0?0:mod(x+key[j++]))}
function outer(a){return a.map((w,i)=>i%2?[...w].reverse():w.slice())}
function unflatten(a,lens){let at=0;return lens.map(n=>{const w=a.slice(at,at+n);at+=n;return w})}
function reach(a){let s=new Set([0]),max=1;for(let i=0;i<a.length;i++){const c=a[i],t=new Set();for(const j of s){if(c===0)t.add(j);if(mod(c-key[j])!==0)t.add(j+1)}if(!t.size)return {firstImpossible:i,reachablePrefix:i,maxStates:max,complete:false};s=t;max=Math.max(max,s.size)}return {firstImpossible:null,reachablePrefix:a.length,maxStates:max,complete:true,endStates:[...s].sort((a,b)=>a-b)}}
function containsTruePath(cipher,plain){let j=0;for(let i=0;i<plain.length;i++){const p=plain[i],c=cipher[i];if(p===0){if(c!==0)return false}else if(mod(p+key[j++])!==c)return false}return true}
const native=JSON.parse(raw[2]).sections.map(s=>({name:s.name,words:(s.source_text.match(/\p{Script=Runic}+/gu)||[]).map(w=>Array.from(w,c=>runes.get(c)))}));
const p56=native.find(s=>s.name==="p56_an_end"),plain56=p56.words.flat(),auth56=gp.pages.find(p=>p.page===56).indices;if(JSON.stringify(encrypt(plain56))!==JSON.stringify(auth56))throw Error("authentic p56 replay");
const plants=native.filter(s=>s.name!=="p56_an_end").map(s=>{const p=s.words.flat(),lens=s.words.map(w=>w.length),c=encrypt(p),plant=outer(unflatten(c,lens)),restored=outer(plant).flat();if(JSON.stringify(c)!==JSON.stringify(restored)||!containsTruePath(restored,p)||!reach(restored).complete)throw Error("plant fail");return {name:s.name,runes:p.length,groups:lens.length,correct:reach(restored),wrong:reach(plant.flat()),replay:true}});
const p8=groups.filter(g=>g.page>=8&&g.page<=14).map(g=>g.w);const expected=gp.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);if(JSON.stringify(p8.flat())!==JSON.stringify(expected))throw Error("chapter carry");
const inv=outer(p8),first=reach(inv.flat()),unchanged=reach(p8.flat());if(JSON.stringify(outer(inv))!==JSON.stringify(p8))throw Error("outer replay");
return {source:{runes:original.length,groups:groups.length},p56Auth:{runes:plain56.length,replay:true,reach:reach(auth56)},plants,p8_14:{runes:expected.length,groups:p8.length,alternating:first,unchanged},p40_53:{reused:true,report:"im-results/lp2-word-reverse-prime-ftransparent-original-gate.md",prior:"chapter-local one-based even reversal, all 5000 origins including zero have no complete legal path; previous original report also includes both polarities"},gatePass:first.complete};
}
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","im-results/lp2-word-reverse-prime-ftransparent-original-gate.md"];
console.log(JSON.stringify(experiment(paths.map(read)),null,2));
