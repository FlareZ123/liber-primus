"use strict";
// Spacing-free multi-stop source identification: fixed 4+2 protocol.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/2012-marriage-of-heaven-and-hell-page.txt","resources/external/blake-marriage-1906-gutenberg45315.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/historical/cicada2012-countdown-message.asc","resources/historical/cicada2013-forest-clue.asc","resources/historical/cicada2014-stage11-message.asc","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,phase="controls"){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const N=6,K=4,MIN=150,assert=(x,m)=>{if(!x)throw Error(m)};
 function word(w,variant){w=w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");if(variant===1)w=w.replace(/ING/g,"NG").replace(/IO/g,"IA");const P=[];while(w.length){const t=variant===0&&w.startsWith("ING")?{s:"ING",i:21}:variant===0&&w.startsWith("IO")?{s:"IO",i:27}:tokens.find(t=>w.startsWith(t.s));assert(t,w);P.push(t.i);w=w.slice(t.s.length)}return P}
 function native(t,name,original=false){let P=[],stops=[];for(const ch of t){if(ix.has(ch))P.push(ix.get(ch));else if(ch===(original?".":"⁘")&&P.length&&stops.at(-1)!==P.length)stops.push(P.length)}return {name,P,stops,variant:"native"}}
 function latin(t,name,variant){t=t.replace(/([a-z])- *\r?\n([a-z])/g,"$1$2").replace(/^\s*\d+\.\s*/gm,"");if(name.endsWith(".asc"))t=t.split(/-----BEGIN PGP SIGNATURE-----/)[0].split(/\r?\n\r?\n/).slice(1).join("\n\n").replace(/[a-z0-9]{16}\.onion/gi," ");
  const body=t.match(/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i);if(body)t=t.slice(body.index+body[0].length);const end=t.match(/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i);if(end)t=t.slice(0,end.index);
  const P=[],stops=[];for(const m of t.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*|[.!?]/g)){if(/[A-Za-z]/.test(m[0]))P.push(...word(m[0],variant));else if(P.length&&stops.at(-1)!==P.length)stops.push(P.length);}return {name,P,stops,variant}
 }
 function windows(s){const b=s.stops,out=[];for(let i=0;i+N<b.length;i++){const ds=b.slice(i+1,i+N+1).map((x,j)=>x-b[i+j]);if(ds.slice(0,K).reduce((a,b)=>a+b,0)<MIN)continue;out.push({name:s.name,variant:s.variant,start:b[i],stopIndex:i,ds,P:s.P.slice(b[i],b[i+N])})}return out}
 const historic=gold.sections.filter(s=>!s.name.startsWith("p5")).map(s=>native(s.source_text,s.name));
 for(let i=3;i<12;i++)for(let v=0;v<2;v++)historic.push(latin(raw[i],files[i],v));
 const unrelated=[];for(let i=12;i<14;i++)for(let v=0;v<2;v++)unrelated.push(latin(raw[i],files[i],v));
 const src=historic.flatMap(windows),comparison=unrelated.flatMap(windows),key=x=>x.ds.slice(0,K).join(",");
 function index(list){const m=new Map();for(const x of list){const k=key(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x)}return m}
 const idx=index(src),allidx=index(src.concat(comparison)),cidx=index(comparison);
 function encrypt(P,key){let h=0;return P.map(x=>x===0?0:(x+key[h++%key.length])%29)}
 const keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 function retrieve(q,C,ix){const fit=q.ds.slice(0,K).reduce((a,b)=>a+b,0),candidates=ix.get(key(q))||[],pass=candidates.filter(x=>x.P.slice(0,fit).every((v,i)=>v!==0||C[i]===0)),distinct=new Map();
  for(const x of pass){const k=x.P.slice(0,fit).join(",");if(!distinct.has(k))distinct.set(k,[]);distinct.get(k).push(x)}
  const held=pass.filter(x=>same(x.ds,q.ds)&&x.P.slice(fit).every((v,i)=>v!==0||C[fit+i]===0));
  const distinctHeld=new Map();for(const x of held){const k=x.P.join(",");if(!distinctHeld.has(k))distinctHeld.set(k,[]);distinctHeld.get(k).push(x)}
  return {fit,candidates:candidates.length,Fcompatible:pass.length,distinctFit:distinct.size,heldCompatible:held.length,distinctHeld:distinctHeld.size,selected:distinct.size===1&&distinctHeld.size===1,held,pass}
 }
 const clean=x=>({name:x.name,variant:x.variant,start:x.start,stopIndex:x.stopIndex,ds:x.ds});
 function slim(r){return {fit:r.fit,candidates:r.candidates,Fcompatible:r.Fcompatible,distinctFit:r.distinctFit,heldCompatible:r.heldCompatible,distinctHeld:r.distinctHeld,selected:r.selected,held:r.held.map(clean)}}
 const original=native(raw[1],"LP2",true);assert(original.P.length===13136,"rune count");
 const C=gp.pages.slice(0,56).flatMap(p=>p.indices);assert(same(original.P.slice(0,C.length),C),"original tape");assert(original.stops.filter(x=>x<=C.length).length===173,"stop count");
 const chapterPages=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],offset=[0];for(const p of gp.pages)offset.push(offset.at(-1)+p.indices.length);
 const target=chapterPages.flatMap(([a,b])=>windows({name:`p${a}-${b}`,variant:"native",P:C,stops:original.stops.filter(s=>s>offset[a]&&s<=offset[b+1])}));
 const out={parameters:{N,K,MIN,orthographies:["greedy plus ING and IO","native #2604 ING→NG and IO→IA"],fitRule:"4 exact consecutive full-stop distances plus F subset; unique fitting plaintext; then 2 withheld distances and F subset"},sourceCounts:historic.map(s=>({name:s.name,variant:s.variant,stops:s.stops.length,windows:windows(s).length})),historicalWindows:src.length,unrelatedWindows:comparison.length,targetWindows:target.length};
 if(phase==="controls"){
  const groups=[...new Set(src.map(x=>x.name))].map(name=>src.filter(x=>x.name===name&&x.variant!==1)).filter(a=>a.length>=2),positive=[];
  for(const arr of groups){for(const i of [Math.floor(arr.length*.25),Math.floor(arr.length*.75)]){const q=arr[i],C=encrypt(q.P,keys[positive.length%2]),r=retrieve(q,C,allidx);positive.push({truth:clean(q),...slim(r),truthRetained:r.held.some(x=>same(x.P,q.P)),correct:r.selected&&r.held.some(x=>same(x.P,q.P))});}}
  const negative=[];for(const name of [...new Set(comparison.map(x=>x.name))]){const a=comparison.filter(x=>x.name===name&&x.variant===0);for(let i=0;i<100;i++){const q=a[Math.floor((i+.5)*a.length/100)],C=encrypt(q.P,keys[i%2]),r=retrieve(q,C,idx);negative.push({truth:clean(q),...slim(r)})}}
  return {...out,positive,negative,gate:{positives:positive.length,correct:positive.filter(x=>x.correct).length,wrong:positive.filter(x=>x.selected&&!x.correct).length,retained:positive.filter(x=>x.truthRetained).length,negativeSelections:negative.filter(x=>x.selected).length,negatives:negative.length}};
 }
 const observed=target.map(q=>{const r=retrieve(q,q.P,idx),unrelated=retrieve(q,q.P,cidx);return {target:clean(q),...slim(r),unrelated:slim(unrelated),fitCandidates:r.pass.map(clean)}});
 return {...out,observed,totals:{distanceFit:observed.reduce((a,x)=>a+x.candidates,0),Fcompatible:observed.reduce((a,x)=>a+x.Fcompatible,0),heldCompatible:observed.reduce((a,x)=>a+x.heldCompatible,0),selected:observed.filter(x=>x.selected).length,unrelatedDistanceFit:observed.reduce((a,x)=>a+x.unrelated.candidates,0),unrelatedSelected:observed.filter(x=>x.unrelated.selected).length}};
}
if(require.main===module){console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]||"controls"),null,2))}
module.exports={experiment};
