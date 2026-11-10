'use strict';
/**
 * Exact source-original GF29 affine-checksum test at prime-79 packet width.
 *
 * A stationary parity encoder with ANY 79 coefficients and constant must
 * satisfy sum(a[j]*D[packet,j])+b === 0 (mod29) for every eligible packet.
 * Append a constant one to each packet; full rank 80 over F29 is the
 * exact necessary-condition contradiction, independent of the coefficients.
 *
 * Test all 79 packet phases on original GP labels and prime labels, and
 * predecessor-exclusion cyclic/sorted rank digits after discarding any packet
 * with an observed identical-adjacent-rune transition. For the source-fixed
 * red p40/p15/p53 first-occurrence alphabet, test all 58 complete orders
 * at the independently selected phase35. Synthetic test plants a concealed
 * parity relation and the original 86 doublet sites, then recovers that
 * relation and verifies full forward/reverse decoding on clean packets.
 *
 * No new LP2 plaintext, key, authorial checksum, or destination is claimed.
 * Run: node sims/prime79_unknown_checksum_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
const Q = 29, WIDTH = 79, VARIABLE_COUNT = 80;
const mod = x => ((x % Q) + Q) % Q;
const inverse = Array(Q).fill(0);
for (let a = 1; a < Q; a++)
  for (let b = 1; b < Q; b++)
    if (a * b % Q === 1) inverse[a] = b;
assert.ok(inverse.slice(1).every(x => x > 0));

/**
 * Exact GF29 Gaussian elimination. The 80th coordinate is the constant 1.
 * A full-rank matrix eliminates every possible nonzero stationary affine
 * relation, with arbitrary positional coefficients and intercept.
 * @param {number[][]} rows
 * @returns {number}
 */
function rank(rows) {
  const pivots = Array(VARIABLE_COUNT).fill(null);
  let count = 0;
  for (const initial of rows) {
    const row = initial.slice();
    for (let j = 0; j < VARIABLE_COUNT; j++) {
      if (!row[j]) continue;
      const pivot = pivots[j];
      if (pivot === null) {
        const unit = inverse[row[j]];
        for (let k = j; k < VARIABLE_COUNT; k++)
          row[k] = row[k] * unit % Q;
        pivots[j] = row;
        count++;
        break;
      }
      const factor = row[j];
      for (let k = j; k < VARIABLE_COUNT; k++)
        row[k] = mod(row[k] - factor * pivot[k]);
    }
    if (count === VARIABLE_COUNT) break;
  }
  return count;
}

/** @param {number[][]} input */
function oneDimensionalKernel(input) {
  const rows = input.map(row => row.slice());
  const pivots = [];
  let leading = 0;
  for (let j = 0; j < VARIABLE_COUNT && leading < rows.length; j++) {
    let at = leading;
    while (at < rows.length && rows[at][j] === 0) at++;
    if (at === rows.length) continue;
    [rows[leading], rows[at]] = [rows[at], rows[leading]];
    const unit = inverse[rows[leading][j]];
    for (let k = j; k < VARIABLE_COUNT; k++)
      rows[leading][k] = rows[leading][k] * unit % Q;
    for (let i = 0; i < rows.length; i++) {
      if (i === leading || rows[i][j] === 0) continue;
      const factor = rows[i][j];
      for (let k = j; k < VARIABLE_COUNT; k++)
        rows[i][k] = mod(rows[i][k] - factor * rows[leading][k]);
    }
    pivots.push(j);
    leading++;
  }
  assert.equal(pivots.length, VARIABLE_COUNT - 1);
  const omitted = Array.from({length: VARIABLE_COUNT}, (_, j) => j)
    .filter(j => !pivots.includes(j));
  assert.equal(omitted.length, 1);
  const solution = Array(VARIABLE_COUNT).fill(0);
  solution[omitted[0]] = 1;
  for (let i = 0; i < pivots.length; i++)
    solution[pivots[i]] = mod(-rows[i][omitted[0]]);
  assert.ok(input.every(row =>
    mod(row.reduce((sum, value, j) => sum + value * solution[j], 0)) === 0));
  return solution;
}

