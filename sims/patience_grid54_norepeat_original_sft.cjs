'use strict';

/**
 * Historical PATIENCE Solitaire cipher, seeded from the original 32x8
 * numeric table, applied through an exactly invertible GP28 predecessor-
 * exclusion channel with GP-EA transparent doublet markers.
 *
 * The 54-card seed reads the first 54 source bytes either row-major or
 * column-major, stable-ranks them as card identities, and holds that rule
 * fixed before inspecting any LP2 ciphertext. This deck interpretation
 * remains a hypothesis, not a historical Cicada instruction.
 *
 * Run: node sims/patience_grid54_norepeat_original_sft.cjs
 * Node 22, CommonJS, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name */
const file = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(file('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(file('resources/liber-primus/lp2-grid-256.json'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length).map(p => p.indices);
const cipher = pages.flat();
assert.equal(cipher.length, 12956);
assert.equal(grid.bytes.length, 256);
assert.equal(pages.length, 55);
assert.equal(corpus.translit[28], 'EA');

/** @param {number[]} sequence */
function deckFromBytes(sequence) {
  assert(sequence.length >= 54);
  return Array.from({length: 54}, (_, i) => i + 1)
    .sort((a, b) => sequence[a - 1] - sequence[b - 1] || a - b);
}
/** @param {number[]} deck @param {number} n */
function countCut(deck, n) {
  const top = deck.splice(0, n);
  deck.splice(deck.length - 1, 0, ...top);
}
/** @param {number[]} deck */
function shuffle(deck) {
  for (const [card, rounds] of [[53, 1], [54, 2]])
    for (let t = 0; t < rounds; t++) {
      const p = deck.indexOf(card);
      deck.splice(p, 1);
      deck.splice(p === deck.length ? 1 : p + 1, 0, card);
    }
  const a = deck.indexOf(53), b = deck.indexOf(54);
  const low = Math.min(a, b), high = Math.max(a, b);
  const old = deck.splice(0);
  deck.push(...old.slice(high + 1), ...old.slice(low, high + 1),
    ...old.slice(0, low));
  countCut(deck, Math.min(deck[53], 53));
}
/** @param {number[]} deck */
function nextKey(deck) {
  for (;;) {
    shuffle(deck);
    const output = deck[Math.min(deck[0], 53)];
    if (output <= 52) return (output - 1) % 26;
  }
}
/** @param {number} s @param {number} prev @param {'sorted'|'cyclic'} rank */
function toRank(s, prev, rank) {
  assert.notEqual(s, prev);
  return rank === 'sorted'
    ? s - Number(s > prev)
    : (s - prev + 28) % 29;
}
/** @param {number} s @param {number} prev @param {'sorted'|'cyclic'} rank */
function fromRank(s, prev, rank) {
  assert(s >= 0 && s < 28);
  return rank === 'sorted'
    ? s + Number(s >= prev)
    : (prev + s + 1) % 29;
}
/**
 * Both directions are exact inverses by construction.
 * @param {number[][]} source
 * @param {number[]} initialDeck
 * @param {'sorted'|'cyclic'} rank
 * @param {'book'|'page'} clock
 * @param {'decode'|'encode'} direction
 */
function transform(source, initialDeck, rank, clock, direction) {
  let deck = initialDeck.slice();
  const output = [];
  for (const page of source) {
    if (clock === 'page') deck = initialDeck.slice();
    let previous = null;
    for (const symbol of page) {
      if (previous === null) {
        output.push(symbol);
        previous = symbol;
        continue;
      }
      if (direction === 'decode') {
        if (symbol === previous) {
          output.push(28);
          continue;
        }
        const plain = (toRank(symbol, previous, rank) - nextKey(deck) + 28) % 28;
        output.push(plain);
        previous = symbol;
      } else {
        if (symbol === 28) {
          output.push(previous);
          continue;
        }
        const runic = fromRank((symbol + nextKey(deck)) % 28, previous, rank);
        output.push(runic);
        previous = runic;
      }
    }
  }
  return output;
}
/** @param {number[]} stream @param {number[][]} template */
function repage(stream, template) {
  let offset = 0;
  return template.map(page => {
    const part = stream.slice(offset, offset + page.length);
    offset += page.length;
    return part;
  });
}
/** @param {number[]} stream */
function ioc(stream) {
  const frequency = Array(29).fill(0);
  for (const c of stream) frequency[c]++;
  return frequency.reduce((s, count) => s + count * (count - 1), 0)
    / (stream.length * (stream.length - 1));
}
/** @param {string} text */
function sourceEnglish(text) {
  const tokens = new Map(corpus.translit.map((symbol, i) => [symbol, i]));
  const s = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const output = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (tokens.has(pair)) {
      output.push(tokens.get(pair));
      i += 2;
    } else {
      const x = tokens.get(s[i]);
      if (x !== undefined) output.push(x);
      i++;
    }
  }
  return output;
}
const native = sourceEnglish(file('resources/control/shakespeare_first300k.txt'))
  .slice(0, cipher.length);
assert.equal(native.length, cipher.length);
const rowBytes = grid.bytes;
const columnBytes = Array.from({length: 256},
  (_, i) => rowBytes[(i % 32) * 8 + Math.floor(i / 32)]);

const results = [];
for (const [sourceDeck, bytes] of [['row54', rowBytes], ['col54', columnBytes]]) {
  const initialDeck = deckFromBytes(bytes);
  for (const rank of ['cyclic', 'sorted'])
    for (const clock of ['book', 'page']) {
      const decoded = transform(pages, initialDeck, rank, clock, 'decode');
      const actualReencrypted = transform(repage(decoded, pages),
        initialDeck, rank, clock, 'encode');
      assert.deepEqual(actualReencrypted, cipher);
      const plantedCipher = transform(repage(native, pages),
        initialDeck, rank, clock, 'encode');
      const recovered = transform(repage(plantedCipher, pages),
        initialDeck, rank, clock, 'decode');
      assert.deepEqual(recovered, native);
      const unmarked = decoded.filter(x => x !== 28);
      results.push({
        sourceDeck, rank, clock,
        decodedIoC: ioc(decoded), nonMarkerIoC: ioc(unmarked),
        decodedMarkerCount: decoded.length - unmarked.length,
        nativeIoC: ioc(native),
        sourceNativeRecovery: recovered.length,
        originalReencryption: actualReencrypted.length,
        firstRunes: decoded.slice(0, 20).map(i => corpus.translit[i]).join(' ')
      });
    }
}
assert.equal(results.length, 8);
assert(results.every(r => r.decodedIoC < 0.04));
console.log(JSON.stringify({
  hypothesis: 'source 54-card Solitaire deck + GP28 predecessor exclusion + EA marker',
  evidence: 'no original plaintext or authentic key',
  models: results.length, originalRunes: cipher.length,
  originalRawIoC: ioc(cipher), results
}, null, 2));
