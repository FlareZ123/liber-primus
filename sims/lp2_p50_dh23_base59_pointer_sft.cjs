'use strict';

/**
 * Source-fixed p57 DH-candidate seed to the original 32x8 numeral table graph.
 * Run: node sims/lp2_p50_dh23_base59_pointer_sft.cjs
 * Read-only, standard Node.js modules, no external dependency or fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
const grid = read('resources/liber-primus/base60-grid.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const rows = grid.rows;
assert.equal(rows.length, 32);
assert(rows.every((row) => row.length === 8));
const tokens = rows.flat();
assert.equal(tokens.length, 256);

const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
assert.equal(digits60.length, 60);
assert.equal(digits59.length, 59);
assert(tokens.every((s) => s.length === 2 && [...s].every((c) => digits59.includes(c))));

/** @param {number} radix */
function decode(radix) {
  const alphabet = radix === 59 ? digits59 : digits60;
  return tokens.map((s) => radix * alphabet.indexOf(s[0]) + alphabet.indexOf(s[1]));
}

/** @param {number[]} map @param {number} start */
function orbit(map, start) {
  const seen = new Map();
  const nodes = [];
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, nodes.length);
    nodes.push(at);
    at = map[at];
  }
  return {nodes, repeated: at, prefix: seen.get(at), period: nodes.length - seen.get(at)};
}

/** @param {number[]} map @param {number} root */
function allReachRoot(map, root) {
  if (map[root] !== root) return false;
  for (let seed = 0; seed < map.length; seed++) {
    let at = seed;
    let steps = 0;
    while (at !== root && steps < map.length) {
      at = map[at];
      steps++;
    }
    if (at !== root) return false;
  }
  return true;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let x = 1;
  for (let k = 0; k < exponent; k++) x = (x * base) % modulus;
  return x;
}

/** @param {number} lo @param {number} hi */
function primeSum(lo, hi) {
  return corpus.pages[57].indices.slice(lo, hi)
    .reduce((acc, rune) => acc + corpus.prime[rune], 0);
}

const base59 = decode(59);
const base60 = decode(60);
assert.equal(base59[189], 189);
assert.equal(tokens[189], '3C');
assert.equal(Math.floor(189 / 8), 23);
assert.equal(189 % 8, 5);
assert.equal(allReachRoot(base59, 189), true);
assert.equal(allReachRoot(base60, 189), false);
assert.deepEqual([primeSum(7, 37), primeSum(37, 67), primeSum(67, 95)],
  [1259, 1031, 1229]);
assert.equal(1259 * 1031 * 1229, 1595277641);
assert.equal(primeSum(67, 71), 151); // FIND
assert.equal(primeSum(47, 50), 21);  // OUR
assert.equal(primeSum(81, 86), 115); // WITHIN
assert.equal(base59[173], 115); // At row21, col5
assert.equal(base59[201], 73);  // Candidate 2013-derived K
assert.equal(powMod(115, 21, 151), 73);
const candidate = orbit(base59, 73);
assert.equal(candidate.prefix, 31);
assert.equal(candidate.period, 1);
assert.equal(candidate.repeated, 189);
assert.equal(candidate.nodes.length, 32);
assert.deepEqual(candidate.nodes, [
  73, 78, 45, 105, 62, 122, 85, 28,
  148, 242, 41, 83, 190, 167, 244, 22,
  58, 144, 123, 53, 168, 236, 234, 193,
  153, 33, 112, 72, 161, 214, 247, 189
]);
assert.equal(ink.pages.flatMap((p) => p.large_punctuation || [])
  .filter((mark) => mark[1] === 13).length, 31);

// The numeral path is NOT the source's stencil-position mask.
// Construct the printed 256-event red-rune-plus-13-dot tape, punctuation
// before a rune when they share the same source-local offset.
const events = [];
for (const p of ink.pages) {
  for (const span of p.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      events.push({page: p.page, offset: span.start + i, order: 1, dot: false});
    }
  }
  for (const mark of p.large_punctuation || []) {
    if (mark[1] === 13) {
      events.push({page: p.page, offset: mark[0], order: 0, dot: true});
    }
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.order - b.order);
assert.equal(events.length, 256);
const dotPositions = events.flatMap((e, i) => e.dot ? [i] : []);
assert.equal(dotPositions.length, 31);
const dotSet = new Set(dotPositions);
const overlap = candidate.nodes.slice(0, -1).filter((i) => dotSet.has(i));
assert.deepEqual(overlap, [168, 153, 247]);

// Matched-table exploration preserving every original decoded base59 value.
// It characterizes the conditional graph; it cannot prove Cicada authorship.
let state = 0x3301ab25;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 100000;
let root189 = 0;
let rootAnd31 = 0;
for (let t = 0; t < trials; t++) {
  const sample = base59.slice();
  for (let i = 255; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  if (allReachRoot(sample, 189)) {
    root189++;
    const o = orbit(sample, 73);
    if (o.prefix === 31 && o.period === 1 && o.repeated === 189) rootAnd31++;
  }
}
assert.equal(root189, 16);
assert.equal(rootAnd31, 1);
process.stdout.write(JSON.stringify({
  status: 'source-conditional structure only; NO UNKNOWN PLAINTEXT',
  radix: 59,
  selfPointingCell: 189,
  originalToken: '3C',
  zeroBasedCoordinates: [23, 5],
  proposedHistoricalDH: {modulus: 23, generator: 5},
  candidateSeed: 73,
  pathLengthIncludingRoot: candidate.nodes.length,
  candidatePath: candidate.nodes,
  thirteenDotMarks: 31,
  pathDotOverlap: overlap,
  shuffledSameMultiset: {trials, allToRoot189: root189,
    allToRoot189And73Has31NonrootSteps: rootAnd31}
}, null, 2) + '\n');
