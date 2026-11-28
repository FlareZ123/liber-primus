'use strict';

const assert = require('node:assert/strict');

const MOD = 29;
const INV2 = 15;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  const out = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    const left = values[i];
    const right = values[values.length - 1 - i];
    out.push(mod29(left - right), mod29(left + right));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

/** @param {number[]} shell @returns {number[]} */
function hInverse(shell) {
  const pairStop = shell.length % 2 === 1 ? shell.length - 1 : shell.length;
  const left = [];
  const right = [];
  for (let i = 0; i < pairStop; i += 2) {
    const diff = shell[i];
    const sum = shell[i + 1];
    left.push(mod29((diff + sum) * INV2));
    right.push(mod29((sum - diff) * INV2));
  }
  const middle = shell.length % 2 === 1 ? [shell[shell.length - 1]] : [];
  return left.concat(middle, right.reverse());
}

/** @param {number[]} values @returns {number[]} */
function hCanonical(values) {
  const differences = [];
  const sums = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    const left = values[i];
    const right = values[values.length - 1 - i];
    differences.push(mod29(left - right));
    sums.push(mod29(left + right));
  }
  const middle = values.length % 2 === 1 ? [values[Math.floor(values.length / 2)]] : [];
  return differences.concat(middle, sums.reverse());
}

/** @param {number[]} shell @returns {number[]} */
function hCanonicalInverse(shell) {
  const pairs = Math.floor(shell.length / 2);
  const differences = shell.slice(0, pairs);
  const middle = shell.length % 2 === 1 ? [shell[pairs]] : [];
  const sums = shell.slice(pairs + middle.length).reverse();
  const left = [];
  const right = [];
  for (let i = 0; i < pairs; i += 1) {
    left.push(mod29((differences[i] + sums[i]) * INV2));
    right.push(mod29((sums[i] - differences[i]) * INV2));
  }
  return left.concat(middle, right.reverse());
}

/** @param {number[]} values @returns {number[][]} */
function uniquePermutations(values) {
  const out = new Map();
  /** @param {number} index */
  function visit(index) {
    if (index === values.length) {
      out.set(values.join(','), values.slice());
      return;
    }
    for (let i = index; i < values.length; i += 1) {
      [values[index], values[i]] = [values[i], values[index]];
      visit(index + 1);
      [values[index], values[i]] = [values[i], values[index]];
    }
  }
  visit(0);
  return [...out.values()];
}

/** @param {number[]} values @returns {number[][]} */
function localDistinctVariants(values) {
  const bases = [
    values.slice(),
    h(values),
    hInverse(values),
    hCanonical(values),
    hCanonicalInverse(values),
  ];
  const out = new Map();
  for (const base of bases) {
    for (const perm of uniquePermutations(base.slice())) {
      for (const sign of [1, -1]) {
        const candidate = perm.map((value) => mod29(sign * value));
        out.set(candidate.join(','), candidate);
      }
    }
  }
  return [...out.values()];
}

/** @param {number[]} values @returns {number[][]} */
function globalDistinctVariants(values) {
  const reversed = values.slice().reverse();
  const hv = h(values);
  const hInv = hInverse(values);
  const hc = hCanonical(values);
  const hcInv = hCanonicalInverse(values);
  const bases = [
    values.slice(),
    reversed,
    hv,
    hInv,
    h(reversed),
    hInverse(reversed),
    hv.slice().reverse(),
    hInv.slice().reverse(),
    hc,
    hcInv,
    hCanonical(reversed),
    hCanonicalInverse(reversed),
    hc.slice().reverse(),
    hcInv.slice().reverse(),
  ];
  const out = new Map();
  for (const base of bases) {
    for (const sign of [1, -1]) {
      const candidate = base.map((value) => mod29(sign * value));
      out.set(candidate.join(','), candidate);
    }
  }
  return [...out.values()];
}

/** @param {number[]} left @param {number[]} right @param {'+'|'-'|'r-'|'*'} op @returns {number[]} */
function combine(left, right, op) {
  assert.equal(left.length, right.length);
  return left.map((value, index) => {
    const other = right[index];
    if (op === '+') return mod29(value + other);
    if (op === '-') return mod29(value - other);
    if (op === 'r-') return mod29(other - value);
    return mod29(value * other);
  });
}

