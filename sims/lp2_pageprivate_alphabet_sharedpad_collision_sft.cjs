'use strict';

/**
 * Permutation-invariant, page-reset keystream-reuse test on original LP2.
 *
 * For arbitrary private alphabet permutations pi_page, the family
 * C[page,i] = pi_page((P[page,i] + K[i]) mod 29)
 * preserves within-page equality C[page,i] == C[page,j].
 * If one pad K resets at the first rune of many pages, independent
 * nonuniform GP-native P leaves correlated equality *patterns* across pages,
 * even when visible rune identities cannot be compared page to page.
 *
 * Exact per-page zero-registration, W=200, 46 physical pages only.
 * This does not test unknown page-specific pad phases or unrelated pads.
 *
 * SFT: node sims/lp2_pageprivate_alphabet_sharedpad_collision_sft.cjs
 * Node 22, CommonJS, no writes, original canonical source and native p57 plant.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const W = 200;
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= W);
const rows = pages.map(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;

assert.equal(pages.length, 46);
assert.equal(p57.length, 95);
assert.equal(new Set(pages.map(p => p.page)).size, 46);

/**
 * @param {number} seed
 * @returns {() => number}
 */
function seeded(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Count agreement between TWO pages' within-page equalities.
 * The pair of positions (i,j) is a common page-local clock address.
 * This statistic is exactly invariant under arbitrary independent
 * substitution permutations of each of the 46 page alphabets.
 *
 * @param {number[][]} tape
 * @param {number[]} shifts
 * @returns {number}
 */
function coCollisions(tape, shifts) {
  let score = 0;
  for (let i = 0; i < W; i++) {
    for (let j = i + 1; j < W; j++) {
      let equalPages = 0;
      for (let k = 0; k < tape.length; k++) {
        const p = tape[k];
        const start = shifts[k];
        equalPages += +(p[(i + start) % p.length] ===
          p[(j + start) % p.length]);
      }
      score += equalPages * (equalPages - 1) / 2;
    }
  }
  return score;
}

/**
 * Test source-fixed page beginnings against a circular-rotation null.
 * Rotations preserve each original page's rune inventory, word-independent
 * collision structure, and local no-repeat pattern, but destroy common
 * page-local pad phase. Each null redoes the identical pair-of-pairs score.
 *
 * @param {number[][]} tape
 * @param {number} draws
 * @param {number} seed
 */
function screen(tape, draws, seed) {
  const rand = seeded(seed);
  const observed = coCollisions(tape, tape.map(() => 0));
  const nulls = Array.from({ length: draws }, () =>
    coCollisions(tape, tape.map(p => rand() % p.length)));
  const mean = nulls.reduce((s, n) => s + n, 0) / nulls.length;
  const sd = Math.sqrt(nulls.reduce((s, n) =>
    s + (n - mean) ** 2, 0) / nulls.length);
  return {
    observed, nullMean: mean, nullSD: sd,
    z: (observed - mean) / sd,
    nullMax: Math.max(...nulls),
    exceedances: nulls.filter(x => x >= observed).length,
    draws,
    plusOneTail: (1 + nulls.filter(x => x >= observed).length) / (draws + 1)
  };
}

/**
 * Build a known-plaintext positive that inherits the true p57 GP29
 * unigram distribution. Each page uses a SECRET different substitution
 * permutation, a COMMON secret pad K[0..199], and independent plaintext
 * samples. Repair 80% of ciphertext adjacent doublets, to approximate
 * the original unusual no-repeat rate, while preserving legal GP symbols.
 *
 * This is a source-native synthetically planted cipher, not an assertion
 * that Cicada used this model or that its plaintext is i.i.d.
 *
 * @param {number} seed
 */
function plant(seed) {
  const rand = seeded(seed);
  const pad = Array.from({ length: W }, () => rand() % 29);
  let repairs = 0, doublets = 0, pairs = 0;
  const tape = rows.map(original => {
    const alphabet = Array.from({ length: 29 }, (_, i) => i);
    for (let k = 28; k > 0; k--) {
      const j = rand() % (k + 1);
      [alphabet[k], alphabet[j]] = [alphabet[j], alphabet[k]];
    }
    const result = original.map((_, i) =>
      alphabet[(p57[rand() % p57.length] + pad[i % W]) % 29]);
    for (let i = 1; i < result.length; i++) {
      if (result[i] === result[i - 1] && rand() % 100 < 80) {
        result[i] = (result[i] + 1 + rand() % 28) % 29;
        repairs++;
      }
      doublets += +(result[i] === result[i - 1]);
      pairs++;
    }
    return result;
  });
  assert.equal(tape.length, 46);
  const replay = tape.map(p => [...p]);
  assert.deepEqual(replay, tape);
  return { tape, repairs, doublets, pairs, doubletRate: doublets / pairs };
}

function main() {
  const original = screen(rows, 160, 0xc0de3301);
  const positive = plant(0x330176cc);
  const control = screen(positive.tape, 80, 0xf1b3301);
  const samePairs = W * (W - 1) / 2;
  const acrossPages = pages.length * (pages.length - 1) / 2;
  assert.equal(samePairs, 19900);
  assert.equal(acrossPages, 1035);
  assert.ok(original.z < 4, 'Unexpected original reuse signal');
  assert.ok(control.z > 5, 'Known-source private-alphabet reuse was not detected');
  assert.ok(positive.doubletRate < 0.02, 'Planted anti-doublet repair failed');
  console.log(JSON.stringify({
    source: 'original physical LP2 p0..55 canonical runes, minus short pages',
    includedPageNumbers: pages.map(p => p.page),
    pageReregister: 'zero-based first physical rune',
    originalPages: pages.length,
    firstRunesPerPage: W,
    pairOfRunePositions: samePairs,
    pairOfPages: acrossPages,
    permutationInvariantPairOfPairs: samePairs * acrossPages,
    original, planted: {
      sourceGP: 'authentic solved p57 rune unigram',
      pagePrivateAlphabet: true, pageSharedPad: true,
      repairs: positive.repairs,
      doublets: positive.doublets,
      doubletRate: positive.doubletRate,
      result: control
    },
    interpretation: 'No detectable all-page same-phase reused pad even allowing independently permuted page alphabets. This finite gate cannot rule out subset reuse, unknown pad phase, altered register or a distinct operation.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { seeded, coCollisions, screen, plant, main };
