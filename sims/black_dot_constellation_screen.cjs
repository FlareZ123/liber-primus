'use strict';

/**
 * Five large black dots on LP2 scans 24/40/73 resemble a shared stencil.
 * A historical third-party interview speculates that these dots depict
 * constellations. Test that claim with an explicitly finite geometric family
 * and an exhaustive x/y-marginal-preserving coordinate-shuffle control.
 *
 * Input astronomy data: Olaf Frohn, d3-celestial constellation lines,
 * BSD-3-Clause, retained at resources/control/d3-celestial-constellation-lines.json.
 *
 * Run: node sims/black_dot_constellation_screen.cjs
 * @module black_dot_constellation_screen
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const geo = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/control/d3-celestial-constellation-lines.json'), 'utf8'));
const source = [
  [796.941, 3105.773],
  [992.500, 3166.637],
  [1296.931, 2866.789],
  [1479.265, 3127.500],
  [1527.153, 2936.153]
];
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

/**
 * @param {number[]} a
 * @returns {number[][]}
 */
function permutations(a) {
  return a.length
    ? a.flatMap((v, i) => permutations([
      ...a.slice(0, i), ...a.slice(i + 1)
    ]).map((tail) => [v, ...tail]))
    : [[]];
}
const permutations5 = permutations([0, 1, 2, 3, 4]);
assert.equal(permutations5.length, 120);

/**
 * Enumerate all unique five-vertex simple paths in all 89 constellation
 * graphics. For each, consider every assignment of its five stars to the
 * source dots and both planar handedness choices. Rotation and isotropic
 * scale are subsequently optimized analytically.
 * @returns {{layouts:Array<{a:Float64Array,which:number}>,
 *            names:Array<{id:string,path:number[],coords:number[][]}>,
 *            count:number}}
 */
function makeFamily() {
  /** @type {Array<{a:Float64Array,which:number}>} */
  const layouts = [];
  /** @type {Array<{id:string,path:number[],coords:number[][]}>} */
  const names = [];
  let count = 0;
  for (const feature of geo.features) {
    /** @type {number[][]} */
    const points = [];
    const dictionary = new Map();
    /** @type {Array<Set<number>>} */
    const adjacent = [];
    const getId = (point) => {
      const key = point.join(',');
      if (!dictionary.has(key)) {
        dictionary.set(key, points.length);
        points.push(point);
        adjacent.push(new Set());
      }
      return dictionary.get(key);
    };
    for (const line of feature.geometry.coordinates) {
      for (let j = 0; j + 1 < line.length; j++) {
        const a = getId(line[j]);
        const b = getId(line[j + 1]);
        adjacent[a].add(b);
        adjacent[b].add(a);
      }
    }
    const seen = new Set();
    /** @param {number[]} route */
    function dfs(route) {
      if (route.length === 5) {
        const key = [...route].sort((a, b) => a - b).join(',');
        if (seen.has(key)) return;
        seen.add(key);
        const coords = route.map((i) => points[i]);
        // Local equirectangular tangent approximation at mean declination.
        const dec = mean(coords.map((p) => p[1]));
        let xx = coords.map((p) => p[0] * Math.cos(dec * Math.PI / 180));
        let yy = coords.map((p) => p[1]);
        const mx = mean(xx), my = mean(yy);
        xx = xx.map((v) => v - mx);
        yy = yy.map((v) => v - my);
        const norm = Math.hypot(...xx, ...yy);
        if (norm === 0) return;
        xx = xx.map((v) => v / norm);
        yy = yy.map((v) => v / norm);
        const which = names.length;
        names.push({id: feature.id, path: route, coords});
        for (const flip of [1, -1]) {
          for (const order of permutations5) {
            const a = new Float64Array(10);
            for (let k = 0; k < 5; k++) {
              a[k] = xx[order[k]];
              a[5 + k] = flip * yy[order[k]];
            }
            layouts.push({a, which});
          }
        }
        return;
      }
      for (const b of adjacent[route[route.length - 1]]) {
        if (!route.includes(b)) dfs([...route, b]);
      }
    }
    for (let i = 0; i < points.length; i++) dfs([i]);
    count += seen.size;
  }
  return {layouts, names, count};
}

/**
 * @param {number[]} x0
 * @param {Array<{a:Float64Array,which:number}>} layouts
 * @param {number[]} y
 * @returns {{resid:number,bestId:number}}
 */
function score(x0, layouts, y) {
  const mx = mean(x0), my = mean(y);
  const x = x0.map((v) => v - mx);
  const yy = y.map((v) => v - my);
  const norm = Math.hypot(...x, ...yy);
  const tx = x.map((v) => v / norm);
  const ty = yy.map((v) => v / norm);
  let bestC = -1, bestId = -1;
  for (const layout of layouts) {
    const v = layout.a;
    let a = 0, b = 0;
    for (let k = 0; k < 5; k++) {
      const xx = v[k], yk = v[5 + k];
      a += xx * tx[k] + yk * ty[k];
      b += xx * ty[k] - yk * tx[k];
    }
    const c = a * a + b * b;
    if (c > bestC) {
      bestC = c;
      bestId = layout.which;
    }
  }
  return {resid: Math.sqrt(Math.max(0, 1 - bestC)), bestId};
}

function run() {
  const {layouts, names, count} = makeFamily();
  assert.equal(geo.features.length, 89);
  assert.equal(count, 879);
  assert.equal(layouts.length, 210960);
  const x = source.map((p) => p[0]);
  const y = source.map((p) => p[1]);
  const actual = score(x, layouts, y);
  const nullScores = permutations5.map(
    (p) => score(x, layouts, p.map((i) => y[i])).resid
  );
  const nLe = nullScores.filter((r) => r <= actual.resid + 1e-12).length;
  const ordered = [...nullScores].sort((a, b) => a - b);
  assert.ok(Math.abs(actual.resid - 0.08185822179212279) < 1e-9);
  assert.equal(nLe, 19);
  assert.equal(names[actual.bestId].id, 'PsA');
  return {
    hypothesis: 'LP2 five-dot source artwork matches a five-star connected asterism',
    family: '89 IAU constellation-line drawings, 879 connected five-star subsets',
    fittedLayouts: layouts.length,
    geometry: '2D approximate equatorial chart, all 5! point assignments, reflection, rotation, scale',
    observed: {...actual, match: names[actual.bestId]},
    null: {
      method: 'exact 120 permutations of original y coordinates, original x fixed',
      n: 120,
      asGoodOrBetter: nLe,
      conditionalP: nLe / 120,
      minimum: ordered[0],
      median: ordered[60],
      maximum: ordered[119]
    },
    verdict: 'No exceptional constellation fit under the stated family and exact conditional null'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {permutations, makeFamily, score, run};
