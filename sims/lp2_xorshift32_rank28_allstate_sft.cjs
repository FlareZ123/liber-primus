'use strict';
/**
 * Full-secret-state source-original gate for xorshift32 rank-28 step output.
 *
 * A hypothetical direct nonzero GP29 successor step is the ordinal
 * 1 + (xorshift32_output >>> bitWindow) % 28, or the corresponding
 * primitive-root power 2 ** (output % 28) mod 29. Test both step signs.
 *
 * Every one of the 32 starting bits is unknown. Two low bits of each
 * observed rank-28 step are exact GF(2)-linear observations of that seed.
 * Pivot elimination tests full-state consistency, independent of brute-force
 * seed dictionaries or English-language scores.
 *
 * Important: the direct-generator hypothesis, not an additive plaintext
 * mask, is being tested. No original clue selects xorshift32.
 *
 * Windows 11 / Node.js 22, no third-party dependencies.
 * SFT: node sims/lp2_xorshift32_rank28_allstate_sft.cjs
 * @module lp2_xorshift32_rank28_allstate_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const GP = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const PAGES = GP.pages.filter(p => p.page < 56 && p.indices.length > 0);
const LOG = Array(29).fill(-1);
const EXP = Array(28);
for (let i = 0, value = 1; i < 28; i++, value = value * 2 % 29) {
  assert.equal(LOG[value], -1, '2 must be primitive modulo 29');
  LOG[value] = i;
  EXP[i] = value;
}
assert.equal(new Set(EXP).size, 28);

/** @param {number} x @returns {number} */
function next32(x) {
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x >>> 0;
}

/** @typedef {{which:'ordinal'|'exponent',sign:1|-1,window:number,consumeZero:boolean,head:boolean}} Model */

/**
 * @param {number[]} symbols
 * @param {Model} model
 * @returns {{consistent:boolean,rank:number,observed:number,firstError:number|null,seed:number|null}}
 */
function solve(symbols, model) {
  const basis = Array.from({length: 32}, (_, i) => (1 << i) >>> 0);
  const pivot = Array(32).fill(null);
  let rank = 0, observed = 0;
  function draw() {
    for (let j = 0; j < 32; j++) basis[j] = next32(basis[j]);
  }
  /** @param {number} mask @param {number} bit */
  function addEquation(mask, bit) {
    let x = mask >>> 0, rhs = bit;
    for (let i = 31; i >= 0; i--) {
      if (((x >>> i) & 1) === 0) continue;
      const old = pivot[i];
      if (old === null) {
        pivot[i] = [x, rhs];
        rank++;
        return true;
      }
      x = (x ^ old[0]) >>> 0;
      rhs ^= old[1];
    }
    return rhs === 0;
  }
  if (model.head) draw();
  for (let i = 1; i < symbols.length; i++) {
    const difference = ((symbols[i] - symbols[i - 1]) * model.sign + 29) % 29;
    if (difference === 0 && !model.consumeZero) continue;
    draw();
    if (difference === 0) continue;
    const rank28 = model.which === 'ordinal' ? difference - 1 : LOG[difference];
    assert(rank28 >= 0 && rank28 < 28);
    const target = rank28 & 3;
    for (let bit = 0; bit < 2; bit++) {
      let mask = 0;
      for (let j = 0; j < 32; j++) {
        if ((basis[j] >>> (model.window + bit)) & 1) {
          mask = (mask | (1 << j)) >>> 0;
        }
      }
      observed++;
      if (!addEquation(mask, (target >>> bit) & 1)) {
        return {consistent: false, rank, observed, firstError: i, seed: null};
      }
    }
  }
  let seed = 0;
  for (let bit = 0; bit < 32; bit++) {
    const row = pivot[bit];
    if (row === null) continue;
    let remaining = row[0] & seed;
    remaining ^= remaining >>> 16;
    remaining ^= remaining >>> 8;
    remaining ^= remaining >>> 4;
    remaining ^= remaining >>> 2;
    remaining ^= remaining >>> 1;
    const value = row[1] ^ (remaining & 1);
    seed = (seed | (value << bit)) >>> 0;
  }
  return {consistent: true, rank, observed, firstError: null, seed};
}

