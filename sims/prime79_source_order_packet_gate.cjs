'use strict';
/**
 * Source-locked key test for the sole surviving LP2 79-to-78 radix hypothesis.
 * Prime 53 is the original red-pointer GP prime; it is a primitive root
 * modulo the source-selected ordinary prime 79. Order the 28 nonzero
 * GP-prime residues by their base-53 discrete logarithm modulo 79.
 * GP prime 79 itself maps to residue zero, so exhaust every placement
 * of that symbol and both orientations of the nonzero discrete-log order.
 *
 * The rule is fixed by SOURCE NUMBERS, without fitting any rune plaintext.
 * Check every one of the 95 original repeat-free phase-35 packets against
 * the complete radix-29 capacity threshold, not just its first two digits.
 * A genuine encoder/decoder positive plant checks the exact 79/78 mapping.
 *
 * Run from repository root with Node 22:
 *   node sims/prime79_source_order_packet_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const original = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(corpus.prime.length, 29);
assert.equal(corpus.prime[21], 79);

const logs = new Int16Array(79).fill(-1);
for (let i = 0, x = 1; i < 78; i++, x = x * 53 % 79) {
  assert.equal(logs[x], -1, '53 must generate all field units');
  logs[x] = i;
}
assert.equal(logs[1], 0);
assert(Array.from(logs.slice(1)).every(x => x >= 0));
const nonzero = corpus.prime.map((prime, rune) =>
  ({prime, rune, exponent: logs[prime % 79]}))
  .filter(x => x.prime !== 79)
  .sort((a, b) => a.exponent - b.exponent)
  .map(x => x.rune);
assert.equal(new Set(nonzero).size, 28);

const blockStarts = [];
for (let start = 35; start + 79 <= original.length; start += 79) {
  let repeated = false;
  for (let i = start; i < start + 79; i++) {
    if (original[i] === original[i - 1]) { repeated = true; break; }
  }
  if (!repeated) blockStarts.push(start);
}
assert.equal(blockStarts.length, 95);
const LIMIT = 29n ** 78n;

/** @param {number[]} order @returns {number[]} */
function inverseOrder(order) {
  assert.equal(order.length, 29);
  assert.equal(new Set(order).size, 29);
  const pi = Array(29);
  order.forEach((rune, position) => { pi[rune] = position; });
  return pi;
}
/** @param {number[]} pi @param {number[]} cipher @param {number} start */
function packetValue(pi, cipher, start) {
  let value = 0n;
  for (let i = start; i < start + 79; i++) {
    const previous = cipher[i - 1], current = cipher[i];
    assert.notEqual(current, previous);
    const digit = (pi[current] - pi[previous] + 28) % 29;
    assert(digit >= 0 && digit < 28);
    value = value * 28n + BigInt(digit);
  }
  return value;
}
/** @param {number[]} pi */
function originalGate(pi) {
  let badFirst = 0, badSecond = 0, badFull = 0;
  for (const start of blockStarts) {
    const d0 = (pi[original[start]] - pi[original[start - 1]] + 28) % 29;
    const d1 = (pi[original[start + 1]] - pi[original[start]] + 28) % 29;
    if (d0 > 15) badFirst++;
    if (d0 > 15 || (d0 === 15 && d1 > 12)) badSecond++;
    if (packetValue(pi, original, start) >= LIMIT) badFull++;
  }
  return {badFirst, badSecond, badFull};
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}
/** Reversible positive with a key picked independently of ciphertext. */
function positiveControl(order) {
  const pi = inverseOrder(order);
  const reverse = order.slice();
  const random = rng(0x79803529);
  let previous = 0;
  let decoded = 0, encoded = 0;
  for (let packet = 0; packet < 95; packet++) {
    const plain = Array.from({length: 78}, () => random() % 29);
    let n = 0n;
    for (const d of plain) n = n * 29n + BigInt(d);
    const digits = Array(79);
    for (let i = 78; i >= 0; i--) {
      digits[i] = Number(n % 28n);
      n /= 28n;
    }
    assert.equal(n, 0n);
    const cipher = [previous];
    for (const d of digits) {
      const current = reverse[(pi[cipher[cipher.length - 1]] + 1 + d) % 29];
      assert.notEqual(current, cipher[cipher.length - 1]);
      cipher.push(current);
    }
    const number = packetValue(pi, cipher, 1);
    assert(number < LIMIT);
    const recovered = Array(78);
    let value = number;
    for (let i = 77; i >= 0; i--) {
      recovered[i] = Number(value % 29n);
      value /= 29n;
    }
    assert.equal(value, 0n);
    assert.deepEqual(recovered, plain);
    previous = cipher[79];
    decoded += 78;
    encoded += 79;
  }
  return {packets: 95, decodedRunes: decoded, reencryptedRunes: encoded};
}

