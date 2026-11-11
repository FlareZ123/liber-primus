"use strict";
/**
 * Original-input all-secret four-state GP29 recurrence inversion.
 *
 * Source-linked factors: the authenticated 2013 BASE29 3301=3QO example
 * gives H(X)=3+26X+24X^2, and the original p39 red triad gives
 * G(X)=27+5X+15X^2. Their product divides the original LP2 32x8
 * numerical-table polynomial over GF(29). Test whether the resulting
 * fourth-order recurrence is a *direct additive GP29 encryption key*.
 *
 * Enumerate all 29^4 possible hidden initial states in BOTH natural
 * polynomial orientations. The first 180 rune outputs rank the keys;
 * only the first 100 candidates enter a 240-rune untouched validation.
 * Remaining runes are untouched continuation. There are no fitted
 * taps, starting offsets, cipher alphabets, or replacement letters.
 *
 * A separately sourced 729-rune Shakespeare plaintext is encrypted
 * under an unknown seed and recovered at rank one by the identical
 * key search, including an exact full inverse and re-encryption.
 *
 * Windows 11, Node.js 22: node sims/lp2_hg_fourstate_lfsr_allsecret_sft.cjs
 * Append --full to test every one of the eight book-section starts.
 * Reads repository fixtures; writes nothing.
 *
 * Conclusion is restricted to stationary, additive GP29 plaintext
 * directly under these two fourth-order recurrences and the specified
 * original section starts. It does not exclude nonlinear clocks,
 * plaintext-dependent steps, encrypted binary intermediates, or
 * a different meaning for the genuine grid polynomial factors.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const novel = fs.readFileSync(path.join(ROOT,
  "resources", "control", "shakespeare_first300k.txt"), "utf8");
const M = 29;
const STATES = M ** 4;
const TRAIN = 180;
const VALID = 240;
const TOP = 100;
const mod = x => (x % M + M) % M;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
/** @param {number[]} high @param {number[]} divisorAscending */
function polynomialRemainder(high, divisorAscending) {
  const a = high.slice().reverse().map(mod);
  const b = divisorAscending;
  const n = b.length - 1;
  let inverse = 1;
  while (mod(inverse * b[n]) !== 1) inverse++;
  for (let t = a.length - 1; t >= n; t--) {
    const coefficient = mod(a[t] * inverse);
    for (let j = 0; j <= n; j++)
      a[t - n + j] = mod(a[t - n + j] - coefficient * b[j]);
  }
  return a.slice(0, n);
}
const H = [3, 26, 24], G = [27, 5, 15];
const F = multiply(H, G);
assert.deepEqual(F, [23, 21, 11, 17, 12]);
const Fmonic = F.map(x => mod(x * 17));
assert.deepEqual(Fmonic, [14, 9, 13, 28, 1]);
const F_reciprocal_monic = Fmonic.slice().reverse().map(x => mod(x * 27));
assert.deepEqual(F_reciprocal_monic, [27, 2, 3, 11, 1]);
const TAPS = [
  {name:"original polynomial", taps:[15,20,16,1]},
  {name:"reciprocal polynomial", taps:[2,27,26,18]}
];
for (const candidate of TAPS) {
  const base = candidate.name === "original polynomial"
    ? Fmonic : F_reciprocal_monic;
  assert.deepEqual(candidate.taps,
    base.slice(0,4).map(x => mod(-x)));
}
assert.equal(grid.bytes.length, 256);
assert.deepEqual(polynomialRemainder(grid.bytes, F), [0,0,0,0]);
assert.equal(corpus.pages.filter(p => p.page < 56)
  .reduce((s,p)=>s+p.indices.length,0),12956);

/**
 * Uses existing repository GP spelling; longest rune digraph,
 * QU->CW, V->U, K->C, Z->S. No generated dictionary is used to
 * select original outputs. @param {string} text @returns {number[]}
 */
