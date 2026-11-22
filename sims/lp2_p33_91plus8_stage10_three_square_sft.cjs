'use strict';
/**
 * Director #578 original-source 91+8/99 three-square Hill inverse.
 * No key placement, phase, row/column, digit-order, padding, or score search.
 * Runnable from the root: node sims/lp2_p33_91plus8_stage10_three_square_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const book = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const matrices = fs.readFileSync(path.join(root,
  'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n\s*\r?\n/)
  .map(chunk => chunk.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
const digits = [1,0,3,3,3,3,0,1];
assert.deepEqual(matrices.map(A => A.length), [5,7,5]);
const p33 = book.pages[33].indices;
assert.equal(p33.length, 214);
const original = p33.slice(0,91).concat(digits);
assert.equal(original.length, 99);
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} x */
function reciprocal(x) { for(let y=1;y<29;y++) if(mod(x*y)===1) return y; throw Error('not a unit'); }
/** @param {number[][]} A */
function invert(A) {
 const n = A.length;
 const M = A.map((row,i) => row.map(mod).concat(
   Array.from({length:n},(_,j) => Number(i===j))));
 for(let i=0;i<n;i++){
   let pivot=i; while(pivot<n && !M[pivot][i])pivot++;
   assert.ok(pivot<n,'source matrix must be invertible');
   [M[i],M[pivot]]=[M[pivot],M[i]];
   const s=reciprocal(M[i][i]);
   for(let k=0;k<2*n;k++)M[i][k]=mod(s*M[i][k]);
   for(let j=0;j<n;j++)if(j!==i){
     const v=M[j][i];
     for(let k=0;k<2*n;k++)M[j][k]=mod(M[j][k]-v*M[i][k]);
   }
 }
 return M.map(row=>row.slice(n));
}
/** @param {number[][]} A @param {number[]} tokens */
function hill(A,tokens) {
 const n=A.length;assert.equal(tokens.length%n,0);
 const result=[];
 for(let j=0;j<tokens.length;j+=n){
   for(const row of A)result.push(mod(row.reduce((sum,v,i)=>sum+v*tokens[j+i],0)));
 }
 return result;
}
/** @param {number[]} symbols */
function ioc(symbols) {
 const f=new Array(29).fill(0);
 for(const v of symbols)f[v]++;
 return f.reduce((sum,v)=>sum+v*(v-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} xs @param {number[][]} transforms */
function mapThree(xs,transforms) {
 assert.equal(xs.length,99);
 const split=[xs.slice(0,25),xs.slice(25,74),xs.slice(74,99)];
 return split.flatMap((part,i)=>hill(transforms[i],part));
}
const inverse = matrices.map(invert);
const decoded = mapThree(original,inverse);
assert.deepEqual(mapThree(decoded,matrices),original);
const native = book.pages[57].indices.slice(0,91).concat(digits);
assert.equal(native.length,99);
const encrypted = mapThree(native,matrices);
assert.deepEqual(mapThree(encrypted,inverse),native);
const wrongMatrices = [inverse[2],inverse[1],inverse[0]];
const wrong = mapThree(encrypted,wrongMatrices);
assert.ok(wrong.some((v,i)=>v!==native[i]));
console.log(JSON.stringify({
 source:'p33 first91 GP29 original runes + 8 literal decimal digits 1033 3301; original Stage10 three matrices row-major [5x5 3301,7x7 1033,5x5 1033]',
 exactOriginalRoundtrip:true, native99Roundtrip:true, wrong5x5DoesNotRecover:true,
 raw91IoC:ioc(original.slice(0,91)),
 threeInverses:{original91IoC:ioc(decoded.slice(0,91)),
  trailer8:decoded.slice(91), first91:decoded.slice(0,91),
  first91Translit:decoded.slice(0,91).map(x=>book.translit[x]).join(' ')},
 nativeControl:{ioC:ioc(native.slice(0,91)),wrongIoC:ioc(wrong.slice(0,91))},
 meaning:'A fixed 91+8 relation has no evidential force unless complete 91-rune source language and independent ciphertext prediction emerge.'
},null,2));
