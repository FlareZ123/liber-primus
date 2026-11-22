'use strict';

/**
 * Source-constrained p0–2 158=2x79 original-word Vigenere gate.
 *
 * Hypothesis: each of the 79 original word positions has one unknown GP29
 * Caesar offset, and the identical offset repeats at the corresponding
 * word in the second 79-word half. Every rune in a word shares its key.
 *
 * No guesses about keys or unknown plaintext are input. Use fixed English
 * reference GP rune-word inventory from previously preserved source
 * corpora, and test all 29 shifts for each *paired* original word.
 * A successful joint lexicon fit would enable actual plaintext recovery.
 *
 * Windows Node22: node sims/lp2_p0_79word_repeated_caesar_lexicon_sft.cjs
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'),3)
  .words.map(w=>[...w.runes].map(r=>runeToIndex.get(r)));
const chapter=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(words.length,158);
assert.equal(chapter.length,729);
assert.equal(chapter[364],21);
assert.equal(corpus.prime[chapter[364]],79);
assert.equal(corpus.pages[0].indices.length-13,249);

/** @param {number[]} word @returns {string} */
const key=word=>word.join(',');
/** @param {number[]} word @param {number} shift @returns {number[]} */
const dec=(word,shift)=>word.map(x=>(x-shift+29)%29);
const sources=[
  'resources/liber-primus/lp1-plaintext-reference.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const vocabulary=new Map();
for(const file of sources) {
  const sourceWords=new Set((read(file).toUpperCase().match(/[A-Z]{2,}/g)||[]));
  for(const native of sourceWords) {
    const encoded=encodeSourceNativeGP(native);
    if(encoded.length>0&&encoded.length<=24)vocabulary.set(key(encoded),encoded);
  }
}
const dictionary=new Set(vocabulary.keys());
const byLength=new Map();
for(const word of vocabulary.values()) {
  if(!byLength.has(word.length))byLength.set(word.length,[]);
  byLength.get(word.length).push(word);
}
for(const word of words)assert.ok((byLength.get(word.length)||[]).length>0);

let state=0x33017983;
/** @param {number} limit @returns {number} */
function rnd(limit) {
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)%limit;
}

/**
 * Exact 79 source word-pair test, with every GP29 shift enumerated.
 * @param {number[][]} runes
 * @returns {{any:number,unique:number,multiple:number,none:number,sample:Array<{word1:number,word2:number,shifts:number[],spell1:string,spell2:string}>}}
 */
function evaluate(runes) {
  let any=0,unique=0,multiple=0,none=0;
  const sample=[];
  for(let i=0;i<79;i++) {
    const shifts=[];
    for(let k=0;k<29;k++){
      if(dictionary.has(key(dec(runes[i],k))) &&
        dictionary.has(key(dec(runes[i+79],k))))shifts.push(k);
    }
    if(!shifts.length)none++;
    else{
      any++;
      if(shifts.length===1)unique++;else multiple++;
      if(sample.length<12 && shifts.length===1) {
        const k=shifts[0];
        const spell=w=>w.map(x=>corpus.translit[x]).join('');
        sample.push({word1:i+1,word2:i+80,shifts,
          spell1:spell(dec(runes[i],k)),spell2:spell(dec(runes[i+79],k))});
      }
    }
  }
  return {any,unique,multiple,none,sample};
}

/** @param {number} x @returns {number} */
const mod29=x=>((x%29)+29)%29;
/**
 * Exactly three additional source-visible variants: a 180-degree
 * mirrored-pair word reading, either same key or opposite key, and
 * straight two-half pairing with opposite key. The source has no
 * instruction choosing a variant; all four are tested as one family.
 * @param {number[][]} runes
 * @param {'straight'|'mirror'} pairing
 * @param {'same'|'opposite'} keySign
 */
function evaluateVariant(runes,pairing,keySign) {
  let any=0,unique=0,multiple=0,none=0;
  const sample=[];
  for(let i=0;i<79;i++) {
    const j=pairing==='mirror'?157-i:79+i;
    const shifts=[];
    for(let k=0;k<29;k++) {
      const alt=keySign==='opposite'?mod29(-k):k;
      if(dictionary.has(key(dec(runes[i],k)))&&
        dictionary.has(key(dec(runes[j],alt))))shifts.push(k);
    }
    if(!shifts.length)none++;
    else {
      any++;
      if(shifts.length===1)unique++;else multiple++;
      if(sample.length<6 && shifts.length===1) {
        const k=shifts[0],alt=keySign==='opposite'?mod29(-k):k;
        const spell=w=>w.map(x=>corpus.translit[x]).join('');
        sample.push({word1:i+1,word2:j+1,shifts,
          spell1:spell(dec(runes[i],k)),spell2:spell(dec(runes[j],alt))});
      }
    }
  }
  return {any,unique,multiple,none,sample};
}

