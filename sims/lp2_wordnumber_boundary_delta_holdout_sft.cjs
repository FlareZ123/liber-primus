'use strict';

/**
 * A bounded original-cipher gate for the signed 2016 "words ... numbers ...
 * direction" clue: can the printed preceding word's length or GP prime sum
 * predict the directed GP29 change over an original hyphen boundary?
 *
 * Native original p0-p39 trains any secret 29-state lookup; p40-p53 is never
 * used to select a symbol or mapping. The four direct +/- integer rules
 * are independently frozen and evaluated on both sets.
 *
 * Windows 11 Node 22: run this single file from the repository root.
 * Reads canonical sources, writes nothing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(book.runes.map((r, i) => [r, i]));
/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;
const wantedPages = book.pages.filter((p) => p.page <= 55);
assert.equal(wantedPages.length, 56);
const canonical = wantedPages.flatMap((p) => p.indices);
assert.equal(canonical.length, 12956);
const pageStarts = new Map();
let pageHead = 0;
for (const page of wantedPages) {
  pageStarts.set(page.page, pageHead);
  pageHead += page.indices.length;
}
/** @param {number} offset @returns {number} */
function pageOf(offset) {
  for (let p = 55; p >= 0; p--) {
    if (offset >= pageStarts.get(p)) return p;
  }
  throw new Error('bad rune offset');
}
/** @type {{delta:number,length:number,sum:number,page:number}[]} */
const edges = [];
/** @type {number[]} */
const reconstructed = [];
let runeCount = 0;
let wordCount = 0;
let paragraphCount = 0;
const paragraphs = source.replace(/[\/\\%\s]/g, '').split(/[.&$§]+/);
for (const paragraph of paragraphs) {
  if (runeCount === canonical.length) break;
  const words = paragraph.split('-')
    .map((raw) => Array.from(raw).filter((r) => runeIndex.has(r))
      .map((r) => runeIndex.get(r)))
    .filter((word) => word.length > 0);
  if (words.length === 0) continue;
  const size = words.reduce((n, w) => n + w.length, 0);
  assert.ok(runeCount + size <= canonical.length);
  paragraphCount++;
  /** @type {number[] | null} */
  let previous = null;
  for (const word of words) {
    if (previous) {
      const primeSum = previous.reduce((n, r) => n + book.prime[r], 0);
      edges.push({
        delta: mod29(word[0] - previous[previous.length - 1]),
        length: previous.length,
        sum: mod29(primeSum),
        page: pageOf(runeCount - 1),
      });
    }
    reconstructed.push(...word);
    runeCount += word.length;
    wordCount++;
    previous = word;
  }
}
assert.deepEqual(reconstructed, canonical);
assert.equal(wordCount, 2896);
assert.equal(paragraphCount, 175);
assert.equal(edges.length, 2721);

// Exact impossibility witnesses on the original first 35 runes, without
// training, language assumptions, any secret lookup, or cross-page changes.
// Within p0, length-3 predecessors occur with two distinct GP29 deltas (10,7);
// previous-prime-sum 12 occurs with distinct deltas (7,8).
const firstLength3 = edges.filter((e) => e.page === 0 && e.length === 3)
  .slice(0, 2).map((e) => e.delta);
const firstPrime12 = edges.filter((e) => e.page === 0 && e.sum === 12)
  .slice(0, 2).map((e) => e.delta);
assert.deepEqual(firstLength3, [10, 7]);
assert.deepEqual(firstPrime12, [7, 8]);
const exactContradictions = {
  samePage: 0,
  precedingLength3: {
    predecessorGlobalOffsets: [17, 20],
    nextRuneOffsets: [20, 23],
    forcedDifferences: firstLength3,
  },
  precedingGPPrimeSumMod29_12: {
    predecessorGlobalOffsets: [20, 23],
    nextRuneOffsets: [23, 34],
    forcedDifferences: firstPrime12,
  },
  conclusion: 'No fixed deterministic number-to-boundary-delta lookup exists even for original p0',
};
const train = edges.filter((e) => e.page < 40);
const holdout = edges.filter((e) => e.page >= 40 && e.page <= 53);
assert.equal(train.length, 2031);
assert.equal(holdout.length, 626);

/**
 * Train an arbitrary public-value -> delta table on only p0-p39.
 * Ties choose lowest GP index; empty states use global-majority baseline.
 * @param {{delta:number,length:number,sum:number}[]} data
 * @param {'length' | 'sum'} feature
 * @returns {{prediction:number[],baseline:number}}
 */
function fit(data, feature) {
  const rows = Array.from({length: 29}, () => Array(29).fill(0));
  const totals = Array(29).fill(0);
  for (const edge of data) {
    rows[mod29(edge[feature])][edge.delta]++;
    totals[edge.delta]++;
  }
  const baseline = totals.indexOf(Math.max(...totals));
  const prediction = rows.map((row) =>
    row.some((n) => n > 0) ? row.indexOf(Math.max(...row)) : baseline);
  return {prediction, baseline};
}
/** @param {{delta:number,length:number,sum:number}[]} data
 *  @param {'length'|'sum'} feature
 *  @param {ReturnType<typeof fit>} model
 *  @returns {{selected:number, baseline:number}} */
function score(data, feature, model) {
  let selected = 0;
  let baseline = 0;
  for (const edge of data) {
    selected += Number(model.prediction[mod29(edge[feature])] === edge.delta);
    baseline += Number(model.baseline === edge.delta);
  }
  return {selected, baseline};
}
/** @param {{delta:number,length:number,sum:number}[]} data
 *  @returns {{lengthPlus:number,lengthMinus:number,sumPlus:number,sumMinus:number}} */
function direct(data) {
  return {
    lengthPlus: data.filter((x) => x.delta === mod29(x.length)).length,
    lengthMinus: data.filter((x) => x.delta === mod29(-x.length)).length,
    sumPlus: data.filter((x) => x.delta === x.sum).length,
    sumMinus: data.filter((x) => x.delta === mod29(-x.sum)).length,
  };
}
const lengthModel = fit(train, 'length');
const sumModel = fit(train, 'sum');
const lengthHold = score(holdout, 'length', lengthModel);
const sumHold = score(holdout, 'sum', sumModel);
assert.deepEqual(lengthHold, {selected: 21, baseline: 29});
assert.deepEqual(sumHold, {selected: 17, baseline: 29});
assert.deepEqual(direct(holdout), {
  lengthPlus: 22, lengthMinus: 23, sumPlus: 24, sumMinus: 14,
});

// Positive control: a genuinely length- or sum-controlled boundary delta is
// recovered from untouched training edges and transferred without any tuning.
const synthetic = {};
for (const feature of ['length', 'sum']) {
  const plant = (data) => data.map((e) =>
    ({...e, delta: mod29(3 * e[feature] + 7)}));
  const syntheticModel = fit(plant(train), feature);
  synthetic[feature] = score(plant(holdout), feature, syntheticModel).selected;
  assert.equal(synthetic[feature], holdout.length);
}

console.log(JSON.stringify({
  status: 'bounded original-cipher negative, no plaintext or key',
  source: 'original 12956 runes, 2896 printed words, 175 punctuation spans',
  boundaryCount: edges.length,
  exactContradictions,
  calibration: {training: train.length, holdout: holdout.length},
  directTrain: direct(train),
  directHoldout: direct(holdout),
  lengthLookup: {train: score(train, 'length', lengthModel),
    holdout: lengthHold},
  gpPrimeSumLookup: {train: score(train, 'sum', sumModel),
    holdout: sumHold},
  syntheticPositive: synthetic,
}, null, 2));
