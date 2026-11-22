'use strict';

/**
 * SFT: original p36 has 238 GP29 runes, matching degree of the
 * previously factored original p49–51 Q238 polynomial over GF29.
 * Treat the complete unmodified p36 as LFSR initial output state,
 * read the stream from p37 immediately into physical pages 37–39.
 * Natural Q / reciprocal Q, both seed directions, +/- GP29 output.
 *
 * This is a finite original-cipher test, not an authenticated LP2 instruction.
 * node sims/lp2_p36_238seed_p50_q238_following_chapter_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const MOD = 29;
const mod = value => ((value % MOD) + MOD) % MOD;

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let i = 1; i < MOD; i++) if (mod(i * value) === 1) return i;
  throw new Error('zero or noninvertible denominator');
}

/** @param {number[]} p @returns {number[]} */
function trim(p) {
  while (p.length > 1 && p[p.length - 1] === 0) p.pop();
  return p;
}

/**
 * Exact GF29 polynomial division; input arrays ascending in exponent.
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divideExact(dividend, divisor) {
  const r = dividend.slice();
  const q = Array(Math.max(1, r.length - divisor.length + 1)).fill(0);
  const iv = inverse(divisor[divisor.length - 1]);
  for (let i = r.length - 1; i >= divisor.length - 1; i--) {
    const coefficient = mod(r[i] * iv);
    q[i - divisor.length + 1] = coefficient;
    for (let j = 0; j < divisor.length; j++) {
      const k = i - divisor.length + 1 + j;
      r[k] = mod(r[k] - coefficient * divisor[j]);
    }
  }
  assert.ok(trim(r).every(x => x === 0), 'original grid factor division exact');
  return trim(q);
}

/**
 * Generate n LFSR outputs after an nState-rune initial state.
 * @param {number[]} coefficients
 * @param {number[]} initial
 * @param {number} n
 * @returns {number[]}
 */
function stream(coefficients, initial, n) {
  assert.equal(initial.length, 238);
  assert.equal(coefficients.length, 239);
  assert.equal(coefficients[238], 1);
  const state = initial.slice();
  const out = [];
  for (let step = 0; step < n; step++) {
    let sum = 0;
    for (let j = 0; j < 238; j++) sum += coefficients[j] * state[j];
    const next = mod(-sum);
    out.push(next);
    state.shift();
    state.push(next);
  }
  return out;
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const frequencies = Array(MOD).fill(0);
  indices.forEach(i => frequencies[i]++);
  const n = indices.length;
  return frequencies.reduce((s, count) => s + count * (count - 1), 0) / (n * (n - 1));
}

const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

let Q = trim(bytes.slice().reverse().map(x => mod(28 * x)));
for (const f of [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]]) {
  Q = divideExact(Q, f);
}
assert.equal(Q.length, 239);
assert.equal(Q[238], 1);
assert.equal(crypto.createHash('sha256').update(Buffer.from(Q.slice().reverse())).digest('hex'),
  '9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3');
const reciprocal = Q.slice().reverse().map(x => mod(x * inverse(Q[0])));
assert.equal(reciprocal[238], 1);

const page = number => corpus.pages.find(p => p.page === number).indices;
const seed = page(36);
const physical = [page(37), page(38), page(39)];
const original = physical.flat();
assert.equal(seed.length, 238);
assert.equal(original.length, 696);

// Exact all-secret stationary-symbol obstruction to a separate direct
// 239-to-239 factor/printed-symbol correspondence: original p36 has a
// literal Arabic numeral 1 after rune99 (one-based printed ordinal 100).
// Q238 has 239 coefficients including a monic leading 1. Any injective
// stationary relabeling and/or arbitrary position permutation must preserve
// the sorted 29-symbol occurrence multiplicities, independently of position.
const p36Printed = [...seed.slice(0, 99), 1, ...seed.slice(99)];
const qPrinted = Q.slice().reverse();
const spectrum = xs => {
  const h = Array(29).fill(0);
  for (const value of xs) h[value]++;
  return h.sort((a, b) => b - a);
};
assert.equal(qPrinted.length, 239);
assert.equal(p36Printed.length, 239);
assert.equal(p36Printed[99], 1);
assert.equal(qPrinted[0], 1);
const p36Spectrum = spectrum(p36Printed);
const qSpectrum = spectrum(qPrinted);
assert.deepEqual(p36Spectrum.slice(0, 6), [14,14,14,13,13,12]);
assert.deepEqual(qSpectrum.slice(0, 6), [15,12,11,11,11,10]);
assert.notDeepEqual(qSpectrum, p36Spectrum);
const anchoredQ = Array.from({ length: 239 }, (_, i) => qPrinted[(i - 99 + 239) % 239]);
const anchoredMatches = anchoredQ.filter((q, i) => q === p36Printed[i]).length;
assert.equal(anchoredMatches, 2);

