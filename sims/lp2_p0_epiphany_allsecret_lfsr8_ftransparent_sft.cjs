'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MODULUS = 29;
const TITLE_PLAINTEXT = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const TITLE_CIPHERTEXT = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const EXPECTED_ORDER8_P3_FAILURES = [738, 755, 787, 809, 811, 831];
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MODULUS) + MODULUS) % MODULUS;
}

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let i = 1; i < MODULUS; i += 1) {
    if (mod(i * n) === 1) return i;
  }
  throw new Error('No inverse for ' + n);
}

/**
 * Solve every homogeneous recurrence consistent with the first 13
 * source-conjectured key digits. Each row n>=q is
 *   K[n] = sum(j=1..q) a[j-1] K[n-j] (mod 29).
 * @param {number[]} seed
 * @param {number} order
 * @returns {number[][]}
 */
function solveCoefficients(seed, order) {
  const rows = [];
  for (let i = order; i < seed.length; i += 1) {
    const row = Array.from({ length: order }, (_, j) => seed[i - j - 1]);
    row.push(seed[i]);
    rows.push(row);
  }
  const pivots = [];
  for (let col = 0; col < order; col += 1) {
    const row = pivots.length;
    let candidate = row;
    while (candidate < rows.length && rows[candidate][col] === 0) candidate += 1;
    if (candidate === rows.length) continue;

    [rows[row], rows[candidate]] = [rows[candidate], rows[row]];
    const pivotInverse = inverse(rows[row][col]);
    for (let j = col; j <= order; j += 1) {
      rows[row][j] = mod(rows[row][j] * pivotInverse);
    }
    for (let r = 0; r < rows.length; r += 1) {
      if (r === row) continue;
      const factor = rows[r][col];
      for (let j = col; j <= order; j += 1) {
        rows[r][j] = mod(rows[r][j] - factor * rows[row][j]);
      }
    }
    pivots.push(col);
  }

  if (rows.slice(pivots.length).some(row => row[order] !== 0)) return [];
  const free = Array.from({ length: order }, (_, j) => j)
    .filter(j => !pivots.includes(j));
  const solutions = [];
  for (let value = 0; value < MODULUS ** free.length; value += 1) {
    const coefficients = Array(order).fill(0);
    let digits = value;
    for (const col of free) {
      coefficients[col] = digits % MODULUS;
      digits = Math.floor(digits / MODULUS);
    }
    for (let r = pivots.length - 1; r >= 0; r -= 1) {
      let rhs = rows[r][order];
      for (const col of free) rhs = mod(rhs - rows[r][col] * coefficients[col]);
      coefficients[pivots[r]] = rhs;
    }
    for (let i = order; i < seed.length; i += 1) {
      const predicted = mod(coefficients.reduce(
        (total, a, j) => total + a * seed[i - j - 1], 0
      ));
      assert.equal(predicted, seed[i], 'Exact title-seed linear recurrence');
    }
    solutions.push(coefficients);
  }
  return solutions;
}

/**
 * Recurrence stream with the original 13 known title positions fixed.
 * @param {number[]} seed
 * @param {number[]} coefficients
 * @returns {(index:number)=>number}
 */
function keyStream(seed, coefficients) {
  const key = seed.slice();
  return index => {
    while (key.length <= index) {
      const next = mod(coefficients.reduce(
        (sum, a, j) => sum + a * key[key.length - 1 - j], 0
      ));
      key.push(next);
    }
    return key[index];
  };
}

/**
 * Checks *every* legal plaintext-F bypass / consumed-key alternative,
 * without scoring English or choosing a favorable branch.
 * A nonzero ciphertext equal to the active key is impossible: it would
 * require plaintext F, which would have emitted literal F instead.
 * @param {number[]} ciphertext
 * @param {(index:number)=>number} keyAt
 * @returns {{end:number,states:number}}
 */
function firstFailure(ciphertext, keyAt) {
  let states = new Set([13]);
  for (let i = 13; i < ciphertext.length; i += 1) {
    const next = new Set();
    for (const clock of states) {
      const active = keyAt(clock);
      if (ciphertext[i] === 0) {
        next.add(clock);
        if (active !== 0) next.add(clock + 1);
      } else if (ciphertext[i] !== active) {
        next.add(clock + 1);
      }
    }
    if (next.size === 0) return { end: i, states: 0 };
    states = next;
  }
  return { end: ciphertext.length, states: states.size };
}

