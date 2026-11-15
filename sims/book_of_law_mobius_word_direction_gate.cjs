#!/usr/bin/env node
"use strict";
// Mobius-function direction test: previous ciphertext word's GP-prime sum
// selects forward (+1), backward (-1), or hold (0) on the 2013 Book of Law key.
const fs=require("fs"),path=require("path"),assert=require("assert");
const ROOT=path.join(__dirname,".."),Q=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let current=[],seen=0;
for(const ch of Array.from(transcription)){
 if(runeMap.has(ch)){if(seen<12956)current.push(runeMap.get(ch));seen++;if(seen===12956)break;}
 else if(ch==="-"||ch==="."||ch==="&"){if(current.length){words.push(current);current=[];}}
}
if(current.length)words.push(current);
const unknown=words.flat(),canonical=corpus.pages.slice(0,56).flatMap(p=>p.indices||[]);assert.deepStrictEqual(unknown,canonical);assert.strictEqual(words.length,2896);assert.strictEqual(unknown.length,12956);
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length),tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeLatin(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let found=false;for(const t of tokens)if(s.startsWith(t,i)){out.push(tokenIndex.get(t));i+=t.length;found=true;break;}if(!found)throw Error("unmapped source at "+i);}return out;}
const bookText=["I","II","III"].map(p=>fs.readFileSync(path.join(ROOT,`resources/external/2013-book-of-law-${p}.txt`),"utf8")).join("\n");
const key=encodeLatin(bookText);assert.strictEqual(key.length,21630);
function mod29(n){return ((n%Q)+Q)%Q;}
function mobius(n){let x=n,mu=1;for(let p=2;p*p<=x;p++){if(x%p===0){x/=p;mu=-mu;if(x%p===0)return 0;while(x%p===0)x/=p;}}if(x>1)mu=-mu;return mu;}
function wordSum(w){return w.reduce((s,x)=>s+corpus.prime[x],0);}
function directionFor(sum,positiveMeansForward){const mu=mobius(sum);return mu===0?0:mu*(positiveMeansForward?1:-1);}
function decode(source,positiveMeansForward,sign){
 let pointer=0,direction=1,at=0,output=[],wraps=0,counts={zero:0,forward:0,backward:0};
 for(let wi=0;wi<words.length;wi++){
  if(wi>0){const prev=source.slice(at-words[wi-1].length,at);direction=directionFor(wordSum(prev),positiveMeansForward);}
  counts[direction===0?"zero":direction>0?"forward":"backward"]++;
  for(let k=0;k<words[wi].length;k++){
   output.push(mod29(source[at]-sign*key[pointer]));
   const next=pointer+direction;if(next<0||next>=key.length)wraps++;
   pointer=(next+key.length)%key.length;at++;
  }
 }
 return {output,pointer,wraps,counts};
}
function encrypt(plain,positiveMeansForward,sign){
 let pointer=0,direction=1,at=0,output=[];
 for(let wi=0;wi<words.length;wi++){
  const encryptedWord=[];
  for(let k=0;k<words[wi].length;k++){encryptedWord.push(mod29(plain[at]+sign*key[pointer]));pointer=(pointer+direction+key.length)%key.length;at++;}
  output.push(...encryptedWord);
  if(wi+1<words.length)direction=directionFor(wordSum(encryptedWord),positiveMeansForward);
 }
 return output;
}
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const reference=encodeLatin(shakespeare.slice(0,240000)),heldout=encodeLatin(shakespeare.slice(240000));
const tri=Array(Q*Q*Q).fill(0),bi=Array(Q*Q).fill(0);
for(let i=2;i<reference.length;i++){const k=reference[i-2]*Q+reference[i-1];tri[k*Q+reference[i]]++;bi[k]++;}
function score(x){let s=0;for(let i=2;i<x.length;i++){const k=x[i-2]*Q+x[i-1];s+=Math.log((tri[k*Q+x[i]]+0.1)/(bi[k]+0.1*Q));}return s/(x.length-2);}
function ioc(x){const n=Array(Q).fill(0);for(const v of x)n[v]++;return n.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));}
const expectedScores=[-4.6188308393497985,-4.649304119577148,-4.628695588061643,-4.611188772633044];
const expectedIoc=[0.034541980344005525,0.03449015871669203,0.03447429884408816,0.03449936959687445];
const results=[],controls=[];let ei=0;
for(const positiveMeansForward of [true,false])for(const sign of [1,-1]){
 const r=decode(unknown,positiveMeansForward,sign),s=score(r.output),ic=ioc(r.output);
 assert(Math.abs(s-expectedScores[ei])<1e-12);assert(Math.abs(ic-expectedIoc[ei])<1e-12);ei++;
 results.push({muPositiveMeansForward:positiveMeansForward,operation:sign===1?"C=P+K / decode C-K":"C=P-K / decode C+K",trigramLogLikelihood:s,ioc:ic,keyPointerWraps:r.wraps,finalPointer:r.pointer,directionCounts:r.counts});
 const plant=Array.from({length:unknown.length},(_,i)=>(i*17+11)%Q),cipher=encrypt(plant,positiveMeansForward,sign),recovered=decode(cipher,positiveMeansForward,sign).output;
 const exact=recovered.every((x,i)=>x===plant[i]);assert(exact);controls.push({positiveMeansForward,sign,exact,recoveredRunes:recovered.length});
}
const muCounts={minus:0,zero:0,plus:0};
for(let i=0;i<words.length-1;i++){const m=mobius(wordSum(words[i]));muCounts[m<0?"minus":m===0?"zero":"plus"]++;}
assert.deepStrictEqual(muCounts,{minus:945,zero:1115,plus:835});
console.log(JSON.stringify({test:"2013 Book of the Law key with Mobius-directed word traversal",keyRunes:key.length,unknownRunes:unknown.length,wordCount:words.length,previousWordPrimeSumMobiusCounts:muCounts,sourceTrigramLogLikelihood:score(unknown),sourceIoC:ioc(unknown),shakespeareTrain:score(reference),shakespeareHoldout:score(heldout),uniformMeanLogLikelihood:-Math.log(Q),results,positiveControls:controls},null,2));
