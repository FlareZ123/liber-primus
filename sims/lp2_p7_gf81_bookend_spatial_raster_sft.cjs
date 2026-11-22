'use strict';
/**
 * Original LP2 81x81 / 80x80 GF81-coordinate bookend spatial receiver.
 * A falsifiable image/raster alternative to native-GP letter-frequency tests.
 * Windows 11 / Node.js 22 / CommonJS. Read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = number => corpus.pages.find(p => p.page === number).indices;
const product = a => a.reduce((acc, x) => acc * x % 29, 1);
const p7 = page(7), p8 = page(8);
const p7Red = p7.slice(194);
const widths = [2, 4, 3, 2, 3];
let cursor = 0;
const p7Products = widths.map(w => {
  const value = product(p7Red.slice(cursor, cursor + w));
  cursor += w;
  return value;
});
assert.equal(p7.length, 208);
assert.deepEqual(p7Products, [11, 26, 8, 15, 2]);
assert.deepEqual([product(p8.slice(0, 4)), product(p8.slice(4, 12))], [4, 3]);
assert.equal(p8[11], 17);

/**
 * Multiply a polynomial-basis GF(3^4) element by g=x+1,
 * reducing with x^4+x^2+x+1 (the normalized p7 mod-3 polynomial).
 * @param {number} value One base-3 polynomial-basis index in [0,80].
 * @returns {number}
 */
function mulGenerator(value) {
  const digits = [0, 0, 0, 0, 0];
  for (let k = 0; k < 4; k++) {
    const x = value % 3;
    value = Math.floor(value / 3);
    digits[k] += x;
    digits[k + 1] += x;
  }
  const top = digits[4] % 3;
  for (let j = 0; j < 3; j++) digits[j] -= top;
  return digits.slice(0, 4).reduce((sum, x, i) =>
    sum + ((x % 3 + 3) % 3) * 3 ** i, 0);
}
const powers = [1];
for (let i = 1; i < 80; i++) powers.push(mulGenerator(powers[i - 1]));
assert.equal(new Set(powers).size, 80);
assert.equal(mulGenerator(powers[79]), 1);

const all = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
assert.equal(all.length, 12956);
const first = all.slice(0, 6561);
const second = all.slice(6561);
assert.equal(first.length, 81 ** 2);
assert.equal(second.length, 6395);
const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const B = Array(6400).fill(null);
for (let i = 0, k = 0; i < B.length; i++) {
  if (!holes.has(i)) B[i] = second[k++];
}
assert.equal(B.filter(x => x === null).length, 5);
const Afield = B.map((_, i) =>
  first[powers[Math.floor(i / 80)] * 81 + powers[i % 80]]);
assert.equal(Afield.length, 6400);
const mod29 = x => (x % 29 + 29) % 29;
const inverse = sign => B.map((c, i) => c === null ? null :
  mod29(c + sign * Afield[i]));
const candidates = [inverse(-1), inverse(+1)];

const positions = [];
const hEdges = [], vEdges = [];
for (let i = 0; i < 6400; i++) {
  if (B[i] !== null) positions.push(i);
  if (i % 80 < 79 && B[i] !== null && B[i + 1] !== null) hEdges.push(i);
  if (i < 6320 && B[i] !== null && B[i + 80] !== null) vEdges.push(i);
}
assert.deepEqual([positions.length, hEdges.length, vEdges.length],
  [6395, 6310, 6310]);

/** @param {(number|null)[]} data */
function adjacent(data) {
  let h = 0, v = 0;
  for (const i of hEdges) if (data[i] === data[i + 1]) h++;
  for (const i of vEdges) if (data[i] === data[i + 80]) v++;
  return { h, v, total: h + v };
}
const actual = candidates.map(adjacent);
assert.deepEqual(actual, [{h:206, v:238, total:444},
  {h:202, v:246, total:448}]);

