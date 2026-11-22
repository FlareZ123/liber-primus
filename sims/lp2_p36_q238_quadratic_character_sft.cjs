/**
 * Source-locked quadratic-character gate for physical LP2 p36 in GF(29^238).
 * Original p39 red GP polynomial is a square, and the original p50 table
 * carries the independently factored irreducible field polynomial Q238.
 * This test checks BOTH natural coefficient orders of exactly 238 p36 runes.
 * Read-only single-file test for Node.js 22. No external packages.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json')));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json')));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json')));
const N = 238;
const mod = value => ((value % 29) + 29) % 29;

/** @param {number[]} a @param {number[]} b */
function polyMultiply(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) c[i+j] = mod(c[i+j] + a[i]*b[j]);
  return c;
}

const p39span = ink.pages.find(p => p.page === 39).red_spans.find(s => s.start === 119 && s.length === 3);
assert.ok(p39span, 'original red three-rune mark');
const red = corpus.pages[39].indices.slice(119, 122);
assert.deepEqual(red, [27,5,15]);
assert.deepEqual([mod(15*24*24), mod(-2*15*24), 15], red, '15(x-24)^2');
assert.equal(grid.byte_rows.flat().length, 256);
assert.equal(grid.rows.flat().length, 256);

const smallFactors = [
  [5,1], [5,1], [11,18,1], [24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1],
];
let g16 = [1];
for (const factor of smallFactors) g16 = polyMultiply(g16, factor);
assert.equal(g16.length, 17);

const remainder = grid.byte_rows.flat().reverse().map(x => x % 29);
const quotient = Array(N + 1).fill(0);
for (let k = 255; k >= 16; k--) {
  const factor = remainder[k];
  if (k === 255) { assert.equal(factor, 0); continue; }
  quotient[k-16] = factor;
  for (let j = 0; j < 17; j++)
    remainder[k-16+j] = mod(remainder[k-16+j] - factor*g16[j]);
}
assert.deepEqual(remainder.slice(0,16), Array(16).fill(0), 'source factor must divide original table');
assert.equal(quotient[238], 28);
const Q = quotient.map(x => mod(x*28)); // monic Q238
assert.equal(Q[0], 5);
assert.equal(Q[238], 1);
let norm = 0;
for (let k = N; k >= 0; k--) norm = mod(-norm + Q[k]);
assert.equal(norm, 21, 'norm(x+1)=Q238(-1)');
assert.equal(Number(21n**14n % 29n), 28, '21 is nonsquare in GF29');

const ONE = [1, ...Array(N-1).fill(0)];
const MINUS_ONE = [28, ...Array(N-1).fill(0)];
const equal = (a,b) => a.every((x,i) => x === b[i]);

/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const p = new Int32Array(2*N-1);
  for (let i = 0; i < N; i++) {
    const ai = a[i];
    if (ai) for (let j = 0; j < N; j++) p[i+j] += ai*b[j];
  }
  for (let k = 2*N-2; k >= N; k--) {
    const factor = mod(p[k]);
    if (factor) for (let j = 0; j < N; j++)
      p[k-N+j] = mod(p[k-N+j] - factor*Q[j]);
  }
  return Array.from(p.slice(0,N), mod);
}

/** @param {number[]} a @param {bigint} exponent */
function power(a,exponent) {
  let result = ONE, base = a;
  while (exponent > 0n) {
    if (exponent & 1n) result = multiply(result, base);
    exponent >>= 1n;
    if (exponent) base = multiply(base,base);
  }
  return result;
}

const fieldOrder = 29n**238n;
const legendreExponent = (fieldOrder - 1n)/2n;
assert.equal(legendreExponent % 28n, 0n,
  'every base-field scalar is square in this even extension');
const z = [1,1,...Array(N-2).fill(0)]; // x+1 fixed by source norm
assert.ok(equal(power(z, legendreExponent), MINUS_ONE), 'independent field nonresidue control');

// Plant a 238-rune English-GP element from the original solved PARABLE source.
assert.equal(corpus.pages[57].indices.length, 95);
const plant = Array.from({length:N}, (_,i) => corpus.pages[57].indices[i%95]);
const plantedSquare = multiply(plant, plant);
assert.ok(equal(power(plantedSquare,legendreExponent),ONE), 'positive-square classification');

// Exact field square-root positive-control via Tonelli-Shanks, with v2(q-1)=3.
let odd = fieldOrder-1n, twos = 0;
while((odd & 1n) === 0n) { odd >>= 1n; twos++; }
assert.equal(twos, 3);
function squareRootOfKnownResidue(value) {
  let c = power(z,odd);
  let x = power(value,(odd+1n)/2n);
  let t = power(value,odd);
  let m = twos;
  while(!equal(t,ONE)) {
    let i = 1, current = multiply(t,t);
    while(!equal(current,ONE) && i < m) { current = multiply(current,current); i++; }
    assert.ok(i<m, 'Tonelli-Shanks must converge for a square');
    const b = power(c, 1n<<BigInt(m-i-1));
    const b2 = multiply(b,b);
    x = multiply(x,b);
    t = multiply(t,b2);
    c = b2; m = i;
  }
  assert.ok(equal(multiply(x,x),value));
  return x;
}
const recovered = squareRootOfKnownResidue(plantedSquare);
assert.ok(equal(recovered,plant) || equal(recovered,plant.map(x=>mod(-x))),
  'positive plant must recover exactly its plaintext up to the unavoidable sign');

const original = corpus.pages[36].indices;
assert.equal(original.length,N);
const checks = [];
for (const [orientation, state] of [
  ['printed-order-as-ascending-coefficients', original],
  ['printed-order-as-descending-coefficients', original.slice().reverse()],
]) {
  const character = power(state,legendreExponent);
  assert.ok(equal(character,MINUS_ONE), 'original p36 should be a nonsquare in both source orders');
  checks.push({orientation,character:'-1',squaredPreimages:0});
}
console.log(JSON.stringify({
  source: 'original physical p36, p39 red perfect-square triad, p49-51 Q238',
  field:'GF(29^238)', sourceP39Factor:'15*(x-24)^2',
  q238Constant:Q[0], normWitness:'Norm(x+1)=21 (GF29 nonresidue)',
  p36RuneCount:N, orientations:checks, positiveGpPlantRecovered:N,
  allNonzeroGp29ScalarMultipliersExcluded:true,
  result:'Source-fixed p36 direct square and all nonzero GF29-scaled squares are impossible for both natural coefficient orders; no plaintext.'
},null,2));
