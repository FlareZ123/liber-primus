'use strict';

/**
 * Exact historical plaintext-F bypass feasibility of eight p15 source keys.
 * Every ciphertext F is exhaustively permitted to mean literal plaintext F
 * (no key consumed) or a key-consuming non-F whose ciphertext is F.
 * This DP never uses English scores, guessed plaintext or a fixed F mask.
 *
 * Run: node sims/lp2_p15_ftransparent_allphase_feasibility_sft.cjs
 * Node.js 20+, CommonJS, read-only local inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname,'..');
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(16,23).map(p => p.indices);
assert.deepEqual(pages.map(p=>p.length),[267,273,260,271,269,273,131]);
const ciphertext = pages.flat();
assert.equal(ciphertext.length,1744);
assert.equal(ciphertext.filter(c=>c===0).length,65);
/** @param {number} x @returns {number} */
const mod29 = x => ((x%29)+29)%29;
/** @param {number} amount @returns {number[]} */
function firstPrimes(amount) {
  const primes=[];
  for (let p=2;primes.length<amount;p++) {
    let prime=true;
    for (let d=2;d*d<=p;d++) if (p%d===0) {prime=false;break;}
    if (prime)primes.push(p);
  }
  return primes;
}
/** @param {number} n @returns {number[]} */
function base29(n) {
  const digits=[];
  do {digits.unshift(n%29);n=Math.floor(n/29);} while(n>0);
  return digits;
}
const fibonacci = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primeTable = firstPrimes(988);
const primes = fibonacci.map(n=>primeTable[n]);
const printed = primes.map(p=>Math.abs(3301-p));
assert.deepEqual(printed,
  [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
assert.deepEqual(base29(3301),[3,26,24]);
const keys=[
  ['printed16',printed],
  ['prime16',primes],
  ['totient16',primes.map(n=>n-1)],
  ['fibonacci16',fibonacci],
  ['ordinal16',fibonacci.map(n=>n+1)],
  ['printedBase29',printed.flatMap(base29)],
  ['primeBase29',primes.flatMap(base29)],
  ['seedBase29',base29(3301)]
].map(([name,values])=>({name, key:values.map(mod29)}));
assert.deepEqual(keys.map(p=>p.key.length),[16,16,16,16,16,47,30,3]);

/**
 * Complete exact-state feasibility for the historically solved Cicada rule:
 * P=F -> C=F and consume no key;
 * P != F -> C=(P+shift(consumed)) mod29 and consume one key.
 *
 * The only state needed is the total number of key symbols consumed.
 * Equal states are merged without discarding any viable plaintext path.
 * @param {number[]} data
 * @param {(consumed:number)=>number} shift
 * @returns {{possible:boolean,firstFailure:number,terminal:number,peak:number}}
 */
function feasible(data,shift) {
  let states=new Set([0]);
  let peak=1;
  for(let i=0;i<data.length;i++) {
    const next=new Set();
    for(const used of states) {
      if(data[i]===0)next.add(used); // genuine plaintext F bypass
      if(mod29(data[i]-shift(used))!==0)
        next.add(used+1); // normal branch must never decode to plaintext F
    }
    if(next.size===0)
      return {possible:false,firstFailure:i,terminal:0,peak};
    peak=Math.max(peak,next.size);
    states=next;
  }
  return {possible:true,firstFailure:-1,terminal:states.size,peak};
}
/** @param {number[]} plaintext @param {(used:number)=>number} shift */
function encrypt(plaintext,shift) {
  let used=0;
  return plaintext.map(x=>x===0?0:mod29(x+shift(used++)));
}
// Authentic solved original p56 key is phi(p_n)=p_n-1. The source has five
// independently feasible final clocks; known p56 plaintext selects one.
const p56 = corpus.pages[56].indices;
assert.equal(p56.length,85);
const first90=firstPrimes(90);
const known56=feasible(p56,k=>first90[k]-1);
assert.equal(known56.possible,true);
assert.equal(known56.terminal,5);

// A genuine source-native English plant for all 320 candidate shifts and
// source-length layout, with authentic F transparency and exact re-encryption.
const native=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0,1744);
assert.equal(native.length,1744);
assert.ok(native.filter(v=>v===0).length>10);
let planted=0;
const results=[];
for(const {name,key} of keys) {
  let validWhole=0,validFixedReset=0,bestPrefix=0;
  const pageChoices=pages.map(()=>0);
  const variants=[];
  for(const sign of [-1,+1]) for(let phase=0;phase<key.length;phase++) {
    const shift = used => mod29(sign*key[(used+phase)%key.length]);
    const whole=feasible(ciphertext,shift);
    const perPage=pages.map(p=>feasible(p,shift));
    bestPrefix=Math.max(bestPrefix,whole.firstFailure<0?ciphertext.length:whole.firstFailure);
    validWhole+=Number(whole.possible);
    validFixedReset+=Number(perPage.every(x=>x.possible));
    perPage.forEach((r,i)=>pageChoices[i]+=Number(r.possible));
    variants.push({sign,phase,whole,perPage});

    const encrypted=encrypt(native,shift);
    const inverse=feasible(encrypted,shift);
    assert.ok(inverse.possible,'true F-transparent source plant must have valid path');
    // Every true original plain F remains ciphertext F, and the entire
    // unmodified source plaintext strictly forward-replays.
    let used=0;
    assert.deepEqual(encrypted,native.map(p=>p===0?0:mod29(p+shift(used++))));
    planted++;
  }
  assert.equal(validWhole,0,'a direct original LP2 solution would invalidate this negative');
  assert.equal(validFixedReset,0);
  assert.ok(pageChoices.some(count=>count===0),
    'independent page phases must also be unable to rescue this key');
  results.push({
    key:name,period:key.length,candidateSignsAndPhases:variants.length,
    validContinuous:validWhole,validFixedPageReset:validFixedReset,
    validIndependentPhasePerPage:pageChoices,
    maximumContinuousPrefixBeforeContradiction:bestPrefix
  });
}
assert.equal(planted,320);
assert.deepEqual(results.map(r=>r.validIndependentPhasePerPage),[
  [1,0,0,0,0,1,6],
  [0,0,0,0,1,0,2],
  [0,1,1,0,0,0,3],
  [0,0,1,3,0,0,1],
  [0,0,0,5,0,0,4],
  [1,0,0,0,0,0,10],
  [0,0,2,0,0,0,6],
  [0,0,0,0,0,0,1]
]);
assert.deepEqual(results.map(r=>r.maximumContinuousPrefixBeforeContradiction),
  [272,145,187,186,161,403,176,13]);
console.log(JSON.stringify({
  method:'Exact all-F-mask GF29 feasibility, literal plaintext-F bypass',
  authenticSolvedP56:{runes:85,...known56},
  unknownOriginal:{physicalPages:'16-22',runes:1744,ciphertextF:65},
  eightSourceDerivedKeys:results,totalOriginalVariants:planted,
  positiveOriginalLengthFTransparentPlants:planted,
  result:'All original cipher variants algebraically impossible, even with per-page arbitrary phase; no unknown plaintext recovered.',
  caveat:'Does not reject different keys, nonperiodic streams, other cipher operations, or loss of historical plaintext-F rule.'
},null,2));
