'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const KEY = [10, 2, 14, 7, 19, 6, 18, 12, 7, 8, 17, 0, 19, 7, 14, 18, 14, 19, 13, 0, 1, 2, 0];

const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((t, i) => ({t, i})).sort((a, b) => b.t.length - a.t.length);

function nativeGp(text) {
  const start = /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);
  const end = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);
  const out = [];
  const body = text.slice(start ? start.index + start[0].length : 0, end ? end.index : text.length);

  for (const raw of body.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const v = word.startsWith('ING', j)
        ? {t: 'ING', i: 21}
        : word.startsWith('IO', j)
          ? {t: 'IO', i: 27}
          : tokens.find(x => word.startsWith(x.t, j));
      assert(v, 'cannot tokenize ' + word.slice(j));
      out.push(v.i);
      j += v.t.length;
    }
  }
  return out;
}

function decodeSection(section) {
  const out = [];
  for (const line of section.split(/\r?\n/).filter(Boolean)) {
    let j = 0;
    for (const ch of Array.from(line)) {
      const c = runeIndex.get(ch);
      if (c === undefined) continue;
      out.push((c - KEY[j++ % KEY.length] + 29) % 29);
    }
  }
  return out;
}

function meanLogLikelihood(xs, logp) {
  return xs.reduce((s, x) => s + logp[x], 0) / xs.length;
}

function rollingTail(tape, n, target, logp) {
  assert(tape.length >= n);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += logp[tape[i]];
  let windows = 1;
  let betterOrEqual = sum / n >= target ? 1 : 0;
  let worst = sum / n;
  let best = sum / n;

  for (let i = n; i < tape.length; i++) {
    sum += logp[tape[i]] - logp[tape[i - n]];
    const score = sum / n;
    windows++;
    if (score >= target) betterOrEqual++;
    worst = Math.min(worst, score);
    best = Math.max(best, score);
  }
  return {windows, betterOrEqual, worst, best};
}

function main() {
  const train = nativeGp(read('resources/control/gibran_prophet_58585.txt'));
  const holdouts = [
    ['Shakespeare', nativeGp(read('resources/control/shakespeare_first300k.txt'))],
    ['Emerson', nativeGp(read('resources/control/emerson_essays_2944.txt'))]
  ];

  const freq = Array(29).fill(0);
  for (const x of train) freq[x]++;
  const logp = freq.map(v => Math.log((v + 1) / (train.length + 29)));

  const sections = read('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
  assert.equal(sections.length, 57);

  const pages = [];
  for (let s = 0; s < 55; s++) {
    const page = s < 50 ? s : s + 1;
    const decoded = decodeSection(sections[s]);
    const originalScore = meanLogLikelihood(decoded, logp);

    let windows = 0;
    let betterOrEqual = 0;
    let worstHoldout = Infinity;
    let bestHoldout = -Infinity;
    const donors = [];

    for (const [name, tape] of holdouts) {
      const e = rollingTail(tape, decoded.length, originalScore, logp);
      windows += e.windows;
      betterOrEqual += e.betterOrEqual;
      worstHoldout = Math.min(worstHoldout, e.worst);
      bestHoldout = Math.max(bestHoldout, e.best);
      donors.push({name, ...e});
    }

    assert.equal(betterOrEqual, windows, 'page ' + page + ' unexpectedly overlaps held-out native register');

    pages.push({
      page,
      n: decoded.length,
      originalScore,
      windows,
      betterOrEqual,
      empiricalTail: betterOrEqual / windows,
      worstHoldout,
      bestHoldout,
      donors
    });
  }

  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, x) => s + x.n, 0), 12956);

  const closest = pages.slice().sort((a, b) => b.originalScore - a.originalScore)[0];
  const farthest = pages.slice().sort((a, b) => a.originalScore - b.originalScore)[0];

  console.log(JSON.stringify({
    schema: 'lp2-2012-reddit-line-shift-page-local-v1',
    model: 'add-one-smoothed GP29 unigram mean log likelihood, trained on Gibran only',
    holdout: ['Shakespeare', 'Emerson'],
    exactTransfer: 'P=C-k mod29, 23-key historical schedule, reset each physical line',
    pagesTested: pages.length,
    runesTested: pages.reduce((s, x) => s + x.n, 0),
    allPagesBelowEverySameLengthHoldoutWindow: pages.every(x => x.betterOrEqual === x.windows),
    closestOriginalPage: {
      page: closest.page, n: closest.n, originalScore: closest.originalScore,
      worstHoldout: closest.worstHoldout, windows: closest.windows
    },
    farthestOriginalPage: {
      page: farthest.page, n: farthest.n, originalScore: farthest.originalScore,
      worstHoldout: farthest.worstHoldout, windows: farthest.windows
    },
    pages
  }, null, 2));
}

if (require.main === module) main();
module.exports = {KEY, nativeGp, decodeSection, meanLogLikelihood, rollingTail};
