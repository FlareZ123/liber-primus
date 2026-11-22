'use strict';

/**
 * Source-locked 11x11 original-cipher transfer gate.
 * Physical LP2 p32 has 121 runes, as does the newly separated p39:119..end unit.
 * Only D4 square orientations and direct GP29 addition/subtraction are tested.
 * The same fixed D4 geometry is used for an additive-shift equality control.
 *
 * Run: node sims/p32_p39_11square_transfer_sft.cjs
 * No dependencies beyond Node.js; reads resources/liber-primus/lp2-corpus.json.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

/** @param {number} page @returns {number[]} */
function indices(page) {
  const p = corpus.pages.find((record) => record.page === page);
  assert.ok(p && Array.isArray(p.indices), `Missing source indices for p${page}`);
  assert.equal(p.indices.length, p.runic_count);
  assert.ok(p.indices.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  return p.indices;
}

const p32 = indices(32);
const p39 = indices(39);
const suffix = p39.slice(119);
assert.equal(p32.length, 121);
assert.equal(p39.length, 240);
assert.equal(suffix.length, 121);

/** @param {number[]} a @param {number} op @returns {number[]} */
function d4(a, op) {
  return Array.from({ length: 121 }, (_, i) => {
    let x = i % 11;
    let y = Math.floor(i / 11);
    if (op & 1) x = 10 - x;
    if (op & 2) y = 10 - y;
    if (op & 4) [x, y] = [y, x];
    return a[11 * y + x];
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const n = values.length;
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1));
}

/** @param {number[]} original @param {number[]} key @param {-1|1} sign @returns {number[]} */
function combine(original, key, sign) {
  return original.map((value, i) => (value + sign * key[i] + 29) % 29);
}

const keys = Array.from({ length: 8 }, (_, op) => d4(p32, op));
const results = [];
for (let op = 0; op < 8; op++) {
  for (const sign of [-1, 1]) {
    const decoded = combine(suffix, keys[op], sign);
    results.push({ op, sign, ioc: ioc(decoded) });
    // Positive implementation check: synthetic original-length ciphertext inverts.
    const plant = combine(p32, keys[op], -sign);
    assert.deepEqual(combine(plant, keys[op], sign), p32);
  }
}
results.sort((a, b) => b.ioc - a.ioc);
assert.deepEqual([results[0].op, results[0].sign], [3, -1]);
assert.ok(Math.abs(results[0].ioc - 0.03856749311294766) < 1e-12);

/**
 * Return maximum direct equality after any of 8 D4 transforms plus all 29
 * uniform GP shifts. This statistic automatically corrects within-sample tuning.
 * @param {number[]} values
 * @returns {{hits:number, op:number, shift:number}}
 */
function bestAgreement(values) {
  let hits = 0;
  let bestOp = -1;
  let bestShift = -1;
  for (let op = 0; op < 8; op++) {
    const counts = Array(29).fill(0);
    for (let i = 0; i < 121; i++) {
      counts[(values[i] - keys[op][i] + 29) % 29]++;
    }
    for (let shift = 0; shift < 29; shift++) {
      if (counts[shift] > hits) {
        hits = counts[shift];
        bestOp = op;
        bestShift = shift;
      }
    }
  }
  return { hits, op: bestOp, shift: bestShift };
}
const agreement = bestAgreement(suffix);
assert.deepEqual(agreement, { hits: 13, op: 3, shift: 3 });
const planted = keys[3].map((v) => (v + 3) % 29);
assert.deepEqual(bestAgreement(planted), { hits: 121, op: 3, shift: 3 });

let state = 0x19732016;
/** @returns {number} deterministic unsigned PRNG word */
function randomWord() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

const trials = 20000;
let asExtreme = 0;
for (let t = 0; t < trials; t++) {
  const sample = suffix.slice();
  // Fisher-Yates, fixed-seed, preserves the *exact* source rune histogram.
  for (let i = 120; i > 0; i--) {
    const k = randomWord() % (i + 1);
    [sample[i], sample[k]] = [sample[k], sample[i]];
  }
  if (bestAgreement(sample).hits >= agreement.hits) asExtreme++;
}
assert.equal(asExtreme, 1327);

console.log(JSON.stringify({
  input: 'physical p32 all 121 original runes versus p39 local119..end 121 runes',
  original: { p32_ioc: ioc(p32), p39_suffix_ioc: ioc(suffix) },
  best_additive_inverse: results[0],
  best_direct_shift_agreement: agreement,
  d4_shift_shuffle: {
    trials, seed_hex: '0x19732016', as_extreme: asExtreme,
    empirical_p: asExtreme / trials, plus_one_p: (asExtreme + 1) / (trials + 1)
  },
  conclusion: 'No GP29 additive-key plaintext concentration; best direct-shift match not unusual after model-selection controls'
}, null, 2));
