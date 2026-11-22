'use strict';

/**
 * Source-selected 2014 99-number -> minimal GP29 digits vs the corrected
 * original 49 complete p33 black words (198 runes, including 2 carried p34).
 *
 * The three authenticated 2014 Stage7 squares total 99 integers; shortest
 * base29 encodings produce exactly 188 GP digits, leaving 10 of the 198
 * black runes as a potential 10-rune IV. This is a physical clue hypothesis,
 * NOT an authenticated plaintext. Test its frozen, simple cipher inverses:
 *   (1) recover a 10-periodic source-key from the first ten known glyphs,
 *       predict the 178 held-out original GP runes, not fit to them;
 *   (2) test plaintext/ciphertext 10-back autokey constraints;
 *   (3) exclude ANY stationary phase10 GP29 substitution by conflicting
 *       (phase,known-source-symbol)->cipher-symbol original pairs;
 *   (4) recover whole 188-symbol hypothetical Vigenere and Beaufort keys
 *       without guessing, then predict six distinct p34..p39 original
 *       188-rune regions under key reuse.
 *
 * Original sources: resources/liber-primus/lp2-transcription.txt,
 * lp2-corpus.json and resources/cicada2014-openpuff-magic-squares.txt.
 * Windows Node22 SFT: node sims/lp2_p33_stage7_188digit_iv10_source_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
const squareGroups = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(s=>s.trim().split(/\s+/).map(Number));

assert.equal(pages.length,57);
assert.deepEqual(squareGroups.map(g=>g.length),[25,49,25]);
for(let g=0;g<squareGroups.length;g++){
  const side=g===1?7:5, sum=g===0?3301:1033;
  const values=squareGroups[g];
  for(let i=0;i<side;i++){
    assert.equal(values.slice(i*side,(i+1)*side).reduce((a,b)=>a+b,0),sum);
    assert.equal(Array.from({length:side},(_,j)=>values[j*side+i]).reduce((a,b)=>a+b,0),sum);
  }
}

/** @param {number} n Source nonnegative integer, shortest exact base29. */
function digits29(n){
  assert.ok(Number.isInteger(n)&&n>=0);
  const out=[];
  do {out.unshift(n%29);n=Math.floor(n/29);}while(n>0);
  return out;
}

const parts = pages[33].replace(/[\s/]/g,'').split('&');
assert.equal(parts.length,2);
const groups = parts.map(s=>s.slice(s.indexOf('.')+1).split(/[-.]/).filter(Boolean));
assert.deepEqual(groups.map(g=>g.length),[21,28]);
const words=groups.flat();
assert.equal(words[48],'ᛒ');
assert.ok(pages[34].replace(/[\s/]/g,'').startsWith('ᛗᛒ-'));
words[48]+='ᛗᛒ';
const runemap=new Map(corpus.runes.map((r,i)=>[r,i]));
const sourceOriginal=[...words.join('')].map(r=>{
  assert.ok(runemap.has(r));
  return runemap.get(r);
});
assert.equal(sourceOriginal.length,198);

const perSquareLengths=squareGroups.map(g=>g.flatMap(digits29).length);
assert.deepEqual(perSquareLengths,[58,82,48]);
const hypothesizedPlain=squareGroups.flat().flatMap(digits29);
assert.equal(hypothesizedPlain.length,188);
const p33IV=sourceOriginal.slice(0,10);
const p33Cipher=sourceOriginal.slice(10);
assert.equal(p33Cipher.length,188);
const mod=n=>((n%29)+29)%29;
const cyclicKey=Array.from({length:10},(_,i)=>mod(p33Cipher[i]-hypothesizedPlain[i]));

// Exactly 10 source-derived positions train this hypothesis; 178 are untouched.
const predicted= hypothesizedPlain.map((v,i)=>mod(v+cyclicKey[i%10]));
assert.deepEqual(predicted.slice(0,10),p33Cipher.slice(0,10));
const predictedHits=predicted.slice(10).filter((v,i)=>v===p33Cipher[i+10]).length;
assert.equal(predictedHits,7);
const actualVigenereKey=p33Cipher.map((v,i)=>mod(v-hypothesizedPlain[i]));
const actualBeaufortKey=p33Cipher.map((v,i)=>mod(v+hypothesizedPlain[i]));
const plaintextAutokeyMatches=actualVigenereKey.slice(10).filter((k,i)=>k===hypothesizedPlain[i]).length;
const ciphertextAutokeyMatches=actualVigenereKey.slice(10).filter((k,i)=>k===p33Cipher[i]).length;
assert.equal(plaintextAutokeyMatches,2);
assert.equal(ciphertextAutokeyMatches,10);
assert.equal(cyclicKey.every((k,i)=>k===p33IV[i]),false);
assert.equal(cyclicKey.filter((k,i)=>k!==p33IV[i]).length,10);

