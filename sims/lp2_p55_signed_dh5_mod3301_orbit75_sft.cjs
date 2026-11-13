'use strict';
/**
 * P55 standalone 75-rune body: signed-DH base 5 under cuneiform modulus 3301.
 * Original-source, fully reversible finite GP29 candidates; no file writes.
 *
 * Run: node sims/lp2_p55_signed_dh5_mod3301_orbit75_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages[55].indices;
assert.equal(original.length, 76);
assert.equal(original[0], 21);
const payload = original.slice(1);
assert.equal(payload.length, 75);
assert.equal(corpus.prime.length, 29);

const base = 5;
const modulus = 3301;
let residue = 1;
const orbit = [];
do {
  orbit.push(residue);
  residue = residue * base % modulus;
  assert.ok(orbit.length <= 3300, 'group orbit exceeded modulus');
} while (residue !== 1);
assert.equal(orbit.length, 75);
assert.equal(new Set(orbit).size, 75);
assert.deepEqual(orbit.slice(0, 8), [1, 5, 25, 125, 625, 3125, 2421, 2202]);

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const rune of data) counts[rune]++;
  const numerator = counts.reduce((s, count) => s + count * (count - 1), 0);
  return numerator / (data.length * (data.length - 1));
}

/** @param {number[]} data @returns {string} */
function translit(data) {
  return data.map(code => corpus.translit[code]).join(' ');
}
/**
 * @param {'residue'|'quotient'} projection
 * @param {number} exponent
 * @returns {number[]}
 */
function pad(projection, exponent) {
  return payload.map((_, i) => {
    const state = orbit[(i + exponent) % 75];
    return projection === 'residue' ? state % 29 : Math.floor(state / 29) % 29;
  });
}

/** @param {number[]} source @param {number[]} key @param {number} sign */
function shift(source, key, sign) {
  return source.map((x, i) => (x + 29 + sign * key[i]) % 29);
}

/** @param {number[]} originalCipher @returns {number[]} */
function predecessor(originalCipher) {
  return originalCipher.slice(1).map((x, i) =>
    (x - originalCipher[i] + 29) % 29);
}

const clearPlant = corpus.pages[57].indices.slice(0, 75);
assert.equal(clearPlant.length, 75);
const sourceInverses = [];
for (const projection of ['residue', 'quotient']) {
  for (const exponent of [0, 1, 1033]) {
    const key = pad(projection, exponent);
    for (const sign of [-1, 1]) {
      const result = shift(payload, key, sign);
      assert.deepEqual(shift(result, key, -sign), payload);
      const plantedCipher = shift(clearPlant, key, -sign);
      assert.deepEqual(shift(plantedCipher, key, sign), clearPlant);
      sourceInverses.push({ projection, exponent, sign,
        ioc: ioc(result), first25: translit(result.slice(0, 25)) });
    }
  }
}
assert.equal(sourceInverses.length, 12);

const sortedIndices = Array.from({ length: 75 }, (_, i) => i)
  .sort((a, b) => orbit[a] - orbit[b]);
const transpositions = [];
for (const inverse of [false, true])
  for (const reverse of [false, true]) {
    const indices = reverse ? [...sortedIndices].reverse() : sortedIndices;
    const restored = Array(75);
    if (inverse) {
      for (let i = 0; i < 75; i++) restored[indices[i]] = payload[i];
    } else {
      for (let i = 0; i < 75; i++) restored[i] = payload[indices[i]];
    }
    const check = Array(75);
    if (inverse) {
      for (let i = 0; i < 75; i++) check[i] = restored[indices[i]];
    } else {
      for (let i = 0; i < 75; i++) check[indices[i]] = restored[i];
    }
    assert.deepEqual(check, payload);
    const diff = predecessor(restored);
    transpositions.push({ inverse, reverse, differenceIoc: ioc(diff),
      first25Difference: translit(diff.slice(0, 25)) });
  }

// The source's anti-doublet phenotype suggests a distinct lossless GP28
// predecessor-rank cipher. Its single exact repeat is a reserved GP marker.
/** @param {number[]} text @param {number} iv @returns {number[]} */
function rank28(text, iv) {
  let previous = iv;
  return text.map(current => {
    const rank = current === previous
      ? 28 : (current - previous + 28) % 29;
    previous = current;
    return rank;
  });
}
const printedRanks = rank28(payload, original[0]);
assert.equal(printedRanks.filter(x => x === 28).length, 1);
const rankInverses = [];
for (const projection of ['residue', 'quotient'])
  for (const exponent of [0, 1, 1033])
    for (const sign of [-1, 1]) {
      const key = payload.map((_, i) => {
        const state = orbit[(i + exponent) % 75];
        return projection === 'residue'
          ? state % 28 : Math.floor(state / 28) % 28;
      });
      const decoded = printedRanks.map((rank, i) =>
        rank === 28 ? 28 : (rank + sign * key[i] + 112) % 28);
      const reRank = decoded.map((value, i) =>
        value === 28 ? 28 : (value - sign * key[i] + 112) % 28);
      assert.deepEqual(reRank, printedRanks);
      rankInverses.push({ projection, exponent, sign,
        ioc: ioc(decoded), first25: translit(decoded.slice(0, 25)) });
    }
assert.equal(rankInverses.length, 12);
assert.ok(rankInverses.every(x => x.ioc < 0.05));

// Mathematically native DH-group consumer: project each GP *prime value*
// to the 75-element 5-subgroup with cofactor 3300/75 = 44, then take log_5.
/** @param {number} baseValue @param {number} exp @returns {number} */
function powerMod(baseValue, exp) {
  let result = 1;
  for (let x = baseValue % modulus, e = exp; e > 0;
    x = x * x % modulus, e = Math.floor(e / 2)) {
    if (e % 2) result = result * x % modulus;
  }
  return result;
}
const log5 = new Map(orbit.map((state, position) => [state, position]));
const symbolLabels = corpus.prime.map(prime => {
  const label = log5.get(powerMod(prime, 44));
  assert.ok(Number.isInteger(label));
  return label;
});
const labelSet = new Set(symbolLabels);
assert.equal(labelSet.size, 25);
const directGroupConsumers = [];
for (const exponent of [0, 1, 1033])
  for (const sign of [-1, 1]) {
    const recoveredLabels = payload.map((rune, i) =>
      (symbolLabels[rune] + sign * ((i + exponent) % 75) + 225) % 75);
    const eligible = recoveredLabels.filter(label => labelSet.has(label)).length;
    directGroupConsumers.push({ exponent, sign, eligible,
      total: recoveredLabels.length });
    assert.ok(eligible < recoveredLabels.length);
  }
assert.deepEqual(directGroupConsumers.map(x => x.eligible),
  [22, 31, 24, 15, 25, 21]);

const best = Math.max(...sourceInverses.map(x => x.ioc));
assert.ok(best < 0.05);
assert.ok(transpositions.every(x => x.differenceIoc < 0.05));
console.log(JSON.stringify({
  source: 'LP2 original physical p55',
  bodyRunes: 75, carryRune: original[0],
  independentSourceNumbers: [5, 3301],
  multiplicativeOrder: orbit.length,
  residueFirst16: orbit.slice(0, 16),
  originalBodyIoc: ioc(payload),
  solvedParablePlantIoc: ioc(clearPlant),
  sourceInverses, rankInverses, directGroupConsumers, transpositions
}, null, 2));
console.log('PASS: source-numeric orbit75 reproducible gate; no recovered plaintext');
