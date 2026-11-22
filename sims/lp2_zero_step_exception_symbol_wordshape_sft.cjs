'use strict';

/**
 * All 29 possible GP glyphs as the literal "zero predecessor difference"
 * plaintext escape in a fully reversible 28-nonzero-step cipher.
 *
 * A word with zero deltas at rune positions 5,11 must have that reserved
 * GP glyph at exactly those positions, regardless of any unknown key stream.
 *
 * This is an original-input necessary-condition screen for a narrowly
 * specified single-symbol exception model, not a decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const original = gp.pages.filter(p=>p.page<=55&&p.indices.length)
  .flatMap(p=>p.indices);
const parsed = parseLP2Words(read('resources/lp2-transcription.txt'));
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.crossPageWords,32);
assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(r=>
  gp.runes.indexOf(r))),original);
const heads = new Set();
let pageOffset=0;
for(const page of gp.pages.filter(p=>p.page<=55&&p.indices.length)){
  heads.add(pageOffset);
  pageOffset+=page.indices.length;
}
assert.equal(pageOffset,12956);
const wordMask=[];
const zeroEvents=[];
let offset=0;
for(let k=0;k<parsed.words.length;k++){
  const word=parsed.words[k];
  const positions=[];
  for(let j=0;j<word.length;j++){
    const i=offset+j;
    if(i>0&&!heads.has(i)&&original[i]===original[i-1]){
      positions.push(j);
      zeroEvents.push({word:k,runeIndex:i,runeWithinWord:j});
    }
  }
  if(positions.length){
    wordMask.push({word:k,length:word.length,start:offset,
      positions,signature:word.length+'|'+positions.join(',')});
  }
  offset+=word.length;
}
assert.equal(offset,12956);
assert.equal(zeroEvents.length,86);
assert.equal(wordMask.length,85);
assert.equal(wordMask.filter(x=>x.positions.length>1).length,1);
const double=wordMask.find(x=>x.positions.length>1);
assert.equal(double.word,1476);
assert.equal(double.length,12);
assert.equal(double.start,6606);
assert.deepEqual(double.positions,[5,11]);
assert(wordMask.every(x=>x.length>1));
assert.deepEqual(original.slice(double.start,double.start+12),
  [12,4,9,15,3,3,5,24,18,26,18,18]);

// Source-calibrated English-GP spellings have independently matched 181
// consecutive full solved-LP1 words and solved LP2 p57. Do not replace
// rune words by arbitrary digraph splits.
const lexicon=new Set();
for(const file of ['resources/control/english_wordfreq_textblob.txt',
  'resources/control/gibran_prophet_58585.txt']){
  for(const m of read(file).matchAll(/[A-Za-z]+/g)){
    lexicon.add(m[0].toUpperCase());
  }
}
const witness=Array.from({length:29},()=>new Map());
const length12words=[];
for(const word of lexicon){
  const encoded=encodeSourceNativeGP(word);
  if(encoded.length===12)length12words.push(word);
  for(let e=0;e<29;e++){
    const positions=[];
    for(let j=0;j<encoded.length;j++)if(encoded[j]===e)positions.push(j);
    if(positions.length){
      const signature=encoded.length+'|'+positions.join(',');
      if(!witness[e].has(signature))witness[e].set(signature,word);
    }
  }
}
assert.equal(length12words.length,785);
// Each original zero-mask word is an exact semantic equality constraint,
// independent of secret GP substitution, phase, initial state or order.
const originalMaskFit=witness.map((map,e)=>{
  const missed=wordMask.filter(x=>!map.has(x.signature));
  return {glyph:gp.translit[e],glyphIndex:e,
    compatible:wordMask.length-missed.length,missed:missed.length,
    doubleWord:map.get(double.signature)||null,
    failedExamples:missed.slice(0,3).map(x=>({word:x.word,
      runeLength:x.length,zeroPositions:x.positions}))};
});
const fullMask=originalMaskFit.filter(x=>x.compatible===85)
  .map(x=>x.glyph);
assert.deepEqual(fullMask,['C','N','S','T','E','L','D','A']);
const ea=originalMaskFit[28];
assert.equal(ea.compatible,80);
assert.equal(ea.doubleWord,null);
for(const word of length12words){
  const encoded=encodeSourceNativeGP(word);
  assert.notEqual(encoded[11],28);
  assert(encoded.filter(x=>x===28).length<2);
}
// Calibrate prospective exceptional-symbol frequency on ORIGINAL solved
// stage runes rather than English letter proportions from a new corpus.
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const begin=lp1.indexOf('ᚦᛖ-ᛚᚩᛋᛋ');
const end=lp1.indexOf('\n$\n%\n',begin);
assert(begin>=0&&end>begin);
const source=lp1.slice(begin,end).replace(/\/\n%\n/g,'')
  .replace(/\/\n/g,'').replace(/\n/g,'');
const regexp=new RegExp('['+gp.runes.join('')+']+','gu');
const sourceWords=source.match(regexp)||[];
assert.equal(sourceWords.length,181);
const clearSources=sourceWords.flatMap(w=>[...w].map(c=>
  gp.runes.indexOf(c)));
assert.equal(clearSources.length,755);
const clear57=gp.pages.find(p=>p.page===57).indices;
assert.equal(clear57.length,95);
const clear=clearSources.concat(clear57);
assert.equal(clear.length,850);
const eaWordInitial=sourceWords.filter(w=>w[0]===gp.runes[28]).length;
assert.equal(eaWordInitial,0);
const originalDenominator=original.length-heads.size;
assert.equal(originalDenominator,12901);
const observed=zeroEvents.length;
function logChoose(n,k){
  if(k<0||k>n)return -Infinity;
  let s=0;
  for(let i=1;i<=k;i++)s+=Math.log(n-k+i)-Math.log(i);
  return s;
}
function fisherTwoSided(a,b,c,d){
  // Exact conditional 2x2 two-sided by hypergeometric probability ordering.
  const n=a+b+c+d,k=a+c,m=a+b;
  const lo=Math.max(0,m-(n-k)),hi=Math.min(k,m);
  const logp=x=>logChoose(k,x)+logChoose(n-k,m-x)-logChoose(n,m);
  const threshold=logp(a)+1e-10;
  let total=0;
  for(let x=lo;x<=hi;x++)if(logp(x)<=threshold)
    total+=Math.exp(logp(x));
  return Math.min(1,total);
}
const profiles=originalMaskFit.map(x=>{
  const nativeHits=clear.reduce((n,r)=>n+Number(r===x.glyphIndex),0);
  return {...x,clearHits:nativeHits,clearTotal:850,
    clearRate:nativeHits/850,
    originalZeroRate:observed/originalDenominator,
    predictedZeroCountAtClearRate:originalDenominator*nativeHits/850,
    fisherTwoSided:fisherTwoSided(nativeHits,850-nativeHits,
      observed,originalDenominator-observed)};
});
assert.equal(profiles[28].clearHits,6);
assert.equal(profiles[28].predictedZeroCountAtClearRate,
  12901*6/850);
assert(profiles[28].fisherTwoSided>.75);
assert(profiles.filter(x=>x.compatible===85)
  .every(x=>x.fisherTwoSided<0.001));
console.log(JSON.stringify({
  source:'Original 12956-runic LP2, authentic 2896 words, 181 solved LP1 words plus 95 solved LP2 runes',
  original:{runes:original.length,originalZeroSteps:observed,
    zeroStepOpportunities:originalDenominator,
    wordsWithZeroSteps:wordMask.length,oneRuneWords:83,
    doubleZeroWord:double},
  lexicon:{uniqueWords:lexicon.size,gpLength12Words:length12words.length},
  nativeClear:{lp1Runes:755,lp1Words:181,p57Runes:95,
    GPFinalEAWordInitialInLP1:eaWordInitial,
    totalClearRunes:clear.length},
  all29SecretExceptionCandidates:profiles,
  verdict:'Eight common GP letters can match 85 original zero-event word masks but all disagree with independently solved frequency; rare GP EA matches rate but fails 5 original word masks, including original 12-rune word1476. This is conditional on native-GP word-preserving English and the finite dictionary, not a proof about all ciphers.'
},null,2));
