'use strict';
/**
 * LP2 source-motivated five-back additive ciphertext-feedback all-secret gate.
 * Hypothesis for all printed words:
 * C[w,j] = sigma[page,j mod 5](P[w,j]), j<5;
 * C[w,j] = C[w,j-5] + sigma[page,j mod 5](P[w,j]) mod29, j>=5,
 * with an arbitrary hidden permutation sigma separately at each of 275
 * page/word-position classes. Word beginnings reset feedback and phase.
 *
 * D[w,j] = C[w,j]-C[w,j-5] mod29, j>=5, is a page/phase
 * secret-permuted plaintext letter. Equal-pair counts are unchanged under
 * every possible secret sigma, so native language provides an all-key test.
 *
 * Source: 55 original physical rune-bearing LP2 pages and the source
 * native GP alphabet. No candidate key fitting or original plaintext guess.
 * Reproduce on Node.js 22:
 * node sims/lp2_lagfive_feedback_allsecret_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
/** @param {string} name @returns {string} */
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphToIndex=new Map(gp.runes.map((g,i)=>[g,i]));
const runePattern=new RegExp('['+gp.runes.join('')+']+','gu');
const source=read('resources/lp2-transcription.txt');
const words=(source.split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(runePattern)||[])
  .map(w=>Array.from(w,g=>glyphToIndex.get(g)));
const originalPages=gp.pages.filter(p=>p.page<56&&p.indices.length>0);
const pageAtRune=originalPages.flatMap(p=>Array(p.indices.length).fill(p.page));
const lengths=words.map(w=>w.length);
assert.equal(words.length,2896);
assert.equal(words.flat().length,12956);
assert.equal(originalPages.length,55);
assert.deepEqual(words.flat(),originalPages.flatMap(p=>p.indices));
assert.equal(Math.max(...lengths),14);

/**
 * Equal pair index for all page x within-word-phase groups of noninitial
 * positions. Original data are transformed to five-back differences.
 * GP-native English controls instead supply P_j directly.
 *
 * @param {number[][]} input
 * @param {boolean} asCipher
 * @param {boolean} perPage
 * @returns {{classes:number,n:number,pairs:number,hits:number,rate:number}}
 */
function collisions(input,asCipher,perPage=true){
  const rows=new Map();
  let absolute=0,n=0;
  for(const word of input){
    for(let j=5;j<word.length;j++){
      const label=perPage?5*pageAtRune[absolute+j]+j%5:j%5;
      let counts=rows.get(label);
      if(!counts){counts=new Uint32Array(29);rows.set(label,counts);}
      const sym=asCipher?(word[j]-word[j-5]+29)%29:word[j];
      assert(Number.isInteger(sym)&&sym>=0&&sym<29);
      counts[sym]++;
      n++;
    }
    absolute+=word.length;
  }
  assert.equal(absolute,12956);
  let hits=0,pairs=0;
  for(const counts of rows.values()){
    let k=0;
    for(const c of counts){k+=c;hits+=c*(c-1)/2;}
    pairs+=k*(k-1)/2;
  }
  return {classes:rows.size,n,pairs,hits,rate:hits/pairs};
}
/**
 * Full per-word change of secret alphabet. One arbitrary 29! map is reused
 * at the fiveback positions of only that word, independently of every other
 * source word. This is a different, more permissive family than page-phase.
 * @param {number[][]} input
 * @param {boolean} asCipher
 * @returns {{classes:number,n:number,pairs:number,hits:number,rate:number}}
 */
