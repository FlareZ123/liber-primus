'use strict';

/**
 * Bounded reversal test for the p23/p39-derived p50 quotient.
 * The 2016 signed Cicada message contains the literal instruction
 * "The first thing is the end. The last thing is the beginning."
 * This tests the simplest sequence-level application: reverse Q once,
 * then hash its raw GP29-byte and canonical-transliteration serializations
 * against the p56 target. No phase, padding, or hash-family fitting.
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
const factorAscending = [12, 16, 7, 24, 5];
const factorDescending = factorAscending.slice().reverse();

function inverseMod(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('No inverse modulo 29');
}
function divideByFactor(descendingCoefficients) {
  const work = descendingCoefficients.map(mod), quotient = [];
  const inv = inverseMod(factorDescending[0]);
  for (let i = 0; i <= work.length - factorDescending.length; i++) {
    const c = mod(work[i] * inv);
    quotient.push(c);
    for (let j = 0; j < factorDescending.length; j++) work[i + j] = mod(work[i + j] - c * factorDescending[j]);
  }
  return {quotient, remainder: work.slice(-4)};
}
function ioc(values) {
  const f = Array(29).fill(0);
  values.forEach(x => f[x]++);
  return f.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function hash(bytes) {
  const algorithms = ['sha512', 'sha3-512', 'blake2b512'];
  return algorithms.map(algorithm => {
    const hex = crypto.createHash(algorithm).update(bytes).digest('hex');
    return {algorithm, hex, match: hex === target};
  });
}

if (grid.bytes.length !== 256 || corpus.translit.length !== 29) throw new Error('Input shape mismatch');
const {quotient, remainder} = divideByFactor(grid.bytes);
if (quotient.length !== 252 || remainder.some(x => x !== 0)) throw new Error('Expected exact 252-symbol quotient');
const reversed = quotient.slice().reverse();
const raw = Buffer.from(reversed);
const transliteration = Buffer.from(reversed.map(x => corpus.translit[x]).join(''), 'utf8');
const results = [
  {serialization: 'raw-GP29-bytes', length: raw.length, sha256: crypto.createHash('sha256').update(raw).digest('hex'), hashes: hash(raw)},
  {serialization: 'canonical-transliteration', length: transliteration.length, sha256: crypto.createHash('sha256').update(transliteration).digest('hex'), hashes: hash(transliteration)}
];
const summary = {
  schema: 1,
  selector: '2016 signed Cicada message: "The first thing is the end. The last thing is the beginning."',
  input: 'p50 polynomial coefficients divided by p23/p39 factor product over GF(29)',
  factor_ascending: factorAscending,
  remainder,
  quotient_length: quotient.length,
  forward_quotient_ioc: ioc(quotient),
  reversed_quotient_ioc: ioc(reversed),
  target_hash: target,
  target_hash_family: 'not source-authenticated',
  results,
  matches: results.flatMap(r => r.hashes.filter(h => h.match).map(h => ({serialization:r.serialization,algorithm:h.algorithm})))
};
console.log('LP2-P23P39-Q-REVERSE-HASH-GATE', JSON.stringify(summary));
