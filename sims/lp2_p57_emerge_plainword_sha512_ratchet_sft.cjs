'use strict';
/**
 * LP2 original-input SHA-512 previous-PLAINTEXT-word ratchet, p57 EMERGE seed.
 * This tests a distinct data dependency from prior ciphertext-word SHA scans.
 *
 * SFT: node sims/lp2_p57_emerge_plainword_sha512_ratchet_sft.cjs
 * Read-only; Windows 11, Node.js 22; standard library and project word parser.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root,p),'utf8'); }
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const doc = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
const cipherWords = doc.words.map(w=>[...w.runes].map(g=>db.runes.indexOf(g)));
assert.equal(doc.runeCount,12956);
assert.equal(cipherWords.length,2896);
assert(cipherWords.every(w=>w.length>0&&w.every(x=>x>=0&&x<29)));
const flattened = cipherWords.flat();
assert.equal(flattened.length,12956);
const cipherPages=db.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(cipherPages.length,55);
assert.deepEqual(flattened,cipherPages.flatMap(p=>p.indices));

const solved=db.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
const startWord=solved.slice(-6);
assert.deepEqual(startWord,[18,19,18,4,6,18],
  'Source p57 really ends with the six-GP-rune word EMERGE');
const startCipher=solved.at(-1);
assert.equal(startCipher,18);
/** @param {number} x @param {number} n @returns {number} */
function mod(x,n){return ((x%n)+n)%n;}
/**
 * @param {number[]} previousClear
 * @param {'runes'|'primes'} representation
 * @returns {Buffer}
 */
function key(previousClear,representation){
  const data=representation==='runes'
    ? Buffer.from(previousClear.map(x=>db.runes[x]).join(''),'utf8')
    : Buffer.from(previousClear.map(x=>db.prime[x]).join(','),'ascii');
  return crypto.createHash('sha512').update(data).digest();
}
/**
 * @typedef {{representation:'runes'|'primes',mode:'direct'|'rank28',sign:1|-1}} Option
 * @param {number[][]} words
 * @param {Option} opt
 * @returns {number[][]}
 */
function inverse(words,opt){
  let previousPlain=startWord;
  let previousCipher=startCipher;
  const recovered=[];
  for(const word of words){
    const h=key(previousPlain,opt.representation);
    const plain=[];
    for(let j=0;j<word.length;j++){
      const c=word[j],pad=h[j%h.length];
      if(opt.mode==='direct') plain.push(mod(c+opt.sign*(pad%29),29));
      else {
        const delta=mod(c-previousCipher,29);
        plain.push(delta===0?28:mod(delta-1+opt.sign*(pad%28),28));
      }
      previousCipher=c;
    }
    recovered.push(plain);
    previousPlain=plain;
  }
  return recovered;
}
/**
 * @param {number[][]} plainWords
 * @param {Option} opt
 * @returns {number[][]}
 */
function forward(plainWords,opt){
  let previousPlain=startWord;
  let previousCipher=startCipher;
  const encrypted=[];
  for(const word of plainWords){
    const h=key(previousPlain,opt.representation);
    const cipher=[];
    for(let j=0;j<word.length;j++){
      const p=word[j],pad=h[j%h.length];
      const c=opt.mode==='direct'
        ? mod(p-opt.sign*(pad%29),29)
        : p===28 ? previousCipher
          : mod(previousCipher+1+mod(p-opt.sign*(pad%28),28),29);
      cipher.push(c);
      previousCipher=c;
    }
    encrypted.push(cipher);
    previousPlain=word;
  }
  return encrypted;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
  const h=Array(29).fill(0);
  for(const x of xs)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
/** @param {number} a @param {number} b @returns {number[]} */
function originalSpan(a,b){
  const from=cipherPages.filter(p=>p.page<a).reduce((s,p)=>s+p.indices.length,0);
  const to=cipherPages.filter(p=>p.page<=b).reduce((s,p)=>s+p.indices.length,0);
  assert(to-from>=200);
  return [from,to];
}
/** @param {number[]} xs @param {number} cap @returns {string} */
function preview(xs,cap=200){
  return xs.slice(0,cap).map(x=>db.translit[x]).join(' ');
}
const regions=[
  {pages:'p16–21',indices:originalSpan(16,21)},
  {pages:'p40–53',indices:originalSpan(40,53)}
];
const controls=[];
const expectedP57IoC=ioc(solved);
assert(expectedP57IoC>0.05);
const opts=[];
for(const representation of ['runes','primes'])
for(const mode of ['direct','rank28'])
for(const sign of [-1,1])opts.push({representation,mode,sign});
assert.equal(opts.length,8);

let repeatPairs=0;
for(const page of cipherPages)for(let j=1;j<page.indices.length;j++)
  if(page.indices[j]===page.indices[j-1])repeatPairs++;
assert.equal(repeatPairs,86);

// Full-size native-GP plant under identical ORIGINAL word lengths. A true
// plaintext-word-ratchet must recover all implanted symbols exactly even
// though each next word's hash depends on the previous recovered word.
const plant=[];
let k=0;
for(const w of cipherWords){
  plant.push(Array.from({length:w.length},()=>solved[(k++)%solved.length]));
}
assert.equal(k,12956);
for(const opt of opts){
  const plantedCipher=forward(plant,opt);
  assert.deepEqual(inverse(plantedCipher,opt),plant);
  assert.deepEqual(forward(inverse(cipherWords,opt),opt),cipherWords);
  const plain=inverse(cipherWords,opt).flat();
  const regional=regions.map(({pages,indices})=>({
    pages,runeCount:indices[1]-indices[0],
    ioc:ioc(plain.slice(...indices)),
    sample200:preview(plain.slice(...indices))
  }));
  controls.push({
    ...opt,
    allOriginalRunes:plain.length,
    first200:preview(plain),
    wholeBookIoC:ioc(plain),
    recoveredRepeatMarkerCount:plain.filter(x=>x===28).length,
    regions:regional
  });
}
const high=Math.max(...controls.flatMap(z=>z.regions.map(y=>y.ioc)));
const nativeSample=preview(solved,95);
console.log(JSON.stringify({
  original:'p0–p55, 12956 untouched GP runes, 2896 source words; p57 final EMERGE',
  seedTranslit:'EMERGE',
  previousWordOperand:'RECOVERED PLAINTEXT, never ciphertext',
  digest:'SHA-512, one digest per completed word',
  originalWithinPageDoublets:repeatPairs,
  originalRegionNames:regions.map(z=>z.pages),
  authenticSolvedP57:{runes:solved.length,ioc:expectedP57IoC,translit:nativeSample},
  tests:controls,
  highestOriginalRegionIoC:high,
  fullInverseAndNativeGpPlants:'8/8 pass 12956 exact symbols',
  interpretation: high<0.05
    ? 'Bounded negative: no continuous native-GP English in either long source region under these eight fixed plaintext-word ratchets'
    : 'Potential unusual regional IoC; inspect source and separate blind evidence before any plaintext claim'
},null,2));
