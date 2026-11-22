'use strict';
/**
 * LP2 p27/p55 six-rune repeat, first 81^2 ciphertext runes, and the
 * 80^2 successor register completed by five actual numbered text labels.
 * Original-text independent all-secret fixed binary-palette image gate.
 * Read-only, standalone, Windows 11 / Node.js 22 / CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const all = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
assert.equal(all.length, 12956);
const A = all.slice(0, 6561);
const suffix = all.slice(6561);
assert.deepEqual([A.length, suffix.length], [81 ** 2, 6395]);
// These are the five original Arabic numeral label positions in
// the ordinal 80x80 completion, not invented cipher-symbol digits.
const printedNumeralSlots = [2244, 2384, 2476, 2575, 2672];
const holes = new Set(printedNumeralSlots);
const B = Array(6400).fill(null);
for (let i = 0, j = 0; i < 6400; i++) {
  if (!holes.has(i)) B[i] = suffix[j++];
}
assert.equal(B.filter(x => x === null).length, 5);
assert.deepEqual(all.slice(6555, 6561), all.slice(-6));

/**
 * Exact finite certificate against EVERY secret fixed 29-rune to binary
 * palette, with no class balance assumption or fitted rune assignments.
 *
 * For the 29 symbol bins, f[a] counts actual pixels, L is the weighted
 * adjacent-symbol graph Laplacian, N the actual pixel count, m the number
 * of valid horizontal and vertical pixel-neighbor edges, and b[a] an
 * arbitrary secret bit assigned to rune a.
 *
 * The exact integer H=5*N*L -18*N*diag(f)+18*f*f^T is symmetric and has
 * zero row sums. Proving all 28 leading principal minors of its upper-left
 * cofactor positive proves H positive semidefinite (Sylvester's criterion).
 * Therefore any binary palette with black fraction q obeys
 *    b^T*L*b >= (18/5)*N*q*(1-q).
 * Under a fully shuffled binary pixel map preserving both class counts
 * and the same five-hole geometry, E[boundaries] =
 *    2*m*N/(N-1)*q*(1-q).
 * Thus any nonconstant hidden palette retains at least
 *    (18/5)*(N-1)/(2*m)
 * of the random-placement expected binary color boundaries.
 *
 * @param {(number|null)[]} image Original or independently planted pixels.
 * @param {number} width Original square's row width (81 or 80).
 * @returns {{
 *   N:number,edges:number,identicalRunicEdges:number,certificate:boolean,
 *   firstFailedMinor:number|null,minBoundaryRatio:number|null,
 *   maxEqualBinaryEdgesForBalancedPalette:number|null}}
 */