/**
 * A violated first-two-digit constraint references only two or three
 * original rune labels. Any satisfying secret order must change the assigned
 * cyclic position of at least one label in each violated constraint.
 * Minimum vertex cover of this finite 29-vertex hypergraph therefore gives
 * an EXACT lower bound on the number of altered label assignments.
 * It is not a proof that a permutation at that distance is feasible.
 * @param {number[]} pi
 */
function mandatoryChangedLabels(pi) {
  const edges = [];
  for (const s of blockStarts) {
    const a = original[s - 1], b = original[s], c = original[s + 1];
    const d0 = (pi[b] - pi[a] + 28) % 29;
    const d1 = (pi[c] - pi[b] + 28) % 29;
    if (d0 > 15) edges.push((1 << a) | (1 << b));
    else if (d0 === 15 && d1 > 12)
      edges.push((1 << a) | (1 << b) | (1 << c));
  }
  const pop = mask => {
    let n = 0;
    for (; mask; mask &= mask - 1) n++;
    return n;
  };
  const unique = [...new Set(edges)].sort((a, b) => pop(a) - pop(b));
  let minimum = 29;
  function search(rest, selected) {
    if (selected >= minimum) return;
    if (rest.length === 0) { minimum = selected; return; }
    const degree = new Int32Array(29);
    for (const edge of rest) {
      for (let mask = edge; mask; mask &= mask - 1)
        degree[31 - Math.clz32(mask & -mask)]++;
    }
    let choice = rest[0], best = -1;
    for (let i = 0; i < Math.min(rest.length, 12); i++) {
      let score = 0;
      for (let mask = rest[i]; mask; mask &= mask - 1)
        score += degree[31 - Math.clz32(mask & -mask)];
      if (score > best) { best = score; choice = rest[i]; }
    }
    const labels = [];
    for (let mask = choice; mask; mask &= mask - 1)
      labels.push(31 - Math.clz32(mask & -mask));
    labels.sort((a, b) => degree[b] - degree[a]);
    for (const label of labels)
      search(rest.filter(edge => !(edge & (1 << label))), selected + 1);
  }
  search(unique, 0);
  return minimum;
}

const cases = [];
for (const reverse of [false, true]) {
  const ordered = reverse ? nonzero.slice().reverse() : nonzero;
  for (let zeroPosition = 0; zeroPosition < 29; zeroPosition++) {
    const runeOrder = ordered.slice();
    runeOrder.splice(zeroPosition, 0, 21);
    const stats = originalGate(inverseOrder(runeOrder));
    const mandatoryChanged = mandatoryChangedLabels(inverseOrder(runeOrder));
    cases.push({reverse, zeroPosition, ...stats, mandatoryChanged});
  }
}
assert.equal(cases.length, 58);
assert(cases.every(c => c.badFull > 0));
const min = Math.min(...cases.map(c => c.badFull));
const best = cases.filter(c => c.badFull === min);
const positiveOrder = nonzero.slice();
positiveOrder.splice(14, 0, 21);
const control = positiveControl(positiveOrder);
assert.deepEqual(control, {
  packets: 95, decodedRunes: 7410, reencryptedRunes: 7505
});
const result = {
  hypothesis: 'GP-prime discrete-log source order, 53 modulo 79',
  phase: 35,
  originalCleanPackets: blockStarts.length,
  candidateSourceOrders: cases.length,
  ordersPassingAllPackets: cases.filter(c => c.badFull === 0).length,
  minimumInvalidPackets: min,
  minimumNecessaryChangedRuneLabels:
    Math.min(...cases.map(c => c.mandatoryChanged)),
  necessaryChangeHistogram: cases.reduce((hist, c) => {
    hist[c.mandatoryChanged] = (hist[c.mandatoryChanged] || 0) + 1;
    return hist;
  }, {}),
  bestOriginalOrderCases: best,
  literalGpOrder: originalGate(inverseOrder(
    Array.from({length: 29}, (_, i) => i))),
  syntheticPositive: control,
  classification: 'bounded source-order negative, no plaintext recovered'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
