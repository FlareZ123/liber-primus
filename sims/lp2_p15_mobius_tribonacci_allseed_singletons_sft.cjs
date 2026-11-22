'use strict';

/**
 * All-secret, source-motivated GP29 Tribonacci key gate on the unmodified
 * original LP2 p15..22 chapter, including a page-reset-independent witness.
 *
 * First-party 2013 WISDOM says MOBIUS. Applying integer Mobius mu to
 * the original p15 4x4 Fibonacci/prime square gives exactly
 * [0,0,0,0] / [-1,-1,-1,+1] / [0,0,0,0] / [0,0,0,0].
 * The unique four-sign row is the characteristic polynomial of a
 * three-step Tribonacci state: K[t]=K[t-1]+K[t-2]+K[t-3] mod29.
 *
 * Consider EVERY (29^3 = 24389) possible initial triplet with original
 * ciphertext C[t]=P[t]+K[t] (mod29), preserving printed words.
 * A genuine GP-English singleton in the authentic 18 printed one-rune
 * slots must decode to A, I, or O (GP indices 24,10,3).
 * Re-run the identical test on each original physical page with an
 * independent unconstrained 3-state seed. No fitted key or language scorer.
 *
 * The source selects the Mobius squarefree coefficients; it DOES NOT
 * prescribe this proposed additive encryption or its recipient. A failure
 * is specific to the modeled 3-term additive stream and printed spaces.
 *
 * Windows Node.js 22 / CommonJS / builtins only. Read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function mobius(n) {
  let count = 0;
  for (let d = 2; d * d <= n; d++) {
    if (n % d) continue;
    n /= d;
    if (n % d === 0) return 0;
    while (n % d === 0) n /= d;
    count++;
  }
  if (n > 1) count++;
  return count % 2 ? -1 : 1;
}

const square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const masked = square.map(row => row.map(mobius));
assert.deepEqual(masked, [
  [0, 0, 0, 0],
  [-1, -1, -1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]);
assert(read('resources/external/2013-0-wisdom.txt').includes('ᛗᚩᛒᛁᚢᛋ'));

/** @returns {{offset:number,cipher:number}[]} */
function allSingletons() {
  const source = read('resources/lp2-transcription.txt').split('%')
    .slice(0, 55).join('%');
  let offset = 0, word = [], count = 0;
  const single = [];
  const finish = () => {
    if (!word.length) return;
    count++;
    if (word.length === 1) single.push(word[0]);
    word = [];
  };
  for (const char of source) {
    if (runeMap.has(char)) {
      word.push({offset, cipher: runeMap.get(char)});
      offset++;
    } else if (char === '%' || char === '/' || /\s/u.test(char)) {
      // Line, page and logical word continuations are kept intact.
    } else finish();
  }
  finish();
  assert.deepEqual([offset, count, single.length], [12956, 2896, 83]);
  return single;
}
const originalPages = gp.pages.filter(p => p.page >= 15 && p.page <= 22);
const pageStart = gp.pages.filter(p => p.page < 15).reduce((s, p) =>
  s + p.indices.length, 0);
assert.equal(pageStart, 3603);
assert.equal(gp.pages[15].indices.length, 159);
const original = originalPages.flatMap(p =>
  p.page === 15 ? p.indices.slice(20) : p.indices);
assert.equal(original.length, 1883);
const allPositions = allSingletons().filter(item =>
  item.offset >= pageStart + 20 && item.offset < pageStart + 1903)
  .map(item => item.offset - pageStart - 20);
assert.deepEqual(allPositions,
  [115, 160, 258, 383, 519, 525, 553, 594, 610, 735, 851,
    1010, 1076, 1128, 1171, 1630, 1696, 1713]);
assert.equal(allPositions.length, 18);

/**
 * Three linearly independent GP29 seeds from (1,0,0),(0,1,0),(0,0,1).
 * This is the exact 29^3-state all-secret keyspace.
 * @param {number} n @returns {number[][]}
 */
function basis(n) {
  const result = Array.from({length:3}, () => Array(n).fill(0));
  for (let seed = 0; seed < 3; seed++) result[seed][seed] = 1;
  for (let i = 3; i < n; i++) {
    for (const k of result) k[i] = mod(k[i-1]+k[i-2]+k[i-3]);
  }
  return result;
}

