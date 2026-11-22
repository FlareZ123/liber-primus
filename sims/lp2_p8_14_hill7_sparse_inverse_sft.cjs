'use strict';

/**
 * Exhaustive sparse inverse-row cryptanalysis for the source-cued seven-column
 * LP2 p8–14 chapter. All coefficient families of support 1 through 4, over
 * GF(29), modulo projective scaling; no secret key or phase is presumed.
 *
 * A constant affine offset and arbitrary scaling preserve the equality
 * statistic. The search therefore covers every secret 7×7 Hill inverse
 * whose rows each have at most four nonzero entries, independently of the
 * secret per-output-character Caesar offsets and ordering of the rows.
 *
 * Run: node sims/lp2_p8_14_hill7_sparse_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.slice(8, 15).flatMap((page) => page.indices);
assert.equal(original.length, 1729);
const ROWS = 247;
const COLS = 7;
const MOD = 29;
/** @param {number} n */
const mod = (n) => ((n % MOD) + MOD) % MOD;

/** @param {number[]} values @param {'row'|'column'} layout */
function columns(values, layout) {
  assert.equal(values.length, ROWS * COLS);
  return Array.from({ length: COLS }, (_, col) => {
    const result = new Uint8Array(ROWS);
    for (let row = 0; row < ROWS; row++) {
      result[row] = values[layout === 'row' ? row * COLS + col : col * ROWS + row];
    }
    return result;
  });
}

/**
 * Returns twice the number of equal pairs in a projection, so the
 * denominator for a standard IoC is 247×246 = 60,762.
 * @param {Uint8Array[]} source
 * @param {number[]} positions
 * @param {number[]} weights
 */
function projectionPairs(source, positions, weights) {
  const counts = new Uint16Array(MOD);
  for (let row = 0; row < ROWS; row++) {
    let value = 0;
    for (let j = 0; j < positions.length; j++) {
      value += weights[j] * source[positions[j]][row];
    }
    counts[value % MOD]++;
  }
  let score = 0;
  for (let symbol = 0; symbol < MOD; symbol++) {
    score += counts[symbol] * (counts[symbol] - 1);
  }
  return score;
}

/** @param {number} size @returns {number[][]} */
function supports(size) {
  /** @type {number[][]} */
  const result = [];
  /** @param {number[]} chosen @param {number} next */
  function visit(chosen, next) {
    if (chosen.length === size) {
      result.push(chosen);
      return;
    }
    for (let index = next; index <= COLS - (size - chosen.length); index++) {
      visit(chosen.concat(index), index + 1);
    }
  }
  visit([], 0);
  return result;
}

/**
 * Complete, factor-of-scalar-normalized search over all sparse vectors.
 * Fix the first nonzero coefficient = 1; each remaining nonzero field
 * coefficient ranges 1..28. This loses no equality score because
 * multiplying all coefficients by a nonzero scalar permutes GP symbols.
 * @param {Uint8Array[]} source
 * @returns {{tested:number,highestBySupport:number[],winner:object}}
 */
function exhaustiveSparse(source) {
  let tested = 0;
  let best = -1;
  /** @type {object} */
  let winner = {};
  const highestBySupport = [];
  for (let width = 1; width <= 4; width++) {
    let highest = -1;
    for (const position of supports(width)) {
      const limit = 28 ** (width - 1);
      for (let state = 0; state < limit; state++) {
        let value = state;
        const weights = [1];
        for (let i = 1; i < width; i++) {
          weights.push(1 + value % 28);
          value = Math.floor(value / 28);
        }
        const score = projectionPairs(source, position, weights);
        tested++;
        if (score > highest) highest = score;
        if (score > best) {
          best = score;
          winner = { doubledPairs: score, positions: position, weights };
        }
      }
    }
    highestBySupport.push(highest);
  }
  assert.equal(tested, 7 + 588 + 27440 + 768320);
  return { tested, highestBySupport, winner };
}

const sourceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const sourceNames = ['Gibran', 'Emerson', 'Shakespeare'];
const tokens = corpus.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function nativeGp(text) {
  const result = [];
  for (const wordRaw of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = wordRaw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
      .replace(/IO/g, 'IA');
    for (let i = 0; i < word.length;) {
      const token = tokens.find((entry) => word.startsWith(entry.token, i));
      assert.ok(token, 'No GP token in ' + wordRaw);
      result.push(token.i);
      i += token.token.length;
    }
  }
  return result;
}
const controls = sourceFiles.map((name) => nativeGp(read(name)));
const layouts = /** @type {const} */ (['row', 'column']);
const observed = {};
const nativeMinimumOfMaximum = {};
for (const layout of layouts) {
  const originalColumns = columns(original, layout);
  const originalScan = exhaustiveSparse(originalColumns);
  const expected = layout === 'row'
    ? [2166, 2410, 2502, 2552] : [2184, 2358, 2452, 2530];
  assert.deepEqual(originalScan.highestBySupport, expected);
  observed[layout] = originalScan;

  const records = [];
  for (let source = 0; source < controls.length; source++) {
    const plain = controls[source];
    let minOfMax = Infinity;
    let count = 0;
    for (let start = 0; start + original.length <= plain.length; start += 83) {
      const span = columns(plain.slice(start, start + original.length), layout);
      let maximum = 0;
      for (let col = 0; col < COLS; col++) {
        maximum = Math.max(maximum, projectionPairs(span, [col], [1]));
      }
      minOfMax = Math.min(minOfMax, maximum);
      count++;
    }
    assert.ok(count >= 500);
    assert.ok(minOfMax > originalScan.winner.doubledPairs);
    records.push({ source: sourceNames[source], windows: count,
      minimumOfMaximumDoubledPairs: minOfMax });
  }
  assert.deepEqual(records.map((record) => record.minimumOfMaximumDoubledPairs),
    layout === 'row' ? [3650, 3666, 3506] : [3612, 3546, 3458]);
  nativeMinimumOfMaximum[layout] = records;

  // Positive nontrivial Hill7 plant: ciphertext C is the unique solution
  // of P_j = C_j + C_(j+1) + C_(j+2) + C_(j+3) in each seven-rune row,
  // with out-of-range columns zero. Its known inverse has row support <=4.
  const nativePlant = controls[0].slice(0, original.length);
  const sourceColumns = columns(nativePlant, layout);
  const cipherColumns = Array.from({ length: COLS }, () => new Uint8Array(ROWS));
  for (let row = 0; row < ROWS; row++) {
    for (let col = COLS - 1; col >= 0; col--) {
      let previous = 0;
      for (let j = col + 1; j <= Math.min(COLS - 1, col + 3); j++) {
        previous += cipherColumns[j][row];
      }
      cipherColumns[col][row] = mod(sourceColumns[col][row] - previous);
    }
  }
  for (let col = 0; col < COLS; col++) {
    const support = Array.from(
      { length: Math.min(4, COLS - col) }, (_, i) => col + i
    );
    const weights = support.map(() => 1);
    const recovered = new Uint8Array(ROWS);
    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < support.length; i++) {
        recovered[row] = mod(recovered[row] + cipherColumns[support[i]][row]);
      }
    }
    assert.deepEqual(recovered, sourceColumns[col]);
    assert.equal(projectionPairs(cipherColumns, support, weights),
      projectionPairs(sourceColumns, [col], [1]));
  }
}
console.log(JSON.stringify({
  test: 'original p8–14 exhaustive GF29 sparse inverse Hill7 attack',
  originalRunes: 1729,
  groupCount: 247,
  field: 29,
  supportCap: 4,
  secretCoefficientsPerLayout: 796355,
  doubledPairDenominator: 60762,
  observed,
  nativeMinimumOfMaximum,
  positivePlant: 'all 1729/1729 source-native GP runes recovered from planted Hill7 with every inverse row support <=4',
  decision: 'Original max native-projection collision score remains below minimum needed for any 7179 pinned native GP English windows; no original plaintext'
}, null, 2));
