'use strict';
/**
 * Original LP2 printed-word order versus solved Cicada plaintext and three
 * independent native-English holdouts: BIGRAM and TRIGRAM word-length grammar.
 *
 * Input: 55 original rune-bearing unknown LP2 pages, 12,956 runes, 2,896 words.
 * Null: shuffle full printed GP word lengths WITHIN EACH PHYSICAL PAGE, so
 * original per-page unigram lengths and word counts remain exactly unchanged.
 * Controls: genuine native GP word lengths from 3 historic literary corpora,
 * plus 713 words of separately solved authentic Cicada LP1 and LP2 p56/p57.
 * No plaintext/key guesses; no LM trained on unknown original ciphertext.
 *
 * Conclusion cannot prove fake spaces: non-English, editorial grouping or
 * transposition also explain the null. It rejects treating LP2 words as
 * *statistically ordinary English word-length succession* without evidence.
 *
 * Reproduce: node sims/lp2_wordlength_trigram_solved_cicada_gate_sft.cjs
 * Windows 11, Node22, CommonJS, builtins only, read only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const transcription=read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const runic=/[\u16A0-\u16FF]/u;
/** @typedef {{length:number,page:number}} RuneWord */
/** @type {RuneWord[]} */
const physicalWords=[];
let length=0,runecount=0,page=0,startPage=0;
function endWord(){
  if(length>0){physicalWords.push({length,page:startPage});length=0;}
}
for(const char of transcription){
  if(runic.test(char)){
    if(length===0)startPage=page;
    length++;runecount++;
  }else if(char==='%'){
    page++;
  }else if(char==='/'||/\s/u.test(char)){
    // A printed newline or page break may split a single runic word.
  }else endWord();
}
endWord();
assert.equal(runecount,12956);
assert.equal(physicalWords.length,2896);
const pageChunks=Array.from({length:55},(_,p)=>physicalWords
  .filter(w=>w.page===p).map(w=>w.length));
assert.equal(pageChunks.flat().length,2896);
assert.ok(pageChunks.every(p=>p.length>=16&&p.length<=71));
assert.ok(pageChunks.flat().every(n=>n>0&&n<18));

const K=18,alpha=.2;
const doublets=new Set(['TH','NG','EO','OE','AE','IA','EA','IO']);
/** @param {string} word @returns {number} */
function gpLength(word){
  let n=0;
  for(let i=0;i<word.length;i++){
    if(word.slice(i,i+3)==='ING'){i+=2;n++;continue;}
    if(doublets.has(word.slice(i,i+2)))i++;
    n++;
  }
  return Math.min(K-1,n);
}
/** @param {string} input @returns {number[]} */
const toLengths=input=>(input.toUpperCase().match(/[A-Z]+/g)||[])
  .map(gpLength);

