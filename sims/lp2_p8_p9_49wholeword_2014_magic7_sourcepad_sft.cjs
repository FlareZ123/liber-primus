'use strict';

/**
 * Source-native 49 whole-word GP29 additive receiver keyed once per word
 * by Cicada2014 original seven-square rows.
 * Run on Windows Node22:
 * node sims/lp2_p8_p9_49wholeword_2014_magic7_sourcepad_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} x */
const read=x=>fs.readFileSync(path.join(ROOT,x),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lines=read('resources/lp2-transcription.txt').split('%');
const runeMap=new Map(gp.runes.map((v,i)=>[v,i]));
const words=s=>s.split(/[-.&$§]/u)
  .map(w=>[...w].filter(r=>runeMap.has(r)).map(r=>runeMap.get(r)))
  .filter(w=>w.length);
const current=words(lines[8]);
const next=words(lines[9]);
assert.equal(current.length,51);
assert.deepEqual(current.slice(0,2).map(v=>v.length),[4,8]);
assert.equal(current.at(-1).length,1);
assert.equal(next[0].length,5);
const plainWords=current.slice(2,-1).concat([current.at(-1).concat(next[0])]);
assert.equal(plainWords.length,49);
assert.equal(plainWords.flat().length,248);
assert.deepEqual(plainWords.flat(),gp.pages[8].indices.slice(12)
  .concat(gp.pages[9].indices.slice(0,5)));
const matrices=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/);
const magic=matrices[1].match(/\d+/g).map(Number);
assert.equal(magic.length,49);
assert.deepEqual(magic.slice(0,7),[7,375,236,190,27,17,181]);
/** @param {number} v */
const mod=v=>((v%29)+29)%29;
const translit=arr=>arr.map(i=>gp.translit[i]).join('');
const gpAlphabet=gp.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word */
function encode(word){
  const str=word.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<str.length;){
    if(str.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(str.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const found=gpAlphabet.find(x=>str.startsWith(x.token,i));
    assert.ok(found);
    out.push(found.index);
    i+=found.token.length;
  }
  return out;
}
const lexByLen=new Map();
/** @type {Set<string>} */
const dictionary=new Set();
for(const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)){
  const match=/^([a-z]+) (\d+)$/.exec(line);
  if(!match)continue;
  const encoded=encode(match[1]);
  dictionary.add(encoded.join(','));
  if(!lexByLen.has(encoded.length))lexByLen.set(encoded.length,[]);
  lexByLen.get(encoded.length).push({
    word:match[1],digits:encoded,freq:Number(match[2])
  });
}
assert.equal(dictionary.size>10000,true);
const plantWords=plainWords.map(w=>lexByLen.get(w.length)
  .reduce((a,b)=>a.freq>b.freq?a:b).digits);
assert.deepEqual(plantWords.map(w=>w.length),
  plainWords.map(w=>w.length));
/** @param {number[][]} rows */
function ioc(rows){
  const freq=Array(29).fill(0),arr=rows.flat();
  for(const value of arr)freq[value]++;
  return freq.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
const originalIoC=ioc(plainWords);
const results=[];
for(const orientation of ['row-major','column-major']){
  const key=magic.map((_,i)=>magic[orientation==='row-major'
    ?i:(i%7)*7+Math.floor(i/7)]);
  for(const sign of [-1,1]){
    const decoded=plainWords.map((word,index)=>word.map(r=>mod(r+sign*key[index])));
    const nativeMatches=decoded.filter(w=>dictionary.has(w.join(',')));
    const cipherPlant=plantWords.map((w,index)=>
      w.map(v=>mod(v-sign*key[index])));
    const recovered=cipherPlant.map((w,index)=>
      w.map(v=>mod(v+sign*key[index])));
    assert.deepEqual(recovered,plantWords);
    assert.ok(nativeMatches.length<=3);
    results.push({
      orientation,sign,
      nativeDictionaryWordCount:nativeMatches.length,
      originalIoC:ioc(decoded),
      firstTenGPWords:decoded.slice(0,10).map(translit),
      plantedExact:'248/248'
    });
  }
}
assert.deepEqual(results.map(x=>x.nativeDictionaryWordCount),[3,0,2,0]);
console.log(JSON.stringify({
  source:'genuine 49 complete black words crossing p8-p9 seam and real Cicada2014 7x7',
  originalRuneLength:248,originalWholeWords:49,
  originalIoC,
  exactFixedKeyReceivers:results,
  wordBoundaries:'p8 final 1 + p9 initial 5 = one six-rune word',
  plaintextRecovered:false
},null,2));