const marker = new Uint8Array(C.length);
for (let i = 1; i < C.length; i++)
  if (C[i] === C[i - 1]) marker[i] = 1;
assert.equal(marker.reduce((a, b) => a + b, 0), 86);

/**
 * Find every eligible complete packet. A rank-coded source packet with any
 * observed doublet is excluded in its entirety, favoring the hypothesis.
 * @param {number[]} text
 * @param {number} phase
 * @param {boolean} excludeRepeated
 */
function packetStarts(text, phase, excludeRepeated) {
  const starts = [];
  for (let s = phase; s + WIDTH <= text.length; s += WIDTH) {
    if (excludeRepeated) {
      if (s === 0) continue;
      let clean = true;
      for (let j = s; j < s + WIDTH; j++) {
        if (text[j] === text[j - 1]) { clean = false; break; }
      }
      if (!clean) continue;
    }
    starts.push(s);
  }
  return starts;
}

/**
 * @param {number[]} text
 * @param {number[]} starts
 * @param {'visible'|'prime'|'cyclic'|'sorted'} mode
 * @param {number[]} ordering
 */
function packetRows(text, starts, mode, ordering) {
  const pi = Array(Q);
  ordering.forEach((glyph, index) => { pi[glyph] = index; });
  return starts.map(start => {
    const row = [];
    for (let j = start; j < start + WIDTH; j++) {
      const current = text[j];
      if (mode === 'visible') row.push(current);
      else if (mode === 'prime') row.push(corpus.prime[current] % Q);
      else if (mode === 'cyclic')
        row.push(mod(pi[current] - pi[text[j - 1]] - 1));
      else
        row.push(pi[current] - Number(pi[current] > pi[text[j - 1]]));
    }
    row.push(1);
    assert.equal(row.length, VARIABLE_COUNT);
    return row;
  });
}

const nativeOrder = Array.from({length: Q}, (_, i) => i);
const native = [];
for (let phase = 0; phase < WIDTH; phase++) {
  const all = packetStarts(C, phase, false);
  const clean = packetStarts(C, phase, true);
  const result = {
    phase, completePackets: all.length, cleanPackets: clean.length,
    visible: rank(packetRows(C, all, 'visible', nativeOrder)),
    prime: rank(packetRows(C, all, 'prime', nativeOrder)),
    cyclic: rank(packetRows(C, clean, 'cyclic', nativeOrder)),
    sorted: rank(packetRows(C, clean, 'sorted', nativeOrder))
  };
  assert.equal(result.visible, VARIABLE_COUNT);
  assert.equal(result.prime, VARIABLE_COUNT);
  assert.equal(result.cyclic, VARIABLE_COUNT);
  assert.equal(result.sorted, VARIABLE_COUNT);
  native.push(result);
}
assert.deepEqual(
  [Math.min(...native.map(x => x.cleanPackets)),
    Math.max(...native.map(x => x.cleanPackets))], [91, 97]);

