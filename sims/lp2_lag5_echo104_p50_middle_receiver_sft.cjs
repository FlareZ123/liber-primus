'use strict';

/**
 * Original LP2 lag-five word-echo tape versus the 104 central numerical cells.
 *
 * Source: canonical LP2 corpus, original rune transcript, physical p50 grid.
 * The 104=8*13 match is a candidate cipher receiver, NOT a decrypted page.
 * Node 22 CommonJS; one runnable test file and no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
/** @type {Array<{rune:number,word:number,page:number}>} */
const stream = [];
let word = 0;
let page = 0;
for (const glyph of transcript) {
  const rune = runeMap.get(glyph);
  if (rune !== undefined) {
    stream.push({rune, word, page});
  } else if (glyph === '%') {
    page++;
  } else if (glyph !== '/' && !/\s/u.test(glyph)) {
    word++;
  }
}
const original = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(original.length, 12956);
assert.equal(stream.length, 13136);
assert.deepEqual(stream.slice(0, original.length).map((x) => x.rune), original);

/** @type {number[]} */
const sites = [];
for (let i = 5; i < original.length; i++) {
  if (stream[i].word === stream[i - 5].word &&
      stream[i].rune === stream[i - 5].rune) {
    sites.push(i);
  }
}
const values = sites.map((i) => stream[i].rune);
const central = grid.pages.find((p) => p.page === 50);
assert.ok(central);
assert.equal(central.bytes.length, 104);
assert.equal(sites.length, 104);
const crossing = sites.filter((i) => stream[i].page !== stream[i-5].page);
assert.equal(crossing.length, 2);
assert.equal(sites.length - crossing.length, 102);
const key = central.bytes;
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} seq */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
/** @param {number[]} seq */
function text(seq) { return seq.map((x) => corpus.translit[x]).join(''); }
/** @param {number[]} seq */
function printability(seq) {
  return {printable: seq.filter((v) => v >= 32 && v <= 126).length,
    letters: seq.filter((v) => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length};
}
const numeric = [];
for (const orientation of ['forward', 'reverse']) {
  const table = orientation === 'forward' ? key : key.slice().reverse();
  for (const sign of [-1, 1]) {
    const plain = values.map((v, i) => mod29(v + sign * table[i]));
    const recovered = plain.map((v, i) => mod29(v - sign * table[i]));
    assert.deepEqual(recovered, values);
    numeric.push({orientation, sign, ioc: ioc(plain),
      first80: text(plain).slice(0, 80), candidate: text(plain)});
  }
}
const gaps = sites.map((site, i) => site - (i ? sites[i - 1] : 0));
const carriers = [
  {name: 'event-index', data: sites.map((x) => x & 255)},
  {name: 'rune-gap', data: gaps.map((x) => x & 255)},
  {name: 'word-gap', data: sites.map((site, i) =>
    (stream[site].word - (i ? stream[sites[i - 1]].word : 0)) & 255)},
  {name: 'GP-index', data: values},
  {name: 'GP-prime', data: values.map((v) => corpus.prime[v])}
];
const byteReadings = [];
for (const carrier of carriers) {
  for (const op of ['raw', 'xor', 'add', 'subtract']) {
    const decoded = carrier.data.map((v, i) => {
      if (op === 'raw') return v;
      if (op === 'xor') return v ^ key[i];
      if (op === 'add') return (v + key[i]) & 255;
      return (v - key[i] + 256) & 255;
    });
    byteReadings.push({carrier: carrier.name, operation: op,
      ...printability(decoded),
      ascii: decoded.slice(0, 48).map((v) => v >= 32 && v <= 126 ? String.fromCharCode(v) : '.').join('')});
  }
}
// Source-native controlled GP29 plant: p57 is clear plaintext with 95 symbols.
const known = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(known.length, 95);
const planted = known.concat(known.slice(0, 9));
assert.equal(planted.length, 104);
const encrypted = planted.map((p, i) => mod29(p + key[i]));
assert.deepEqual(encrypted.map((c, i) => mod29(c - key[i])), planted);
// Independent ASCII plant validates the direct byte-XOR path.
const target = Array.from({length:104}, (_, i) => 'A MAN DECIDED TO GO AND STUDY WITH A MASTER.'.
  charCodeAt(i % 'A MAN DECIDED TO GO AND STUDY WITH A MASTER.'.length));
const syntheticCarrier = target.map((p, i) => p ^ corpus.prime[values[i]]);
assert.deepEqual(syntheticCarrier.map((v, i) => v ^ corpus.prime[values[i]]), target);
const output = {
  classification: 'original-aligned, clue-constrained 104-cell receiver NEGATIVE; no unknown plaintext',
  source: 'canonical original 12956 GP runes, word carries across pages, middle 104 printed p50 bytes',
  observed: {events: sites.length, withinPhysicalPage: sites.length - crossing.length,
    crossingPageWord: crossing.length, firstEventRuneOffsets: sites.slice(0, 16),
    eventIoC: ioc(values), knownClearPage57IoC: ioc(known)},
  mechanism: 'same printed word C[i]=C[i-5] yields 104 events; align by order with exactly 104 p50 middle-page bytes',
  numeric,
  byteReadings,
  positiveControls: {GP29Symbols: planted.length, asciiBytes: target.length,
    bothExact: true},
  limit: '104 and p50=104 were noticed after studying the text; a count match supplies no creator-selected opcode. Only direct value and gap XOR/additive receivers were tested.'
};
console.log(JSON.stringify(output, null, 2));
