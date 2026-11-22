'use strict';
/**
 * Source-correct original LP2 81^2/80^2 GF81 field-address (or literal crop)
 * as key-state, and complete-secret per-key GP29 alphabet exclusion via
 * exactly invariant conditional entropy. Windows 11 Node.js22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const all = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]);
assert.equal(all.length, 12956);
const A=all.slice(0,6561),tail=all.slice(6561);
const holes=new Set([2244,2384,2476,2575,2672]),B=Array(6400).fill(null);
for(let i=0,k=0;i<B.length;i++)if(!holes.has(i))B[i]=tail[k++];
assert.equal(tail.length, 6395);
assert.equal(B.filter(v=>v===null).length, 5);
assert.deepEqual(all.slice(6555,6561),all.slice(-6));

// Monic p7 original red-word GP products [11,26,8,15,2] reduce mod3
// to the irreducible GF(3^4) polynomial x^4+x^2+x+1; the p8 original
// red words supply 4 and3, with x+1 a primitive order80 generator.
function mulGenerator(a) {
  const d=[0,0,0,0,0];
  for(let i=0;i<4;i++){let r=a%3;a=Math.floor(a/3);d[i]+=r;d[i+1]+=r;}
  const top=d[4]%3;
  for(let j=0;j<3;j++)d[j]-=top;
  return d.slice(0,4).reduce((sum,v,i)=>sum+((v%3+3)%3)*3**i,0);
}
const g=[1];for(let i=1;i<80;i++)g.push(mulGenerator(g[i-1]));
assert.equal(new Set(g).size,80);
assert.equal(mulGenerator(g[79]),1);
const valid=Array.from({length:6400},(_,i)=>i).filter(i=>B[i]!==null);
assert.equal(valid.length,6395);
const C=valid.map(i=>B[i]);
const native=encodeSourceNativeGP(fs.readFileSync(path.join(root,
  'resources/control/gibran_prophet_58585.txt'), 'utf8'));
const other=encodeSourceNativeGP(fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'), 'utf8'));
assert.ok(native.length>=6395 && other.length>=6395);
const P=native.slice(0,6395);
const keys={
  'source field primitive generator': valid.map(i=>
    A[g[Math.floor(i/80)]*81+g[i%80]]),
  'literal 81x81 nonzero row-column crop': valid.map(i=>
    A[(Math.floor(i/80)+1)*81+(i%80)+1])
};

/** @param {number[]} values @returns {number} bits per rune */
function H(values) {
  const f=Array(29).fill(0);
  for (const x of values)f[x]++;
  const n=values.length;
  return -f.reduce((sum,count)=>count?
    sum+count/n*Math.log2(count/n):sum,0);
}
/**
 * Conditional entropy is exactly invariant under all unknown stationary
 * per-key permutations of the other GP29 alphabet. No secret alphabet
 * enumeration, independence assumption or English word score is needed.
 * @param {number[]} key
 * @param {number[]} values
 * @returns {number} bits per rune
 */
function Hgiven(key, values) {
  assert.equal(key.length,values.length);
  const states=Math.max(...key)+1;
  const f=Array.from({length:states},()=>Array(29).fill(0));
  const count=Array(states).fill(0);
  for(let i=0;i<values.length;i++){f[key[i]][values[i]]++;count[key[i]]++;}
  let bits=0;
  for(let i=0;i<states;i++)if(count[i])for(const n of f[i])if(n)
    bits-=n/values.length*Math.log2(n/count[i]);
  return bits;
}

let seed=0x81c3301;
function random32() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
/** @returns {number[]} */
function permutation() {
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--) {
    const j=random32()%(i+1);[p[i],p[j]]=[p[j],p[i]];
  }
  return p;
}
const tiny=1e-10;
const reference={
  gibranFullBits:H(native),
  shakespeareFullBits:H(other),
  gibran6395Bits:H(P),
  originalSourceCipherBits:H(C)
};
assert.ok(Math.abs(reference.gibranFullBits-4.2944425927154635)<tiny);
assert.ok(Math.abs(reference.shakespeareFullBits-4.2853769097505285)<tiny);
assert.ok(Math.abs(reference.originalSourceCipherBits-4.855496241305823)<tiny);

