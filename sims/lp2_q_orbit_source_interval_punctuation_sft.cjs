'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul([a, b], [c, d]) {
  return [
    mod(a * c + 8 * b * d),
    mod(a * d + b * c + 3 * b * d),
  ];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */
  let acc = [0, 0];
  /** @type {[number,number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepEqual(EQ, [17, 24]);

const dlog = new Map();
let state = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert(!dlog.has(state.join(',')));
  dlog.set(state.join(','), k);
  state = mul(state, EQ);
}
assert.deepEqual(state, [1, 0]);

const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} runes @returns {number[]} */
function runeValues(runes) {
  return [...runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
}

/** @param {[number,number]} coord @returns {{lo:number,hi:number,words:string[],letters:number}} */
function sourceInterval(coord) {
  const lo = Math.min(...coord);
  const hi = Math.max(...coord);
  const intervalWords = words.slice(lo, hi + 1);
  return {
    lo,
    hi,
    words: intervalWords,
    letters: intervalWords.reduce((total, word) => total + word.length, 0),
  };
}

const records = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const E = evaluate(runeValues(span.runes));
    const k = dlog.get(E.join(','));
    if (k === undefined) continue; // the marked p3 triad evaluates to zero
    const coord = [Math.floor(k / MOD), k % MOD];
    const interval = sourceInterval(coord);
    const punctuationCounts = (page.large_punctuation || []).map((mark) => mark[1]);
    records.push({
      page: page.page,
      start: span.start,
      length: span.length,
      k,
      coord,
      interval,
      punctuationCounts,
      samePagePunctuationMatch: punctuationCounts.includes(interval.letters),
    });
  }
}
assert.equal(records.length, 17);

const samePageMatches = records.filter((record) => record.samePagePunctuationMatch);
assert.deepEqual(samePageMatches, [{
  page: 56,
  start: 0,
  length: 5,
  k: 121,
  coord: [4, 5],
  interval: {
    lo: 4,
    hi: 5,
    words: ['EMPTY', 'EPIPHANY'],
    letters: 13,
  },
  punctuationCounts: [13, 10, 13],
  samePagePunctuationMatch: true,
}]);

const p40 = records.find((record) => record.page === 40 && record.start === 0);
assert(p40);
assert.deepEqual(p40.coord, [5, 8]);
assert.deepEqual(p40.interval, {
  lo: 5,
  hi: 8,
  words: ['EPIPHANY', 'SEEKS', 'THE', 'DEVOTED'],
  letters: 23,
});

const punctuation23 = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === p40.interval.letters) {
      punctuation23.push({page: page.page, offset: mark[0], count: mark[1], color: mark[2]});
    }
  }
}
assert.deepEqual(punctuation23, [
  {page: 57, offset: 95, count: 23, color: 'red'},
]);

const p57 = records.find((record) => record.page === 57 && record.start === 0);
assert(p57);
assert.equal(p57.length, 7);

// p57's red opener is the solved PARABLE source object already used in Q construction.
assert.equal(runeValues(ink.pages.find((page) => page.page === 57).red_spans[0].runes)
  .map((index) => corpus.translit[index]).join(''), 'PARABLE');

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'Q-orbit source-interval to original-punctuation navigation cross-lock; no unknown plaintext',
  Q,
  E_Q: EQ,
  redOrbitRecordCount: records.length,
  uniqueSamePageCalibration: samePageMatches[0],
  p40Prediction: {
    coordinate: p40.coord,
    sourceInterval: p40.interval,
    uniquePunctuationReceiver: punctuation23[0],
  },
  cycle: 'solved p56 interval13 calibrates rule -> unknown p40 interval23 -> unique solved p57 terminal23 mark -> p57 PARABLE is an original Q-construction operand',
}, null, 2));