function perWordCollisions(input,asCipher){
  let classes=0,n=0,pairs=0,hits=0;
  for(const word of input){
    const counts=new Uint32Array(29);
    let k=0;
    for(let j=5;j<word.length;j++){
      const sym=asCipher?(word[j]-word[j-5]+29)%29:word[j];
      counts[sym]++;k++;n++;
    }
    if(k>0) classes++;
    pairs+=k*(k-1)/2;
    for(const count of counts) hits+=count*(count-1)/2;
  }
  return {classes,n,pairs,hits,rate:hits/pairs};
}
/** @param {number} seed @returns {()=>number} */
function random(seed){
  let state=seed>>>0;
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
}
/** @param {string} file @returns {number[][][]} */
function nativeBuckets(file){
  const out=Array.from({length:15},()=>[]);
  const clean=read(file).split(/\r?\n/).filter(line=>!line.startsWith('#')).join(' ');
  for(const word of clean.match(/[a-zA-Z]+/g)||[]){
    const w=encodeSourceNativeGP(word);
    if(w.length<=14)out[w.length].push(w);
  }
  for(const n of lengths)assert(out[n].length>0,'missing native control word length '+n);
  return out;
}
/** @param {number[][][]} buckets @param {()=>number} rng @returns {number[][]} */
function sample(buckets,rng){
  return lengths.map(n=>{
    const choices=buckets[n];
    return choices[Math.floor(rng()*choices.length)];
  });
}
const actual=collisions(words,true);
const global=collisions(words,true,false);
const wordOriginal=perWordCollisions(words,true);
assert.deepEqual([wordOriginal.classes,wordOriginal.n,wordOriginal.pairs,wordOriginal.hits],[815,2105,2750,105]);
assert.deepEqual([actual.classes,actual.n,actual.pairs,actual.hits],
  [261,2105,11664,388]);
assert.deepEqual([global.classes,global.n,global.pairs,global.hits],
  [5,2105,634908,21817]);

const sources=[
  {name:'Shakespeare',path:'resources/control/shakespeare_first300k.txt',seed:0x2805d1ff},
  {name:'Gibran',path:'resources/control/gibran_prophet_58585.txt',seed:0x2805d200},
  {name:'Emerson',path:'resources/control/emerson_essays_2944.txt',seed:0x2805d201},
  {name:'Latin Vulgate',path:'resources/control/latin-vulgate-latin26-wholewords.txt',seed:0x2805d202}
];
const controls=[];
let plantPlain=null;
for(const item of sources){
  const pool=nativeBuckets(item.path),rng=random(item.seed);
  const pageScores=[],globalScores=[],wordScores=[];
  for(let trial=0;trial<250;trial++){
    const trialWords=sample(pool,rng);
    if(!plantPlain)plantPlain=trialWords;
    pageScores.push(collisions(trialWords,false).rate);
    globalScores.push(collisions(trialWords,false,false).rate);
    wordScores.push(perWordCollisions(trialWords,false).rate);
  }
  assert(pageScores.every(x=>x>actual.rate));
  assert(globalScores.every(x=>x>global.rate));
  wordScores.sort((a,b)=>a-b);
  pageScores.sort((a,b)=>a-b);globalScores.sort((a,b)=>a-b);
  controls.push({name:item.name,draws:250,seed:item.seed,
    minPage:pageScores[0],medianPage:pageScores[125],
    maxPage:pageScores.at(-1),minWord:wordScores[0],medianWord:wordScores[125],
    atOrBelowWord:wordScores.filter(x=>x<=wordOriginal.rate).length,
    minGlobal:globalScores[0],
    maxGlobal:globalScores.at(-1),atOrBelowOriginal:0});
}
assert(plantPlain);
/** One independent bijection for each original page and each five-step phase. */
const rng=random(0x530128);
const maps=Array.from({length:56*5},()=> {
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [p[i],p[j]]=[p[j],p[i]];
  }
  assert.equal(new Set(p).size,29);
  return p;
});
let offset=0;
const encrypted=[],decrypted=[];
for(const word of plantPlain){
  const ct=[],pt=[];
  for(let j=0;j<word.length;j++){
    const table=maps[5*pageAtRune[offset+j]+j%5];
    const out=table[word[j]];
    const cipher=j<5?out:(ct[j-5]+out)%29;
    ct.push(cipher);
    pt.push(table.indexOf(j<5?cipher:(cipher-ct[j-5]+29)%29));
  }
  encrypted.push(ct);decrypted.push(pt);
  offset+=word.length;
}
assert.equal(offset,12956);
assert.deepEqual(decrypted,plantPlain);
const before=collisions(plantPlain,false);
const after=collisions(encrypted,true);
assert.deepEqual([before.n,before.pairs,before.hits],
  [after.n,after.pairs,after.hits],
  'all 275 independent feedback alphabets preserve source groups');
/*
 * Independent planted key-per-WORD feedback. A newly shuffled map for every
 * original printed word, reused at all word-local fifth-back positions.
 */
