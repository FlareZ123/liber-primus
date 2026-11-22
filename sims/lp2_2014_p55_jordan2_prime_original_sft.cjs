'use strict';

/**
 * The actual 2014 May 21 18:17 #cicadasolvers question "already tried J_2(n)
 * for page 55?" instantiated as Jordan totient J2(p)=p^2-1 of primes,
 * analogous to the independently solved p56 phi(p)=p-1 stream.
 *
 * Bounded original-cipher exact F-bypass gate, source-fixed 0/84/85 clocks,
 * page including or excluding incoming p54 carry, both operator signs.
 * No key sweep, no language-model tuning, no file writes.
 *
 * Node.js22: node sims/lp2_2014_p55_jordan2_prime_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const authent = require('./authentic_decryption_regression.cjs');
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const native = corpus.pages.find((page) => page.page === 57).indices;
const p56 = authent.run().find((part) => part.section === 'LP2 page 56');
assert.equal(p56.keySymbolsConsumed, 84);
assert.equal(p56.FInterrupters, 1);
assert.equal(p55.length, 76);
assert.ok(native.length >= 76);
const primes = [];
for (let candidate = 2; primes.length < 250; candidate++) {
  let prime = true;
  for (let d = 2; d*d <= candidate; d++) {
    if (candidate % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(candidate);
}
const mod = (n) => ((n % 29) + 29) % 29;
const jordan = (clock) => mod(primes[clock] * primes[clock] - 1);
const ioc = (a) => {
  const count = Array(29).fill(0);
  for (const value of a) count[value]++;
  return count.reduce((sum, value) => sum + value*(value-1), 0)
    / (a.length * (a.length-1));
};

/**
 * @param {number[]} text
 * @param {number} start
 * @param {1|-1} sign
 * @returns {{failureIndex:number|null, solutions:Array<{plain:number[],cursor:number,skips:string}>, maxStates:number}}
 */
function inverse(text, start, sign) {
  let solutions = [{ plain: [], cursor: start, skips: '' }];
  let maxStates = 1;
  for (let i = 0; i < text.length; i++) {
    const next = [];
    for (const state of solutions) {
      if (text[i] === 0) next.push({
        plain: [...state.plain, 0], cursor: state.cursor, skips: state.skips + 'F'
      });
      const plain = mod(text[i] + sign * jordan(state.cursor));
      if (plain !== 0) next.push({
        plain: [...state.plain, plain], cursor: state.cursor + 1,
        skips: state.skips + '.'
      });
    }
    if (next.length === 0) {
      return { failureIndex: i, solutions: [], maxStates };
    }
    solutions = next;
    maxStates = Math.max(maxStates, solutions.length);
  }
  return { failureIndex: null, solutions, maxStates };
}

/** @param {number[]} plain @param {number} start @param {1|-1} sign */
function encrypt(plain, start, sign) {
  let cursor = start;
  return plain.map((value) =>
    value === 0 ? 0 : mod(value - sign * jordan(cursor++)));
}

const results = [];
for (const firstPageOffset of [0,1]) {
  const text = p55.slice(firstPageOffset);
  for (const start of [0,84,85]) {
    for (const sign of [-1,1]) {
      const result = inverse(text, start, sign);
      const seed = native.slice(0, text.length);
      const planted = encrypt(seed, start, sign);
      const plantedBack = inverse(planted, start, sign);
      assert.equal(plantedBack.failureIndex, null);
      assert.ok(plantedBack.solutions.some((entry) =>
        entry.plain.length === seed.length
        && entry.plain.every((value, i) => value === seed[i])));
      if (result.failureIndex !== null) assert.equal(result.solutions.length, 0);
      else assert.ok(result.solutions.every((state) =>
        encrypt(state.plain, start, sign).every((value,i) => value === text[i])));
      results.push({
        reading: firstPageOffset === 0 ? 'all76' : 'complete-body75',
        primeStart: start, actualPrime: primes[start], inverseSign: sign,
        firstContradictionPhysicalPage55Index: result.failureIndex === null
          ? null : firstPageOffset + result.failureIndex,
        completeLegalOutputs: result.solutions.length,
        maxBranchStates: result.maxStates,
        accepted: result.solutions.map((state) => ({
          ioc: ioc(state.plain),
          translit: state.plain.map((value) => corpus.translit[value]).join(''),
          fBypasses: state.skips.split('').filter((ch) => ch === 'F').length
        })),
        positivePlant: 'PASS ' + seed.length + '/' + seed.length
      });
    }
  }
}
assert.equal(results.length, 12);
const legal = results.filter((record) => record.completeLegalOutputs > 0);
assert.equal(legal.length, 1);
assert.deepEqual(legal.map((record) =>
  [record.reading,record.primeStart,record.inverseSign,
    record.completeLegalOutputs]), [['complete-body75',84,1,1]]);
assert.ok(legal[0].accepted.every((value) => value.ioc < 0.037));
console.log(JSON.stringify({
  sourceWitness: '2014 May 21 18:17 <BlueFox> and I am guessing someone has already tried J_2(n) for page 55?',
  proposedOperation: 'J_2(p)=p^2-1 modulo29 on consecutive primes',
  inputs: { originalPage:55, p55Runes:p55.length,
    p56AuthenticConsumedPrimes:p56.keySymbolsConsumed,
    primeStarts:[0,84,85], pageCarryReadings:['76 entire','75 complete words'] },
  outcomes: results,
  caveat: '2014 participant question is not Cicada-signed; the question did not fix prime inputs, clock, sign, or p55 geometry. Only tested these 12 source-motivated direct cases. No unknown plaintext.'
}, null, 2));