function encodeGP(text) {
  const map = new Map(corpus.translit.map((name,i)=>[name,i]));
  const tokens = [...map.keys()].sort((a,b)=>b.length-a.length);
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for (let i=0; i<word.length;) {
      const found = tokens.find(t=>word.startsWith(t,i));
      if (found) { out.push(map.get(found)); i+=found.length; }
      else i++;
    }
  }
  return out;
}
const english = encodeGP(novel);
assert.equal(english.length,218800);
const freq = Array(M).fill(0.5);
for(const x of english.slice(0,150000)) freq[x]++;
const den = freq.reduce((s,x)=>s+x,0);
const unigram = freq.map(x=>Math.log(x/den));

/** @param {number[]} runes */
function ioc(runes) {
  const bins = Array(M).fill(0);
  for (const x of runes) bins[x]++;
  return bins.reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}

/** @param {number[]} taps */
function transition(taps) {
  const next = new Uint32Array(STATES);
  const head = new Uint8Array(STATES);
  for(let seed=0; seed<STATES; seed++) {
    let rem=seed;
    const a=rem%M; rem=(rem-a)/M;
    const b=rem%M; rem=(rem-b)/M;
    const c=rem%M; const d=(rem-c)/M;
    head[seed]=a;
    const last=mod(taps[0]*a+taps[1]*b+taps[2]*c+taps[3]*d);
    next[seed]=Math.floor(seed/M)+(M**3)*last;
  }
  return {next,head};
}

/** @param {number[]} plain @param {number[]} taps
 * @param {number[]} seedFour */
function encrypt(plain,taps,seedFour) {
  const state=seedFour.slice();
  return plain.map(p=>{
    const c=mod(p+state[0]);
    const newValue=mod(taps.reduce((s,a,j)=>s+a*state[j],0));
    state.shift();
    state.push(newValue);
    return c;
  });
}
/**
 * @param {number[]} cipher
 * @param {{next:Uint32Array,head:Uint8Array}} machine
 * @param {number} seed
 */
function decode(cipher,machine,seed) {
  let state=seed;
  return cipher.map(c=>{
    const p=mod(c-machine.head[state]);
    state=machine.next[state];
    return p;
  });
}

/**
 * Scores every secret initial state on training only. Top-100
 * undergo a strictly withheld validation; remainder is untouched.
 * @param {number[]} target
 * @param {{next:Uint32Array,head:Uint8Array}} machine
 * @param {string} title
 * @param {number|null} knownSeed
 */
function attack(target,machine,title,knownSeed=null) {
  assert(target.length>=TRAIN+VALID+1);
  const {next,head}=machine;
  const shifts=Array.from({length:TRAIN},(_,j)=>
    Float64Array.from({length:M},(_,k)=>unigram[mod(target[j]-k)]));
  const trainingScores=new Float32Array(STATES);
  for(let seed=0;seed<STATES;seed++) {
    let state=seed,score=0;
    for(let i=0;i<TRAIN;i++) {
      score+=shifts[i][head[state]];
      state=next[state];
    }
    trainingScores[seed]=score;
  }
  const ranked=Array.from({length:STATES},(_,i)=>i)
    .sort((a,b)=>trainingScores[b]-trainingScores[a]);
  let winner=null;
  for(const seed of ranked.slice(0,TOP)) {
    const p=decode(target,machine,seed);
    const validation=p.slice(TRAIN,TRAIN+VALID);
    const untouched=p.slice(TRAIN+VALID);
    const valScore=validation.reduce((s,n)=>s+unigram[n],0)/VALID;
    const row={seed,training:trainingScores[seed]/TRAIN,
      validation:valScore,untouched:untouched.reduce(
        (s,n)=>s+unigram[n],0)/untouched.length,
      ioc:ioc(p),opening:p.slice(0,42).map(i=>corpus.translit[i]).join("")};
    if(winner===null||row.validation>winner.validation)winner=row;
  }
  const answer={name:title,length:target.length,checkedSeeds:STATES,
    rawMean:target.reduce((s,n)=>s+unigram[n],0)/target.length,
    bestTrainingSeed:ranked[0],
    bestTrainingScore:trainingScores[ranked[0]]/TRAIN,
    bestValidation:winner};
  if(knownSeed!==null) answer.plant={
    trueSeed:knownSeed,
    trueSeedTrainingRank:ranked.indexOf(knownSeed)+1,
    trueSeedChosen:ranked[0]===knownSeed
  };
  return answer;
}
function fourFromInteger(seed) {
  let z=seed; return Array.from({length:4},()=>{
    const digit=z%M;z=Math.floor(z/M);return digit;
  });
}
/** @param {number[]} seedFour */
function integerFromFour(seedFour) {
  return seedFour.reduce((s,x,i)=>s+x*M**i,0);
}

