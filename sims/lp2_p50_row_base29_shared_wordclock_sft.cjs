"use strict";
/** Frozen table row-key block and shared finite word-history transition. Node.js 22 CommonJS. */
const fs=require("node:fs"); const path=require("node:path"); const assert=require("node:assert/strict");
function run(read,assert) {
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
 const raw=read("resources/liber-primus/lp2-transcription.txt").split("%");
 const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
 const idx=new Map(corpus.runes.map((v,i)=>[v,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>idx.get(c)));
 const original=parse(raw.slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
 const native=solved.sections.flatMap(s=>parse(s.source_text));
 const p57=parse(raw[56].replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
 assert(original.length===2896&&original.flat().length===12956,"original counts");
 assert(JSON.stringify(original.flat())===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),"source rune tape");
 assert(native.length===740 && native.flat().length===2979,"solved corpus");
 assert(JSON.stringify(p57.flat())===JSON.stringify(corpus.pages[57].indices),"native p57");
 const bytes=table.pages.flatMap(p=>p.tokens.map(t=>60*table.alphabet.indexOf(t[0])+table.alphabet.indexOf(t[1])));
 assert(bytes.length===256&&bytes.every(x=>x>=0&&x<=255),"byte domain");
 assert(JSON.stringify(bytes)===JSON.stringify(table.pages.flatMap(p=>p.bytes)),"canonical byte values");
 const digits=(v,width)=>{const a=Array(width).fill(0);for(let j=width-1;j>=0;j--){a[j]=Number(v%29n);v/=29n;}assert(v===0n,"BASE29 capacity");return a;};
 assert(JSON.stringify(digits(3301n,3))===JSON.stringify([3,26,24]),"signed 2013 BASE29");
 assert(29n**13n < 2n**64n && 29n**14n >= 2n**64n,"minimal row width");
 const keys=Array.from({length:32},(_,i)=>digits(bytes.slice(i*8,i*8+8).reduce((n,b)=>256n*n+BigInt(b),0n),14));
 assert(new Set(keys.map(k=>k.join(","))).size===32,"distinct row keys");
 assert(Math.max(...original.map(w=>w.length))===14,"max word size");
 const mod=x=>(x%29+29)%29;
 // Right-aligned fixed-width BASE29 row block, no row rotation or sign search.
 const decodeWord=(w,s,sign)=>w.map((v,j)=>mod(v+sign*keys[s][14-w.length+j]));
 const transform=(words,key,sign)=>{
   let s=key.seed;return words.map(w=>{const out=decodeWord(w,s,sign);s=(key.a*s+w.length+key.b)&31;return out;});
 };
 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
 const pageStart=[0];for(const p of corpus.pages)pageStart.push(pageStart.at(-1)+p.indices.length);
 // Only words entirely inside the designated training or holdout spans score.
 const range=(p,q)=>original.map((_,i)=>i).filter(i=>offsets[i]>=pageStart[p]&&offsets[i+1]<=pageStart[q+1]);
 const train=range(0,7), hold1=range(16,21),hold2=range(40,53);
 const trainEnd=train.at(-1)+1;
 assert(train[0]===0 && train.every((v,i)=>v===i),"train prefix");
 const latin=s=>{
   const lookup=new Map(corpus.translit.map((v,i)=>[v,i]));
   const pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
   return(s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
     const a=[];for(let i=0;i<w.length;){let t=pairs.find(t=>w.startsWith(t,i))||w[i];i+=t.length;if(t==="ING")t="NG";if(t==="K"||t==="Q")t="C";if(t==="V")t="U";if(t==="Z")t="S";assert(lookup.has(t),"donor token");a.push(lookup.get(t));}return a;
   });
 };
 const g=latin(read("resources/control/gibran_prophet_58585.txt")),e=latin(read("resources/control/emerson_essays_2944.txt")),sh=latin(read("resources/control/shakespeare_first300k.txt"));
 const counts=Array.from({length:15},()=>new Map()), totals=Array(15).fill(0);
 const wordId=w=>w.reduce((n,v)=>n*29+v,0);
 const str=w=>w.join(",");
 // Independent training corpora; score exact short rune words with smoothed
 // unknown-word mass. Long words are reserved for diagnostic coverage.
 for(const w of [...g,...e])if(w.length<=14){
   const m=counts[w.length],k=str(w);m.set(k,(m.get(k)||0)+1);totals[w.length]++;
 }
 const shortScores=Array.from({length:4},(_,l)=>l?Float64Array.from({length:29**l},(_,k)=>Math.log(.25/(totals[l]+.25*29**l))):null);
 for(const w of [...g,...e])if(w.length<=3){
   const l=w.length,k=wordId(w);shortScores[l][k]=Math.log((counts[l].get(str(w))+.25)/(totals[l]+.25*29**l));
 }
 const fit=words=>{
   // All short-word likelihoods computed before traversing shared state space.
   const local=words.slice(0,trainEnd).map(w=>w.length<=3?Float64Array.from({length:32},(_,s)=>shortScores[w.length][wordId(decodeWord(w,s,-1))]):null);
   let best=null,runner=-Infinity,ties=0;
   for(let a=1;a<32;a+=2)for(let b=0;b<32;b++)for(let seed=0;seed<32;seed++){
     let s=seed,score=0;
     for(let w=0;w<trainEnd;w++){if(local[w])score+=local[w][s];s=(a*s+words[w].length+b)&31;}
     if(!best||score>best.score+1e-8){runner=best?best.score:runner;best={a,b,seed,score};ties=1;}
     else if(Math.abs(score-best.score)<=1e-8){ties++;runner=best.score;}
     else runner=Math.max(runner,score);
   }
   return {...best,ties,margin:best.score-runner};
 };
 const scoreRegion=(words,region)=>{
   const subset=region.map(i=>words[i]),x=subset.flat(),h=Array(29).fill(0);
   for(const v of x)h[v]++;
   const short=subset.filter(w=>w.length<=3);
   const lex=w=>counts[w.length].has(str(w));
   const match=subset.filter(lex).length;
   return {words:subset.length,runes:x.length,lexical:match,shortWords:short.length,shortLexical:short.filter(lex).length,shortMeanLog:short.reduce((n,w)=>n+shortScores[w.length][wordId(w)],0)/short.length,ioc:h.reduce((n,v)=>n+v*(v-1),0)/(x.length*(x.length-1)),preview:subset.slice(0,20).map(w=>w.map(v=>corpus.translit[v]).join("")).join(" ")};
 };
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const random=rng(0x33012479);
 const pools=words=>{const p=Array.from({length:15},()=>[]);for(const w of words)if(w.length<=14)p[w.length].push(w);return p;};
 const controls=[];
 const trialKeys=[{a:5,b:19,seed:7},{a:11,b:3,seed:26},{a:23,b:16,seed:11},{a:31,b:9,seed:4}];
 for(let n=0;n<trialKeys.length;n++){
   const donor=n<2?native:sh,p=pools(donor);
   assert(original.every(w=>p[w.length].length),"plant shape");
   const plain=original.map(w=>p[w.length][random()%p[w.length].length]);
   const truth=trialKeys[n],cipher=transform(plain,truth,1),inferred=fit(cipher),decoded=transform(cipher,inferred,-1);
   const pflat=plain.flat(); const matches=decoded.flat().reduce((n,v,i)=>n+Number(v===pflat[i]),0);
   const exact=JSON.stringify(decoded)===JSON.stringify(plain);
   controls.push({truth,inferred,exact,matches,train:scoreRegion(decoded,train),hold1:scoreRegion(decoded,hold1),hold2:scoreRegion(decoded,hold2)});
 }
 const pkey=trialKeys[0];
 assert(JSON.stringify(transform(transform(p57,pkey,1),pkey,-1))===JSON.stringify(p57),"authentic clear page roundtrip");
 const result={keyBlocks:keys,parameterCount:16*32*32,controlResults:controls,trainPages:"p0–7",holdoutPages:["p16–21","p40–53"],authenticP57Roundtrip:p57.flat().length};
 if(controls.every(x=>x.exact)){
   const inferred=fit(original),decoded=transform(original,inferred,-1);
   assert(JSON.stringify(transform(decoded,inferred,1))===JSON.stringify(original),"full original exact replay");
   result.original={inferred,train:scoreRegion(decoded,train),hold1:scoreRegion(decoded,hold1),hold2:scoreRegion(decoded,hold2),replayedRunes:decoded.flat().length};
 } else result.original="not opened: blind controls failed";
 return result;
}
console.log(JSON.stringify(run(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"),assert.ok),null,2));
