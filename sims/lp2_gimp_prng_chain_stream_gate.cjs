'use strict';

// Gate the direct 1-D interpretations of the GIMP Dissolve PRNG as the
// non-zero 28-symbol first-difference stream of unsolved LP2. This is not a
// test of arbitrary pixel-to-rune sampling: no such coordinate rule is
// supplied by the source, so it is deliberately excluded here.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const runeOrder = corpus.runes;
const sequence = corpus.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);

assert.equal(sequence.length, 12956, 'LP2 unsolved rune count');
const steps = [];
for (let i = 1; i < sequence.length; i++) {
  steps.push((sequence[i] - sequence[i - 1] + 29) % 29);
}
const nonzeroSteps = steps.filter((step) => step !== 0);
const stepCounts = Array(29).fill(0);
for (const step of steps) stepCounts[step]++;
assert.equal(steps.length, 12955);
assert.equal(stepCounts[0], 86);
assert.equal(nonzeroSteps.length, 12869);

// GLib 2.38.2 GRand random-version 20 (the GLib-era default): MT19937
// with the historical 69069 seed expansion and version-20 range scaling.
const N = 624;
const M = 397;
const MATRIX_A = 0x9908b0df;
const UPPER_MASK = 0x80000000;
const LOWER_MASK = 0x7fffffff;
const DOUBLE_UNIT = 2.3283064365386962890625e-10
  + 2.3283064365386962890625e-10 * 2.3283064365386962890625e-10;

class GRand {
  constructor(seed) {
    this.mt = new Uint32Array(N);
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < N; i++) {
      this.mt[i] = Math.imul(69069, this.mt[i - 1]) >>> 0;
    }
    this.mti = N;
  }

  int() {
    if (this.mti >= N) {
      let y;
      let k = 0;
      for (; k < N - M; k++) {
        y = ((this.mt[k] & UPPER_MASK) | (this.mt[k + 1] & LOWER_MASK)) >>> 0;
        this.mt[k] = (
          this.mt[k + M] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)
        ) >>> 0;
      }
      for (; k < N - 1; k++) {
        y = ((this.mt[k] & UPPER_MASK) | (this.mt[k + 1] & LOWER_MASK)) >>> 0;
        this.mt[k] = (
          this.mt[k + (M - N)] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)
        ) >>> 0;
      }
      y = ((this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK)) >>> 0;
      this.mt[N - 1] = (
        this.mt[M - 1] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)
      ) >>> 0;
      this.mti = 0;
    }

    let y = this.mt[this.mti++] >>> 0;
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  intRange(begin, end) {
    const unit = this.int() * DOUBLE_UNIT;
    return begin + Math.floor(unit * (end - begin));
  }
}

function score(candidate, observed) {
  let exact = 0;
  let inverse = 0;
  for (let i = 0; i < observed.length; i++) {
    if (candidate[i] === observed[i]) exact++;
    if (candidate[i] === 29 - observed[i]) inverse++;
  }
  return {
    exact: exact,
    inverse: inverse,
    total: observed.length,
    randomExpectedExact: observed.length / 28,
  };
}

const seed = 314159265;
const master = new GRand(seed);
const randomTable = Array.from({ length: 4096 }, () => master.int());

// Candidate A: direct 28-way stream from the documented GIMP seed.
const direct = new GRand(seed);
const directStream = Array.from(
  { length: nonzeroSteps.length }, () => direct.intRange(1, 29)
);

// Candidate B: first row's documented GIMP row seed, read left-to-right.
const firstRow = new GRand(randomTable[0]);
const firstRowStream = Array.from(
  { length: nonzeroSteps.length }, () => firstRow.intRange(1, 29)
);

// Candidate C: the 4096 row-seed table itself, scaled to 28 values and
// repeated. This tests the tempting but distinct interpretation of the
// dissolve row-seed table as a repeating 1-D keystream.
const tableStream = Array.from({ length: nonzeroSteps.length }, (_, i) => {
  return 1 + Math.floor(randomTable[i % randomTable.length] * DOUBLE_UNIT * 28);
});

console.log(JSON.stringify({
  model: 'C[i]-C[i-1] mod 29; skip zero steps; compare source-seeded 28-way stream',
  input: {
    corpusRuneOrderMatches: runeOrder.length === 29,
    unsolvedRunes: sequence.length,
    adjacentSteps: steps.length,
    zeroSteps: stepCounts[0],
    nonzeroSteps: nonzeroSteps.length,
    nonzeroStepCounts: stepCounts.slice(1),
  },
  prng: {
    implementation: 'GLib 2.38.2 GRand random-version 20 / MT19937',
    seed: seed,
    randomTableSize: randomTable.length,
    firstRowSeed: randomTable[0],
    firstFiveRowSeeds: randomTable.slice(0, 5),
  },
  directSeedStream: score(directStream, nonzeroSteps),
  firstDissolveRowStream: score(firstRowStream, nonzeroSteps),
  repeatedRowSeedTable: score(tableStream, nonzeroSteps),
}, null, 2));
