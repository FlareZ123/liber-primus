#!/usr/bin/env node
"use strict";
// Source-constrained p27 5x43 prime-mask row-selector test.
// Run from the repository root: node sims/p27_43word_prime_mask_row_selector_sft.cjs
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(process.cwd(),p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const p27=corpus.pages.find(p=>p.page===27),p27Ink=ink.pages.find(p=>p.page===27);
const redLength=p27Ink.red_spans[0].length,body=p27.indices.slice(redLength);
assert.equal(redLength,19);assert.equal(body.length,215);
const rows=Array.from({length:5},(_,r)=>body.slice(r*43,(r+1)*43));
const payload=signed.slice(signed.indexOf("Hello."),signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords=payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index})).sort((a,b)=>b.token.length-a.token.length);
function gpEncode(word){const s=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s"),out=[];for(let i=0;i<s.length;){const h=alphabet.find(x=>s.startsWith(x.token,i));if(!h)return null;out.push(h.index);i+=h.token.length;}return out;}
const sums=signedWords.map(w=>{const x=gpEncode(w);assert(x,"unmapped signed word "+w);return x.reduce((s,n)=>s+corpus.prime[n],0);});
// p55's left ornament 01101 selects one-based rows 2,3,5.
const active=[1,2,4];
const select=ss=>ss.map((sum,c)=>rows[active[sum%3]][c]);
const key=select(sums);
const runeToIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const p55Source=transcription.split("%")[54];
const printedWords=p55Source.replace(/[\/\r\n]/gu,"").split(/[-.&$§,:!?]/u)
 .map(p=>(p.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean);
const innerWords=printedWords.map(w=>[...w].slice(1,-1).map(r=>runeToIndex.get(r))).filter(w=>w.length);
const inner=innerWords.flat(),lengths=innerWords.map(w=>w.length);
assert.equal(printedWords.length,17);assert.equal(inner.length,43);
assert.deepEqual(lengths,[2,4,4,11,4,2,5,5,4,1,1]);
const mod=(n,m)=>((n%m)+m)%m;
const split=flat=>{let i=0;return lengths.map(n=>{const w=flat.slice(i,i+n);i+=n;return w;});};
function model(training){
 const pair=Array.from({length:29},()=>Array(29).fill(1));
 const tri=Array.from({length:29},()=>Array.from({length:29},()=>Array(29).fill(1)));
 const pairTotal=Array(29).fill(29),triTotal=Array.from({length:29},()=>Array(29).fill(29));
 for(const w of training){for(let i=1;i<w.length;i++){pair[w[i-1]][w[i]]++;pairTotal[w[i-1]]++;}
  for(let i=2;i<w.length;i++){tri[w[i-2]][w[i-1]][w[i]]++;triTotal[w[i-2]][w[i-1]]++;}}
 return words=>{let log=0,n=0;for(const w of words){for(let i=1;i<w.length;i++){log+=Math.log(pair[w[i-1]][w[i]]/pairTotal[w[i-1]]);n++;}
  for(let i=2;i<w.length;i++){log+=Math.log(tri[w[i-2]][w[i-1]][w[i]]/triTotal[w[i-2]][w[i-1]]);n++;}}return log/n;};
}
const native=(shakespeare.match(/[A-Za-z]+/g)||[]).map(gpEncode).filter(w=>w&&w.length>=2);
const cut=Math.floor(native.length*.75),score=model(native.slice(0,cut));
const decode=(k,sign)=>inner.map((x,i)=>mod(x+sign*k[i],29));
const four=k=>{const rev=k.slice().reverse();return[
 score(split(decode(k,-1))),score(split(decode(k,1))),
 score(split(decode(rev,-1))),score(split(decode(rev,1)))
];};
const actual=four(key),best=Math.max(...actual);
let state=0x43a55;function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/0x100000000;}
const nullMax=[];
for(let z=0;z<10000;z++){const s=sums.slice();for(let i=s.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[s[i],s[j]]=[s[j],s[i]];}nullMax.push(Math.max(...four(select(s))));}
const ge=nullMax.filter(x=>x>=best).length,sorted=nullMax.slice().sort((a,b)=>a-b);
const held=native.slice(cut).flat(),heldScores=[];
for(let i=0;i+43<=held.length;i+=5)heldScores.push(score(split(held.slice(i,i+43))));
const mean=heldScores.reduce((a,b)=>a+b,0)/heldScores.length;
const sd=Math.sqrt(heldScores.reduce((s,x)=>s+(x-mean)**2,0)/(heldScores.length-1));
const variants=["forward C-K","forward C+K","reverse C-K","reverse C+K"];
const textOf=a=>a.map(i=>corpus.translit[i]).join("");
const output=actual.map((s,i)=>{const k=i<2?key:key.slice().reverse(),sign=(i===0||i===2)?-1:1;return{variant:variants[i],score:s,text:split(decode(k,sign)).map(textOf).join(" ")};});
// Positive controls: recover a planted 43-rune stream from the same row selector,
// and round-trip an additive GP29 encryption under the selected key.
const plant=Array.from({length:43},(_,i)=>i%29),grid=Array.from({length:5},()=>Array(43).fill(0));
for(let c=0;c<43;c++)grid[active[sums[c]%3]][c]=plant[c];
assert.deepEqual(sums.map((s,c)=>grid[active[s%3]][c]),plant);
assert.deepEqual(inner.map((x,i)=>mod(mod(x+key[i],29)-key[i],29)),inner);
const rowCounts=active.map(r=>({row:r+1,count:sums.filter(s=>active[s%3]===r).length}));
console.log(JSON.stringify({
 hypothesis:"43 signed-message word prime sums modulo 3 select among p55 ornament rows 2,3,5 in a hypothetical p27 5x43 grid; selected runes are tested as a direct additive key for p55's 43 shed-interior runes.",
 geometry:{p27Total:p27.indices.length,redTitle:redLength,blackBody:body.length,grid:"5x43",signedWords:signedWords.length,p55PrintedSegments:printedWords.length,p55Interior:inner.length,p55InteriorWordLengths:lengths,ornamentMask:"01101",activeRows:[2,3,5]},
 signedWords,wordPrimeSums:sums,rowCounts,selectedKey:textOf(key),
 selectedKeyScore:score([key]),outputs:output,
 familywiseNull:{trials:10000,seed:"0x43a55",variants,exceedances:ge,upperTail:(1+ge)/10001,median:sorted[5000],q95:sorted[9500],q99:sorted[9900],max:sorted.at(-1)},
 heldoutNativeEnglish:{windows:heldScores.length,mean,sd,min:Math.min(...heldScores),max:Math.max(...heldScores),bestZ:(best-mean)/sd},
 positiveControls:{rowSelectionPlant:true,additiveRoundTrip:true},
 decision:"No plaintext. Reject this exact modulo-3 row selector and direct additive p55 bridge; do not tune moduli, row orders, phases or key encodings."
},null,2));
