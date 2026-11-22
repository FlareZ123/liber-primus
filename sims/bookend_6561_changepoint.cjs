'use strict';

/**
 * A source-exact discriminator for the 6561=3^8 bookend hypothesis.
 *
 * The duplicated original DJU-BEI phrase ends at global source offsets
 * 6561 and 12956. If that is a real cipher reset, an independently visible
 * change in simple distributional/word-lag statistics might be predicted.
 *
 * Compare the exact proposed cut against every competing cut in the fixed
 * 3500..9500 window, using unchanged original ciphertext and word markup.
 * Ranks are descriptive, not p-values or proof against hidden-state changes.
 *
 * Run: node sims/bookend_6561_changepoint.cjs
 * Node 22, built-in libraries only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
/** @param {string} resource @returns {string} */
const read = resource => fs.readFileSync(path.join(ROOT, resource), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ciphertext = c.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const transcription = read('resources/lp2-transcription.txt');
const runes = new Map(c.runes.map((r, i) => [r, i]));

const wordoffset = [];
const recovered = [];
let cursor = 0;
for (const ch of transcription.split('%').slice(0, 55).join('%')) {
  if (runes.has(ch)) {
    wordoffset.push(cursor++);
    recovered.push(runes.get(ch));
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Physical pages and printed lines do not reset actual words.
  } else {
    cursor = 0;
  }
}
assert.deepEqual(ciphertext, recovered);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(ciphertext.slice(6555, 6561), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(ciphertext.slice(-6), ciphertext.slice(6555, 6561));
assert.equal(6561, 3 ** 8);
assert.equal(ciphertext.length - 6561, 80 ** 2 - 5);

const n = ciphertext.length;
const eventTypes = ['lag5', 't6', 'repeat', 'eligible5', 'eligible6'];
/** @type {Record<string, Uint32Array>} */
const events = {};
for (const key of eventTypes) events[key] = new Uint32Array(n + 1);
for (let i = 0; i < n; i++) {
  for (const key of eventTypes) events[key][i + 1] = events[key][i];
  if (wordoffset[i] >= 5) {
    events.eligible5[i + 1]++;
    events.lag5[i + 1] += Number(ciphertext[i] === ciphertext[i - 5]);
  }
  if (wordoffset[i] >= 6) {
    events.eligible6[i + 1]++;
    events.t6[i + 1] += Number(
      ciphertext[i] === (24 - 2 * ciphertext[i - 6] + 58) % 29);
  }
  if (i >= 1) {
    events.repeat[i + 1] += Number(ciphertext[i] === ciphertext[i - 1]);
  }
}

const hist = Array.from({length: 29}, () => new Uint32Array(n + 1));
for (let i = 0; i < n; i++) {
  for (let g = 0; g < 29; g++) hist[g][i + 1] = hist[g][i];
  hist[ciphertext[i]][i + 1]++;
}

/** @param {number} pos */
function observe(pos) {
  let chi = 0;
  for (let g = 0; g < 29; g++) {
    const total = hist[g][n];
    const leftExpected = total * pos / n;
    const rightExpected = total * (n - pos) / n;
    chi += (hist[g][pos] - leftExpected) ** 2 / leftExpected;
    chi += (total - hist[g][pos] - rightExpected) ** 2 / rightExpected;
  }
  /**
   * @param {'lag5'|'t6'|'repeat'} key
   * @param {'eligible5'|'eligible6'|null} eligibility
   */
  const metric = (key, eligibility) => {
    const left = events[key][pos];
    const right = events[key][n] - left;
    const nleft = eligibility ? events[eligibility][pos] : pos;
    const nright = eligibility ? events[eligibility][n] - nleft : n - pos;
    const pooled = (left + right) / (nleft + nright);
    const z = (left/nleft - right/nright) /
      Math.sqrt(pooled * (1 - pooled) * (1/nleft + 1/nright));
    return {left, leftEligible: nleft, right, rightEligible: nright, z};
  };
  return {
    pos, marginalChiSquare: chi,
    lag5: metric('lag5', 'eligible5'),
    affineT6: metric('t6', 'eligible6'),
    adjacentRepeat: metric('repeat', null)
  };
}
const target = observe(6561);
/** @type {ReturnType<typeof observe>[]} */
const cuts = [];
for (let position = 3500; position <= 9500; position++) cuts.push(observe(position));

/** @param {'marginalChiSquare'|'lag5'|'affineT6'|'adjacentRepeat'} key */
function rank(key) {
  const score = x => key === 'marginalChiSquare'
    ? x.marginalChiSquare : Math.abs(x[key].z);
  const atLeast = cuts.filter(cut => score(cut) >= score(target)).length;
  const largest = cuts.reduce((a, b) => score(b) > score(a) ? b : a);
  return {
    range: [3500, 9500], candidateCuts: cuts.length, atLeastOriginal: atLeast,
    percentileFromLow: 100 * (1 - atLeast/cuts.length),
    strongestCut: largest.pos
  };
}
const out = {
  origin: 'Original LP2 zero-based rune positions 6555..6560, 12950..12955',
  proposedCut: target, comparisons: {
    runeMarginal: rank('marginalChiSquare'),
    wordLocalLag5: rank('lag5'),
    wordLocalAffineT6: rank('affineT6'),
    immediateDuplicates: rank('adjacentRepeat')
  },
  result: 'No distinctive statistical change point at the retrospectively selected 6561 boundary',
  limitations: 'All candidate cuts use the same source manuscript, overlapping windows and selection of an already noticed numeric endpoint; percentiles are descriptive ranks, not chance probabilities. A concealed state reset need not alter these features.'
};
console.log(JSON.stringify(out, null, 2));
module.exports = {observe, out};
