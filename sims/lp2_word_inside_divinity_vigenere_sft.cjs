'use strict';

/**
 * Single-file, exact source-word-interior DIVINITY-key test.
 *
 * Clear LP2 PARABLE says to shed circumferences and find DIVINITY within.
 * Retain word shell unchanged, subtract/add historical solved LP1 DIVINITY
 * GP29 Vigenere key only on inner runes, resetting at the first inner rune.
 * Printed words and all 32 page carries remain in original order.
 *
 * Node.js 22 / Windows 11 / CommonJS / read-only.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const map=new Map(gp.runes.map((r,i)=>[r,i]));
const ordered=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const KEY=[23,10,1,10,9,10,16,26]; // GP29 transliteration DIUINITY
assert.equal(KEY.map(i=>gp.translit[i]).join(''),'DIUINITY');

/** @param {string} text @returns {number[]} */
function gpWord(text) {
  const s=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const hit=ordered.find(k=>s.startsWith(k.s,i));
    if(hit){out.push(hit.i);i+=hit.s.length;}else i++;
  }
  return out;
}

/**
 * Original rune word list. Physical page/line breaks preserve carried words.
 * @returns {Array<{word:number[],page:number}>}
 */
function sourceWords() {
  const words=[];let word=[],page=0,startPage=0;
  const finish=()=>{if(word.length)words.push({word,page:startPage});word=[];};
  for(const ch of raw){
    if(map.has(ch)){
      if(!word.length)startPage=page;
      word.push(map.get(ch));
    } else if(ch==='%')page++;
    else if(ch==='/'||/\s/u.test(ch)){}
    else finish();
  }
  finish();
  return words;
}
const words=sourceWords();
assert.equal(words.length,2896);
assert.equal(words.reduce((n,x)=>n+x.word.length,0),12956);
assert.equal(words.reduce((n,x)=>n+Math.max(0,x.word.length-2),0),7247);
const dictionary=Array.from({length:30},()=>[]);
for(const token of read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g)||[]){
  const word=gpWord(token);
  if(word.length&&word.length<dictionary.length)dictionary[word.length].push(word);
}
const model=new Float64Array(29*29).fill(2);
const totals=new Float64Array(29).fill(58);
const reference=(read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
for(let i=1;i<reference.length;i++){
  model[29*reference[i-1]+reference[i]]++;
  totals[reference[i-1]]++;
}

/**
 * Apply the sole historical GP29 keyword to interior positions in place.
 * Word starts, word ends, singleton words and boundary tape are unchanged.
 * @param {number[]} word
 * @param {number} direction
 * @returns {number[]}
 */
function keyed(word,direction) {
  return word.map((c,j)=>j>0&&j<word.length-1?
    (c+direction*KEY[(j-1)%KEY.length]+87)%29:c);
}
/**
 * Score successive decoded interior pairs within each source word only.
 * @param {Array<{word:number[],page:number}>} book
 * @returns {{pairs:number,interior:number,logBigram:number,ioc:number}}
 */
function measure(book) {
  let log=0,pairs=0;const histogram=new Int32Array(29);
  for(const {word} of book)if(word.length>2){
    for(let i=1;i<word.length-1;i++){
      histogram[word[i]]++;
      if(i>1){
        log+=Math.log(model[29*word[i-1]+word[i]]/totals[word[i-1]]);
        pairs++;
      }
    }
  }
  const interior=histogram.reduce((a,b)=>a+b,0);
  return {pairs,interior,logBigram:log/pairs,
    ioc:histogram.reduce((a,b)=>a+b*(b-1),0)/(interior*(interior-1))};
}
const cipherMinus=words.map(x=>({...x,word:keyed(x.word,-1)}));
const cipherPlus=words.map(x=>({...x,word:keyed(x.word,1)}));
let seed=0x3301aabb;
const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;};
const native=words.map(({word,page})=>({page,
  word:dictionary[word.length][Math.floor(random()*dictionary[word.length].length)]}));
const planted=native.map(({word,page})=>({page,word:keyed(word,1)}));
const recovered=planted.map(({word,page})=>({page,word:keyed(word,-1)}));
assert.deepEqual(recovered,native);
const result={status:'bounded source-key/interior negative',
  sourceWords:words.length,sourceRunes:12956,interiorRunes:7247,
  sourceSelector:'PARABLE shed circumferences; historical DIVINITY key',
  nativeControl:measure(native),positiveControl:measure(recovered),
  originalMinus:measure(cipherMinus),originalPlus:measure(cipherPlus),
  untouchedP0to2:measure(cipherMinus.filter(x=>x.page<=2)),
  untouchedP40to53:measure(cipherMinus.filter(x=>x.page>=40&&x.page<=53))};
assert.equal(result.originalMinus.pairs,4882);
assert.ok(result.originalMinus.logBigram<-4.5);
assert.ok(result.originalPlus.logBigram<-4.5);
assert.ok(result.positiveControl.logBigram>-3);
console.log(JSON.stringify(result,null,2));
