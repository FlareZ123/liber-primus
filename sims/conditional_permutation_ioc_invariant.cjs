"use strict";
/**
 * Key-free within-row IoC invariant for 29 arbitrary unknown 28-permutations
 * of a 29-rune GP plaintext register, with EA as same-ciphertext marker.
 * Compare original to true GP-English encrypted under 29 independently
 * permuted transition rows; nulls condition on observed marker locations.
 */
const fs=require("node:fs"),path=require("node:path");
const {encodeGP}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const sourceData=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const sourceEnglish=encodeGP(fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8"));
const pages=sourceData.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const cipher=pages.flat(),starts=new Uint8Array(cipher.length);
let at=0;for(const p of pages){starts[at]=1;at+=p.length;}
const set=new Set(sourceData.runes),offsets=[];let word=0;
for(const ch of transcription.split("%").slice(0,55).join("%")){
  if(set.has(ch))offsets.push(word++);
  else if(ch==="%"||ch==="/"||/\s/u.test(ch)){}
  else word=0;
}
if(offsets.length!==cipher.length)throw new Error("word index error");
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const random=rng(0x33012928),table=[];
for(let prev=0;prev<29;prev++){
  const arr=Array.from({length:29},(_,i)=>i).filter(i=>i!==prev);
  for(let j=27;j>0;j--){
    const k=random()%(j+1);[arr[k],arr[j]]=[arr[j],arr[k]];
  }
  table.push(arr);
}
function encrypt(p){
  const c=[];
  for(let i=0;i<p.length;i++)
    c.push(starts[i]?p[i]:p[i]===28?c[i-1]:table[c[i-1]][p[i]]);
  return c;
}
function decrypt(c){
  const p=[];
  for(let i=0;i<c.length;i++)
    p.push(starts[i]?c[i]:c[i]===c[i-1]?28:table[c[i-1]].indexOf(c[i]));
  return p;
}
function score(c,wordConditional){
  const hist=new Map();
  for(let i=1;i<c.length;i++){
    if(starts[i]||c[i]===c[i-1])continue;
    const k=wordConditional?String(c[i-1])+":"+Math.min(offsets[i],8):String(c[i-1]);
    if(!hist.has(k))hist.set(k,new Uint16Array(29));
    hist.get(k)[c[i]]++;
  }
  let num=0,den=0,groups=0;
  for(const counts of hist.values()){
    let n=0;for(const q of counts)n+=q;
    if(n<2)continue;
    groups++;den+=n*(n-1);
    for(const q of counts)num+=q*(q-1);
  }
  return {ioc:num/den,groups,pairs:den};
}
function nullCipher(){
  const c=[];
  for(let i=0;i<cipher.length;i++)
    if(starts[i])c.push(cipher[i]);
    else if(cipher[i]===cipher[i-1])c.push(c[i-1]);
    else {
      const r=random()%28;
      c.push(r>=c[i-1]?r+1:r);
    }
  return c;
}
function summarize(v){
  const mean=v.reduce((a,b)=>a+b,0)/v.length;
  const sd=Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/v.length);
  return {n:v.length,mean,sd,min:Math.min(...v),max:Math.max(...v)};
}
function main(){
  const p=sourceEnglish.slice(1000,1000+cipher.length);
  const plant=encrypt(p),plain=decrypt(plant);
  const trueRecovery=plain.filter((v,i)=>v===p[i]).length;
  const original={prev:score(cipher,false),prevWord:score(cipher,true)};
  const positive={prev:score(plant,false),prevWord:score(plant,true)};
  const nullPrev=[],nullWord=[];
  for(let j=0;j<160;j++){
    const c=nullCipher();
    nullPrev.push(score(c,false).ioc);
    nullWord.push(score(c,true).ioc);
  }
  console.log(JSON.stringify({sampleSize:cipher.length,
    hypothesis:"conditional IoC invariant under arbitrary stationary predecessor-row permutations",
    original,positive,trueRecoveredPlaintextRunes:trueRecovery,
    markerConditionalNulls:{prev:summarize(nullPrev),prevWord:summarize(nullWord)},
    uniform28Baseline:1/28},null,2));
  if(trueRecovery!==cipher.length||positive.prev.ioc<0.052)
    throw new Error("arbitrary secret S-box positive control failed");
}
if(require.main===module)main();
module.exports={score,encrypt,decrypt};
