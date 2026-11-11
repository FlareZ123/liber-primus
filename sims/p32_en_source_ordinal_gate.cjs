'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @returns {number} */
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
/** @param {number} n @returns {number} */
function nthPrime(n) {
  let left = n;
  for (let i = 2; ; i++) {
    let prime = true;
    for (let p = 2; p * p <= i; p++) {
      if (i % p === 0) { prime = false; break; }
    }
    if (prime && --left === 0) return i;
  }
}
/**
 * Printed page-local fragments, including possible one-rune incoming carries.
 * Physical line wrapping is ignored, but punctuation terminates a word.
 * @param {string} source
 * @param {Map<string,number>} runeToId
 * @param {number[]} primes
 * @param {string[]} names
 */
function parsePage(source, runeToId, primes, names) {
  let pos = 0, start = 0, word = [];
  const words = [];
  function finish() {
    if (!word.length) return;
    const sum = word.reduce((s,id) => s + primes[id], 0);
    words.push({start, count:word.length, text:word.map(x=>names[x]).join(''), sum, phi:phi(sum)});
    word = [];
  }
  for (const ch of source) {
    const idx = runeToId.get(ch);
    if (idx !== undefined) {
      if (!word.length) start = pos;
      word.push(idx); pos++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Printed line wrapping.
    } else finish();
  }
  finish();
  return {count:pos, words};
}
/**
 * Canonical whole-book word stream, preserving cross-page words.
 * @param {string} raw
 * @param {Map<string,number>} runeToId
 * @param {number[]} primes
 * @returns {Array<{page:number,endPage:number,sum:number,phi:number}>}
 */
function canonicalWords(raw, runeToId, primes) {
  let page = 0, startPage = 0, endPage = 0, word = [];
  const words = [];
  function finish() {
    if (!word.length) return;
    const sum = word.reduce((s,id) => s + primes[id], 0);
    words.push({page:startPage,endPage,sum,phi:phi(sum)});
    word = [];
  }
  for (const ch of raw.split('%').slice(0,55).join('%')) {
    const idx = runeToId.get(ch);
    if (idx !== undefined) {
      if (!word.length) startPage=page;
      word.push(idx); endPage=page;
    } else if (ch === '%') page++;
    else if (ch === '/' || /\s/u.test(ch)) {}
    else finish();
  }
  finish();
  return words;
}
function main() {
  const dir = path.join(__dirname,'..','resources','liber-primus');
  const corpus=JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8'));
  const raw=fs.readFileSync(path.join(dir,'lp2-transcription.txt'),'utf8');
  const runeToId=new Map(corpus.runes.map((v,i)=>[v,i]));
  const pages=raw.split('%');
  let eligible=0;
  const matchingWords=[];
  for(let i=0;i<55;i++){
    const physical=i>=50?i+1:i;
    const parsed=parsePage(pages[i],runeToId,corpus.prime,corpus.translit);
    const source=corpus.pages.find(x=>x.page===physical);
    assert.ok(source);
    assert.equal(parsed.count,source.indices.length);
    if(parsed.count<104)continue;
    eligible++;
    const word=parsed.words.find(x=>x.start===102&&x.count===2);
    if(word)matchingWords.push({page:physical,word:word.text,sum:word.sum,phi:word.phi});
  }
  assert.equal(eligible,52);
  assert.deepEqual(matchingWords,[
    {page:24,word:'XR',sum:58,phi:28},
    {page:32,word:'EN',sum:96,phi:32},
    {page:34,word:'NA',sum:126,phi:36},
    {page:37,word:'AEX',sum:148,phi:72},
  ]);
  const all=canonicalWords(raw,runeToId,corpus.prime);
  assert.equal(all.length,2896);
  const self=all.filter(w=>w.page===w.endPage && w.phi===(w.page>=50?w.page+1:w.page));
  assert.equal(self.length,16);
  const p32=corpus.pages.find(x=>x.page===32);
  assert.ok(p32);
  assert.equal(p32.indices.length,121);
  const row=p32.indices.slice(0,11).reduce((s,i)=>s+corpus.prime[i],0);
  const col=Array.from({length:11},(_,r)=>p32.indices[r*11]).reduce((s,i)=>s+corpus.prime[i],0);
  assert.deepEqual([row,col],[563,569]);
  assert.deepEqual([nthPrime(103),nthPrime(104),nthPrime(96),nthPrime(97)],[563,569,503,509]);
  assert.equal(p32.indices.slice(102,106).map(i=>corpus.translit[i]).join(''),'ENNW');
  assert.equal(phi(96),32);
  // Source-selected two-rune EN walk, with the *inferred* initial-cell origin.
  const ePos=102, firstEast=ePos+1, nextNorth=firstEast-11;
  assert.equal(firstEast,103);
  assert.equal(nextNorth,92);
  assert.equal(corpus.translit[p32.indices[nextNorth]],'M');
  const localP32=parsePage(pages[32],runeToId,corpus.prime,corpus.translit);
  assert.ok(localP32.words.some(w=>w.start===102&&w.count===2&&w.text==='EN'));
  assert.ok(localP32.words.some(w=>w.start===92&&w.count===5&&w.text==='MBUDS'));
  const buds=p32.indices.slice(93,97).map(i=>corpus.translit[i]).join('');
  assert.equal(buds,'BUDS');
  const budSum=p32.indices.slice(93,97).reduce((s,i)=>s+corpus.prime[i],0);
  assert.equal(budSum,206);
  assert.equal(budSum,2*103);
  assert.equal(phi(budSum),102);
  // Wrong-origin NN: offset103 -> 92 -> 81; ends inside another printed word.
  assert.equal(corpus.translit[p32.indices[81]],'NG');
  assert.ok(localP32.words.some(w=>w.start<81&&w.start+w.count>81));
  // Exact consecutive-window controls, including one boundary-crossing anagram.
  const windows=[];
  for(let start=0;start<=117;start++){
    const S=p32.indices.slice(start,start+4).reduce((s,i)=>s+corpus.prime[i],0);
    if(phi(S)===102)windows.push(start);
  }
  assert.deepEqual(windows,[93,94]);
  const out={treeImage:[row,col],primeOrdinalPositions:[103,104],eligiblePages:eligible,completeSourceWords:matchingWords,canonicalWords:all.length,wholePageSelfPointers:self.length,selectedPrimeSum:96,totientPage:32,ENwalk:[102,103,92],BUDSPrimeSum:206,BUDSTotientReturn:102,plaintextRecovered:false};
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
module.exports={phi,nthPrime,parsePage,canonicalWords};
