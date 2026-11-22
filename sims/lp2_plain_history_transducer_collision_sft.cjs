'use strict';

/**
 * Every finite deterministic plaintext-history transducer must preserve
 * overlapping n-gram equality implications. Original LP2, 55 page clocks.
 *
 * Run: node sims/lp2_plain_history_transducer_collision_sft.cjs
 *
 * Model: C_i = F_page(P_(i-q),...,P_i), q=1..8, with any secret,
 * possibly nonlinear output map, even a separate table on each page.
 * At least q preceding plaintext symbols must be available within the page.
 *
 * Identical plaintext windows of length q+n force identical ciphertext
 * windows of length n, for the source-comparable positions. Accordingly
 * E_q+n(plaintext) <= E_n(ciphertext), where E counts unordered pairs
 * of identical overlapping windows within each page.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const pageLengths = pages.map((p) => p.indices.length);
const original = pages.flatMap((p) => p.indices);
const N = 12956;
assert.equal(original.length, N);
assert.equal(pages.length, 55);
assert.deepEqual([pageLengths[0], pageLengths.at(-1)], [262, 76]);

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} source @returns {number[]} */
function encodeNativeGp(source) {
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      assert(token, 'Unmapped source grapheme');
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}

/**
 * Exact collision count across independently reset source pages.
 * Cipher starts at page-relative 1 or later, granting the q leading
 * initialization runes to all tested histories. The cipher comparison
 * intentionally uses more starts than q>=2 needs, an upper bound.
 * @param {number[]} source
 * @param {number} length
 * @param {number} skip
 */
function windowEqualPairs(source, length, skip = 0, phasePeriod = 0) {
  let total = 0;
  let offset = 0;
  for (const pageLength of pageLengths) {
    const counts = new Map();
    for (let i = skip; i + length <= pageLength; i++) {
      const symbolWindow = (phasePeriod ? i % phasePeriod + ':' : '') +
        source.slice(offset + i, offset + i + length).join(',');
      counts.set(symbolWindow, (counts.get(symbolWindow) || 0) + 1);
    }
    for (const count of counts.values()) total += count * (count - 1) / 2;
    offset += pageLength;
  }
  assert.equal(offset, N);
  return total;
}

// One four-rune source collision occurs on original page 7 at local
// starts 91 and 170; excluding the initial rune on all pages leaves one.
assert.equal(windowEqualPairs(original, 3, 1), 55);
assert.equal(windowEqualPairs(original, 4, 1), 1);
assert.equal(windowEqualPairs(original, 5, 1), 0);
assert.equal(windowEqualPairs(original, 4, 1, 8), 0);
const originalFour = windowEqualPairs(original, 4, 1);

const controls = [
  {
    label: 'Shakespeare',
    path: 'resources/control/shakespeare_first300k.txt',
    runes: 218800,
    windows: 32,
    min11: 13,
    min12: 6,
    minPhase7: 6
  },
  {
    label: 'Gibran',
    path: 'resources/control/gibran_prophet_58585.txt',
    runes: 63114,
    windows: 8,
    min11: 64,
    min12: 48,
    minPhase7: 12
  },
  {
    label: 'Emerson',
    path: 'resources/control/emerson_essays_2944.txt',
    runes: 324630,
    windows: 49,
    min11: 2,
    min12: 0,
    minPhase7: 2
  }
];

