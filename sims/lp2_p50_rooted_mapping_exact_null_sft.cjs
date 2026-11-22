'use strict';

// Exact conditional random-map null for the original LP2 32x8 number table.
// Node.js 22 / CommonJS. This is a mathematical control, not a decipherment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = data.pages.flatMap((p) => p.tokens);
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
console.log(JSON.stringify(result, null, 2));
