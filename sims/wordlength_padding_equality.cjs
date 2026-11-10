'use strict';
/**
 * Model one independently inserted cipher rune per selected English word.
 * The exact nonadjacent equality of the original word survives a fixed
 * wordwise substitution and any single-symbol insertion.
 *
 * Run: node sims/wordlength_padding_equality.cjs
 */
const assert = require('node:assert/strict');
const {loadWords, collision} = require('./word_partition_invariant.cjs');
const P = 0.45;
const REPS = 2000;
const SEED = 0x50e1a117;
const MIN = 4;
const MAX = 9;

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[][]} words @returns {number[][][]} */
function byLength(words) {
  const groups = Array.from({length: MAX + 1}, () => []);
  for (const word of words) if (word.length <= MAX) groups[word.length].push(word);
  return groups;
}

/**
 * @param {number[][]} cipher
 * @param {number[][]} reference
 * @param {number} p
 * @returns {{lower:number, lowerSd:number, addedRandom:number, totalRandom:number, cells:object[]}}
 */
function model(cipher, reference, p) {
  const counts = Array.from({length:MAX+1}, () => 0);
  const observed = Array.from({length:MAX+1}, () => []);
  for (const word of cipher) if (word.length >= MIN && word.length <= MAX) {
    counts[word.length]++;
    observed[word.length].push(collision(word).nonadj);
  }
  const ref = byLength(reference);
  const stat = wordList => {
    const vals = wordList.map(word => collision(word).nonadj);
    const n = vals.length, mean = vals.reduce((a,b) => a+b,0)/n;
    return {n,mean,second:vals.reduce((a,b)=>a+b*b,0)/n};
  };
  let lower = 0, variance = 0, addedRandom = 0;
  const cells = [];
  for (let length = MIN; length <= MAX; length++) {
    const original = stat(ref[length]), padded = stat(ref[length-1]);
    const padProbability = (p*padded.n)/((1-p)*original.n+p*padded.n);
    const mean = (1-padProbability)*original.mean+padProbability*padded.mean;
    const second = (1-padProbability)*original.second+padProbability*padded.second;
    const randomInsertion = padProbability*(length-1)*(length-2)/(length*29);
    lower += counts[length]*mean;
    variance += counts[length]*(second-mean*mean);
    addedRandom += counts[length]*randomInsertion;
    cells.push({length,count:counts[length],padProbability,lowerPerWord:mean,
      randomInsertionPerWord:randomInsertion});
  }
  return {lower,lowerSd:Math.sqrt(variance),addedRandom,
    totalRandom:lower+addedRandom,cells,ref};
}

/**
 * @param {number[][]} cipher
 * @param {number[][][]} ref
 * @param {number} p
 * @param {() => number} random
 * @returns {number}
 */
function simulate(cipher, ref, p, random) {
  let sum = 0;
  for (const sourceWord of cipher) {
    const length = sourceWord.length;
    if (length < MIN || length > MAX) continue;
    const paddedMass = p*ref[length-1].length;
    const rawMass = (1-p)*ref[length].length;
    const padded = random() < paddedMass/(paddedMass+rawMass);
    const source = ref[padded ? length-1 : length];
    const word = source[Math.floor(random()*source.length)];
    sum += collision(word).nonadj;
    if (padded) {
      const rune = Math.floor(random()*29);
      const position = Math.floor(random()*(word.length+1));
      for (let i = 0; i < word.length; i++) {
        if (i !== position && i !== position-1 && word[i] === rune) sum++;
      }
    }
  }
  return sum;
}

function main() {
  const data = loadWords();
  assert.equal(data.cipher.length, 2896);
  const observed = data.cipher.filter(w => w.length>=MIN && w.length<=MAX)
    .reduce((sum,word) => sum+collision(word).nonadj,0);
  assert.equal(observed,526);
  const reference = {
    shakespeare:data.shakespeare, lp1:data.lp1, distinctShakespeare:data.unique
  };
  const controls = {};
  for (const [name,words] of Object.entries(reference)) {
    const fit = model(data.cipher, words, P);
    const {ref,...summary} = fit;
    controls[name] = summary;
  }
  const random = rng(SEED);
  const shakespeare = model(data.cipher, reference.shakespeare, P);
  const trials = Array.from({length:REPS},()=>simulate(data.cipher,shakespeare.ref,P,random));
  trials.sort((a,b)=>a-b);
  const mean = trials.reduce((a,b)=>a+b,0)/REPS;
  const sd = Math.sqrt(trials.reduce((a,b)=>a+(b-mean)**2,0)/(REPS-1));
  console.log(JSON.stringify({
    mechanism:'At most one independent dummy rune per intact source word, followed by an arbitrary fixed-per-word substitution',
    caveat:'A noninjective substitution cannot reduce retained original rune equality. Source comparison is conditional on the chosen English register.',
    lp2ObservedNonadjacentPairs:observed,
    lp2WordsLength4to9:data.cipher.filter(w=>w.length>=MIN && w.length<=MAX).length,
    paddingProbability:P,controls,
    randomPaddingMonteCarlo:{repetitions:REPS,seed:'0x'+SEED.toString(16),
      mean,sd,min:trials[0],q05:trials[Math.floor(REPS*0.05)],
      tail:(1+trials.filter(x=>x<=observed).length)/(REPS+1)}
  },null,2));
}
if (require.main===module) main();
module.exports={rng,byLength,model,simulate,main};
