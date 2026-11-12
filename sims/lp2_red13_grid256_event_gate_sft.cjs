'use strict';

/**
 * Source-ordered red-rune + 13-dot event tape against the physical 32×8
 * pp49–51 table. Read-only single-file research test.
 * Inputs are original-image-derived annotations and the canonical corpus.
 * Run: node sims/lp2_red13_grid256_event_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const annotations = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-ink-annotations.json'));
const grid = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'));
const corpus = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'));

const gp = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(gp.size, 29);
assert.equal(annotations.counts.red, 225);
assert.equal(annotations.counts.red13 + annotations.counts.black13, 31);
assert.equal(annotations.counts.red10, 4);
assert.equal(annotations.counts.red23, 1);
assert.deepEqual(grid.pages.flatMap((page) => page.bytes), grid.bytes);
assert.equal(grid.bytes.length, 256);

/**
 * A punctuation at page-local offset x is printed *after* rune x-1,
 * hence precedes a red rune at x. Same-offset punctuation keeps
 * original annotation order, preserving p7 black-then-red 13-dot marks.
 * @returns {Array<{page:number,offset:number,kind:string,ink:string,rune:string|null,value:number,at:number,row:number,column:number,byte:number}>}
 */
function eventTape() {
  const events = [];
  for (const page of annotations.pages) {
    const local = [];
    let order = 0;
    for (const span of page.red_spans || []) {
      const chars = [...span.runes];
      assert.equal(chars.length, span.length);
      for (let j = 0; j < chars.length; j++) {
        assert.ok(gp.has(chars[j]), 'unknown GP rune ' + chars[j]);
        local.push({
          page: page.page, offset: span.start + j, kind: 'rune',
          ink: 'red', rune: chars[j], value: gp.get(chars[j]),
          rank: 1, order: order++
        });
      }
    }
    for (const [offset, dots, ink] of page.large_punctuation || []) {
      if (dots !== 13) continue;
      local.push({
        page: page.page, offset, kind: '13dot', ink, rune: null,
        value: 29, rank: 0, order: order++
      });
    }
    local.sort((a, b) => a.offset - b.offset || a.rank - b.rank || a.order - b.order);
    for (const event of local) {
      const at = events.length;
      const {rank, order, ...data} = event;
      events.push({...data, at, row: Math.floor(at / 8) + 1, column: (at % 8) + 1, byte: grid.bytes[at]});
    }
  }
  return events;
}

const events = eventTape();
assert.equal(events.length, 256);
assert.equal(events.filter((event) => event.kind === 'rune').length, 225);
assert.equal(events.filter((event) => event.kind === '13dot').length, 31);
assert.deepEqual(
  events.filter((event) => event.page === 7 && event.offset === 194).map((event) => [event.kind, event.ink]),
  [['13dot', 'black'], ['13dot', 'red'], ['rune', 'red']]
);
assert.deepEqual(events.slice(248).map((event) => [event.page, event.kind]),
  [...Array(7)].map(() => [57, 'rune']).concat([[57, '13dot']]));
assert.deepEqual(events.slice(240, 248).map((event) => [event.page, event.kind]),
  [[55, '13dot'], ...[...Array(5)].map(() => [56, 'rune']), [56, '13dot'], [56, '13dot']]);

/**
 * Exact invertible GP29 Vigenere arithmetic used by authentic Cicada
 * operations, conditional on the speculative byte-to-shift rule k=b mod29.
 * The input byte itself is preserved unchanged by the event decoder.
 * @param {number} index Original 0..28 GP symbol
 * @param {number} byte Original 0..255 table cell
 * @param {boolean} encrypt True for encipherment
 * @returns {number}
 */
function gpShift(index, byte, encrypt) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < 29);
  assert.ok(Number.isInteger(byte) && byte >= 0 && byte <= 255);
  return (index + (encrypt ? byte % 29 : 29 - (byte % 29))) % 29;
}

/**
 * Every character in these two known solved headings is a single GP rune.
 * @param {string} text Source-known printed heading
 * @returns {number[]}
 */
