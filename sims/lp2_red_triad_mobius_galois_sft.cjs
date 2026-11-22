'use strict';
/**
 * Frobenius/Möbius exact source relation for the two original red triads.
 *
 * LP2 p3:119 [13,23,2] fixes primitive quadratic
 *       u^2 = 3u + 8 over F29.
 * LP2 p39:119 [27,5,15] fixes the repeated Ac24 grid root.
 * The source-derived cross-inscription grid root z=23+27u has
 *       Tr(z) = N(z) = 11
 * and therefore Frobenius conjugate z^29 = z/(z-1).
 * All 18 cross-inscription ordered coordinate pairs are tested.
 *
 * This is source arithmetic, not a plaintext/cipher/author intention claim.
 * Run: node sims/lp2_red_triad_mobius_galois_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const mod = n => ((n % 29) + 29) % 29;
/** @typedef {[number,number]} E */

/** @param {E} a @param {E} b @returns {E} */
const add = (a,b) => [mod(a[0]+b[0]),mod(a[1]+b[1])];
/** @param {E} a @param {E} b @returns {E} */
const sub = (a,b) => [mod(a[0]-b[0]),mod(a[1]-b[1])];
/** @param {E} a @param {E} b @returns {E} */
const mul = (a,b) => [
  mod(a[0]*b[0]+8*a[1]*b[1]),
  mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])
];
/** @param {E} base @param {number} exponent @returns {E} */
function power(base,exponent) {
  /** @type {E} */
  let ans = [1,0];
  let v = base, n = exponent;
  while (n>0) {
    if(n%2 === 1) ans = mul(ans,v);
    n=Math.floor(n/2);
    if(n>0)v=mul(v,v);
  }
  return ans;
}
/** @param {E} x @returns {E} */
function inverse(x) {
  assert(x[0]!==0 || x[1]!==0);
  return power(x, 29*29-2);
}
/** @param {E} x @returns {E} */
function mobius(x) {
  return mul(x, inverse(sub(x,[1,0])));
}
/** @param {E} x @returns {E} */
function poly(x) {
  /** @type {E} */
  let out=[0,0];
  for (const c of grid.bytes) {
    out=mul(out,x);
    out[0]=mod(out[0]+c);
  }
  return out;
}
/** @param {E} x */
function traceNorm(x) {
  const conj=power(x,29);
  const trace=add(x,conj);
  const norm=mul(x,conj);
  assert.equal(trace[1],0);
  assert.equal(norm[1],0);
  return {trace:trace[0],norm:norm[0],conjugate:conj};
}
const triads=ink.pages.flatMap(p=>(p.red_spans||[])
  .filter(s=>s.length===3)
  .map(s=>({page:p.page,start:s.start,
    gp:[...s.runes].map(ch=>corpus.runes.indexOf(ch))})));
assert.deepEqual(triads,[
  {page:3,start:119,gp:[13,23,2]},
  {page:39,start:119,gp:[27,5,15]}
]);
const [first,second]=triads.map(t=>t.gp);
assert.deepEqual(power([0,1],840),[1,0]);
for(let k of [2,3,5,7])assert.notDeepEqual(power([0,1],840/k),[1,0]);
assert.equal(grid.bytes.length,256);

/** The exact finite cross-source candidate set: 3×3×2. */
const cases=[];
for(const orientation of [0,1])
  for(let i=0;i<3;i++)
    for(let j=0;j<3;j++){
      /** @type {E} */
      const z=orientation===0?[first[i],second[j]]:[second[j],first[i]];
      const {trace,norm}=traceNorm(z);
      cases.push({orientation,i,j,z,trace,norm,
        equalTraceNorm:trace===norm,
        isGridRoot:poly(z).every(v=>v===0)});
    }
assert.equal(cases.length,18);
const equal=cases.filter(x=>x.equalTraceNorm);
const roots=cases.filter(x=>x.isGridRoot);
assert.equal(equal.length,1);
assert.equal(roots.length,1);
assert.deepEqual(equal[0],roots[0]);
assert.deepEqual(equal[0].z,[23,27]);
const z=equal[0].z;
const {trace,norm,conjugate}=traceNorm(z);
assert.deepEqual([trace,norm],[11,11]);
assert.deepEqual(conjugate,[17,2]); // exact GF29² conjugate
assert.deepEqual(mobius(z),conjugate);
assert.deepEqual(mobius(conjugate),z);
assert.deepEqual(poly(z),[0,0]);
assert.deepEqual(poly(conjugate),[0,0]);
assert.deepEqual(sub(power(z,29),mobius(z)),[0,0]);
assert.deepEqual(mul(power(z,28),sub(z,[1,0])),[1,0]);
// The norm is the constant of monic irreducible quadratic.
// Its X coefficient is -trace = 18 (mod29).
assert.deepEqual([1,mod(-trace),norm],[1,18,11]);
let powerU=[1,0],log=-1,logConjugate=-1;
for(let k=0;k<840;k++){
  if(powerU[0]===z[0]&&powerU[1]===z[1])log=k;
  if(powerU[0]===conjugate[0]&&powerU[1]===conjugate[1])
    logConjugate=k;
  powerU=mul(powerU,[0,1]);
}
assert.equal(log,433);
assert.equal(logConjugate,797);
assert.equal(mod(24-13),11);
console.log(JSON.stringify({
  sourceTriads:triads,
  candidateCount:cases.length,
  equalTraceNormCandidates:equal,
  gridRootCandidates:roots,
  root:z,conjugate,
  trace,norm,irreducibleFactorDescending:[1,18,11],
  frobeniusEqualsMobius:true,
  discreteLogBaseU:log,
  conjugateLogBaseU:logConjugate,
  plaintextRecovered:false,
  provenanceLimit:'cross-source coordinate and Möbius pairing selected retrospectively'
},null,2));
