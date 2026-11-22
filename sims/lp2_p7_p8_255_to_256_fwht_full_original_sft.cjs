'use strict';
/**
 * An eight-layer GF29 butterfly over original p8's 255 rune tape and the
 * original 255 scroll words, motivated by the exact p7 red a,b,u,v,d example.
 * A length-preserving 255-coordinate inverse is built from a 256-point
 * butterfly by fixing the missing plaintext coordinate at zero.
 * Read-only Windows 11 / Node22 / CommonJS SFT, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const resource = (name) => fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
const C = JSON.parse(resource('lp2-corpus.json'));
const sections = resource('lp2-transcription.txt').split('%');
const indices = new Map(C.runes.map((r, i) => [r, i]));
const c8 = C.pages[8].indices;
assert.equal(c8.length, 255);
const c9 = C.pages[9].indices;
assert.equal(c9.length, 268);
const mod = (x) => (x % 29 + 29) % 29;
const modInv = (n) => {
  for (let i = 1; i < 29; i += 1) if (mod(n * i) === 1) return i;
  throw Error('noninvertible GF29 field element');
};
/**
 * Apply all eight levels of the actual p7 2x2 invertible butterfly
 * B=[1,1;-1,1], or reverse its eight levels with B^-1.
 * @param {number[]} input 256 GP29 symbols.
 * @param {boolean} inverse Whether to invert all levels.
 * @returns {number[]} 256 output GP29 values.
 */
function butterfly256(input, inverse) {
  assert.equal(input.length, 256);
  const z = input.slice();
  for (const half of inverse ? [128,64,32,16,8,4,2,1] : [1,2,4,8,16,32,64,128]) {
    for (let base = 0; base < 256; base += 2 * half) {
      for (let k = 0; k < half; k += 1) {
        const i = base + k, j = i + half;
        const a = z[i], b = z[j];
        if (inverse) {
          z[i] = mod(15 * (a - b));
          z[j] = mod(15 * (a + b));
        } else {
          z[i] = mod(a + b);
          z[j] = mod(b - a);
        }
      }
    }
  }
  return z;
}
const ioc = (values) => {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
};
const translit = (arr, count = 32) => arr.slice(0, count).map(i => C.translit[i]).join(' ');

/**
 * Exactly invert the 255-coordinate induced transform: source plaintext
 * position missingIndex is defined as GF29 zero. The unknown ciphertext
 * coordinate is solved algebraically, not scanned for English.
 * @param {number[]} sourceCipher The original 255 GP runes.
 * @param {number} missingIndex 0 for prefix, 255 for suffix.
 * @param {boolean} inverse B^-8, otherwise B^8.
 * @returns {{missingCipher:number,plain:number[],slope:number}}
 */
function constrainedInverse(sourceCipher, missingIndex, inverse) {
  assert.equal(sourceCipher.length, 255);
  const padded = new Array(256).fill(0);
  let read = 0;
  for (let i = 0; i < 256; i += 1) if (i !== missingIndex) padded[i] = sourceCipher[read++];
  const intercept = butterfly256(padded, inverse)[missingIndex];
  padded[missingIndex] = 1;
  const slope = mod(butterfly256(padded, inverse)[missingIndex] - intercept);
  const missingCipher = mod(-intercept * modInv(slope));
  padded[missingIndex] = missingCipher;
  const completePlain = butterfly256(padded, inverse);
  assert.equal(completePlain[missingIndex], 0);
  assert.deepEqual(butterfly256(completePlain, !inverse), padded);
  return { missingCipher, slope, plain: completePlain.filter((_, i) => i !== missingIndex) };
}
// 255 source scroll words, retaining genuine punctuation and page transitions.
const words = [];
let word = [];
for (let page = 3; page <= 7; page += 1) {
  for (const ch of sections[page]) {
    if (indices.has(ch)) word.push(indices.get(ch));
    else if ((ch === '-' || ch === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 255);
const wordProducts = words.map((w) => w.reduce((s, v) => mod(s * v), 1));
assert.deepEqual(wordProducts.slice(-5), [11,26,8,15,2]);

const full256 = [...c8, c9[0]];
assert.equal(full256.length, 256);
const direct = [false,true].map((inverse) => {
  const decoded = butterfly256(full256, inverse);
  assert.deepEqual(butterfly256(decoded, !inverse), full256);
  return { inverse, ioc: ioc(decoded), first32: translit(decoded) };
});
assert.ok(direct.every((v) => v.ioc < 0.04));
const truncated = [];
for (const missingIndex of [0,255]) for (const inverse of [false,true]) {
  const {missingCipher, slope, plain} = constrainedInverse(c8, missingIndex, inverse);
  truncated.push({missingIndex,inverse,missingCipher,slope,ioc:ioc(plain),first32:translit(plain)});
}
assert.ok(truncated.every((v) => v.ioc < 0.04));
const srcToP8 = [];
for (const padAtStart of [false,true]) for (const inverse of [false,true]) {
  const source = padAtStart ? [0,...wordProducts] : [...wordProducts,0];
  const output = butterfly256(source, inverse);
  const predicted = padAtStart ? output.slice(1) : output.slice(0,255);
  const equal = predicted.reduce((sum,x,i) => sum + (x === c8[i] ? 1 : 0),0);
  srcToP8.push({padAtStart,inverse,equalOf255:equal});
}
assert.deepEqual(srcToP8.map(x => x.equalOf255), [9,12,7,7]);

console.log(JSON.stringify({
  originalP8IOC:ioc(c8),
  fullP8FirstP9:direct,
  constrained255:truncated,
  source255ScrollWordsToP8:srcToP8,
  classification:'full original reversible operator negative; no unknown plaintext or source-selected sender'
},null,2));
console.log('PASS 256-point and 255-coordinate GF29 butterfly, original inputs and exact replay');
