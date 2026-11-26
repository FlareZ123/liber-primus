'use strict';

/**
 * Frozen original-input test of the base59 table's 95 leaves matching the 95
 * original p57 clear runes. Test both source-row-major and source-cued postorder
 * DFS child-sum receivers against authenticated p56 solved plaintext/ciphertext.
 *
 * Conditional source model; a failure is NOT a general graph-cipher exclusion.
 *
 * Run: node sims/lp2_base59_leaf95_terminal256_knownp56_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet = alphabet60.replace('f', '');
const n = 256;
const root = 189;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} token @returns {number} */
function base59(token) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const v = 59 * a + b;
  assert.ok(v >= 0 && v < 256);
  return v;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const units = corpus.translit.map((text, index) => ({ text, index }))
    .sort((a, b) => b.text.length - a.text.length);
  const out = [];
  for (let i = 0; i < word.length;) {
    const match = units.find((unit) => word.startsWith(unit.text, i));
    assert.ok(match, 'missing rune for ' + word.slice(i));
    out.push(match.index);
    i += match.text.length;
  }
  return out;
}

/** @param {readonly number[]} symbols @returns {number[]} */
function histogram(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) {
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    counts[symbol] += 1;
  }
  return counts;
}

/** @param {number} length @returns {number[]} */
function firstPrimes(length) {
  const primes = [];
  for (let candidate = 2; primes.length < length; candidate++) {
    let prime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) { prime = false; break; }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

/** @param {readonly number[]} plain @returns {number[]} */
function encryptAuthenticP56(plain) {
  const primes = firstPrimes(plain.length);
  let clock = 0;
  return plain.map((value) => {
    if (value === 0) return 0; // Transparent F does not advance prime clock.
    const output = mod29(value + primes[clock] - 1);
    clock += 1;
    return output;
  });
}

const parent = tokens.map(base59);
const plain60Values = tokens.map((token) => 60 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1]));
assert.ok(plain60Values.every((value) => value >= 0 && value < 256));
assert.equal(new Set(plain60Values).size, 161);
assert.equal(new Set(parent).size, 161);

// Uniform 256-draw occupancy null: each token value is one of 256 values.
// This evaluates the *exact* distribution of the distinct-value count.
let occup = Array(n + 1).fill(0);
occup[0] = 1;
for (let draws = 0; draws < n; draws++) {
  const next = Array(n + 1).fill(0);
  for (let k = 0; k <= draws; k++) {
    next[k] += occup[k] * k / n;
    next[k + 1] += occup[k] * (n - k) / n;
  }
  occup = next;
}
const expectedDistinct = occup.reduce((sum, value, k) => sum + k * value, 0);
assert.ok(Math.abs(expectedDistinct - 162.0071027477667) < 1e-10);
assert.ok(Math.abs(occup[161] - 0.07822643713065443) < 1e-12);
assert.equal(parent.length, n);
assert.equal(parent[root], root);

const children = Array.from({ length: n }, () => []);
for (let node = 0; node < n; node++) {
  if (node !== root) children[parent[node]].push(node);
}
for (let node = 0; node < n; node++) {
  const seen = new Set();
  let cur = node;
  while (cur !== root) {
    assert.ok(!seen.has(cur), 'non-root cycle');
    seen.add(cur);
    cur = parent[cur];
  }
}
const leaves = Array.from({ length: n }, (_, i) => i)
  .filter((node) => children[node].length === 0);
const internals = Array.from({ length: n }, (_, i) => i)
  .filter((node) => children[node].length > 0);
assert.equal(leaves.length, 95);
assert.equal(internals.length, 161);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(76 + 85, internals.length);

// Source-stationary outermost labels from all 95 known genuine p57 runes.
const values = Array(n).fill(-1);
for (let i = 0; i < leaves.length; i++) {
  values[leaves[i]] = corpus.pages[57].indices[i];
}
const visited = new Set();

/** @param {number} node @returns {number} */
function label(node) {
  if (values[node] >= 0) return values[node];
  assert.ok(!visited.has(node));
  visited.add(node);
  values[node] = children[node].reduce((sum, child) => mod29(sum + label(child)), 0);
  visited.delete(node);
  return values[node];
}
for (const node of internals) label(node);
assert.ok(values.every((value) => value >= 0 && value < 29));

const internalLabels = internals.map((node) => values[node]);
const predictedP55 = internalLabels.slice(0, 76);
const predictedP56 = internalLabels.slice(76);
const authenticP56 = (
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
).split(' ').flatMap(gpWord);
const originalP56Cipher = corpus.pages[56].indices;
assert.equal(authenticP56.length, 85);
assert.deepEqual(encryptAuthenticP56(authenticP56), originalP56Cipher,
  'native historical solved-page cipher positive must match all 85 original runes');