const native=english.slice(-729);
const secret=[1,5,11,24];
const seedInt=integerFromFour(secret);
assert.equal(seedInt,594733);
const knownMachine=transition(TAPS[0].taps);
const plantedCipher=encrypt(native,TAPS[0].taps,secret);
assert.deepEqual(decode(plantedCipher,knownMachine,seedInt),native);
assert.deepEqual(encrypt(decode(plantedCipher,knownMachine,seedInt),
  TAPS[0].taps,fourFromInteger(seedInt)),plantedCipher);
const plant=attack(plantedCipher,knownMachine,"source-disjoint Shakespeare plant",seedInt);
assert.equal(plant.plant.trueSeedTrainingRank,1);
assert(plant.bestValidation.validation>-3.4);
assert(plant.bestValidation.ioc>0.05);
console.log("POWERED CONTROL "+JSON.stringify(plant));

const pages=(a,b)=>corpus.pages.filter(p=>p.page>=a&&p.page<b)
  .flatMap(p=>p.indices);
const scopes=[
  {name:"original opening physical p0-2",values:pages(0,3)},
  {name:"opening after p0 red heading",values:pages(0,3).slice(13)},
  {name:"original physical p3-7",values:pages(3,8)},
  {name:"original physical p33-39",values:pages(33,40)},
  {name:"original physical p40-55",values:pages(40,56)},
  {name:"original physical p52-55",values:pages(52,56)}
];
if(process.argv.includes("--full")) scopes.push(
  {name:"original physical p8-14",values:pages(8,15)},
  {name:"original physical p15-22",values:pages(15,23)},
  {name:"original physical p23-26",values:pages(23,27)},
  {name:"original physical p27-32",values:pages(27,33)}
);
const results=[];
for(const candidate of TAPS){
  const machine=transition(candidate.taps);
  for(const scope of scopes) {
    const sample=scope.values.slice(0,729);
    if(sample.length<TRAIN+VALID+1)continue;
    const row=attack(sample,machine,
      candidate.name+": "+scope.name);
    const {bestValidation:best}=row;
    assert(best.validation < -3.4,
      "Unexpected native-like original score; investigate rather than suppress");
    assert(best.ioc < 0.05,
      "Unexpected original native-like IoC; investigate");
    results.push(row);
    console.log("ORIGINAL "+JSON.stringify(row));
  }
}
console.log("VERDICT "+JSON.stringify({
  cipher:"direct additive GP29 under two source-linked H*G four-state recurrences",
  allPossibleSeedsPerModel:STATES,
  nativePlantExact:true,nativePlantTrueKeyRank:1,
  sectionsTested:results.length,
  originalNativeLikeOutputs:results.filter(r=>
    r.bestValidation.validation>=-3.4||
    r.bestValidation.ioc>=0.05).length,
  recoveredUnknownPlaintext:false,
  scope:"Original windows, direct rune GP29 register only; no inferred cipher-key or historic continuation"
}));
