#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const english=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const glyphIndex=new Map(corpus.runes.map((g,i)=>[g,i]));

const terminal=transcription.slice(transcription.lastIndexOf('%')+1,transcription.lastIndexOf('§')).replace(/[\/\s]/g,'');
const words=terminal.split(/[.\-]+/).filter(Boolean);
const printed=words.flatMap(word=>Array.from(word,g=>{
 assert.ok(glyphIndex.has(g),'unexpected p57 rune '+g);
 return glyphIndex.get(g);
}));
assert.equal(words.length,20);
assert.equal(printed.length,95);
assert.deepEqual(printed,corpus.pages[57].indices);
const interiors=words.flatMap(word=>Array.from(word).slice(1,-1).map(g=>glyphIndex.get(g)));
assert.equal(interiors.length,55);
assert.equal(corpus.pages[50].runic_count,0);
assert.equal(corpus.pages.slice(0,56).filter(p=>p.runic_count>0).length,55);
const steps=interiors.map(index=>corpus.prime[index]-1);

function josephus(stepList,pageCount){
 const remaining=Array.from({length:pageCount},(_,i)=>i),eliminated=[];
 let cursor=0;
 for(const step of stepList){
  assert.ok(Number.isSafeInteger(step)&&step>0);
  cursor=(cursor+step-1)%remaining.length;
  eliminated.push(remaining.splice(cursor,1)[0]);
 }
 return {eliminated,remaining};
}
const forward=josephus(steps,56);
assert.deepEqual(forward.remaining,[50]);
assert.deepEqual(forward.eliminated.slice(0,5),[39,49,35,43,8]);

const sieve=new Uint8Array(5001),ordinaryPrimes=[];
for(let n=2;n<sieve.length;n++){
 if(sieve[n])continue;
 ordinaryPrimes.push(n);
 for(let k=n*n;k<sieve.length;k+=n)sieve[k]=1;
}
function beforeFirstF(cipher,startOrdinal){
 const firstF=cipher.indexOf(0),limit=firstF<0?cipher.length:firstF;
 return cipher.slice(0,limit).map((rune,i)=>{
  assert.ok(ordinaryPrimes[startOrdinal+i],'prime sieve too short');
  return (rune-((ordinaryPrimes[startOrdinal+i]-1)%29)+29)%29;
 });
}
const knownP56=beforeFirstF(corpus.pages[56].indices,0);
const knownP56Text=knownP56.map(i=>corpus.translit[i]).join('');
assert.equal(knownP56Text,'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETH');
assert.equal(knownP56.length,35);

const tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  const pair=s.slice(i,i+2);
  if(tokenIndex.has(pair)){out.push(tokenIndex.get(pair));i+=2;}
  else{if(tokenIndex.has(s[i]))out.push(tokenIndex.get(s[i]));i++;}
 }
 return out;
}
const W=31,START=29,END=30,counts=new Float64Array(W*W),totals=new Float64Array(W),uni=new Float64Array(W);
for(const word of (english.slice(0,240000).match(/[A-Za-z]+/g)||[])){
 let prev=START;
 for(const cur of [...encodeWord(word),END]){counts[prev*W+cur]++;totals[prev]++;uni[cur]++;prev=cur;}
}
const total=uni.reduce((a,b)=>a+b,0),prior=Float64Array.from(uni,x=>(x+1)/(total+W)),lm=new Float64Array(W*W);
for(let a=0;a<W;a++)for(let b=0;b<W;b++)lm[a*W+b]=Math.log((counts[a*W+b]+5*prior[b])/(totals[a]+5));

function scorePages(pageArrays){
 let score=0,events=0,all=[];
 for(const runes of pageArrays){
  all.push(...runes);
  if(!runes.length)continue;
  let previous=START;
  for(const current of runes){score+=lm[previous*W+current];events++;previous=current;}
  score+=lm[previous*W+END];events++;
 }
 const frequencies=new Uint32Array(29);
 for(const rune of all)frequencies[rune]++;
 const ioc=frequencies.reduce((sum,n)=>sum+n*(n-1),0)/(all.length*(all.length-1));
 return {runes:all.length,ioc,score_per_event:score/events};
}
const rawPrefixes=forward.eliminated.map(page=>{
 const cipher=corpus.pages[page].indices,firstF=cipher.indexOf(0);
 return cipher.slice(0,firstF<0?cipher.length:firstF);
});
const schedules={
 source_gp_index:(r,rank,page)=>r,
 source_prime_value:(r,rank,page)=>corpus.prime[r],
 source_totient_value:(r,rank,page)=>corpus.prime[r]-1,
 josephus_rank_0based:(r,rank,page)=>rank,
 josephus_rank_1based:(r,rank,page)=>rank+1,
 physical_page_0based:(r,rank,page)=>page,
 physical_page_1based:(r,rank,page)=>page+1
};
const results={};
for(const [name,startOrdinal] of Object.entries(schedules)){
 const decoded=forward.eliminated.map((page,rank)=>beforeFirstF(corpus.pages[page].indices,startOrdinal(interiors[rank],rank,page)));
 const p0Rank=forward.eliminated.indexOf(0);
 results[name]={...scorePages(decoded),p0_prefix:decoded[p0Rank].map(i=>corpus.translit[i]).join('')};
}
const raw=scorePages(rawPrefixes),control=scorePages([knownP56]);
assert.equal(results.josephus_rank_0based.runes,1441);
assert.ok(Math.abs(results.josephus_rank_0based.ioc-0.03434247050659264)<1e-12);
assert.ok(Math.abs(results.josephus_rank_1based.ioc-0.034420541290770296)<1e-12);
assert.ok(Math.abs(control.ioc-0.09243697478991597)<1e-12);

console.log(JSON.stringify({
 page_order_first15:forward.eliminated.slice(0,15),
 p50_survivor:forward.remaining[0],
 raw_ciphertext_prefixes:raw,
 known_p56_positive_control:{text:knownP56Text,...control},
 page_start_schedules:results
},null,2));
