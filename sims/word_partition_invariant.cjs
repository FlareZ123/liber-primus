/**
 * Per-word equality-partition invariant for LP2 (Gematria Primus).
 *
 * If each word is transformed by any deterministic symbol map that stays
 * fixed within that word, equal input symbols at positions i,j remain equal
 * output symbols, even when the map differs arbitrarily between words.
 * For bijective maps the full equality partition is invariant.
 *
 * Primary statistic: nonadjacent equal-symbol pairs in length 4..9 words,
 * controlled for the LP2 word-length histogram. The conditionally
 * no-adjacent-repeat result is secondary, motivated by the 83% doublet deficit.
 *
 * Node: node sims/word_partition_invariant.cjs
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const MIN = 4, MAX = 9;
const DI = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const LET = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};

/** @param {string} input English A-Z word @returns {number[]} GP rune indices. */
function encode(input) {
  const w = [];
  for (let i = 0; i < input.length; i++) {
    const val = DI[input.slice(i, i + 2)];
    if (val !== undefined) { w.push(val); i++; }
    else { assert.notEqual(LET[input[i]], undefined); w.push(LET[input[i]]); }
  }
  return w;
}

/** @returns {{cipher:number[][],shakespeare:number[][],lp1:number[][]}} */
function loadWords() {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const mapping = new Map(corpus.runes.map((v, i) => [v, i]));
  const text = read('resources/lp2-transcription.txt');
  const segments = text.split('%');
  assert.equal(segments.length, 57, 'LP2 text has 57 rune-bearing pages');
  // First 55 are unsolved; index 50 in the JSON is a runeless grid page.
  // Do not insert delimiters between pages because physical page breaks can
  // split a single lexical word. A slash followed by newline marks line wrap.
  const stream = segments.slice(0, 55).join('').replace(/\/\s*\n/g, '');
  const cipher = stream.split(/[-.\s&$]+/)
    .map(token => [...token].filter(r => mapping.has(r)).map(r => mapping.get(r)))
    .filter(w => w.length);
  assert.equal(cipher.length, 2896, 'Expected true page-crossing word count');
  assert.equal(cipher.reduce((s, w) => s + w.length, 0), 12956, 'Expected rune count');
  const shakespeare = read('resources/control/shakespeare_first300k.txt')
    .toUpperCase().match(/[A-Z]+/g).map(encode);
  // Known plaintext is a secondary register control: remove formatting
  // comments and heading labels before tokenizing.
  const known = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/(?:^|\n)### [^\n]*\n/g, ' ')
    .toUpperCase();
  const lp1 = known.match(/[A-Z]+/g).map(encode);
  return {cipher, shakespeare, lp1};
}

/** @param {number[]} word @returns {{nonadj:number,adjacent:boolean}} */
function collision(word) {
  let nonadj = 0, adjacent = false;
  for (let i = 0; i < word.length; i++)
    for (let j = i + 1; j < word.length; j++) if (word[i] === word[j]) {
      if (j === i + 1) adjacent = true;
      else nonadj++;
    }
  return {nonadj, adjacent};
}

/** @param {number[][]} words */
function bins(words, onlyNoAdjacent = false) {
  const groups = Array.from({length:MAX+1}, () => []);
  for (const w of words) {
    if (w.length < MIN || w.length > MAX) continue;
    const {nonadj, adjacent} = collision(w);
    if (onlyNoAdjacent && adjacent) continue;
    groups[w.length].push(nonadj);
  }
  return groups;
}

/** @param {number[][]} observed @param {number[][]} reference */
function compare(observed, reference) {
  const table = [];
  let score = 0, expectation = 0, variance = 0;
  for (let n = MIN; n <= MAX; n++) {
    const c = observed[n], r = reference[n];
    assert.ok(c.length && r.length);
    const mu = r.reduce((s, x) => s + x, 0) / r.length;
    const msq = r.reduce((s, x) => s + x * x, 0) / r.length;
    const ob = c.reduce((s, x) => s + x, 0);
    const expected = c.length * mu;
    const varContribution = c.length * (msq - mu*mu);
    score += ob; expectation += expected; variance += varContribution;
    table.push({runeLength:n,lp2Words:c.length,referenceWords:r.length,observed:ob,expected:expected,var:varContribution});
  }
  return {observed:score,expected:expectation,sd:Math.sqrt(variance),z:(score-expectation)/Math.sqrt(variance),table};
}

function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function randomInt(rng, n) {return Math.floor(rng()*n);}

/**
 * Monte Carlo exact length-conditioned resampling with replacement:
 * 1) sample each synthetic word from reference at the observed GP rune length,
 * 2) compare total internal repeated symbol pair count.
 */
function bootstrap(observed, reference, reps = 20000, seed = 0x3301cafe) {
  const rng = xorshift(seed);
  const target = observed.flat().reduce((s, x) => s + x, 0);
  const draws = [];
  let tail = 0, total = 0, sq = 0;
  for (let b = 0; b < reps; b++) {
    let x = 0;
    for (let n = MIN; n <= MAX; n++) {
      const group = reference[n];
      for (let i = 0; i < observed[n].length; i++) x += group[randomInt(rng,group.length)];
    }
    if (x <= target) tail++;
    total += x; sq += x*x; draws.push(x);
  }
  return {reps,seed,lowerTailHits:tail,p:(tail+1)/(reps+1),mean:total/reps,sd:Math.sqrt((sq - total*total/reps)/(reps-1)),min:Math.min(...draws),max:Math.max(...draws)};
}

function perWordPermutation(word, rng) {
  const perm = Array.from({length:29}, (_,i)=>i);
  for (let j = 28; j > 0; j--) {
    const k = randomInt(rng,j+1);
    [perm[j],perm[k]] = [perm[k],perm[j]];
  }
  return word.map(v => perm[v]);
}

/** Positive control: per-word arbitrary bijections leave the statistic intact. */
function positiveControl(words, seed=0x5ee0cafe) {
  const rng = xorshift(seed);
  const plant = words.map(w => perWordPermutation(w,rng));
  for (let i = 0; i < words.length; i++) {
    const before = collision(words[i]), after = collision(plant[i]);
    assert.deepEqual(after,before);
  }
  return {seed,words:words.length,collisionsPreserved:true};
}

function main() {
  const sources = loadWords();
  const out = {dataset:{cipherWords:sources.cipher.length,cipherRunes:12956,shakespeareWords:sources.shakespeare.length,solvedWords:sources.lp1.length},positive:positiveControl(sources.shakespeare.slice(0,1200))};
  for (const conditioned of [false,true]) {
    const observed = bins(sources.cipher,conditioned);
    for (const referenceName of ['shakespeare','lp1']) {
      const ref = bins(sources[referenceName],conditioned);
      const analytic = compare(observed,ref);
      const simulated = bootstrap(observed,ref,20000,conditioned?0x33019999:0x33013301);
      console.log(JSON.stringify({conditionedOnNoAdjacent:conditioned,reference:referenceName,...analytic,bootstrap:simulated}));
    }
  }
  console.log(JSON.stringify(out));
}
if (require.main === module) main();
module.exports = {encode,loadWords,collision,bins,compare,bootstrap,positiveControl};
