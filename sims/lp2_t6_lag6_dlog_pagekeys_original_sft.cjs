'use strict';
/**
 * Original LP2 extension of the T6 six-back discrete-log cipher to
 * independent secret 29-symbol code permutations per physical page or
 * per manuscript chapter.  Exact output collision counts within each
 * secret-permutation stratum are key-independent.
 *
 * Run: node sims/lp2_t6_lag6_dlog_pagekeys_original_sft.cjs
 * Node.js 22, read-only, CommonJS, Windows-compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const originalWords = (read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%').replace(/\/\r?\n/g, '')
  .replace(/[\r\n%]/g, '')
  .match(new RegExp('[' + gp.runes.join('') + ']+', 'gu')) || [])
  .map(w => Array.from(w, r => runeMap.get(r)));
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(originalWords.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(originalWords.flat(), original);
const PAGE = gp.pages.filter(p => p.page <= 55)
  .flatMap(p => Array(p.indices.length).fill(p.page));
const CHAPTER_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const CHAPTER = CHAPTER_LENGTHS.flatMap((n, i) => Array(n).fill(i));
assert.deepEqual([PAGE.length, CHAPTER.length], [12956, 12956]);
const mod29 = x => ((x % 29) + 29) % 29;
const exponent = Array(29).fill(-1);
const orbit = [];
let x=21;
for (let j=0; j<28; j++) {
  assert.equal(exponent[x], -1);
  exponent[x]=j;
  orbit.push(x);
  x=mod29(24-2*x);
}
assert.equal(x, 21);
assert.equal(exponent[8], -1);

/**
 * @param {number[]} w GP29 word
 * @param {number} j Zero-based position within its printed word, >=6
 * @returns {number} Encoded 29-way orbit difference
 */
function dlog(w, j) {
  if (w[j] === 8) return 28;
  return (exponent[w[j]] -
    (w[j-6]===8 ? 0 : exponent[w[j-6]]) + 28) % 28;
}
/**
 * A key-independent collision statistic on the suffix symbols inside
 * one or 55 independent secret alphabet strata.
 *
 * @param {number[][]} words Original GP29 words
 * @param {boolean} cipher Whether words are encrypted orbit-register data
 * @param {'page'|'chapter'} level Which independent-code key scope
 * @returns {{groups:number,n:number,pairs:number,hits:number,ioc:number}}
 */
function collision(words, cipher, level) {
  const count = Array.from({length:level==='page'?58:9},()=>new Uint32Array(29));
  let offset=0,n=0;
  for(const w of words) {
    for(let j=6; j<w.length; j++) {
      const absolute=offset+j;
      const key=level==='page'?PAGE[absolute]:CHAPTER[absolute];
      const v=cipher?dlog(w,j):w[j];
      assert(v>=0&&v<29);
      count[key][v]++;
      n++;
    }
    offset+=w.length;
  }
  assert.deepEqual([offset,n],[12956,1290]);
  let groups=0,hits=0,pairs=0;
  for(const hist of count) {
    const number=hist.reduce((s,v)=>s+v,0);
    if(number>1) groups++;
    for(const c of hist)hits+=c*(c-1)/2;
    pairs+=number*(number-1)/2;
  }
  return {groups,n,pairs,hits,ioc:hits/pairs};
}
const originalPage=collision(originalWords,true,'page');
const originalChapter=collision(originalWords,true,'chapter');
assert.deepEqual(originalPage,{groups:54,n:1290,pairs:16875,hits:628,
  ioc:628/16875});
assert.deepEqual(originalChapter,{groups:9,n:1290,pairs:115568,hits:4165,
  ioc:4165/115568});

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let z=seed>>>0;
  return ()=>(z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296;
}
/**
 * Source-native English plant with a different invertible GP alphabet
 * for each of 55 physical pages. π_p(P)=(11P+7p+3) mod29.  The
 * inverse multiplier of eleven is eight modulo29.
 * @param {number[][]} plainWords 2896 source-length GP29 words
 * @returns {number[][]}
 */
