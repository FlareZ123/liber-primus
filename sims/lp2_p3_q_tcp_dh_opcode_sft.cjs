'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const TCP_REQUESTS = Object.freeze(['RAND', 'QUINE', 'BASE29', 'CODE', 'KOAN', 'DH', 'NEXT', 'GOODBYE']);
const DH_EXAMPLE = Object.freeze({p: 23, g: 5, A: 8, B: 19, K: 2});
const P15_GRID_PREFIX = Object.freeze({
  primes: [2, 3, 5, 7, 13, 23],
  cells: [3299, 3298, 3296, 3294, 3288, 3278],
});

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let candidate = 1; candidate < MOD; candidate += 1) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error(`no inverse for ${value}`);
}

/** @param {[number, number]} x @param {[number, number]} y @param {number} r @param {number} t @returns {[number, number]} */
function fieldMultiply(x, y, r = 3, t = 8) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + t * b * d), mod(a * d + b * c + r * b * d)];
}

/** @param {number[]} coefficients @param {number} r @param {number} t @returns {[number, number]} */
function fieldEvaluate(coefficients, r = 3, t = 8) {
  /** @type {[number, number]} */
  let accumulator = [0, 0];
  /** @type {[number, number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    accumulator = [
      mod(accumulator[0] + coefficient * power[0]),
      mod(accumulator[1] + coefficient * power[1]),
    ];
    power = fieldMultiply(power, [0, 1], r, t);
  }
  return accumulator;
}

/** @param {number[]} numerator @param {number[]} denominator @returns {{quotient:number[], remainder:number[]}} */
function polynomialDivide(numerator, denominator) {
  const work = numerator.map(mod);
  const quotient = Array(Math.max(0, work.length - denominator.length + 1)).fill(0);
  const leadingInverse = inverse(denominator.at(-1));
  for (let i = work.length - 1; i >= denominator.length - 1; i -= 1) {
    const q = mod(work[i] * leadingInverse);
    const offset = i - denominator.length + 1;
    quotient[offset] = q;
    for (let j = 0; j < denominator.length; j += 1) {
      work[offset + j] = mod(work[offset + j] - q * denominator[j]);
    }
  }
  return {quotient, remainder: work.slice(0, denominator.length - 1)};
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert(pageRecord, `missing page ${page}`);
  const span = (pageRecord.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span, `missing red span p${page} start${start} len${length}`);
  return [...span.runes].map((rune) => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined, `unknown rune ${rune}`);
    return index;
  });
}

/** @param {[number, number]} pair @returns {string} */
function transliteratePair(pair) {
  return pair.map((value) => corpus.translit[value]).join('');
}

/** @param {number} n @returns {string} */
function base29(n) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  if (n === 0) return '0';
  let value = n;
  let output = '';
  while (value > 0) {
    output = alphabet[value % 29] + output;
    value = Math.floor(value / 29);
  }
  return output;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return result;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function modularInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/**
 * Source-motivated state closure after the canonical DH readout:
 * H([p,A])=[p-A,p+A]=[b,K], require A^b mod p = K, and require
 * the independently published p29 DIRECTION inverse e=b^-1 mod(p-1).
 * @param {[number, number]} pair
 * @returns {{p:number,A:number,b:number,K:number,e:number}|null}
 */
function dhStateClosure(pair) {
  const [p, A] = pair;
  if (!isPrime(p) || A <= 0 || A >= p) return null;
  const b = mod(p - A);
  const K = mod(p + A);
  if (b <= 0 || b >= p - 1 || K <= 0 || K >= p) return null;
  if (powMod(A, b, p) !== K) return null;
  if (gcd(b, p - 1) !== 1) return null;
  const e = modularInverse(b, p - 1);
  assert.notEqual(e, null);
  return {p, A, b, K, e};
}

const p3Triad = redSpan(3, 119, 3);
assert.deepEqual(p3Triad, [13, 23, 2]);
const p15Second = redSpan(15, 9, 11);
const p57 = redSpan(57, 0, 7);
const paddedP57 = p57.concat(Array(p15Second.length - p57.length).fill(0));
const difference = p15Second.map((value, index) => mod(value - paddedP57[index]));
const division = polynomialDivide(difference, p3Triad);
assert.deepEqual(division.remainder, [0, 0]);
assert.deepEqual(division.quotient, [5, 5, 14, 9, 10, 4, 27, 17, 25]);

const Q = division.quotient;
const evaluatedQ = fieldEvaluate(Q);
assert.deepEqual(evaluatedQ, [17, 24]);
const p15First = redSpan(15, 0, 9);
const p15Product = fieldMultiply(evaluatedQ, fieldEvaluate(p15First));
assert.deepEqual(p15Product, [23, 8]);
assert.equal(transliteratePair(p15Product), 'DH');
assert.deepEqual(p15Product, [DH_EXAMPLE.p, DH_EXAMPLE.A]);

const p15Closure = dhStateClosure(p15Product);
assert.deepEqual(p15Closure, {p: 23, A: 8, b: 15, K: 2, e: 3});
const pairSpaceClosures = [];
for (let p = 0; p < MOD; p += 1) {
  for (let A = 0; A < MOD; A += 1) {
    const closure = dhStateClosure([p, A]);
    if (closure) pairSpaceClosures.push(closure);
  }
}
assert.deepEqual(pairSpaceClosures, [
  {p: 23, A: 8, b: 15, K: 2, e: 3},
]);

