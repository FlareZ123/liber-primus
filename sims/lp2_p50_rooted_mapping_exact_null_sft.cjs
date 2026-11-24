'use strict';

// Exact conditional random-map null for the original LP2 32x8 number table.
// Node.js 22 / CommonJS. This is a mathematical control, not a decipherment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = data.pages.flatMap((p) => p.tokens);
const originalGrid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
assert.deepEqual(originalGrid.rows.flat(), tokens);
assert.equal(originalGrid.alphabet, alphabet60);
assert.equal(tokens.length, 256);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert(!tokens.join('').includes('f'));

/**
 * @param {string[]} cells Original two-glyph number tokens.
 * @param {string} alphabet Ordered positional digit alphabet.
 * @returns {number[]}
 */
function decode(cells, alphabet) {
  const base = alphabet.length;
  return cells.map((t) => {
    assert.equal(t.length, 2);
    const hi = alphabet.indexOf(t[0]);
    const lo = alphabet.indexOf(t[1]);
    assert(hi >= 0 && lo >= 0);
    const v = hi * base + lo;
    assert(v >= 0 && v < cells.length);
    return v;
  });
}

/** @param {number[]} values */
function counts(values) {
  const n = values.length;
  const c = new Array(n).fill(0);
  for (const v of values) {
    assert(Number.isInteger(v) && v >= 0 && v < n);
    c[v] += 1;
  }
  return c;
}

/**
 * Exact probability of a single fixed-point-rooted component when the
 * given target-value multiset is uniformly permuted across n source nodes:
 * sum(c[v] * (c[v]-1)) / (n*(n-1)).
 * @param {number[]} c Target multiplicities.
 */
function exactRootProbability(c) {
  const n = c.reduce((a, b) => a + b, 0);
  assert(n >= 2);
  const numerator = c.reduce((s, v) => s + v * (v - 1), 0);
  return { numerator, denominator: n * (n - 1), probability: numerator / (n * (n - 1)) };
}

/**
 * @param {number[]} f Complete mapping i -> f[i].
 * @returns {number|null} Root address or null if multiple/cyclic attractors.
 */
function oneRoot(f) {
  const n = f.length;
  let sole = -1;
  for (let i = 0; i < n; i += 1) {
    const seen = new Set();
    let x = i;
    while (!seen.has(x)) {
      seen.add(x);
      x = f[x];
    }
    if (f[x] !== x) return null;
    if (sole === -1) sole = x;
    if (sole !== x) return null;
  }
  return sole;
}

/** Exhaust every distinct permutation of small multisets to verify formula. */
function exhaustive(values) {
  const c = counts(values);
  const cur = new Array(values.length);
  let tested = 0;
  let rooted = 0;
  function visit(k) {
    if (k === cur.length) {
      tested += 1;
      if (oneRoot(cur) !== null) rooted += 1;
      return;
    }
    for (let v = 0; v < c.length; v += 1) {
      if (!c[v]) continue;
      c[v] -= 1;
      cur[k] = v;
      visit(k + 1);
      c[v] += 1;
    }
  }
  visit(0);
  const model = exactRootProbability(counts(values));
  assert.equal(rooted * model.denominator, tested * model.numerator);
  return { values, tested, rooted, exact: model.probability };
}
const controls = [
  [0, 0], [0, 1], [0, 0, 1], [0, 1, 1],
  [0, 0, 1, 2], [0, 1, 2, 2], [0, 1, 1, 2, 3]
].map(exhaustive);