function analyze(image, width) {
  assert.equal(image.length, width * width);
  const N = image.reduce((sum, x) => sum + Number(x !== null), 0);
  const f = Array(29).fill(0);
  const L = Array.from({length:29}, () => Array(29).fill(0));
  for (const x of image) if (x !== null) f[x]++;
  assert.equal(f.reduce((a, b) => a + b, 0), N);
  let m = 0, same = 0;
  const edges = [];
  for (let i = 0; i < image.length; i++) {
    const neighbors = [i % width === width - 1 ? -1 : i + 1,
      i < image.length - width ? i + width : -1];
    for (const j of neighbors) {
      if (j < 0 || image[i] === null || image[j] === null) continue;
      edges.push([i, j]);
      m++;
      const a = image[i], b = image[j];
      if (a === b) { same++; continue; }
      L[a][a]++;
      L[b][b]++;
      L[a][b]--;
      L[b][a]--;
    }
  }
  const NB = BigInt(N);
  const H = Array.from({length:29}, (_, i) => Array.from({length:29},
    (_, j) => 5n * NB * BigInt(L[i][j]) -
      (i === j ? 18n * NB * BigInt(f[i]) : 0n) +
      18n * BigInt(f[i]) * BigInt(f[j])));
  assert.ok(H.every(row =>
    row.reduce((sum, x) => sum + x, 0n) === 0n), 'H null vector');
  const minor = H.slice(0, 28).map(row => row.slice(0, 28));
  let prev = 1n, firstFailed = null;
  for (let k = 0; k < 28; k++) {
    const pivot = minor[k][k];
    if (pivot <= 0n) {firstFailed = k + 1; break;}
    for (let i = k + 1; i < 28; i++) {
      for (let j = k + 1; j < 28; j++) {
        const numerator = minor[i][j] * pivot -
          minor[i][k] * minor[k][j];
        assert.equal(numerator % prev, 0n, 'exact Bareiss division');
        minor[i][j] = numerator / prev;
      }
      minor[i][k] = 0n;
    }
    prev = pivot;
  }
  const certificate = firstFailed === null;
  const minimumBoundaryFraction = 3.6 * (N - 1) / (2 * m);
  const minBalancedBoundaries = Math.ceil(3.6 * N * .24);
  return {
    N, edges:m, identicalRunicEdges:same,
    certificate, firstFailedMinor:firstFailed,
    minBoundaryRatio:certificate ? minimumBoundaryFraction : null,
    maxEqualBinaryEdgesForBalancedPalette:certificate ?
      m - minBalancedBoundaries : null
  };
}
const original = [
  {name:'first original 81x81', result:analyze(A,81)},
  {name:'second original 80x80 plus five holes', result:analyze(B,80)}
];
assert.deepEqual(original.map(x => [x.result.N, x.result.edges,
  x.result.identicalRunicEdges, x.result.certificate]), [
  [6561, 12960, 256, true],
  [6395, 12620, 263, true]
]);
assert.deepEqual(original.map(x => x.result.maxEqualBinaryEdgesForBalancedPalette),
  [7291, 7094]);

// Positive plant: a 9x9 (A) or 8x8 (B) chessboard of large contiguous
// 9x9 or 10x10 binary patches, masked by the real numeral holes, with
// individual visible rune symbols chosen pseudorandomly from 14/15
// distinct GP29 bins for black/white. Color is NOT the literal rune value;
// a secret fixed >=14 palette reveals it. Test is intentionally not a
// plain identical-GP-symbol image.
let seed = 0x33012014;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plants = [[A,81,9], [B,80,10]].map(([arr,width,block]) => {
  const planted = arr.map((v,i) => {
    if (v === null) return null;
    const color = (Math.floor(i / (width * block)) +
      Math.floor((i % width) / block)) % 2;
    return color ? 14 + random32() % 15 : random32() % 14;
  });
  const positive = analyze(planted, width);
  const binary = planted.map(x => x === null ? null : Number(x >= 14));
  const present = binary.filter(x => x !== null);
  const q = present.reduce((a,b)=>a+b,0) / present.length;
  let boundaries = 0, edges = 0;
  for (let i=0;i<binary.length;i++) {
    const neighbors = [i%width===width-1?-1:i+1,
      i<binary.length-width?i+width:-1];
    for (const j of neighbors) {
      if (j<0||binary[i]===null||binary[j]===null)continue;
      edges++;
      boundaries += Number(binary[i]!==binary[j]);
    }
  }
  const nullExpected=2*edges*present.length/(present.length-1)*q*(1-q);
  assert.ok(boundaries / nullExpected < .25);
  assert.equal(positive.certificate,false,
    'all-secret original-image exclusion must not falsely reject a plant');
  return {width,binaryBoundaries:boundaries,
    expectedShuffleBoundaries:nullExpected,
    relativeBoundaries:boundaries/nullExpected,
    exactOriginalStyleCertificate:positive.certificate};
});
console.log(JSON.stringify({
  source:'Entire original LP2 p0-p55 GP29 original bookend registers',
  repeatedSourceSix:all.slice(6555,6561).map(i=>corpus.translit[i]).join(''),
  original,plants,
  decision:'Neither literal 81x81 nor 80x80 source grid admits a spatially coherent image under any globally fixed 29-symbol to binary palette; nonlinear or position-dependent ciphers remain open'
},null,2));
console.log('PASS: both original source direct binary-palette PSD proofs and hidden-palette planted controls');
