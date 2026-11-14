'use strict';
/**
 * Source-motivated LP2 word-local five-phase substitution exclusion.
 * A five-dot figure occurs on p7, p23, p56; original ciphertext has
 * 104/2105 within-word lag-five equalities. Could five independently
 * secret alphabet permutations repeat every five runes per printed word?
 *
 * Full unknown-page input, source-native English controls, page-specific
 * permutation positive control. No fitting, natural-language threshold,
 * or invented key, and no claim of decipherment.
 *
 * Reproduce: node sims/lp2_wordlocal_fivephase_secret_alphabet_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
/** @param {string} location @returns {string} */
function read(location){return fs.readFileSync(path.join(root,location),'utf8');}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alphabet=new Map(gp.runes.map((r,i)=>[r,i]));
const runePattern=new RegExp('['+gp.runes.join('')+']+','gu');
const transcription=read('resources/lp2-transcription.txt');
const allWords=(transcription.split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(runePattern)||[])
  .map(x=>Array.from(x,r=>alphabet.get(r)));
const actualPages=gp.pages.filter(x=>x.page<56&&x.indices.length>0);
const sourceIndices=actualPages.flatMap(x=>x.indices);
assert.equal(actualPages.length,55);
assert.equal(allWords.length,2896);
assert.equal(sourceIndices.length,12956);
assert.deepEqual(allWords.flat(),sourceIndices,'original pages and print-word register must agree');
const pageAtIndex=actualPages.flatMap(p=>Array(p.indices.length).fill(p.page));
const maxLength=Math.max(...allWords.map(w=>w.length));
assert.equal(maxLength,14);
const originalLengths=allWords.map(w=>w.length);

/**
 * Phase assignment advances within every original printed word, across
 * page wraps and through source-joined word continuations. A change of
 * physical page changes which of the 275 independent secret alphabets
 * is permitted. When byPage=false only five global alphabets are used.
 *
 * @param {number[][]} words
 * @param {boolean} byPage
 * @returns {{classes:number,n:number,pairs:number,hits:number,rate:number,phaseIoc:number[]}}
 */
function collisions(words,byPage){
  const bins=new Map();
  let absolute=0;
  for(const word of words){
    for(let i=0;i<word.length;i++){
      const phase=i%5;
      const label=byPage?5*pageAtIndex[absolute+i]+phase:phase;
      let count=bins.get(label);
      if(!count){count=new Uint32Array(29);bins.set(label,count);}
      const rune=word[i];
      assert(Number.isInteger(rune)&&rune>=0&&rune<29,'GP29 rune');
      count[rune]++;
    }
    absolute+=word.length;
  }
  assert.equal(absolute,sourceIndices.length,'identical word length plan');
  let totalPairs=0,totalHits=0;
  const globalPhases=Array.from({length:5},()=>new Uint32Array(29));
  for(const [key,count] of bins){
    let total=0,hits=0;
    for(let symbol=0;symbol<29;symbol++){
      const n=count[symbol];
      total+=n;
      hits+=n*(n-1)/2;
      globalPhases[key%5][symbol]+=n;
    }
    totalPairs+=total*(total-1)/2;
    totalHits+=hits;
  }
  const phaseIoc=globalPhases.map(row=>{
    const n=row.reduce((sum,value)=>sum+value,0);
    return row.reduce((sum,value)=>sum+value*(value-1)/2,0)/(n*(n-1)/2);
  });
  return {classes:bins.size,n:absolute,pairs:totalPairs,hits:totalHits,
    rate:totalHits/totalPairs,phaseIoc};
}
/** @param {number} initial @returns {()=>number} */
function random(initial){
  let state=initial>>>0;
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
}
/** @param {string} file @returns {number[][][]} */
function buckets(file){
  const byLength=Array.from({length:maxLength+1},()=>[]);
  for(const plain of read(file).match(/[A-Za-z]+/g)||[]){
    const native=encodeSourceNativeGP(plain);
    if(native.length<=maxLength)byLength[native.length].push(native);
  }
  for(let i=1;i<=maxLength;i++){
    if(originalLengths.includes(i))assert(byLength[i].length>0,
      'Source control missing printed rune length '+i);
  }
  return byLength;
}
/** @param {number[][][]} pool @param {()=>number} rnd @returns {number[][]} */
function draw(pool,rnd){
  return originalLengths.map(length=>{
    const compatible=pool[length];
    return compatible[Math.floor(rnd()*compatible.length)];
  });
}
const actualGlobal=collisions(allWords,false);
const actualPage=collisions(allWords,true);
assert.deepEqual([actualGlobal.classes,actualGlobal.n,actualGlobal.pairs,actualGlobal.hits],
  [5,12956,19001504,653650]);