// Exact-rune-count-preserving shuffle controls, 4096 per candidate.
// The five genuine printed numeral slots remain missing in every null.
let seed = 0x7e13b4f7;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const nulls = candidates.map(data => {
  const values = data.filter(x => x !== null);
  const shuffled = Array(6400).fill(null);
  const scores = [];
  for (let trial = 0; trial < 4096; trial++) {
    const draw = values.slice();
    for (let i = draw.length - 1; i > 0; i--) {
      const j = random32() % (i + 1);
      const temp = draw[i];
      draw[i] = draw[j];
      draw[j] = temp;
    }
    for (let i = 0; i < positions.length; i++) shuffled[positions[i]] = draw[i];
    scores.push(adjacent(shuffled).total);
  }
  return scores;
});
const summary = nulls.map((draws, i) => ({
  actual: actual[i],
  nullMean: draws.reduce((s, x) => s + x, 0) / draws.length,
  nullMin: Math.min(...draws),
  nullMax: Math.max(...draws),
  oneSidedP: (1 + draws.filter(x => x >= actual[i].total).length) /
    (draws.length + 1)
}));
assert.equal(summary[0].nullMean, 434.748779296875);
assert.equal(summary[1].nullMean, 434.66015625);

/**
 * For ANY globally fixed map of the 29 rune classes to REAL
 * grayscale or RGB values, certify the total squared neighbor contrast
 * lower bound using an exact positive-semidefinite integer matrix.
 * Binary black/white palettes follow as a special case.
 *
 * With f_a symbol counts, L the symbol-adjacency graph Laplacian, and
 * N=6395, H=5*N*L - 18*N*diag(f) + 18*f*f^T must be PSD.
 * Each row of H sums to zero. Positive leading principal minors of
 * the upper-left 28x28 cofactor (exact Bareiss integer elimination)
 * prove the remaining 28 eigenvalues positive by Sylvester's criterion.
 *
 * In fact for ANY real-valued palette v[29] with source-weighted
 * pixel variance sigma² and mean mu, the graph smoothness energy is
 * E=sum_adjacencies (v[a]-v[b])² >= (18/5)*N*sigma².
 * For multichannel RGB sum this bound independently over channels.
 * The exact expected shuffled energy is 2*m*N/(N-1)*sigma².
 *
 * Thus every binary palette with black share q has
 * cross-color edge count >= (18/5)*N*q*(1-q).
 * Relative to a uniform pixel-position shuffle with the identical black
 * occupancy, crossing edges are at least
 * (18/5)*(N-1)/(2*12620) = 0.91198098 of shuffled expectation.
 *
 * @param {(number|null)[]} data The original GP29 transformed spatial field.
 * @returns {{symbolCount:number,proofMinorCount:number,
 *  minShuffleBoundaryFraction:number,maxBinarySameEdgesBalanced:number}}
 */
function proveSecretBinaryPalette(data) {
  const frequency = Array(29).fill(0);
  const laplacian = Array.from({length:29}, () => Array(29).fill(0));
  for (const rune of data) if (rune !== null) frequency[rune]++;
  assert.equal(frequency.reduce((s, n) => s + n, 0), 6395);
  const addEdge = (i, j) => {
    const a = data[i], b = data[j];
    if (a === b) return;
    laplacian[a][a]++;
    laplacian[b][b]++;
    laplacian[a][b]--;
    laplacian[b][a]--;
  };
  for (const i of hEdges) addEdge(i, i + 1);
  for (const i of vEdges) addEdge(i, i + 80);
  const N = 6395n;
  const H = Array.from({length:29}, (_, i) =>
    Array.from({length:29}, (_, j) =>
      5n * N * BigInt(laplacian[i][j]) -
      (i === j ? 18n * N * BigInt(frequency[i]) : 0n) +
      18n * BigInt(frequency[i]) * BigInt(frequency[j])));
  assert.ok(H.every(row => row.reduce((sum, x) => sum + x, 0n) === 0n));
  // H is symmetric and has null vector (1,...,1); check all 28
  // leading principal minors of a cofactor exactly, without eigensolver.
  const minor = H.slice(0, 28).map(row => row.slice(0, 28));
  let previous = 1n;
  for (let k = 0; k < 28; k++) {
    const pivot = minor[k][k];
    assert.ok(pivot > 0n, 'nonpositive exact Sylvester minor ' + (k + 1));
    for (let i = k + 1; i < 28; i++) {
      for (let j = k + 1; j < 28; j++) {
        const numerator = minor[i][j] * pivot -
          minor[i][k] * minor[k][j];
        assert.equal(numerator % previous, 0n, 'Bareiss exact division');
        minor[i][j] = numerator / previous;
      }
      minor[i][k] = 0n;
    }
    previous = pivot;
  }
  // If a binary palette contains 40%-60% of the original pixels in
  // each class, its cross-color edge count is at least ceil(5525.28).
  const minBalancedCut = Number((108n * N + 124n) / 125n);
  assert.equal(minBalancedCut, 5526);
  const minShuffleBoundaryFraction = 3.6 * (6395 - 1) /
    (2 * (hEdges.length + vEdges.length));
  assert.ok(minShuffleBoundaryFraction > 0.91);
  return {
    symbolCount: frequency.length,
    proofMinorCount: 28,
    minShuffleBoundaryFraction,
    maxBinarySameEdgesBalanced: hEdges.length + vEdges.length - minBalancedCut
  };
}
const paletteProofs = candidates.map(proveSecretBinaryPalette);
assert.deepEqual(paletteProofs.map(x => x.maxBinarySameEdgesBalanced), [7094, 7094]);

