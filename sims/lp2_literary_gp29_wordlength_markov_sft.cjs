/**
 * LP2 original word-length crib gate against period-relevant literary sources.
 * Single-file test: node sims/lp2_literary_gp29_wordlength_markov_sft.cjs
 * Requires the repository's preserved source files, no network dependencies.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..', 'resources');
const SOURCES = [
  'control/gibran_prophet_58585.txt',
  'control/shakespeare_first300k.txt',
  'control/emerson_essays_2944.txt',
  'external/blake-marriage-1906-gutenberg45315.txt',
  'external/kjv-passion-gospels-2014.txt',
  'external/2013-book-of-law-I.txt',
  'external/2013-book-of-law-II.txt',
  'external/2013-book-of-law-III.txt',
];
const GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const BIGRAMS = new Set(['TH','NG','EO','OE','AE','IA','EA']);
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

/** @param {string} original */
function cipherLengths(original) {
  const joined = original.replace(/\/\s*/g, '').replace(/[\r\n]/g, '').replace(/[%&$]/g, ' ');
  const words = [...joined.matchAll(new RegExp('[' + GP + ']+', 'gu'))].map(m => [...m[0]].length);
  assert.equal(words.length, 2973, '57-page physical word count (including solved p56/p57)');
  assert.equal(words.reduce((a,b)=>a+b,0), 13136, 'total source rune count (including controls)');
  const unsolved = words.slice(0,-77);
  assert.equal(unsolved.length, 2896);
  assert.equal(unsolved.reduce((a,b)=>a+b,0), 12956);
  return unsolved;
}

/** @param {string} word */
function gpLength(word) {
  const s = word.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  let count=0;
  for (let i=0;i<s.length;) {
    i += BIGRAMS.has(s.slice(i,i+2)) ? 2 : 1;
    count++;
  }
  return count;
}

/** @param {number[]} a @param {number} n */
function grams(a,n) {
  const out=[];
  for(let i=0;i+n<=a.length;i++) out.push(a.slice(i,i+n).join(','));
  return out;
}
const literal = cipherLengths(read('liber-primus/lp2-transcription.txt'));
const controls = SOURCES.map(source => {
  const words=read(source).match(/[A-Za-z]+/g) || [];
  return {source, words, lens:words.map(gpLength)};
});
const refs = new Map();
for (const c of controls) {
  for (let j=0;j+9<=c.lens.length;j++){
    const key=c.lens.slice(j,j+9).join(',');
    const list=refs.get(key) || [];
    list.push({source:c.source,offset:j,words:c.words,lens:c.lens});
    refs.set(key,list);
  }
}
const sets = new Map([9,10,11,12].map(n => [n,new Set(controls.flatMap(c=>grams(c.lens,n)))]));

/** @param {number[]} sequence */
function countMatches(sequence){
  const hits=[0,0,0,0];
  for (let i=0;i+9<=sequence.length;i++){
    if(!sets.get(9).has(sequence.slice(i,i+9).join(',')))continue;
    hits[0]++;
    for (let n=10;n<=12;n++){
      if(i+n>sequence.length || !sets.get(n).has(sequence.slice(i,i+n).join(',')))break;
      hits[n-9]++;
    }
  }
  return hits;
}
const matched=[];
for(let i=0;i+9<=literal.length;i++){
  const hits=refs.get(literal.slice(i,i+9).join(','));
  if(!hits)continue;
  for(const ref of hits){
    let n=9;
    while(i+n<literal.length && ref.offset+n<ref.lens.length &&
          literal[i+n]===ref.lens[ref.offset+n])n++;
    matched.push({position:i,source:ref.source,sourceOffset:ref.offset,length:n,phrase:ref.words.slice(ref.offset,ref.offset+n).join(' ')});
  }
}
matched.sort((a,b)=>b.length-a.length);
const observed=countMatches(literal);
assert.deepEqual(observed,[13,1,0,0]);
assert.equal(matched[0].position,1970);
assert.equal(matched[0].length,10);
assert.equal(matched[0].source,'control/gibran_prophet_58585.txt');

const markov = new Map();
for(let i=0;i+2<literal.length;i++){
  const key=literal[i]+','+literal[i+1];
  const tail=markov.get(key)||[];
  tail.push(literal[i+2]);markov.set(key,tail);
}
let seed=0x33012014;
/** @returns {number} */
function random01(){
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed>>>0)/4294967296;
}
const runs=500, mean=[0,0,0,0], exceeds=[0,0,0,0], high=[0,0,0,0];
for(let trial=0;trial<runs;trial++){
  const offset=Math.floor(random01()*(literal.length-2));
  const synthetic=[literal[offset],literal[offset+1]];
  for(let k=2;k<literal.length;k++){
    const tail=markov.get(synthetic[k-2]+','+synthetic[k-1]);
    synthetic.push(tail[Math.floor(random01()*tail.length)]);
  }
  const hits=countMatches(synthetic);
  for(let k=0;k<4;k++){
    mean[k]+=hits[k]; high[k]=Math.max(high[k],hits[k]);
    if(hits[k]>=observed[k])exceeds[k]++;
  }
}
const control=literal.slice();
control.splice(100,12,...controls[0].lens.slice(4886,4898));
assert(countMatches(control)[3]>=1,'injected 12-word Gibran length-crib positive');
console.log(JSON.stringify({
  source:'original rune-based LP2 transcription', unsolvedWords:literal.length,
  sourceFiles:SOURCES, sourceWords:controls.map(x=>x.lens.length),
  observed9to12:observed, strongest:matched[0],
  null:'fixed-seed GP word-length order-2 Markov surrogate; 500 complete source-sized draws',
  nullMean9to12:mean.map(v=>v/runs), nullGreaterEqual:exceeds,
  nullMax9to12:high, seed:'0x33012014', positive:'injected 12-word source span recognized'
},null,2));
