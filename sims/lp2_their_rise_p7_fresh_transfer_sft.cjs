'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'),
  'utf8'
).replace(/\r/g, '');
const signed = fs.readFileSync(
  path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'),
  'utf8'
).replace(/\r/g, '');
const pretarget = JSON.parse(fs.readFileSync(
  path.join(root, 'im-results/lp2-their-rise-p7-the-fresh-pretarget.json'),
  'utf8'
));

const mod29 = (value) => ((value % 29) + 29) % 29;
const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = tokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token, 'unmapped source: ' + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => mod29(sum + value), 0);
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords[7], 'THE');
assert.equal(sourceWords[13], 'WAY');
const P = gp(sourceWords[7]);
const partner = gp(sourceWords[13]);
assert.deepEqual(P, [2, 18]);
assert.deepEqual(partner, [7, 24, 26]);

const rise = mod29(gp0(partner) - gp0(P));
assert.equal(rise, 8);
const inv2 = 15;
const key = [mod29(inv2 * rise), mod29(-inv2 * rise)];
assert.deepEqual(key, [4, 25]);
const predicted = P.map((value, index) => mod29(value + key[index]));
assert.deepEqual(predicted, [6, 14]);

assert.deepEqual(pretarget.plaintext, P);
assert.equal(pretarget.rise, rise);
assert.deepEqual(pretarget.key, key);
assert.deepEqual(pretarget.predictedCiphertext, predicted);

const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');
const page = parts[7];
const words = [];
let current = [];
let start = 0;
let runeOffset = 0;

function emit() {
  if (!current.length) return;
  words.push({ start, values: current.slice() });
  current = [];
}

for (const ch of Array.from(page)) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (!current.length) start = runeOffset;
    current.push(value);
    runeOffset += 1;
  } else if (/[-.&$§,:!?\s]/u.test(ch)) {
    emit();
  }
}
emit();

assert.equal(runeOffset, 208);
const twoRuneWords = words.filter((word) => word.values.length === 2);
assert.deepEqual(twoRuneWords, [
  { start: 0, values: [8, 21] },
  { start: 49, values: [28, 22] },
  { start: 115, values: [11, 19] },
  { start: 134, values: [23, 21] },
  { start: 136, values: [23, 21] },
  { start: 177, values: [22, 14] },
  { start: 194, values: [23, 3] },
  { start: 203, values: [14, 28] },
]);
const hits = twoRuneWords.filter(
  (word) => word.values[0] === predicted[0] && word.values[1] === predicted[1]
);
assert.equal(hits.length, 0);

console.log(JSON.stringify({
  status: 'PASS',
  pageSelector: 'p15 BASE29 page-count map unique fixed point p7',
  source: {
    index: 7,
    word: sourceWords[7],
    partnerIndex: 13,
    partner: sourceWords[13],
    plaintext: P,
    rise,
    key,
    predictedCiphertext: predicted,
  },
  target: {
    physicalPage: 7,
    completeTwoRuneWords: twoRuneWords,
    exactHits: hits.length,
  },
  decision: 'Fresh source-selected p7 transfer misses; reject unchanged generalization of the +6/H-shell rule.',
}, null, 2));
