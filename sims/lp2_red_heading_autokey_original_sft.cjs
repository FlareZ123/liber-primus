'use strict';

/**
 * Source-locked test of ordinary GP29 plaintext- and ciphertext-autokey
 * using each LP2 chapter's original visibly red opening rune span.
 * No tuned keys, offsets, punctuation resets, or F bypass.
 * Run: node sims/lp2_red_heading_autokey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'lp2-ink-annotations.json'), 'utf8'));
const CHAPTERS = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const MOD = 29;

/** @param {number} x @returns {number} */
function mod29(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {number[]} glyphs @returns {number} */
function ioc(glyphs) {
  const counts = Array(MOD).fill(0);
  for (const x of glyphs) counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(glyphs.length*(glyphs.length-1));
}

/**
 * @param {number[]} ct
 * @param {number[]} key
 * @param {'plain'|'cipher'} mode
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decrypt(ct,key,mode,sign) {
  const p = [];
  for (let i=0;i<ct.length;i++) {
    const k = i<key.length ? key[i] : mode==='plain' ? p[i-key.length] : ct[i-key.length];
    p.push(mod29(ct[i]+sign*k));
  }
  return p;
}

/**
 * @param {number[]} p
 * @param {number[]} key
 * @param {'plain'|'cipher'} mode
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encrypt(p,key,mode,sign) {
  const ct=[];
  for (let i=0;i<p.length;i++) {
    const k = i<key.length ? key[i] : mode==='plain' ? p[i-key.length] : ct[i-key.length];
    ct.push(mod29(p[i]-sign*k));
  }
  return ct;
}

assert.equal(corpus.runes.length,29);
assert.equal(corpus.pages.length,58);
const native=corpus.pages[57].indices;
assert.equal(native.length,95);
const nativePlant = Array.from({length:300},(_,i)=>native[i%native.length]);
assert(ioc(nativePlant)>0.06,'Authentic clear GP57 must have English-like unigram concentration');

let decoded=0;
let maxOriginal=-Infinity;
for (const [start,end] of CHAPTERS) {
  const page = corpus.pages[start];
  const ann = ink.pages.find(p=>p.page===start);
  assert(ann?.red_spans?.length>0 && ann.red_spans[0].start===0,'Original colored heading required');
  const key = page.indices.slice(0,ann.red_spans[0].length);
  const sourceRunes = corpus.pages.slice(start,end+1).flatMap(p=>p.indices);
  const ct = sourceRunes.slice(key.length);
  assert(ct.length>=250,'Bodied chapter has enough original input');
  const item={chapter:'p'+start+'-p'+end,keyLength:key.length,ciphertextRunes:ct.length,cipherIoC:ioc(ct),variants:[]};
  for (const mode of /** @type {('plain'|'cipher')[]} */(['plain','cipher'])) {
    for (const sign of /** @type {(1|-1)[]} */([-1,1])) {
      const plantCipher=encrypt(nativePlant,key,mode,sign);
      const recovered=decrypt(plantCipher,key,mode,sign);
      assert.deepEqual(recovered,nativePlant,'Native GP57 encode/decode positive plant must round-trip');
      const p=decrypt(ct,key,mode,sign);
      const score=ioc(p);
      assert(Number.isFinite(score));
      maxOriginal=Math.max(maxOriginal,score);
      item.variants.push({mode,sign,originalPlainIoC:+score.toFixed(9),nativePlantIoC:+ioc(recovered).toFixed(9)});
      decoded++;
    }
  }
  console.log('CHAPTER',JSON.stringify(item));
}
assert.equal(decoded,36);
assert(maxOriginal<0.045,'If a genuinely high-native-IoC output appears, stop and investigate');
console.log('SUMMARY',JSON.stringify({source:'canonical original 2014 LP2 JPEG-aligned rune and ink inventories',variants:decoded,maxOriginalIoC:maxOriginal,clearP57IoC:ioc(native),recoveredPlantIoC:ioc(nativePlant),status:'bounded negative for literal red-opening, ordinary GP29 autokey, unreset, no F bypass'}));
