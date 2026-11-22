'use strict';
/**
 * Source-native English register controls for the original word-local lag-five
 * equality and contiguous-pair effects. A bijection per word and phase modulo
 * five preserves both invariants exactly, regardless of secret substitutions.
 * The independent doublet deficit is measured in a fully keyed positive plant.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const indices = new Map(gp.runes.map((r,i)=>[r,i]));
const rx = new RegExp('['+gp.runes.join('')+']+','gu');
const original = (read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%')
 .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(rx)||[])
 .map(w=>Array.from(w, c=>indices.get(c)));
assert.equal(original.length,2896);
assert.equal(original.flat().length,12956);

/** @param {number[]} w @returns {{singles:number,pairs:number}} */
function lag5(w) {
 let singles=0,pairs=0;
 for(let i=5;i<w.length;i++){
  if(w[i]!==w[i-5])continue;
  singles++;
  if(i>5&&w[i-1]===w[i-6])pairs++;
 }
 return {singles,pairs};
}
const expected={singles:104,pairs:9};
const originalStats=original.reduce((out,w)=>{
 const a=lag5(w);out.singles+=a.singles;out.pairs+=a.pairs;return out;
},{singles:0,pairs:0});
assert.deepEqual(originalStats,expected);
const originalSizes=new Map();
for(const w of original) originalSizes.set(w.length,(originalSizes.get(w.length)||0)+1);

/**
 * Exact independent-with-replacement, original-word-length matched moments
 * over an entire fixed native-English source corpus, no resampling needed.
 */
function sourceMoments(file) {
 const plain = (read(file).match(/[A-Za-z]+/g)||[]).map(encodeSourceNativeGP);
 const pools=new Map();
 for(const w of plain) {
  if(!pools.has(w.length))pools.set(w.length,[]);
  pools.get(w.length).push(lag5(w));
 }
 let singlesMean=0,singlesVariance=0,pairsMean=0,pairsVariance=0;
 for(const [len,count] of originalSizes) {
  if(len<=5)continue;
  const pool=pools.get(len);
  assert(pool&&pool.length>0,'missing length '+len+' in '+file);
  const mS=pool.reduce((a,x)=>a+x.singles,0)/pool.length;
  const mP=pool.reduce((a,x)=>a+x.pairs,0)/pool.length;
  singlesMean+=count*mS;
  pairsMean+=count*mP;
  singlesVariance+=count*pool.reduce((a,x)=>a+(x.singles-mS)**2,0)/pool.length;
  pairsVariance+=count*pool.reduce((a,x)=>a+(x.pairs-mP)**2,0)/pool.length;
 }
 return {source:file,wordCount:plain.length,
  singles:{original:104,mean:singlesMean,sd:Math.sqrt(singlesVariance),
   z:(104-singlesMean)/Math.sqrt(singlesVariance)},
  pairs:{original:9,mean:pairsMean,sd:Math.sqrt(pairsVariance),
   z:(9-pairsMean)/Math.sqrt(pairsVariance)}
 };
}
const controls=[
 'resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt'
].map(sourceMoments);
assert(Math.abs(controls[0].singles.mean-122.80818291463413)<1e-8);
assert(Math.abs(controls[1].pairs.mean-4.802817001186261)<1e-8);
assert(Math.abs(controls[2].pairs.mean-8.331488196503583)<1e-8);

// Planted five-phase *arbitrary* secret permutations per separate word.
// An exact GP29 alphabet relabeling in each phase must preserve all lag-five
// equality events and adjacent lag-five two-hit runs regardless of key choice.
const native=(read('resources/control/emerson_essays_2944.txt').match(/[A-Za-z]+/g)||[])
 .map(encodeSourceNativeGP);
const groups=new Map();
for(const w of native){
 if(!groups.has(w.length))groups.set(w.length,[]);
 groups.get(w.length).push(w);
}
let seed=0x18c03301;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
const generated=[];
let truth={singles:0,pairs:0}, ciphertext={singles:0,pairs:0};
let planted=0;
for(let wi=0;wi<original.length;wi++){
 const candidates=groups.get(original[wi].length);
 assert(candidates?.length,'missing native plant length');
 const p=candidates[(wi*17+3)%candidates.length];
 const alphabets=Array.from({length:5},()=>{
  const a=Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
   const k=random()%(j+1);
   [a[j],a[k]]=[a[k],a[j]];
  }
  return a;
 });
 const c=p.map((v,i)=>alphabets[i%5][v]);
 const x=lag5(p),y=lag5(c);
 assert.deepEqual(y,x);
 truth.singles+=x.singles;truth.pairs+=x.pairs;
 ciphertext.singles+=y.singles;ciphertext.pairs+=y.pairs;
 generated.push(...c);
 planted++;
}
assert.deepEqual(ciphertext,truth);
assert.equal(planted,2896);
const adjacentCipherRepeats=generated.reduce((n,x,i)=>n+(i>0&&generated[i-1]===x),0);
assert(adjacentCipherRepeats>200,'fully reversible phase permutations alone should not suppress global doublets');
console.log(JSON.stringify({
 original:originalStats,controls,
 positivePlant:{
  originalWordLengthsPreserved:planted,wordLocalLag5Source:truth,
  fivePhaseCipher: ciphertext,
  adjacentCipherRepeats,
  originalAdjacentCipherRepeats:86
 },
 interpretation:'five-phase word-local bijections preserve lag-five echoes, but one keyed plant does not explain the independent adjacent-doublet deficit',
 newOriginalPlaintext:0
},null,2));
