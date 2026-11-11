'use strict';

/**
 * Source-frozen test of a retrospective F59/DH derivation of the known LP2 p56
 * prime-totient start. Also tests original unknown physical p3, independently
 * selected because its red triad supplies the candidate exponent.
 *
 * No unknown ciphertext solution is claimed. Node.js 22, repository root inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const text = read('resources/control/gibran_prophet_58585.txt').toUpperCase()
  .replace(/K/g, 'C').replace(/V/g, 'U').replace(/J/g, 'I');
const page = n => corpus.pages.find(p => p.page === n);
const mod = (n, p) => ((n % p) + p) % p;
const title = ink.pages.find(p => p.page === 57).red_spans[0].runes;
const titleRunes = [...title].map(r => corpus.runes.indexOf(r));
assert.deepEqual(titleRunes.map(i => corpus.translit[i]).join(''), 'PARABLE');
const sum = a => a.reduce((x,y) => x+y, 0);
const titleSum = sum(titleRunes.map(i => corpus.prime[i]));
assert.equal(titleSum, 449);
const reversed = Number(String(titleSum).split('').reverse().join(''));
assert.equal(reversed, 944);
assert.equal(reversed, 16 * 59);
// 16 is the number of cells in the complete p15 4x4 grid, or the perimeter
// of the p32 central 5x5 square. A 4x4 perimeter contains 12, not 16, cells.
assert.equal(4*4, 16);
assert.equal(4*4 - 2*2, 12);
assert.equal(5*5 - 3*3, 16);

// Contemporaneous 2013 BASE29 worked example: 3301 -> 3QO = [3,26,24].
const baseDigits = [3, 26, 24];
assert.equal(baseDigits.reduce((n,d) => 29*n + d, 0), 3301);
const triad = ink.pages.find(p => p.page === 3).red_spans.find(s => s.length === 3);
const p3 = [...triad.runes].map(r => corpus.runes.indexOf(r));
assert.deepEqual(p3, [13, 23, 2]);

/** @param {number} a @param {number} e @param {number} m @returns {number} */
function powmod(a,e,m) {
  let v=1;
  for(let b=mod(a,m);e>0;e=Math.floor(e/2),b=mod(b*b,m))
    if(e%2) v=mod(v*b,m);
  return v;
}
const sourceModels = [
  {name:'claimed final BASE29 digit / p3 root constant', base:24, exponent:23},
  {name:'first BASE29 digit / same constant', base:3, exponent:23},
  {name:'middle BASE29 digit / same constant', base:26, exponent:23},
  {name:'conjugate p3 root constant 17', base:24, exponent:17},
  {name:'other p3 root coordinate 2', base:24, exponent:2},
  {name:'actual 2013 DH example client secret exponent 15', base:24, exponent:15}
].map(x=>({...x, modulus:59, output:powmod(x.base,x.exponent,59)}));
assert.deepEqual(sourceModels.map(x=>x.output), [2,45,41,55,45,34]);
assert.equal(powmod(5,6,23),8);
assert.equal(powmod(5,15,23),19);
assert.equal(powmod(8,15,23),2);
assert.equal(powmod(19,6,23),2);  // Historical DH 23 already outputs 2 directly.

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result=[];
  for(let n=2;result.length<count;n++) {
    let prime=true;
    for(let d=2;d*d<=n;d++) if(n%d===0) {prime=false;break;}
    if(prime) result.push(n);
  }
  return result;
}
const keyPrimes = primes(600);
const alphabet = corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} s @returns {number[]} */
function encode(s) {
  const out=[];
  for(let i=0;i<s.length;) {
    const m=alphabet.find(x=>s.startsWith(x.token,i));
    if(m) {out.push(m.index);i+=m.token.length;} else i++;
  }
  return out;
}
const p56Known = encode(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.equal(p56Known.length,85);
/**
 * Prime list starts with 2, then 3,5,... . All non-paused positions use
 * phi(prime)=prime-1. Only the independently solved p56 index56 is special;
 * no unknown-page F locations are chosen from language.
 * @param {number[]} original
 * @param {Set<number>} literalF
 * @returns {number[]}
 */
function decode(original, literalF) {
  let keyIndex=0;
  return original.map((r,i) => {
    if(literalF.has(i)){assert.equal(r,0);return r;}
    return mod(r-(keyPrimes[keyIndex++]-1),29);
  });
}
const p56 = page(56).indices;
assert.equal(p56.length,85);
assert.equal(p56[56],0);
assert.deepEqual(decode(p56,new Set([56])),p56Known);

const language = encode(text);
assert(language.length>60000);
const cut=Math.floor(language.length*0.65);
const training=language.slice(0,cut);
const heldout=language.slice(cut);
const tri = new Map();
for(let i=2;i<training.length;i++) {
  const k=training[i-2]*841+training[i-1]*29+training[i];
  tri.set(k,(tri.get(k)||0)+1);
}
const denom=training.length+0.2*29**3;
/** @param {number[]} data @returns {number} */
function trigram(data) {
  let total=0;
  for(let i=2;i<data.length;i++) {
    const key=data[i-2]*841+data[i-1]*29+data[i];
    total+=Math.log(((tri.get(key)||0)+0.2)/denom);
  }
  return total/(data.length-2);
}
const original=page(3).indices;
assert.equal(original.length,217);
const plainCandidate=decode(original,new Set());
const passAllFs=new Set(original.flatMap((r,i)=>r===0?[i]:[]));
const allFSkippedCandidate=decode(original,passAllFs);
// Natural English controls, matched in runic length. No ranking, no page/freeze
// change or retrospectively selected plaintext phrase.
const reference=[];
for(let i=0;i+original.length<=heldout.length;i+=7)
  reference.push(trigram(heldout.slice(i,i+original.length)));
reference.sort((a,b)=>a-b);
const controls={
  samples:reference.length,
  trainingRunes:training.length,
  heldoutRunes:heldout.length,
  minimum:reference[0],
  median:reference[Math.floor(reference.length/2)],
  maximum:reference.at(-1),
  solvedP56:trigram(p56Known),
  originalP3Cipher:trigram(original),
  candidateP3NoPause:trigram(plainCandidate),
  candidateP3AllFPass:trigram(allFSkippedCandidate)
};
assert(controls.candidateP3NoPause<controls.minimum);
assert(controls.candidateP3AllFPass<controls.minimum);
assert(controls.solvedP56>controls.candidateP3NoPause);

console.log(JSON.stringify({
  source:{p57TitleGpPrimeSum:titleSum,reversed,primeModulus:59,
    sourceBase29Digits:baseDigits,p3RedTriad:p3,
    p15GridCells:16,p15PerimeterCells:12,p32Central5x5PerimeterCells:16},
  models:sourceModels,
  directHistoricalDH:{modulus:23,generator:5,serverPublic:8,
    clientPublic:19,privateExponents:[6,15],shared:2},
  solvedP56:{originalRunes:85,firstPrime:2,literalFPause:56,allKnownRunesRecovered:true},
  heldoutUnknownPage:{page:3,runes:original.length,first60:plainCandidate.slice(0,60).map(i=>corpus.translit[i]).join(''),scores:controls},
  verdict:'F59 relationship is exact but selector-underdetermined; natural unknown p3 original-inverse fails; original LP2 plaintext remains unknown'
},null,2));
