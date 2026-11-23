'use strict';

/**
 * Original-LP2 all-secret whole-word digraph type/collision obstruction.
 * 
 * Conditional original model: 1 raw Latin letter per source GP29 rune,
 * printed word boundaries unchanged, and ONE deterministic block encoder
 * for every two-letter word (any nonlinear/noncausal/keyed whole-word
 * operation, but same effective key/IV at every such word).
 *
 * No secret cipher can split identical plaintext words into different
 * ciphertext outputs under that fixed-state model. The original 448
 * two-rune tokens contain 354 types and only 106 same-word pair collisions,
 * whereas the pinned permissive 168-type raw-English lexicon requires
 * at least 392 collisions at 448 tokens.
 *
 * Source-locked Windows Node22 CJS/SFT:
 * node sims/lp2_rawlatin26_wholeword_digraph_collision_allkey_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parsed = parseSharedCorpus();
const idx = new Map(db.runes.map((glyph, value) => [glyph, value]));
const source = db.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const words = parsed.words.map(w => ({
  start: physicalLP2Page(w.startPage),
  letters: [...w.runes].map(glyph => {
    assert.ok(idx.has(glyph));
    return idx.get(glyph);
  })
}));
assert.equal(source.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.deepEqual(words.flatMap(w => w.letters), source);

/**
 * @param {string[]} tokens
 * @returns {{tokens:number,types:number,collisions:number}}
 */
function census(tokens) {
  const counts = new Map();
  for (const word of tokens) counts.set(word, (counts.get(word) || 0) + 1);
  return {tokens:tokens.length,types:counts.size,
    collisions:[...counts.values()].reduce((sum,n) => sum + n*(n-1)/2,0)};
}

/**
 * Exact pigeonhole minimum of equal-token unordered pairs from n tokens
 * using at most k distinct types; achieved by balanced type counts.
 * @param {number} n @param {number} k @returns {number}
 */
function minCollisions(n,k) {
  assert.ok(Number.isInteger(n)&&Number.isInteger(k)&&n>=0&&k>0);
  const q = Math.floor(n/k), r = n%k;
  return r*q*(q+1)/2+(k-r)*q*(q-1)/2;
}
const two = words.filter(w=>w.letters.length===2)
  .map(w=>({start:w.start,word:w.letters.join(',')}));
const actual = census(two.map(w=>w.word));
assert.deepEqual(actual,{tokens:448,types:354,collisions:106});

const lexicon = [...new Set(read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).map(s => s.split(/\s+/)[0].toLowerCase())
  .filter(s=>/^[a-z]{2}$/.test(s)))].sort();
assert.equal(lexicon.length,168);
const controlNames=[
  'gibran_prophet_58585.txt',
  'shakespeare_first300k.txt',
  'emerson_essays_2944.txt'
];
const controls=controlNames.map(name=>{
  const tokens=(read('resources/control/'+name).toLowerCase()
    .match(/[a-z]+/g)||[]).filter(x=>x.length===2);
  const counts=census(tokens);
  return {source:name,...counts,lexicon:[...new Set(tokens)]};
});
assert.deepEqual(controls.map(c=>c.types),[35,45,51]);
const attested = new Set(controls.flatMap(c=>c.lexicon));
assert.equal(attested.size,63);
const allbound=minCollisions(actual.tokens,lexicon.length);
assert.equal(allbound,392);
assert.ok(actual.collisions<allbound);
assert.ok(actual.types>lexicon.length);
const chapterCuts=[0,3,8,15,23,27,33,40,54,56];
const chapterRows=chapterCuts.slice(0,-1).map((lo,j)=>{
  const hi=chapterCuts[j+1];
  const a=census(two.filter(w=>w.start>=lo&&w.start<hi).map(w=>w.word));
  return {physicalPages:[lo,hi-1],...a,
    minimumCollisionsUnderAttested63:minCollisions(a.tokens,attested.size),
    moreTypesThanAttested63:a.types>attested.size};
});
assert.deepEqual(chapterRows.map(row=>row.tokens),[28,32,56,74,33,51,62,101,11]);
assert.deepEqual(chapterRows.map(row=>row.types),[26,30,52,73,33,50,59,98,11]);
assert.deepEqual(chapterRows.map(row=>row.collisions),[2,2,5,1,0,1,3,3,0]);
assert.equal(chapterRows[3].minimumCollisionsUnderAttested63,11);
assert.equal(chapterRows[7].minimumCollisionsUnderAttested63,38);

/**
 * Explicit noncausal reversible GP29 whole-word encoder mixing BOTH raw
 * Latin letters into the first ciphertext rune; positive counterexample
 * to a simple first-symbol-only bound.
 * @param {number[]} p @returns {number[]}
 */