const base60 = decode(tokens, alphabet60);
const base59Values = decode(tokens, alphabet59);
assert.equal(createHash('sha256').update(Buffer.from(base60)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const result = { originalGrid: 'LP2 p49-51, 32x8, 256 exact cells', controls, radix: {} };
for (const [label, values] of [['base59', decode(tokens, alphabet59)], ['base60', base60]]) {
  const c = counts(values);
  const degreeHistogram = [0, 1, 2, 3, 4].map((k) => c.filter((x) => x === k).length);
  const p = exactRootProbability(c);
  assert.deepEqual(degreeHistogram, [95, 92, 49, 14, 6]);
  assert.equal(c.filter((x) => x > 0).length, 161);
  assert.equal(p.numerator, 254);
  assert.equal(p.denominator, 65280);
  const root = oneRoot(values);
  if (label === 'base59') assert.equal(root, 189);
  if (label === 'base60') assert.equal(root, null);
  result.radix[label] = {
    distinctValues: 161, leaves: 95, histogram: degreeHistogram, rootedFixedPoint: root,
    exactFixedMultisetNumerator: p.numerator, exactFixedMultisetDenominator: p.denominator,
    exactProbability: p.probability, expectedIn30000: 30000 * p.probability
  };
}

function walk(next, start) {
  const seen = new Map();
  const seq = [];
  let x = start;
  while (!seen.has(x)) {
    seen.set(x, seq.length);
    seq.push(x);
    x = next[x];
  }
  return { seq, repeat: x, cycle: seq.slice(seen.get(x)) };
}

const p23Address = 23 * 8 + 5;
const p56Start = (56 % 32) * 8 + 5;
const p7Start = 7 * 8 + 5;
assert.equal(p23Address, 189);
assert.equal(p56Start, 197);
assert.equal(p7Start, 61);
assert.equal(tokens[189], '3C');
assert.equal(tokens[105], '13');

const p56Path = walk(base59Values, p56Start);
const p7Path = walk(base59Values, p7Start);
assert.equal(base59Values[189], 189);
assert.equal(p56Path.repeat, 189);
assert.equal(p56Path.seq.length, 33);
assert.equal(p7Path.repeat, 189);
assert.equal(p7Path.seq.length, 10);
const p7Merge = base59Values[p7Start];
const p7MergeIndex = p56Path.seq.indexOf(p7Merge);
assert.equal(p7Merge, 193);
assert.equal(p7MergeIndex, 24);
assert.deepEqual(p7Path.seq.slice(1), p56Path.seq.slice(p7MergeIndex));
assert.equal(p56Path.seq.length - p7Path.seq.length, 23);

const transcription = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pageSegments = transcription.split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
function lineStats(page, line0) {
  const lines = pageSegments[page].split('/');
  assert(lines[line0] !== undefined);
  const ids = Array.from(lines[line0]).map((ch) => runeIndex.get(ch)).filter((x) => x !== undefined);
  const sum = ids.reduce((a, b) => a + b, 0);
  return {
    page,
    line: line0 + 1,
    runes: ids.length,
    gp0Sum: sum,
    quotient: Math.floor(sum / page),
    remainder: sum % page
  };
}
const p23Line6 = lineStats(23, 5);
const p24Line2 = lineStats(24, 1);
assert.equal(p23Line6.runes, 23);
assert.equal(p23Line6.gp0Sum, 304);
assert.equal(p23Line6.quotient, 13);
assert.equal(p23Line6.remainder, 5);
assert.equal(p24Line2.runes, 24);
assert.equal(p24Line2.gp0Sum, 272);
assert.equal(p24Line2.quotient, 11);
assert.equal(p24Line2.remainder, 8);

const pageLengthMatches = [];
for (let page = 1; page < 32; page += 1) {
  for (let line0 = 0; line0 < 8; line0 += 1) {
    const st = lineStats(page, line0);
    if (st.runes === page) pageLengthMatches.push(st);
  }
}
const remainderFiveMatches = pageLengthMatches.filter((x) => x.remainder === 5);
assert.equal(pageLengthMatches.length, 6);
assert.deepEqual(remainderFiveMatches.map((x) => [x.page, x.line]), [[23, 6]]);

const divinityAddress = Array.from('DIUINITY').reduce((sum, ch) => {
  const i = corpus.translit.indexOf(ch);
  assert(i >= 0);
  return sum + i;
}, 0);
assert.equal(divinityAddress, 105);
assert.equal(tokens[divinityAddress], '13');

const base60AtRoot = walk(base60, 189);
const base60FromP56 = walk(base60, p56Start);
assert.equal(base60[189], 192);
assert.equal(base60AtRoot.cycle.length, 11);
assert.equal(base60FromP56.cycle.length, 11);

// A fixed-multiset permutation diagnostic for the exact marker-path signature.
// It is post-discovery and must not be reported as a familywise p-value.
function makeRng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function simulateMarkerNull(trials, seed) {
  const random = makeRng(seed);
  function randInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    let value;
    do { value = random(); } while (value >= limit);
    return value % max;
  }
  const arr = new Uint16Array(256);
  const seenGeneration = new Uint32Array(256);
  let generation = 0;
  function fastWalk(start) {
    generation += 1;
    const seq = [];
    let x = start;
    while (seenGeneration[x] !== generation) {
      seenGeneration[x] = generation;
      seq.push(x);
      x = arr[x];
    }
    return { seq, repeat: x };
  }
  let rootFixed = 0;
  let rootAnd33 = 0;
  let fullMarkerSignature = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    for (let i = 0; i < 256; i += 1) arr[i] = base59Values[i];
    for (let i = 255; i > 0; i -= 1) {
      const j = randInt(i + 1);
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    if (arr[189] !== 189) continue;
    rootFixed += 1;
    const from56 = fastWalk(197);
    if (from56.repeat !== 189 || from56.seq.length !== 33) continue;
    rootAnd33 += 1;
    const from7 = fastWalk(61);
    const mergeIndex = from56.seq.indexOf(arr[61]);
    const suffix = mergeIndex >= 0 &&
      from7.seq.slice(1).length === from56.seq.slice(mergeIndex).length &&
      from7.seq.slice(1).every((x, i) => x === from56.seq[mergeIndex + i]);
    if (from7.repeat === 189 && from7.seq.length === 10 &&
        mergeIndex === 24 && suffix) fullMarkerSignature += 1;
  }
  return {
    trials,
    seed: '0x' + seed.toString(16),
    shuffle: 'fixed-multiset Fisher-Yates with rejection-sampled indices',
    rootFixed,
    rootAnd33,
    fullMarkerSignature
  };
}
const markerNull = simulateMarkerNull(250000, 0x33012423);
assert.equal(markerNull.rootFixed, 3786);
assert.equal(markerNull.rootAnd33, 4);
assert.equal(markerNull.fullMarkerSignature, 0);

result.fiveDotCoordinateHypothesis = {
  status: 'candidate navigation structure; not a decryption',
  table: { rows: 32, columns: 8, cells: 256, base59Root: 189, rootToken: tokens[189] },
  coordinates: {
    p23: { row: 23, columnZeroBased: 5, address: p23Address, isFixedPoint: base59Values[p23Address] === p23Address },
    p56: { rowModulo32: 24, columnZeroBased: 5, start: p56Start, verticesToRoot: p56Path.seq.length, path: p56Path.seq },
    p7: { row: 7, columnZeroBased: 5, start: p7Start, verticesToRoot: p7Path.seq.length, path: p7Path.seq },
    p7Merge: { address: p7Merge, indexInP56Path: p7MergeIndex, p7TailEqualsP56Suffix: true },
    pathLengthDifference: p56Path.seq.length - p7Path.seq.length
  },
  arithmetic: {
    divinityWord: 'DIUINITY',
    gp0Address: divinityAddress,
    p50TokenAt105: tokens[105],
    p23Line6,
    pageLengthMatchesFirstEightLinesPages1To31: pageLengthMatches,
    onlyRemainderFiveMatch: remainderFiveMatches,
    p24PathNodeLine2: p24Line2
  },
  base60Control: {
    cell189Successor: base60[189],
    cell189Cycle: base60AtRoot.cycle,
    p56StartCycleLength: base60FromP56.cycle.length
  },
  fixedMultisetMarkerNull: markerNull
};

console.log(JSON.stringify(result, null, 2));
