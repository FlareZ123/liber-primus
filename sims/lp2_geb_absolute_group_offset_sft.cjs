"use strict";
// #2721: exact absolute book-offset matching under literal-F nonadvance.
function experiment(raw,book){
const alphabet=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"],ix=new Map(alphabet.map((v,i)=>[v,i])),id=w=>String.fromCharCode(...w.map(x=>65+x)),num=s=>[...s].map(x=>x.charCodeAt(0)-65),assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29;
const latin="F U TH O R C G W H N I J EO P X S T B E M L ING OE D A AE Y IA EA".split(" ");
const bookTokens=latin.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const donorTokens=latin.map((t,i)=>({t:i===21?"NG":t,i})).sort((a,b)=>b.t.length-a.t.length);
function toBook(t,letters){const tokens=letters?bookTokens.filter(x=>x.t.length===1):bookTokens,alias={V:1,K:5,Z:15,Q:5},out=[];t=t.normalize("NFKD").replace(/\p{M}/gu,"").replace(/[^A-Za-z ]/g," ").toUpperCase().replace(/QU/g,"CW");for(const w of t.match(/[A-Z]+/g)||[])for(let j=0;j<w.length;){const v=tokens.find(x=>w.startsWith(x.t,j));if(v){out.push(v.i);j+=v.t.length}else{out.push(alias[w[j]]??0);j++}}return Uint8Array.from(out)}
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:donorTokens.find(x=>w.startsWith(x.t,j));assert(v,"unmapped "+w);p.push(v.i);j+=v.t.length}return p})}
function words(t){return(t.match(/\p{Script=Runic}+/gu)||[]).map(w=>[...w].map(x=>ix.get(x)))}
const donors=raw.slice(2).map(native),dict=new Set();
for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)dict.add(id(w));
for(const s of JSON.parse(raw[1]).sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of words(s.source_text))dict.add(id(w));
assert(dict.size===10842,"dict "+dict.size);
const byLength=new Map();for(const w of dict){if(!byLength.has(w.length))byLength.set(w.length,[]);byLength.get(w.length).push(num(w))}
const pages=raw[0].split("%"),ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,52],[53,54]],chapters=ranges.map(([a,b])=>words(pages.slice(a,b+1).join("").replace(/[/\s]/g,"")));
assert(chapters.flat().length===2896&&chapters.flat(2).length===12956,"source counts");
const eligible=c=>c.filter(x=>x!==0).length>=8,code=k=>k.slice(0,8).reduce((s,x)=>s*29+x,0),power=29**7;
function required(c,p,sign){const k=[];for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0)return null}else{k.push(mod(sign*(c[i]-p[i])))}}return k}
function encode(p,key,start,sign){const c=[];let j=start;for(const x of p){if(x===0)c.push(0);else c.push(mod(x+sign*key[j++]))}return {c,end:j}}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function matches(key,items){const Q=new Map(),sets=items.map(()=>[]);let patterns=0,queryHits=0;
 for(let i=0;i<items.length;i++){const {c,signs}=items[i];assert(eligible(c),"ineligible anchor");for(const p of byLength.get(c.length)||[])for(const sign of signs){const k=required(c,p,sign);if(!k)continue;assert(k.length>=8,"short key");const z=code(k);if(!Q.has(z))Q.set(z,[]);Q.get(z).push({i,p:id(p),k,sign});patterns++}}
 let z=0;for(let i=0;i<8;i++)z=z*29+key[i];for(let i=0;i+8<=key.length;i++){
  const a=Q.get(z);if(a){queryHits++;for(const x of a){if(i+x.k.length>key.length)continue;let ok=true;for(let j=8;j<x.k.length;j++)if(key[i+j]!==x.k[j]){ok=false;break}if(ok)sets[x.i].push({offset:i,end:i+x.k.length,word:x.p,sign:x.sign})}}
  if(i+8<key.length)z=(z-key[i]*power)*29+key[i+8];
 }
 return {sets,patterns,prefixQueries:Q.size,queryHits}
}
const formats=[];
for(const letters of [false,true]){
 const key=toBook(book,letters),label=letters?"letters":"digraph";assert(key.length===(letters?1470789:1399392),"pinned book rune count "+label+" "+key.length);
 const plants=[];
 for(let d=0;d<donors.length;d++){
  const donor=donors[d],sign=d%2?-1:1,offset=100000+(letters?500000:0)+d*170003,R=rng(33012721+d+Number(letters)*99),n=100;let selected=null;
  for(let start=Math.floor(donor.length*.8);start+n<=donor.length;start++){
   const p=donor.slice(start,start+n);if(p.filter(w=>!dict.has(id(w))).length>5)continue;let cursor=offset;const pairs=p.map((P,i)=>{const start=cursor,e=encode(P,key,cursor,sign);cursor=e.end;return {P,c:e.c,start,end:cursor,i}});
   if(pairs.filter(x=>eligible(x.c)&&dict.has(id(x.P))).length<4)continue;
   selected={d,start,offset,end:cursor,sign,pairs:shuffle(pairs,R)};break
  }
  assert(selected,"no plant "+label+" "+d);plants.push(selected)
 }
 const items=[],originalIndex=[],plantIndex=[];
 for(let ch=0;ch<chapters.length;ch++)for(let i=0;i<chapters[ch].length;i++){const c=chapters[ch][i];if(!eligible(c))continue;originalIndex.push({ch,i,item:items.length});items.push({c,signs:[1,-1]})}
 for(let d=0;d<plants.length;d++)for(const p of plants[d].pairs){if(!eligible(p.c))continue;plantIndex.push({d,p,item:items.length});items.push({c:p.c,signs:[1,-1]})}
 const m=matches(key,items);
 const original=chapters.map((g,ch)=>{const ix=originalIndex.filter(x=>x.ch===ch);const supported=ix.filter(x=>m.sets[x.item].length);return {ch,groups:g.length,eligible:ix.length,covered:supported.length,missing:ix.length-supported.length,budget:Math.floor(g.length*.05),matchCount:supported.reduce((s,x)=>s+m.sets[x.item].length,0),supportedGroupIndices:supported.map(x=>x.i)}});
 const controls=plants.map((plant,d)=>{
  const a=plantIndex.filter(x=>x.d===d),inReg=a.filter(x=>dict.has(id(x.p.P))),trueHits=inReg.filter(x=>m.sets[x.item].some(y=>y.sign===plant.sign&&y.word===id(x.p.P)&&y.offset===x.p.start&&y.end===x.p.end));assert(trueHits.length===inReg.length,"lost true offset");
  const unique=inReg.filter(x=>m.sets[x.item].length===1&&m.sets[x.item][0].offset===x.p.start&&m.sets[x.item][0].sign===plant.sign&&m.sets[x.item][0].word===id(x.p.P));
  const ordered=unique.slice().sort((a,b)=>m.sets[a.item][0].offset-m.sets[b.item][0].offset).map(x=>x.p.i);assert(ordered.every((x,i)=>i===0||x>ordered[i-1]),"anchor order");
  return {d,start:plant.start,bookInterval:[plant.offset,plant.end],sign:plant.sign,groups:plant.pairs.length,eligible:a.length,inRegister:inReg.length,trueHits:trueHits.length,uniqueAbsoluteWordOffsets:unique.length,anchorOrderRecovered:ordered,ambiguities:inReg.map(x=>m.sets[x.item].length),falseSupportedOOV:a.filter(x=>!dict.has(id(x.p.P))&&m.sets[x.item].length).length};
 });
 formats.push({label,keyLength:key.length,patterns:m.patterns,prefixQueries:m.prefixQueries,bookQueryHits:m.queryHits,original,controls})
}
return {dictionary:dict.size,formats};
}
const fs=require("node:fs"),crypto=require("node:crypto");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const URL="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt";
(async()=>{const res=await fetch(URL);if(!res.ok)throw Error("book fetch "+res.status);const bytes=Buffer.from(await res.arrayBuffer());if(crypto.createHash("sha256").update(bytes).digest("hex")!=="2674287a2f6ccdf9f263451b9e332d57d39af7891090ddc3561b6c5fa7fccf8e")throw Error("source drift");console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),bytes.toString("utf8")),null,2));})().catch(e=>{console.error(e);process.exitCode=1});
