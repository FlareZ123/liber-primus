'use strict';

/**
 * LP2 p55 SHED field: exact cyclic-group exclusions and small-DH exponent gate.
 * Read-only, Node.js 22, CommonJS. Source: canonical original GP29 corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p55 = [21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10];
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.deepEqual(data.pages[55].indices, p55);
assert.equal(data.runes.length, 29);
assert.equal(p55.length, 76);
assert.equal(lengths.reduce((a,b)=>a+b,0), 76);

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) { while (b !== 0n) [a,b]=[b,a%b]; return a; }
/** @param {bigint} a @param {bigint} b @param {bigint} m @returns {bigint} */
function powMod(a,b,m) {
  let result=1n;
  for(let x=a%m,e=b;e>0n;e>>=1n,x=x*x%m) if(e&1n) result=result*x%m;
  return result;
}
/** @param {bigint} a @param {bigint} b @returns {{g:bigint,x:bigint}} */
function euclid(a,b) {
  let oldR=a,r=b,oldX=1n,x=0n;
  while(r!==0n){const q=oldR/r;[oldR,r]=[r,oldR-q*r];[oldX,x]=[x,oldX-q*x];}
  return {g:oldR,x:oldX};
}
/** @param {number[]} a @returns {bigint} */
const base29 = a => a.reduce((s,v)=>29n*s+BigInt(v),0n);
/** @param {bigint} n @returns {number[]} */
function gpDigits(n) {
  const a=[];
  for(let v=n;v>0n;v/=29n) a.push(Number(v%29n));
  return a.reverse();
}

const inner=[],outer=[];
let offset=1; // p55's first printed rune completes the carried p54 word.
for(const length of lengths.slice(1)){
  outer.push(p55[offset],p55[offset+length-1]);
  for(let i=offset+1;i<offset+length-1;i++) inner.push(p55[i]);
  offset+=length;
}
assert.equal(offset,76);
assert.equal(inner.length,43);
assert.equal(outer.length,32);
const N=base29(inner),E=base29(outer);
assert.equal(N,510043531279477768552291351270111060625364732293226050492113768n);
assert.equal(E,54546906948733185277568038540584540814742666891n);
assert.equal(N%8n,0n);
assert.equal(E%43n,0n);
const P=N/8n,Q=E/43n;

// P primality and the factor primality below are separately certified in
// sims/lp2_p55_shed_prime_shell_sft.cjs; this is the exact source-derived field.
const M=4n*5n*41n*49477n*15535963n;
const L=101149063843788281988908603592862658065019147521n;
assert.equal(M,630311729907820n);
assert.equal(P-1n,M*L);
for(const q of [2n,5n,41n,49477n,15535963n,L])
  assert.notEqual(powMod(Q,(P-1n)/q,P),1n);

assert.equal(gcd(P-1n,29n),1n);
assert.equal(gcd(P-1n,28n),4n);
assert.equal(gcd(P-1n,43n),1n);
assert.equal(P%29n,24n);
assert.equal(P%28n,9n);
assert.equal(P%43n,7n);

// When gcd(29,P-1)=1, taking 29th powers permutes EVERY nonzero
// residue. Thus no nontrivial 29th-residue class or order-29 subgroup.
const d29=((euclid(29n,P-1n).x%(P-1n))+(P-1n))%(P-1n);
for(const a of [2n,8n,19n,43n,Q])
  assert.equal(powMod(powMod(a,d29,P),29n,P),a);

// The published original DH miniature has public values A=8, B=19.
// Show even an unknown private exponent cannot be < 2^46 in the
// proposed p55 P,Q group: exact logs mod the 50-bit smooth factor M.
// These are independently checked algebraic certificates, not fitted keys.
const g=powMod(Q,L,P);
const candidateExponents=[
  [2n,242731746610657n],
  [8n,97883509924151n],
  [19n,250111533132869n],
  [43n,483581994079669n],
  [1033n,495201920893266n],
  [3301n,208442035865464n],
];
for(const [a,discreteLog] of candidateExponents){
  assert(discreteLog>=0n && discreteLog<M);
  assert.equal(powMod(g,discreteLog,P),powMod(a,L,P));
  console.log('public='+a+'; log_Q mod '+M+' = '+discreteLog);
}
assert(candidateExponents[1][1]>(1n<<46n));
assert(candidateExponents[2][1]>(1n<<46n));

// In contrast, 43rd powers ARE a permutation in this field, so test
// the uniquely defined source-selected 43rd root of Q without a key fit.
const d43=((euclid(43n,P-1n).x%(P-1n))+(P-1n))%(P-1n);
const root43=powMod(Q,d43,P);
assert.equal(powMod(root43,43n,P),Q);
const output=gpDigits(root43);
assert.equal(output.length,42);
assert.equal(root43,15234406656757422027455490330089151796805602605736279814014578n);
console.log('source_43rd_root_gp='+output.map(i=>data.translit[i]).join(' '));
console.log('PASS: original p55/LP2 p55 conditional GF(P) field restrictions');
