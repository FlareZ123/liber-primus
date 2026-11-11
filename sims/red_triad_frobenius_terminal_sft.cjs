'use strict';
/**
 * Original LP2 terminal GF(29^2) Frobenius register: key-independent
 * collision obstruction, preserving original p53-red/p55 ciphertext.
 * Run: node sims/red_triad_frobenius_terminal_sft.cjs
 * Hypothesis only; no decryption or historical cipher claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} raw */
function divideByXMinus24(raw) {
  const q = [mod(raw[0])];
  for (let i = 1; i < raw.length - 1; i++) {
    q.push(mod(raw[i] + 24 * q[q.length - 1]));
  }
  return { q, remainder: mod(raw[raw.length - 1] + 24 * q[q.length - 1]) };
}
/** @param {[number,number]} s */
function frobenius(s) {
  // In F29[u] / (u^2-3u-8), u^29 = 3-u; F^2 is identity.
  return [mod(s[0] + 3 * s[1]), mod(-s[1])];
}
/** @param {[number,number]} a @param {[number,number]} b */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
          mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}
/** @param {[number,number]} a @param {number} exponent */
function pow(a, exponent) {
  let y = [1, 0];
  for (let i = 0; i < exponent; i++) y = mul(y, a);
  return y;
}
assert.deepEqual(pow([0, 1], 29), [3, 28]);
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  assert.deepEqual(frobenius(frobenius([a, b])), [a, b]);
}
const grid = load('resources/liber-primus/base60-grid.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const d1 = divideByXMinus24(bytes.map(mod));
const d2 = divideByXMinus24(d1.q);
assert.deepEqual([d1.remainder, d2.remainder, d2.q.length], [0, 0, 254]);
const red = corpus.pages.find(p => p.page === 53).indices.slice(128);
const black = corpus.pages.find(p => p.page === 55).indices;
const target = red.concat(black);
assert.deepEqual([red.length, black.length, target.length], [51, 76, 127]);

/** @param {'adjacent'|'halves'} layout */
function pairInputs(layout) {
  return Array.from({ length: 127 }, (_, i) => layout === 'adjacent'
    ? [d2.q[2 * i], d2.q[2 * i + 1]]
    : [d2.q[i], d2.q[i + 127]]);
}
/** @param {[number,number][]} inputs @param {[number,number]} seed */
function trajectory(inputs, seed) {
  let state = seed.slice();
  const states = [];
  for (const q of inputs) {
    states.push(state);
    const f = frobenius(state);
    state = [mod(f[0] + q[0]), mod(f[1] + q[1])];
  }
  return states;
}
/** @param {[number,number][]} states @param {number[]} output @param {boolean} separated */
function contradictions(states, output, separated) {
  const seen = new Map();
  let mismatches = 0;
  for (let i = 0; i < states.length; i++) {
    const key = (separated ? (i < 51 ? 'R:' : 'B:') : '') + states[i].join(',');
    if (seen.has(key)) {
      if (seen.get(key) !== output[i]) mismatches++;
    } else {
      seen.set(key, output[i]);
    }
  }
  return mismatches;
}
/** @param {[number,number][]} states */
function unconditionalWitnesses(states) {
  const first = new Map();
  const witnesses = [];
  for (let i = 0; i < states.length; i++) {
    const key = (i < 51 ? 'R:' : 'B:') + (i % 2) + ':' + states[i].join(',');
    if (first.has(key)) {
      const j = first.get(key);
      if (target[j] !== target[i]) {
        witnesses.push({ first: j, second: i, firstRune: target[j],
          secondRune: target[i], sameZeroSeedState: states[i] });
      }
    } else {
      first.set(key, i);
    }
  }
  return witnesses;
}
const cases = [];
for (const layout of ['adjacent', 'halves']) {
  const inputs = pairInputs(layout);
  const zeroStates = trajectory(inputs, [0, 0]);
  const witness = unconditionalWitnesses(zeroStates);
  // Same parity => same F^i(seed), so zero-seed equality holds for all seeds.
  const pairs = witness.map(x => [x.first, x.second]);
  assert.deepEqual(pairs, layout === 'adjacent'
    ? [[57, 107]]
    : [[62, 70], [74, 78], [71, 105]]);
  assert(witness.every(x => x.first >= 51 && x.second >= 51 &&
    (x.second - x.first) % 2 === 0));
  let singleSurvivors = 0, separateInkSurvivors = 0;
  let minSingle = Infinity, minTwoInk = Infinity;
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const states = trajectory(inputs, [a, b]);
    const single = contradictions(states, target, false);
    const twoInk = contradictions(states, target, true);
    if (single === 0) singleSurvivors++;
    if (twoInk === 0) separateInkSurvivors++;
    minSingle = Math.min(minSingle, single);
    minTwoInk = Math.min(minTwoInk, twoInk);
  }
  assert.deepEqual([singleSurvivors, separateInkSurvivors], [0, 0]);
  assert.deepEqual([minSingle, minTwoInk],
    layout === 'adjacent' ? [6, 1] : [6, 3]);
  const plantedStates = trajectory(inputs, [11, 7]);
  const secretLookup = ([a, b]) => mod(a * a + 7 * a * b + 13 * b * b + 5);
  const plant = plantedStates.map(secretLookup);
  const twoInkPlant = plant.map((v, i) => mod(v + (i < 51 ? 0 : 11)));
  assert.equal(contradictions(plantedStates, plant, false), 0);
  assert.equal(contradictions(plantedStates, twoInkPlant, true), 0);
  cases.push({ layout, testedSeeds: 841, singleSurvivors,
    separateInkSurvivors, minSingle, minTwoInk, witness,
    positiveControl: 'both stationary one-ink and two-ink secret lookups pass' });
}
console.log(JSON.stringify({
  status: 'exact obstruction for specified Frobenius recurrence; not a decryption',
  originalCiphertextCount: target.length,
  sourceQuotientLength: d2.q.length,
  field: 'F29[u]/(u^2-3u-8)',
  update: 'S[i+1] = S[i]^29 + Q[i]',
  clock: 'source-order 127 pairs; separate p53 red and p55 black outputs permitted',
  cases
}, null, 2));
