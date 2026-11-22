"use strict";
/**
 * #2227: one complete, frozen 2013 BASE29 + reconstructed NUMBER
 * decimal-reverse/prime-factor program: original printed paragraph 1 -> 2.
 * Source typed as GP rune numerals and source printed-word factor list.
 * All BigInt arithmetic exact; Windows Node22 standalone read-only SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r\n/g,"\n").split("\n%\n").slice(36,39).join("\n");
const marks=[...original.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(marks.map(x=>Number(x[1])),[1,2,3,4,5]);
const dictionary=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} s */
const runes=s=>[...s].flatMap(ch=>dictionary.has(ch)?[dictionary.get(ch)]:[]);
/** @param {number[]} digits */
const integer=digits=>digits.reduce((n,d)=>29n*n+BigInt(d),0n);
/** @param {bigint} n */
const reversedDecimal=n=>BigInt(String(n).split("").reverse().join(""));
/** @param {bigint} n */
function radix29(n){assert.ok(n>=0n);if(n===0n)return [0];const a=[];while(n){a.push(Number(n%29n));n/=29n;}return a.reverse();}
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
const sections=marks.map((mark,i)=>{
 const begin=mark.index+mark[0].length;
 const end=i===4?original.indexOf("\n&\n",begin):marks[i+1].index;
 assert.ok(end>begin);
 const source=original.slice(begin,end).trim();
 const values=runes(source);
 const words=source.replace(/\/\n/gu,"").split(/[.\-]/u).map(runes).filter(x=>x.length);
 assert.deepEqual(words.flat(),values);
 return {number:i+1,values,words};
});
assert.deepEqual(sections.map(x=>x.values.length),[139,91,98,96,129]);
assert.deepEqual(sections.map(x=>x.words.length),[30,20,25,19,28]);
const first=sections[0],second=sections[1],N=integer(first.values);
assert.ok(first.values[0]>0,"canonical source p1 numeral has no leading zeros");
const reversed=reversedDecimal(N);
const factorWords=second.words.map(integer);
assert.ok(factorWords.every(v=>v>1n));
const multiplied=factorWords.reduce((v,x)=>v*x,1n);
const roundtripNoLostTrailingZero=reversedDecimal(reversed)===N;
assert.ok(roundtripNoLostTrailingZero);
const common=gcd(reversed,multiplied);
assert.equal(common,1n,"original purported prime factors and reversed source integer share no divisor");
assert.ok(reversed>multiplied);
assert.notEqual(reversed,multiplied);
assert.equal(factorWords[1]%2n,0n,"second source factor is composite");
assert.equal(factorWords[2]%2n,0n,"third source factor is composite");
const sourceProductRatio=reversed/multiplied;
const residual=reversed%multiplied;
/* Real lossless positive: 20 printed prime-3 factors reconstruct a
   reversed-decimal initial GP29 numeral; one factor change rejects. */
const plantFactors=Array(20).fill(3n);
const plantProduct=plantFactors.reduce((v,x)=>v*x,1n);
const plantN=reversedDecimal(plantProduct);
assert.equal(reversedDecimal(integer(radix29(plantN))),plantProduct);
assert.equal(plantFactors.reduce((v,x)=>v*x,1n),plantProduct);
assert.notEqual(plantFactors.slice(1).reduce((v,x)=>v*x,1n)*5n,plantProduct);
console.log(JSON.stringify({
 source:"original physical pp36-38, five red-numbered paragraphs",
 authentic:"2013 signed BASE29 (not NUMBER); NUMBER decimal-reversal/factoring in separately reconstructed participant material",
 first:{runes:first.values.length,words:first.words.length,bits:N.toString(2).length,decimalDigits:String(N).length,base29Digits:radix29(N).length,terminalDigit:String(N).slice(-1)},
 predictedFactorTarget:{decimalDigits:String(reversed).length,bits:reversed.toString(2).length,base29Digits:radix29(reversed).length},
 originalNext:{runes:second.values.length,words:second.words.length,compositeFactorExamples:factorWords.slice(1,3).map(String),factorProductDecimalDigits:String(multiplied).length,factorProductBits:multiplied.toString(2).length,factorProductBase29Digits:radix29(multiplied).length},
 exact:{
    sourceReversibleDecimal:roundtripNoLostTrailingZero,
    equality:reversed===multiplied,
    originalFactorProductDividesTarget:residual===0n,
    gcd:common.toString(),
    missingFactorRatioGP29Digits:radix29(sourceProductRatio).length,
    missingTotalInjectionSidebandGP29Digits:139-91,
    minimumUniversalSidebandBits:(139-91)*Math.log2(29)
 },
 planted:{primeFactorCount:plantFactors.length,exactForwardReverse:true,wrongFactorRejected:true},
 decision:"REJECT this one complete 2013 NUMBER-style reversible factor-list serialization as five-passage 1->2; no stage3/4/5 tested",
},null,2));
