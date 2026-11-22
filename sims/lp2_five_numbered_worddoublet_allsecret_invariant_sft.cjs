'use strict';

// Exact key-independent obstruction to *every* GP29 constant shift per word,
// with a word-length-matched empirical native-English comparator. The test
// uses five original red-numbered cuneiform paragraphs, all 122 whole printed
// words and the original p37->p38 carried word, not synthetic punctuation.
// No unknown key, wordwise shift vector, or source square is guessed.
// Execute: node sims/lp2_five_numbered_worddoublet_allsecret_invariant_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {originalParagraphs} = require('./lp2_pp36_38_numbered_aphorism_crib_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lengths = originalParagraphs(read('resources/liber-primus/lp2-transcription.txt'));
const parts = [
  corpus.pages[36].indices.slice(99,238),
  corpus.pages[37].indices.slice(0,91),
  corpus.pages[37].indices.slice(91,189),
  corpus.pages[37].indices.slice(189,228).concat(corpus.pages[38].indices.slice(0,57)),
  corpus.pages[38].indices.slice(57,186),
];
assert.deepEqual(parts.map(x => x.length), [139,91,98,96,129]);
assert.deepEqual(lengths.map(x => x.length), [30,20,25,19,28]);
assert.equal(parts.flat().length, 553);
assert.equal(lengths.flat().length, 122);
assert.equal(lengths[3][8], 6);

/** @param {number[]} x */
function doublets(x) {
  let d=0;
  for(let i=1;i<x.length;i++) if(x[i]===x[i-1]) d++;
  return d;
}
/** @param {number[]} input @param {number[]} wordLengths */
function perWord(input,wordLengths) {
  let i=0;
  const out=wordLengths.map(n => {
    const word=input.slice(i,i+n);
    i+=n;
    return word;
  });
  assert.equal(i,input.length);
  return out;
}
const words=parts.flatMap((p,j)=>perWord(p,lengths[j]));
const events=words.map(doublets);
assert.equal(events.reduce((s,x)=>s+x,0),1);
const bySection=parts.map((p,j)=>
  perWord(p,lengths[j]).reduce((s,w)=>s+doublets(w),0));
assert.deepEqual(bySection,[1,0,0,0,0]);
const slots=words.reduce((s,w)=>s+w.length-1,0);
assert.equal(slots,431);

const mod=x=>(x%29+29)%29;
const squares=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(s=>s.trim().split(/\s+/).map(Number));
assert.deepEqual(squares.map(s=>s.length),[25,49,25]);
let sourceConsumers=0;
for(const squareId of [0,2])for(const sign of [-1,1]) {
  let off=0,changed=[];
  for(let section=0;section<5;section++) {
    const wl=lengths[section];
    for(let wi=0;wi<wl.length;wi++){
      const k=squares[squareId][section*5+wi%5]%29;
      const original=words[off++];
      const transformed=original.map(x=>mod(x+sign*k));
      const replay=transformed.map(x=>mod(x-sign*k));
      assert.deepEqual(replay,original);
      assert.equal(doublets(transformed),doublets(original));
      changed.push(transformed);
    }
  }
  assert.equal(off,122);
  assert.equal(changed.reduce((s,w)=>s+doublets(w),0),1);
  sourceConsumers++;
}
assert.equal(sourceConsumers,4);

// Exact invariant: (C_i+k)==(C_(i-1)+k) modulo 29 if and only if
// C_i==C_(i-1) modulo 29, for every independent k in 0..28.
// We assert the algebra exhaustively over all 29^3 triples, independent
// of the long rare observed book stream.
for(let u=0;u<29;u++)for(let v=0;v<29;v++)for(let k=0;k<29;k++) {
  assert.equal(mod(u+k)===mod(v+k),u===v);
}

/** @typedef {{total:number,zero:number,one:number,weightedEvents:number,count:number,unweightedZero:number,unweightedOne:number,unweightedEvents:number}} Stats */
/** @type {Map<number,Stats>} */
const stats=new Map();
const runeTokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);