const matchingPlainOffsets = predictedP56.flatMap((x, i) =>
  x === authenticP56[i] ? [i] : []);
const matchingCipherOffsets = predictedP56.flatMap((x, i) =>
  x === originalP56Cipher[i] ? [i] : []);
assert.deepEqual(matchingPlainOffsets, [39, 43]);
assert.deepEqual(matchingCipherOffsets, [46, 69]);

// Source-cued alternative order: leaves-to-root postorder DFS. Children are
// already in ascending source address because the parent table was traversed
// from address 0 to 255 above. This is the natural bottom-up reading of the
// distinct tree drawings on p32/p55; no phase, child order or alphabet is fit.
const postorderNodes = [];
/** @param {number} node */
function walkPostorder(node) {
  for (const child of children[node]) walkPostorder(child);
  postorderNodes.push(node);
}
walkPostorder(root);
assert.equal(postorderNodes.length, n);
const postorderLeaves = postorderNodes.filter((node) => children[node].length === 0);
const postorderInternals = postorderNodes.filter((node) => children[node].length > 0);
assert.equal(postorderLeaves.length, 95);
assert.equal(postorderInternals.length, 161);

const postorderValues = Array(n).fill(-1);
for (let i = 0; i < postorderLeaves.length; i++) {
  postorderValues[postorderLeaves[i]] = corpus.pages[57].indices[i];
}
const postorderActive = new Set();
/** @param {number} node @returns {number} */
function postorderLabel(node) {
  if (postorderValues[node] >= 0) return postorderValues[node];
  assert.ok(!postorderActive.has(node), 'postorder graph cycle');
  postorderActive.add(node);
  postorderValues[node] = children[node].reduce(
    (sum, child) => mod29(sum + postorderLabel(child)), 0);
  postorderActive.delete(node);
  return postorderValues[node];
}
for (const node of postorderInternals) postorderLabel(node);
const postorderInternalLabels = postorderInternals.map((node) => postorderValues[node]);
const postorderP56 = postorderInternalLabels.slice(76);
const postorderPlainOffsets = postorderP56.flatMap((x, i) =>
  x === authenticP56[i] ? [i] : []);
const postorderCipherOffsets = postorderP56.flatMap((x, i) =>
  x === originalP56Cipher[i] ? [i] : []);
assert.deepEqual(postorderPlainOffsets, [45, 57, 68]);
assert.deepEqual(postorderCipherOffsets, [2, 12, 24, 25, 33, 65]);

/** @param {readonly number[]} a @param {readonly number[]} b @returns {number} */
function positionalMatches(a, b) {
  return a.reduce((sum, value, i) => sum + (value === b[i] ? 1 : 0), 0);
}
/** @param {readonly number[]} a @param {readonly number[]} b @returns {number} */
function expectedPositionalMatches(a, b) {
  const ca = histogram(a), cb = histogram(b);
  return ca.reduce((sum, count, symbol) => sum + count * cb[symbol] / a.length, 0);
}
/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}
/** @param {readonly number[]} a @param {readonly number[]} b @param {number} observed @param {number} seed */
function permutationSummary(a, b, observed, seed) {
  const random = xorshift32(seed);
  const shuffled = b.slice();
  const iterations = 100000;
  let greaterOrEqual = 0, sum = 0, sumSquares = 0;
  for (let trial = 0; trial < iterations; trial++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const matches = positionalMatches(a, shuffled);
    sum += matches;
    sumSquares += matches * matches;
    if (matches >= observed) greaterOrEqual++;
  }
  const mean = sum / iterations;
  return {
    iterations, seed: '0x' + seed.toString(16),
    meanMatches: mean,
    sdMatches: Math.sqrt(sumSquares / iterations - mean * mean),
    pAtLeastObserved: (greaterOrEqual + 1) / (iterations + 1),
  };
}
const postorderPlainExpected = expectedPositionalMatches(postorderP56, authenticP56);
const postorderCipherExpected = expectedPositionalMatches(postorderP56, originalP56Cipher);
const postorderPlainNull = permutationSummary(
  postorderP56, authenticP56, postorderPlainOffsets.length, 0x44a44);
const postorderCipherNull = permutationSummary(
  postorderP56, originalP56Cipher, postorderCipherOffsets.length, 0x44a45);
