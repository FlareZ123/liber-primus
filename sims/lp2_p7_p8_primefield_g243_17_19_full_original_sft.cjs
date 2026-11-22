'use strict';
/**
 * GP29² p7→p8 source-clock and original-cipher two-rune multiplication gate.
 * The original p7 quartic has irreducible residual alpha²=8; p8's red title
 * products [4,3] give the reversed orientation g=3+4alpha of exact order840.
 * Read-only Windows 11 / Node22 / CommonJS test, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} a GP29² element [real, alpha]. @param {number[]} b Same. @returns {number[]} Product. */
const mul = (a,b) => [mod(a[0]*b[0]+8*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0])];
/** @param {number[]} a GP29² element. @param {number} n Nonnegative integer exponent. @returns {number[]} Power. */
function power(a,n) {
  let out = [1,0], base = a;
  for (let k = n; k > 0; k = Math.floor(k/2)) {
    if (k%2) out = mul(out,base);
    base = mul(base,base);
  }
  return out;
}
const g = [3,4];
const one = [1,0];
assert.deepEqual(power(g,840),one);
for (const factor of [2,3,5,7]) assert.notDeepEqual(power(g,840/factor),one);
assert.deepEqual(power(g,12), [17,25]);
assert.deepEqual(power(g,243), [17,19]);
assert.deepEqual(power(g,255), [0,23]);
const gp8 = corpus.pages.find((p) => p.page === 8).indices;
assert.equal(gp8.length,255);
assert.deepEqual(gp8.slice(0,3),[14,10,14]); // XIX
assert.equal(gp8[11],17); // last red GP B
assert.equal(gp8.length - 12,243);
const chapter = corpus.pages.filter(p => p.page >=33&&p.page<=39).flatMap(p=>p.indices);
assert.equal(chapter.length,1680);
const gInverse = power(g,839);
assert.deepEqual(mul(g,gInverse),one);
const ioc = (a) => {
  const f = new Array(29).fill(0);
  for (const x of a) f[x] += 1;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
/**
 * Multiplicative GF29² source clock, with original source blocks preserved.
 * @param {number[]} ciphertext Even-length GP29 rune tape.
 * @param {number} start Field exponent origin.
 * @param {number} stride Exponent step per two-rune field symbol.
 * @param {boolean} inverse Use g^(-start-stride*i).
 * @param {boolean} swap Swap the paired GP29 coordinate convention.
 * @returns {number[]} Output GP29 rune tape.
 */
function stream(ciphertext,start,stride,inverse,swap) {
  assert.equal(ciphertext.length%2,0);
  let state=power(inverse?gInverse:g,start);
  const step=power(inverse?gInverse:g,stride);
  let inverseState=power(inverse?g:gInverse,start);
  const inverseStep=power(inverse?g:gInverse,stride);
  const result=[];
  for(let i=0;i<ciphertext.length;i+=2){
    const block=ciphertext.slice(i,i+2);
    if(swap)block.reverse();
    const decodedInFieldBasis=mul(block,state);
    const decoded=swap?decodedInFieldBasis.slice().reverse():decodedInFieldBasis;
    result.push(...decoded);
    // Replay in the SAME field basis; only then undo the optional basis swap.
    const undo=mul(decodedInFieldBasis,inverseState);
    if(swap)undo.reverse();
    assert.deepEqual(undo,ciphertext.slice(i,i+2));
    state=mul(state,step);
    inverseState=mul(inverseState,inverseStep);
  }
  assert.equal(result.length,ciphertext.length);
  return result;
}
const p8Cipher=gp8.slice(12).concat(corpus.pages[9].indices[0]);
assert.equal(p8Cipher.length,244);
const smallModels=[];
for(const [start,stride] of [[0,1],[6,1],[0,2],[12,2]]){
  for(const inverse of [false,true])for(const swap of [false,true]){
    const out=stream(p8Cipher,start,stride,inverse,swap);
    smallModels.push({start,stride,inverse,swap,ioc:ioc(out),first24:out.slice(0,24).map(x=>corpus.translit[x]).join(' ')});
  }
}
const longModels=[];
for(const inverse of [false,true])for(const swap of [false,true]){
  const out=stream(chapter,0,1,inverse,swap);
  longModels.push({inverse,swap,ioc:ioc(out),first24:out.slice(0,24).map(x=>corpus.translit[x]).join(' ')});
}
assert.equal(smallModels.length,16);
assert.equal(longModels.length,4);
assert(smallModels.every(x=>x.ioc<0.04));
assert(longModels.every(x=>x.ioc<0.04));
console.log(JSON.stringify({
  field:'GF29[alpha]/(alpha^2-8)',generator:g,order:840,
  powers:{red12:power(g,12),black243:power(g,243),full255:power(g,255)},
  p8Source:{red12:gp8.slice(0,12),blackRuneCount:243},
  originalP8PlusP9First:smallModels,
  originalP33to39:longModels,
  classification:'exact source-field cue; direct full-register inverse nonprose'
},null,2));
console.log('PASS 840-cycle source powers and 20 original fixed multiplication models');
