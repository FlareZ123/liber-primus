"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const DIGITS="0123456789ABCDEFGHIJKLMNOPQRS";
const mod29=n=>((n%29)+29)%29;
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
function base29(n){assert.ok(Number.isSafeInteger(n)&&n>=0);if(n===0)return[0];const a=[];while(n){a.push(n%29);n=Math.floor(n/29);}return a.reverse();}
function decrypt(cipher,key,sign,phase=0){assert.ok(key.length>0);return cipher.map((v,i)=>mod29(v+sign*key[(phase+i)%key.length]));}
function lettersFromRunes(runes,translit){return runes.map(r=>translit[r]).join("").replace(/[^A-Z]/gu,"");}
function loadQuadgrams(){const counts=new Map();let total=0;for(const line of read("resources/control/duko_round27_english_quadgrams.txt").trim().split(/\r?\n/u)){const m=/^([A-Z]{4})\s+(\d+)$/u.exec(line.trim());if(!m)continue;const n=Number(m[2]);counts.set(m[1],n);total+=n;}assert.ok(counts.size>1000&&total>0);return{counts,total};}
function scoreLetters(letters,model){const text=letters.toUpperCase().replace(/[^A-Z]/gu,"");let sum=0,n=0;for(let i=0;i+4<=text.length;i++){sum+=Math.log((model.counts.get(text.slice(i,i+4))||0.01)/model.total);n++;}assert.ok(n>0);return{letters:text.length,quadgrams:n,meanLogProbability:sum/n,sample:text.slice(0,220)};}
function scoreRunes(runes,translit,model){return scoreLetters(lettersFromRunes(runes,translit),model);}
function bestSign(target,key,phase,translit,model){return[-1,1].map(sign=>({sign,...scoreRunes(decrypt(target,key,sign,phase),translit,model)})).sort((a,b)=>b.meanLogProbability-a.meanLogProbability)[0];}
function xorshift(seed){let state=seed>>>0;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};}
function shuffled(values,random){const out=values.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function permutationNull(target,key,phase,seed,translit,model,draws=5000){const observed=bestSign(target,key,phase,translit,model),random=xorshift(seed),values=[];for(let i=0;i<draws;i++){const k=shuffled(key,random);const m=scoreRunes(decrypt(target,k,-1,phase),translit,model).meanLogProbability;const p=scoreRunes(decrypt(target,k,1,phase),translit,model).meanLogProbability;values.push(Math.max(m,p));}const mean=values.reduce((s,x)=>s+x,0)/draws;const variance=values.reduce((s,x)=>s+(x-mean)**2,0)/draws;const sorted=values.slice().sort((a,b)=>a-b);const exceedances=values.filter(x=>x>=observed.meanLogProbability).length;return{draws,observedSign:observed.sign,observedMeanLogProbability:observed.meanLogProbability,nullMean:mean,nullSD:Math.sqrt(variance),null95:sorted[Math.floor(.95*(draws-1))],exceedances,addOneP:(exceedances+1)/(draws+1)};}
function decryptByChapterReset(stream,cuts,key,sign){const out=[];for(let i=0;i+1<cuts.length;i++)out.push(...decrypt(stream.slice(cuts[i],cuts[i+1]),key,sign,0));return out;}
function main(){
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),pages=corpus.pages,translit=corpus.translit;
 const stream=pages.slice(0,56).flatMap(p=>p.indices);assert.equal(stream.length,12956);
 const page15=pages[15].indices;assert.equal(page15.length,159);
 const page15Start=pages.slice(0,15).reduce((s,p)=>s+p.indices.length,0);assert.equal(page15Start,3603);
 const body=page15.slice(9);assert.equal(body.length,150);assert.deepEqual(stream.slice(3612,3762),body);
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
 assert.deepEqual(cuts.slice(1).map((x,i)=>x-cuts[i]),[729,1145,1729,1903,1021,1433,1680,3008,308]);
 const p15Chapter=stream.slice(3603,5506);assert.equal(p15Chapter.length,1903);
 const printedValues=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 const underlyingPrimes=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
 const printedKey=printedValues.flatMap(base29),primeKey=underlyingPrimes.flatMap(base29),seed3301Key=base29(3301);
 assert.equal(DIGITS.length,29);assert.deepEqual(seed3301Key,[3,26,24]);assert.equal(printedKey.length,47);assert.equal(primeKey.length,30);
 const model=loadQuadgrams();
 const raw={fullBook:scoreRunes(stream,translit,model),p15Chapter:scoreRunes(p15Chapter,translit,model),p15Body:scoreRunes(body,translit,model),solvedP57:scoreRunes(pages[57].indices,translit,model),Shakespeare:scoreLetters(read("resources/control/shakespeare_first300k.txt"),model)};
 const candidates={printedValuesBase29:printedKey,primeValuesBase29:primeKey,base29Of3301:seed3301Key},local={};
 for(const[name,key]of Object.entries(candidates)){local[name]={keyLength:key.length,keyDigits:key.map(d=>DIGITS[d]).join(""),p15BodyPhase0:bestSign(body,key,0,translit,model),p15BodyPhase9:bestSign(body,key,9%key.length,translit,model),p15ChapterFromHeading:bestSign(p15Chapter,key,0,translit,model)};for(const sign of[-1,1]){const planted=decrypt(pages[57].indices,key,sign,0);assert.deepEqual(decrypt(planted,key,-sign,0),pages[57].indices);}}
 const nulls={printedValuesBase29:{phase0:permutationNull(body,printedKey,0,0x3301f15,translit,model),phase9:permutationNull(body,printedKey,9,0x3301f16,translit,model)},primeValuesBase29:{phase0:permutationNull(body,primeKey,0,0x3301f162,translit,model),phase9:permutationNull(body,primeKey,9,0x3301f163,translit,model)}};
 const fullBook={};for(const sign of[-1,1])fullBook[sign]={continuous:scoreRunes(decrypt(stream,printedKey,sign,0),translit,model),visualChapterReset:scoreRunes(decryptByChapterReset(stream,cuts,printedKey,sign),translit,model)};
 const seedBody={};for(const sign of[-1,1])seedBody[sign]=scoreRunes(decrypt(body,seed3301Key,sign,0),translit,model);
 return{hypothesis:"BASE29-expanded p15 Fibonacci-prime spiral as a repeated GP29 additive key",assumptions:["BASE29 digit values 0..28 are identified directly with GP29 rune indices","the infinity/arrow ornament denotes periodic repetition","the cipher operation is direct additive/subtractive Vigenere modulo 29"],sourceConstruction:{printedValuesSpiralOrder:printedValues,underlyingPrimes,printedValuesBase29:local.printedValuesBase29.keyDigits,primeValuesBase29:local.primeValuesBase29.keyDigits,base29Of3301:local.base29Of3301.keyDigits,page15GlobalStart:page15Start,page15RedHeadingRunes:9,page15BodyRunes:body.length,p15ChapterRunes:p15Chapter.length,originalVisualChapterCuts:cuts},rawControls:raw,p15LocalTests:local,digitOrderPermutationNulls:nulls,fullBookPrintedValueKey:fullBook,base29SeedKeyBody:seedBody,conclusion:"No readable LP2 plaintext; the tested direct repeated-key BASE29 interpretations are unsupported."};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={base29,decrypt,scoreRunes,permutationNull,main};
