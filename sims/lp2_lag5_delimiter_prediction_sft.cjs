'use strict';

/**
 * Fixed original-ink delimiter prediction gate for LP2 Issue #917.
 * Two predeclared source-simple rules, p0-2 training plus untouched
 * p3-7 / p40-53 transfer. Run in Windows Node 22 from the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const glyphs = Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');
const valid = new Set(glyphs);
const pages = text.split('%');
assert.equal(pages.length, 57);
/** @param {string} s @returns {string[]} */
function wordsOf(s) {
  return s.replace(/[\/\s]/g, '').split(/[-.&$§]+/)
    .filter(w => w.length > 0 && Array.from(w).every(r => valid.has(r)));
}
const words = wordsOf(pages.slice(0, 55).join(''));
const runes = Array.from(words.join(''));
assert.equal(words.length, 2896);
assert.equal(runes.length, 12956);
assert.deepEqual(runes, corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices.map(i => glyphs[i])));
let cursor = 0;
const spans = words.map(word => {
  const start = cursor;
  cursor += word.length;
  return { start, end: cursor, length: word.length };
});
assert.equal(cursor, runes.length);
const boundaries = new Set(spans.map(w => w.end));

/** @param {string[]} a @param {number} start @param {number} end */
function predict(a, start, end) {
  const noCrossingEcho = new Set(), afterEchoRun = new Set();
  /** @param {number} k */
  const echo = k => k >= start + 5 && k < end && a[k] === a[k - 5];
  for (let gap = start + 1; gap < end; gap++) {
    let crossing = false;
    for (let k = gap; k < Math.min(end, gap + 5); k++) {
      crossing = crossing || echo(k);
    }
    if (!crossing) noCrossingEcho.add(gap);
    if (echo(gap - 1) && !echo(gap)) afterEchoRun.add(gap);
  }
  return { noCrossingEcho, afterEchoRun };
}
/** @param {Set<number>} predicted @param {Set<number>} trueBreaks @param {number} total */
function score(predicted, trueBreaks, total) {
  let tp = 0;
  for (const gap of predicted) if (trueBreaks.has(gap)) tp++;
  const fp = predicted.size - tp, fn = trueBreaks.size - tp;
  const tn = total - tp - fp - fn;
  assert(tn >= 0);
  return { predicted: predicted.size, tp, fp, fn, tn,
    precision: tp / (tp + fp) || 0, recall: tp / (tp + fn) || 0,
    f1: 2 * tp / (2 * tp + fp + fn) || 0,
    baselinePrecision: trueBreaks.size / total };
}
let seed = 0x0140f917;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number[]} lengths */
function permute(lengths) {
  const out = lengths.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/** @param {Set<number>} expected @param {number[]} lengths @param {number} start */
function countBreakMatches(expected, lengths, start) {
  let offset = start, hits = 0;
  for (let i = 0; i + 1 < lengths.length; i++) {
    offset += lengths[i];
    if (expected.has(offset)) hits++;
  }
  return hits;
}
/** @param {number[]} values @param {number} observed */
function nullStats(values, observed) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  return { mean, sd, z: (observed - mean) / sd,
    tail: (values.filter(x => x >= observed).length + 1) / (values.length + 1) };
}
const chapterSpecs = [
  ['training:p0-p2', 0, 729, 158],
  ['heldout:p3-p7', 729, 1874, 255],
  ['heldout:p40-p53', 9640, 12648, 669]
];
const results = [];
for (const [name, start, end, expectedWords] of chapterSpecs) {
  assert(start === 0 || boundaries.has(start));
  assert(boundaries.has(end));
  const lengths = spans.filter(w => w.start >= start && w.end <= end).map(w => w.length);
  assert.equal(lengths.length, expectedWords);
  assert.equal(lengths.reduce((a, b) => a + b, 0), end - start);
  const trueBreaks = new Set(spans.filter(w => w.end > start && w.end < end).map(w => w.end));
  assert.equal(trueBreaks.size, lengths.length - 1);
  const rules = Object.entries(predict(runes, start, end));
  const matches = rules.map(() => []);
  for (let run = 0; run < 3000; run++) {
    const shuffled = permute(lengths);
    rules.forEach(([rule, predicted], i) => {
      matches[i].push(countBreakMatches(predicted, shuffled, start));
    });
  }
  results.push({
    name, runes: end - start, words: lengths.length, breaks: trueBreaks.size,
    rules: rules.map(([rule, predicted], i) => {
      const classification = score(predicted, trueBreaks, end - start - 1);
      return { rule, ...classification, chapterWordLengthShuffle: nullStats(matches[i], classification.tp) };
    })
  });
}
assert.deepEqual(results.map(x => x.breaks), [157, 254, 668]);
assert.deepEqual(results.map(x => x.rules[0].tp), [136, 217, 567]);
assert.deepEqual(results.map(x => x.rules[1].tp), [5, 9, 31]);
assert.deepEqual(results.map(x => x.rules[0].predicted), [612, 993, 2506]);
assert.deepEqual(results.map(x => x.rules[1].predicted), [23, 30, 104]);

const solvedWords = wordsOf(pages[56]);
const solved = Array.from(solvedWords.join(''));
assert.deepEqual([solvedWords.length, solved.length], [20, 95]);
const solvedBreaks = new Set();
let solvedPosition = 0;
for (const word of solvedWords) {
  solvedPosition += word.length;
  if (solvedPosition < solved.length) solvedBreaks.add(solvedPosition);
}
const solvedP57Control = Object.entries(predict(solved, 0, 95))
  .map(([rule, predicted]) => ({ rule, ...score(predicted, solvedBreaks, 94) }));
const toy = Array.from('ABCDEABABCDEAB');
assert.equal(toy[5], toy[0]);
assert.equal(toy[6], toy[1]);
const toyPredict = predict(toy, 0, toy.length);
assert.equal(toyPredict.noCrossingEcho.has(4), false);
assert.equal(toyPredict.afterEchoRun.has(7), true);
console.log(JSON.stringify({
  scope: 'fixed original LP2 12956 runes and 2896 semantic words',
  seed: '0x0140f917', shufflesPerChapter: 3000,
  results, solvedP57Control, toyControl: true,
  unknownPlaintextRecovered: false
}, null, 2));
