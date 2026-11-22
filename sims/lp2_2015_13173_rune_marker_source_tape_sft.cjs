'use strict';

/**
 * Test the 2015 missing 13,173-row register's simplest complete-source
 * serialization: initial fictitious F + every physical LP2 rune + every
 * large original printed punctuation glyph.
 * A length/ordering hypothesis, never a claim of recovered 2015 code.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relative */
const read = (relative) => JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const annotations = read('resources/liber-primus/lp2-ink-annotations.json');
assert.equal(corpus.pages.length, 58);
assert.equal(annotations.counts.runes, 13136);
assert.equal(annotations.counts.red13 + annotations.counts.black13 + annotations.counts.red10 + annotations.counts.red23, 36);

/**
 * @typedef {{kind:'fictitious-f',runeIndex:number}|{kind:'rune',page:number,offset:number,runeIndex:number}|{kind:'large-punctuation',page:number,afterRunes:number,dots:number,ink:string}} Token
 */
/** @type {Token[]} */
const tape = [{ kind: 'fictitious-f', runeIndex: 0 }];
for (const page of corpus.pages) {
  // Annotation records exist only for pages with red ink or large marks.
  const annotation = annotations.pages.find((entry) => entry.page === page.page) || {
    rune_count: page.indices.length,
    large_punctuation: []
  };
  assert.equal(annotation.rune_count, page.indices.length);
  const markers = annotation.large_punctuation || [];
  for (let offset = 0; offset <= page.indices.length; offset++) {
    // Same-offset printed marks retain the source transcription's order.
    for (const mark of markers) {
      if (mark[0] === offset) {
        tape.push({
          kind: 'large-punctuation',
          page: page.page,
          afterRunes: offset,
          dots: mark[1],
          ink: mark[2]
        });
      }
    }
    if (offset < page.indices.length) {
      tape.push({kind: 'rune', page: page.page, offset, runeIndex: page.indices[offset]});
    }
  }
}

assert.equal(tape.length, 13173);
const runes = tape.filter((token) => token.kind === 'rune');
const marks = tape.filter((token) => token.kind === 'large-punctuation');
assert.equal(runes.length, 13136);
assert.equal(marks.length, 36);
assert.equal(runes.filter((token) => token.page <= 56).length, 13041);
assert.equal(runes.filter((token) => token.page === 57).length, 95);
assert.equal(tape[0].kind, 'fictitious-f');
assert.equal(tape[1].kind, 'rune');
assert.equal(tape[1].page, 0);
assert.equal(tape[1].offset, 0);
assert.deepEqual(tape[14], {
  kind: 'large-punctuation', page: 0, afterRunes: 13, dots: 13, ink: 'red'
});

const pair = tape.filter((token) => token.kind === 'large-punctuation' && token.page === 7 && token.afterRunes === 194);
assert.deepEqual(pair.map((item) => [item.dots, item.ink]), [[13, 'black'], [13, 'red']]);
const pairAt = tape.findIndex((token) => token === pair[0]);
assert.equal(tape[pairAt + 1], pair[1]);
assert.deepEqual(tape[tape.length - 1], {
  kind: 'large-punctuation', page: 57, afterRunes: 95, dots: 23, ink: 'red'
});
const p3First = tape.findIndex((token) => token.kind === 'rune' && token.page === 3 && token.offset === 0);
assert.equal(p3First, 732);
const p57First = tape.findIndex((token) => token.kind === 'rune' && token.page === 57 && token.offset === 0);

console.log(JSON.stringify({
  status: 'PASS',
  hypotheticalRegisterLength: tape.length,
  sourceRunes: runes.length,
  largePrintedMarks: marks.length,
  initialFictitiousF: 1,
  historicalLaterTableLength: runes.filter((token) => token.page <= 56).length,
  p3FirstTapeOffset: p3First,
  p57FirstTapeOffset: p57First,
  lastToken: tape[tape.length - 1],
  sameOffsetP7OriginalMarks: pair,
  interpretation: 'exact source-length/ordering candidate, not recovered original 2015 array or decoder'
}, null, 2));
