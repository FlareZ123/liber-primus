'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relativePath */
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const table = read('resources/liber-primus/base60-grid.json');

/** @typedef {{position:number,kind:'rune'|'mark', index:number, color?:string, page?:number}} InkEvent */
/** @type {InkEvent[]} */
const events = [];
for (const page of ink.pages) {
  /** @type {InkEvent[]} */
  const local = [];
  for (const [offset, count, color] of page.large_punctuation || []) {
    if (count === 13) local.push({ position: offset, kind: 'mark', index: -1, color, page:page.page });
  }
  for (const span of page.red_spans || []) {
    const runes = Array.from(span.runes);
    assert.equal(runes.length, span.length, 'original red-span length');
    for (let j = 0; j < runes.length; j++) {
      const index = corpus.runes.indexOf(runes[j]);
      assert.ok(index >= 0, 'unknown original red rune');
      local.push({ position: span.start + j + 0.5, kind: 'rune', index });
    }
  }
  local.sort((a, b) => a.position - b.position);
  events.push(...local);
}

assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.kind === 'mark').length, 31);
assert.equal(events.filter((e) => e.kind === 'rune').length, 225);

const mod = (n) => ((n % 29) + 29) % 29;
const H = [11, 18, 1];
const G = [25, 10, 1];
const F = [14, 9, 13, 28, 1];

/**
 * @param {number[]} printedOrder Sequence indexed highest power first.
 * @param {number[]} divisor Monic polynomial, lowest coefficient first.
 * @returns {number[]} Residue coefficients, lowest power first.
 */
function remainder(printedOrder, divisor) {
  const coefficient = printedOrder.slice().reverse().map(mod);
  const degree = divisor.length - 1;
  assert.equal(divisor[degree], 1);
  for (let i = coefficient.length - 1; i >= degree; i--) {
    const factor = coefficient[i];
    for (let j = 0; j <= degree; j++) {
      coefficient[i - degree + j] = mod(coefficient[i - degree + j] - factor * divisor[j]);
    }
  }
  return coefficient.slice(0, degree);
}

const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(remainder(bytes, H), [0, 0], 'authentic table H-positive');
assert.deepEqual(remainder(bytes, G), [0, 0], 'authentic table G-positive');
assert.deepEqual(remainder(bytes, F), [0, 0, 0, 0], 'authentic table dual-positive');

// An independent 256-byte original from 2014, pinned by the existing
// Stage04 reproduction, is an explicit same-size cross-era codeword control.
const stage04Source = fs.readFileSync(path.join(root, 'sims/lp2_stage04_256_direct_identity_sft.cjs'), 'utf8');
const stage04Match = stage04Source.match(/const stage04Hex = '([0-9a-f]{512})'/);
assert.ok(stage04Match, 'historical source 256-byte literal');
const stage04 = Array.from(Buffer.from(stage04Match[1], 'hex'));
assert.deepEqual(remainder(stage04, H), [1, 22]);
assert.deepEqual(remainder(stage04, G), [15, 4]);
assert.deepEqual(remainder(stage04, F), [7, 18, 17, 16]);

const ones = remainder(Array(256).fill(1), F);
assert.deepEqual(ones, [14, 3, 19, 3]);

const cases = [
  { kind: 'index', marker: 0, expected: [20, 4, 22, 13] },
  { kind: 'index', marker: 13, expected: [0, 22, 19, 2] },
  { kind: 'index', marker: 31, expected: [8, 9, 26, 18] },
  { kind: 'ordinal', marker: 0, expected: [11, 19, 10, 28] },
  { kind: 'ordinal', marker: 13, expected: [20, 8, 7, 17] },
  { kind: 'ordinal', marker: 31, expected: [28, 24, 14, 4] },
  { kind: 'prime', marker: 0, expected: [27, 16, 9, 21] },
  { kind: 'prime', marker: 13, expected: [7, 5, 6, 10] },
  { kind: 'prime', marker: 31, expected: [15, 21, 13, 26] },
];

/** @param {InkEvent} e @param {'index'|'ordinal'|'prime'} kind @param {number} marker */
function value(e, kind, marker) {
  if (e.kind === 'mark') return marker;
  if (kind === 'prime') return corpus.prime[e.index];
  return e.index + (kind === 'ordinal' ? 1 : 0);
}

