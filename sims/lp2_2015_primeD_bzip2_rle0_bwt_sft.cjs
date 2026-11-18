'use strict';
/**
 * Source-typed inverse of the bzip2 RUNA/RUNB zero-run stage, followed by
 * move-to-front decoding and circular Burrows-Wheeler LF-cycle adjudication.
 *
 * Original input: 2015 participant prime-then-difference D on LP2 p0-p2.
 * Historical motivation: 2014 Cicada bzip2 precedent; the 2015 D remains
 * a participant-proposed register, not a Cicada-authenticated opcode.
 *
 * This checks precisely the bzip2-style 0/1 zero-run alphabet with 28
 * remaining GP states, in one 729-symbol source block and three original
 * physical-page blocks. There is no invented alphabet, BWT primary row,
 * arbitrary secret key, or fitted source data.
 *
 * Read-only SFT: node sims/lp2_2015_primeD_bzip2_rle0_bwt_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 2);
assert.deepEqual(pages.map(p => p.indices.length), [262, 266, 201]);
const ciphertext = pages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 729);

/** @param {number} count @returns {number[]} */
function primesUpToCount(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
/** @param {number} value @returns {number} */
function mod29(value) { return (value % 29 + 29) % 29; }

/**
 * Reversible published participant operation.
 * @param {number[]} original
 * @returns {number[]}
 */
function primeDifference(original) {
  const primes = primesUpToCount(original.length + 1);
  let precedingShifted = 27; // historical S[-1] = -2 modulo29
  return original.map((value, i) => {
    const shifted = mod29(value - primes[i + 1]);
    const difference = mod29(shifted - precedingShifted);
    precedingShifted = shifted;
    return difference;
  });
}
/** @param {number[]} differences @returns {number[]} */
function reversePrimeDifference(differences) {
  const primes = primesUpToCount(differences.length + 1);
  let precedingShifted = 27;
  return differences.map((difference, i) => {
    const shifted = mod29(precedingShifted + difference);
    precedingShifted = shifted;
    return mod29(shifted + primes[i + 1]);
  });
}

/**
 * Standard bzip2 RLE2 + MTF inverse with RUNA=0 and RUNB=1. The 29 input
 * symbols encode zero runs and positive MTF ranks 1..27 over 28 symbols.
 * In a real bzip2 packet there is also an EOB; no such framed packet is
 * present in the 2015 D register. The framing-free variant is conditional.
 * @param {number[]} encoded
 * @returns {{lastColumn:number[], runGroups:number, totalZeroRanks:number}}
 */
function decodeRunaRunbMtf(encoded) {
  const mtf = Array.from({ length: 28 }, (_, i) => i);
  const lastColumn = [];
  let runGroups = 0, totalZeroRanks = 0;
  for (let i = 0; i < encoded.length;) {
    if (encoded[i] <= 1) {
      let factor = 1, repeat = 0;
      do {
        repeat += (encoded[i] + 1) * factor;
        factor *= 2;
        i++;
      } while (i < encoded.length && encoded[i] <= 1);
      runGroups++;
      totalZeroRanks += repeat;
      for (let j = 0; j < repeat; j++) lastColumn.push(mtf[0]);
    } else {
      const rank = encoded[i++] - 1;
      assert(rank >= 1 && rank < 28);
      const symbol = mtf[rank];
      lastColumn.push(symbol);
      mtf.splice(rank, 1);
      mtf.unshift(symbol);
    }
  }
  return { lastColumn, runGroups, totalZeroRanks };
}

/**
 * Matched forward encoder for synthetic tests. Inverse of RLE2 and MTF,
 * except that it deliberately omits the bzip2 packet EOB.
 * @param {number[]} lastColumn
 * @returns {number[]}
 */
function encodeRunaRunbMtf(lastColumn) {
  const mtf = Array.from({ length: 28 }, (_, i) => i);
  const ranks = lastColumn.map(symbol => {
    const rank = mtf.indexOf(symbol);
    assert(rank >= 0);
    mtf.splice(rank, 1);
    mtf.unshift(symbol);
    return rank;
  });
  const encoded = [];
  for (let i = 0; i < ranks.length;) {
    if (ranks[i] === 0) {
      let run = 0;
      while (i < ranks.length && ranks[i] === 0) { run++; i++; }
      while (run > 0) {
        if (run & 1) {
          encoded.push(0);
          run = (run - 1) / 2;
        } else {
          encoded.push(1);
          run = (run - 2) / 2;
        }
      }
    } else {
      encoded.push(ranks[i++] + 1);
    }
  }
  return encoded;
}

/**
 * @param {number[]} lastColumn
 * @returns {{lengths:number[], lf:number[]}}
 */
function lfDecomposition(lastColumn) {
  const frequencies = new Int32Array(28);
  for (const symbol of lastColumn) frequencies[symbol]++;
  const bases = new Int32Array(28);
  let cumulative = 0;
  for (let i = 0; i < 28; i++) {
    bases[i] = cumulative;
    cumulative += frequencies[i];
  }
  const ranks = new Int32Array(28);
  const lf = lastColumn.map(symbol => bases[symbol] + ranks[symbol]++);
  const seen = new Uint8Array(lastColumn.length);
  const lengths = [];
  for (let start = 0; start < lf.length; start++) {
    if (seen[start]) continue;
    let current = start, length = 0;
    while (!seen[current]) {
      seen[current] = 1;
      current = lf[current];
      length++;
    }
    lengths.push(length);
  }
  lengths.sort((a, b) => b - a);
  return { lengths, lf };
}

/**
 * Circular BWT, with no sentinel. Fully reproducible for the positive plant.
 * @param {number[]} plaintext
 * @returns {{column:number[], primary:number}}
 */
function forwardCircularBwt(plaintext) {
  const n = plaintext.length;
  const rotations = Array.from({length:n}, (_, i) => i);
  rotations.sort((left, right) => {
    for (let i = 0; i < n; i++) {
      const a = plaintext[(left + i) % n];
      const b = plaintext[(right + i) % n];
      if (a !== b) return a - b;
    }
    return left - right;
  });
  return {
    column: rotations.map(i => plaintext[(i + n - 1) % n]),
    primary: rotations.indexOf(0)
  };
}
/**
 * @param {number[]} column
 * @param {number} primary
 * @returns {number[]}
 */
function inverseCircularBwt(column, primary) {
  const lf = lfDecomposition(column).lf;
  const output = Array(column.length);
  let row = primary;
  for (let i = column.length - 1; i >= 0; i--) {
    output[i] = column[row];
    row = lf[row];
  }
  assert.equal(row, primary);
  return output;
}

const D = primeDifference(ciphertext);
assert.deepEqual(reversePrimeDifference(D), ciphertext);
assert.equal(D.reduce((n, x, i) => n + Number(i > 0 && x === D[i-1]), 0), 40);
const continuous = decodeRunaRunbMtf(D);
assert.equal(continuous.lastColumn.length, 750);
assert.equal(continuous.runGroups, 42);
assert.equal(continuous.totalZeroRanks, 63);
assert.deepEqual(lfDecomposition(continuous.lastColumn).lengths,
  [247, 206, 152, 76, 62, 4, 3]);
assert.deepEqual(encodeRunaRunbMtf(continuous.lastColumn), D);

const pageDecodes = [];
let cursor = 0;
for (const page of pages) {
  const fragment = D.slice(cursor, cursor + page.indices.length);
  const decoded = decodeRunaRunbMtf(fragment);
  const cycles = lfDecomposition(decoded.lastColumn).lengths;
  assert.deepEqual(encodeRunaRunbMtf(decoded.lastColumn), fragment);
  pageDecodes.push({page:page.page, codeLength:fragment.length,
    lastColumnLength:decoded.lastColumn.length, lfCycles:cycles});
  cursor += page.indices.length;
}
assert.deepEqual(pageDecodes.map(p => p.lastColumnLength), [267, 275, 208]);
assert.deepEqual(pageDecodes.map(p => p.lfCycles), [
  [228, 10, 10, 6, 5, 3, 2, 1, 1, 1],
  [160, 75, 30, 9, 1], [152, 23, 16, 9, 4, 3, 1]
]);

// The incidental 76-row cycle is not a stationary GP29 relabeling of the
// printed 76-rune terminal p55 ciphertext, under any rotation or reversal.
// A bijection preserves the entire sorted multiplicity signature.
const permutation = lfDecomposition(continuous.lastColumn).lf;
const visited = new Uint8Array(permutation.length);
const orbits = [];
for (let start = 0; start < permutation.length; start++) {
  if (visited[start]) continue;
  const members = [];
  let row = start;
  while (!visited[row]) {
    visited[row] = 1;
    members.push(continuous.lastColumn[row]);
    row = permutation[row];
  }
  orbits.push(members);
}
const member76 = orbits.find(o => o.length === 76);
assert(member76);
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(p55.length, 76);
/** @param {number[]} values @returns {number[]} */
function sortedMultiplicity(values) {
  const counts = new Int32Array(29);
  for (const symbol of values) counts[symbol]++;
  return [...counts].sort((a, b) => b - a);
}
const cyclic76Signature = sortedMultiplicity(member76);
const p55Signature = sortedMultiplicity(p55);
assert.deepEqual(cyclic76Signature.slice(0, 4), [7, 7, 5, 5]);
assert.deepEqual(p55Signature.slice(0, 4), [6, 5, 5, 5]);
assert.notDeepEqual(cyclic76Signature, p55Signature);

// Source-GP positive: the already-clear 95-rune p57 passage repeated to
// a 729-rune primitive text. It never uses GP index28, matching the exact
// twenty-eight-symbol alphabet of this particular packet-free receiver.
const clear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
assert(clear.every(x => x >= 0 && x < 28));
const native = Array.from({length:729}, (_, i) => clear[i % clear.length]);
const plantedBwt = forwardCircularBwt(native);
assert.deepEqual(lfDecomposition(plantedBwt.column).lengths, [729]);
const plantedD = encodeRunaRunbMtf(plantedBwt.column);
const plantedCipher = reversePrimeDifference(plantedD);
assert.deepEqual(primeDifference(plantedCipher), plantedD);
const recovered = decodeRunaRunbMtf(primeDifference(plantedCipher));
assert.deepEqual(recovered.lastColumn, plantedBwt.column);
assert.deepEqual(inverseCircularBwt(recovered.lastColumn, plantedBwt.primary), native);

console.log(JSON.stringify({
  verdict: 'Original 2015 D is NOT a complete keyless bzip2-RLE2/MTF/circular-BWT column',
  evidenceClass: 'conditional historical receiver; no unknown LP2 plaintext',
  original: {
    firstStageRunes: D.length,
    expandedSymbols: continuous.lastColumn.length,
    runGroups: continuous.runGroups,
    expandedZeroRanks: continuous.totalZeroRanks,
    cycles: lfDecomposition(continuous.lastColumn).lengths,
    pageDecodes,
    incidental76CycleSameAsP55: false
  },
  nativePositive: {
    originalGpRunes: native.length,
    encodedRunaRunbSymbols: plantedD.length,
    recoveredGpRunes: recovered.lastColumn.length,
    primary: plantedBwt.primary,
    exact: true
  }
}, null, 2));