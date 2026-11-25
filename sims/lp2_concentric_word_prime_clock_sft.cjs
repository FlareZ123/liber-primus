"use strict";
const fs=require("node:fs");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
function run(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(a,m)=>{if(!a)throw Error(m)},mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"native token "+w);o.push(q.i);j+=q.t.length}return o}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 const donors=raw.slice(3,6).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of donors)for(const w of a.slice(0,Math.floor(a.length*.8)))if(w.length&&w.length<=24)types.add(id(w));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const t of s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]){const w=[...t].map(x=>ix.get(x));if(w.every(Number.isInteger)&&w.length<=24)types.add(id(w))}
 for(const ln of raw[6].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false]){const w=word(m[1],alt);if(w.length<=24)types.add(id(w))}}
 assert(types.size===35944,"lexicon size "+types.size);
 const depth=(i,n)=>Math.min(i,n-1-i),project=(w,D)=>w.filter((_,i)=>depth(i,w.length)<D);
 const projections=[null,new Set(),new Set()];for(const s of types){const w=nums(s);for(const D of [1,2])projections[D].add(w.length+":"+id(project(w,D)))}
 let off=0;const groups=raw[1].replace(/[/\n\r%]/g,"").replace(/[&$123457§]+/g,"-").split(/[-.]+/).filter(Boolean).map(w=>{const o=off,a=[...w].map(x=>ix.get(x));off+=a.length;return {o,w:a}});assert(groups.length===2941&&off===13136,"source counts");assert(JSON.stringify(groups.flatMap(g=>g.w))===JSON.stringify(gp.pages.flatMap(p=>p.indices)),"source exact");
 const starts=[0];for(const p of gp.pages)starts.push(starts.at(-1)+p.indices.length);
 const prime=[],sieve=new Uint8Array(220000);for(let i=2;i<sieve.length;i++)if(!sieve[i]){prime.push((i-1)%29);for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1}
 const section=(a,b)=>groups.filter(g=>g.o>=starts[a]&&g.o<starts[b]);
 function layers(gs){const out=[];for(const {o,w} of gs)for(let i=0;i<w.length;i++){const d=depth(i,w.length);(out[d]??=[]).push({c:w[i],o:o+i,s:w.length===1})}return out}
 const singleton=p=>[3,10,16,24].includes(p),allowed=(p,s,mode)=>mode==="any"||((!s||singleton(p))&&(mode!=="native27"||![12,22].includes(p)));
 function options(c,k,sign,s,mode){const out=[];if(c===0&&allowed(0,s,mode))out.push([k,0]);const p=mod(c-sign*prime[k]);if(p!==0&&allowed(p,s,mode))out.push([k+1,p]);return out}
 function all(xs,sign,mode){let max=0,orig=[];for(let o=0;o<=3301;o++){let states=[o],i=0;for(;i<xs.length;i++){const n=new Set();for(const k of states)for(const [j] of options(xs[i].c,k,sign,xs[i].s,mode))n.add(j);states=[...n];if(!states.length)break}max=Math.max(max,i);if(states.length)orig.push(o)}return {length:xs.length,orig,max}}
 const cuts=[0,3,8,15,23,27,33,40,54,56],stats=[];
 for(const [a,b] of [[0,56],...cuts.slice(0,-1).map((a,i)=>[a,cuts[i+1]])]){const gs=section(a,b),ls=layers(gs);assert(ls.flat().length===starts[b]-starts[a],"section cut "+a);const tests={};for(const sign of [1,-1])for(const mode of ["any","single","native27"]){const counts=[];for(const xs of ls){const t=all(xs,sign,mode);counts.push({length:t.length,origins:t.orig.length,max:t.max,zero:t.orig.includes(0)});if(!t.orig.length&&a!==54)break}tests[sign+":"+mode]=counts}stats.push({a,b,groups:gs.length,tests})}
 function enc(gs,orig,sign){const cursor=orig.slice();return gs.map(({o,w})=>({o,w:w.map((p,i)=>{const d=depth(i,w.length);return p===0?0:mod(p+sign*prime[cursor[d]++])})}))}
 const native56=gold.sections.find(s=>s.name==="p56_an_end").source_text.match(/[\u16a0-\u16ff]/gu).map(x=>ix.get(x));let ck=0;assert(native56.length===85,"p56 count");assert(JSON.stringify(native56.map(p=>p===0?0:mod(p+prime[ck++])))===JSON.stringify(gp.pages[56].indices),"p56 authentic cipher");assert(ck===84,"p56 advance");
 function cost(gs,origin,sign,D){let states=new Map([[origin.join(","),0]]);for(const {w} of gs){const out=new Map();for(const [key,score] of states){const initial=key.split(",").map(Number);function rec(i,ks,p){if(i===w.length){const z=ks.join(","),c=score+(projections[D].has(w.length+":"+id(p))?0:1);if(!out.has(z)||c<out.get(z))out.set(z,c);return}const d=depth(i,w.length);if(d>=D){rec(i+1,ks,p);return}for(const [k,x] of options(w[i],ks[d],sign,w.length===1,"single")){const n=ks.slice();n[d]=k;rec(i+1,n,p.concat(x))}}rec(0,initial,[])}states=out;if(!states.size)return Infinity}return Math.min(...states.values())}
 function gate(gs,sign,D){const ls=layers(gs),aa=all(ls[0],sign,"single").orig,bb=D===1?[null]:all(ls[1],sign,"single").orig;let best=Infinity,winners=[],counts={};for(const a of aa)for(const b of bb){const o=D===1?[a]:[a,b],v=cost(gs,o,sign,D);counts[v]=(counts[v]||0)+1;if(v<best){best=v;winners=[]}if(v===best)winners.push(o)}return {D,sign,origins:[aa.length,bb.length],pairs:aa.length*bb.length,best:Number.isFinite(best)?best:null,winners:winners.slice(0,20),winnerCount:winners.length,counts}}
 const terminal=section(54,56);assert(terminal.length===66&&terminal.flatMap(x=>x.w).length===308,"terminal exact");
 const original=[1,-1].flatMap(s=>[1,2].map(d=>gate(terminal,s,d)));
 const pool=Array.from({length:25},()=>[]),fallback=Array.from({length:25},()=>[]);
 for(const donor of donors)for(const w of donor.slice(Math.floor(donor.length*.8)))if(w.length<=24&&types.has(id(w))&&(w.length!==1||singleton(w[0])))pool[w.length].push(w);
 for(const s of types){const w=nums(s);if(w.length!==1||singleton(w[0]))fallback[w.length].push(w)}
 const plants=[];for(let z=0;z<3;z++){const sign=z%2?-1:1;let fallbackWords=0;const plain=terminal.map((g,i)=>{let p=pool[g.w.length];if(!p.length){p=fallback[g.w.length];fallbackWords++}assert(p.length,"missing donor "+g.w.length);return {o:g.o,w:p[(i*7919+z*47)%p.length]}});const orig=Array.from({length:7},(_,d)=>101+137*d+z*41),cipher=enc(plain,orig,sign),v=cost(cipher,orig.slice(0,2),sign,2);assert(v===0,"true plant lost");plants.push({z,sign,orig:orig.slice(0,2),fallbackWords,knownOriginMinOOV:v})}
 return {lexicon:types.size,p56:{runes:native56.length,consumes:ck},stats,original,plants}
}
const result=run(paths.map(p=>fs.readFileSync(p,"utf8")));
console.log(JSON.stringify(result,null,2));
