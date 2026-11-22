'use strict';

/**
 * Original-source LP2 p2 201-runic secret / sixth-share Shamir consistency gate.
 * Read-only SFT. Requires the canonical repository resources/liber-primus corpus.
 * This is a finite GP29 candidate, distinct from historical byte-oriented SSSS.
 * @returns {void}
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const originalSecret = corpus.pages[2].indices;
const body = corpus.pages.slice(23, 27).flatMap((p) => p.indices).slice(16);
assert.equal(originalSecret.length, 201);
assert.equal(body.length, 1005);

const MOD = 29;
/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }

/**
 * Enumerates exactly all permutations, with no duplicate-key/phase tuning.
 * @param {number[]} prefix
 * @param {number[]} remaining
 * @param {(permutation: number[]) => void} visitor
 * @returns {void}
 */
function permute(prefix, remaining, visitor) {
  if (!remaining.length) {
    visitor(prefix);
    return;
  }
  for (let i = 0; i < remaining.length; i++) {
    permute([...prefix, remaining[i]],
      remaining.filter((_, j) => j !== i), visitor);
  }
}

/**
 * x=1..5 interpolation at x=0 over GF29:
 * 5*y1 -10*y2 +10*y3 -5*y4 +y5.
 * x=1..6 must have zero fifth forward finite difference for degree <=4:
 * y1 -5*y2 +10*y3 -10*y4 +5*y5 -y6 = 0.
 */
const secretWeights = [5, -10, 10, -5, 1];
const sixthWeights = [1, -5, 10, -10, 5, -1];

/**
 * @param {number[][]} rows Six 201-position source streams.
 * @param {number[]} order A source-to-identifier assignment.
 * @param {number[]} weights The fixed historical arithmetic relation.
 * @param {boolean} compareSecret Whether row0 is the interpolation target.
 * @returns {number} Exactly satisfied 201-column relations.
 */
function matches(rows, order, weights, compareSecret) {
  let count = 0;
  for (let j = 0; j < 201; j++) {
    let v = compareSecret ? -rows[0][j] : 0;
    for (let k = 0; k < weights.length; k++) {
      v += weights[k] * rows[compareSecret ? order[k] + 1 : order[k]][j];
    }
    if (mod(v) === 0) count++;
  }
  return count;
}

/**
 * Test an arbitrary unknown *shared* GP29 alphabet relabeling f:[0..28]->GF29.
 * Each source column supplies a homogeneous linear constraint on 29 unknown
 * relabeled rune values. Constants always solve because coefficients sum zero;
 * rank 28 means the constants are the ONLY solutions, excluding all bijections.
 * Returns the first original-column count that establishes rank 28.
 *
 * @param {number[][]} rows Six original source streams, length201 each.
 * @param {number[]} order Identifiers to source-stream indices.
 * @param {number[]} weights Field coefficients of interpolation/difference.
 * @param {boolean} secretMode Whether the first row is the target secret.
 * @returns {{rank:number,rowsUsed:number}}
 */
function constraintRank(rows, order, weights, secretMode) {
  const basis = Array(29).fill(null);
  const inverse = Array(29).fill(0);
  for (let a = 1; a < 29; a++) {
    for (let b = 1; b < 29; b++) {
      if (a*b % 29 === 1) inverse[a] = b;
    }
  }
  let rank = 0;
  for (let j = 0; j < 201; j++) {
    const row = new Int32Array(29);
    if (secretMode) row[rows[0][j]]--;
    for (let k = 0; k < weights.length; k++) {
      row[rows[secretMode ? order[k]+1 : order[k]][j]] += weights[k];
    }
    assert.equal(mod(row.reduce((sum, x) => sum + x, 0)), 0);
    for (let pivot = 0; pivot < 29; pivot++) {
      const factor = mod(row[pivot]);
      if (factor === 0) continue;
      const old = basis[pivot];
      if (old) {
        for (let t = pivot; t < 29; t++) {
          row[t] = mod(row[t] - factor*old[t]);
        }
      } else {
        const scale = inverse[factor];
        for (let t = pivot; t < 29; t++) row[t] = mod(row[t]*scale);
        basis[pivot] = row;
        rank++;
        break;
      }
    }
    if (rank === 28) return { rank, rowsUsed: j+1 };
  }
  return { rank, rowsUsed: 201 };
}

