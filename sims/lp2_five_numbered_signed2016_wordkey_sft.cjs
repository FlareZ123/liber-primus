'use strict';

// Post-2016 candidate only: the two ten-dot brackets and red item labels
// 1..5 select the signed words PRIMUS / IS THE WAY ITS WORDS. Test whether
// the five selected words supply actual historical GP29 Vigenere key material.
// This is a source-constrained rejection, not authenticated 2014 instruction.
// Run under Windows Node.js 22 as one read-only SFT.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const signedText = signed.slice(
  signed.indexOf('\n\n') + 2,
  signed.indexOf('\n-----BEGIN PGP SIGNATURE-----')
);
const signedWords = signedText.match(/[A-Za-z]+/g).map((w) => w.toUpperCase());
assert.deepEqual(signedWords.slice(9, 16), [
  'LIBER', 'PRIMUS', 'IS', 'THE', 'WAY', 'ITS', 'WORDS',
]);
assert.equal(signedWords[20], 'MEANING');
assert.equal(signedWords[26], 'NUMBERS');

const tx = read('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
assert.equal(tx.length >= 39, true);
for (let n = 1; n <= 5; n++) {
  assert.equal(tx.slice(36,39).join('\n').includes(String(n) + '-'), true);
}
const unit = [
  corpus.pages[36].indices.slice(99, 238),
  corpus.pages[37].indices.slice(0, 91),
  corpus.pages[37].indices.slice(91, 189),
  corpus.pages[37].indices.slice(189, 228).concat(corpus.pages[38].indices.slice(0, 57)),
  corpus.pages[38].indices.slice(57, 186),
];
assert.deepEqual(unit.map((x) => x.length), [139,91,98,96,129]);
const all = unit.flat();
assert.equal(all.length, 553);
const expected = corpus.pages[36].indices.slice(99,238)
  .concat(corpus.pages[37].indices, corpus.pages[38].indices.slice(0, 186));
assert.deepEqual(all, expected);

const normalized = ['ING','TH','NG','EO','OE','AE','IA','EA'];
const index = new Map(corpus.translit.map((r,i) => [r,i]));
const normalize = (s) => s.replace(/V/g, 'U').replace(/K|Q/g, 'C').replace(/Z/g, 'S');
/** @param {string} s */
function gp(s) {
  const value = normalize(s).replace(/[^A-Z]/g,'').match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g);
  return value.map((token) => {
    if (token === 'ING') return index.get('NG');
    if (token === 'IA') return index.get('IA');
    assert.equal(index.has(token), true, 'unknown GP value ' + token);
    return index.get(token);
  });
}
const controlKey = gp('PRIMUSISTHEWAYITSWORDS');
assert.equal(controlKey.length, 21);
const perUnit = signedWords.slice(11,16);
assert.deepEqual(perUnit.map(gp).map(a=>a.length), [2,2,3,3,5]);
const mod = (x) => (x % 29 + 29) % 29;

/**
 * Full nondeterministic authentication of the solved-p56 plaintext-F
 * transparency. At ciphertext F, allow literal plaintext F without
 * consuming a key, or a non-F plaintext on the ordinary consuming path.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign 1 for (C+K), -1 for (C-K) plaintext
 * @returns {{blockedAt: number, states: number}}
 */
function allF(cipher,key,sign) {
  let phases=new Set([0]);
  for (let i=0;i<cipher.length;i++) {
    const next=new Set();
    for (const phase of phases) {
      if (cipher[i]===0) next.add(phase);
      const plain=mod(cipher[i]+sign*key[phase%key.length]);
      if (plain!==0) next.add((phase+1)%key.length);
    }
    phases=next;
    if (!phases.size) return {blockedAt:i,states:0};
  }
  return {blockedAt:-1,states:phases.size};
}
/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign
 */
function vigenere(input,key,sign) {
  return input.map((n,i)=>mod(n+sign*key[i%key.length]));
}
/** @param {number[]} a */
function ioc(a) {
  const h=Array(29).fill(0);
  for(const n of a) h[n]++;
  return h.reduce((z,n)=>z+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const show=(a)=>a.map(n=>corpus.translit[n]).join('-');
/**
 * Encrypt source GP cleartext under historical F transparency.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} inverseSign
 */
function encryptF(plain,key,inverseSign) {
  let clock=0;
  return plain.map((r)=>{
    if(r===0) return 0;
    const v=mod(r-inverseSign*key[clock%key.length]);
    clock++;
    return v;
  });
}

const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const planted=Array.from({length:553},(_,i)=>solved[i%95]);
for (const inverseSign of [-1,1]) {
  for (let u=0;u<5;u++) {
    const key=gp(perUnit[u]);
    const original=unit[u];
    const flat=vigenere(original,key,inverseSign);
    assert.deepEqual(vigenere(flat,key,-inverseSign),original);
    const fResult=allF(original,key,inverseSign);
    assert.equal(fResult.states,0, 'original must not remain plausible after key');
    const plant=planted.slice(0,original.length);
    const synthetic=encryptF(plant,key,inverseSign);
    const fPositive=allF(synthetic,key,inverseSign);
    assert.equal(fPositive.blockedAt,-1);
    console.log(JSON.stringify({
      packet:u+1, key:perUnit[u], sign:inverseSign, sourceRunes:original.length,
      originalFlatIoC:ioc(flat), fHistoricalBlocksAt:fResult.blockedAt,
      clearSourcePrefix40:show(flat.slice(0,40)),
      solvedPlantReachable:fPositive.states>0,
    }));
  }
  const flat=vigenere(all,controlKey,inverseSign);
  assert.deepEqual(vigenere(flat,controlKey,-inverseSign),all);
  const r=allF(all,controlKey,inverseSign);
  assert.equal(r.states,0);
  const synthetic=encryptF(planted,controlKey,inverseSign);
  assert.equal(allF(synthetic,controlKey,inverseSign).blockedAt,-1);
  console.log(JSON.stringify({
    whole553:true, key:'PRIMUSISTHEWAYITSWORDS', sign:inverseSign,
    sourceRunes:all.length, originalFlatIoC:ioc(flat),
    fHistoricalBlocksAt:r.blockedAt, flatPrefix40:show(flat.slice(0,40)),
    solvedPlantReachable:true,
  }));
}
console.log('PASS original five numbered intervals, 2016 signed word-index keys, ' +
  '12 independent F-branch impossibilities, F-positive planted source GP, ' +
  'and exact flat GP29 forward/roundtrips. Neither historical key transfer deciphers original numbered text.');