const outputs=[];
for(const [name,K] of Object.entries(keys)){
  const originalConditional=Hgiven(K,C);
  // Every proposed plaintext Q_i = pi[K_i](C_i) for arbitrary fixed
  // secret 29! permutations obeys
  // H(Q) >= H(Q|K) = H(C|K) EXACTLY on the observed empirical counts.
  // This covers the full (29!)^29 secret-alphabet family.
  assert.ok(originalConditional>4.76);
  const randomAlphabets=Array.from({length:29},()=>permutation());
  const reverseAlphabets=randomAlphabets.map(p=>{
    const inv=Array(29).fill(-1);
    p.forEach((v,i)=>inv[v]=i);
    return inv;
  });
  const plantedCipher=P.map((v,i)=>randomAlphabets[K[i]][v]);
  const rec=P.map((_,i)=>reverseAlphabets[K[i]][plantedCipher[i]]);
  assert.deepEqual(rec,P);
  assert.ok(Math.abs(Hgiven(K,P)-Hgiven(K,plantedCipher))<tiny);
  assert.ok(H(plantedCipher)>Hgiven(K,plantedCipher));
  assert.ok(originalConditional-H(native)>0.46);

  // Exactly 1024 original-cipher rune-marginal preserving shuffle controls.
  // These are descriptive; the keyless H(P) lower bound above does not
  // require a statistical p-value or the null model.
  const randomMI=[];
  for(let t=0;t<1024;t++){
    const sample=C.slice();
    for(let i=sample.length-1;i>0;i--) {
      const j=random32()%(i+1);
      [sample[i],sample[j]]=[sample[j],sample[i]];
    }
    randomMI.push(H(C)-Hgiven(K,sample));
  }
  const mi=H(C)-originalConditional;
  const controlMean=randomMI.reduce((a,b)=>a+b,0)/randomMI.length;
  const empiricalPUpper=(1+randomMI.filter(x=>x>=mi).length)/
    (randomMI.length+1);
  outputs.push({
    mapping:name,
    sourceRecoveredKeyStates:new Set(K).size,
    originalCipherEntropyBits:H(C),
    originalConditionalEntropyBits:originalConditional,
    exactMinPossiblePlaintextEntropyBits:originalConditional,
    originalMI:mi,
    nativeGibranFullEntropyBits:H(native),
    nativeShakespeareFullEntropyBits:H(other),
    nativeGibranExclusionMarginBits:originalConditional-H(native),
    permutedNativePlantedCipherEntropy:H(plantedCipher),
    permutedNativePlantedConditionalEntropy:Hgiven(K,plantedCipher),
    permutationPlantExactRecovery:rec.length,
    nullShuffleCount:1024,
    nullMeanMI:controlMean,
    nullUpperTail:empiricalPUpper
  });
}
assert.ok(Math.abs(outputs[0].originalConditionalEntropyBits-
  4.7695940712579565)<tiny);
assert.ok(Math.abs(outputs[1].originalConditionalEntropyBits-
  4.761411732063601)<tiny);
// Give each true original raster row, column, or wrapped diagonal its own
// ENTIRELY secret independently chosen GP29 permutation. This proves a
// larger, source-geometry-selected family key-independently by H(C|state).
const rowsA=Array.from({length:6561},(_,i)=>Math.floor(i/81));
const colsA=Array.from({length:6561},(_,i)=>i%81);
const rowsB=valid.map(i=>Math.floor(i/80));
const colsB=valid.map(i=>i%80);
const coordinateCases=[
 {name:'source A81 row',source:A,clock:rowsA,h:4.600918348534869},
 {name:'source A81 column',source:A,clock:colsA,h:4.589988594827367},
 {name:'source B80 row',source:C,clock:rowsB,h:4.586270602548661},
 {name:'source B80 column',source:C,clock:colsB,h:4.573269869128853},
 {name:'source B80 positive diagonal',source:C,
  clock:rowsB.map((r,i)=>(r+colsB[i])%80),h:4.57065439817325},
 {name:'source B80 negative diagonal',source:C,
  clock:rowsB.map((r,i)=>(r-colsB[i]+80)%80),h:4.573850644525693}
];
const coordinateOutputs=[];
for(const entry of coordinateCases){
 const {name,source,clock,h}=entry,observed=Hgiven(clock,source);
 assert.ok(Math.abs(observed-h)<tiny,name+' original source entropy');
 const referencePlain=native.slice(0,source.length);
 const permutations=Array.from({length:Math.max(...clock)+1},()=>permutation());
 const inverses=permutations.map(p=>{
  const inv=Array(29);
  p.forEach((v,i)=>inv[v]=i);
  return inv;
 });
 const cipherPlant=referencePlain.map((p,i)=>permutations[clock[i]][p]);
 const recovered=cipherPlant.map((v,i)=>inverses[clock[i]][v]);
 assert.deepEqual(recovered,referencePlain,name+' reversible native positive');
 assert.ok(Math.abs(Hgiven(clock,cipherPlant)-Hgiven(clock,referencePlain))<tiny);
 assert.ok(observed-H(native)>.27);
 coordinateOutputs.push({name,sourceRunes:source.length,
   separateSecretAlphabets:permutations.length,
   minimumPossibleDecodedEntropyBits:observed,
   excessOverFullGibranBits:observed-H(native),
   exactNativePlantRecovered:recovered.length});
}
assert.equal(coordinateOutputs.length,6);

console.log(JSON.stringify({
  source:'Original unaltered LP2 source, two key-state grammars on 80x80 with original five numbered holes',
  theorem:'For ANY 29! per-key permutation pi, P=pi[K](C) gives H(P)>=H(P|K)=H(C|K) on original empirical rune counts',
  nativeReference:reference,
  outputs,
  coordinateOutputs,
  scope:'Lower bound on direct decoded GP29 unigram entropy under fixed per-state bijections. The source original lower bounds exceed independently pinned native-English GP entropy. Changing state, nonbijective intermediates and unusual-entropy plaintext remain possible.'
},null,2));
console.log('PASS: source original all-secret 29-symbol state alphabet entropy bound, two positive native GP plants');
