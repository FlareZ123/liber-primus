'use strict';

/**
 * SFT: original LP2 p13–p15 zero-doublet island against independent
 * nonzero-difference, lag-equality, word-seam and physical-cut signals.
 * Original input only; no plaintext model fitting or external packages.
 * Run: node sims/lp2_p13_p15_regime_changepoint_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const pages = book.pages.slice(0, 56);
const runes = new Map(book.runes.map((r, i) => [r, i]));
const tape = pages.flatMap((p) => p.indices);
assert.equal(tape.length, 12956);
assert.equal(pages.filter((p) => p.indices.length).length, 55);
const locations = [];
let before = '';
for (const c of transcription) {
  if (runes.has(c)) {
    locations.push({ value: runes.get(c), before });
    before = '';
  } else before += c;
}
assert.equal(locations.length, 13136);
assert.deepEqual(locations.slice(0, tape.length).map((x) => x.value), tape);

/** @param {number[]} data @returns {number[]} */
function hist(data) {
  const bins = Array(29).fill(0);
  for (const x of data) if (x >= 0) bins[x]++;
  return bins;
}
/** @param {number[]} values @returns {number[]} */
function deltas(values) {
  return values.slice(1).map((x, i) => (x - values[i] + 29) % 29);
}
const steps = pages.flatMap((p) => deltas(p.indices));
const allHist = hist(steps);
assert.equal(steps.length, 12901);
assert.equal(allHist[0], 86);
const p13to15 = pages.slice(13, 16);
const target = p13to15.flatMap((p) => p.indices);
const diff = p13to15.flatMap((p) => deltas(p.indices));
assert.equal(target.length, 568);
assert.equal(diff.length, 565);
assert.equal(hist(diff)[0], 0);

/** @param {number[]} a @param {number} lag */
function equalityLag(a, lag) {
  let n = 0;
  for (let i = lag; i < a.length; i++) if (a[i] === a[i - lag]) n++;
  return n;
}
const lag2 = p13to15.reduce((s, p) => s + equalityLag(p.indices, 2), 0);
const lag3 = p13to15.reduce((s, p) => s + equalityLag(p.indices, 3), 0);
assert.equal(lag2, 18);
assert.equal(lag3, 18);

/** Pearson statistic on nonzero delta values against original book rates. */
function chiNonzero(values, baseline) {
  const counts = hist(values);
  const total = values.length - counts[0];
  const B = baseline.reduce((s, x) => s + x, 0) - baseline[0];
  let score = 0;
  for (let i = 1; i < 29; i++) {
    const expected = total * baseline[i] / B;
    score += (counts[i] - expected) ** 2 / expected;
  }
  return score;
}
const originalChi = chiNonzero(diff, allHist);
assert.ok(Math.abs(originalChi - 26.69769518849451) < 1e-9);

const pageIds = pages.flatMap((p) => Array(p.indices.length).fill(p.page));
const dByRune = [], wordSeam = [];
let first = 0;
for (const p of pages) {
  for (let i = 0; i < p.indices.length; i++) {
    const pos = first + i;
    dByRune.push(i ? (p.indices[i] - p.indices[i - 1] + 29) % 29 : -1);
    wordSeam.push(i > 0 && /[-.]/u.test(locations[pos].before));
  }
  first += p.indices.length;
}
assert.equal(first, tape.length);
const allWordHist = hist(dByRune.filter((x, i) => wordSeam[i]));
const offset13 = pages.slice(0, 13).reduce((s, p) => s + p.indices.length, 0);
assert.equal(offset13, 3194);

/**
 * Score arbitrary windows without adding cross-page artificial transitions.
 * @param {number} start @param {number} size
 */
function windowScore(start, size) {
  const inner = [], word = [];
  let l2 = 0, l3 = 0, seamN = 0;
  for (let i = start; i < start + size; i++) {
    if (dByRune[i] >= 0) {
      inner.push(dByRune[i]);
      if (wordSeam[i]) { word.push(dByRune[i]); seamN++; }
    }
    if (i >= start + 2 && pageIds[i] === pageIds[i - 2] && tape[i] === tape[i - 2]) l2++;
    if (i >= start + 3 && pageIds[i] === pageIds[i - 3] && tape[i] === tape[i - 3]) l3++;
  }
  return {
    repeat: hist(inner)[0], lag2: l2, lag3: l3,
    nonzeroChi: chiNonzero(inner, allHist),
    wordSeamChi: chiNonzero(word, allWordHist),
    seams: seamN
  };
}
const observed = windowScore(offset13, target.length);
assert.equal(observed.lag2, lag2);
assert.equal(observed.lag3, lag3);
assert.equal(observed.seams, 126);
assert.ok(Math.abs(observed.wordSeamChi - 43.39420589724742) < 1e-9);
const controls = [];
for (let i = 0; i + target.length <= tape.length; i++) controls.push(windowScore(i, target.length));
assert.equal(controls.length, 12389);
/** @param {string} key @returns {object} */
function windowRanks(key) {
  const value = observed[key];
  return {
    atMost: controls.filter((x) => x[key] <= value).length,
    atLeast: controls.filter((x) => x[key] >= value).length,
    of: controls.length
  };
}
const ranks = Object.fromEntries(
  ['repeat', 'lag2', 'lag3', 'nonzeroChi', 'wordSeamChi', 'seams']
    .map((key) => [key, windowRanks(key)])
);