const wordRng=random(0x530129);
const wordMaps=words.map(()=> {
  const permutation=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=Math.floor(wordRng()*(i+1));
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  return permutation;
});
const wordCipher=[],wordPlain=[];
for(let w=0;w<plantPlain.length;w++){
  const key=wordMaps[w],ct=[],pt=[];
  for(let j=0;j<plantPlain[w].length;j++){
    const label=key[plantPlain[w][j]];
    const output=j<5?label:(ct[j-5]+label)%29;
    ct.push(output);
    pt.push(key.indexOf(j<5?output:(output-ct[j-5]+29)%29));
  }
  wordCipher.push(ct);wordPlain.push(pt);
}
assert.deepEqual(wordPlain,plantPlain);
const wordPlantBefore=perWordCollisions(plantPlain,false);
const wordPlantAfter=perWordCollisions(wordCipher,true);
assert.deepEqual(wordPlantBefore,wordPlantAfter);
/**
 * For the surviving fresh-word-key branch, test the much more economical
 * additive word-specific Caesar phase on its observable fiveback residual:
 * D[j] = P[j] + k(word) mod29 for j>=5. A complete original long word
 * (10..14 runes) must match at least one same-length source-native word
 * under one unknown shift. Zero fitted cipher key enters the native pool.
 *
 * @param {number[]} cipherWord
 * @param {number[][]} nativeWords
 * @returns {boolean}
 */
function hasCaesarSuffix(cipherWord,nativeWords){
  for(const plain of nativeWords){
    const initial=(cipherWord[5]-cipherWord[0]-plain[5]+58)%29;
    let equal=true;
    for(let j=6;j<cipherWord.length;j++){
      const diff=(cipherWord[j]-cipherWord[j-5]-plain[j]+58)%29;
      if(diff!==initial){equal=false;break;}
    }
    if(equal)return true;
  }
  return false;
}
const originalLong=words.filter(w=>w.length>=10);
assert.equal(originalLong.length,109);
const nativeCaesar=[];
for(const item of sources){
  const pool=nativeBuckets(item.path);
  let matched=0;
  for(const w of originalLong){
    if(hasCaesarSuffix(w,pool[w.length]))matched++;
  }
  const positiveOriginalLong=originalLong.map((w,i)=>{
    const plain=pool[w.length][i%pool[w.length].length], k=(3+7*i)%29;
    const cipher=w.slice(0,5);
    for(let j=5;j<plain.length;j++){
      cipher.push((cipher[j-5]+plain[j]+k)%29);
    }
    assert(hasCaesarSuffix(cipher,pool[w.length]));
    return cipher;
  });
  assert.equal(positiveOriginalLong.length,109);
  nativeCaesar.push({name:item.name,longOriginalWords:109,
    nativeDictionaryMatched:matched,nativeDictionaryMissed:109-matched,
    positiveOriginalShapeMatches:positiveOriginalLong.length});
}
console.log(JSON.stringify({
  cipherFamily:'each printed word resets; j>=5 C_j=C_(j-5)+sigma_(page,j mod5)(P_j) modulo29, with unrestricted separate page-phase secret bijections',
  original:{words:2896,runes:12956,deltaPositions:2105,
    sameWordLag5Equal:104,eligibleLag5Pairs:2105,
    differentialPerPage:actual,differentialGlobal:global,
    differentialPerWordOneAlphabet:wordOriginal},
  matchedNativeControls:controls,
  perWordCaesarFivebackFiniteNativeRegister:nativeCaesar,
  positiveControl:{independentSecretAlphabets:275,
    GPPlainRunesExactlyRecovered:12956,
    differencePositions:before.n,pairs:before.pairs,
    equalPairsBefore:before.hits,equalPairsAfter:after.hits},
  independentWordKeyPositive:{maps:wordMaps.length,plaintextRecovered:wordPlain.flat().length,
    before:wordPlantBefore,after:wordPlantAfter},
  conclusion:'Excludes this fixed five-back page-phase secret-permutation additive feedback family for the four tested source-native GP English/Latin registers; no unknown plaintext or key recovered',
  scope:'Per-word one-alphabet model is separately measured; fresh per-word five-phase maps, nonlinear feedback, changed segmentation, and non-GP registers remain untested.'
},null,2));