function encodeNativeHeading(text) {
  return [...text].map((letter) => {
    const index = corpus.translit.indexOf(letter);
    assert.ok(index >= 0, 'not a single GP rune: ' + letter);
    return index;
  });
}

const known = [
  {page: 56, text: 'ANEND'},
  {page: 57, text: 'PARABLE'}
].flatMap(({page, text}) => {
  const selected = events.filter((event) => event.page === page && event.kind === 'rune');
  const expected = encodeNativeHeading(text);
  assert.equal(selected.length, expected.length);
  return selected.map((event, j) => ({
    at: event.at, page, offset: event.offset, cell: event.byte,
    cipherGP: event.value, knownPlainGP: expected[j],
    requiredKey: (event.value - expected[j] + 29) % 29,
    tableKey: event.byte % 29,
    decodedGP: gpShift(event.value, event.byte, false),
    matches: gpShift(event.value, event.byte, false) === expected[j]
  }));
});
assert.deepEqual(known.slice(0, 5).map((x) => x.requiredKey), [1, 2, 4, 6, 10]);
assert.deepEqual(known.slice(5).map((x) => x.requiredKey), Array(7).fill(0));
assert.equal(known.filter((x) => x.matches).length, 0);

// Positive control: a genuine native-GP phrase, encoded with the *frozen*
// table cell stream, must decode perfectly, even across the p56→p57 cut.
const planted = known.map((item) => gpShift(item.knownPlainGP, item.cell, true));
assert.deepEqual(planted.map((index, i) => gpShift(index, known[i].cell, false)),
  known.map((item) => item.knownPlainGP));

// Exactly preserve 13-dot ink and order. A 30th literal event code is only an
// unkeyed serialization control, NOT an authenticated Cicada alphabet.
const dotEvents = events.filter((event) => event.kind === '13dot');
const literal30 = events.filter((event) => event.byte % 30 === event.value).length;
const dotLiteral30 = dotEvents.filter((event) => event.byte % 30 === 29).length;
assert.equal(literal30, 11);
assert.equal(dotLiteral30, 1);


// Exact feasibility of *any* memoryless direct byte -> 30-way printed event
// codebook. Same source byte must represent the same event, regardless of
// secret alphabet labels. Count unavoidable mismatches by majority vote.
const byByte = new Map();
for (const event of events) {
  const group = byByte.get(event.byte) || [];
  group.push({at: event.at, page: event.page, value: event.value});
  byByte.set(event.byte, group);
}
let conflictingByteGroups = 0;
let maximumFixedCodebookMatches = 0;
const contradictoryExamples = [];
for (const [byte, group] of byByte) {
  const counts = new Map();
  for (const event of group) counts.set(event.value, (counts.get(event.value) || 0) + 1);
  const majority = Math.max(...counts.values());
  maximumFixedCodebookMatches += majority;
  if (counts.size > 1) {
    conflictingByteGroups++;
    if (contradictoryExamples.length < 8) contradictoryExamples.push({byte, events: group});
  }
}
const minimumCodebookErrors = events.length - maximumFixedCodebookMatches;
assert.equal(byByte.size, 161);
assert.equal(conflictingByteGroups, 66);
assert.equal(maximumFixedCodebookMatches, 166);
assert.equal(minimumCodebookErrors, 90);



// Source-shape alternative: 16x16 table = 31 top/left border + 225
// interior cells. Independently partition all red rune events into a 15x15
// matrix in reading order. An arbitrary *secret* row/column additive key
// requires D[r,c] = rowKey[r] + colKey[c] (mod 29), where
// D[r,c] = printedRed[r,c] - gridInterior[r,c] (mod29).
// Exact necessary and sufficient condition: all anchored 2x2 minors vanish.
const red225 = events.filter((event) => event.kind === 'rune');
assert.equal(red225.length, 225);
assert.ok(red225.slice(0, 210).every((event) => event.page < 56));
const innerByte29 = Array.from({length: 15}, (_, r) =>
  Array.from({length: 15}, (_, c) => grid.bytes[(r + 1) * 16 + c + 1] % 29));
const sourceRed15 = Array.from({length: 15}, (_, r) =>
  red225.slice(r * 15, (r + 1) * 15).map((event) => event.value));
