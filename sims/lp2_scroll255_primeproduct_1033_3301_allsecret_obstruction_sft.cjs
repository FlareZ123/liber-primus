'use strict';
/**
 * Original-source GP29 255-word scroll -> following 255-rune p8 interface.
 *
 * Does an arbitrary secret stationary map of a whole-word prime PRODUCT
 * modulo historically visible 1033 or 3301 explain the candidate GF4/radix59
 * corrected receiver? This is an exact all-secret equality obstruction.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs
 *
 * No files are written. Not a historical decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
const gp = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const pages = read('lp2-transcription.txt').split('%');
const ri = new Map(gp.runes.map((ch, i) => [ch, i]));
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
const words = [];
let word = [];
for (let p = 3; p <= 7; p++) {
  for (const ch of pages[p]) {
    if (ri.has(ch)) word.push(ri.get(ch));
    else if ((ch === '-' || ch === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
const src = gp.pages.slice(3, 8).flatMap(p => p.indices);
assert.equal(words.length, 255);
assert.equal(src.length, 1145);
assert.deepEqual(words.flat(), src);
const c8 = gp.pages[8].indices;
assert.equal(c8.length, 255);
const sorted = w => [...w].sort((a, b) => a - b).join(',');
const parikh = new Map();
words.forEach((w, i) => {
  const k = sorted(w);
  if (!parikh.has(k)) parikh.set(k, []);
  parikh.get(k).push(i);
});
assert.deepEqual([...parikh.values()].filter(x => x.length > 1),
  [[47, 240], [48, 231], [88, 179], [235, 236]]);
const pairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(words[88], [12, 14]);
assert.deepEqual(words[179], [14, 12]);

/** GF(4)=GF(2)[x]/(x*x+x+1); 2-bit field elements. */
function gf4mul(a, b) {
  let product = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) product ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return product;
}
const redFive = [[23, 3], [22, 16, 2, 25],
  [5, 7, 11], [14, 28], [6, 28, 19]];
