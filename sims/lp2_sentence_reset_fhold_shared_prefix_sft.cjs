"use strict";
// Exact common key-prefix inference with authentic plaintext-F holds.
function experiment(inputs){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map()),mod=x=>(x%29+29)%29;
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),shw=donor(sh);
 for(const p of [...g,...shw])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"frozen lexicon");
 let w=[],s=[],offset=0,start=0,segments=[];
 function fw(){if(w.length){s.push({start,w});w=[]}}
 function fs(){fw();if(s.length)segments.push(s);s=[]}
 for(const c of raw.split("%").slice(0,55).join("%")){if(map.has(c)){if(!w.length)start=offset;w.push(map.get(c));offset++}else if("-.$&§".includes(c)){fw();if(c===".")fs()}}
 fs();assert(segments.length===173&&segments.flat().length===2896,"corrected source segmentation");
 assert(String(segments.flatMap(s=>s.flatMap(x=>x.w)))===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original rune tape");
 const keyString=a=>String.fromCharCode(...a.map(x=>65+x)),keyArray=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function candidates(c){const out=new Set();for(const p of dict[c.length].values()){let ok=true;const k=[];for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){ok=false;break}}else k.push(mod(c[i]-p[i]))}if(ok)out.add(keyString(k))}return out}
 // Each candidate is a cylinder of unbounded key tapes sharing that prefix.
 // Every optimal key has a longest matching terminal prefix. OR the word
 // identities attached to that prefix and its ancestors, counting each once.
 function solve(words){
  const term=new Map();words.forEach((c,i)=>{for(const k of candidates(c))term.set(k,(term.get(k)||0n)|(1n<<BigInt(i)))});
  let best=0,keys=[],bestMask=0n;
  for(const [key,mask0] of term){let mask=mask0;for(let j=0;j<key.length;j++)mask|=term.get(key.slice(0,j))||0n;let n=0,v=mask;while(v){n++;v&=v-1n}if(n>best){best=n;keys=[];bestMask=mask}if(n===best)keys.push(key)}
  if(!keys.length)keys=[""];
  let common=keys[0];for(const k of keys){let j=0;while(j<common.length&&j<k.length&&common[j]===k[j])j++;common=common.slice(0,j)}
  return {n:words.length,best,minOOVLowerBound:words.length-best,terminalRepresentatives:keys.length,forcedPrefix:keyArray(common),samplePrefix:keyArray(keys[0]),uniqueTerminalPrefixes:term.size,matched:words.flatMap((w,i)=>(bestMask&(1n<<BigInt(i)))?[i]:[])};
 }
 const cuts=[0,729,1874,3603,5506,6761,7960,9640,12648,12956];
 const groups=cuts.slice(0,-1).map((a,i)=>segments.filter(s=>s[0].start>=a&&s[0].start<cuts[i+1]));
 const lengths=groups.map(ss=>ss.map(s=>s[0].w.length));
 const first=segments.map(s=>s[0]);
 const single=first.filter(w=>w.w.length===1).map(w=>({offset:w.start,cipher:w.w[0]}));
 assert(single.length===7&&new Set(single.map(w=>w.cipher)).size===7&&single.every(w=>w.cipher!==0),"seven distinct consuming sentence-opening singletons");
 const global=solve(first.map(w=>w.w)),chapters=groups.map((ss,i)=>({start:cuts[i],end:cuts[i+1],...solve(ss.map(s=>s[0].w))}));
 const dropFirst=groups.map(ss=>solve(ss.slice(1).map(s=>s[0].w)));
 assert(global.best===27&&chapters.map(x=>x.best).join(",")==="5,7,8,6,6,7,9,11,2","original exact maxima");
 function encode(ws,key){let phase=0;return ws.map(w=>w.map(p=>p===0?0:mod(p+key[phase++])))}
 function plant(name,ds,shape,seed){
  let state=seed>>>0;function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
  const pool=Array.from({length:32},()=>[]);for(let i=Math.floor(ds.length*.7);i<ds.length-1;i++){if(ds[i].length<32)pool[ds[i].length].push(i)}
  const used=new Set();
  const plain=shape.map(l=>{const ids=pool[l].filter(i=>!used.has(i)&&!used.has(i+1));assert(ids.length,"matched donor anchor");const i=ids[rand()%ids.length];used.add(i);used.add(i+1);return [ds[i],ds[i+1]]});
  const key=Array.from({length:64},()=>rand()%29);
  const cipher=plain.map(ws=>encode(ws,key)),res=solve(cipher.map(ws=>ws[0]));
  assert(res.best===shape.length&&res.forcedPrefix.every((v,i)=>v===key[i]),"true key must survive");
  function predict(ws,known){
   let paths=[{phase:0,words:[]}];
   for(const c of ws){const next=[];for(const head of paths){const p=[];function walk(i,phase){if(i===c.length){if(dict[p.length].has(String(p)))next.push({phase,words:[...head.words,p.slice()]});return}if(c[i]===0){p.push(0);walk(i+1,phase);p.pop()}const v=mod(c[i]-known[phase]);if(v!==0){p.push(v);walk(i+1,phase+1);p.pop()}}walk(0,head.phase)}paths=next}return new Map(paths.map(x=>[String(x.words[1]),x.words[1]]));
  }
  let eligible=0,unique=0,correct=0,runes=0;
  for(let i=0;i<cipher.length;i++)if(cipher[i].flat().length<=res.forcedPrefix.length){eligible++;const ps=predict(cipher[i],res.forcedPrefix);assert(ps.has(String(plain[i][1])),"true heldout word must survive");if(ps.size===1){unique++;correct+=Number(ps.has(String(plain[i][1])));runes+=plain[i][1].length}}
  return {name,n:shape.length,keyPrefix:res.forcedPrefix.length,terminalRepresentatives:res.terminalRepresentatives,fullSupport:res.best,heldoutEligible:eligible,heldoutUnique:unique,heldoutExact:correct,heldoutRunes:runes,plaintextF:plain.flat(2).filter(x=>x===0).length,ciphertextF:cipher.flat(2).filter(x=>x===0).length};
 }
 const plants=[];
 for(const [j,ds] of [g,shw].entries()){
  plants.push(plant(j?"Shakespeare/global":"Gibran/global",ds,lengths.flat(),0x33012957+j));
  for(let i=0;i<groups.length;i++)plants.push(plant(`${j?"Shakespeare":"Gibran"}/chapter${i+1}`,ds,lengths[i],0x33012960+j*16+i));
 }
 assert(plants.every(p=>p.heldoutExact===p.heldoutUnique),"all unique heldout predictions");
 // The title has no ciphertext F, hence all nine shifts are consumed. For
 // each possible title key, intersect it with all legal opening-body prefixes.
 function overlap(title,body,known=null){
  assert(title.length===2&&title.flat().length===9&&title.flat().every(v=>v!==0),"nine consuming title symbols");
  assert(body.slice(0,2).flat().filter(v=>v!==0).length>=9,"body covers title key");
  const titleKeys=new Set();for(const a of candidates(title[0]))for(const b of candidates(title[1]))titleKeys.add(a+b);
  const b0=candidates(body[0]),b1=candidates(body[1]),prefixes=new Set();for(const k of b1)for(let i=0;i<=k.length;i++)prefixes.add(k.slice(0,i));
  const surviving=[];
  for(const k of titleKeys){let ok=false;for(let i=0;i<=k.length;i++)if(b0.has(k.slice(0,i))&&prefixes.has(k.slice(i))){ok=true;break}if(ok)surviving.push(k)}
  return {titleKeys:titleKeys.size,survivingTitleKeys:surviving.length,truthRetained:known?surviving.includes(keyString(known.slice(0,9))):null};
 }
 const title=segments.at(-2),body=segments.at(-1);
 assert(title[0].start===12648&&body[0].start===12657,"original terminal seam");
 const terminalOverlap={titleRunes:9,bodyRunes:299,...overlap(title.map(x=>x.w),body.map(x=>x.w))};
 assert(terminalOverlap.survivingTitleKeys===0,"original terminal overlap");
 const terminalPlants=[];
 for(const ds of [g,shw]){
  const ptitle=[[24],ds.find(w=>w.length===8&&w.every(v=>v!==0))];
  const pbody=[ds.find(w=>w.length===8&&w.filter(v=>v===0).length===1),ds.find(w=>w.length===3&&w.every(v=>v!==0))];
  const key=Array.from({length:64},(_,i)=>(7*i+11)%29);ptitle.flat().forEach((p,i)=>{if(mod(p+key[i])===0)key[i]=mod(key[i]+1)});
  // Guarantee at least nine nonzero ciphertext body symbols (and one genuine
  // transparent F). Adjust only synthetic key, before performing inference.
  let phase=0;for(const p of pbody.flat()){if(p===0)continue;while(mod(p+key[phase])===0||(phase<9&&mod(ptitle.flat()[phase]+key[phase])===0))key[phase]=mod(key[phase]+1);phase++}
  const o=overlap(encode(ptitle,key),encode(pbody,key),key);assert(o.truthRetained,"terminal positive overlap");terminalPlants.push(o);
 }
 return {vocabulary,segments:segments.length,words:segments.flat().length,runes:offset,single,global,chapters,dropFirst:dropFirst.map(x=>({n:x.n,best:x.best,minOOVLowerBound:x.minOOVLowerBound})),plants,terminalOverlap,terminalPlants};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
