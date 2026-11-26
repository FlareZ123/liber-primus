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
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const c=JSON.parse(inputs[1]),R=c.runes.join(""),native=JSON.parse(inputs[2]);
 const runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 let physical=0,tape="",positions=[],pageTape={};
 for(const ch of inputs[0]){
  if(ch==="%"){physical++;continue}if(ch==="/"||/\s/u.test(ch))continue;
  tape+=ch;const page=physical+(physical>=50?1:0);positions.push(page);
  if(R.includes(ch))(pageTape[page]??=[]).push(R.indexOf(ch));
 }
 for(const p of c.pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],page:positions[m.index],end:positions[m.index+m[0].length-1]})).filter(x=>x.page<56);
 assert(groups.length===2896&&groups.reduce((s,x)=>s+x.w.length,0)===12956&&groups.filter(g=>g.page!==g.end).length===32,"source");
 const pages=Array.from({length:56},(_,i)=>({page:i,w:groups.filter(g=>g.page===i).map(g=>g.w)})).filter(p=>p.w.length);
 assert(pages.length===55,"pages");
 const prev=w=>{const last=new Map();return Int32Array.from(w,(x,i)=>{const d=last.has(x)?i-last.get(x):0;last.set(x,i);return d})};
 const eq=(p,t,j)=>p===0?(t===0||t>j):t===p;
 function matcher(pattern,textPrev){
  const p=prev(pattern),pi=new Int32Array(p.length),out=[];
  for(let i=1,j=0;i<p.length;i++){
   while(j&&!eq(p[j],p[i],j))j=pi[j-1];
   if(eq(p[j],p[i],j))j++;pi[i]=j;
  }
  for(let i=0,j=0;i<textPrev.length;i++){
   while(j&&!eq(p[j],textPrev[i],j))j=pi[j-1];
   if(eq(p[j],textPrev[i],j))j++;
   if(j===p.length){out.push(i-j+1);j=pi[j-1]}
  }
  return out;
 }
 function brute(pattern,text){let out=[];const p=prev(pattern).join(",");for(let i=0;i+pattern.length<=text.length;i++)if(prev(text.slice(i,i+pattern.length)).join(",")===p)out.push(i);return out}
 let seed=0x53fc1213;
 function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 let toy=0;
 for(let pLen=1;pLen<=5;pLen++)for(let x=0;x<3**pLen;x++){
  const p=Array.from({length:pLen},(_,i)=>Math.floor(x/3**i)%3);
  for(let y=0;y<3**6;y++){
   const t=Array.from({length:6},(_,i)=>Math.floor(y/3**i)%3);
   assert(matcher(p,prev(t)).join(",")===brute(p,t).join(","),"exhaustive toy");toy++;
  }
 }
 const dict=new Map(["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((x,i)=>[x,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/['’]/g,"").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("")}
 function english(s){const start=s.search(/\*\*\* START OF/i);if(start>=0)s=s.slice(s.indexOf("\n",start)+1);const end=s.search(/\*\*\* END OF/i);if(end>=0)s=s.slice(0,end);return (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(gp)}
 const solved=native.sections.map(s=>({name:s.name,w:runs(s.source_text)}));
 const donors=[...solved,{name:"solved-concatenated-descriptive",w:solved.flatMap(s=>s.w)},...["Emerson","Gibran","Shakespeare","Blake"].map((name,i)=>({name,w:english(inputs[i+3])}))].map(d=>({...d,p:prev(d.w)}));
 function stats(w){const p=prev(w),counts=new Map();for(const x of w)counts.set(x,(counts.get(x)||0)+1);return {n:w.length,distinct:counts.size,repeatOccurrences:w.length-counts.size,repeatedClasses:[...counts.values()].filter(x=>x>1).length,repeatSlots:[...p].map((x,i)=>x?i:-1).filter(x=>x>=0)}}
 const shuffled=pages.map(p=>shuffle(p.w));
 const pageResults=pages.map((p,i)=>({page:p.page,...stats(p.w),donors:donors.map(d=>{const hits=matcher(p.w,d.p),sh=matcher(shuffled[i],d.p);return {name:d.name,windows:Math.max(0,d.w.length-p.w.length+1),hits:hits.length,shuffledHits:sh.length,first:hits[0]??null}})}));
 function full(patterns,donor){
  const total=patterns.reduce((s,w)=>s+w.length,0);
  if(donor.w.length<total)return {windows:0,hits:0,first:null};
  const starts=new Uint8Array(donor.w.length-total+1).fill(1);
  let offset=0,live=starts.length;
  for(const w of patterns){
   const ok=new Uint8Array(starts.length);
   for(const hit of matcher(w,donor.p)){const a=hit-offset;if(a>=0&&a<ok.length)ok[a]=1}
   for(let i=0;i<starts.length;i++)if(starts[i]&&!ok[i]){starts[i]=0;live--}
   offset+=w.length;if(live===0)break;
  }
  return {windows:starts.length,hits:live,first:live?starts.indexOf(1):null};
 }
 const ordered=donors.map(d=>({name:d.name,...full(pages.map(p=>p.w),d),shuffled:full(shuffled,d)}));
 const controls=[];
 for(const d of donors.filter(d=>d.w.length>=groups.length)){
  const start=100+(rnd()%(d.w.length-groups.length-99)),truePages=[];
  let off=start;
  for(const p of pages){truePages.push(d.w.slice(off,off+p.w.length));off+=p.w.length}
  const enc=truePages.map((w,k)=>{const m=new Map;return w.map(x=>{if(!m.has(x))m.set(x,k+"_"+m.size+"_"+rnd());return m.get(x)})});
  const hit=full(enc,d);assert(hit.hits>=1,"full control");
  let truth=0,pred=0,correct=0,ambiguous=0;
  for(let k=0;k<enc.length;k++){
   const w=enc[k],actual=truePages[k],h=matcher(w,d.p);
   const prefixOff=truePages.slice(0,k).reduce((s,p)=>s+p.length,0);
   assert(h.includes(start+prefixOff),"page truth");
   // First appearance is the training mapping; every later occurrence is withheld.
   const m=new Map();
   for(let j=0;j<w.length;j++){if(!m.has(w[j]))m.set(w[j],actual[j]);else{truth++;pred++;if(m.get(w[j])===actual[j])correct++;}}
   if(h.length!==1)ambiguous++;
  }
  assert(correct===pred&&pred>0,"repeat controls");
  const first=hit.first;
  assert(first!==null,"first");
  controls.push({name:d.name,start,...hit,truthIncluded:true,knownTrainingRepeatPredictions:pred,correct,ambiguousPages:ambiguous});
 }
 // A repeated ciphertext class is the only class with an observable within-page prediction opportunity.
 return {source:{groups:groups.length,pages:pages.length,carries:32,runes:12956},toy,pageResults,ordered,controls,summary:{repeatOccurrences:pageResults.reduce((s,p)=>s+p.repeatOccurrences,0),repeatClasses:pageResults.reduce((s,p)=>s+p.repeatedClasses,0),pagesNoRepeat:pageResults.filter(p=>p.repeatOccurrences===0).length,pagesNoDonor:pageResults.filter(p=>p.donors.every(d=>d.hits===0)).map(p=>p.page),pagesWithDonorAndRepeat:pageResults.filter(p=>p.repeatOccurrences>0&&p.donors.some(d=>d.hits>0)).map(p=>p.page)}};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2))}
