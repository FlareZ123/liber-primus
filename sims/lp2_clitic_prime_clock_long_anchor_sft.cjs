'use strict';
const fs=require('node:fs'),path=require('node:path');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw){
 const assert=(v,m)=>{if(!v)throw Error(m)},gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((r,i)=>[r,i])),tok=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),partNames=new Set(["A","AN","THE","OF","TO","IN","ON","AT","BY","UP","AS"]),mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),unid=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let j=0;j<w.length;){const t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tok.find(x=>w.startsWith(x.t,j));assert(t,"unmapped "+w);a.push(t.i);j+=t.t.length;}return a;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 function runeWords(t,sep){const out=[];let a=[],gap="";for(const c of t){if(ix.has(c)){if(a.length&&sep.test(gap)){out.push(a);a=[];}a.push(ix.get(c));gap="";}else gap+=c;}if(a.length)out.push(a);return out;}
 const parts=[...partNames].map(w=>id(word(w,true))),partSet=new Set(parts),donors=raw.slice(3,6).map(t=>body(t).toUpperCase().match(/[A-Z]+/g)||[]),vocab=new Set(),content=new Set();
 function add(w,isPart){if(w.length&&w.length<=24){vocab.add(id(w));if(!isPart)content.add(id(w));}}
 for(const d of donors)for(const w of d.slice(0,Math.floor(.8*d.length)))for(const alt of [true,false])add(word(w,alt),partNames.has(w));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))add(w,partSet.has(id(w)));
 for(const l of raw[6].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])add(word(m[1],alt),partNames.has(m[1].toUpperCase()));}
 assert(vocab.size===36193&&content.size===36182,"frozen vocab mismatch "+vocab.size+"/"+content.size);
 const children=[new Int32Array(29)],flags=[0];
 function insert(w,flag){let n=0;for(const x of unid(w)){if(!children[n][x]){children[n][x]=children.length;children.push(new Int32Array(29));flags.push(0)}n=children[n][x]}flags[n]|=flag;}
 for(const w of parts)insert(w,1);for(const w of content)insert(w,2);
 const primes=[],sieve=new Uint8Array(250000);for(let p=2;p<sieve.length;p++)if(!sieve[p]){primes.push(p);if(p*p<sieve.length)for(let x=p*p;x<sieve.length;x+=p)sieve[x]=1}
 const hi=16257,K=primes.map(p=>(p-1)%29);assert(K.length>=hi,"prime tape");
 function enc(P,s,sign){const C=P.map(p=>p===0?0:mod(p+sign*K[s++]));return{P,C,t:s}}
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u).flat(),control56=enc(p56,0,1);assert(id(control56.C)===id(gp.pages.find(p=>p.page===56).indices)&&control56.t===84,"authentic p56");
 // NFA: a particle terminal may restart the lexical trie at the next symbol.
 // Grant trailing particle chains in every group (safe relaxation of unknown order).
 function scan(C,sign,limit=hi,truth=null){
  const P=new Uint8Array(C.length);let start=0,paths=0,origins=0,first=null,found=false,ok=false;
  function step(i,s,n,p){P[i]=p;let child=children[n][p];if(child)visit(i+1,s,child);if((flags[n]&1)&&children[0][p])visit(i+1,s,children[0][p]);}
  function visit(i,s,n){if(i===C.length){if(flags[n]){paths++;ok=true;if(!first)first={s:start,t:s,P:Array.from(P)};if(truth&&start===truth.s&&s===truth.t&&truth.P.every((x,j)=>P[j]===x))found=true;}return}
   if(C[i]===0)step(i,s,n,0);
   if(s<limit){const p=mod(C[i]-sign*K[s]);if(p!==0)step(i,s+1,n,p);}
  }
  for(start=0;start<limit;start++){ok=false;visit(0,start,0);if(ok)origins++}
  return{paths,origins,first,found};
 }
 function makeGroups(ws){const groups=[];let p=[],words=[];for(const w of ws){const W=word(w,true);p.push(...W);words.push({w,W});if(!partNames.has(w)){groups.push({p,words});p=[];words=[]}}if(p.length)groups.push({p,words,trailing:true});return groups}
 let seed=2767;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const controls=[];
 for(let d=0;d<3;d++)for(const sign of [1,-1]){
  const gs=makeGroups(donors[d].slice(Math.floor(.8*donors[d].length)+100,Math.floor(.8*donors[d].length)+1100)),origin=[0,1033,3301][d];let cur=origin;
  const truth=shuffle(gs.map(g=>{const s=cur,z=enc(g.p,s,sign);cur=z.t;return {...g,...z,s}}));
  const selected=truth.filter(g=>g.P.length>=8).slice(0,45);let eligible=0,found=0,covered=0,uniqueOrigin=0,held=0,consumeZero=0;
  for(const g of selected){const last=g.words.at(-1),inRegister=g.trailing||content.has(id(last.W));const r=scan(g.C,sign,hi,g);if(r.origins)covered++;if(inRegister){eligible++;assert(r.found,"lost true native phrase");found++;if(r.origins===1)uniqueOrigin++;}held+=g.P.filter(x=>x===0).length;consumeZero+=g.C.filter(x=>x===0).length-g.P.filter(x=>x===0).length}
  controls.push({donor:d,sign,origin,selected:selected.length,inRegister:eligible,found,covered,uniqueOrigin,heldF:held,consumingZero:consumeZero});
 }
 const source=runeWords(raw[1],/[-.&]/u),groups=source.slice(0,2896),flat=groups.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(flat.length===12956&&id(flat)===id(unknown),"source grouping");
 const sizes=[158,255,383,437,224,326,378,669,66],orig=[];
 for(const sign of [1,-1]){
  let base=0;const chapters=[],witnesses=[];
  for(const n of sizes){let eligible=0,missing=0,covered=0,paths=0;for(let i=base;i<base+n;i++){const C=groups[i];if(C.length<8)continue;eligible++;const r=scan(C,sign);if(!r.origins)missing++;else{covered++;paths+=r.paths;witnesses.push({group:i,len:C.length,origins:r.origins,paths:r.paths,first:r.first})}}
   chapters.push({startGroup:base,groups:n,eligible,missing,covered,paths,budget:Math.floor(.05*n),reject:missing>Math.floor(.05*n)});base+=n;
  }
  orig.push({sign,chapters,witnesses,totalEligible:chapters.reduce((a,b)=>a+b.eligible,0),totalMissing:chapters.reduce((a,b)=>a+b.missing,0),totalCovered:chapters.reduce((a,b)=>a+b.covered,0)});
 }
 return {vocab:vocab.size,content:content.size,particles:parts.map(unid),trieNodes:children.length,primeLimit:hi,authenticP56:{runes:p56.length,consumed:control56.t},controls,original:orig};
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
