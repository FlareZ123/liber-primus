"use strict";
/**
 * An exact key-independent 79-packet checksum sieve over GF(79).
 *
 * Any fixed nonconstant embedding f of 29 GP rune values in GF(79) that
 * satisfies sum_i f(C_i) = fixed b for every intact 79-rune packet must be
 * a nonconstant vector in the kernel of the between-packet count differences.
 * The constant vector is always in that kernel because every packet has
 * length 79. Rank 28 proves no other vector exists, for any possible
 * (including noninjective) f and any constant b.
 *
 * Run all 79 global block origins, synthetic planted unknown-f control,
 * preserve enough details for independent reproduction.
 *
 * @module prime79_glyph_checksum_rank
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = 79, ALPHABET = 29;

/** @param {number} number @returns {number} */
function inv(number) {
  assert(number > 0 && number < P);
  let value = 1;
  for (let i = 0; i < P - 2; i++) value = value * number % P;
  assert.equal(value * number % P, 1);
  return value;
}

/**
 * Row reduce a matrix over the finite field GF(79).
 * @param {number[][]} input
 * @returns {number}
 */
function rank(input) {
  const a = input.map(row => row.slice());
  let row = 0;
  for (let col = 0; col < ALPHABET && row < a.length; col++) {
    let pivot = row;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[row], a[pivot]] = [a[pivot], a[row]];
    const scale = inv(a[row][col]);
    for (let j = col; j < ALPHABET; j++) a[row][j] = a[row][j] * scale % P;
    for (let k = row + 1; k < a.length; k++) {
      const factor = a[k][col];
      if (!factor) continue;
      for (let j = col; j < ALPHABET; j++) {
        a[k][j] = ((a[k][j] - factor * a[row][j]) % P + P) % P;
      }
    }
    row++;
  }
  return row;
}

/** @returns {number[]} */
function original() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const runes = corpus.pages.filter(page => page.page < 56).flatMap(page => page.indices);
  assert.equal(runes.length, 12956);
  return runes;
}

/**
 * @param {number[]} source Original unbroken GP index stream
 * @param {number} phase
 * @returns {number[][]} Glyph-occurrence vectors, one per complete 79-rune packet.
 */
function blockRows(source, phase) {
  const rows = [];
  for (let start = phase; start + 79 <= source.length; start += 79) {
    const row = Array(ALPHABET).fill(0);
    for (let j = start; j < start + 79; j++) row[source[j]]++;
    rows.push(row);
  }
  return rows;
}

/**
 * @param {number[][]} rows
 * @returns {number}
 */
function constantChecksumRank(rows) {
  assert(rows.length > ALPHABET);
  // An unknown constant target b is removed by subtracting the first packet.
  const first = rows[0];
  return rank(rows.slice(1).map(row => row.map((value, index) =>
    ((value - first[index]) % P + P) % P)));
}

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @returns {object} */
function positiveControl() {
  const next = random(0x79993301);
  // Secret injective alphabet, unavailable to the test statistic.
  const weights = Array.from({length: ALPHABET}, (_, i) => (2*i+7)%P);
  const inverseWeights = new Map(weights.map((value, i) => [value, i]));
  const source = [], blocks = 100;
  for (let block = 0; block < blocks; block++) {
    let found = false;
    while (!found) {
      const packet = Array.from({length: 78}, () => next() % ALPHABET);
      const target = (P - packet.reduce((sum, rune) => sum + weights[rune], 0) % P) % P;
      const last = inverseWeights.get(target);
      if (last === undefined) continue;
      packet.push(last);
      assert.equal(packet.reduce((sum, rune) => sum + weights[rune], 0) % P, 0);
      source.push(...packet);
      found = true;
    }
  }
  const rows = blockRows(source, 0);
  const observed = constantChecksumRank(rows);
  assert(observed <= ALPHABET - 2);
  return {blocks, hidden_nonconstant_injective_field_mapping: true,
    exact_original_checksum_roundtrip: true,
    rank: observed, nullity: ALPHABET - observed};
}

/** @returns {object} */
function main() {
  const source = original();
  const positive = positiveControl();
  const results = Array.from({length:79}, (_, phase) => {
    const rows = blockRows(source, phase);
    const r = constantChecksumRank(rows);
    return {phase, blocks: rows.length, rank: r, kernel_dimension: ALPHABET-r};
  });
  assert(results.every(x => x.rank === 28));
  return {
    source_runes: source.length,
    prime_field:79,
    packet_length:79,
    unknowns:29,
    proposition:"Every fixed GP-glyph-to-GF79 map with a constant sum across packets must be constant; no nonconstant injective map exists under any of the 79 global packet phases.",
    phases_tested:79,
    minimum_rank:Math.min(...results.map(x=>x.rank)),
    maximum_rank:Math.max(...results.map(x=>x.rank)),
    positive,
    results
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2)+"\n");
module.exports = {rank, original, blockRows, constantChecksumRank, positiveControl, main};