// Even when the cipher alphabets for all 10 source-visible positions are
// arbitrary and secret, equal (phase,plaintext) pairs must yield equal
// original ciphertext. Count the exact unavoidable contradictions.
const grouped=new Map();
for(let i=0;i<hypothesizedPlain.length;i++){
  const k=`${i%10}:${hypothesizedPlain[i]}`;
  if(!grouped.has(k))grouped.set(k,[]);
  grouped.get(k).push(p33Cipher[i]);
}
let conflictingGroups=0,minMismatches=0;
for(const values of grouped.values()){
  const counts=new Map();
  for(const v of values)counts.set(v,(counts.get(v)??0)+1);
  if(counts.size>1)conflictingGroups++;
  minMismatches+=values.length-Math.max(...counts.values());
}
assert.equal(grouped.size,128);
assert.equal(conflictingGroups,48);
assert.equal(minMismatches,58);

/** @param {number[]} seq */
function ioc(seq){
 const freq=Array(29).fill(0);
 for(const x of seq)freq[x]++;
 return freq.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
/** @param {number[]} seq */
const gp=seq=>seq.slice(0,28).map(i=>corpus.translit[i]).join('-');

/** @param {number[]} key @param {number[]} plaintext @param {'vigenere'|'beaufort'} mode */
function enc(key,plaintext,mode){
 return plaintext.map((v,i)=>mod(mode==='vigenere'?v+key[i]:key[i]-v));
}
/** @param {number[]} key @param {number[]} cipher @param {'vigenere'|'beaufort'} mode */
function dec(key,cipher,mode){
 return cipher.map((v,i)=>mod(mode==='vigenere'?v-key[i]:key[i]-v));
}
assert.deepEqual(enc(actualVigenereKey,hypothesizedPlain,'vigenere'),p33Cipher);
assert.deepEqual(enc(actualBeaufortKey,hypothesizedPlain,'beaufort'),p33Cipher);
const clear57=corpus.pages[57].indices;
assert.equal(clear57.length,95);

console.log('Original p33: 49 complete black words including p34 carry = 198 GP29 runes');
console.log('Authentic 2014 Stage7 magic square entries 25/49/25 exact minimal base29 lengths 58/82/48 = 188');
console.log('Hypothetical layout 10 source-black IV + 188 known numerical GP runes, no historical author instruction establishing this encoding');
console.log('Recovered source-conjectural first10 GP29 shifts:',cyclicKey.join(','));
console.log('Period10 first10 trained and 178 heldout: matches='+predictedHits+'/178; uniform benchmark 178/29='+(178/29).toFixed(5));
console.log('Cross-stage key model: plaintext-autokey 10-back matches='+plaintextAutokeyMatches+'/178; ciphertext-autokey matches='+ciphertextAutokeyMatches+'/178');
console.log('All-secret phase10 codebook: '+grouped.size+' source state-symbol classes, '+conflictingGroups+' conflicting, minimum '+minMismatches+'/188 incorrect output runes');

for(const mode of ['vigenere','beaufort']){
 const key=mode==='vigenere'?actualVigenereKey:actualBeaufortKey;
 const positive=Array.from({length:188},(_,i)=>clear57[i%clear57.length]);
 assert.deepEqual(dec(key,enc(key,positive,mode),mode),positive,'Actual solved LP2 GP positive control');
 for(let page=34;page<=39;page++){
   const start=page===34?2:0, source=corpus.pages[page].indices.slice(start,start+188);
   assert.equal(source.length,188);
   const transformed=dec(key,source,mode);
   assert.deepEqual(enc(key,transformed,mode),source,'Exact untouched original reencryption');
   assert.ok(ioc(transformed)<0.04,'No genuine full original GP paragraph');
   console.log(`hypothesis ${mode} key reuse -> p${page}, 188 original runes, IoC ${ioc(transformed).toFixed(9)}, first28 ${gp(transformed)}`);
 }
}
console.log('PASS: 12 untouched original 188-rune full inverses, two native 188-GP positives, all-secret stationary ten-phase exclusion; no authentic original unknown plaintext');
