"use strict";
/**
 * LP2 source-word first-rune anchor feedback SFT, Node.js 22 CommonJS.
 * Proposed model: C0=P0, Cj=C(j-1)+Kj*(Pj-P0) (mod29).
 * Each K may be any nonzero, independently chosen secret value.
 * Necessary all-secret identity: Cj=C(j-1) iff Pj=P0.
 * An exploratory human interpretation of p57 "shed circumferences";
 * Cicada has NOT authenticated this operation.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes=new Map(gp.runes.map((s,i)=>[s,i]));
const source=parseSharedCorpus();
const ciphertext=source.words.map(w=>[...w.runes].map(r=>runes.get(r)));
assert.equal(source.runeCount,12956);
assert.equal(ciphertext.length,2896);
const token=gp.translit.map((name,index)=>({name,index}))
 .sort((a,b)=>b.name.length-a.name.length);
const mod=x=>(x%29+29)%29;
/** @param {string} word @returns {number[]} */
function native(word){
 const s=word.toUpperCase().replace(/QU/gu,"CW").replace(/K/gu,"C")
  .replace(/Q/gu,"C").replace(/V/gu,"U").replace(/Z/gu,"S")
  .replace(/ING/gu,"NG").replace(/IO/gu,"IA");
 const out=[];
 for(let i=0;i<s.length;){const t=token.find(x=>s.startsWith(x.name,i));
  if(!t)return [];out.push(t.index);i+=t.name.length;}
 return out;
}
/** @param {number[]} w @param {boolean} adjacent */
function mask(w,adjacent){
 let n=0;
 for(let j=1;j<w.length;j++)if(w[j]===w[adjacent?j-1:0])n|=1<<(j-1);
 return n;
}
/** @param {number[][]} words */
function events(words){
 let doublets=0, lagFive=0, pairedLagFive=0;
 for(const w of words)for(let j=1;j<w.length;j++){
  if(w[j]===w[j-1])doublets++;
  if(j>=5 && w[j]===w[j-5])lagFive++;
  if(j>=5 && j+1<w.length && w[j]===w[j-5] && w[j+1]===w[j-4])pairedLagFive++;
 }
 return {doublets,lagFive,pairedLagFive};
}
const original=events(ciphertext);
assert.deepEqual(original,{doublets:63,lagFive:104,pairedLagFive:9});
const inv=Array.from({length:29},(_,x)=>{
 if(!x)return 0;
 for(let a=1;a<29;a++)if((a*x)%29===1)return a;
 assert.fail("No inverse");
});
const key=(w,j)=>1+(w*7+j*13)%28;
/** @param {number[]} w @param {number} i */
function encrypt(w,i){const c=[w[0]];
 for(let j=1;j<w.length;j++)c.push(mod(c[j-1]+key(i,j)*(w[j]-w[0])));
 return c;
}
/** @param {number[]} c @param {number} i */
function decrypt(c,i){const p=[c[0]];
 for(let j=1;j<c.length;j++)p.push(mod(c[0]+inv[key(i,j)]*(c[j]-c[j-1])));
 return p;
}
function ioc(words){
 const xs=words.flat(),c=Array(29).fill(0);
 for(const x of xs)c[x]++;
 return c.reduce((v,x)=>v+x*(x-1),0)/(xs.length*(xs.length-1));
}
function makeRandom(seed){let state=seed>>>0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
const refs=[
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const controls=[];
for(let src=0;src<refs.length;src++){
 const [name,file]=refs[src];
 const buckets=Array.from({length:15},()=>[]);
 for(const raw of (read(file).match(/[A-Za-z]+/gu)||[])){
  const w=native(raw);
  if(w.length&&w.length<=14)buckets[w.length].push(w);
 }
 assert.ok(buckets.slice(1).every(b=>b.length>0));
 const random=makeRandom((0x33011090+7919*src)>>>0), counts=[];
 for(let trial=0;trial<100;trial++){
  const p=ciphertext.map(w=>{const b=buckets[w.length];return b[random()%b.length];});
  const count=p.reduce((n,w)=>n+w.slice(1).filter(x=>x===w[0]).length,0);
  counts.push(count);
  if(trial===0){
   const encrypted=p.map(encrypt);
   assert.deepEqual(encrypted.map(decrypt),p,"12,956/12,956 correct source-native GP");
   assert.equal(events(encrypted).doublets,count,"All-secret invariant");
  }
 }
 assert.ok(Math.min(...counts)>original.doublets);
 controls.push({name,replicates:100,min:Math.min(...counts),
  mean:counts.reduce((a,b)=>a+b,0)/counts.length,max:Math.max(...counts),
  countsAtOrBelow63:counts.filter(x=>x<=63).length});
}
const dict=["resources/control/english_wordfreq_textblob.txt",...refs.map(x=>x[1])];
const admitted=new Set();
for(const file of dict)for(const s of (read(file).match(/[A-Za-z]+/gu)||[])){
 const w=native(s);
 if(w.length&&w.length<=14)admitted.add(w.length+":"+w[0]+":"+mask(w,false));
}
const misses=ciphertext.map((w,i)=>({i,len:w.length,
 key:w.length+":"+w[0]+":"+mask(w,true)})).filter(x=>!admitted.has(x.key));
assert.equal(misses.length,293);
assert.equal(misses.filter(x=>x.len>=7).length,78);
assert.equal(ciphertext[1476].length,12);
assert.equal(mask(ciphertext[1476],true),1040);
assert.ok(misses.some(x=>x.i===1476));
const decodedK1=ciphertext.map(w=>w.map((c,j)=>
 j===0?c:mod(w[0]+c-w[j-1])));
const outputIoC=ioc(decodedK1);
assert.ok(Math.abs(outputIoC-0.03447877916873057)<1e-9);
console.log(JSON.stringify({
 source:{pages:55,words:2896,runes:12956,...original,originalIoC:ioc(ciphertext)},
 allKeyTheorem:"C[w,j]=C[w,j-1] iff P[w,j]=P[w,0] for arbitrary nonzero K[w,j]",
 literalKeyOneInverseIoC:outputIoC,
 exactLengthNativeGPControls:controls,
 publicFirstRuneLexicon:{unmatchedWords:293,unmatchedLongWords:78,
  originalP27DoubleMarkedWord:1476,mask:1040},
 positive:"All 12,956 native GP symbols recovered by nonconstant-key forward/inverse controls",
 result:"No original plaintext; this word-anchor cipher is incompatible with native GP29 controls",
 limit:"Conditional on printed word grammar and native-English plaintext; alternate plaintext register is open"
},null,2));