let sourcePlant = null;
const summaries = [];
for (const control of controls) {
  const gp = encodeNativeGp(read(control.path));
  assert.equal(gp.length, control.runes);
  const eleven = [];
  const twelve = [];
  const phaseSeven = [];
  for (let start = 0; start + N <= gp.length; start += Math.floor(N / 2)) {
    const window = gp.slice(start, start + N);
    if (sourcePlant === null) sourcePlant = window;
    eleven.push(windowEqualPairs(window, 11));
    twelve.push(windowEqualPairs(window, 12));
    phaseSeven.push(windowEqualPairs(window, 7, 0, 8));
  }
  assert.equal(eleven.length, control.windows);
  assert.equal(twelve.length, control.windows);
  assert.equal(Math.min(...eleven), control.min11);
  assert.equal(Math.min(...twelve), control.min12);
  assert.equal(Math.min(...phaseSeven), control.minPhase7);
  assert(phaseSeven.every((count) => count > 0));
  assert(eleven.every((count) => count > originalFour));
  summaries.push({
    author: control.label,
    windows: control.windows,
    minimumPlain11CollisionPairs: Math.min(...eleven),
    minimumPlain12CollisionPairs: Math.min(...twelve),
    minimumPhase8Plain7CollisionPairs: Math.min(...phaseSeven),
    originalCipher4CollisionPairs: originalFour
  });
}
assert.equal(summaries.reduce((s, x) => s + x.windows, 0), 89);

