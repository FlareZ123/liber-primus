'use strict';

/**
 * Exploratory original-source p15 Fibonacci-indexed rune pickup and checksum.
 * Node.js 22 CommonJS single-file test, run from repo root:
 *   node sims/lp2_p15_fibonacci_body708_source_sft.cjs
 *
 * This does not decode unknown plaintext. It exposes the source-selected
 * mathematical relation and the exact missing step for a possible key use.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p = corpus.pages;
const ink = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-ink-annotations.json'),'utf8'));
const gp = corpus.translit;
const primeRune = corpus.prime;
const mod29 = x => ((x % 29) + 29) % 29;

const table = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const originalGrid = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516,
];

/** Return the first n primes. @param {number} n @returns {number[]} */
function primes(n) {
  const a = [];
  for (let v = 2; a.length < n; v++) {
    let ok = true;
    for (let d = 2; d*d <= v; d++) {
      if (v % d === 0) { ok = false; break; }
    }
    if (ok) a.push(v);
  }
  return a;
}
const fib = [0,1,2,3];
while (fib.length < 16) fib.push(fib.at(-1) + fib.at(-2));
assert.deepEqual(fib, [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]);
const primeList = primes(988);
const numbers = fib.map(v => Math.abs(3301 - primeList[v]));
assert.deepEqual(numbers, originalGrid);
assert.deepEqual(table, [
  [numbers[6],numbers[7],numbers[8],numbers[9]],
  [numbers[5],numbers[0],numbers[1],numbers[10]],
  [numbers[4],numbers[3],numbers[2],numbers[11]],
  [numbers[15],numbers[14],numbers[13],numbers[12]],
]);

// The original p15 scan has a 9-rune red title ABOVE the printed grid and an
// 11-rune red subtitle BELOW the infinity drawing, followed by the black body.
// Next pages p16–22 continue that body, unbroken at physical page wraps.
const section = p.slice(15,23).flatMap(page => page.indices);
assert.equal(section.length, 1903);
const body = section.slice(20);
assert.equal(body.length, 1883);
const picked = fib.map(i => body[i]);
const pickedPrimeSum = picked.reduce((s,i) => s + primeRune[i], 0);
assert.deepEqual(picked, [10,1,10,1,25,25,13,14,9,17,24,3,9,27,4,3]);
assert.equal(pickedPrimeSum, 708);
assert.equal(originalGrid[13], 708);

/** @param {number[]} runes @returns {string} */
function spell(runes) { return runes.map(i=>gp[i]).join(''); }
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const freq = Array(29).fill(0);
  for (const i of runes) freq[i]++;
  return freq.reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}
