'use strict';

/**
 * Exact source-original obstruction to packing a fixed unsigned 47-byte
 * binary integer as 79 predecessor-excluding base-28 output digits.
 * Node 22, CommonJS, no dependencies, manually executed.
 *
 * The first digit is at most 2 because 2^376-1 < 3*28^78.
 * A fixed secret cyclic GP29 order therefore gives any preceding rune
 * at most three distinct next glyphs at packet-leading transitions.
 * Under a fixed sorted GP29 order, the leading glyph must be one of the
 * first four symbols of that order (the predecessor might be removed).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const ciphertext = corpus.pages
  .filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);

/**
 * @param {number[]} cipher
 * @param {number} phase Global packet origin in 0..78.
 * @param {boolean} reversed Read packet digits in reverse order.
 * @returns {{clean:number,maxOut:number,distinctLeaders:number}}
 */
function inspect(cipher, phase, reversed) {
  const successors = Array.from({length: 29}, () => new Set());
  const leaders = new Set();
  let clean = 0;
  for (let start = phase; start + 78 < cipher.length; start += 79) {
    if (start === 0) continue; // predecessor not supplied at index -1
    let intact = true;
    for (let j = start; j < start + 79; j++) {
      if (cipher[j] === cipher[j - 1]) {
        intact = false;
        break;
      }
    }
    if (!intact) continue; // grant the model every repeat-bearing erasure
    clean++;
    const j = reversed ? start + 78 : start;
    successors[cipher[j - 1]].add(cipher[j]);
    leaders.add(cipher[j]);
  }
  return {
    clean,
    maxOut: Math.max(...successors.map((set) => set.size)),
    distinctLeaders: leaders.size
  };
}

/** @returns {() => number} Deterministic uint32 generator. */
function randomGenerator() {
  let x = 0x23094779;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Blind positive for all four order/direction types, using a hidden random
 * 29-glyph order and 163 independent 47-byte integer packets at phase 35.
 * @param {'cyclic'|'sorted'} method
 * @param {boolean} reversed
 */
function positive(method, reversed) {
  const random = randomGenerator();
  const alphabet = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  const rank = Array(29);
  alphabet.forEach((r, i) => { rank[r] = i; });

  const emit = (previous, digit) => method === 'cyclic'
    ? alphabet[(rank[previous] + digit + 1) % 29]
    : alphabet[digit >= rank[previous] ? digit + 1 : digit];
  const extract = (previous, current) => method === 'cyclic'
    ? (rank[current] - rank[previous] + 28) % 29
    : rank[current] - Number(rank[previous] < rank[current]);

  const cipher = [];
  const originals = [];
  let prev = alphabet[0];
  for (let j = 0; j < 35; j++) {
    prev = emit(prev, random() % 28);
    cipher.push(prev);
  }
  for (let block = 0; block < 163; block++) {
    let number = 0n;
    for (let j = 0; j < 47; j++) {
      number = (number << 8n) + BigInt(random() % 256);
    }
    originals.push(number);
    const digits = Array(79).fill(0);
    let rest = number;
    for (let j = 78; j >= 0; j--) {
      digits[j] = Number(rest % 28n);
      rest /= 28n;
    }
    assert.equal(rest, 0n);
    if (reversed) digits.reverse();
    for (const digit of digits) {
      prev = emit(prev, digit);
      cipher.push(prev);
    }
  }
  while (cipher.length < 12956) {
    prev = emit(prev, random() % 28);
    cipher.push(prev);
  }

  for (let block = 0; block < originals.length; block++) {
    const start = 35 + 79 * block;
    const digits = [];
    for (let j = start; j < start + 79; j++) {
      digits.push(extract(cipher[j - 1], cipher[j]));
    }
    if (reversed) digits.reverse();
    let recovered = 0n;
    for (const d of digits) recovered = recovered * 28n + BigInt(d);
    assert.equal(recovered, originals[block]);
  }

  const profile = inspect(cipher, 35, reversed);
  assert.equal(profile.clean, 163);
  if (method === 'cyclic') assert.ok(profile.maxOut <= 3);
  else assert.ok(profile.distinctLeaders <= 4);
  return {method, reversed, packetsReenciphered: originals.length, ...profile};
}

function main() {
  const profiles = [];
  for (const reversed of [false, true]) {
    for (let phase = 0; phase < 79; phase++) {
      const profile = inspect(ciphertext, phase, reversed);
      assert.ok(profile.clean >= 1);
      assert.ok(profile.maxOut > 3);
      assert.ok(profile.distinctLeaders > 4);
      profiles.push({phase, reversed, ...profile});
    }
  }
  const summary = {
    source: 'original LP2 physical pages 0..55, rune-free p50 omitted',
    cipherRunes: ciphertext.length,
    model: 'each 79-digit predecessor-excluding base28 packet represents an independent unsigned 47-byte integer',
    packetOrientations: profiles.length,
    casesExcludedCyclic: profiles.filter((x) => x.maxOut > 3).length,
    casesExcludedSorted: profiles.filter((x) => x.distinctLeaders > 4).length,
    minMaxOut: Math.min(...profiles.map((x) => x.maxOut)),
    minDistinctLeaders: Math.min(...profiles.map((x) => x.distinctLeaders)),
    phase35: profiles.filter((x) => x.phase === 35),
    positives: ['cyclic', 'sorted'].flatMap((m) =>
      [false, true].map((reversed) => positive(m, reversed))
    ),
    unknownLP2PlaintextRecovered: false
  };
  assert.equal(summary.casesExcludedCyclic, 158);
  assert.equal(summary.casesExcludedSorted, 158);
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

if (require.main === module) main();
module.exports = {inspect, positive, main};
