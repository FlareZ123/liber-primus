'use strict';

/**
 * Original LP2 doublet-gap T7: fixed-count source-layout conditional nulls.
 *
 * Read-only Node 22 single-file test on actual p0..p55 GP29 source.
 * This localizes doublet-site spacing; no plaintext or key is inferred.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const ciphertext = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(ciphertext.length, 12956);

/** @param {number[]} lengths @returns {number[]} */
function offsets(lengths) {
  const result = [0];
  for (const length of lengths) result.push(result[result.length - 1] + length);
  return result;
}

const pages = offsets(corpus.pages.slice(0, 56).map(page => page.indices.length));
const chapters = offsets(transcription.split('$').slice(0, 8).map(text =>
  [...text].filter(char => alphabet.has(char)).length));
assert.deepEqual(chapters.slice(1), [729, 1874, 3612, 5506, 6527, 7960, 9640, 12956]);

/** @typedef {{pos:number,page:number,chapter:number,line:number,kind:string,hit:boolean}} Transition */
/** @type {Transition[]} */
const transitions = [];
let position = 0;
let page = 0;
let chapter = 0;
let line = 0;
let separator = '';
for (const char of transcription) {
  if (alphabet.has(char)) {
    if (position === ciphertext.length) break;
    assert.equal(alphabet.get(char), ciphertext[position], 'transcription mismatch at rune ' + position);
    while (position >= pages[page + 1]) page++;
    while (position >= chapters[chapter + 1]) chapter++;
    if (position > 0) {
      const kind = separator.includes('.') ? 'period'
        : separator.includes('-') ? 'word'
        : separator.includes('%') ? 'page'
        : separator.includes('/') ? 'line' : 'contiguous';
      transitions.push({
        pos: position, page, chapter, line, kind,
        hit: ciphertext[position] === ciphertext[position - 1]
      });
    }
    position++;
    separator = '';
  } else {
    separator += char;
    if (char === '/') line++;
  }
}
assert.equal(position, ciphertext.length);
assert.equal(transitions.length, 12955);
const sites = transitions.filter(transition => transition.hit).map(transition => transition.pos);
assert.equal(sites.length, 86);

/** @param {number[]} positions @returns {number} */
function gapCorrelation(positions) {
  const gaps = positions.slice(1).map((p, i) => p - positions[i]);
  const count = gaps.length - 1;
  const left = gaps.slice(0, count);
  const right = gaps.slice(1);
  const meanLeft = left.reduce((sum, n) => sum + n, 0) / count;
  const meanRight = right.reduce((sum, n) => sum + n, 0) / count;
  let numerator = 0;
  let leftSquared = 0;
  let rightSquared = 0;
  for (let i = 0; i < count; i++) {
    const x = left[i] - meanLeft;
    const y = right[i] - meanRight;
    numerator += x * y;
    leftSquared += x * x;
    rightSquared += y * y;
  }
  return numerator / Math.sqrt(leftSquared * rightSquared);
}

const observed = gapCorrelation(sites);
assert.ok(Math.abs(observed - 0.38001968924100965) < 1e-12);
const boundary = {};
for (const event of transitions) {
  const count = boundary[event.kind] ??= {transitions: 0, doublets: 0};
  count.transitions++;
  if (event.hit) count.doublets++;
}
assert.deepEqual(boundary, {
  contiguous: {transitions: 9640, doublets: 60},
  word: {transitions: 2721, doublets: 22},
  period: {transitions: 174, doublets: 1},
  line: {transitions: 388, doublets: 3},
  page: {transitions: 32, doublets: 0}
});

/** @param {number} initial @returns {() => number} */
function random32(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

/**
 * Preserve observed site count per stratum. Sample legal transition
 * locations uniformly without replacement within each stratum.
 * @param {string} name
 * @param {(t: Transition) => string | number} groupBy
 * @param {number} iterations
 * @param {number} seed
 * @returns {object}
 */
function conditionalNull(name, groupBy, iterations, seed) {
  const groups = new Map();
  for (const transition of transitions) {
    const key = groupBy(transition);
    let group = groups.get(key);
    if (!group) {
      group = {eligible: [], count: 0};
      groups.set(key, group);
    }
    group.eligible.push(transition.pos);
    if (transition.hit) group.count++;
  }
  const active = [...groups.values()].filter(group => group.count > 0);
  const rand = random32(seed);
  let exceedances = 0;
  let sum = 0;
  const values = [];
  for (let trial = 0; trial < iterations; trial++) {
    const positions = [];
    for (const {eligible, count} of active) {
      const chosen = [];
      while (chosen.length < count) {
        const index = Math.floor(rand() * eligible.length);
        if (!chosen.includes(index)) {
          chosen.push(index);
          positions.push(eligible[index]);
        }
      }
    }
    positions.sort((a, b) => a - b);
    const correlation = gapCorrelation(positions);
    if (correlation >= observed) exceedances++;
    sum += correlation;
    values.push(correlation);
  }
  values.sort((a, b) => a - b);
  return {
    name, strata: groups.size, active_strata: active.length,
    iterations, exceedances, p_upper_one_sided: (exceedances + 1) / (iterations + 1),
    null_mean: sum / iterations,
    null_q95: values[Math.floor(0.95 * iterations)],
    null_q99: values[Math.floor(0.99 * iterations)]
  };
}

const iterations = process.argv.includes('--quick') ? 2000 : 20000;
const modes = [
  ['illustrated-chapter', t => t.chapter],
  ['physical-page', t => t.page],
  ['physical-page-and-boundary', t => t.page + ':' + t.kind],
  ['printed-line', t => t.line],
  ['printed-line-and-boundary', t => t.line + ':' + t.kind],
  ['fixed-1000-rune-block', t => Math.floor(t.pos / 1000)]
];
const results = modes.map(([name, groupBy], index) =>
  conditionalNull(name, groupBy, iterations, (0x3301f001 + 101 * index) >>> 0));
console.log(JSON.stringify({
  source: 'physical LP2 pages p0..p55, no p56/p57, original printed separators',
  runes: ciphertext.length,
  printed_line_ids: line + 1,
  adjacent_equal_sites: sites.length,
  gap_lag1_pearson: observed,
  boundary,
  exact_count_conditioned_nulls: results,
  interpretation: 'Line-conditioned nulls probe within-line placement given observed line occupancies. They are not generative tests of line occupancies or decipherments.'
}, null, 2));
