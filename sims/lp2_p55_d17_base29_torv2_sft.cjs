'use strict';

/**
 * An original-source, one-host historical Tor-v2 candidate from the 17-rune
 * D-to-D strict-word-interior interval on physical LP2 p55.
 * Node.js 22 / CommonJS; reads committed source data, writes nothing.
 * This verifies a locator hypothesis, not a decrypted page or live service.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8'
).split('%');
const runeIndices = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
assert.equal(pages.length, 57);

/** @param {string} raw @returns {number[][]} */
function parseWords(raw) {
  const words = [];
  let word = [];
  for (const ch of raw) {
    if (runeIndices.has(ch)) {
      word.push(runeIndices.get(ch));
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Printed line breaks do not split words.
    } else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((v, d) => 29n * v + BigInt(d), 0n);
}

/** @param {bigint} value @param {number} count @returns {number[]} */
function base29Digits(value, count) {
  const out = Array(count).fill(0);
  let n = value;
  for (let i = count - 1; i >= 0; i--) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return out;
}

/** @param {bigint} n @returns {string} */
function torV2Label(n) {
  assert.ok(n >= 0n && n < (1n << 80n));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  let label = '';
  for (let group = 15; group >= 0; group--) {
    label += alphabet[Number((n >> BigInt(group * 5)) & 31n)];
  }
  return label;
}

assert.equal(base29([3, 26, 24]), 3301n); // Signed 2013 BASE29 worked example.
const page55Words = parseWords(pages[54]);
const flattened = page55Words.flat();
assert.deepEqual(flattened, corpus.pages[55].indices);
assert.equal(flattened.length, 76);
assert.equal(page55Words.length, 17);
const interior = page55Words.flatMap(w => w.length > 2 ? w.slice(1, -1) : []);
assert.equal(interior.length, 43);

// Original positions are 1-based within the source's strict word interiors.
const marked = [];
for (let i = 0; i + 18 < interior.length; i++) {
  if (interior[i] === interior[i + 18]) {
    marked.push({
      first: i + 1,
      last: i + 19,
      glyph: interior[i],
      digits: interior.slice(i + 1, i + 18)
    });
  }
}
assert.deepEqual(marked.map(m => [m.first, m.last, m.glyph]), [
  [5, 23, 23], // D marks the sole 80-bit-valid 17-rune interval.
  [13, 31, 14] // X is the equal-width alternative; its value is 82 bits.
]);
assert.deepEqual(marked[0].digits, [
  2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 15
]);
const D = base29(marked[0].digits), X = base29(marked[1].digits);
assert.equal(D, 740798982714805590178573n);
assert.equal(D.toString(16).padStart(20, '0'), '9cdecb1721e406f03b0d');
assert.ok(D < (1n << 80n) && X >= (1n << 80n));
assert.equal(X.toString(2).length, 82);
assert.deepEqual(base29Digits(D, 17), marked[0].digits);

const host = torV2Label(D);
assert.equal(host, 'ttpmwfzb4qdpaoyn');
const reversedBits = [...host].reduce((n, ch) => {
  const digit = 'abcdefghijklmnopqrstuvwxyz234567'.indexOf(ch);
  assert.ok(digit >= 0);
  return 32n * n + BigInt(digit);
}, 0n);
assert.equal(reversedBits, D);

const fits = [];
for (let i = 0; i + 17 <= interior.length; i++) {
  if (base29(interior.slice(i, i + 17)) < (1n << 80n)) fits.push(i + 1);
}
assert.deepEqual(fits, [6, 12, 16]);

const contemporaneousKnown = [
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n', 'q4utgdi2n4m4uim5', 'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac'
];
assert.ok(!contemporaneousKnown.includes(host));
console.log(JSON.stringify({
  source: {physicalPage:55, glyphs:flattened.length,
    localWords:page55Words.length, strictInteriors:interior.length},
  equalMarkerIntervals: marked.map(m => ({
    first:m.first, last:m.last, glyph:corpus.translit[m.glyph],
    base29Bits:base29(m.digits).toString(2).length,
    fits80Bits:base29(m.digits)<(1n<<80n)
  })),
  candidate:{source:'p55 strict-interior D(5) to D(23)',
    encoded80BitHex:D.toString(16).padStart(20,'0'),
    historicalTorV2Host:host+'.onion'},
  controls:{allP55Windows17:27,valid80BitStarts:fits,
    reversible17Digits:true,known2014ChainHost:false},
  interpretation:'Unverified, historical Tor-v2-shaped locator hypothesis. No service, key, page hash or LP2 plaintext recovered.'
},null,2));
