'use strict';

// Authentic LP2 p56 solved-cipher regression. Run with Node.js from any working directory.
// Source: resources/liber-primus/lp2-corpus.json (original page 73.jpg, LP2 page 56).
// Independent expected wording: Wulfic/Cicada3301-Liber_Primus/pages/page_73/README.md.
// Gematria Primus writes V as U and K as C; TH and other digraphs are single runes.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const cipher = corpus.pages.find((page) => page.page === 56).indices;

/** @type {string} Independent established plaintext, retaining GP orthography. */
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

/** @param {string} words @param {string[]} alphabet @returns {number[]} */
function toGpRunes(words, alphabet) {
  const sorted = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const runes = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      runes.push(match.index);
      i += match.token.length;
    }
  }
  return runes;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const plaintext = toGpRunes(expectedWords, corpus.translit);
assert.equal(cipher.length, 85);
assert.equal(plaintext.length, cipher.length);
const fPositions = cipher.map((rune, i) => rune === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(fPositions, [35, 47, 51, 56, 74]);
const primes = firstPrimes(cipher.length + 29);

/**
 * Decode every rune, applying a chosen literal-F mask and 0-based prime-key start.
 * A literal F produces plaintext F and leaves the prime counter unchanged.
 * @param {'phi'|'prime'} keyMode
 * @param {-1|1} sign
 * @param {number} start
 * @param {number} fMask
 * @returns {number[]}
 */
function decode(keyMode, sign, start, fMask) {
  let k = start;
  return cipher.map((rune, position) => {
    const fIndex = fPositions.indexOf(position);
    if (fIndex !== -1 && (fMask & (1 << fIndex))) return 0;
    const prime = primes[k++];
    const shift = keyMode === 'phi' ? prime - 1 : prime;
    return ((rune + sign * shift) % 29 + 29) % 29;
  });
}

/** @param {number[]} candidate @param {number} from @param {number} to */
function matches(candidate, from, to) {
  let count = 0;
  for (let i = from; i < to; i++) if (candidate[i] === plaintext[i]) count++;
  return count;
}

const trainLength = 60;
/** @type {Array<{sign:number,start:number,mask:number,holdout:number}>} */
const trainHits = [];
let primeControlBest = 0;
for (const keyMode of /** @type {const} */ (['phi', 'prime'])) {
  for (const sign of /** @type {const} */ ([-1, 1])) {
    for (let start = 0; start < 29; start++) {
      for (let mask = 0; mask < (1 << fPositions.length); mask++) {
        const decoded = decode(keyMode, sign, start, mask);
        const train = matches(decoded, 0, trainLength);
        if (keyMode === 'prime') {
          primeControlBest = Math.max(primeControlBest, train);
        } else if (train === trainLength) {
          trainHits.push({ sign, start, mask, holdout: matches(decoded, trainLength, cipher.length) });
        }
      }
    }
  }
}

assert.deepEqual(trainHits, [
  { sign: -1, start: 0, mask: 8, holdout: 25 },
  { sign: -1, start: 0, mask: 24, holdout: 14 }
]);
assert.equal(primeControlBest, 9);
const validated = trainHits.filter((hit) => hit.holdout === cipher.length - trainLength);
assert.equal(validated.length, 1);
assert.deepEqual(validated[0], { sign: -1, start: 0, mask: 8, holdout: 25 });
assert.deepEqual(decode('phi', -1, 0, 8), plaintext);
console.log(JSON.stringify({
  regression: 'LP2 page 56 / original JPEG 73',
  runes: cipher.length,
  trainRunes: trainLength,
  holdoutRunes: cipher.length - trainLength,
  candidatesScanned: 2 * 2 * 29 * (1 << fPositions.length),
  trainHits,
  validated,
  unmodifiedPrimeControlBestTrainMatches: primeControlBest,
  status: 'PASS'
}, null, 2));
