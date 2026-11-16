'use strict';

/**
 * SFT: original LP2 printed-line start distribution versus independently measured glyph width.
 * Read-only, Windows Node.js 22 compatible; no network, generated files or CLI args.
 * Exact input: canonical original pp0..55 rune stream, physical line wraps, image ink-run widths.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const sourceWidths = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-line-start-ink-widths.json'), 'utf8'));
const pages = corpus.pages.filter((page) => page.page < 56 && page.indices.length);
const ciphertext = pages.flatMap((page) => page.indices);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const lines = transcript.split(/\r?\n/u).map((line) =>
  Array.from(line).filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune))
).filter((line) => line.length);
const originalLines = [];
let used = 0;
for (const line of lines) {
  if (used === ciphertext.length) break;
  originalLines.push(line);
  used += line.length;
}
assert.equal(ciphertext.length, 12956);
assert.equal(pages.length, 55);
assert.equal(used, ciphertext.length);
assert.equal(originalLines.length, 594);
assert.deepEqual(originalLines.flat(), ciphertext);
assert.equal(sourceWidths.modeInkRunWidthsPx.length, 29);

const starts = [];
let offset = 0;
for (const line of originalLines) {
  starts.push(offset);
  offset += line.length;
}
const counts = (xs) => {
  const out = Array(29).fill(0);
  for (const x of xs) out[x]++;
  return out;
};
const sourceCounts = counts(ciphertext);
const seen = counts(starts.map((i) => ciphertext[i]));
const sourceSize = ciphertext.length;
const sampleSize = starts.length;
const expectedPlain = sourceCounts.map((n) => sampleSize * n / sourceSize);
const inkWidths = sourceWidths.modeInkRunWidthsPx;
const denominator = sourceCounts.reduce((s, n, i) => s + n * inkWidths[i], 0);
const expectedWidth = sourceCounts.map((n, i) => sampleSize * n * inkWidths[i] / denominator);
const chi2 = (obs, expected) =>
  obs.reduce((sum, value, i) => sum + (value - expected[i]) ** 2 / expected[i], 0);
const corr = (x, y) => {
  const mx = x.reduce((a, b) => a + b, 0) / x.length;
  const my = y.reduce((a, b) => a + b, 0) / y.length;
  const numerator = x.reduce((s, a, i) => s + (a - mx) * (y[i] - my), 0);
  const xx = x.reduce((s, a) => s + (a - mx) ** 2, 0);
  const yy = y.reduce((s, a) => s + (a - my) ** 2, 0);
  return numerator / Math.sqrt(xx * yy);
};
const ioc = (hist) => {
  const n = hist.reduce((sum, x) => sum + x, 0);
  return hist.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
};
const baseline = chi2(seen, expectedPlain);
const widthScore = chi2(seen, expectedWidth);
const normalized = seen.map((value, i) => value / expectedPlain[i]);
const coefficient = corr(inkWidths, normalized);
console.log('LP2 original printed-line initial versus glyph width, fixed original inputs');
console.log(JSON.stringify({
  unknownRunes: sourceSize, originalPrintedLines: sampleSize, pageCount: pages.length,
  lineInitialIoC: ioc(seen), fullCipherIoC: ioc(sourceCounts),
  initialUnweightedChiSquare: baseline, initialWidthChiSquare: widthScore,
  widthToRelativeInitialFrequencyPearson: coefficient,
  sourceWidthInkRunPx: inkWidths, observedInitialCountByGPIndex: seen
}, null, 2));

let seed = 9177815;
/** Deterministic LCG with 2^32 state; used only for null sampling. */
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
let start = 0;
const groups = [];
for (const page of pages) {
  const localStarts = starts.filter((p) => p >= start && p < start + page.indices.length)
    .map((p) => p - start);
  groups.push({ runes: page.indices, localStarts });
  start += page.indices.length;
}
assert.equal(groups.reduce((s, g) => s + g.localStarts.length, 0), sampleSize);
const nTrials = 20000;
let phaseExceed = 0;
let lineExceed = 0;
let widthExceed = 0;
const cumulativeWidth = [];
let cumulative = 0;
for (const x of expectedWidth) {
  cumulative += x / sampleSize;
  cumulativeWidth.push(cumulative);
}
for (let trial = 0; trial < nTrials; trial++) {
  const phaseHist = Array(29).fill(0);
  for (const { runes, localStarts } of groups) {
    const shift = Math.floor(random() * runes.length);
    for (const position of localStarts) phaseHist[runes[(position + shift) % runes.length]]++;
  }
  if (ioc(phaseHist) >= ioc(seen)) phaseExceed++;
  const lineHist = Array(29).fill(0);
  for (const line of originalLines) lineHist[line[Math.floor(random() * line.length)]]++;
  if (ioc(lineHist) >= ioc(seen)) lineExceed++;
  const widthHist = Array(29).fill(0);
  for (let i = 0; i < sampleSize; i++) {
    const r = random();
    let low = 0;
    let high = 28;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (r < cumulativeWidth[mid]) high = mid;
      else low = mid + 1;
    }
    widthHist[low]++;
  }
  if (chi2(widthHist, expectedWidth) >= widthScore) widthExceed++;
}
console.log(JSON.stringify({
  trials: nTrials, randomSeed: 9177815,
  phaseShiftNullExceed: phaseExceed,
  phaseShiftNullUpperTailPlusOne: (phaseExceed + 1) / (nTrials + 1),
  independentWithinLineNullExceed: lineExceed,
  independentWithinLineNullUpperTailPlusOne: (lineExceed + 1) / (nTrials + 1),
  widthWeightedMultinomialExceed: widthExceed,
  widthWeightedMultinomialUpperTailPlusOne: (widthExceed + 1) / (nTrials + 1)
}, null, 2));
assert.equal(baseline > widthScore, true);
assert.ok(coefficient > 0.7);
console.log('PASS: the line-start enrichment is substantially accounted for by independent glyph ink widths.');