/**
 * Canonical normalized GP spelling. Historical conventions include
 * ING contraction GP21, IO contraction GP27, and U/C/S consonants.
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const input=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  let i=0; const out=[];
  while(i<input.length) {
    if(input.startsWith('ING',i)){out.push(21);i+=3;continue}
    if(input.startsWith('IO',i)){out.push(27);i+=2;continue}
    const match=runeTokens.find(x=>input.startsWith(x.token,i));
    assert(match,'not GP source word '+word+' at '+i);
    out.push(match.index);
    i+=match.token.length;
  }
  return out;
}
const english=read('resources/control/english_wordfreq_textblob.txt');
let listed=0;
for(const line of english.split('\n')) {
  const m=/^([a-z]+) (\d+)$/.exec(line);
  if(!m) continue;
  const encoded=gp(m[1]),weight=Number(m[2]),d=doublets(encoded),n=encoded.length;
  const st=stats.get(n)||{total:0,zero:0,one:0,weightedEvents:0,
    count:0,unweightedZero:0,unweightedOne:0,unweightedEvents:0};
  st.total+=weight;
  if(d===0)st.zero+=weight;
  if(d===1)st.one+=weight;
  st.weightedEvents+=weight*d;
  st.count++;
  if(d===0)st.unweightedZero++;
  if(d===1)st.unweightedOne++;
  st.unweightedEvents+=d;
  stats.set(n,st);
  listed++;
}
assert(listed>=29060);
const wordSizes=lengths.flat();
assert(wordSizes.every(n=>stats.has(n)));
/**
 * Conditional independent-word source-native null: exact probability of
 * no more than one within-word GP29 adjacent repeat across all original
 * 122 word lengths. The expected counts are descriptive. This assumes
 * source words are independently sampled given their GP rune lengths and
 * therefore is not a proof for literary/nonce-bearing unknown plaintext.
 * @param {'weighted'|'uniform'} mode
 */
function wordNull(mode) {
  let logPzero=0,oneOverZero=0,expected=0;
  const observedBySize=[...new Set(wordSizes)].sort((a,b)=>a-b);
  const rows=[];
  for(const n of observedBySize) {
    const st=stats.get(n);
    const denominator=mode==='weighted'?st.total:st.count;
    const p0=(mode==='weighted'?st.zero:st.unweightedZero)/denominator;
    const p1=(mode==='weighted'?st.one:st.unweightedOne)/denominator;
    const mean=(mode==='weighted'?st.weightedEvents:st.unweightedEvents)/denominator;
    assert(p0>0);
    const nWords=wordSizes.filter(x=>x===n).length;
    logPzero+=nWords*Math.log(p0);
    oneOverZero+=nWords*p1/p0;
    expected+=nWords*mean;
    rows.push({length:n,sourceWordCount:nWords,pZero:p0,pOne:p1,mean});
  }
  const Pzero=Math.exp(logPzero),PatMostOne=Pzero*(1+oneOverZero);
  assert(PatMostOne>=Pzero&&PatMostOne<=1);
  return {mode,expectedDoublets:expected,Pzero,PatMostOne,
    independentLengthConditionedWords:122,
    lexiconEntries:listed,rows};
}

/**
 * Conditional on the *actual original* rune multiset of each word, uniformly
 * shuffle the positions of that word. Exactly compute the probability of
 * zero or one adjacent identical rune by dynamic programming. This null
 * retains each original cipher word's length, entire letter histogram,
 * repeated-symbol counts, and independent source-defined word boundaries.
 * Only within-word positions change. No English lexical assumptions.
 * @param {number[]} word
 * @returns {[number,number,number]}
 */