// Reversible source-native plant with *independent* arbitrary secret
// per-page row permutations at each seven-symbol plaintext history.
// The model's huge key space is not searched. It cannot evade the
// collision theorem because its output is deterministic for its input.
let seed = 0x33017213;
/** @returns {number} */
function randomUint32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
function randomPermutation() {
  const p = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const rows = new Map();
/** @param {number} page @param {number[]} state */
function getRow(page, state) {
  const key = page + ':' + state.join(',');
  let row = rows.get(key);
  if (!row) {
    row = randomPermutation();
    rows.set(key, row);
  }
  return row;
}
const encrypted = [];
const decrypted = [];
let offset = 0;
for (let page = 0; page < pageLengths.length; page++) {
  const len = pageLengths[page];
  const plain = sourcePlant.slice(offset, offset + len);
  const cipher = [];
  const recovered = [];
  for (let i = 0; i < len; i++) {
    if (i < 7) {
      cipher.push(plain[i]);
      recovered.push(plain[i]);
      continue;
    }
    const cipherRow = getRow(page, plain.slice(i - 7, i));
    cipher.push(cipherRow[plain[i]]);
    const inverseRow = getRow(page, recovered.slice(i - 7, i));
    recovered.push(inverseRow.indexOf(cipher[i]));
  }
  assert.deepEqual(recovered, plain);
  encrypted.push(...cipher);
  decrypted.push(...recovered);
  offset += len;
}
assert.equal(offset, N);
assert.deepEqual(decrypted, sourcePlant);
assert(windowEqualPairs(encrypted, 4, 1) >= windowEqualPairs(sourcePlant, 11));

// Additional source-visible clock: the original 32x8 printed table fixes
// the candidate period 8. Give each physical page and each of its eight
// phases independent secret rows, and let the previous three plaintext runes
// control the row. Repeated same-phase plaintext 7-grams still force equal
// same-phase ciphertext 4-grams for every unknown secret.
let phaseSeed = 0x33017213;
const phaseRows = new Map();
function phaseRandom() {
  phaseSeed = (Math.imul(phaseSeed, 1664525) + 1013904223) >>> 0;
  return phaseSeed;
}
function phasePermutation() {
  const p = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = phaseRandom() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
function getPhaseRow(page, i, state) {
  const key = page + ':' + (i % 8) + ':' + state.join(',');
  let row = phaseRows.get(key);
  if (!row) {
    row = phasePermutation();
    phaseRows.set(key, row);
  }
  return row;
}
const phaseEncrypted = [];
const phaseRecovered = [];
offset = 0;
for (let page = 0; page < pageLengths.length; page++) {
  const len = pageLengths[page];
  const plain = sourcePlant.slice(offset, offset + len);
  const cipher = [];
  const recovered = [];
  for (let i = 0; i < len; i++) {
    if (i < 3) {
      cipher.push(plain[i]);
      recovered.push(plain[i]);
      continue;
    }
    const cipherRow = getPhaseRow(page, i, plain.slice(i - 3, i));
    cipher.push(cipherRow[plain[i]]);
    const inverseRow = getPhaseRow(page, i, recovered.slice(i - 3, i));
    recovered.push(inverseRow.indexOf(cipher[i]));
  }
  assert.deepEqual(recovered, plain);
  phaseEncrypted.push(...cipher);
  phaseRecovered.push(...recovered);
  offset += len;
}
assert.deepEqual(phaseRecovered, sourcePlant);
assert.equal(phaseRows.size, 12532);
assert.equal(windowEqualPairs(sourcePlant, 7, 0, 8), 39);
assert.equal(windowEqualPairs(phaseEncrypted, 4, 1, 8), 41);
assert(windowEqualPairs(phaseEncrypted, 4, 1, 8) >=
  windowEqualPairs(sourcePlant, 7, 0, 8));


// q=8 is the first width where the four-output collision inequality does
// not reject every matched control. Check the complete deterministic input
// constraint directly: for each (page, previous-eight-rune history, current
// plaintext rune), the original ciphertext output must be unique.
function exactPlainHistoryConsistency(plain, cipher, q) {
  let offset = 0;
  let distinctContexts = 0;
  let distinctInputTuples = 0;
  let repeatedContexts = 0;
  let repeatedPairs = 0;
  let maxMultiplicity = 0;
  const deterministicConflictInputs = new Set();
  const bijectionConflictOutputs = new Set();
  for (let page = 0; page < pageLengths.length; page++) {
    const pageLength = pageLengths[page];
    const rows = new Map();
    for (let i = q; i < pageLength; i++) {
      const history = plain.slice(offset + i - q, offset + i).join(',');
      const input = plain[offset + i];
      const output = cipher[offset + i];
      let row = rows.get(history);
      if (!row) {
        row = { count: 0, inputToOutput: new Map(), outputToInput: new Map() };
        rows.set(history, row);
      }
      const inputKey = page + ':' + history + ':' + input;
      const outputKey = page + ':' + history + ':' + output;
      if (row.inputToOutput.has(input) && row.inputToOutput.get(input) !== output) {
        deterministicConflictInputs.add(inputKey);
      } else if (!row.inputToOutput.has(input)) {
        row.inputToOutput.set(input, output);
      }
      if (row.outputToInput.has(output) && row.outputToInput.get(output) !== input) {
        bijectionConflictOutputs.add(outputKey);
      } else if (!row.outputToInput.has(output)) {
        row.outputToInput.set(output, input);
      }
      row.count++;
    }
    distinctContexts += rows.size;
    for (const row of rows.values()) {
      distinctInputTuples += row.inputToOutput.size;
      if (row.count > 1) {
        repeatedContexts++;
        repeatedPairs += row.count * (row.count - 1) / 2;
        maxMultiplicity = Math.max(maxMultiplicity, row.count);
      }
    }
    offset += pageLength;
  }
  assert.equal(offset, N);
  return {
    eligiblePositions: N - q * pageLengths.length,
    distinctContexts,
    distinctInputTuples,
    repeatedContexts,
    repeatedPairs,
    maxMultiplicity,
    deterministicConflicts: deterministicConflictInputs.size,
    bijectionConflicts: bijectionConflictOutputs.size
  };
}

const q8ControlWindows = [];
for (const control of controls) {
  const gp = encodeNativeGp(read(control.path));
  for (let start = 0; start + N <= gp.length; start += Math.floor(N / 2)) {
    const window = gp.slice(start, start + N);
    const consistency = exactPlainHistoryConsistency(window, original, 8);
    q8ControlWindows.push({
      author: control.label,
      start,
      e12: windowEqualPairs(window, 12),
      ...consistency
    });
  }
}
assert.equal(q8ControlWindows.length, 89);
assert(q8ControlWindows.every((x) => x.deterministicConflicts > 0));
const q8CollisionSurvivors = q8ControlWindows
  .filter((x) => x.e12 <= originalFour)
  .sort((a, b) => a.e12 - b.e12);
assert.equal(q8CollisionSurvivors.length, 2);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.e12), [0, 1]);
assert(q8CollisionSurvivors.every((x) => x.author === 'Emerson'));
assert.deepEqual(q8CollisionSurvivors.map((x) => x.distinctContexts), [12484, 12484]);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.repeatedContexts), [32, 32]);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.maxMultiplicity), [2, 2]);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.distinctInputTuples), [12502, 12503]);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.deterministicConflicts), [14, 13]);
assert.deepEqual(q8CollisionSurvivors.map((x) => x.bijectionConflicts), [0, 1]);

