'use strict';
/**
 * Direct numeric-word-map hypothesis selected from the 2016 signed "words are
 * the map / numbers are the direction" clue and original 11x11 p32 source.
 *
 * 22 printed words, lengths 1..11 -> eleven literal 1-based coordinates.
 * Freeze adjacent vs 11+11 halves, and row/column orientation (four readouts).
 * A selected readout supplies an eleven-rune GP29 additive key to p33–34;
 * both signs and page-local key starts. No phase fitting or source-free KDF.
 *
 * Run: node sims/lp2_p32_22word_length_coordinate_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname,'..');
const read = (f) => fs.readFileSync(path.join(ROOT,f),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page = (n) => {
  const p = corpus.pages.find((x) => x.page === n);
  assert.ok(p);
  return p.indices;
};
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const originalP32 = transcription.split('%')[32];
assert.ok(originalP32);
const letters = new Set(corpus.runes);
const words = originalP32.replace(/[\r\n/\s]/g,'').split(/[-.]/)
  .map((chunk) => Array.from(chunk).filter((c) => letters.has(c)))
  .filter((w) => w.length);
const lengths = words.map((w) => w.length);
const canon32 = page(32), canon33 = page(33), canon34 = page(34);
const reconstructed = words.flatMap((w) => w.map((r) => corpus.runes.indexOf(r)));
assert.deepEqual(reconstructed, canon32);
assert.equal(words.length, 22);
assert.equal(reconstructed.length, 121);
assert.deepEqual(lengths,[1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]);
assert.equal(Math.max(...lengths), 11);
const translit = (v) => v.map((i) => corpus.translit[i]).join('');

/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  arr.forEach((r) => { assert.ok(r>=0 && r<29); counts[r]++; });
  return counts.reduce((s,v) => s + v * (v-1),0)/(arr.length*(arr.length-1));
}
/** @param {number} value @param {number} key @param {number} sign */
function shift(value,key,sign) {
  return ((value + sign*key)%29+29)%29;
}
const known = {
  'adjacent/firstRow': [25,14,20,2,2,23,20,15,17,10,27],
  'adjacent/firstColumn': [2,0,20,1,17,21,3,12,8,1,14],
  'halves/firstRow': [27,27,9,16,23,17,17,26,27,19,27],
  'halves/firstColumn': [21,19,19,23,21,15,17,7,27,9,14],
};
assert.equal(page(57).length,95);
console.log('SOURCE_P32_WORDS_22_MATRIX_11x11', JSON.stringify({
  lengths,p32R:canon32.length,originalIoC33:ioc(canon33),
  originalIoC34:ioc(canon34),solvedP57IoC:ioc(page(57))
}));
for (const split of ['adjacent','halves']) {
  for (const orientation of ['firstRow','firstColumn']) {
    const coords = Array.from({length:11},(_,i) => {
      const a = (split==='adjacent'?lengths[i*2]:lengths[i])-1;
      const b = (split==='adjacent'?lengths[i*2+1]:lengths[i+11])-1;
      assert.ok(a>=0 && a<11 && b>=0 && b<11);
      return orientation==='firstRow'?11*a+b:11*b+a;
    });
    const key = coords.map((i) => canon32[i]);
    assert.deepEqual(key,known[split+'/'+orientation]);
    console.log('SOURCE_COORDINATE_READOUT',JSON.stringify({
      split,orientation,coords,key,translit:translit(key)
    }));
    for (const sign of [-1,1]) {
      const pages = [canon33,canon34].map((src) =>
        src.map((v,i) => shift(v,key[i%11],sign)));
      const restored = pages.map((p) =>
        p.map((v,i) => shift(v,key[i%11],-sign)));
      assert.deepEqual(restored,[canon33,canon34]);

      const plain = [canon33,canon34].map((src) => src.map(
        (_,i) => page(57)[i % page(57).length]));
      const enc = plain.map((src) =>
        src.map((v,i) => shift(v,key[i%11],-sign)));
      const recovered = enc.map((src) =>
        src.map((v,i) => shift(v,key[i%11],sign)));
      assert.deepEqual(recovered,plain);

      console.log('SOURCE_NUMERIC_MAP_DIRECT_KEY',JSON.stringify({
        split,orientation,sign,
        originalIoC33:ioc(pages[0]),
        originalIoC34:ioc(pages[1]),
        p33Head:translit(pages[0].slice(0,50)),
        exactOriginalReencrypt:canon33.length+canon34.length,
        exactNativePositive:plain.flat().length,
      }));
    }
  }
}