function encrypt(p) {
  assert.equal(p.length,2);
  assert.ok(p.every(x=>x>=0&&x<26));
  return [(7*p[0]+3*p[1]+4)%29,(5*p[0]+11*p[1]+6)%29];
}
/** @param {number[]} c @returns {number[]} */
function decrypt(c) {
  const mod = n => (n%29+29)%29;
  const a=mod(c[0]-4), b=mod(c[1]-6);
  const p=[mod(22*(11*a-3*b)),mod(22*(-5*a+7*b))];
  assert.ok(p.every(x=>x<26));
  return p;
}
const universe=Array.from({length:676},(_,i)=>
  [Math.floor(i/26),i%26]);
for(const pair of universe) assert.deepEqual(decrypt(encrypt(pair)),pair);
assert.equal(new Set(universe.map(p=>encrypt(p)[0])).size,29);
assert.equal(new Set(universe.map(p=>encrypt(p).join(','))).size,676);

// The most *collision-sparing* 448-token language plant from 168 attested
// types uses balanced counts. No genuine language-frequency model required.
const native=Array.from({length:448},(_,i)=>lexicon[(i*37)%lexicon.length]);
const plantedPlain=census(native);
assert.deepEqual(plantedPlain,{tokens:448,types:168,collisions:392});
const plantedCipher=native.map(word=>encrypt([...word].map(c=>c.charCodeAt(0)-97)));
const plantedOutput=census(plantedCipher.map(pair=>pair.join(',')));
assert.deepEqual(plantedOutput,plantedPlain);
assert.deepEqual(plantedCipher.map(pair=>decrypt(pair).map(x=>String.fromCharCode(97+x)).join('')),native);


// A second, independently useful conditional prediction: under a single
// fixed block map per physical page, every duplicated plaintext two-letter
// word *on that page* must yield the same two-rune ciphertext word.
// Preserve each original physical page's exact count of two-rune words.
const pageNumbers=Array.from({length:56},(_,i)=>i).filter(p=>p!==50);
const pageTwoCounts=pageNumbers.map(page=>
  two.filter(w=>w.start===page).length);
assert.equal(pageTwoCounts.reduce((a,b)=>a+b,0),448);
assert.equal(pageTwoCounts.filter(n=>n>0).length,54);
assert.equal(Math.max(...pageTwoCounts),15);
function pageCollisionPairs(tokens) {
  let at=0,collisions=0;
  for(const n of pageTwoCounts) {
    collisions+=census(tokens.slice(at,at+n)).collisions;
    at+=n;
  }
  assert.equal(at,448);
  return collisions;
}
const originalPageLocal=pageNumbers.reduce((sum,page)=>sum+
  census(two.filter(w=>w.start===page).map(w=>w.word)).collisions,0);
assert.equal(originalPageLocal,2);
const nativePageWindows=controlNames.map(name=>{
  const tokens=(read('resources/control/'+name).toLowerCase()
    .match(/[a-z]+/g)||[]).filter(x=>x.length===2);
  assert.ok(tokens.length>448);
  const step=Math.max(1,Math.floor((tokens.length-448)/99));
  const results=[];
  for(let start=0;start+448<=tokens.length;start+=step)
    results.push(pageCollisionPairs(tokens.slice(start,start+448)));
  const sorted=results.slice().sort((a,b)=>a-b);
  return {source:name,windows:results.length,min:sorted[0],
    median:sorted[Math.floor(sorted.length/2)],max:sorted.at(-1)};
});
assert.deepEqual(nativePageWindows.map(x=>x.windows),[103,100,100]);
assert.deepEqual(nativePageWindows.map(x=>x.min),[165,123,165]);
assert.deepEqual(nativePageWindows.map(x=>x.median),[270,161,230]);
assert.deepEqual(nativePageWindows.map(x=>x.max),[383,225,415]);
assert.ok(nativePageWindows.every(x=>x.min>originalPageLocal));

console.log(JSON.stringify({
  original:{runes:source.length,completeWords:words.length,crossPageWords:32,
    twoRune:actual},
  pagePrivateFixedCipherLanguageControl:{originalWithinPagePairCollisions:originalPageLocal,
    sourcePageTwoWordCounts:pageTwoCounts,
    contiguousDonorWordWindows:nativePageWindows},
  rawLatinTwoLetterLexicon:{source:'TextBlob wordfreq, includes archaic/abbreviated tokens',
    distinctTypes:lexicon.length,
    minimum448TokenCollisions:allbound,
    otherIndependentAttestedSourceTypes:attested.size},
  fixedWholeWordAnySecretImpossible:actual.collisions<allbound,
  nativeControls:controls.map(({lexicon:unused,...summary})=>summary),
  chapters:chapterRows,
  exactNoncausalPositive:{all676LatinPairsInvert:true,
    all29CipherFirstGlyphsPossible:true,
    wholeWord448Plant:plantedOutput},
  caveat:'Only one stationary two-rune whole-word map, one raw Latin26 letter per GP29 slot, intact word boundaries and fixed 168-type English lexicon; does not exclude changing IV per word, other registers, alternate spelling, changed boundaries or unknown historical word types.'
},null,2));
