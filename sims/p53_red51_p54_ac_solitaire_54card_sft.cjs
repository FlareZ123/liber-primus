'use strict';

/**
 * 52 rune/card events from physical p53 red51 and p54 oversized Ac24,
 * with the first two following red 13-dot marks as source-order Jokers.
 * Historical 2014 PATIENCE cue motivates the standard Solitaire cipher.
 *
 * Bounded original 76-rune p55 gate, 2 GP29 directions and four GP28
 * predecessor-exclusion registers; no fitted key, phase, or deck rotation.
 *
 * Source: original LP2 scans 70.jpg, 71.jpg, 72.jpg; canonical ink annotations.
 * Run: node sims/p53_red51_p54_ac_solitaire_54card_sft.cjs (Node.js 22).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} name */
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const page = n => corpus.pages.find(p => p.page === n).indices;
const source = ink.pages.find(p => p.page === 53);
const red = page(53).slice(128, 179);
const p55 = page(55);
const afterHeading = page(54).slice(9).concat(p55);
const p57 = page(57);
assert.equal(red.length, 51);
assert.deepEqual(source.red_spans.map(p => [p.start, p.length]), [[128, 51]]);
assert.deepEqual(source.large_punctuation, [[179, 13, 'red']]);
assert.deepEqual(ink.pages.find(p => p.page === 54).large_punctuation, [[9, 13, 'red']]);
assert.equal(page(54)[0], 24); // p54 large initial Ac is already the first red title rune
assert.equal(p55.length, 76);
assert.equal(afterHeading.length, 299);
assert.equal(p57.length, 95);

// Every position is a distinct physical card, including repeated GP glyphs.
// Ascending GP-index then original position is a frozen, HYPOTHETICAL 52-card
// rank assignment. The two same-shaped Jokers are distinguished by source order.
const symbols = red.concat([page(54)[0]]);
const positions = Array.from({length: 52}, (_, i) => i)
  .sort((a, b) => symbols[a] - symbols[b] || a - b);
const cardOf = Array(52).fill(0);
positions.forEach((p, i) => { cardOf[p] = i + 1; });
const initialDeck = [
  ...cardOf.slice(0, 51), 53, cardOf[51], 54
];
assert.deepEqual(initialDeck.slice().sort((a,b) => a-b),
  Array.from({length:54}, (_,i) => i+1));

/** @param {number[]} deck @param {number} count */
function countCut(deck, count) {
  const removed = deck.splice(0, count);
  deck.splice(deck.length - 1, 0, ...removed);
}
/** @param {number[]} deck */
function shuffle(deck) {
  for (const [card, times] of [[53, 1], [54, 2]])
    for (let t = 0; t < times; t++) {
      const position = deck.indexOf(card);
      deck.splice(position, 1);
      deck.splice(position === deck.length ? 1 : position + 1, 0, card);
    }
  const a = deck.indexOf(53), b = deck.indexOf(54);
  const lo = Math.min(a,b), hi = Math.max(a,b);
  const old = deck.splice(0);
  deck.push(...old.slice(hi+1), ...old.slice(lo,hi+1), ...old.slice(0,lo));
  countCut(deck, Math.min(deck[53], 53));
}
/** @param {number[]} deck @returns {number} Standard output in 1..26 */
function nextKey(deck) {
  for (;;) {
    shuffle(deck);
    const value = deck[Math.min(deck[0], 53)];
    if (value <= 52) return 1 + (value - 1) % 26;
  }
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const freq = Array(29).fill(0);
  for (const symbol of input) freq[symbol]++;
  return freq.reduce((sum, n) => sum + n * (n-1), 0) /
    (input.length * (input.length-1));
}
/**
 * @param {number[]} input
 * @param {'direct'|'sorted'|'cyclic'} mode
 * @param {-1|1} sign
 * @param {'decode'|'encode'} direction
 * @returns {number[]}
 */
function transform(input, mode, sign, direction) {
  const deck = initialDeck.slice();
  const out = [];
  let previous = null;
  for (const value of input) {
    if (mode === 'direct') {
      const key = nextKey(deck);
      out.push((value + (direction === 'decode' ? sign : -sign)*key + 290)%29);
      continue;
    }
    if (previous === null) {
      out.push(value);
      previous = value;
      continue;
    }
    if (direction === 'decode') {
      if (value === previous) {
        out.push(28);
        continue;
      }
      const rank = mode === 'sorted'
        ? value - Number(value > previous) : (value - previous + 28)%29;
      out.push((rank + sign*(nextKey(deck)-1) + 280)%28);
      previous = value;
    } else {
      if (value === 28) {
        out.push(previous);
        continue;
      }
      const rank = (value - sign*(nextKey(deck)-1) + 280)%28;
      const actual = mode === 'sorted'
        ? rank + Number(rank >= previous) : (previous + rank + 1)%29;
      out.push(actual);
      previous = actual;
    }
  }
  return out;
}
/** @param {number[]} values */
function render(values) {
  return values.map(symbol => corpus.translit[symbol]).join('');
}
const controls = [];
const results = [];
const afterHeadingResults = [];
for (const mode of /** @type {const} */ (['direct','sorted','cyclic'])) {
  for (const sign of /** @type {const} */ ([-1,1])) {
    const decrypted = transform(p55, mode, sign, 'decode');
    assert.deepEqual(transform(decrypted, mode, sign, 'encode'), p55);
    const plantedPlain = p57.slice(0,76);
    const encoded = transform(plantedPlain, mode, sign, 'encode');
    assert.deepEqual(transform(encoded, mode, sign, 'decode'), plantedPlain);
    controls.push({mode,sign,recovered:76});
    results.push({mode,sign,ioc:ioc(decrypted),prefix:render(decrypted.slice(0,30))});
    const longer = transform(afterHeading, mode, sign, 'decode');
    assert.deepEqual(transform(longer, mode, sign, 'encode'), afterHeading);
    const plant299 = Array.from({length:299}, (_,i) => p57[i % p57.length]);
    assert.deepEqual(transform(transform(plant299, mode, sign, 'encode'),
      mode, sign, 'decode'), plant299);
    afterHeadingResults.push({mode, sign, ioc:ioc(longer),
      sourcePrefix:render(longer.slice(0,30))});
  }
}
assert.equal(results.length, 6);
assert.deepEqual(results.map(v => +v.ioc.toFixed(8)),
  [0.03508772,0.03789474,0.03298246,0.03122807,0.03929825,0.03789474]);
assert(results.every(v => v.ioc < 0.045));
assert.equal(afterHeadingResults.length, 6);
assert.deepEqual(afterHeadingResults.map(v => +v.ioc.toFixed(8)),
  [0.03654239,0.03333259,0.03548742,0.03737290,0.03524051,0.03445489]);
console.log(JSON.stringify({
  hypothesis: '2014 PATIENCE Solitaire with physical red51+Ac card deck and red13 Jokers',
  sourceDeck: initialDeck,
  p55CipherRunes:76,
  p55RawIoc:ioc(p55),
  nativeP57Ioc:ioc(p57),
  sixOriginalInverseResults:results,
  afterP54HeadingPlusP55Runes:afterHeading.length,
  afterP54HeadingOriginalIoc:ioc(afterHeading),
  sixAfterHeadingInverseResults:afterHeadingResults,
  exactPositiveReencryptions:controls,
  classification:'No authentic unknown plaintext or key; all six frozen direct uses negative'
}, null, 2));
