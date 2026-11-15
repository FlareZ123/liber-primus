'use strict';

/** SFT: four original-image LP2 apostrophe words. Node.js 22, CommonJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const c = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8').split('%');
const rune = new Map(c.runes.map((value, index) => [value,index]));
const all = c.pages.slice(0,56).flatMap((p) => p.indices);
const prefix = [0];
for (let page = 0; page < 56; page++) prefix.push(prefix[page] + c.pages[page].indices.length);
assert.equal(prefix[56],12956);
const sites = [
 {page:4,local:164,stem:3,cipher:[19,14,10,7],label:"MXI'W"},
 {page:21,local:36,stem:2,cipher:[25,3,26],label:"AEO'Y"},
 {page:35,local:80,stem:2,cipher:[13,18,16],label:"PE'T"},
 {page:41,local:218,stem:3,cipher:[14,20,11,5],label:"XLJ'C"}
];
const candidate = {
 3:['DONT','CANT','WONT','AINT','ISNT','LETS','GODS','ONES','MANS','MENS','SHED','YOUD','ALLS'],
 2:['ITS','HES','WED','HED','ITD','DOS']
};
const letters = Object.fromEntries(c.translit.map((value,index)=>[value,index]).filter(([value])=>value.length===1));
const pword = (s)=>[...s].map((letter)=>{
 assert.ok(Number.isInteger(letters[letter]),'Unknown GP letter '+letter);
 return letters[letter];
});
const mod=(value)=>(value%29+29)%29;
const primes=[];
for(let n=2;primes.length<14000;n++){
 let ok=true;
 for(let k=2;k*k<=n;k++)if(n%k===0){ok=false;break;}
 if(ok)primes.push(n);
}
for(const s of sites){
 const text=transcription[s.page<50?s.page:s.page-1];
 let n=0,at=-1;
 for(let i=0;i<text.length;i++){
  if(!rune.has(text[i]))continue;
  if(n===s.local){at=i;break;}
  n++;
 }
 assert.ok(at>=0);
 const wordStart=Math.max(...['-','.','&','$','§'].map(d=>text.lastIndexOf(d,at)));
 const stem=[...text.slice(wordStart+1,at)].filter(x=>rune.has(x)).map(x=>rune.get(x));
 const tail=[...text.slice(at).split(/[-.&$§]/,1)[0]].filter(x=>rune.has(x)).map(x=>rune.get(x));
 assert.equal(stem.length,s.stem);
 assert.equal(tail.length,1);
 assert.deepEqual(stem.concat(tail),s.cipher);
 assert.deepEqual(c.pages[s.page].indices.slice(s.local-s.stem,s.local+1),s.cipher);
 s.global=prefix[s.page]+s.local;
 s.start=s.global-s.stem;
 s.words=candidate[s.stem].map(w=>({w,plain:pword(w)}));
 console.log('SOURCE',JSON.stringify({page:s.page,originalScan:(17+s.page)+'.jpg',beforeRune:s.global,word:s.label,options:s.words.length}));
}
// Fully recovered first-release contraction positive control. Original LP1 p14
// prints I-RWN'B, and the independently decrypted line reads I DON'T HAVE.
// Its genuine 13-rune FIRFUMFERENFE Vigenere with two preceding literal-F
// bypasses supplies five consecutive key symbols FIRFU; the original apostrophe
// consumes no GP rune or key position.
const originalLP1 = fs.readFileSync(path.join(root,'..','transcriptions','lp1_wulfic_canonical.txt'),'utf8').split('%')[12];
const solvedLP1 = fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8').replace(/\r\n/g,'\n');
const lp1At = originalLP1.indexOf('ᛁ-ᚱᚹᚾᛒ');
assert.ok(lp1At >= 0);
assert.ok(solvedLP1.split('### 14\n')[1].split('### 15\n')[0].includes("I DON'T HAVE"));
const priorLP1Runes = [...originalLP1.slice(0,lp1At)].filter(x=>rune.has(x)).length;
assert.equal(priorLP1Runes,145);
const originalCipherControl = [...'ᛁᚱᚹᚾᛒ'].map(r=>rune.get(r));
const knownPlainControl = pword('IDONT');
assert.deepEqual(originalCipherControl,[10,4,7,9,17]);
const requiredKeyControl = originalCipherControl.map((v,i)=>mod(v-knownPlainControl[i]));
const authenticKey = pword('FIRFUMFERENFE');
assert.deepEqual(requiredKeyControl,authenticKey.slice(0,5));
assert.equal((priorLP1Runes-2)%authenticKey.length,0); // Two literal-F skips.
console.log("SOLVED LP1 POSITIVE I-RWN'B = I DON'T: key FIRFU at zero phase after two literal-F skips; apostrophe preserves rune-only clock");

assert.equal(c.pages[56].indices[0],25);
assert.equal(mod(c.pages[56].indices[0]-(primes[0]-1)),24);
console.log('CONTROL authentic solved p56 begins AE ciphertext -> A plaintext');
const chapters=[0,729,1874,3603,5506,6527,7960,9640,12648];
const chapterStart=g=>chapters.filter(n=>n<=g).at(-1);
let direct=0;
for(const clock of ['book','page','chapter','word']){
 for(const key of ['prime','totient']){
  for(const sign of [-1,1]){
   const found=[];
   for(const s of sites){
    const at=clock==='book'?s.start:
     clock==='page'?s.start-prefix[s.page]:
     clock==='chapter'?s.start-chapterStart(s.start):0;
    for(const {w,plain} of s.words)if(plain.every((p,j)=>
     mod(s.cipher[j]+sign*mod(primes[at+j]-(key==='totient'?1:0)))===p
    ))found.push(s.page+':'+w);
   }
   direct+=found.length;
   console.log('DIRECT',clock,key,sign,JSON.stringify(found));
  }
 }
}
assert.equal(direct,0);
const statesBefore=(begin,end)=>{
 let states=new Set([0]),firstDead=null;
 for(let pos=begin;pos<end;pos++){
  const next=new Set();
  for(const n of states){
   const k=mod(primes[n]-1);
   if(all[pos]===0)next.add(n); // transparent original plaintext F
   if(mod(all[pos]-k)!==0)next.add(n+1); // only non-F may encrypt
  }
  states=next;
  if(!states.size){firstDead=pos;break;}
 }
 return {states,firstDead};
};
for(const clock of ['book','page','chapter']){
 for(const s of sites){
  const begin=clock==='book'?0:clock==='page'?prefix[s.page]:chapterStart(s.start);
  const {states,firstDead}=statesBefore(begin,s.start);
  const found=[];
  for(const {w,plain} of s.words){
   for(const n of states)if(plain.every((p,j)=>p===mod(s.cipher[j]-(primes[n+j]-1)))){
    found.push(w);break;
   }
  }
  console.log('LITERAL-F',JSON.stringify({clock,page:s.page,possibleKeyPointers:states.size,firstDead,wordMatches:found}));
  assert.equal(found.length,0);
 }
}
console.log('PASS four genuine apostrophe word shapes. No recovered unknown plaintext.');