// A non-binary arbitrary real intensity assignment tests the strict
// generalization: H is PSD for ALL real vectors, not only binary cuts.
function scalarEnergy(data,colors) {
  const present=data.filter(x=>x!==null).map(x=>colors[x]);
  const n=present.length,mean=present.reduce((s,x)=>s+x,0)/n;
  const variance=present.reduce((s,x)=>s+(x-mean)**2,0)/n;
  assert.ok(variance>0);
  let energy=0;
  for(const i of hEdges)energy+=(colors[data[i]]-colors[data[i+1]])**2;
  for(const i of vEdges)energy+=(colors[data[i]]-colors[data[i+80]])**2;
  const expected=2*(hEdges.length+vEdges.length)*n/(n-1)*variance;
  const floor=3.6*(n-1)/(2*(hEdges.length+vEdges.length));
  return {ratio:energy/expected,certifiedLowerBound:floor};
}
const realPalette=Array.from({length:29},(_,i)=>
  Math.sin(.37*(i+1))+Math.cos(1.91*(i+1)));
const realPaletteOriginal=candidates.map(v=>scalarEnergy(v,realPalette));
assert.ok(realPaletteOriginal.every(x=>x.ratio+1e-9>=x.certifiedLowerBound));

// Positive control: inject a spatially coherent 10x10 block image
// into the same exact five-hole geometry, then encrypt with the source pad.
const plant = B.map((v, i) => v === null ? null :
  (7 * Math.floor(i / 800) + 11 * Math.floor((i % 80) / 10)) % 29);
const encrypted = plant.map((v, i) => v === null ? null : mod29(v + Afield[i]));
const replay = encrypted.map((v, i) => v === null ? null : mod29(v - Afield[i]));
assert.deepEqual(replay, plant);
assert.ok(adjacent(replay).total > 10000);
const plantedBinary = replay.map(x => x === null ? null : Number(x >= 14));
const plantedPresent = plantedBinary.filter(x => x !== null);
const plantedBlack = plantedPresent.reduce((sum, x) => sum + x, 0);
const plantedQ = plantedBlack / plantedPresent.length;
let plantedCut = 0;
for (const i of hEdges) plantedCut += Number(plantedBinary[i] !== plantedBinary[i + 1]);
for (const i of vEdges) plantedCut += Number(plantedBinary[i] !== plantedBinary[i + 80]);
const plantedExpectedCut = 2 * (hEdges.length + vEdges.length) *
  6395 / 6394 * plantedQ * (1 - plantedQ);
assert.ok(plantedCut / plantedExpectedCut < 0.2,
  'coherent planted image must violate original all-secret palette bound');

for (let i = 0; i < B.length; i++) {
  if (B[i] !== null) {
    assert.equal(mod29(candidates[0][i] + Afield[i]), B[i]);
    assert.equal(mod29(candidates[1][i] - Afield[i]), B[i]);
  }
}
console.log(JSON.stringify({
  source: 'LP2 p0-p55 original GP29; p7 GF81 field; 5 actual printed labels',
  fieldGeneratorOrder: powers.length,
  edgeCount: hEdges.length + vEdges.length,
  candidates: summary,
  secretPaletteProofs: paletteProofs,
  realGrayscalePaletteWitnesses: realPaletteOriginal,
  plantMatchedEdges: adjacent(replay).total,
  plantedBinaryCut: plantedCut,
  plantedBinaryShuffleExpectation: plantedExpectedCut,
  conclusion: 'No direct GP29 spatial-raster signal in these two fixed field-source pads'
}, null, 2));
console.log('PASS: original-source GF81 bookend spatial receiver and planted image');
