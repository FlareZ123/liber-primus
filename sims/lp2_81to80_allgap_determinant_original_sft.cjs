'use strict';

/**
 * Original-LP2 81x81 -> 80x80 determinant stencil (source-constrained gate).
 *
 * The real complete 12,956 GP29-rune unknown tape has a repeated
 * DJU BEI marker at the exact end of the first 6,561 = 81^2 cells
 * and again at its absolute end. The second part has 6,395 = 80^2-5
 * glyphs. The candidate here is the classic 2x2 matrix determinant:
 *
 *   D(r,c) = A(r,c) * A(r+1,c+1)
 *          - A(r,c+1) * A(r+1,c) (mod 29).
 *
 * We grant BOTH genuine numeric rune registers (index and prime mod29),
 * EIGHT dihedral orientations of the 80x80 predicted output, ANY
 * contiguous placement of exactly five unprinted cells, and ANY
 * secret deterministic 29->29 output lookup (not necessarily bijective).
 * Thus the score is a rigorous upper bound for this whole cipher family;
 * no key or plaintext is optimized on the source other than the
 * mathematically necessary maximum-symbol contingency tables.
 *
 * The source-only SFT reads resources but writes nothing.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const mod = (x) => ((x % 29) + 29) % 29;
const rows = 80;
const first = 81 * 81;
const full = corpus.pages.filter((page) => page.page < 56).flatMap((page) => page.indices);
assert.equal(full.length, 12956);
const a = full.slice(0, first);
const b = full.slice(first);
assert.equal(a.length, 6561);
assert.equal(b.length, 6395);
assert.deepEqual(a.slice(-6), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(b.slice(-6), a.slice(-6));

/** @param {number[]} input @returns {number[]} */
function determinant(input) {
  const d = new Array(6400);
  for (let r = 0; r < 80; r += 1) {
    for (let c = 0; c < 80; c += 1) {
      const i = 81 * r + c;
      d[80 * r + c] = mod(input[i] * input[i + 82] -
        input[i + 1] * input[i + 81]);
    }
  }
  return d;
}

/** @param {number[]} data @param {number} t @returns {number[]} */
function orient(data, t) {
  const out = new Array(6400);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < rows; c += 1) {
      let y; let x;
      switch (t) {
        case 0: [y, x] = [r, c]; break;
        case 1: [y, x] = [c, 79 - r]; break;
        case 2: [y, x] = [79 - r, 79 - c]; break;
        case 3: [y, x] = [79 - c, r]; break;
        case 4: [y, x] = [79 - r, c]; break;
        case 5: [y, x] = [r, 79 - c]; break;
        case 6: [y, x] = [c, r]; break;
        case 7: [y, x] = [79 - c, 79 - r]; break;
        default: throw new RangeError('D4 orientation 0..7 required');
      }
      out[80 * r + c] = data[80 * y + x];
    }
  }
  assert.equal(out.length, 6400);
  return out;
}

/**
 * Search ALL ways of deleting five adjacent predicted 80x80 symbols.
 * The fixed observed 6395 outputs are matched by an unrestricted 29->29
 * substitution after deletion. For each deleted position, choose each
 * input symbol's output value with maximum observed contingency count.
 * The alphabet symbols need not map to different outputs, which grants
 * a *stronger* matching model than any bijective rune substitution.
 *
 * Recompute only the two histogram rows changed by moving the gap.
 *
 * @param {number[]} prediction 6400 expected intermediate symbols
 * @param {number[]} observed 6395 original output symbols
 * @returns {{match:number,gap:number}}
 */
function bestGapAndLookup(prediction, observed) {
  assert.equal(prediction.length, 6400);
  assert.equal(observed.length, 6395);
  const hist = Array.from({ length: 29 }, () => new Int16Array(29));
  const maxima = new Int16Array(29);
  // Initial candidate deletes prediction[0..4].
  for (let j = 0; j < observed.length; j += 1) {
    hist[prediction[j + 5]][observed[j]] += 1;
  }
  let total = 0;
  for (let x = 0; x < 29; x += 1) {
    maxima[x] = Math.max(...hist[x]);
    total += maxima[x];
  }
  const best = { match: total, gap: 0 };
  for (let gap = 0; gap < observed.length; gap += 1) {
    const oldX = prediction[gap + 5];
    const newX = prediction[gap];
    const y = observed[gap];
    hist[oldX][y] -= 1;
    hist[newX][y] += 1;
    if (oldX !== newX) {
      const oldMax = Math.max(...hist[oldX]);
      const newMax = Math.max(...hist[newX]);
      total += oldMax - maxima[oldX] + newMax - maxima[newX];
      maxima[oldX] = oldMax;
      maxima[newX] = newMax;
    }
    if (total > best.match) {
      best.match = total;
      best.gap = gap + 1;
    }
  }
  return best;
}

const outcomes = [];
const dataRegisters = [
  { name: 'index', source: a },
  { name: 'prime', source: a.map((x) => corpus.prime[x] % 29) },
];
for (const register of dataRegisters) {
  const d = determinant(register.source);
  for (let orientation = 0; orientation < 8; orientation += 1) {
    const candidate = orient(d, orientation);
    outcomes.push({
      register: register.name,
      orientation,
      ...bestGapAndLookup(candidate, b),
    });
  }
}
outcomes.sort((x, y) => y.match - x.match);
assert.deepEqual(outcomes[0], {
  register: 'prime',
  orientation: 3,
  match: 417,
  gap: 1502,
});
assert.equal(outcomes.length, 16);
assert.equal(outcomes[1].match, 415);

// Actual source-native planted positive with a secret full-rank affine
// substitution and a known five-cell omission at the SOURCE best gap.
const positiveD = orient(determinant(dataRegisters[1].source), 3);
const positive = positiveD.map((x) => mod(7 * x + 11));
positive.splice(1502, 5);
assert.equal(positive.length, 6395);
assert.deepEqual(bestGapAndLookup(positiveD, positive), {
  match: 6395, gap: 1502,
});
console.log(JSON.stringify({
  hypothesis: '2x2 determinant 81-square to 80-square-minus-five',
  exactSourceRuneCount: full.length,
  sourceMarker: a.slice(-6),
  orientations: 8,
  sourceRegisters: dataRegisters.map((x) => x.name),
  omittedGapCandidatesPerOrientation: 6396,
  totalSourceCandidates: 2 * 8 * 6396,
  originalBest: outcomes[0],
  minimumOriginalEdits: 6395 - outcomes[0].match,
  missingFraction: (6395 - outcomes[0].match) / 6395,
  topOrientations: outcomes,
  independentlyPlantedPositive: '6395/6395',
  conclusion: 'No intact second-square ciphertext under any fixed 29->29 output substitution, orientation, or contiguous five-cell omission. No previously unknown plaintext recovered.',
}, null, 2));
