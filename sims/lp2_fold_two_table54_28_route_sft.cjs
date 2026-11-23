'use strict';

/**
 * Original LP2 2016 WORDS/MAP/NUMBERS hypothesis: GP-prime wholeword sum
 * indexes the 256-cell table, whose byte gives a physical page number.
 * Reproduce: node sims/lp2_fold_two_table54_28_route_sft.cjs
 *
 * Conditional navigation hypothesis only. The table opcode is not signed,
 * the lexical word selection was retrospective, and the p28 readout was
 * reported independently before this test. No plaintext is decrypted here.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(base, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const dictionary = read('resources/control/english_wordfreq_textblob.txt');

const primes = [];
for (let n = 2; primes.length < 29; n++) {
  if (Array.from({length: Math.max(0, Math.floor(Math.sqrt(n)) - 1)},
    (_, i) => i + 2).every((d) => n % d !== 0)) primes.push(n);
}
assert.deepEqual([primes[0], primes[3], primes[20], primes[23]],
  [2, 7, 73, 89]);
const wordsInDictionary = new Map();
function gpEncode(word) {
  const indices = [];
  for (let i = 0; i < word.length;) {
    let best = -1;
    for (let k = 0; k < corpus.translit.length; k++) {
      if (word.startsWith(corpus.translit[k], i) &&
        (best < 0 ||
         corpus.translit[k].length > corpus.translit[best].length)) best = k;
    }
    if (best < 0) return null;
    indices.push(best);
    i += corpus.translit[best].length;
  }
  return indices;
}
for (const line of dictionary.split(/\r?\n/)) {
  const match = line.match(/^([a-z]+) (\d+)$/);
  if (!match) continue;
  const spell = match[1].toUpperCase()
    .replaceAll('ING', 'NG').replaceAll('IO', 'IA');
  const values = gpEncode(spell);
  if (!values) continue;
  const key = values.join(',');
  const prev = wordsInDictionary.get(key);
  const item = {word: match[1], frequency: Number(match[2])};
  if (!prev || prev.frequency < item.frequency) {
    wordsInDictionary.set(key, item);
  }
}

const cells = grid.pages.flatMap((p) => p.tokens);
const bytes = grid.bytes;
assert.equal(cells.length, 256);
assert.equal(bytes.length, 256);
const abc = grid.alphabet;
assert.deepEqual(cells.map((pair) =>
  abc.indexOf(pair[0]) * 60 + abc.indexOf(pair[1])), bytes);
const rune = new Map(corpus.runes.map((r, i) => [r, i]));
const flattened = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
assert.equal(flattened.length, 12956);
const starts = [0];
for (const p of corpus.pages.slice(0, 56)) {
  starts.push(starts.at(-1) + p.indices.length);
}
const tokenFragments = transcription.split('%').slice(0, 55)
  .join('%').split(/[.\-$&]/);
const words = [], recognized = [], candidates = [];
let pos = 0, page = 0;
for (const fragment of tokenFragments) {
  const w = Array.from(fragment)
    .filter((c) => rune.has(c))
    .map((c) => rune.get(c));
  if (!w.length) continue;
  while (page < 55 && pos >= starts[page + 1]) page++;
  const word = {page, localRune: pos - starts[page],
    startRune: pos, indices: w};
  words.push(word);
  const lemma = w.length >= 3 ? wordsInDictionary.get(w.join(',')) : null;
  if (lemma) {
    const gpPrimeSum = w.reduce((sum, k) => sum + primes[k], 0);
    const item = {
      page, wordIndex: words.length - 1, localRune: word.localRune,
      indices: w, gpPrimeSum, ...lemma,
    };
    recognized.push(item);
    if (gpPrimeSum < 256) candidates.push(item);
  }
  pos += w.length;
}
assert.equal(words.length, 2896);
assert.equal(pos, flattened.length);
assert.deepEqual(words.flatMap((w) => w.indices), flattened);
assert.equal(recognized.length, 24);
assert.equal(candidates.length, 23);

function edgesFor(table) {
  return candidates.filter((w) => table[w.gpPrimeSum] < 56).map((w) =>
    {...w, targetPage: table[w.gpPrimeSum]});
}
function routesFor(table) {
  const edges = edgesFor(table);
  const chains = [];
  for (const left of edges) {
    for (const right of edges) {
      if (left.targetPage === right.page) {
        chains.push({from: left.page, via: right.page,
          to: right.targetPage, firstWord: left.word,
          secondWord: right.word});
      }
    }
  }
  return {edges, chains};
}
const observed = routesFor(bytes);
const direct = observed.chains;
const fold = recognized.filter((w) => w.page === 14 && w.word === 'fold');
const two = recognized.filter((w) => w.page === 54 && w.word === 'two');
assert.equal(fold.length, 1);
assert.equal(two.length, 1);
assert.equal(fold[0].localRune, 2);
assert.equal(two[0].localRune, 38);
assert.equal(fold[0].gpPrimeSum, 171);
assert.equal(two[0].gpPrimeSum, 85);
assert.equal(cells[171], '0s');
assert.equal(cells[85], '0S');
assert.equal(bytes[171], 54);
assert.equal(bytes[85], 28);
assert.equal(observed.edges.length, 7);
assert.deepEqual(direct, [
  {from: 14, via: 54, to: 28, firstWord: 'fold', secondWord: 'two'},
]);

// Preserve the complete original table-byte multiset. Null outcomes are
// descriptive, NOT a prospective author-intent probability for the
// post-discovery FOLD / TWO / p28 targets.
const seed = 0x20143301;
let state = seed >>> 0;
function random() {
  state ^= (state << 13);
  state ^= (state >>> 17);
  state ^= (state << 5);
  return state >>> 0;
}
const shuffles = 100000;
const nullHits = {anyTwoHop: 0, anyTwoHopTo28: 0,
  anyTwoHopFrom14To28: 0, exactNamedRoute: 0};
for (let iteration = 0; iteration < shuffles; iteration++) {
  const permuted = bytes.slice();
  for (let i = permuted.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [permuted[i], permuted[j]] = [permuted[j], permuted[i]];
  }
  const {chains} = routesFor(permuted);
  if (chains.length) nullHits.anyTwoHop++;
  if (chains.some((x) => x.to === 28)) nullHits.anyTwoHopTo28++;
  if (chains.some((x) => x.from === 14 && x.to === 28)) {
    nullHits.anyTwoHopFrom14To28++;
  }
  if (chains.some((x) => x.from === 14 && x.via === 54 &&
    x.to === 28 && x.firstWord === 'fold' &&
    x.secondWord === 'two')) nullHits.exactNamedRoute++;
}
const count = (value) => bytes.filter((v) => v === value).length;
const exactNamedProbability = count(54) * count(28) / (256 * 255);
assert.equal(count(54), 4);
assert.equal(count(28), 2);
assert.equal(exactNamedProbability, 8 / (256 * 255));

console.log('SOURCES: 12956 unmodified GP29 runes, 2896 printed complete words.');
console.log('INDEPENDENT DICTIONARY: 24 native-rune English exact words length>=3,');
console.log('23 have rune-prime sum below the table size 256.');
console.log('ORIGINAL native-English table→page edges:', observed.edges.map((e) =>
  e.page + ':' + e.word + '→' + e.targetPage).join(', '));
console.log('ORIGINAL two-hop routes:', direct);
console.log('FOLD p14 offsets 2–5: prime171→T[171]=0s=54');
console.log('TWO p54 offsets 38–40: prime85→T[85]=0S=28');
console.log('Two table tokens are case counterparts; their byte difference is26.');
console.log('Null table-multiset permutations:', shuffles, 'seed', seed, nullHits);
console.log('Exact fixed-cell named-route probability under uniform full permutation:',
  exactNamedProbability);
console.log('CAVEAT: route and word choices identified after original table inspection;');
console.log('no objective evidence for the unsigned prime-sum→byte→page opcode');
console.log('or an authenticated subsequent plaintext decode.');
console.log('PASS: exact complete original rune/page/word/table sources and frozen route.');
