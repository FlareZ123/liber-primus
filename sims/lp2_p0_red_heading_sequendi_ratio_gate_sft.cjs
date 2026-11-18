"use strict";

/**
 * SFT: conditional red-heading validation for the published 27x27 p0-p2 route.
 *
 * This test starts from the canonical 729-rune LP2 p0-p2 source and the
 * repository's independently frozen first-38 route arrays. It does not accept
 * the candidate English route as plaintext. Instead it asks whether two
 * geometric constructions described for the red p0 heading are selective
 * before that heading plaintext is inspected.
 *
 * Run: node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
 * Node.js 22+, CommonJS, no third-party packages or network calls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const auditSource = read("sims/lp2_27x27_first38_original_audit_sft.cjs");
const grid = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.equal(grid.length, 27 * 27);

const idx = token => corpus.translit.indexOf(token);
const coord = zeroBased => [Math.floor(zeroBased / 27) + 1, zeroBased % 27 + 1];
const position = ([row, column]) => (row - 1) * 27 + column - 1;
const runeAt = point => grid[position(point)];
const inBounds = ([row, column]) =>
  row >= 1 && row <= 27 && column >= 1 && column <= 27;

/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {string} name */
function parseStringArray(name) {
  const match = auditSource.match(new RegExp("const " + name + "=\\[(.*?)\\];", "s"));
  assert(match, "missing frozen route array " + name);
  return [...match[1].matchAll(/"([^"]*)"/g)].map(row =>
    row[1].split(",").map(Number));
}

/** @param {number[]} cipher @param {number[]} key */
function subtractRepeating(cipher, key) {
  return cipher.map((value, i) => (value - key[i % key.length] + 29) % 29);
}

/** @param {number[]} plain @param {number[]} key */
function addRepeating(plain, key) {
  return plain.map((value, i) => (value + key[i % key.length]) % 29);
}

const sources = parseStringArray("sources");
const paths = parseStringArray("paths");
assert.equal(sources.length, 38);
assert.equal(paths.length, 38);

// Original physical red heading: exactly 8 + 5 runes, followed by the
// original 13-dot marker. This uses the source-corrected image adjudication.
const redWords = ink.physical_zero_based.red_words;
assert.deepEqual(redWords.map(w => w.length), [8, 5]);
const red = redWords.flatMap(w => w.gp_indices);
assert.equal(red.length, 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].dots, 13);
assert.deepEqual(red, grid.slice(0, 13));

// The route's opening anchor is J(13,12), the 13/phi(13) coordinate.
const J = [red.length, phi(red.length)];
assert.deepEqual(J, [13, 12]);
assert.equal(runeAt(J), idx("J"));

// Frozen block 28 source = EO-X-I at column 9. The first three ciphertext
// positions are the internal MAP prefix and end at AE(17,13).
const mapSource = sources[27];
assert.deepEqual(mapSource.map(coord), [[15, 9], [16, 9], [17, 9]]);
assert.deepEqual(mapSource.map(i => grid[i]), [idx("EO"), idx("X"), idx("I")]);
const mapPrefix = paths[27].slice(0, 3);
assert.deepEqual(mapPrefix.map(coord), [[19, 11], [18, 12], [17, 13]]);
const mapEndpoint = coord(mapPrefix.at(-1));
assert.deepEqual(mapEndpoint, [17, 13]);

// FIRST TITLE KEY.
// Freeze only the stated geometry before looking at title plaintext:
// - right side is the MAP source column,
// - rectangle strictly spans the complete three-cell MAP source,
// - upper-left and lower-right corners are X,
// - those two X corners are equidistant from J.
// Exhaust the original 27x27 grid.
const mapCoordinates = mapSource.map(coord);
const mapColumn = mapCoordinates[1][1];
const minMapRow = Math.min(...mapCoordinates.map(x => x[0]));
const maxMapRow = Math.max(...mapCoordinates.map(x => x[0]));
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const rectangles = [];
for (let top = 1; top < minMapRow; top++) {
  for (let bottom = maxMapRow + 1; bottom <= 27; bottom++) {
    for (let left = 1; left < mapColumn; left++) {
      const corners = [
        [top, left],
        [top, mapColumn],
        [bottom, mapColumn],
        [bottom, left],
      ];
      if (runeAt(corners[0]) !== idx("X")) continue;
      if (runeAt(corners[2]) !== idx("X")) continue;
      if (dist2(corners[0], J) !== dist2(corners[2], J)) continue;
      rectangles.push({
        corners,
        key: corners.map(runeAt),
        distance2: dist2(corners[0], J),
      });
    }
  }
}
assert.equal(rectangles.length, 1);
const rectangle = rectangles[0];
assert.deepEqual(rectangle.corners, [[6, 3], [6, 9], [24, 9], [24, 3]]);
assert.deepEqual(rectangle.key, [idx("X"), idx("N"), idx("X"), idx("C")]);

// Route-internal control for the first-key geometry. Apply the same rule to
// every frozen vertical three-rune source: use that source's center rune at
// the rectangle's upper-left and lower-right corners, keep its source column
// as the right side, strictly span the source, and require equal distance to J.
const verticalRectangleControls = [];
for (let block = 0; block < 38; block++) {
  if (sources[block].length !== 3) continue;
  const points = sources[block].map(coord);
  if (!points.every(point => point[1] === points[0][1])) continue;
  const column = points[0][1];
  const centerRune = grid[sources[block][1]];
  const minRow = Math.min(...points.map(point => point[0]));
  const maxRow = Math.max(...points.map(point => point[0]));
  const matches = [];
  for (let top = 1; top < minRow; top++) {
    for (let bottom = maxRow + 1; bottom <= 27; bottom++) {
      for (let left = 1; left < column; left++) {
        const corners = [
          [top, left],
          [top, column],
          [bottom, column],
          [bottom, left],
        ];
        if (runeAt(corners[0]) !== centerRune) continue;
        if (runeAt(corners[2]) !== centerRune) continue;
        if (dist2(corners[0], J) !== dist2(corners[2], J)) continue;
        matches.push(corners);
      }
    }
  }
  verticalRectangleControls.push({block: block + 1, matches});
}
assert.equal(verticalRectangleControls.length, 17);
const verticalRectangleHits = verticalRectangleControls.filter(x => x.matches.length > 0);
assert.deepEqual(verticalRectangleHits.map(x => [x.block, x.matches.length]), [[28, 1]]);

