'use strict';

const assert = require('node:assert/strict');

const M = 29;
const I2 = 15;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

const D = [26,1,3,2,26,1,0,1,3,20,6,1,3];
const E = [23,8,1,27,3,24,10,6,26,8,23,4,15];
const S = [20,9,4,0,0,25,10,7,0,28,0,5,18];

const keys = [
  [6,14,23,6],
  [17,14,7],
  [3,0,1],
  [25,5,26,2],
  [24,5],
  [19,14,18,15,17],
  [25,19,27,26],
  [12,1,1,22],
  [20,7,7,7,13,4],
  [19,12,19,2,5],
  [20,20,12,6],
  [26,23,1,7,13,22],
  [7,1,12,23,13,2,18],
];

assert.deepEqual(
  keys.map((key) => key.reduce((sum, value) => mod29(sum + value), 0)),
  S
);

/** @param {number} diff @param {number} sum @returns {number[]} */
function inversePair(diff, sum) {
  return [
    mod29((diff + sum) * I2),
    mod29((sum - diff) * I2),
  ];
}

const centerChoices = [
  ['+D', (d) => d],
  ['-D', (d) => mod29(-d)],
  ['+E', (_d, e) => e],
  ['-E', (_d, e) => mod29(-e)],
  ['+S', (_d, _e, s) => s],
  ['-S', (_d, _e, s) => mod29(-s)],
  ['F', () => 0],
];

const family = [];

for (const swap of [false, true]) {
  for (const differenceSign of [1, -1]) {
    for (const sumSign of [1, -1]) {
      for (const [centerName, center] of centerChoices) {
        let pageHits = 0;
        let coordinateHits = 0;

        for (let lane = 0; lane < 13; lane += 1) {
          const [differenceSource, sumSource] = swap
            ? [E[lane], D[lane]]
            : [D[lane], E[lane]];

          const [left, right] = inversePair(
            mod29(differenceSign * differenceSource),
            mod29(sumSign * sumSource)
          );

          const length = keys[lane].length;
          const predicted = Array(length);

          for (let pair = 0; pair < Math.floor(length / 2); pair += 1) {
            predicted[pair] = left;
            predicted[length - 1 - pair] = right;
          }

          if (length % 2) {
            predicted[Math.floor(length / 2)] = center(
              D[lane],
              E[lane],
              S[lane]
            );
          }

          if (predicted.join(',') === keys[lane].join(',')) {
            pageHits += 1;
          }

          for (let coordinate = 0; coordinate < length; coordinate += 1) {
            if (predicted[coordinate] === keys[lane][coordinate]) {
              coordinateHits += 1;
            }
          }
        }

        family.push({
          swap,
          differenceSign,
          sumSign,
          center: centerName,
          pageHits,
          coordinateHits,
        });
      }
    }
  }
}

assert.equal(family.length, 56);
assert.equal(Math.max(...family.map((row) => row.pageHits)), 0);
assert.equal(Math.max(...family.map((row) => row.coordinateHits)), 5);

const coordinateHitHistogram = Object.fromEntries(
  [...new Set(family.map((row) => row.coordinateHits))]
    .sort((left, right) => left - right)
    .map((hits) => [
      hits,
      family.filter((row) => row.coordinateHits === hits).length,
    ])
);

assert.deepEqual(coordinateHitHistogram, {
  0: 24,
  1: 16,
  2: 2,
  4: 12,
  5: 2,
});

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power) {
    if (power & 1) result = mod29(result * value);
    value = mod29(value * value);
    power >>= 1;
  }
  return result;
}

/** @param {number[][]} matrix @returns {number} */
function rank29(matrix) {
  const work = matrix.map((row) => row.map(mod29));
  let pivotRow = 0;

  for (
    let column = 0;
    column < work[0].length && pivotRow < work.length;
    column += 1
  ) {
    let pivot = -1;
    for (let row = pivotRow; row < work.length; row += 1) {
      if (work[row][column] !== 0) {
        pivot = row;
        break;
      }
    }
    if (pivot < 0) continue;

    [work[pivotRow], work[pivot]] = [work[pivot], work[pivotRow]];
    const inverse = pow29(work[pivotRow][column], 27);
    work[pivotRow] = work[pivotRow].map((value) =>
      mod29(value * inverse)
    );

    for (let row = 0; row < work.length; row += 1) {
      if (row === pivotRow || work[row][column] === 0) continue;
      const factor = work[row][column];
      work[row] = work[row].map((value, index) =>
        mod29(value - factor * work[pivotRow][index])
      );
    }

    pivotRow += 1;
  }

  return pivotRow;
}

/** @param {number[]} values @returns {number[]} */
function pairShell(values) {
  const shell = [];
  for (let pair = 0; pair < Math.floor(values.length / 2); pair += 1) {
    shell.push(
      mod29(values[pair] - values[values.length - 1 - pair]),
      mod29(values[pair] + values[values.length - 1 - pair])
    );
  }
  if (values.length % 2) {
    shell.push(values[Math.floor(values.length / 2)]);
  }
  return shell;
}

/**
 * Exact total-degree <=2 GF(29) design in (D,E,arity,position).
 * @param {boolean} useShell
 * @returns {{rankA:number,rankAugmented:number,rows:number,columns:number}}
 */
function quadraticGate(useShell) {
  const design = [];
  const target = [];

  for (let lane = 0; lane < 13; lane += 1) {
    const values = useShell ? pairShell(keys[lane]) : keys[lane];
    const arity = keys[lane].length;

    for (let position = 0; position < values.length; position += 1) {
      const x = [D[lane], E[lane], arity, position];
      const row = [1, ...x];

      for (let left = 0; left < x.length; left += 1) {
        for (let right = left; right < x.length; right += 1) {
          row.push(mod29(x[left] * x[right]));
        }
      }

      design.push(row);
      target.push(values[position]);
    }
  }

  return {
    rankA: rank29(design),
    rankAugmented: rank29(
      design.map((row, index) => row.concat(target[index]))
    ),
    rows: design.length,
    columns: design[0].length,
  };
}

const rawQuadratic = quadraticGate(false);
const shellQuadratic = quadraticGate(true);

assert.deepEqual(rawQuadratic, {
  rankA: 15,
  rankAugmented: 16,
  rows: 57,
  columns: 15,
});

assert.deepEqual(shellQuadratic, {
  rankA: 15,
  rankAugmented: 16,
  rows: 57,
  columns: 15,
});

console.log(JSON.stringify({
  status: 'PASS',
  directPairChannelFamily: {
    laws: family.length,
    maximumExactPageKeys: 0,
    maximumMatchingCoordinates: 5,
    coordinateHitHistogram,
  },
  quadratic: {
    rawKeyCoordinates: rawQuadratic,
    pairShellCoordinates: shellQuadratic,
  },
  interpretation:
    'The two p6 grid scalars do not lift to the fitted coordinate keys under the canonical repeated outside-pair H channel or any total-degree<=2 GF(29) law in (D,E,arity,position).',
}, null, 2));
