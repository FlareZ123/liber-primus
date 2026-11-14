'use strict';

/**
 * Original-source 25-word clockwise/counterclockwise spiral route test.
 * Historical cues: LP1 Wisdom 5x5, p15 clockwise spiral, p57 "circumferences".
 * Target: original 2,896 printed LP2 word lengths (32 words span pages).
 * No fitted alphabet, key, phase, or arbitrary route search.
 *
 * Reproduce: node sims/lp2_wisdom25_word_spiral_order_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(ROOT, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const RUNE = new Set(corpus.runes);
const raw = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');

/** @typedef {{length:number,section:number,page:number}} Word */
/** @returns {Word[]} */
function parseWords() {
  /** @type {Word[]} */
  const words = [];
  let length = 0;
  let page = 0;
  let section = 0;
  let startPage = 0;
  let startSection = 0;
  function finish() {
    if (length) words.push({length, section:startSection, page:startPage});
    length = 0;
  }
  for (const character of raw) {
    if (RUNE.has(character)) {
      if (!length) { startPage = page; startSection = section; }
      length += 1;
    } else if (character === '%') {
      page += 1;
    } else if (character === '$') {
      finish();
      section += 1;
    } else if (character !== '/' && !/\s/u.test(character)) {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(section, 8);
  assert.equal(words.reduce((s, word) => s + word.length, 0), 12956);
  return words;
}
const words = parseWords();
const original = words.map(w => w.length);
const TOKENS = corpus.translit.slice().sort((a,b) => b.length-a.length);
/** @param {string} text @returns {number[]} */
function gpLengths(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(rawWord => {
    const word = rawWord.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
    let result = 0;
    for (let i = 0; i < word.length;) {
      const token = TOKENS.find(t => word.startsWith(t,i));
      assert.ok(token);
      i += token.length;
      result += 1;
    }
    return result;
  });
}
const sources = {
  LP1: gpLengths(read('resources/liber-primus/lp1-plaintext-reference.txt')),
  Shakespeare: gpLengths(read('resources/control/shakespeare_first300k.txt')),
  Gibran: gpLengths(read('resources/control/gibran_prophet_58585.txt')),
  Emerson: gpLengths(read('resources/control/emerson_essays_2944.txt'))
};
assert.deepEqual(Object.fromEntries(Object.entries(sources)
  .map(([key, value]) => [key, value.length])),
{LP1:904,Shakespeare:55407,Gibran:15733,Emerson:77932});
/** @param {number} n */
function bin(n) {return n <= 4 ? n-1 : n <= 6 ? 4 : n <= 8 ? 5 : 6;}
/** @param {number[]} sequence */
function grammar(sequence) {
  const counts = Array.from({length:7},() => Array(7).fill(1));
  const row = Array(7).fill(7);
  const column = Array(7).fill(7);
  let total = 49;
  for (let i=1;i<sequence.length;i++) {
    const x=bin(sequence[i-1]),y=bin(sequence[i]);
    counts[x][y]++;row[x]++;column[y]++;total++;
  }
  return counts.map((r,x)=>r.map((v,y)=>Math.log2((v/row[x])/(column[y]/total))));
}
/** @param {number[]} seq @param {number[][]} model */
function score(seq, model) {
  let sum=0;
  for (let i=1;i<seq.length;i++)sum+=model[bin(seq[i-1])][bin(seq[i])];
  return sum/(seq.length-1);
}
const models = Object.fromEntries(Object.entries(sources)
  .map(([k,v]) => [k,grammar(v)]));

/**
 * 5x5 traditional outer-to-inner spiral; top-left starting position.
 * @param {boolean} clockwise
 * @returns {number[]}
 */
function spiral(clockwise) {
  let left=0,top=0,right=4,bottom=4;
  /** @type {number[]} */
  const order=[];
  const push=(r,c) => order.push(5*r+c);
  while (left<=right && top<=bottom) {
    if (clockwise) {
      for (let x=left;x<=right;x++)push(top,x);
      for (let y=top+1;y<=bottom;y++)push(y,right);
      if (top<bottom)for (let x=right-1;x>=left;x--)push(bottom,x);
      if (left<right)for (let y=bottom-1;y>top;y--)push(y,left);
    } else {
      for (let y=top;y<=bottom;y++)push(y,left);
      for (let x=left+1;x<=right;x++)push(bottom,x);
      if (left<right)for (let y=bottom-1;y>=top;y--)push(y,right);
      if (top<bottom)for (let x=right-1;x>left;x--)push(top,x);
    }
    left++;right--;top++;bottom--;
  }
  assert.equal(order.length,25);
  assert.equal(new Set(order).size,25);
  return order;
}
const CLOCKWISE=spiral(true);
const COUNTERCLOCKWISE=spiral(false);
assert.deepEqual(CLOCKWISE,[0,1,2,3,4,9,14,19,24,23,22,21,20,15,10,5,6,7,8,13,18,17,16,11,12]);

/**
 * Apply one of the two row-major/spiral read directions to 25 whole words.
 * Group boundaries are manuscript-printed, never fitted.
 * @param {number[]} input
 * @param {number[]} route
 * @param {boolean} reverse
 * @param {'global'|'section'|'page'} mode
 * @returns {number[]}
 */
function apply(input, route, reverse, mode) {
  assert.equal(input.length,words.length);
  const output=input.slice();
  /** @type {number[]} */
  let indices=[];
  function flush() {
    for(let base=0;base+25<=indices.length;base+=25) {
      const slots=indices.slice(base,base+25);
      if (reverse) {
        for(let k=0;k<25;k++)output[slots[route[k]]]=input[slots[k]];
      } else {
        for(let k=0;k<25;k++)output[slots[k]]=input[slots[route[k]]];
      }
    }
    indices=[];
  }
  for(let i=0;i<words.length;i++) {
    if(indices.length && mode!=='global') {
      const prev=words[indices[indices.length-1]],curr=words[i];
      if((mode==='section'&&prev.section!==curr.section) ||
         (mode==='page'&&prev.page!==curr.page))flush();
    }
    indices.push(i);
  }
  flush();
  return output;
}

/** @param {number[]} route @param {boolean} reverse */
function label(route,reverse) {
  return (route===CLOCKWISE?'clockwise':'counterclockwise')+'-'+
    (reverse?'spiral-fill':'spiral-read');
}

const baseline = Object.fromEntries(
  Object.entries(models).map(([k,m])=>[k,score(original,m)]));
const variants=[];
for(const mode of ['global','section','page']) {
  for(const route of [CLOCKWISE,COUNTERCLOCKWISE]) {
    for(const reverse of [false,true]) {
      const output=apply(original,route,reverse,mode);
      variants.push({mode,operation:label(route,reverse),
        LP1:score(output,models.LP1),Shakespeare:score(output,models.Shakespeare),
        Gibran:score(output,models.Gibran)});
    }
  }
}
const maxScore = Math.max(...variants.map(x=>x.LP1));
const best = variants.filter(x=>x.LP1===maxScore)[0];
const baselineScore=baseline.LP1;
let rng=0x20143301;
/** @param {number} n */
function rand(n) {
  rng^=rng<<13; rng^=rng>>>17; rng^=rng<<5;
  return (rng>>>0)%n;
}
const TRIALS=600;
const maximums=[];
for(let trial=0;trial<TRIALS;trial++) {
  const shuffled=original.slice();
  for(let i=shuffled.length-1;i>0;i--) {
    const k=rand(i+1);
    [shuffled[i],shuffled[k]]=[shuffled[k],shuffled[i]];
  }
  let max=-Infinity;
  for(const mode of ['global','section','page']) {
    for(const route of [CLOCKWISE,COUNTERCLOCKWISE]) {
      for(const reverse of [false,true]) {
        const candidate=apply(shuffled,route,reverse,mode);
        max=Math.max(max,score(candidate,models.LP1));
      }
    }
  }
  maximums.push(max);
}
maximums.sort((a,b)=>a-b);
const exceed=maximums.filter(x=>x>=maxScore).length;
const plant=sources.Gibran.slice(0,2896);
const encrypted=apply(plant,CLOCKWISE,true,'global');
const decoded=apply(encrypted,CLOCKWISE,false,'global');
assert.deepEqual(decoded,plant);
const plantBefore=score(encrypted,models.Shakespeare);
const plantAfter=score(decoded,models.Shakespeare);
assert.ok(plantAfter>plantBefore+0.01);
console.log(JSON.stringify({
  event:'wisdom_5x5_complete_word_spiral_original_gate',
  source:{totalWords:2896,runes:12956,
    chapterMarkers:8,clockwiseRoute:CLOCKWISE,counterclockwiseRoute:COUNTERCLOCKWISE},
  baseline,variants,
  bestLP1:best,
  familywise:{null:'shuffled exact 2,896 source GP word-length inventory, reoptimizing all 12 frozen routes',
    trials:TRIALS,seed:0x20143301,originalBest:maxScore,
    originalGain:maxScore-baselineScore,medianNullBest:maximums[Math.floor(TRIALS/2)],
    upper95NullBest:maximums[Math.floor(0.95*TRIALS)],
    exceed,tailPlusOne:(exceed+1)/(TRIALS+1)},
  planted:{length:plant.length,encryption:'clockwise 5x5 spiral fill',sourceNativeRecovered:decoded.length,
    scrambledShakespeareBits:plantBefore,recoveredShakespeareBits:plantAfter},
  actualPlaintextRecovered:0
}));
