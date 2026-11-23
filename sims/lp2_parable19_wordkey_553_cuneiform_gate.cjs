'use strict';

// Source-exact test of the 19-word p57 Parable as a 19-symbol key for the
// original 553-rune, five-numbered cuneiform enclosure (p36-p38).
// Run from repository root with Node 22:
//   node sims/lp2_parable19_wordkey_553_cuneiform_gate.cjs

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit;
const prime = corpus.prime;

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function topFive(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.map((count, index) => ({ index, count }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .slice(0, 5);
}

function render(values) {
  return values.map(index => translit[index]).join('');
}

function transform(values, key, layout, sign) {
  return values.map((value, i) => {
    const keyIndex = layout === '19x29-row-shift'
      ? Math.floor(i / 29)
      : (i % 19);
    return (value + sign * key[keyIndex] + 29) % 29;
  });
}

// The final transcription page is the solved p57 PARABLE. Its first printed
// word is the title; the 19 following words are the repeated 2013 Parable.
const finalPage = transcription.slice(transcription.lastIndexOf('$') + 1)
  .replace(/[%§/\r\n]/gu, '');
const tokens = finalPage.split(/[-.]/u).filter(token => [...token].length > 0);
const tokenIndices = tokens.map(token => [...token].map(rune => {
  assert(runeIndex.has(rune), 'Unknown source rune in p57 token: ' + rune);
  return runeIndex.get(rune);
}));
assert.strictEqual(tokens.length, 20, 'p57 must parse as title + 19 Parable words');
assert.strictEqual(tokenIndices[0].map(i => translit[i]).join(''), 'PARABLE');

const parableWords = tokenIndices.slice(1);
const parableRunes = parableWords.flat();
assert.strictEqual(parableWords.length, 19);
assert.strictEqual(parableRunes.length, 88);
assert.strictEqual(corpus.pages.find(page => page.page === 57).indices.length, 95);

const gp0Key = parableWords.map(word =>
  word.reduce((sum, index) => sum + index, 0) % 29
);
const gpPrimeKey = parableWords.map(word =>
  word.reduce((sum, index) => sum + prime[index], 0) % 29
);

// Five original numbered passages, in printed order. These slices preserve
// unit 4's p37->p38 carry and consume all 553 source runes exactly once.
const p36 = corpus.pages.find(page => page.page === 36).indices;
const p37 = corpus.pages.find(page => page.page === 37).indices;
const p38 = corpus.pages.find(page => page.page === 38).indices;
const units = [
  p36.slice(99, 238),
  p37.slice(0, 91),
  p37.slice(91, 189),
  [...p37.slice(189, 228), ...p38.slice(0, 57)],
  p38.slice(57, 186)
];
const unitLengths = units.map(unit => unit.length);
assert.deepStrictEqual(unitLengths, [139, 91, 98, 96, 129]);
const ciphertext = units.flat();
assert.strictEqual(ciphertext.length, 553);
assert.strictEqual(553, 19 * 29);

const variants = [];
for (const [keyName, key] of [['GP0', gp0Key], ['GPprime', gpPrimeKey]]) {
  for (const layout of ['19x29-row-shift', '29x19-periodic-key']) {
    for (const sign of [-1, 1]) {
      const plaintext = transform(ciphertext, key, layout, sign);
      const replay = transform(plaintext, key, layout, -sign);
      assert.deepStrictEqual(replay, ciphertext, 'Exact forward replay failed');
      variants.push({
        key: keyName,
        layout,
        sign,
        ioc: ioc(plaintext),
        topFive: topFive(plaintext),
        first80: render(plaintext.slice(0, 80)),
        replayRunes: replay.length
      });
    }
  }
}

const bodyWords = parableWords.map(word => render(word));
console.log(JSON.stringify({
  source: {
    p57Title: render(tokenIndices[0]),
    parableWords: bodyWords,
    parableWordCount: parableWords.length,
    parableRuneCount: parableRunes.length,
    p57RuneCount: 95,
    originalNumberedUnitLengths: unitLengths,
    originalTargetRuneCount: ciphertext.length,
    originalTargetIoC: ioc(ciphertext)
  },
  keys: { GP0: gp0Key, GPprime: gpPrimeKey },
  variants
}, null, 2));
