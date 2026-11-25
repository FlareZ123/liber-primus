'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(A,T,B){
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(x,m)=>{if(!x)throw Error(m)};
 const mp=new Map(A.runes.map((v,i)=>[v,i]));let words=[],cur=[],rawPage=0;
 function finish(){if(cur.length){words.push({v:cur.map(x=>x.i),page:cur[0].page,endPage:cur.at(-1).page});cur=[]}}
 for(const line of T.split(/\r?\n/)){if(line==="%"){rawPage++;continue}if(line==="$")continue;if(line==="&"){finish();continue}for(const ch of line){if(mp.has(ch))cur.push({i:mp.get(ch),page:rawPage<50?rawPage:rawPage+1});else if(ch==="-"||ch===".")finish()}}
 finish();words=words.slice(0,2896);assert(same(words.flatMap(w=>w.v),A.pages.slice(0,56).flatMap(p=>p.indices)),"source");assert(words.filter(w=>w.page!==w.endPage).length===32,"carries");
 const bounds=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapters=bounds.map(([lo,hi])=>words.filter(w=>w.page>=lo&&w.page<=hi));
 const sig=w=>w.v[0]+","+w.v.at(-1);
 function classes(ch,pageLocal,keepLength){const m=new Map();for(let i=1;i<ch.length-1;i++){const w=ch[i];if(w.page!==w.endPage)continue;const k=(pageLocal?w.page+":":"")+sig(w)+(keepLength?":"+w.v.length:"");if(!m.has(k))m.set(k,[]);m.get(k).push(i)}return m}
 const fact=n=>{let p=1n;for(let i=2;i<=n;i++)p*=BigInt(i);return p};
 function multinomial(a){let m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);let p=fact(a.length);for(const x of m.values())p/=fact(x);return p}
 function bits(x){const s=x.toString(2);return s.length<=53?Math.log2(Number(x)):s.length-53+Math.log2(Number(BigInt("0b"+s.slice(0,53))))}
 function capacity(pageLocal,keepLength){let tapes=1n,lengths=1n,mixed=0,slots=0,movable=0,classesN=0;for(const ch of chapters)for(const ids of classes(ch,pageLocal,keepLength).values()){const w=ids.map(i=>ch[i]);const a=multinomial(w.map(x=>x.v.join(","))),b=multinomial(w.map(x=>x.v.length));tapes*=a;lengths*=b;if(a>1n){classesN++;movable+=ids.length}if(b>1n){mixed++;slots+=ids.length}}
 return {pageLocal,keepLength,tapeBits:bits(tapes),tapeCeilBits:(tapes-1n).toString(2).length,lengthBits:bits(lengths),lengthCeilBits:lengths===1n?0:(lengths-1n).toString(2).length,distinctTapeCount:tapes.toString(),distinctLengthCount:lengths.toString(),classesN,movable,mixed,slots}}
 function order(n){let a=[],lo=0,hi=n-1;while(lo<=hi){a.push(lo++);if(lo<=hi)a.push(hi--)}return a}
 function reorder(ch,inv){const out=ch.slice();for(const ids of classes(ch,true,false).values()){const p=order(ids.length);for(let j=0;j<ids.length;j++)if(inv)out[ids[p[j]]]=ch[ids[j]];else out[ids[j]]=ch[ids[p[j]]]}return out}
 const seams=ch=>ch.slice(1).map((w,i)=>[ch[i].v.at(-1),w.v[0]]);
 const seq=ch=>ch.flatMap(w=>w.v),pageLengths=ch=>{let m={};for(const w of ch)m[w.page]=(m[w.page]||0)+w.v.length;return m};
 // Blind receiver consumes only the scrambled page-partitioned ciphertext.
 const receiver=ch=>reorder(ch,true).map(w=>({...w,v:w.v.map(p=>28-p)}));
 const controls=[];
 for(const name of ["0_warning","0_welcome","0_koan_1","0_loss_of_divinity"]){
  const src=B.sections.find(x=>x.name===name).source_text;
  const groups=(src.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>mp.get(c)));
  const truth=groups.map((v,i)=>({v,page:Math.floor(i/50),endPage:Math.floor(i/50)}));
  const encrypted=truth.map(w=>({...w,v:w.v.map(p=>28-p)}));const scrambled=reorder(encrypted,false);
  assert(same(seams(encrypted),seams(scrambled)),"every seam");
  assert(same(pageLengths(encrypted),pageLengths(scrambled)),"page rune total");
  const recovered=receiver(scrambled);assert(same(recovered,truth),"blind exact recovery");
  const cut=50*Math.floor(Math.max(1,Math.ceil(groups.length/50)/2));const fit=truth.slice(0,cut),held=truth.slice(cut);
  controls.push({name,words:groups.length,fitRunes:seq(fit).length,heldRunes:seq(held).length,exactFit:seq(recovered.slice(0,cut)).length,exactHeld:seq(recovered.slice(cut)).length,moved:encrypted.filter((w,i)=>!same(w.v,scrambled[i].v)).length,changedLength:encrypted.filter((w,i)=>w.v.length!==scrambled[i].v.length).length,seams:encrypted.length-1});
 }
 // Explicit heterogeneous endpoint-class control, not an original source decode.
 const toy=[{v:[1],page:0,endPage:0},{v:[2,3,4],page:0,endPage:0},{v:[2,5,6,4],page:0,endPage:0},{v:[2,7,4],page:0,endPage:0},{v:[2,8,9,10,4],page:0,endPage:0},{v:[11],page:0,endPage:0}];
 const y=reorder(toy,false);assert(same(reorder(y,true),toy)&&same(seams(toy),seams(y)),"heterogeneous class");
 return {source:{words:words.length,carries:32,chapterWords:chapters.map(c=>c.length)},capacity:[capacity(false,true),capacity(false,false),capacity(true,true),capacity(true,false)],controls,heterogeneousControl:{before:toy.map(w=>w.v.length),after:y.map(w=>w.v.length)}};
}
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
