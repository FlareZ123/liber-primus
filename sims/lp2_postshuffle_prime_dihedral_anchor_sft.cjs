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
 const rotate=(w,r)=>w.slice(r).concat(w.slice(0,r));
 function orientations(C){const seen=new Map();for(let rev=0;rev<2;rev++){const w=rev?C.slice().reverse():C;for(let r=0;r<w.length;r++){const a=rotate(w,r),k=id(a);if(!seen.has(k))seen.set(k,{a,rev,r})}}return [...seen.values()]}
 function domain(C,hi,sign){const result=[],P=[];for(const {a,rev,r} of orientations(C)){let start=0;function visit(i,s,node){if(i===a.length){if(ends[node])result.push({s:start,t:s,P:P.slice(),rev,r});return}const c=a[i];if(c===0&&trie[node][0]){P.push(0);visit(i+1,s,trie[node][0]);P.pop()}if(s<hi){const p=mod(c-sign*K[s]),n=trie[node][p];if(p!==0&&n){P.push(p);visit(i+1,s+1,n);P.pop()}}}for(start=0;start<hi;start++)visit(0,start,0)}return result}
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u);let cursor=0;const p56C=p56.flatMap(P=>{const e=encode(P,cursor,1);cursor=e.t;return e.C});assert(id(p56C)===id(gp.pages.find(p=>p.page===56).indices)&&cursor===84,"p56");
 const groups=runeWords(raw[1],/[-.&]/u).slice(0,2896),flat=groups.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(flat.length===12956&&id(flat)===id(unknown),"source");
 let seed=330144;function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){for(let i=a.length-1;i>0;i--){let j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const originals=[],controls=[];
 for(const sign of [1,-1]){let i=0;const chapters=[],candidates=[];for(const n of [158,255,383,437,224,326,378,669,66]){let eligible=0,covered=0,edges=0;for(let g=i;g<i+n;g++){const C=groups[g];if(C.length<8)continue;eligible++;const D=domain(C,16257,sign);if(D.length){covered++;edges+=D.length;candidates.push({g,C,D})}}chapters.push({start:i,n,eligible,covered,edges,minOOV:eligible-covered,budget:Math.floor(n*.05)});i+=n}originals.push({sign,chapters,candidates})}
 for(let d=0;d<3;d++)for(const sign of [1,-1]){let cursor=[0,1033,3301][d],start=Math.floor(donors[d].length*.8),P=donors[d].slice(start,start+669);const truth=shuffle(P.map(P=>{const s=cursor,e=encode(P,s,sign);cursor=e.t;const C=rotate(next()%2?e.C.slice().reverse():e.C,next()%e.C.length);return {P,C,s,t:e.t,ordered:e.C}}));let eligible=0,inVocab=0,recovered=0,unique=0,oovHits=0,edges=0;for(const w of truth){if(w.C.length<8)continue;const D=domain(w.C,3301+P.flat().length,sign);edges+=D.length;if(vocab.has(id(w.P))){inVocab++;const trueEdge=D.find(e=>e.s===w.s&&e.t===w.t&&id(e.P)===id(w.P));assert(trueEdge,"missing plant");const a=rotate(trueEdge.rev?w.C.slice().reverse():w.C,trueEdge.r);assert(id(a)===id(w.ordered)&&id(encode(trueEdge.P,trueEdge.s,sign).C)===id(a),"replay");recovered++;if(D.length===1)unique++}else if(D.length)oovHits++}controls.push({d,sign,eligible,inVocab,recovered,unique,oovHits,edges})}
 return {vocab:vocab.size,p56:{runes:p56C.length,cursor},originals,controls}
}
const result=experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(result,null,2));
