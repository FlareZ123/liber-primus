'use strict';

/**
 * Agent26 / Director issue #2463:
 * Source-motivated line-local 3-rail transposition followed by three shared
 * bijective GP29 substitutions (one substitution per rail, global across
 * all 594 unknown-page physical rune lines).
 *
 * The p22 three-bar engraving is only a plausible selector, not an
 * authenticated instruction. This script tests one frozen composition:
 * each physical line is zig-zagged across rails 0,1,2,1; each rail is
 * substituted by one shared GP29 bijection; ciphertext is row-concatenated.
 * Word separators, punctuation, line/page delimiters are unchanged framing.
 *
 * Run: node sims/lp2_line_local_3rail_shared_substitution_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const nativeText = read('resources/control/gibran_prophet_58585.txt');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

function parseUnknownSource() {
  const pages = [];
  const lines = [];
  const rawLines = [];
  let runeCount = 0;
  let pageCount = 0;
  for (const section of transcription.split(/^%$/m)) {
    const pageLines = [];
    let pageRunes = 0;
    for (const raw of section.split('/\n')) {
      const xs = [...raw].filter((ch) => runeIndex.has(ch))
        .map((ch) => runeIndex.get(ch));
      if (xs.length) {
        pageLines.push(xs);
        lines.push(xs);
        rawLines.push(raw);
        pageRunes += xs.length;
      }
    }
    if (runeCount + pageRunes > 12956) break;
    pages.push(pageLines);
    runeCount += pageRunes;
    pageCount++;
    if (runeCount === 12956) break;
  }
  const source = lines.flat();
  assert.equal(pageCount, 55);
  assert.equal(corpus.pages.filter((page) => page.page <= 55).length, 56);
  assert.equal(corpus.pages.filter((page) => page.page <= 55 && page.runic_count > 0).length, 55);
  assert.equal(corpus.pages.find((page) => page.page === 50).runic_count, 0);
  assert.equal(runeCount, 12956);
  assert.equal(lines.length, 594);
  assert.equal(Math.max(...lines.map((line) => line.length)), 26);
  assert.equal(rawLines.length, 594);
  const canonical = corpus.pages.filter((page) => page.page <= 55)
    .flatMap((page) => page.indices);
  assert.equal(canonical.length, 12956);
  assert.deepEqual(source, canonical);
  return {pages, lines, rawLines, source};
}

function gpNative(s) {
  const words = s.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (const word of words) {
    for (let at = 0; at < word.length;) {
      if (word.startsWith('ING', at)) {
        out.push(21);
        at += 3;
        continue;
      }
      if (word.startsWith('IO', at)) {
        out.push(27);
        at += 2;
        continue;
      }
      const token = tokens.find((candidate) => word.startsWith(candidate.t, at));
      assert.ok(token, 'unknown GP spelling ' + word.slice(at));
      out.push(token.i);
      at += token.t.length;
    }
  }
  return out;
}

const {pages, lines, rawLines, source} = parseUnknownSource();
const lengths = lines.map((line) => line.length);
const railOffsets = [[], [], []];
const railMask = new Uint8Array(source.length);
let cursor = 0;
for (const line of lines) {
  for (let j = 0; j < line.length; j++) {
    const rail = j % 4 === 0 ? 0 : (j % 4 === 2 ? 2 : 1);
    railOffsets[rail].push(cursor + j);
    railMask[cursor + j] = rail;
  }
  cursor += line.length;
}
assert.equal(cursor, 12956);

function rowLengths(n) {
  const rail0 = Math.floor((n + 3) / 4);
  const rail2 = Math.floor((n + 1) / 4);
  return [rail0, n - rail0 - rail2, rail2];
}

function collisionPairs(counts) {
  let hits = 0;
  for (let symbol = 0; symbol < 29; symbol++) {
    const n = counts[symbol];
    hits += n * (n - 1) / 2;
  }
  return hits;
}

function plainRailCounts(stream) {
  const counts = [new Uint32Array(29), new Uint32Array(29), new Uint32Array(29)];
  for (let rail = 0; rail < 3; rail++) {
    const offsets = railOffsets[rail];
    for (let i = 0; i < offsets.length; i++)
      counts[rail][stream[offsets[i]]]++;
  }
  return counts;
}

function ciphertextRailCounts(cipherLines) {
  const counts = [new Uint32Array(29), new Uint32Array(29), new Uint32Array(29)];
  for (const line of cipherLines) {
    const [n0, n1, n2] = rowLengths(line.length);
    for (let i = 0; i < n0; i++) counts[0][line[i]]++;
    for (let i = 0; i < n1; i++) counts[1][line[n0 + i]]++;
    for (let i = 0; i < n2; i++) counts[2][line[n0 + n1 + i]]++;
  }
  return counts;
}

function pairVector(counts) {
  return counts.map(collisionPairs);
}

const originalPairs = pairVector(ciphertextRailCounts(lines));
const originalTotal = originalPairs.reduce((a, b) => a + b, 0);
const railSizes = railOffsets.map((x) => x.length);
const native = gpNative(nativeText);
assert.equal(native.length, 62492);
const windows = native.length - source.length + 1;
assert.equal(windows, 49537);

// Full contiguous native-GP reference scan. For each window, impose the
// exact 594 line lengths and the same line-local 0,1,2,1 rail mask.
const nativePairs = [
  new Int32Array(windows),
  new Int32Array(windows),
  new Int32Array(windows)
];
const nativeTotals = new Int32Array(windows);
const counts = [new Uint16Array(29), new Uint16Array(29), new Uint16Array(29)];
const nativeMin = [Infinity, Infinity, Infinity];
const nativeMax = [-Infinity, -Infinity, -Infinity];
const nativeMinAt = [-1, -1, -1];
let totalMin = Infinity;
let totalMax = -Infinity;
let windowsAtOrBelowOriginal = 0;
let windowsBelowEachRail = 0;

for (let start = 0; start < windows; start++) {
  counts[0].fill(0);
  counts[1].fill(0);
  counts[2].fill(0);
  for (let rail = 0; rail < 3; rail++) {
    const offsets = railOffsets[rail];
    const row = counts[rail];
    for (let j = 0; j < offsets.length; j++)
      row[native[start + offsets[j]]]++;
  }
  let totalHits = 0;
  let belowAll = true;
  for (let rail = 0; rail < 3; rail++) {
    const hits = collisionPairs(counts[rail]);
    nativePairs[rail][start] = hits;
    totalHits += hits;
    if (hits < nativeMin[rail]) {
      nativeMin[rail] = hits;
      nativeMinAt[rail] = start;
    }
    if (hits > nativeMax[rail]) nativeMax[rail] = hits;
    if (hits <= originalPairs[rail]) belowAll = false;
  }
  nativeTotals[start] = totalHits;
  if (belowAll) windowsBelowEachRail++;
  if (totalHits <= originalTotal) windowsAtOrBelowOriginal++;
  if (totalHits < totalMin) totalMin = totalHits;
  if (totalHits > totalMax) totalMax = totalHits;
}

function quantiles(values) {
  const sorted = Array.from(values).sort((a, b) => a - b);
  const at = (p) => sorted[Math.ceil(p * sorted.length) - 1];
  return {
    min: sorted[0],
    p01: at(0.01),
    p05: at(0.05),
    median: at(0.5),
    p95: at(0.95),
    max: sorted[sorted.length - 1]
  };
}
const nativeRailStats = nativePairs.map(quantiles);
const nativeTotalStats = quantiles(nativeTotals);
const perRailExcluded = originalPairs.every((value, rail) =>
  value < nativeMin[rail]);
const totalExcluded = originalTotal < totalMin;

// Exact planted positive: one global random bijection per rail, then exact
// inverse on every line, preserving all non-rune source framing characters.
function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function permutation(rand) {
  const a = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rand() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function replaceRunes(raw, indices) {
  let at = 0;
  return [...raw].map((ch) => {
    if (!runeIndex.has(ch)) return ch;
    assert.ok(at < indices.length);
    return corpus.runes[indices[at++]];
  }).join('');
}
function extractRunes(raw) {
  return [...raw].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch));
}
const keyRand = xorshift(0x2463c0de);
const keys = Array.from({length: 3}, () => permutation(keyRand));
const inverseKeys = keys.map((key) => {
  const inverse = new Array(29);
  for (let i = 0; i < 29; i++) inverse[key[i]] = i;
  return inverse;
});
const plant = native.slice(12345, 12345 + source.length);
const plantLines = [];
let plantAt = 0;
for (const n of lengths) {
  plantLines.push(plant.slice(plantAt, plantAt + n));
  plantAt += n;
}
const plantRawLines = rawLines.map((raw, i) => replaceRunes(raw, plantLines[i]));

function encryptRawLine(raw, plainLine) {
  const rails = [[], [], []];
  for (let j = 0; j < plainLine.length; j++) {
    const rail = j % 4 === 0 ? 0 : (j % 4 === 2 ? 2 : 1);
    rails[rail].push(keys[rail][plainLine[j]]);
  }
  return replaceRunes(raw, rails[0].concat(rails[1], rails[2]));
}
function decryptRawLine(rawCipher) {
  const cipherLine = extractRunes(rawCipher);
  const [n0, n1, n2] = rowLengths(cipherLine.length);
  const rail0 = cipherLine.slice(0, n0).map((x) => inverseKeys[0][x]);
  const rail1 = cipherLine.slice(n0, n0 + n1).map((x) => inverseKeys[1][x]);
  const rail2 = cipherLine.slice(n0 + n1).map((x) => inverseKeys[2][x]);
  const plain = new Array(cipherLine.length);
  let a = 0, b = 0, c = 0;
  for (let j = 0; j < plain.length; j++) {
    const rail = j % 4 === 0 ? 0 : (j % 4 === 2 ? 2 : 1);
    plain[j] = rail === 0 ? rail0[a++] : (rail === 1 ? rail1[b++] : rail2[c++]);
  }
  return replaceRunes(rawCipher, plain);
}
const plantedCipherRaw = plantRawLines.map((raw, i) => encryptRawLine(raw, plantLines[i]));
const plantedCipherLines = plantedCipherRaw.map(extractRunes);
const plantedRecoveredRaw = plantedCipherRaw.map(decryptRawLine);
assert.deepEqual(plantedRecoveredRaw, plantRawLines);
assert.deepEqual(
  pairVector(plainRailCounts(plant)),
  pairVector(ciphertextRailCounts(plantedCipherLines))
);
const framingPreserved = plantRawLines.every((raw, i) =>
  [...raw].filter((ch) => !runeIndex.has(ch)).join('') ===
  [...plantedCipherRaw[i]].filter((ch) => !runeIndex.has(ch)).join('')
);
assert.ok(framingPreserved);

// Independent uniform-pad null: one fresh uniform GP29 symbol at every
// original rune position, not a shared per-rail bijection.
const padRand = xorshift(0x33012463);
const limit = 0x100000000 - (0x100000000 % 29);
const padReps = 1000;
const padValues = [[], [], []];
const padTotals = [];
const padCounts = [new Uint16Array(29), new Uint16Array(29), new Uint16Array(29)];
for (let rep = 0; rep < padReps; rep++) {
  padCounts[0].fill(0);
  padCounts[1].fill(0);
  padCounts[2].fill(0);
  for (let i = 0; i < source.length; i++) {
    let x;
    do { x = padRand(); } while (x >= limit);
    padCounts[railMask[i]][x % 29]++;
  }
  const vector = pairVector(padCounts);
  for (let rail = 0; rail < 3; rail++) padValues[rail].push(vector[rail]);
  padTotals.push(vector[0] + vector[1] + vector[2]);
}
const padRailStats = padValues.map(quantiles);
const padTotalStats = quantiles(padTotals);
const padPercentileByRail = padValues.map((values, rail) =>
  values.filter((value) => value <= originalPairs[rail]).length / padReps);
const padTotalLowTail = padTotals.filter((value) => value <= originalTotal).length / padReps;

assert.ok(perRailExcluded);
assert.ok(totalExcluded);
assert.equal(windowsAtOrBelowOriginal, 0);
assert.equal(windowsBelowEachRail, 0);

console.log(JSON.stringify({
  model: 'line-local standard 3-rail zigzag; one shared bijective GP29 substitution per rail across all unknown pages; row-wise ciphertext; unchanged non-rune framing',
  source: {
    physicalPages: pages.length,
    runeBearingPages: pages.filter((page) => page.length > 0).length,
    physicalRuneLines: lines.length,
    unknownRunes: source.length,
    maximumLineLength: Math.max(...lengths),
    railSizes,
    originalRailCollisionPairs: originalPairs,
    originalTotalRailCollisionPairs: originalTotal
  },
  nativeRegister: {
    source: 'resources/control/gibran_prophet_58585.txt',
    gp29Runes: native.length,
    contiguousWindows: windows,
    railMinimum: nativeMin,
    railMinimumOffsets: nativeMinAt,
    railMaximum: nativeMax,
    railQuantiles: nativeRailStats,
    totalMinimum: totalMin,
    totalMaximum: totalMax,
    totalQuantiles: nativeTotalStats,
    windowsAtOrBelowOriginalTotal,
    windowsBelowAllThreeOriginalRailCounts: windowsBelowEachRail,
    perRailStrictlyBelowEveryNativeWindow: perRailExcluded,
    totalStrictlyBelowEveryNativeWindow: totalExcluded
  },
  plantedPositive: {
    deterministicSeed: '0x2463c0de',
    sharedBijections: 3,
    exactRuneRecovery: true,
    exactNonRuneFramingRecovery: true,
    allRailCollisionInvariantsPreserved: true,
    recoveredRunes: plant.length
  },
  independentUniformPadNull: {
    deterministicSeed: '0x33012463',
    replicates: padReps,
    railQuantiles: padRailStats,
    totalQuantiles: padTotalStats,
    originalPercentileByRail: padPercentileByRail,
    originalTotalLowTail: padTotalLowTail
  },
  decision: 'REJECT_THIS_EXACT_SHARED_THREE_RAIL_ALPHABET_MODEL_FOR_THE_TESTED_NATIVE_GP_REGISTER',
  scopeLimit: 'Does not exclude other transpositions, per-line/private alphabets, changing state, homophones, altered segmentation, non-GP plaintext, or an external key.'
}, null, 2));
