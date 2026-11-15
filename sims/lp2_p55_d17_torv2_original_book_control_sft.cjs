'use strict';

/**
 * Original-source family control for the p55 D17 base29/Tor-v2 hypothesis.
 * Node.js 22 CommonJS, read-only; no host connections, guesses or writes.
 *
 * Same page-local printed-word interior extraction for every GP29 page.
 * A length-17 interval has equal endpoint glyphs 18 positions apart.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
).split('%');
const byRune = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(source.length, 57);

/** @param {string} line @returns {number[][]} */
function words(line) {
  /** @type {number[][]} */
  const out = [];
  /** @type {number[]} */
  let word = [];
  for (const ch of line) {
    if (byRune.has(ch)) {
      word.push(byRune.get(ch));
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Physical line breaks do not end printed words.
    } else if (word.length) {
      out.push(word);
      word = [];
    }
  }
  if (word.length) out.push(word);
  return out;
}

/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((v, rune) => 29n * v + BigInt(rune), 0n);
}
const maxV2 = 1n << 80n;
/** @type {Array<{page:number,interiors:number,pairs:Array<{start:number,rune:number,bits:number,valid:boolean,hex:string|null}>}>} */
const pages = [];
for (let page = 0; page < 56; page++) {
  if (page === 50) {
    assert.deepEqual(corpus.pages[page].indices, []);
    continue;
  }
  const pageSource = source[page < 50 ? page : page - 1];
  const pageWords = words(pageSource);
  assert.deepEqual(pageWords.flat(), corpus.pages[page].indices);
  const inside = pageWords.flatMap(word => word.length > 2 ? word.slice(1, -1) : []);
  const pairs = [];
  for (let i = 0; i + 18 < inside.length; i++) {
    if (inside[i] !== inside[i + 18]) continue;
    const value = base29(inside.slice(i + 1, i + 18));
    pairs.push({
      start: i + 1, rune: inside[i],
      bits: value.toString(2).length,
      valid: value < maxV2,
      hex: value < maxV2 ? value.toString(16).padStart(20, '0') : null
    });
  }
  pages.push({ page, interiors: inside.length, pairs });
}
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.pairs.length, 0), 209);
assert.equal(pages.reduce((sum, page) =>
  sum + page.pairs.filter(pair => pair.valid).length, 0), 42);

const dPairs = pages.flatMap(page => page.pairs
  .filter(pair => pair.rune === 23)
  .map(pair => ({ page: page.page, ...pair })));
assert.equal(dPairs.length, 13);
const dFits = dPairs.filter(pair => pair.valid);
assert.deepEqual(dFits.map(pair => [pair.page, pair.start, pair.hex]), [
  [35, 16, 'fc3571881b46757f423c'],
  [55, 5, '9cdecb1721e406f03b0d']
]);

const p53 = pages.find(page => page.page === 53);
const p55 = pages.find(page => page.page === 55);
assert.equal(p53.interiors, 99);
assert.deepEqual(p53.pairs.filter(pair => pair.valid), []);
assert.equal(p55.interiors, 43);
assert.deepEqual(p55.pairs.map(pair => [
  pair.start, corpus.translit[pair.rune], pair.bits, pair.valid
]), [[5, 'D', 80, true], [13, 'X', 82, false]]);

console.log(JSON.stringify({
  experiment: 'source-local 17 GP29 interiors between identical boundary runes',
  pages: pages.length,
  allPairs: 209,
  exact80FitPairs: 42,
  Dpairs: 13,
  DfitPairs: dFits.map(({ page, start, hex }) => ({ page, start, hex })),
  sameMothControls: [p53, p55].map(page => ({
    physicalPage: page.page, strictInteriors: page.interiors,
    intervals: page.pairs.map(pair => ({
      start: pair.start, rune: corpus.translit[pair.rune],
      bits: pair.bits, fits80: pair.valid
    }))
  })),
  decision: 'p55 is the single D-fit on the two same-moth pages; p35 has another book-wide D-fit. This is a weak source-matched locator clue, not an authenticated onion address or plaintext.'
}, null, 2));
