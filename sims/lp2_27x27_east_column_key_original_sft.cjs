'use strict';
/**
 * Test one literal original-source continuation of the provisional 27x27
 * LP2 p0-2 phrase "THE KEY IS TO GO TO THE EAST OF THE MAP".
 * Exact original p0-2 eastmost column supplies a 27-GP-rune key;
 * direct GP29 addition/subtraction on the fully withheld original pp3-55.
 * Node22 CommonJS. Read-only, no packages or stochastic tuning.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const opening=data.pages.filter(p=>p.page>=0&&p.page<=2).flatMap(p=>p.indices);
assert.equal(opening.length,729);
const key=Array.from({length:27},(_,row)=>opening[27*row+26]);
assert.deepEqual(key,[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]);
const input=data.pages.filter(p=>p.page>=3&&p.page<=55&&p.indices.length>0);
const tape=input.flatMap(p=>p.indices);
assert.equal(tape.length,12227);

/** @param {number} p */
function chapter(p){
 if(p<=7)return 0;
 if(p<=14)return 1;
 if(p<=23)return 2;
 if(p<=27)return 3;
 if(p<=32)return 4;
 if(p<=39)return 5;
 if(p<=53)return 6;
 return 7;
}
/** @param {number[]} seq */
function ioc(seq){
 const bins=new Uint32Array(29);
 for(const v of seq)bins[v]++;
 return Array.from(bins).reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
const variants=[];
for(const clock of ['continuous','per-page','visual-chapter']){
 let position=0,local=0,last=-1;
 const offsets=[];
 for(const page of input){
   if(clock==='per-page'||(clock==='visual-chapter'&&chapter(page.page)!==last))local=0;
   last=chapter(page.page);
   for(const value of page.indices){offsets.push(clock==='continuous'?position:local);position++;local++;}
 }
 assert.equal(offsets.length,tape.length);
 for(const sign of [-1,+1]){
   const plain=tape.map((v,i)=>((v+sign*key[offsets[i]%27])%29+29)%29);
   assert.deepEqual(plain.map((v,i)=>((v-sign*key[offsets[i]%27])%29+29)%29),tape);
   variants.push({
     clock,sign,IoC:ioc(plain),
     first120:plain.slice(0,120).map(v=>data.translit[v]).join(''),
     terminal76:plain.slice(-76).map(v=>data.translit[v]).join('')
   });
 }
}
const solved=data.pages.find(p=>p.page===57).indices;
console.log(JSON.stringify({
 source:'p0-2 27x27 eastmost column, NW->SE top-to-bottom',
 keyIndices:key,keyTranslit:key.map(v=>data.translit[v]).join(''),
 unknownRunes:tape.length,rawIoC:ioc(tape),
 solvedClearP57IoC:ioc(solved),
 variants
},null,2));