'use strict';
const fs=require('node:fs'),path=require('node:path');
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/liber-primus/lp2-grid-256.json"
];
function experiment(raw){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,id=w=>w.join(",");
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),grid=JSON.parse(raw[7]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"token "+w);p.push(v.i);j+=v.t.length;}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(3,6).map(native),vocab=new Map();for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24)vocab.set(id(w),w);
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
 for(let x=0;x<29;x++)vocab.set(id([x]),[x]);assert(vocab.size===35944,"broad vocab "+vocab.size);
 const trie=[new Int32Array(29)],ends=[false];for(const w of vocab.values()){let n=0;for(const x of w){if(!trie[n][x]){trie[n][x]=trie.length;trie.push(new Int32Array(29));ends.push(false)}n=trie[n][x]}ends[n]=true}
 const gridTokens=grid.pages.flatMap(p=>p.tokens),bytes=grid.pages.flatMap(p=>p.bytes);assert(bytes.length===256,"grid shape");
 const options=[];for(const radix of [59,60]){const alphabet=radix===60?grid.alphabet:grid.alphabet.replace("f","");const B=gridTokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));assert(B.every(x=>x>=0&&x<256),"grid bytes");if(radix===60)assert(id(B)===id(bytes),"grid input");for(const order of ["row","column"])for(const reverse of [false,true])for(const sign of [1,-1]){let K=order==="row"?B.slice():Array.from({length:256},(_,i)=>B[(i%32)*8+Math.floor(i/32)]);if(reverse)K.reverse();K=K.map(x=>mod(sign*x));options.push({radix,order,reverse,sign,K})}}
 const source=runeWords(raw[1],/[-.&]/u),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(id(source.flat().slice(0,12956))===id(unknown),"source mismatch");const groups=source.slice(0,2896);assert(groups.flat().length===12956,"group mismatch");
 function domain(C,K,hold){const out=[],P=[];let start=0;function visit(i,s,node){if(i===C.length){if(ends[node])out.push({s:start,t:s%256,P:P.slice()});return}const c=C[i];if(hold&&c===0&&trie[node][0]){P.push(0);visit(i+1,s,trie[node][0]);P.pop()}const p=mod(c-K[s%256]),n=trie[node][p];if((!hold||p!==0)&&n){P.push(p);visit(i+1,s+1,n);P.pop()}}
 for(start=0;start<256;start++)visit(0,start,0);return out}
 function encode(P,K,s,hold){const C=[];for(const p of P){if(hold&&p===0)C.push(0);else C.push(mod(p+K[s++%256]))}return {C,t:s%256}}
 const minima=[158,255,383,437,224,326,378,669,66];const split=[];let pos=0;for(const n of minima){split.push([pos,pos+n]);pos+=n}assert(pos===groups.length,"chapters");
 const results=[];for(const {K,...mode} of options)for(const hold of [true,false]){const anchors=[];const counts=Array(9).fill(0),allCounts=Array(9).fill(0);let chapter=0,edges=0;for(const [i,C] of groups.entries()){if(i>=split[chapter][1])chapter++;const D=domain(C,K,hold);if(D.length){allCounts[chapter]++;edges+=D.length;if(C.length>=8){counts[chapter]++;anchors.push({i,C,options:D})}}}results.push({...mode,hold,allCounts,covered:allCounts.reduce((a,b)=>a+b,0),longCounts:counts,longCovered:anchors.length,edges,anchors})}
 let seed=33012511;function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const controls=[];for(const [d,donor] of donors.entries())for(const hold of [true,false]){const mode=options[[0,7,15][d]],start=Math.floor(donor.length*.8),P=donor.slice(start,start+669);let s=[0,119,231][d];const pairs=P.map(P=>{const v={P,s,...encode(P,mode.K,s,hold)};s=v.t;return v});for(let i=pairs.length-1;i>0;i--){const j=next()%(i+1);[pairs[i],pairs[j]]=[pairs[j],pairs[i]]}let eligible=0,inVocab=0,retained=0,unique=0;for(const {P,C,s,t} of pairs){if(P.length<8)continue;eligible++;if(!vocab.has(id(P)))continue;inVocab++;const D=domain(C,mode.K,hold);const ok=D.some(e=>e.s===s&&e.t===t&&id(e.P)===id(P));assert(ok,"lost plant");retained+=+ok;unique+=+(D.length===1)}controls.push({donor:d,hold,eligible,inVocab,retained,unique})}
 return {groups:groups.length,runes:unknown.length,lexicon:vocab.size,chapters:minima,longTotal:groups.filter(g=>g.length>=8).length,results,controls}
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
