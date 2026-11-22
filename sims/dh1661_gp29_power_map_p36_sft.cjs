'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x) => ((x % 29) + 29) % 29;

function power29(x, exponent) {
  let result = 1;
  let base = mod(x);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = mod(result * base);
    base = mod(base * base);
    e >>= 1;
  }
  return result;
}

const dhExponent = 1661;
const exponent = dhExponent % 28;
let inverseExponent = 0;
for (let i = 1; i < 28; i++) {
  if ((i * exponent) % 28 === 1) inverseExponent = i;
}
assert.equal(exponent, 9);
assert.equal(inverseExponent, 25);
assert.equal((exponent * inverseExponent) % 28, 1);

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p36.length, 238);

const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const prose = readText('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
  .join(' ')
  .replace(/[0-9a-f]{64,}/gi, ' ')
  .toUpperCase();
const reference = [];
for (const word of prose.match(/[A-Z]+/g) || []) {
  let i = 0;
  while (i < word.length) {
    const token = tokens.find((t) => word.startsWith(t.s, i));
    if (token) {
      reference.push(token.i);
      i += token.s.length;
    } else {
      i++;
    }
  }
}

const train = reference.slice(0, Math.floor(reference.length * 0.8));
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}

function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(k) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2),
  };
}

const nativeWindows = [];
for (let i = 0; i + p36.length <= reference.length; i++) {
  nativeWindows.push(score(reference.slice(i, i + p36.length)).trigramNatsPerRune);
}
nativeWindows.sort((a, b) => a - b);

const trials = [
  { exponent, direction: 'x^9 (DH exponent reduced modulo 28)', output: p36.map((x) => power29(x, exponent)) },
  { exponent: inverseExponent, direction: 'x^25 (inverse exponent modulo 28)', output: p36.map((x) => power29(x, inverseExponent)) },
].map((trial) => ({ exponent: trial.exponent, direction: trial.direction, ...score(trial.output), prefix: trial.output.slice(0, 40) }));

// Exact bijection control: x^9 and x^25 are inverse permutations of GF(29).
const plant = reference.slice(0, p36.length);
const plantedCipher = plant.map((x) => power29(x, exponent));
const recovered = plantedCipher.map((x) => power29(x, inverseExponent));
assert.deepEqual(recovered, plant);
assert(trials.every((t) => t.trigramNatsPerRune < nativeWindows[0]));

console.log(JSON.stringify({
  source: {
    selectedDhExponent: dhExponent,
    exponentMod28: exponent,
    inverseExponentMod28: inverseExponent,
    p36Runes: p36.length,
    referenceRunes: reference.length,
  },
  rawP36: score(p36),
  native238Windows: {
    count: nativeWindows.length,
    minimum: nativeWindows[0],
    median: nativeWindows[Math.floor(nativeWindows.length / 2)],
    maximum: nativeWindows.at(-1),
  },
  positiveControl: { runes: recovered.length, exact: recovered.every((x, i) => x === plant[i]) },
  trials,
  decision: 'Both source-derived GF29 symbol-power directions are ciphertext-like on p36; the planted bijection control passes.'
}, null, 2));
