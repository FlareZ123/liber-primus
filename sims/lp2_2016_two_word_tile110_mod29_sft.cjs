"use strict";
/**
 * Original-source first-two-word 11x10 signed-tree tile residue gate.
 *
 * The first-page addressed words' GP-prime weights sum to
 * the authenticated 2016 JPEG width/height (563x569), fixing an 11x11
 * tiling. Test an exact, clue-selected possibility on only the 100
 * independent interior cells: dark pixel count mod29 equals the GP29
 * ordinal or the GP-prime residue, under four predeclared gray cutoffs.
 *
 * This does not fit image thresholds, rotate tiles, vary offsets, or
 * discover a key. Run: node sims/lp2_p32_2016_tile_ink_mod29_sft.cjs
 * @module lp2_p32_2016_tile_ink_mod29_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const jpeg = require("./vendor/jpeg-js-decoder.cjs");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const gpPrimes = p32.map(index => corpus.prime[index]);
const sourceWordX = "ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ";
const sourceWordY = "ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ";
const asPrime = str => [...str].map(c => {
  const index = corpus.runes.indexOf(c);
  assert(index >= 0);
  return corpus.prime[index];
});
const widths = asPrime(sourceWordX);
const heights = asPrime(sourceWordY);
assert.equal(widths.length, 11);
assert.equal(heights.length, 10);
assert.equal(widths.reduce((a, b) => a + b, 0), 563);
assert.equal(heights.reduce((a, b) => a + b, 0), 569);
const boundaries = values => {
  const result = [0];
  for (const value of values) result.push(result.at(-1) + value);
  return result;
};
const xx = boundaries(widths);
const yy = boundaries(heights);
const raw = fs.readFileSync(path.join(root,
  "resources/historical/cicada2016-4gq25.jpg"));
const original = jpeg(raw, {useTArray: true, formatAsRGBA: false,
  maxResolutionInMP: 2});
assert.deepEqual([original.width, original.height], [563, 569]);
assert.equal(original.data.length, 563 * 569 * 3);
const interior = Array.from({length: 110}, (_, i) => i + 11);
assert.equal(new Set(interior).size, 110);
const cutoffs = [32, 64, 128, 192];

/**
 * @param {Uint8Array} bytes Interleaved JPEG RGB bytes, 563x569.
 * @param {number} cutoff Pixel-average darkness cutoff.
 * @returns {number[]} Per-tile dark pixel counts mod29.
 */
function tileResidues(bytes, cutoff) {
  const residues = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 11; col++) {
      let dark = 0;
      for (let y = yy[row]; y < yy[row + 1]; y++) {
        for (let x = xx[col]; x < xx[col + 1]; x++) {
          const k = (y * 563 + x) * 3;
          if (bytes[k] + bytes[k + 1] + bytes[k + 2] < 3 * cutoff)
            dark++;
        }
      }
      residues.push(dark % 29);
    }
  }
  return residues;
}
/** @param {number[]} a @param {number[]} b */
function matches(a, b) {
  assert.equal(a.length, b.length);
  let equal = 0;
  for (let i = 0; i < a.length; i++) equal += +(a[i] === b[i]);
  return equal;
}
const targets = [
  interior.map(position => p32[position]),
  interior.map(position => gpPrimes[position] % 29)
];
const readings = cutoffs.map(cutoff => tileResidues(original.data, cutoff))
  .map(residue => interior.map(position => residue[position - 11]));
const observed = [];
for (let t = 0; t < targets.length; t++)
  for (let k = 0; k < cutoffs.length; k++)
    observed.push({target: t === 0 ? "gpOrdinal" : "gpPrimeMod29",
      grayThreshold: cutoffs[k], exactMatches: matches(targets[t], readings[k])});
const maxObserved = Math.max(...observed.map(item => item.exactMatches));

/* Exact image-encoding plant: assign each of the 110 tiles a valid GP29 pixel-count
 * residue, using its original GP ordinal when the rectangle is large
 * enough and a reduced target in very small rectangles. This tests
 * all 110 boundaries and the count operation on synthetic RGB
 * without altering the original artifact or inferring plaintext. */
const planted = new Uint8Array(original.data.length);
planted.fill(255);
const plantedTarget = [];
let unchangedPlantedTargets = 0;
for (const position of interior) {
  const row = Math.floor((position - 11) / 11);
  const col = (position - 11) % 11;
  const capacity = (xx[col + 1] - xx[col]) * (yy[row + 1] - yy[row]);
  const target = p32[position] % (capacity + 1);
  plantedTarget.push(target);
  unchangedPlantedTargets += +(target === p32[position]);
  let remaining = target;
  for (let y = yy[row]; y < yy[row + 1] && remaining; y++) {
    for (let x = xx[col]; x < xx[col + 1] && remaining; x++) {
      const k = (y * 563 + x) * 3;
      planted[k] = planted[k + 1] = planted[k + 2] = 0;
      remaining--;
    }
  }
  assert.equal(remaining, 0);
}
const plantedRead = tileResidues(planted, 128);
assert.equal(matches(plantedTarget,
  interior.map(position => plantedRead[position - 11])), 110);

/* Compare the maximum of eight tests to 20,000 exact-original-marginal
 * random permutations. The same permutation acts on both rune
 * conventions; this preserves their deterministic crossdependence. */
let state = 0x56356929;
/** @returns {number} */
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const iterations = 20000;
let exceed = 0;
let meanMaximum = 0;
let greatestNull = 0;
for (let trial = 0; trial < iterations; trial++) {
  const order = Array.from({length: 110}, (_, i) => i);
  for (let i = 109; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  let best = 0;
  for (let t = 0; t < targets.length; t++) {
    const shuffled = order.map(i => targets[t][i]);
    for (const reading of readings)
      best = Math.max(best, matches(shuffled, reading));
  }
  if (best >= maxObserved) exceed++;
  meanMaximum += best;
  greatestNull = Math.max(greatestNull, best);
}
console.log(JSON.stringify({
  originalSource: "physical LP2 p0 word6 / p1 word33 source-width/height; p32 lower 110 runes; signed 2016 4gq25.jpg",
  fixedDimensions: [563, 569],
  sourceXWidths: widths,
  sourceYHeights: heights,
  heldOutInteriorCells: interior.length,
  sourceWords: [sourceWordX, sourceWordY],
  exactOriginalResidueReadings: observed,
  originalFamilyMax: maxObserved,
  familywisePermutationTrials: iterations,
  familywiseUpperTailP: (exceed + 1) / (iterations + 1),
  nullMeanMax: meanMaximum / iterations,
  nullHighestMax: greatestNull,
  exactArtificialPixelCountPlantRecovered: 110,
  plantedTargetsUnchangedFromOriginal: unchangedPlantedTargets,
  inference: "Exact GP29 ink-pixel residue test, not a fitted or authenticated cipher. Require a source-selected rule and separate plaintext to claim decryption."
}, null, 2));
