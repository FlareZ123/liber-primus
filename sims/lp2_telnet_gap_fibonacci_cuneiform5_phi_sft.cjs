'use strict';

/**
 * Original-source five-passage test:
 * 2013 telnet PRIMES omission, p15 Fibonacci-prime spiral, five p36–38
 * numbered passages, and historically solved p56 phi-prime/F cipher.
 *
 * Run: node sims/lp2_telnet_gap_fibonacci_cuneiform5_phi_sft.cjs
 * No dependencies, randomness, writes, fitted key phases or cipher searches.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages.slice(0, 56).reduce((n, p) => n + p.indices.length, 0), 12956);

/** @param {number} count @returns {number[]} */
function primesThroughRank(count) {
  const values = [];
  for (let x = 2; values.length < count; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) values.push(x);
  }
  return values;
}

const primes = primesThroughRank(1200);
const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const grid = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
assert.deepEqual(fib.map(f => Math.abs(3301 - primes[f])), grid);
const selected = fib.map(f => ({ ordinal: f + 1, prime: primes[f] }))
  .filter(p => p.prime >= 73 && p.prime <= 1223);
assert.deepEqual(selected.map(p => p.prime), [79,149,263,463,829]);
assert.deepEqual(selected.map(p => p.ordinal), [22,35,56,90,145]);
assert.equal(primes[19], 71);
assert.equal(primes[200], 1229);

// Printed, red-numbered cuneiform intervals; fourth unit crosses a real page.
const fragments = [
  corpus.pages[36].indices.slice(99, 238),
  corpus.pages[37].indices.slice(0, 91),
  corpus.pages[37].indices.slice(91, 189),
  corpus.pages[37].indices.slice(189, 228).concat(corpus.pages[38].indices.slice(0, 57)),
  corpus.pages[38].indices.slice(57, 186)
];
assert.deepEqual(fragments.map(a => a.length), [139,91,98,96,129]);

/**
 * Exact all-branch inverse of the genuine solved-page convention.
 * Encryption: a plaintext F emits F and does not advance the prime index;
 * every non-F plaintext consumes phi(prime) and is added with sign.
 * @param {number[]} cipher
 * @param {number} zeroBasedPrimeStart
 * @param {1|-1} sign
 * @returns {{ firstImpossible: number|null, endClockCount: number }}
 */
function inverseFeasibility(cipher, zeroBasedPrimeStart, sign) {
  let clocks = new Set([0]);
  for (let position = 0; position < cipher.length; position++) {
    const c = cipher[position];
    const next = new Set();
    for (const clock of clocks) {
      if (c === 0) next.add(clock);
      const p = ((c - sign * (primes[zeroBasedPrimeStart + clock] - 1)) % 29 + 29) % 29;
      if (p !== 0) next.add(clock + 1);
    }
    clocks = next;
    if (!clocks.size) return { firstImpossible: position, endClockCount: 0 };
  }
  return { firstImpossible: null, endClockCount: clocks.size };
}

/** @param {number[]} plain @param {number} start @param {1|-1} sign @returns {number[]} */
function encode(plain, start, sign) {
  let clock = 0;
  return plain.map(p => p === 0 ? 0 : ((p + sign * (primes[start + clock++] - 1)) % 29 + 29) % 29);
}

/** @param {string} text @returns {number[]} */
function gpFromText(text) {
  const tokens = corpus.translit.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) {
    for (let pos = 0; pos < word.length;) {
      const hit = tokens.find(t => word.startsWith(t.token, pos));
      assert.ok(hit, 'GP transliteration failed at ' + word.slice(pos));
      out.push(hit.i);
      pos += hit.token.length;
    }
  }
  return out;
}

// Real original-cipher positive, not a synthetic ciphertext.
const known = gpFromText('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(known.length, 85);
assert.deepEqual(encode(known, 0, 1), corpus.pages[56].indices);
assert.equal(inverseFeasibility(corpus.pages[56].indices, 0, 1).firstImpossible, null);

// Independently planted native GP, each actual five-passage length/sign/start.
for (let i = 0; i < fragments.length; i++) {
  const plain = Array.from({ length: fragments[i].length }, (_, j) => corpus.pages[57].indices[j % 95]);
  for (const sign of /** @type {const} */ ([1,-1])) {
    const encrypted = encode(plain, selected[i].ordinal - 1, sign);
    assert.equal(inverseFeasibility(encrypted, selected[i].ordinal - 1, sign).firstImpossible, null);
  }
}

const outcomes = /** @type {Array<Array<{sign:number,firstImpossible:number|null,endClockCount:number}>>} */ ([]);
for (let i = 0; i < fragments.length; i++) {
  outcomes.push([1,-1].map(sign => ({
    sign,
    ...inverseFeasibility(fragments[i], selected[i].ordinal - 1, /** @type {1|-1} */ (sign))
  })));
}
assert.deepEqual(outcomes.map(row => row[0].firstImpossible), [0,26,8,39,4]);
assert.deepEqual(outcomes.map(row => row[1].firstImpossible), [20,2,null,2,60]);
assert.equal(outcomes[2][1].endClockCount, 3);
assert.equal(outcomes.flat().filter(x => x.firstImpossible === null).length, 1);

console.log(JSON.stringify({
  status: 'PASS — 9/10 exact original passages impossible, one nonlinguistic partial exception',
  selected,
  fragmentLengths: fragments.map(a => a.length),
  outcomes,
  p56AuthenticPositive: true,
  tenPlantedNativePositives: true
}, null, 2));
