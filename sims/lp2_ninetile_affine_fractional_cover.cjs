"use strict";

/**
 * Exact original-LP2 affine/D4 all-secret equality bound via fractional cover.
 *
 * Motivated by 6561 = 9*(27^2), with the first 729 runes covering
 * exactly physical LP2 pages 0..2. Under the tested architecture
 *
 *   C_b[pi_b(u)] = S_u[P_b[u]] + a_b mod 29
 *
 * each tile b may use any D4 orientation pi_b, any unknown fixed output
 * Caesar offset a_b and each of 729 positions has an independent and
 * otherwise arbitrary secret 29-symbol permutation S_u.
 *
 * Pairwise differences and exact 12-triangle decomposition provide a
 * source-only global upper bound on native plaintext equality pairs.
 * All cipher keys, including all 729 unknown S-boxes, are covered.
 *
 * Run: node sims/lp2_ninetile_d4_caesar_sbox_gate.cjs
 * Requires Node.js >= 18, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const originalPages = corpus.pages.filter((page) =>
  page.status === "unsolved" && page.indices.length > 0);
const full = originalPages.flatMap((page) => page.indices);
assert.equal(full.length, 12956);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.slice(0, 3).reduce((sum, page) =>
  sum + page.indices.length, 0), 729);
assert.deepEqual(full.slice(6555, 6561), full.slice(12950));
const SIZE = 27, TILE = SIZE * SIZE, COUNT = 9, MOD = 29;
const original = Array.from({length: COUNT}, (_, i) =>
  full.slice(i * TILE, (i + 1) * TILE));
assert.equal(original.flat().length, 6561);

/** @param {number} glyph @returns {number} */
function mod29(glyph) {
  return ((glyph % MOD) + MOD) % MOD;
}

/**
 * The complete D4 group on physical tile coordinates.
 * Bit 2 transposes; bits 0 and 1 flip horizontal/vertical indices.
 * @returns {number[][]}
 */
function orientationMaps() {
  return Array.from({length: 8}, (_, g) =>
    Array.from({length: TILE}, (_, t) => {
      let row = Math.floor(t / SIZE), column = t % SIZE;
      if (g & 4) [row, column] = [column, row];
      if (g & 1) row = SIZE - row - 1;
      if (g & 2) column = SIZE - column - 1;
      return row * SIZE + column;
    }));
}
const maps = orientationMaps();

/**
 * Compose gk after inverse(gj), so comparisons may fix one tile's
 * orientation and rotate only the other, without loss of generality.
 * @returns {number[][]}
 */
function relativeOrientations() {
  const result = Array.from({length: 8}, () => Array(8).fill(-1));
  for (let g = 0; g < 8; g++) {
    const inverse = new Uint16Array(TILE);
    for (let i = 0; i < TILE; i++) inverse[maps[g][i]] = i;
    for (let h = 0; h < 8; h++) {
      const composite = Array.from({length: TILE}, (_, i) =>
        maps[h][inverse[i]]);
      const position = maps.findIndex((candidate) =>
        candidate.every((value, i) => value === composite[i]));
      assert.ok(position >= 0, "D4 closure");
      result[g][h] = position;
    }
  }
  return result;
}
const rel = relativeOrientations();

/**
 * Affine-plane lines of order three partition all 36 edges of K9 into
 * 12 triangles with no overlapping edges. This supplies a rigorous,
 * globally valid upper bound even when triangle optima are incompatible.
 * @returns {number[][]}
 */
function triangleEdgePartition() {
  const rows = [], edges = new Set();
  for (let intercept = 0; intercept < 3; intercept++) {
    for (let slope = 0; slope < 4; slope++) {
      const ids = [];
      for (let x = 0; x < 3; x++) {
        const row = slope === 3 ? intercept : x;
        const column = slope === 3 ? x : (intercept + slope * x) % 3;
        ids.push(3 * row + column);
      }
      ids.sort((a, b) => a - b);
      for (let a = 0; a < 3; a++) {
        for (let b = a + 1; b < 3; b++) {
          const edge = ids[a] + ":" + ids[b];
          assert.ok(!edges.has(edge), "Triangle edges must be disjoint");
          edges.add(edge);
        }
      }
      rows.push(ids);
    }
  }
  assert.equal(rows.length, 12);
  assert.equal(edges.size, 36);
  return rows;
}
const triangles = triangleEdgePartition();


const allTriples = [];
for (let a = 0; a < COUNT; a++)
  for (let b = a + 1; b < COUNT; b++)
    for (let c = b + 1; c < COUNT; c++)
      allTriples.push([a, b, c]);
assert.equal(allTriples.length, 84);

