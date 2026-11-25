'use strict';
// Agent3: complete-word radix-29 binary XOR cycle-walk, exact all-mask fit.
// Run from repository root: node sims/lp2_wordinteger_cyclewalk_xor_allmask_sft.cjs
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(gp,tr,lex,sol){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const rmap=new Map(gp.runes.map((r,i)=>[r,i]));
 const digits=s=>[...s].filter(c=>rmap.has(c)).map(c=>rmap.get(c));
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const pages=tr.split(/\s*%\s*/);
 assert(pages.length===57,"pages "+pages.length);
 for(let i=0;i<57;i++)assert(eq(digits(pages[i]),gp.pages[i+(i>=50?1:0)].indices),"page "+i);
 const words=s=>s.replaceAll('/','').replace(/\s/g,'').split(/[-.&$§,:!?]/u).map(digits).filter(w=>w.length);
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const groups=ranges.map(([x,y])=>words(pages.slice(x-(x>50?1:0),y-(y>50?1:0)+1).join('')));
 const all=groups.flat();
 assert(all.length===2896&&all.flat().length===12956,"counts "+all.length+" "+all.flat().length);
 assert(eq(all.flat(),gp.pages.slice(0,56).flatMap(p=>p.indices)),"tape mismatch");
 const val=w=>w.reduce((n,d)=>n*29n+BigInt(d),0n);
 const dictionary=Array.from({length:15},()=>new Set());
 const tok=gp.translit.map((s,i)=>[s.toLowerCase(),i]);tok.push(["ing",21]);
 function spell(s,i,v,l){if(l>14)return;if(i===s.length){if(l)dictionary[l].add(v);return}for(const [t,d] of tok)if(s.startsWith(t,i))spell(s,i+t.length,v*29n+BigInt(d),l+1)}
 for(const ln of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+\d+$/.exec(ln);if(m)spell(m[1].replaceAll("v","u").replaceAll("k","c").replaceAll("z","s"),0,0n,0)}
 const native=sol.sections.flatMap(s=>s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(digits).filter(w=>w.length);
 assert(native.length===740,"native word count");
 for(const w of native)if(w.length<=14)dictionary[w.length].add(val(w));
 const B=Array.from({length:15},(_,l)=>29n**BigInt(l));
 const bits=B.map(b=>1n<<BigInt((b-1n).toString(2).length));
 /** Cycle-walk on the binary word space; XOR is an involution so only one extra step can occur. */
 const transform=(x,k,b)=>{const y=x^k;return y<b?y:x};
 /** Every successful nonidentity pair fixes the complete shared XOR key. */
 const solve=(rows,L)=>{
   const b=B[L],D=dictionary[L],counts=new Map(),hits=[],freq=new Map();
   for(const {c,t} of rows){const id=c.toString()+":"+t.toString();const old=freq.get(id);if(old)old.n++;else freq.set(id,{c,t,n:1})}
   let identity=0;
   for(const {c,t,n} of freq.values()){
     if(D.has(c)){identity+=n;hits.push({c,t,n});continue}
     for(const p of D){const k=c^p^t;counts.set(k,(counts.get(k)||0)+n)}
   }
   // High-bit key always fixes every word, regardless of the bounded tweak.
   let best=identity,bestK=bits[L],tiesEnumerated=0;
   const scoreK=k=>rows.reduce((s,{c,t})=>s+Number(D.has(transform(c,k^t,b))),0);
   for(const [k,n] of counts){
     if(n+identity<best)continue;
     let score=n;for(const {c,t,n:m} of hits)if(D.has(transform(c,k^t,b)))score+=m;
     if(score>best){best=score;bestK=k;tiesEnumerated=1}
     else if(score===best){tiesEnumerated++;if(k<bestK)bestK=k}
   }
   if(scoreK(0n)===best&&0n<bestK)bestK=0n;
   const decoded=rows.map(({c,t})=>transform(c,bestK^t,b));
   assert(decoded.every((p,i)=>transform(p,bestK^rows[i].t,b)===rows[i].c),"replay");
   assert(decoded.filter(p=>D.has(p)).length===best,"score");
   return {n:rows.length,identity,best,k:bestK.toString(),tiesEnumerated,identityTiePossible:best===identity,candidateKeys:counts.size,decoded};
 };
 const sums=x=>({groups:x.reduce((s,v)=>s+v.n,0),hits:x.reduce((s,v)=>s+v.best,0),runes:x.reduce((s,v)=>s+v.n*v.L,0),hitRunes:x.reduce((s,v)=>s+v.best*v.L,0),identity:x.reduce((s,v)=>s+v.identity,0)});
 let prev=0n;
 const original=groups.map(g=>g.map(w=>{const L=w.length,c=val(w),t=prev&(bits[L]-1n);prev=c;return {L,c,t}}));
 const models=[];
 for(const feedback of [false,true]){
  const result=[];let zeroAll=0,zeroLong=0;
  for(let j=0;j<original.length;j++){
   for(const {L,c,t} of original[j]){
    const d=transform(c,feedback?t:0n,B[L]);
    if(dictionary[L].has(d)){zeroAll++;if(L>=6)zeroLong++}
   }
   for(let L=6;L<=14;L++){
    const rows=original[j].filter(w=>w.L===L).map(({c,t})=>({c,t:feedback?t:0n}));
    if(!rows.length)continue;const {decoded,...v}=solve(rows,L);
    result.push({chapter:j,L,...v});
   }
  }
  models.push({feedback,source:sums(result),zeroAll,zeroLong,lengths:Array.from({length:9},(_,i)=>({L:i+6,...sums(result.filter(v=>v.L===i+6))})),strata:result});
 }
 // Actual native solved-word sequence, encrypted under a distinct mask at every width.
 // Vocabulary includes these reference spellings; only the ciphertext prefix selects a key.
 let state=0x3301abcd;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
 const controls=[];
 for(const feedback of [false,true]){
  const masks=B.map((b,l)=>((BigInt(rng())<<32n)|BigInt(rng()))&(bits[l]-1n));
  let prior=0n;
  const planted=native.map((w,index)=>{
   const L=w.length,p=val(w);assert(L<=14,"native width");
   const t=feedback?(prior&(bits[L]-1n)):0n,c=transform(p,masks[L]^t,B[L]);prior=c;
   return {L,p,c,t,index};
  });
  const detail=[];
  for(let L=6;L<=14;L++){
   const rows=planted.filter(x=>x.L===L);
   if(!rows.length)continue;
   const cut=Math.max(1,Math.floor(rows.length*2/3));
   const train=rows.slice(0,cut),hold=rows.slice(cut);
   const {decoded,...fit}=solve(train,L),key=BigInt(fit.k);
   const test=hold.map(({c,t})=>transform(c,key^t,B[L]));
   assert(rows.every(({p,c,t})=>transform(c,masks[L]^t,B[L])===p),"plant roundtrip");
   detail.push({L,plant:masks[L].toString(),train:train.length,held:hold.length,changed:rows.filter(x=>x.c!==x.p).length,
     trainExact:decoded.filter((p,i)=>p===train[i].p).length,heldExact:test.filter((p,i)=>p===hold[i].p).length,
     fit});
  }
  controls.push({feedback,detail,train:detail.reduce((s,x)=>s+x.train,0),trainExact:detail.reduce((s,x)=>s+x.trainExact,0),held:detail.reduce((s,x)=>s+x.held,0),heldExact:detail.reduce((s,x)=>s+x.heldExact,0),identifiable:detail.filter(x=>x.fit.k===x.plant&&x.fit.tiesEnumerated===1&&!x.fit.identityTiePossible).map(x=>x.L)});
 }

 // A changing XOR mask driven by the previous unknown plaintext word is
 // relaxed to ANY value in that previous word's binary width. This makes
 // the high mask prefix a necessary condition, and an exact interval sweep
 // optimizes even this stronger relaxation over every secret key.
 const width=L=>BigInt((B[L]-1n).toString(2).length);
 function prefixBound(rows,L){
  let baseline=0,restricted=0,identity=0;
  const events=new Map();
  const add=(p,d)=>events.set(p,(events.get(p)||0)+d);
  for(const {c,prevL} of rows){
   const s=prevL===0?0n:width(prevL);
   if(dictionary[L].has(c))identity++;
   if(dictionary[L].has(c)||s>=width(L)){baseline++;continue}
   restricted++;
   const prefixes=new Set();
   for(const p of dictionary[L])prefixes.add((c^p)>>s);
   for(const pre of prefixes){const start=pre<<s;add(start,1);add(start+(1n<<s),-1)}
  }
  let current=baseline,best=baseline,key=0n;
  for(const [p,d] of [...events].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0)){
   if(p>=bits[L])break;
   current+=d;if(current>best){best=current;key=p}
  }
  // Independent check of the interval witness.
  const check=rows.reduce((n,{c,prevL})=>{
   const s=prevL===0?0n:width(prevL);
   if(dictionary[L].has(c)||s>=width(L))return n+1;
   for(const p of dictionary[L])if(((c^p)>>s)===(key>>s))return n+1;
   return n;
  },0);
  assert(check===best,"prefix witness");
  return {n:rows.length,baseline,restricted,identity,best,key:key.toString()};
 }
 let prevL=0;
 const lengthRows=original.map(g=>g.map(({L,c,t})=>{const row={L,c,t,prevL};prevL=L;return row}));
 const prefixStrata=[],shortStrata=[];
 for(let j=0;j<lengthRows.length;j++)for(let L=6;L<=14;L++){
  const rows=lengthRows[j].filter(x=>x.L===L);
  if(!rows.length)continue;
  prefixStrata.push({chapter:j,L,...prefixBound(rows,L)});
  const short=rows.filter(x=>x.prevL<=2);
  if(short.length)shortStrata.push({chapter:j,L,...prefixBound(short,L)});
 }
 const direct=[];
 for(const K of [0n,3301n]){
  let prevP=0n,allHits=0,longHits=0;
  for(const row of original.flat()){
   const {L,c}=row,t=prevP&(bits[L]-1n),p=transform(c,K^t,B[L]);
   assert(transform(p,K^t,B[L])===c,"plaintext state replay");prevP=p;
   if(dictionary[L].has(p)){allHits++;if(L>=6)longHits++}
  }
  direct.push({key:K.toString(),allHits,longHits});
 }
 const plainMasks=B.map((b,l)=>((BigInt(rng())<<32n)|BigInt(rng()))&(bits[l]-1n));
 let pprev=0n,decodedPrev=0n,plen=0;
 const plainPlant=native.map(w=>{
  const L=w.length,p=val(w),t=pprev&(bits[L]-1n),c=transform(p,plainMasks[L]^t,B[L]);
  const recovered=transform(c,plainMasks[L]^(decodedPrev&(bits[L]-1n)),B[L]);
  assert(recovered===p,"causal plaintext feedback plant");const row={L,c,prevL:plen};
  pprev=p;decodedPrev=recovered;plen=L;return row;
 });
 const plainControl=[];
 for(let L=6;L<=14;L++){
  const rows=plainPlant.filter(x=>x.L===L);if(!rows.length)continue;
  const v=prefixBound(rows,L);assert(v.best===v.n,"prefix plant upper bound");plainControl.push({L,...v});
 }
 // Oracle mask bank: give independent arbitrary banks to each width across
 // the entire book, and even allow arbitrary per-word choice. Sum the B
 // largest exact per-key support counts, ignoring overlap, as an upper bound.
 const budgets=[16,32,64,128,256];
 const bank=[];
 for(const feedback of [false,true]){
  const detail=[];
  for(let L=6;L<=14;L++){
   const rows=original.flat().filter(x=>x.L===L);
   const D=dictionary[L],counts=new Map();
   assert(rows.every(x=>!D.has(x.c)),"bank nonlexical premise");
   for(const {c,t} of rows)for(const p of D){
    const k=c^p^(feedback?t:0n);counts.set(k,(counts.get(k)||0)+1);
   }
   const hist=[];
   for(const n of counts.values())hist[n]=(hist[n]||0)+1;
   const bound=budgets.map(b=>{
    let left=b,total=0;
    for(let n=hist.length-1;n>0&&left;n--){const take=Math.min(left,hist[n]||0);total+=n*take;left-=take}
    return Math.min(rows.length,total);
   });
   detail.push({L,n:rows.length,keySupportHistogram:Array.from({length:hist.length},(_,i)=>hist[i]||0),bound});
  }
  bank.push({feedback,budgets,bounds:budgets.map((_,i)=>detail.reduce((s,v)=>s+v.bound[i],0)),detail});
 }
 const additional={plaintextFeedback:{source:sums(prefixStrata),shortPredecessor:sums(shortStrata),strata:prefixStrata,shortStrata,direct,control:sums(plainControl),controlDetail:plainControl},bank};
 return {dictionary:dictionary.map(s=>s.size),native:native.length,chapterGroups:groups.map(g=>g.length),models,controls,additional};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const result=run(JSON.parse(read(paths[0])),read(paths[1]),read(paths[2]),JSON.parse(read(paths[3])));
console.log(JSON.stringify(result,null,2));
