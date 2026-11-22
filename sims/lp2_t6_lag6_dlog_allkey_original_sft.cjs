'use strict';
/**
 * Original-source, standalone CJS test for the six-back discrete-log
 * multiplicative-feedback family over the 28 nonfixed GP29 values.
 *
 * Source clue: the existing original-book word-local affine echo
 * T(x) = (24-2*x) mod 29, with one fixed point H=8 and one primitive
 * 28-orbit.  Its group-coordinate inverse is
 * D[j] = log(-2)(C[j]-8) - log(-2)(C[j-6]-8) mod 28.
 *
 * On each printed word, the first six ciphertext runes are directly encoded
 * by an unknown *stationary* 29-way plaintext-code permutation pi.  Later
 * ciphertext runes encode pi(P[j]) as an orbit increment from C[j-6],
 * resetting the reference exponent to zero if C[j-6] is H.  Code 28 is
 * reserved for output H; it interrupts the orbit with no secret key.
 *
 * This is a hypothetical but fully invertible 29-letter mechanism.
 * Every possible stationary pi shares the exact suffix-symbol IoC, so no
 * key enumeration is needed. Source-native English plants use three
 * independent literary registers and every original printed word length.
 *
 * SFT: node sims/lp2_t6_lag6_dlog_allkey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphs = new Map(corpus.runes.map((g, i) => [g, i]));
const runePattern = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const text = read('resources/liber-primus/lp2-transcription.txt');
const whole = text.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const words = (whole.match(runePattern) || [])
  .map(w => Array.from(w, g => glyphs.get(g)));
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(words.flat(), original);

const mod29 = x => ((x % 29) + 29) % 29;
const T = x => mod29(24 - 2*x);
const exponent = Array(29).fill(-1);
const orbit = [];
let state = 21;
for (let k = 0; k < 28; k++) {
  assert.equal(exponent[state], -1, 'primitive T orbit cannot repeat');
  exponent[state] = k;
  orbit.push(state);
  state = T(state);
}
assert.equal(state, 21);
assert.equal(T(8), 8);
assert.equal(exponent[8], -1);
assert.equal(new Set(orbit).size, 28);
const inverseCode = Array.from({length:29}, (_, code) => (11*code+7)%29);
const codeOfPlain = Array(29).fill(-1);
for (let code=0; code<29; code++) codeOfPlain[inverseCode[code]]=code;
assert.equal(new Set(inverseCode).size,29);

/**
 * Decode word-local suffix j>=6 to the exact orbit-increment symbol,
 * treating H as the single distinguished 29th code.
 * @param {number[]} w Source ciphertext word
 * @returns {number[]}
 */
function decodeSuffix(w) {
  const out = [];
  for (let j = 6; j < w.length; j++) {
    const now = w[j], prior = w[j - 6];
    if (now === 8) out.push(28);
    else out.push((exponent[now] - (prior === 8 ? 0 : exponent[prior]) + 28) % 28);
  }
  return out;
}
/**
 * Encode every plaintext rune under a globally unknown 29-way alphabet
 * permutation; first-six positions act as explicit, reversible IV symbols.
 * @param {number[]} plain Original register
 * @returns {number[]}
 */
function encWord(plain) {
  const out = [];
  for (let j = 0; j < plain.length; j++) {
    const code = codeOfPlain[plain[j]];
    if (code === 28) out.push(8);
    else {
      const previous = j < 6 || out[j-6] === 8 ? 0 : exponent[out[j-6]];
      out.push(orbit[(previous + code) % 28]);
    }
  }
  return out;
}
/**
 * @param {number[]} cipher Full source-length ciphertext word
 * @returns {number[]} Recovered source plaintext, including first six
 */