/** @param {number[]} ciphertext @param {number[]} key @returns {{reachable: number, firstImpossible: number|null}} */
function strictTransparentF(ciphertext, key) {
  let states = new Set([0]);
  for(let i=0;i<ciphertext.length;i++){
    const next = new Set();
    for(const clock of states) {
      if(ciphertext[i]===0) next.add(clock);
      const plain = mod29(ciphertext[i] - key[clock % key.length]);
      if(plain!==0) next.add(clock+1);
    }
    if(!next.size) return {reachable:0,firstImpossible:i};
    states=next;
  }
  return {reachable:states.size,firstImpossible:null};
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encryptStrictTransparentF(plain,key) {
  let clock = 0;
  return plain.map(v=>v===0 ? 0 : mod29(v + key[clock++ % key.length]));
}
let shifts = [];
for (let start=0;start+987<section.length;start++) {
  const sum = fib.reduce((s,i)=>s+primeRune[section[start+i]],0);
  if (numbers.includes(sum)) shifts.push([start,sum]);
}
assert.deepEqual(shifts, [[20,708],[128,708],[492,708],[527,708]]);
// A predeclared self-addressing continuation from the source-selected body
// start uses the recovered sum as an absolute forward rune displacement.
// The second picked window remains in bounds but does not match any grid cell.
const continuationStart=20+pickedPrimeSum;
assert.equal(continuationStart,728);
const continuationSum=fib.reduce((s,i)=>s+primeRune[section[continuationStart+i]],0);
assert.equal(continuationSum,1074);
assert.equal(numbers.includes(continuationSum),false);

// Independent chapter-initial controls. The listed heading counts come from
// original red span boundaries, not from output-fitting.
const chapterStart = [[3,7,16],[8,14,12],[15,22,20],[23,26,16],[27,32,19],[33,39,10],[40,53,8]];
// Assert red-heading starts from the physical colored-span source metadata.
// p15's two contiguous red rune spans have an intervening numeric graphic;
// both precede the first black body rune. p33 instead has an independent
// second red span at 91, after 81 black runes, so its heading length is TEN.
for (const [a,,h] of chapterStart) {
  const source=ink.pages.find(x=>x.page===a);
  assert(source && source.red_spans && source.red_spans[0].start===0);
  if(a===15){
    assert.deepEqual(source.red_spans.map(x=>[x.start,x.length]),[[0,9],[9,11]]);
    assert.equal(h,20);
  } else {
    assert.equal(source.red_spans[0].length,h);
  }
}
assert.deepEqual(ink.pages.find(x=>x.page===33).red_spans.map(x=>[x.start,x.length]),[[0,10],[91,8]]);
const controls = chapterStart.map(([a,b,h])=>{
  const c=p.slice(a,b+1).flatMap(x=>x.indices);
  const sum = fib.reduce((s,i)=>s+primeRune[c[h+i]],0);
  return {pages:a+'-'+b,runes:c.length,offset:h,primeSum:sum,matchesGrid:numbers.includes(sum)};
});
assert.deepEqual(controls.map(x=>x.primeSum), [903,641,708,936,761,895,884]);

// A second, source-visible independent physical chapter happens to yield 761
// at the same red-heading-following Fibonacci pickup. p27 draws a wing and
// the actual 2013 carrier has literal filename 761.MP3. This source alignment
// still does not select a rune cipher. Test the two least-free authentic PARABLE
// rune keys instead of tuning MP3-byte mappings or key phases.
const wingChapter=p.slice(27,33).flatMap(x=>x.indices).slice(19);
assert.equal(wingChapter.length,1414);
const parableSeven=p[57].indices.slice(0,7);
const parableAll=p[57].indices;
assert.equal(fib.reduce((sum,i)=>sum+primeRune[wingChapter[i]],0),761);
// Independent fixed p27 body-start selection relative to all 427 in-bounds
// 16-position Fibonacci windows, and an exact 100,000-draw random16 control.
const wingStarts761=[];
for(let start=0;start+987<wingChapter.length;start++){
  if(fib.reduce((sum,i)=>sum+primeRune[wingChapter[start+i]],0)===761)
    wingStarts761.push(start);
}
assert.deepEqual(wingStarts761,[0,168]);
let wingState=0x33012761;
function wingRng(){wingState ^= wingState<<13;wingState ^= wingState>>>17;wingState ^= wingState<<5;return wingState>>>0;}
let wingRandomHits761=0;
for(let trial=0;trial<100000;trial++){
  const seen=new Set();
  let sum=0;
  while(seen.size<16){
    const i=wingRng()%wingChapter.length;
    if(seen.has(i))continue;
    seen.add(i);
    sum+=primeRune[wingChapter[i]];
  }
  if(sum===761)wingRandomHits761++;
}
assert.equal(wingRandomHits761,216);
assert.deepEqual(strictTransparentF(wingChapter,parableSeven),{reachable:0,firstImpossible:13});
assert.deepEqual(strictTransparentF(wingChapter,parableAll),{reachable:0,firstImpossible:68});
assert(strictTransparentF(encryptStrictTransparentF(p[57].indices,parableSeven),parableSeven).reachable>0);
assert(strictTransparentF(encryptStrictTransparentF(p[57].indices,parableAll),parableAll).reachable>0);

// One frozen candidate consumer: the extracted sixteen runes used directly
// as a repeated Vigenere key, under the known p56 transparent-F convention.
// The independent neighboring p23–26 chapter starts after its 16-rune title.
const adjacent = p.slice(23,27).flatMap(x=>x.indices).slice(16);
assert.equal(adjacent.length,1005);
const direct = adjacent.map((v,i)=>mod29(v-picked[i%picked.length]));
assert(Math.abs(ioc(direct)-0.034528552456839307)<1e-12);
assert.deepEqual(strictTransparentF(adjacent,picked),{reachable:0,firstImpossible:17});
assert.deepEqual(strictTransparentF(body,picked),{reachable:0,firstImpossible:0});

// Plants validate the entire source-selected key's 29-rune forward/inverse,
// and an independent genuine p56 prime-totient/F-bypass source decoder.
assert(strictTransparentF(encryptStrictTransparentF(p[57].indices,picked),picked).reachable>0);
let consumed=0;
const p56=p[56].indices.map((v,i)=>i===56 ? (assert.equal(v,0),0) : mod29(v - ((primeList[consumed++]-1)%29)));
assert.equal(consumed,84);
assert(spell(p56).startsWith('ANENDWITHINTHEDEEPWEB'));

let state=0x33012015;
function rng(){state ^= state<<13;state ^= state>>>17;state ^= state<<5;return state>>>0;}
const sampleCount=100000;
let hit708=0,hitAny=0;
for (let trial=0;trial<sampleCount;trial++){
  const positions=new Set();
  let sum=0;
  while(positions.size<16){
    const i=rng()%body.length;
    if(positions.has(i))continue;
    positions.add(i);
    sum+=primeRune[body[i]];
  }
  if (sum===708) hit708++;
  if (numbers.includes(sum)) hitAny++;
}
assert.equal(hit708,225);
assert.equal(hitAny,236);
console.log(JSON.stringify({
  originalGridNumbers:numbers,
  independentIndexSource:fib,
  originalBodyStart:20,
  pickedRunes:picked.map(i=>gp[i]),
  primeSum:pickedPrimeSum,
  matchingSourceTableCell:{step:13,row:4,column:3,number:708},
  sameChapterCandidateStartHits:shifts,
  nextSelfAddressedWindow:{start:continuationStart,sum:continuationSum,hit:numbers.includes(continuationSum)},
  otherChapterInitialControls:controls,
  wingP27Parable:{matchedOriginalFilename:761,sourceBodyRunes:wingChapter.length,allInBoundsFibonacciStartsMatching761:wingStarts761,random16Distinct100kHits761:wingRandomHits761,strictF7:strictTransparentF(wingChapter,parableSeven),strictF95:strictTransparentF(wingChapter,parableAll)},
  shiftedKeyCandidate:{
    nextChapterRemainderIoc:ioc(direct),
    transparentFNextChapter:strictTransparentF(adjacent,picked),
  },
  random16DistinctPositionNull:{
    seed:'0x33012015',sampleCount,match708:hit708,matchAnyPrintedCell:hitAny,
  },
},null,2));
