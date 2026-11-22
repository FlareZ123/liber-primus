'use strict';

/**
 * Original-source SFT for the source-suggested 13-prime unequal-column route.
 *
 * Run: node sims/lp2_p0_13prime_irregular_column_chain_sft.cjs
 * Read-only. Node.js 22, CommonJS, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const alphabet = corpus.translit.map((value, index) => ({ value, index }))
  .sort((a, b) => b.value.length - a.value.length);
const modulo29 = (value) => ((value % 29) + 29) % 29;

function encodeGP(latin) {
  const normalized = latin.toUpperCase()
    .replace(/[KVQZ]/g, (letter) => ({ K: 'C', V: 'U', Q: 'C', Z: 'S' })[letter])
    .replace(/[^A-Z]/g, '');
  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    const match = alphabet.find((item) => normalized.startsWith(item.value, offset));
    assert.ok(match, 'Unmapped Latin position ' + offset);
    output.push(match.index);
    offset += match.value.length;
  }
  return output;
}

function normalizedIC(values) {
  const counts = Array(29).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value] += 1;
  }
  return 29 * counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

function firstPrimes(amount) {
  const primes = [];
  for (let candidate = 2; primes.length < amount; candidate += 1) {
    if (primes.every((p) => p * p > candidate || candidate % p !== 0)) {
      primes.push(candidate);
    }
  }
  return primes;
}

/** Transform concatenated unequal columns into the row-major reading. */
function columnsToRows(values, heights) {
  assert.equal(heights.reduce((a, b) => a + b, 0), values.length);
  const columns = [];
  let start = 0;
  for (const height of heights) {
    columns.push(values.slice(start, start + height));
    start += height;
  }
  const result = [];
  for (let row = 0; row < Math.max(...heights); row += 1) {
    for (let column = 0; column < heights.length; column += 1) {
      if (row < heights[column]) result.push(columns[column][row]);
    }
  }
  return result;
}

/** Inverse: transform the row-major reading into concatenated unequal columns. */
function rowsToColumns(values, heights) {
  assert.equal(heights.reduce((a, b) => a + b, 0), values.length);
  const columns = heights.map(() => []);
  let position = 0;
  for (let row = 0; row < Math.max(...heights); row += 1) {
    for (let column = 0; column < heights.length; column += 1) {
      if (row < heights[column]) columns[column].push(values[position++]);
    }
  }
  assert.equal(position, values.length);
  return columns.flat();
}

function steps(values) {
  const result = [];
  for (let index = 1; index < values.length; index += 1) {
    result.push(modulo29(values[index] - values[index - 1]));
  }
  return result;
}

const pages = corpus.pages.filter((page) => page.page <= 2);
assert.deepEqual(pages.map((page) => page.indices.length), [262, 266, 201]);
const original = pages.flatMap((page) => page.indices);
assert.equal(original.length, 729);

const proposedTitle = encodeGP('EPIPHANY SEEKS');
assert.equal(proposedTitle.length, 13);
const inferredPad = original.slice(0, 13)
  .map((value, index) => modulo29(value - proposedTitle[index]));
const expectedPad = [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19];
assert.deepEqual(inferredPad, expectedPad);
const heights = inferredPad.map((value) => corpus.prime[value]);
assert.deepEqual(heights, [103, 97, 23, 71, 107, 97, 67, 7, 2, 23, 2, 59, 71]);
assert.equal(heights.reduce((sum, n) => sum + n, 0), original.length);

const section3 = lp1.split('### 3\n')[1].split('### 4\n')[0];
const section6 = lp1.split('### 6\n')[1].split('### 7\n')[0];
const native = encodeGP(section3 + ' ' + section6).slice(0, 729);
assert.equal(native.length, original.length);
const nativeIC = normalizedIC(native);
assert.ok(nativeIC > 1.6, 'Authentic GP English positive must have detectable concentration');
const primeClock = firstPrimes(729).map((p) => modulo29(p - 1));

const outcomes = [];
for (const direction of ['columns-to-rows', 'rows-to-columns']) {
  for (const orientation of ['forward', 'reversed']) {
    const ordering = orientation === 'forward' ? heights : [...heights].reverse();
    const unwrap = direction === 'columns-to-rows' ? columnsToRows : rowsToColumns;
    const wrap = direction === 'columns-to-rows' ? rowsToColumns : columnsToRows;
    const unwrapped = unwrap(original, ordering);
    assert.deepEqual(wrap(unwrapped, ordering), original, 'Original must roundtrip');

    const d = steps(unwrapped);
    const output = {
      direction,
      orientation,
      stationary_secret_step_ic: normalizedIC(d),
      raw_phi_minus_ic: normalizedIC(unwrapped.map((v, i) => modulo29(v - primeClock[i]))),
      raw_phi_plus_ic: normalizedIC(unwrapped.map((v, i) => modulo29(v + primeClock[i]))),
      step_phi_minus_ic: normalizedIC(d.map((v, i) => modulo29(v - primeClock[i + 1]))),
      step_phi_plus_ic: normalizedIC(d.map((v, i) => modulo29(v + primeClock[i + 1]))),
    };
    outcomes.push(output);
    assert.ok(Math.max(...Object.entries(output)
      .filter(([key]) => key.endsWith('_ic')).map(([, value]) => value)) < 1.1,
      'An original candidate unexpectedly acquired a strongly nonuniform GP stream');

    // GP29 secret-step permutation: y=(11*x+7) mod29, inverse x=8*(y-7).
    const nativeChain = [native[0]];
    for (let i = 1; i < native.length; i += 1) {
      nativeChain.push(modulo29(nativeChain[i - 1] + 11 * native[i] + 7));
    }
    const planted = wrap(nativeChain, ordering);
    const recovered = steps(unwrap(planted, ordering))
      .map((step) => modulo29(8 * (step - 7)));
    assert.deepEqual(recovered, native.slice(1), 'Blind synthetic secret-chain inverse must recover native text');

    // Direct first-prime/totient stream positive.
    const nativeClock = native.map((v, i) => modulo29(v + primeClock[i]));
    const recoveredClock = unwrap(wrap(nativeClock, ordering), ordering)
      .map((v, i) => modulo29(v - primeClock[i]));
    assert.deepEqual(recoveredClock, native, 'Blind synthetic first-prime inverse must recover native text');

    // Difference of native plaintext plus prime/totient clock positive.
    const nativePrimeChain = [native[0]];
    for (let i = 1; i < native.length; i += 1) {
      nativePrimeChain.push(modulo29(nativePrimeChain[i - 1] + native[i] + primeClock[i]));
    }
    const recoveredPrimeChain = steps(unwrap(wrap(nativePrimeChain, ordering), ordering))
      .map((v, i) => modulo29(v - primeClock[i + 1]));
    assert.deepEqual(recoveredPrimeChain, native.slice(1),
      'Blind synthetic chain-plus-prime inverse must recover native text');
  }
}

assert.equal(outcomes.length, 4);
console.log(JSON.stringify({
  result: 'PASS, all original candidate inversions stay nonlinguistic by GP29 concentration',
  originalRunes: original.length,
  proposedTitle: 'EPIPHANY SEEKS (conditional crib from signed 2016 source, not authenticated LP2 plaintext)',
  primeHeights: heights,
  nativeControlRunes: native.length,
  nativeNormalizedIC: nativeIC,
  allSourceNativePositiveControls: '12/12 exact',
  operations: outcomes,
}, null, 2));
