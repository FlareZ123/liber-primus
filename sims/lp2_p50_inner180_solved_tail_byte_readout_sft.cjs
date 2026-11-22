#!/usr/bin/env node
'use strict';

/**
 * Does the 32x8 original p50 table's 180-cell interior carry a byte
 * message encrypted using the 180 KNOWN plaintext runes of p56+p57?
 *
 * Independent of the earlier opposite-direction hypothesis that each
 * table byte is a key/value for encrypting the already-solved runes.
 *
 * Single runnable test (Windows Node22):
 * node sims/lp2_p50_inner180_solved_tail_byte_readout_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const readJSON = name => JSON.parse(fs.readFileSync(
  path.join(ROOT, name), 'utf8'));
const gp = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');

/** @param {number} n @returns {number} */
const mod29 = n => (n % 29 + 29) % 29;
/**
 * @param {number} count
 * @returns {number[]}
 */
function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) result.push(n);
  }
  return result;
}

/** @returns {number[]} Exactly source-verified 85+95 solved GP29 plaintext. */
function knownTail() {
  const page56 = gp.pages[56].indices;
  const page57 = gp.pages[57].indices;
  assert.equal(page56.length, 85);
  assert.equal(page57.length, 95);
  assert.equal(page56[56], 0, 'the original F at index56 is transparent');
  const primes = firstPrimes(84);
  let j = 0;
  const p56 = page56.map((v, i) => i === 56 ? v : mod29(
    v - (primes[j++] - 1)));
  assert.equal(j, 84);
  const sentence = p56.map(v => gp.translit[v]).join('');
  assert.equal(sentence, 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGE' +
    'THATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
  return p56.concat(page57);
}

/** @returns {{name:string, cells:number[]}[]} */
function innerDirections() {
  const points = [];
  for (let row = 1; row < 31; row++) {
    for (let col = 1; col < 7; col++) {
      points.push({row, col});
    }
  }
  assert.equal(points.length, 180);
  const row = points.map(p => p.row * 8 + p.col);
  const col = points.slice().sort(
    (a, b) => a.col - b.col || a.row - b.row)
    .map(p => p.row * 8 + p.col);
  return [
    {name: 'printed-rows', cells: row},
    {name: 'reverse-rows', cells: row.slice().reverse()},
    {name: 'printed-columns', cells: col},
    {name: 'reverse-columns', cells: col.slice().reverse()}
  ];
}

/**
 * Interpret one source rune as a source-native scalar.
 * @param {number} rune
 * @param {'index'|'one-based'|'prime'} register
 * @returns {number}
 */
function keyValue(rune, register) {
  if (register === 'index') return rune;
  if (register === 'one-based') return rune + 1;
  return gp.prime[rune];
}

/**
 * Use the attested 2014 XOR byte operation, or the three directions
 * of single-byte arithmetic; no fitted offsets or postprocessing.
 * @param {number} value table byte
 * @param {number} key known source-rune scalar
 * @param {'xor'|'plus'|'minus'|'reverse-minus'} op
 * @returns {number}
 */
function read(value, key, op) {
  if (op === 'xor') return value ^ key;
  if (op === 'plus') return (value + key) & 255;
  if (op === 'minus') return (value - key + 256) & 255;
  return (key - value + 256) & 255;
}

/**
 * @param {number[]} bytes
 * @returns {{printable:number, longest:number, head:string}}
 */
function metrics(bytes) {
  let printable = 0;
  let current = 0;
  let longest = 0;
  for (const v of bytes) {
    if (v >= 32 && v <= 126) {
      printable++;
      current++;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return {printable, longest, head: bytes.slice(0, 65)
    .map(v => v >= 32 && v <= 126 ? String.fromCharCode(v) : '.')
    .join('')};
}

function main() {
  assert.equal(grid.bytes.length, 256);
  assert.equal(grid.bytes[0], 203);
  assert.equal(grid.bytes[255] >= 0, true);
  const known = knownTail();
  assert.equal(known.length, 180);

  const original = [];
  for (const {name, cells} of innerDirections()) {
    for (const register of ['index', 'one-based', 'prime']) {
      for (const op of ['xor', 'plus', 'minus', 'reverse-minus']) {
        const bytes = cells.map(
          (idx, i) => read(grid.bytes[idx], keyValue(known[i], register), op));
        original.push({direction: name, register, op, ...metrics(bytes)});
      }
    }
  }
  original.sort((a, b) => b.printable - a.printable || b.longest - a.longest);
  assert.equal(original.length, 48);
  assert.equal(original[0].printable, 75);
  assert.equal(original[0].longest, 6);
  assert.equal(original[0].direction, 'reverse-rows');
  assert.equal(original[0].register, 'index');
  assert.equal(original[0].op, 'plus');
  assert(original.every(v => v.printable < 120));
  assert(original.every(v => v.longest < 15));

  // Frozen ASCII plaintext plant under the exact real P56+P57 key register,
  // preserving the 180 positions, proving that the consumer is capable of
  // recovering a real structured signal under the proposed byte cipher.
  const phrase = 'THE WORDS ARE THE MAP. THEIR MEANING IS THE ROAD. ' +
    'THEIR NUMBERS ARE THE DIRECTION. ';
  const expected = Array.from(
    phrase.repeat(Math.ceil(180 / phrase.length)).slice(0, 180),
    ch => ch.charCodeAt(0));
  const syntheticInterior = expected.map((v, i) => v ^ keyValue(known[i], 'prime'));
  const restored = syntheticInterior.map(
    (v, i) => read(v, keyValue(known[i], 'prime'), 'xor'));
  assert.deepEqual(restored, expected);
  assert.equal(metrics(restored).printable, 180);
  assert.equal(metrics(restored).longest, 180);
  console.log(JSON.stringify({
    claim: 'Finite inverse negative on original p50 interior',
    sourceGeometry: 'original 32x8 / shed one outer ring = 30x6',
    authenticKnownPlaintext: 'p56 prime-totient F-skip + clear p57',
    registers: ['index', 'one-based', 'prime'],
    operations: ['xor', 'plus', 'minus', 'reverse-minus'],
    directions: 4,
    completeOriginalCandidates: original.length,
    originalBest: original.slice(0, 8),
    bestPrintable: original[0].printable,
    longestPrintable: Math.max(...original.map(v => v.longest)),
    syntheticPositive: {
      bytes: expected.length,
      nativeRuneKey: true,
      exactlyRecovered: true,
      printable: metrics(restored).printable
    },
    interpretation: 'The direct byte-message reading of the physical ' +
      'interior is nonprintable in all finite source-selected modes. ' +
      'This does not exclude compressed data, a different cipher ' +
      'consumer, changing key state, or different page alignment.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {knownTail, innerDirections, read, metrics};