/** @param {number[]} cipher @param {number[]} sites */
function scanAllSeeds(cipher, sites) {
  const B = basis(cipher.length);
  const histogram = Array(sites.length+1).fill(0);
  let best = -1;
  let bestSeeds = [];
  let valid = 0;
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let c = 0; c < 29; c++) {
        let hits = 0;
        for (const i of sites) {
          const k = mod(a*B[0][i]+b*B[1][i]+c*B[2][i]);
          const p = mod(cipher[i]-k);
          if (p === 24 || p === 10 || p === 3) hits++;
        }
        histogram[hits]++;
        if (hits > best) {best=hits; bestSeeds=[[a,b,c]];}
        else if (hits === best) bestSeeds.push([a,b,c]);
        if (hits === sites.length) valid++;
      }
    }
  }
  assert.equal(histogram.reduce((sum,v)=>sum+v,0), 29**3);
  return {symbols: cipher.length, singletons: sites.length, best,
    bestSeeds: bestSeeds.slice(0,8), bestSeedCount: bestSeeds.length,
    validAll: valid, histogram};
}

/** @param {number[]} plain @param {number[]} seed */
function encode(plain, seed) {
  const b = basis(plain.length);
  return plain.map((x,i)=>mod(x+seed[0]*b[0][i]+seed[1]*b[1][i]+seed[2]*b[2][i]));
}
/** @param {number[]} cipher @param {number[]} seed */
function decode(cipher, seed) {
  const b = basis(cipher.length);
  return cipher.map((x,i)=>mod(x-seed[0]*b[0][i]-seed[1]*b[1][i]-seed[2]*b[2][i]));
}

const continuous = scanAllSeeds(original,allPositions);
assert.equal(continuous.best,9);
assert.deepEqual(continuous.bestSeeds,[[13,15,12]]);
assert.equal(continuous.validAll,0);
assert.deepEqual(continuous.histogram,
  [3494,7004,6828,4452,1876,555,149,24,6,1,0,0,0,0,0,0,0,0,0]);

let start=0;
const perPage = [];
const sourcePages = [];
for (const p of originalPages) {
  const arr = p.page === 15 ? p.indices.slice(20) : p.indices;
  sourcePages.push({page:p.page, n:arr.length, start});
  const sites=allPositions.filter(i=>i>=start&&i<start+arr.length)
    .map(i=>i-start);
  const check=scanAllSeeds(arr,sites);
  perPage.push({page:p.page,...check});
  start+=arr.length;
}
assert.equal(start,original.length);
const p17 = perPage.find(x=>x.page===17);
assert.deepEqual([p17.symbols,p17.singletons,p17.best,p17.validAll],
  [273,5,4,0]);

// Planted authentic solved GP29 source material with the same 18
// manuscript-singleton coordinates but independently known A/I/O values.
// The arbitrary positive secret [2,3,5] is never used on original data.
const clear = gp.pages[57].indices;
assert.equal(clear.length,95);
const native = Array.from({length:original.length},(_,i)=>clear[i%95]);
allPositions.forEach((i,j)=>{native[i]=[24,10,3][j%3];});
const nativeCipher=encode(native,[2,3,5]);
assert.deepEqual(decode(nativeCipher,[2,3,5]),native);
assert.equal(scanAllSeeds(nativeCipher,allPositions).validAll>0,true);
const p17Plant=native.slice(sourcePages[2].start,
  sourcePages[2].start+sourcePages[2].n);
const localSites=allPositions.filter(i=>i>=sourcePages[2].start &&
 i<sourcePages[2].start+sourcePages[2].n).map(i=>i-sourcePages[2].start);
const p17Cipher=encode(p17Plant,[2,3,5]);
assert.deepEqual(decode(p17Cipher,[2,3,5]),p17Plant);
assert.equal(scanAllSeeds(p17Cipher,localSites).validAll>0,true);

console.log(JSON.stringify({
  status:'PASS',
  source:'original p15 prime square / first-party MOBIUS, p15..22 printed singletons',
  squarefreeMask:masked,
  exactKeyspace:29**3,
  originalContinuous:continuous,
  originalPerPage:perPage.map(({page,symbols,singletons,best,validAll})=>
    ({page,symbols,singletons,best,validAll})),
  decisivePage:17,
  nativeGP29Positive:{chapterRecovered:1883,page17Recovered:273,
    sourceSingletonsReencoded:18,allSeedValidPositive:true},
  decision:'all-secret fixed-rate additive Tribonacci is impossible for every original singleton when printed word boundaries are plaintext boundaries; 0/24389 continuous seeds, 0/24389 even with a fresh seed for p17.'
},null,2));
