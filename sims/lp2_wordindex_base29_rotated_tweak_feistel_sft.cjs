'use strict';
// #2477. Experimental 6-round radix29 alternating arithmetic Feistel, not a standard secure FFX implementation.
const fs=require('node:fs');
function study(data){
 const corpus=JSON.parse(data[0]),raw=data[1].split("%"),solved=JSON.parse(data[2]),idx=new Map(corpus.runes.map((v,i)=>[v,i]));
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c)));
 const original=parse(raw.slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
 const native=solved.sections.flatMap(s=>parse(s.source_text));
 assert(original.length===2896&&original.flat().length===12956,"original counts");
 assert(JSON.stringify(original.flat())===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),"original rune tape");
 assert(native.length===740&&native.flat().length===2979,"native counts");
 const singletonSet=new Set(native.filter(w=>w.length===1).map(w=>w[0]));
 const alphabet=[["ING",21],...corpus.translit.map((s,i)=>[s,i])].sort((a,b)=>b[0].length-a[0].length);
 function gp(s){return (s.match(/[A-Za-z]+/g)||[]).map(w=>{w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");let a=[];while(w.length){let z=alphabet.find(x=>w.startsWith(x[0]));if(!z)return [];a.push(z[1]);w=w.slice(z[0].length)}return a}).filter(w=>w.length)}
 const counts=Array.from({length:15},()=>new Map()),total=Array(15).fill(0);
 for(const w of data.slice(3).flatMap(gp))if(w.length<=14){const s=w.join(",");counts[w.length].set(s,(counts[w.length].get(s)||0)+1);total[w.length]++}
 const logword=w=>Math.log(((counts[w.length].get(w.join(","))||0)+.25)/(total[w.length]+.25*29**w.length));
 const pow=Array.from({length:15},(_,i)=>29n**BigInt(i));
 const mod=(x,m)=>(x%m+m)%m;
 const mod29=x=>(x%29+29)%29;
 const val=w=>w.reduce((s,v)=>29n*s+BigInt(v),0n);
 function digits(x,l){const a=Array(l);for(let i=l-1;i>=0;i--){a[i]=Number(x%29n);x/=29n}assert(x===0n,"word digit capacity");return a}
 function tdigits(t){return [t%29,Math.floor(t/29)%29,Math.floor(t/841)%29]}
 const tweaks=Array.from({length:original.length},(_,t)=>{const d=tdigits(t);return [0,1,2].map(r=>BigInt(d[r]+29*d[(r+1)%3]+841*d[(r+2)%3]))});
 function F(R,t,r,M,k){
   const x=mod(R+tweaks[t][r%3],M);
   return mod(BigInt(k.a)*x*x*x+BigInt(k.b)*x+BigInt(k.c+r),M);
 }
 function word(w,t,k,dec){
   let l=Math.floor(w.length/2),r=w.length-l,L=val(w.slice(0,l)),R=val(w.slice(l));
   if(!dec){for(let i=0;i<6;i++){const v=mod(L+F(R,t,i,pow[l],k),pow[l]);L=R;R=v;[l,r]=[r,l]}}
   else{for(let i=5;i>=0;i--){const v=mod(R-F(L,t,i,pow[r],k),pow[r]);R=L;L=v;[l,r]=[r,l]}}
   return [...digits(L,l),...digits(R,r)];
 }
 const transform=(ws,k,dec)=>ws.map((w,t)=>word(w,t,k,dec));
 const coeff=Array.from({length:original.length},(_,t)=>{const d=tdigits(t);return [mod29(d.reduce((s,x)=>s+x*x*x,0)),mod29(d.reduce((s,x)=>s+x,0))]});
 function one(c,t,k){const [x,y]=coeff[t];return mod29(c-k.a*x-k.b*y-3*k.c-9)}
 const truthKeys=[{a:7,b:11,c:19},{a:19,b:4,c:27},{a:3,b:0,c:12},{a:28,b:22,c:5}];
 for(const k of truthKeys)for(let t=0;t<original.length;t++){const p=t%29,c=word([p],t,k,false)[0];assert(one(c,t,k)===p&&word([c],t,k,true)[0]===p,"singleton formula")}
 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
 const pageStart=[0];for(const p of corpus.pages)pageStart.push(pageStart.at(-1)+p.indices.length);
 const region=(p,q)=>original.map((_,i)=>i).filter(i=>offsets[i]>=pageStart[p]&&offsets[i+1]<=pageStart[q+1]);
 const train=region(0,7),hold1=region(16,21),hold2=region(40,53);
 function fit(ws,trainIndices){
   const singles=trainIndices.filter(i=>ws[i].length===1),short=trainIndices.filter(i=>ws[i].length<=3);
   let max=-1,feasible=[];
   // Exact singleton constraints reduce a 23,548-key family before polygraphic scoring.
   for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
     const k={a,b,c};let n=0;
     for(const t of singles)n+=Number(singletonSet.has(one(ws[t][0],t,k)));
     if(n>max){max=n;feasible=[k]}else if(n===max)feasible.push(k);
   }
   let best=null,runner=-Infinity,ties=0;
   for(const k of feasible){
     let s=0;for(const t of short)s+=logword(word(ws[t],t,k,true));
     if(!best||s>best.score+1e-9){runner=best?.score??runner;best={...k,score:s};ties=1}
     else if(Math.abs(s-best.score)<=1e-9){ties++;runner=best.score}
     else runner=Math.max(runner,s);
   }
   return {...best,singletons:singles.length,maxNativeSingletons:max,feasibleAtMaximum:feasible.length,allSingletonFeasible:max===singles.length?feasible.length:0,shortWords:short.length,ties,margin:Number.isFinite(runner)?best.score-runner:null}
 }
 function score(ws,reg){
   const W=reg.map(i=>ws[i]),p=W.flat(),h=Array(29).fill(0),short=W.filter(w=>w.length<=3),singles=W.filter(w=>w.length===1);
   for(const x of p)h[x]++;
   const lex=w=>counts[w.length].has(w.join(","));
   return {words:W.length,runes:p.length,singletons:singles.length,nativeSingletons:singles.filter(w=>singletonSet.has(w[0])).length,short:short.length,shortLexical:short.filter(lex).length,shortMeanLog:short.reduce((s,w)=>s+logword(w),0)/short.length,allLexical:W.filter(lex).length,ioc:h.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1)),preview:W.slice(0,24).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" ")};
 }
 const pool=Array.from({length:15},()=>[]);for(const w of native)if(w.length<=14)pool[w.length].push(w);
 let seed=0x247741;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const controls=[];
 for(let i=0;i<truthKeys.length;i++){
   const p=original.map(w=>pool[w.length][rng()%pool[w.length].length]),k=truthKeys[i],c=transform(p,k,false),f=fit(c,train),d=transform(c,f,true);
   controls.push({truth:k,inferred:f,keyCorrect:k.a===f.a&&k.b===f.b&&k.c===f.c,exact:JSON.stringify(p)===JSON.stringify(d),replay:JSON.stringify(transform(d,f,false))===JSON.stringify(c),train:score(d,train),hold1:score(d,hold1),hold2:score(d,hold2)});
 }
 // One intact contiguous native source plant, not the matched-length word sampling.
 const donor=parse(solved.sections.find(s=>s.name==="0_loss_of_divinity").source_text);
 const split=Math.floor(donor.length*.6),cr=donor.map((_,i)=>i).slice(0,split),hr=donor.map((_,i)=>i).slice(split);
 const k=truthKeys[2],cc=transform(donor,k,false),ff=fit(cc,cr),dd=transform(cc,ff,true);
 const contiguous={n:donor.flat().length,words:donor.length,truth:k,inferred:ff,exact:JSON.stringify(dd)===JSON.stringify(donor),train:score(dd,cr),hold:score(dd,hr)};
 // Exact all-secret generalization: any shared additive singleton shift depending only
 // on the multiset of the three word-index digits must agree at a repeated multiset.
 const groups=new Map();
 for(let i=0;i<original.length;i++)if(original[i].length===1){
   const d=tdigits(i),key=d.slice().sort((a,b)=>a-b).join(",");
   if(!groups.has(key))groups.set(key,[]);
   const page=pageStart.findIndex((v,j)=>j>0&&v>offsets[i])-1;
   groups.get(key).push({wordIndex:i,globalRune:offsets[i],page,localRune:offsets[i]-pageStart[page],digits:d,cipher:original[i][0]});
 }
 const collisions=[...groups].filter(([_,g])=>g.length>1).map(([digits,rows])=>({digits,rows,possibleShifts:Array.from({length:29},(_,j)=>j).filter(j=>rows.every(x=>singletonSet.has(mod29(x.cipher-j))))}));
 const symmetryCertificate={groups:groups.size,collisions,anySymmetricShiftCompatible:collisions.every(g=>g.possibleShifts.length>0)};
 assert(collisions.some(g=>g.possibleShifts.length===0),"original symmetric shift contradiction");
 const result={symmetryCertificate,familyKeys:28*29*29,sourceCounts:{words:original.length,runes:original.flat().length,singletons:original.filter(w=>w.length===1).length,nativeSingletons:[...singletonSet].map(x=>[x,corpus.translit[x]])},formulaVerified:truthKeys.length*original.length,trainingPages:"p0–7",heldoutPages:["p16–21","p40–53"],controls,contiguous};
 if(controls.every(x=>x.keyCorrect&&x.exact)&&contiguous.exact){
   const f=fit(original,train),d=transform(original,f,true);
   assert(JSON.stringify(transform(d,f,false))===JSON.stringify(original),"replay original");
   // Whole-book exact necessary condition is measured separately and never used to select the training key.
   const singleIdx=original.map((_,i)=>i).filter(i=>original[i].length===1);
   let allMax=-1,allCount=0;
   for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
     const k={a,b,c};let n=0;for(const t of singleIdx)n+=Number(singletonSet.has(one(original[t][0],t,k)));
     if(n>allMax){allMax=n;allCount=1}else if(n===allMax)allCount++;
   }
   result.original={inferred:f,train:score(d,train),hold1:score(d,hold1),hold2:score(d,hold2),allBookExactSingletonMaximum:allMax,allBookKeysAtMaximum:allCount,allBookSingletons:singleIdx.length,exactReplay:d.flat().length,indices:d.flat()};
 } else result.original="not opened: controls failed";
 return result;
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(f,'utf8'))),null,2));
