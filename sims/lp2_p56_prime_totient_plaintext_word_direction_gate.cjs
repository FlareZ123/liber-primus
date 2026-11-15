#!/usr/bin/env node
"use strict";
// Causal word-directed use of the authentic p56 prime-totient key.
// Previous PLAINTEXT word's GP-prime sum selects the next word's direction.
const fs=require("fs"),path=require("path"),assert=require("assert"),ROOT=path.join(__dirname,".."),Q=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let current=[],seen=0;
for(const ch of Array.from(transcription)){if(runeMap.has(ch)){if(seen<12956)current.push(runeMap.get(ch));seen++;if(seen===12956)break;}else if(ch==="-"||ch==="."||ch==="&"){if(current.length){words.push(current);current=[];}}}
if(current.length)words.push(current);
const unknown=words.flat(),canonical=corpus.pages.slice(0,56).flatMap(p=>p.indices||[]);
assert.deepStrictEqual(unknown,canonical);assert.strictEqual(words.length,2896);assert.strictEqual(unknown.length,12956);
function firstPrimes(count){const out=[];for(let n=2;out.length<count;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)out.push(n);}return out;}
const key=firstPrimes(10000).map(p=>(p-1)%Q);
function isPrime(n){if(n<2)return false;if(n%2===0)return n===2;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true;}
function mobius(n){let x=n,mu=1;for(let d=2;d*d<=x;d++)if(x%d===0){x/=d;mu=-mu;if(x%d===0)return 0;while(x%d===0)x/=d;}if(x>1)mu=-mu;return mu;}
function wordSum(w){return w.reduce((s,x)=>s+corpus.prime[x],0);}
function direction(sum,rule,polarity){if(rule==="prime")return (isPrime(sum)===polarity)?1:-1;const m=mobius(sum);return m===0?0:m*(polarity?1:-1);}
function mod(n){return ((n%Q)+Q)%Q;}
function decode(source,rule,polarity,sign){
 let pointer=0,dir=1,at=0,min=Infinity,max=-Infinity,out=[];
 for(let wi=0;wi<words.length;wi++){
  const plainWord=[];
  for(let k=0;k<words[wi].length;k++){
   if(pointer<0||pointer>=key.length)return {valid:false,word:wi,runeOffset:at,pointer,min,max};
   plainWord.push(mod(source[at]-sign*key[pointer]));min=Math.min(min,pointer);max=Math.max(max,pointer);pointer+=dir;at++;
  }
  out.push(...plainWord);
  if(wi+1<words.length)dir=direction(wordSum(plainWord),rule,polarity);
 }
 return {valid:true,out,pointer,min,max};
}
function encrypt(plain,rule,polarity,sign){
 let pointer=0,dir=1,at=0,out=[];
 for(let wi=0;wi<words.length;wi++){
  const plainWord=[],cipherWord=[];
  for(let k=0;k<words[wi].length;k++){
   if(pointer<0||pointer>=key.length)return {valid:false,word:wi,runeOffset:at,pointer};
   plainWord.push(plain[at]);cipherWord.push(mod(plain[at]+sign*key[pointer]));pointer+=dir;at++;
  }
  out.push(...cipherWord);
  if(wi+1<words.length)dir=direction(wordSum(plainWord),rule,polarity);
 }
 return {valid:true,out,pointer};
}
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length),tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeLatin(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let found=false;for(const t of tokens)if(s.startsWith(t,i)){out.push(tokenIndex.get(t));i+=t.length;found=true;break;}if(!found)throw Error("unmapped ref "+i);}return out;}
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const reference=encodeLatin(shakespeare.slice(0,240000)),heldout=encodeLatin(shakespeare.slice(240000));
const tri=Array(Q*Q*Q).fill(0),bi=Array(Q*Q).fill(0);
for(let i=2;i<reference.length;i++){const k=reference[i-2]*Q+reference[i-1];tri[k*Q+reference[i]]++;bi[k]++;}
function score(x){let s=0;for(let i=2;i<x.length;i++){const k=x[i-2]*Q+x[i-1];s+=Math.log((tri[k*Q+x[i]]+0.1)/(bi[k]+0.1*Q));}return s/(x.length-2);}
const cases=[
 {rule:"prime",polarity:true,sign:1,valid:false,word:3,offset:17,pointer:-1},
 {rule:"prime",polarity:true,sign:-1,valid:false,word:3,offset:17,pointer:-1},
 {rule:"prime",polarity:false,sign:1,valid:true,score:-4.627729577635085,max:7873,final:7874},
 {rule:"prime",polarity:false,sign:-1,valid:true,score:-4.632352043209153,max:7585,final:7582},
 {rule:"mobius",polarity:true,sign:1,valid:false,word:21,offset:103,pointer:-1},
 {rule:"mobius",polarity:true,sign:-1,valid:false,word:5,offset:28,pointer:-1},
 {rule:"mobius",polarity:false,sign:1,valid:false,word:5,offset:33,pointer:-1},
 {rule:"mobius",polarity:false,sign:-1,valid:true,score:-4.612581630475879,max:557,final:555}
];
const results=[],controls=[];
for(const c of cases){
 const r=decode(unknown,c.rule,c.polarity,c.sign);
 assert.strictEqual(r.valid,c.valid);
 if(!c.valid){assert.deepStrictEqual({word:r.word,offset:r.runeOffset,pointer:r.pointer},{word:c.word,offset:c.offset,pointer:c.pointer});results.push({...c,valid:false,underflow:{word:r.word,runeOffset:r.runeOffset,pointer:r.pointer}});continue;}
 const logL=score(r.out);assert(Math.abs(logL-c.score)<1e-12);assert.strictEqual(r.max,c.max);assert.strictEqual(r.pointer,c.final);const reencrypted=encrypt(r.out,c.rule,c.polarity,c.sign);assert(reencrypted.valid&&reencrypted.out.every((x,i)=>x===unknown[i]));
 const re=encrypt(r.out,c.rule,c.polarity,c.sign);
 assert(re.valid&&re.out.every((x,i)=>x===unknown[i]));
 results.push({...c,valid:true,trigramLogLikelihood:logL,minPointer:r.min,maxPointer:r.max,finalPointer:r.pointer,reencryptsOriginal:true});
 if(c.rule==="prime"){
  const plant=Array(unknown.length).fill(0),enc=encrypt(plant,c.rule,c.polarity,c.sign),dec=enc.valid?decode(enc.out,c.rule,c.polarity,c.sign):{valid:false};
  assert(enc.valid&&dec.valid&&dec.out.every(x=>x===0));controls.push({rule:c.rule,polarity:c.polarity,sign,constantZeroPlantExact:true});
 }else controls.push({rule:c.rule,polarity:c.polarity,sign,candidateReencryptsOriginal:true});
}
console.log(JSON.stringify({test:"p56 prime-totient stream with causal previous-plaintext-word direction",keyDefinition:"K[i]=(prime(i+1)-1) mod 29, first key symbol uses prime 2; no wrap",keySymbols:10000,wordCount:words.length,unknownRunes:unknown.length,sourceTrigramLogLikelihood:score(unknown),shakespeareTrain:score(reference),shakespeareHoldout:score(heldout),uniformMeanLogLikelihood:-Math.log(Q),results,controls},null,2));