assert(P15_GRID_PREFIX.cells.every((value, index) => value + P15_GRID_PREFIX.primes[index] === 3301));
assert.equal(base29(3301), '3QO');

const serverSecretHits = [];
const clientSecretHits = [];
for (let exponent = 1; exponent < DH_EXAMPLE.p; exponent += 1) {
  if (powMod(DH_EXAMPLE.g, exponent, DH_EXAMPLE.p) === DH_EXAMPLE.A) serverSecretHits.push(exponent);
  if (powMod(DH_EXAMPLE.g, exponent, DH_EXAMPLE.p) === DH_EXAMPLE.B) clientSecretHits.push(exponent);
}
assert.deepEqual(serverSecretHits, [6]);
assert.deepEqual(clientSecretHits, [15]);
assert.equal(powMod(DH_EXAMPLE.B, serverSecretHits[0], DH_EXAMPLE.p), DH_EXAMPLE.K);

const printedRequestHits = [];
const presentationRequestHits = [];
const printedDhClosureHits = [];
const presentationDhClosureHits = [];
let presentations = 0;
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    assert(source.every((value) => value !== undefined));
    const printedPair = fieldMultiply(evaluatedQ, fieldEvaluate(source));
    const printedText = transliteratePair(printedPair);
    if (TCP_REQUESTS.includes(printedText)) {
      printedRequestHits.push({page: pageRecord.page, start: span.start, length: span.length, pair: printedPair, text: printedText});
    }
    const printedClosure = dhStateClosure(printedPair);
    if (printedClosure) {
      printedDhClosureHits.push({page: pageRecord.page, start: span.start, length: span.length, pair: printedPair, closure: printedClosure});
    }
    for (const reversed of [false, true]) {
      const oriented = reversed ? source.slice().reverse() : source;
      for (let rotation = 0; rotation < oriented.length; rotation += 1) {
        presentations += 1;
        const candidate = oriented.slice(rotation).concat(oriented.slice(0, rotation));
        const pair = fieldMultiply(evaluatedQ, fieldEvaluate(candidate));
        const text = transliteratePair(pair);
        if (TCP_REQUESTS.includes(text)) {
          presentationRequestHits.push({page: pageRecord.page, start: span.start, length: span.length, reversed, rotation, pair, text});
        }
        const closure = dhStateClosure(pair);
        if (closure) {
          presentationDhClosureHits.push({page: pageRecord.page, start: span.start, length: span.length, reversed, rotation, pair, closure});
        }
      }
    }
  }
}
assert.deepEqual(printedRequestHits, [
  {page: 15, start: 0, length: 9, pair: [23, 8], text: 'DH'},
]);
assert.equal(presentations, 450);
assert.deepEqual(presentationRequestHits, [
  {page: 15, start: 0, length: 9, reversed: false, rotation: 0, pair: [23, 8], text: 'DH'},
  {page: 15, start: 9, length: 11, reversed: true, rotation: 5, pair: [23, 8], text: 'DH'},
]);
assert.deepEqual(printedDhClosureHits, [
  {page: 15, start: 0, length: 9, pair: [23, 8], closure: {p: 23, A: 8, b: 15, K: 2, e: 3}},
]);
assert.deepEqual(presentationDhClosureHits, [
  {page: 15, start: 0, length: 9, reversed: false, rotation: 0, pair: [23, 8], closure: {p: 23, A: 8, b: 15, K: 2, e: 3}},
  {page: 15, start: 9, length: 11, reversed: true, rotation: 5, pair: [23, 8], closure: {p: 23, A: 8, b: 15, K: 2, e: 3}},
]);

const factorSurvivors = [];
for (let r = 0; r < MOD; r += 1) {
  for (let t = 0; t < MOD; t += 1) {
    const factor = [mod(-2 * t), mod(-2 * r), 2];
    const candidate = polynomialDivide(difference, factor);
    if (!candidate.remainder.every((value) => value === 0)) continue;
    const candidateQ = fieldEvaluate(candidate.quotient, r, t);
    const candidateP15 = fieldEvaluate(p15First, r, t);
    const product = fieldMultiply(candidateQ, candidateP15, r, t);
    factorSurvivors.push({r, t, product, text: transliteratePair(product)});
  }
}
assert.deepEqual(factorSurvivors, [
  {r: 3, t: 8, product: [23, 8], text: 'DH'},
  {r: 18, t: 12, product: [0, 21], text: 'FNG'},
]);

const result = {
  schema: 'lp2-p3-q-tcp-dh-opcode-v1',
  classification: 'post-discovery exact operator/source cross-lock; no body plaintext',
  p3Relation: {r: 3, t: 8},
  Q,
  evaluatedQ,
  p15First: {evaluation: fieldEvaluate(p15First), product: p15Product, canonicalTransliteration: transliteratePair(p15Product)},
  dhStateClosure: {p15: p15Closure, completePairSpace: pairSpaceClosures},
  signed2013: {
    requests: TCP_REQUESTS,
    base29Example: {input: 3301, output: base29(3301)},
    dhExample: DH_EXAMPLE,
    derivedPrivateExponents: {server: serverSecretHits[0], client: clientSecretHits[0]},
  },
  finiteControls: {
    printedRequestHits,
    presentationCount: presentations,
    presentationRequestHits,
    printedDhClosureHits,
    presentationDhClosureHits,
    factorSurvivors,
  },
};

const json = `${JSON.stringify(result, null, 2)}\n`;
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
