'use strict';
/**
 * Original LP2 p53/p55 shared-additive-pad feasibility test (single runnable file).
 * The same LP1-p05 moth illustration is reused on both original pages. Test the
 * only two start/end-aligned 76-rune consumers, without fitting a key or phase.
 *
 * Run from repository root: node sims/lp2_moth_p53_p55_sharedpad_native_gate_sft.cjs
 * Negative scope: a common additive GP29 pad, printed English word boundaries,
 * and a finite source-native English lexicon. Neither original plaintext is known.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourcePages = read('resources/liber-primus/lp2-transcription.txt').split('%');
const sourceRunes = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = [{token: 'ING', index: 21}, {token: 'IO', index: 27},
  ...corpus.translit.map((token, index) => ({token, index}))]
  .sort((a, b) => b.token.length - a.token.length);
const mod = x => (x % 29 + 29) % 29;

/** Source-native GP spelling, including authentic one-rune ING/IO.
 * @param {string} source @returns {number[] | null}
 */
function gp(source) {
  const text = source.toUpperCase().replace(/[KVZQ]/g,
    c => ({K: 'C', V: 'U', Z: 'S', Q: 'C'})[c]);
  const result = [];
  for (let i = 0; i < text.length;) {
    const match = tokens.find(t => text.startsWith(t.token, i));
    if (!match) return null;
    result.push(match.index);
    i += match.token.length;
  }
  return result;
}
const dictionary = Array.from({length: 30}, () => new Map());
/** @param {string} word */
function add(word) {
  const values = gp(word);
  if (values && values.length > 0 && values.length < 30) {
    dictionary[values.length].set(values.join(','), values);
  }
}
const trainingCounts = Array(29).fill(0);
let trainingMass = 0;
for (const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
  const match = line.match(/^([a-z]+)\s+(\d+)/);
  if (!match) continue;
  const word = gp(match[1]), weight = Number(match[2]);
  assert(word && word.length);
  add(match[1]);
  for (const symbol of word) {
    trainingCounts[symbol] += weight;
    trainingMass += weight;
  }
}
for (const file of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt',
]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) add(word);
}
assert.equal(dictionary.reduce((sum, m) => sum + m.size, 0), 30502);

/** Original printed word boundaries, including cross-line word continuations.
 * The derivative transcription skips runeless physical page 50.
 * @param {number} page @returns {{start:number,length:number}[]}
 */