// A 238-degree LFSR characteristic polynomial also defines a one-equation
// parity check on exactly 239 consecutive output symbols. The distinct p36
// printed numeral 1 makes a source-frozen withheld-symbol prediction. In
// both literal coefficient orders, predict the numeral from all 238 runes.
const sourceCoefficientOrders = [Q, qPrinted];
const parityChecks = sourceCoefficientOrders.map(coefficients => {
  let sum = 0;
  for (let i = 0; i < 239; i++) sum += coefficients[i] * p36Printed[i];
  let excludingNumeral = sum - coefficients[99];
  const predictedNumeral = mod(-excludingNumeral * inverse(coefficients[99]));
  return { residue: mod(sum), predictedNumeral, numeralCoefficient: coefficients[99] };
});
assert.deepEqual(parityChecks, [
  { residue: 13, predictedNumeral: 18, numeralCoefficient: 18 },
  { residue: 28, predictedNumeral: 15, numeralCoefficient: 27 }
]);

// Positive codeword parity plant: replace numeral1 with the two exactly
// predicted field values. The resulting source-shaped 239 vector has zero
// syndrome under the selected coefficient order.
for (let j = 0; j < sourceCoefficientOrders.length; j++) {
  const valid = p36Printed.slice();
  valid[99] = parityChecks[j].predictedNumeral;
  let syndrome = 0;
  for (let i = 0; i < 239; i++) syndrome += sourceCoefficientOrders[j][i] * valid[i];
  assert.equal(mod(syndrome), 0);
}

// A solved independent GP29 native-plaintext positive control. The plant
// covers all 696 positions using only unchanged, already solved p57 runes.
const native = page(57);
assert.equal(native.length, 95);
const plant = Array.from({ length: original.length }, (_, i) => native[i % native.length]);
const results = [];
for (const [polynomial, f] of [['Q238', Q], ['reciprocal Q238', reciprocal]]) {
  for (const [direction, state] of [['forward', seed], ['reversed', seed.slice().reverse()]]) {
    const key = stream(f, state, original.length);
    const cipherPlant = plant.map((x, i) => mod(x + key[i]));
    assert.deepEqual(cipherPlant.map((x, i) => mod(x - key[i])), plant);
    for (const sign of [-1, 1]) {
      const output = original.map((x, i) => mod(x + sign * key[i]));
      const roundtrip = output.map((x, i) => mod(x - sign * key[i]));
      assert.deepEqual(roundtrip, original);
      let offset = 0;
      const pageIoC = physical.map(p => {
        const value = ioc(output.slice(offset, offset + p.length));
        offset += p.length;
        return value;
      });
      results.push({
        polynomial, seedDirection: direction, sign,
        wholeIoC: ioc(output), pageIoC,
        first40GP: output.slice(0, 40).map(i => corpus.translit[i]).join(''),
      });
    }
  }
}
results.sort((a, b) => b.wholeIoC - a.wholeIoC);
assert.equal(results.length, 8);
assert.ok(results[0].wholeIoC < 0.04, 'no high-concentration original candidate');

console.log(JSON.stringify({
  input: { seed: 'original p36, entire page', seedRunes: seed.length,
    target: 'original p37–p39, source order', targetRunes: original.length,
    rawIoC: ioc(original) },
  factor: { qDegree: Q.length - 1, originalGridSha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290' },
  direct239Gate: { printedP36Runes: 238, sourceArabicNumeralOneOffset: 99,
    monicQ238CoefficientSlots: 239, qTopMultiplicities: qSpectrum.slice(0, 6),
    p36TopMultiplicities: p36Spectrum.slice(0, 6),
    identicalMultiplicities: false, sourceMonicNumeralAnchoredMatches: anchoredMatches,
    whole239RuneLfsrParity: parityChecks },
  tested: results, originalRoundtrip: true,
  solvedNativePlant: { length: plant.length, recoveredExactly: true },
  verdict: 'No unknown GP29 native plaintext recovered under this exact 238-state LFSR use.'
}, null, 2));
