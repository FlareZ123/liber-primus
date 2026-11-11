'use strict';

/**
 * 2013 telnet extra-space prime-interval -> original LP2 225 red runes.
 *
 * Archived secondary telnet witness has surplus spaces between primes
 * 29/31 and 3257/3259. Their inclusive underlying p11..p460 interval
 * contains 450 primes, including 180 missing from the visible telnet output.
 * LP2 contains 225 red runes in canonical printed page/rune order.
 *
 * For each two-prime pair, grant ANY coefficients a,b mod29 and ANY unknown
 * stationary output substitution f: F29 -> 29 LP2 rune labels (not required
 * bijective). Maximize exact source-rune matches without guessing f.
 *
 * This program makes no claim that the historical extra spaces were authored
 * deliberately or that a prime-pair operation was a cipher instruction.
 *
 * Manual SFT: node sims/telnet2013_spaced450_red225_affine_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');

/** @param {number} count How many ordinary primes to produce. */
function primes(count) {
  const out = [];
  for (let k = 2; out.length < count; k++) {
    let prime = true;
    for (let div = 2; div * div <= k; div++) {
      if (k % div === 0) { prime = false; break; }
    }
    if (prime) out.push(k);
  }
  return out;
}

const p = primes(464);
assert.deepEqual(p.slice(9, 11), [29, 31]);
assert.deepEqual(p.slice(459, 461), [3257, 3259]);
assert.deepEqual(p.slice(19, 22), [71, 73, 79]);
assert.deepEqual(p.slice(199, 202), [1223, 1229, 1231]);
assert.equal(p.slice(20, 200).length, 180);
const primeRange = p.slice(10, 460); // p11..p460 inclusive
assert.equal(primeRange.length, 450);

const red = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    for (let i = span.start; i < span.start + span.length; i++) {
      red.push(corpus.pages[page.page].indices[i]);
    }
  }
}
assert.equal(red.length, 225);
assert.equal(primeRange.length, 2 * red.length);

/** Maximize exact matches over all f, including non-bijective f.
 * @param {number[]} pairValues Exactly 450 source primes, in declared order.
 * @param {number[]} observed Exactly 225 GP ordinal rune values.
 * @returns {object} Best over a,b and an arbitrary stationary f.
 */
function maximumLookup(pairValues, observed) {
  assert.equal(pairValues.length, 450);
  assert.equal(observed.length, 225);
  let best = -1;
  let bestCoefficients = [];
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      // Each input residue's output can be chosen independently and even
      // non-injectively, making this an upper bound for any substitution.
      const count = Array.from({length: 29}, () => new Uint16Array(29));
      for (let i = 0; i < 225; i++) {
        const z = (a * pairValues[2 * i] + b * pairValues[2 * i + 1]) % 29;
        count[z][observed[i]]++;
      }
      let matches = 0;
      for (const row of count) matches += Math.max(...row);
      if (matches > best) {
        best = matches;
        bestCoefficients = [{a, b}];
      } else if (matches === best) bestCoefficients.push({a, b});
    }
  }
  return {best, optimizers: bestCoefficients.length,
    witness: bestCoefficients[0]};
}

/**
 * Full exact inversion for unknown stationary affine output f(z)=13*z+7.
 * The test optimizer is strictly more permissive than the planted family.
 */
function positiveControl() {
  const planted = Array.from({length:225}, (_,i) => {
    const x = (9 * primeRange[2*i] + 3 * primeRange[2*i+1]) % 29;
    return (13 * x + 7) % 29;
  });
  const found = maximumLookup(primeRange, planted);
  assert.equal(found.best, 225);
  return found;
}

function main() {
  const decisions = [];
  for (const redOrder of ['printed', 'reversed'])
  for (const primeOrder of ['ascending', 'descending']) {
    const seen = redOrder === 'printed' ? red : red.slice().reverse();
    const keys = primeOrder === 'ascending' ? primeRange : primeRange.slice().reverse();
    decisions.push({redOrder, primeOrder, ...maximumLookup(keys,seen)});
  }
  assert.deepEqual(decisions.map(x=>x.best), [55,53,53,55]);
  const plant = positiveControl();
  console.log(JSON.stringify({
    interpretation:'secondary 2013 telnet spacings; source intent unproven',
    sourcePrimeInterval:'p11..p460 inclusive (31..3257)',
    sourceMissingPrimeCount:180,
    underlyingPrimeCount:primeRange.length,
    observedRedRuneCount:red.length,
    family:'a*p_(2i)+b*p_(2i+1) mod29; arbitrary stationary f; all a,b',
    coefficientPairs:29*29,
    explicitOutputSubstitutions:'optimally chosen, even non-bijective; no search bound',
    decisions,
    syntheticPlant:{best:plant.best,optimizers:plant.optimizers},
    implication:'Every tested orientation has >=170 exact mismatches; no direct pair-affine global substitution',
    plaintextRecovered:false
  },null,2));
}
if(require.main===module)main();
module.exports={primes,maximumLookup,positiveControl,main};
