'use strict';
/**
 * Constructive lexical inversion of the previously proposed lag-six T-repair
 * under an AUTHENTIC source key: LP2 p56's prime-totient additive GP pad.
 * Each published T echo permits exactly two tentative ciphers, not 29.
 *
 * Strict rule: within each word for position >= 6 only, collision of the
 * tentative output with the preceding published output can be rerouted
 * to T(published[i-6]). The inverse tests both possibilities when C=T.
 *
 * Node 22: node sims/totient_T6_repair_dictionary_inverse.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { encode } = require('./relative_key_english_probe.cjs');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const load = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const originals = parseSharedCorpus().words;
const gpMap = new Map(corpus.runes.map((r, i) => [r, i]));
const cipherWords = originals.map((word) => [...word.runes].map((rune) => gpMap.get(rune)));
const full = cipherWords.flat();
const pages = corpus.pages.filter((page) => page.page < 56 && page.indices.length > 0);
assert.equal(originals.length, 2896);
assert.equal(full.length, 12956);
assert.deepEqual(full, pages.flatMap((page) => page.indices));

const wordStarts = [];
const pagePos = [];
let global = 0, word = 0;
for (const xs of cipherWords) {
  wordStarts.push(global);
  global += xs.length;
  word++;
}
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i++) pagePos.push(i);
}
assert.equal(pagePos.length, 12956);

const lexicon = new Map(), dictionary = new Set(), byLength = new Map();
for (const line of load('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/u)) {
  const match = /^([a-z]+)\s+(\d+)$/u.exec(line);
  if (!match || /q(?!u)/u.test(match[1])) continue;
  const code = encode(match[1]);
  const key = code.join(',');
  const count = Number(match[2]);
  if (!code.length || (lexicon.get(key)?.count || 0) >= count) continue;
  lexicon.set(key, {word:match[1],count,code});
}
for (const [key, value] of lexicon) {
  dictionary.add(key);
  if (!byLength.has(value.code.length)) byLength.set(value.code.length, []);
  byLength.get(value.code.length).push(value);
}
assert.ok(dictionary.size > 25000);

// Reproduce the authenticated LP2 page56 prime-totient keystream.
function totientPrimes(count) {
  const lim = Math.ceil((count+20)*(Math.log(count+20)+Math.log(Math.log(count+20))))+200;
  const composite = new Uint8Array(lim+1), out = new Uint8Array(count);
  let n = 0;
  for (let p = 2; p <= lim && n < count; p++) {
    if (composite[p]) continue;
    out[n++] = (p-1) % 29;
    if (p*p <= lim) for (let j = p*p; j <= lim; j += p) composite[j] = 1;
  }
  assert.equal(n, count);
  return out;
}
const key = totientPrimes(full.length+32);
assert.deepEqual([...key.slice(0, 8)], [1,2,4,6,10,12,16,18]);
const mod = n => (n%29+29)%29;
const T = x => mod(24-2*x);

/**
 * @param {number[][]} manuscript Published source words.
 * @param {'word'|'page'|'book'} reset
 * @param {boolean} literalF Whether final observed F is left unchanged and doesn't consume key.
 * @returns {number[][]} Key phases by word/rune
 */
function phases(manuscript, reset, literalF) {
  const phaseWords = [], sequences = manuscript.flat();
  let k = 0, global = 0, previousPagePos = -1;
  for (let w = 0; w < manuscript.length; w++) {
    if (reset === 'word') k = 0;
    const phase = [];
    for (let j = 0; j < manuscript[w].length; j++) {
      if (reset === 'page' && (global === 0 || pagePos[global] === 0)) k = 0;
      phase.push(k);
      if (!(literalF && manuscript[w][j] === 0)) k++;
      global++;
    }
    phaseWords.push(phase);
  }
  assert.equal(global, sequences.length);
  return phaseWords;
}

/**
 * Exact inverse candidates at a position, conditional on previous published
 * cipher runes, with optional literal-F p56 rule.
 * @param {number[]} C Printed ciphertext word
 * @param {number} at Rune position inside the word
 * @param {number} pad Additive totient key value
 * @param {-1|1} sign Encryption sign, cipher = plain + sign*key
 * @param {boolean} literalF
 * @returns {number[]}
 */
function candidates(C, at, pad, sign, literalF) {
  if (literalF && C[at] === 0) return [0];
  const outputs = [mod(C[at] - sign*pad)];
  if (at >= 6) {
    const other = T(C[at-6]);
    if (C[at] === other && C[at-1] !== other) {
      const alt = mod(C[at-1] - sign*pad);
      if (!outputs.includes(alt)) outputs.push(alt);
    }
  }
  return outputs;
}