/**
 * Encode a known GP29-native plaintext under the genuine p56 F rule.
 * @param {number[]} plaintext
 * @param {(index:number)=>number} keyAt
 * @returns {number[]}
 */
function encodeNative(plaintext, keyAt) {
  let cursor = 13;
  return plaintext.map(p => {
    if (p === 0) return 0;
    const output = mod(p + keyAt(cursor));
    cursor += 1;
    return output;
  });
}

function main() {
  const pages = corpus.pages;
  const p0 = pages.find(p => p.page === 0);
  assert.equal(p0.runic_count, 262);
  assert.deepEqual(p0.indices.slice(0, 13), TITLE_CIPHERTEXT);
  const seed = TITLE_CIPHERTEXT.map((c, i) => mod(c - TITLE_PLAINTEXT[i]));
  assert.deepEqual(seed, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);

  const section0 = pages.filter(p => p.page >= 0 && p.page <= 2)
    .flatMap(p => p.indices);
  const section1 = pages.filter(p => p.page >= 0 && p.page <= 7)
    .flatMap(p => p.indices);
  assert.equal(section0.length, 729);
  assert.equal(section1.length, 1874);

  const nativeP57 = pages.find(p => p.page === 57).indices;
  assert.equal(nativeP57.length, 95);
  assert(nativeP57.includes(0), 'Control includes literal plaintext F');
  const nativePlant = Array.from({ length: section0.length },
    (_, i) => nativeP57[i % nativeP57.length]);

  const summary = [];
  let order8Survivors = [];
  for (let order = 1; order <= 8; order += 1) {
    const solutions = solveCoefficients(seed, order);
    let firstChapterSurvivors = 0;
    let latestFailure = -1;

    for (const coefficients of solutions) {
      const keyAt = keyStream(seed, coefficients);
      const { end } = firstFailure(section0, keyAt);
      latestFailure = Math.max(latestFailure, end);
      if (end < section0.length) continue;

      firstChapterSurvivors += 1;
      if (order !== 8) continue;
      const out = firstFailure(section1, keyStream(seed, coefficients));
      order8Survivors.push({
        coefficients,
        firstContradiction: out.end
      });
    }
    summary.push({
      order,
      exactSeedSolutions: solutions.length,
      lastOriginalPositionReached: latestFailure,
      originalFirstChapterSurvivors: firstChapterSurvivors
    });
  }

  assert.deepEqual(summary.map(s => s.exactSeedSolutions),
    [0, 0, 0, 0, 0, 1, 29, 24389]);
  assert.equal(summary[5].lastOriginalPositionReached, 20);
  assert.equal(summary[6].lastOriginalPositionReached, 20);
  assert.equal(summary[7].originalFirstChapterSurvivors, 6);
  assert.deepEqual(
    order8Survivors.map(s => s.firstContradiction).sort((a, b) => a - b),
    EXPECTED_ORDER8_P3_FAILURES
  );
  assert(order8Survivors.every(s => s.firstContradiction >= 729));
  assert(order8Survivors.every(s => s.firstContradiction < section1.length));

  for (const row of order8Survivors) {
    const actual = encodeNative(nativePlant, keyStream(seed, row.coefficients));
    const proof = firstFailure(
      Array(13).fill(1).concat(actual), keyStream(seed, row.coefficients)
    );
    assert.equal(proof.end, 13 + nativePlant.length,
      'Known cleartext F-transparent plant must remain feasible');
  }

  console.log(JSON.stringify({
    source: 'LP2 original p0-p7; firstparty-2016 EPIPHANY SEECS hypothesis',
    titleCiphertext: TITLE_CIPHERTEXT,
    hypothesizedPlaintext: TITLE_PLAINTEXT,
    impliedKey: seed,
    chapterLengths: [section0.length, section1.length - section0.length],
    summary,
    order8Survivors,
    conclusion: 'All seeded homogeneous GF29 orders 1..8 fail by original p3,'
      + ' conditional on exact title crib, uninterrupted clock and p56 F-bypass.',
    positivePlant: nativePlant.length + ' known p57 GP29 runes per survivor PASS'
  }, null, 2));
}

main();
