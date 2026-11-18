'use strict';

/**
 * Source-motivated word-factor navigation gate.
 *
 * 2013 PARABLE metadata supplies a product of the three GP-prime clause sums.
 * 2016 says the words' numbers are the direction.  This SFT therefore tests the
 * six lowest-description-length prime-factor step rules on the original 2,896
 * printed LP2 words.  The signal is exact native-GP dictionary membership of
 * selected words with length >= 4.  Twenty-four deterministic shuffled word
 * maps provide a same-corpus null.
 *
 * Windows 11 / Node 22 / CommonJS. Read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const lexiconText = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8'
);

const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const words = parseLP2Words(transcription, 55).words.map((word) =>
  Array.from(word.runes, (rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  })
);
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
assert.deepEqual(words.flat(), gp.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices));

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let x = 2; result.length < count; x += 1) {
    if (result.every((prime) => x % prime !== 0)) result.push(x);
  }
  return result;
}
const primeWeights = firstPrimes(29);

/** @param {number} n @returns {number[]} */
function factors(n) {
  const result = [];
  for (let p = 2; p * p <= n; p += 1) {
    while (n % p === 0) {
      result.push(p);
      n /= p;
    }
  }
  if (n > 1) result.push(n);
  return result;
}

const translitTokens = gp.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);

/** @param {string} raw @returns {number[]} */
function encodeWord(raw) {
  const text = raw.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      result.push(21);
      i += 3;
      continue;
    }
    if (text.startsWith('IO', i)) {
      result.push(27);
      i += 2;
      continue;
    }
    const token = translitTokens.find((item) => text.startsWith(item.text, i));
    if (!token) return [];
    result.push(token.index);
    i += token.text.length;
  }
  return result;
}

const dictionary = new Set();
for (const line of lexiconText.split(/\r?\n/u)) {
  const match = /^([A-Za-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const encoded = encodeWord(match[1]);
  if (encoded.length >= 4) dictionary.add(encoded.join(','));
}

const stepRules = {
  spf: (n) => factors(n)[0],
  lpf: (n) => factors(n).at(-1),
  sumFactors: (n) => factors(n).reduce((sum, value) => sum + value, 0),
  sumUniqueFactors: (n) => [...new Set(factors(n))].reduce((sum, value) => sum + value, 0),
  omega: (n) => factors(n).length,
  radical: (n) => [...new Set(factors(n))].reduce((product, value) => product * value, 1)
};

/**
 * @param {number[][]} mapWords
 * @returns {{hits:number,long:number,rate:number,rule:string,sign:number,start:number,steps:number}}
 */
function evaluate(mapWords) {
  const numbers = mapWords.map((word) =>
    word.reduce((sum, rune) => sum + primeWeights[rune], 0)
  );
  let best = {hits: -1, long: 0, rate: 0, rule: '', sign: 0, start: 0, steps: 0};

  for (const [rule, stepFunction] of Object.entries(stepRules)) {
    for (const sign of [-1, 1]) {
      for (let start = 0; start < mapWords.length; start += 1) {
        const seen = new Set();
        let position = start;
        let hits = 0;
        let long = 0;
        let steps = 0;

        while (steps < 80 && !seen.has(position)) {
          seen.add(position);
          const word = mapWords[position];
          if (word.length >= 4) {
            long += 1;
            if (dictionary.has(word.join(','))) hits += 1;
          }
          let distance = stepFunction(numbers[position]);
          if (!distance) distance = 1;
          position = ((position + sign * distance) % mapWords.length + mapWords.length) % mapWords.length;
          steps += 1;
        }

        const rate = long ? hits / long : 0;
        if (hits > best.hits || (hits === best.hits && rate > best.rate)) {
          best = {hits, long, rate, rule, sign, start, steps};
        }
      }
    }
  }
  return best;
}

let seed = 0x3301;
/** @returns {number} */
function randomUnit() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

/** @param {number[][]} input @returns {number[][]} */
function shuffled(input) {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomUnit() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Authenticated historical arithmetic reproduced from the solved p57 parable.
assert.equal(1031 * 1229 * 1259, 1595277641);

const real = evaluate(words);
const nulls = [];
for (let i = 0; i < 24; i += 1) nulls.push(evaluate(shuffled(words)));

assert.deepEqual(real, {
  hits: 2,
  long: 29,
  rate: 2 / 29,
  rule: 'radical',
  sign: -1,
  start: 2167,
  steps: 69
});
assert.equal(nulls.filter((item) => item.hits >= real.hits).length, 24);
assert.equal(nulls.filter((item) => item.hits > real.hits).length, 9);

console.log(JSON.stringify({
  originalWords: words.length,
  originalRunes: 12956,
  rules: Object.keys(stepRules),
  directions: 2,
  startsPerRule: words.length,
  maximumSteps: 80,
  real,
  nullHitHistogram: nulls.reduce((histogram, item) => {
    histogram[item.hits] = (histogram[item.hits] || 0) + 1;
    return histogram;
  }, {}),
  nullAtLeastReal: nulls.filter((item) => item.hits >= real.hits).length,
  nullStrictlyBetter: nulls.filter((item) => item.hits > real.hits).length
}, null, 2));

console.log('PASS: prime-factor word-direction navigation is no better than shuffled word maps under the frozen six-rule family.');
