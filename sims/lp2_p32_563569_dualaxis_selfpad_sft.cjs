'use strict';

/**
 * Source-selected LP2 p32 11x11 dual-axis additive inverse.
 * Run: node sims/lp2_p32_563569_dualaxis_selfpad_sft.cjs
 *
 * The 2016 signed image dimensions 563x569 exactly equal the prime sums
 * of original p32 top row/left column in an 11x11 source-order square.
 * Test whether those two source-defined axes directly encrypt the remaining
 * 100 interior GP29 runes via separable row+column additive encryption.
 * No key search, image rescaling, offset fitting, or language tuning.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page32 = source.pages.find(p => p.page === 32).indices;
const solved57 = source.pages.find(p => p.page === 57).indices;
assert.equal(page32.length, 121);
assert.equal(solved57.length, 95);
const matrix = Array.from({length:11},(_,row) =>
  page32.slice(row*11,(row+1)*11));
const prime = source.prime;
assert.equal(matrix[0].reduce((sum,v)=>sum+prime[v],0),563);
assert.equal(matrix.reduce((sum,row)=>sum+prime[row[0]],0),569);
const interior = matrix.slice(1).flatMap(row=>row.slice(1));
assert.equal(interior.length,100);
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} letters @returns {number} */
function ioc(letters) {
  const count=Array(29).fill(0);
  for (const x of letters) count[x]++;
  return count.reduce((s,v)=>s+v*(v-1),0)/
    (letters.length*(letters.length-1));
}
/**
 * @param {'ordinal'|'prime'} basis
 * @param {'sum'|'sum-minus-corner'} mode
 * @returns {number[]}
 */
function key(basis, mode) {
  const numeric = basis === 'ordinal' ? x => x : x => prime[x];
  const corner = mode === 'sum-minus-corner' ? numeric(matrix[0][0]):0;
  const k = [];
  for(let row=1;row<11;row++)
    for(let col=1;col<11;col++)
      k.push(mod(numeric(matrix[row][0])+
        numeric(matrix[0][col])-corner));
  assert.equal(k.length,100);
  return k;
}
/**
 * @param {number[]} values
 * @param {number[]} shifts
 * @param {number} sign
 * @returns {number[]}
 */
function transform(values, shifts, sign) {
  assert.equal(values.length, shifts.length);
  return values.map((v,i)=>mod(v+sign*shifts[i]));
}
const cases=[];
const known100=solved57.concat(solved57.slice(0,5));
assert.equal(known100.length,100);
for (const basis of ['ordinal','prime'])
  for (const mode of ['sum','sum-minus-corner'])
    for (const sign of [-1,1]) {
      const shifts = key(basis,mode);
      const candidate=transform(interior,shifts,sign);
      assert.deepEqual(transform(candidate,shifts,-sign),interior);
      const planted=transform(known100,shifts,-sign);
      assert.deepEqual(transform(planted,shifts,sign),known100,
        'independent known GP source plaintext must recover 100/100');
      cases.push({basis,mode,sign,
        recoveredSymbols:candidate.length,
        ioc:ioc(candidate),
        first75:candidate.slice(0,75).map(v=>source.translit[v]).join('')
      });
    }
assert.equal(cases.length,8);
assert.equal(ioc(interior),0.03434343434343434);
const best=cases.slice().sort((a,b)=>b.ioc-a.ioc)[0];
assert.equal(best.ioc,0.03898989898989899);
assert.equal(best.basis,'ordinal');
assert.equal(best.sign,-1);
console.log(JSON.stringify({
  sourceGeometry:'p32 original 11x11, 563x569 prime axis sums',
  exactInput:{wholePage:121,axes:21,unseenInterior:100,
    originalInteriorIoC:ioc(interior)},
  inverseCases:cases,
  bestOriginalIoC:best,
  positivePlant:{knownSolvedP57Gp:95,copyOfKnownP57Gp:5,
    recoveredAll100OriginalGpSymbols:true,settings:8},
  decision:'All eight complete source-axis separable GP29 inverses are reversible but yield ciphertext-like 100-rune outputs. No recovered unknown plaintext or authenticated consumer.'
},null,2));
