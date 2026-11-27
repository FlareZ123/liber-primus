'use strict';
/*
 * LP2 p33 exact red-Fibonacci candidate: bounded historical p56 consumer.
 *
 * Original p33 red word lengths [2,8,3,5] are distinct Fibonacci values
 * present in solved p15 numeric generator prime(F+1), giving [5,23,7,13].
 * Original black p33 has 196=4*49 runes; its artwork names 1033, and
 * the authenticated 2014 square of order 7 has magic sum 1033.
 *
 * Hypothesis only: apply authentic solved p56 prime-totient GP29 cipher
 * separately to four consecutive 49-rune black blocks. The red word
 * lengths select each block's initial prime; literal plaintext F bypasses
 * the shift without advancing the prime counter. No optimization/sweep.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ann=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const p33=d.pages[33].indices, p56=d.pages[56].indices, p57=d.pages[57].indices;
assert.equal(p33.length,214);assert.equal(p56.length,85);assert.equal(p57.length,95);
const ink=ann.pages.find(p=>p.page===33);
assert.deepEqual(ink.red_spans.map(s=>[s.start,s.length]),[[0,10],[91,8]]);
const runeSet=new Set(d.runes);
let offset=0,word=[],words=[];
function flush(){if(word.length){words.push(word);word=[];}}
for(const ch of transcription.split('%')[33]){
  if(runeSet.has(ch))word.push(offset++);
  else if('-.&$'.includes(ch))flush();
}
flush();assert.equal(offset,214);
const red=new Set(ink.red_spans.flatMap(s=>Array.from({length:s.length},(_,i)=>s.start+i)));
const redWords=words.filter(w=>w.every(i=>red.has(i)));
const lengths=redWords.map(w=>w.length);
assert.deepEqual(lengths,[2,8,3,5]);
assert.equal(lengths.reduce((x,y)=>x+y,0),1033%29); // 18; observation, not a decoder
const black=p33.slice(10,91).concat(p33.slice(99));assert.equal(black.length,196);
const primes=[];
for(let n=2;primes.length<400;n++){
 let q=true;for(let k=2;k*k<=n;k++)if(n%k===0){q=false;break;}
 if(q)primes.push(n);
}
const start=lengths; // L = F-index; prime(L+1) in one-based numbering.
assert.deepEqual(start.map(k=>primes[k]),[5,23,7,13]);
function toGp(str){
 const tokens=d.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
 let out=[];
 for(const word of str.split(' '))for(let i=0;i<word.length;){
   const t=tokens.find(({token})=>word.startsWith(token,i));
   assert.ok(t,'unknown native GP text '+word.slice(i));out.push(t.i);i+=t.token.length;
 }
 return out;
}
function forward(plain,initial){
 let k=initial;
 return plain.map(x=>x===0?0:(x+primes[k++]-1)%29);
}
const solved='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const known=toGp(solved);
assert.equal(known.length,85);
assert.deepEqual(known.map((x,i)=>x===0?i:-1).filter(x=>x>=0),[56]);
assert.deepEqual(forward(known,0),p56,'must match 85/85 original solved p56 runes');
function legalInverseSummary(cipher,initial){
 let states=new Map([[initial,1n]]);
 for(let i=0;i<cipher.length;i++){
   const next=new Map();
   for(const [k,paths] of states){
     const c=cipher[i];
     if(c===0)next.set(k,(next.get(k)||0n)+paths); // literal plaintext F hold
     const p=(c-(primes[k]-1)%29+29)%29;
     if(p!==0)next.set(k+1,(next.get(k+1)||0n)+paths);
   }
   states=next;
   if(!states.size)return {firstImpossible:i,finalStates:0,paths:'0'};
 }
 return {firstImpossible:null,finalStates:states.size,
   paths:String([...states.values()].reduce((a,b)=>a+b,0n))};
}
const blocks=Array.from({length:4},(_,i)=>black.slice(i*49,(i+1)*49));
const original=blocks.map((b,i)=>legalInverseSummary(b,start[i]));
assert.deepEqual(original.map(x=>x.firstImpossible),[null,48,8,1]);
// A native-runic solved-source plant ensures all four start primes are legal.
const donor=p57.concat(known,p57).slice(0,196);
assert.equal(donor.length,196);
for(let i=0;i<4;i++){
  const plain=donor.slice(i*49,(i+1)*49);
  assert.equal(legalInverseSummary(forward(plain,start[i]),start[i]).firstImpossible,null);
}
console.log(JSON.stringify({
 originalPage:33,redWordLengths:lengths,primeStarts:start.map(k=>primes[k]),
 blackRunes:black.length,blocks:original,fullP56Control:'85/85 exact',
 nativePlantedBlockControls:'4/4 legal',unknownPlaintextRecovered:false
},null,2));