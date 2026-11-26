'use strict';
/**
 * Read-only source gate for the p33 cuneiform / p55 43+33 split.
 *
 * Hypothesis (not established): the cuneiform integers 1033 and 3301 are
 * prime-field moduli, while the page-local p55 interior/exterior registers
 * select subgroup orders 43 and 33. The sexagesimal digits 17,13,55,1 offer
 * candidate generator bases and a page/carry phase.
 *
 * This tests only two simple, fully specified consumers:
 *   1. powers of the order-43/order-33 subgroup generators reduced mod 29
 *      as two additive GP29 key streams;
 *   2. GP29 prime weights projected into those subgroups and converted by
 *      discrete logarithms, with exponent mod 29 as the symbol mapping.
 *
 * It does not search arbitrary generators, offsets, mappings or ciphers.
 * Run: node sims/lp2_cuneiform_1033_3301_p55_subgroup_key_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grouped = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources', 'liber-primus', 'lp2-page-groups-54-55-derived.json'), 'utf8'));

const P = 1033;
const Q = 3301;
const INNER_ORDER = 43;
const OUTER_ORDER = 33;
const ALPHABET = '0123456789abcdefghijklmnopqrs';
const GP_PRIMES = corpus.prime;
const TRANSLIT = corpus.translit;
assert.equal(GP_PRIMES.length, 29);
assert.equal(TRANSLIT.length, 29);

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function modPow(base, exponent, modulus) {
  let b = BigInt(base) % BigInt(modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = out * b % m;
    b = b * b % m;
    e >>= 1n;
  }
  return Number(out);
}
function multiplicativeOrder(base, modulus) {
  assert.equal(gcd(base, modulus), 1);
  let x = 1;
  for (let k = 1; k <= modulus - 1; k++) {
    x = x * base % modulus;
    if (x === 1) return k;
  }
  throw new Error('order not found');
}
function mod29(x) {
  return ((x % 29) + 29) % 29;
}
function ioc(values) {
  const freq = new Uint16Array(29);
  for (const x of values) freq[x]++;
  let pairs = 0;
  for (const n of freq) pairs += n * (n - 1);
  return pairs / (values.length * (values.length - 1));
}
function render(values) {
  return values.map(x => TRANSLIT[x]).join('');
}
function renderWords(values, lengths) {
  let offset = 0;
  return lengths.map(n => {
    const word = render(values.slice(offset, offset + n));
    offset += n;
    return word;
  }).join(' ');
}

assert.ok(isPrime(P));
assert.ok(isPrime(Q));
assert.equal(P - 1, 24 * INNER_ORDER);
assert.equal(Q - 1, 100 * OUTER_ORDER);
assert.equal(1033, 17 * 60 + 13);
assert.equal(3301, 55 * 60 + 1);

const page = corpus.pages.find(p => p.page === 55).indices;
const groups = grouped.p55.groups;
const lengths = groups.map(w => w.length);
assert.equal(groups.length, 17);
assert.equal(groups[0].length, 1); // the physical p54->p55 carry
const groupTape = groups.join('');
const groupIndices = [...groupTape].map(ch => ALPHABET.indexOf(ch));
assert.ok(groupIndices.every(x => x >= 0 && x < 29));
assert.deepEqual(groupIndices, page);
assert.equal(page.length, 76);

const interior = [];
const exterior = [];
const interiorPositions = [];
const exteriorPositions = [];
let offset = 0;
for (let wi = 0; wi < groups.length; wi++) {
  const word = [...groups[wi]].map(ch => ALPHABET.indexOf(ch));
  if (wi === 0) {
    exterior.push(word[0]);
    exteriorPositions.push(offset);
    offset += word.length;
    continue;
  }
  exterior.push(word[0]);
  exteriorPositions.push(offset);
  for (let j = 1; j < word.length - 1; j++) {
    interior.push(word[j]);
    interiorPositions.push(offset + j);
  }
  exterior.push(word[word.length - 1]);
  exteriorPositions.push(offset + word.length - 1);
  offset += word.length;
}
assert.equal(offset, 76);
assert.equal(interior.length, INNER_ORDER);
assert.equal(exterior.length, OUTER_ORDER);
assert.equal(interiorPositions.length, INNER_ORDER);
assert.equal(exteriorPositions.length, OUTER_ORDER);

// These are the two natural assignments of the cuneiform digits 13 and 17
// to the prime fields. In the reversed assignment they are primitive roots.
// In source order they have orders 516 and 1650, with the indicated powers
// selecting the exact 43- and 33-element subgroups.
const assignments = [
  {
    name: 'reversed digits: 13 mod 1033, 17 mod 3301',
    innerBase: 13, innerCofactor: 24,
    outerBase: 17, outerCofactor: 100,
    expectedInnerBaseOrder: 1032, expectedOuterBaseOrder: 3300,
    expectedInnerGenerator: 829, expectedOuterGenerator: 1758,
    expectedLogUnique: [19, 18],
    expectedRawInAlphabet: [33, 32]
  },
  {
    name: 'source order: 17 mod 1033, 13 mod 3301',
    innerBase: 17, innerCofactor: 12,
    outerBase: 13, outerCofactor: 50,
    expectedInnerBaseOrder: 516, expectedOuterBaseOrder: 1650,
    expectedInnerGenerator: 392, expectedOuterGenerator: 1912,
    expectedLogUnique: [19, 19],
    expectedRawInAlphabet: [23, 33]
  }
];

const signPairs = [
  [-1, -1], [1, 1], [-1, 1], [1, -1]
];
const phaseSets = [
  { name: 'zero-based', inner: 0, outer: 0 },
  { name: 'one-based', inner: 1, outer: 1 },
  { name: 'page55/carry1', inner: 55 % INNER_ORDER, outer: 1 }
];

const assignmentResults = [];
const allReadouts = [];
for (const assignment of assignments) {
  const innerBaseOrder = multiplicativeOrder(assignment.innerBase, P);
  const outerBaseOrder = multiplicativeOrder(assignment.outerBase, Q);
  assert.equal(innerBaseOrder, assignment.expectedInnerBaseOrder);
  assert.equal(outerBaseOrder, assignment.expectedOuterBaseOrder);

  const innerGenerator = modPow(
    assignment.innerBase, assignment.innerCofactor, P);
  const outerGenerator = modPow(
    assignment.outerBase, assignment.outerCofactor, Q);
  assert.equal(innerGenerator, assignment.expectedInnerGenerator);
  assert.equal(outerGenerator, assignment.expectedOuterGenerator);
  assert.equal(multiplicativeOrder(innerGenerator, P), INNER_ORDER);
  assert.equal(multiplicativeOrder(outerGenerator, Q), OUTER_ORDER);

  const fieldReadouts = [];
  for (const phase of phaseSets) {
    const innerKey = Array.from({ length: INNER_ORDER }, (_, i) =>
      modPow(innerGenerator, i + phase.inner, P) % 29);
    const outerKey = Array.from({ length: OUTER_ORDER }, (_, i) =>
      modPow(outerGenerator, i + phase.outer, Q) % 29);
    for (const [signInner, signOuter] of signPairs) {
      const out = page.slice();
      for (let i = 0; i < INNER_ORDER; i++) {
        out[interiorPositions[i]] =
          mod29(interior[i] + signInner * innerKey[i]);
      }
      for (let i = 0; i < OUTER_ORDER; i++) {
        out[exteriorPositions[i]] =
          mod29(exterior[i] + signOuter * outerKey[i]);
      }
      const item = {
        phase: phase.name,
        signInner,
        signOuter,
        ioc: ioc(out),
        stream: render(out),
        words: renderWords(out, lengths)
      };
      fieldReadouts.push(item);
      allReadouts.push({ assignment: assignment.name, ...item });
    }
  }

  // Direct GP-prime -> subgroup projection -> discrete-log map.
  function logMap(base, cofactor, modulus, order) {
    const generator = modPow(base, cofactor, modulus);
    const table = new Map();
    let x = 1;
    for (let k = 0; k < order; k++) {
      assert.ok(!table.has(x));
      table.set(x, k);
      x = x * generator % modulus;
    }
    assert.equal(x, 1);
    const raw = GP_PRIMES.map(prime => {
      const projected = modPow(prime, cofactor, modulus);
      const value = table.get(projected);
      assert.notEqual(value, undefined);
      return value;
    });
    const reduced = raw.map(value => value % 29);
    return {
      generator,
      raw,
      rawInAlphabet: raw.filter(value => value < 29).length,
      reduced,
      uniqueReduced: new Set(reduced).size
    };
  }

  const innerLog = logMap(
    assignment.innerBase, assignment.innerCofactor, P, INNER_ORDER);
  const outerLog = logMap(
    assignment.outerBase, assignment.outerCofactor, Q, OUTER_ORDER);
  assert.equal(innerLog.uniqueReduced, assignment.expectedLogUnique[0]);
  assert.equal(outerLog.uniqueReduced, assignment.expectedLogUnique[1]);
  assert.equal(innerLog.rawInAlphabet,
    assignment.expectedRawInAlphabet[0]);
  assert.equal(outerLog.rawInAlphabet,
    assignment.expectedRawInAlphabet[1]);

  const logOut = page.slice();
  for (let i = 0; i < INNER_ORDER; i++) {
    logOut[interiorPositions[i]] = innerLog.reduced[interior[i]];
  }
  for (let i = 0; i < OUTER_ORDER; i++) {
    logOut[exteriorPositions[i]] = outerLog.reduced[exterior[i]];
  }

  assignmentResults.push({
    assignment: assignment.name,
    fieldOrders: {
      innerBase: innerBaseOrder,
      outerBase: outerBaseOrder,
      innerSubgroupGenerator: innerGenerator,
      innerSubgroupOrder: INNER_ORDER,
      outerSubgroupGenerator: outerGenerator,
      outerSubgroupOrder: OUTER_ORDER
    },
    fieldElementMod29Readouts: fieldReadouts,
    primeWeightDiscreteLog: {
      innerRawInAlphabet: innerLog.rawInAlphabet,
      outerRawInAlphabet: outerLog.rawInAlphabet,
      innerUniqueAfterMod29: innerLog.uniqueReduced,
      outerUniqueAfterMod29: outerLog.uniqueReduced,
      p55Readout: render(logOut),
      p55Words: renderWords(logOut, lengths)
    }
  });
}

const scores = allReadouts.map(x => x.ioc);
const minIoC = Math.min(...scores);
const maxIoC = Math.max(...scores);
assert.equal(allReadouts.length, 24);
assert.ok(Math.abs(minIoC - 0.028421052631578948) < 1e-12);
assert.ok(Math.abs(maxIoC - 0.045263157894736845) < 1e-12);

console.log(JSON.stringify({
  scope: 'p33 cuneiform values as prime fields; p55 page-local 43 interior / 33 exterior registers',
  source: {
    cuneiformSexagesimal: [[17, 13], [55, 1]],
    decimalValues: [1033, 3301],
    primeFields: [P, Q],
    fieldGroupOrders: [P - 1, Q - 1],
    factorization: {
      inner: '1032 = 24 * 43',
      outer: '3300 = 100 * 33'
    },
    p55: {
      groups: groups.length,
      carryIncludedInExterior: true,
      totalRunes: page.length,
      interior: interior.length,
      exterior: exterior.length,
      wordLengths: lengths
    }
  },
  assignments: assignmentResults,
  directKeyStreamReadouts: {
    count: allReadouts.length,
    minimumIoC: minIoC,
    maximumIoC: maxIoC,
    bestThree: allReadouts.slice().sort((a, b) => b.ioc - a.ioc).slice(0, 3)
  },
  decision: 'Exact subgroup-length correspondence; the tested direct mod-29 key streams are nonprose, and the prime-weight log maps are not 29-symbol permutations.'
}, null, 2));
console.log('PASS: exact source partition, field orders, subgroup generators and bounded receiver gates');
