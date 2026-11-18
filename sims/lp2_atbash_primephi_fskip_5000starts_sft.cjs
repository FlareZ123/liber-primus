'use strict';

/**
 * Original-source single-file test:
 * historically demonstrated GP29 Atbash followed by the genuine p56 prime-totient
 * cipher, including the literal-plaintext-F nonconsuming branch.
 *
 * Read-only, Windows Node.js 22 compatible:
 *   node sims/lp2_atbash_primephi_fskip_5000starts_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const page = (number) => source.pages.find((item) => item.page === number).indices;
const ranges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) found.push(n);
  }
  return found;
}
const primes = firstPrimes(6000);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Exact branching inverse, keeping all possible prime cursors. The historical
 * rule emits plaintext F (GP index zero) literally and without key advancement.
 * A ciphertext F may alternatively be the encrypted value of a non-F letter.
 * @param {number[]} raw
 * @param {number} start
 * @param {-1|1} sign
 * @param {boolean} preAtbash
 * @returns {{reach:number, complete:boolean}}
 */
function reachable(raw, start, sign, preAtbash) {
  let possible = new Set([start]);
  let i = 0;
  for (; i < raw.length && possible.size; i++) {
    const c = preAtbash ? 28 - raw[i] : raw[i];
    const next = new Set();
    for (const cursor of possible) {
      if (c === 0) next.add(cursor);
      const p = mod29(c + sign * ((primes[cursor] - 1) % 29));
      if (p !== 0) next.add(cursor + 1);
    }
    possible = next;
  }
  return { reach: i, complete: possible.size > 0 };
}

/**
 * Exhaustively retain every distinct literal-F bypass choice for a completed
 * candidate; no English-trained beam or winner-only path is used.
 * @param {number[]} raw
 * @param {number} start
 * @param {-1|1} sign
 * @param {boolean} preAtbash
 * @returns {number[][]}
 */
function decodeEveryPath(raw, start, sign, preAtbash) {
  /** @type {Array<{cursor:number, plaintext:number[]}>} */
  let paths = [{ cursor: start, plaintext: [] }];
  for (const original of raw) {
    const c = preAtbash ? 28 - original : original;
    /** @type {typeof paths} */
    const next = [];
    for (const candidate of paths) {
      if (c === 0) {
        next.push({ cursor: candidate.cursor,
          plaintext: [...candidate.plaintext, 0] });
      }
      const p = mod29(c + sign * ((primes[candidate.cursor] - 1) % 29));
      if (p !== 0) {
        next.push({ cursor: candidate.cursor + 1,
          plaintext: [...candidate.plaintext, p] });
      }
    }
    paths = next;
  }
  return paths.map((entry) => entry.plaintext);
}

/** @param {number[]} runes @returns {number} */
function coincidence(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}

/**
 * Encode the exact published GP-native solved p56 wording. Preserve each
 * multi-letter GP glyph (TH, EO, EA, NG, etc.) as one rune.
 * @param {string} sentence
 * @returns {number[]}
 */
function nativeRunes(sentence) {
  const alphabet = source.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const output = [];
  for (const word of sentence.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = alphabet.find(({ token }) => word.startsWith(token, i));
      assert.ok(found, 'GP rune not found: ' + word.slice(i));
      output.push(found.index);
      i += found.token.length;
    }
  }
  return output;
}

const known = nativeRunes(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.equal(known.length, 85);
let keyIndex = 0;
const historicalEncoded = known.map((p) => p === 0
  ? 0 : mod29(p + primes[keyIndex++] - 1));
assert.deepEqual(historicalEncoded, page(56),
  'Actual p56 prime-totient plaintext-F encoder must reproduce source');
const artificialAtbash = historicalEncoded.map((value) => 28 - value);
assert.ok(decodeEveryPath(artificialAtbash, 0, -1, true)
  .some((decoded) => decoded.every((value, index) => value === known[index])),
  'Atbash-preprocessed authentic p56 positive must be recovered');
const originalP57IoC = coincidence(page(57));
assert.ok(originalP57IoC > 0.06);

/** @type {Array<{chapter:string, runes:number, sign:number, completeStarts:number, farthest:number, start0:number}>} */
const summaries = [];
for (let index = 0; index < ranges.length; index++) {
  const [first, last] = ranges[index];
  const raw = source.pages.filter((item) =>
    item.page >= first && item.page <= last).flatMap((item) => item.indices);
  assert.equal(raw.length, lengths[index]);
  for (const sign of /** @type {const} */ ([-1, 1])) {
    let completeStarts = 0;
    let farthest = 0;
    let start0 = 0;
    for (let start = 0; start < 5000; start++) {
      const status = reachable(raw, start, sign, true);
      if (start === 0) start0 = status.reach;
      if (status.reach > farthest) farthest = status.reach;
      if (status.complete) completeStarts++;
    }
    summaries.push({ chapter: first + '-' + last,
      runes: raw.length, sign, completeStarts, farthest, start0 });
  }
}
assert.deepEqual(summaries.map(({ completeStarts }) => completeStarts),
  Array(16).fill(0).concat([27, 28]));
assert.deepEqual(summaries.map(({ farthest }) => farthest),
  [450, 428, 644, 608, 593, 542, 593, 602,
    514, 575, 673, 599, 648, 447, 434, 440, 308, 308]);

const lastChapter = [...page(54), ...page(55)];
/** @type {Array<{sign:number, starts:number, legalOutputs:number, maxIoC:number, winningStart:number}>} */
const lastChapterResults = [];
for (const sign of /** @type {const} */ ([-1, 1])) {
  let starts = 0;
  let legalOutputs = 0;
  let maxIoC = 0;
  let winningStart = -1;
  for (let start = 0; start < 5000; start++) {
    const paths = decodeEveryPath(lastChapter, start, sign, true);
    if (paths.length) starts++;
    legalOutputs += paths.length;
    for (const plaintext of paths) {
      const ioc = coincidence(plaintext);
      if (ioc > maxIoC) {
        maxIoC = ioc;
        winningStart = start;
      }
    }
  }
  lastChapterResults.push({ sign, starts, legalOutputs, maxIoC, winningStart });
}
assert.deepEqual(lastChapterResults.map((r) => r.starts), [27, 28]);
assert.deepEqual(lastChapterResults.map((r) => r.legalOutputs), [288, 203]);
assert.deepEqual(lastChapterResults.map((r) => r.winningStart), [4858, 4992]);
assert.ok(lastChapterResults.every((r) => r.maxIoC < 0.038));

console.log(JSON.stringify({
  status: 'PASS', operation: 'Atbash printed ciphertext before strict p56 prime-phi inverse',
  startsPerChapterPerSign: 5000, nativeP56Positive: '85/85',
  nativeP57ControlIoC: originalP57IoC,
  summaries, lastChapterResults,
  interpretation: 'No unknown native-GP prose recovered; all 8 long chapters have no legal F-bypass inverse in this finite model'
}, null, 2));