function printedWords(page) {
  const transcription = sourcePages[page < 50 ? page : page - 1];
  const words = [];
  const observed = [];
  let index = 0, open = false;
  for (const ch of transcription) {
    if (sourceRunes.has(ch)) {
      if (!open) {
        words.push({start: index, length: 0});
        open = true;
      }
      words[words.length - 1].length++;
      observed.push(sourceRunes.get(ch));
      index++;
    } else if ("-.'&$;,:".includes(ch)) {
      open = false;
    }
  }
  assert.deepEqual(observed, corpus.pages[page].indices);
  return words;
}
const firstPage = printedWords(53), secondPage = printedWords(55);
const c53 = corpus.pages[53].indices, c55 = corpus.pages[55].indices;
assert.equal(c53.length, 179);
assert.equal(c55.length, 76);
assert.deepEqual(secondPage.map(w => w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

/** @typedef {{a:number,b:number,start:number,end:number,span:number}} Edge */
/** @param {number} offset @returns {{aWords:object[],bWords:object[],edges:Edge[]}} */
function geometry(offset) {
  const aWords = firstPage.map((w, i) => ({...w, start: w.start - offset, i}))
    .filter(w => w.start >= 0 && w.start + w.length <= 76);
  // p55 rune zero is the final NG of a word carried over from p54.
  const bWords = secondPage.map((w, i) => ({...w, i}))
    .filter(w => w.start >= 1 && w.start + w.length <= 76);
  const edges = [];
  for (const a of aWords) for (const b of bWords) {
    const start = Math.max(a.start, b.start);
    const end = Math.min(a.start + a.length, b.start + b.length);
    if (end > start) edges.push({a: a.i, b: b.i, start, end, span: end-start});
  }
  return {aWords, bWords, edges};
}
/** Check every dictionary pair, with no fitted pad or plaintext.
 * @param {Edge} e @param {number[]} diff @param {number} offset
 */
function supported(e, diff, offset) {
  const a = firstPage[e.a], b = secondPage[e.b];
  const aStart = a.start - offset, bStart = b.start;
  const signature = new Set([...dictionary[b.length].values()]
    .map(w => w.slice(e.start - bStart, e.end - bStart).join(',')));
  for (const w of dictionary[a.length].values()) {
    const need = [];
    for (let i = e.start; i < e.end; i++) {
      need.push(mod(w[i-aStart] - diff[i]));
    }
    if (signature.has(need.join(','))) return true;
  }
  return false;
}
/** @param {number} offset @param {number[]} diff */
function audit(offset, diff) {
  const g = geometry(offset);
  return {completeWordCounts: [g.aWords.length,g.bWords.length], edges: g.edges.length,
    unsupported: g.edges.filter(e => !supported(e,diff,offset))};
}
const firstDiff = c55.map((v, i) => mod(c53[i] - v));
const lastDiff = c55.map((v, i) => mod(c53[103+i] - v));
const first = audit(0, firstDiff), last = audit(103, lastDiff);
assert.deepEqual(first.unsupported.map(e=>[e.a,e.b,e.start,e.end]),
  [[2,4,9,15],[6,7,25,33]]);
assert.deepEqual(last.unsupported.map(e=>[e.a,e.b,e.start,e.end]),
  [[28,7,25,30],[29,7,30,34],[35,12,56,62]]);
assert.deepEqual([first.edges,last.edges], [28,33]);

/** Compute rank29 source-native English difference likelihood. */
const unigram = trainingCounts.map(v => v / trainingMass);
const q = Array.from({length: 29}, (_, d) =>
  unigram.reduce((sum, p, i) => sum + p * unigram[mod(i-d)], 0));
/** @param {number[]} delta @returns {number} */
const logRatio = delta => delta.reduce((sum,d) => sum + Math.log(29*q[d]),0);
const originalLR = [logRatio(firstDiff),logRatio(lastDiff)];
assert(originalLR[0] < -2.9 && originalLR[0] > -3.2);
assert(originalLR[1] < -3.7 && originalLR[1] > -4.1);

/** Exact original solved-p56 F-transparent prime-totient positive control. */
const primes = [];
for (let n = 2; primes.length < 84; n++) {
  if (primes.every(p => p*p > n || n % p !== 0)) primes.push(n);
}
let cursor = 0;
const p56 = corpus.pages[56].indices.map((v, i) =>
  i === 56 ? 0 : mod(v - (primes[cursor++] - 1)));
assert.equal(cursor, 84);
const expectedP56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO '
  + 'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(p56, expectedP56.split(' ').flatMap(w=>gp(w)));
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const positiveWindowRatios = [];
for (let i=0;i<=p56.length-76;i++) for(let j=0;j<=p57.length-76;j++) {
  positiveWindowRatios.push(logRatio(p56.slice(i,i+76).map(
    (v,k)=>mod(v-p57[j+k]))));
}
assert.equal(positiveWindowRatios.length, 200);

// Source-boundary-preserving, native-word positive plant for *both* alignments.
let state=0x5e7a3011;
/** @returns {number} */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {{length:number}[]} shape @returns {number[]} */
function plant(shape) {
  return shape.flatMap(word=>{
    const options=[...dictionary[word.length].values()];
    assert(options.length > 0);
    return options[random()%options.length];
  });
}
const plants=[];
for (const offset of [0,103]) {
  let pass=0, independent=0;
  for(let n=0;n<24;n++){
    const p53=plant(firstPage).slice(offset,offset+76);
    const p55=plant(secondPage);
    const key=p53.map(()=>random()%29);
    const e53=p53.map((v,i)=>mod(v+key[i]));
    const e55=p55.map((v,i)=>mod(v+key[i]));
    assert.deepEqual(e53.map((v,i)=>mod(v-key[i])),p53);
    assert.deepEqual(e55.map((v,i)=>mod(v-key[i])),p55);
    const good=e53.map((v,i)=>mod(v-e55[i]));
    assert.equal(audit(offset,good).unsupported.length,0);
    pass++;
    const unrelated=e55.map((_,i)=>mod(p55[i]+random()%29));
    if(audit(offset,e53.map((v,i)=>mod(v-unrelated[i]))).unsupported.length)independent++;
  }
  plants.push({offset,sharedPadPassing:pass,independentPadRejected:independent});
}
console.log(JSON.stringify({
  originalPages:[53,55],originalLengths:[179,76],
  alignments:[
    {p53offset:0,sourceWordCounts:first.completeWordCounts,
      overlapCount:first.edges,unsupported:first.unsupported,logRatio:originalLR[0]},
    {p53offset:103,sourceWordCounts:last.completeWordCounts,
      overlapCount:last.edges,unsupported:last.unsupported,logRatio:originalLR[1]},
  ],
  nativeLexiconWords:dictionary.reduce((sum,m)=>sum+m.size,0),
  trainingRuneOccurrences:trainingMass,
  sourceSolvedWindowControl:{
    n:positiveWindowRatios.length,min:Math.min(...positiveWindowRatios),
    max:Math.max(...positiveWindowRatios),
    countsAtOrBelowOriginal:originalLR.map(x=>positiveWindowRatios.filter(y=>y<=x).length),
  },
  syntheticPlants:plants,
  verdict:'Finite native-English/unaltered-word shared additive pad rejected for both source-frozen page alignments; no original plaintext.'
},null,2));
