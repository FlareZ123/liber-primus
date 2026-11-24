'use strict';
/**
 * Exact native-control homophone obstruction for a deterministic sound-only
 * register. No unknown ciphertext fitting; any phone-to-rune word function
 * (even variable-length and non-injective) must assign one output per input.
 * CMUdict 1.1.3 pronunciations independently extracted with Python:
 *   import cmudict; print({w:cmudict.dict()[w] for w in [...]})
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const labels = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const fixture = [
 ['TO','to',['T UW1','T IH0','T AH0']],
 ['TOO','too',['T UW1']],
 ['TWO','two',['T UW1']],
 ['THERE','there',['DH EH1 R']],
 ['THEIR','their',['DH EH1 R']],
 ['NO','no',['N OW1']],
 ['CNOW','know',['N OW1']],
 ['FOR','for',['F AO1 R','F ER0','F R ER0']],
 ['FOUR','four',['F AO1 R']],
];
/** @param {{runes:string[],sections:{name:string,source_text:string}[]}} native */
function run(native) {
 const records = fixture.map(([gp,english,phones])=>({gp,english,phones,occurrences:[]}));
 const lookup=new Map(records.map(x=>[x.gp,x]));
 const runeIndex=new Map(native.runes.map((c,i)=>[c,i]));
 for(const s of native.sections) {
  const words=s.source_text.match(/[\u16a0-\u16ff]+/gu)||[];
  words.forEach((word,wordIndex)=>{
   const indices=Array.from(word,c=>runeIndex.get(c));
   assert(indices.every(Number.isInteger),'unexpected rune');
   const gp=indices.map(i=>labels[i]).join('');
   if(lookup.has(gp))lookup.get(gp).occurrences.push({section:s.name,wordIndex,word,indices});
  });
 }
 assert(records.every(x=>x.occurrences.length>0));
 const groups=new Map();
 for(const rec of records){const k=rec.phones[0];if(!groups.has(k))groups.set(k,[]);groups.get(k).push(rec);}
 const results=[...groups].map(([phones,words])=>{
  const distinct=new Set(words.map(x=>JSON.stringify(x.occurrences[0].indices)));
  assert.equal(distinct.size,words.length);
  const all=words.reduce((n,x)=>n+x.occurrences.length,0);
  const best=Math.max(...words.map(x=>x.occurrences.length));
  const forced=words.filter(x=>x.phones.length===1);
  const nForced=forced.reduce((n,x)=>n+x.occurrences.length,0);
  return {phones,words:words.map(x=>({gp:x.gp,english:x.english,count:x.occurrences.length,indices:x.occurrences[0].indices,variants:x.phones,first:x.occurrences[0]})),all,best,minErrors:all-best,variantIndependentMinErrors:nForced-Math.max(0,...forced.map(x=>x.occurrences.length))};
 });
 const total=results.reduce((n,x)=>n+x.all,0);
 const minErrors=results.reduce((n,x)=>n+x.minErrors,0);
 const variantIndependentMinErrors=results.reduce((n,x)=>n+x.variantIndependentMinErrors,0);
 assert.equal(results.length,4);assert.equal(total,40);assert.equal(minErrors,6);assert.equal(variantIndependentMinErrors,4);
 return {source:'relikd-solved-gp29-native-v1.json',dictionary:'cmudict 1.1.3; stress retained',groups:results,total,minErrors,variantIndependentMinErrors,decision:'No deterministic pronunciation-only word encoder can exactly reproduce the native control spellings. Even arbitrary per-word selection among CMU variants cannot repair the singleton-pronunciation contradictions. Orthographic or contextual side information, or a genuinely different unknown-page register, remains possible.'};
}
if(require.main===module){
 const input=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
 console.log(JSON.stringify(run(input),null,2));
}
module.exports=run;