/**
 * Count anchored GF29 2x2 failures for the entire 15x15 and the first 14
 * rows containing 210 original unsolved-page red runes exclusively.
 * @param {number[][]} printed Original or synthetic source-red matrix
 * @returns {{all:number,unsolvedOnly:number,firstFail:{row:number,column:number,residue:number}|null}}
 */
function rowColumnFailures(printed) {
  const D = printed.map((row, r) =>
    row.map((value, c) => (value - innerByte29[r][c] + 29) % 29));
  let all = 0;
  let unsolvedOnly = 0;
  let firstFail = null;
  for (let r = 1; r < 15; r++) {
    for (let c = 1; c < 15; c++) {
      const residue = (D[r][c] - D[r][0] - D[0][c] + 58) % 29;
      if (residue === 0) continue;
      all++;
      if (r < 14) unsolvedOnly++;
      if (!firstFail) firstFail = {row: r, column: c, residue};
    }
  }
  return {all, unsolvedOnly, firstFail};
}
const rankOneOriginal = rowColumnFailures(sourceRed15);
assert.equal(rankOneOriginal.all, 183);
assert.equal(rankOneOriginal.unsolvedOnly, 171);
assert.deepEqual(rankOneOriginal.firstFail, {row: 1, column: 1, residue: 23});
// Plant using *original* published border bytes as arbitrary secret keys.
// Every planted cell uses a native GP29 symbol and a source grid interior.
const plantRow = Array.from({length: 15}, (_, r) => grid.bytes[16 * (r + 1)] % 29);
const plantColumn = Array.from({length: 15}, (_, c) => grid.bytes[c + 1] % 29);
const rankOnePlant = innerByte29.map((row, r) =>
  row.map((value, c) => (value + plantRow[r] + plantColumn[c]) % 29));
assert.deepEqual(rowColumnFailures(rankOnePlant),
  {all: 0, unsolvedOnly: 0, firstFail: null});

console.log('EVENT_TAPE_BEGIN: 256 physical-order cells, 1-based grid rows/columns');
for (const e of events) {
  console.log(JSON.stringify({
    at: e.at, row: e.row, column: e.column, page: e.page,
    offset: e.offset, kind: e.kind, ink: e.ink,
    rune: e.rune, gp: e.value, byte: e.byte, byteMod29: e.byte % 29
  }));
}
console.log('EVENT_TAPE_END');
console.log(JSON.stringify({
  source: 'original-image-derived lp2-ink-annotations and 32x8 grid',
  counts: {all: events.length, redRunes: 225, thirteenDot: 31, excludedTenDot: 4, excludedTwentyThreeDot: 1},
  endpoint: {row31: events.slice(240, 248).map(({at, page, kind}) => ({at, page, kind})),
             row32: events.slice(248).map(({at, page, kind}) => ({at, page, kind}))},
  p56RequiredPrimeTotients: known.slice(0, 5).map((x) => x.requiredKey),
  p57RequiredPlainShifts: known.slice(5).map((x) => x.requiredKey),
  knownControls: known,
  tableMod29OriginalMatches: known.filter((x) => x.matches).length,
  tableMod29PlantedMatches: planted.length,
  direct30CodeMatchesAll256: literal30,
  rankOne15x15: {allOriginalAnchoredMinors: 196, unsolvedOriginalAnchoredMinors: 182, observedFailAll: rankOneOriginal.all, observedFailUnknown: rankOneOriginal.unsolvedOnly, firstCounterexample: rankOneOriginal.firstFail, plantedFail: rowColumnFailures(rankOnePlant).all},
  fixedByteCodebook: {distinctBytes: byByte.size, inconsistentByteGroups: conflictingByteGroups, maximalExactMatches: maximumFixedCodebookMatches, minimumMismatches: minimumCodebookErrors, examples: contradictoryExamples},
  direct30CodeDotMatches: dotLiteral30,
  decision: 'The source-count alignment is real; the single historically motivated GP29 modular-key transfer fails all 12 known original red controls. No source selects any alternative byte/event operator.'
}, null, 2));
