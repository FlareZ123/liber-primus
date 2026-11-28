'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8').replace(/\r/g, '');
const signed2016 = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @param {number[]} coefficients @returns {[number, number]} */
function evaluate(coefficients) {
  /** @type {[number, number]} */
  let acc = [0, 0];
  /** @type {[number, number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number[]} values @returns {number[]} */
function H(values) {
  const n = values.length;
  const half = Math.floor(n / 2);
  const out = [];
  for (let i = 0; i < half; i += 1) out.push(mod(values[i] - values[n - 1 - i]));
  if (n % 2) out.push(values[half]);
  for (let i = half - 1; i >= 0; i -= 1) out.push(mod(values[i] + values[n - 1 - i]));
  return out;
}

/** @param {number[]} values @returns {number} */
function product(values) {
  return values.reduce((acc, value) => mod(acc * value), 1);
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return mod(values.reduce((acc, value) => acc + value, 0));
}

/** @param {number} page @returns {{start:number,end:number,values:number[]}[]} */
function wordsAt(page) {
  const source = corpus.pages.find((item) => item.page === page).indices;
  const segment = parts[page >= 51 ? page - 1 : page];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset, values: current.slice()});
    current = [];
  };
  for (const ch of segment) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      assert.equal(source[offset], value, `transcription mismatch p${page}@${offset}`);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, `physical p${page} rune count`);
  return words;
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const ann = ink.pages.find((item) => item.page === page);
  const span = (ann.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span, `missing p${page} red span`);
  return [...span.runes].map((rune) => runeIndex.get(rune));
}

/** @param {[number,number]} pair @returns {string} */
function translit(pair) {
  return pair.map((index) => corpus.translit[index]).join('');
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error(`no inverse for ${value} mod ${modulus}`);
}

// Frozen Q from the exact p3 / p15-second / p57 bridge.
const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepEqual(EQ, [17, 24]);

const p15First = redSpan(15, 0, 9);
const direction = mul(EQ, evaluate(p15First));
assert.deepEqual(direction, [23, 8]);
assert.equal(translit(direction), 'DH');

// Authenticated 2016 source licenses the numbers-as-direction interpretation.
const signedBody = signed2016.split('-----BEGIN PGP SIGNATURE-----')[0];
assert.match(
  signedBody,
  /Its words are the map, their\s+meaning is the road, and their numbers are the direction\./
);

// Independently established p23 red register.
const p23Ann = ink.pages.find((item) => item.page === 23);
assert.deepEqual(p23Ann.red_spans.map((span) => [span.start, span.length]), [[0, 16]]);
const p23Words = wordsAt(23);
const p23RedWords = p23Words.filter((word) => word.start >= 0 && word.end <= 16);
assert.deepEqual(p23RedWords.map((word) => word.values.length), [2, 6, 3, 5]);
const p23Products = p23RedWords.map((word) => product(word.values));
assert.deepEqual(p23Products, [24, 13, 18, 13]);
const p23Register = [
  mod(p23Products[0] - p23Products[1]),
  mod(p23Products[0] + p23Products[1]),
  mod(p23Products[2] - p23Products[3]),
  mod(p23Products[2] + p23Products[3]),
];
assert.deepEqual(p23Register, [11, 8, 5, 2]);

// The directed p23 register completes the full DH state from Q's [p,A] pair.
const p = direction[0];
const A = direction[1];
const b = mod(p - A);
const K = mod(p + A);
const e = inverseMod(b, p - 1);
assert.deepEqual([p, A, b, K, e], [23, 8, 15, 2, 3]);
assert.equal(p23Register[1], A);
assert.equal(p23Register[3], K);
assert.equal(p23Register[0], inverseMod(A, MOD));
const g = p23Register[2];
const aHits = [];
for (let exponent = 1; exponent < p - 1; exponent += 1) {
  if (powMod(g, exponent, p) === A) aHits.push(exponent);
}
assert.deepEqual(aHits, [6]);
const a = aHits[0];
const B = powMod(g, b, p);
assert.equal(B, 19);
assert.equal(powMod(B, a, p), K);
const recoveredState = {p, g, a, b, A, B, K, e};
assert.deepEqual(recoveredState, {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3});

// Independently established p8 state register and adjacent black descriptor.
const p8Ann = ink.pages.find((item) => item.page === 8);
assert.deepEqual(p8Ann.red_spans.map((span) => [span.start, span.length]), [[0, 12]]);
const p8Words = wordsAt(8);
assert.deepEqual(p8Words.slice(0, 3).map((word) => word.values.length), [4, 8, 3]);
const q = p8Words[0].values.length;
const p8H4 = H(p8Words[0].values);
const p8H8 = H(p8Words[1].values);
assert.deepEqual(p8H4, [mod(-g), mod(-q), mod(-g), q]);
assert.deepEqual(p8H8, [
  mod(b - K),
  inverseMod(A, MOD),
  a,
  e,
  mod(g + K),
  e,
  mod(K + b),
  mod(p - g),
]);
const p8FirstBlackDescriptor = [
  p8Words[2].values.length,
  sum(p8Words[2].values),
  product(p8Words[2].values),
];
assert.deepEqual(p8FirstBlackDescriptor, [e, p, K]);

// Preregistered direct-Q continuation on the two already-fixed adjacent black words.
const requestTokens = new Set(['RAND', 'QUINE', 'BASE29', 'CODE', 'KOAN', 'DH', 'NEXT', 'GOODBYE']);
const stateChain = [[23, 5], [5, 8], [8, 19], [19, 2]];
const pA = [23, 8];
const successors = [
  {page: 23, word: p23Words.find((word) => word.start === 16)},
  {page: 8, word: p8Words.find((word) => word.start === 12)},
].map(({page, word}) => {
  assert(word);
  const E = evaluate(word.values);
  const output = mul(EQ, E);
  const text = translit(output);
  return {
    page,
    start: word.start,
    length: word.values.length,
    values: word.values,
    evaluation: E,
    output,
    transliteration: text,
    stateChainHit: stateChain.some((candidate) => candidate[0] === output[0] && candidate[1] === output[1]),
    pAHit: output[0] === pA[0] && output[1] === pA[1],
    requestHit: requestTokens.has(text),
  };
});
assert.deepEqual(successors, [
  {
    page: 23,
    start: 16,
    length: 8,
    values: [28, 6, 15, 25, 13, 7, 19, 28],
    evaluation: [13, 4],
    output: [3, 1],
    transliteration: 'OU',
    stateChainHit: false,
    pAHit: false,
    requestHit: false,
  },
  {
    page: 8,
    start: 12,
    length: 3,
    values: [27, 9, 16],
    evaluation: [10, 28],
    output: [7, 6],
    transliteration: 'WG',
    stateChainHit: false,
    pAHit: false,
    requestHit: false,
  },
]);

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'numbers-as-direction DH-state receiver cross-lock; preregistered direct successor consumer negative; no plaintext',
  Q,
  E_Q: EQ,
  p15: {direction, canonical: translit(direction)},
  recoveredStateFromQAndP23: recoveredState,
  receivers: {
    p23: {redProducts: p23Products, redProductH: p23Register},
    p8: {
      q,
      h4: p8H4,
      h8: p8H8,
      firstBlackDescriptor: p8FirstBlackDescriptor,
      verifiesRecoveredState: true,
    },
  },
  preregisteredSuccessorGate: successors,
}, null, 2));