const firstCipher = red.slice(0, 8).reverse();
const firstKey = rectangle.key;
const firstPlain = subtractRepeating(firstCipher, firstKey);
assert.equal(firstPlain.map(x => corpus.translit[x]).join("-"),
  "S-E-C-U-E-N-D-I");
assert.deepEqual(addRepeating(firstPlain, firstKey), firstCipher);

// SECOND TITLE KEY.
// For every prefix endpoint of every frozen route block whose source is a
// single three-cell node, apply the same two affine extrapolations:
//   R = 2E - M
//   T = 2R - J
// and ask, before reading the red suffix, whether phi(rune(R)) = rune(T).
// The MAP three-rune prefix is the unique in-bounds match.
const extrapolationTests = [];
for (let block = 0; block < 38; block++) {
  if (sources[block].length !== 3) continue;
  const M = coord(sources[block][1]);
  for (let prefix = 0; prefix < paths[block].length; prefix++) {
    const E = coord(paths[block][prefix]);
    const R = [2 * E[0] - M[0], 2 * E[1] - M[1]];
    const T = [2 * R[0] - J[0], 2 * R[1] - J[1]];
    if (!inBounds(R) || !inBounds(T)) continue;
    const r = runeAt(R);
    const t = runeAt(T);
    extrapolationTests.push({
      block: block + 1,
      prefixLength: prefix + 1,
      M,
      E,
      R,
      T,
      r,
      t,
      match: r > 0 && phi(r) === t,
    });
  }
}
assert.equal(extrapolationTests.length, 20);
const extrapolationMatches = extrapolationTests.filter(x => x.match);
assert.equal(extrapolationMatches.length, 1);
const mapMatch = extrapolationMatches[0];
assert.equal(mapMatch.block, 28);
assert.equal(mapMatch.prefixLength, 3);
assert.deepEqual(mapMatch.M, [16, 9]);
assert.deepEqual(mapMatch.E, [17, 13]);
assert.deepEqual(mapMatch.R, [18, 17]);
assert.deepEqual(mapMatch.T, [23, 22]);
assert.equal(mapMatch.r, idx("R"));
assert.equal(mapMatch.t, idx("TH"));
assert.equal(phi(mapMatch.r), idx("TH"));

const secondOriginalNode = [runeAt(J), mapMatch.r, mapMatch.t];
assert.deepEqual(secondOriginalNode, [idx("J"), idx("R"), idx("TH")]);
const secondKey = [secondOriginalNode[0], phi(secondOriginalNode[1]), secondOriginalNode[2]];
assert.deepEqual(secondKey, [idx("J"), idx("TH"), idx("TH")]);

const secondCipher = red.slice(8);
const secondPlain = subtractRepeating(secondCipher, secondKey);
assert.equal(secondPlain.map(x => corpus.translit[x]).join("-"), "R-A-T-I-O");
assert.deepEqual(addRepeating(secondPlain, secondKey), secondCipher);

// Independent arithmetic checksum on the recovered 13-rune title. The same
// source-visible count that gives J=(13,phi(13)) also predicts the complete
// recovered title's ordinary GP29-index sum.
const titlePlain = firstPlain.concat(secondPlain);
const titleIndexSum = titlePlain.reduce((sum, value) => sum + value, 0);
assert.equal(titlePlain.length, red.length);
assert.equal(titleIndexSum, red.length * phi(red.length));
assert.equal(titleIndexSum, 156);

console.log(JSON.stringify({
  status: "conditional held-out red-heading cross-check; route still unverified",
  originalHeadingRunes: red.map(x => corpus.translit[x]),
  originalHeadingGroups: [8, 5],
  openingAnchor: J,
  uniqueRectangleCount: rectangles.length,
  verticalThreeRuneSourcesTested: verticalRectangleControls.length,
  verticalSourcesWithComparableRectangle: verticalRectangleHits.map(x => x.block),
  rectangleCorners: rectangle.corners,
  firstKey: firstKey.map(x => corpus.translit[x]),
  firstReadingDirection: "red first 8 reversed",
  firstPlaintextRunes: firstPlain.map(x => corpus.translit[x]),
  routePrefixExtrapolationsInBounds: extrapolationTests.length,
  phiExtrapolationMatches: extrapolationMatches.length,
  uniquePhiMatch: {
    block: mapMatch.block,
    prefixLength: mapMatch.prefixLength,
    M: mapMatch.M,
    E: mapMatch.E,
    R: mapMatch.R,
    T: mapMatch.T,
    runes: [mapMatch.r, mapMatch.t].map(x => corpus.translit[x]),
  },
  secondOriginalNode: secondOriginalNode.map(x => corpus.translit[x]),
  secondKey: secondKey.map(x => corpus.translit[x]),
  secondPlaintextRunes: secondPlain.map(x => corpus.translit[x]),
  titleIndexSum,
  countTimesCountTotient: red.length * phi(red.length),
  canonicalReading: "SECUENDI RATIO",
  latinizedCKReading: "SEQUENDI RATIO",
  forwardReencryption: true,
}, null, 2));
