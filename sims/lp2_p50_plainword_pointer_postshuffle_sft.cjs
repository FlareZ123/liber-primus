'use strict';
const fs=require('node:fs');
const path=require('node:path');
function shuffledGate(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),grid=JSON.parse(raw[3]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,id=w=>w.join(",");
 function runeWords(t,sep){let out=[],w=[];for(const c of t){if(ix.has(c))w.push(ix.get(c));else if(sep(c)&&w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length;}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(4,7).map(native),vocab=new Set();for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.add(id(w));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,()=>true))if(w.length<=24)vocab.add(id(w));
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[7].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.add(id(w))}}
 for(let x=0;x<29;x++)vocab.add(id([x]));assert(vocab.size===35944,"broad vocab "+vocab.size);
 const maps=[59,60].map(radix=>{const a=radix===59?grid.alphabet.replace("f",""):grid.alphabet;return grid.pages.flatMap(p=>p.tokens.map(t=>radix*a.indexOf(t[0])+a.indexOf(t[1])))});
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pages=raw[1].split("%"),chapters=ranges.map(([a,b])=>{const w=runeWords(pages.slice(a-(a>=51?1:0),b+1-(b>=50?1:0)).join(""),ch=>"-.'".includes(ch));assert(id(w.flat())===id(gp.pages.slice(a,b+1).flatMap(p=>p.indices)),"cipher mismatch");return w});
 assert(chapters.flat().length===2896&&chapters.flat(2).length===12956,"counts");
 const sum=(w,weight)=>w.reduce((s,x)=>s+(weight==="GP0"?x:gp.prime[x]),0)%256;
 function enc(p,s,map,sign,hold){return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+sign*(s%29));s=map[s];return y})}
 function domain(C,map,weight,sign,hold){const edges=[];for(let s=0;s<256;s++){const w=[];function visit(i,cur){if(i===C.length){if(vocab.has(id(w)))edges.push({s,t:sum(w,weight),P:w.slice()});return}if(hold&&C[i]===0){w.push(0);visit(i+1,cur);w.pop()}const p=mod(C[i]-sign*(cur%29));if(!hold||p!==0){w.push(p);visit(i+1,map[cur]);w.pop()}}visit(0,s)}return edges}
 function shuffle(a,seed){let x=seed>>>0;for(let i=a.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const results=[];
 // Word sum affects next-state labels, not per-group lexical existence. Enumerate
 // both labels for controls, and avoid redundant original domains across them.
 for(const [mi,map] of maps.entries())for(const sign of [1,-1])for(const hold of [false,true]){
   const original=chapters.map((words,i)=>{let missing=0,uniqueWord=0,edges=0,longMissing=0,longN=0;const noExamples=[];for(const [j,C] of words.entries()){const D=domain(C,map,"GP0",sign,hold);edges+=D.length;if(C.length>=8)longN++;if(!D.length){missing++;if(C.length>=8)longMissing++;if(noExamples.length<3)noExamples.push({index:j,C})}else if(new Set(D.map(e=>id(e.P))).size===1)uniqueWord++;for(const e of D)assert(id(enc(e.P,e.s,map,sign,hold))===id(C),"original replay")}
    return {range:ranges[i],groups:words.length,missing,uniqueWord,edges,longN,longMissing,budget:Math.floor(.05*words.length),noExamples}});
   const controls=[];
   for(const weight of ["GP0","prime"])for(const [di,donor] of donors.entries()){
      const n=100;let start=-1;for(let i=Math.floor(.8*donor.length);i+n<=donor.length;i++){if(donor.slice(i,i+n).filter(w=>vocab.has(id(w))).length>=95){start=i;break}}
      assert(start>=0,"no heldout control");
      let s=(71+di*53)%256;const planted=shuffle(donor.slice(start,start+n).map((P,i)=>{const t=sum(P,weight),C=enc(P,s,map,sign,hold),x={P,C,s,t,i};s=t;return x}),3301+di+mi*71);
      let missing=0,inVocab=0,trueEdges=0,uniqueWord=0;for(const x of planted){const D=domain(x.C,map,weight,sign,hold);if(!D.length)missing++;if(vocab.has(id(x.P))){inVocab++;assert(D.some(e=>e.s===x.s&&e.t===x.t&&id(e.P)===id(x.P)),"true edge lost");trueEdges++}if(new Set(D.map(e=>id(e.P))).size===1)uniqueWord++}
      controls.push({weight,di,start,groups:n,inVocab,trueEdges,missing,uniqueWord});
   }
   results.push({radix:mi+59,sign,hold,original,controls});
 }
 return {vocab:vocab.size,results}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-grid-256.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(shuffledGate(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