for (const item of cases) {
  const input = events.map((e) => value(e, item.kind, item.marker));
  const syndrome = remainder(input, F);
  assert.deepEqual(syndrome, item.expected, item.kind + '-' + item.marker);
  assert.ok(syndrome.some((x) => x !== 0), 'source variant would be a new codeword');
  for (let slope = 1; slope < 29; slope++) {
    for (let shift = 0; shift < 29; shift++) {
      const affineSyndrome = syndrome.map((x, i) => mod(slope * x + shift * ones[i]));
      assert.ok(affineSyndrome.some((x) => x !== 0), 'affine map would be a codeword');
    }
  }
}


// The only black 13-dot stencil at p7:194 supplies an independent,
// source-visible possible beginning of the circular 256-event register.
// The adjacent red mark has the same rune coordinate but remains its own event.
const blackIndex = events.findIndex((e) => e.kind === 'mark' && e.color === 'black');
assert.equal(blackIndex, 50, 'only black marker event index');
assert.equal(events.filter((e) => e.kind === 'mark' && e.color === 'black').length, 1);
assert.equal(events[blackIndex].page, 7);
assert.equal(events[blackIndex].position, 194);
const rotated = [
  { name: 'black-first', events: events.slice(blackIndex).concat(events.slice(0, blackIndex)), expected: [
    [17,0,2,7],[28,22,7,6],[12,19,5,18],[19,8,5,19],[1,1,10,18],[14,27,8,1],[11,2,5,23],[22,24,10,22],[6,21,8,5],
  ] },
  { name: 'after-black', events: events.slice(blackIndex + 1).concat(events.slice(0, blackIndex + 1)), expected: [
    [18,12,25,9],[6,8,21,27],[5,27,11,14],[24,22,22,24],[12,18,18,13],[11,8,8,0],[26,7,22,28],[14,3,18,17],[13,22,8,4],
  ] },
];
for (const orientation of rotated) {
  assert.equal(orientation.events.length, 256);
  for (const [i, item] of cases.entries()) {
    const syndrome = remainder(orientation.events.map((e) => value(e, item.kind, item.marker)), F);
    assert.deepEqual(syndrome, orientation.expected[i], orientation.name + '/' + item.kind + '/' + item.marker);
    for (let slope = 1; slope < 29; slope++) {
      for (let shift = 0; shift < 29; shift++) {
        assert.ok(syndrome.some((x, j) => mod(slope * x + shift * ones[j]) !== 0),
          'original black-anchor orientation unexpectedly forms an F codeword');
      }
    }
  }
}

const redSegments = [[]];
for (const e of events) {
  if (e.kind === 'mark') redSegments.push([]);
  else redSegments[redSegments.length - 1].push(e.index);
}
assert.equal(redSegments.length, 32);
const empty = redSegments.filter((x) => x.length === 0).length;
assert.equal(empty, 15);
const uniqueSegments = new Set(redSegments.map((x) => x.join(','))).size;
assert.equal(uniqueSegments, 18);
const rows = table.byte_rows.map((row) => row.join(','));
assert.equal(new Set(rows).size, 32);
const minimumStationaryRecordMismatches = rows.length - uniqueSegments;
assert.equal(minimumStationaryRecordMismatches, 14);

console.log(JSON.stringify({
  source: { ink_events: events.length, red_runes: 225, marks: 31, numeric_rows: rows.length },
  table_H_G_F_syndromes: { H: remainder(bytes, H), G: remainder(bytes, G), F: remainder(bytes, F) },
  ink_hg_syndromes: cases.map((item) => ({ kind: item.kind, marker: item.marker, F: item.expected })),
  affine_variants_per_case: 812,
  independent_2014_stage04_256_f_syndromes: { H: [1, 22], G: [15, 4], F: [7, 18, 17, 16] },
  total_affine_codeword_hits: 0,
  black_marker: {event_index: blackIndex, source_page: 7, local_after_runes: 194},
  independently_anchored_orientations: rotated.map((v)=>({name:v.name,syndromes:v.expected})),
  all_affine_relabeling_checks: 21924,
  red_segments: { count: 32, empty, distinct: uniqueSegments, minimum_stationary_row_mismatches: 14 },
}, null, 2));
