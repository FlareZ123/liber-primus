'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find((p) => p.page === 32);
assert.equal(page.indices.length, 121);
const field = page.indices.map((i) => corpus.prime[i]);
const ringOffsets = [];
for (let c = 3; c <= 7; c++) ringOffsets.push(3 * 11 + c);
for (let r = 4; r <= 7; r++) ringOffsets.push(r * 11 + 7);
for (let c = 6; c >= 3; c--) ringOffsets.push(7 * 11 + c);
for (let r = 6; r >= 4; r--) ringOffsets.push(r * 11 + 3);
const ring = ringOffsets.map((i) => field[i]);
assert.deepEqual(ring, [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107]);
assert.equal(ring.reduce((s, v) => s + v, 0), 1136);

const MOD = 29;
/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let i = 1; i < MOD; i++) if (mod(a * i) === 1) return i;
  throw Error('Expected nonzero invertible denominator');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
  return [mod(a[0]*b[0]+a[1]*b[2]),mod(a[0]*b[1]+a[1]*b[3]),
    mod(a[2]*b[0]+a[3]*b[2]),mod(a[2]*b[1]+a[3]*b[3])];
}
/** @param {number[]} m @returns {number} */
function projectiveOrder(m) {
  if (mod(m[0]*m[3]-m[1]*m[2])===0) return 0;
  let power=[1,0,0,1];
  for(let i=1;i<=60;i++){
    power=multiply(power,m);
    if(power[1]===0 && power[2]===0 && power[0]===power[3])return i;
  }
  throw Error('Unexpected PGL2 order');
}
/** @param {number[]} values @returns {object} */
function analyze(values){
  const m=values.map(mod);
  const den=mod(13*m[2]+m[3]);
  return {sums:values,residues:m,trace:mod(m[0]+m[3]),
    determinant:mod(m[0]*m[3]-m[1]*m[2]),order:projectiveOrder(m),
    image13:den===0?null:mod((13*m[0]+m[1])*inverse(den))};
}

// Corner-exclusive decomposition; three interior cells on each side.
// Corner 0: North/West; 4: North/East; 8: East/South; 12: South/West.
const interiors = [
  ring.slice(1,4).reduce((a,b)=>a+b,0),
  ring.slice(5,8).reduce((a,b)=>a+b,0),
  ring.slice(9,12).reduce((a,b)=>a+b,0),
  ring.slice(13,16).reduce((a,b)=>a+b,0),
];
const corners=[ring[0],ring[4],ring[8],ring[12]];
const options=[[0,3],[0,1],[1,2],[2,3]];
const assignments=[];
for(let mask=0;mask<16;mask++){
  const sides=interiors.slice();
  const bits=[];
  for(let corner=0;corner<4;corner++){
    const choice=(mask>>>corner)&1;
    bits.push(choice);
    sides[options[corner][choice]]+=corners[corner];
  }
  assignments.push({bits,...analyze(sides)});
}
const canonical=assignments.find(x=>x.sums.join(',')==='275,257,373,231');
assert(canonical);
assert.deepEqual(canonical.bits,[0,0,1,0]);
assert.deepEqual(canonical.residues,[14,25,25,28]);
assert.deepEqual([canonical.trace,canonical.determinant,canonical.order,canonical.image13],[13,28,7,24]);

const matches=assignments.filter(x=>x.trace===13&&x.determinant===28&&x.order===7&&x.image13===24);
assert.equal(matches.length,1);
assert.equal(matches[0],canonical);

// Conventional inclusive edge sums double-count every corner.
const inclusive=analyze([
  ring.slice(0,5).reduce((a,b)=>a+b,0),
  ring.slice(4,9).reduce((a,b)=>a+b,0),
  ring.slice(8,13).reduce((a,b)=>a+b,0),
  [...ring.slice(12),ring[0]].reduce((a,b)=>a+b,0)
]);
assert.deepEqual(inclusive.sums,[275,347,373,339]);
assert.deepEqual([inclusive.trace,inclusive.determinant,inclusive.order,inclusive.image13],[5,15,28,17]);

const quarterCuts=[];
for(let start=0;start<16;start++){
  const rotated=Array.from({length:16},(_,i)=>ring[(i+start)%16]);
  const sums=Array.from({length:4},(_,k)=>rotated.slice(4*k,4*k+4).reduce((a,b)=>a+b,0));
  quarterCuts.push({start,...analyze(sums)});
}
assert.deepEqual(quarterCuts[0].sums,[222,310,332,272]);
assert.equal(quarterCuts.filter(x=>x.trace===13&&x.determinant===28&&x.order===7&&x.image13===24).length,0);

console.log(JSON.stringify({
  evidence:'fixed original LP2 p32 GP-prime central 5x5 perimeter',
  ring,
  corner_exclusive: {
    original_corner_ownership:canonical.bits,
    original:canonical,
    assignments:assignments.length,
    same_full_signature:matches.length,
    order7:assignments.filter(x=>x.order===7).length,
    other_assignments:assignments.filter(x=>x!==canonical).map(({bits,sums,order,image13})=>({bits,sums,order,image13}))
  },
  inclusive,
  equal_quarter: {phase_zero:quarterCuts[0],any_full_signature:0,orders:quarterCuts.map(x=>x.order)},
  decision:'The 7-cycle requires a particular horizontal-corner-ownership convention; all are exact source computations but no unique historical selector or LP2 plaintext is obtained'
},null,2));
