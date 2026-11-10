'use strict';
/**
 * Exact same-plaintext crib test for the frozen LP2 p40/p53 quotation starts.
 * Tests all 192 source-derived F79/F29 reversible successor-cipher variants,
 * proves a key-independent word-reset obstruction, and validates every mode
 * with a planted common-plaintext positive control.
 *
 * Run: node sims/quote_pair_f79_f29_equality_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const all = pages.flatMap(p => p.indices.map((r, local) =>
  ({r, page:p.page, local})));
const words = parseSharedCorpus().words;
const runeId = new Map(corpus.runes.map((r, i) => [r, i]));

let cursor = 0;
const wordRanges = [];
for (let wi = 0; wi < words.length; wi++) {
  const word = words[wi];
  const length = [...word.runes].length;
  for (const glyph of word.runes) {
    assert.equal(all[cursor].r, runeId.get(glyph));
    cursor++;
  }
  wordRanges.push({index:wi, start:cursor-length, end:cursor, length});
}
assert.equal(cursor, 12956);
assert.equal(wordRanges.length, 2896);

const quoteSpecs = [
  {name:'p40', start:9811, page:40, local:152, wordIndex:2201},
  {name:'p53', start:12522, page:53, local:53, wordIndex:2802}
];
const expectedLengths = [5, 7, 2, 3, 4];
const quotes = quoteSpecs.map(spec => {
  const firstWord = wordRanges.find(w => w.start === spec.start);
  assert(firstWord, 'quote start must be a canonical word start');
  assert.equal(firstWord.index, spec.wordIndex);
  const five = wordRanges.slice(firstWord.index, firstWord.index + 5);
  assert.deepEqual(five.map(w => w.length), expectedLengths);
  assert.equal(five.reduce((n, w) => n + w.length, 0), 21);
  assert.equal(all[spec.start].page, spec.page);
  assert.equal(all[spec.start].local, spec.local);
  const steps = all.slice(spec.start, spec.start + 21).map((item, i) =>
    (item.r - (i ? all[spec.start+i-1].r : all[spec.start-1].r) + 29) % 29);
  return {...spec, lengths:five.map(w => w.length),
    previous:all[spec.start-1].r,
    ciphertext:all.slice(spec.start, spec.start+21).map(x => x.r),
    steps};
});

const MOD = 29, Q = 28, MARK = 28;
const mod = (v, m) => (v % m + m) % m;
const log15 = new Int16Array(MOD).fill(-1);
const pow15 = [];
for (let i = 0, x = 1; i < Q; i++, x = x * 15 % MOD) {
  assert.equal(log15[x], -1);
  log15[x] = i;
  pow15.push(x);
}
assert.equal(pow15.length, 28);

const F = [15, 22];
for (let i = 2; i < 80; i++) F.push((F[i-1] + F[i-2]) % 79);
assert.deepEqual(F.slice(78), [15, 22]);
F.length = 78;
function dlog79(value) {
  if (!value) return 0;
  let x = 1;
  for (let i = 0; i < 78; i++, x = x * 53 % 79) {
    if (x === value) return i % Q;
  }
  throw new Error('53 is not a generator for the requested F79 value');
}
const families = [
  {name:'residue', key:F.map(v => v % Q)},
  {name:'scaled', key:F.map(v => Math.floor(Q * v / 79))},
  {name:'difference', key:F.map((v, i) => mod(F[(i+1)%78] - v, Q))},
  {name:'fieldlog', key:F.map(dlog79)}
];

function pointerBefore(q, cfg) {
  if (cfg.reset === 'word') return 0;
  let pointer = 0;
  if (cfg.reset === 'page') {
    const pageStart = q.start - q.local;
    assert.equal(all[pageStart].local, 0);
    for (let i = pageStart + 1; i < q.start; i++) {
      if (all[i].r !== all[i-1].r || cfg.advance) pointer++;
    }
  } else {
    for (let i = 1; i < q.start; i++) {
      if (all[i].local === 0) continue; // unencoded physical-page head
      if (all[i].r !== all[i-1].r || cfg.advance) pointer++;
    }
  }
  return pointer;
}

function decodeQuote(q, cfg) {
  let pointer = pointerBefore(q, cfg);
  let previous = all[q.start-1].r;
  let position = 0;
  const output = [];
  for (const length of q.lengths) {
    if (cfg.reset === 'word') pointer = 0;
    for (let j = 0; j < length; j++, position++) {
      const current = all[q.start + position].r;
      const step = mod(current - previous, MOD);
      if (step === 0) {
        output.push(MARK);
        if (cfg.advance) pointer++;
      } else {
        const exponent = log15[step];
        assert(exponent >= 0);
        output.push(mod(exponent - cfg.sign *
          cfg.key[(pointer + cfg.phase) % 78], Q));
        pointer++;
      }
      previous = current;
    }
  }
  return output;
}

function plantedRoundTrip(q, cfg) {
  const plaintext = Array.from({length:21}, (_, i) => (7*i + 3) % Q);
  let pointer = pointerBefore(q, cfg);
  let previous = all[q.start-1].r;
  let position = 0;
  const recovered = [];
  for (const length of q.lengths) {
    if (cfg.reset === 'word') pointer = 0;
    for (let j = 0; j < length; j++, position++) {
      const exponent = mod(plaintext[position] +
        cfg.sign * cfg.key[(pointer + cfg.phase) % 78], Q);
      const current = mod(previous + pow15[exponent], MOD);
      const observedStep = mod(current - previous, MOD);
      const decodedExponent = log15[observedStep];
      const decoded = mod(decodedExponent -
        cfg.sign * cfg.key[(pointer + cfg.phase) % 78], Q);
      assert.equal(decoded, plaintext[position]);
      recovered.push(decoded);
      previous = current;
      pointer++;
    }
  }
  assert.deepEqual(recovered, plaintext);
  return recovered;
}

const configs = [];
for (const family of families)
for (const sign of [-1, 1])
for (const reset of ['page', 'word', 'continuous'])
for (const phase of [0, 15, 22, 53])
for (const advance of [false, true])
  configs.push({...family, sign, reset, phase, advance});
assert.equal(configs.length, 192);

const decodedSteps = quotes.map(q => q.steps.map(step => {
  assert.notEqual(step, 0, 'the frozen quote spans contain no zero steps');
  return log15[step];
}));
const equalLogPositions = decodedSteps[0].flatMap((v, i) =>
  v === decodedSteps[1][i] ? [i] : []);
assert.deepEqual(equalLogPositions, []);

const histogram = {};
const byReset = {page:[], word:[], continuous:[]};
const records = [];
let positiveControls = 0;
for (const cfg of configs) {
  const a = decodeQuote(quotes[0], cfg);
  const b = decodeQuote(quotes[1], cfg);
  const matches = a.reduce((n, value, i) => n + (value === b[i] ? 1 : 0), 0);
  histogram[matches] = (histogram[matches] || 0) + 1;
  byReset[cfg.reset].push(matches);
  records.push({family:cfg.name, sign:cfg.sign, reset:cfg.reset,
    phase:cfg.phase, advanceRepeat:cfg.advance, matches});
  for (const q of quotes) {
    plantedRoundTrip(q, cfg);
    positiveControls++;
  }
}
const maximum = Math.max(...records.map(r => r.matches));
const fullMatches = records.filter(r => r.matches === 21);
assert.equal(fullMatches.length, 0);
assert.equal(maximum, 2);
assert.deepEqual(histogram, {'0':130, '1':49, '2':13});
assert.equal(byReset.word.length, 64);
assert.equal(Math.max(...byReset.word), 0);

const summarize = values => ({
  configurations:values.length,
  minimum:Math.min(...values),
  maximum:Math.max(...values),
  mean:values.reduce((sum, value) => sum + value, 0) / values.length,
  full21Matches:values.filter(value => value === 21).length
});

const result = {
  type:'exact F79/F29 source-keyed same-plaintext crib gate',
  input:'Original LP2 corpus and canonical word transcription',
  quotes:quotes.map(q => ({
    name:q.name, globalStart:q.start, physicalPage:q.page,
    pageLocalStart:q.local, canonicalWordIndex:q.wordIndex,
    wordLengths:q.lengths, previousCipherRune:q.previous,
    ciphertext:q.ciphertext, stepDifferences:q.steps
  })),
  base15Logarithms:decodedSteps,
  keyIndependentWordResetInvariant:{
    alignedLogEqualities:equalLogPositions.length,
    positions:equalLogPositions,
    interpretation:'A common deterministic 28-state key sequence reset at each word cancels at aligned within-word positions; all 21 observed step logarithms disagree.'
  },
  sourceKeyedFamily:{
    configurations:configs.length,
    exact21RuneMatches:fullMatches.length,
    maximumAlignedMatches:maximum,
    matchCountHistogram:histogram,
    byReset:Object.fromEntries(Object.entries(byReset).map(([k,v]) => [k,summarize(v)])),
    best:records.filter(r => r.matches === maximum)
  },
  plantedPositiveControls:{
    tested:positiveControls,
    expected:192*2,
    exactRecoveries:positiveControls
  },
  scope:'This rejects only a same-plaintext interpretation under a common word-reset key, and the enumerated 192 source-derived F79/F29 schedules. It does not establish that the quotations contain identical plaintext, or recover an original key.'
};
console.log(JSON.stringify(result, null, 2));
