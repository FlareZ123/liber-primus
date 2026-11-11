'use strict';

/**
 * Reproduce the 13-dot punctuation event segmentation without silently
 * deduplicating distinct printed marks at a shared logical rune offset.
 *
 * Run from repository root with Node 22:
 *   node sims/lp2_13dot_coincident_fragment_audit.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');

const base = new Map();
let totalRunes = 0;
for (const page of corpus.pages) {
  base.set(page.page, totalRunes);
  totalRunes += page.runic_count;
}
assert.equal(totalRunes, 13136);

const events = [];
for (const page of ink.pages) {
  for (const [localOffset, dotCount, color] of page.large_punctuation || []) {
    if (dotCount !== 13) continue;
    assert.ok(base.has(page.page), `annotation page ${page.page} missing from corpus`);
    assert.ok(localOffset >= 0 && localOffset <=
      corpus.pages.find(p => p.page === page.page).runic_count);
    events.push({
      page: page.page,
      localOffset,
      globalOffset: base.get(page.page) + localOffset,
      color
    });
  }
}
events.sort((a, b) => a.globalOffset - b.globalOffset ||
  a.page - b.page || a.localOffset - b.localOffset || a.color.localeCompare(b.color));
assert.equal(events.length, 31);

const groups = new Map();
for (const event of events) {
  if (!groups.has(event.globalOffset)) groups.set(event.globalOffset, []);
  groups.get(event.globalOffset).push(event);
}
const coincident = [...groups.entries()]
  .filter(([, group]) => group.length > 1)
  .map(([globalOffset, group]) => ({globalOffset, events: group}));
assert.equal(groups.size, 29);
assert.deepEqual(coincident.map(x => x.globalOffset), [1860, 3603]);
assert.deepEqual(coincident[0].events.map(x => [x.page, x.localOffset, x.color]),
  [[7, 194, 'black'], [7, 194, 'red']]);
assert.deepEqual(coincident[1].events.map(x => [x.page, x.localOffset, x.color]),
  [[14, 137, 'red'], [15, 0, 'red']]);

// Preserve each printed event. A zero-length interval is the runic interval
// between two distinct physical marks at the same logical rune offset.
const fragments = [];
let previous = 0;
for (const event of events) {
  fragments.push({
    zeroBasedIndex: fragments.length,
    oneBasedNumber: fragments.length + 1,
    start: previous,
    end: event.globalOffset,
    length: event.globalOffset - previous,
    terminatingEvent: event
  });
  previous = event.globalOffset;
}
fragments.push({
  zeroBasedIndex: fragments.length,
  oneBasedNumber: fragments.length + 1,
  start: previous,
  end: totalRunes,
  length: totalRunes - previous,
  terminatingEvent: null
});
assert.equal(fragments.length, 32);
const empty = fragments.filter(x => x.length === 0);
assert.deepEqual(empty.map(x => x.zeroBasedIndex), [8, 11]);
assert.deepEqual(empty.map(x => x.oneBasedNumber), [9, 12]);

// Original scans supporting the two pairs are retained in resources.
for (const file of ['24.jpg', '31.jpg', '32.jpg']) {
  assert.ok(fs.existsSync(path.join(root, 'resources/liber-primus', file)),
    `missing original scan ${file}`);
}

console.log(JSON.stringify({
  totalOriginalRunes: totalRunes,
  printed13DotEvents: events.length,
  uniqueLogicalOffsets: groups.size,
  coincidentPhysicalMarkPairs: coincident,
  fragmentCountWhenAllPrintedEventsArePreserved: fragments.length,
  zeroLengthFragments: empty,
  interpretation: 'Two distinct physical 13-dot mark pairs delimit zero-rune intervals. Do not silently deduplicate without a source rule.'
}, null, 2));
