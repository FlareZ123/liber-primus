"use strict";
/**
 * One source-selected, unfitted 2013 CicadaOS prime_echo gaps cipher test,
 * the bounded difference alternative to prime-totient original gap tests.
 * node sims/lp2_2013_prime_echo_gaps_original_290_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const P=[];for(let n=2;n<=3301;n++){let ok=true;for(const p of P){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)P.push(n);}
const a=P.indexOf(1033),b=P.indexOf(3301);
assert.equal(a,173);assert.equal(b,463);
const gap=P.slice(a+1,b+1).map((p,i)=>p-P[a+i]);
assert.equal(gap.length,290);
assert.deepEqual(gap.slice(0,20),[6,10,2,10,2,6,18,4,2,4,6,6,8,6,6,22,2,10,8,10]);
const C=data.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices).slice(91);
assert.equal(C.length,1589);
const mod=n=>((n%29)+29)%29;
function direct(c,sign){return c.map((v,i)=>mod(v-sign*gap[i%290]));}
function ioc(a){const count=Array(29).fill(0);for(const x of a)count[x]++;return count.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function forward(F,sign){let j=0;return F.map(x=>x===0?0:mod(x+sign*gap[(j++)%290]));}
function statesInverse(C,sign){
  let states=new Map([[0,1n]]);
  for(let i=0;i<C.length;i++){
    const next=new Map();
    for(const [j,ways] of states){
      // Authenticated solved-p56 literal plaintext F is transparent:
      if(C[i]===0)next.set(j,(next.get(j)||0n)+ways);
      const p=mod(C[i]-sign*gap[j%290]);
      if(p!==0)next.set(j+1,(next.get(j+1)||0n)+ways);
    }
    states=next;
    if(!states.size)return {accepted:false,firstImpossibleOffset:i,firstImpossibleOrdinal:i+1};
  }
  return{accepted:true,terminalClockStates:states.size};
}
const originalPlus=statesInverse(C,+1),originalMinus=statesInverse(C,-1);
assert.deepEqual(originalPlus,{accepted:false,firstImpossibleOffset:3,firstImpossibleOrdinal:4});
assert.deepEqual(originalMinus,{accepted:false,firstImpossibleOffset:22,firstImpossibleOrdinal:23});
// Native solved p57 plaintext mirrored to original section length.
// A positive under precisely this hypothetical forward sender MUST be accepted.
const native=data.pages[57].indices;
const plant=Array.from({length:C.length},(_,i)=>native[i%native.length]);
const positive=forward(plant,+1);
assert.equal(positive.length,1589);
assert.equal(statesInverse(positive,+1).accepted,true);
assert.equal(statesInverse(forward(plant,-1),-1).accepted,true);
const output={
 premise:"2013 prime_echo pause at 1033 and 3301 selects 290 consecutive prime differences; GP29 page-section starts after p33 red91",
 sourceOriginalRunes:C.length,firstGapValues:gap.slice(0,20),
 inverse:"Solved p56 literal F transparent/non-consuming; each other plaintext rune shifts by next gap modulo29, no key fitting or phase search",
 plus:originalPlus,minus:originalMinus,
 directArithmetic:{originalIoC:ioc(C),plusIoC:ioc(direct(C,+1)),minusIoC:ioc(direct(C,-1)),
 plusPrefix:direct(C,+1).slice(0,80).map(i=>data.translit[i]).join(""),
 minusPrefix:direct(C,-1).slice(0,80).map(i=>data.translit[i]).join("")},
 nativePositive:{plantLength:plant.length,plusAccepted:true,minusAccepted:true},
 decision:"No complete original inverse under either sign; this exact prime-gap/GP29 F-transparent receiver cannot decode marked chapter."
};
console.log(JSON.stringify(output,null,2));
