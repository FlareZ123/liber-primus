/**
 * LP2 p50 doublet second-state test, frozen physical printed-line and
 * printed-punctuation parity clocks, with complete untouched p27..p55 holdout.
 * No original rune values inform clock definitions or event-site tie breakers.
 * Windows 11 / Node.js 22 / CommonJS, read-only single-file test.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const GP = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json')).rows.flat();
const source = read('resources/transcriptions/lp2-image-corrected.txt')
  .split('%').slice(0, 55).join('%');
const runeIndex = new Map(GP.runes.map((rune, i) => [rune, i]));
assert.equal(table.length, 256);
assert.equal(table.filter(cell => cell[0] === '0').length, 60);

/*
 * Both state bits come exclusively from visible source layout:
 * - physical printed line parity toggles at '/', resets on page '%';
 * - full-stop/chapter-mark parity toggles at '.' or '&', resets on page '%'.
 * Delimiter locations and resets are frozen independent of doublet positions.
 */
const actualRuneTape = [];
const layout = [];
let lineParity = 0;
let stopParity = 0;
let wraps = 0;
for (const char of source) {
  const rune = runeIndex.get(char);
  if (rune !== undefined) {
    actualRuneTape.push(rune);
    layout.push({ lineParity, stopParity });
  } else if (char === '/') {
    lineParity ^= 1;
    wraps++;
  } else if (char === '.' || char === '&') {
    stopParity ^= 1;
  } else if (char === '%') {
    lineParity = 0;
    stopParity = 0;
  }
}
const cipherPages = GP.pages.filter(page => page.page < 56 && page.indices.length > 0);
assert.equal(cipherPages.length, 55);
assert.deepEqual(actualRuneTape, cipherPages.flatMap(page => page.indices));
assert.equal(wraps, 594);
assert.equal(layout.length, 12956);
const sites = [];
let start = 0;
for (const page of cipherPages) {
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const position = start + i;
    sites.push({
      position,
      page: page.page,
      event: Number(page.indices[i] === page.indices[i + 1]),
      mask: Number(table[position % 256][0] === '0'),
      line: layout[position].lineParity,
      punctuation: layout[position].stopParity
    });
  }
  start += page.indices.length;
}
assert.equal(sites.length, 12901);
assert.equal(sites.reduce((sum, item) => sum + item.event, 0), 86);
const train = sites.filter(item => item.page <= 26);
const holdout = sites.filter(item => item.page >= 27);
assert.equal(train.length, 6500);
assert.equal(holdout.length, 6401);
assert.equal(train.reduce((sum, item) => sum + item.event, 0), 40);
assert.equal(holdout.reduce((sum, item) => sum + item.event, 0), 46);

/**
 * @param {{mask:number,line:number,punctuation:number}} item
 * @param {'baseline'|'line'|'punctuation'} clock
 * @returns {string}
 */
function category(item, clock) {
  return clock === 'baseline' ? String(item.mask)
    : String(item.mask) + ':' + String(item[clock]);
}

/**
 * Freeze the classifier on first five source chapters p0..p26, leaving
 * the last four chapters p27..p55 fully unseen for all event scoring.
 * Jeffreys smoothing avoids exact 0/1 hazards and is fixed in advance.
 * @param {'baseline'|'line'|'punctuation'} clock
 */
function measure(clock) {
  const bins = new Map();
  for (const item of train) {
    const key = category(item, clock);
    if (!bins.has(key)) bins.set(key, { n: 0, events: 0 });
    const b = bins.get(key);
    b.n++;
    b.events += item.event;
  }
  const predicted = holdout.map(item => {
    const b = bins.get(category(item, clock));
    const probability = (b.events + 0.5) / (b.n + 1);
    return { ...item, probability };
  });
  const logLikelihood = predicted.reduce((sum, item) =>
    sum + (item.event ? Math.log(item.probability)
      : Math.log1p(-item.probability)), 0);
  const expectedEvents = predicted.reduce((sum, item) => sum + item.probability, 0);
  const topK = Math.round(expectedEvents);
  /*
   * Rank by predicted probability; break exact equal-hazard ties with a
   * source-independent integer hash of original rune coordinate.
   * The heldout event labels are NEVER consulted to choose sites or K.
   */
  predicted.sort((a, b) => b.probability - a.probability ||
    (((a.position * 2654435761) >>> 0) -
    ((b.position * 2654435761) >>> 0)));
  const capturedPositions = predicted.slice(0, topK)
    .filter(item => item.event).map(item => item.position);
  const trainBins = [...bins.entries()].map(([key, b]) => ({
    key, opportunities: b.n, doublets: b.events,
    probability: (b.events + 0.5) / (b.n + 1)
  }));
  return {
    model: clock, trainBins, heldoutLogLikelihood: logLikelihood,
    expectedHeldoutDoublets: expectedEvents,
    fixedTopK: topK,
    capturedHeldoutEvents: capturedPositions.length,
    capturedGlobalRunePositions: capturedPositions,
    chanceTopKExpected: topK * 46 / holdout.length
  };
}
const results = ['baseline', 'line', 'punctuation'].map(measure);
assert.deepEqual(results.map(item => item.capturedHeldoutEvents), [1, 1, 0]);
assert(results[1].heldoutLogLikelihood - results[0].heldoutLogLikelihood < 1);
assert(results[2].heldoutLogLikelihood < results[0].heldoutLogLikelihood);
console.log(JSON.stringify({
  status: 'PASS source and chronological holdout exact-location second-state gate',
  scope: {
    originalRunes: 12956, eligiblePairs: sites.length, originalDoublets: 86,
    trainPages: 'p0..p26', trainOpportunities: train.length, trainEvents: 40,
    heldoutPages: 'p27..p55 except rune-free p50',
    heldoutOpportunities: holdout.length, heldoutEvents: 46,
    printedLineWraps: wraps
  },
  results,
  conclusion: 'Line parity adds negligible heldout likelihood and no event-site hits beyond mask-only. Punctuation parity loses heldout likelihood and captures zero positions. Neither fixed visible 1-bit clock predicts 46 heldout original doublet positions; no independently selected reversible GP29 cipher or unknown plaintext.'
}, null, 2));
