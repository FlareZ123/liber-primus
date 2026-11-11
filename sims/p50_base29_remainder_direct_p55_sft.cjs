#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {createHash}=require("node:crypto");
const root=path.resolve(__dirname,"..");
function readPinned(rel,sha){
 const raw=fs.readFileSync(path.join(root,rel));
 const actual=createHash("sha1").update(Buffer.from("blob "+raw.length+"\0")).update(raw).digest("hex");
 assert.equal(actual,sha,rel+" changed"); return raw;
}
const base60=JSON.parse(readPinned("resources/liber-primus/base60-grid.json","4698c0806e6bab06a39cfbc3c3283b862de58b35").toString("utf8"));
const grid=JSON.parse(readPinned("resources/liber-primus/lp2-grid-256.json","39c4f098566fc5eba9d6738416a2fd193f800701").toString("utf8"));
const corpus=JSON.parse(readPinned("resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165").toString("utf8"));
const tx=readPinned("resources/lp2-transcription.txt","43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7").toString("utf8");
const gibran=readPinned("resources/control/gibran_prophet_58585.txt","df260a07d56bf5998d40a6360b6132c35c252d10").toString("utf8");
const alphabet=base60.alphabet;
assert.equal(alphabet,"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
assert.equal(base60.rows.length,32); assert.ok(base60.rows.every(r=>r.length===8));
const tokens60=base60.rows.flat();
const bytes=tokens60.map(t=>60*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
assert.equal(bytes.length,256); assert.deepEqual(bytes,grid.bytes);
const rem=bytes.map(b=>b%29),key=rem.slice(0,76),wrongKey=rem.slice(76,152);
const physical=tx.split("%"),runicWords=s=>(s.replace(/[\/\r\n&$]/g,"").match(/[ᚠ-᛿]+/gu)||[]);
const p54Words=runicWords(physical[53]),p55Words=runicWords(physical[54]);
const p55=p55Words.flatMap(w=>[...w]).map(r=>corpus.runes.indexOf(r));
assert.deepEqual(p55,corpus.pages.find(p=>p.page===55).indices);
assert.equal(p55.length,76); assert.equal(p55Words.length,17);
const wordLengths=p55Words.map(w=>[...w].length);
assert.deepEqual(wordLengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal([...p54Words.at(-1)].length,10);
assert.equal([...p54Words.at(-1)+p55Words[0]].length,11);
const interior=p55Words.reduce((s,w)=>s+Math.max(0,[...w].length-2),0);
const exterior=p55Words.reduce((s,w)=>s+Math.min(2,[...w].length),0);
assert.equal(interior,43);assert.equal(exterior,33);
const gpTokens=corpus.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
function nativeGp(text){
 const out=[];
 for(let w of(text.toUpperCase().match(/[A-Z]+/g)||[])){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let i=0;i<w.length;){const t=gpTokens.find(x=>w.startsWith(x.v,i));if(!t)throw Error("unmapped "+w.slice(i));out.push(t.i);i+=t.v.length;}
 }
 return out;
}
const native=nativeGp(gibran);assert.equal(native.length,62696);
function makeLanguage(ref){
 const counts=new Map();let total=0;
 for(let i=2;i<ref.length;i++){const k=ref[i-2]*841+ref[i-1]*29+ref[i];counts.set(k,(counts.get(k)||0)+1);total++;}
 const den=total+0.1*29**3;
 return seq=>{let s=0;for(let i=2;i<seq.length;i++){const k=seq[i-2]*841+seq[i-1]*29+seq[i];s+=Math.log(((counts.get(k)||0)+0.1)/den);}return s/(seq.length-2);};
}
const score=makeLanguage(native.slice(0,40000)),held=[];
for(let i=40000;i+76<=native.length;i++)held.push(score(native.slice(i,i+76)));
held.sort((a,b)=>a-b);assert.equal(held.length,22621);
const mod=n=>(n%29+29)%29, transform=(a,k,s)=>a.map((v,i)=>mod(v+s*k[i]));
const ioc=a=>{const c=Array(29).fill(0);a.forEach(v=>c[v]++);return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const group=a=>{let p=0;return wordLengths.map(n=>{const v=a.slice(p,p+n);p+=n;return {runes:v.map(x=>corpus.runes[x]).join(""),gp:v.map(x=>corpus.translit[x]).join("")};});};
const rawScore=score(p55);
function candidate(sign,label){
 const out=transform(p55,key,sign),forward=transform(out,key,-sign);
 assert.deepEqual(forward,p55);
 const sc=score(out);
 return {label,values:out,runic:out.map(x=>corpus.runes[x]).join(""),translit:out.map(x=>corpus.translit[x]).join(""),words:group(out),score:sc,ioc:ioc(out),nativeWindowsAtOrBelow:held.filter(x=>x<=sc).length,forwardExact:forward.every((x,i)=>x===p55[i])};
}
const minus=candidate(-1,"C−R"),plus=candidate(1,"C+R");
const wrong=[-1,1].map(s=>{const out=transform(p55,wrongKey,s);return {direction:s<0?"wrong R[76:152] C−K":"wrong R[76:152] C+K",values:out,score:score(out),translit:out.map(x=>corpus.translit[x]).join("")};});
function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const rng=mulberry32(0x03872026),sh={minus:[],plus:[]};let firstShuffle;
for(let n=0;n<10000;n++){const k=key.slice();for(let i=k.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[k[i],k[j]]=[k[j],k[i]];}if(n===0)firstShuffle=k.slice();sh.minus.push(score(transform(p55,k,-1)));sh.plus.push(score(transform(p55,k,1)));}
function shStats(a,cs){const s=a.slice().sort((x,y)=>x-y),le=a.filter(x=>x<=cs).length,ge=a.filter(x=>x>=cs).length;return{n:a.length,min:s[0],median:s[5000],max:s[9999],percentile:le/a.length,atOrBelow:le,atOrAbove:ge,upperTailAddOne:(ge+1)/(a.length+1)};}
const plant=native.slice(1000,1076),plantCipher=transform(plant,key,1),plantRecovered=transform(plantCipher,key,-1);
assert.deepEqual(plantRecovered,plant);
const wrongPlant=transform(plantCipher,wrongKey,-1),shufflePlant=transform(plantCipher,firstShuffle,-1);
assert.notDeepEqual(wrongPlant,plant);assert.notDeepEqual(shufflePlant,plant);
assert.equal(minus.nativeWindowsAtOrBelow,0);assert.equal(plus.nativeWindowsAtOrBelow,0);
console.log(JSON.stringify({
 hypothesis:"First 76 row-major p50 remainders B mod29 as one-shot additive GP29 key for all p55",
 sourceBlobSha1:{base60:"4698c0806e6bab06a39cfbc3c3283b862de58b35",grid:"39c4f098566fc5eba9d6738416a2fd193f800701",corpus:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",transcription:"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7",gibran:"df260a07d56bf5998d40a6360b6132c35c252d10"},
 source:{alphabet,tokens60,bytes,remainderStream:rem,keyFirst76:key,keyTranslit:key.map(x=>corpus.translit[x]).join(" "),wrongKey76:wrongKey,p55Values:p55,p55Runes:p55.map(x=>corpus.runes[x]).join(""),p55WordLengths:wordLengths,p55Segments:p55Words.length,p55IncomingCarry:p55Words[0],p54LastWordLength:[...p54Words.at(-1)].length,carryWordLength:[...p54Words.at(-1)+p55Words[0]].length,interior,exterior},
 languageControl:{source:"Gibran The Prophet; legacy GP-English comparator, not an attribution claim",nativeRunes:native.length,trainingRunes:40000,heldoutWindows:held.length,worst:held[0],median:held[5000],best:held.at(-1)},
 rawP55:{score:rawScore,ioc:ioc(p55),values:p55,wordGroups:group(p55)},
 candidates:{minus,plus},wrongSegmentControls:wrong,
 matchedKeyOrderShuffle:{seed:"0x03872026",Cminus:shStats(sh.minus,minus.score),Cplus:shStats(sh.plus,plus.score)},
 plant:{source:"Gibran native-GP [1000,1076)",length:plant.length,exactRecovery:plantRecovered.every((x,i)=>x===plant[i]),wrongSegmentKeyFails:!wrongPlant.every((x,i)=>x===plant[i]),matchedShuffleKeyFails:!shufflePlant.every((x,i)=>x===plant[i])},
 decision:"Both fixed direct remainder-key signs fail. C+R is only slightly above raw and has ordinary shuffle rank; C−R is worse than most same-multiset shuffles. Retire only the offset-zero first-76 one-shot additive interpretation."
},null,2));
