#!/usr/bin/env node
'use strict';

// Bounded source test: 2014 stage04 cells 366/199 -> mod-8 columns 7/8,
// aligned row-for-row with the 32 red fragments delimited by 13-dot marks.
// Test only the simplest per-fragment repeating two-rune additive key.
// This is not a general cipher search and does not claim the modulo-8 selector
// or row/fragment alignment is authenticated.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
assert.equal(grid.bytes.length, 256);

const pageByNumber = new Map(corpus.pages.map(page => [page.page, page]));
const events = [];
for (const annotatedPage of ink.pages) {
  const sourcePage = pageByNumber.get(annotatedPage.page);
  assert.ok(sourcePage, `missing corpus page ${annotatedPage.page}`);
  for (const span of annotatedPage.red_spans || []) {
    for (let j = 0; j < span.length; j++) {
      events.push({
        page: annotatedPage.page,
        offset: span.start + j,
        kind: 1,
        rune: sourcePage.indices[span.start + j]
      });
    }
  }
  for (const mark of annotatedPage.large_punctuation || []) {
    if (mark[1] === 13) events.push({ page: annotatedPage.page, offset: mark[0], kind: 0 });
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);

const fragments = [[]];
let eventIndex = 0;
for (const page of corpus.pages) {
  for (let offset = 0; offset <= page.indices.length; offset++) {
    while (
      eventIndex < events.length &&
      events[eventIndex].page === page.page &&
      events[eventIndex].offset === offset
    ) {
      const event = events[eventIndex++];
      if (event.kind === 0) fragments.push([]);
      else fragments[fragments.length - 1].push(event.rune);
    }
  }
}
assert.equal(eventIndex, events.length, 'all annotated red/13-dot events must be consumed');
assert.equal(fragments.length, 32, '13-dot marks should define 32 ordered fragments');
assert.deepEqual(fragments[6], [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
const translit = runes => runes.map(index => corpus.translit[index]).join('');
assert.equal(translit(fragments[6]), 'ATXBMGIASBXEO');

function phi(n) {
  if (!Number.isInteger(n) || n < 1) return null;
  let result = n;
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result -= result / p;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return Math.round(result);
}
const mod29 = n => ((n % 29) + 29) % 29;

const selectors = [
  { id: 'mod8-zero-based', printedColumns: '7-8', columns: [6, 7] },
  { id: 'literal-one-based', printedColumns: '6-7', columns: [5, 6] }
];
const mappings = [
  { id: 'raw-byte-mod29', map: value => value % 29 },
  { id: 'phi-byte-mod29', map: value => {
    const valuePhi = phi(value);
    return valuePhi === null ? null : valuePhi % 29;
  }}
];

const variants = [];
for (const selector of selectors) {
  for (const mapping of mappings) {
    for (const sign of [-1, 1]) {
      const perFragment = fragments.map((fragment, row) => {
        const bytePair = selector.columns.map(column => grid.bytes[row * 8 + column]);
        const key = bytePair.map(mapping.map);
        if (key.some(value => value === null)) {
          return {
            fragment: row + 1,
            bytePair,
            key,
            skipped: fragment.length ? 'phi(0) undefined' : 'empty fragment'
          };
        }
        const output = fragment.map((rune, offset) => mod29(rune + sign * key[offset % 2]));
        return {
          fragment: row + 1,
          input: translit(fragment),
          bytePair,
          key,
          output: translit(output)
        };
      });
      variants.push({
        selector: selector.id,
        printedColumns: selector.printedColumns,
        mapping: mapping.id,
        operation: sign < 0 ? 'subtract-repeating-key' : 'add-repeating-key',
        nonemptyFragments: perFragment.filter(item => item.input).length,
        skippedNonempty: perFragment.filter(item => item.skipped && fragments[item.fragment - 1].length).map(item => item.fragment),
        fragment7: perFragment.find(item => item.fragment === 7),
        outputs: perFragment.filter(item => item.input)
      });
    }
  }
}

const lookup = (selector, mapping, operation) =>
  variants.find(item => item.selector === selector && item.mapping === mapping && item.operation === operation).fragment7;
assert.deepEqual(lookup('mod8-zero-based', 'raw-byte-mod29', 'subtract-repeating-key').key, [11, 22]);
assert.deepEqual(lookup('mod8-zero-based', 'phi-byte-mod29', 'subtract-repeating-key').key, [19, 3]);
assert.equal(lookup('mod8-zero-based', 'raw-byte-mod29', 'subtract-repeating-key').output, 'PDOAHPTOEGNGU');
assert.equal(lookup('mod8-zero-based', 'raw-byte-mod29', 'add-repeating-key').output, 'GNAEIUEANHEAWD');
assert.equal(lookup('mod8-zero-based', 'phi-byte-mod29', 'subtract-repeating-key').output, 'CPAXFOHEOIAJOE');
assert.equal(lookup('mod8-zero-based', 'phi-byte-mod29', 'add-repeating-key').output, 'XMRLNNBEWBTH');
assert.equal(lookup('literal-one-based', 'raw-byte-mod29', 'subtract-repeating-key').output, 'IACBGOEAURLOS');
assert.equal(lookup('literal-one-based', 'raw-byte-mod29', 'add-repeating-key').output, 'NGIAJEATBAYXAEN');
assert.equal(lookup('literal-one-based', 'phi-byte-mod29', 'subtract-repeating-key').output, 'OYOEIAIATGAEAEAL');
assert.equal(lookup('literal-one-based', 'phi-byte-mod29', 'add-repeating-key').output, 'TGGWJAEMCNRR');

console.log(JSON.stringify({
  hypothesis: 'one row per 13-dot red fragment; two selected table columns form a repeating two-rune additive key',
  caveats: [
    '366/199 modulo 8 selecting printed columns 7-8 is a hypothesis, not an authenticated instruction',
    'row-for-fragment alignment is a hypothesis',
    'only the direct repeating two-rune additive interpretation is tested'
  ],
  fragmentCount: fragments.length,
  nonemptyFragmentCount: fragments.filter(fragment => fragment.length > 0).length,
  emptyFragmentNumbers: fragments.map((fragment, index) => fragment.length ? null : index + 1).filter(Boolean),
  fragment7: { runeIndices: fragments[6], transliteration: translit(fragments[6]) },
  variants
}, null, 2));
