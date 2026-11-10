"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const A_SIDE = 81, B_SIDE = 80, N = 6395;
const RNG_SEED = 0x51618085;

/** @returns {number[]} Original 12956 unsolved ciphertext GP indices. */
function ciphertext() {
  const c = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "../resources/liber-primus/lp2-corpus.json"), "utf8"));
  const pages = c.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length, 55);
  const out = pages.flatMap(p => p.indices);
  assert.equal(out.length, 12956);
  return out;
}

/** Every way to register a 80² inner image onto an 81² outer image. */
function layouts() {
  const all = [];
  for (let rowInset = 0; rowInset <= 1; rowInset++)
    for (let columnInset = 0; columnInset <= 1; columnInset++)
      for (let transform = 0; transform < 8; transform++) {
        const offsets = new Uint16Array(N);
        for (let i = 0; i < N; i++) {
          let r = Math.floor(i / B_SIDE), col = i % B_SIDE;
          if (transform & 1) r = B_SIDE - 1 - r;
          if (transform & 2) col = B_SIDE - 1 - col;
          if (transform & 4) [r, col] = [col, r];
          offsets[i] = (r + rowInset) * A_SIDE + col + columnInset;
        }
        all.push({rowInset, columnInset, transform, offsets});
      }
  assert.equal(all.length, 32);
  return all;
}

/** Source-preserving shuffle RNG, no cryptographic significance. */
function generator(seed = RNG_SEED) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function affineLines() {
  const lines = [];
  for (let slope = 1; slope < 29; slope++)
    for (let offset = 0; offset < 29; offset++) {
      const indices = new Uint16Array(29);
      for (let a = 0; a < 29; a++)
        indices[a] = a * 29 + (slope * a + offset) % 29;
      lines.push({slope, offset, indices});
    }
  assert.equal(lines.length, 812);
  return lines;
}

/**
 * Best keyless mutual information over a completely unknown stationary
 * 29-symbol bijection, and max finite affine-mod29 fixed-label overlap.
 * Both statistics jointly optimize the same predeclared 32 registrations.
 * @param {number[]} first Original source 81² square
 * @param {number[]} second Original 80²-minus-five source
 * @param {ReturnType<typeof layouts>} registrations
 * @param {ReturnType<typeof affineLines>} lines
 */
function score(first, second, registrations, lines) {
  let bestMi = {value: -Infinity}, bestAffine = {matches: -1};
  const N = second.length;
  for (const reg of registrations) {
    const matrix = new Uint16Array(29 * 29);
    const row = new Uint16Array(29), col = new Uint16Array(29);
    for (let i = 0; i < N; i++) {
      const a = first[reg.offsets[i]], b = second[i];
      matrix[a * 29 + b]++;
      row[a]++; col[b]++;
    }
    let information = 0;
    for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
      const hits = matrix[a * 29 + b];
      if (hits) information +=
        (hits / N) * Math.log(hits * N / (row[a] * col[b]));
    }
    if (information > bestMi.value) bestMi = {
      value: information, rowInset: reg.rowInset,
      columnInset: reg.columnInset, transform: reg.transform
    };
    for (const line of lines) {
      let matches = 0;
      for (let a = 0; a < 29; a++) matches += matrix[line.indices[a]];
      if (matches > bestAffine.matches) bestAffine = {
        matches, slope: line.slope, offset: line.offset,
        rowInset: reg.rowInset, columnInset: reg.columnInset,
        transform: reg.transform
      };
    }
  }
  return {bestMi, bestAffine};
}

function run(trials = 250) {
  const source = ciphertext();
  const first = source.slice(0, 6561), second = source.slice(6561);
  assert.equal(first.length, 6561);
  assert.equal(second.length, N);
  const registrations = layouts(), lines = affineLines();
  const actual = score(first, second, registrations, lines);
  const selected = registrations.find(r => r.rowInset === 1 &&
    r.columnInset === 0 && r.transform === 5);
  assert.ok(selected);
  const generatedAffine = Array.from(selected.offsets, i =>
    (17 * first[i] + 4) % 29);
  const positive = score(first, generatedAffine, registrations, lines);
  assert.deepEqual(positive.bestAffine, {
    matches: N, slope: 17, offset: 4,
    rowInset: 1, columnInset: 0, transform: 5
  });
  assert.ok(positive.bestMi.value > 3);
  const random = generator();
  let miAtLeast = 0, affineAtLeast = 0, sumMI = 0, sumAffine = 0;
  for (let t = 0; t < trials; t++) {
    const shuffled = second.slice();
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const nullScore = score(first, shuffled, registrations, lines);
    sumMI += nullScore.bestMi.value;
    sumAffine += nullScore.bestAffine.matches;
    if (nullScore.bestMi.value >= actual.bestMi.value) miAtLeast++;
    if (nullScore.bestAffine.matches >= actual.bestAffine.matches) affineAtLeast++;
  }
  const summary = {
    corpusLength: source.length,
    sourceSquare81: first.length,
    sourceSquare80MinusFive: second.length,
    registrations: registrations.length,
    affineFamiliesPerRegistration: lines.length,
    actual,
    positive: {mutualInformationNats: positive.bestMi.value,
      exactAffineRecovered: positive.bestAffine.matches},
    shuffleSeed: RNG_SEED,
    shuffledNullCount: trials,
    maximumMutualInformationNullMean: sumMI / trials,
    originalMutualInformationTailCount: miAtLeast,
    originalMutualInformationTailP: (miAtLeast + 1) / (trials + 1),
    maximumAffineMatchesNullMean: sumAffine / trials,
    originalAffineMatchesTailCount: affineAtLeast,
    originalAffineMatchesTailP: (affineAtLeast + 1) / (trials + 1)
  };
  console.log("LP2 CROSS-SQUARE ORIGINAL ALIGNMENT", JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) run();
module.exports = {ciphertext, layouts, generator, affineLines, score, run};
