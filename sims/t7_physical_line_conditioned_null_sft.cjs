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
// Eight '$' transcript groups differ from the nine visually marked image sections.
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
function conditionalNull(name, groupBy, iterations, seed, isEligible = () => true) {
  const groups = new Map();
  for (const transition of transitions) {
    if (!isEligible(transition)) continue;
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
  ['eight-dollar-transcription-groups', t => t.chapter],
  ['physical-page', t => t.page],
  ['physical-page-and-boundary', t => t.page + ':' + t.kind],
  ['printed-line', t => t.line],
  ['printed-line-and-boundary', t => t.line + ':' + t.kind],
  ['fixed-1000-rune-block', t => Math.floor(t.pos / 1000)]
];
const results = modes.map(([name, groupBy], index) =>
  conditionalNull(name, groupBy, iterations, (0x3301f001 + 101 * index) >>> 0));

/** @typedef {{len:number,hits:number[],page?:number,chapter?:number,lines?:object[]}} Block */
const lineOfRune = new Array(ciphertext.length);
lineOfRune[0] = 0;
for (const event of transitions) lineOfRune[event.pos] = event.line;
/** @type {Block[]} */
const lineBlocks = [];
for (let i = 0; i < ciphertext.length; i++) {
  const lineId = lineOfRune[i];
  if (i === 0 || lineId !== lineOfRune[i - 1]) {
    lineBlocks.push({start: i, id: lineId, len: 0, hits: []});
  }
  const block = lineBlocks[lineBlocks.length - 1];
  if (i > 0 && ciphertext[i] === ciphertext[i - 1]) block.hits.push(block.len);
  block.len++;
}
assert.equal(lineBlocks.length, 594);

// Agent31's earlier first-rune convention differs from the second-rune
// convention used in the other line-conditioned nulls.
const pageOfRune = new Array(ciphertext.length);
for (let i = 0; i < 56; i++) {
  for (let p = pages[i]; p < pages[i + 1]; p++) pageOfRune[p] = i;
}
const firstRuneLineNull = conditionalNull(
  'printed-line-first-rune-existing-Agent31-convention',
  event => lineOfRune[event.pos - 1], iterations, 0x3301d001,
  event => pageOfRune[event.pos] === pageOfRune[event.pos - 1]
);
const pageBlocks = [];
for (let i = 0; i < 56; i++) {
  const start = pages[i];
  const end = pages[i + 1];
  if (start === end) continue;
  const hits = sites.filter(p => p >= start && p < end).map(p => p - start);
  const componentLines = lineBlocks.filter(block => block.start >= start && block.start + block.len <= end);
  assert.equal(componentLines.reduce((n, b) => n + b.len, 0), end - start);
  const chapter = chapters.findIndex((a, j) => j < 8 && start >= a && start < chapters[j + 1]);
  assert.ok(chapter >= 0 && chapter < 8);
  pageBlocks.push({start, len: end - start, hits, chapter, lines: componentLines});
}
assert.equal(pageBlocks.length, 55);

/** @param {Block[]} blocks @returns {number} */
function blockOrderCorrelation(blocks) {
  let offset = 0;
  const positions = [];
  for (const block of blocks) {
    for (const index of block.hits) positions.push(offset + index);
    offset += block.len;
  }
  assert.equal(offset, ciphertext.length);
  assert.equal(positions.length, sites.length);
  return gapCorrelation(positions);
}
assert.equal(blockOrderCorrelation(pageBlocks), observed);
assert.equal(blockOrderCorrelation(lineBlocks), observed);

/** @template T @param {T[]} original @param {() => number} rand @returns {T[]} */
function shuffle(original, rand) {
  const output = original.slice();
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

/**
 * Preserve original source page/line blocks (including all event offsets)
 * and destroy only a specified source order. These permutations operate
 * on site indicators, not newly reencoded original ciphertext glyphs.
 * @param {string} name
 * @param {string} kind
 * @param {number} trials
 * @param {number} seed
 * @returns {object}
 */
function blockOrderNull(name, kind, trials, seed) {
  const rand = random32(seed);
  const byChapter = Array.from({length: 8}, () => []);
  for (const block of pageBlocks) byChapter[block.chapter].push(block);
  // Authentic image-visible 9 chapter cuts, distinct from the 8 '$' groups.
  const visualCuts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const byOriginalVisualChapter = Array.from({length:9}, () => []);
  for (const block of pageBlocks) {
    const j = visualCuts.findIndex((start, i) =>
      i < 9 && block.start >= start && block.start < visualCuts[i + 1]);
    assert.ok(j >= 0);
    byOriginalVisualChapter[j].push(block);
  }
  let exceedances = 0;
  let sum = 0;
  const values = [];
  for (let trial = 0; trial < trials; trial++) {
    let blocks;
    if (kind === 'pages-global') blocks = shuffle(pageBlocks, rand);
    else if (kind === 'pages-within-chapter') blocks = byChapter.flatMap(group => shuffle(group, rand));
    else if (kind === 'pages-within-original-visual-chapter')
      blocks = byOriginalVisualChapter.flatMap(group => shuffle(group, rand));
    else if (kind === 'lines-global') blocks = shuffle(lineBlocks, rand);
    else if (kind === 'lines-within-page') blocks = pageBlocks.flatMap(page => shuffle(page.lines, rand));
    else throw new Error('Unknown block permutation mode');
    const value = blockOrderCorrelation(blocks);
    if (value >= observed) exceedances++;
    sum += value;
    values.push(value);
  }
  values.sort((a, b) => a - b);
  return {
    name, trials, exceedances, p_upper_one_sided: (exceedances + 1) / (trials + 1),
    null_mean: sum / trials, null_q95: values[Math.floor(0.95 * trials)],
    null_q99: values[Math.floor(0.99 * trials)]
  };
}
const blockOrders = [
  ['whole-pages', 'pages-global'],
  ['pages-within-eight-dollar-transcription-groups', 'pages-within-chapter'],
  ['pages-within-nine-original-visual-chapters', 'pages-within-original-visual-chapter'],
  ['whole-lines', 'lines-global'],
  ['lines-within-physical-page', 'lines-within-page']
].map(([name, kind], index) =>
  blockOrderNull(name, kind, iterations, (0x3301ab00 + 67 * index) >>> 0));

console.log(JSON.stringify({
  source: 'physical LP2 pages p0..p55, no p56/p57, original printed separators',
  runes: ciphertext.length,
  printed_line_ids: line + 1,
  adjacent_equal_sites: sites.length,
  gap_lag1_pearson: observed,
  boundary,
  exact_count_conditioned_nulls: results,
  block_order_conditional_nulls: blockOrders,
  first_rune_event_line_conditioned_null: firstRuneLineNull,
  interpretation: 'Line-conditioned nulls probe within-line placement given observed line occupancies. They are not generative tests of line occupancies or decipherments.'
}, null, 2));
