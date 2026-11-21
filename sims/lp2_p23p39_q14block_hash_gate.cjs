'use strict';

/**
 * One bounded source-constrained test:
 *   p23/p39 red factors -> exact GF(29) quotient of the 256-cell p50 table
 *   -> the historically recovered Cicada 2014 14-symbol block permutation.
 *
 * Q has 252 symbols = 18 complete 14-symbol blocks. The p8 red word's
 * 14^2 sum is the only LP2-side selector for reusing the historical 14 order.
 * This tests whether the transposed quotient is the p56 512-bit preimage;
 * it does not assume Q is plaintext or license further key searches.
 *
 * Node.js 22+, deterministic and offline.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');

const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('resources/cicada2014-archive-hash-manifest.json', 'utf8'));
const target = manifest.targetHex.toLowerCase();
const mod = x => ((x % 29) + 29) % 29;
const factorAscending = [12, 16, 7, 24, 5]; // p23 centered red triple * p39 red triple
const factorDescending = factorAscending.slice().reverse();
const historicalOrder = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];

if (grid.bytes.length !== 256) throw new Error('Expected 256 p50 cells');
if (!/^[0-9a-f]{128}$/.test(target)) throw new Error('Invalid p56 target');
if (historicalOrder.length !== 14 || new Set(historicalOrder).size !== 14) {
  throw new Error('Historical 14-order is not a permutation');
}
if (corpus.translit.length !== 29) throw new Error('Expected 29-symbol transliteration map');

function inverseMod(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('No inverse modulo 29');
}

function divideByFactor(descendingCoefficients) {
  const work = descendingCoefficients.map(mod);
  const quotient = [];
  const inverseLead = inverseMod(factorDescending[0]);
  for (let i = 0; i <= work.length - factorDescending.length; i++) {
    const coefficient = mod(work[i] * inverseLead);
    quotient.push(coefficient);
    for (let j = 0; j < factorDescending.length; j++) {
      work[i + j] = mod(work[i + j] - coefficient * factorDescending[j]);
    }
  }
  return {quotient, remainder: work.slice(-4)};
}

function permuteBlocks(input, direction) {
  if (input.length % 14 !== 0) throw new Error('Expected complete 14-symbol blocks');
  const out = input.slice();
  for (let start = 0; start < input.length; start += 14) {
    if (direction === 'decode') {
      for (let i = 0; i < 14; i++) out[start + i] = input[start + historicalOrder[i]];
    } else if (direction === 'encode') {
      for (let i = 0; i < 14; i++) out[start + historicalOrder[i]] = input[start + i];
    } else throw new Error('Unknown direction');
  }
  return out;
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function hashSet(bytes) {
  const names = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool'];
  const available = new Set(crypto.getHashes().map(x => x.toLowerCase()));
  return names.filter(name => available.has(name)).map(algorithm => ({
    algorithm,
    hex: crypto.createHash(algorithm).update(bytes).digest('hex'),
    match: crypto.createHash(algorithm).update(bytes).digest('hex') === target
  }));
}

const {quotient, remainder} = divideByFactor(grid.bytes);
if (quotient.length !== 252) throw new Error('Expected 252-symbol quotient');
if (remainder.some(x => x !== 0)) throw new Error('p50 polynomial did not divide exactly');
if (quotient.length !== 18 * 14) throw new Error('252 != 18 * 14');

const serializations = values => ({
  gp29_bytes: Buffer.from(values),
  gp29_transliteration: Buffer.from(values.map(value => corpus.translit[value]).join(''), 'utf8')
});

const results = [];
for (const direction of ['decode', 'encode']) {
  const transformed = permuteBlocks(quotient, direction);
  const encoded = serializations(transformed);
  for (const [serialization, bytes] of Object.entries(encoded)) {
    const hashes = hashSet(bytes);
    results.push({
      direction, serialization, length: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      hashes
    });
  }
}

const summary = {
  schema: 1,
  input: 'p50 256-cell table',
  factor_ascending: factorAscending,
  factor_descending_for_division: factorDescending,
  remainder: remainder,
  quotient_length: quotient.length,
  quotient_ioc: ioc(quotient),
  historical_14_order: historicalOrder,
  blocks: quotient.length / 14,
  source_selector: 'p8 red word sum 196 = 14^2; historical 2014 14-symbol permutation',
  target_hash: target,
  target_hash_family: 'not source-authenticated',
  results,
  matches: results.flatMap(result => result.hashes.filter(hash => hash.match)
    .map(hash => ({direction: result.direction, serialization: result.serialization, algorithm: hash.algorithm})))
};
console.log('LP2-P23P39-Q14BLOCK-HASH-GATE', JSON.stringify(summary));
