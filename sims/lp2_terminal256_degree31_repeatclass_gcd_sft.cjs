'use strict';

/**
 * Original LP2 p56 plaintext + p57 clear: all-field, all-GP-embedding exclusion
 * of direct degree-31 polynomial terminal codes at two source-readable orders.
 *
 * Any degree-31 P taking the common GP E label at 31 distinct x coordinates
 * must be E_value + a*product(x-E_root), a != 0. For two positions carrying
 * any other same GP symbol, their root products must agree modulo field
 * characteristic, irrespective of how that symbol and E were embedded.
 *
 * Run: node sims/lp2_terminal256_degree31_repeatclass_gcd_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-grid-256.json'), 'utf8'
));

/** @param {number} value @returns {number} */
const mod29 = value => ((value % 29) + 29) % 29;

/** @param {number} value @returns {number} */
const mod257 = value => ((value % 257) + 257) % 257;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}

/** @param {number[]} source @returns {number[]} */
function solvedP56(source) {
  assert.equal(source.length, 85);
  const primes = firstPrimes(84);
  let keyClock = 0;
  const out = source.map((cipher, i) => {
    if (i === 56) {
      assert.equal(cipher, 0);
      return 0;
    }
    const key = primes[keyClock++] - 1;
    const decoded = mod29(cipher - key);
    assert.equal(mod29(decoded + key), cipher);
    return decoded;
  });
  assert.equal(keyClock, 84);
  assert.deepEqual(out.slice(0, 5), [24, 9, 18, 9, 23]);
  return out;
}

/** @param {bigint} number @returns {bigint} */
const absolute = number => number < 0n ? -number : number;

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  a = absolute(a);
  b = absolute(b);
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/**
 * Once a proposed degree exactly equals the E multiplicity, the E roots
 * determine P(X)-E_value up to an unknown nonzero scalar. Equal occurrences
 * of any other rune must therefore have equal root-products in the field.
 *
 * The returned integer gcd divides every such repeated-class root-product
 * difference, so a viable prime characteristic MUST divide the gcd.
 *
 * No unknown p55 rune or numeric GP value for a non-E class is needed.
 *
 * @param {number[]} labels 180 known GP rune labels (or synthetic field values)
 * @param {number[]} positions 180 pairwise distinct integer x coordinates
 * @returns {{rootCount:number,duplicateConstraints:number,gcd:bigint}}
 */
function repeatClassObstruction(labels, positions) {
  assert.equal(labels.length, 180);
  assert.equal(positions.length, labels.length);
  assert.equal(new Set(positions).size, positions.length);
  const rootX = positions.filter((_, i) => labels[i] === 18)
    .map(BigInt);
  assert.equal(rootX.length, 31);
  /** @param {number} x @returns {bigint} */
  const rootProduct = x => rootX.reduce(
    (acc, r) => acc * (BigInt(x) - r), 1n
  );
  /** @type {Map<number,bigint>} */
  const firstByRune = new Map();
  let aggregate = 0n;
  let constraints = 0;
  for (let i = 0; i < labels.length; i++) {
    const rune = labels[i];
    if (rune === 18) continue;
    const evaluation = rootProduct(positions[i]);
    if (firstByRune.has(rune)) {
      aggregate = gcd(aggregate, evaluation - firstByRune.get(rune));
      constraints++;
    } else {
      firstByRune.set(rune, evaluation);
    }
  }
  assert(constraints > 0);
  return {rootCount:rootX.length, duplicateConstraints:constraints,
    gcd:aggregate};
}

/**
 * Evaluate one positive-control polynomial of degree31 over GF257, with
 * exactly the same E roots. Its other values can repeat freely, but all
 * resulting repeated-symbol root-product differences are divisible by257.
 *
 * @param {number[]} positions
 * @param {number[]} originalLabels
 * @returns {number[]}
 */
function plantedDegree31(positions, originalLabels) {
  const roots = positions.filter((_, i) => originalLabels[i] === 18);
  return positions.map(x => {
    const product = roots.reduce((a, rootX) => mod257(a * (x-rootX)), 1);
    return mod257(18 + 7*product);
  });
}

/** @param {bigint} value @returns {Record<string,number>} */
function smallPrimeFactors(value) {
  let remaining = value;
  /** @type {Record<string,number>} */
  const factors = {};
  for (let p = 2n; p*p <= remaining; p++) {
    if (remaining % p !== 0n) continue;
    let power = 0;
    do { remaining /= p; power++; } while (remaining % p === 0n);
    factors[String(p)] = power;
  }
  if (remaining > 1n) factors[String(remaining)] = 1;
  return factors;
}

const plaintext = [
  ...solvedP56(corpus.pages[56].indices), ...corpus.pages[57].indices
];
assert.equal(plaintext.length, 180);
assert.equal(grid.bytes.length, 256);
assert.equal(plaintext.filter(v => v === 18).length, 31);

// The table's 256 source integers include duplicates. Stable ascending
// sort (tie-break source cell index) yields a unique rank for every cell.
const orderedSourceIndices = Array.from({length:256},(_,i)=>i)
  .sort((a,b)=>grid.bytes[a]-grid.bytes[b] || a-b);
const tableRank = new Array(256);
orderedSourceIndices.forEach((originalIndex, ascendingRank) => {
  tableRank[originalIndex] = ascendingRank;
});
assert.equal(new Set(tableRank).size, 256);

const variants = [
  {name:'printed terminal rune order x=76..255',
    positions:Array.from({length:180},(_,j)=>76+j),
    gcdExpected:18962192793600000n,
    primeFactorsExpected:{"2":21,"3":10,"5":5,"7":2}},
  {name:'stable ascending table-byte rank at printed terminal slots',
    positions:tableRank.slice(76),
    gcdExpected:2528292372480000n,
    primeFactorsExpected:{"2":22,"3":9,"5":4,"7":2}}
];

for (const variant of variants) {
  const original = repeatClassObstruction(plaintext, variant.positions);
  assert.equal(original.gcd, variant.gcdExpected);
  assert.deepEqual(smallPrimeFactors(original.gcd),
    variant.primeFactorsExpected);

  // Since no p>=257 divides the exact integer gcd, no degree31 polynomial
  // can realize this original symbol-equality pattern under these integer
  // coordinates in any field with prime characteristic>=257. The proof
  // admits ANY fixed injective assignment of GP symbols to field elements.
  assert(Object.keys(smallPrimeFactors(original.gcd))
    .every(p => Number(p)<257));

  const plant = plantedDegree31(variant.positions, plaintext);
  assert.equal(plant.filter(v=>v===18).length, 31);
  const control = repeatClassObstruction(plant, variant.positions);
  assert.equal(control.gcd % 257n, 0n);

  console.log(JSON.stringify({
    originalPositions:variant.name,
    E:original.rootCount,
    independentDuplicateChecks:original.duplicateConstraints,
    integerGcd:String(original.gcd),
    primeFactors:smallPrimeFactors(original.gcd),
    anyPrimeCharacteristicAtLeast257Possible:false,
    injectiveGpRelabelingCanRescue:false,
    degree31PlantPasses:true
  }));
}

console.log('PASS: degree31 terminal polynomial excluded in original and table-rank orders for all field characteristics>=257 and all injective GP encodings; planted degree31 polynomial passes.');
