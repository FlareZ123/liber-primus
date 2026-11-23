'use strict';

/**
 * Original LP2 anti-repeat exceptions vs. forward word-length changes.
 * Key-independent causal gate: before reading E_i as a hidden "direction"
 * channel, condition on the current word's own length, which mechanically
 * controls the number of chances to see its internal repeated-rune events.
 *
 * This extends, but does not overwrite, the exact source fact in the earlier
 * lp2_wordlength_delta_exception_mi_sft.cjs. The source book and chapter
 * assignments, event definition and current/next-word eligibility match it.
 *
 * Portable Windows Node22 SFT. No external dependencies or file writes.
 */
const assert = require('node:assert/strict');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const { words, runeCount, crossPageWords } = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);

const RANGES = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
/** @param {number} page */
const chapter = page => RANGES.findIndex(([first, last]) =>
  page >= first && page <= last);
assert(words.every(w => chapter(w.startPage) >= 0));

/** @typedef {{L:number,N:number,E:number,ch:number}} Row */
/** @type {Row[]} */
const rows = [];
let totalInternal = 0;
let totalBoundary = 0;
for (let i = 0; i < words.length; i++) {
  const w = words[i].runes;
  let internal = 0;
  for (let j = 1; j < w.length; j++) {
    if (w[j] === w[j - 1]) internal++;
  }
  totalInternal += internal;
  const next = words[i + 1];
  const after = next && w.at(-1) === next.runes[0] ? 1 : 0;
  totalBoundary += after;
  if (next && chapter(words[i].startPage) === chapter(next.startPage)) {
    rows.push({
      L: words[i].length,
      N: next.length,
      E: internal + after,
      ch: chapter(words[i].startPage)
    });
  }
}
assert.equal(totalInternal, 63);
assert.equal(totalBoundary, 23);
assert.equal(rows.length, 2887);

/** @param {(number|string)[]} a */
function entropy(a) {
  const counts = new Map();
  for (const value of a) counts.set(value, (counts.get(value) || 0) + 1);
  let bits = 0;
  for (const count of counts.values()) {
    const p = count / a.length;
    bits -= p * Math.log2(p);
  }
  return bits;
}

/**
 * Empirical mutual information in bits, retaining the reference statistic.
 * @param {(number|string)[]} a
 * @param {(number|string)[]} b
 */
function mi(a, b) {
  assert.equal(a.length, b.length);
  return entropy(a) + entropy(b) -
    entropy(a.map((v, i) => v + ':' + b[i]));
}

const nextLength = rows.map(r => r.N);
const length = rows.map(r => r.L);
const chapterIndex = rows.map(r => r.ch);
const deltaNext = rows.map(r => r.N - r.L);
const originalE = rows.map(r => r.E);
const lengthChapter = rows.map(r => r.ch + ':' + r.L);
const lengthChapterNext = rows.map(r => r.ch + ':' + r.L + ':' + r.N);

function measures(e) {
  return {
    rawMI: mi(e, deltaNext),
    conditionalLengthMI:
      mi(e, rows.map(r => r.L + ':' + r.N)) - mi(e, length),
    conditionalLengthChapterMI:
      mi(e, lengthChapterNext) - mi(e, lengthChapter)
  };
}
const observed = measures(originalE);
assert(Math.abs(observed.rawMI - 0.019451) < 0.00001);

// Preserve the true local exception-count histogram *for each fixed
// (chapter, current printed word length) class*. The next word's length
// and its order stay frozen; only E's assignment can vary. Shuffling
// without conditioning on current L confounds opportunity with encoding.
const classes = new Map();
for (let i = 0; i < rows.length; i++) {
  const key = lengthChapter[i];
  if (!classes.has(key)) classes.set(key, []);
  classes.get(key).push(i);
}
const classGroups = [...classes.values()];
let state = 0x33011456;
function rng(n) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % n;
}

/** @param {number[]} e */
function shuffleFixedLength(e) {
  const out = e.slice();
  for (const group of classGroups) {
    const moved = group.map(i => e[i]);
    for (let i = moved.length - 1; i > 0; i--) {
      const j = rng(i + 1);
      [moved[i], moved[j]] = [moved[j], moved[i]];
    }
    for (let j = 0; j < group.length; j++) out[group[j]] = moved[j];
  }
  return out;
}

/**
 * This calibrated positive is intentionally an artificial encoder:
 * keep the original 0/1/2 exception counts within every (L,chapter)
 * class but assign the exception labels preferentially to smallest
 * next lengths. If a forward length side channel existed with strong
 * target dependence, the conditional test must respond.
 */
function positive() {
  const source = originalE.slice();
  for (const group of classGroups) {
    const values = group.map(i => originalE[i]).sort((a, b) => b - a);
    const target = group.slice().sort((a, b) =>
      rows[a].N - rows[b].N || a - b);
    for (let j = 0; j < group.length; j++) source[target[j]] = values[j];
  }
  return source;
}
const positiveE = positive();
const planted = measures(positiveE);
assert(planted.conditionalLengthChapterMI > observed.conditionalLengthChapterMI);

const TRIALS = 10000;
/** @param {number[]} source */
function experiment(source) {
  const target = measures(source);
  const metrics = ['rawMI', 'conditionalLengthMI', 'conditionalLengthChapterMI'];
  const summary = Object.fromEntries(metrics.map(k => [k,
    { observed: target[k], sum: 0, sumSq: 0, ge: 0 }
  ]));
  for (let trial = 0; trial < TRIALS; trial++) {
    const shuffled = measures(shuffleFixedLength(source));
    for (const metric of metrics) {
      const cell = summary[metric], value = shuffled[metric];
      cell.sum += value;
      cell.sumSq += value * value;
      if (value >= cell.observed) cell.ge++;
    }
  }
  return Object.fromEntries(metrics.map(k => {
    const { observed, sum, sumSq, ge } = summary[k];
    const mean = sum / TRIALS;
    return [k, {
      observed, matchedNullMean: mean,
      matchedNullSD: Math.sqrt(Math.max(0, sumSq / TRIALS - mean * mean)),
      atLeastObserved: ge,
      trials: TRIALS,
      pUpper: (ge + 1) / (TRIALS + 1)
    }];
  }));
}
const original = experiment(originalE);
const positiveResult = experiment(positiveE);
assert(original.conditionalLengthChapterMI.pUpper > 0.025,
  'conditional length-channel result changed: investigate');
assert(positiveResult.conditionalLengthChapterMI.pUpper < 0.001,
  'planted forward side-channel was not detected');

console.log(JSON.stringify({
  status: 'PASS',
  source: 'Original 2,896 LP2 complete words; 12,956 runes; 32 page carries',
  originalExceptionEvents: totalInternal + totalBoundary,
  eligibleAdjacentWordPairs: rows.length,
  conditionedClasses: classes.size,
  hiddenExceptionLabels: originalE.filter(x => x > 0).length,
  nullDescription: 'within each fixed original chapter and exact current-word length, shuffle existing E counts; keep following word lengths, book and source glyphs frozen',
  original,
  sideChannelPlantedControl: positiveResult,
  interpretation: 'Unadjusted forward delta MI does not establish recoverable repeat-exception side information. The event has intrinsically more opportunities in long current words; conditional MI must be evaluated against a length-matched null.'
}, null, 2));
