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
 const trie=[new Int32Array(29)],ends=[false];for(const w of vocab.values()){let node=0;for(const x of w){if(!trie[node][x]){trie[node][x]=trie.length;trie.push(new Int32Array(29));ends.push(false)}node=trie[node][x]}ends[node]=true}
 const primes=[];const sieve=new Uint8Array(250000);for(let p=2;p<sieve.length;p++)if(!sieve[p]){primes.push(p);if(p*p<sieve.length)for(let x=p*p;x<sieve.length;x+=p)sieve[x]=1}assert(primes.length>16257,"prime range");
 const K=primes.map(p=>(p-1)%29);
 function encode(w,s,sign){const C=[];for(const p of w){if(p===0)C.push(0);else C.push(mod(p+sign*K[s++]))}return {C,t:s}}
 function domain(C,lo,hi,sign){const result=[],P=[];let start=lo;function visit(i,s,node){if(i===C.length){if(ends[node])result.push({s:start,t:s,P:P.slice()});return}const c=C[i];if(c===0&&trie[node][0]){P.push(0);visit(i+1,s,trie[node][0]);P.pop()}if(s<hi){const p=mod(c-sign*K[s]),n=trie[node][p];if(p!==0&&n){P.push(p);visit(i+1,s+1,n);P.pop()}}}
 for(start=lo;start<hi;start++)visit(0,start,0);
 return result}
 function summary(groups,lo,hi,sign,minLen=8,truth=null){let eligible=0,covered=0,unique=0,uniquePhase=0,correct=0,exactUnique=0,edges=0,truthInVocab=0,missing=[];const candidates=[];
 for(const [i,C] of groups.entries()){if(C.length<minLen)continue;eligible++;const D=domain(C,lo,hi,sign);edges+=D.length;if(D.length){covered++;if(D.length===1)unique++;if(new Set(D.map(e=>e.s)).size===1)uniquePhase++;candidates.push({i,length:C.length,C,options:D});}else missing.push(i);
 if(truth&&vocab.has(id(truth[i].P))){truthInVocab++;assert(D.some(e=>e.s===truth[i].s&&e.t===truth[i].t&&id(e.P)===id(truth[i].P)),"lost correct native edge "+i);correct++;if(D.length===1)exactUnique++}}
 return {groups:groups.length,lo,hi,sign,minLen,eligible,covered,missing:eligible-covered,unique,uniquePhase,edges,truthInVocab,correct,exactUnique,missingGroupIndices:missing,candidates};}
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u);
 const original56=gp.pages.find(p=>p.page===56).indices;
 let cursor=0;const p56C=p56.map(P=>{const s=cursor,e=encode(P,s,1);cursor=e.t;return {P,C:e.C,s,t:e.t}});
 assert(id(p56C.flatMap(x=>x.C))===id(original56)&&cursor===84,"authentic p56 replay");
 let seed=33012695;function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){for(let i=a.length-1;i>0;i--){let j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const controls=[];
 for(const [d,donor] of donors.entries())for(const sign of [1,-1]){
  const n=669,start=Math.floor(donor.length*.8),origin=[0,1033,3301][d],P=donor.slice(start,start+n);assert(P.length===n,"donor too short");
  let j=origin;const truth=shuffle(P.map(P=>{const s=j,e=encode(P,s,sign);j=e.t;return {P,C:e.C,s,t:e.t}}));
  const r=summary(truth.map(x=>x.C),0,3301+P.flat().length,sign,8,truth);delete r.candidates;delete r.missingGroupIndices;controls.push({d,start,origin,heldF:P.flat().filter(x=>x===0).length,consumeZero:truth.flatMap(x=>x.C).filter(x=>x===0).length-P.flat().filter(x=>x===0).length,...r})}
 const source=runeWords(raw[1],/[-.&]/u),flat=source.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(id(flat.slice(0,12956))===id(unknown),"source mismatch");
 const groups=source.slice(0,2896);assert(groups.flat().length===12956,"group mismatch");
 const originals=[];
 for(const sign of [1,-1]){
  const r=summary(groups,0,12956+3301,sign,8);
  let i=0;const chapters=[];for(const n of [158,255,383,437,224,326,378,669,66]){const a=i,b=i+n;chapters.push({a,b,groups:n,eligible:groups.slice(a,b).filter(w=>w.length>=8).length,missing:r.missingGroupIndices.filter(k=>k>=a&&k<b).length,budget:Math.floor(n*.05)});i=b}
  originals.push({...r,budget:Math.floor(groups.length*.05),chapters});
 }
 return {vocab:vocab.size,authenticP56:{runes:original56.length,consuming:cursor},inputs:raw.map(x=>x.length),controls,originals};
}
const result=experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(result,null,2));