const files=[
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const source=files.map((file,i)=>({file,values:toLengths(read(file))}));
assert.deepEqual(source.map(s=>s.values.length),[15733,77932,55407]);

// Corpus-known Cicada plaintext: editor-separated sections of LP1 and two
// authentic final solved LP2 pages. Exclude repeated "continuation of" notes,
// duplicate p4/p7/p8 renderings, numeric squares, source headers and URL text.
const solved=read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/\r\n/g, '\n')
  .split(/\n### (\d+)\n/g);
const solvedPages=new Set([1,3,5,6,9,10,11,12,13,14,15,56,57]);
const known=[];
for(let i=1;i<solved.length;i+=2){
  const number=Number(solved[i]);
  if(!solvedPages.has(number))continue;
  let lines=solved[i+1].split('\n')
    .filter(l=>!l.startsWith('[')&&!l.startsWith('#')&&
      !/^[\d\s,;]+$/u.test(l)&&!/^[\s]*$/u.test(l)&&
      !/^(?:WISDOM|A KOAN|AN INSTRUCTION|KNOW THIS)$/iu.test(l));
  if(number===56)lines=lines.slice(0,2); // exclude SHA512 digest
  const values=toLengths(lines.join(' '));
  assert.ok(values.length>0);
  known.push({page:number,values});
}
assert.equal(known.reduce((n,p)=>n+p.values.length,0),713);
assert.equal(known.length,13);

/**
 * Model log Pr(next word length|preceding 1 or 2 lengths) minus
 * log Pr(next word length): exactly one statistic per transition.
 * Additive .2 smoothing and fixed 18 length bins.
 * @param {number[][]} corpora
 * @param {2|3} depth
 * @returns {Float64Array}
 */
function model(corpora,depth){
  const gram=new Float64Array(K**depth).fill(alpha);
  const context=new Float64Array(K**(depth-1)).fill(K*alpha);
  const unigram=new Float64Array(K).fill(alpha);
  for(const words of corpora){
    for(const v of words)unigram[v]++;
    for(let i=depth-1;i<words.length;i++){
      let index=0;
      for(let j=i-depth+1;j<=i;j++)index=index*K+words[j];
      gram[index]++;
      context[Math.floor(index/K)]++;
    }
  }
  const total=unigram.reduce((a,b)=>a+b,0);
  return gram.map((n,i)=>Math.log(n/context[Math.floor(i/K)])-
    Math.log(unigram[i%K]/total));
}
/**
 * @param {number[][]} wordLengthSegments
 * @param {Float64Array} trained
 * @param {2|3} depth
 * @returns {number}
 */
function score(wordLengthSegments,trained,depth){
  let value=0,observations=0;
  for(const words of wordLengthSegments){
    for(let i=depth-1;i<words.length;i++){
      let index=0;
      for(let j=i-depth+1;j<=i;j++)index=index*K+words[j];
      value+=trained[index];
      observations++;
    }
  }
  return value/observations;
}

let randomState=0x20143301;
/** @returns {number} */
function random(){
  randomState^=randomState<<13;
  randomState^=randomState>>>17;
  randomState^=randomState<<5;
  return randomState>>>0;
}
/** @param {number[]} values @returns {number[]} */
function shuffled(values){
  const out=values.slice();
  for(let i=out.length-1;i>0;i--){
    const j=random()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/** @param {number[]} values */
function stats(values){
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const sd=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/values.length);
  return {mean,sd};
}
/**
 * @param {number[][]} chunks
 * @param {Float64Array} m
 * @param {2|3} depth
 * @param {number} trials
 */
function evaluate(chunks,m,depth,trials){
  const original=score(chunks,m,depth);
  const shuffledScores=Array.from({length:trials},()=>
    score(chunks.map(shuffled),m,depth));
  const baseline=stats(shuffledScores);
  const z=(original-baseline.mean)/baseline.sd;
  return {
    original,shuffledMean:baseline.mean,shuffledSd:baseline.sd,z,
    rightTail:(1+shuffledScores.filter(x=>x>=original).length)/(trials+1),
    samples:trials
  };
}
/**
 * @param {number[]} original
 * @returns {number[][]}
 */
function pageShapedNative(original){
  let offset=3000;
  return pageChunks.map(page=>{
    const slice=original.slice(offset,offset+page.length);
    assert.equal(slice.length,page.length);
    offset+=page.length;
    return slice;
  });
}
const trials=700; // reproducible 1/701 Monte Carlo resolution
const results=[];
for(const depth of [2,3]){
  const book=pageChunks;
  const mKnown=model(source.map(s=>s.values),depth);
  const knownGate=evaluate(known.map(p=>p.values),mKnown,depth,trials);
  assert.ok(knownGate.z>(depth===2?3.5:2.3),
    'known solved Cicada prose must retain word-length syntax');
  for(let heldout=0;heldout<3;heldout++){
    const m=model(source.filter((_,i)=>i!==heldout).map(s=>s.values),depth);
    const original=evaluate(book,m,depth,trials);
    const native=evaluate(
      pageShapedNative(source[heldout].values),m,depth,trials);
    assert.ok(Math.abs(original.z)<2,
      'LP2 original word order unexpectedly aligns with native English');
    assert.ok(native.z>5,
      'source-native English positive word-length order was not recovered');
    results.push({
      depth,heldout:source[heldout].file,
      originalPageConditioned:original,
      sourceNativePositive:native
    });
  }
  // Latin has different typical word lengths. Test an independently
  // published Latin Vulgate whole-word source with the same fixed metric.
  // The model uses its first half, with the second half entirely withheld.
  const latinText=read('resources/control/latin-vulgate-latin26-wholewords.txt')
    .replace(/\r\n/g,'\n').split('\n').filter(line=>
      !line.trimStart().startsWith('#')).join(' ');
  const latinLengths=toLengths(latinText);
  assert.equal(latinLengths.length,39835);
  const middle=Math.floor(latinLengths.length/2);
  const latinModel=model([latinLengths.slice(0,middle)],depth);
  const latinOriginal=evaluate(book,latinModel,depth,trials);
  const latinNative=evaluate(
    pageShapedNative(latinLengths.slice(middle)),latinModel,depth,trials);
  assert.ok(Math.abs(latinOriginal.z)<2.5,
    'LP2 original should not suddenly imply ordinary Latin grammar');
  assert.ok(latinNative.z>5,
    'genuine held-out Vulgate Latin must retain word-length syntax');
  results.push({
    depth,heldout:'resources/control/latin-vulgate-latin26-wholewords.txt',
    sourceLanguage:'Latin',originalPageConditioned:latinOriginal,
    sourceNativePositive:latinNative,
    trainingLatinWords:middle,
    withheldLatinWords:latinLengths.length-middle
  });

  // Independent, correctly normalized Old English: published Beowulf
  // source, 10,885 original words; avoid the separate misnormalized legacy
  // fixture. Train only first half, hold out second half with page-shape.
  const oldEnglish=JSON.parse(read(
    'resources/control/beowulf_oe_gp_profile_corrected.json'));
  assert.equal(oldEnglish.acceptedSourceWords,10885);
  const oe=oldEnglish.allSourceGpWordLengths.map(n=>Math.min(K-1,n));
  assert.equal(oe.length,10885);
  const halfOE=Math.floor(oe.length/2);
  const oeModel=model([oe.slice(0,halfOE)],depth);
  const oeSource=oe.slice(halfOE);
  let oeOffset=200;
  const oeNative=pageChunks.map(page=>{
    const part=oeSource.slice(oeOffset,oeOffset+page.length);
    assert.equal(part.length,page.length);
    oeOffset+=page.length;
    return part;
  });
  const oeOriginal=evaluate(book,oeModel,depth,trials);
  const oeHoldout=evaluate(oeNative,oeModel,depth,trials);
  assert.ok(Math.abs(oeOriginal.z)<2,
    'LP2 original was not expected to show Old English grammar');
  assert.ok(oeHoldout.z>(depth===2?3:2),
    'actual Beowulf passage must retain word-length order information');
  results.push({
    depth,heldout:'resources/control/beowulf_oe_gp_profile_corrected.json',
    sourceLanguage:'Old English',originalPageConditioned:oeOriginal,
    sourceNativePositive:oeHoldout,
    trainingOldEnglishWords:halfOE,
    withheldOldEnglishWords:oe.length-halfOE
  });

  results.push({
    depth,
    knownSolvedCicadaWordCount:known.reduce((n,p)=>n+p.values.length,0),
    knownSolvedCicadaPositive:knownGate
  });
}
console.log(JSON.stringify({
  outcome:'Both original LP2 printed word-length bigrams and trigrams match within-page shuffled controls, while 713 words of solved Cicada text, three English controls, Latin Vulgate, and Old English Beowulf retain order structure. No unknown plaintext recovered.',
  originalPages:pageChunks.length,
  originalWords:physicalWords.length,
  originalRunes:runecount,
  printedWordModel:'length in native GP29 rune cells, ING and seven digraphs',
  languageModel:'smoothed log conditional length prediction, 18 bins, alpha .2',
  originalNull:'700 shuffles preserving every page length multiset and word count',
  solvedCicadaPages:known.map(p=>p.page),
  results,
  caveat:'Only excludes native-English-like sequential printed word lengths: edited spacing, Latin/Old English, explicit transposition, fake delimiters or different prose register remain possible.'
},null,2));