/** Within-page nonzero-delta G statistic for a three-physical-page window. */
function regionG(a, b) {
  let n = 0, N = 0, g = 0;
  for (const v of a) n += v;
  for (const v of b) N += v;
  for (let j = 1; j < 29; j++) {
    const q = n * b[j] / N;
    if (a[j] && q) g += 2 * a[j] * Math.log(a[j] / q);
  }
  return g;
}
const threePages = [];
for (let i = 0; i < 54; i++) {
  const ds = pages.slice(i, i + 3).flatMap((p) => deltas(p.indices).filter((x) => x !== 0));
  const counts = hist(ds);
  threePages.push({ firstPage: i, G: regionG(counts, allHist) });
}
const sourceThree = threePages.find((x) => x.firstPage === 13);
const groupGRank = threePages.filter((x) => x.G >= sourceThree.G).length;
assert.equal(groupGRank, 29);

/** Compare single shared 28-nonzero-state model with a p13–p15 rekey. */
const regionCounts = hist(diff);
const restCounts = allHist.map((x, i) => x - regionCounts[i]);
const N = steps.length - allHist[0];
const aN = diff.length;
let llr = 0;
for (let i = 1; i < 29; i++) {
  const p = allHist[i] / N;
  if (regionCounts[i]) llr += 2 * regionCounts[i] * Math.log(regionCounts[i] / (aN * p));
  if (restCounts[i]) llr += 2 * restCounts[i] * Math.log(restCounts[i] / ((N - aN) * p));
}
assert.ok(Math.abs(llr - 26.902577986036565) < 1e-9);
const bicPenaltyAdvantageShared = 27 * Math.log(N) - llr;

/** Page boundary signal: JS of 400 nonzero steps on each side of a cut. */
function js(a, b) {
  const A = a.reduce((s, x) => s + x, 0), B = b.reduce((s, x) => s + x, 0);
  let ans = 0;
  for (let i = 1; i < 29; i++) {
    const p = a[i] / A, q = b[i] / B, m = (p + q) / 2;
    if (p) ans += p * Math.log(p / m) / 2;
    if (q) ans += q * Math.log(q / m) / 2;
  }
  return ans;
}
const cuts = [0];
for (const p of pages) cuts.push(cuts.at(-1) + p.indices.length);
const cutSignals = [];
for (let cut = 1; cut < 56; cut++) {
  const at = cuts[cut];
  const left = dByRune.slice(Math.max(0, at - 400), at).filter((x) => x > 0);
  const right = dByRune.slice(at, Math.min(tape.length, at + 400)).filter((x) => x > 0);
  cutSignals.push({ cut, score: js(hist(left), hist(right)) });
}
const physicalCutRanks = [13, 14, 15, 16, 40].map((cut) => {
  const signal = cutSignals.find((x) => x.cut === cut);
  return { ...signal, highRank: cutSignals.filter((x) => x.score >= signal.score).length, of: 55 };
});

/**
 * Condition on original 86 equal-adjacent events; shuffle only their positions
 * among the 12,901 within-page slots while preserving real page lengths.
 * This null tests selection of any of 54 three-page windows, not the opcode.
 */
let seed = 0x7ed29eab;
function randomUnit() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const starts = [0], lens = pages.map((p) => Math.max(0, p.indices.length - 1));
for (const len of lens) starts.push(starts.at(-1) + len);
const tripleIntervals = Array.from({ length: 54 }, (_, i) => [starts[i], starts[i + 3]]);
let anyZero = 0, targetZero = 0;
const trials = 100000, K = allHist[0];
for (let t = 0; t < trials; t++) {
  const picked = new Set();
  for (let j = N + K - K; j < N + K; j++) {
    const candidate = Math.floor(randomUnit() * (j + 1));
    picked.add(picked.has(candidate) ? j : candidate);
  }
  const chosen = [...picked].sort((a, b) => a - b);
  let pointer = 0, hasZero = false;
  for (let i = 0; i < tripleIntervals.length; i++) {
    const [start, end] = tripleIntervals[i];
    while (pointer < K && chosen[pointer] < start) pointer++;
    const none = pointer === K || chosen[pointer] >= end;
    if (none) { hasZero = true; if (i === 13) targetZero++; }
  }
  if (hasZero) anyZero++;
}
assert.equal(anyZero, 60445);
assert.equal(targetZero, 2174);

/** Independently solved native-GP prose 568-rune windows as calibration. */
let nativeWindows = 0, nativeMinRepeat = Infinity;
for (const section of native.sections) {
  const values = [...section.source_text].filter((c) => runes.has(c)).map((c) => runes.get(c));
  for (let i = 0; i + target.length <= values.length; i++) {
    nativeWindows++;
    const repeat = hist(deltas(values.slice(i, i + target.length)))[0];
    nativeMinRepeat = Math.min(nativeMinRepeat, repeat);
  }
}
assert.equal(nativeWindows, 401);
assert.equal(nativeMinRepeat, 9);
const out = {
  source: 'LP2 original physical pp13-15',
  n: target.length, adjacentRepeat: observed.repeat, lag2: observed.lag2,
  lag3: observed.lag3, wordSeams: observed.seams,
  nonzeroDeltaChi: observed.nonzeroChi, wordSeamChi: observed.wordSeamChi,
  originalMatchedWindowRanks: ranks,
  physicalThreePageNonzeroGRank: { G: sourceThree.G, highRank: groupGRank, total: 54 },
  sharedVersusTwoRegimes: { llr, extraParameters: 27, bicAdvantageShared: bicPenaltyAdvantageShared },
  printedBoundaryRanks: physicalCutRanks,
  repeatPositionNull: { trials, fixedRepeats: K, anyZeroThreePage: anyZero, targetZero: targetZero },
  authenticSolvedControls: { windows: nativeWindows, minimumAdjacentRepeat: nativeMinRepeat }
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