const sourcePages = [40, 15, 53];
const sourceRed = sourcePages.flatMap(page => {
  const p = corpus.pages.find(item => item.page === page);
  const annotations = ink.pages.find(item => item.page === page);
  return annotations.red_spans.flatMap(span =>
    p.indices.slice(span.start, span.start + span.length));
});
assert.equal(sourceRed.length, 79);
const first = [...new Set(sourceRed)];
const missing = nativeOrder.filter(x => !first.includes(x));
assert.equal(first.length, 28);
assert.deepEqual(missing, [18]);
const clean35 = packetStarts(C, 35, true);
assert.equal(clean35.length, 95);
const sourceOrders = [];
for (let reverse = 0; reverse < 2; reverse++) {
  for (let insertion = 0; insertion < 29; insertion++) {
    const order = first.slice();
    order.splice(insertion, 0, missing[0]);
    if (reverse) order.reverse();
    const cyclic = rank(packetRows(C, clean35, 'cyclic', order));
    const sorted = rank(packetRows(C, clean35, 'sorted', order));
    assert.equal(cyclic, VARIABLE_COUNT);
    assert.equal(sorted, VARIABLE_COUNT);
    sourceOrders.push({reverse, insertion, cyclic, sorted});
  }
}
assert.equal(sourceOrders.length, 58);

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** Construct a nontrivial reversible 79-rank parity channel on source geometry. */
function plantedControl() {
  const random = rng(0x79157935);
  const coefficients = Array.from({length: WIDTH}, () => random() % Q);
  coefficients[78] = 1;
  const intercept = 13;
  const digits = Array.from({length: C.length}, () => random() % 28);
  for (const start of clean35) {
    let valid = false;
    while (!valid) {
      let sum = 0;
      for (let j = 0; j < 78; j++) {
        digits[start + j] = random() % 28;
        sum += coefficients[j] * digits[start + j];
      }
      const last = mod(-intercept - sum);
      if (last < 28) {
        digits[start + 78] = last;
        valid = true;
      }
    }
  }
  const order = first.slice();
  order.splice(17, 0, missing[0]);
  order.reverse();
  const inverseOrder = Array(Q);
  order.forEach((glyph, index) => { inverseOrder[glyph] = index; });
  const ciphertext = [];
  let previous = 7;
  for (let i = 0; i < C.length; i++) {
    const output = marker[i] ? previous
      : order[(inverseOrder[previous] + digits[i] + 1) % Q];
    if (marker[i]) assert.equal(output, previous);
    else assert.notEqual(output, previous);
    ciphertext.push(output);
    previous = output;
  }
  assert.deepEqual(packetStarts(ciphertext, 35, true), clean35);
  let restored = 0;
  const rows = packetRows(ciphertext, clean35, 'cyclic', order);
  for (let i = 0; i < clean35.length; i++) {
    const row = rows[i];
    for (let j = 0; j < WIDTH; j++) {
      assert.equal(row[j], digits[clean35[i] + j]);
      restored++;
    }
    assert.equal(mod(row.reduce((sum, d, j) =>
      sum + (j === 79 ? intercept : coefficients[j] * d), 0)), 0);
  }
  assert.equal(rank(rows), 79);
  const found = oneDimensionalKernel(rows);
  const planted = coefficients.concat([intercept]);
  const factor = inverse[found[78]];
  const recovered = found.map(x => x * factor % Q);
  assert.deepEqual(recovered, planted);
  return {
    sourceLength: ciphertext.length, plantedRepeatedOutputs: 86,
    recoveredCleanPackets: clean35.length, exactlyRecoveredRankDigits: restored,
    kernelDimension: 1, recoveredAll80AffineParametersUpToScale: true
  };
}

const positive = plantedControl();
console.log(JSON.stringify({
  status: 'EXACT bounded original-source negative; no LP2 plaintext',
  corpusRunes: C.length, alphabet: Q, packetWidth: WIDTH,
  numberOfPacketPhases: native.length, sourceFixedOrders: sourceOrders.length,
  sourceRedRuneInventory: {pages: sourcePages, count: sourceRed.length,
    distinct: first.length, missing},
  originalCleanPacketRange: [91, 97], phase35CleanPackets: clean35.length,
  exactRanks: {visible: 80, prime: 80, cyclic: 80, sorted: 80},
  all79NativePhasesHaveOnlyTrivialAffineChecksum: true,
  all58SourceRedOrdersAtPhase35HaveOnlyTrivialAffineChecksum: true,
  plantedControl: positive,
  limitations: [
    'A changing checksum/key, nonlinear mapping or non-affine secret rune order is untested',
    'Discarded doublet packets could encode separate state or unknown symbols',
    'No authentic cipher or unknown plaintext is identified'
  ]
}, null, 2));
