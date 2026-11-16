'use strict';

/**
 * Original red-span GP prime-sum relation, all-span family calibration.
 * Read-only standalone test: node sims/lp2_red_source_totient_relay_sft.cjs
 * No ciphertext decryption or creator-key claim is made by this program.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
/** @param {string} relative */
const load = (relative) => JSON.parse(fs.readFileSync(path.join(base, relative), 'utf8'));

const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');

/** @type {{name: string, indices: number[]}[]} */
const spans = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const indices = corpus.pages[page.page].indices.slice(span.start, span.start + span.length);
    const printedRunes = [...span.runes];
    assert.equal(indices.length, span.length);
    assert.equal(printedRunes.length, span.length);
    for (let i = 0; i < span.length; i++) {
      assert.equal(corpus.runes[indices[i]], printedRunes[i]);
    }
    spans.push({ name: 'p' + page.page + '@' + span.start, indices });
  }
}
assert.equal(spans.length, 18);
assert.equal(corpus.prime.length, 29);

/** @param {readonly number[]} weights */
function sums(weights) {
  return spans.map((span) => span.indices.reduce((total, index) => total + weights[index], 0));
}

/** @returns {Uint8Array} */
function makePrimeFlags() {
  const flags = new Uint8Array(6001).fill(1);
  flags[0] = flags[1] = 0;
  for (let p = 2; p * p < flags.length; p++) {
    if (flags[p]) {
      for (let n = p * p; n < flags.length; n += p) flags[n] = 0;
    }
  }
  return flags;
}
const isPrime = makePrimeFlags();

/**
 * Find all ordered quadruples A,B,C,D of distinct physically marked red spans
 * satisfying A=B+1 and C=B+D-1, with B and D prime.
 * @param {readonly number[]} values
 * @returns {number[][]}
 */
function findRelations(values) {
  /** @type {Map<number, number[]>} */
  const index = new Map();
  values.forEach((value, position) => {
    const positions = index.get(value) || [];
    positions.push(position);
    index.set(value, positions);
  });
  /** @type {number[][]} */
  const hits = [];
  for (let b = 0; b < values.length; b++) {
    if (!isPrime[values[b]]) continue;
    for (const a of index.get(values[b] + 1) || []) {
      if (a === b) continue;
      for (let d = 0; d < values.length; d++) {
        if (d === a || d === b || !isPrime[values[d]]) continue;
        for (const c of index.get(values[b] + values[d] - 1) || []) {
          if (c !== a && c !== b && c !== d) hits.push([a, b, c, d]);
        }
      }
    }
  }
  return hits;
}

const originalValues = sums(corpus.prime);
const names = ['p0@0', 'p6@71', 'p27@0', 'p57@0'];
const selection = names.map((name) => spans.findIndex((span) => span.name === name));
assert(selection.every((index) => index >= 0));
assert.deepEqual(selection.map((index) => originalValues[index]), [662, 661, 1109, 449]);
assert.deepEqual(findRelations(originalValues), [selection]);
assert.equal(originalValues[selection[1]] - 1, originalValues[selection[2]] - originalValues[selection[3]]);
assert.equal(originalValues[selection[0]], originalValues[selection[1]] + 1);

let seed = 0x5173301;
/** @returns {number} Unsigned 32-bit output of fixed xorshift32. */
function randomUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

const trials = 60000;
let anyHit = 0;
let totalHits = 0;
let maxHits = 0;
for (let trial = 0; trial < trials; trial++) {
  const shuffled = corpus.prime.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const count = findRelations(sums(shuffled)).length;
  if (count > 0) anyHit++;
  totalHits += count;
  if (count > maxHits) maxHits = count;
}
assert.deepEqual({ anyHit, totalHits, maxHits }, { anyHit: 63, totalHits: 71, maxHits: 2 });

console.log(JSON.stringify({
  status: 'PASS',
  source: names.map((name, i) => ({ name, gpPrimeSum: originalValues[selection[i]] })),
  exactRelationsAcrossAll18RedSpans: findRelations(originalValues).length,
  null: {
    method: '29 GP prime weights randomly permuted globally, full 18-span family rescan',
    seed: '0x5173301',
    trials,
    anyHit,
    totalHits,
    maxHits,
    anyHitRate: anyHit / trials
  },
  interpretation: 'exact, postselected arithmetic relation; no authenticated plaintext or cipher operator'
}, null, 2));