const products = redFive.map(w => w.reduce((p, x) => p * x % 29, 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
assert.deepEqual(gp.pages[7].indices.slice(194), redFive.flat());
const taps = products.slice(0, 4).map(x => x % 4);
let state = [products[4] % 4, 0, 0, 0];
const addr = [];
for (let i = 0; i < 255; i++) {
  addr.push(state.reduce((v, x) => 4 * v + x, 0));
  const feedback = state.reduce((f, x, j) => f ^ gf4mul(x, taps[j]), 0);
  state = [state[1], state[2], state[3], feedback];
}
assert.deepEqual(state, [2, 0, 0, 0]);
assert.equal(new Set(addr).size, 255);
assert(!addr.includes(0));
assert.deepEqual(addr.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
const cells = grid.pages.flatMap(p => p.tokens);
assert.equal(cells.length, 256);
assert(!cells.some(x => x.includes('f')));
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const byte59 = cells.map(token => 59 * alphabet59.indexOf(token[0]) +
  alphabet59.indexOf(token[1]));
assert(byte59.every(v => v >= 0 && v <= 251));
const corrected = c8.map((v, i) => mod29(v + byte59[addr[i]]));
assert.deepEqual(pairs.map(([i, j]) => [corrected[i], corrected[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);

/**
 * Exact lower bound on the number of wrong predictions of EVERY deterministic
 * single-symbol map (including all secret nonlinear maps) of source residues.
 * For residue bucket r, the best fixed output is the modal observed output.
 * @param {bigint[]} source
 * @param {number[]} response
 * @param {bigint} divisor
 */
function obstruction(source, response, divisor) {
  /** @type {Map<string, number[]>} */
  const groups = new Map();
  for (let i = 0; i < source.length; i++) {
    const key = (source[i] % divisor).toString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  let minimumErrors = 0;
  const conflicts = [];
  for (const [residue, positions] of groups) {
    const counts = new Map();
    for (const i of positions) {
      const y = response[i];
      counts.set(y, (counts.get(y) || 0) + 1);
    }
    const errors = positions.length - Math.max(...counts.values());
    minimumErrors += errors;
    if (errors) conflicts.push({ residue, positions,
      outputs: positions.map(i => response[i]), errors });
  }
  return { modulus: divisor.toString(), classes: groups.size,
    unavoidableErrors: minimumErrors, conflictingGroups: conflicts };
}
const primeProducts = words.map(w => w.reduce(
  (v, i) => v * BigInt(gp.prime[i]), 1n));
const expected = [
  [29n, 29, 199], [59n, 58, 183], [60n, 41, 194],
  [256n, 126, 112], [257n, 153, 94],
  [1033n, 220, 29], [3301n, 248, 3],
  [1033n * 3301n, 251, 0]
];
const table = expected.map(([modulus, classes, unavoidableErrors]) => {
  const r = obstruction(primeProducts, corrected, modulus);
  assert.equal(r.classes, classes);
  assert.equal(r.unavoidableErrors, unavoidableErrors);
  return r;
});
const c3301 = table.find(x => x.modulus === '3301');
assert.deepEqual(c3301.conflictingGroups, [
  { residue: '3058', positions: [31, 69], outputs: [2, 25], errors: 1 },
  { residue: '2108', positions: [102, 134], outputs: [1, 2], errors: 1 },
  { residue: '714', positions: [159, 213], outputs: [20, 21], errors: 1 }
]);
assert.equal(parikh.size, 251);

/* Independent source-shaped positive: truly deterministic secret table. */
const planted = primeProducts.map(v => Number((v % 3301n * 17n + 9n) % 29n));
const positive = obstruction(primeProducts, planted, 3301n);
assert.equal(positive.unavoidableErrors, 0);


/**
 * A different all-secret obstruction: even the 29 output rune labels may be
 * arbitrarily permuted. If H(word)=perm(sum_i weight[phase,i] mod29), then
 * every pair with equal H has equal unpermuted sums. If the equality-difference
 * matrix has FULL column rank, all secret weights must be zero, forcing ALL
 * outputs identical. This test uses only equal-label comparisons.
 *
 * @param {number[][]} features
 * @param {number[]} output
 * @returns {{rank:number, equations:number, variables:number, labels:number}}
 */
function equalityRank(features, output) {
  const first = new Map();
  const equations = [];
  for (let i = 0; i < output.length; i++) {
    const y = output[i];
    if (!first.has(y)) first.set(y, i);
    else {
      const anchor = features[first.get(y)];
      equations.push(features[i].map((x, j) => mod29(x - anchor[j])));
    }
  }
  const variables = features[0].length;
  let rank = 0;
  for (let j = 0; j < variables; j++) {
    let pivot = rank;
    while (pivot < equations.length && equations[pivot][j] === 0) pivot++;
    if (pivot === equations.length) continue;
    [equations[rank], equations[pivot]] =
      [equations[pivot], equations[rank]];
    let inverse = 0;
    for (let x = 1; x < 29; x++) {
      if (mod29(x * equations[rank][j]) === 1) {
        inverse = x;
        break;
      }
    }
    assert(inverse !== 0);
    for (let k = j; k < variables; k++) {
      equations[rank][k] = mod29(equations[rank][k] * inverse);
    }
    for (let i = rank + 1; i < equations.length; i++) {
      const multiple = equations[i][j];
      if (multiple === 0) continue;
      for (let k = j; k < variables; k++) {
        equations[i][k] = mod29(
          equations[i][k] - multiple * equations[rank][k]);
      }
    }
    rank++;
    if (rank === variables) break;
  }
  return { rank, equations: output.length - first.size,
    variables, labels: first.size };
}
/** @param {number} period @returns {number[][]} */
const phaseFeatures = period => words.map(word => {
  const row = Array(29 * period).fill(0);
  word.forEach((symbol, position) => {
    row[(position % period) * 29 + symbol]++;
  });
  return row;
});
const allSecretPhaseBounds = [1, 2, 3, 4, 5].map(period => {
  const proof = equalityRank(phaseFeatures(period), corrected);
  assert.equal(proof.rank, proof.variables);
  assert.equal(proof.labels, 29);
  assert.equal(proof.equations, 226);
  return { period, ...proof, forcedSecretWeights: 'all zero',
    actualDifferentOutputs: proof.labels };
});
const nativeGPSecretWeights = gp.runes.map((_, i) => mod29(7 * i + 3));
const secretLabelPermutation = x => mod29(9 * x + 4);
const encodedNativePositive = words.map(word => secretLabelPermutation(
  mod29(word.reduce((sum, symbol) =>
    sum + nativeGPSecretWeights[symbol], 0))));
const positiveRank = equalityRank(phaseFeatures(1), encodedNativePositive);
assert(positiveRank.rank < positiveRank.variables);
assert(positiveRank.labels > 1);


/**
 * Stronger all-secret certificate: permit ONE INDEPENDENT secret weight for
 * every original rune identity at every possible position in a source word.
 * Since the original scroll's longest word is 12 runes, the resulting 12*29
 * matrix strictly contains all stationary period-1..12 additive input laws.
 *
 * Equal corrected rune outputs imply equal input sums under a deterministic
 * output map whenever that map is injective; and the original Q tape uses all
 * 29 of the possible field values, so ANY deterministic 29-to-29 output map
 * must be bijective if it generates Q. No chosen output alphabet is presumed.
 *
 * If E = feature differences within equal-Q word classes, and D = all
 * original feature differences to word0, equality of their rowspace proves
 * that all k with E*k=0 also satisfy D*k=0: EVERY word hash is the same,
 * contradicting the 29 visibly different corrected rune values.
 */
function fieldRank(rows, variables) {
  const matrix = rows.map(row => row.map(mod29));
  let rank = 0;
  for (let col = 0; col < variables; col++) {
    let selected = rank;
    while (selected < matrix.length && matrix[selected][col] === 0)
      selected++;
    if (selected === matrix.length) continue;
    [matrix[rank], matrix[selected]] = [matrix[selected], matrix[rank]];
    let inverse = 0;
    for (let j = 1; j < 29; j++) {
      if (mod29(j * matrix[rank][col]) === 1) {
        inverse = j;
        break;
      }
    }
    assert(inverse !== 0);
    for (let j = col; j < variables; j++)
      matrix[rank][j] = mod29(matrix[rank][j] * inverse);
    for (let i = rank + 1; i < matrix.length; i++) {
      const multiple = matrix[i][col];
      if (multiple === 0) continue;
      for (let j = col; j < variables; j++)
        matrix[i][j] = mod29(
          matrix[i][j] - multiple * matrix[rank][j]);
    }
    rank++;
    if (rank === variables || rank === matrix.length) break;
  }
  return rank;
}
/**
 * @param {number[][]} features
 * @param {number[]} labels
 * @returns {number[][]}
 */
function withinLabelDifferenceRows(features, labels) {
  const anchors = new Map(), differences = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (!anchors.has(label)) anchors.set(label, i);
    else {
      const first = features[anchors.get(label)];
      differences.push(features[i].map((x, j) => mod29(x - first[j])));
    }
  }
  return differences;
}
assert.equal(Math.max(...words.map(w => w.length)), 12);
const completeFeatures = phaseFeatures(12);
const completeEquals = withinLabelDifferenceRows(
  completeFeatures, corrected);
const completeAll = completeFeatures.slice(1).map(row =>
  row.map((x, j) => mod29(x - completeFeatures[0][j])));
assert.equal(completeEquals.length, 226);
assert.equal(completeAll.length, 254);
const completeEqRank = fieldRank(completeEquals, 348);
const completeAllRank = fieldRank(completeAll, 348);
assert.equal(completeEqRank, 199);
assert.equal(completeAllRank, 199);
const positivePositionWeights = Array.from({ length: 12 }, (_, position) =>
  gp.runes.map((_, symbol) => mod29(17 * position + 7 * symbol + 3)));
const positivePositionOutput = words.map(word =>
  secretLabelPermutation(word.reduce((sum, symbol, position) =>
    sum + positivePositionWeights[position][symbol], 0) % 29));
assert(new Set(positivePositionOutput).size > 1);
const positivePositionEqRank = fieldRank(
  withinLabelDifferenceRows(completeFeatures, positivePositionOutput), 348);
assert(positivePositionEqRank < completeAllRank);


/* Historical p56's actual plaintext F (GP rune index0) is transparent and
 * does not consume its prime key clock. A source-selected bridge could
 * similarly skip F when indexing a secret per-position word checksum.
 * The 2014 256-cell table's low-digit base60 alphabet also happens to omit
 * 'f' in this particular sample. Test the surviving F-skip law without
 * presuming it succeeds (the missing low digit is not a verified command).
 */
assert.equal(gp.translit[0], 'F');
const completeTransparentFeatures = words.map(word => {
  const row = Array(348).fill(0);
  word.filter(x => x !== 0).forEach((symbol, position) => {
    row[position * 29 + symbol]++;
  });
  return row;
});
assert.equal(words.flat().filter(x => x === 0).length, 26);
assert.equal(words.filter(word => word.includes(0)).length, 26);
const transparentE = withinLabelDifferenceRows(
  completeTransparentFeatures, corrected);
const transparentD = completeTransparentFeatures.slice(1).map(row =>
  row.map((x, j) => mod29(x - completeTransparentFeatures[0][j])));
const transparentEqRank = fieldRank(transparentE, 348);
const transparentAllRank = fieldRank(transparentD, 348);
assert.equal(transparentEqRank, 190);
assert.equal(transparentAllRank, 190);
const countF = word => word.reduce((n, symbol) =>
  n + Number(symbol === 0), 0);
const transparentPlusFcount = completeTransparentFeatures.map((row, i) =>
  row.concat([countF(words[i])]));
const transparentPlusE = withinLabelDifferenceRows(
  transparentPlusFcount, corrected);
const transparentPlusD = transparentPlusFcount.slice(1).map(row =>
  row.map((x, j) => mod29(x - transparentPlusFcount[0][j])));
const transparentPlusEqRank = fieldRank(transparentPlusE, 349);
const transparentPlusAllRank = fieldRank(transparentPlusD, 349);
assert.equal(transparentPlusEqRank, 191);
assert.equal(transparentPlusAllRank, 191);
const plantedFtransparentOutput = words.map(word => secretLabelPermutation(
  word.filter(x => x !== 0).reduce((sum, symbol, position) =>
    sum + positivePositionWeights[position][symbol], 0) % 29));
assert(new Set(plantedFtransparentOutput).size > 1);
const plantedFtransparentEqRank = fieldRank(withinLabelDifferenceRows(
  completeTransparentFeatures, plantedFtransparentOutput), 348);
assert(plantedFtransparentEqRank < transparentAllRank);

/* A full residue has 251 classes, allowing an arbitrary 251-entry fit.
 * That perfect map is tautological, not a recovered cipher/hidden key. */
console.log('SCROLL255_PRIME_PRODUCT_RESIDUE_ALLSECRET ' + JSON.stringify({
  sourceWords: words.length, sourceRunes: src.length,
  sourceParikhClasses: parikh.size, targetRunes: c8.length,
  originalFourParikhPairs: pairs, correctedPairValues: pairs.map(([i]) => corrected[i]),
  exactBounds: table.map(x => ({
    modulus: x.modulus, residueClasses: x.classes,
    forcedWrongRrunicOutputs: x.unavoidableErrors,
    contradictoryClasses: x.conflictingGroups.length
  })),
  original3301Contradictions: c3301.conflictingGroups,
  nativePlantedPositiveErrors: positive.unavoidableErrors,
  originalUnknownOutputPermutationPhaseRanks: allSecretPhaseBounds,
  nativeGPSecretOutputPermutationPositiveRank: positiveRank,
  completeOriginalUnrestrictedPositionGF29Hash: {
    variables: 348, equalOutputDifferenceRows: 226,
    allOriginalDifferenceRows: 254,
    rankEqualOutputConstraints: completeEqRank,
    rankAllOriginalWordDifferences: completeAllRank,
    forcedAllSecretHashesConstant: completeEqRank === completeAllRank,
    secretPositionHashPositiveRank: positivePositionEqRank
  },
  FtransparentOriginalAllSecretPositionHash: {
    nativeFRunes: 26, nativeWordsContainingF: 26,
    equalQrank: transparentEqRank,
    allOriginalDifferencesRank: transparentAllRank,
    withSecretFcountTermEqualQRank: transparentPlusEqRank,
    withSecretFcountTermAllWordDifferencesRank: transparentPlusAllRank,
    plantedTransparentPositiveRank: plantedFtransparentEqRank
  },
  status: 'No plaintext, author-selected key, or original cipher demonstrated'
}, null, 2));
