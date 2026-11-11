#!/usr/bin/env node
'use strict';

/**
 * Source-exact 2016 tree image / LP2 physical p32 geometry test.
 * Reproduces the candidate 11x11 variable-width image tiles and tests
 * whether their image appearance directly encodes p32's 100 interior
 * Gematria Primus prime weights.
 *
 * Requirements: Node.js 22; zero external runtime dependencies.
 * The vendored jpeg-js decoder is pinned separately with its license.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const decodeJpeg = require('./vendor/jpeg-js-decoder.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const jpegBytes = fs.readFileSync(
  path.join(root, 'resources', 'historical', 'cicada2016-4gq25.jpg')
);
const image = decodeJpeg(jpegBytes, {
  useTArray: true,
  formatAsRGBA: false,
  maxResolutionInMP: 2
});

const page = corpus.pages.find((entry) => entry.page === 32);
assert(page);
assert.equal(page.indices.length, 121);
assert.equal(image.width, 563);
assert.equal(image.height, 569);
assert.equal(image.data.length, image.width * image.height * 3);

/** @param {number[]} xs @returns {number} */
function sum(xs) {
  return xs.reduce((a, b) => a + b, 0);
}

/** @param {number[]} widths @returns {number[]} */
function boundaries(widths) {
  const out = [0];
  for (const width of widths) out.push(out[out.length - 1] + width);
  return out;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function pearson(a, b) {
  assert.equal(a.length, b.length);
  const n = a.length;
  const meanA = sum(a) / n;
  const meanB = sum(b) / n;
  let cross = 0;
  let sqA = 0;
  let sqB = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - meanA;
    const y = b[i] - meanB;
    cross += x * y;
    sqA += x * x;
    sqB += y * y;
  }
  return cross / Math.sqrt(sqA * sqB);
}

/** @param {number[]} input @returns {number[]} */
function ranks(input) {
  const ordered = input.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const out = Array(input.length);
  for (let first = 0; first < ordered.length;) {
    let end = first + 1;
    while (end < ordered.length && ordered[end].value === ordered[first].value) end++;
    const rank = (first + 1 + end) / 2;
    for (let i = first; i < end; i++) out[ordered[i].index] = rank;
    first = end;
  }
  return out;
}

const weights = page.indices.map((v) => corpus.prime[v]);
const widths = weights.slice(0, 11);
const heights = Array.from({ length: 11 }, (_, y) => weights[y * 11]);
const xEdges = boundaries(widths);
const yEdges = boundaries(heights);
assert.equal(sum(widths), 563);
assert.equal(sum(heights), 569);
assert.deepEqual(widths, [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]);
assert.deepEqual(heights, [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]);

const interiorWeights = [];
const features = [[], [], []]; // tile average RGB; bright pixels; midtones
const tileMeans = [];
const centerMask = [];
const centerSelected = [];
for (let row = 0; row < 11; row++) {
  const rowMeans = [];
  let centerRow = '';
  for (let col = 0; col < 11; col++) {
    const cx = Math.floor((xEdges[col] + xEdges[col + 1] - 1) / 2);
    const cy = Math.floor((yEdges[row] + yEdges[row + 1] - 1) / 2);
    const centerOffset = (cy * image.width + cx) * 3;
    const centerRGB = (image.data[centerOffset] + image.data[centerOffset + 1]
      + image.data[centerOffset + 2]) / 3;
    if (centerRGB >= 128) {
      centerRow += '#';
      centerSelected.push(corpus.translit[page.indices[row * 11 + col]]);
    } else centerRow += '.';
    let total = 0;
    let count = 0;
    let brightCount = 0;
    let midCount = 0;
    for (let y = yEdges[row]; y < yEdges[row + 1]; y++) {
      for (let x = xEdges[col]; x < xEdges[col + 1]; x++) {
        const offset = (y * image.width + x) * 3;
        const v = (image.data[offset] + image.data[offset + 1]
          + image.data[offset + 2]) / 3;
        total += v;
        count++;
        if (v >= 160) brightCount++;
        else if (v >= 16) midCount++;
      }
    }
    assert(count > 0);
    rowMeans.push(Number((total / count).toFixed(1)));
    if (row > 0 && col > 0) {
      interiorWeights.push(weights[row * 11 + col]);
      features[0].push(total / count);
      features[1].push(brightCount / count);
      features[2].push(midCount / count);
    }
  }
  tileMeans.push(rowMeans);
  centerMask.push(centerRow);
}
assert.equal(interiorWeights.length, 100);

const observedPearson = features.map((v) => pearson(interiorWeights, v));
const rankedFeatures = features.map(ranks);
const observedSpearman = rankedFeatures.map((v) => pearson(ranks(interiorWeights), v));
const counts = [0, 0, 0];
let familyPearson = 0;
let familySpearman = 0;
const iterations = 100000;
let seed = 0x20163301;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const shuffled = interiorWeights.slice();
const shuffledRanks = ranks(interiorWeights);
for (let trial = 0; trial < iterations; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    [shuffledRanks[i], shuffledRanks[j]] = [shuffledRanks[j], shuffledRanks[i]];
  }
  let hitPearson = false;
  let hitSpearman = false;
  for (let f = 0; f < features.length; f++) {
    const value = Math.abs(pearson(shuffled, features[f]));
    const rho = Math.abs(pearson(shuffledRanks, rankedFeatures[f]));
    if (value >= Math.abs(observedPearson[f]) - 1e-12) {
      counts[f]++;
      hitPearson = true;
    }
    if (rho >= Math.abs(observedSpearman[f]) - 1e-12) hitSpearman = true;
  }
  if (hitPearson) familyPearson++;
  if (hitSpearman) familySpearman++;
}
const result = {
  imageSize: [image.width, image.height],
  imageBytes: jpegBytes.length,
  tileWidthPixels: widths,
  tileHeightPixels: heights,
  tileXEdges: xEdges,
  tileYEdges: yEdges,
  meanRGBByTile: tileMeans,
  centerPixel128Mask: centerMask,
  centerPixel128RuneTransliteration: centerSelected.join(''),
  tested: '100 interior p32 GP prime weights, fixed 21 edge weights',
  featureNames: ['mean_RGB', 'fraction_RGB_at_least_160', 'fraction_RGB_16_to_159'],
  observedPearson,
  observedSpearman,
  permutationSeed: '0x20163301',
  permutations: iterations,
  perFeaturePearsonTwoSidedP: counts.map((count) => (count + 1) / (iterations + 1)),
  familyAnyPearsonTwoSidedP: (familyPearson + 1) / (iterations + 1),
  familyAnySpearmanTwoSidedP: (familySpearman + 1) / (iterations + 1)
};
console.log(JSON.stringify(result, null, 2));
