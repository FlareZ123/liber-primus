'use strict';

/**
 * Original-source bounded terminal punctuation / p50 pointer clock.
 *
 * The 2016 signed word DIRECTION has literal GP0=98 or conditional
 * IO->IA transliteration GP0=112. Original table entries point directly
 * to scans 72 and 73. Source p55 and p56 both end in a red thirteen-dot
 * mark, and p57 ends in a red twenty-three-dot mark. Treat the literal
 * dot count as a *hypothetical* table-successor hop count.
 *
 * This checks one first-party visible numeric stop-rule against the
 * pre-existing original 256-byte p50 graph with no fitted start/phase.
 * It is a navigation test, not a full inverse of ciphertext.
 *
 * Windows: node sims/lp2_signed_terminal_dotclock_graph_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const histDir = path.resolve(__dirname, '..', 'resources', 'historical');
const read = rel => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
const corpus = read('lp2-corpus.json');
const annotations = read('lp2-ink-annotations.json');
const grid = read('base60-grid.json');
const bytes = grid.byte_rows.flat();
const tokens = grid.rows.flat();
const signed = fs.readFileSync(path.join(histDir,
  'cicada2016-4gq25-outguess.asc'), 'utf8');
assert.match(signed, /their numbers are the direction/i);
assert.equal(bytes.length, 256);

/**
 * @param {string} text
 * @param {boolean} coalesceIo Analyst alternative, not native standard
 * @returns {number}
 */
function gp0(text, coalesceIo = false) {
  const symbols = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const normalized = (coalesceIo ? text.replace(/IO/g, 'IA') : text)
    .toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG');
  let sum = 0;
  for (let i = 0; i < normalized.length;) {
    const match = symbols.find(x => normalized.startsWith(x.s, i));
    assert.ok(match, 'No literal native rune encoding');
    sum += match.i;
    i += match.s.length;
  }
  return sum;
}

/** @param {number} start @param {number} count @returns {number[]} */
function walk(start, count) {
  const route = [start];
  for (let i = 0; i < count; i += 1) route.push(bytes[route.at(-1)]);
  return route;
}

/** @param {number} page @param {number} expectedDots @returns {number} */
function assertEndDots(page, expectedDots) {
  const info = annotations.pages.find(p => p.page === page);
  const length = corpus.pages[page].indices.length;
  assert.ok(info);
  assert.equal(info.rune_count, length);
  assert.ok(info.large_punctuation.some(([offset, dots, ink]) =>
    offset === length && dots === expectedDots && ink === 'red'),
    'Original printed terminal dot count missing');
  return length;
}

const rawDirection = gp0('DIRECTION');
const variantDirection = gp0('DIRECTION', true);
assert.deepEqual([rawDirection, variantDirection], [98, 112]);
assert.deepEqual([tokens[98], tokens[112], tokens[201], tokens[205]],
  ['1C', '1D', '1E', '1G']);
assert.deepEqual([bytes[98], bytes[112], bytes[201], bytes[205]],
  [72, 73, 74, 76]);

const page55Length = assertEndDots(55, 13);
const page56Length = assertEndDots(56, 13);
const page57Length = assertEndDots(57, 23);
assert.deepEqual([page55Length, page56Length, page57Length], [76, 85, 95]);

const selectedP55Scan = bytes[rawDirection];
const p55ScanClock = walk(selectedP55Scan, 13);
const p56ScanClock = walk(bytes[variantDirection], 13);
const p57ScanClock = walk(bytes[201], 23);
assert.deepEqual(p55ScanClock, [
  72,164,105,63,51,59,69,73,79,82,201,74,205,76
]);
assert.equal(p55ScanClock.at(-1), page55Length,
  'p55 physical scan72 plus original red13 terminates at its exact 76-rune count');
// A universal physical-scan-root punctuation clock has two known failures.
assert.equal(p56ScanClock.at(-1), 203);
assert.notEqual(p56ScanClock.at(-1), page56Length);
assert.equal(p57ScanClock.at(-1), 47);
assert.notEqual(p57ScanClock.at(-1), page57Length);

const route55 = walk(98, 13);
const route56Alternate = walk(112, 13);
const route57 = walk(205, 23);

assert.deepEqual(route55,
  [98,72,164,105,63,51,59,69,73,79,82,201,74,205]);
assert.deepEqual(route56Alternate,
  [112,73,79,82,201,74,205,76,114,197,115,247,192,0]);
assert.equal(route57[0], 205);
assert.equal(route57[23], 76);
assert.equal(bytes[205], 76);
// 205 first enters the 11-cycle at 76, then 22 additional steps
// make two complete laps. 23 = 1 + 2*11, rather than 205 being cyclic.
assert.equal(walk(76, 11).at(-1), 76);
assert.equal(walk(205, 1).at(-1), 76);
assert.equal(route57.at(-1), bytes[205]);

// Negative controls: the alternate DIRECTION spelling does NOT reach
// first PARABLE prime-ordinal205 after the original p56's 13 dots.
assert.notEqual(route56Alternate.at(-1), 205);
assert.notEqual(walk(98, 12).at(-1), 205);
assert.notEqual(walk(98, 14).at(-1), 205);

console.log(JSON.stringify({
  status: 'source-original path identity; no unknown plaintext',
  p55: {
    sourceSelector: '2016 signed DIRECTION (literal GP0=98)',
    tableByte: bytes[98],
    physicalArchive: '72.jpg',
    originalPage: 55,
    terminalDots: 13,
    route: route55,
    physicalScanRootRoute: p55ScanClock,
    scanRootMatchesRuneCount: p55ScanClock.at(-1) === page55Length,
    reached: route55.at(-1),
    independentP57ClausePrimeOrdinal: 205
  },
  alternateP56: {
    selector: 'analyst IO->IA DIRECTION GP0=112',
    tableByte: bytes[112],
    physicalArchive: '73.jpg',
    originalPage: 56,
    terminalDots: 13,
    route: route56Alternate,
    reached: route56Alternate.at(-1)
  },
  p57: {
    source: 'solved p57 first-clause ordinal205',
    originalPage: 57,
    terminalDots: 23,
    cycleSize: 11,
    reached: route57.at(-1),
    p55SourceRuneCount: page55Length
  },
  physicalScanRootSolvedControls: {
    p56: {terminalDots: 13, result: p56ScanClock.at(-1), actualRunes: page56Length},
    p57: {terminalDots: 23, result: p57ScanClock.at(-1), actualRunes: page57Length},
    universalLengthRule: false
  },
  interpretation: 'Punctuation-sized pointer walks are a prospective human route, not a written opcode; no plaintext recovered'
}, null, 2));
