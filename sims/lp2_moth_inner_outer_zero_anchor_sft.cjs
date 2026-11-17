'use strict';

/**
 * Original-image-selected p53/p55 moth pair vs 32x8 table:
 * exact 180-interior/76-perimeter event census, zero anchors,
 * and frozen source-key plaintext tests.
 *
 * Node.js 22, read-only, standalone CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const get = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = get('resources/liber-primus/lp2-corpus.json');
const grid = get('resources/liber-primus/lp2-grid-256.json');
const ink = get('resources/liber-primus/lp2-ink-annotations.json');
const alphabet = grid.alphabet;
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const bytes = tokens.map(t =>
  60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert.ok(bytes.every(v => v >= 0 && v <= 255));

const page = n => corpus.pages.find(p => p.page === n);
const p53 = page(53).indices;
const p55 = page(55).indices;
assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
assert.equal(p55[0], 21); // NG: carried final glyph of a word from p54
const p55Body = p55.slice(1);
assert.equal(p55Body.length, 75);
for (const [number, runes] of [[53, 179], [55, 76]]) {
  const annotation = ink.pages.find(p => p.page === number);
  assert.equal(annotation.rune_count, runes);
  assert.deepEqual(annotation.large_punctuation, [[runes, 13, 'red']]);
}
const fullPages = corpus.pages.slice(0, 56).filter(p => p.indices.length);
const exactPairs = [];
for (let i = 0; i < fullPages.length; i++) {
  for (let j = i + 1; j < fullPages.length; j++) {
    if (fullPages[i].indices.length + fullPages[j].indices.length === 255) {
      exactPairs.push([fullPages[i].page, fullPages[j].page]);
    }
  }
}
assert.deepEqual(exactPairs, [[53, 55]]);

const outer = [], inner = [];
// Reading-order top-left start, clockwise perimeter of 32 rows x 8 columns.
for (let col = 0; col < 8; col++) outer.push(col);
for (let row = 1; row < 32; row++) outer.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) outer.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) outer.push(row * 8);
// Ordinary left-right, top-bottom interior of rows 1..30, columns 1..6.
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) inner.push(row * 8 + col);
}
assert.equal(outer.length, 76);
assert.equal(inner.length, 180);
assert.equal(new Set([...outer, ...inner]).size, 256);
const zeros = bytes.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(zeros, [192, 229]);
assert.equal(outer.includes(192), true);
assert.equal(inner.includes(229), true);
assert.equal(outer.includes(229), false);
assert.equal(inner.includes(192), false);

// A terminal 13-dot marker is a structural event with no GP rune index.
// Under this explicit conjectural reading, each marker occupies the unique
// 00 cell of its selected table region. This selects a cycle start immediately
// after the zero for each region; the manuscript does NOT state this rule.
const cycleAfter = (order, stop) => {
  const n = order.indexOf(stop);
  assert.ok(n >= 0);
  return [...order.slice(n + 1), ...order.slice(0, n), stop];
};
const treatments = [
  {name:'p53-inner', runes:p53, order:cycleAfter(inner, 229), stop:229},
  {name:'p55-outer', runes:p55Body, order:cycleAfter(outer, 192), stop:192}
];
const ioc = digits => {
  const counts = new Array(29).fill(0);
  for (const d of digits) counts[d]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (digits.length * (digits.length - 1));
};
const mod = v => (v % 29 + 29) % 29;
const gp = text => text.map(x => corpus.translit[x]).join('');
const outcomes = [];
for (const t of treatments) {
  assert.equal(t.order.length, t.runes.length + 1);
  assert.equal(t.order.at(-1), t.stop);
  assert.equal(bytes[t.stop], 0);
  assert.ok(t.order.slice(0, -1).every(cell => bytes[cell] !== 0));
  const k = t.order.slice(0, -1).map(cell => bytes[cell] % 29);
  const rawIc = ioc(t.runes);
  for (const sign of [-1, 1]) {
    const decoded = t.runes.map((symbol, i) => mod(symbol + sign * k[i]));
    const reencoded = decoded.map((value, i) => mod(value - sign * k[i]));
    assert.deepEqual(reencoded, t.runes);
    outcomes.push({
      page_zone:t.name, sign, runes:t.runes.length,
      ciphertext_ioc:rawIc, decoded_ioc:ioc(decoded),
      first80_gp:gp(decoded.slice(0, 80))
    });
  }
}
assert.ok(outcomes.every(x => x.decoded_ioc < 0.05));
console.log(JSON.stringify({
  source:'LP2 original page-counts, 13-dot physical annotations, p50 table',
  independent_art_selector:'p53/p55 repeated moth, source-pixel match documented separately',
  unique_255_rune_page_pair:exactPairs,
  structured_event_counts:{p53:180,p55_body:76,combined:256},
  table:{shape:[32,8],perimeter:outer.length,interior:inner.length,
    zero_positions:zeros.map(i=>({index:i,row:Math.floor(i/8),col:i%8,
      zone:outer.includes(i)?'outer':'inner'}))},
  marker_receiver:'conjectural zero-anchored cycle, NOT an authored opcode',
  tests:outcomes,
  conclusion:'No original plaintext under direct +/- table-byte GP29 pads'
}, null, 2));