function decWord(cipher) {
  const out = [];
  for (let j = 0; j < cipher.length; j++) {
    const now = cipher[j], previous = j<6 || cipher[j-6]===8 ? 0 : exponent[cipher[j-6]];
    const code = now===8 ? 28 :
      (exponent[now] - previous + 28)%28;
    out.push(inverseCode[code]);
  }
  return out;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const hist = new Uint32Array(29);
  for (const v of symbols) {
    assert(v>=0&&v<29&&Number.isInteger(v));
    hist[v]++;
  }
  let pairCount = 0;
  for (const h of hist) pairCount+=h*(h-1);
  return pairCount/(symbols.length*(symbols.length-1));
}
const decoded = words.flatMap(decodeSuffix);
const eligible = words.reduce((n,w)=>n+Math.max(0,w.length-6),0);
assert.equal(eligible, 1290);
assert.equal(decoded.length, 1290);
const unknownCurrentH = decoded.filter(x=>x===28).length;
assert.equal(unknownCurrentH, 41);
const nativeFullIoC = ioc(decoded);
assert(Math.abs(nativeFullIoC - 0.0355230002225149)<1e-12);
const valid = [];
let censored = 0, oneStep = 0;
for (const w of words) for (let j=6;j<w.length;j++) {
  if (w[j]===8 || w[j-6]===8) censored++;
  else {
    const code = (exponent[w[j]]-exponent[w[j-6]]+28)%28;
    valid.push(code);
    if(code===1)oneStep++;
  }
}
assert.equal(censored,86);
assert.equal(valid.length,1204);
assert.equal(oneStep,78);
assert(Math.abs(ioc(valid)-0.03685139311190462)<1e-12);

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let x=seed>>>0;
  return ()=>(x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296;
}
const sources = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const trials=600;
const results=[];
for (const [name,file] of sources) {
  const lists = Array.from({length:15},()=>[]);
  for (const token of read(file).toUpperCase().match(/[A-Z]+/g)||[]) {
    const p=encodeSourceNativeGP(token);
    if(p.length>=1&&p.length<=14)lists[p.length].push(p);
  }
  for (const w of words) assert(lists[w.length].length>0,name+' missing length '+w.length);
  const rng=random(0x33012026);
  const scores=[];
  let plantedPlain=[],plantedCipher=[],plantSuffix=[];
  for(let run=0;run<trials;run++) {
    const cipherWords=[],originalWords=[],suffix=[];
    for(const w of words) {
      const p=lists[w.length][Math.floor(rng()*lists[w.length].length)];
      suffix.push(...p.slice(6));
      if(run===0) {
        const c=encWord(p);
        assert.deepEqual(decWord(c),p,name+' plant inverse');
        assert.deepEqual(encWord(decWord(c)),c,name+' plant forward');
        assert.deepEqual(decodeSuffix(c).map(code=>inverseCode[code]),p.slice(6),
          name+' source suffix equality');
        plantedPlain.push(...p);
        plantedCipher.push(...c);
        plantSuffix.push(...decodeSuffix(c));
      }
    }
    scores.push(ioc(suffix));
  }
  assert.equal(plantedPlain.length,12956);
  assert.equal(plantedCipher.length,12956);
  assert.equal(plantSuffix.length,1290);
  scores.sort((a,b)=>a-b);
  const mean=scores.reduce((a,b)=>a+b,0)/trials;
  assert(scores[0]>0.065, name+' source test must have discrimination');
  assert(scores[0]>nativeFullIoC, name+' original below all source plants');
  results.push({name,trialCount:trials,min:scores[0],median:scores[trials/2],
    mean,max:scores[trials-1],originalBelowAll:scores[0]>nativeFullIoC,
    truePlantRecovered:plantedPlain.length});
}
if(require.main===module)console.log(JSON.stringify({
  status:'direct six-back orbit-increment GP29 family excluded conditionally',
  originalWords:words.length,originalRunes:original.length,
  suffixSites:eligible,uncensored:valid.length,censored,
  sixBackT6Echo:oneStep,currentH:unknownCurrentH,
  stationaryDecoderSuffixIoC:nativeFullIoC,
  uncensoredSuffixIoC:ioc(valid),
  family:'all 29! stationary plaintext-code permutations',
  referenceControls:results,sourceNativeFullPlant:true,
  authenticUnknownPlaintextRecovered:false
},null,2));
