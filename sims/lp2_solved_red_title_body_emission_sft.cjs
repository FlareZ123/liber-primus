'use strict';

/**
 * Single-file test: original LP2 solved-title/body switch.
 *
 * Inputs are the repository's original rune and ink transcriptions.
 * The authentic p56 plaintext and the literal p57 prose are frozen controls.
 * No unknown LP2 plaintext is inferred.
 *
 * Run: node sims/lp2_solved_red_title_body_emission_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');

/** @param {number} page @returns {number[]} */
function cipher(page) {
  return corpus.pages.find((entry) => entry.page === page).indices;
}

/** @param {number} page @returns {object} */
function inkPage(page) {
  return ink.pages.find((entry) => entry.page === page);
}

/** @param {number[]} indices @returns {string} */
function gpText(indices) {
  return indices.map((index) => corpus.translit[index]).join('');
}

const letterTokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function gpIndices(text) {
  const result = [];
  for (const word of text.split(' ')) {
    for (let offset = 0; offset < word.length;) {
      const found = letterTokens.find(({ token }) => word.startsWith(token, offset));
      assert.ok(found, 'Unknown GP token in ' + word.slice(offset));
      result.push(found.index);
      offset += found.token.length;
    }
  }
  return result;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const output = [];
  for (let n = 2; output.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) output.push(n);
  }
  return output;
}

const primeSequence = firstPrimes(120);
const literalF = 56;

/**
 * Decode or encode the authentic p56 phi(prime) schedule.
 * Only the source-recovered literal F at absolute rune offset 56 skips the
 * prime counter. A reset after an ink separator is an independent variant.
 *
 * @param {number[]} input
 * @param {boolean} encode
 * @param {number[]} resetAt
 * @param {boolean} skipLiteral
 * @returns {number[]}
 */
function transform(input, encode = false, resetAt = [], skipLiteral = true) {
  let clock = 0;
  return input.map((rune, offset) => {
    if (resetAt.includes(offset)) clock = 0;
    if (skipLiteral && offset === literalF) return rune;
    const shift = primeSequence[clock++] - 1;
    return ((rune + (encode ? shift : -shift)) % 29 + 29) % 29;
  });
}

/** @param {number[]} candidate @param {number[]} expected @returns {number} */
function matches(candidate, expected) {
  assert.equal(candidate.length, expected.length);
  return candidate.filter((index, offset) => index === expected[offset]).length;
}

const p56 = cipher(56);
const p57 = cipher(57);
const original56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const original57 = 'PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE';
const expected56 = gpIndices(original56);
const expected57 = gpIndices(original57);

assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(expected56.length, 85);
assert.equal(expected57.length, 95);
assert.deepEqual(inkPage(56).red_spans.map((span) => [span.start, span.length]), [[0, 5]]);
assert.deepEqual(inkPage(56).large_punctuation, [[5, 13, 'red'], [45, 10, 'red'], [85, 13, 'red']]);
assert.deepEqual(inkPage(57).red_spans.map((span) => [span.start, span.length]), [[0, 7]]);
assert.deepEqual(inkPage(57).large_punctuation, [[7, 13, 'red'], [95, 23, 'red']]);
assert.equal(gpText(p56.slice(0, 5)), 'AEJOESR');
assert.equal(gpText(p57.slice(0, 7)), 'PARABLE');
assert.ok(transcription.includes('ᚫᛄ-ᛟᛋᚱ.'));
assert.ok(transcription.includes('ᛈᚪᚱᚪᛒᛚᛖ.'));
const fOffsets = p56.flatMap((index, offset) => index === 0 ? [offset] : []);
assert.deepEqual(fOffsets, [35, 47, 51, 56, 74]);
assert.equal(expected56[literalF], 0);

const decoded56 = transform(p56);
assert.deepEqual(decoded56, expected56, 'p56 full title+body plaintext');
assert.deepEqual(transform(decoded56, true), p56, 'p56 exact full forward re-encryption');
assert.deepEqual(p57, expected57, 'p57 title and entire body are literally printed');
assert.equal(gpText(decoded56.slice(0, 5)), 'ANEND');
assert.equal(matches(decoded56.slice(0, 5), expected56.slice(0, 5)), 5);
assert.equal(matches(decoded56.slice(5), expected56.slice(5)), 80);
assert.equal(matches(p57.slice(0, 7), expected57.slice(0, 7)), 7);
assert.equal(matches(p57.slice(7), expected57.slice(7)), 88);

const wrongP56 = [
  ['reset prime clock after red title', transform(p56, false, [5])],
  ['reset prime clock at red ten-dot mark', transform(p56, false, [45])],
  ['reset both at 5 and 45', transform(p56, false, [5, 45])],
  ['do not treat any F as literal', transform(p56, false, [], false)]
];
const wrongMetrics = wrongP56.map(([model, candidate]) => ({
  model,
  totalMatches: matches(candidate, expected56),
  redMatches: matches(candidate.slice(0, 5), expected56.slice(0, 5)),
  matchesFrom45: matches(candidate.slice(45), expected56.slice(45))
}));
assert.deepEqual(wrongMetrics.map((entry) => [entry.totalMatches, entry.redMatches, entry.matchesFrom45]), [
  [6, 5, 1],
  [48, 5, 3],
  [8, 5, 3],
  [56, 5, 11]
]);

const wrongPage57 = transform(p57, false, [], false);
assert.equal(matches(wrongPage57, p57), 3);
assert.equal(matches(wrongPage57.slice(0, 7), p57.slice(0, 7)), 0);

// A title/body color switch would require different rules on a page.
// Both solved pages instead use a single rule across the title boundary.
const result = {
  source: ['resources/liber-primus/lp2-corpus.json', 'resources/liber-primus/lp2-ink-annotations.json', 'resources/liber-primus/lp2-transcription.txt'],
  page56: {
    redCipher: 'AEJOESR',
    redPlain: 'ANEND',
    redMatches: 5,
    blackMatches: 80,
    fullMatches: 85,
    primeClock: 'page-local phi(p_n), n=1..; skip original source rune position 56',
    punctuationClockReset: false,
    fullReencodingMatches: 85,
    wrongMetrics
  },
  page57: {
    redOriginalAndPlain: 'PARABLE',
    redMatches: 7,
    blackMatches: 88,
    fullMatches: 95,
    wrongPhiMatches: 3,
    wrongPhiRedMatches: 0
  },
  inference: 'Solved source verifies different page-level emission modes; color and title/body boundaries do not select a general decoder.',
  status: 'PASS'
};
console.log(JSON.stringify(result, null, 2));