/** @param {number[][]} components @returns {number[]} */
function flatten(components) {
  return components.flatMap((component) => component);
}

const p6 = {
  W1: [24, 16, 14, 17],
  W2: [19],
  W3: [6, 27, 15, 17],
  W4: [14, 12],
  lengths: [4, 1, 4, 2],
};

assert.deepEqual(p6.lengths, [4, 1, 4, 2]);
const [q, one, , K] = p6.lengths;
assert.equal(q + K, 6);
assert.equal(q + one + K, 7);

// Source-only q components. W1 and W3 are the two printed q-length title words.
// The four binary choices deliberately overcharge simple interactions between them.
const qBases = [
  p6.W1,
  p6.W3,
  combine(p6.W1, p6.W3, '+'),
  combine(p6.W1, p6.W3, '-'),
  combine(p6.W1, p6.W3, 'r-'),
  combine(p6.W1, p6.W3, '*'),
];

const qVariants = qBases.map(localDistinctVariants);
const w2Variants = localDistinctVariants(p6.W2);
const w4Variants = localDistinctVariants(p6.W4);

assert.deepEqual(
  qVariants.map((variants) => variants.length),
  [192, 192, 144, 144, 144, 168]
);
assert.equal(w2Variants.length, 2);
assert.equal(w4Variants.length, 12);

const key6Outputs = new Set();
for (const variants of qVariants) {
  for (const qPart of variants) {
    for (const kPart of w4Variants) {
      for (const components of [[qPart, kPart], [kPart, qPart]]) {
        for (const candidate of globalDistinctVariants(flatten(components))) {
          key6Outputs.add(candidate.join(','));
        }
      }
    }
  }
}

const key7Outputs = new Set();
const componentOrders = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0],
];
for (const variants of qVariants) {
  for (const qPart of variants) {
    for (const onePart of w2Variants) {
      for (const kPart of w4Variants) {
        const components = [qPart, onePart, kPart];
        for (const order of componentOrders) {
          const ordered = order.map((index) => components[index]);
          for (const candidate of globalDistinctVariants(flatten(ordered))) {
            key7Outputs.add(candidate.join(','));
          }
        }
      }
    }
  }
}

// Labeled charge counts keep mathematically redundant labels rather than pretending
// that H/H^-1 or permutation labels on a singleton are discovery evidence.
const labeledQ = 6 * 5 * 24 * 2;
const labeledOne = 5 * 1 * 2;
const labeledK = 5 * 2 * 2;
const labeledGlobal = 14 * 2;
const labeled6 = labeledQ * labeledK * 2 * labeledGlobal;
const labeled7 = labeledQ * labeledOne * labeledK * 6 * labeledGlobal;

// Counts below are frozen regression values for this charged family.
assert.equal(labeled6, 1612800);
assert.equal(labeled7, 48384000);
assert.equal(key6Outputs.size, 175464);
assert.equal(key7Outputs.size, 983134);

// Held comparison only. These are the previously published fitted local keys;
// no target plaintext rune values participate in construction of the grammar above.
const fittedP41 = [26, 23, 1, 7, 13, 22];
const fittedP42 = [7, 1, 12, 23, 13, 2, 18];
const p41Hit = key6Outputs.has(fittedP41.join(','));
const p42Hit = key7Outputs.has(fittedP42.join(','));
assert.equal(p41Hit, false);
assert.equal(p42Hit, false);

console.log(JSON.stringify({
  status: 'PASS',
  sourceOnlyGrammar: {
    p6TitleLengths: p6.lengths,
    terminalArities: [q + K, q + one + K],
    qBaseCount: qBases.length,
    localDistinctQVariants: qVariants.map((variants) => variants.length),
    localDistinctOneVariants: w2Variants.length,
    localDistinctKVariants: w4Variants.length,
  },
  chargedFamily: {
    labeledLength6: labeled6,
    labeledLength7: labeled7,
    distinctLength6Outputs: key6Outputs.size,
    distinctLength7Outputs: key7Outputs.size,
  },
  heldComparison: {
    p41FittedKey: fittedP41,
    p42FittedKey: fittedP42,
    p41Hit,
    p42Hit,
    jointHit: p41Hit && p42Hit,
  },
}, null, 2));
