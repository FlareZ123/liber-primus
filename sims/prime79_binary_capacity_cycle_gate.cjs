'use strict';

/**
 * Key-independent 378-bit packet impossibility in the LP2 79/78 model.
 * A fixed unsigned n-bit binary payload n<=378 has leading base28 digit
 * <=8 in any 79-digit representation. For an arbitrary secret cyclic GP29
 * order, each leading transition moves 1..9 clockwise; a directed 3-cycle
 * has total step 29*k, but three such steps sum at most 27. Impossible.
 * For a secret fixed sorted GP29 order, at most 10 glyphs can lead.
 *
 * Node 22 CommonJS; no dependencies; execute manually.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const cipher = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);

const maxN378 = (1n << 378n) - 1n;
const radix28Place = 28n ** 78n;
assert.equal(maxN378 / radix28Place, 8n);
assert.ok((1n << 378n) < (29n ** 78n));
assert.ok((1n << 379n) > (29n ** 78n));

/**
 * @param {number[]} source 29-symbol ciphertext rune indices.
 * @param {number} phase Global 79-rune packet origin.
 * @param {boolean} reversed Whether packet radix digits are reversed.
 * @returns {{clean:number,leaderCount:number,triangleCount:number,
 *   firstTriangle:number[]|null,firstWitnessPositions:number[]|null}}
 */
function inspect(source, phase, reversed) {
  const adj = Array.from({length: 29}, () => new Map());
  const leaders = new Set();
  let clean = 0;
  for (let start = phase; start + 78 < source.length; start += 79) {
    if (start === 0) continue; // no previous symbol in linear transcription
    let intact = true;
    for (let i = start; i < start + 79; i++) {
      if (source[i] === source[i - 1]) {
        intact = false;
        break;
      }
    }
    if (!intact) continue; // generously erase entire repeat-bearing packet
    clean++;
    const i = reversed ? start + 78 : start;
    const prev = source[i - 1];
    const cur = source[i];
    if (!adj[prev].has(cur)) adj[prev].set(cur, i);
    leaders.add(cur);
  }
  let triangleCount = 0;
  let firstTriangle = null;
  let firstWitnessPositions = null;
  for (let a = 0; a < 29; a++) {
    for (const b of adj[a].keys()) {
      for (const d of adj[b].keys()) {
        if (a === b || b === d || d === a || a >= b || a >= d) continue;
        if (!adj[d].has(a)) continue;
        triangleCount++;
        if (firstTriangle === null) {
          firstTriangle = [a, b, d];
          firstWitnessPositions = [
            adj[a].get(b), adj[b].get(d), adj[d].get(a)
          ];
        }
      }
    }
  }
  return {
    clean, leaderCount: leaders.size, triangleCount,
    firstTriangle, firstWitnessPositions
  };
}

/** @returns {() => number} Fixed-seed uint32 generator. */
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
 * Four exact 378-bit positive plants: 163 complete packets at source phase35.
 * The secret rune order is independently randomized in each synthetic test.
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

  const ciphertext = [];
  const originals = [];
  let prev = alphabet[0];
  for (let j = 0; j < 35; j++) {
    prev = emit(prev, random() % 28);
    ciphertext.push(prev);
  }

  for (let block = 0; block < 163; block++) {
    let number = BigInt(random() % 4); // two leading bits
    for (let j = 0; j < 47; j++) {
      number = (number << 8n) | BigInt(random() % 256);
    }
    assert.ok(number <= maxN378);
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
      ciphertext.push(prev);
    }
  }
  while (ciphertext.length < 12956) {
    prev = emit(prev, random() % 28);
    ciphertext.push(prev);
  }
  assert.equal(ciphertext.length, 12956);

  for (let block = 0; block < originals.length; block++) {
    const start = 35 + 79 * block;
    const digits = [];
    for (let j = start; j < start + 79; j++) {
      digits.push(extract(ciphertext[j - 1], ciphertext[j]));
    }
    if (reversed) digits.reverse();
    let number = 0n;
    for (const d of digits) number = number * 28n + BigInt(d);
    assert.equal(number, originals[block]);
  }

  const profile = inspect(ciphertext, 35, reversed);
  assert.equal(profile.clean, 163);
  if (method === 'cyclic') assert.equal(profile.triangleCount, 0);
  else assert.ok(profile.leaderCount <= 10);
  return {method, reversed, packetsReenciphered: originals.length,
    leaders: profile.leaderCount, triangles: profile.triangleCount};
}

function main() {
  const cases = [];
  for (const reversed of [false, true]) {
    for (let phase = 0; phase < 79; phase++) {
      const record = {phase, reversed, ...inspect(cipher, phase, reversed)};
      assert.ok(record.clean > 0);
      assert.ok(record.triangleCount >= 1); // cyclic: no key can fit
      assert.ok(record.leaderCount > 10);   // sorted: no key can fit
      cases.push(record);
    }
  }
  assert.equal(cases.length, 158);
  const result = {
    source: 'original LP2 pages 0..55; p50 has no rune indices',
    originalRunes: cipher.length,
    digitCapacity: {maxInputBits: 378, maxFirstBase28Digit: 8,
      minInputBitsForUnrestricted78GP29Payload: 379,
      note: '2^378 < 29^78 < 2^379'},
    model: 'independent fixed-width unsigned binary integer to 78 base29 and 79 base28 digits, predecessor excluded, fixed hidden 29-symbol order',
    originalPhaseOrientationCases: cases.length,
    excludedCyclic: cases.filter((x) => x.triangleCount > 0).length,
    excludedSorted: cases.filter((x) => x.leaderCount > 10).length,
    minDirectedTrianglesPerCase: Math.min(...cases.map((x) => x.triangleCount)),
    minDistinctLeadersPerCase: Math.min(...cases.map((x) => x.leaderCount)),
    phase35: cases.filter((x) => x.phase === 35),
    positives: ['cyclic', 'sorted'].flatMap((method) =>
      [false, true].map((reversed) => positive(method, reversed))
    ),
    originalLP2PlaintextRecovered: false
  };
  assert.equal(result.excludedCyclic, 158);
  assert.equal(result.excludedSorted, 158);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) main();
module.exports = {inspect, positive, main};