assert.deepEqual([actualPage.classes,actualPage.n,actualPage.pairs,actualPage.hits],
  [275,12956,358333,12399]);
const corpora=[
  {name:'Shakespeare',file:'resources/control/shakespeare_first300k.txt',seed:0x3301beef},
  {name:'Gibran',file:'resources/control/gibran_prophet_58585.txt',seed:0x3301bad0},
  {name:'Emerson',file:'resources/control/emerson_essays_2944.txt',seed:0x3301feec}
];
const summary=[];
let examplePlain=null;
for(const corpus of corpora){
  const pool=buckets(corpus.file),rnd=random(corpus.seed);
  const pageRates=[],globalRates=[];
  for(let trial=0;trial<250;trial++){
    const sample=draw(pool,rnd);
    if(trial===0 && examplePlain===null)examplePlain=sample;
    pageRates.push(collisions(sample,true).rate);
    globalRates.push(collisions(sample,false).rate);
  }
  assert(pageRates.every(rate=>rate>actualPage.rate),
    'native word-length matched phase-secret page alphabet controls');
  assert(globalRates.every(rate=>rate>actualGlobal.rate),
    'native word-length matched phase-secret global alphabet controls');
  pageRates.sort((a,b)=>a-b);globalRates.sort((a,b)=>a-b);
  summary.push({name:corpus.name,samples:pageRates.length,
    seed:corpus.seed,originalMatchedLengths:originalLengths.length,
    minPageRate:pageRates[0],medianPageRate:pageRates[125],maxPageRate:pageRates.at(-1),
    minGlobalRate:globalRates[0],medianGlobalRate:globalRates[125],
    maxGlobalRate:globalRates.at(-1),samplesAtOrBelowOriginal:0});
}
assert(examplePlain!==null);
/** Arbitrary per-page/phase hidden permutations with exact inversion. */
const rnd=random(0x5eed2026);
const maps=Array.from({length:56*5},()=> {
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=Math.floor(rnd()*(i+1));
    [p[i],p[j]]=[p[j],p[i]];
  }
  assert.equal(new Set(p).size,29);
  return p;
});
let at=0;
const cipher=[];
at=0;
for(const word of examplePlain){
  const enc=word.map((v,i)=>maps[5*pageAtIndex[at+i]+i%5][v]);
  const dec=enc.map((v,i)=>maps[5*pageAtIndex[at+i]+i%5].indexOf(v));
  assert.deepEqual(dec,word);
  cipher.push(enc);
  at+=word.length;
}
assert.equal(at,12956);
const plantBefore=collisions(examplePlain,true);
const plantAfter=collisions(cipher,true);
assert.deepEqual([plantAfter.pairs,plantAfter.hits],
  [plantBefore.pairs,plantBefore.hits],
  'all 275 independent hidden phase alphabet permutations preserve equality');
console.log(JSON.stringify({
  claim:'conditional exclusion of arbitrary *fixed* five-phase GP29 permutation alphabets per page or shared across all pages',
  source:{originalWords:2896,originalRunes:12956,
    eligibleWithinWordLag5Pairs:2105,observedWithinWordLag5Equal:104,
    originalGlobal:actualGlobal,originalPerPage:actualPage},
  sourceNativeControls:summary,
  secretAlphabetPositiveControl:{keys:275,hiddenArbitraryPermutations:true,
    restoredNativeRunes:12956,preCipherHits:plantBefore.hits,
    postCipherHits:plantAfter.hits},
  importantLimit:'The test assumes GP-native English word lengths and each phase alphabet is fixed within its page; it does not test word-specific random alphabets, varying state, phase-changing resets, intermediate encodings or nonprose plaintext.',
  unknownPlaintextRecovered:0
},null,2));
