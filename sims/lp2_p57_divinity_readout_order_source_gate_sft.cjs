'use strict';

/**
 * Director #1565: source-only ordering gate for the two DIUINITY-derived p50
 * cells. The historical 2800 target and token decimality are excluded from the
 * selector. We compare only:
 *
 * 1. imperative order in clear p57 ("SHED ... CIRCUMFERENCES", then
 *    "FIND ... DIUINITY WITHIN"); and
 * 2. ordinary printed p50 table reading order of the already-fixed addresses.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * Parse complete words from one transcription segment.
 * Slash and whitespace are line layout; punctuation terminates a word.
 * @param {string} segment
 * @returns {{translit:string,indices:number[]}[]}
 */
function parseWords(segment) {
  const words = [];
  let current = [];
  function finish() {
    if (!current.length) return;
    words.push({
      translit: current.map((index) => corpus.translit[index]).join(''),
      indices: current.slice()
    });
    current = [];
  }

  for (const character of segment) {
    if (runeIndex.has(character)) {
      current.push(runeIndex.get(character));
    } else if (character === '/' || /\s/u.test(character)) {
      // Physical line layout only.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

const segments = source.split('%');
const p57 = parseWords(segments[segments.length - 1]);
assert.deepEqual(
  p57.map((word) => word.translit),
  [
    'PARABLE','LICE','THE','INSTAR','TUNNELNG','TO','THE','SURFACE','WE',
    'MUST','SHED','OUR','OWN','CIRCUMFERENCES','FIND','THE','DIUINITY',
    'WITHIN','AND','EMERGE'
  ]
);

const shedIndex = p57.findIndex((word) => word.translit === 'SHED');
const circumferenceIndex =
  p57.findIndex((word) => word.translit === 'CIRCUMFERENCES');
const findIndex = p57.findIndex((word) => word.translit === 'FIND');
const divinityIndex = p57.findIndex((word) => word.translit === 'DIUINITY');
const withinIndex = p57.findIndex((word) => word.translit === 'WITHIN');

assert.deepEqual(
  [shedIndex, circumferenceIndex, findIndex, divinityIndex, withinIndex],
  [10, 13, 14, 16, 17]
);
assert.ok(circumferenceIndex < findIndex);
assert.ok(findIndex < divinityIndex);
assert.ok(divinityIndex < withinIndex);

const divinity = p57[divinityIndex].indices;
assert.equal(divinity.length, 8);
const interior = divinity.slice(1, -1);
const endpoints = [divinity[0], divinity[divinity.length - 1]];
const primeSum = (indices) =>
  indices.reduce((sum, index) => sum + corpus.prime[index], 0);
const innerAddress = primeSum(interior);
const outerAddress = primeSum(endpoints);
assert.deepEqual([innerAddress, outerAddress], [184, 192]);

const tablePages = grid.pages;
let tableStart = 0;
/**
 * @param {number} address
 */
function locate(address) {
  let start = 0;
  for (let pageIndex = 0; pageIndex < tablePages.length; pageIndex++) {
    const page = tablePages[pageIndex];
    const end = start + page.tokens.length;
    if (address >= start && address < end) {
      const local = address - start;
      return {
        address,
        sourcePage: page.page,
        localRow: Math.floor(local / 8),
        column: local % 8,
        globalRow: Math.floor(address / 8)
      };
    }
    start = end;
  }
  throw new Error('address outside p50 table');
}

const innerLocation = locate(innerAddress);
const outerLocation = locate(outerAddress);
assert.deepEqual(innerLocation, {
  address: 184,
  sourcePage: 51,
  localRow: 0,
  column: 0,
  globalRow: 23
});
assert.deepEqual(outerLocation, {
  address: 192,
  sourcePage: 51,
  localRow: 1,
  column: 0,
  globalRow: 24
});
assert.equal(innerLocation.sourcePage, outerLocation.sourcePage);
assert.equal(innerLocation.column, outerLocation.column);
assert.equal(outerLocation.localRow, innerLocation.localRow + 1);

// Only after both source-order diagnostics are fixed may the token values be
// shown. They are not used to choose between the two orders.
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens[innerAddress], '28');
assert.equal(tokens[outerAddress], '00');

console.log(JSON.stringify({
  p57ImperativeOrder: {
    words: ['SHED','OUR','OWN','CIRCUMFERENCES','FIND','THE','DIUINITY','WITHIN'],
    operandOrder: ['outer','inner']
  },
  p50GraphicalOrder: {
    inner: innerLocation,
    outer: outerLocation,
    ordinaryTopToBottomOrder: ['inner','outer']
  },
  tokenReadoutAfterOrderIsFixed: {
    innerThenOuter: tokens[innerAddress] + tokens[outerAddress],
    outerThenInner: tokens[outerAddress] + tokens[innerAddress]
  },
  decision:
    'AMBIGUOUS: clear p57 instruction chronology is outer->inner, while ordinary p50 table reading order is inner->outer. No source rule in these objects says which ordering principle controls concatenation.'
}, null, 2));
