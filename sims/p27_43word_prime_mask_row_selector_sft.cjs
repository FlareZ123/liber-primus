#!/usr/bin/env node
"use strict";
// Source-constrained p27 5x43 prime-mask row-selector tests.
// Run from repository root: node sims/p27_43word_prime_mask_row_selector_sft.cjs
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(process.cwd(),p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const shakespeare=read("resources/control/shakespeare_first300k.txt");

const p27=corpus.pages.find(p=>p.page===27),p27Ink=ink.pages.find(p=>p.page===27);
const redLength=p27Ink.red_spans[0].length,p27Body=p27.indices.slice(redLength);
assert.equal(redLength,19);assert.equal(p27Body.length,215);
// The 5x43 arrangement is hypothetical; the source does not print this grid.
const rows=Array.from({length:5},(_,r)=>p27Body.slice(r*43,(r+1)*43));
const payload=signed.slice(signed.indexOf("Hello."),signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords=payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index})).sort((a,b)=>b.token.length-a.token.length);
function gpEncode(word){const s=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s"),out=[];for(let i=0;i<s.length;){const h=alphabet.find(x=>s.startsWith(x.token,i));if(!h)return null;out.push(h.index);i+=h.token.length;}return out;}
const wordPrimeSums=signedWords.map(word=>{const x=gpEncode(word);assert(x,"unmapped word "+word);return x.reduce((s,n)=>s+corpus.prime[n],0);});

// p55's left ornament is 01101: filled one-based positions 2,3,5.
const activeRows=[1,2,4]; // zero-based row indices
const selectMod3=sums=>sums.map((sum,column)=>rows[activeRows[sum%3]][column]);
function selectMod5Masked(sums){
 const selected=[],skipped=[],rowCounts=Array(5).fill(0);
 for(let column=0;column<43;column++){
  const row=sums[column]%5; // one-based row = residue + 1
  rowCounts[row]++;
  if(activeRows.includes(row))selected.push(rows[row][column]);
  else skipped.push(column);
 }
 return{selected,skipped,rowCounts};
}
const keyMod3=selectMod3(wordPrimeSums);
const mod5Result=selectMod5Masked(wordPrimeSums);
const keyMod5=mod5Result.selected;
assert.equal(keyMod3.length,43);assert.equal(keyMod5.length,26);assert.equal(mod5Result.skipped.length,17);

const runeToIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const p55Source=transcription.split("%")[54];
const p55PrintedWords=p55Source.replace(/[\/\r\n]/gu,"").split(/[-.&$§,:!?]/u)
 .map(p=>(p.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean);
const p55InteriorWords=p55PrintedWords.map(w=>[...w].slice(1,-1).map(r=>runeToIndex.get(r))).filter(w=>w.length);
const p55Interior=p55InteriorWords.flat(),p55Lengths=p55InteriorWords.map(w=>w.length);
assert.equal(p55PrintedWords.length,17);assert.equal(p55Interior.length,43);
assert.deepEqual(p55Lengths,[2,4,4,11,4,2,5,5,4,1,1]);

const mod=(n,m)=>((n%m)+m)%m;
const splitP55=flat=>{let i=0;return p55Lengths.map(n=>{const w=flat.slice(i,i+n);i+=n;return w;});};
function languageModel(trainingWords){
 const pair=Array.from({length:29},()=>Array(29).fill(1));
 const tri=Array.from({length:29},()=>Array.from({length:29},()=>Array(29).fill(1)));
 const pairTotal=Array(29).fill(29),triTotal=Array.from({length:29},()=>Array(29).fill(29));
 for(const w of trainingWords){for(let i=1;i<w.length;i++){pair[w[i-1]][w[i]]++;pairTotal[w[i-1]]++;}
  for(let i=2;i<w.length;i++){tri[w[i-2]][w[i-1]][w[i]]++;triTotal[w[i-2]][w[i-1]]++;}}
 return words=>{let log=0,n=0;for(const w of words){for(let i=1;i<w.length;i++){log+=Math.log(pair[w[i-1]][w[i]]/pairTotal[w[i-1]]);n++;}
  for(let i=2;i<w.length;i++){log+=Math.log(tri[w[i-2]][w[i-1]][w[i]]/triTotal[w[i-2]][w[i-1]]);n++;}}return log/n;};
}
const nativeWords=(shakespeare.match(/[A-Za-z]+/g)||[]).map(gpEncode).filter(w=>w&&w.length>=2);
const trainingSplit=Math.floor(nativeWords.length*.75),score=languageModel(nativeWords.slice(0,trainingSplit));
const decodeP55=(key,sign)=>p55Interior.map((x,i)=>mod(x+sign*key[i],29));
const fourP55=key=>{const rev=key.slice().reverse();return[
 score(splitP55(decodeP55(key,-1))),score(splitP55(decodeP55(key,1))),
 score(splitP55(decodeP55(rev,-1))),score(splitP55(decodeP55(rev,1)))
];};
const mod3Scores=fourP55(keyMod3),mod3Best=Math.max(...mod3Scores);
const mod5Scores=[score([keyMod5]),score([keyMod5.slice().reverse()])],mod5Best=Math.max(...mod5Scores);

let state3=0x43a55;function rng3(){state3^=state3<<13;state3^=state3>>>17;state3^=state3<<5;return(state3>>>0)/0x100000000;}
const null3=[];
for(let z=0;z<10000;z++){const s=wordPrimeSums.slice();for(let i=s.length-1;i>0;i--){const j=Math.floor(rng3()*(i+1));[s[i],s[j]]=[s[j],s[i]];}null3.push(Math.max(...fourP55(selectMod3(s))));}
const ge3=null3.filter(x=>x>=mod3Best).length,sorted3=null3.slice().sort((a,b)=>a-b);

let state5=0x5f43;function rng5(){state5^=state5<<13;state5^=state5>>>17;state5^=state5<<5;return(state5>>>0)/0x100000000;}
const null5=[];
for(let z=0;z<10000;z++){const s=wordPrimeSums.slice();for(let i=s.length-1;i>0;i--){const j=Math.floor(rng5()*(i+1));[s[i],s[j]]=[s[j],s[i]];}const out=selectMod5Masked(s).selected;null5.push(Math.max(score([out]),score([out.slice().reverse()])));}
const ge5=null5.filter(x=>x>=mod5Best).length,sorted5=null5.slice().sort((a,b)=>a-b);

const heldout=nativeWords.slice(trainingSplit).flat();
function nativeControl(length,partitioned){
 const scores=[];
 for(let i=0;i+length<=heldout.length;i+=5){
  const sample=heldout.slice(i,i+length);
  scores.push(partitioned?score(splitP55(sample)):score([sample]));
 }
 const mean=scores.reduce((a,b)=>a+b,0)/scores.length;
 const sd=Math.sqrt(scores.reduce((s,x)=>s+(x-mean)**2,0)/(scores.length-1));
 return{windows:scores.length,mean,sd,min:Math.min(...scores),max:Math.max(...scores)};
}
const control43=nativeControl(43,true),control26=nativeControl(26,false);
const textOf=a=>a.map(i=>corpus.translit[i]).join("");
const p55Text=flat=>splitP55(flat).map(textOf).join(" ");
const mod3Variants=["forward C-K","forward C+K","reverse C-K","reverse C+K"];
const mod3Outputs=mod3Scores.map((s,i)=>{const k=i<2?keyMod3:keyMod3.slice().reverse(),sign=(i===0||i===2)?-1:1;return{variant:mod3Variants[i],score:s,text:p55Text(decodeP55(k,sign))};});

// Positive controls for both row selectors and the additive GP29 bridge.
const plant43=Array.from({length:43},(_,i)=>i%29),grid3=Array.from({length:5},()=>Array(43).fill(0));
for(let c=0;c<43;c++)grid3[activeRows[wordPrimeSums[c]%3]][c]=plant43[c];
assert.deepEqual(wordPrimeSums.map((s,c)=>grid3[activeRows[s%3]][c]),plant43);
const plant26=Array.from({length:26},(_,i)=>(i+7)%29),grid5=Array.from({length:5},()=>Array(43).fill(0));
let pi=0;for(let c=0;c<43;c++){const r=wordPrimeSums[c]%5;if(activeRows.includes(r))grid5[r][c]=plant26[pi++];}
const extracted26=[];for(let c=0;c<43;c++){const r=wordPrimeSums[c]%5;if(activeRows.includes(r))extracted26.push(grid5[r][c]);}
assert.deepEqual(extracted26,plant26);
assert.deepEqual(p55Interior.map((x,i)=>mod(mod(x+keyMod3[i],29)-keyMod3[i],29)),p55Interior);

const rowCounts3=activeRows.map(r=>({row:r+1,count:wordPrimeSums.filter(s=>activeRows[s%3]===r).length}));
const result={
 sourceGeometry:{p27Total:p27.indices.length,p27RedTitle:redLength,p27BlackBody:p27Body.length,hypotheticalGrid:"5x43",signedMessageWords:signedWords.length,p55PrintedSegments:p55PrintedWords.length,p55InteriorRunes:p55Interior.length,p55InteriorWordLengths:p55Lengths,ornamentMask:"01101",activeOneBasedRows:[2,3,5]},
 signedWords,wordPrimeSums,
 mod3ActiveRowSelector:{mapping:"row = [2,3,5][wordPrimeSum mod 3]",rowCounts:rowCounts3,selectedKey:textOf(keyMod3),selectedKeyScore:score([keyMod3]),outputs:mod3Outputs,
  familywiseNull:{trials:10000,seed:"0x43a55",variants:mod3Variants,exceedances:ge3,upperTail:(1+ge3)/10001,median:sorted3[5000],q95:sorted3[9500],q99:sorted3[9900]},
  heldoutNativeEnglish:{...control43,bestZ:(mod3Best-control43.mean)/control43.sd}},
 mod5MaskedRowSelector:{mapping:"one-based row = 1 + (wordPrimeSum mod 5); keep only ornament-filled rows 2,3,5",
  rowCounts:mod5Result.rowCounts.map((count,row)=>({row:row+1,count})),selectedCount:keyMod5.length,skippedCount:mod5Result.skipped.length,
  skippedColumnsOneBased:mod5Result.skipped.map(x=>x+1),selectedText:textOf(keyMod5),reverseText:textOf(keyMod5.slice().reverse()),
  scores:{forward:mod5Scores[0],reverse:mod5Scores[1],best:mod5Best},
  familywiseNull:{trials:10000,seed:"0x5f43",variants:["forward","reverse"],exceedances:ge5,upperTail:(1+ge5)/10001,median:sorted5[5000],q95:sorted5[9500],q99:sorted5[9900]},
  heldoutNativeEnglish:{...control26,bestZ:(mod5Best-control26.mean)/control26.sd},
  note:"The 17 skipped columns equal the 17 p55 printed segments only as a count; the matched shuffle preserves the same row-residue multiset, so this count is not independent evidence."},
 positiveControls:{mod3RowSelectionPlant:true,mod5MaskedRowSelectionPlant:true,additiveGP29RoundTrip:true},
 decision:"Neither fixed row selector yields plaintext or a source-order advantage over its matched null. Do not tune moduli, row order, phases or key encodings."
};
console.log(JSON.stringify(result,null,2));
