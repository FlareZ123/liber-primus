"use strict";
const paths=[
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt"
];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 const raw=inputs[0],canonical=JSON.parse(inputs[1]),native=JSON.parse(inputs[2]);
 let physical=0,offset=0,tape="",positions=[],pageTape={};
 for(const ch of raw){if(ch==="%"){physical++;continue}if(ch==="/"||/\s/u.test(ch))continue;tape+=ch;const page=physical+(physical>=50?1:0);positions.push({page,offset});if(R.includes(ch)){(pageTape[page]??=[]).push(R.indexOf(ch));offset++}}
 for(const p of canonical.pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page})).filter(g=>g.page<56);
 assert(groups.length===2896&&groups.reduce((a,g)=>a+g.w.length,0)===12956&&groups.filter(g=>g.page!==g.endPage).length===32,"source counts");
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],expected=[158,255,383,437,224,326,378,669,66];
 const scopes=[{name:"all",words:groups.map(g=>g.w)},...expected.map((n,i)=>({name:"chapter"+i,words:groups.filter(g=>g.offset>=cuts[i]&&g.offset<cuts[i+1]).map(g=>g.w)}))];
 assert(scopes.slice(1).every((s,i)=>s.words.length===expected[i]),"chapter counts");
 const dict=new Map(["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((x,i)=>[x,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/['’]/g,"").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("")}
 function english(s){const start=s.search(/\*\*\* START OF/i);if(start>=0)s=s.slice(s.indexOf("\n",start)+1);const end=s.search(/\*\*\* END OF/i);if(end>=0)s=s.slice(0,end);return (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(gp)}
 function profile(words){const c=new Map(),h=new Map(),l=new Map();for(const w of words)c.set(w,(c.get(w)||0)+1);let pairs=0,max=0;for(const [w,n] of c){h.set(n,(h.get(n)||0)+1);const k=w.length+":"+n;l.set(k,(l.get(k)||0)+1);pairs+=n*(n-1)/2;max=Math.max(max,n)}return {c,h,l,pairs,max,distinct:c.size,singletons:h.get(1)||0}}
 const summary=p=>({distinct:p.distinct,singletons:p.singletons,max:p.max,pairs:p.pairs,multiplicity:Object.fromEntries([...p.h].sort((a,b)=>a[0]-b[0])),lengthMultiplicity:Object.fromEntries([...p.l].sort())});
 function scan(words,target,n){
  if(words.length<n)return {windows:0};
  const count=new Map(),h=new Map(),l=new Map();let dh=target.h.size,dl=target.l.size,pairs=0;
  const range={distinct:[Infinity,-Infinity],pairs:[Infinity,-Infinity],singletons:[Infinity,-Infinity]};
  const change=(m,t,k,d)=>{const old=m.get(k)||0,goal=t.get(k)||0,now=old+d;if(now)m.set(k,now);else m.delete(k);return Number(now!==goal)-Number(old!==goal)};
  function update(w,d){const a=count.get(w)||0,b=a+d;assert(b>=0,"count underflow");if(a){dh+=change(h,target.h,a,-1);dl+=change(l,target.l,w.length+":"+a,-1)}if(b){count.set(w,b);dh+=change(h,target.h,b,1);dl+=change(l,target.l,w.length+":"+b,1)}else count.delete(w);pairs+=d===1?a:-b}
  let free=0,preserve=0,firstFree=null,firstPreserve=null,maxAtMost=0,pairAtMost=0,minMax=Infinity,maxMax=0;
  for(let i=0;i<n;i++)update(words[i],1);
  for(let i=0;i+n<=words.length;i++){
   if(i){update(words[i-1],-1);update(words[i+n-1],1)}
   if(dh===0){free++;if(firstFree===null)firstFree=i}
   if(dl===0){preserve++;if(firstPreserve===null)firstPreserve=i}
   const values={distinct:count.size,pairs,singletons:h.get(1)||0};
   for(const k of Object.keys(range)){range[k][0]=Math.min(range[k][0],values[k]);range[k][1]=Math.max(range[k][1],values[k])}
   let max=0;for(const k of h.keys())if(k>max)max=k;minMax=Math.min(minMax,max);maxMax=Math.max(maxMax,max);if(max<=target.max)maxAtMost++;if(pairs<=target.pairs)pairAtMost++;
  }
  return {windows:words.length-n+1,free,preserve,firstFree,firstPreserve,maxAtMost,pairAtMost,range:{...range,max:[minMax,maxMax]}};
 }
 const solved=native.sections.map(s=>({name:s.name,words:runs(s.source_text)}));
 const donors=[...solved,{name:"solved-concatenated-descriptive",words:solved.flatMap(s=>s.words)},...["Emerson","Gibran","Shakespeare","Blake"].map((name,i)=>({name,words:english(inputs[i+3])}))];
 const exactControls=[];
 for(const s of solved){
  const p=profile(s.words),distinct=[...p.c.keys()],codes=new Map(distinct.map((w,i)=>[w,"Q"+i]));
  const perm=s.words.map(w=>codes.get(w)).reverse();
  const free=scan(perm,p,perm.length);
  const byLength=new Map();const same=new Map();
  for(const w of distinct){const k=w.length,i=byLength.get(k)||0;byLength.set(k,i+1);let j=i,v="";for(let m=0;m<k;m++){v+=R[j%29];j=Math.floor(j/29)}assert(j===0,"code capacity");same.set(w,v)}
  const preserve=scan(s.words.map(w=>same.get(w)).reverse(),p,s.words.length);
  assert(free.free===1&&preserve.preserve===1,"positive controls "+s.name);
  exactControls.push({name:s.name,n:s.words.length,free:free.free,preserve:preserve.preserve});
 }
 const toy=["a","a","b","c","b","d","a","e"];
 const t=profile(toy),ts=scan(toy.concat(toy),t,toy.length);assert(ts.free===9&&ts.preserve===9,"sliding toy");
 return {source:{groups:groups.length,runes:12956,carries:32},exactControls,donors:donors.map(d=>({name:d.name,n:d.words.length,stats:summary(profile(d.words))})).map(({name,n,stats})=>({name,n,max:stats.max,pairs:stats.pairs})),scopes:scopes.map(s=>{const p=profile(s.words);return {name:s.name,n:s.words.length,original:summary(p),donors:donors.map(d=>({name:d.name,...scan(d.words,p,s.words.length)}))}})};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