/** Exact original-input all-secret triple maxima with compatible affine keys. */
function affineOutputCapacity(tiles) {
  const mod = MOD;
  const mPerOrientation = 28 * mod, nModes = 8 * mPerOrientation;
  const inverse = Array(mod).fill(0);
  for (let a = 1; a < mod; a++) {
    for (let b = 1; b < mod; b++) {
      if ((a * b) % mod === 1) { inverse[a] = b; break; }
    }
    assert.ok(inverse[a] > 0);
  }
  const modes = Array.from({length: nModes}, (_, index) => ({
    g: Math.floor(index / mPerOrientation),
    mul: 1 + Math.floor((index % mPerOrientation) / mod),
    add: index % mod
  }));
  const w = Array.from({length: COUNT}, () => Array(COUNT).fill(null));
  for (let a = 0; a < COUNT; a++) {
    for (let b = a + 1; b < COUNT; b++) {
      const counts = new Uint16Array(nModes);
      for (let g = 0; g < 8; g++) {
        for (let mul = 1; mul < mod; mul++) {
          const prefix = g * mPerOrientation + (mul - 1) * mod;
          for (let i = 0; i < TILE; i++) {
            const j = maps[g][i];
            counts[prefix + mod29(tiles[b][j] - mul * tiles[a][i])]++;
          }
        }
      }
      w[a][b] = counts;
    }
  }
  let edgeUpper = 0;
  for (let a = 0; a < COUNT; a++) {
    for (let b = a + 1; b < COUNT; b++) edgeUpper += Math.max(...w[a][b]);
  }
  let triangleUpper = 0, exactCandidatesEvaluated = 0;
  const pieces = [];
  for (const [a, b, c] of allTriples) {
    const ab = w[a][b], ac = w[a][c], bc = w[b][c];
    const orderB = Array.from({length: nModes}, (_, index) => index)
      .sort((x, y) => ab[y] - ab[x]);
    const orderC = Array.from({length: nModes}, (_, index) => index)
      .sort((x, y) => ac[y] - ac[x]);
    const bcGlobal = Math.max(...bc);
    let best = 0, witness = null;
    for (const bx of orderB) {
      if (ab[bx] + ac[orderC[0]] + bcGlobal <= best) break;
      const B = modes[bx], inverseB = inverse[B.mul];
      for (const cy of orderC) {
        if (ab[bx] + ac[cy] + bcGlobal <= best) break;
        const C = modes[cy], relativeMultiplier = C.mul * inverseB % mod;
        const relativeAdd = mod29(C.add - relativeMultiplier * B.add);
        const relativeOrientation = rel[B.g][C.g];
        const candidate = ab[bx] + ac[cy] +
          bc[relativeOrientation * mPerOrientation +
          (relativeMultiplier - 1) * mod + relativeAdd];
        exactCandidatesEvaluated++;
        if (candidate > best) {
          best = candidate;
          witness = {B: bx, C: cy, relativeOrientation,
            relativeMultiplier, relativeAdd};
        }
      }
    }
    pieces.push({tiles: [a, b, c], upper: best, maximizingAssignment: witness});
    triangleUpper += best;
  }
  // All 84 triples each overlap sevenfold; aggregate after edge-cover weights.
  return {pairwiseAffineUpper: edgeUpper,
    triangleAffineUpper: triangleUpper, exactCandidatesEvaluated,
    triangleCertificate: pieces};
}


/**
 * Exact rational certificate: the 28 nonzero quarter weights cover each
 * of the 36 tile-to-tile edges with total weight precisely 4 quarters.
 * Upper = sum(weight * sharp triangle upper)/4.
 */
const cover = [
  ["012",2],["014",2],["026",2],["036",1],["037",1],["038",2],
  ["045",1],["048",1],["057",3],["068",1],["127",2],["134",1],
  ["136",3],["145",1],["157",1],["158",2],["168",1],["178",1],
  ["234",1],["235",2],["237",1],["248",3],["256",2],["278",1],
  ["345",2],["378",2],["467",4],["568",2]
];
const cert = affineOutputCapacity(original);
const maxima = new Map(cert.triangleCertificate.map(t =>
  [t.tiles.join(""), t.upper]));
assert.equal(maxima.size, 84);
const edges = [];
for (let a = 0; a < COUNT; a++)
  for (let b = a + 1; b < COUNT; b++) edges.push([a,b]);
assert.equal(edges.length, 36);
for (const [a,b] of edges) {
  const mass = cover.reduce((s,[t,w]) =>
    s + (t.includes(String(a)) && t.includes(String(b)) ? w : 0), 0);
  assert.equal(mass, 4, "fractional-edge cover of " + a + b);
}
const quarterUnits = cover.reduce((s,[t,w]) => s + w * maxima.get(t),0);
assert.equal(quarterUnits, 6045);
const upper = quarterUnits / 4;
assert.equal(upper, 1511.25);
/** Dual LP certificate in eighths, edge order (0,1),(0,2),...,(7,8). */
const dual8 = [
  335,343,342,340,353,336,330,330,322,321,333,320,
  317,347,317,341,361,344,329,355,325,330,347,346,
  336,336,339,366,332,322,319,301,379,326,334,336
];
const prices = new Map(edges.map((e,i) => [e.join(""), dual8[i]]));
for (const [a,b,c] of allTriples)
  assert.ok(prices.get("" + a+b) + prices.get("" + a+c) +
    prices.get("" + b+c) <= 8 * maxima.get("" + a+b+c));
assert.equal(dual8.reduce((a,b)=>a+b,0), 12090);
assert.equal(upper,12090/8); // exact matching primal/dual witnesses
const oldUpper = triangles.reduce((s,t)=>s+maxima.get(t.join("")),0);
assert.equal(oldUpper,1524);
console.log(JSON.stringify({
  sourceRunes: full.length, tileRunes: COUNT*TILE, triangles: allTriples.length,
  originalFixed12TriangleUpper: oldUpper,
  exactFractionalUpper: upper, integerEqualityUpper: Math.floor(upper),
  quarterWeights: cover, dualEighths: dual8,
  tripleMaxima: Object.fromEntries(maxima),
  interpretation: "Exact conditional source-original upper over arbitrary shared per-coordinate S-boxes, independent tile D4 and affine output transforms. No authenticated LP2 cipher, plaintext or key recovered."
},null,2));
