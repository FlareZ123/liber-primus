'use strict';

/**
 * SFT: source-motivated 3x3 Gaussian deblurring of the original LP2 p32 11x11
 * GP29 matrix. Run: node sims/lp2_p32_gaussian_blur_inverse_sft.cjs
 * Node.js 22, CommonJS, no external dependencies or file writes.
 * Historical status: exploratory hypothesis, not an authenticated cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const source = corpus.pages.find(p => p.page === 32).indices;
const N = 11;
const Q = 29;
assert.equal(source.length, N * N);

/** @param {number} a @returns {number} */
function mod(a) { return ((a % Q) + Q) % Q; }
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let n = 1; n < Q; n++) if (mod(a * n) === 1) return n;
  throw Error('Singular GF29 element');
}
/** @param {number[]} a @returns {number[][]} */
function square(a) {
  assert.equal(a.length, N * N);
  return Array.from({length: N}, (_, r) => a.slice(r*N, (r+1)*N));
}
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  return a.map(row => Array.from({length:N}, (_,j) =>
    mod(row.reduce((sum, v, k) => sum + v * b[k][j], 0))
  ));
}
/** @param {number[][]} original @returns {number[][]} */
function invertMatrix(original) {
  const a = original.map((row,r) => [
    ...row, ...Array.from({length:N}, (_,c) => Number(r === c))
  ]);
  for (let c=0;c<N;c++) {
    let pivot=c;
    while (pivot<N && a[pivot][c]===0) pivot++;
    assert.ok(pivot<N, 'noninvertible blur');
    [a[c],a[pivot]]=[a[pivot],a[c]];
    const coefficient=inverse(a[c][c]);
    for(let j=0;j<2*N;j++) a[c][j]=mod(a[c][j]*coefficient);
    for(let r=0;r<N;r++) if(r!==c) {
      const factor=a[r][c];
      for(let j=0;j<2*N;j++) a[r][j]=mod(a[r][j]-factor*a[c][j]);
    }
  }
  return a.map(row => row.slice(N));
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts=Array(Q).fill(0);
  for(const v of a) counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const sourceSquare=square(source);
assert.equal(sourceSquare[0].reduce((s,r)=>s+corpus.prime[r],0),563);
assert.equal(sourceSquare.reduce((s,row)=>s+corpus.prime[row[0]],0),569);
const T=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>
  r===c?2:Math.abs(r-c)===1?1:0));
const inverseT=invertMatrix(T);
/** @param {number[]} input @returns {number[]} */
function blur(input) {
  return multiply(multiply(T,square(input)),T).flat()
    .map(v=>mod(v*inverse(16)));
}
/** @param {number[]} input @returns {number[]} */
function deblur(input) {
  return multiply(multiply(inverseT,square(input)),inverseT).flat()
    .map(v=>mod(16*v));
}
const plain=deblur(source);
assert.deepEqual(blur(plain),source);
assert.ok(Math.abs(ioc(source)-0.03415977961432507)<1e-12);
assert.ok(Math.abs(ioc(plain)-0.02975206611570248)<1e-12);

// Independently known, genuinely readable solved-p57 prose as a test plant.
const nativeText=('LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED '+
  'OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE ')
  .toUpperCase().replace(/[^A-Z]/g,'').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'CW').repeat(3);
const dict=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const native=[];
for(let pos=0;native.length<121;) {
  const hit=dict.find(x=>nativeText.startsWith(x.token,pos));
  assert.ok(hit, 'normalize native solved source into GP rune alphabet');
  native.push(hit.index);
  pos+=hit.token.length;
}
assert.deepEqual(deblur(blur(native)),native);
const render=a=>a.map(i=>corpus.translit[i]).join('');
console.log(JSON.stringify({
  original:'physical p32 / 49.jpg', axisPrimeSums:[563,569],
  kernel:'[[1,2,1],[2,4,2],[1,2,1]] / 16 mod29; zero-pad',
  originalIoC:ioc(source), decodedIoC:ioc(plain),
  decodedRows:square(plain).map(render),
  originalReencrypted:source.length, nativePlantRecovered:native.length
},null,2));
console.log('No original GP plaintext recovered by Gaussian inverse.');
