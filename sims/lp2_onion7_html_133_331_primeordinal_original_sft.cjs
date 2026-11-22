'use strict';

/**
 * Seventh-onion HTML 133/331 candidate as a prime-ordinal p55 key.
 * Run with Node.js 22 from any working directory. No network or packages.
 * This is a bounded ORIGINAL-cipher negative, not evidence of a historical key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const cipher = corpus.pages[55].indices;
const solved = corpus.pages[57].indices.slice(0, 76);
assert.equal(cipher.length, 76);
assert.equal(solved.length, 76);
assert.deepEqual(cipher.flatMap((v, i) => v === 0 ? [i] : []), [15, 25, 41]);

const primes = [];
for (let p = 2; primes.length < 420; p++) {
  if (primes.every(q => q * q > p || p % q !== 0)) primes.push(p);
}
assert.equal(primes[132], 751);
assert.equal(primes[330], 2221);

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/**
 * @param {number[]} input
 * @param {number} start One-based ordinal of first candidate prime.
 * @param {number} sign +1 or -1 in the inverse.
 * @returns {{ states: Array<{plain:number[],keyIndex:number,skip:number[]}>,death:number|null }}
 */
function decode(input, start, sign) {
  let states = [{ plain: [], keyIndex: 0, skip: [] }];
  for (let i = 0; i < input.length; i++) {
    const next = [];
    for (const s of states) {
      const key = mod(primes[start - 1 + s.keyIndex] - 1);
      const letter = mod(input[i] + sign * key);
      if (letter !== 0) next.push({ plain: [...s.plain, letter], keyIndex: s.keyIndex + 1, skip: s.skip });
      if (input[i] === 0) next.push({ plain: [...s.plain, 0], keyIndex: s.keyIndex, skip: [...s.skip, i] });
    }
    if (next.length === 0) return { states: [], death: i };
    states = next;
  }
  return { states, death: null };
}

/**
 * Authentic plaintext-F bypass transport: F is emitted unmodified,
 * and does not advance the prime clock.
 * @param {number[]} plain
 * @param {number} start
 * @param {number} sign
 * @returns {number[]}
 */
function encode(plain, start, sign) {
  let offset = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const encoded = mod(p - sign * mod(primes[start - 1 + offset] - 1));
    offset++;
    return encoded;
  });
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const bins = Array(29).fill(0);
  symbols.forEach(x => bins[x]++);
  return bins.reduce((acc, n) => acc + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

console.log('source: original LP2 physical p55, 76 runes; F ciphertext offsets 15/25/41');
console.log('source: seventh-onion HTML title 133, div id 331; 7x7 Stage07 magic-square center 331');
console.log('reference solved p57 first76 IoC', ioc(solved).toFixed(12));
console.log('original p55 IoC', ioc(cipher).toFixed(12));

for (const start of [133, 331]) for (const sign of [-1, +1]) {
  // Native source control: exact 76-rune solved p57 text encrypted with same
  // candidate prime schedule and with the correct F bypass.
  const plant = encode(solved, start, sign);
  const decodedPlant = decode(plant, start, sign);
  assert(decodedPlant.states.some(s => s.plain.every((v, i) => v === solved[i])), 'native positive control failed');
  const output = decode(cipher, start, sign);
  console.log(JSON.stringify({
    start, sign, death: output.death, survivors: output.states.length,
    candidates: output.states.map(s => ({
      skip: s.skip, consumed: s.keyIndex, ioc: ioc(s.plain),
      plaintext: s.plain.map(v => corpus.translit[v]).join('')
    }))
  }));
  for (const s of output.states) {
    assert.deepEqual(encode(s.plain, start, sign), cipher, 'original forward recipher failed');
  }
}

console.log('BOUNDARY: no candidate is independently readable original plaintext; ordinals have no authored key-selection rule.');
