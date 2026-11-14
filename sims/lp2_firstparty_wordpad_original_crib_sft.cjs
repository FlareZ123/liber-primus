'use strict';
/**
 * Source-first candidate unknown-page plaintext: one inserted ciphertext rune
 * per word maximum, in preserved printed order, independently published text.
 * Control: untouched genuine p57 and synthetic alternate-word +1 word lengths.
 * Windows 11: node sims/lp2_firstparty_wordpad_original_crib_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {latinWords,originalWords}=require('./lp2_original_wordlength_crib_sft.cjs');
const {plusOneCribs}=require('./lp2_blake_2012_heaven_hell_original_crib_sft.cjs');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8').replace(/\r\n?/g,'\n');
const lp1=read('resources/liber-primus/lp1-plaintext-reference.txt').split(/(?=^### [0-9]+$)/m)
 .filter(p=>/^### (?:[1-9]|1[0-6])\n/.test(p)).map(p=>p.replace(/^### \d+\n/,'')
 .replace(/^#.*$/gm,'').replace(/^\[.*\]$/gm,'')).join('\n');
const original=originalWords(read('resources/liber-primus/lp2-transcription.txt'));
const unknown=original.filter(w=>w.page<=55);
const knownP57=original.filter(w=>w.page===57);
const textP57=latinWords(read('resources/liber-primus/lp1-plaintext-reference.txt').split('### 57\n')[1]);
assert.equal(unknown.length,2896);
assert.equal(unknown.reduce((s,w)=>s+w.n,0),12956);
assert.deepEqual(knownP57.map(w=>w.n),textP57.map(w=>w.n));
const synthetic=knownP57.map((w,i)=>({...w,n:w.n+(i%2)}));
assert.equal(plusOneCribs(synthetic,textP57).longest,20);
const selected=[
 {id:'solved-lp1-authored-manuscript',source:'resources/liber-primus/lp1-plaintext-reference.txt',content:lp1},
 ...['I','II','III'].map(id=>({id:'2013-original-bookcode-chapter-'+id,
  source:'resources/external/2013-liber-al-bookcode-'+id+'.txt',
  content:read('resources/external/2013-liber-al-bookcode-'+id+'.txt')}))
];
const out=[];
for(const x of selected){
 const words=latinWords(x.content);
 const result=plusOneCribs(unknown,words);
 out.push({id:x.id,source:x.source,sourceWords:words.length,
  eightWordSeedHits:result.eightWordSeedHits,longest:result.longest,
  atLeast24:result.atLeast24,topFive:result.best.slice(0,5)});
}
assert.equal(out[0].sourceWords,751);
assert.deepEqual(out.slice(1).map(x=>x.sourceWords),[1897,1968,2002]);
const qualifying=out.filter(x=>x.atLeast24>0);
console.log(JSON.stringify({
 hypothesis:'At most one extraneous ciphertext rune per authentic printed word, native GP29 word length, uninterrupted source word order',
 controls:'20 exact solved-p57 word lengths recovered under ten synthetic +1 inserts',
 unknown:{words:2896,runes:12956,physicalPages:'p0-p55 excluding numeric p50'},
 sources:out,qualifyingSourceCount:qualifying.length,
 conclusion:qualifying.length?'Inspect each >=24-word original-text crib independently for cipher and re-encryption':'None of the four authentic source-text candidates supplies a >=24 word-length crib even with one inserted rune per printed word'
},null,2));
