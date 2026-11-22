#!/usr/bin/env node
"use strict";
// Causal word-number direction: the previous PLAINTEXT word's GP-prime sum
// selects the key-pointer direction for the next word.
const fs=require("fs"),path=require("path"),assert=require("assert"),ROOT=path.join(__dirname,".."),Q=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let current=[],seen=0;
for(const ch of Array.from(transcription)){if(runeMap.has(ch)){if(seen<12956)current.push(runeMap.get(ch));seen++;if(seen===12956)break;}else if(ch==="-"||ch==="."||ch==="&"){if(current.length){words.push(current);current=[];}}}
if(current.length)words.push(current);
const unknown=words.flat(),canonical=corpus.pages.slice(0,56).flatMap(p=>p.indices||[]);
assert.deepStrictEqual(unknown,canonical);assert.strictEqual(words.length,2896);assert.strictEqual(unknown.length,12956);
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length),tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeLatin(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let f=false;for(const t of tokens)if(s.startsWith(t,i)){out.push(tokenIndex.get(t));i+=t.length;f=true;break;}if(!f)throw Error("unmapped source at "+i);}return out;}
const bookText=["I","II","III"].map(p=>fs.readFileSync(path.join(ROOT,`resources/external/2013-book-of-law-${p}.txt`),"utf8")).join("\n");
const key=encodeLatin(bookText);assert.strictEqual(key.length,21630);
function mobius(n){let x=n,mu=1;for(let p=2;p*p<=x;p++)if(x%p===0){x/=p;mu=-mu;if(x%p===0)return 0;while(x%p===0)x/=p;}if(x>1)mu=-mu;return mu;}
function isPrime(n){if(n<2)return false;if(n%2===0)return n===2;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true;}
function wordSum(w){return w.reduce((s,x)=>s+corpus.prime[x],0);}
function direction(sum,rule,polarity){if(rule==="prime")return (isPrime(sum)===polarity)?1:-1;const m=mobius(sum);return m===0?0:m*(polarity?1:-1);}
function mod(n){return ((n%Q)+Q)%Q;}
function decode(source,rule,polarity,sign){let pointer=0,dir=1,at=0,out=[],wraps=0,counts={zero:0,forward:0,backward:0};for(let wi=0;wi<words.length;wi++){const plainWord=[];for(let k=0;k<words[wi].length;k++){plainWord.push(mod(source[at]-sign*key[pointer]));const next=pointer+dir;if(next<0||next>=key.length)wraps++;pointer=(next+key.length)%key.length;at++;}out.push(...plainWord);counts[dir===0?"zero":dir>0?"forward":"backward"]++;if(wi+1<words.length)dir=direction(wordSum(plainWord),rule,polarity);}return {out,pointer,wraps,counts};}
function encrypt(plain,rule,polarity,sign){let pointer=0,dir=1,at=0,out=[];for(let wi=0;wi<words.length;wi++){const plainWord=[],cipherWord=[];for(let k=0;k<words[wi].length;k++){plainWord.push(plain[at]);cipherWord.push(mod(plain[at]+sign*key[pointer]));pointer=(pointer+dir+key.length)%key.length;at++;}out.push(...cipherWord);if(wi+1<words.length)dir=direction(wordSum(plainWord),rule,polarity);}return out;}
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const reference=encodeLatin(shakespeare.slice(0,240000)),heldout=encodeLatin(shakespeare.slice(240000));
const tri=Array(Q*Q*Q).fill(0),bi=Array(Q*Q).fill(0);
for(let i=2;i<reference.length;i++){const k=reference[i-2]*Q+reference[i-1];tri[k*Q+reference[i]]++;bi[k]++;}
function score(x){let s=0;for(let i=2;i<x.length;i++){const k=x[i-2]*Q+x[i-1];s+=Math.log((tri[k*Q+x[i]]+0.1)/(bi[k]+0.1*Q));}return s/(x.length-2);}
function ioc(x){const n=Array(Q).fill(0);for(const v of x)n[v]++;return n.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));}
const expectedScores=[-4.625032769821963,-4.613095389489315,-4.6418300492992985,-4.6370016373871525,-4.62579419269094,-4.630712645330303,-4.622160397842689,-4.649410146039139];
const results=[],controls=[];let e=0;
for(const rule of ["prime","mobius"])for(const polarity of [true,false])for(const sign of [1,-1]){
 const r=decode(unknown,rule,polarity,sign),logL=score(r.out);
 assert(Math.abs(logL-expectedScores[e++])<1e-12);
 results.push({rule,positiveMeansForward:polarity,operation:sign===1?"C=P+K / decode C-K":"C=P-K / decode C+K",trigramLogLikelihood:logL,ioc:ioc(r.out),keyPointerWraps:r.wraps,finalPointer:r.pointer,directionCounts:r.counts});
 const plant=Array.from({length:unknown.length},(_,i)=>(i*17+11)%Q),cipher=encrypt(plant,rule,polarity,sign),recovered=decode(cipher,rule,polarity,sign).out;
 const exact=recovered.every((x,i)=>x===plant[i]);assert(exact);controls.push({rule,polarity,sign,exact,recoveredRunes:recovered.length});
}
console.log(JSON.stringify({test:"Book of the Law running key with previous-plaintext-word direction",keyRunes:key.length,unknownRunes:unknown.length,wordCount:words.length,sourceTrigramLogLikelihood:score(unknown),sourceIoC:ioc(unknown),shakespeareTrain:score(reference),shakespeareHoldout:score(heldout),uniformMeanLogLikelihood:-Math.log(Q),results,positiveControls:controls},null,2));