/**
 * Positive: generate authentic xorshift32-dependent GP29 successor steps,
 * retaining only the *positions* of original repeat markers as an unobserved
 * consume/no-consume mask; their actual symbols and words are not selected.
 * @param {{indices:number[]}} page @param {Model} model @param {number} seed
 * @returns {number[]}
 */
function plant(page, model, seed) {
  let state = seed;
  const ciphertext = page.indices.slice();
  if (model.head) state = next32(state);
  for (let i = 1; i < ciphertext.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) {
      ciphertext[i] = ciphertext[i - 1];
      if (model.consumeZero) state = next32(state);
      continue;
    }
    state = next32(state);
    const rank28 = (state >>> model.window) % 28;
    const difference = model.which === 'ordinal' ? rank28 + 1 : EXP[rank28];
    ciphertext[i] = (ciphertext[i - 1] + model.sign * difference + 29) % 29;
  }
  return ciphertext;
}

function main() {
  assert.equal(PAGES.length, 55);
  assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);
  const counts = [], original = [];
  let models = 0, surviving = 0, firstMin = Infinity, firstMax = -Infinity;
  for (const page of PAGES) {
    let localSurviving = 0, minimum = Infinity, maximum = -Infinity;
    for (const which of ['ordinal', 'exponent'])
    for (const sign of [1, -1])
    for (let window = 0; window <= 30; window++)
    for (const consumeZero of [false, true])
    for (const head of [false, true]) {
      /** @type {Model} */
      const model = {which, sign, window, consumeZero, head};
      const test = solve(page.indices, model);
      models++;
      if (test.consistent) {
        surviving++;
        localSurviving++;
        original.push({page: page.page, model, rank: test.rank, seed: test.seed});
      } else {
        firstMin = Math.min(firstMin, test.firstError);
        firstMax = Math.max(firstMax, test.firstError);
        minimum = Math.min(minimum, test.firstError);
        maximum = Math.max(maximum, test.firstError);
      }
    }
    counts.push({page: page.page, runes: page.indices.length,
      originalSurvivors: localSurviving, firstContradiction: [minimum, maximum]});
  }
  assert.equal(models, 27280);
  assert.equal(surviving, 0);
  assert.deepEqual([firstMin, firstMax], [15, 24]);

  const positiveModels = [
    {which: 'ordinal', sign: 1, window: 0, consumeZero: false, head: false},
    {which: 'exponent', sign: -1, window: 16, consumeZero: true, head: true},
    {which: 'ordinal', sign: -1, window: 30, consumeZero: true, head: false}
  ];
  let positiveExact = 0;
  for (const model of positiveModels) {
    for (const page of PAGES) {
      const sourceSeed = (0x3301c1ca ^ Math.imul(page.page + 1, 0x9e3779b9)) >>> 0;
      assert.notEqual(sourceSeed, 0);
      const sample = plant(page, model, sourceSeed);
      const result = solve(sample, model);
      assert.equal(result.consistent, true);
      assert.equal(result.rank, 32);
      assert.equal(result.seed, sourceSeed);
      positiveExact++;
    }
  }
  assert.equal(positiveExact, 165);
  const report = {
    source: 'resources/liber-primus/lp2-corpus.json',
    sourcePageCount: PAGES.length, originalRunes: 12956,
    family: 'xorshift32 13/17/5; direct ordinal or log2 GP29 nonzero successor step',
    keyFreedom: 'all possible 32-bit initial states independently per physical page',
    parameters: '31 bit windows, two signs, two codings, repeat draw/skip, page-head draw/skip',
    modelsPerPage: 496, originalModels: models, originalConsistentStates: surviving,
    firstOriginalContradictionOffsets: [firstMin, firstMax],
    perPage: counts, originalSurvivorDetails: original,
    positiveGeneratedPages: positiveExact, positiveExactStateRecovery: positiveExact,
    verdict: 'Direct-generator family excluded. This does not test a generator masked by unknown plaintext, nonlinear output, hidden extra draws, other generators or external keys.'
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}
if (require.main === module) main();
module.exports = {next32, solve, plant, main};
