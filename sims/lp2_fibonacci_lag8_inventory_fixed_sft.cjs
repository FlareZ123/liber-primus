'use strict';

/**
 * Exact-original LP2 Fibonacci-page lag-8 conditional inventory test.
 *
 * Reads the canonical 29-rune source corpus. Holds every selected physical
 * page's zero-step locations and complete nonzero difference inventory fixed.
 * Shuffles only the nonzero step labels, then tests lag 8 against lag 16.
 *
 * Execute from the repository root: node sims/lp2_fibonacci_lag8_inventory_fixed_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const SELECTED = Object.freeze([0, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
const DRAWS = 30000;
const SEED = 0x4bad5eed;

/** @param {number[]} symbols */
function differences(symbols) {
  const result = [];
  for (let i = 1; i < symbols.length; i += 1) {
    result.push((symbols[i] - symbols[i - 1] + 29) % 29);
  }
  return result;
}

/** @param {number[]} values @param {number} lag */
function collisions(values, lag) {
  let equal = 0;
  let eligible = 0;
  for (let i = lag; i < values.length; i += 1) {
    if (values[i] === 0 || values[i - lag] === 0) continue;
    eligible += 1;
    if (values[i] === values[i - lag]) equal += 1;
  }
  return { equal, eligible };
}

/** @param {number[]} values @param {number} lag */
function permutationExpectation(values, lag) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x] += 1;
  const nonzero = values.length - counts[0];
  const numerator = counts.slice(1).reduce((a, n) => a + n * (n - 1), 0);
  const eligible = collisions(values, lag).eligible;
  return eligible * numerator / (nonzero * (nonzero - 1));
}

/** @param {number} initialSeed */
function xorshift(initialSeed) {
  let state = initialSeed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} nonzeroPositions @param {number[]} values @param {()=>number} rng */
function permuteNonzero(nonzeroPositions, values, rng) {
  const result = values.slice();
  for (let j = nonzeroPositions.length - 1; j > 0; j -= 1) {
    const k = rng() % (j + 1);
    const i1 = nonzeroPositions[j];
    const i2 = nonzeroPositions[k];
    const tmp = result[i1];
    result[i1] = result[i2];
    result[i2] = tmp;
  }
  return result;
}

/** @returns {object} An exact, original-input model verdict. */
function run() {
  assert.equal(DATA.pages.length, 58);
  assert.equal(DATA.pages.slice(0, 56).reduce(
    (n, p) => n + p.indices.length, 0), 12956);

  const pages = SELECTED.map(page => {
    const p = DATA.pages[page];
    assert.equal(p.page, page);
    const diffs = differences(p.indices);
    return {
      page,
      differences: diffs,
      nonzeroPositions: diffs.map((x, i) => x ? i : -1).filter(i => i >= 0),
      lag8: collisions(diffs, 8),
      lag16: collisions(diffs, 16)
    };
  });
  const other = DATA.pages.filter(p => p.page < 56
    && p.indices.length && !SELECTED.includes(p.page));

  const sum = (items, key) => items.reduce((a, v) => a + v[key], 0);
  const observed8 = sum(pages.map(p => p.lag8), 'equal');
  const eligible8 = sum(pages.map(p => p.lag8), 'eligible');
  const observed16 = sum(pages.map(p => p.lag16), 'equal');
  const eligible16 = sum(pages.map(p => p.lag16), 'eligible');
  const other8 = other.map(p => collisions(differences(p.indices), 8));
  const analytic8 = pages.reduce((s, p) =>
    s + permutationExpectation(p.differences, 8), 0);
  const analytic16 = pages.reduce((s, p) =>
    s + permutationExpectation(p.differences, 16), 0);

  assert.deepEqual([observed8, eligible8, observed16, eligible16],
    [45, 2226, 80, 2147]);
  assert.deepEqual([sum(other8, 'equal'), sum(other8, 'eligible')],
    [372, 10068]);

  const rng = xorshift(SEED);
  let sum8 = 0;
  let sum16 = 0;
  let squares8 = 0;
  let squares16 = 0;
  let lower8 = 0;
  let lower16 = 0;
  for (let trial = 0; trial < DRAWS; trial += 1) {
    let current8 = 0;
    let current16 = 0;
    for (const p of pages) {
      const randomized = permuteNonzero(
        p.nonzeroPositions, p.differences, rng);
      current8 += collisions(randomized, 8).equal;
      current16 += collisions(randomized, 16).equal;
    }
    sum8 += current8;
    sum16 += current16;
    squares8 += current8 * current8;
    squares16 += current16 * current16;
    if (current8 <= observed8) lower8 += 1;
    if (current16 <= observed16) lower16 += 1;
  }
  assert.equal(lower8, 0);
  assert.equal(lower16, 16675);
  assert.equal(sum8, 2465643);
  assert.equal(sum16, 2383488);

  const mean8 = sum8 / DRAWS;
  const mean16 = sum16 / DRAWS;
  assert.ok(Math.abs(mean8 - analytic8) < 0.2);
  assert.ok(Math.abs(mean16 - analytic16) < 0.2);
  const response = {
    selectedPages: SELECTED,
    preserved: 'each page exact nonzero GP29 difference multiset and all zero positions',
    draws: DRAWS,
    seed: '0x4bad5eed',
    original: {
      lag8: { equal: observed8, eligible: eligible8 },
      lag16: { equal: observed16, eligible: eligible16 },
      otherPagesLag8: {
        equal: sum(other8, 'equal'),
        eligible: sum(other8, 'eligible')
      }
    },
    null: {
      lag8: {
        analyticMean: analytic8,
        monteCarloMean: mean8,
        monteCarloSd: Math.sqrt(squares8 / DRAWS - mean8 * mean8),
        trialsAtOrBelowOriginal: lower8,
        addOneLowerTail: (lower8 + 1) / (DRAWS + 1)
      },
      lag16: {
        analyticMean: analytic16,
        monteCarloMean: mean16,
        monteCarloSd: Math.sqrt(squares16 / DRAWS - mean16 * mean16),
        trialsAtOrBelowOriginal: lower16,
        addOneLowerTail: (lower16 + 1) / (DRAWS + 1)
      }
    },
    decision: 'Source-selected lag8 retains a sequential repulsion conditional on exact page inventories; lag16 does not. No original LP2 plaintext or key is recovered.'
  };
  console.log(JSON.stringify(response, null, 2));
  return response;
}

if (require.main === module) run();
module.exports = {
  differences, collisions, permutationExpectation, xorshift,
  permuteNonzero, run
};
