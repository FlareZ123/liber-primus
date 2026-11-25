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
const assert=(x,m)=>{if(!x)throw Error(m)},gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),mod=x=>(x%29+29)%29,id=w=>w.join(",");
function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length;}return p;}
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
const donors=raw.slice(3,6).map(native),vocab=new Map();for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24)vocab.set(id(w),w);
assert(vocab.size===10842,"base vocab "+vocab.size);
for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
for(let x=0;x<29;x++)vocab.set(id([x]),[x]);assert(vocab.size===35944,"broad vocab "+vocab.size);
const trie=[new Int32Array(29)],ends=[false];for(const w of vocab.values()){let node=0;for(const x of w){if(!trie[node][x]){trie[node][x]=trie.length;trie.push(new Int32Array(29));ends.push(false)}node=trie[node][x]}ends[node]=true}
const primes=[],sieve=new Uint8Array(1000000);for(let p=2;p<sieve.length;p++)if(!sieve[p]){primes.push(p);if(p*p<sieve.length)for(let x=p*p;x<sieve.length;x+=p)sieve[x]=1}
const K=primes.map(p=>(p-1)%29),nextDiff=new Int32Array(K.length);for(let j=K.length-2;j>=0;j--)nextDiff[j]=K[j]===K[j+1]?nextDiff[j+1]:j+1;
function bound(n){let j=3301;for(let i=0;i<n;i++){assert(nextDiff[j]>j,"bound too large");j=nextDiff[j]+1}return j}
function transition(c,prev,j,sign,emit){if(c===0)emit(0,j);const p=mod(c-sign*K[j]);if(p!==0)emit(p,j+1);
if(prev<0){for(let k=j+1;k<=nextDiff[j];k++){const q=mod(c-sign*K[k]);if(q!==0)emit(q,k+1)}return}
const q=mod(prev-sign*K[j]);if(q===0)return;for(let k=j+1;k<=nextDiff[j];k++)if(c===mod(q+sign*K[k]))emit(q,k+1)}
function domain(C,hi,sign){const out=[],P=[];let start=0;function visit(i,j,node){if(i===C.length){if(ends[node])out.push({s:start,t:j,P:P.slice()});return}if(j>=hi)return;transition(C[i],i?C[i-1]:-1,j,sign,(p,k)=>{if(k>hi)return;const n=trie[node][p];if(n){P.push(p);visit(i+1,k,n);P.pop()}})}for(start=0;start<hi;start++)visit(0,start,0);return [...new Map(out.map(e=>[e.s+"|"+e.t+"|"+id(e.P),e])).values()]}
function summary(groups,hi,sign,truth=null){let eligible=0,covered=0,edges=0,correct=0,unique=0,exactUnique=0,truthInVocab=0;const candidates=[],missing=[];
for(const [i,C] of groups.entries()){if(C.length<8)continue;eligible++;const D=domain(C,hi,sign);edges+=D.length;if(D.length){covered++;if(D.length===1)unique++;candidates.push({i,length:C.length,C,options:D})}else missing.push(i);
if(truth&&vocab.has(id(truth[i].P))){truthInVocab++;assert(D.some(e=>e.s===truth[i].s&&e.t===truth[i].t&&id(e.P)===id(truth[i].P)),"lost correct edge "+i);correct++;if(D.length===1)exactUnique++}}
return {groups:groups.length,hi,sign,eligible,covered,missing:eligible-covered,unique,edges,truthInVocab,correct,exactUnique,missingGroupIndices:missing,candidates}}
let seed=33012700;function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function shuffle(a){for(let i=a.length-1;i>0;i--){let j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function plant(P,origin,sign,skip){let j=origin,prev=-1,skips=0;const result=P.map(P=>{let s=j,C=[];for(const p of P){let c=0;if(p!==0){c=mod(p+sign*K[j]);if(skip&&c===prev&&next()%5!==0){while(c===prev){j++;skips++;c=mod(p+sign*K[j])}}j++}C.push(c);prev=c}return {s,t:j,P,C}});return {result,skips,end:j}}
const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u),q=plant(p56,0,1,false);assert(id(q.result.flatMap(x=>x.C))===id(gp.pages.find(p=>p.page===56).indices)&&q.end===84,"authentic p56");
const controls=[];for(const [d,donor] of donors.entries())for(const sign of [1,-1]){const n=669,start=Math.floor(donor.length*.8),origin=[0,1033,3301][d],P=donor.slice(start,start+n);assert(P.length===n,"donor too short");const a=plant(P,origin,sign,true),truth=shuffle(a.result);const r=summary(truth.map(x=>x.C),bound(P.flat().length),sign,truth);delete r.candidates;delete r.missingGroupIndices;controls.push({d,start,origin,skips:a.skips,end:a.end,...r})}
const source=runeWords(raw[1],/[-.&]/u),flat=source.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(id(flat.slice(0,12956))===id(unknown),"source mismatch");const groups=source.slice(0,2896);assert(groups.flat().length===12956,"group mismatch");
const hi=bound(12956),originals=[];for(const sign of [1,-1]){const r=summary(groups,hi,sign);let i=0;const chapters=[];for(const n of [158,255,383,437,224,326,378,669,66]){const a=i,b=i+n;chapters.push({a,b,groups:n,eligible:groups.slice(a,b).filter(w=>w.length>=8).length,missing:r.missingGroupIndices.filter(k=>k>=a&&k<b).length,budget:Math.floor(n*.05)});i=b}originals.push({...r,budget:Math.floor(groups.length*.05),chapters})}
return {vocab:vocab.size,authenticP56:{runes:85,consuming:84},cursorUpper:hi,controls,originals}
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