function encodePageKey(plainWords) {
  const all=[];
  let offset=0;
  for(const word of plainWords) {
    const cipher=[];
    for(let j=0;j<word.length;j++) {
      const k=mod29(11*word[j]+7*PAGE[offset+j]+3);
      const earlier=j<6||cipher[j-6]===8?0:exponent[cipher[j-6]];
      cipher.push(k===28?8:orbit[(earlier+k)%28]);
    }
    all.push(cipher);
    offset+=word.length;
  }
  assert.equal(offset,12956);
  return all;
}
/**
 * @param {number[][]} cipherWords Source-length words
 * @returns {number[][]} Exact native-GP plaintext after page-key inverse
 */
function decodePageKey(cipherWords) {
  const all=[];
  let offset=0;
  for(const word of cipherWords) {
    const plain=[];
    for(let j=0;j<word.length;j++) {
      const earlier=j<6||word[j-6]===8?0:exponent[word[j-6]];
      const k=word[j]===8?28:(exponent[word[j]]-earlier+28)%28;
      plain.push(mod29(8*(k-7*PAGE[offset+j]-3)));
    }
    all.push(plain);
    offset+=word.length;
  }
  assert.equal(offset,12956);
  return all;
}
const originalLengths=originalWords.map(w=>w.length);
const sources=[
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
const seed=0x33012026;
const repetitions=800;
const summaries=[];
for(const [name,file] of sources) {
  const byLength=Array.from({length:15},()=>[]);
  for(const token of read(file).toUpperCase().match(/[A-Z]+/g)||[]) {
    const w=encodeSourceNativeGP(token);
    if(w.length>0&&w.length<=14)byLength[w.length].push(w);
  }
  for(const L of new Set(originalLengths))assert(byLength[L].length>0);
  const rng=random(seed);
  let minPage=Infinity,minChapter=Infinity,sumPage=0,sumChapter=0;
  let noMorePage=0,noMoreChapter=0;
  for(let rep=0;rep<repetitions;rep++) {
    const native=originalLengths.map(L=>byLength[L][Math.floor(rng()*byLength[L].length)]);
    if(rep===0) {
      const planted=encodePageKey(native);
      assert.deepEqual(decodePageKey(planted),native,
        name+' full source-native plant inverse');
      assert.deepEqual(encodePageKey(decodePageKey(planted)),planted,
        name+' complete source-native forward replay');
      const pageCipher=collision(planted,true,'page');
      const pagePlain=collision(native,false,'page');
      assert.deepEqual(pageCipher,pagePlain,name+' arbitrary 55-key invariance');
      // The same page π can differ across a chapter; chapter collisions
      // are therefore not invariant in this full page-key plant.
      const chapterPlain=collision(native,false,'chapter');
      assert(chapterPlain.ioc>originalChapter.ioc);
    }
    const page=collision(native,false,'page');
    const chapter=collision(native,false,'chapter');
    minPage=Math.min(minPage,page.ioc);
    minChapter=Math.min(minChapter,chapter.ioc);
    sumPage+=page.ioc;
    sumChapter+=chapter.ioc;
    noMorePage+=+(page.ioc<=originalPage.ioc);
    noMoreChapter+=+(chapter.ioc<=originalChapter.ioc);
  }
  assert.equal(noMorePage,0,name+' native page permutation fit');
  assert.equal(noMoreChapter,0,name+' native chapter permutation fit');
  summaries.push({name,repetitions,minPage,meanPage:sumPage/repetitions,
    originalPageIoc:originalPage.ioc,originalBelowAllPageControls:noMorePage===0,
    minChapter,meanChapter:sumChapter/repetitions,
    originalChapterIoc:originalChapter.ioc,originalBelowAllChapterControls:noMoreChapter===0,
    plantedRuneRecovery:12956});
}
console.log(JSON.stringify({
  classification:'complete all-secret page/chapter stationary orbit-log decoder exclusion under GP-English',
  original:{words:originalWords.length,runes:original.length,
    perPage:originalPage,perChapter:originalChapter},
  keySpace:'all (29!)^55 physical-page alphabet permutations and all (29!)^9 chapter alphabet permutations',
  nativeSourceControls:summaries,
  noActualUnknownPlaintextRecovered:true
},null,2));