const variants=[
  {pairing:'straight',keySign:'same'},
  {pairing:'straight',keySign:'opposite'},
  {pairing:'mirror',keySign:'same'},
  {pairing:'mirror',keySign:'opposite'}
];
const sourceVariant=variants.map(v=>({...v,...evaluateVariant(words,v.pairing,v.keySign)}));
assert.deepEqual(sourceVariant[0],{
  ...variants[0],...evaluate(words)
});

const original=evaluate(words);
// Synthetic positive: independent native GP English words chosen from the
// exact reference dictionary with original ciphertext-word rune lengths,
// then encrypted under a random 79-key shared across the two halves.
const plantedWords=words.map(w=>{
  const row=byLength.get(w.length);
  return row[rnd(row.length)];
});
const secret=Array.from({length:79},()=>rnd(29));
const plantedCipher=plantedWords.map((w,i)=>w.map(x=>(x+secret[i%79])%29));
const positive=evaluate(plantedCipher);
assert.equal(positive.any,79);
assert.equal(positive.none,0);
assert.equal(original.any+original.none,79);

const variantPlants=variants.map(v=>{
  const candidate=plantedWords.map((w,i)=>{
    const slot=i<79?i:(v.pairing==='mirror'?157-i:i-79);
    const signed=i<79||v.keySign==='same'?secret[slot]:mod29(-secret[slot]);
    return w.map(x=>(x+signed)%29);
  });
  const decoded=evaluateVariant(candidate,v.pairing,v.keySign);
  assert.equal(decoded.any,79);
  return {pairing:v.pairing,keySign:v.keySign,any:decoded.any,unique:decoded.unique};
});

const negative=[];
for(let k=0;k<200;k++){
  const randomCipher=words.map(w=>Array.from({length:w.length},()=>rnd(29)));
  const r=evaluate(randomCipher);
  const variantCounts=variants.map(v=>
    evaluateVariant(randomCipher,v.pairing,v.keySign).any);
  negative.push({any:r.any,unique:r.unique,
    variantCounts,maxAcrossFour:Math.max(...variantCounts)});
}
const counts=negative.map(x=>x.any);
const average=counts.reduce((sum,x)=>sum+x,0)/counts.length;
const max=Math.max(...counts);
const exceed=counts.filter(x=>x>=original.any).length;
const bestSource=Math.max(...sourceVariant.map(v=>v.any));
const familyExceed=negative.filter(x=>x.maxAcrossFour>=bestSource).length;
const familyMean=negative.reduce((sum,x)=>sum+x.maxAcrossFour,0)/negative.length;
const familyMax=Math.max(...negative.map(x=>x.maxAcrossFour));
console.log(JSON.stringify({
  status:'original p0–2 79-word-pair repeated Caesar key exact shared-lexicon gate',
  fixedSource:{wordCount:words.length,primePeriod:79,chapterRunes:729,
    firstWordRuneLengths:words.slice(0,8).map(w=>w.length)},
  nativeReferenceSources:sources,uniqueSourceRuneWords:dictionary.size,
  original:{...original,observedKeyPairCandidates:original.any},
  plantedNative:{any:positive.any,unique:positive.unique,multiple:positive.multiple},
  sourceFixedD4WordPairFamily:sourceVariant,
  sourceFixedD4NativePlants:variantPlants,
  fourVariantFamilyNull:{n:negative.length,observedBest:bestSource,
    nullMeanBest:familyMean,nullMaxBest:familyMax,
    nullCountAtLeastBest:familyExceed,
    addOneUpperTail:(familyExceed+1)/(negative.length+1)},
  randomGP29Controls:{n:negative.length,meanAny:average,maxAny:max,
    countAtLeastOriginal:exceed,addOneUpperTail:(exceed+1)/(negative.length+1)},
  caveats:'hypothetical one-shift-per-word 79-key with four source-word pair/sign conventions; broad lexicon overfits short words, and a lexical fit alone cannot authenticate p0 plaintext. No source instruction yet selects this cipher.'
},null,2));