/** @param {number[][]} rows @param {boolean} secretMode @returns {{matches:number,order:number[],permutations:number}} */
function bestFit(rows, secretMode) {
  let best = { matches: -1, order: [], permutations: 0, minimumRank: 29, maximumRowsToRank28: 0 };
  const k = secretMode ? 5 : 6;
  permute([], Array.from({ length: k }, (_, i) => i), (order) => {
    best.permutations++;
    const weights = secretMode ? secretWeights : sixthWeights;
    const count = matches(rows, order, weights, secretMode);
    const linear = constraintRank(rows, order, weights, secretMode);
    best.minimumRank = Math.min(best.minimumRank, linear.rank);
    best.maximumRowsToRank28 = Math.max(best.maximumRowsToRank28, linear.rowsUsed);
    if (count > best.matches) {
      best.matches = count;
      best.order = order.slice();
    }
  });
  return best;
}

/**
 * Independently generated 201 exact GF29 degree-four polynomial rows, used
 * as a positive control for both p2-as-secret and six-evaluation interpretations.
 * @returns {void}
 */
function positiveControl() {
  const shares = Array.from({ length: 6 }, () => []);
  const secrets = [];
  for (let j = 0; j < 201; j++) {
    const coefficients = [j + 3, j*j + 2, 2*j + 11, j*j + 7*j + 5, 9*j + 1].map(mod);
    secrets.push(coefficients[0]);
    for (let x = 1; x <= 6; x++) {
      let y = 0;
      for (let k = coefficients.length - 1; k >= 0; k--) y = mod(y*x + coefficients[k]);
      shares[x - 1].push(y);
    }
  }
  const secretRows = [secrets, ...shares.slice(0, 5)];
  assert.equal(matches(secretRows, [0, 1, 2, 3, 4], secretWeights, true), 201);
  assert.equal(matches(shares, [0, 1, 2, 3, 4, 5], sixthWeights, false), 201);
  // In a real polynomial plant, both identity rune values and constants are
  // independent valid alphabet solutions, so constraint rank is at most 27.
  assert.ok(constraintRank(secretRows, [0,1,2,3,4], secretWeights, true).rank <= 27);
  assert.ok(constraintRank(shares, [0,1,2,3,4,5], sixthWeights, false).rank <= 27);
  // Both source-motivated literal regressions reject deliberate wrong input.
  const corrupt = shares.map((s) => s.slice());
  corrupt[5][71] = mod(corrupt[5][71] + 1);
  assert.equal(matches(corrupt, [0, 1, 2, 3, 4, 5], sixthWeights, false), 200);
  console.log('positive controls: 201/201 secret, 201/201 sixth share; corrupted share 200/201');
}

function main() {
  positiveControl();
  const expectedSecret = {
    'quintet,false,false': 12, 'quintet,false,true': 14,
    'quintet,true,false': 14, 'quintet,true,true': 12,
    'blocks,false,false': 15, 'blocks,false,true': 13,
    'blocks,true,false': 13, 'blocks,true,true': 15,
  };
  const expectedSixth = {
    'quintet,false,false': 21, 'quintet,false,true': 16,
    'quintet,true,false': 16, 'quintet,true,true': 21,
    'blocks,false,false': 15, 'blocks,false,true': 17,
    'blocks,true,false': 17, 'blocks,true,true': 15,
  };
  for (const layout of ['quintet', 'blocks']) {
    const lines = Array.from({ length: 5 }, (_, i) =>
      layout === 'quintet'
        ? Array.from({ length: 201 }, (_, j) => body[5*j + i])
        : body.slice(201*i, 201*(i+1))
    );
    for (const reverseP2 of [false, true]) {
      for (const reverseP23 of [false, true]) {
        const key = [layout, reverseP2, reverseP23].join(',');
        const p2 = reverseP2 ? originalSecret.slice().reverse() : originalSecret;
        const five = reverseP23 ? lines.map((l) => l.slice().reverse()) : lines;
        const rows = [p2, ...five];
        const secret = bestFit(rows, true);
        const sixth = bestFit(rows, false);
        assert.equal(secret.permutations, 120);
        assert.equal(sixth.permutations, 720);
        assert.equal(secret.matches, expectedSecret[key], key + ' secret');
        assert.equal(sixth.matches, expectedSixth[key], key + ' sixth');
        // All 120/720 permutations must force a constant-only relabeling.
        assert.equal(secret.minimumRank, 28, key + ' secret relabeling rank');
        assert.equal(sixth.minimumRank, 28, key + ' sixth relabeling rank');
        assert.ok(secret.maximumRowsToRank28 <= 37);
        assert.ok(sixth.maximumRowsToRank28 <= 37);
        console.log(key, 'p2=secret', secret.matches, '/201', secret.order,
          'six-shares', sixth.matches, '/201', sixth.order, 'all-secret ranks',secret.minimumRank,sixth.minimumRank,'first rank28 rows',secret.maximumRowsToRank28,sixth.maximumRowsToRank28);
      }
    }
  }
}
main();