function shuffledWordNull(word) {
  const counts=new Map();
  for(const c of word) counts.set(c,(counts.get(c)||0)+1);
  const repeated=[...counts.values()].filter(n=>n>1);
  const singles=[...counts.values()].filter(n=>n===1).length;
  const memo=new Map();
  /**
   * @param {number[]} left
   * @param {number} remainingSingles
   * @param {number} previous index into repeated, else -1 for a unique singleton
   * @returns {[number,number]} Probabilities of 0 and 1 *future* equal edges
   */
  function rec(left,remainingSingles,previous) {
    const total=remainingSingles+left.reduce((a,b)=>a+b,0);
    if(total===0) return [1,0];
    const id=left.join(',')+'|'+remainingSingles+'|'+previous;
    const old=memo.get(id);
    if(old) return old;
    const result=[0,0];
    for(let i=0;i<left.length;i++) {
      if(left[i]===0) continue;
      const next=left.slice();next[i]--;
      const [p0,p1]=rec(next,remainingSingles,i),p=left[i]/total;
      if(i===previous) result[1]+=p*p0;
      else {result[0]+=p*p0;result[1]+=p*p1}
    }
    if(remainingSingles) {
      const [p0,p1]=rec(left,remainingSingles-1,-1);
      const p=remainingSingles/total;
      result[0]+=p*p0;result[1]+=p*p1;
    }
    memo.set(id,result);
    return result;
  }
  const [pZero,pOne]=rec(repeated,singles,-1);
  const expected=[...counts.values()].reduce((sum,n)=>sum+n*(n-1),0)/word.length;
  assert(pZero>0);
  assert(pZero+pOne<=1+1e-12);
  return [pZero,pOne,expected];
}
let fixedOriginalLogPzero=0,fixedOriginalOneOverZero=0,fixedOriginalExpected=0;
let originalWithAnyNonadjacentRepeat=0;
for(const word of words) {
  const [pZero,pOne,expected]=shuffledWordNull(word);
  fixedOriginalLogPzero+=Math.log(pZero);
  fixedOriginalOneOverZero+=pOne/pZero;
  fixedOriginalExpected+=expected;
  if(expected>0) originalWithAnyNonadjacentRepeat++;
}
const fixedOriginalPzero=Math.exp(fixedOriginalLogPzero);
const fixedOriginalPatMostOne=fixedOriginalPzero*(1+fixedOriginalOneOverZero);
assert.equal(originalWithAnyNonadjacentRepeat,27);
assert(Math.abs(fixedOriginalExpected-11.066810966810968)<1e-9);
assert(Math.abs(fixedOriginalPzero-8.537453600698436e-7)<1e-15);
assert(Math.abs(fixedOriginalPatMostOne-0.000016901325506174345)<1e-13);

// A stronger exact invariant covers all word-local *bijections* pi_w,
// not only Caesar shifts. Every invertible GP29 affine mapping is tested
// explicitly; arbitrary 29! fixed symbol permutations obey the same
// injectivity argument since pi(x)==pi(y) iff x==y.
for(let u=0;u<29;u++)for(let v=0;v<29;v++)
  for(let multiplier=1;multiplier<29;multiplier++)
    for(let offset=0;offset<29;offset++)
      assert.equal(mod(multiplier*u+offset)===mod(multiplier*v+offset),u===v);

const weighted=wordNull('weighted'),uniform=wordNull('uniform');
assert(Math.abs(weighted.expectedDoublets-13.978312576019627)<1e-9);
assert(Math.abs(weighted.PatMostOne-0.000005438610228669934)<1e-13);
assert(Math.abs(uniform.expectedDoublets-15.879468654348157)<1e-9);
assert(Math.abs(uniform.PatMostOne-0.0000011000409106696353)<1e-13);
console.log(JSON.stringify({
  classification:'EXACT ALL-KEY WORD-SHIFT EQUALITY INVARIANT; CONDITIONAL NATIVE-ENGLISH NULL',
  numberedSourceRuneLengths:parts.map(p=>p.length),
  numberedOriginalWordCounts:lengths.map(w=>w.length),
  originalRuneCount:parts.flat().length,completeWords:words.length,
  sourceAdjacentWithinWordSlots:slots,
  originalAdjacentEqualities:events.reduce((s,x)=>s+x,0),
  originalAdjacentEqualitiesBySection:bySection,
  sourceSquareShiftConsumersPassed:sourceConsumers,
  keyIndependentAnyWordwiseBijection:true,
  testedAffineBijectionSymbolComparisons:29*29*28*29,
  conditionalUniformWordPermutation:{
    originalWordsWithRepeatedRune:originalWithAnyNonadjacentRepeat,
    originalRepeatedRunePairCount:38,
    expectedAdjacentPairs:fixedOriginalExpected,
    exactPzero:fixedOriginalPzero,
    exactPatMostOne:fixedOriginalPatMostOne,
    conditioning:'Original unchanged 122 printed word rune multisets; uniform random within-word ordering, independently per word; no native-English language assumption',
  },
  arithmeticInvarianceCheckedTriples:29**3,
  nativeWordNulls:[weighted,uniform],
  caution:'Lexicon null assumes independent native-English words given observed original lengths. Within-word permutation null fixes all original ciphertext symbol multisets and independently permutes the positions of each whole word. Neither null excludes every possible plaintext register or context-dependent cipher.',
},null,2));
console.log('PASS exact 122-word/553-rune all-secret wordwise symbol-bijection doublet invariant, '+
  'both 2014 five-square source keys ±, original-multiset conditioned exact permutation null, and native-GP lexicon length-conditioned count nulls.');
