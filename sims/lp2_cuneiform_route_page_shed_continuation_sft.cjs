'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const raw = fs.readFileSync('resources/lp2-transcription.txt','utf8').replace(/\r/g,'');
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));

const pageTexts = raw.split('%').map(s=>s.trim()).filter(Boolean);
assert.equal(pageTexts.length,57);
pageTexts.splice(50,0,'');
assert.equal(pageTexts.length,58);

function parsePage(text) {
  let runeCount=0, current=[], words=[];
  const finish=()=>{if(current.length){words.push(current.slice());current=[];}};
  for(const ch of text) {
    if(runeIndex.has(ch)){current.push(runeIndex.get(ch));runeCount++;}
    else if(ch==='/' || /\s/u.test(ch)) { /* printed line wrap */ }
    else finish();
  }
  finish();
  return {runeCount,words};
}
const pages=pageTexts.map(parsePage);
for(let p=0;p<58;p++){
  assert.equal(pages[p].runeCount,corpus.pages[p].runic_count,'page rune count p'+p);
  assert.deepEqual(pages[p].words.flat(),corpus.pages[p].indices,'page rune sequence p'+p);
}
function center(word){return word.length%2===1?word[Math.floor(word.length/2)]:null;}
function readPage(page){
  const words=pages[page].words;
  const centers=words.map(center).filter(x=>x!==null);
  return {
    page,wordCount:words.length,oddWordCount:centers.length,
    centerIndices:centers,
    centerText:centers.map(i=>corpus.translit[i]).join(''),
    centerSum:centers.reduce((a,b)=>a+b,0)
  };
}
const routeOrder=[45,34,49,37,57];
const results=routeOrder.map(readPage);
const byPage=new Map(results.map(x=>[x.page,x]));
const expected={
  45:{wordCount:64,oddWordCount:32,centerSum:471,centerText:'CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOH'},
  34:{wordCount:61,oddWordCount:31,centerSum:348,centerText:'NECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATH'},
  49:{wordCount:18,oddWordCount:6,centerSum:106,centerText:'IALMMXR'},
  37:{wordCount:53,oddWordCount:24,centerSum:362,centerText:'AEHNGITHEOUDJPTEEAAEOIGGJXYEA'},
  57:{wordCount:20,oddWordCount:7,centerSum:43,centerText:'ANFUWTHN'}
};
for(const [page,expect] of Object.entries(expected)){
  const got=byPage.get(Number(page));
  for(const [key,value] of Object.entries(expect)) assert.equal(got[key],value,'p'+page+' '+key);
}
const unknownOrder=[45,34,37];
const unknownText=unknownOrder.map(p=>byPage.get(p).centerText).join('');
const routeText=routeOrder.map(p=>byPage.get(p).centerText).join('');
assert.equal(unknownOrder.reduce((n,p)=>n+byPage.get(p).oddWordCount,0),87);
assert.equal(unknownText,
'CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOHNECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATHAEHNGITHEOUDJPTEEAAEOIGGJXYEA');
assert.equal(routeText,
'CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOHNECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATHIALMMXRAEHNGITHEOUDJPTEEAAEOIGGJXYEAANFUWTHN');

console.log(JSON.stringify({
  operation:'recursively strip first and last GP29 rune of each complete printed word; retain its single center rune iff word length is odd',
  pageOrder:routeOrder,
  pages:results,
  unknownEncryptedPages:[45,34,37],
  unknownCenterRuneCount:87,
  unknownCenterText:unknownText,
  completeRouteCenterText:routeText,
  decision:'fixed direct SHED continuation yields no coherent plaintext; do not add an unselected key or second transform'
},null,2));
