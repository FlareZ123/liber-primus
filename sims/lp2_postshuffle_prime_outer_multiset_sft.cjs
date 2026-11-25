"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
function experiment(raw){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,id=w=>w.join(",");
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length;}return p;}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(3,6).map(native),vocab=new Map();for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24)vocab.set(id(w),w);
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
 for(let x=0;x<29;x++)vocab.set(id([x]),[x]);
 assert(vocab.size===35944,"broad vocab "+vocab.size);

 const primes=[],sieve=new Uint8Array(250000);for(let p=2;p<sieve.length;p++)if(!sieve[p]){primes.push(p);if(p*p<sieve.length)for(let x=p*p;x<sieve.length;x+=p)sieve[x]=1}
 const K=primes.map(p=>(p-1)%29),hi=16257;assert(K.length>hi+14,"prime range");
 function encode(P,s,sign){const C=[];for(const p of P){if(p===0)C.push(0);else C.push(mod(p+sign*K[s++]))}return {C,t:s}}
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u);let cursor=0;const p56C=p56.flatMap(P=>{const e=encode(P,cursor,1);cursor=e.t;return e.C});assert(id(p56C)===id(gp.pages.find(p=>p.page===56).indices)&&cursor===84,"p56");
 const groups=runeWords(raw[1],/[-.&]/u).slice(0,2896),flat=groups.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(flat.length===12956&&id(flat)===id(unknown),"source");
 let seed=33014471;function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const weights=Array.from({length:29},()=>next()|0),hash=C=>C.reduce((s,c)=>(s+weights[c])|0,0)>>>0,sig=C=>id(C.slice().sort((a,b)=>a-b));
 const mask=(1<<18)-1,scans=new Map();function scan(n){if(!scans.has(n)){const m=Math.ceil(n/2),args=Array.from({length:m},(_,i)=>"a"+i),expr=args.map((a,i)=>a+"[s+"+(2*i)+"]").join("+");scans.set(n,new Function("limit","constant","bucket","mask","hit",...args,"for(let s=0;s<limit;s++){const h=(constant+"+expr+")>>>0;if(bucket[h&mask])hit(h,s);}"))}return scans.get(n)}
 const originals=[],controls=[];
 for(const sign of [1,-1]){
  const targets=groups.flatMap((C,g)=>C.length>=8?[{g,C,sig:sig(C),kind:"original",edges:[]}]:[]);const controlTargets=[];
  for(let d=0;d<3;d++){let j=[0,1033,3301][d],start=Math.floor(donors[d].length*.8);const T=donors[d].slice(start,start+669).map((P,i)=>{const s=j,e=encode(P,j,sign);j=e.t;return {d,i,P,s,t:j,C:shuffle(e.C),kind:"control",edges:[]}});for(const a of shuffle(T))if(a.C.length>=8){a.sig=sig(a.C);targets.push(a);controlTargets.push(a)}}
  const byLength=new Map();for(const t of targets){let x=byLength.get(t.C.length);if(!x){x={b:new Uint8Array(mask+1),m:new Map()};byLength.set(t.C.length,x)}const h=hash(t.C);x.b[h&mask]=1;const a=x.m.get(h)||[];a.push(t);x.m.set(h,a)}
  const E=Array.from({length:29},(_,p)=>Int32Array.from(K.slice(0,hi+14),k=>weights[mod(p+sign*k)]));const pairs=new Map();function pair(a,b){const key=a*29+b;if(!pairs.has(key)){const z=new Int32Array(hi+13);for(let i=0;i<z.length;i++)z[i]=(E[a][i]+E[b][i+1])|0;pairs.set(key,z)}return pairs.get(key)}
  let candidates=0,hashChecks=0,exactChecks=0;for(const P of vocab.values()){const x=byLength.get(P.length);if(!x)continue;const W=P.filter(p=>p!==0),n=W.length;const constant=Math.imul(P.length-n,weights[0]);if(n===0)continue;const args=[];for(let i=0;i<n;i+=2)args.push(i+1<n?pair(W[i],W[i+1]):E[W[i]]);const limit=hi-n+1;candidates+=limit;
  scan(n)(limit,constant,x.b,mask,(h,s)=>{hashChecks++;const ts=x.m.get(h);if(!ts)return;exactChecks++;const e=encode(P,s,sign),z=sig(e.C);for(const t of ts)if(t.sig===z)t.edges.push({s,t:e.t,P:P.slice(),C:e.C})},...args)}
  const original=targets.filter(t=>t.kind==="original"),chapterSizes=[158,255,383,437,224,326,378,669,66],chapters=[];let i=0;
  for(const n of chapterSizes){const a=i,b=i+n,sub=original.filter(t=>t.g>=a&&t.g<b),runes=groups.slice(a,b).flat().length,events=new Int32Array(hi+2);
   for(const t of sub){const intervals=t.edges.map(e=>[Math.max(0,e.t-runes),e.s]).filter(([l,h])=>l<=h).sort((a,b)=>a[0]-b[0]);let u=-1,v=-2;for(const [l,h] of intervals){if(l>v+1){if(u>=0){events[u]++;events[v+1]--}u=l;v=h}else v=Math.max(v,h)}if(u>=0){events[u]++;events[v+1]--}}
   let cur=0,maxCoverage=0,origin=0;for(let s=0;s<hi;s++){cur+=events[s];if(cur>maxCoverage){maxCoverage=cur;origin=s}}
   chapters.push({a,b,runes,eligible:sub.length,covered:sub.filter(t=>t.edges.length).length,missing:sub.filter(t=>!t.edges.length).length,bestWindowCoverage:maxCoverage,bestWindowOrigin:origin,windowMissing:sub.length-maxCoverage,budget:Math.floor(n*.05)});i=b
  }
  originals.push({sign,candidates,hashChecks,exactChecks,eligible:original.length,covered:original.filter(t=>t.edges.length).length,edgeCount:original.reduce((s,t)=>s+t.edges.length,0),chapters,anchors:original.filter(t=>t.edges.length).map(({g,C,edges})=>({g,C,edges}))});
  for(let d=0;d<3;d++){const a=controlTargets.filter(t=>t.d===d);let inRegister=0,recovered=0,unique=0,otherOOV=0;for(const t of a){if(vocab.has(id(t.P))){inRegister++;const e=t.edges.find(e=>e.s===t.s&&e.t===t.t&&id(e.P)===id(t.P));assert(e,"lost plant");recovered++;if(t.edges.length===1)unique++}else if(t.edges.length)otherOOV++}controls.push({d,sign,eligible:a.length,inRegister,recovered,unique,otherOOV})}
 }
 return {vocab:vocab.size,hi,originals,controls,authenticP56:{runes:85,cursor:84}};
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