const q8ByAuthor = controls.map((control) => {
  const windows = q8ControlWindows.filter((x) => x.author === control.label);
  return {
    author: control.label,
    windows: windows.length,
    collisionSurvivors: windows.filter((x) => x.e12 <= originalFour).length,
    minimumE12Pairs: Math.min(...windows.map((x) => x.e12)),
    minimumDeterministicConflicts: Math.min(...windows.map((x) => x.deterministicConflicts)),
    maximumDeterministicConflicts: Math.max(...windows.map((x) => x.deterministicConflicts))
  };
});
assert.deepEqual(q8ByAuthor.map((x) => x.minimumDeterministicConflicts), [42, 99, 13]);

// A short reversible q=8 source-native plant on the first two original
// physical page lengths. Every page/history row is an independent secret
// permutation; the first eight symbols per page are transparent startup.
const q8PlantLengths = pageLengths.slice(0, 2);
const q8PlantRunes = q8PlantLengths.reduce((a, b) => a + b, 0);
const q8PlantSource = sourcePlant.slice(0, q8PlantRunes);
let q8Seed = 0x3301d00d;
function q8RandomUint32() {
  q8Seed = (Math.imul(q8Seed, 1664525) + 1013904223) >>> 0;
  return q8Seed;
}
function q8RandomPermutation() {
  const p = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = q8RandomUint32() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const q8Rows = new Map();
const q8Encrypted = [];
const q8Recovered = [];
offset = 0;
for (let page = 0; page < q8PlantLengths.length; page++) {
  const pageLength = q8PlantLengths[page];
  const plain = q8PlantSource.slice(offset, offset + pageLength);
  const cipher = [];
  const recovered = [];
  for (let i = 0; i < pageLength; i++) {
    if (i < 8) {
      cipher.push(plain[i]);
      recovered.push(plain[i]);
      continue;
    }
    const cipherKey = page + ':' + plain.slice(i - 8, i).join(',');
    if (!q8Rows.has(cipherKey)) q8Rows.set(cipherKey, q8RandomPermutation());
    const cipherRow = q8Rows.get(cipherKey);
    const encryptedRune = cipherRow[plain[i]];
    cipher.push(encryptedRune);
    const decodeKey = page + ':' + recovered.slice(i - 8, i).join(',');
    const decodeRow = q8Rows.get(decodeKey);
    recovered.push(decodeRow.indexOf(encryptedRune));
  }
  assert.deepEqual(recovered, plain);
  q8Encrypted.push(...cipher);
  q8Recovered.push(...recovered);
  offset += pageLength;
}
assert.equal(offset, q8PlantRunes);
assert.deepEqual(q8Recovered, q8PlantSource);
assert.equal(q8Rows.size, 489);

const log2Factorial29 = Array.from({ length: 29 }, (_, i) => Math.log2(i + 1))
  .reduce((a, b) => a + b, 0);
const log2Symbol29 = Math.log2(29);
const q8HistoryRows = q8CollisionSurvivors[0].distinctContexts;
const q8InputAssignments = q8CollisionSurvivors.map((x) => x.distinctInputTuples);
const q8DenseStatesPerPage = 29 ** 8;
const q8DenseRowsAllPages = q8DenseStatesPerPage * pageLengths.length;
const q8Capacity = {
  historyStatesPerPage: q8DenseStatesPerPage,
  pageSpecificHistoryRows: q8DenseRowsAllPages,
  runtimeHistoryBits: 8 * log2Symbol29,
  bitsPerFullPermutationRow: log2Factorial29,
  sparseObservedHistoryRows: q8HistoryRows,
  sparseFullPermutationTableBits: q8HistoryRows * log2Factorial29,
  sparseFullPermutationTableBytes: q8HistoryRows * log2Factorial29 / 8,
  observedInputAssignments: q8InputAssignments,
  independentSingleOutputAssignmentBitsRange: [
    Math.min(...q8InputAssignments) * log2Symbol29,
    Math.max(...q8InputAssignments) * log2Symbol29
  ],
  independentSingleOutputAssignmentBytesRange: [
    Math.min(...q8InputAssignments) * log2Symbol29 / 8,
    Math.max(...q8InputAssignments) * log2Symbol29 / 8
  ],
  denseFullPermutationTableBytesAllPages: q8DenseRowsAllPages * log2Factorial29 / 8,
  conditional256ByteGridBits: 2048,
  fullPermutationRowsIn256Bytes: Math.floor(2048 / log2Factorial29),
  singleOutputAssignmentsIn256Bytes: Math.floor(2048 / log2Symbol29),
  opaqueInitialSymbolsAcross55Pages: 8 * pageLengths.length,
  opaqueInitialStateBits: 8 * pageLengths.length * log2Symbol29
};
assert.equal(q8Capacity.fullPermutationRowsIn256Bytes, 19);
assert.equal(q8Capacity.singleOutputAssignmentsIn256Bytes, 421);

process.stdout.write(JSON.stringify({
  property: 'q<=7 plaintext-history collision theorem plus exact q=8 deterministic input-consistency test on original LP2 page clocks',
  original: { pages: 55, runes: N, cipher3Pairs: 55, cipher4Pairs: originalFour, cipher5Pairs: 0 },
  sourceNativeControls: summaries,
  independentSevenHistoryPlant: {
    secretRows: rows.size,
    exactRoundTrip: N + '/' + N,
    ciphertextFourPairs: windowEqualPairs(encrypted, 4, 1),
    sourceElevenPairs: windowEqualPairs(sourcePlant, 11)
  },
  originalEightPhase: {
    sourceVisiblePeriod: 8,
    ciphertextFourPairsWithinPhase: windowEqualPairs(original, 4, 1, 8),
    sevenGramControlMinima: summaries.map((x) => x.minimumPhase8Plain7CollisionPairs),
    secretThreeHistoryPlantRows: phaseRows.size,
    nativePlainSevenPairs: windowEqualPairs(sourcePlant, 7, 0, 8),
    encryptedCipherFourPairs: windowEqualPairs(phaseEncrypted, 4, 1, 8)
  },
  eightHistoryBoundary: {
    originalCipherFourPairs: originalFour,
    sourceControls: q8ByAuthor,
    collisionSurvivors: q8CollisionSurvivors.map((x) => ({
      author: x.author,
      sourceRuneOffset: x.start,
      e12: x.e12,
      eligiblePositions: x.eligiblePositions,
      distinctContexts: x.distinctContexts,
      repeatedContexts: x.repeatedContexts,
      distinctInputTuples: x.distinctInputTuples,
      deterministicConflicts: x.deterministicConflicts,
      bijectionConflicts: x.bijectionConflicts
    })),
    deterministicControlPasses: q8ControlWindows.filter((x) => x.deterministicConflicts === 0).length,
    capacity: q8Capacity,
    reversibleShortPlant: {
      physicalPages: 2,
      pageLengths: q8PlantLengths,
      runes: q8PlantRunes,
      secretRows: q8Rows.size,
      exactRoundTrip: q8Recovered.length + '/' + q8PlantRunes,
      transparentInitialSymbolsPerPage: 8,
      seed: '0x3301d00d'
    }
  },
  verdict: 'q<=7 collision theorem excludes all 89 matched controls; q=8 collision count alone admits two Emerson windows, but exact deterministic input consistency rejects both; no unknown LP2 plaintext recovered'
}, null, 2) + '\n');
