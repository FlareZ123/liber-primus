'use strict';
/**
 * Corrected 75-body p55 inverse from source-visible p57 20-word edge shave.
 * The p55 first NG completes a p54 word; it is not part of the body.
 * p57 has one 7-rune PARABLE title plus 19 printed body words, all 95 runes.
 * Remove exactly one end rune from each of 20 words: 95-20=75.
 * Freeze both original left/right edge reads; test only native historic
 * GP29 Vigenere +/- without phase search, F exceptions or extra layers.
 *
 * Run: node sims/p55_p57_title20_shed75_source_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {plaintextWords}=require('./authentic_decryption_regression.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const p55=db.pages[55].indices,p57=db.pages[57].indices;
assert.equal(p55.length,76);
assert.equal(p55[0],21,'p55[0] is the p54 NG word continuation');
assert.equal(db.translit[p55[0]],'NG');
const body=p55.slice(1);
assert.equal(body.length,75);
const chunks=transcript.split(/%\s*\n/);
const finalPage=chunks.at(-1).replace(/\/\s*\n/g,'').replace(/\n/g,'');
const runePattern=new RegExp('['+db.runes.join('')+']+','gu');
const words=[...finalPage.matchAll(runePattern)]
  .map(match=>[...match[0]].map(rune=>db.runes.indexOf(rune)));
assert.equal(words.length,20);
assert.deepEqual(words.map(w=>w.length),
  [7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]);
assert.deepEqual(words.flat(),p57);
assert.equal(words.reduce((sum,w)=>sum+w.length,0),95);
/** @param {number} v @returns {number} */
const mod=v=>(v%29+29)%29;
/** @param {number[]} seq */
function ioc(seq){
  const f=Array(29).fill(0);
  for(const v of seq)f[v]++;
  return f.reduce((sum,n)=>sum+n*(n-1),0)/(seq.length*(seq.length-1));
}
const ref=plaintextWords(
  read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/^#.*$/gm,'')
).flat();
let nativeMin=Infinity,nativeCount=0;
for(let i=0;i+75<=ref.length;i++){
  nativeMin=Math.min(nativeMin,ioc(ref.slice(i,i+75)));
  nativeCount++;
}
assert.equal(nativeCount,3462);
assert(Math.abs(nativeMin-0.04540540540540541)<1e-11);
const bodyWordLengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(bodyWordLengths.reduce((s,n)=>s+n,0),75);
/** @param {number[]} runes */
const translit=runes=>runes.map(i=>db.translit[i]).join('');
/** @param {number[]} runes */
function splitBodyWords(runes){
  let offset=0;
  return bodyWordLengths.map(len=>{
    const word=translit(runes.slice(offset,offset+len));
    offset+=len;
    return word;
  });
}
const candidate=[],literalFits=[];
for(const edge of ['first','last']){
  const key=words.flatMap(w=>
    edge==='first'?w.slice(1):w.slice(0,-1));
  assert.equal(key.length,75);
  // Fixed-alphabet substitution plus any transposition preserves
  // distinct rune count; original has 25, both shaved sources fewer.
  literalFits.push({edge,distinctKey:new Set(key).size,
    distinctCipher:new Set(body).size,monoalphabeticPossible:
    new Set(key).size===new Set(body).size});
  for(const sign of [-1,1]){
    const decoded=body.map((c,i)=>mod(c+sign*key[i]));
    const restored=decoded.map((p,i)=>mod(p-sign*key[i]));
    assert.deepEqual(restored,body);
    const plantedPlain=p57.slice(0,75);
    const plantedCipher=plantedPlain.map((p,i)=>mod(p-sign*key[i]));
    assert.deepEqual(plantedCipher.map((c,i)=>mod(c+sign*key[i])),plantedPlain);
    candidate.push({edge,sign,known75:decoded.length,
      ioc:ioc(decoded),belowNativeMin:ioc(decoded)<nativeMin,
      plaintextWords:splitBodyWords(decoded),plaintextRunes:translit(decoded),
      exactOriginalReencryption:true,exactNativePlant:true});
  }
}
assert.deepEqual(literalFits.map(x=>x.distinctKey),[21,20]);
assert.equal(literalFits.every(x=>x.monoalphabeticPossible===false),true);
assert.deepEqual(candidate.map(x=>Number(x.ioc.toFixed(9))),
  [0.039639640,0.034234234,0.033513514,0.038198198]);
assert(candidate.every(x=>x.belowNativeMin));
console.log(JSON.stringify({
  source:{p55Body:75,p55Inherited:'NG',p57Words:20,p57Runes:95,
    strippedLength:75,nativeControlWindows:nativeCount,nativeMinIoC:nativeMin,
    p55BodyOriginalIoC:ioc(body)},
  literalFits,candidate,decision:
  'These exact corrected 75-rune source-edge GP29 inverses do not yield readable prose or a verified key; no arbitrary phase or retuning licensed.'
},null,2));
