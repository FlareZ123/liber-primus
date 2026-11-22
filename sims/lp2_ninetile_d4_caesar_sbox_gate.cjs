"use strict";

/**
 * Nine 27x27 LP2 tiles: complete all-secret output-Caesar / D4 / GP29 S-box gate.
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
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");

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

/**
 * For ordered distinct tiles a,b, W[a][b][g*29+d] counts positions
 * where C_b[orientation g of t] - C_a[t] == d modulo29.
 * @param {number[][]} tiles
 * @returns {(Uint16Array|null)[][]}
 */
function histograms(tiles) {
  assert.equal(tiles.length, COUNT);
  for (const tile of tiles) assert.equal(tile.length, TILE);
  const table = Array.from({length: COUNT}, () => Array(COUNT).fill(null));
  for (let a = 0; a < COUNT; a++) {
    for (let b = a + 1; b < COUNT; b++) {
      const frequencies = new Uint16Array(8 * MOD);
      for (let g = 0; g < 8; g++) {
        const m = maps[g];
        for (let i = 0; i < TILE; i++) {
          frequencies[g * MOD + mod29(tiles[b][m[i]] - tiles[a][i])]++;
        }
      }
      for (let g = 0; g < 8; g++) {
        let n = 0;
        for (let d = 0; d < MOD; d++) n += frequencies[g * MOD + d];
        assert.equal(n, TILE, "Each orientation is a permutation");
      }
      table[a][b] = frequencies;
    }
  }
  return table;
}

/**
 * Compute three unconditional outer bounds, plus direct unaligned matches.
 * Triangle bound enumerates all 232^2 relative D4/Caesar assignments
 * per exact K9 triangle. The true nine-tile joint optimum is <= bound.
 * @param {number[][]} tiles
 */
function capacity(tiles) {
  const W = histograms(tiles);
  let aligned = 0, dihedral = 0, independentEdges = 0;
  for (let a = 0; a < COUNT; a++) {
    for (let b = a + 1; b < COUNT; b++) {
      const row = W[a][b];
      aligned += row[0];
      let d4Best = 0, allBest = 0;
      for (let g = 0; g < 8; g++) {
        d4Best = Math.max(d4Best, row[g * MOD]);
        for (let d = 0; d < MOD; d++) {
          allBest = Math.max(allBest, row[g * MOD + d]);
        }
      }
      dihedral += d4Best;
      independentEdges += allBest;
    }
  }
  let triangleBound = 0;
  const triangleCertificate = [];
  for (const [a, b, c] of triangles) {
    let best = -1, assignment = null;
    for (let gb = 0; gb < 8; gb++) {
      for (let sb = 0; sb < MOD; sb++) {
        const ab = W[a][b][gb * MOD + sb];
        for (let gc = 0; gc < 8; gc++) {
          const bcOrientation = rel[gb][gc];
          for (let sc = 0; sc < MOD; sc++) {
            const bcShift = mod29(sc - sb);
            const candidate = ab + W[a][c][gc * MOD + sc] +
              W[b][c][bcOrientation * MOD + bcShift];
            if (candidate > best) {
              best = candidate;
              assignment = {gb, sb, gc, sc};
            }
          }
        }
      }
    }
    assert.ok(best >= 0);
    triangleBound += best;
    triangleCertificate.push({tiles: [a, b, c], upper: best,
      maximizingRelativeAssignment: assignment});
  }
  assert.ok(triangleBound <= independentEdges);
  return {aligned, dihedral, pairwiseD4CaesarUpper: independentEdges,
    triangleD4CaesarUpper: triangleBound, triangleCertificate};
}

/**
 * Count every equality pair at matching coordinates across nine
 * independent native-GP plaintext passages, irrespective of letters.
 * @param {number[][]} tiles
 * @returns {number}
 */
function plainMatches(tiles) {
  let total = 0;
  for (let a = 0; a < COUNT; a++) {
    for (let b = a + 1; b < COUNT; b++) {
      for (let i = 0; i < TILE; i++) total += (tiles[a][i] === tiles[b][i]);
    }
  }
  return total;
}

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Draw nine exactly original-length, pairwise nonoverlapping windows.
 * @param {number[]} text
 * @param {()=>number} rng
 * @returns {number[][]}
 */
