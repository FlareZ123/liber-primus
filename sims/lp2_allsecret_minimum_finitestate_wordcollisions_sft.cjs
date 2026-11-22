'use strict';
/**
 * SFT: exact all-secret finite-state transducer lower bound from original
 * LP2 repeated complete words, versus two independent GP-native English
 * source registers matched to every authentic LP2 word length.
 *
 * Applies to ANY deterministic, length-preserving GP29 cipher whose
 * ciphertext for a complete plaintext word is fixed by that word and
 * one of S possible starting states, even if all internal nonlinear
 * state updates, output maps, keys, modes and tables are unknown.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_allsecret_minimum_finitestate_wordcollisions_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} n @returns {string} */
const read = n => fs.readFileSync(path.join(root, n), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runes = new Set(gp.runes);
const tokens = gp.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]} */
function encode(word) {
  const text = word.toUpperCase().normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(text, /^[A-Z]+$/u);
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (text.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const item = tokens.find(x => text.startsWith(x.s,i));
      assert(item, text.slice(i));
      out.push(item.i); i += item.s.length;
    }
  }
  return out;
}
/** @param {string} s @returns {string[]} */
function printedWords(s) {
  const result = [];
  let word = '';
  for (const ch of s) {
    if (runes.has(ch)) word += ch;
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Original source page/line breaks can bisect a printed word.
    } else if (word) {
      result.push(word); word = '';
    }
  }
  if (word) result.push(word);
  return result;
}
const originalWords = printedWords(read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%'));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.reduce((n,w)=>n+w.length,0),12956);
const originalLengths = originalWords.map(w => w.length);
const cipherFreq = Array.from({length:15}, () => new Map());
for (const word of originalWords) {
  const map = cipherFreq[word.length];
  map.set(word,(map.get(word)||0)+1);
}
/**
 * @param {Map<string,number>} f
 * @returns {number}
 */
function duplicatePairs(f) {
  let pairs = 0;
  for (const n of f.values()) pairs += n*(n-1)/2;
  return pairs;
}
const observedPairs = cipherFreq.map(duplicatePairs);
assert.equal(observedPairs.reduce((s,n)=>s+n,0),230);
assert.deepEqual(observedPairs.slice(1),
  [107,106,17,0,0,0,0,0,0,0,0,0,0,0]);
/**
 * Any plaintext word occurring n times and with at most S possible
 * initial states has at most S distinct ciphertext words.
 * Minimum collision count is given by balanced occupancy over S outputs.
 *
 * @param {Map<string,number>} plaintextFrequency
 * @param {number} S
 * @returns {number}
 */
function minimumPairs(plaintextFrequency,S) {
  assert(Number.isInteger(S) && S >= 1);
  let pairs = 0;
  for (const n of plaintextFrequency.values()) {
    const q = Math.floor(n/S);
    const r = n%S;
    pairs += r*q*(q+1)/2 + (S-r)*q*(q-1)/2;
  }
  return pairs;
}
// Independent exact positive: THE is two GP runes, 9 repetitions.
// Four changing affine-key starting states make exactly 4 outputs,
// distributing 9 occurrences 3+2+2+2, hence exactly six word pairs.
const the = encode('THE');
assert.equal(the.length,2);
const plant = Array.from({length:9}, (_, i) => the.map(
  v => gp.runes[(v + i%4)%29]).join(''));
const plantFreq = new Map();
for (const s of plant) plantFreq.set(s,(plantFreq.get(s)||0)+1);
assert.equal(plantFreq.size,4);
assert.equal(duplicatePairs(plantFreq),6);
const samePlaintext = new Map([['THE',9]]);
assert.equal(minimumPairs(samePlaintext,4),6);
assert.equal(minimumPairs(samePlaintext,9),0);
assert(minimumPairs(samePlaintext,3)>6);
/** @param {Map<string,number>[]} frequencies @param {boolean} lengthwise */
function stateMinimum(frequencies,lengthwise) {
  const maxFrequency = Math.max(...frequencies
    .flatMap(map => [...map.values()]));
  // Monotone decision: more possible states cannot increase collisions.
  let lo=1,hi=maxFrequency;
  while(lo<hi) {
    const mid=Math.floor((lo+hi)/2);
    const numbers=frequencies.map(map => minimumPairs(map,mid));
    const feasible=lengthwise
      ? numbers.every((n,L) => n<=observedPairs[L])
      : numbers.reduce((s,n)=>s+n,0)<=230;
    if(feasible)hi=mid;
    else lo=mid+1;
  }
  return lo;
}
/** @param {number[]} values @returns {object} */
function stats(values) {
  return {min:Math.min(...values),max:Math.max(...values),
    mean:values.reduce((s,x)=>s+x,0)/values.length};
}
/** @param {string} name @param {string} text @param {number} initialSeed
 * @param {number} expectedLexical */
function measure(name,text,initialSeed,expectedLexical) {
  const raw = text.match(/\p{L}+/gu) || [];
  assert.equal(raw.length,expectedLexical);
  const byLength = Array.from({length:15},()=>[]);
  for (const w of raw) {
    const encoded = encode(w);
    if(encoded.length<=14)byLength[encoded.length].push(encoded.join(','));
  }
  assert(originalLengths.every(n=>byLength[n].length));
  let seed=initialSeed|0;
  /** @returns {number} */
  function random() {
    seed^=seed<<13;
    seed^=seed>>>17;
    seed^=seed<<5;
    return seed>>>0;
  }
  const measurements=[];
  for(let trial=0;trial<256;trial++) {
    const frequency=Array.from({length:15},()=>new Map());
    for (const L of originalLengths) {
      const donor=byLength[L];
      const key=donor[random()%donor.length];
      const f=frequency[L];
      f.set(key,(f.get(key)||0)+1);
    }
    const all = stateMinimum(frequency,false);
    const separated = stateMinimum(frequency,true);
    const predictedLength3At29 = minimumPairs(frequency[3],29);
    const predictedLength4At29 = minimumPairs(frequency[4],29);
    assert(separated>=all);
    assert(predictedLength3At29>observedPairs[3]);
    measurements.push({all,separated,predictedLength3At29,
      predictedLength4At29});
  }
  const report = {
    name,sourceLexicalWords:raw.length,samples:measurements.length,
    minimumAllOriginalWordPairs:stats(measurements.map(v=>v.all)),
    minimumIndependentPerLength:stats(measurements.map(v=>v.separated)),
    originalLength3Pairs:17,
    requiredLength3PairsAt29:stats(measurements.map(v=>v.predictedLength3At29)),
    originalLength4Pairs:0,
    requiredLength4PairsAt29:stats(measurements.map(v=>v.predictedLength4At29)),
    failuresBy29TimesHiddenModes: Array.from({length:6},(_,m)=>({
      modes:m+1,failedSamples:measurements.filter(
        v=>v.separated>29*(m+1)).length
    }))
  };
  return report;
}
const shakespeare=measure('Shakespeare',
  read('resources/control/shakespeare_first300k.txt'),0x330112,55407);
const gibran=measure('Gibran',
  read('resources/control/gibran_prophet_58585.txt'),0x330161,15733);
assert.deepEqual(
  [shakespeare.minimumIndependentPerLength.min,
    shakespeare.minimumIndependentPerLength.max], [45,85]);
assert.deepEqual(
  [gibran.minimumIndependentPerLength.min,
    gibran.minimumIndependentPerLength.max], [100,161]);
console.log(JSON.stringify({
  observed:{printedWords:2896,runes:12956,
    repeatPairsByRuneWordLength:observedPairs.slice(1),
    totalDuplicatePairs:230,
    longestLengthWithAnyDuplicateCiphertextWord:3},
  model:'deterministic S-start-state one-rune-in/one-rune-out word-preserving transducer',
  theorem:'Each same plaintext word occurs in at most S ciphertext spellings; balancing collisions gives necessary minima',
  syntheticExactPositive:'THE x9, 4 state keys, 4 cipher outputs, 6 duplicate pairs',
  sources:[shakespeare,gibran]
},null,2));
console.log('PASS: all 2,896 untouched LP2 words, 2 native English donors, 512 seeded placements and all-secret state theorem');
