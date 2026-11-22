/**
 * Chapter-start repeated-pad test for authentic LP2 GP29 ciphertext.
 *
 * Source-key premise: a single additive GP29 keystream reused from key
 * pointer zero at each of the NINE source-marked chapter starts. Under
 * no-skip encryption, aligned ciphertext differences cancel that key.
 * Under p56's authentic plaintext-F-transparent variant, all ciphertext
 * index-zero observations may conceal a bypass, so a pair-HMM sums their
 * possible alignments while preserving key-order synchrony.
 *
 * Both methods use a source-native GP29 English model trained exclusively
 * on noneditorial LP1 plaintext-reference sections (2797 GP29 glyphs), with reference-section-contained controls.
 * Both are calibrated on planted same-pad LP1 text and on matched nulls.
 * The source-native convention includes ING -> NG and IO -> IA, as printed in LP1 p5 FUNCTION.
 * Exclude editorial-only reference sections 4, 7 and 8 and bracketed continuation notes.
 * Original first-300 scores are compared to the maximum over ALL 36 pairs
 * in independent 300-rune offsets of the very same original chapter streams.
 *
 * Key-free screening only: an exact ciphertext forward/inverse test requires
 * a independently specified keystream. This instrument is not a decoder.
 *
 * Run: node sims/lp2_chapter_start_keyreuse_original_sft.cjs
 * Inputs: resources/liber-primus/lp2-corpus.json
 *         resources/liber-primus/lp1-plaintext-reference.txt
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterPages.map(([a, b]) =>
  corpus.pages.slice(a, b + 1).flatMap((page) => page.indices));
const lengths = chapters.map((x) => x.length);
assert.deepEqual(lengths, [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(lengths.reduce((a, b) => a + b), 12956);

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text */
function nativeGP(text) {
  const source = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of source.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        result.push(27);
        i += 2;
      } else {
        const t = tokens.find((x) => word.startsWith(x.s, i));
        assert(t, 'Unmapped authentic solved-source word ' + word);
        result.push(t.i);
        i += t.s.length;
      }
    }
  }
  return result;
}
assert.deepEqual(nativeGP('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);
assert.deepEqual(nativeGP('DECEPTION'), [23, 18, 5, 18, 13, 16, 27, 9]);
const sourceReference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const sourceSections = [...sourceReference.matchAll(/^###\s+(\d+)\s*$/gm)];
const solvedPages = sourceSections.map((match, index) => {
  const start = match.index + match[0].length;
  const end = index + 1 < sourceSections.length
    ? sourceSections[index + 1].index : sourceReference.length;
  return { page: Number(match[1]),
    text: sourceReference.slice(start, end).replace(/^#.*$/gm, '')
      .replace(/^\s*\[.*\]\s*$/gm, '') };
}).filter(section => section.page >= 1 && section.page <= 16 && ![4, 7, 8].includes(section.page));
assert.deepEqual(solvedPages.map(section => section.page),
  [1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
const solvedPageStreams = solvedPages.map(section => ({
  page: section.page, runes: nativeGP(section.text)
}));
const solved = solvedPageStreams.flatMap(section => section.runes);
assert.equal(solved.length, 2797);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function quantiles(xs) {
  const a = xs.slice().sort((x, y) => x - y);
  const pick = (q) => a[Math.floor(q * a.length)];
  return { min: a[0], p05: pick(0.05), median: pick(0.5),
    p95: pick(0.95), max: a[a.length - 1] };
}

const count = Array(29).fill(1);
solved.forEach((x) => count[x]++);
const total = count.reduce((a, b) => a + b, 0);
const marginalPlain = count.map((v) => v / total);
const qAll = Array(29).fill(0);
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    qAll[(a - b + 29) % 29] += marginalPlain[a] * marginalPlain[b];
  }
}
const directLog = qAll.map((x) => Math.log(29 * x));

/** Key cancels when both chapter clocks start at position zero. */
function directScore(a, b, offsetA, offsetB, n) {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += directLog[(a[i + offsetA] - b[i + offsetB] + 29) % 29];
  }
  return total / n;
}

function pairsScore(score, n, offsets) {
  let max = -Infinity, argmax = null;
  const all = [];
  for (let i = 0; i < chapters.length; i++) {
    for (let j = i + 1; j < chapters.length; j++) {
      const value = score(chapters[i], chapters[j], offsets[i], offsets[j], n);
      all.push({ pair: [i, j], value });
      if (value > max) { max = value; argmax = [i, j]; }
    }
  }
  return { max, argmax, all };
}

const n0 = 300;
const atStart = Array(9).fill(0);
const directOriginal = pairsScore(directScore, n0, atStart);
const directRand = rng(3301);
const directMaxNull = [];
for (let rep = 0; rep < 5000; rep++) {
  const offsets = chapters.map((c) =>
    Math.floor(directRand() * (c.length - n0 + 1)));
  directMaxNull.push(pairsScore(directScore, n0, offsets).max);
}
const directExceed = directMaxNull.filter((v) => v >= directOriginal.max).length;
const fullDirect = directOriginal.all.map(({ pair: [i, j] }) => ({
  pair: [i, j],
  n: Math.min(chapters[i].length, chapters[j].length),
  score: directScore(chapters[i], chapters[j], 0, 0,
    Math.min(chapters[i].length, chapters[j].length))
})).sort((a, b) => b.score - a.score);

// Historic p56 requires bypassing plaintext F (GP index zero), without
// consuming a keystream symbol. A ciphertext F may ALSO be encrypted.
// Train its base frequency once from authentic source, without original
// unknown-page tuning. qNonF is the difference distribution conditional
// on both paired plaintext symbols consuming a key step.
const f = marginalPlain[0];
const pNonF = marginalPlain.map((v, i) => i === 0 ? 0 : v / (1 - f));
const qNonF = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) {
    qNonF[(a - b + 29) % 29] += pNonF[a] * pNonF[b];
  }
}
const cipherMarginal = Array(29).fill((1 - f) / 29);
cipherMarginal[0] += f;
const skipLog = Math.log(f / cipherMarginal[0]);
const matchLog = Array.from({ length: 29 }, (_, a) =>
  Array.from({ length: 29 }, (_, b) =>
    Math.log(((1 - f) ** 2 / 29 * qNonF[(a - b + 29) % 29])
      / (cipherMarginal[a] * cipherMarginal[b]))));

function logAdd(a, b) {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  return a > b ? a + Math.log1p(Math.exp(b - a))
    : b + Math.log1p(Math.exp(a - b));
}

/**
 * Exact log-sum forward alignment of an observed prefix pair.
 *
 * Each key step pairs two encrypted NON-F plaintext runes; their GP29
 * ciphertext difference cancels the unknown, shared key. Each ciphertext
 * F may instead be a bypass with no clock advancement. Every alignment
 * is counted once by canonicalizing optional bypasses as A then B before
 * the next shared consumed key step. The first observed prefix ending
 * terminates pairing; leftover symbols in the other prefix have unknown
 * unpaired keystream and cancel from the likelihood ratio.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} oa
 * @param {number} ob
 * @param {number} n
 */
function skipAwareScore(a, b, oa, ob, n) {
  const W = n + 1, size = W * W;
  const beforeB = new Float64Array(size).fill(-Infinity);
  const afterB = new Float64Array(size).fill(-Infinity);
  beforeB[0] = 0;
  let terminal = -Infinity;
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const at = i * W + j;
      const x = beforeB[at], y = afterB[at];
      if (x === -Infinity && y === -Infinity) continue;
      if (i === n || j === n) {
        terminal = logAdd(terminal, logAdd(x, y));
        continue;
      }
      beforeB[at + W + 1] = logAdd(
        beforeB[at + W + 1],
        logAdd(x, y) + matchLog[a[i + oa]][b[j + ob]]
      );
      if (a[i + oa] === 0 && x !== -Infinity) {
        beforeB[at + W] = logAdd(beforeB[at + W], x + skipLog);
      }
      if (b[j + ob] === 0) {
        afterB[at + 1] = logAdd(afterB[at + 1],
          logAdd(x, y) + skipLog);
      }
    }
  }
  return terminal / n;
}
function samePadEncode(p, k) {
  let at = 0;
  return p.map((v) => v === 0 ? 0 : (v + k[at++]) % 29);
}
// Positive/negative controls are drawn only from 300-rune windows wholly
// inside an LP1 page; no synthetic page-boundary joins enter the controls.
const controlWindows = [];
for (const page of solvedPageStreams) {
  for (let start = 0; start + n0 <= page.runes.length; start++) {
    controlWindows.push({ page: page.page, start,
      runes: page.runes.slice(start, start + n0) });
  }
}
assert.equal(controlWindows.length, 677);
const controlRand = rng(9961), controlPositive = [], controlNegative = [];
for (let trial = 0; trial < 120; trial++) {
  let A, B;
  do {
    A = controlWindows[Math.floor(controlRand() * controlWindows.length)];
    B = controlWindows[Math.floor(controlRand() * controlWindows.length)];
  } while (A.page === B.page && Math.abs(A.start - B.start) < n0);
  const pA = A.runes, pB = B.runes;
  const same = Array.from({ length: n0 }, () => Math.floor(controlRand() * 29));
  const wrong = Array.from({ length: n0 }, () => Math.floor(controlRand() * 29));
  const ca = samePadEncode(pA, same), cb = samePadEncode(pB, same);
  const independent = samePadEncode(pB, wrong);
  controlPositive.push(skipAwareScore(ca, cb, 0, 0, n0));
  controlNegative.push(skipAwareScore(ca, independent, 0, 0, n0));
}