function nineWindows(text, rng) {
  assert.ok(text.length > 9 * TILE);
  const offsets = [];
  for (let b = 0; b < COUNT; b++) {
    let chosen = false;
    for (let attempt = 0; attempt < 5000; attempt++) {
      const offset = rng() % (text.length - TILE);
      if (offsets.every((used) => Math.abs(used - offset) >= TILE)) {
        offsets.push(offset);
        chosen = true;
        break;
      }
    }
    assert.ok(chosen, "Could not draw nonoverlapping native windows");
  }
  return offsets.map((offset) => text.slice(offset, offset + TILE));
}

/**
 * Source-language calibration of the bound. No optimization of
 * alphabet keys occurs on GP-English reference text.
 * @param {string} file
 * @param {number} corpusIndex
 * @param {number} observedBound
 */
function calibrate(file, corpusIndex, observedBound) {
  const symbols = toGematria(fs.readFileSync(path.join(ROOT, file), "utf8"));
  const random = xorshift32(3301 + 137 * corpusIndex);
  const scores = [];
  for (let repetition = 0; repetition < 1000; repetition++) {
    scores.push(plainMatches(nineWindows(symbols, random)));
  }
  scores.sort((a, b) => a - b);
  const total = scores.reduce((a, b) => a + b, 0);
  return {source: file, gpRunes: symbols.length, windows: 1000,
    min: scores[0], percentile01: scores[10],
    median: scores[500], max: scores[999], mean: total / 1000,
    noGreaterThanOriginal: scores.filter((score) => score <= observedBound).length};
}

/**
 * Independent hidden D4 + per-tile outer Caesar + 729 unrestricted
 * secret GP29 S-boxes. True-key inversion exactly recovers all 6561 runes.
 * The original-source triangle certificate must admit this plant.
 * @param {number[]} english
 */
function positivePlant(english) {
  const rng = xorshift32(0x35c3a29);
  const clear = nineWindows(english, rng);
  const plainEquality = plainMatches(clear);
  const orientation = Array.from({length: COUNT}, () => rng() % 8);
  const offset = Array.from({length: COUNT}, () => rng() % MOD);
  const cipher = Array.from({length: COUNT}, () => Array(TILE).fill(-1));
  const keys = [];
  for (let u = 0; u < TILE; u++) {
    const S = Array.from({length: MOD}, (_, i) => i);
    for (let i = MOD - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [S[i], S[j]] = [S[j], S[i]];
    }
    const inverse = new Array(MOD);
    S.forEach((x, i) => { inverse[x] = i; });
    keys.push({S, inverse});
    for (let b = 0; b < COUNT; b++) {
      const position = maps[orientation[b]][u];
      cipher[b][position] = mod29(S[clear[b][u]] + offset[b]);
    }
  }
  const recovered = Array.from({length: COUNT}, () => Array(TILE).fill(-1));
  for (let b = 0; b < COUNT; b++) {
    for (let u = 0; u < TILE; u++) {
      const position = maps[orientation[b]][u];
      const unbiased = mod29(cipher[b][position] - offset[b]);
      recovered[b][u] = keys[u].inverse[unbiased];
      assert.equal(mod29(keys[u].S[recovered[b][u]] + offset[b]),
        cipher[b][position]);
    }
  }
  assert.deepEqual(recovered, clear, "All GP plaintext must recover exactly");
  const witness = capacity(cipher);
  assert.ok(witness.triangleD4CaesarUpper >= plainEquality,
    "Original-independent positive should pass exact global ceiling");
  return {cipherRunes: COUNT * TILE, recoveredPlainRunes: recovered.flat().length,
    unknownSBoxes: TILE, secretTileOrientations: orientation,
    secretTileOutputOffsets: offset, nativePlainEqualities: plainEquality,
    cipherTriangleUpper: witness.triangleD4CaesarUpper,
    exactReencryption: true};
}


/**
 * More general output-affine escape:
 * C_b[pi_b(u)] = a_b * S_u[P_b[u]] + z_b (mod29), a_b != 0.
 * Exact 12-triangle bound. Unlike the output-Caesar-only result,
 * this broader bound need not reject source-native GP-English.
 * @param {number[][]} tiles
 */
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
  for (const [a, b, c] of triangles) {
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
  assert.ok(triangleUpper <= edgeUpper);
  return {pairwiseAffineUpper: edgeUpper,
    triangleAffineUpper: triangleUpper, exactCandidatesEvaluated,
    triangleCertificate: pieces};
}

