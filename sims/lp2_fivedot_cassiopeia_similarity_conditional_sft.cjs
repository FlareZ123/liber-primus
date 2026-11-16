'use strict';

/** @typedef {[number, number]} Point */
/** @type {Point[]} */
const dots = [[873, 2517], [921, 2708], [1104, 2447], [1408, 2747], [1604, 2686]];

/** @type {[number, number, number, number, number][]} */
const stars = [
  [0, 9, 10.7, 59 + 8 / 60 + 59 / 3600, 2.27], // Caph (beta)
  [0, 40, 30.5, 56 + 32 / 60 + 14 / 3600, 2.23], // Schedar (alpha)
  [0, 56, 42.5, 60 + 43 / 60, 2.47], // Gamma
  [1, 25, 49, 60 + 14 / 60 + 7 / 3600, 2.68], // Ruchbah (delta)
  [1, 54, 23.7, 63 + 40 / 60 + 12 / 3600, 3.38], // Segin (epsilon)
];
const meanDec = stars.reduce((sum, star) => sum + star[3], 0) / stars.length;
const cosDec = Math.cos(meanDec * Math.PI / 180);
const sky = stars.map(([hour, minute, second, dec]) => [
  15 * (hour + minute / 60 + second / 3600) * cosDec, dec
]);

/** @param {Point[]} points @returns {Point[]} */
function center(points) {
  const mx = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const my = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return points.map(([x, y]) => [x - mx, y - my]);
}

/**
 * Optimal centered 2D similarity fit with optional reflection.
 * Normalized RMS residual is invariant to scale, translation and rotation.
 * @param {Point[]} source
 * @param {Point[]} target
 * @returns {number}
 */
function similarityError(source, target) {
  const x = center(source);
  const y = center(target);
  const xx = x.reduce((sum, point) => sum + point[0] ** 2 + point[1] ** 2, 0);
  const yy = y.reduce((sum, point) => sum + point[0] ** 2 + point[1] ** 2, 0);
  let best = Infinity;
  for (const reflection of [1, -1]) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < x.length; i++) {
      const sx = reflection * x[i][0];
      const sy = x[i][1];
      const tx = y[i][0];
      const ty = y[i][1];
      a += sx * tx + sy * ty;
      b += sx * ty - sy * tx;
    }
    const norm = Math.hypot(a, b);
    best = Math.min(best, Math.sqrt(Math.max(0, 1 - norm ** 2 / (xx * yy))));
  }
  return best;
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, i) =>
    permutations(values.filter((_, j) => j !== i)).map(tail => [value, ...tail]));
}

const original = similarityError(sky, dots);
const controls = permutations(dots.map(point => point[1]))
  .map(ys => similarityError(sky, dots.map((point, i) => [point[0], ys[i]])));
const asGoodOrBetter = controls.filter(value => value <= original + 1e-9).length;
console.log(JSON.stringify({
  source: 'Five conventional Cassiopeia W stars, J2000 RA/Dec, RA-increasing order',
  originalNormalizedRmsError: original,
  conditionalYPermutations: controls.length,
  asGoodOrBetter,
  conditionalTail: asGoodOrBetter / controls.length
}, null, 2));

if (controls.length !== 120 ||
    asGoodOrBetter !== 17 ||
    Math.abs(original - 0.2667603220060425) > 1e-8) {
  throw new Error('Original-p56-to-Cassiopeia geometry calibration failed');
}