const skipOriginal = pairsScore(skipAwareScore, n0, atStart);
const skipRand = rng(8181), skipMaxNull = [];
for (let rep = 0; rep < 75; rep++) {
  const offsets = chapters.map((c) =>
    Math.floor(skipRand() * (c.length - n0 + 1)));
  skipMaxNull.push(pairsScore(skipAwareScore, n0, offsets).max);
}
const skipExceed = skipMaxNull.filter((v) => v >= skipOriginal.max).length;
const frozenPrefixTop = skipOriginal.all.slice()
  .sort((a, b) => b.value - a.value).slice(0, 7);
const wholeWindow = frozenPrefixTop.map(({ pair: [i, j], value }) => {
  const maxN = Math.min(chapters[i].length, chapters[j].length);
  return { pair: [i, j], first300: value, fullN: maxN,
    fullScore: skipAwareScore(chapters[i], chapters[j], 0, 0, maxN) };
});

console.log(JSON.stringify({
  corpus: 'resources/liber-primus/lp2-corpus.json',
  modelSource: 'resources/liber-primus/lp1-plaintext-reference.txt',
  trainingRunes: solved.length,
  trainingPages: solvedPageStreams.map(page => page.page),
  pageContainedControlWindows: controlWindows.length,
  nineChapterRunes: lengths,
  genuineP56PlaintextFBypass: true,
  plainFRate: f,
  direct: {
    first300: { best: directOriginal.max, pair: directOriginal.argmax },
    sourcePreservingNull: { trials: 5000, exceeded: directExceed,
      pFamilywise: (directExceed + 1) / 5001,
      maximumQuantiles: quantiles(directMaxNull) },
    originalCompletePairScores: fullDirect
  },
  transparentF: {
    sameKeySolvedSourcePositive: quantiles(controlPositive),
    independentKeySolvedSourceNegative: quantiles(controlNegative),
    first300: { best: skipOriginal.max, pair: skipOriginal.argmax },
    sourcePreservingNull: { trials: 75, exceeded: skipExceed,
      pFamilywise: (skipExceed + 1) / 76,
      maximumQuantiles: quantiles(skipMaxNull) },
    first300Top7Completed: wholeWindow
  }
}, null, 2));
