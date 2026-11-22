'use strict';
/**
 * Exact original 81²/80² bookend arbitrary nonlinear 29x29 pair-permutation
 * obstruction. Every fixed invertible GP29xGP29 mixer (ALL 841! secret
 * permutations) must preserve empirical joint entropy. Consequently its
 * first and second GP29 outputs both have a source-derived entropy floor.
 *
 * Single runnable Windows 11 / Node 22 / CommonJS source test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]);
assert.equal(tape.length,12956);
const A=tape.slice(0,6561),suffix=tape.slice(6561);
const numeralHoles=new Set([2244,2384,2476,2575,2672]);
const B=Array(6400).fill(null);
for(let i=0,j=0;i<B.length;i++)if(!numeralHoles.has(i))B[i]=suffix[j++];
assert.deepEqual([A.length,suffix.length,B.filter(x=>x===null).length],
  [6561,6395,5]);
assert.deepEqual(tape.slice(6555,6561),tape.slice(-6));

/**
 * Multiply GF(3⁴) value a by primitive g=x+1, using
 * p7-derived irreducible f=x⁴+x²+x+1, basis 1,x,x²,x³.
 * @param {number} a Integer field basis index 0…80.
 */
function timesG(a) {
  const d=[0,0,0,0,0];
  for(let i=0;i<4;i++){let t=a%3;a=Math.floor(a/3);d[i]+=t;d[i+1]+=t;}
  const top=d[4]%3;
  for(let i=0;i<3;i++)d[i]-=top;
  return d.slice(0,4).reduce((s,x,i)=>s+((x%3+3)%3)*3**i,0);
}
const g=[1];while(g.length<80)g.push(timesG(g.at(-1)));
assert.deepEqual([new Set(g).size,timesG(g.at(-1))],[80,1]);
const actualPos=Array.from({length:6400},(_,i)=>i)
  .filter(i=>B[i]!==null);
assert.equal(actualPos.length,6395);
const C=actualPos.map(i=>B[i]);
const keys={
  'field original GF81 g^r,g^c':actualPos.map(i=>
    A[g[Math.floor(i/80)]*81+g[i%80]]),
  'literal original interior crop':actualPos.map(i=>
    A[(Math.floor(i/80)+1)*81+i%80+1])
};

/** @param {number[]} values */
function entropy(values) {
  const frequency=Array(Math.max(...values)+1).fill(0);
  for(const n of values)frequency[n]++;
  const N=values.length;
  return -frequency.reduce((sum,x)=>x?
    sum+x/N*Math.log2(x/N):sum,0);
}
/** @param {number[]} left @param {number[]} right */
function pairEntropy(left,right) {
  assert.equal(left.length,right.length);
  const pairs=left.map((x,i)=>29*x+right[i]);
  assert.ok(pairs.every(i=>i>=0&&i<841));
  return entropy(pairs);
}
const referencePlain=encodeSourceNativeGP(fs.readFileSync(path.join(root,
  'resources/control/gibran_prophet_58585.txt'),'utf8'));
assert.ok(referencePlain.length>=6395);
const G=referencePlain.slice(0,6395);
const nativeEntropy=entropy(referencePlain);
const log29=Math.log2(29);
assert.ok(Math.abs(nativeEntropy-4.2944425927154635)<1e-10);
assert.ok(Math.abs(log29-4.857980995127572)<1e-10);

// Deterministically generate a fully secret *arbitrary* reversible
// 841-point nonlinear permutation and prove exact dual-stream recovery.
let seed=0x81c33401;
/** @returns {number} */
function random32() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;
}
const arbitraryBijection=Array.from({length:841},(_,i)=>i);
for(let i=840;i>0;i--) {
  const j=random32()%(i+1);
  [arbitraryBijection[i],arbitraryBijection[j]]=
    [arbitraryBijection[j],arbitraryBijection[i]];
}
assert.equal(new Set(arbitraryBijection).size,841);
const inverse=Array(841);
arbitraryBijection.forEach((x,i)=>inverse[x]=i);

const outputs=[];
for(const [name,K] of Object.entries(keys)){
  const observedKeyEntropy=entropy(K);
  const observedJointEntropy=pairEntropy(K,C);
  // For any secret invertible (29x29)->(29x29) substitution F, every
  // output GP29 P,Q preserves joint H(P,Q)=H(K,C). Since each output
  // has entropy <= log2 29, it follows H(P)>=H(K,C)-log2 29.
  const minimumEachOutput=observedJointEntropy-log29;
  assert.ok(minimumEachOutput>4.75);
  const expected=name.startsWith('field')?
    9.623414939082686:9.61526417415164;
  assert.ok(Math.abs(observedJointEntropy-expected)<1e-10);
  assert.ok(minimumEachOutput-nativeEntropy>.46);

  // Plant A: arbitrary 841! two-symbol mixer, both plaintext rune
  // streams recovered EXACTLY, joint entropy preserved under permutation.
  const aux=G.map(()=>random32()%29);
  const plaintextPair=G.map((p,i)=>29*p+aux[i]);
  const encryptedPair=plaintextPair.map(i=>arbitraryBijection[i]);
  const recoveredPair=encryptedPair.map(i=>inverse[i]);
  assert.deepEqual(recoveredPair,plaintextPair);
  const fakeK=encryptedPair.map(i=>Math.floor(i/29));
  const fakeC=encryptedPair.map(i=>i%29);
  assert.ok(Math.abs(pairEntropy(fakeK,fakeC)-
    pairEntropy(G,aux))<1e-10);
  assert.ok(entropy(G)>=pairEntropy(fakeK,fakeC)-log29-1e-10);

  // Plant B: reversible source-fixed triangular pair mapping
  // (K,C) <-> (Q=K,P=C-K mod29). This keeps the authentic original
  // K coordinate stream and directly recovers all native GP29 values.
  const syntheticC=K.map((x,i)=>(x+G[i])%29);
  const recoveredG=syntheticC.map((c,i)=>(c-K[i]+29)%29);
  assert.deepEqual(recoveredG,G);
  assert.ok(Math.abs(pairEntropy(K,syntheticC)-
    pairEntropy(K,G))<1e-10);

  outputs.push({
    name,sourceOriginalPairs:C.length,
    sourceHKeyBits:observedKeyEntropy,
    sourceHCipherBits:entropy(C),
    sourceHInputPairBits:observedJointEntropy,
    exactMinEntropyOfEitherOutputBits:minimumEachOutput,
    fullEnglishGibranNativeEntropyBits:nativeEntropy,
    exclusionMarginBits:minimumEachOutput-nativeEntropy,
    all841PermutationPositiveRecovery:recoveredPair.length,
    sourcePreservingTriangularNativeRecovery:recoveredG.length
  });
}
console.log(JSON.stringify({
  source:'Original LP2 12956 GP29 runes, 81²/80² bookend, five real printed numeral gaps, p7 GF81 source field or literal crop key',
  theorem:'For EVERY fixed secret 841! invertible two-GP-rune pair transform F, H(P,Q)=H(K,C), hence BOTH decoded output marginals H(P),H(Q)>=H(K,C)-log2(29).',
  ordinaryEnglishNativeSourceGibranEntropyBits:nativeEntropy,
  original:outputs,
  scope:'Strict exclusion of original two-rune stationary invertible pair mixers yielding a direct GP29 ordinary-English output. Does not exclude changing/pair-private operations, transposition, extra side channels, or high-entropy intermediate plaintext.'
},null,2));
console.log('PASS: original source 841! all-secret pair-mixer entropy obstruction and 2 fully reversible native plants');