/**
 * Strongest affine variant positive with nonzero secret output
 * multipliers on each tile (including values other than 1).
 * @param {number[]} english
 */
function positiveAffinePlant(english) {
  const rng = xorshift32(0xa35f1e);
  const clear = nineWindows(english, rng), expectedEquality = plainMatches(clear);
  const orientation = Array.from({length: COUNT}, () => rng() % 8);
  const multiplier = Array.from({length: COUNT}, () => 1 + rng() % 28);
  const offset = Array.from({length: COUNT}, () => rng() % MOD);
  const cipher = Array.from({length: COUNT}, () => Array(TILE).fill(-1));
  let recovered = 0;
  for (let u = 0; u < TILE; u++) {
    const sbox = Array.from({length: MOD}, (_, i) => i);
    for (let i = MOD - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [sbox[i], sbox[j]] = [sbox[j], sbox[i]];
    }
    const inverse = new Array(MOD);
    sbox.forEach((v, i) => { inverse[v] = i; });
    for (let b = 0; b < COUNT; b++) {
      const coordinate = maps[orientation[b]][u];
      const encoded = mod29(multiplier[b] * sbox[clear[b][u]] + offset[b]);
      cipher[b][coordinate] = encoded;
      let normalized = mod29(encoded - offset[b]);
      let inverseMultiplier = 0;
      for (let j = 1; j < MOD; j++) {
        if (j * multiplier[b] % MOD === 1) {inverseMultiplier = j; break;}
      }
      normalized = mod29(normalized * inverseMultiplier);
      const plain = inverse[normalized];
      assert.equal(plain, clear[b][u]);
      assert.equal(mod29(multiplier[b] * sbox[plain] + offset[b]), encoded);
      recovered++;
    }
  }
  const upper = affineOutputCapacity(cipher);
  assert.ok(upper.triangleAffineUpper >= expectedEquality);
  assert.equal(recovered, 6561);
  return {recoveredRunes: recovered, nativePlainEqualities: expectedEquality,
    cipherTriangleAffineUpper: upper.triangleAffineUpper,
    secretTileMultipliers: multiplier, exactReencryption: true};
}

const observed = capacity(original);
assert.equal(observed.aligned, 886);
assert.equal(observed.dihedral, 1187);
assert.equal(observed.pairwiseD4CaesarUpper, 1450);
assert.equal(observed.triangleD4CaesarUpper, 1362);
const affineEscape = affineOutputCapacity(original);
assert.equal(affineEscape.pairwiseAffineUpper, 1646);
assert.equal(affineEscape.triangleAffineUpper, 1524);
const referenceSources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const references = referenceSources.map((file, i) =>
  calibrate(file, i + 1, observed.triangleD4CaesarUpper));
assert.equal(references.length, 3);
for (const reference of references) {
  assert.equal(reference.windows, 1000);
  assert.equal(reference.noGreaterThanOriginal, 0);
}
const nativeEnglish = toGematria(fs.readFileSync(
  path.join(ROOT, referenceSources[0]), "utf8"));
const plant = positivePlant(nativeEnglish);
const affinePlant = positiveAffinePlant(nativeEnglish);

console.log(JSON.stringify({
  theorem: "For the nine 27x27 LP2 panels, all D4 per-tile orientations and GP29 Caesar output offsets, any 729 independent unknown GP29 bijections shared at corresponding tile cells, source-exact triangle partition bounds total simultaneous native-plaintext rune equality pairs by 1362",
  scope: "One GP plaintext rune per cipher rune, nine contiguous original 729-rune tiles, aligned source coordinate under unknown dihedral motion, one fixed output offset per tile and a 29-permutation per source coordinate; no hidden intermediate codec or individually evolving tile masks",
  source: {totalUnsolvedRunes: full.length, sourceSquareRunes: 6561,
    initialThreePagesRunes: 729, tiles: COUNT, tileSide: SIZE,
    comparisonPairs: 36 * TILE, comparisons: 36, originalRepeatingBookend: true},
  observed,
  affineOutputEscape: affineEscape,
  independentReferenceWindows: references,
  secretKeyPositive: plant,
  affineSecretKeyPositive: affinePlant,
  finding: "No candidate native GP-English original plaintext or authentic LP2 key recovered. Exactly excludes this source-specified direct per-coordinate S-box family against the explicitly sampled three-literature GP controls."
}, null, 2));
