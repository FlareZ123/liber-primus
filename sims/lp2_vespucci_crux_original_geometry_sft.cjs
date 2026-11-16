'use strict';

/**
 * Original p56 five-disc source and historically published Crux five-star chart.
 * Decision scope: one 2D rigid shape with optional mirror, scale and rotation.
 * All 5! star-to-disc assignments are allowed, favoring the star hypothesis.
 * No free per-point warp, invented key, or plaintext inference.
 * Reproduce: node sims/lp2_vespucci_crux_original_geometry_sft.cjs
 */

/** @typedef {[number, number]} Point */
/** @typedef {[number, number, number, number, number, number]} AstroPoint */

/** @type {Point[]} */
const dots = [[873, 2517], [921, 2708], [1104, 2447], [1408, 2747], [1604, 2686]];

// Alpha1, beta, gamma1, delta, epsilon Crux. RA h/m/s; negative declination d/m/s.
// Source: https://naedine.astrolab.ru/sites/default/files/books/farinacci.pdf
/** @type {AstroPoint[]} */
const stars = [
  [12, 26, 35.9, 63, 5, 56],
  [12, 47, 43.3, 59, 41, 19],
  [12, 31, 9.9, 57, 6, 47],
  [12, 15, 8.6, 58, 44, 56],
  [12, 21, 21.5, 60, 24, 4]
];

/** @param {AstroPoint} value @returns {Point} */
function angles(value) {
  const [h, min, sec, deg, arcmin, arcsec] = value;
  return [(h + min / 60 + sec / 3600) * 15 * Math.PI / 180,
    -(deg + arcmin / 60 + arcsec / 3600) * Math.PI / 180];
}

/** @param {Point[]} positions @returns {Point[]} */
function gnomonic(positions) {
  const ra0 = positions.reduce((s, a) => s + a[0], 0) / positions.length;
  const dec0 = positions.reduce((s, a) => s + a[1], 0) / positions.length;
  return positions.map(([ra, dec]) => {
    const cosc = Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(ra - ra0);
    return [Math.cos(dec) * Math.sin(ra - ra0) / cosc,
      (Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(ra - ra0)) / cosc];
  });
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((n, i) => permutations(values.filter((_, k) => k !== i))
    .map(rest => [n, ...rest]));
}

/** @param {Point[]} points @returns {Point[]} */
function normalized(points) {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
  const centered = points.map(([x, y]) => [x - cx, y - cy]);
  const size = Math.hypot(...centered.flat());
  return centered.map(([x, y]) => [x / size, y / size]);
}

/**
 * Minimum normalized shape RMS under translation, isotropic scale, rotation,
 * mirror and all five-star correspondences (generously overfits astronomy).
 * @param {Point[]} observed
 * @param {Point[]} sky
 * @param {number[][]} orders
 * @returns {number}
 */
function bestShapeError(observed, sky, orders) {
  const p = normalized(observed);
  const s = normalized(sky);
  let maxCorrelation = 0;
  for (const order of orders) {
    for (const reflect of [1, -1]) {
      let crossReal = 0;
      let crossImag = 0;
      for (let i = 0; i < 5; i++) {
        const [x, y] = p[i];
        const [u, v] = s[order[i]];
        crossReal += reflect * x * u + y * v;
        crossImag += reflect * x * v - y * u;
      }
      maxCorrelation = Math.max(maxCorrelation, Math.hypot(crossReal, crossImag));
    }
  }
  return Math.sqrt(Math.max(0, 1 - maxCorrelation ** 2));
}

const sky = gnomonic(stars.map(angles));
const orders = permutations([0, 1, 2, 3, 4]);
const originalError = bestShapeError(dots, sky, orders);

// Condition on physical X values and the observed Y multiset; reassign only Y.
const nullErrors = permutations(dots.map(p => p[1])).map(ys =>
  bestShapeError(dots.map((p, i) => [p[0], ys[i]]), sky, orders));
const asGood = nullErrors.filter(e => e <= originalError + 1e-10).length;
console.log(JSON.stringify({
  source: 'LP2 p56 five-disc stencil versus Crux alpha/beta/gamma/delta/epsilon',
  mapping: 'J2000 gnomonic; all 120 labels; best mirrored/nonmirrored similarity',
  originalNormalizedRmsError: originalError,
  fixedXYConditionalPermutations: nullErrors.length,
  nullAtLeastAsGood: asGood,
  nullTail: asGood / nullErrors.length,
  limitation: 'The period Mundus Novus figure has three and six stars, not five, and no sourced key.'
}, null, 2));

if (nullErrors.length !== 120 || asGood !== 36 ||
    Math.abs(originalError - 0.4086982154863275) > 1e-10) {
  throw new Error('Original geometry calibration did not reproduce');
}
