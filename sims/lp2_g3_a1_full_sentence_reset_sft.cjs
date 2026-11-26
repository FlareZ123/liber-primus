"use strict";
// Exact full-sentence inventory receiver for R38 G3 dw/prime/M29/self/A1.
// Controls distinguish assembled exact source profiles from natural donor sentences.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json","im-results/lp2-g3-latent-word-caesar-bound.json"];
function experiment(raw){
 const RUNES="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᚚᛝᛟᛞᚪᚫᚣᛡᛠ".replace("ᚚ","ᛚ");
 const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
 const tokens=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29, key=w=>String.fromCharCode(...w.map(x=>65+x)), sum=w=>w.reduce((a,x)=>a+primes[x],0)%29;
 function parse(txt){
  let n=0,w=[],ws=[],ss=[],pages=[0];
  function close(){if(w.length){ws.push(w);w=[]}}
  function sent(){close();if(ws.length){const lens=ws.map(x=>x.length);ss.push({start:n-lens.reduce((a,b)=>a+b,0),end:n,lens});ws=[]}}
  for(const c of txt){let x=RUNES.indexOf(c);if(x>=0){n++;w.push(x)}else if(c==="%"){if(pages.at(-1)!==n)pages.push(n)}else if("-.&$§".includes(c)||/[0-9]/.test(c)){close();if(".&$§".includes(c))sent()}}
  sent();return {n,pages,ss};
 }
 const original=parse(raw[0]), starts=original.pages.slice(0,3);
 if(starts.join()!=="0,262,528"||original.pages[3]!==729)throw Error("corrected source page offsets differ");
 const profile=original.ss.filter(s=>s.end<=729);
 if(profile.reduce((a,s)=>a+s.lens.length,0)!==158||profile.at(-1).end!==729)throw Error("source inventory mismatch");
 const evidenceText=raw[5];let whole;
 try{whole=JSON.parse(evidenceText).whole}catch{whole=JSON.parse(evidenceText.trim().replace(/,\s*$/,"")+"}").whole}
 if(whole.runes!==12956||whole.long!==815||whole.candidateIntervals.length!==7)throw Error("pinned earlier shape result differs");
 function bound(ss, cuts){
  const rows=ss.map(s=>{
   const long=s.lens.filter(x=>x>=6).length, freq=new Map();
   for(const l of s.lens)if(l>=6)freq.set(l,(freq.get(l)||0)+1);
   const matches=whole.candidateIntervals.filter(([i,l])=>i>=s.start&&i+l<=s.end&&freq.has(l));
   const seen=new Map();for(const [,l] of matches)seen.set(l,(seen.get(l)||0)+1);
   const capacity=[...seen].reduce((a,[l,n])=>a+Math.min(n,freq.get(l)),0);
   const exceptions=cuts.filter(p=>s.start<p&&p<s.end).length;
   return {start:s.start,end:s.end,words:s.lens.length,long,capacity,exceptions,joinedMinOov:Math.max(0,long-capacity),splitMinOov:Math.max(0,long-capacity-exceptions)};
  });
  const add=k=>rows.reduce((s,r)=>s+r[k],0);return {runes:rows.at(-1).end,words:add("words"),long:add("long"),capacity:add("capacity"),crossingExceptionCap:add("exceptions"),joinedMinOov:add("joinedMinOov"),splitMinOov:add("splitMinOov"),oovBudget:Math.floor(.05*add("words")),rows};
 }
 const full=original.ss.filter(s=>s.end<=12956);
 if(full.at(-1).end!==12956||full.reduce((a,s)=>a+s.lens.length,0)!==2896)throw Error("full corrected sentence inventory mismatch");
 const p05=original.ss.filter(s=>s.end<=original.pages[6]);
 const bounds={p0to2:bound(profile,starts),p0to5CompleteSentences:bound(p05,original.pages.slice(0,6)),whole:bound(full,original.pages.filter(x=>x<12956))};
 function enc(w,alt=true){
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let a=[];for(let i=0;i<w.length;){const v=alt&&w.startsWith("ING",i)?{t:"ING",i:21}:alt&&w.startsWith("IO",i)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,i));if(!v)return null;a.push(v.i);i+=v.t.length}return a;
 }
 const vocab=new Map();
 function add(w,f){if(w?.length&&w.length<=24){const k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const l of raw[1].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(l);if(m)for(const alt of [false,true])add(enc(m[1],alt),+m[2])}
 function donor(t){
  const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
  return t.slice(a?a.index+a[0].length:0,b?b.index:t.length).split(/[.!?]+/).map(s=>(s.match(/[A-Za-z]+/g)||[]).map(w=>enc(w))).filter(s=>s.length&&s.every(w=>w?.length&&w.length<=24));
 }
 const donors=raw.slice(2,4).map(donor);
 for(const d of donors)for(const s of d.slice(0,Math.floor(d.length*.8)))for(const w of s)add(w,1);
 for(const s of JSON.parse(raw[4]).sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>RUNES.indexOf(c)),1);
 for(let i=0;i<29;i++)add([i],1);
 const logF=new Map([...vocab].map(([k,f])=>[k,Math.log(f+1)]));
 const pool=new Map();
 for(const d of donors)for(const s of d.slice(Math.floor(d.length*.8)))for(const w of s)if(vocab.has(key(w))){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w)}
 let seed=296413;function rng(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function page(pos,pages){let j=0;while(j+1<pages.length&&pages[j+1]<=pos)j++;return j}
 function transform(w,i,st,sign,conv,pages,inverse){
  let p=[],o=st.owner,v=st.prev,j=0;
  while(j<w.length){
   const owner=page(i+(conv==="CE"?w.length-1:j),pages);
   if(owner!==o){v=0;o=owner}
   const len=conv==="C0"?Math.min(w.length-j,(pages[o+1]??Infinity)-i-j):w.length-j;
   const seg=w.slice(j,j+len).map(x=>mod(x+(inverse?-1:1)*sign*v));
   v=sum(inverse?seg:w.slice(j,j+len));p.push(...seg);j+=len;
  }
  return {w:p,owner:o,prev:v};
 }
 function sender(ss,sgn,conv,pages){
  let c=[],state={prev:0,owner:-1},p=[];for(const s of ss)for(const w of s){const r=transform(w,c.length,state,sgn,conv,pages,false);c.push(...r.w);p.push(...w);state=r}return {c,p};
 }
 function solve(C,groups,sign,conv,pages,cap=2000000){
  let base=0,front=[{prev:0,owner:-1,score:0,trace:null}],visits=0,peak=0;
  for(const g of groups){
   let h=new Map();for(const l of g)h.set(l,(h.get(l)||0)+1);
   const ls=[...h.keys()].sort((a,b)=>a-b),counts=ls.map(l=>h.get(l)),mult=[];let size=1;
   for(const n of counts){mult.push(size);size*=n+1}
   if(!Number.isSafeInteger(size))return {status:"inventory-cap"};
   const init=size-1,total=g.reduce((a,b)=>a+b,0),buckets=Array.from({length:total+1},()=>new Map());
   const sk=(code,p,o)=>((code*29+p)*(pages.length+1)+o+1);
   for(const s of front)buckets[0].set(sk(init,s.prev,s.owner),{...s,code:init});
   for(let pos=0;pos<total;pos++){
    const bucket=buckets[pos];peak=Math.max(peak,bucket.size);
    for(const st of bucket.values()){
     if(++visits>cap)return {status:"state-cap",visits,peak};
     for(let j=0;j<ls.length;j++){
      if(Math.floor(st.code/mult[j])%(counts[j]+1)===0)continue;
      const l=ls[j];if(pos+l>total)continue;
      const r=transform(C.slice(base+pos,base+pos+l),base+pos,st,sign,conv,pages,true),f=logF.get(key(r.w));
      if(f===undefined)continue;
      const code=st.code-mult[j],score=st.score+f,k=sk(code,r.prev,r.owner),old=buckets[pos+l].get(k);
      if(!old||score>old.score)buckets[pos+l].set(k,{prev:r.prev,owner:r.owner,code,score,trace:{w:r.w,prior:st.trace}});
     }
    }
    bucket.clear();
   }
   front=[...buckets[total].values()].filter(s=>s.code===0);
   if(!front.length)return {status:"no-registered-path",visits,peak};
   base+=total;
  }
  const best=front.reduce((a,b)=>a.score>=b.score?a:b);
  const ws=[];for(let t=best.trace;t;t=t.prior)ws.push(t.w);ws.reverse();
  const ss=[];let j=0;for(const g of groups){ss.push(ws.slice(j,j+g.length));j+=g.length}
  if(sender(ss,sign,conv,pages).c.join()!==C.join())throw Error("exact forward replay failed");
  return {status:"ok",visits,peak,score:best.score,ws,ss};
 }
 function pageLocal(groups,conv,pages){
  const out=new Map();let i=0;for(let s=0;s<groups.length;s++)for(const l of groups[s]){
   let j=0;while(j<l){const p=page(i+(conv==="CE"?l-1:j),pages),len=conv==="C0"?Math.min(l-j,(pages[p+1]??Infinity)-i-j):l-j;const k=p+":"+s;if(!out.has(k))out.set(k,[]);out.get(k).push(len);j+=len}i+=l
  }return JSON.stringify([...out].sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>[k,v.sort((a,b)=>a-b)]));
 }
 function metrics(t,r){if(r.status!=="ok")return {accuracy:0,F1:0};const p=t.flat(2),q=r.ws.flat(),a=new Set(),b=new Set();let i=0;for(const w of t.flat())a.add(i+=w.length);i=0;for(const w of r.ws)b.add(i+=w.length);return {accuracy:q.filter((x,i)=>x===p[i]).length/p.length,F1:2*[...a].filter(x=>b.has(x)).length/(a.size+b.size)}}
 const rows=[],convs=["C0","CS","CE"];
 function trial(ss,kind,i,origin){
  const conv=convs[i%3],sgn=i%2?1:-1,tl=ss.map(s=>s.map(w=>w.length)),printed=tl.map(shuffle),{c,p}=sender(ss,sgn,conv,starts),r=[-1,1].map(sign=>({sign,...solve(c,printed,sign,conv,starts)})),ok=r.filter(x=>x.status==="ok").sort((a,b)=>b.score-a.score),best=ok[0],trueR=r.find(x=>x.sign===sgn),wrong=r.find(x=>x.sign!==sgn),m=best?metrics(ss,best):{accuracy:0,F1:0};
  return {kind,i,origin,conv,trueSign:sgn,runes:p.length,words:tl.flat().length,printedChanged:tl.flat().join()!==printed.flat().join(),oldPageInventoryContainsTruth:pageLocal(tl,conv,starts)===pageLocal(printed,conv,starts),truePathInCorrectedDomain:trueR.status==="ok",selectedSign:best?.sign??null,accuracy:m.accuracy,F1:m.F1,correctState:!!best&&best.sign===sgn&&m.F1===1&&m.accuracy===1,wrongSignFeasible:wrong.status==="ok",statuses:r.map(x=>[x.sign,x.status,x.visits??null,x.peak??null])};
 }
 let fallback=0;
 for(let i=0;i<20;i++){
  const ss=profile.map(s=>shuffle(s.lens).map(l=>{let a=pool.get(l);if(!a?.length){fallback++;a=[...vocab.keys()].filter(k=>k.length===l).map(k=>Array.from(k,c=>c.charCodeAt(0)-65))}if(!a.length)throw Error("no control word length "+l);return a[rng(a.length)]}));
  rows.push(trial(ss,"exact-original-profile-assembled",i,"held Gibran/Emerson word pool"));
 }
 let nn=0;
 for(let d=0;d<donors.length;d++){
  const a=donors[d];let cur=[],n=0;for(let j=Math.floor(a.length*.8);j<a.length&&nn<20;j++){
   const s=a[j];if(!s.every(w=>vocab.has(key(w)))){cur=[];n=0;continue}
   cur.push(s);n+=s.reduce((t,w)=>t+w.length,0);
   if(n>=650){rows.push(trial(cur,"natural-held-donor-sentences",nn,`${d}:${j-cur.length+1}-${j}`));nn++;cur=[];n=0}
  }
 }
 function summary(kind){const a=rows.filter(x=>x.kind===kind);return {n:a.length,correctState:a.filter(x=>x.correctState).length,thresholdPass:a.filter(x=>x.accuracy>=.9&&x.F1>=.9&&x.selectedSign===x.trueSign).length,domainPass:a.filter(x=>x.truePathInCorrectedDomain).length,oldDomainPass:a.filter(x=>x.oldPageInventoryContainsTruth).length,wrongSignFeasible:a.filter(x=>x.wrongSignFeasible).length,totalRunes:a.reduce((n,x)=>n+x.runes,0)}}
 return {profile:profile.map(s=>({start:s.start,end:s.end,lens:s.lens})),sourcePages:original.pages.slice(0,7),vocab:vocab.size,controlFallbackWords:fallback,summary:[summary("exact-original-profile-assembled"),summary("natural-held-donor-sentences")],rows,bounds};
}
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(raw),null,2));