assert.ok(Math.abs(postorderPlainExpected - 4.117647058823529) < 1e-12);
assert.ok(Math.abs(postorderCipherExpected - 2.894117647058824) < 1e-12);
assert.ok(Math.abs(postorderPlainNull.pAtLeastObserved - 0.8002219977800222) < 1e-12);
assert.ok(Math.abs(postorderCipherNull.pAtLeastObserved - 0.06827931720682794) < 1e-12);
assert.ok(postorderPlainNull.pAtLeastObserved > 0.05);
assert.ok(postorderCipherNull.pAtLeastObserved > 0.05);

// Stronger *keyless all-internal-permutations* necessary condition:
// any 85-position p56 plaintext subset of the 161 derived inner labels must
// have per-rune multiplicities no larger than the whole 161-label inventory.
const available = histogram(internalLabels);
const required = histogram(authenticP56);
const deficits = available.flatMap((value, symbol) =>
  value >= required[symbol] ? [] : [{
    rune: corpus.translit[symbol],
    available: value,
    required: required[symbol],
    deficit: required[symbol] - value,
  }]);
assert.deepEqual(deficits, [
  { rune: 'S', available: 5, required: 7, deficit: 2 },
  { rune: 'E', available: 9, required: 16, deficit: 7 },
  { rune: 'A', available: 2, required: 6, deficit: 4 },
  { rune: 'Y', available: 0, required: 2, deficit: 2 },
]);
assert.equal(deficits.reduce((sum, x) => sum + x.deficit, 0), 15);
// A single global GP29 output bijection must preserve every p57 leaf symbol;
// S/E/A/Y all appear in clear p57, so no such global relabeling repairs this.
const clearP57Histogram = histogram(corpus.pages[57].indices);
for (const gap of deficits) {
  const i = corpus.translit.indexOf(gap.rune);
  assert.ok(clearP57Histogram[i] > 0, gap.rune + ' must already be fixed by leaves');
}

console.log(JSON.stringify({
  conditionalRadix: 59,
  root, sourceCells: n,
  leaves: leaves.length,
  internals: internals.length,
  distinctSourceTokensBothRadices: 161,
  uniformByteNullPExactly161Distinct: occup[161],
  uniformByteNullExpectedDistinct: expectedDistinct,
  terminalPageLengths: [76, 85, 95],
  frozenLeafAssignment: 'ascending source address <- 95 clear p57 GP rune identities',
  frozenInternalOperation: 'sum all immediate child GP indices modulo29 recursively',
  frozenReadout: 'ascending interior node address: first76 p55, final85 solved p56',
  p56PredictionsMatchSolvedPlain: matchingPlainOffsets.length,
  plainMatchOffsets: matchingPlainOffsets,
  p56PredictionsMatchOriginalCipher: matchingCipherOffsets.length,
  cipherMatchOffsets: matchingCipherOffsets,
  necessaryAllInternalSubsetDeficits: deficits,
  minRequiredSymbolIdentityChanges: 15,
  globalBijectiveAlphabetWithClearP57Fixed: 'excluded by the S/E/A/Y deficit; internal-only relabeling untested',
  exactPositive: 'original p56 authentic prime-totient + plaintext-F bypass 85/85',
  firstPredictedP55Symbols: predictedP55.slice(0, 20).map((i) => corpus.translit[i]).join(''),
  postorderDfsControl: {
    root, childOrder: 'ascending original source address',
    leafAssignment: 'clear p57 GP29 symbols in leaves-to-root postorder encounter order',
    internalOperation: 'recursive sum of immediate child GP29 symbols modulo29',
    internalReadout: 'postorder internal nodes: first76 p55, last85 p56',
    p56PlainMatchOffsets: postorderPlainOffsets,
    p56CipherMatchOffsets: postorderCipherOffsets,
    expectedPlainMatches: postorderPlainExpected,
    expectedCipherMatches: postorderCipherExpected,
    plainPermutationNull: postorderPlainNull,
    cipherPermutationNull: postorderCipherNull,
    predictedP56IC: (() => {
      const h = histogram(postorderP56);
      const pairs = h.reduce((sum, count) => sum + count * (count - 1) / 2, 0);
      return pairs / (85 * 84 / 2);
    })(),
    decision: 'No plaintext recovery; the natural postorder receiver is at chance against authentic p56 plaintext.',
  },
  decision: 'This fixed leaf-to-internal GF29 child-sum receiver fails independently known original p56, even allowing arbitrary interior position permutation without symbol remapping. Other tree rules or bijective output alphabets remain open.',
}, null, 2));