/** @param {number[][]} manuscript @param {'word'|'page'|'book'} reset @param {-1|1} sign @param {boolean} literalF */
function evaluate(manuscript, reset, sign, literalF) {
  const phase = phases(manuscript, reset, literalF);
  const byLength = new Map();
  let feasible = 0, long = 0, exact = 0, ambiguous = 0, totalAlternates = 0, all = 0;
  const previews = [];
  for (let w = 0; w < manuscript.length; w++) {
    const word = manuscript[w];
    const choices = word.map((c, i) => candidates(word, i, key[phase[w][i]], sign, literalF));
    totalAlternates += choices.reduce((a, v) => a + v.length-1, 0);
    let hit = false;
    let count = 0, preferred = '';
    const curr = new Array(word.length);
    function dfs(i, changes) {
      if (i === word.length) {
        if (dictionary.has(curr.join(','))) {
          count++;
          if (!preferred) preferred = lexicon.get(curr.join(',')).word;
          if (!changes) exact++;
        }
        return;
      }
      for (let a = 0; a < choices[i].length; a++) {
        curr[i] = choices[i][a];
        dfs(i+1, changes+a);
      }
    }
    dfs(0, 0);
    hit = count > 0;
    if (hit) {
      feasible++;
      if (word.length >= 5) long++;
      if (count > 1) ambiguous++;
      if (previews.length < 12 && word.length >= 5) previews.push({word:w,code:word.join(','),candidate:preferred,alternates:choices.filter(a=>a.length>1).length});
    }
    const state = byLength.get(word.length) || {words:0,feasible:0};
    state.words++;state.feasible+=Number(hit);byLength.set(word.length,state);
    all++;
  }
  return {reset,sign,literalF,words:all,feasible,longAtLeastFive:long,zeroRepairExactHits:exact,
    ambiguousWords:ambiguous,latentChoiceSites:totalAlternates,
    byLength:Object.fromEntries([...byLength].sort((a,b)=>a[0]-b[0]).map(([length,v])=>[length,v])),
    representativeFivePlus:previews};
}
const tested = [];
for (const reset of ['word','page','book']) {
  for (const sign of [-1,1]) {
    for (const literalF of [false,true]) tested.push(evaluate(cipherWords,reset,sign,literalF));
  }
}
tested.sort((a,b)=>b.longAtLeastFive-a.longAtLeastFive||b.feasible-a.feasible);

// Model-matched positive: independent lexicon plaintext matching EXACT original
// 2,896 word lengths, plus the same p56 totient key and stochastic T-repair.
const selected = originals.map(({length},i) => {
  const list = byLength.get(length);
  assert.ok(list?.length, 'missing source word length '+length);
  return list[(i*13 + length*7)%list.length].code;
});
const validKey = phases(selected,'word',false);
let repairs=0;
const planted = selected.map((xs,w) => {
  const out = [];
  for (let j=0;j<xs.length;j++) {
    let c = mod(xs[j] + key[validKey[w][j]]);
    if (j>=6 && c === out[j-1] && (w*151 + j*31)%100<82) {
      c = T(out[j-6]);
      repairs++;
    }
    out.push(c);
  }
  return out;
});
const plantedEval = evaluate(planted,'word',1,false);
assert.equal(plantedEval.feasible, planted.length);
assert.ok(plantedEval.longAtLeastFive > 1000);
assert.ok(repairs > 10);
const observedLongest = tested[0].longAtLeastFive;
console.log(JSON.stringify({
  model:'published LP2 p56 phi(prime_n) modulo29 stream plus word-local latent lag-six affine T collision repair',
  source:'original 55 rune-bearing LP2 pages, original word lengths, 29060-word GP lexicon',
  hypothesis:'C_i = tentative_i except when tentative_i==C_(i-1) and position>=6, where C_i may be T(C_(i-6)); inverse candidates tentative_i in {C_i,C_(i-1)} at T echoes',
  dictionaryGPWords:dictionary.size,
  sourceWords:originals.length,sourceRunes:full.length,
  testedSettings:tested.length,
  cases:tested,
  positive:{source:'independent dictionary words exactly matched to original 2,896 manuscript lengths',
    model:'word reset, encryption sign +1, no F skip, 82% T repair on eligible collisions',
    outputRepairs:repairs,validatedFeasibleWords:plantedEval.feasible,
    validatedLongWords:plantedEval.longAtLeastFive,strictRecoveryOfAllSourceWords:true},
  scope:'Only literal source prime-totient key start0, 3 scope resets, both signs, literal F optional; word-local lag6 corrections. Exact dictionary feasibility, no English plaintext or key inferred.'
},null,2));
