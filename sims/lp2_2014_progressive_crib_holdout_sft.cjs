'use strict';
/**
 * Source-locked May 24 2014 p34/p35 partial-crib counterexample.
 * Data: original IRC main log L188780 (CI source blob verified separately).
 * Node22 CJS; run from repository root; does not write files or search keys.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const pages=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8').split('%');
const index=new Map(corpus.runes.map((c,i)=>[c,i]));
const toVals=s=>[...s].filter(c=>index.has(c)).map(c=>index.get(c));
const display=a=>a.map(i=>corpus.translit[(i%29+29)%29]).join('-');
function findUnique(page,original){
  const s=pages[page],first=s.indexOf(original);
  assert(first>=0,'missing original word');
  assert.equal(s.lastIndexOf(original),first,'nonunique original word');
  const runePos=toVals(s.slice(0,first)).length;
  assert.deepEqual(corpus.pages[page].indices.slice(runePos,runePos+toVals(original).length),toVals(original),'transcription disagrees with original indexed runes');
  return runePos;
}
function check(page,word,plain,shifts,nextWord,nextPlain){
  const c=toVals(word),p=toVals(plain);
  assert.equal(c.length,p.length);
  const recovered=c.map((v,i)=>(v+shifts[i])%29);
  assert.deepEqual(recovered,p,'locked original 2014 crib does not forward-fit');
  const at=findUnique(page,word),next=findUnique(page,nextWord);
  assert.equal(next,at+c.length,'next printed word is not contiguous');
  // Natural continuation of the claimed strictly +1 modulo29 cipher; no encrypted F encountered.
  assert(!toVals(nextWord).includes(0),'an F ambiguity entered the heldout next word');
  const held=toVals(nextWord).map((v,i)=>(v+shifts.at(-1)+i+1)%29);
  assert.equal(display(held),nextPlain,'heldout original next word changed');
  console.log('p'+page+' source word='+display(c)+' @rune'+at+' inferred plaintext='+display(p)+
    ' selected shifts='+shifts.join(',')+' next-CT='+display(toVals(nextWord))+
    ' forced next-PT='+display(held)+' (historically unclaimed)');
  return {page,at,crib:display(p),holdout:display(held)};
}
const p34=check(34,'ᛟᛗᛋᛉ','ᛚᛖᛋᛋ',[27,28,0,1],'ᛏᚣᛉ','E-F-E');
const p35=check(35,'ᛈᛖᛏ','ᛁᛏᛋ',[26,27,28],'ᛄᛉᛝᛚ','J-S-D-D');
assert.equal((p34.at+1)%29,24);
assert.equal((p35.at+1)%29,21);
const len34=corpus.pages[34].indices.length;
const delta=(len34-p34.at+p35.at)%29;
console.log('p34->p35 continuous-rune position delta mod29='+delta+'; distinct claimed initial shift delta mod29=28');
const fCount=corpus.pages[34].indices.slice(p34.at).concat(corpus.pages[35].indices.slice(0,p35.at)).filter(v=>v===0).length;
console.log('Between historical crib starts: candidate ciphertext F count='+fCount+
 ', requiring exactly two of them to be literal unconsumed F for a +1 continuous key to match shifts at both starts.');
console.log('PASS: both source historical cribs fit by construction, but immediate untouched next words break uninterrupted progressive-key English. No unknown plaintext is authenticated.');
